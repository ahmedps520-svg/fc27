/**
 * Touch audit (v105, backlog #20): the in-match touch controls, measured on
 * landscape phones.
 *
 * For every visible touch control (the action buttons, SKILL/LOB, and the
 * HUD's own buttons) at each phone size:
 *   - size — the shorter side against 44 px (Apple's minimum target) and 48 px
 *     (Android's 48 dp);
 *   - gaps — the closest edge-to-edge distance to any neighbour (< 8 px and a
 *     thumb lands on two);
 *   - collisions — overlap with the score bug, the player strip, the HUD
 *     buttons, the feed and the tips;
 *   - reach — distance from the right thumb's rest point, in mm (a CSS px
 *     is ~0.17 mm on a phone), against the ~45 mm a thumb covers from rest.
 * Writes a screenshot per size to tests/tmp/touch/.
 *
 *   node tools/touch-audit.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from '../tests/smoke/server.mjs';

const PHONES = [
  { name: 'SE (1st)', width: 568, height: 320 },
  { name: 'SE (2nd/3rd)', width: 667, height: 375 },
  { name: 'iPhone 14', width: 844, height: 390 },
  { name: 'Pro Max', width: 932, height: 430 },
];
const OUT = 'tests/tmp/touch'; mkdirSync(OUT, { recursive: true });
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const version = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
let problems = 0;
for (const ph of PHONES) {
  const ctx = await browser.newContext({ viewport: { width: ph.width, height: ph.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v, hintMatches: 0 }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } })), version);
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.tap('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async () => (await import('/js/app.js')).navigate('play', { homeId: 'c1', awayId: 'c2', duration: 1200, skill: 1, mode: 'single' }));
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 180000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const vis = (el) => { const cs = getComputedStyle(el); const b = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && b.width > 2 && b.height > 2 && !el.closest('[hidden]'); };
    const box = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    const name = (el) => (el.dataset.slot || el.id || el.getAttribute('aria-label') || el.className.split(' ')[0]);
    const controls = [...document.querySelectorAll('#gmTouch .tbtn, .gm-hud button')].filter(vis).map((el) => ({ n: name(el), ...box(el), hud: !!el.closest('.gm-hud') }));
    const others = [['score bug', '.gm-bug'], ['player strip', '.gm-stam'], ['tips', '#gmHints'], ['feed', '#gmFeed'], ['name strap', '.bc-strap'], ['subtitles', '.bc-sub']]
      .map(([n, s]) => { const el = document.querySelector(s); return el && vis(el) ? { n, ...box(el) } : null; }).filter(Boolean);
    return { controls, others, W: innerWidth, H: innerHeight };
  });
  await page.screenshot({ path: `${OUT}/${ph.width}x${ph.height}.png` });
  await ctx.close();
  // round buttons: centre distance less both radii (square boxes made diagonal neighbours look touching)
  const round = (c) => !c.hud;
  const gap = (a, b) => {
    if (round(a) && round(b)) return Math.max(0, Math.hypot((a.l + a.r) / 2 - (b.l + b.r) / 2, (a.t + a.b) / 2 - (b.t + b.b) / 2) - a.w / 2 - b.w / 2);
    return Math.max(0, Math.max(a.l, b.l) - Math.min(a.r, b.r), Math.max(a.t, b.t) - Math.min(a.b, b.b));
  };
  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  // right thumb at rest: ~58 px in and up from the corner (a thumb's pad on a landscape phone); comfortable within ~150 px of it
  const rest = { x: r.W - 58, y: r.H - 58 };
  console.log(`\n${ph.name} — ${ph.width}×${ph.height}`);
  console.log('control      size (w×h)   smallest gap   reach from thumb   notes');
  for (const c of r.controls) {
    const notes = [];
    const small = Math.min(c.w, c.h);
    if (small < 44) notes.push(`under 44 px`); else if (small < 48) notes.push('under 48 px');
    const near = r.controls.filter((o) => o !== c).map((o) => ({ o, g: gap(c, o) })).sort((a, b) => a.g - b.g)[0];
    if (near && near.g < 8) notes.push(`${near.g < 1 ? 'touching' : `${near.g.toFixed(0)} px from`} ${near.o.n}`);
    for (const o of r.others) if (overlap(c, o) > 20) notes.push(`covers ${o.n}`);
    // a CSS pixel on a phone is ~0.17 mm; a thumb covers ~45 mm from its rest without the hand moving
    const reach = Math.hypot((c.l + c.r) / 2 - rest.x, (c.t + c.b) / 2 - rest.y) * 0.17;
    if (!c.hud && reach > 45) notes.push('a stretch for the thumb');
    if (notes.length && !c.hud) problems += notes.filter((n) => !/48/.test(n)).length;
    console.log(`${c.n.padEnd(12)} ${`${c.w.toFixed(0)}×${c.h.toFixed(0)}`.padEnd(12)} ${near ? `${near.g.toFixed(0)} px`.padStart(8) : '       –'}        ${c.hud ? '     (HUD)' : `${reach.toFixed(0)} mm`.padStart(10)}      ${notes.join('; ')}`);
  }
}
await browser.close(); server.stop();
console.log(`\n${problems} problem(s) on the action buttons (sizes under 44 px, gaps under 8 px, covering the HUD, out of reach)`);
process.exitCode = problems ? 1 : 0;
