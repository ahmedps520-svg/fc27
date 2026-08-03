import { PITCH, GOAL_HALF, BOX } from './sim.js';

/* ------------------------------------------------------------------ *
 * Perspective renderer. Pure canvas 2D — every point goes through a
 * pinhole camera and the scene is drawn back to front.
 * World axes: x along the pitch (0..105), y across (0..68), z up.
 * Players are jointed figures built from tapered limbs; the stadium is
 * generated procedurally (no external models or textures).
 * ------------------------------------------------------------------ */

const CY = PITCH.h / 2;
const GOAL_H = 2.44;
const NEAR = 0.6;
const MARGIN = 6;                    // pitch edge to the front of the stands

/* ------------------------------ colour ----------------------------- */
const rgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const shade = (c, k) =>
  `rgb(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0})`;
const darken = (c, k) => [c[0] * k, c[1] * k, c[2] * k];

export function kitColours(match) {
  const home = match.teams[0].colors[0];
  let away = match.teams[1].colors[0];
  if (dist3(rgb(home), rgb(away)) < 110) away = match.teams[1].colors[1];
  if (dist3(rgb(home), rgb(away)) < 110) away = '#f2f4f8';
  if (dist3(rgb(home), rgb(away)) < 110) away = '#1b1d24';
  return [home, away];
}

const SKINS = [[245, 208, 176], [226, 176, 133], [198, 137, 96], [150, 94, 60], [98, 62, 40]];
const HAIRS = [[28, 22, 20], [58, 38, 24], [122, 84, 42], [20, 18, 18], [90, 66, 44]];
const GK_KIT = '#c6f24a';

/* ------------------------------ camera ----------------------------- */
/**
 * Broadcast camera: parked outside the near touchline, dollying along the pitch
 * with the ball and panning across it, easing in for far-side play. Field of view
 * is horizontal so the amount of pitch on screen holds whatever the window shape.
 */
export function makeCamera() {
  return {
    x: PITCH.w / 2, y: -30, z: 17,
    tx: PITCH.w / 2, ty: CY * 0.82, tz: 0,
    hfov: 48,
  };
}

export function updateCamera(cam, match, dt) {
  // during a celebration the story is the scorer, not the ball sitting in the net
  const focus = (match.phase === 'goal' && match.celebrant) ? match.celebrant : match.ball;
  const b = focus;
  const k = 1 - Math.exp(-dt * 2.8);
  const wantX = Math.max(16, Math.min(PITCH.w - 16, b.x));         // reach far enough to show a goal
  const wantY = -30 + b.y * 0.3;                                   // dolly in for far-side play
  const wantLook = Math.max(10, Math.min(48, b.y * 0.82 + 7));
  cam.x += (wantX - cam.x) * k;
  cam.y += (wantY - cam.y) * k;
  cam.tx = cam.x;                                                  // look straight across
  cam.ty += (wantLook - cam.ty) * k;
}

/**
 * Ground-plane camera axes. The sim maps stick/key input through these so the
 * controls always match what you see: up the stick is up the screen, right is
 * right, whatever the camera is doing.
 */
/**
 * Cinematic replay camera. It has to *follow the move*, not sit on the goal —
 * parking at the goal line for the whole clip made the replay look like nothing
 * but the ball already in the net. So: a low pitchside tracking shot that runs
 * with the ball, swinging round behind the goal only for the finish.
 * `t` is 0..1 through the replay.
 */
// The stadium bowl is closed on the far touchline and on both goal ends; only
// the near side is open ground, which is where the broadcast camera lives. Any
// replay position outside this box ends up buried in the terracing.
const SAFE = {
  x0: -3, x1: PITCH.w + 3,          // between the two goal-end stands
  y1: PITCH.h + 3,                  // in front of the far stand (near side is open)
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Cinematic replay camera: a low pitchside rig that runs with the move and then
 * swings to a tight corner angle for the finish, so you see the strike and the
 * ball hit the net.
 *
 * It used to try to get *behind* the goal for the finish. There is a full stand
 * there — the camera flew into the seating exactly as the shot was struck and
 * the replay ended looking at the back of the terrace. It now stays in the open
 * near-side ground and is hard-clamped to the bowl, so no framing tweak can put
 * it inside geometry again. `t` is 0..1 through the replay.
 */
export function replayCamera(cam, ball, goalX, t) {
  const dir = goalX > PITCH.w / 2 ? 1 : -1;        // direction of the attack
  const s = clamp((t - 0.55) / 0.45, 0, 1);
  const ease = s * s * (3 - 2 * s);

  // build-up: low and wide on the near side, trailing the move so the play runs
  // away from camera towards the goal
  const ax = ball.x - dir * 10;
  const ay = -14;
  const az = 3.2;

  // finish: swing up to the near corner by the goal and look back along the
  // line, which puts the goalmouth and the net square in frame. Height matters
  // more than it looks — sit too low and the perimeter board fills the shot.
  const bx = goalX - dir * 11;
  const by = -15;
  const bz = 5.4;

  const wantX = clamp(ax + (bx - ax) * ease, SAFE.x0, SAFE.x1);
  const wantY = clamp(ay + (by - ay) * ease, -34, SAFE.y1);
  const wantZ = az + (bz - az) * ease;

  // ease the rig so it glides instead of snapping frame to frame
  const k = cam._replayed ? 0.18 : 1;
  cam.x += (wantX - cam.x) * k;
  cam.y += (wantY - cam.y) * k;
  cam.z += (wantZ - cam.z) * k;

  // Aim: track the ball early, then bias towards the goalmouth so the camera is
  // already looking at the right place when the ball arrives.
  const lookX = ball.x + (goalX - ball.x) * ease * 0.85;
  const lookY = ball.y + (CY - ball.y) * ease * 0.6;
  const kt = cam._replayed ? 0.25 : 1;
  cam.tx += (lookX - cam.tx) * kt;
  cam.ty += (lookY - cam.ty) * kt;
  cam.tz = 0.9 + ease * 0.5;
  cam.hfov = 52 - ease * 14;                       // tighten in for the finish

  // last resort: never let the rig sit inside the terracing
  cam.x = clamp(cam.x, SAFE.x0, SAFE.x1);
  cam.y = clamp(cam.y, -34, SAFE.y1);
  cam._replayed = true;
}

export function groundBasis(cam) {
  let fx = cam.tx - cam.x;
  let fy = cam.ty - cam.y;
  const l = Math.hypot(fx, fy) || 1;
  fx /= l; fy /= l;
  return { fx, fy, rx: fy, ry: -fx };
}

function setupView(cam, w, h) {
  let fx = cam.tx - cam.x;
  let fy = cam.ty - cam.y;
  let fz = cam.tz - cam.z;
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;

  // right = forward x worldUp(0,0,1) -> (fy, -fx, 0)
  let rx = fy;
  let ry = -fx;
  const rl = Math.hypot(rx, ry) || 1;
  rx /= rl; ry /= rl;

  // up = right x forward  (right.z is always 0)
  const ux = ry * fz;
  const uy = -rx * fz;
  const uz = rx * fy - ry * fx;

  // Lens off the width, but never let a tall window blow the vertical view open.
  const fromW = (w / 2) / Math.tan((cam.hfov * Math.PI) / 360);
  const fromH = (h / 2) / Math.tan((48 * Math.PI) / 360);
  const f = Math.max(fromW, fromH);
  return { cam, fx, fy, fz, rx, ry, ux, uy, uz, f, cx: w / 2, cy: h / 2, w, h };
}

const tmp = { x: 0, y: 0, z: 0, s: 0 };

function project(V, x, y, z, out) {
  const dx = x - V.cam.x;
  const dy = y - V.cam.y;
  const dz = z - V.cam.z;
  const zc = dx * V.fx + dy * V.fy + dz * V.fz;
  if (zc < NEAR) return null;
  const s = V.f / zc;
  out.x = V.cx + (dx * V.rx + dy * V.ry) * s;
  out.y = V.cy - (dx * V.ux + dy * V.uy + dz * V.uz) * s;
  out.z = zc;
  out.s = s;
  return out;
}

/* --------------------------- polygon filling ----------------------- */
const camBuf = Array.from({ length: 8 }, () => ({ xc: 0, yc: 0, zc: 0 }));
const clipBuf = Array.from({ length: 10 }, () => ({ xc: 0, yc: 0, zc: 0 }));

/**
 * Fill a world-space polygon, clipped against the near plane so a shape that
 * straddles the camera still draws its visible part instead of vanishing.
 * @param {number[]} co flat [x,y,z, x,y,z, ...]
 */
function poly(ctx, V, co, fill) {
  const n = co.length / 3;
  for (let i = 0; i < n; i++) {
    const dx = co[i * 3] - V.cam.x;
    const dy = co[i * 3 + 1] - V.cam.y;
    const dz = co[i * 3 + 2] - V.cam.z;
    const c = camBuf[i];
    c.xc = dx * V.rx + dy * V.ry;
    c.yc = dx * V.ux + dy * V.uy + dz * V.uz;
    c.zc = dx * V.fx + dy * V.fy + dz * V.fz;
  }

  let m = 0;
  for (let i = 0; i < n; i++) {
    const a = camBuf[i];
    const b = camBuf[(i + 1) % n];
    const ain = a.zc >= NEAR;
    const bin = b.zc >= NEAR;
    if (ain) { const o = clipBuf[m++]; o.xc = a.xc; o.yc = a.yc; o.zc = a.zc; }
    if (ain !== bin) {
      const t = (NEAR - a.zc) / (b.zc - a.zc);
      const o = clipBuf[m++];
      o.xc = a.xc + (b.xc - a.xc) * t;
      o.yc = a.yc + (b.yc - a.yc) * t;
      o.zc = NEAR;
    }
  }
  if (m < 3) return;

  ctx.beginPath();
  for (let i = 0; i < m; i++) {
    const c = clipBuf[i];
    const s = V.f / c.zc;
    const sx = V.cx + c.xc * s;
    const sy = V.cy - c.yc * s;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Ground strip of a given width — keeps perspective width correct. */
function groundLine(ctx, V, x1, y1, x2, y2, width, fill) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = Math.hypot(dx, dy) || 1;
  const nx = (-dy / l) * (width / 2);
  const ny = (dx / l) * (width / 2);
  poly(ctx, V, [
    x1 + nx, y1 + ny, 0, x2 + nx, y2 + ny, 0,
    x2 - nx, y2 - ny, 0, x1 - nx, y1 - ny, 0,
  ], fill);
}

/* ------------------------------- boxes ----------------------------- */
const LIGHT = (() => {
  const l = [-0.32, -0.55, 0.77];
  const m = Math.hypot(...l);
  return [l[0] / m, l[1] / m, l[2] / m];
})();

const FACES = [
  { idx: [1, 5, 7, 3], n: 'px' },
  { idx: [0, 2, 6, 4], n: 'nx' },
  { idx: [2, 3, 7, 6], n: 'py' },
  { idx: [0, 4, 5, 1], n: 'ny' },
  { idx: [4, 6, 7, 5], n: 'pz' },
];

const corner = Array.from({ length: 8 }, () => [0, 0, 0]);
const faceBuf = new Array(12);

/** Oriented cuboid; local +x is the facing direction. */
function box(ctx, V, cx, cy, cz, hx, hy, hz, cos, sin, col) {
  for (let i = 0; i < 8; i++) {
    const sx = i & 1 ? hx : -hx;
    const sy = i & 2 ? hy : -hy;
    const sz = i & 4 ? hz : -hz;
    const c = corner[i];
    c[0] = cx + sx * cos - sy * sin;
    c[1] = cy + sx * sin + sy * cos;
    c[2] = cz + sz;
  }

  for (const face of FACES) {
    let nx = 0;
    let ny = 0;
    let nz = 0;
    if (face.n === 'px') { nx = cos; ny = sin; }
    else if (face.n === 'nx') { nx = -cos; ny = -sin; }
    else if (face.n === 'py') { nx = -sin; ny = cos; }
    else if (face.n === 'ny') { nx = sin; ny = -cos; }
    else nz = 1;

    const [i0, i1, i2, i3] = face.idx;
    const mx = (corner[i0][0] + corner[i2][0]) / 2;
    const my = (corner[i0][1] + corner[i2][1]) / 2;
    const mz = (corner[i0][2] + corner[i2][2]) / 2;
    if ((V.cam.x - mx) * nx + (V.cam.y - my) * ny + (V.cam.z - mz) * nz <= 0) continue;

    const lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
    const k = 0.52 + 0.48 * Math.max(0, lambert);
    const ids = face.idx;
    for (let v = 0; v < 4; v++) {
      const c = corner[ids[v]];
      faceBuf[v * 3] = c[0];
      faceBuf[v * 3 + 1] = c[1];
      faceBuf[v * 3 + 2] = c[2];
    }
    poly(ctx, V, faceBuf, shade(col, k));
  }
}

/* ------------------------- limbs and spheres ----------------------- */
const ringA = [];
const ringB = [];
const limbBuf = new Array(12);

/**
 * Tapered prism between two world points — the building block for arms, legs
 * and torsos. `sides` controls how round it reads.
 */
function limb(ctx, V, ax, ay, az, bx, by, bz, rA, rB, col, sides = 6) {
  let dx = bx - ax;
  let dy = by - ay;
  let dz = bz - az;
  const dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;

  // any vector not parallel to the axis, to build a perpendicular frame from
  const refZ = Math.abs(dz) < 0.9;
  const rx0 = refZ ? 0 : 1;
  const ry0 = 0;
  const rz0 = refZ ? 1 : 0;
  let ux = dy * rz0 - dz * ry0;
  let uy = dz * rx0 - dx * rz0;
  let uz = dx * ry0 - dy * rx0;
  const ul = Math.hypot(ux, uy, uz) || 1;
  ux /= ul; uy /= ul; uz /= ul;
  const vx = dy * uz - dz * uy;
  const vy = dz * ux - dx * uz;
  const vz = dx * uy - dy * ux;

  for (let i = 0; i < sides; i++) {
    const t = (i / sides) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const nx = ux * c + vx * s;
    const ny = uy * c + vy * s;
    const nz = uz * c + vz * s;
    ringA[i] = [ax + nx * rA, ay + ny * rA, az + nz * rA, nx, ny, nz];
    ringB[i] = [bx + nx * rB, by + ny * rB, bz + nz * rB];
  }

  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    const a0 = ringA[i];
    const a1 = ringA[j];
    const b0 = ringB[i];
    const b1 = ringB[j];
    const nx = (a0[3] + a1[3]) / 2;
    const ny = (a0[4] + a1[4]) / 2;
    const nz = (a0[5] + a1[5]) / 2;
    const mx = (a0[0] + b1[0]) / 2;
    const my = (a0[1] + b1[1]) / 2;
    const mz = (a0[2] + b1[2]) / 2;
    if ((V.cam.x - mx) * nx + (V.cam.y - my) * ny + (V.cam.z - mz) * nz <= 0) continue;

    const k = 0.5 + 0.5 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
    limbBuf[0] = a0[0]; limbBuf[1] = a0[1]; limbBuf[2] = a0[2];
    limbBuf[3] = a1[0]; limbBuf[4] = a1[1]; limbBuf[5] = a1[2];
    limbBuf[6] = b1[0]; limbBuf[7] = b1[1]; limbBuf[8] = b1[2];
    limbBuf[9] = b0[0]; limbBuf[10] = b0[1]; limbBuf[11] = b0[2];
    poly(ctx, V, limbBuf, shade(col, k));
  }
}

/** Billboarded sphere — heads and hands. */
function sphere(ctx, V, x, y, z, r, col) {
  const c = project(V, x, y, z, tmp);
  if (!c) return;
  const rad = r * c.s;
  if (rad < 0.4) return;
  const g = ctx.createRadialGradient(
    c.x - rad * 0.35, c.y - rad * 0.4, rad * 0.1, c.x, c.y, rad);
  g.addColorStop(0, shade(col, 1.15));
  g.addColorStop(1, shade(col, 0.62));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c.x, c.y, rad, 0, 7);
  ctx.fill();
}

/* ------------------------------ stadium ---------------------------- */
const STAND_FRONT_Z = 1.9;
const STAND_BACK_Z = 15;
const STAND_DEPTH = 22;
const ROOF_Z = 19.5;

const CROWD_COLS = [
  [206, 212, 224], [58, 66, 86], [150, 40, 52], [30, 40, 62], [214, 176, 92],
  [92, 104, 128], [176, 62, 88], [40, 82, 74], [232, 232, 236], [70, 54, 46],
];

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic crowd. Each fan is one small quad on the rake of a stand, so the
 * blocky look is intentional and it costs nothing to generate.
 */
function buildCrowd() {
  const rand = mulberry(97531);
  const rows = 13;
  const fans = [];

  const bank = (kind, from, to, step) => {
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const depth = MARGIN + t * STAND_DEPTH;
      const z = STAND_FRONT_Z + t * (STAND_BACK_Z - STAND_FRONT_Z) + 0.35;
      for (let u = from; u < to; u += step) {
        if (rand() < 0.12) continue;                      // empty seats
        const jitter = (rand() - 0.5) * step * 0.35;
        const col = CROWD_COLS[(rand() * CROWD_COLS.length) | 0];
        fans.push({ kind, u: u + jitter, depth, z, col, s: 0.22 + rand() * 0.1 });
      }
    }
  };

  bank('far', -22, PITCH.w + 22, 1.05);
  bank('left', -18, PITCH.h + 18, 1.05);
  bank('right', -18, PITCH.h + 18, 1.05);
  return fans;
}

let CROWD = null;

function fanPos(f) {
  if (f.kind === 'far') return [f.u, PITCH.h + f.depth];
  if (f.kind === 'left') return [-f.depth, f.u];
  return [PITCH.w + f.depth, f.u];
}

function drawStadium(ctx, V, quality) {
  if (!CROWD) CROWD = buildCrowd();
  const lowQ = quality === 'low';

  // Three banks: the near side is where the camera sits, so it is never drawn.
  const banks = [
    { kind: 'far', a: [-22, PITCH.h], b: [PITCH.w + 22, PITCH.h], n: [0, 1] },
    { kind: 'left', a: [0, -18], b: [0, PITCH.h + 18], n: [-1, 0] },
    { kind: 'right', a: [PITCH.w, PITCH.h + 18], b: [PITCH.w, -18], n: [1, 0] },
  ];

  for (const bk of banks) {
    const [nx, ny] = bk.n;
    const f0 = [bk.a[0] + nx * MARGIN, bk.a[1] + ny * MARGIN];
    const f1 = [bk.b[0] + nx * MARGIN, bk.b[1] + ny * MARGIN];
    const bd = MARGIN + STAND_DEPTH;
    const b0 = [bk.a[0] + nx * bd, bk.a[1] + ny * bd];
    const b1 = [bk.b[0] + nx * bd, bk.b[1] + ny * bd];

    // front wall, then the raked seating deck
    poly(ctx, V, [f0[0], f0[1], 0, f1[0], f1[1], 0,
      f1[0], f1[1], STAND_FRONT_Z, f0[0], f0[1], STAND_FRONT_Z], 'rgb(30,36,48)');
    poly(ctx, V, [f0[0], f0[1], STAND_FRONT_Z, f1[0], f1[1], STAND_FRONT_Z,
      b1[0], b1[1], STAND_BACK_Z, b0[0], b0[1], STAND_BACK_Z], 'rgb(44,50,64)');
    // back wall and roof
    poly(ctx, V, [b0[0], b0[1], STAND_BACK_Z, b1[0], b1[1], STAND_BACK_Z,
      b1[0], b1[1], ROOF_Z, b0[0], b0[1], ROOF_Z], 'rgb(24,28,38)');
    const r0 = [b0[0] - nx * 9, b0[1] - ny * 9];
    const r1 = [b1[0] - nx * 9, b1[1] - ny * 9];
    poly(ctx, V, [b0[0], b0[1], ROOF_Z, b1[0], b1[1], ROOF_Z,
      r1[0], r1[1], ROOF_Z - 1.2, r0[0], r0[1], ROOF_Z - 1.2], 'rgb(18,21,29)');
  }

  // At full detail every seat is drawn — the only thing skipped is what sits
  // behind the camera, which is invisible either way. Distance thinning and the
  // hard cull are Low-detail only.
  const skip = lowQ ? 3 : 1;
  const cx = V.cam.x;
  const cy = V.cam.y;
  for (let i = 0; i < CROWD.length; i += skip) {
    const f = CROWD[i];
    const [px, py] = fanPos(f);
    const dx = px - cx;
    const dy = py - cy;
    if (dx * V.fx + dy * V.fy < -2) continue;                // behind the camera
    if (lowQ) {
      const d2 = dx * dx + dy * dy;
      if (d2 > 9025) continue;                               // beyond 95m
      if (d2 > 3600 && (i & 1)) continue;                    // half density past 60m
    }
    const s = f.s;
    poly(ctx, V, [
      px - s, py, f.z - s, px + s, py, f.z - s,
      px + s, py, f.z + s, px - s, py, f.z + s,
    ], shade(f.col, 0.85));
  }
}

/* ------------------------------- pitch ----------------------------- */
const TURF_A = [46, 122, 62];
const TURF_B = [38, 104, 54];
const LINE = 'rgba(255,255,255,.82)';

function drawPitch(ctx, V, quality) {
  const stripes = quality === 'low' ? 10 : 18;
  const m = MARGIN;

  poly(ctx, V, [
    -m, -m, 0, PITCH.w + m, -m, 0, PITCH.w + m, PITCH.h + m, 0, -m, PITCH.h + m, 0,
  ], 'rgb(22,52,32)');

  const sw = PITCH.w / stripes;
  for (let i = 0; i < stripes; i++) {
    poly(ctx, V, [
      i * sw, 0, 0, (i + 1) * sw, 0, 0, (i + 1) * sw, PITCH.h, 0, i * sw, PITCH.h, 0,
    ], shade(i % 2 ? TURF_A : TURF_B, 1));
  }

  const lw = 0.14;
  groundLine(ctx, V, 0, 0, PITCH.w, 0, lw, LINE);
  groundLine(ctx, V, 0, PITCH.h, PITCH.w, PITCH.h, lw, LINE);
  groundLine(ctx, V, 0, 0, 0, PITCH.h, lw, LINE);
  groundLine(ctx, V, PITCH.w, 0, PITCH.w, PITCH.h, lw, LINE);
  groundLine(ctx, V, PITCH.w / 2, 0, PITCH.w / 2, PITCH.h, lw, LINE);

  const segs = quality === 'low' ? 20 : 40;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    groundLine(ctx, V,
      PITCH.w / 2 + Math.cos(a0) * 9.15, CY + Math.sin(a0) * 9.15,
      PITCH.w / 2 + Math.cos(a1) * 9.15, CY + Math.sin(a1) * 9.15, lw, LINE);
  }

  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? 1 : -1;
    const bx = gx + inw * BOX.w;
    groundLine(ctx, V, gx, CY - BOX.half, bx, CY - BOX.half, lw, LINE);
    groundLine(ctx, V, gx, CY + BOX.half, bx, CY + BOX.half, lw, LINE);
    groundLine(ctx, V, bx, CY - BOX.half, bx, CY + BOX.half, lw, LINE);
    const sx = gx + inw * 5.5;
    groundLine(ctx, V, gx, CY - 9.16, sx, CY - 9.16, lw, LINE);
    groundLine(ctx, V, gx, CY + 9.16, sx, CY + 9.16, lw, LINE);
    groundLine(ctx, V, sx, CY - 9.16, sx, CY + 9.16, lw, LINE);
  }
}

function drawGoals(ctx, V, quality) {
  const post = [242, 244, 250];
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? -1 : 1;
    box(ctx, V, gx, CY - GOAL_HALF, GOAL_H / 2, 0.09, 0.09, GOAL_H / 2, 1, 0, post);
    box(ctx, V, gx, CY + GOAL_HALF, GOAL_H / 2, 0.09, 0.09, GOAL_H / 2, 1, 0, post);
    box(ctx, V, gx, CY, GOAL_H, 0.09, GOAL_HALF, 0.09, 1, 0, post);
    if (quality === 'low') continue;
    const back = gx + inw * 1.9;
    poly(ctx, V, [
      back, CY - GOAL_HALF, 0, back, CY + GOAL_HALF, 0,
      back, CY + GOAL_HALF, GOAL_H * 0.86, back, CY - GOAL_HALF, GOAL_H * 0.86,
    ], 'rgba(226,236,250,.16)');
    poly(ctx, V, [
      gx, CY - GOAL_HALF, GOAL_H, back, CY - GOAL_HALF, GOAL_H * 0.86,
      back, CY - GOAL_HALF, 0, gx, CY - GOAL_HALF, 0,
    ], 'rgba(226,236,250,.11)');
    poly(ctx, V, [
      gx, CY + GOAL_HALF, GOAL_H, back, CY + GOAL_HALF, GOAL_H * 0.86,
      back, CY + GOAL_HALF, 0, gx, CY + GOAL_HALF, 0,
    ], 'rgba(226,236,250,.11)');
  }
}

/* ------------------------------ players ---------------------------- */
function playerLook(p, kitRgb, shortsRgb) {
  if (!p._look) {
    let h = 0;
    for (const ch of p.ref.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
    h = Math.abs(h);
    p._look = { skin: SKINS[h % SKINS.length], hair: HAIRS[(h >> 3) % HAIRS.length] };
  }
  return {
    skin: p._look.skin, hair: p._look.hair,
    kit: kitRgb, shorts: shortsRgb, sock: darken(kitRgb, 0.8),
  };
}

const BOOT = [26, 26, 32];

/* Skeleton dimensions, in metres. */
const HIP_Z = 0.92;
const SHOULDER_Z = 1.44;
const THIGH = 0.44;
const SHIN = 0.44;
const UPPER_ARM = 0.29;
const FOREARM = 0.27;

/**
 * Draw a jointed figure: hips and shoulders drive thighs, shins, upper arms and
 * forearms, with hands, feet and a head on the ends. Knees and elbows bend
 * through the run cycle so the silhouette reads as a person, not a box.
 */
function drawPlayerHi(ctx, V, p, look, phase, sides = 6) {
  const fine = sides > 4;                 // hands, boots and hair only at full detail
  const cos = p.dirX;
  const sin = p.dirY;
  const sp = Math.hypot(p.vx, p.vy);
  const gait = Math.min(1, sp / 6.5);
  const lean = Math.min(0.12, sp / 70);

  // local (forward, lateral, up) -> world
  const wx = (f, l) => p.x + f * cos - l * sin;
  const wy = (f, l) => p.y + f * sin + l * cos;

  const legSwing = 0.62 * gait;
  const armSwing = 0.5 * gait;

  const leg = (side, ph) => {
    const s = Math.sin(ph);
    const hipA = s * legSwing;                       // + swings the thigh forward
    const kneeA = hipA - (Math.max(0, -s) * 1.15 + 0.12) * gait - 0.08;
    const lat = side * 0.11;

    const hipF = lean;
    const kneeF = hipF + Math.sin(hipA) * THIGH;
    const kneeZ = HIP_Z - Math.cos(hipA) * THIGH;
    const ankF = kneeF + Math.sin(kneeA) * SHIN;
    const ankZ = Math.max(0.07, kneeZ - Math.cos(kneeA) * SHIN);

    limb(ctx, V, wx(hipF, lat), wy(hipF, lat), HIP_Z,
      wx(kneeF, lat), wy(kneeF, lat), kneeZ, 0.105, 0.075, look.skin, sides);
    limb(ctx, V, wx(kneeF, lat), wy(kneeF, lat), kneeZ,
      wx(ankF, lat), wy(ankF, lat), ankZ, 0.075, 0.055, look.sock, sides);
    if (fine) {
      limb(ctx, V, wx(ankF, lat), wy(ankF, lat), ankZ,
        wx(ankF + 0.17, lat), wy(ankF + 0.17, lat), 0.035, 0.055, 0.05, BOOT, 4);
    }
  };

  const arm = (side, ph) => {
    const s = Math.sin(ph);
    const shA = s * armSwing;
    const elA = shA + 0.75 * gait + 0.25;
    const lat = side * 0.20;

    const shF = lean * 0.5;
    const elF = shF + Math.sin(shA) * UPPER_ARM;
    const elZ = SHOULDER_Z - Math.cos(shA) * UPPER_ARM;
    const haF = elF + Math.sin(elA) * FOREARM;
    const haZ = elZ - Math.cos(elA) * FOREARM;
    const latOut = side * 0.235;

    limb(ctx, V, wx(shF, lat), wy(shF, lat), SHOULDER_Z,
      wx(elF, latOut), wy(elF, latOut), elZ, 0.075, 0.055, look.kit, sides);   // sleeve
    limb(ctx, V, wx(elF, latOut), wy(elF, latOut), elZ,
      wx(haF, latOut), wy(haF, latOut), haZ, 0.052, 0.042, look.skin, sides);
    if (fine) sphere(ctx, V, wx(haF, latOut), wy(haF, latOut), haZ - 0.03, 0.055, look.skin);
  };

  // back limbs first so the near ones overlap them correctly
  leg(-1, phase + Math.PI);
  arm(1, phase + Math.PI);
  leg(1, phase);

  // shorts, then a torso that tapers out to the shoulders
  limb(ctx, V, wx(lean, 0), wy(lean, 0), HIP_Z - 0.06,
    wx(lean, 0), wy(lean, 0), HIP_Z + 0.26, 0.19, 0.17, look.shorts, sides);
  limb(ctx, V, wx(lean, 0), wy(lean, 0), HIP_Z + 0.2,
    wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + 0.05, 0.16, 0.215, look.kit, sides);

  arm(-1, phase);

  // neck and head
  limb(ctx, V, wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z,
    wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + 0.17, 0.06, 0.055, look.skin, 4);
  const hz = SHOULDER_Z + 0.29;
  sphere(ctx, V, wx(lean * 1.6, 0), wy(lean * 1.6, 0), hz, 0.115, look.skin);
  if (fine) {
    sphere(ctx, V, wx(lean * 1.6 - 0.03, 0), wy(lean * 1.6 - 0.03, 0), hz + 0.045, 0.105, look.hair);
  }
}

/** Same skeleton, square limbs and no hands, boots or hair — for phones. */
function drawPlayerLo(ctx, V, p, look, phase) {
  drawPlayerHi(ctx, V, p, look, phase, 4);
}

function shadowAt(ctx, V, x, y, r) {
  const c = project(V, x + 0.25, y + 0.2, 0, tmp);
  if (!c) return;
  const rx = r * c.s;
  if (rx > 400) return;
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, rx * 0.42, 0, 0, 7);
  ctx.fill();
}

/* ------------------------------- main ------------------------------ */
export function draw(ctx, match, cam, w, h, quality, dt) {
  const V = setupView(cam, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#080c16');
  sky.addColorStop(1, '#0e1a20');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawStadium(ctx, V, quality);
  drawPitch(ctx, V, quality);
  drawGoals(ctx, V, quality);

  const kits = kitColours(match).map(rgb);
  const shorts = kits.map((c) => darken(c, 0.62));
  const gk = rgb(GK_KIT);
  const gkShorts = darken(gk, 0.6);
  const active = match.active;
  const b = match.ball;

  const items = [];
  for (let t = 0; t < 2; t++) {
    for (const p of match.teams[t].players) {
      const sc = project(V, p.x, p.y, 0.9, tmp);
      if (!sc) continue;
      if (sc.x < -160 || sc.x > w + 160 || sc.y < -220 || sc.y > h + 260) continue;
      items.push({ kind: 'p', p, team: t, depth: sc.z });
    }
  }
  const bs = project(V, b.x, b.y, b.z || 0, tmp);
  if (bs) items.push({ kind: 'b', depth: bs.z });
  items.sort((a, z) => z.depth - a.depth);

  for (const it of items) {
    if (it.kind === 'p') shadowAt(ctx, V, it.p.x, it.p.y, 0.46);
    else shadowAt(ctx, V, b.x, b.y, 0.3);
  }

  for (const it of items) {
    if (it.kind === 'b') { drawBall(ctx, V, b); continue; }
    const p = it.p;
    const isGK = p.role === 'GK';
    const look = playerLook(p, isGK ? gk : kits[it.team], isGK ? gkShorts : shorts[it.team]);

    p._phase = (p._phase || 0) + Math.hypot(p.vx, p.vy) * dt * 2.4;
    if (quality === 'low') drawPlayerLo(ctx, V, p, look, p._phase);
    else drawPlayerHi(ctx, V, p, look, p._phase);

    if (p === active) drawMarker(ctx, V, p, match.teams[it.team].colors[0]);
  }

  if (match.phase !== 'play' && match.banner) drawBanner(ctx, match, w, h, kits);
}

function drawBall(ctx, V, b) {
  const c = project(V, b.x, b.y, (b.z || 0) + 0.16, tmp);
  if (!c) return;
  const r = Math.max(1.6, Math.min(80, 0.19 * c.s));
  const g = ctx.createRadialGradient(c.x - r * 0.35, c.y - r * 0.4, r * 0.15, c.x, c.y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#b9c4d2');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(c.x, c.y, r, 0, 7);
  ctx.fill();
}

function drawMarker(ctx, V, p, colour) {
  const c = project(V, p.x, p.y, 2.42, tmp);
  if (!c) return;
  const s = Math.max(4, Math.min(60, 0.34 * c.s));
  ctx.fillStyle = colour;
  ctx.strokeStyle = 'rgba(0,0,0,.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y + s);
  ctx.lineTo(c.x - s * 0.9, c.y - s * 0.5);
  ctx.lineTo(c.x + s * 0.9, c.y - s * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBanner(ctx, match, w, h, kits) {
  const isGoal = match.banner === 'GOAL';
  ctx.fillStyle = 'rgba(4,8,16,.5)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isGoal ? shade(kits[match.goalTeam], 1.25) : '#fff';
  ctx.font = `800 ${Math.round(Math.min(w * 0.11, 96))}px "Bahnschrift", system-ui, sans-serif`;
  ctx.fillText(match.banner, w / 2, h / 2);
}

/* ---------------------------- quality ------------------------------ */
/**
 * Phones and tablets get the light models and textures. Core count alone is a
 * poor signal (plenty of desktops report 4), so it only trips at the very low end.
 */
export function resolveQuality(setting) {
  // Ultra is never chosen automatically — it is only ever an explicit request.
  if (setting === 'high' || setting === 'low' || setting === 'ultra') return setting;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 760;
  const weak = (navigator.hardwareConcurrency || 8) <= 2;
  return touch || small || weak ? 'low' : 'high';
}
