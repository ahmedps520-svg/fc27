/**
 * Celebration sheet (v110): every goal celebration in game/celebrations.js,
 * on both figures — the built-in one (rig.js, Low/Medium) and the scanned
 * model (playerModel.js, High/Ultra) — at the moment each is best seen, as a
 * contact sheet to look at instead of describing.
 *
 *   node tools/celeb-shots.mjs [--out tests/tmp/celeb]
 *
 * Writes <out>/rig.png and <out>/model.png: a 4×4 grid, one cell a celebration.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'tests/tmp/celeb');
mkdirSync(OUT, { recursive: true });

const PAGE = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#1d2a22}canvas{display:block}</style>
<script type="importmap">{ "imports": { "three": "/js/vendor/three.module.js" } }</script>
<script type="module">
import * as THREE from '/js/vendor/three.module.js';
import * as rig from '/js/game/rig.js';
import { loadPlayerModel, makeRig, poseRig, setCelebClock } from '/js/game/playerModel.js';
import { CELEBRATIONS } from '/js/game/celebrations.js';
const W = 320, H = 300;
const ren = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); ren.setSize(W, H); document.body.appendChild(ren.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#9fc2df');
scene.add(new THREE.HemisphereLight(0xffffff, 0x335533, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(6, -8, 12); scene.add(sun);
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: '#3f8a4a' })));
const cam = new THREE.PerspectiveCamera(34, W / H, 0.1, 100); cam.up.set(0, 0, 1);
// three-quarter view from in front and to his left: he faces -y (towards the camera side)
cam.position.set(3.2, -5.2, 1.7); cam.lookAt(0, 0, 0.95);
// the moment each is best seen (seconds into the goal, and whether still running in)
const AT = { corner: [2, false], kneeslide: [1.4, true], airplane: [1.5, true], skypoint: [2, false], shush: [2, false], heart: [2, false], salute: [2, false], icecold: [2, false], spinjump: [0.33, false], fistpump: [2.2, false], bow: [1.2, false], robot: [2, false], cradle: [2, false], cupear: [2, false], bellyslide: [1.6, true], backflip: [0.55, false] };
const p0 = () => ({ x: 0, y: 0, vx: 0, vy: 0, dirX: 0.35, dirY: -1, _phase: 0, celebrating: true, stumble: 0, holdT: 0, ref: { id: 'x', name: 'x', stats: {} } });
window.__shoot = async (which) => {
  const shots = [];
  let fig = null; let model = null;
  if (which === 'rig') { fig = rig.buildPlayer(new THREE.Color('#d33a3a'), new THREE.Color('#f4f4f4'), new THREE.Color('#c58c62'), new THREE.Color('#2b1b12'), new THREE.Color('#d33a3a'), { height: 1, girth: 1, shoulders: 1 }); scene.add(fig.grp); }
  else { const m = await loadPlayerModel(); if (!m) return null; model = makeRig(m, { kit: { shirt: new THREE.Color('#d33a3a'), shorts: new THREE.Color('#f4f4f4'), socks: new THREE.Color('#d33a3a') }, ref: { id: 'x', name: 'x', stats: {} }, index: 3, isGK: false }); scene.add(model.root); }
  for (const c of CELEBRATIONS) {
    const [t, moving] = AT[c.id];
    const p = p0(); p.celebKind = c.id; if (moving) { p.vx = 0.35 * 5; p.vy = -5; }
    const d = Math.hypot(p.dirX, p.dirY); p.dirX /= d; p.dirY /= d;
    if (fig) rig.posePlayer(fig, p, 0, true, t);
    else { setCelebClock(t); for (let i = 0; i < 20; i++) poseRig(model, p, 1 / 30); }
    ren.render(scene, cam);
    shots.push({ id: c.name, png: ren.domElement.toDataURL('image/png') });
  }
  return shots;
};
window.__ready = true;
</script>`;

const root = process.cwd();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/sheet.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE); }
  try {
    const body = readFileSync(join(root, u));
    res.writeHead(200, { 'Content-Type': extname(u) === '.js' ? 'text/javascript' : 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const which of ['rig', 'model']) {
  const page = await browser.newPage({ viewport: { width: 320, height: 300 } });
  page.on('pageerror', (e) => console.log(which, 'error', e.message));
  await page.goto(`${base}/sheet.html`); await page.waitForFunction(() => window.__ready);
  const shots = await page.evaluate((w) => window.__shoot(w), which);
  await page.close();
  if (!shots) { console.log(`${which}: model did not load`); continue; }
  const sheet = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  await sheet.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(4,320px);font:600 13px system-ui">${shots.map((s) => `<div style="position:relative"><img src="${s.png}" style="width:320px;height:300px;display:block"><span style="position:absolute;left:8px;top:6px;color:#fff;text-shadow:0 1px 2px #000">${s.id}</span></div>`).join('')}</body>`);
  await sheet.screenshot({ path: join(OUT, `${which}.png`), clip: { x: 0, y: 0, width: 1280, height: 1200 } });
  await sheet.close();
}
await browser.close(); server.close();
console.log(`celebration sheets: ${OUT}/rig.png, ${OUT}/model.png`);
