/**
 * The match on WebGPU — beta.
 *
 * The same match, the same stadium definitions and the same atmosphere table,
 * drawn by three.js r170's WebGPURenderer (its WebGL2 backend where the
 * browser has no WebGPU). This is the core of the scene and nothing more:
 * the pitch and its markings, the goals, the bowl from the stadium def,
 * a static crowd, capsule figures for the players, the ball, lights with
 * shadows, fog and ACES tone mapping. None of the WebGL2 renderer's custom
 * passes exist here yet — no grading, god rays, haze, wet reflection, boot
 * marks, tifo, wonders, scanned models. Those are GLSL, and porting them to
 * node materials is the job this module is the first step of. Opt in from
 * Settings → Renderer → WebGPU (beta); Auto keeps the WebGL2 renderer for
 * matches until this one reaches parity.
 *
 * Same API as renderGL.createRenderer, but async (the GPU device is).
 */
import { loadWebGPU } from './gpu.js';
import { PITCH, GOAL_HALF } from './sim.js';

const CY = PITCH.h / 2;
const MARGIN = 6;
const GOAL_H = 2.44;
const hexOf = (c) => parseInt(String(c).replace('#', ''), 16);

/** The look of the day, cut down from renderGL's lightingFor. */
function lightingFor(atmo) {
  const time = atmo?.time || 'night';
  const rain = atmo?.weather === 'rain';
  if (time === 'day') return { hemi: [0xbfd8ff, 0x3a5a3a, 1.5], sun: [0xfff2dc, 2.4, [-30, -45, 120]], fog: [rain ? 0x6f7887 : 0xbfd4ee, rain ? 0.0046 : 0.0018], flood: 0, bg: rain ? 0x5f6a78 : 0x9fc3ee, exposure: 1.0 };
  if (time === 'dusk') return { hemi: [0xf0a070, 0x2a3324, 1.3], sun: [0xffa860, 1.8, [-120, -30, 30]], fog: [rain ? 0x3a3038 : 0x4a2f3a, rain ? 0.0045 : 0.0028], flood: 0.8, bg: 0x5a3a4a, exposure: 1.08 };
  return { hemi: [0x9fc0ff, 0x1c3324, 1.35], sun: [0xdfe8ff, 0.85, [-46, -30, 88]], fog: [rain ? 0x0a1018 : 0x070d18, rain ? 0.0062 : 0.0042], flood: 1, bg: 0x070d18, exposure: 1.14 };
}

/** The mown pitch and its markings, painted once. */
function pitchCanvas(pattern) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = Math.round(2048 * (PITCH.h + MARGIN * 2) / (PITCH.w + MARGIN * 2));
  const g = c.getContext('2d');
  const sx = c.width / (PITCH.w + MARGIN * 2); const sy = c.height / (PITCH.h + MARGIN * 2);
  g.fillStyle = '#3f8f3a'; g.fillRect(0, 0, c.width, c.height);
  // the mow
  const n = pattern === 'checks' ? 12 : 14;
  g.fillStyle = 'rgba(255,255,255,.07)';
  if (pattern === 'rings') {
    for (let r = 0; r < 12; r++) { g.beginPath(); g.ellipse(c.width / 2, c.height / 2, (r + 1) * c.width / 24, (r + 1) * c.height / 24, 0, 0, Math.PI * 2); if (r % 2) g.fill(); }
  } else if (pattern !== 'plain') {
    for (let i = 0; i < n; i++) if (i % 2) g.fillRect((c.width / n) * i, 0, c.width / n, c.height);
    if (pattern === 'checks') for (let j = 0; j < 8; j++) if (j % 2) g.fillRect(0, (c.height / 8) * j, c.width, c.height / 8);
    if (pattern === 'diagonal') { g.save(); g.translate(c.width / 2, c.height / 2); g.rotate(0.35); for (let i = -12; i < 12; i++) if (i % 2) g.fillRect(i * 140, -c.height, 140, c.height * 2); g.restore(); }
  }
  // markings, in metres
  const X = (m) => (m + MARGIN) * sx; const Y = (m) => (m + MARGIN) * sy;
  g.strokeStyle = '#f2f6f2'; g.lineWidth = 3;
  g.strokeRect(X(0), Y(0), PITCH.w * sx, PITCH.h * sy);
  g.beginPath(); g.moveTo(X(PITCH.w / 2), Y(0)); g.lineTo(X(PITCH.w / 2), Y(PITCH.h)); g.stroke();
  g.beginPath(); g.ellipse(X(PITCH.w / 2), Y(CY), 9.15 * sx, 9.15 * sy, 0, 0, Math.PI * 2); g.stroke();
  for (const end of [0, 1]) {
    const x0 = end ? PITCH.w : 0; const d = end ? -1 : 1;
    g.strokeRect(Math.min(X(x0), X(x0 + d * 16.5)), Y(CY - 20.15), 16.5 * sx, 40.3 * sy);
    g.strokeRect(Math.min(X(x0), X(x0 + d * 5.5)), Y(CY - 9.16), 5.5 * sx, 18.32 * sy);
    g.beginPath(); g.arc(X(x0 + d * 11), Y(CY), 2 * sx / 3, 0, Math.PI * 2); g.fillStyle = '#f2f6f2'; g.fill();
  }
  return c;
}

export async function createRenderer(canvas, match, quality = 'high', _models = false) {
  const T = await loadWebGPU();
  const renderer = new T.WebGPURenderer({ canvas, antialias: true });
  await renderer.init();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'low' || quality === 'min' ? 1 : 2));
  renderer.shadowMap.enabled = quality !== 'min';
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const atmo = match.venue?.atmo || { time: 'night', weather: 'clear' };
  const LIGHT = lightingFor(atmo);
  renderer.toneMappingExposure = LIGHT.exposure;

  const scene = new T.Scene();
  scene.background = new T.Color(LIGHT.bg);
  scene.fog = new T.FogExp2(LIGHT.fog[0], LIGHT.fog[1]);
  const camera = new T.PerspectiveCamera(48, 16 / 9, 0.5, 900);
  camera.up.set(0, 0, 1);

  scene.add(new T.HemisphereLight(LIGHT.hemi[0], LIGHT.hemi[1], LIGHT.hemi[2]));
  const sun = new T.DirectionalLight(LIGHT.sun[0], LIGHT.sun[1]);
  sun.position.set(...LIGHT.sun[2]);
  sun.target.position.set(PITCH.w / 2, CY, 0);
  sun.castShadow = renderer.shadowMap.enabled;
  Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 70, bottom: -70, near: 10, far: 400 });
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun, sun.target);
  const rim = new T.DirectionalLight(0xdfe9ff, LIGHT.flood > 0 ? 1.0 : 0.5);
  rim.position.set(PITCH.w / 2, PITCH.h + 70, 38); rim.target.position.set(PITCH.w / 2, CY, 1);
  scene.add(rim, rim.target);

  // ---- the pitch
  const def = match.venue?.stadium || { size: 0.6, tiers: 1, roof: 'cantilever', seats: ['#1c3f6e', '#14335c'], facade: '#2a3142', pattern: 'stripes', fill: 0.8 };
  const turfTex = new T.CanvasTexture(pitchCanvas(def.pattern || 'stripes'));
  turfTex.colorSpace = T.SRGBColorSpace; turfTex.anisotropy = 8;
  const turf = new T.Mesh(new T.PlaneGeometry(PITCH.w + MARGIN * 2, PITCH.h + MARGIN * 2), new T.MeshStandardMaterial({ map: turfTex, roughness: 0.92 }));
  turf.position.set(PITCH.w / 2, CY, 0);
  turf.receiveShadow = true;
  scene.add(turf);
  const ground = new T.Mesh(new T.PlaneGeometry(1400, 1400), new T.MeshStandardMaterial({ color: 0x2a3140, roughness: 1 }));
  ground.position.set(PITCH.w / 2, CY, -0.05);
  scene.add(ground);

  // ---- goals
  const postMat = new T.MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.4 });
  const netMat = new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: T.DoubleSide, roughness: 1 });
  for (const end of [0, 1]) {
    const x = end ? PITCH.w : 0; const d = end ? 1 : -1;
    for (const s of [-1, 1]) {
      const post = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, GOAL_H, 10), postMat);
      post.rotation.x = Math.PI / 2; post.position.set(x, CY + s * GOAL_HALF, GOAL_H / 2); post.castShadow = true;
      scene.add(post);
    }
    const bar = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, GOAL_HALF * 2, 10), postMat);
    bar.position.set(x, CY, GOAL_H); scene.add(bar);
    const net = new T.Mesh(new T.BoxGeometry(2, GOAL_HALF * 2, GOAL_H), netMat);
    net.position.set(x + d * 1, CY, GOAL_H / 2); scene.add(net);
  }

  // ---- the bowl, from the definition (renderGL's specFromDef, cut down)
  const scale = Math.max(0, Math.min(1, def.size ?? 0.6));
  const SD = 11 + scale * 21; const SBZ = 7 + scale * 16;
  const tiers = Math.min(3, Math.max(1, def.tiers | 0)) || 1;
  const gapZ = 3 * (tiers - 1);
  const facade = new T.Color(hexOf(def.facade || '#2a3142'));
  const standMat = new T.MeshStandardMaterial({ color: facade, roughness: 0.92 });
  const roofMat = new T.MeshStandardMaterial({ color: facade.clone().multiplyScalar(0.45), roughness: 0.85, metalness: 0.25 });
  const seatCols = (def.seats || ['#1c3f6e', '#14335c']).map((h) => new T.Color(hexOf(h)));
  const banks = [
    { rot: 0, cx: PITCH.w / 2, cy: PITCH.h + MARGIN, len: PITCH.w + 44 },
    { rot: Math.PI / 2, cx: -MARGIN, cy: CY, len: PITCH.h + 36 },
    { rot: -Math.PI / 2, cx: PITCH.w + MARGIN, cy: CY, len: PITCH.h + 36 },
  ];
  const ROWS = quality === 'low' || quality === 'min' ? 8 : 14;
  const seats = [];
  for (const bk of banks) {
    const g = new T.Group(); g.position.set(bk.cx, bk.cy, 0); g.rotation.z = bk.rot;
    const stepD = SD / ROWS; const stepH = (SBZ - 1.9) / ROWS;
    for (let r = 0; r < ROWS; r++) {
      const t = (r + 0.5) / ROWS;
      const up = tiers === 3 ? (t >= 0.72 ? 2 : t >= 0.4 ? 1 : 0) : tiers === 2 && t >= 0.55 ? 1 : 0;
      const depth = t * SD + up * 2.2; const z = 1.9 + t * (SBZ - 1.9) + up * 3;
      const step = new T.Mesh(new T.BoxGeometry(bk.len, stepD, stepH + 0.5), standMat);
      step.position.set(0, depth, z - stepH / 2); step.receiveShadow = true; g.add(step);
      for (let i = 0; i < bk.len / 0.6; i++) seats.push({ g, x: -bk.len / 2 + i * 0.6 + 0.3, y: depth - stepD * 0.2, z: z + 0.25, col: r % 3 === 0 ? seatCols[0] : seatCols[1] });
    }
    const back = new T.Mesh(new T.BoxGeometry(bk.len, 0.8, SBZ + 1.5 + gapZ), roofMat);
    back.position.set(0, SD + 2.2 * (tiers - 1), (SBZ + 1.5 + gapZ) / 2); g.add(back);
    if (def.roof && def.roof !== 'none') {
      const full = def.roof === 'ring' || def.roof === 'dome';
      const cover = full ? 0.86 : 0.68;
      const roof = new T.Mesh(new T.BoxGeometry(bk.len, SD * cover, 0.55), roofMat);
      roof.position.set(0, SD + 2.2 * (tiers - 1) - SD * cover / 2, SBZ + 4.5 + gapZ); roof.castShadow = true; g.add(roof);
    }
    scene.add(g);
  }
  // ---- the crowd: one instanced box per seat, in the seat colour or a person (static in the beta)
  const fill = Math.min(0.98, def.fill ?? 0.8);
  const people = seats.filter(() => Math.random() < fill);
  const crowd = new T.InstancedMesh(new T.BoxGeometry(0.36, 0.28, 0.62), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }), people.length);
  const d = new T.Object3D(); const col = new T.Color();
  const palette = [0xe8e8e8, 0x1b1b22, 0x2a4a8a, 0xb52020, 0x2f8f4a, 0xd0a020, 0x804080, seatCols[0].getHex(), seatCols[0].getHex()];
  people.forEach((s, i) => {
    const w = new T.Vector3(s.x, s.y, s.z).applyMatrix4(s.g.matrixWorld.identity().makeRotationZ(s.g.rotation.z).setPosition(s.g.position));
    d.position.copy(w); d.rotation.set(0, 0, s.g.rotation.z); d.scale.setScalar(0.9 + Math.random() * 0.25); d.updateMatrix();
    crowd.setMatrixAt(i, d.matrix);
    crowd.setColorAt(i, col.setHex(palette[(Math.random() * palette.length) | 0]));
  });
  crowd.instanceMatrix.needsUpdate = true;
  scene.add(crowd);
  // the empty seats
  const empty = seats.filter((s) => !people.includes(s));
  const seatMesh = new T.InstancedMesh(new T.BoxGeometry(0.5, 0.45, 0.4), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), empty.length);
  empty.forEach((s, i) => {
    const w = new T.Vector3(s.x, s.y, s.z - 0.25).applyMatrix4(s.g.matrixWorld.identity().makeRotationZ(s.g.rotation.z).setPosition(s.g.position));
    d.position.copy(w); d.rotation.set(0, 0, s.g.rotation.z); d.scale.setScalar(1); d.updateMatrix();
    seatMesh.setMatrixAt(i, d.matrix); seatMesh.setColorAt(i, s.col);
  });
  seatMesh.instanceMatrix.needsUpdate = true;
  scene.add(seatMesh);

  // ---- floodlights: four pylons with lamp heads that glow at night
  if (LIGHT.flood > 0) {
    const lampMat = new T.MeshStandardMaterial({ color: 0x222831, emissive: 0xfff2d6, emissiveIntensity: 2.2 * LIGHT.flood });
    for (const [x, y] of [[-MARGIN - SD - 4, -MARGIN - 4], [PITCH.w + MARGIN + SD + 4, -MARGIN - 4], [-MARGIN - SD - 4, PITCH.h + MARGIN + SD + 4], [PITCH.w + MARGIN + SD + 4, PITCH.h + MARGIN + SD + 4]]) {
      const mast = new T.Mesh(new T.CylinderGeometry(0.5, 0.8, 40, 8), roofMat); mast.rotation.x = Math.PI / 2; mast.position.set(x, y, 20); scene.add(mast);
      const head = new T.Mesh(new T.BoxGeometry(6, 1, 4), lampMat); head.position.set(x, y, 40); head.lookAt(PITCH.w / 2, CY, 0); scene.add(head);
      const spot = new T.SpotLight(0xfff2d6, 900 * LIGHT.flood, 300, Math.PI / 3, 0.9, 1.2); spot.position.set(x, y, 40); spot.target.position.set(PITCH.w / 2, CY, 0); scene.add(spot, spot.target);
    }
  }

  // ---- players: capsule figures, posed from the sim
  const figures = [];
  const skinMat = new T.MeshStandardMaterial({ color: 0xd8a888, roughness: 0.8 });
  for (let t = 0; t < 2; t++) {
    const kit = new T.Color(hexOf(match.teams[t].colors[0]));
    for (const p of match.teams[t].players) {
      const grp = new T.Group();
      const isGK = p.role === 'GK';
      const shirt = new T.MeshStandardMaterial({ color: isGK ? 0xd6d84a : kit, roughness: 0.6 });
      const body = new T.Mesh(new T.CapsuleGeometry(0.22, 0.5, 4, 10), shirt); body.rotation.x = Math.PI / 2; body.position.z = 1.1; body.castShadow = true;
      const head = new T.Mesh(new T.SphereGeometry(0.13, 12, 10), skinMat); head.position.z = 1.62;
      const legL = new T.Mesh(new T.CapsuleGeometry(0.09, 0.5, 3, 8), new T.MeshStandardMaterial({ color: kit.clone().multiplyScalar(0.6) })); legL.rotation.x = Math.PI / 2; legL.position.set(0, -0.12, 0.42); legL.castShadow = true;
      const legR = legL.clone(); legR.position.y = 0.12;
      grp.add(body, head, legL, legR);
      scene.add(grp);
      figures.push({ p, grp, legL, legR, phase: Math.random() * 6 });
    }
  }
  const ball = new T.Mesh(new T.SphereGeometry(0.22, 16, 12), new T.MeshStandardMaterial({ color: 0xf6f6f6, roughness: 0.5 }));
  ball.castShadow = true; scene.add(ball);

  let w = 1, h = 1;
  const api = {
    ready: Promise.resolve(),
    get info() { return renderer.info; },
    get engine() { return `three.js r${T.REVISION} ${renderer.backend?.isWebGPUBackend ? 'WebGPU' : 'WebGPU (WebGL2 backend)'}`; },
    resize(cw, ch) { w = cw; h = ch; renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix(); },
    setReplay() {}, fireworks() {}, tifo() {}, setGrade() {},
    async snapshot() { return null; },
    render(m, cam, dt) {
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      camera.fov = cam.hfov / Math.max(1, camera.aspect) * 1.45;
      camera.updateProjectionMatrix();
      for (const f of figures) {
        const p = f.p;
        const sp = Math.hypot(p.vx, p.vy);
        f.phase += dt * (2 + sp * 1.6);
        f.grp.position.set(p.x, p.y, p.diveT > 0 ? 0.3 : 0);
        f.grp.rotation.set(0, 0, Math.atan2(p.dirY, p.dirX) - Math.PI / 2);
        const swing = Math.sin(f.phase) * Math.min(0.7, sp / 8);
        f.legL.rotation.x = Math.PI / 2 + swing; f.legR.rotation.x = Math.PI / 2 - swing;
        f.grp.rotation.x = p.diveT > 0 ? -1.2 : -Math.min(0.15, sp / 60);
      }
      const b = m.ball;
      ball.position.set(b.x, b.y, 0.22 + b.z);
      renderer.render(scene, camera);
    },
    dispose() { renderer.dispose(); turfTex.dispose(); },
  };
  return api;
}
