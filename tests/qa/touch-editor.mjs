/**
 * v106 (backlog #20): the touch button editor, driven by a finger. On a
 * landscape phone: open it from Settings, drag SHOOT to the left, make the
 * buttons bigger, Done — then a match puts SHOOT where it was left, at the
 * new size, clear of its neighbours; and Reset brings the arc back.
 *
 *   node tests/qa/touch-editor.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed += 1; };
const W = 844; const H = 390;
const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = watchConsole(page, { origin: server.url });
await page.addInitScript(() => {
  if (sessionStorage.getItem('seeded')) return;
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999', hintMatches: 9 }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
  sessionStorage.setItem('seeded', '1');
});
const box = (sel) => page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width }; }, sel);
const cdp = await ctx.newCDPSession(page);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });

try {
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.tap('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async () => (await import('/js/app.js')).navigate('settings'));
  await page.waitForSelector('#touchLayoutBtn');
  await page.tap('#touchLayoutBtn');
  await page.waitForSelector('.tedit .tbtn[data-slot="shoot"]');
  const s0 = await box('.tedit [data-slot="shoot"]');
  // a finger drags SHOOT 120 px to the left, in steps
  await touch('touchStart', s0.x, s0.y);
  for (let i = 1; i <= 12; i++) await touch('touchMove', s0.x - 10 * i, s0.y);
  await touch('touchEnd');
  const s1 = await box('.tedit [data-slot="shoot"]');
  check(await page.evaluate(() => !document.querySelector('.tedit .is-down')), 'letting go lets go');
  check(Math.abs(s1.x - (s0.x - 120)) < 3 && Math.abs(s1.y - s0.y) < 3, `SHOOT follows the finger (moved ${(s0.x - s1.x).toFixed(0)} px left)`);
  // bigger
  await page.evaluate(() => { const r = document.getElementById('teSize'); r.value = 120; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); });
  const s2 = await box('.tedit [data-slot="shoot"]');
  check(Math.abs(s2.w / s0.w - 1.2) < 0.03, `the size slider scales the buttons (${(s2.w / s0.w * 100).toFixed(0)}%)`);
  const edited = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.tedit .tbtn')].map((b) => { const r = b.getBoundingClientRect(); return [b.dataset.slot, { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }]; })));
  await page.tap('#teDone');
  const saved = await page.evaluate(async () => (await import('/js/state.js')).getState().settings.touchLayout);
  check(saved && saved.scale === 1.2 && saved.offsets?.shoot, 'Done saves the layout');

  // the match uses it
  await page.evaluate(async () => (await import('/js/app.js')).navigate('play', { homeId: 'c1', awayId: 'c2', duration: 1200, skill: 1, mode: 'single' }));
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 180000 });
  const inMatch = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#tpad .tbtn')].map((b) => { const r = b.getBoundingClientRect(); return [b.dataset.slot, { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, r: r.width / 2 }]; })));
  const off = Math.max(...Object.keys(edited).map((k) => Math.hypot(edited[k].x - inMatch[k].x, edited[k].y - inMatch[k].y)));
  check(off <= 2, `every button is where it was left in the editor (worst ${off.toFixed(1)} px)`);
  const c = Object.values(inMatch); let gap = 1e9;
  for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) gap = Math.min(gap, Math.hypot(c[i].x - c[j].x, c[i].y - c[j].y) - c[i].r - c[j].r);
  check(gap >= 9, `the buttons keep apart (closest ${gap.toFixed(1)} px)`);
  // SHOOT still shoots from its new spot
  await page.evaluate(() => { const b = document.querySelector('#tpad [data-slot="shoot"]'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 5, pointerType: 'touch' })); });
  await page.waitForTimeout(120);
  const down = await page.evaluate(() => document.querySelector('#tpad [data-slot="shoot"]').classList.contains('is-down'));
  await page.evaluate(() => { const b = document.querySelector('#tpad [data-slot="shoot"]'); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 5, pointerType: 'touch' })); });
  check(down, 'SHOOT answers a press where it now is');

  // Reset → the arc again
  await page.evaluate(async () => (await import('/js/app.js')).navigate('settings'));
  await page.waitForSelector('#touchLayoutBtn'); await page.tap('#touchLayoutBtn');
  await page.waitForSelector('#teReset'); await page.tap('#teReset'); await page.tap('#teDone');
  check(await page.evaluate(async () => !(await import('/js/state.js')).getState().settings.touchLayout), 'Reset and Done bring back the arc');
  check(!errs.length, `no console errors${errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''}`);
} catch (e) { console.error(e); failed += 1; }
await browser.close(); server.stop();
console.log(failed ? `\n${failed} check(s) failed` : '\ntouch editor: all checks passed');
process.exitCode = failed ? 1 : 0;
