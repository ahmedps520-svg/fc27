import * as THREE from '../vendor/three.module.js';
import { EffectComposer } from '../vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/jsm/postprocessing/OutputPass.js';
import { PITCH, GOAL_HALF, BOX } from './sim.js';
import { NetCloth } from './net.js';
import { faceOf } from '../components/face.js';
import { loadPlayerModel, makeRig, poseRig } from './playerModel.js';

/* ------------------------------------------------------------------ *
 * WebGL renderer (three.js). Real meshes, real lights, real shadows.
 * The world is z-up to match the simulation, so the camera's up vector
 * is set accordingly and geometry is placed in sim coordinates directly.
 * ------------------------------------------------------------------ */

const CY = PITCH.h / 2;
const GOAL_H = 2.44;
const MARGIN = 6;
const STAND_FRONT_Z = 1.9;
const STAND_BACK_Z = 15;
const STAND_DEPTH = 22;
const ROOF_Z = 19.5;

const SKINS = [0xf5d0b0, 0xe2b085, 0xc68960, 0x965e3c, 0x623e28];
const HAIRS = [0x1c1614, 0x3a2618, 0x7a542a, 0x141212, 0x5a422c];
const CROWD_COLS = [
  0xced4e0, 0x3a4256, 0x962834, 0x1e283e, 0xd6b05c,
  0x5c6880, 0xb03e58, 0x28524a, 0xe8e8ec, 0x46362e,
];
const GK_KIT = 0xc6f24a;

const UP_Y = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hexOf = (c) => parseInt(String(c).replace('#', ''), 16);
function pickAwayKit(match) {
  const home = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const tryCols = [match.teams[1].colors[0], match.teams[1].colors[1], '#f2f4f8', '#1b1d24'];
  for (const c of tryCols) {
    const col = new THREE.Color(hexOf(c));
    if (Math.abs(col.r - home.r) + Math.abs(col.g - home.g) + Math.abs(col.b - home.b) > 0.55) return col;
  }
  return new THREE.Color(0xf2f4f8);
}

/* --------------------------- pitch texture ------------------------- */
function pitchTexture() {
  const S = 16;                                   // pixels per metre
  const c = document.createElement('canvas');
  c.width = PITCH.w * S;
  c.height = PITCH.h * S;
  const g = c.getContext('2d');
  const m = (v) => v * S;

  // mown stripes, then a fine noise pass so the turf is not a flat colour
  for (let i = 0; i < 18; i++) {
    g.fillStyle = i % 2 ? '#2f8a46' : '#28793d';
    g.fillRect((c.width / 18) * i, 0, c.width / 18 + 1, c.height);
  }
  const grain = g.getImageData(0, 0, c.width, c.height);
  const px = grain.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 26;
    px[i] += n; px[i + 1] += n * 1.2; px[i + 2] += n * 0.6;
  }
  g.putImageData(grain, 0, 0);
  // mower arcs
  g.globalAlpha = 0.05;
  for (let i = 0; i < 40; i++) {
    g.strokeStyle = i % 2 ? '#ffffff' : '#000000';
    g.lineWidth = 2 + Math.random() * 5;
    g.beginPath();
    g.moveTo(Math.random() * c.width, 0);
    g.bezierCurveTo(Math.random() * c.width, c.height * 0.4,
      Math.random() * c.width, c.height * 0.7, Math.random() * c.width, c.height);
    g.stroke();
  }
  g.globalAlpha = 1;

  g.strokeStyle = 'rgba(255,255,255,.88)';
  g.lineWidth = Math.max(2, m(0.12));
  g.strokeRect(m(0.3), m(0.3), m(PITCH.w - 0.6), m(PITCH.h - 0.6));
  g.beginPath(); g.moveTo(m(PITCH.w / 2), 0); g.lineTo(m(PITCH.w / 2), c.height); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(9.15), 0, 7); g.stroke();
  g.beginPath(); g.arc(m(PITCH.w / 2), m(CY), m(0.35), 0, 7); g.fillStyle = '#fff'; g.fill();

  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? 1 : -1;
    g.strokeRect(
      m(side === 0 ? 0.3 : PITCH.w - 0.3 - BOX.w), m(CY - BOX.half),
      m(BOX.w), m(BOX.half * 2));
    g.strokeRect(
      m(side === 0 ? 0.3 : PITCH.w - 0.3 - 5.5), m(CY - 9.16),
      m(5.5), m(18.32));
    g.beginPath(); g.arc(m(gx + inw * 11), m(CY), m(0.3), 0, 7); g.fillStyle = '#fff'; g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 16;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Generic panelled ball — markings are what make the roll readable. */
function ballTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#f4f6fa';
  g.fillRect(0, 0, c.width, c.height);

  // staggered dark panels around the equator and caps
  g.fillStyle = '#15181f';
  const blob = (cx, cy, r) => {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.82;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fill();
  };
  for (let i = 0; i < 6; i++) blob((i + 0.5) * (c.width / 6), 34, 15);
  for (let i = 0; i < 6; i++) blob(i * (c.width / 6), 94, 15);
  blob(30, 64, 11); blob(158, 64, 11);

  // seams
  g.strokeStyle = 'rgba(20,24,32,.35)';
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(i * (c.width / 6), 0);
    g.lineTo(i * (c.width / 6), c.height);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Night sky: gradient horizon glow with stars, used as background and IBL source. */
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#02040a');
  grad.addColorStop(0.55, '#060c1c');
  grad.addColorStop(0.78, '#0d1a33');
  grad.addColorStop(1, '#16324d');
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);

  for (let i = 0; i < 1400; i++) {
    const y = Math.pow(Math.random(), 1.7) * c.height * 0.72;
    const a = 0.25 + Math.random() * 0.75;
    g.fillStyle = `rgba(220,232,255,${a * (1 - y / c.height)})`;
    const r = Math.random() < 0.06 ? 1.6 : 0.75;
    g.beginPath();
    g.arc(Math.random() * c.width, y, r, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Invented sponsors for the perimeter boards. Every name, mark and strapline
 * here is made up for this game — same rule as the clubs and players.
 */
const SPONSORS = [
  { name: 'VOLTARA', tag: 'ENERGY SYSTEMS', bg: '#0b1a3c', fg: '#4ea8ff', accent: '#9ad0ff', mark: 'bolt' },
  { name: 'KESTREL', tag: 'AIRWAYS', bg: '#12233a', fg: '#f2f6ff', accent: '#ff9c3d', mark: 'wing' },
  { name: 'NOVAFIT', tag: 'PERFORMANCE WEAR', bg: '#1b0f2e', fg: '#c9a4ff', accent: '#ff5cc8', mark: 'arc' },
  { name: 'IRONCLAD', tag: 'INSURANCE GROUP', bg: '#101a16', fg: '#7de3a8', accent: '#d8f5e4', mark: 'shield' },
  { name: 'LUMEN', tag: 'BROADBAND', bg: '#001f2b', fg: '#3fe0d0', accent: '#b9fff6', mark: 'ring' },
  { name: 'AURIC', tag: 'PRIVATE BANK', bg: '#241c07', fg: '#f0c765', accent: '#fff0c2', mark: 'diamond' },
  { name: 'TERRAFORM', tag: 'CIVIL ENGINEERING', bg: '#22160c', fg: '#ffab5e', accent: '#ffd8b0', mark: 'tri' },
  { name: 'MERIDIAN', tag: 'TIMEPIECES', bg: '#0a0d16', fg: '#dfe6f5', accent: '#9fb4d8', mark: 'ring' },
  { name: 'ZEPHYR', tag: 'ELECTRIC MOTORS', bg: '#06202a', fg: '#65e8ff', accent: '#c9f7ff', mark: 'bolt' },
  { name: 'PULSE', tag: 'SPORTS DRINK', bg: '#2b0713', fg: '#ff6b8a', accent: '#ffd0da', mark: 'arc' },
];

function drawMark(g, kind, x, y, r, col) {
  g.fillStyle = col;
  g.strokeStyle = col;
  g.lineWidth = r * 0.28;
  g.beginPath();
  if (kind === 'bolt') {
    g.moveTo(x + r * 0.25, y - r); g.lineTo(x - r * 0.45, y + r * 0.1);
    g.lineTo(x + r * 0.05, y + r * 0.1); g.lineTo(x - r * 0.2, y + r);
    g.lineTo(x + r * 0.55, y - r * 0.15); g.lineTo(x + r * 0.05, y - r * 0.15);
    g.closePath(); g.fill();
  } else if (kind === 'shield') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.8, y - r * 0.5);
    g.quadraticCurveTo(x + r * 0.8, y + r * 0.6, x, y + r);
    g.quadraticCurveTo(x - r * 0.8, y + r * 0.6, x - r * 0.8, y - r * 0.5);
    g.closePath(); g.fill();
  } else if (kind === 'ring') {
    g.arc(x, y, r * 0.75, 0, 7); g.stroke();
  } else if (kind === 'diamond') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.75, y); g.lineTo(x, y + r);
    g.lineTo(x - r * 0.75, y); g.closePath(); g.fill();
  } else if (kind === 'tri') {
    g.moveTo(x, y - r); g.lineTo(x + r * 0.9, y + r * 0.7);
    g.lineTo(x - r * 0.9, y + r * 0.7); g.closePath(); g.fill();
  } else if (kind === 'wing') {
    g.moveTo(x - r, y + r * 0.5); g.quadraticCurveTo(x, y - r * 1.1, x + r, y - r * 0.2);
    g.quadraticCurveTo(x * 1, y + r * 0.1, x - r, y + r * 0.5);
    g.closePath(); g.fill();
  } else {                                   // arc
    g.arc(x, y + r * 0.3, r * 0.85, Math.PI, 0); g.stroke();
  }
}

/** Perimeter LED board texture — a run of different sponsor panels. */
function ledTexture(seed = 1) {
  const rand = mulberry(seed);
  const PANEL = 512;
  const panels = 8;
  const c = document.createElement('canvas');
  c.width = PANEL * panels;
  c.height = 128;
  const g = c.getContext('2d');

  const order = SPONSORS.slice().sort(() => rand() - 0.5);
  for (let i = 0; i < panels; i++) {
    const s = order[i % order.length];
    const x = i * PANEL;

    const grad = g.createLinearGradient(x, 0, x + PANEL, c.height);
    grad.addColorStop(0, s.bg);
    grad.addColorStop(1, '#04060b');
    g.fillStyle = grad;
    g.fillRect(x, 0, PANEL, c.height);

    // accent sweep + hairline, so panels read as lit signage not flat blocks
    g.save();
    g.globalAlpha = 0.16;
    g.fillStyle = s.fg;
    g.beginPath();
    g.moveTo(x + PANEL * 0.62, 0);
    g.lineTo(x + PANEL, 0);
    g.lineTo(x + PANEL, c.height);
    g.lineTo(x + PANEL * 0.44, c.height);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = s.accent;
    g.fillRect(x, c.height - 5, PANEL, 5);

    drawMark(g, s.mark, x + 62, c.height / 2 - 4, 30, s.fg);

    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.font = 'italic 800 60px Bahnschrift, "Arial Narrow", system-ui, sans-serif';
    g.fillStyle = '#ffffff';
    g.fillText(s.name, x + 108, c.height / 2 - 12);
    g.font = '600 22px Inter, system-ui, sans-serif';
    g.fillStyle = s.accent;
    g.fillText(s.tag, x + 110, c.height / 2 + 30);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
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

function buildPlayer(kitCol, shortCol, skinCol, hairCol, sockCol, build) {
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
  };
  return { grp, parts, build };
}

/**
 * Per-player build, so twenty-two people are not one person copied.
 * Seeded off the squad number and name, so a given player is always himself.
 */
function buildFor(ref, role) {
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

function posePlayer(rig, p, phase, fine, celebT = 0) {
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
}

/**
 * Full-stretch dive: the body lays out horizontally along the dive direction,
 * arms reaching for the ball, legs trailing, and the whole figure lifts off the
 * turf through the middle of the dive.
 */
function poseDive(rig, p, fine) {
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
export function createRenderer(canvas, match, quality, models = false) {
  // 'ultra' is the deliberately expensive tier: it supersamples above the native
  // pixel ratio, quadruples the shadow map, and fills the stands out properly.
  const ultra = quality === 'ultra';
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: quality !== 'low', powerPreference: 'high-performance',
  });
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(ultra
    ? Math.min(3, Math.max(2, dpr))          // render above native, then downsample
    : Math.min(quality === 'low' ? 1.25 : 2, dpr));
  renderer.shadowMap.enabled = quality !== 'low';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // filmic tone mapping is what stops floodlit whites blowing out to flat grey
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const sky = skyTexture();
  scene.background = sky;
  scene.fog = new THREE.FogExp2(0x070d18, 0.0042);

  // Image-based lighting from the sky. Needs float render targets, which some
  // mobile GPUs refuse — fall back to plain lighting rather than failing to boot.
  let pmrem = null;
  try {
    pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(sky).texture;
  } catch {
    pmrem = null;
  }

  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);
  camera.up.set(0, 0, 1);

  scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x1c3324, 0.95));
  const sun = new THREE.DirectionalLight(0xdfe8ff, 0.85);
  sun.position.set(-46, -30, 88);
  sun.target.position.set(PITCH.w / 2, CY, 0);
  scene.add(sun, sun.target);
  if (renderer.shadowMap.enabled) {
    sun.castShadow = true;
    const shadowRes = quality === 'low' ? 1024 : ultra ? 4096 : 2048;
    sun.shadow.mapSize.set(shadowRes, shadowRes);
    sun.shadow.bias = -0.0008;
    const c = sun.shadow.camera;
    c.left = -80; c.right = 80; c.top = 70; c.bottom = -70; c.near = 20; c.far = 220;
  }

  // ground + pitch
  const surround = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w + MARGIN * 2 + 60, PITCH.h + MARGIN * 2 + 60),
    new THREE.MeshStandardMaterial({ color: 0x123021, roughness: 0.95 }));
  surround.position.set(PITCH.w / 2, CY, -0.02);
  surround.receiveShadow = true;
  scene.add(surround);

  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w, PITCH.h),
    new THREE.MeshStandardMaterial({ map: pitchTexture(), roughness: 0.97, metalness: 0 }));
  turf.position.set(PITCH.w / 2, CY, 0);
  turf.receiveShadow = true;
  scene.add(turf);

  // Perimeter LED boards, touchlines only.
  //
  // The goal-end boards used to be here too, but `rotation.set(x, y, z)` applies
  // the X term last, so the Z spin only rolled the board about its own normal
  // instead of turning it to face down the pitch: at ±90° the run stood on its
  // end as an 80-unit tower behind each goal. They are gone rather than fixed —
  // the ends read better empty, and the touchline runs already carry the sponsors.
  const boards = [
    [PITCH.w / 2, -MARGIN + 1.2, PITCH.w + 20, 0],
    [PITCH.w / 2, PITCH.h + MARGIN - 1.2, PITCH.w + 20, Math.PI],
  ];
  boards.forEach(([bx, by, len, rot], i) => {
    const led = ledTexture(1471 + i * 733);
    led.wrapS = THREE.RepeatWrapping;
    led.repeat.x = Math.max(1, Math.round(len / 26));
    const mat = new THREE.MeshStandardMaterial({
      map: led, emissive: 0xffffff, emissiveMap: led, emissiveIntensity: 1.15, roughness: 0.5,
    });
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.05), mat);
    bd.position.set(bx, by, 0.55);
    bd.rotation.set(Math.PI / 2, 0, rot);
    scene.add(bd);
  });

  // goals — frame plus a simulated net
  const postMat = new THREE.MeshStandardMaterial({ color: 0xf6f8ff, roughness: 0.35, metalness: 0.1 });
  const netMat = new THREE.LineBasicMaterial({
    color: 0xe6eefc, transparent: true, opacity: 0.5,
  });
  const NET_DEPTH = 2.0;
  const nets = [];
  for (const side of [0, 1]) {
    const gx = side === 0 ? 0 : PITCH.w;
    const inw = side === 0 ? -1 : 1;
    for (const sy of [-GOAL_HALF, GOAL_HALF]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GOAL_H, 8), postMat);
      post.position.set(gx, CY + sy, GOAL_H / 2);
      post.rotation.x = Math.PI / 2;
      post.castShadow = true;
      scene.add(post);
    }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GOAL_HALF * 2, 8), postMat);
    bar.position.set(gx, CY, GOAL_H);
    bar.castShadow = true;
    scene.add(bar);

    // One cloth wrapped from the left post, across the back, to the right post.
    // Column 0 and the last column sit on the posts; the top row hangs off the
    // crossbar and the bottom row is staked to the ground — everything between
    // is free to billow.
    const COLS = quality === 'low' ? 13 : ultra ? 30 : 21;
    const ROWS = quality === 'low' ? 6 : ultra ? 13 : 9;
    const span = GOAL_HALF * 2;
    const perim = NET_DEPTH * 2 + span;            // left side + back + right side
    const cloth = new NetCloth(COLS, ROWS,
      (c, r) => {
        const t = (c / (COLS - 1)) * perim;
        let x;
        let y;
        if (t < NET_DEPTH) {                        // left return
          x = gx + inw * t;
          y = CY - GOAL_HALF;
        } else if (t < NET_DEPTH + span) {          // back panel
          x = gx + inw * NET_DEPTH;
          y = CY - GOAL_HALF + (t - NET_DEPTH);
        } else {                                    // right return
          x = gx + inw * (perim - t);
          y = CY + GOAL_HALF;
        }
        const rt = r / (ROWS - 1);
        // net slopes back from the bar down to the ground
        const z = GOAL_H * (1 - rt);
        return [x, y, z];
      },
      (c, r) => r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(cloth.pos, 3));
    geo.setIndex(cloth.lineIndices());
    const mesh = new THREE.LineSegments(geo, netMat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    nets.push({ cloth, geo, gx, inw });
  }

  // stands: stepped terracing rather than one flat ramp, plus roof trusses
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2a3142, roughness: 0.92 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x11151f, roughness: 0.85, metalness: 0.25 });
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x3a4256, roughness: 0.6, metalness: 0.5 });
  const banks = [
    { rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: PITCH.w + 44 },
    { rot: Math.PI / 2, cx: -MARGIN, cy: CY, len: PITCH.h + 36 },
    { rot: -Math.PI / 2, cx: PITCH.w + MARGIN, cy: CY, len: PITCH.h + 36 },
  ];
  const TERRACE_ROWS = quality === 'low' ? 8 : ultra ? 22 : 14;
  for (const bk of banks) {
    const g = new THREE.Group();
    g.position.set(bk.cx, bk.cy, 0);
    g.rotation.z = bk.rot;

    // each row is a physical step you can see the edge of
    const stepD = STAND_DEPTH / TERRACE_ROWS;
    const stepH = (STAND_BACK_Z - STAND_FRONT_Z) / TERRACE_ROWS;
    for (let r = 0; r < TERRACE_ROWS; r++) {
      const z = STAND_FRONT_Z + r * stepH;
      const step = new THREE.Mesh(new THREE.BoxGeometry(bk.len, stepD, stepH + 0.5), standMat);
      step.position.set(0, stepD * (r + 0.5), z);
      step.receiveShadow = true;
      g.add(step);
    }

    const front = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.5, STAND_FRONT_Z), standMat);
    front.position.set(0, 0, STAND_FRONT_Z / 2);
    front.castShadow = true;
    g.add(front);

    const back = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.8, ROOF_Z), roofMat);
    back.position.set(0, STAND_DEPTH, ROOF_Z / 2);
    g.add(back);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(bk.len, STAND_DEPTH * 0.68, 0.55), roofMat);
    roof.position.set(0, STAND_DEPTH * 0.68, ROOF_Z);
    roof.castShadow = true;
    g.add(roof);

    // roof trusses so the underside is not a blank slab
    if (quality !== 'low') {
      for (let i = -4; i <= 4; i++) {
        const truss = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, STAND_DEPTH * 0.68, 0.45), trussMat);
        truss.position.set((bk.len / 9) * i, STAND_DEPTH * 0.68, ROOF_Z - 0.55);
        g.add(truss);
      }
    }
    scene.add(g);
  }

  // floodlight pylons at the corners: emissive panels plus real light
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xfff4d8, emissiveIntensity: 3.4, roughness: 0.3,
  });
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x232838, roughness: 0.7, metalness: 0.4 });
  const corners = [
    [-MARGIN - 6, -MARGIN - 6], [PITCH.w + MARGIN + 6, -MARGIN - 6],
    [-MARGIN - 6, PITCH.h + MARGIN + 6], [PITCH.w + MARGIN + 6, PITCH.h + MARGIN + 6],
  ];
  for (const [px, py] of corners) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 34, 8), pylonMat);
    mast.position.set(px, py, 17);
    mast.rotation.x = Math.PI / 2;
    scene.add(mast);

    const rig = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 4.5), lampMat);
    rig.position.set(px, py, 35);
    rig.lookAt(PITCH.w / 2, CY, 0);
    scene.add(rig);

    const lamp = new THREE.SpotLight(0xfff2d6, 3200, 240, Math.PI / 5, 0.5, 1.5);
    lamp.position.set(px, py, 35);
    lamp.target.position.set(PITCH.w / 2, CY, 0);
    scene.add(lamp, lamp.target);
  }

  // crowd — one instanced mesh, so thousands of seats cost a single draw call
  const rand = mulberry(97531);
  const rows = quality === 'low' ? 8 : ultra ? 22 : 14;
  const step = quality === 'low' ? 1.5 : ultra ? 0.62 : 0.95;
  const seats = [];
  const bankDefs = [
    { kind: 'far', from: -22, to: PITCH.w + 22 },
    { kind: 'left', from: -18, to: PITCH.h + 18 },
    { kind: 'right', from: -18, to: PITCH.h + 18 },
  ];
  for (const bd of bankDefs) {
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);
      const depth = MARGIN + t * STAND_DEPTH;
      const z = STAND_FRONT_Z + t * (STAND_BACK_Z - STAND_FRONT_Z) + 0.5;
      for (let u = bd.from; u < bd.to; u += step) {
        let x;
        let y;
        let face;
        if (bd.kind === 'far') { x = u; y = PITCH.h + depth; face = Math.PI; }
        else if (bd.kind === 'left') { x = -depth; y = u; face = -Math.PI / 2; }
        else { x = PITCH.w + depth; y = u; face = Math.PI / 2; }
        seats.push({
          x, y, z, face,
          seatCol: r % 3 === 0 ? 0x1c3f6e : 0x14335c,   // two-tone seating bowl
          occupied: rand() > 0.18,
          c: CROWD_COLS[(rand() * CROWD_COLS.length) | 0],
        });
      }
    }
  }
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  // Actual moulded seats: a pan and a raked back, instanced across every stand.
  const seatShape = new THREE.BufferGeometry();
  {
    const pan = new THREE.BoxGeometry(0.42, 0.4, 0.08).translate(0, 0, 0.2);
    const back = new THREE.BoxGeometry(0.42, 0.09, 0.36).translate(0, -0.18, 0.4);
    const merged = [];
    for (const g2 of [pan, back]) {
      const pos = g2.attributes.position.array;
      const idx = g2.index.array;
      const base = merged.length / 3;
      for (let i = 0; i < pos.length; i++) merged.push(pos[i]);
      seatShape.userData.idx = (seatShape.userData.idx || []).concat([...idx].map((v) => v + base));
    }
    seatShape.setAttribute('position', new THREE.Float32BufferAttribute(merged, 3));
    seatShape.setIndex(seatShape.userData.idx);
    seatShape.computeVertexNormals();
  }
  const seatMesh = new THREE.InstancedMesh(
    seatShape,
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }),
    seats.length);
  seats.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z - 0.5);
    dummy.rotation.set(0, 0, s.face || 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    seatMesh.setMatrixAt(i, dummy.matrix);
    seatMesh.setColorAt(i, col.setHex(s.seatCol));
  });
  seatMesh.instanceMatrix.needsUpdate = true;
  scene.add(seatMesh);

  /* ----------------------------- spectators -----------------------------
   * People, not capsules.
   *
   * Two instanced meshes sharing one set of transforms: bodies tinted with the
   * shirt colour, heads tinted with a skin tone. One instanced mesh could not
   * do that — an instance carries a single colour — and a coloured face is
   * exactly what makes a crowd read as jellybeans.
   *
   * Everything is boxes. A seated figure is sixty triangles, so a full ultra
   * bowl is well under a million static triangles in two draw calls, which a
   * GPU does not notice. Nothing here animates; a stand full of moving people
   * would cost more than the match.
   * -------------------------------------------------------------------- */
  const taken = seats.filter((s) => s.occupied);
  {
    /** Merge a list of box geometries into one buffer. */
    const mergeBoxes = (boxes) => {
      const positions = [];
      const normals = [];
      const indices = [];
      for (const g2 of boxes) {
        const base = positions.length / 3;
        const pos = g2.attributes.position.array;
        const nrm = g2.attributes.normal.array;
        for (let i = 0; i < pos.length; i++) positions.push(pos[i]);
        for (let i = 0; i < nrm.length; i++) normals.push(nrm[i]);
        for (const v of g2.index.array) indices.push(v + base);
        g2.dispose();
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      g.setIndex(indices);
      return g;
    };
    const box = (w, d, h, x, y, z) => new THREE.BoxGeometry(w, d, h).translate(x, y, z);

    /* Authored in the scene's own space — Z up, +Y the way the spectator looks
     * — which is the same convention the seats use. That means a figure can be
     * placed with the identical `rotation.set(0, 0, face)` its seat gets, and
     * cannot end up facing the car park. An earlier version built them Y-up and
     * tipped them, and the facing rotation then rolled them onto their sides. */
    const bodyParts = [
      box(0.34, 0.22, 0.40, 0, 0, 0.30),            // torso
      box(0.30, 0.30, 0.15, 0, 0.14, 0.06),         // thighs, out over the seat front
    ];
    if (quality !== 'low') {
      bodyParts.push(box(0.09, 0.11, 0.30, -0.21, 0.02, 0.28));   // arms
      bodyParts.push(box(0.09, 0.11, 0.30, 0.21, 0.02, 0.28));
      bodyParts.push(box(0.13, 0.13, 0.26, -0.09, 0.24, -0.16));  // shins
      bodyParts.push(box(0.13, 0.13, 0.26, 0.09, 0.24, -0.16));
    }
    const bodyGeo = mergeBoxes(bodyParts);
    const headGeo = mergeBoxes([
      box(0.10, 0.10, 0.10, 0, 0, 0.56),            // neck
      box(0.17, 0.17, 0.19, 0, 0.01, 0.70),         // head
    ]);

    const skinTone = new THREE.Color();
    const mat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
    const bodies = new THREE.InstancedMesh(bodyGeo, mat(), taken.length);
    const heads = new THREE.InstancedMesh(headGeo, mat(), taken.length);
    bodies.castShadow = false;      // a stand casting shadows onto itself is invisible and not free
    heads.castShadow = false;

    taken.forEach((s, i) => {
      // A third of them are on their feet, and everyone is a slightly different
      // size and sits at a slightly different angle. Without that the stand is
      // a grid of identical dolls, which reads worse than the capsules did.
      const standing = rand() < 0.3;
      const scale = 0.88 + rand() * 0.26;
      dummy.position.set(s.x, s.y, s.z - 0.34 + (standing ? 0.3 : 0));
      dummy.rotation.set(0, 0, (s.face || 0) + (rand() - 0.5) * 0.5);
      dummy.scale.set(scale, scale, standing ? scale * 1.25 : scale);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);
      heads.setMatrixAt(i, dummy.matrix);
      bodies.setColorAt(i, col.setHex(s.c));
      heads.setColorAt(i, skinTone.setHex(SKINS[(rand() * SKINS.length) | 0]));
    });
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    scene.add(bodies, heads);
  }

  // players
  const kitHome = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const kitAway = pickAwayKit(match);
  const rigs = new Map();
  for (let t = 0; t < 2; t++) {
    for (const p of match.teams[t].players) {
      const isGK = p.role === 'GK';
      const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
      const shorts = base.clone().multiplyScalar(0.6);
      // same look the card portrait uses, so a player on the pitch matches his card
      const look = faceOf(p.ref);
      const rig = buildPlayer(
        base, shorts,
        new THREE.Color(look.skin), new THREE.Color(look.hair),
        base.clone().multiplyScalar(0.8),
        buildFor(p.ref, p.role));
      scene.add(rig.grp);
      rigs.set(p, rig);
    }
  }

  /* ------------------------- scanned players ------------------------- *
   * The built-in figures above are always built, and stay in place until the
   * model has actually arrived: a 14 MB download must never be the reason a
   * kick-off waits. When it lands the two sets swap over, and if it fails —
   * offline, or the file missing — nothing happens and the match carries on
   * looking exactly as it did.                                               */
  const modelRigs = new Map();
  let useModels = false;
  if (models) {
    loadPlayerModel().then((model) => {
      if (!model || disposed) return;
      let index = 0;
      for (let t = 0; t < 2; t++) {
        for (const p of match.teams[t].players) {
          const isGK = p.role === 'GK';
          const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
          const rig = makeRig(model, {
            kit: {
              shirt: base,
              shorts: base.clone().multiplyScalar(0.62),
              socks: base.clone().multiplyScalar(0.82),
            },
            ref: p.ref,
            index: index++,
            isGK,
          });
          scene.add(rig.root);
          modelRigs.set(p, rig);
        }
      }
      // hide the built-in figures rather than destroying them, so quality can
      // be turned back down mid-match without rebuilding anything
      for (const rig of rigs.values()) rig.grp.visible = false;
      useModels = true;
    });
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 24, 18),
    new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.55, metalness: 0.02 }));
  ball.castShadow = true;
  scene.add(ball);

  // one marker per seat — P1 white, P2 amber, so couch players can tell them apart
  const MARKER_COLS = [0xffffff, 0xffc63d];
  const markers = MARKER_COLS.map((col) => {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.55, 4),
      new THREE.MeshBasicMaterial({ color: col }));
    m.rotation.x = Math.PI;
    m.visible = false;
    scene.add(m);
    return m;
  });

  const fine = quality !== 'low';
  let disposed = false;
  let lastNetHit = -1;

  // iOS drops the GL context under memory pressure; keep it recoverable rather
  // than letting the match freeze on a dead canvas.
  let contextLost = false;
  const onLost = (e) => { e.preventDefault(); contextLost = true; };
  const onRestored = () => { contextLost = false; };
  canvas.addEventListener('webglcontextlost', onLost, false);
  canvas.addEventListener('webglcontextrestored', onRestored, false);

  // Bloom: floodlight rigs and LED boards spill light the way stadium optics do.
  // Skipped entirely on low detail, where the extra passes are not worth it.
  let composer = null;
  if (quality !== 'low') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // High threshold on purpose: only the floodlights and LED boards should
    // bloom. Lower and the lit turf itself hazes over.
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.55, 0.95);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  return {
    /** Live three.js counters — draw calls, triangles, memory. Handy for profiling. */
    get info() { return renderer.info; },
    get engine() { return `three.js r${THREE.REVISION}`; },
    resize(w, h) {
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    render(m, cam, dt) {
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      camera.fov = cam.hfov / Math.max(1, camera.aspect) * 1.45;
      camera.updateProjectionMatrix();
      sun.position.set(cam.x - 46, cam.y - 20, 88);
      sun.target.position.set(cam.tx, cam.ty, 0);

      for (let t = 0; t < 2; t++) {
        for (const p of m.teams[t].players) {
          if (useModels) {
            const rig = modelRigs.get(p);
            if (rig) poseRig(rig, p, dt);
            continue;
          }
          const rig = rigs.get(p);
          if (!rig) continue;
          p._phase = (p._phase || 0) + Math.hypot(p.vx, p.vy) * dt * 2.4;
          posePlayer(rig, p, p._phase, fine, m.celebT || 0);
        }
      }
      ball.position.set(m.ball.x, m.ball.y, (m.ball.z || 0) + 0.19);
      // Roll it. Angular speed is v/r about the axis perpendicular to travel,
      // so the ball visibly spins along the ground instead of sliding.
      {
        const vx = m.ball.vx || 0;
        const vy = m.ball.vy || 0;
        const sp = Math.hypot(vx, vy);
        if (sp > 0.05 && dt > 0) {
          _v.set(-vy / sp, vx / sp, 0);
          _q.setFromAxisAngle(_v, (sp / 0.19) * dt);
          ball.quaternion.premultiply(_q);
        }
      }

      // netting: take the strike, then keep simulating so it ripples and settles
      if (m.netHit && m.netHit.at !== lastNetHit) {
        lastNetHit = m.netHit.at;
        const h = m.netHit;
        const near = nets.reduce((a, n) =>
          (Math.abs(h.x - n.gx) < Math.abs(h.x - a.gx) ? n : a), nets[0]);
        const k = 0.016;
        near.cloth.impulse(h.x, h.y, h.z, 2.6, h.vx * k, h.vy * k, h.vz * k - 0.05);
      }
      const nd = Math.min(dt || 1 / 60, 1 / 30);
      for (const n of nets) {
        n.cloth.step(nd, quality === 'low' ? 2 : ultra ? 6 : 3);
        n.geo.attributes.position.needsUpdate = true;
      }

      const acts = m.actives || (m.active ? [m.active] : []);
      markers.forEach((mk, i) => {
        const p = acts[i];
        mk.visible = !!p;
        if (p) mk.position.set(p.x, p.y, 2.6);
      });

      if (contextLost) return;
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
    dispose() {
      disposed = true;
      for (const rig of modelRigs.values()) {
        rig.mixer.stopAllAction();
        scene.remove(rig.root);
      }
      modelRigs.clear();
      canvas.removeEventListener('webglcontextlost', onLost);
      composer?.dispose?.();
      pmrem?.dispose();
      renderer.dispose();
    },
  };
}
