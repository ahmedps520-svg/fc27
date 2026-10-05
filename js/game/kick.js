/**
 * v144: the kick.
 *
 * The built figures (rig.js — what every phone plays with) had no kick at
 * all: a pass or a shot left the boots of a man who simply kept running. The
 * scanned models had a kick clip, but only a lob ever triggered it, because
 * the other cues did not carry the player.
 *
 * Both are now driven from what the ball does, not from cues: a ball low
 * enough to be at someone's feet whose pace jumps by a kick's worth, next to a
 * player, was kicked by him. That reads the same on the host, on an online
 * guest (who only ever sees snapshots) and in a replay, and the sim does not
 * change at all.
 *
 * The swing itself is a path for the kicking foot in the player's own frame
 * (forward, sideways, up), which rig.js solves the leg to like any other step:
 * a short draw back, through the ball, a follow-through that rises with the
 * pace of the strike, and back down under him. The standing foot stays planted
 * throughout.
 */

/** Seconds: draw back, strike, follow through, put the foot down. */
export const KICK_PHASES = [0.08, 0.06, 0.15, 0.15];
export const KICK_DUR = KICK_PHASES.reduce((a, b) => a + b, 0);

/** A jump in the ball's pace above this (m/s) at someone's feet is a kick; a dribble touch is 2–3. */
export const KICK_DV = 6.5;
const REACH = 2.2;

/**
 * Look for kicks this frame and age the ones in progress. `state` is the
 * caller's own memory of the ball ({ vx, vy }) between frames.
 */
export function detectKicks(m, dt, state) {
  const b = m.ball;
  for (const t of m.teams) for (const p of t.players) {
    if (p._throw) { p._throw.t += dt; if (p._throw.t >= THROW_DUR) p._throw = null; }
    if (!p._kick) continue;
    p._kick.t += dt;
    if (p._kick.t >= KICK_DUR) p._kick = null;
  }
  const sp = Math.hypot(b.vx || 0, b.vy || 0);
  const prev = state.sp ?? sp;
  state.sp = sp;
  if (sp - prev < KICK_DV || (b.z || 0) > 2.3 || b.owner) return null;
  // v145: from above the knee it can only have left a keeper's hands — a throw
  const high = (b.z || 0) > 1.2;
  let who = null; let best = REACH;
  for (const t of m.teams) for (const p of t.players) {
    if (p.diveT > 0 || p.downT > 0 || (high && p.role !== 'GK')) continue;
    const d = Math.hypot(p.x - b.x, p.y - b.y);
    if (d < best) { best = d; who = p; }
  }
  if (!who || (who._kick && who._kick.t < KICK_DUR * 0.5)) return null;
  if (high) { who._throw = { t: 0, side: who.ref?.foot === 'L' ? -1 : 1 }; return who; }
  // the foot nearer the ball, or his stronger one when it is straight ahead
  const lat = (b.x - who.x) * -(who.dirY || 0) + (b.y - who.y) * (who.dirX || 0);
  const strong = who.ref?.foot === 'L' ? -1 : 1;
  const side = Math.abs(lat) > 0.25 ? Math.sign(lat) : strong;
  who._kick = { t: 0, side, power: Math.min(1, sp / 30) };
  // the scanned figure plays its kick clip for it
  if (!(who._actT > 0)) { who._act = 'kick'; who._actT = 0.55; }
  return who;
}

const ease = (s) => s * s * (3 - 2 * s);

/** v145: a keeper's overarm throw — seconds: the arm cocked behind the head, over the top, follow-through. */
export const THROW_PHASES = [0.1, 0.1, 0.22];
export const THROW_DUR = THROW_PHASES.reduce((a, b) => a + b, 0);

/**
 * The throwing arm's angles `t` seconds in: { sh, el } — the shoulder swing
 * and the forearm, in rig.js's convention (0 hanging, + forwards, ±π overhead).
 * The ball has already gone when this starts (it is read off the ball), so the
 * wind-up is brisk and the follow-through carries the look of it.
 */
export function throwArm(th) {
  if (!th || th.t >= THROW_DUR) return null;
  const [a, b, c] = THROW_PHASES;
  const keys = [[0, -0.6, -0.4], [a, -2.75, -4.0], [a + b, -4.25, -4.35], [a + b + c, -5.6, -5.4]];
  let i = 0;
  while (i < keys.length - 2 && th.t >= keys[i + 1][0]) i++;
  const [t0, s0, e0] = keys[i]; const [t1, s1, e1] = keys[i + 1];
  const u = ease(Math.max(0, Math.min(1, (th.t - t0) / (t1 - t0))));
  return { sh: s0 + (s1 - s0) * u, el: e0 + (e1 - e0) * u };
}

/**
 * Where the kicking foot is, in his own frame, `t` seconds into the kick:
 * { f: forward of the hip, l: across (positive to the kicking side), z: above
 * the ankle's standing height }, all in metres for a 1.0-height figure. Null
 * once it is over.
 */
export function kickFoot(kick) {
  if (!kick) return null;
  const [a, b, c, d] = KICK_PHASES;
  // how high the follow-through comes up, and far enough forward that the leg is straight, not a knee lift
  const P = 0.25 + 0.45 * kick.power; const F = 0.66 + 0.2 * kick.power;
  const keys = [
    [0, { f: 0.05, l: 0.1, z: 0 }],
    [a, { f: -0.38, l: 0.14, z: 0.3 }],               // drawn back, heel up
    [a + b, { f: 0.28, l: 0.06, z: 0.07 }],           // through the ball
    [a + b + c, { f: F, l: 0.03, z: P }],             // follow-through
    [a + b + c + d, { f: 0.12, l: 0.1, z: 0 }],       // back down under him
  ];
  const t = kick.t;
  if (t >= keys[keys.length - 1][0]) return null;
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1][0]) i++;
  const [t0, k0] = keys[i]; const [t1, k1] = keys[i + 1];
  const s = ease(Math.max(0, Math.min(1, (t - t0) / (t1 - t0))));
  return { f: k0.f + (k1.f - k0.f) * s, l: (k0.l + (k1.l - k0.l) * s) * kick.side, z: k0.z + (k1.z - k0.z) * s };
}

/** How far through the swing the body is, 0..1 peaking at contact — for the lean back and the arms. */
export function kickEnv(kick) {
  if (!kick) return 0;
  const [a, b, c] = KICK_PHASES;
  const t = kick.t;
  if (t < a + b) return t / (a + b);
  return Math.max(0, 1 - (t - a - b) / (c + 0.1));
}
