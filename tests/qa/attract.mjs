/**
 * v95: the attract demo. Left alone, the title screen plays a CPU match; any
 * key, tap or controller button goes back to the title, and so does the final
 * whistle — with nothing paid, recorded or counted along the way.
 *
 *   node tests/qa/attract.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed += 1; };

const ctx = await browser.newContext({ viewport: { width: 640, height: 360 } });   // small: a software GPU draws the walkout at well under 1 fps at 720p
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|WebSocket|net::/.test(m.text())) errors.push(m.text()); });
await page.addInitScript(() => {
  if (!sessionStorage.getItem('seeded')) {
    localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' }, settings: { quality: 'low', tutorialDone: true } }));
    sessionStorage.setItem('seeded', '1');
  }
  window.__apexAttractMs = 1500;
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
  const p = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons };
  navigator.getGamepads = () => [p, null, null, null];
  window.__simPad = p;
});
const state = () => page.evaluate(async () => { const s = (await import('/js/state.js')).getState(); return { apex: s.club?.apex, hint: s.flags?.hintMatches | 0 }; });

try {
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn');
  const before = await state();

  // 1. idle on the title → the demo starts, CPU against CPU
  await page.waitForSelector('.gm-attract', { timeout: 60000 });
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 180000 });
  const m0 = await page.evaluate(() => ({ human: window.__apexMatch?.human, ctl: window.__apexMatch?.controllers.length }));
  check(m0.human === null && m0.ctl === 0, 'the demo is CPU against CPU');
  // the walkout comes first: seven seconds of wall clock, far longer on a software GPU
  const plays = await page.waitForFunction(() => window.__apexMatch.t > 1, null, { timeout: 150000 }).then(() => true, () => false);
  check(plays, `the demo kicks off and plays (clock ${(await page.evaluate(() => window.__apexMatch.t)).toFixed(1)} s)`);
  check(await page.evaluate(() => !document.querySelector('#gmTouch:not([hidden])') || getComputedStyle(document.getElementById('gmTouch')).display === 'none'), 'no controls on screen');

  // 2. a controller button leaves
  await page.evaluate(() => { window.__simPad.buttons[0] = { pressed: true, touched: true, value: 1 }; });
  await page.waitForSelector('#startBtn', { timeout: 30000 });
  await page.evaluate(() => { window.__simPad.buttons[0] = { pressed: false, touched: false, value: 0 }; });
  check(true, 'a controller button goes back to the title');

  // 3. it comes back, and a key leaves
  await page.waitForSelector('.gm-attract', { timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('KeyQ');
  await page.waitForSelector('#startBtn', { timeout: 30000 });
  check(true, 'a key goes back to the title');

  // 4. the final whistle goes back to the title, not to a result screen
  await page.evaluate(async () => { window.__apexAttractMs = 0; (await import('/js/app.js')).navigate('play', { attract: true, homeId: 'c1', awayId: 'c2', duration: 3, mode: 'single' }); });
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 180000 });
  await page.waitForSelector('#startBtn', { timeout: 300000 });
  check(!(await page.$('.gm-result, .gm-final')), 'the final whistle goes back to the title');

  const after = await state();
  check(after.apex === before.apex, `nothing paid (${before.apex} → ${after.apex})`);
  check(after.hint === before.hint, 'no hint match counted');
  check(errors.length === 0, `no page errors${errors.length ? `: ${errors[0]}` : ''}`);
} catch (e) {
  console.log('✗', e.message); failed += 1;
} finally {
  await browser.close(); server.stop?.();
}
console.log(failed ? `attract: ${failed} failed` : 'attract: all good');
process.exit(failed ? 1 : 0);
