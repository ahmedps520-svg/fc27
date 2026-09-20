/**
 * The built-in footballer: a rig of capsules and cones, proportioned off a
 * real 1.8 m player, posed procedurally — run, stride, dive, celebrate — and
 * dressed in a kit with the number and name on the back. Lives in its own
 * module so the menu can stand one on the title screen without loading the
 * whole match renderer behind it.
 */
import * as THREE from '../vendor/three.module.js';

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
export function kitTexture(kitCol, number, name, size = 256) {
  const key = `${kitCol.getHexString()}|${number}|${name}|${size}`;
  if (kitTexCache.has(key)) return kitTexCache.get(key);
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = `#${kitCol.getHexString()}`;
  g.fillRect(0, 0, size, size);
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

export function buildPlayer(kitCol, shortCol, skinCol, hairCol, sockCol, build, { face = true } = {}) {
  const grp = new THREE.Group();
  const mat = (c, rough = 0.72) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.02 });
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
    hair: add(JOINT_GEO, hair),
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

export function posePlayer(rig, p, phase, fine, celebT = 0) {
  const { parts } = rig;
  if (p.diveT > 0) { poseDive(rig, p, fine); return; }
  rig.grp.rotation.set(0, 0, 0);
  const b = rig.build || { height: 1, girth: 1, shoulders: 1 };
  const H = b.height;
  const G = b.girth;
  const cos = p.dirX;
  const sin = p.dirY;
  const face = Math.atan2(sin, cos);
  const sp = Math.hypot(p.vx, p.vy);
  const gait = Math.min(1, sp / 6.5);
  const lean = Math.min(0.14, sp / 62);
  const cheer = p.celebrating ? 1 : 0;
  // little hop while celebrating, so the whole body lifts off the turf
  const hop = cheer ? Math.abs(Math.sin(celebT * 6.5)) * 0.22 : 0;
  // the body rises and falls once per stride, as the trailing leg drives
  const bob = Math.abs(Math.sin(phase)) * 0.035 * gait;
  const wx = (f, l) => p.x + f * cos - l * sin;
  const wy = (f, l) => p.y + f * sin + l * cos;
  const lift = hop + bob;

  const hipZ = HIP_Z * H + lift;
  const shZ = SHOULDER_Z * H + lift;

  const leg = (side, ph, thigh, shin, knee, foot) => {
    const s = Math.sin(ph);
    const hipA = s * 0.68 * gait;
    const kneeA = hipA - (Math.max(0, -s) * 1.25 + 0.12) * gait - 0.08;
    const lat = side * 0.1;
    const hipF = lean;
    const kneeF = hipF + Math.sin(hipA) * THIGH * H;
    const kneeZ = hipZ - Math.cos(hipA) * THIGH * H;
    const ankF = kneeF + Math.sin(kneeA) * SHIN * H;
    const ankZ = Math.max(ANKLE_Z * 0.7, kneeZ - Math.cos(kneeA) * SHIN * H);
    segment(thigh, wx(hipF, lat), wy(hipF, lat), hipZ + 0.02,
      wx(kneeF, lat), wy(kneeF, lat), kneeZ, 0.082 * G);
    segment(shin, wx(kneeF, lat), wy(kneeF, lat), kneeZ,
      wx(ankF, lat), wy(ankF, lat), ankZ, 0.062 * G);
    knee.position.set(wx(kneeF, lat), wy(kneeF, lat), kneeZ);
    knee.scale.setScalar(0.062 * G);
    // a boot is a flat wedge along the foot, not a sausage
    foot.position.set(wx(ankF + 0.05, lat), wy(ankF + 0.05, lat), Math.max(0.035, ankZ - 0.055));
    foot.rotation.set(0, 0, face);
    foot.scale.set(0.23, 0.1, 0.07);
    foot.visible = fine;
  };

  const arm = (side, ph, upper, fore, hand, sleeve) => {
    const s = Math.sin(ph);
    // celebrating: both arms swing up and out overhead instead of pumping
    const swing = cheer ? Math.sin(celebT * 5 + side) * 0.25 : 0;
    const shA = cheer ? -2.35 + swing : s * 0.55 * gait;
    const elA = cheer ? -2.6 + swing * 0.6 : shA + 0.8 * gait + 0.22;
    // hung off the outside of the deltoid, not buried in the chest
    const lat = side * (CHEST_W * b.shoulders + 0.014);
    const out = side * (cheer ? 0.34 : CHEST_W * b.shoulders + 0.042);
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
    wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ + 0.03,
    CHEST_W * b.shoulders * G, CHEST_D * G, face, 1);
  // deltoids: a flattened cap that rounds off the top of the shirt
  parts.shoulder.position.set(wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ);
  parts.shoulder.rotation.set(0, 0, face);
  parts.shoulder.scale.set(CHEST_D * G, CHEST_W * b.shoulders * G * 1.02, 0.085 * G);
  segment(parts.neck, wx(lean * 1.7, 0), wy(lean * 1.7, 0), shZ,
    wx(lean * 1.7 - 0.01, 0), wy(lean * 1.7 - 0.01, 0), shZ + 0.1 * H, 0.046);

  const hz = shZ + 0.21 * H;
  parts.head.position.set(wx(lean * 1.7 - 0.012, 0), wy(lean * 1.7 - 0.012, 0), hz);
  parts.head.rotation.set(0, 0, face);
  // a head is taller than it is wide, and deeper than it is broad
  parts.head.scale.set(0.098, 0.092, 0.112);
  parts.hair.position.set(wx(lean * 1.7 - 0.012, 0), wy(lean * 1.7 - 0.012, 0), hz + 0.022);
  parts.hair.rotation.set(0, 0, face);
  parts.hair.scale.set(0.101, 0.095, 0.104);
  parts.hair.visible = fine;
  /* The face sits on the front of the head: the eyes a little above centre,
     the mouth below, all along the facing direction. Shouting on a
     celebration: the mouth opens (scales tall) on the hop's rhythm. */
  const fx = Math.cos(face); const fy = Math.sin(face);
  const lx = -fy; const ly = fx;                         // across the face
  const hx = wx(lean * 1.7 - 0.012, 0); const hy = wy(lean * 1.7 - 0.012, 0);
  parts.eyeL.position.set(hx + fx * 0.085 + lx * 0.034, hy + fy * 0.085 + ly * 0.034, hz + 0.02);
  parts.eyeR.position.set(hx + fx * 0.085 - lx * 0.034, hy + fy * 0.085 - ly * 0.034, hz + 0.02);
  parts.eyeL.scale.set(0.012, 0.012, 0.012); parts.eyeR.scale.set(0.012, 0.012, 0.012);
  const shout = cheer ? 0.5 + Math.abs(Math.sin(celebT * 6.5)) * 0.5 : 0;
  parts.mouth.position.set(hx + fx * 0.09, hy + fy * 0.09, hz - 0.035);
  parts.mouth.rotation.set(0, 0, face);
  parts.mouth.scale.set(0.012, 0.022, 0.006 + shout * 0.02);
  parts.eyeL.visible = fine; parts.eyeR.visible = fine; parts.mouth.visible = fine;
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
