import * as THREE from '../vendor/three.module.js';
import { PITCH, GOAL_HALF, BOX } from './sim.js';

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

  for (let i = 0; i < 18; i++) {
    g.fillStyle = i % 2 ? '#2f8a46' : '#28793d';
    g.fillRect((c.width / 18) * i, 0, c.width / 18 + 1, c.height);
  }

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
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------ players ---------------------------- */
const HIP_Z = 0.92;
const SHOULDER_Z = 1.44;
const THIGH = 0.44;
const SHIN = 0.44;
const UPPER_ARM = 0.29;
const FOREARM = 0.27;

const LIMB_GEO = new THREE.CylinderGeometry(0.8, 1, 1, 10);
const JOINT_GEO = new THREE.SphereGeometry(1, 10, 8);

function segment(mesh, ax, ay, az, bx, by, bz, r) {
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const len = Math.hypot(dx, dy, dz) || 0.001;
  mesh.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  _v.set(dx / len, dy / len, dz / len);
  _q.setFromUnitVectors(UP_Y, _v);
  mesh.quaternion.copy(_q);
  mesh.scale.set(r, len, r);
}

function buildPlayer(kitCol, shortCol, skinCol, hairCol, sockCol) {
  const grp = new THREE.Group();
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const kit = mat(kitCol);
  const shorts = mat(shortCol);
  const skin = mat(skinCol);
  const hair = mat(hairCol);
  const sock = mat(sockCol);
  const boot = mat(0x1a1a20);

  const add = (geo, material) => {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    grp.add(m);
    return m;
  };

  const parts = {
    thighL: add(LIMB_GEO, skin), thighR: add(LIMB_GEO, skin),
    shinL: add(LIMB_GEO, sock), shinR: add(LIMB_GEO, sock),
    footL: add(LIMB_GEO, boot), footR: add(LIMB_GEO, boot),
    kneeL: add(JOINT_GEO, skin), kneeR: add(JOINT_GEO, skin),
    hips: add(LIMB_GEO, shorts),
    torso: add(LIMB_GEO, kit),
    armL: add(LIMB_GEO, kit), armR: add(LIMB_GEO, kit),
    foreL: add(LIMB_GEO, skin), foreR: add(LIMB_GEO, skin),
    handL: add(JOINT_GEO, skin), handR: add(JOINT_GEO, skin),
    shoulder: add(JOINT_GEO, kit),
    neck: add(LIMB_GEO, skin),
    head: add(JOINT_GEO, skin),
    hair: add(JOINT_GEO, hair),
  };
  return { grp, parts };
}

function posePlayer(rig, p, phase, fine, celebT = 0) {
  const { parts } = rig;
  if (p.diveT > 0) { poseDive(rig, p, fine); return; }
  rig.grp.rotation.set(0, 0, 0);
  const cos = p.dirX;
  const sin = p.dirY;
  const sp = Math.hypot(p.vx, p.vy);
  const gait = Math.min(1, sp / 6.5);
  const lean = Math.min(0.12, sp / 70);
  const cheer = p.celebrating ? 1 : 0;
  // little hop while celebrating, so the whole body lifts off the turf
  const hop = cheer ? Math.abs(Math.sin(celebT * 6.5)) * 0.22 : 0;
  const wx = (f, l) => p.x + f * cos - l * sin;
  const wy = (f, l) => p.y + f * sin + l * cos;

  const leg = (side, ph, thigh, shin, knee, foot) => {
    const s = Math.sin(ph);
    const hipA = s * 0.62 * gait;
    const kneeA = hipA - (Math.max(0, -s) * 1.15 + 0.12) * gait - 0.08;
    const lat = side * 0.11;
    const hipF = lean;
    const hipZ = HIP_Z + hop;
    const kneeF = hipF + Math.sin(hipA) * THIGH;
    const kneeZ = hipZ - Math.cos(hipA) * THIGH;
    const ankF = kneeF + Math.sin(kneeA) * SHIN;
    const ankZ = Math.max(0.07, kneeZ - Math.cos(kneeA) * SHIN);
    segment(thigh, wx(hipF, lat), wy(hipF, lat), hipZ, wx(kneeF, lat), wy(kneeF, lat), kneeZ, 0.1);
    segment(shin, wx(kneeF, lat), wy(kneeF, lat), kneeZ, wx(ankF, lat), wy(ankF, lat), ankZ, 0.075);
    knee.position.set(wx(kneeF, lat), wy(kneeF, lat), kneeZ);
    knee.scale.setScalar(0.085);
    segment(foot, wx(ankF, lat), wy(ankF, lat), ankZ,
      wx(ankF + 0.17, lat), wy(ankF + 0.17, lat), 0.04, 0.06);
    foot.visible = fine;
  };

  const arm = (side, ph, upper, fore, hand) => {
    const s = Math.sin(ph);
    // celebrating: both arms swing up and out overhead instead of pumping
    const swing = cheer ? Math.sin(celebT * 5 + side) * 0.25 : 0;
    const shA = cheer ? -2.35 + swing : s * 0.5 * gait;
    const elA = cheer ? -2.6 + swing * 0.6 : shA + 0.75 * gait + 0.25;
    const lat = side * 0.2;
    const out = side * (cheer ? 0.34 : 0.235);
    const shF = lean * 0.5;
    const shZ = SHOULDER_Z + hop;
    const elF = shF + Math.sin(shA) * UPPER_ARM;
    const elZ = shZ - Math.cos(shA) * UPPER_ARM;
    const haF = elF + Math.sin(elA) * FOREARM;
    const haZ = elZ - Math.cos(elA) * FOREARM;
    segment(upper, wx(shF, lat), wy(shF, lat), shZ, wx(elF, out), wy(elF, out), elZ, 0.072);
    segment(fore, wx(elF, out), wy(elF, out), elZ, wx(haF, out), wy(haF, out), haZ, 0.05);
    hand.position.set(wx(haF, out), wy(haF, out), haZ - 0.02);
    hand.scale.setScalar(0.058);
    hand.visible = fine;
  };

  leg(-1, phase + Math.PI, parts.thighL, parts.shinL, parts.kneeL, parts.footL);
  leg(1, phase, parts.thighR, parts.shinR, parts.kneeR, parts.footR);
  arm(-1, phase, parts.armL, parts.foreL, parts.handL);
  arm(1, phase + Math.PI, parts.armR, parts.foreR, parts.handR);

  segment(parts.hips, wx(lean, 0), wy(lean, 0), HIP_Z - 0.05 + hop,
    wx(lean, 0), wy(lean, 0), HIP_Z + 0.24 + hop, 0.185);
  segment(parts.torso, wx(lean, 0), wy(lean, 0), HIP_Z + 0.18 + hop,
    wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + 0.04 + hop, 0.2);
  parts.shoulder.position.set(wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + hop);
  parts.shoulder.scale.set(0.21, 0.14, 0.21);
  segment(parts.neck, wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + hop,
    wx(lean * 1.6, 0), wy(lean * 1.6, 0), SHOULDER_Z + 0.16 + hop, 0.055);
  const hz = SHOULDER_Z + 0.29 + hop;
  parts.head.position.set(wx(lean * 1.6, 0), wy(lean * 1.6, 0), hz);
  parts.head.scale.setScalar(0.115);
  parts.hair.position.set(wx(lean * 1.6 - 0.02, 0), wy(lean * 1.6 - 0.02, 0), hz + 0.05);
  parts.hair.scale.set(0.112, 0.112, 0.085);
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

  segment(parts.hips, hx, hy, hz, hx, hy + s * 0.1, hz + 0.2 * (1 - lay), 0.185);
  segment(parts.torso, hx, hy, hz, sx2, sy2, sz2, 0.2);
  parts.shoulder.position.set(sx2, sy2, sz2);
  parts.shoulder.scale.set(0.21, 0.14, 0.21);

  // arms thrown out towards the ball
  for (const [u, f, hnd, off] of [
    [parts.armL, parts.foreL, parts.handL, 0.16],
    [parts.armR, parts.foreR, parts.handR, -0.16],
  ]) {
    const e = at(0.5 * lay + reach * 0.5, sz2 + off * 0.5 + 0.05);
    const h = at(0.5 * lay + reach, sz2 + off + 0.1);
    segment(u, sx2, sy2, sz2, e[0], e[1], e[2], 0.072);
    segment(f, e[0], e[1], e[2], h[0], h[1], h[2], 0.05);
    hnd.position.set(h[0], h[1], h[2]);
    hnd.scale.setScalar(0.058);
    hnd.visible = fine;
  }

  // legs trail behind the dive
  for (const [th, sh, kn, ft, off] of [
    [parts.thighL, parts.shinL, parts.kneeL, parts.footL, 0.11],
    [parts.thighR, parts.shinR, parts.kneeR, parts.footR, -0.11],
  ]) {
    const k = at(-0.15 * lay - 0.42, bodyZ - 0.12 + off * 0.4);
    const a = at(-0.15 * lay - 0.85, bodyZ - 0.24 + off * 0.5);
    segment(th, hx, hy + s * off * 0.5, hz, k[0], k[1], k[2], 0.1);
    segment(sh, k[0], k[1], k[2], a[0], a[1], a[2], 0.075);
    kn.position.set(k[0], k[1], k[2]);
    kn.scale.setScalar(0.085);
    segment(ft, a[0], a[1], a[2], a[0], a[1] - s * 0.16, a[2] - 0.03, 0.06);
    ft.visible = fine;
  }

  const nz = sz2 + 0.14;
  segment(parts.neck, sx2, sy2, sz2, sx2, sy2 + s * 0.1, nz, 0.055);
  parts.head.position.set(sx2, sy2 + s * 0.16, nz + 0.05);
  parts.head.scale.setScalar(0.115);
  parts.hair.position.set(sx2, sy2 + s * 0.18, nz + 0.1);
  parts.hair.scale.set(0.112, 0.112, 0.085);
  parts.hair.visible = fine;
}

/* ------------------------------- main ------------------------------ */
export function createRenderer(canvas, match, quality) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: quality !== 'low', powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(quality === 'low' ? 1.25 : 2, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = quality !== 'low';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b14);
  scene.fog = new THREE.Fog(0x070b14, 120, 260);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 600);
  camera.up.set(0, 0, 1);

  scene.add(new THREE.HemisphereLight(0xbcd6ff, 0x24402c, 1.05));
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.5);
  sun.position.set(-46, -30, 88);
  sun.target.position.set(PITCH.w / 2, CY, 0);
  scene.add(sun, sun.target);
  if (renderer.shadowMap.enabled) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera;
    c.left = -80; c.right = 80; c.top = 70; c.bottom = -70; c.near = 20; c.far = 220;
  }

  // ground + pitch
  const surround = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w + MARGIN * 2 + 60, PITCH.h + MARGIN * 2 + 60),
    new THREE.MeshLambertMaterial({ color: 0x16341f }));
  surround.position.set(PITCH.w / 2, CY, -0.02);
  surround.receiveShadow = true;
  scene.add(surround);

  const turf = new THREE.Mesh(
    new THREE.PlaneGeometry(PITCH.w, PITCH.h),
    new THREE.MeshLambertMaterial({ map: pitchTexture() }));
  turf.position.set(PITCH.w / 2, CY, 0);
  turf.receiveShadow = true;
  scene.add(turf);

  // goals
  const postMat = new THREE.MeshLambertMaterial({ color: 0xf2f4fa });
  const netMat = new THREE.MeshLambertMaterial({
    color: 0xdfe8f5, transparent: true, opacity: 0.14, side: THREE.DoubleSide,
  });
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
    const net = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_HALF * 2, GOAL_H), netMat);
    net.position.set(gx + inw * 1.9, CY, GOAL_H / 2);
    net.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    scene.add(net);
  }

  // stands
  const standMat = new THREE.MeshLambertMaterial({ color: 0x2b3244 });
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x141822 });
  const banks = [
    { rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: PITCH.w + 44 },
    { rot: Math.PI / 2, cx: -MARGIN, cy: CY, len: PITCH.h + 36 },
    { rot: -Math.PI / 2, cx: PITCH.w + MARGIN, cy: CY, len: PITCH.h + 36 },
  ];
  for (const bk of banks) {
    const g = new THREE.Group();
    g.position.set(bk.cx, bk.cy, 0);
    g.rotation.z = bk.rot;

    const rake = new THREE.Mesh(new THREE.BoxGeometry(bk.len, STAND_DEPTH, 0.6), standMat);
    rake.position.set(0, STAND_DEPTH / 2, (STAND_FRONT_Z + STAND_BACK_Z) / 2);
    rake.rotation.x = -Math.atan2(STAND_BACK_Z - STAND_FRONT_Z, STAND_DEPTH);
    rake.receiveShadow = true;
    g.add(rake);

    const front = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.5, STAND_FRONT_Z), standMat);
    front.position.set(0, 0, STAND_FRONT_Z / 2);
    g.add(front);

    const back = new THREE.Mesh(new THREE.BoxGeometry(bk.len, 0.8, ROOF_Z), roofMat);
    back.position.set(0, STAND_DEPTH, ROOF_Z / 2);
    g.add(back);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(bk.len, STAND_DEPTH * 0.62, 0.5), roofMat);
    roof.position.set(0, STAND_DEPTH * 0.7, ROOF_Z);
    g.add(roof);
    scene.add(g);
  }

  // crowd — one instanced mesh, so thousands of seats cost a single draw call
  const rand = mulberry(97531);
  const rows = quality === 'low' ? 8 : 14;
  const step = quality === 'low' ? 1.5 : 0.95;
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
        if (rand() < 0.1) continue;
        const j = (rand() - 0.5) * step * 0.4;
        let x;
        let y;
        if (bd.kind === 'far') { x = u + j; y = PITCH.h + depth; }
        else if (bd.kind === 'left') { x = -depth; y = u + j; }
        else { x = PITCH.w + depth; y = u + j; }
        seats.push({ x, y, z, c: CROWD_COLS[(rand() * CROWD_COLS.length) | 0], s: 0.24 + rand() * 0.12 });
      }
    }
  }
  const crowd = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    seats.length);
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  seats.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.scale.set(s.s, s.s * 0.7, s.s * 1.5);
    dummy.updateMatrix();
    crowd.setMatrixAt(i, dummy.matrix);
    crowd.setColorAt(i, col.setHex(s.c));
  });
  crowd.instanceMatrix.needsUpdate = true;
  scene.add(crowd);

  // players
  const kitHome = new THREE.Color(hexOf(match.teams[0].colors[0]));
  const kitAway = pickAwayKit(match);
  const rigs = new Map();
  for (let t = 0; t < 2; t++) {
    for (const p of match.teams[t].players) {
      let h = 0;
      for (const ch of p.ref.id) h = (h * 31 + ch.charCodeAt(0)) | 0;
      h = Math.abs(h);
      const isGK = p.role === 'GK';
      const base = isGK ? new THREE.Color(GK_KIT) : (t === 0 ? kitHome : kitAway);
      const shorts = base.clone().multiplyScalar(0.6);
      const rig = buildPlayer(base, shorts, SKINS[h % SKINS.length],
        HAIRS[(h >> 3) % HAIRS.length], base.clone().multiplyScalar(0.8));
      scene.add(rig.grp);
      rigs.set(p, rig);
    }
  }

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 16, 12),
    new THREE.MeshLambertMaterial({ color: 0xffffff }));
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

  return {
    /** Live three.js counters — draw calls, triangles, memory. Handy for profiling. */
    get info() { return renderer.info; },
    get engine() { return `three.js r${THREE.REVISION}`; },
    resize(w, h) {
      renderer.setSize(w, h, false);
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
          const rig = rigs.get(p);
          if (!rig) continue;
          p._phase = (p._phase || 0) + Math.hypot(p.vx, p.vy) * dt * 2.4;
          posePlayer(rig, p, p._phase, fine, m.celebT || 0);
        }
      }
      ball.position.set(m.ball.x, m.ball.y, (m.ball.z || 0) + 0.19);

      const acts = m.actives || (m.active ? [m.active] : []);
      markers.forEach((mk, i) => {
        const p = acts[i];
        mk.visible = !!p;
        if (p) mk.position.set(p.x, p.y, 2.6);
      });

      renderer.render(scene, camera);
    },
    dispose() { renderer.dispose(); },
  };
}
