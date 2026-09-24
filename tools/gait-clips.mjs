/**
 * Gait clips (v102, backlog "feel"): one built-in footballer driven through a
 * scripted run — jog, sprint, a hard turn, a backpedal, a sideways jockey —
 * recorded twice, once with the rig and stride timing at a given git revision
 * and once with the working tree, so a change to how players move can be
 * looked at side by side instead of described.
 *
 *   node tools/gait-clips.mjs [--before HEAD] [--out tests/tmp/gait]
 *
 * Writes <out>/before.webm, <out>/after.webm, and a strip of stills from each
 * (before-strip.png, after-strip.png) at the same moments.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BEFORE = arg('--before', 'HEAD');
const OUT = arg('--out', 'tests/tmp/gait');
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'rig-before.js'), execSync(`git show ${BEFORE}:js/game/rig.js`).toString()
  .replace("'../vendor/three.module.js'", "'/js/vendor/three.module.js'"));

const PAGE = (rigPath, legacy) => `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#1d2a22}canvas{display:block}
#t{position:fixed;left:12px;top:10px;font:600 15px system-ui;color:#fff;text-shadow:0 1px 2px #000}</style><div id="t"></div>
<script type="module">
import * as THREE from '/js/vendor/three.module.js';
import * as rig from '${rigPath}';
const W = 640, H = 360;
const ren = new THREE.WebGLRenderer({ antialias: true }); ren.setSize(W, H); document.body.appendChild(ren.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color('#9fc2df');
scene.add(new THREE.HemisphereLight(0xffffff, 0x335533, 1.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(20, -10, 30); scene.add(sun);
const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ color: '#3f8a4a' })); scene.add(grass);
for (let i = -20; i <= 20; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 200), new THREE.MeshBasicMaterial({ color: '#63a96c' })); l.position.set(i * 4, 0, 0.005); scene.add(l); const m = l.clone(); m.rotation.z = Math.PI / 2; m.position.set(0, i * 4, 0.005); scene.add(m); }
const cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 300); cam.up.set(0, 0, 1);
const fig = rig.buildPlayer(new THREE.Color('#d33a3a'), new THREE.Color('#f4f4f4'), new THREE.Color('#c58c62'), new THREE.Color('#2b1b12'), new THREE.Color('#d33a3a'), { height: 1, girth: 1, shoulders: 1 });
scene.add(fig.grp);
const p = { x: 0, y: 0, vx: 0, vy: 0, dirX: 1, dirY: 0, _phase: 0 };
// the script: [until t, label, speed, heading of travel (deg), facing (deg) or null = travel]
const SEG = [[2, 'jog', 3, 0, null], [4, 'sprint', 8.5, 0, null], [5.4, 'hard turn', 6.5, 'turn', null], [7.4, 'backpedal', 3, 180, 0], [9.6, 'jockey (sideways)', 2.4, 90, 180], [10.2, 'stop', 0, 90, 180]];
const T = document.getElementById('t');
let t = 0; let last = null;
window.__at = (sec) => { while (t < sec) step(1 / 60); draw(); };
function step(dt) {
  t += dt;
  const i = SEG.findIndex((s) => t < s[0]); const s = SEG[i < 0 ? SEG.length - 1 : i]; const t0 = i > 0 ? SEG[i - 1][0] : 0;
  let hd = s[3];
  if (hd === 'turn') hd = 180 * Math.min(1, (t - t0) / (s[0] - t0));
  const h = hd * Math.PI / 180;
  // speed eases to the target, like the sim's accel
  const cur = Math.hypot(p.vx, p.vy); const sp = cur + (s[2] - cur) * Math.min(1, dt * 6);
  p.vx = Math.cos(h) * sp; p.vy = Math.sin(h) * sp;
  const f = s[4] == null ? h : s[4] * Math.PI / 180;
  p.dirX = Math.cos(f); p.dirY = Math.sin(f);
  p.x += p.vx * dt; p.y += p.vy * dt;
  ${legacy
    ? 'p._phase += Math.hypot(p.vx, p.vy) * dt * 2.4;'
    : '{ const g = rig.gaitOf(p); p._phase += rig.strideRate(g.sp) * Math.min(1, g.sp / 1.2) * dt; rig.updateBank(p, dt); }'}
  T.textContent = s[1] + ' · ' + sp.toFixed(1) + ' m/s';
}
function draw() {
  rig.posePlayer(fig, p, p._phase, true, 0);
  cam.position.set(p.x - 1.2, p.y - 4.6, 1.9); cam.lookAt(p.x, p.y, 0.9);
  ren.render(scene, cam);
}
function loop(now) { if (last != null) { let d = Math.min(0.05, (now - last) / 1000); while (d > 0) { const h = Math.min(d, 1 / 60); step(h); d -= h; } draw(); } last = now; if (t < 10.4) requestAnimationFrame(loop); else window.__done = true; }
window.__live = () => requestAnimationFrame(loop);
window.__ready = true;
</script>`;

const root = process.cwd();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/before.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE(`/${OUT}/rig-before.js`, true)); }
  if (u === '/after.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(PAGE('/js/game/rig.js', false)); }
  try {
    const body = readFileSync(join(root, u));
    res.writeHead(200, { 'Content-Type': extname(u) === '.js' ? 'text/javascript' : 'application/octet-stream' }); res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

const STILLS = [1, 3, 4.6, 5.1, 6.5, 8.5];
for (const which of ['before', 'after']) {
  // stills at fixed moments (deterministic, stepped)
  const p1 = await browser.newPage({ viewport: { width: 640, height: 360 } });
  await p1.goto(`${base}/${which}.html`); await p1.waitForFunction(() => window.__ready);
  const shots = [];
  for (const s of STILLS) { await p1.evaluate((x) => window.__at(x), s); shots.push(await p1.screenshot({ type: 'png' })); }
  await p1.close();
  // a strip of the stills side by side
  const strip = await browser.newPage({ viewport: { width: 1440, height: 540 } });
  await strip.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(3,480px)">${shots.map((b) => `<img style="width:480px;height:270px" src="data:image/png;base64,${b.toString('base64')}">`).join('')}</body>`);
  await strip.screenshot({ path: join(OUT, `${which}-strip.png`), clip: { x: 0, y: 0, width: 1440, height: 540 } });
  await strip.close();
  // the clip, played in real time
  const ctx = await browser.newContext({ viewport: { width: 640, height: 360 }, recordVideo: { dir: OUT, size: { width: 640, height: 360 } } });
  const p2 = await ctx.newPage();
  await p2.goto(`${base}/${which}.html`); await p2.waitForFunction(() => window.__ready);
  await p2.evaluate(() => window.__live());
  await p2.waitForFunction(() => window.__done, null, { timeout: 120000 });
  const vid = await p2.video().path();
  await ctx.close();
  renameSync(vid, join(OUT, `${which}.webm`));
}
await browser.close(); server.close();
for (const f of readdirSync(OUT)) if (/^[0-9a-f]{32}\.webm$/.test(f)) { /* stray recordings from an interrupted run */ }
console.log(`gait clips: ${OUT}/before.webm, after.webm, before-strip.png, after-strip.png`);
