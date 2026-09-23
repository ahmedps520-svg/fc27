/**
 * Memory over a long session: twenty matches back to back, each played to
 * full time and left for the menu, with the JS heap measured after a forced
 * collection between them. A flat line is the goal; a staircase is a leak.
 *
 *   node tests/perf/memory.mjs [--matches 20] [--root <checkout>] [--json]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('--matches', 20));
const root = arg('--root', process.cwd());
const server = await startServer(undefined, { cwd: root });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true, sound: false } })));
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn', { timeout: 60000 });
await page.click('#startBtn');
const heap = async () => {
  await cdp.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(200);
  await cdp.send('HeapProfiler.collectGarbage');
  const { usedSize } = await cdp.send('Runtime.getHeapUsage');
  const dom = await page.evaluate(() => document.getElementsByTagName('*').length);
  return { mb: Math.round(usedSize / 1048576 * 10) / 10, dom };
};
const base = await heap();
const series = [];
for (let i = 0; i < N; i++) {
  await page.evaluate((i) => { window.__apexMatch = null; window.__apexDbg = null; return import('/js/app.js').then((a) => a.navigate('play', { mode: 'single', homeId: `c${1 + (i % 8)}`, awayId: `c${9 + (i % 8)}`, duration: 60 })); }, i);
  await page.waitForFunction(() => window.__apexMatch && window.__apexDbg && !window.__apexDbg().loading, null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const m = window.__apexMatch; if (m.phase === 'kickoff') m.startPlay(); m.half = 2; m.t = m.duration - 0.3; });
  // not waitForSelector: its element handle would keep every old match alive
  await page.waitForFunction(() => !!document.querySelector('.gm-panel'), null, { timeout: 60000 });
  await page.evaluate(() => import('/js/app.js').then((a) => a.navigate('menu')));
  await page.waitForTimeout(400);
  const h = await heap();
  series.push(h.mb);
  if (!process.argv.includes('--json')) console.log(`match ${String(i + 1).padStart(2)}: heap ${h.mb} MB · ${h.dom} DOM nodes`);
}
await browser.close(); server.stop();
const out = { base: base.mb, after1: series[0], after10: series[9], after20: series[N - 1], growthPerMatch: Math.round(((series[N - 1] - series[0]) / Math.max(1, N - 1)) * 100) / 100, errors: errors.length };
console.log(JSON.stringify(out));
