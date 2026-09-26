/**
 * Shoot frames for the menu key art (v126: self-contained).
 *
 *   node tools/keyart/shoot.mjs [--out tests/tmp/keyart] [--quality high]
 *
 * Starts the game on its own server, plays a Quick Match at 2560x1440 on the
 * High tier (the scanned models, with the players' own hair), and grabs
 * frames from low pitchside camera poses. Then grade one:
 *
 *   python3 tools/keyart/grade.py <out>/cine-N.jpg assets/keyart.jpg
 *
 * The camera poses are set by replacing the match camera's update in the
 * page (`window.__apexCam`, which the camera regression shots already use),
 * so the shipped game carries no hook for it — the broadcast camera is
 * gameplay, and v85's way was to edit the source and remember to undo it.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'tests/tmp/keyart');
const QUALITY = arg('--quality', 'high');
mkdirSync(OUT, { recursive: true });
const W = 2560; const H = 1440;

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('page error', e.message));
await page.addInitScript((q) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' },
  settings: { tutorialDone: true, quality: q, models: 'realistic', pregame: 'off', broadcast: false, menuTheme: 'off' },
})), QUALITY);
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn'); await page.click('#startBtn');
await page.waitForSelector('[data-go="squad"]');
await page.getByText('Continue', { exact: true }).click({ timeout: 2000 }).catch(() => {});
await page.evaluate(async () => (await import('/js/app.js')).navigate('quick'));
await page.waitForSelector('#kickOff'); await page.click('#kickOff');
for (let i = 0; i < 60; i++) { const ph = await page.evaluate(() => window.__apexMatch?.phase || document.querySelector('#gmLoadText')?.textContent || 'none').catch(() => '?'); if (ph === 'play') break; if (i % 6 === 0) console.log('waiting:', ph); await page.waitForTimeout(10000); }
console.log('match on');
await page.evaluate(() => {
  const rig = window.__apexCam;
  const own = rig.update.bind(rig);
  rig.update = (match, dt, cam) => {
    const k = globalThis.__keyart;
    if (!k) return own(match, dt, cam);
    const b = match.ball;
    cam.x = b.x + k.dx; cam.y = b.y + k.dy; cam.z = k.z;
    cam.tx = b.x + k.tdx; cam.ty = b.y + k.tdy; cam.tz = k.tz; cam.hfov = k.hfov;
  };
});
// hide the HUD so the frame is only the picture
await page.addStyleTag({ content: '.gm-hud, #gmFeed, #gmHints, .gm-touch, .bc-layer, .gm-alerts, #gmBooking, #gmAdv, .bc-sub { visibility: hidden !important; }' });

// low and a little back, on a longer lens: the players at six to twelve metres,
// close enough to read the models and never so close the camera cuts into one
const POSES = [
  { dx: 4, dy: -12, z: 1.6, tdx: 0, tdy: 2, tz: 1.2, hfov: 48 },
  { dx: -6, dy: -14, z: 1.8, tdx: 1, tdy: 4, tz: 1.3, hfov: 44 },
  { dx: 0, dy: -18, z: 2.5, tdx: 0, tdy: 5, tz: 1.1, hfov: 40 },
  { dx: 8, dy: -10, z: 1.4, tdx: 0, tdy: 3, tz: 1.2, hfov: 52 },
];
let n = 0;
for (const p of POSES) {
  await page.evaluate((k) => { globalThis.__keyart = k; }, p);
  for (let s = 0; s < 2; s++) {
    await page.waitForTimeout(12000);
    const url = await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => {
      const src = document.querySelector('#gmCanvas');
      const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
      c.getContext('2d').drawImage(src, 0, 0); res(c.toDataURL('image/jpeg', 0.96));
    })));
    writeFileSync(join(OUT, `cine-${n}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    console.log('shot', n); n++;
  }
}
await browser.close(); server.stop();
console.log(`✔ ${n} frames in ${OUT} — grade one with tools/keyart/grade.py`);
