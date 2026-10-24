/**
 * v199: the figure batch (game/figureBatch.js) on and off, back to back, per
 * tier — draw calls, triangles, and the JavaScript time of each frame's
 * render() call, which is what draw calls cost a phone's main thread.
 * Software GL's frame rate is printed too but is pixel-bound here; read the
 * draw calls and the JS time.
 *
 *   node tests/perf/batch-ab.mjs [low,medium,high] [repeats]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
const tiers = (process.argv[2] || 'low,medium').split(',');
const reps = Number(process.argv[3] || 2);
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
async function run(tier, batch) {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  await page.addInitScript(([q, b]) => { if (!b) window.__apexNoFigureBatch = true; localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' }, settings: { quality: q, reduceMotion: true, tutorialDone: true, models: 'simple', pregame: 'off' } })); }, [tier, batch]);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c2', duration: 60, skill: 1, mode: 'single', atmo: { time: 'night', weather: 'clear' } }); });
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => new Promise((resolve) => {
    const gl = window.__apexGL; const orig = gl.render.bind(gl); const js = [];
    gl.render = (...a) => { const t = performance.now(); const out = orig(...a); js.push(performance.now() - t); return out; };
    let frames = 0; const t0 = performance.now();
    const tick = (now) => { frames++; if (now - t0 < 6000) requestAnimationFrame(tick); else { js.sort((a, b) => a - b); resolve({ fps: frames / ((now - t0) / 1000), jsMed: js[js.length >> 1], jsP95: js[Math.floor(js.length * 0.95)], calls: gl.info.render.calls, tris: gl.info.render.triangles }); } };
    requestAnimationFrame(tick);
  }));
  await page.close();
  return r;
}
for (const tier of tiers) for (let i = 0; i < reps; i++) for (const b of [false, true]) {
  const r = await run(tier, b);
  console.log(`${tier.padEnd(7)} ${b ? 'batch' : 'off  '}  fps ${r.fps.toFixed(2)}  render() JS median ${r.jsMed.toFixed(2)} ms p95 ${r.jsP95.toFixed(2)} ms  calls ${r.calls}  tris ${Math.round(r.tris / 1000)}k`);
}
await browser.close(); await server.stop();
