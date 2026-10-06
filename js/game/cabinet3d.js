/**
 * v152: the trophy cabinet in 3D (screens/trophies.js).
 *
 * A dark wooden cabinet with glass shelves and a light over each, and on the
 * shelves what you have won (cabinet.js): a two-handled cup for a league
 * title, a taller jug-handled cup for a domestic cup, a globe for the World
 * Tournament, a shield for a Custom Cup, a ball on a plinth for a personal
 * award. Every model is built here from a few primitives — nothing to
 * download. The trophies turn slowly; the camera sways a little so the metal
 * catches the light. Rendered only while the screen is open.
 */
import * as THREE from '../vendor/three.module.js';

const GOLD = { color: 0xe9c25a, metalness: 1, roughness: 0.22 };
const SILVER = { color: 0xd9dee6, metalness: 1, roughness: 0.18 };
const BRONZE = { color: 0xc58a4a, metalness: 1, roughness: 0.3 };
const PLINTH = { color: 0x1a1410, metalness: 0.1, roughness: 0.55 };

const lathe = (pts, mat) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 40), mat);

function base(group, mat, h = 0.08, r = 0.16) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 32), new THREE.MeshStandardMaterial(PLINTH));
  b.position.y = h / 2; group.add(b);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, h * 0.25, 32), mat);
  band.position.y = h * 0.7; group.add(band);
  return h;
}

const handle = (mat, r, tube, x, y, flip) => {
  const t = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 24, Math.PI * 1.2), mat);
  t.position.set(x, y, 0); t.rotation.z = flip ? Math.PI * 0.4 : Math.PI * 0.4 + Math.PI; if (flip) t.scale.x = -1;
  return t;
};

/** One trophy, standing on the origin, about `h` tall. */
export function trophyModel(kind) {
  const g = new THREE.Group();
  if (kind === 'league') {
    const m = new THREE.MeshStandardMaterial(GOLD);
    const y0 = base(g, m);
    const cup = lathe([[0.0, 0], [0.09, 0], [0.03, 0.04], [0.025, 0.14], [0.05, 0.18], [0.12, 0.26], [0.15, 0.38], [0.155, 0.46], [0.14, 0.46]], m);
    cup.position.y = y0; g.add(cup);
    g.add(handle(m, 0.07, 0.012, 0.16, y0 + 0.36, false), handle(m, 0.07, 0.012, -0.16, y0 + 0.36, true));
  } else if (kind === 'cup') {
    const m = new THREE.MeshStandardMaterial(SILVER);
    const y0 = base(g, m, 0.1, 0.13);
    const cup = lathe([[0, 0], [0.08, 0], [0.025, 0.05], [0.02, 0.2], [0.06, 0.26], [0.1, 0.4], [0.11, 0.52], [0.13, 0.56], [0.12, 0.56]], m);
    cup.position.y = y0; g.add(cup);
    // the big ear handles of a domestic cup
    g.add(handle(m, 0.1, 0.014, 0.14, y0 + 0.4, false), handle(m, 0.1, 0.014, -0.14, y0 + 0.4, true));
    const lid = lathe([[0.12, 0], [0.09, 0.04], [0.02, 0.07], [0.03, 0.1], [0, 0.11]], m);
    lid.position.y = y0 + 0.56; g.add(lid);
  } else if (kind === 'world') {
    const m = new THREE.MeshStandardMaterial(GOLD);
    const y0 = base(g, m, 0.1, 0.14);
    const stem = lathe([[0.07, 0], [0.03, 0.08], [0.035, 0.22], [0.06, 0.3], [0, 0.31]], m);
    stem.position.y = y0; g.add(stem);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 20), m);
    globe.position.y = y0 + 0.42; g.add(globe);
    for (const [rx, rz] of [[0, 0], [Math.PI / 2, 0.4], [Math.PI / 2, -0.6]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.008, 8, 48), new THREE.MeshStandardMaterial(SILVER));
      ring.position.y = y0 + 0.42; ring.rotation.set(rx, 0, rz); g.add(ring);
    }
  } else if (kind === 'custom') {
    const m = new THREE.MeshStandardMaterial(BRONZE);
    const y0 = base(g, m, 0.07, 0.14);
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.025, 6), m);
    shield.rotation.x = Math.PI / 2; shield.position.y = y0 + 0.22; g.add(shield);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 12), new THREE.MeshStandardMaterial(GOLD));
    boss.position.set(0, y0 + 0.22, 0.02); boss.scale.z = 0.5; g.add(boss);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.06, 12), m);
    post.position.y = y0 + 0.03; g.add(post);
  } else {
    const m = new THREE.MeshStandardMaterial(GOLD);
    const y0 = base(g, m, 0.14, 0.09);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), m);
    ball.position.y = y0 + 0.09; g.add(ball);
  }
  return g;
}

/** A soft warm room, for the metal to reflect. */
function envTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#fff3dc'); gr.addColorStop(0.45, '#6b5a48'); gr.addColorStop(1, '#16110d');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(255,250,235,.9)'; x.fillRect(20 + i * 50, 14, 22, 8); }
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Open the cabinet on a canvas. `trophies` is cabinet.js's list (newest
 * shown first). Returns { dispose }.
 */
export function openCabinet(canvas, trophies, { reduceMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0907);
  let pmrem = null;
  try { pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromEquirectangular(envTexture()).texture; } catch { pmrem = null; }

  const SHELVES = 3; const PER = 6; const W = 3.2; const SH = 0.95;
  const shown = trophies.slice(-SHELVES * PER).reverse();
  const rows = Math.max(1, Math.min(SHELVES, Math.ceil(shown.length / PER)));

  // the cabinet: a back panel, sides, and glass shelves with a light strip over each
  const wood = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.7, metalness: 0 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, rows * SH + 0.3, 0.05), wood);
  back.position.set(0, (rows * SH) / 2, -0.32); scene.add(back);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.08, rows * SH + 0.3, 0.7), wood); side.position.set(sx * (W / 2 + 0.15), (rows * SH) / 2, 0); scene.add(side); }
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fc4d6, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.2 });
  const spin = [];
  for (let r = 0; r < rows; r++) {
    const y = r * SH;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(W, 0.025, 0.6), glass);
    shelf.position.set(0, y, 0); scene.add(shelf);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(W * 0.9, 0.012, 0.03), new THREE.MeshBasicMaterial({ color: 0xfff1d0 }));
    strip.position.set(0, y + SH - 0.04, 0.22); scene.add(strip);
    const lamp = new THREE.SpotLight(0xfff0d6, 6, 3, 0.9, 0.6, 1.4);
    lamp.position.set(0, y + SH - 0.06, 0.3); lamp.target.position.set(0, y, 0); scene.add(lamp, lamp.target);
  }
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x1a120c, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(1.5, 3, 4); scene.add(key);

  shown.forEach((t, i) => {
    const r = Math.floor(i / PER); const c = i % PER; const inRow = Math.min(PER, shown.length - r * PER);
    const m = trophyModel(t.kind);
    m.position.set((c - (inRow - 1) / 2) * (W / PER), (rows - 1 - r) * SH + 0.013, 0);
    m.rotation.y = (i * 0.7) % (Math.PI * 2);
    scene.add(m); spin.push(m);
  });

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  const look = new THREE.Vector3(0, (rows * SH) / 2 - 0.1, 0);
  const size = () => {
    const w = canvas.clientWidth || 600; const h = canvas.clientHeight || 300;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // far enough back that the whole cabinet fits, wide or tall
    const fitH = (rows * SH + 0.6) / 2 / Math.tan((camera.fov * Math.PI) / 360);
    const fitW = (W + 0.8) / 2 / Math.tan((camera.fov * Math.PI) / 360) / camera.aspect;
    camera.userData.dist = Math.max(fitH, fitW);
    camera.updateProjectionMatrix();
  };
  size();
  let raf = 0; let alive = true; let t0 = performance.now();
  const frame = (now) => {
    if (!alive) return;
    const t = (now - t0) / 1000;
    if (!reduceMotion) for (const m of spin) m.rotation.y += 0.004;
    const sway = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.35;
    const d = camera.userData.dist;
    camera.position.set(sway, look.y + 0.15, d); camera.lookAt(look);
    renderer.render(scene, camera);
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  const onResize = () => { size(); if (reduceMotion) frame(performance.now()); };
  window.addEventListener('resize', onResize);
  return {
    dispose() {
      alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => mm.dispose?.()); });
      pmrem?.dispose(); renderer.dispose();
    },
  };
}
