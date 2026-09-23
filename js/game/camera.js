/**
 * The match camera.
 *
 * One rig for everything the match shows: open play under any of the seven
 * presets, every set piece, the goal celebration, and the transitions
 * between them. It produces the plain pose the renderers already consume —
 * `{ x, y, z, tx, ty, tz, hfov }` — so nothing downstream changes.
 *
 * How it moves:
 *
 *  - **Critically damped springs.** Every quantity chases its target through
 *    `smoothDamp` (the closed-form critically damped spring), which never
 *    overshoots and never snaps. The old follow was an exponential lerp on
 *    the raw ball, which jittered every time the ball's owner changed and
 *    lurched on every long pass.
 *  - **A focus point, not the ball.** The camera frames a point ahead of the
 *    ball in the direction of play (velocity look-ahead plus a lean towards
 *    the goal the side in possession is attacking), held in a dead-zone so a
 *    dribble back and forth in a small space does not wobble the frame.
 *  - **Automatic zoom.** How far the players around the ball are spread out
 *    decides how wide the shot is: a scramble in the box is tight, a switch
 *    of play goes wide.
 *  - **Modes, blended.** A set piece, a kick-off or a goal changes the target
 *    pose and, for about a second, lengthens the spring — the cut is a glide.
 *  - **Collision last.** Whatever a preset or a cinematic asks for, the final
 *    pose is pushed out of the stands, the roof and the goal nets for the
 *    ground actually being played in (`venueBounds`).
 */
import { PITCH, GOAL_HALF } from './sim.js';

import { CY, SCALE } from './field.js';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
import { GOAL_HEIGHT as GOAL_H } from './field.js';
const NET_DEPTH = 2.0;

/** Clamp an x to `m` metres from either end — or to the middle on a pitch too small for that (v80). */
const clampX = (v, m) => { const lo = Math.min(m, PITCH.w / 2); const hi = Math.max(PITCH.w - m, PITCH.w / 2); return Math.max(lo, Math.min(hi, v)); };

/* ------------------------------ the presets ------------------------------ */
export const CAMERA_PRESETS = [
  { id: 'broadcast', name: 'Broadcast', blurb: 'The television gantry on the halfway line. The default.' },
  { id: 'tele', name: 'Tele Broadcast', blurb: 'Further back on a long lens: flatter, calmer, more of the shape.' },
  { id: 'coop', name: 'Co-op', blurb: 'Higher and wider, so two players on one side can both see their man.' },
  { id: 'dynamic', name: 'Dynamic', blurb: 'Behind the player you control, facing the goal you are attacking.' },
  { id: 'pro', name: 'Pro', blurb: 'Locked to your player, low and close.' },
  { id: 'e2e', name: 'End to End', blurb: 'Down the length of the pitch from behind the play.' },
  { id: 'tactical', name: 'Tactical', blurb: 'High above the halfway line: the whole team shape.' },
];
export const presetById = (id) => CAMERA_PRESETS.find((p) => p.id === id) || CAMERA_PRESETS[0];

/** The settings the rig reads, with their ranges. */
export const CAMERA_DEFAULTS = { preset: 'broadcast', height: 1, zoom: 1, angle: 0 };
export const cameraSettings = (s = {}) => ({
  preset: presetById(s.preset).id,
  height: clamp(Number(s.height) || 1, 0.6, 1.6),
  zoom: clamp(Number(s.zoom) || 1, 0.7, 1.4),
  angle: clamp(Number(s.angle) || 0, -15, 15),
});

/* ------------------------------ the spring ------------------------------ */
/**
 * Critically damped spring towards `target` with the given smoothing time
 * (roughly the time to cover most of the gap). `st` is the state object
 * `{ v }` that carries the velocity between frames.
 */
export function smoothDamp(cur, target, st, smoothTime, dt, maxSpeed = Infinity) {
  if (!(dt > 0)) return cur;
  const T = Math.max(0.0001, smoothTime);
  const omega = 2 / T;
  const x = omega * dt;
  const e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = cur - target;
  const maxChange = maxSpeed * T;
  change = clamp(change, -maxChange, maxChange);
  const t = cur - change;
  const temp = (st.v + omega * change) * dt;
  st.v = (st.v - omega * temp) * e;
  let out = t + (change + temp) * e;
  // no overshoot: if we crossed the target, sit on it
  if ((target - cur > 0) === (out > target)) { out = target; st.v = 0; }
  return out;
}

/* ------------------------------ the ground ------------------------------ */
/**
 * The solid parts of a ground, in the renderer's own terms (renderGL.js
 * `specFromDef`): three stands — the far touchline and both ends; the near
 * side is always the open gantry side — each a terrace rising from 1.9 m at
 * six metres off the pitch to `backZ` at `depth` behind that, pushed back and
 * up by any tier gaps, with a roof above when the ground has one.
 */
export function venueBounds(def) {
  const scale = clamp(def?.size ?? 0.6, 0, 1);
  const tiers = clamp((def?.tiers | 0) || 1, 1, 3);
  const gaps = tiers - 1;
  const depth = 11 + scale * 21 + 2.2 * gaps;
  const backZ = 7 + scale * 16 + 3.0 * gaps;
  const roof = def ? def.roof !== 'none' : scale > 0.3;
  return {
    margin: 6,
    frontZ: 1.9,
    depth,
    backZ,
    // the underside of the roof and its top surface
    roofZ: roof ? backZ + 4.5 : null,
    // how far up a camera has to be to be above a stand with no roof
    topZ: roof ? backZ + 6 : backZ + 2.5,
  };
}

/**
 * Push a pose out of anything solid. Mutates and returns `cam`.
 *
 * The rules, in the order they are applied:
 *  1. Behind the front of any stand and below the top of it, the camera is
 *     inside the stadium: it is brought forward to just in front of the
 *     stand face, where it can still see what it was looking at.
 *  2. Inside a goal — behind the line, between the posts, under the bar — it
 *     is moved out in front of the goal line.
 *  3. On the open near side it keeps above the advertising boards.
 *  4. Never below the grass.
 */
export function collideCamera(cam, bounds) {
  if (!bounds) return cam;
  const B = bounds;
  const clear = 0.8;                                  // how far off a surface the lens sits
  /* The stand faces are walls all the way up. A camera may not go over the
     top of a stand either: "above the roof is fine" made the legal space
     non-convex, and a camera that was legal above a small stand snapped
     twenty metres sideways the moment its spring brought it down past the
     roof line (found by the camera regression test, End to End at a small
     ground during a goal). With walls, the legal space is a box — convex —
     so a spring between two legal poses can never pass through a stand. */
  const farFront = PITCH.h + B.margin;
  if (cam.y > farFront - clear) cam.y = farFront - clear;
  const endL = -B.margin; const endR = PITCH.w + B.margin;
  if (cam.x < endL + clear) cam.x = endL + clear;
  if (cam.x > endR - clear) cam.x = endR - clear;
  /* The goals: out through whichever face is nearest — in front of the line,
     past a post, or over the bar — so the push is as small as it can be. */
  for (const gx of [0, PITCH.w]) {
    const inw = gx === 0 ? -1 : 1;                    // which way is "behind the goal"
    const behind = (cam.x - gx) * inw;                // > 0 behind the line
    const side = Math.abs(cam.y - CY);
    const pad = 0.45;
    if (behind > -pad && behind < NET_DEPTH + pad && side < GOAL_HALF + pad && cam.z < GOAL_H + pad) {
      const toFront = behind + pad;
      const toSide = GOAL_HALF + pad - side;
      const toTop = GOAL_H + pad - cam.z;
      const toBack = NET_DEPTH + pad - behind;
      const best = Math.min(toFront, toSide, toTop, toBack);
      if (best === toFront) cam.x = gx - inw * pad;
      else if (best === toSide) cam.y = CY + Math.sign(cam.y - CY || 1) * (GOAL_HALF + pad);
      else if (best === toTop) cam.z = GOAL_H + pad;
      else cam.x = gx + inw * (NET_DEPTH + pad);
    }
  }
  // near side: over the boards, not through them
  if (cam.y < -B.margin + 2.2 && cam.y > -B.margin - 1.5) cam.z = Math.max(cam.z, 1.6);
  cam.z = Math.max(cam.z, 0.35);
  return cam;
}

/** True if a pose is inside something — used by the tests and the QA sweep. */
export function cameraInside(cam, bounds) {
  const before = { ...cam };
  collideCamera(cam, bounds);
  const moved = Math.hypot(cam.x - before.x, cam.y - before.y, cam.z - before.z) > 1e-6;
  Object.assign(cam, before);
  return moved;
}

/* ------------------------------ the rig ------------------------------ */
const SPREAD_N = 8;                                   // how many players around the ball decide the zoom

/**
 * @param {object} opts
 *   settings  the saved camera settings (see cameraSettings)
 *   bounds    venueBounds of the ground being played in
 */
export function createCameraRig({ settings = {}, bounds = null } = {}) {
  let S = cameraSettings(settings);
  const pose = { x: PITCH.w / 2, y: -30, z: 17, tx: PITCH.w / 2, ty: CY * 0.82, tz: 0, hfov: 48 };
  const v = {};
  for (const k of Object.keys(pose)) v[k] = { v: 0 };
  const focus = { x: PITCH.w / 2, y: CY };
  const fv = { x: { v: 0 }, y: { v: 0 } };
  let zoomAuto = 1; const zv = { v: 0 };
  let mode = 'play';
  let blend = 1;                                      // 0 just after a mode change, 1 when settled
  let celebT = 0; let celebA = 0;
  let first = true;
  let modeT = 0;

  /** The side the person is on — Dynamic, Pro and End to End face its attack. */
  const humanTeam = (m) => {
    const c = m.controllers?.[0];
    return c ? c.team : 0;
  };
  const controlled = (m) => {
    const c = m.controllers?.[0];
    return c ? m.teams[c.team].players[c.activeIdx] : null;
  };

  /* The player the close presets follow, on its own spring, so a change of
     controlled player glides across instead of teleporting the camera. */
  const follow = { x: 52.5, y: 34 }; const flv = { x: { v: 0 }, y: { v: 0 } };
  let followInit = false;
  const updateFollow = (m, dt) => {
    const p = controlled(m) || m.ball;
    if (!followInit || first) { follow.x = p.x; follow.y = p.y; followInit = true; return; }
    follow.x = smoothDamp(follow.x, p.x, flv.x, 0.35, dt, 38);
    follow.y = smoothDamp(follow.y, p.y, flv.y, 0.35, dt, 38);
  };

  /* Where to look, before any preset decides where to stand. */
  const updateFocus = (m, dt, deadX, deadY) => {
    const b = m.ball;
    const owner = b.owner;
    let wx = b.x + b.vx * 0.42;
    let wy = b.y + b.vy * 0.3;
    if (owner) wx += m.teams[owner.team].dir * 4.5;   // lean towards the goal being attacked
    wx = clamp(wx, 0, PITCH.w); wy = clamp(wy, 0, PITCH.h);
    // the dead-zone: the target only moves once the play leaves the box around the focus
    const dx = wx - focus.x; const dy = wy - focus.y;
    const tx = Math.abs(dx) > deadX ? wx - Math.sign(dx) * deadX : focus.x;
    const ty = Math.abs(dy) > deadY ? wy - Math.sign(dy) * deadY : focus.y;
    focus.x = smoothDamp(focus.x, tx, fv.x, 0.55, dt, 60);
    focus.y = smoothDamp(focus.y, ty, fv.y, 0.7, dt, 40);
  };

  const updateZoom = (m, dt) => {
    const b = m.ball;
    const ds = [];
    for (const t of m.teams) for (const p of t.players) ds.push(Math.hypot(p.x - b.x, p.y - b.y));
    ds.sort((a, c) => a - c);
    const spread = ds[Math.min(ds.length - 1, SPREAD_N - 1)] || 15;
    const want = clamp(0.88 + (spread - 12) / 70, 0.86, 1.2);
    zoomAuto = smoothDamp(zoomAuto, want, zv, 1.4, dt);
  };

  /* The open-play pose for each preset. */
  const playPose = (m) => {
    const Z = S.zoom * zoomAuto * Math.max(0.5, Math.min(1, SCALE * 1.15));   // v80: a small pitch wants the camera closer
    const H = S.height;
    const tilt = S.angle;                             // degrees: + steeper, - flatter
    const steep = 1 + tilt * 0.022; const near = 1 - tilt * 0.012;
    const fx = focus.x; const fy = focus.y;
    const dir = m.teams[humanTeam(m)]?.dir ?? 1;
    const me = follow;                                // the followed player, smoothed
    const out = {};
    switch (S.preset) {
      case 'tele':
        out.x = clampX(fx, 18); out.y = -58 * Z * near + fy * 0.25; out.z = 25 * H * steep * Math.sqrt(Z);
        out.tx = out.x; out.ty = fy * 0.85 + 5; out.tz = 0; out.hfov = 27;
        break;
      case 'coop':
        out.x = clampX(fx, 24); out.y = -38 * Z * near + fy * 0.2; out.z = 26 * H * steep * Math.sqrt(Z);
        out.tx = out.x; out.ty = fy * 0.7 + CY * 0.3; out.tz = 0; out.hfov = 56;
        break;
      case 'tactical':
        out.x = clampX(fx, 26); out.y = -18 * near; out.z = 58 * H * steep;
        out.tx = out.x; out.ty = fy * 0.55 + CY * 0.45; out.tz = 0; out.hfov = 58 * Math.min(1.15, Z);
        break;
      case 'dynamic':
        out.x = me.x - dir * 15 * Z * near; out.y = me.y * 0.72 + CY * 0.28; out.z = 8.5 * H * steep;
        out.tx = me.x + dir * 14; out.ty = me.y; out.tz = 0.5; out.hfov = 60;
        break;
      case 'pro':
        out.x = me.x - dir * 8 * Z * near; out.y = me.y; out.z = 4.4 * H * steep;
        out.tx = me.x + dir * 11; out.ty = me.y; out.tz = 0.8; out.hfov = 62;
        break;
      case 'e2e':
        out.x = fx - dir * 34 * Z * near; out.y = CY * 0.42 + fy * 0.58; out.z = 19 * H * steep;
        out.tx = fx + dir * 8; out.ty = fy; out.tz = 0; out.hfov = 52;
        break;
      default: // broadcast
        out.x = clampX(fx, 16); out.y = -30 * Z * near + fy * 0.3; out.z = 17 * H * steep * Math.sqrt(Z);
        out.tx = out.x; out.ty = Math.max(10, Math.min(48, fy * 0.82 + 7)); out.tz = 0; out.hfov = 48;
    }
    return out;
  };

  /* A dead ball: each restart has its own angle. */
  const setPiecePose = (m, kind) => {
    const b = m.ball;
    const sp = m.setPiece;
    const atk = sp ? m.teams[sp.team] : (b.owner ? m.teams[b.owner.team] : m.teams[0]);
    const dir = atk?.dir ?? 1;
    const goalX = dir > 0 ? PITCH.w : 0;
    if (kind === 'penalty') {
      return { x: b.x - dir * 9, y: CY + 1.2, z: 2.7, tx: goalX, ty: CY, tz: 1.2, hfov: 34 };
    }
    if (kind === 'corner') {
      const side = b.y < CY ? -1 : 1;
      return { x: goalX - dir * 17, y: b.y + side * 11, z: 9.5, tx: goalX - dir * 9, ty: CY, tz: 0.6, hfov: 50 };
    }
    if (kind === 'freekick') {
      const toGoal = Math.hypot(goalX - b.x, CY - b.y);
      if (toGoal < 36) {
        const ux = (goalX - b.x) / (toGoal || 1); const uy = (CY - b.y) / (toGoal || 1);
        return { x: b.x - ux * 10, y: b.y - uy * 10, z: 4.4, tx: goalX, ty: CY, tz: 1.0, hfov: 44 };
      }
      return { x: clampX(b.x, 18), y: -28 + b.y * 0.3, z: 16, tx: clampX(b.x + dir * 10, 18), ty: b.y * 0.8 + 7, tz: 0, hfov: 50 };
    }
    if (kind === 'throwin') {
      return { x: clampX(b.x, 14), y: -24 + b.y * 0.35, z: 13, tx: clampX(b.x + dir * 5, 14), ty: b.y * 0.85 + 4, tz: 0, hfov: 42 };
    }
    if (kind === 'goalkick') {
      const gk = b.owner;
      const kx = gk ? gk.x : b.x;
      return { x: clampX(kx + dir * 16, 16), y: -26, z: 15, tx: clampX(kx + dir * 20, 16), ty: CY * 0.9, tz: 0, hfov: 54 };
    }
    // kick-off: the whole of both halves
    return { x: PITCH.w / 2, y: -34, z: 20, tx: PITCH.w / 2, ty: CY * 0.9, tz: 0, hfov: 54 };
  };

  /* The goal: the camera goes round the scorer. */
  const celebrationPose = (m, dt) => {
    const hero = m.celebrant || m.ball;
    celebT += dt;
    if (celebT <= dt) {
      // start on the side of him the camera is already on, so the move reads as a swing, not a cut
      celebA = Math.atan2(pose.y - hero.y, pose.x - hero.x);
    }
    celebA += dt * 0.42;
    const r = 6.5 - Math.min(1.5, celebT * 0.35);
    return {
      x: hero.x + Math.cos(celebA) * r, y: hero.y + Math.sin(celebA) * r, z: 2.1 + Math.max(0, 1.4 - celebT * 0.5),
      tx: hero.x, ty: hero.y, tz: 1.15, hfov: 34,
    };
  };

  const modeOf = (m) => {
    if (m.phase === 'goal') return 'celebrate';
    if (m.phase === 'kickoff' || m.phase === 'half') return 'kickoff';
    if (m.phase === 'corner' || m.phase === 'penalty' || m.phase === 'freekick' || m.phase === 'throwin') return m.phase;
    // a goal kick is play with the keeper holding it after the ball went out
    if (m.phase === 'play' && m.stoppage === 'goalkick' && m.ball.owner?.role === 'GK' && (m.ball.owner.holdT || 0) < 2.2) return 'goalkick';
    return 'play';
  };

  return {
    get pose() { return pose; },
    get mode() { return mode; },
    /** Seconds of match time in the current mode — the regression shots wait on this. */
    get modeTime() { return modeT; },
    setSettings(s) { S = cameraSettings({ ...S, ...s }); },
    get settings() { return S; },
    setBounds(b) { bounds = b; },
    cyclePreset(step = 1) {
      const i = CAMERA_PRESETS.findIndex((p) => p.id === S.preset);
      S = { ...S, preset: CAMERA_PRESETS[(i + step + CAMERA_PRESETS.length) % CAMERA_PRESETS.length].id };
      blend = 0;
      return S.preset;
    },
    /** Advance one frame and write the result into `out` (and return it). */
    update(m, dt, out = pose) {
      const md = modeOf(m);
      if (md !== mode) { mode = md; blend = 0; modeT = 0; if (md !== 'celebrate') celebT = 0; }
      modeT += dt;
      blend = Math.min(1, blend + dt / 1.1);
      const wide = S.preset === 'coop' || S.preset === 'tactical' || S.preset === 'tele';
      updateFocus(m, dt, wide ? 5.5 : 3.5, wide ? 4 : 2.5);
      updateZoom(m, dt);
      updateFollow(m, dt);
      let want;
      if (md === 'celebrate') want = celebrationPose(m, dt);
      else if (md === 'play') want = playPose(m);
      else want = setPiecePose(m, md);
      collideCamera(want, bounds);
      /* Short springs in open play, long ones for the second after a change
         of mode — that is the blended transition. The look point is allowed
         to lead the body slightly, which is how a camera operator pans. */
      const body = first ? 0 : 0.2 + (1 - blend) * 0.75;
      const look = first ? 0 : 0.14 + (1 - blend) * 0.6;
      for (const k of ['x', 'y', 'z']) pose[k] = smoothDamp(pose[k], want[k], v[k], body, dt, 45);
      for (const k of ['tx', 'ty', 'tz']) pose[k] = smoothDamp(pose[k], want[k], v[k], look, dt, 60);
      pose.hfov = smoothDamp(pose.hfov, want.hfov, v.hfov, first ? 0 : 0.5 + (1 - blend) * 0.5, dt);
      collideCamera(pose, bounds);
      first = false;
      if (out !== pose) Object.assign(out, pose);
      return out;
    },
    /** Jump straight to the target (after a teleport such as a restart in a replay). */
    snap() { first = true; },
  };
}

/* ------------------------------ the replay director ------------------------------ */
/**
 * Which angles to show a goal from, and how fast. Two passes for most goals,
 * three for the special ones (a strike from distance, a late winner). The
 * clip's own shape decides: where the shot came from, how high the ball
 * travelled, whether it was headed in.
 *
 * Angles are the ids `replayCamera` knows: 0 pitchside tracking, 1 behind the
 * goal, 2 aerial wide, 3 reverse from the far touchline, 4 goal-line, 5
 * keeper's eye.
 */
export function directReplay(clip, { minute = 0, late = false } = {}) {
  const frames = clip?.frames || [];
  const n = frames.length;
  const goalX = clip?.goalX ?? PITCH.w;
  // the strike is the last big change of direction before the net
  let shotAt = Math.max(0, n - 70);
  let peakZ = 0;
  for (let i = Math.max(0, n - 120); i < n; i++) {
    const b = frames[i]?.b;
    if (b) peakZ = Math.max(peakZ, b[2] || 0);
  }
  const bShot = frames[shotAt]?.b || [goalX, CY, 0];
  const dist = Math.hypot(goalX - bShot[0], CY - bShot[1]);
  const passes = [{ angle: 0, speed: 1 }];            // the story: the build-up from the gantry side
  if (dist > 22) {
    passes.push({ angle: 3, speed: 0.6 });            // from range: the reverse, slowed down, to see it bend
    passes.push({ angle: 5, speed: 0.45 });           // and what the keeper saw
  } else if (peakZ > 1.4) {
    passes.push({ angle: 4, speed: 0.5 });            // headed or volleyed in: along the goal line
  } else {
    passes.push({ angle: 1 + (clip.seq || 0) % 2, speed: 0.55 });
  }
  if (late && passes.length < 3) passes.push({ angle: 2, speed: 0.7 });
  return passes.slice(0, 3);
}
