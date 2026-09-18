/**
 * Frame cost on a throttled mid-range phone profile.
 *
 * Two numbers. The first is the simulation's own cost, measured in Node with
 * no renderer: how many milliseconds a second of match takes to step, which
 * is the floor under every frame on every device. The second is the browser
 * frame rate of the 2D canvas path with the CPU slowed 4x — the path a phone
 * without a usable GPU runs, and the one whose speed a software renderer in
 * CI can measure honestly. (WebGL frame rate cannot be measured here:
 * headless Chromium renders it in software at a few frames a second, which
 * says nothing about a phone's GPU.)
 *
 *   node tests/perf/fps.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { Match } from '../../js/game/sim.js';
import { WORLD } from '../../js/data/generator.js';

/* ---- sim cost ---- */
{
  const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, { human: null, duration: 240 });
  for (let i = 0; i < 120; i++) m.update(1 / 60);            // warm the JIT
  const t0 = performance.now();
  const STEPS = 60 * 30;                                        // thirty seconds of match
  for (let i = 0; i < STEPS; i++) m.update(1 / 60);
  const perSec = (performance.now() - t0) / 30;
  console.log(`sim: ${perSec.toFixed(2)} ms of CPU per second of match (${(perSec / 60).toFixed(3)} ms per 60 Hz step)`);
}

/* ---- 2D path frame rate, CPU throttled ---- */
const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v99' },
  settings: { quality: 'low', reduceMotion: true, tutorialDone: true },
})));
await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c2', duration: 60, skill: 1, mode: 'single' }); });
await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 60000 });
const fps = await page.evaluate(() => new Promise((resolve) => {
  let frames = 0; const t0 = performance.now(); const longest = [];
  let last = t0;
  const tick = (now) => { frames += 1; longest.push(now - last); last = now; if (now - t0 < 8000) requestAnimationFrame(tick); else resolve({ fps: frames / ((now - t0) / 1000), p95: longest.sort((a, b) => a - b)[Math.floor(longest.length * 0.95)] }); };
  requestAnimationFrame(tick);
}));
console.log(`2D path, CPU 4x slower: ${fps.fps.toFixed(1)} fps · p95 frame ${fps.p95.toFixed(1)} ms`);
await browser.close(); server.stop();
