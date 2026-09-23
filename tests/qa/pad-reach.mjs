/**
 * Controller-only reachability (v88). CI fails if any screen, or any control on
 * a screen, can no longer be reached without a mouse, keyboard or touch.
 *
 * A gamepad is simulated through the Gamepad API (navigator.getGamepads is
 * replaced with a pad this script presses buttons on), and the app is driven
 * only through it:
 *
 *   1. From the menu, every screen is reached by pad alone: a breadth-first
 *      walk that focuses each control with the D-pad and presses A on it,
 *      following wherever that goes, and B to come back.
 *   2. On every screen reached, every focusable control can be focused with
 *      the D-pad from the first one: a walk over the focus graph using the
 *      pad driver's own geometric step (window.__padMenu).
 *
 *   node tests/qa/pad-reach.mjs [--view phone|desktop]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const VIEW = arg('--view', 'desktop');
// Screens a controller must be able to reach from the menu. `play` is left out:
// it is reached by starting a match, which the in-match suite covers.
// (`online` is not listed: online play is a tab inside Squad, and the route is only used on the way out of spectating.)
const MUST_REACH = ['squad', 'career', 'quick', 'settings', 'world', 'stadiums', 'builder', 'pro', 'street', 'skills', 'today', 'trophies', 'weekend'];

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext(VIEW === 'phone' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } })).newPage();
const errors = [];
const appVersion = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
let lastKey = '';
page.on('pageerror', (e) => { const k = `${e.message} @ ${(e.stack || '').split('\n')[1]?.trim()} (after ${lastKey})`; if (!errors.includes(k)) errors.push(k); });
page.on('dialog', (d) => d.accept().catch(() => {}));
await page.addInitScript((ver) => {
  if (!localStorage.getItem('apexxi.save.v1')) localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: ver }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
  // the simulated controller
  const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
  const pad = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons, vibrationActuator: null };
  navigator.getGamepads = () => [pad, null, null, null];
  window.__simPad = pad;
  window.addEventListener('load', () => window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: pad })));
}, appVersion);

const press = async (i, hold = 70) => {
  await page.evaluate((i) => { const b = window.__simPad.buttons[i]; b.pressed = true; b.value = 1; window.__simPad.timestamp++; }, i);
  await page.waitForTimeout(hold);
  await page.evaluate((i) => { const b = window.__simPad.buttons[i]; b.pressed = false; b.value = 0; window.__simPad.timestamp++; }, i);
  await page.waitForTimeout(90);
};
const A = 0; const B = 1; const START = 9;
const DPAD = { up: 12, down: 13, left: 14, right: 15 };

await page.goto(`${server.url}/`);
// the title screen: A starts
await page.waitForSelector('#startBtn', { timeout: 30000 });
await page.waitForTimeout(500);
await press(A);
await page.waitForSelector('[data-go="squad"]', { timeout: 20000 }).catch(() => {});
if (!(await page.$('[data-go="squad"]'))) { console.log('  ✗ A on the title screen did not reach the menu'); process.exit(1); }
console.log('  · the title screen answers A');

const current = () => page.evaluate(() => window.__apexScreen?.() || '').catch(() => '');
/** A control that leaves the app (the release-notes page, a reload) is fine — come back in. */
async function ensureApp() {
  const ok = await page.evaluate(() => !!window.__padMenu && !!window.__apexScreen).catch(() => false);
  if (ok) return;
  await page.goto(`${server.url}/`); await page.waitForSelector('#startBtn', { timeout: 30000 }); await page.waitForTimeout(400);
  await press(A); await page.waitForSelector('[data-go="squad"]', { timeout: 20000 }).catch(() => {});
}
const focusables = () => page.evaluate(() => window.__padMenu.list().map((el) => el.dataset.go || el.id || el.textContent.trim().slice(0, 30)));

/** Focus control k by D-pad presses, re-planning after every press: the
 *  ring scrolls long lists as it moves, and a path planned on the first
 *  layout is wrong by the third step. */
async function focusByPad(k) {
  for (let n = 0; n < 60; n++) {
    const step = await page.evaluate((k) => {
      const pm = window.__padMenu; if (!pm) return null; const len = pm.list().length;
      const start = pm.focus(); if (start === k) return 'here';
      const prev = new Map([[start, null]]); const q = [start];
      while (q.length) {
        const i = q.shift(); if (i === k) break;
        for (const d of ['up', 'down', 'left', 'right']) { const j = pm.peek(i, d); if (j >= 0 && j < len && !prev.has(j)) { prev.set(j, [i, d]); q.push(j); } }
      }
      if (!prev.has(k)) return null;
      let c = k; let first = null; while (prev.get(c)) { const [p, d] = prev.get(c); first = d; c = p; }
      return first;
    }, k).catch(() => null);
    if (step === 'here') return true;
    if (!step) return false;
    await press(DPAD[step], 60);
  }
  return false;
}

// 2. every control on a screen reachable by the D-pad
async function checkScreen(name) {
  const res = await page.evaluate(() => {
    const pm = window.__padMenu; const list = pm.list(); const n = list.length;
    const seen = new Set([0]); const q = [0];
    while (q.length) { const i = q.shift(); for (const d of ['up', 'down', 'left', 'right']) { const j = pm.peek(i, d); if (j >= 0 && !seen.has(j)) { seen.add(j); q.push(j); } } }
    return { n, missed: list.map((el, i) => (seen.has(i) ? null : (el.id || el.dataset.go || el.textContent.trim().slice(0, 24) || el.tagName))).filter(Boolean) };
  });
  if (res.missed.length) problems.push(`${name}: ${res.missed.length}/${res.n} controls cannot be reached with the D-pad (${res.missed.slice(0, 5).join(', ')})`);
}

// 1. every screen reachable from the menu, pad only: a breadth-first walk. A
// screen is remembered with the pad path that reached it (the keys of the
// controls pressed on the way), so it can be returned to after B.
const problems = [];
const keyOf = `(el) => { if (el.dataset.go) return 'go:' + el.dataset.go; if (el.id) return '#' + el.id; const d = Object.entries(el.dataset).find(([k]) => k !== 'mk'); return d ? '[data-' + d[0].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + '=' + d[1] + ']' : ''; }`;
const keysHere = () => page.evaluate((kf) => { const f = eval(kf); return window.__padMenu ? window.__padMenu.list().map(f) : []; }, keyOf).catch(() => []);
async function pressKey(key) {
  await ensureApp();
  const keys = await keysHere(); const k = keys.indexOf(key);
  if (k < 0 || !(await focusByPad(k))) return false;
  await press(A); await page.waitForTimeout(700);
  return true;
}
async function home() {
  await ensureApp();
  for (let i = 0; i < 3 && (await current()) !== 'menu'; i++) { await press(B); await page.waitForTimeout(450); }
  if ((await current()) !== 'menu') { await press(START); await page.waitForTimeout(500); }
  return (await current()) === 'menu';
}
/* Once a screen has been reached by a real pad press, it is explored by
   jumping straight back to it: the chain of proof stays pad-only (every
   screen was first entered by pressing A on a control focused with the
   D-pad), and replaying long paths through screens whose state changes on
   the way (a claimed reward, a toggled setting) would only test the test. */
async function goToScreen(name) {
  await ensureApp();
  if (name === 'menu') return home();
  await page.evaluate(async (n) => { (await import('/js/app.js')).navigate(n); }, name).catch(() => {});
  await page.waitForTimeout(600);
  return (await current()) === name;
}
// controls that wipe or leave on purpose: reachable, but not pressed by the walk
const SKIP = new Set(['#resetBtn', '#forceUpdate', '#startTut', '#exportBtn', '#importFile', '#signOut', '#logoutBtn']);
const reached = new Map([['menu', []]]);
const queue = ['menu'];
await checkScreen('menu');
while (queue.length) {
  const screen = queue.shift();
  if (!(await goToScreen(screen))) { problems.push(`${screen}: could not get back to it`); continue; }
  const keys = [...new Set((await keysHere()).filter((k) => k && !SKIP.has(k) && !/Tgl$/.test(k)))].slice(0, 40);
  for (const key of keys) {
    if (!(await goToScreen(screen))) break;
    lastKey = `${screen} ${key}`;
    if (process.env.DEBUG) console.log('    try', screen, key);
    if (!(await pressKey(key))) { problems.push(`${screen}: could not focus "${key}" with the D-pad`); continue; }
    await ensureApp();
    const now = await current();
    if (now && !reached.has(now)) {
      reached.set(now, [...reached.get(screen), key]); queue.push(now);
      await checkScreen(now); console.log(`  · ${now}  (${reached.get(now).join(' → ')})`);
      // and B leads home from it (not in a match, where B is shoot and Start pauses)
      if (now !== 'play' && !(await (async () => { for (let i = 0; i < 3 && (await current()) !== 'menu'; i++) { await press(B); await page.waitForTimeout(450); } return (await current()) === 'menu'; })())) problems.push(`${now}: B does not lead back to the menu`);
    }
  }
}
for (const s of MUST_REACH) if (!reached.has(s)) problems.push(`${s}: not reachable from the menu with a controller`);

await browser.close(); server.stop();
for (const e of errors) problems.push(`page error: ${e}`);
for (const p of problems) console.log('  ✗', p);
console.log(problems.length ? `pad-reach: ${problems.length} problem(s)` : `pad-reach: ok (${reached.size} screens, controller only)`);
process.exit(problems.length ? 1 : 0);
