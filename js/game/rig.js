/**
 * The built-in footballer: a rig of capsules and cones, proportioned off a
 * real 1.8 m player, posed procedurally — run, stride, dive, celebrate — and
 * dressed in a kit with the number and name on the back. Lives in its own
 * module so the menu can stand one on the title screen without loading the
 * whole match renderer behind it.
 */
import * as THREE from '../vendor/three.module.js';
import { celebPose, armDirs } from './celebrations.js';
import { paintKit } from '../data/kitDesign.js';

const UP_Y = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();

/**
 * A shirt: the kit colour with the number and the surname printed on the
 * back. The torso is a cylinder whose seam (u = 0) faces forward, so the back
 * of the shirt is the middle of the texture, and the wide end of the cone is
 * the top, so the name sits above the number as it should.
 */
const kitTexCache = new Map();
export function kitTexture(kitCol, number, name, size = 256, strip = null) {
  const pat = strip && strip.pattern !== 'plain' ? `${strip.pattern}:${strip.trim}` : '';
  const key = `${kitCol.getHexString()}|${number}|${name}|${size}|${pat}`;
  if (kitTexCache.has(key)) return kitTexCache.get(key);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const g = c.getContext('2d');
  // v115: a designed kit's pattern (data/kitDesign.js), under the name and number
  paintKit(g, pat ? strip : { shirt: `#${kitCol.getHexString()}`, pattern: 'plain' }, size);
  // print colour: white on a dark shirt, near-black on a light one
  const lum = 0.2126 * kitCol.r + 0.7152 * kitCol.g + 0.0722 * kitCol.b;
  g.fillStyle = lum > 0.45 ? '#15181f' : '#f6f8ff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(size * 0.075)}px "Bahnschrift", "Arial Narrow", system-ui, sans-serif`;
  g.fillText(name.slice(0, 12), size * 0.5, size * 0.2, size * 0.26);
  g.font = `800 ${Math.round(size * 0.3)}px "Bahnschrift", "Arial Narrow", system-ui, sans-serif`;
  g.fillText(String(number), size * 0.5, size * 0.46, size * 0.26);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  kitTexCache.set(key, tex);
  return tex;
}

/* ------------------------------ players ----------------------------
 * Proportions are taken off a real 1.8 m footballer rather than eyeballed:
 * head a shade under 1/8 of standing height, shoulders 0.42 m across but only
 * 0.26 m front to back, waist narrower than both. The old figure was a barrel —
 * a round 0.4 m capsule for the torso, the same width from every angle, with
 * the head sunk into it — which is what made it read as a toy.
 */
const ANKLE_Z = 0.10;
const KNEE_Z = 0.50;
const HIP_Z = 0.94;
const WAIST_Z = 1.08;
const SHOULDER_Z = 1.46;
const THIGH = HIP_Z - KNEE_Z;
const SHIN = KNEE_Z - ANKLE_Z;
const UPPER_ARM = 0.30;
const FOREARM = 0.27;

// Half-widths: [across the shoulders, front to back]. Keeping the two apart is
// most of what makes a torso look like a chest instead of a drum.
const CHEST_W = 0.205;
const CHEST_D = 0.125;
const HIPS_W = 0.175;
const HIPS_D = 0.115;

// Capsules rather than bare cylinders — rounded ends read as muscle and hide
// the seams at every joint. The torso tapers, so it is a cone section instead.
const LIMB_GEO = new THREE.CapsuleGeometry(1, 1, 4, 10);
const JOINT_GEO = new THREE.SphereGeometry(1, 12, 10);

/*
 * v124: hair with a shape. Everyone used to wear the same cap — a sphere over
 * the crown — whatever his card portrait showed. These are the portrait's six
 * silhouettes (components/face.js `style`) and its beard, built in the hair
 * mesh's own unit space so the per-frame placement is exactly what it was:
 * +x is the way he faces, +z is up, and the head's centre sits at z ≈ -0.21.
 *
 *   0 crop · 1 fringe · 2 quiff · 3 long at the back · 4 buzz · 5 afro
 *
 * Each is one mesh (the pieces are merged), so a shape costs no draw calls.
 */
const HAIR_PIECES = {
  0: [],
  1: [[0.42, 0, 0.42, 0.48, 0.8, 0.3]],
  2: [[0.2, 0, 0.78, 0.6, 0.68, 0.44]],
  3: [[-0.46, 0, -0.5, 0.6, 0.96, 0.8]],
  4: null,     // the cap itself, pulled in tight
  5: null,     // the cap itself, blown out
};
const BEARD = [0.66, 0, -0.94, 0.32, 0.6, 0.27];
function ellipsoid([cx, cy, cz, sx, sy, sz]) {
  const g = new THREE.SphereGeometry(1, 10, 8).toNonIndexed();
  g.scale(sx, sy, sz); g.translate(cx, cy, cz);
  return g;
}
function merge(geos) {
  const n = geos.reduce((t, g) => t + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3); const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.computeBoundingSphere();
  return out;
}
const hairCache = new Map();
/** The hair mesh's geometry for a portrait `style` (0–5) and beard. */
export function hairGeometry(style = 0, beard = false) {
  const st = ((style | 0) % 6 + 6) % 6;
  const key = `${st}:${beard ? 1 : 0}`;
  if (!hairCache.has(key)) {
    /* the cap sits back from the brow so the eyes and forehead show (the old
       single cap hung over the eyes); the buzz is a thin shell set back on
       the crown, the afro a big one behind the hairline */
    const cap = st === 4 ? [-0.16, 0, 0.1, 1.0, 1.02, 0.99] : st === 5 ? [-0.34, 0, 0.3, 1.2, 1.26, 1.1] : [-0.18, 0, 0.08, 1, 1, 1];
    const geos = [ellipsoid(cap), ...(HAIR_PIECES[st] || []).map(ellipsoid)];
    if (beard) geos.push(ellipsoid(BEARD));
    hairCache.set(key, merge(geos));
  }
  return hairCache.get(key);
}
const BOOT_GEO = new THREE.BoxGeometry(1, 1, 1);
const TORSO_GEO = new THREE.CylinderGeometry(1, 0.74, 1, 16);
const HIPS_GEO = new THREE.CylinderGeometry(1, 0.9, 1, 14);
const SLEEVE_GEO = new THREE.CylinderGeometry(1, 0.82, 1, 10);

// CapsuleGeometry(1, 1) stands 3 units tall (body 1 plus two unit caps), so the
// length axis is divided through by that to span exactly a to b. The cylinders
// are a unit tall and need no such correction.
const CAPSULE_H = 3;

function segment(mesh, ax, ay, az, bx, by, bz, r, unitH = CAPSULE_H) {
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len = Math.hypot(dx, dy, dz) || 0.001;
  mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  _v.set(dx / len, dy / len, dz / len);
  _q.setFromUnitVectors(UP_Y, _v);
  mesh.quaternion.copy(_q);
  mesh.scale.set(r, len / unitH, r);
}

/**
 * A body part with an oval cross-section: same as `segment`, then rolled about
 * its own length so the wide axis lies across the player's shoulders rather
 * than wherever the maths happened to leave it.
 */
function ovalSegment(mesh, ax, ay, az, bx, by, bz, halfW, halfD, facing, unitH) {
  segment(mesh, ax, ay, az, bx, by, bz, 1, unitH);
  _q2.setFromAxisAngle(UP_Y, facing + Math.PI / 2);
  mesh.quaternion.multiply(_q2);
  mesh.scale.x = halfD;
  mesh.scale.z = halfW;
}

const EYE_MAT = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.4 });
const MOUTH_MAT = new THREE.MeshStandardMaterial({ color: 0x5a1e22, roughness: 0.7 });

export function buildPlayer(kitCol, shortCol, skinCol, hairCol, sockCol, build, { face = true, hairStyle = 0, beard = false } = {}) {
  const grp = new THREE.Group();
  const mat = (c, rough = 0.72) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.02, envMapIntensity: 0.55 });
  // kit fabric catches the floodlights a little; skin and turf-worn socks do not
  const kit = mat(kitCol, 0.62);
  const shorts = mat(shortCol, 0.66);
  const skin = mat(skinCol, 0.78);
  const hair = mat(hairCol, 0.85);
  const sock = mat(sockCol, 0.8);
  const boot = mat(0x14141a, 0.42);

  const add = (geo, material) => {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    grp.add(m);
    return m;
  };

  const parts = {
    thighL: add(LIMB_GEO, skin), thighR: add(LIMB_GEO, skin),
    shinL: add(LIMB_GEO, sock), shinR: add(LIMB_GEO, sock),
    footL: add(BOOT_GEO, boot), footR: add(BOOT_GEO, boot),
    kneeL: add(JOINT_GEO, skin), kneeR: add(JOINT_GEO, skin),
    hips: add(HIPS_GEO, shorts),
    torso: add(TORSO_GEO, kit),
    // arms are bare and the sleeve is its own sleeve — a kit-coloured upper arm
    // and a skin forearm put the hem at the elbow, which no shirt has
    armL: add(LIMB_GEO, skin), armR: add(LIMB_GEO, skin),
    sleeveL: add(SLEEVE_GEO, kit), sleeveR: add(SLEEVE_GEO, kit),
    foreL: add(LIMB_GEO, skin), foreR: add(LIMB_GEO, skin),
    handL: add(JOINT_GEO, skin), handR: add(JOINT_GEO, skin),
    shoulder: add(JOINT_GEO, kit),
    neck: add(LIMB_GEO, skin),
    head: add(JOINT_GEO, skin),
    hair: add(hairGeometry(hairStyle, beard), hair),
    // a face: two eyes and a mouth, so a close-up is a person and a
    // celebration can shout — the mouth scales open while `celebrating`
    eyeL: add(JOINT_GEO, EYE_MAT),
    eyeR: add(JOINT_GEO, EYE_MAT),
    mouth: add(JOINT_GEO, MOUTH_MAT),
  };
  // three more draw calls a player; Medium and below keep the plain head
  for (const k of ['eyeL', 'eyeR', 'mouth']) { parts[k].castShadow = false; parts[k].visible = face; }
  return { grp, parts, build };
}

/**
 * Per-player build, so twenty-two people are not one person copied.
 * Seeded off the squad number and name, so a given player is always himself.
 */
export function buildFor(ref, role) {
  let h = 0;
  const key = `${ref?.id || ''}${ref?.name || ''}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const r = (n) => ((h >>> (n * 5)) & 31) / 31;
  return {
    // keepers are the tall ones, as they are everywhere else
    height: (role === 'GK' ? 1.03 : 0.965) + r(0) * 0.075,
    girth: 0.92 + r(1) * 0.2,
    shoulders: 0.94 + r(2) * 0.14,
  };
}

/**
 * v102: the gait, for both renderers — where a player is moving in his own
 * frame (mf forward along the facing, ml across it, a unit vector when he is
 * moving) and which way a clip should run: backwards on a backpedal (the
 * model rig; the built-in figure steps in any direction on its own).
 */
export function gaitOf(p) {
  const sp = Math.hypot(p.vx, p.vy);
  if (sp < 0.3) return { mf: 1, ml: 0, dir: 1, sp };
  const vx = p.vx / sp; const vy = p.vy / sp;
  const mf = vx * p.dirX + vy * p.dirY;
  const ml = -vx * p.dirY + vy * p.dirX;
  return { mf, ml, dir: mf < -0.3 ? -1 : 1, sp };
}

/**
 * v102: stride cycles a second at a given speed, from real running: about 1.3
 * at a 3 m/s jog and 2.2 at a 9 m/s sprint (≈ 2.6 and 4.4 steps a second).
 * The old rate was a straight line in speed — the legs spun at a sprint and
 * crept at a jog — so a sprint read as a fast jog instead of long strides.
 * Returns radians a second of the stride phase.
 */
export const strideRate = (sp) => 2 * Math.PI * 0.77 * Math.pow(Math.max(0, sp), 0.478);

/**
 * v102: how far the body tips into a turn: the path's curvature times speed
 * (the lateral acceleration), smoothed. Called once a frame by the renderer.
 */
export function updateBank(p, dt) {
  const sp = Math.hypot(p.vx, p.vy);
  const h = Math.atan2(p.vy, p.vx);
  let dh = sp > 1 && p._vh != null ? h - p._vh : 0;
  if (dh > Math.PI) dh -= 2 * Math.PI; else if (dh < -Math.PI) dh += 2 * Math.PI;
  p._vh = h;
  const w = dt > 0 ? dh / dt : 0;                                 // turn rate, rad/s
  const want = Math.max(-0.11, Math.min(0.11, w * sp * 0.011));   // lateral g, as a sideways lean in metres
  p._bank = (p._bank || 0) + (want - (p._bank || 0)) * Math.min(1, dt * 9);
  return p._bank;
}

export function posePlayer(rig, p, phase, fine, celebT = 0) {
  const { parts } = rig;
  /* The parts are placed in pitch coordinates, so the group itself only
     carries the turf height under the player (rig.groundZ, set by the
     renderer) and, through a roulette, the spin — which has to turn about
     the player, not about the corner flag at the origin (v77: it swung the
     whole figure across the pitch for the length of the move). */
  const spin = p.spinT > 0 && !(p.diveT > 0) && !(p.downT > 0) ? (1 - p.spinT / 0.7) * Math.PI * 2 : 0;
  const cs = Math.cos(spin); const sn = Math.sin(spin);
  rig.grp.rotation.set(0, 0, spin);
  rig.grp.position.set(p.x - (cs * p.x - sn * p.y), p.y - (sn * p.x + cs * p.y), rig.groundZ || 0);
  if (p.diveT > 0) { poseDive(rig, p, fine); return; }
  if (p.downT > 0) { poseDown(rig, p); return; }
  const sp = Math.hypot(p.vx, p.vy);
  /* v110: the scorer's own celebration (game/celebrations.js); the rest of
     the side keeps the cheer */
  const C = p.celebrating && p.celebKind ? celebPose(p.celebKind, celebT, sp > 1.5) : null;
  if (C && C.belly > 0.5) { poseDown(rig, { ...p, downT: 0.9, downMax: 1.6 }); return; }
  if (C && C.flip && !spin) {
    // a somersault turns the whole figure about its hips, across its own left-right axis
    const pivot = new THREE.Vector3(p.x, p.y, HIP_Z);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(-p.dirY, p.dirX, 0), C.flip);
    rig.grp.quaternion.copy(q);
    rig.grp.position.copy(pivot).sub(pivot.clone().applyQuaternion(q)).add(new THREE.Vector3(0, 0, (rig.groundZ || 0) + C.lift));
  }
  const b = rig.build || { height: 1, girth: 1, shoulders: 1 };
  const H = b.height;
  const G = b.girth;
  const face = Math.atan2(p.dirY, p.dirX) + (C ? C.spin : 0);
  const cos = Math.cos(face);
  const sin = Math.sin(face);
  const gait = Math.min(1, sp / 6.5);
  /* v102 (feel): where he is going, in his own frame: mf forward along the
     facing, from −1 (straight backwards) to 1. */
  const { mf } = gaitOf(p);
  // leaning into the run only when running forwards; a touch back on a backpedal
  // a celebration's bow or lean back tips the torso: shoulders forward (or back) by its length × sin
  const TORSO = (SHOULDER_Z - WAIST_Z) * b.height;
  const lean = Math.max(-0.04, Math.min(0.14, sp / 62) * mf) + (C ? (TORSO * Math.sin(C.lean)) / 1.7 : 0);
  // a turn tips the body into it (p._bank, from the renderer: how fast the path is curving)
  const bank = (p._bank || 0) + (C ? C.roll * TORSO : 0);
  const cheer = p.celebrating && !C ? 1 : 0;
  // little hop while celebrating, so the whole body lifts off the turf
  // a celebration's jump lifts the whole figure (the group, below), boots and all; kneeling sinks the hips
  const hop = cheer ? Math.abs(Math.sin(celebT * 6.5)) * 0.22 : C ? -C.kneel * 0.42 : 0;
  if (C && C.lift && !C.flip) rig.grp.position.z += C.lift;
  // the body rises and falls once per stride, as the trailing leg drives
  const bob = Math.abs(Math.sin(phase)) * 0.035 * gait;
  const wx = (f, l) => p.x + f * cos - l * sin;
  const wy = (f, l) => p.y + f * sin + l * cos;
  const lift = hop + bob;

  // v102: soft knees when moving, so a planted foot a stride ahead is within reach
  const hipZ = HIP_Z * H + lift - 0.07 * gait;
  const shZ = SHOULDER_Z * H + lift - (C ? TORSO * (1 - Math.cos(C.lean)) : 0);

  /* v102 (feel): the legs step. Each foot is either planted — pinned to the
     spot on the grass where it landed — or swinging on an arc to where it
     will land next, which is predicted from where he is actually going (so a
     backpedal steps backwards and a jockey steps sideways without any special
     case). The thigh and shin are then solved to reach it (two-bone IK), the
     knee bent forward the way knees bend. The stride used to be a rhythm
     played along the facing whatever the body did: the planted foot slid at
     the body's own speed, in every direction (tools/gait-audit.mjs). */
  const feet = rig.feet || (rig.feet = {});
  const cadence = strideRate(sp) / (2 * Math.PI);              // stride cycles a second
  /* share of a cycle a foot is down, from how far a leg can sweep while planted
     (~0.7 m of ground at a running crouch): a jog comes out ~0.3 and a sprint
     ~0.18, as in real running; a walk is capped at 0.6 (both feet down a while) */
  const duty = sp > 0.05 ? Math.max(0.15, Math.min(0.6, 0.7 * cadence / sp)) : 0.6;
  const liftH = 0.06 + 0.12 * Math.min(1, sp / 8);
  const leg = (side, ph, thigh, shin, knee, foot) => {
    const key = side < 0 ? 'L' : 'R';
    const lat = side * 0.1;
    const hx = wx(lean, lat); const hy = wy(lean, lat); const hz = hipZ + 0.02;
    // where this foot stands under him, and where a step lands: ahead along his velocity
    const homeX = p.x - sin * lat; const homeY = p.y + cos * lat;
    const u = (((ph / (2 * Math.PI)) % 1) + 1) % 1;             // 0..1 through this leg's cycle
    const stance = u < duty;
    let f = feet[key];
    // first sight, or he has jumped (a kick-off reset, a replay seeking): stand where he is
    if (!f || Math.hypot(f.x - homeX, f.y - homeY) > 2.5 * H) f = feet[key] = { x: homeX, y: homeY, fromX: homeX, fromY: homeY, stance: true, u };
    const moving = sp > 0.35 && cadence > 0.05;
    let ax; let ay; let az = ANKLE_Z * H;
    if (!moving) {
      // standing: settle each foot under him, a small step at a time
      const gx = homeX - f.x; const gy = homeY - f.y; const g = Math.hypot(gx, gy);
      if (g > 0.015) { const k = Math.min(1, 0.05 / g); f.x += gx * k; f.y += gy * k; az += Math.min(0.05, g * 0.5); }
      f.stance = true; ax = f.x; ay = f.y;
    } else if (stance) {
      if (!f.stance) {
        // touch-down: the foot lands a little ahead of the hip along his path, mid-stance is under him
        const ahead = (duty * 0.4) / cadence;                    // his weight passes over it at 40% of the stance, as in a real stride
        f.x = homeX + p.vx * ahead; f.y = homeY + p.vy * ahead; f.stance = true;
      }
      ax = f.x; ay = f.y;
    } else {
      if (f.stance) { f.fromX = f.x; f.fromY = f.y; f.fromZ = f.z ?? ANKLE_Z * H; f.stance = false; }
      // where the next plant will be, predicted from his velocity now
      const toGo = ((1 - u) + duty * 0.4) / cadence;
      const nx = homeX + p.vx * toGo; const ny = homeY + p.vy * toGo;
      const s = (u - duty) / (1 - duty);
      const e = s * s * (3 - 2 * s);
      ax = f.fromX + (nx - f.fromX) * e; ay = f.fromY + (ny - f.fromY) * e;
      // lift off from wherever the heel was (a toe-off leaves it up), onto the arc
      az += ((f.fromZ ?? az) - az) * (1 - e) + Math.sin(Math.PI * s) * liftH;
      f.x = ax; f.y = ay;
    }
    // two-bone IK, hip to ankle, knee forward
    const T = THIGH * H; const S = SHIN * H;
    let dx = ax - hx; let dy = ay - hy; let dz = az - hz;
    let d = Math.hypot(dx, dy, dz);
    const R = T + S - 1e-4;
    if (d > R) {
      const hd = Math.hypot(dx, dy);
      // out of reach: keep the foot where it is and lift the heel (a toe-off), or, if even that cannot reach, stretch towards it
      if (f.stance && hd < R * 0.999) { dz = -Math.sqrt(R * R - hd * hd); d = R; }   // only a planted foot keeps its spot
      else { const k = R / d; dx *= k; dy *= k; dz *= k; d = R; }
    }
    const ex = hx + dx; const ey = hy + dy; const ez = hz + dz;   // the ankle, where the leg can reach
    f.z = ez;
    const ux = dx / d; const uy = dy / d; const uz = dz / d;
    const a = (T * T - S * S + d * d) / (2 * d);
    const hgt = Math.sqrt(Math.max(0, T * T - a * a));
    let bx = cos; let by = sin; let bz = 0.15;
    const dot = bx * ux + by * uy + bz * uz;
    bx -= dot * ux; by -= dot * uy; bz -= dot * uz;
    const bl = Math.hypot(bx, by, bz) || 1;
    const kx = hx + ux * a + (bx / bl) * hgt; const ky = hy + uy * a + (by / bl) * hgt; const kz = hz + uz * a + (bz / bl) * hgt;
    segment(thigh, hx, hy, hz, kx, ky, kz, 0.082 * G);
    segment(shin, kx, ky, kz, ex, ey, ez, 0.062 * G);
    knee.position.set(kx, ky, kz);
    knee.scale.setScalar(0.062 * G);
    // a boot is a flat wedge along the foot, not a sausage
    foot.position.set(ex + cos * 0.05, ey + sin * 0.05, Math.max(0.035, ez - 0.055));
    foot.rotation.set(0, 0, face);
    foot.scale.set(0.23, 0.1, 0.07);
    foot.visible = fine;
  };

  const arm = (side, ph, upper, fore, hand, sleeve) => {
    if (C) {
      /* v110: an arm placed by direction. Hanging straight down, raised
         sideways (raise: 1 = level, 2 = overhead) and swung forwards (fwd,
         the same scale); the elbow folds the forearm in (celebrations.armDirs). */
      const a = side < 0 ? C.armL : C.armR;
      const { upper: up, fore: fo } = armDirs(a);
      const [uf, ul, uz] = [up[0], up[1] * side, up[2]];
      const [ff, fl2, fz] = [fo[0], fo[1] * side, fo[2]];
      const lat = side * (CHEST_W * b.shoulders + 0.014) + bank;
      const shF = lean * 1.7;
      const eF = shF + uf * UPPER_ARM * H; const eL = lat + ul * UPPER_ARM * H; const eZ = shZ + uz * UPPER_ARM * H;
      const hF = eF + ff * FOREARM * H; const hL = eL + fl2 * FOREARM * H; const hZ = eZ + fz * FOREARM * H;
      segment(upper, wx(shF, lat), wy(shF, lat), shZ, wx(eF, eL), wy(eF, eL), eZ, 0.049 * G);
      segment(sleeve, wx(shF, lat), wy(shF, lat), shZ, wx(shF + (eF - shF) * 0.52, lat + (eL - lat) * 0.52), wy(shF + (eF - shF) * 0.52, lat + (eL - lat) * 0.52), shZ + (eZ - shZ) * 0.52, 0.056 * G, 1);
      segment(fore, wx(eF, eL), wy(eF, eL), eZ, wx(hF, hL), wy(hF, hL), hZ, 0.042 * G);
      hand.position.set(wx(hF, hL), wy(hF, hL), hZ - 0.02);
      hand.scale.set(0.045, 0.055, 0.032);
      hand.visible = fine;
      return;
    }
    const s = Math.sin(ph);
    // celebrating: both arms swing up and out overhead instead of pumping
    const swing = cheer ? Math.sin(celebT * 5 + side) * 0.25 : 0;
    const shA = cheer ? -2.35 + swing : s * (0.45 + 0.3 * Math.min(1, sp / 9)) * gait;   // v102: a sprint pumps the arms harder
    const elA = cheer ? -2.6 + swing * 0.6 : shA + 0.8 * gait + 0.22;
    // hung off the outside of the deltoid, not buried in the chest
    const lat = side * (CHEST_W * b.shoulders + 0.014) + bank;
    const out = side * (cheer ? 0.34 : CHEST_W * b.shoulders + 0.042) + bank;
    const shF = lean * 0.5;
    const elF = shF + Math.sin(shA) * UPPER_ARM * H;
    const elZ = shZ - Math.cos(shA) * UPPER_ARM * H;
    const haF = elF + Math.sin(elA) * FOREARM * H;
    const haZ = elZ - Math.cos(elA) * FOREARM * H;
    segment(upper, wx(shF, lat), wy(shF, lat), shZ, wx(elF, out), wy(elF, out), elZ, 0.049 * G);
    // the shirt sleeve covers the top half of the upper arm and stands off it
    segment(sleeve, wx(shF, lat), wy(shF, lat), shZ,
      wx(shF + (elF - shF) * 0.52, lat + (out - lat) * 0.52),
      wy(shF + (elF - shF) * 0.52, lat + (out - lat) * 0.52),
      shZ + (elZ - shZ) * 0.52, 0.056 * G, 1);
    segment(fore, wx(elF, out), wy(elF, out), elZ, wx(haF, out), wy(haF, out), haZ, 0.042 * G);
    hand.position.set(wx(haF, out), wy(haF, out), haZ - 0.02);
    hand.scale.set(0.045, 0.055, 0.032);
    hand.visible = fine;
  };

  leg(-1, phase + Math.PI, parts.thighL, parts.shinL, parts.kneeL, parts.footL);
  leg(1, phase, parts.thighR, parts.shinR, parts.kneeR, parts.footR);
  arm(-1, phase, parts.armL, parts.foreL, parts.handL, parts.sleeveL);
  arm(1, phase + Math.PI, parts.armR, parts.foreR, parts.handR, parts.sleeveR);

  const waistZ = WAIST_Z * H + lift;
  // Shorts and shirt are cone sections, and which end is which matters: the
  // geometry's wide face is at its +Y, so the wide end has to be named second
  // or the shirt comes out narrow at the shoulders and flared at the hem — a
  // dress rather than a jersey.
  ovalSegment(parts.hips, wx(lean, 0), wy(lean, 0), waistZ,
    wx(lean, 0), wy(lean, 0), hipZ - 0.12, HIPS_W * G, HIPS_D * G, face, 1);
  ovalSegment(parts.torso, wx(lean, 0), wy(lean, 0), waistZ - 0.02,
    wx(lean * 1.7, bank), wy(lean * 1.7, bank), shZ + 0.03,
    CHEST_W * b.shoulders * G, CHEST_D * G, face, 1);
  // deltoids: a flattened cap that rounds off the top of the shirt
  parts.shoulder.position.set(wx(lean * 1.7, bank), wy(lean * 1.7, bank), shZ);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_D * G, CHEST_W * b.shoulders * G * 1.02, 0.085 * G);
  segment(parts.neck, wx(lean * 1.7, bank), wy(lean * 1.7, bank), shZ,
    wx(lean * 1.7 - 0.01, bank * 1.1), wy(lean * 1.7 - 0.01, bank * 1.1), shZ + 0.1 * H, 0.046);

  const hz = shZ + 0.21 * H;
  parts.head.position.set(wx(lean * 1.7 - 0.012, bank * 1.15), wy(lean * 1.7 - 0.012, bank * 1.15), hz);
  parts.head.rotation.set(0, 0, face);
  // a head is taller than it is wide, and deeper than it is broad
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(wx(lean * 1.7 - 0.012, bank * 1.15), wy(lean * 1.7 - 0.012, bank * 1.15), hz + 0.022);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.101, 0.095, 0.104);
  parts.hair.visible = fine;
  /* The face sits on the front of the head: the eyes a little above centre,
     the mouth below, all along the facing direction. Shouting on a
     celebration: the mouth opens (scales tall) on the hop's rhythm. */
  const fx = Math.cos(face); const fy = Math.sin(face);
  const lx = -fy; const ly = fx;                         // across the face
  const hx = wx(lean * 1.7 - 0.012, bank * 1.15); const hy = wy(lean * 1.7 - 0.012, bank * 1.15);
  parts.eyeL.position.set(hx + fx * 0.085 + lx * 0.034, hy + fy * 0.085 + ly * 0.034, hz + 0.02);
  parts.eyeR.position.set(hx + fx * 0.085 - lx * 0.034, hy + fy * 0.085 - ly * 0.034, hz + 0.02);
  parts.eyeL.scale.set(0.012, 0.012, 0.012); parts.eyeR.scale.set(0.012, 0.012, 0.012);
  const shout = C ? C.mouth : cheer ? 0.5 + Math.abs(Math.sin(celebT * 6.5)) * 0.5 : 0;
  parts.mouth.position.set(hx + fx * 0.09, hy + fy * 0.09, hz - 0.035);
  parts.mouth.rotation.set(0, 0, face);
  parts.mouth.scale.set(0.012, 0.022, 0.006 + shout * 0.02);
  parts.eyeL.visible = fine; parts.eyeR.visible = fine; parts.mouth.visible = fine;
}

/**
 * Fouled: flat on the grass.
 *
 * The figure goes down the way the challenge sent it — face down along its own
 * facing — holds there while the referee walks over, then pushes itself up in
 * the last third of the timer. Built out of the same segment helpers as the
 * dive, so it lies on the turf rather than sinking through it.
 */
export function poseDown(rig, p) {
  const { parts } = rig;
  const T = Math.max(0.001, p.downMax || 1.6);
  // 0 at the moment of impact, 1 when he is back on his feet
  const t = 1 - Math.max(0, Math.min(1, p.downT / T));
  const fall = Math.min(1, t * 6);                    // hits the deck fast
  const rise = Math.max(0, (t - 0.72) / 0.28);        // and pushes himself up at the end
  const flat = Math.max(0, fall - rise);              // 1 = lying down, 0 = upright
  const b = rig.build || { height: 1, girth: 1, shoulders: 1 };
  const H = b.height; const G = b.girth;
  const cos = p.dirX; const sin = p.dirY;
  const face = Math.atan2(sin, cos);

  // a point `d` metres in front of him and `l` metres to his left
  const at = (d, l = 0) => [p.x + cos * d - sin * l, p.y + sin * d + cos * l];
  const up = (z) => z * (1 - flat) + 0.16 * flat;     // every height collapses to the turf

  const hipZ = up(HIP_Z * H * 0.9);
  const shZ = up(SHOULDER_Z * H * 0.95);
  const [hxx, hyy] = at(-0.3 * flat);
  const [sxx, syy] = at(0.34 * flat);

  ovalSegment(parts.hips, hxx, hyy, hipZ, ...at(-0.2 * flat), hipZ + 0.08 * (1 - flat), HIPS_W * G, HIPS_D * G, face, 1);
  ovalSegment(parts.torso, hxx, hyy, hipZ, sxx, syy, shZ + 0.02, CHEST_W * b.shoulders * G, CHEST_D * G, face, 1);
  parts.shoulder.position.set(sxx, syy, shZ);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_W * b.shoulders * G, CHEST_D * G, 0.075);

  const [nx, ny] = at(0.5 * flat);
  segment(parts.neck, sxx, syy, shZ, nx, ny, up(SHOULDER_Z * H + 0.1), 0.046);
  const [hdx, hdy] = at(0.62 * flat);
  const headZ = up(SHOULDER_Z * H + 0.18);
  parts.head.position.set(hdx, hdy, headZ);
  parts.head.rotation.set(0, 0, face);
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(hdx, hdy, headZ + 0.03 * (1 - flat) + 0.02);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.1, 0.094, 0.088);
  // a face pressed into the grass is not worth three draw calls
  for (const k of ['eyeL', 'eyeR', 'mouth']) if (parts[k]) parts[k].visible = flat < 0.5 && parts[k].visible !== false;

  // legs trailing behind, gathered under him as he gets up
  for (const [thigh, shin, knee, foot, side] of [
    [parts.thighL, parts.shinL, parts.kneeL, parts.footL, 1],
    [parts.thighR, parts.shinR, parts.kneeR, parts.footR, -1]]) {
    const lat = side * 0.1;
    const [kx, ky] = at(-0.62 * flat, lat + side * 0.06 * flat);
    const kneeZ = up((HIP_Z - THIGH) * H);
    segment(thigh, ...at(-0.3 * flat, lat), hipZ, kx, ky, kneeZ, 0.082 * G);
    knee.position.set(kx, ky, kneeZ);
    knee.scale.setScalar(0.062 * G);
    const [fx, fy] = at(-0.98 * flat, lat + side * 0.1 * flat);
    const ankZ = up(0.12);
    segment(shin, kx, ky, kneeZ, fx, fy, ankZ, 0.062 * G);
    foot.position.set(fx, fy, Math.max(0.035, ankZ - 0.03));
    foot.rotation.set(0, 0, face);
    foot.scale.set(0.23, 0.1, 0.07);
  }

  // arms out in front, breaking the fall and then pushing him back up
  for (const [arm, fore, hand, sleeve, side] of [
    [parts.armL, parts.foreL, parts.handL, parts.sleeveL, 1],
    [parts.armR, parts.foreR, parts.handR, parts.sleeveR, -1]]) {
    const lat = side * 0.2;
    const [ex, ey] = at(0.26 * flat, lat + side * 0.06);
    const elbZ = up((SHOULDER_Z - 0.3) * H);
    segment(arm, ...at(0.1 * flat, lat), shZ, ex, ey, elbZ, 0.05 * G);
    sleeve.position.set(...at(0.16 * flat, lat + side * 0.03), (shZ + elbZ) / 2);
    sleeve.rotation.set(0, 0, face);
    sleeve.scale.set(0.055 * G, 0.055 * G, 0.16);
    const [wx2, wy2] = at(0.62 * flat, lat + side * 0.1);
    const wristZ = up(0.28) * (1 - rise) + up((SHOULDER_Z - 0.55) * H) * rise;
    segment(fore, ex, ey, elbZ, wx2, wy2, wristZ, 0.044 * G);
    hand.position.set(wx2, wy2, wristZ);
    hand.scale.setScalar(0.05 * G);
  }
}

/**
 * Full-stretch dive: the body lays out horizontally along the dive direction,
 * arms reaching for the ball, legs trailing, and the whole figure lifts off the
 * turf through the middle of the dive.
 */
export function poseDive(rig, p, fine) {
  const { parts } = rig;
  const t = 1 - Math.max(0, Math.min(1, p.diveT / 0.75));   // 0 -> takeoff, 1 -> landed
  const air = Math.sin(t * Math.PI);                        // arc through the dive
  const s = p.diveDir || 1;
  const lay = Math.min(1, t * 2.6);                         // how flat the body is

  const bodyZ = 0.34 + air * 0.55;
  const reach = 0.5 + air * 0.45;
  // lateral offsets measured out from the keeper along the dive
  const at = (o, z) => [p.x, p.y + s * o, z];

  const [hx, hy, hz] = at(-0.15 * lay, bodyZ);
  const [sx2, sy2, sz2] = at(0.5 * lay, bodyZ + 0.16 * (1 - lay * 0.5));
  // Which way the keeper is laid out. The oval cross-section used when upright
  // is dropped here: the roll that orients it is derived for a bone that is
  // roughly vertical, and a body stretched flat along the ground is the one
  // case where that does not hold. A round section cannot twist wrongly.
  const face = Math.atan2(sy2 - hy, sx2 - hx);
  const round = (CHEST_W + CHEST_D) / 2;

  ovalSegment(parts.hips, hx, hy, hz, hx, hy + s * 0.14, hz + 0.22 * (1 - lay),
    (HIPS_W + HIPS_D) / 2, (HIPS_W + HIPS_D) / 2, face, 1);
  ovalSegment(parts.torso, sx2, sy2, sz2, hx, hy, hz, round, round, face, 1);
  parts.shoulder.position.set(sx2, sy2, sz2);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_D, CHEST_W, 0.085);

  // arms thrown out towards the ball
  for (const [u, f, hnd, sl, off] of [
    [parts.armL, parts.foreL, parts.handL, parts.sleeveL, 0.16],
    [parts.armR, parts.foreR, parts.handR, parts.sleeveR, -0.16],
  ]) {
    const e = at(0.5 * lay + reach * 0.5, sz2 + off * 0.5 + 0.05);
    const h = at(0.5 * lay + reach, sz2 + off + 0.1);
    segment(u, sx2, sy2, sz2, e[0], e[1], e[2], 0.049);
    segment(sl, sx2, sy2, sz2,
      sx2 + (e[0] - sx2) * 0.52, sy2 + (e[1] - sy2) * 0.52, sz2 + (e[2] - sz2) * 0.52, 0.068, 1);
    segment(f, e[0], e[1], e[2], h[0], h[1], h[2], 0.042);
    hnd.position.set(h[0], h[1], h[2]);
    hnd.scale.setScalar(0.05);
    hnd.visible = fine;
  }

  // legs trail behind the dive
  for (const [th, sh, kn, ft, off] of [
    [parts.thighL, parts.shinL, parts.kneeL, parts.footL, 0.11],
    [parts.thighR, parts.shinR, parts.kneeR, parts.footR, -0.11],
  ]) {
    const k = at(-0.15 * lay - 0.42, bodyZ - 0.12 + off * 0.4);
    const a = at(-0.15 * lay - 0.85, bodyZ - 0.24 + off * 0.5);
    segment(th, hx, hy + s * off * 0.5, hz, k[0], k[1], k[2], 0.082);
    segment(sh, k[0], k[1], k[2], a[0], a[1], a[2], 0.062);
    kn.position.set(k[0], k[1], k[2]);
    kn.scale.setScalar(0.062);
    ft.position.set(a[0], a[1] - s * 0.09, Math.max(0.035, a[2] - 0.03));
    ft.rotation.set(0, 0, face);
    ft.scale.set(0.23, 0.1, 0.07);
    ft.visible = fine;
  }

  const nz = sz2 + 0.1;
  segment(parts.neck, sx2, sy2, sz2, sx2, sy2 + s * 0.08, nz, 0.046);
  parts.head.position.set(sx2, sy2 + s * 0.15, nz + 0.04);
  parts.head.rotation.set(0, 0, face);
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(sx2, sy2 + s * 0.17, nz + 0.07);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.1, 0.094, 0.088);
  parts.hair.visible = fine;
}

/* ------------------------------- main ------------------------------ */
/**
 * Test hook: hand back the raw pitch artwork so the markings and the mow can be
 * inspected flat, without a camera, a floodlight or a bloom pass in the way.
 * Nothing in the game calls this.
 */
