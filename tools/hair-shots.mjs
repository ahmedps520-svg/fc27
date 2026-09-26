/**
 * Hair sheet (v124): the six portrait hair styles on the built figure
 * (rig.js, Low/Medium), without and with a beard, face-on and in profile —
 * a contact sheet to look at instead of describing.
 *
 *   node tools/hair-shots.mjs [--out tests/tmp/hair]
 *
 * Writes <out>/hair.png: 6 columns (style 0–5) × 4 rows (front, front with a
 * beard, side, side with a beard).
 */
import { chromium } from 'playwright';
import http from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'tests/tmp/hair');
mkdirSync(OUT, { recursive: true });

const PAGE = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#1d2a22}canvas{display:block}</style>
<script type="importmap">{ "imports": { "three": "/js/vendor/three.module.js" } }</script>
<script type="module">
import * as THREE from '/js/vendor/three.module.js';
import * as rig from '/js/game/rig.js';
import { loadPlayerModel, makeRig, poseRig } from '/js/game/playerModel.js';
const W = 220, H = 220;
const ren = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); ren.setSize(W, H); document.body.appendChild(ren.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#9fc2df');
scene.add(new THREE.HemisphereLight(0xffffff, 0x335533, 1.7)); const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(6, -8, 12); scene.add(sun);
const cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 50); cam.up.set(0, 0, 1);
const p0 = () => ({ x: 0, y: 0, vx: 0, vy: 0, dirX: 0, dirY: -1, _phase: 0, stumble: 0, holdT: 0, ref: { id: 'x', name: 'x', stats: {} } });
window.__shoot = async (which) => {
  const shots = [];
  const model = which === 'model' ? await loadPlayerModel() : null;
  for (const [view, beard] of [['front', false], ['side', false], ['back', false], ['backq', false]]) {
    for (let style = 0; style < 10; style++) {
      const skin = ['#e9bd95', '#8c5733', '#d5a072'][style % 3]; const hair = ['#2b1b12', '#101010', '#8d6a35'][style % 3];
      let obj; let z;
      if (model) {
        const m = makeRig(model, { kit: { shirt: new THREE.Color('#d33a3a'), shorts: new THREE.Color('#f4f4f4'), socks: new THREE.Color('#d33a3a') }, ref: { id: 'h' + style, name: 'h', stats: {}, look: { style, beard, hair, skin } }, index: 3, isGK: false });
        scene.add(m.root); obj = m.root;
        for (let i = 0; i < 12; i++) poseRig(m, p0(), 1 / 30);
        m.root.updateMatrixWorld(true);
        const hb = m.root.getObjectByName('apexHair') || m.root; const w = new THREE.Vector3(); hb.getWorldPosition(w); z = w.z - 0.02;
      } else {
      const fig = rig.buildPlayer(new THREE.Color('#d33a3a'), new THREE.Color('#f4f4f4'), new THREE.Color(['#e9bd95', '#8c5733', '#d5a072'][style % 3]), new THREE.Color(['#2b1b12', '#101010', '#8d6a35'][style % 3]), new THREE.Color('#d33a3a'), { height: 1, girth: 1, shoulders: 1 }, { hairStyle: style, beard });
      scene.add(fig.grp); obj = fig.grp;
      rig.posePlayer(fig, p0(), 0, true, 0);
      z = fig.parts.head.position.z;
      }
      if (view === 'front') cam.position.set(0.25, -1.35, z + 0.08); else if (view === 'side') cam.position.set(1.35, -0.25, z + 0.08); else if (view === 'back') cam.position.set(0.1, 1.35, z + 0.25); else cam.position.set(0.9, 0.9, z + 0.3);
      cam.lookAt(0, 0, z + 0.01);
      ren.render(scene, cam);
      shots.push({ id: style + (beard ? ' + beard' : '') + ' · ' + view, png: ren.domElement.toDataURL('image/png') });
      scene.remove(obj);
    }
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
const page = await browser.newPage({ viewport: { width: 220, height: 220 } });
page.on('pageerror', (e) => console.log('error', e.message));
await page.goto(`${base}/sheet.html`); await page.waitForFunction(() => window.__ready);
for (const which of ['rig', 'model']) {
const shots = await page.evaluate((w) => window.__shoot(w), which);
const sheet = await browser.newPage({ viewport: { width: 2200, height: 880 } });
await sheet.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(10,220px);font:600 12px system-ui">${shots.map((s) => `<div style="position:relative"><img src="${s.png}" style="width:220px;height:220px;display:block"><span style="position:absolute;left:6px;top:4px;color:#fff;text-shadow:0 1px 2px #000">${s.id}</span></div>`).join('')}</body>`);
await sheet.screenshot({ path: join(OUT, `hair-${which}.png`) });
await sheet.close();
}
await browser.close(); server.close();
console.log(`✔ ${OUT}/hair-rig.png, ${OUT}/hair-model.png`);
