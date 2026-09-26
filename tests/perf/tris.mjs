/**
 * Triangles per quality tier (v132): the players' own, and the whole frame's.
 *
 * Triangle counts are the same on every GPU, so unlike frame rates on
 * SwiftShader these numbers are the real ones. `players` is every visible
 * figure (22 and the referee); `frame` is three.js's count for the frame,
 * which includes the shadow pass. Averaged over a few seconds of open play.
 *
 *   node tests/perf/tris.mjs [--tiers low,medium,high,ultra] [--seconds 4]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TIERS = arg('--tiers', 'low,medium,high,ultra').split(',');
const SECONDS = Number(arg('--seconds', 4));
const server = await startServer();
const appVersion = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const rows = [];
for (const tier of TIERS) {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
  await page.addInitScript(({ q, v }) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
    meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v },
    settings: { quality: q, qualityPicked: true, reduceMotion: true, tutorialDone: true, models: 'realistic', pregame: 'off', broadcast: false },
  })), { q: tier, v: appVersion });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c2', duration: 600, skill: 1, mode: 'single' }); });
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 600000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate((secs) => new Promise((resolve) => {
    const samples = []; const t0 = performance.now();
    const tick = (now) => {
      const gl = window.__apexGL;
      samples.push({ p: gl.playerTris(), f: gl.info.render.triangles });
      if (now - t0 < secs * 1000) requestAnimationFrame(tick);
      else {
        const avg = (f) => samples.reduce((a, s) => a + f(s), 0) / samples.length;
        const max = (f) => Math.max(...samples.map(f));
        resolve({ players: avg((s) => s.p.tris), playersMax: max((s) => s.p.tris), frame: avg((s) => s.f), full: avg((s) => s.p.full), light: avg((s) => s.p.light), built: avg((s) => s.p.built) });
      }
    };
    requestAnimationFrame(tick);
  }), SECONDS);
  rows.push({ tier, ...r });
  const k = (n) => `${(n / 1000).toFixed(0)}k`;
  console.log(`${tier.padEnd(7)} players ${k(r.players).padStart(5)} (max ${k(r.playersMax)}) · frame ${k(r.frame).padStart(6)} · figures full ${r.full.toFixed(1)} / light ${r.light.toFixed(1)} / built ${r.built.toFixed(1)}`);
  await page.close();
}
await browser.close(); server.stop();
