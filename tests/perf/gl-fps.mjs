/**
 * WebGL frame cost by quality tier, on software GL.
 *
 * Headless Chromium draws WebGL through SwiftShader, a CPU rasteriser, so the
 * absolute numbers here are not a phone's or a desktop's — they are a fraction
 * of either. What is honest about them is the *ratio* between tiers and the
 * scene statistics three.js reports: draw calls, triangles and textures per
 * frame, which are the same on every GPU. Read this as "Low costs a third of
 * Ultra", not "Ultra runs at four frames a second".
 *
 *   node tests/perf/gl-fps.mjs [--tiers min,low,medium,high,ultra] [--seconds 6] [--weather rain]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TIERS = arg('--tiers', 'low,ultra').split(',');
const SECONDS = Number(arg('--seconds', 6));
const weather = arg('--weather', 'clear');
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const rows = [];
for (const tier of TIERS) {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
  await page.addInitScript((q) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
    meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
    settings: { quality: q, reduceMotion: true, tutorialDone: true, models: 'simple' },
  })), tier);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async (w) => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c2', duration: 60, skill: 1, mode: 'single', atmo: { time: 'night', weather: w } }); }, weather);
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 120000 });
  const r = await page.evaluate((secs) => new Promise((resolve) => {
    let frames = 0; const t0 = performance.now(); const times = []; let last = t0;
    const tick = (now) => {
      frames += 1; times.push(now - last); last = now;
      if (now - t0 < secs * 1000) requestAnimationFrame(tick);
      else {
        times.sort((a, b) => a - b);
        const info = window.__apexGL?.info;
        resolve({ fps: frames / ((now - t0) / 1000), p95: times[Math.floor(times.length * 0.95)],
          calls: info?.render?.calls, tris: info?.render?.triangles, tex: info?.memory?.textures, geo: info?.memory?.geometries });
      }
    };
    requestAnimationFrame(tick);
  }), SECONDS);
  rows.push({ tier, ...r });
  console.log(`${tier.padEnd(7)} ${r.fps.toFixed(1).padStart(5)} fps · p95 ${r.p95.toFixed(0).padStart(4)} ms · ${r.calls ?? '?'} draw calls · ${r.tris ? (r.tris / 1000).toFixed(0) + 'k' : '?'} tris · ${r.tex ?? '?'} textures`);
  await page.close();
}
await browser.close(); server.stop();
if (rows.length > 1) {
  const a = rows[0]; const b = rows[rows.length - 1];
  console.log(`${a.tier} draws ${(1000 / a.fps).toFixed(0)} ms a frame here, ${b.tier} ${(1000 / b.fps).toFixed(0)} ms — ${b.tier} costs ${(a.fps / b.fps).toFixed(1)}x ${a.tier}`);
}
