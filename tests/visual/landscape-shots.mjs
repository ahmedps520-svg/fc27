/**
 * Every landscape, from the cameras that see it: the broadcast camera, a high
 * orbit like the Grounds gallery's, and a low shot looking out past the stands.
 * Day and night. Fails on a page error; the pictures are for looking at.
 *
 *   node tests/visual/landscape-shots.mjs [--only city,mountains] [--quality high]
 *   → tests/tmp/landscapes/<landscape>-<time>-<view>.png
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { mkdirSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = arg('--only', 'city,suburbs,desert,coast,mountains').split(',');
const QUALITY = arg('--quality', 'high');
const TIMES = arg('--times', 'day,night').split(',');
const OUT = 'tests/tmp/landscapes';
mkdirSync(OUT, { recursive: true });
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn', { timeout: 30000 });
await page.evaluate(() => { document.body.innerHTML = '<canvas id="lc" width="960" height="540" style="width:960px;height:540px;display:block"></canvas>'; });
for (const ls of ONLY) {
  for (const time of TIMES) {
    const info = await page.evaluate(async ({ ls, time, quality }) => {
      const [{ Match }, gen, st, R] = await Promise.all([import('/js/game/sim.js'), import('/js/data/generator.js'), import('/js/data/stadiums.js'), import('/js/game/renderGL.js')]);
      window.__lgl?.dispose?.();
      const base = st.STADIUM_BY_ID.forge || Object.values(st.STADIUM_BY_ID)[0];
      const m = new Match(gen.WORLD.clubs[0].id, gen.WORLD.clubs[1].id, { duration: 60, human: null });
      const atmo = st.atmosphereFor('showcase', { time, weather: 'clear' });
      m.venue = { stadium: { ...base, landscape: ls }, atmo, seasonWear: 0.3 };
      const gl = await R.createRenderer(document.getElementById('lc'), m, quality, false);
      window.__lgl = gl; window.__lm = m;
      gl.resize(960, 540);
      await Promise.race([gl.ready, new Promise((r) => setTimeout(r, 20000))]);
      return { engine: gl.engine };
    }, { ls, time, quality: QUALITY });
    for (const [view, cam] of Object.entries({
      broadcast: { x: 52.5, y: -34, z: 22, tx: 52.5, ty: 40, tz: 0, hfov: 62 },
      gallery: { x: 52.5 - 150, y: -120, z: 85, tx: 52.5, ty: 34, tz: 0, hfov: 60 },
      outward: { x: 52.5, y: 20, z: 34, tx: 52.5, ty: 400, tz: 25, hfov: 75 },
      street: { x: 200, y: -80, z: 14, tx: 260, ty: 60, tz: 4, hfov: 70 },
      top: { x: 190, y: 20, z: 110, tx: 190, ty: 21, tz: 0, hfov: 70 },
    })) {
      await page.evaluate((cam) => { for (let i = 0; i < 3; i++) window.__lgl.render(window.__lm, cam, 1 / 60); }, cam);
      await page.screenshot({ path: `${OUT}/${ls}-${time}-${view}.png`, timeout: 120000 });
    }
    console.log(`  · ${ls} ${time} (${info.engine})`);
  }
}
await browser.close();
server.stop();
for (const e of errors) console.log('  ✗', e);
console.log(errors.length ? `landscapes: ${errors.length} problem(s)` : 'landscapes: shot');
process.exit(errors.length ? 1 : 0);
