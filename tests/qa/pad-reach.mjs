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
    if (process.env.TRACE) console.log('      step', k, step, await page.evaluate(() => window.__padMenu?.focus()));
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
// controls that wipe or leave on purpose: reachable, but not pressed by the walk
const SKIP = new Set(['#resetBtn', '#forceUpdate', '#startTut', '#exportBtn', '#importFile', '#signOut', '#logoutBtn']);
const reached = new Map([['menu', []]]);
await checkScreen('menu');

/* The routes a person takes to each screen, walked with the pad alone: the
   control is focused with the D-pad and pressed with A at every step. A
   route that breaks — a button gone, moved out of reach, or no longer
   answering the pad — fails CI. */
const ROUTES = {
  today: ['go:today'], trophies: ['go:trophies'], career: ['go:career'], street: ['go:street'],
  skills: ['go:skills'], settings: ['go:settings'], squad: ['go:squad'], quick: ['go:quick'],
  world: ['go:quick', '#worldBtn'], stadiums: ['go:quick', '#stadiumsBtn'], builder: ['go:quick', '#stadiumsBtn', '#scBuild'],
  pro: ['go:career', '#cmPlayer'], weekend: ['go:squad', '[data-utab=division]', '#goWeekend'],
};
if (!process.argv.includes('--explore')) {
  for (const [target, route] of Object.entries(ROUTES)) {
    if (!(await home())) { problems.push(`${target}: could not get back to the menu first`); continue; }
    let ok = true;
    for (const key of route) {
      lastKey = `${target}: ${key}`;
      const keys = await keysHere();
      if (!keys.includes(key)) { problems.push(`${target}: "${key}" is not on ${await current()} (route ${route.join(' → ')})`); ok = false; break; }
      if (!(await pressKey(key))) { problems.push(`${target}: could not focus "${key}" on ${await current()} with the D-pad`); ok = false; break; }
    }
    if (!ok) continue;
    const now = await current();
    if (now !== target) { problems.push(`${target}: the route ${route.join(' → ')} ended on ${now}`); continue; }
    reached.set(target, route);
    await checkScreen(target);
    console.log(`  · ${target}  (${route.join(' → ')})`);
    for (let i = 0; i < 3 && (await current()) !== 'menu'; i++) { await press(B); await page.waitForTimeout(450); }
    if ((await current()) !== 'menu') problems.push(`${target}: B does not lead back to the menu`);
  }
}

/* v89: the controller features, each proved with the pad */
async function feature(name, fn) {
  try { const why = await fn(); if (why) problems.push(`${name}: ${why}`); else console.log(`  · ${name}`); } catch (e) { problems.push(`${name}: ${e.message.split('\n')[0]}`); }
}
const via = async (route) => { if (!(await home())) return false; for (const k of route) if (!(await pressKey(k))) return false; return true; };
const focusOnly = async (key) => { const k = (await keysHere()).indexOf(key); return k >= 0 && focusByPad(k); };
if (!process.argv.includes('--explore')) {
  await feature('tabs on the bumpers (RB)', async () => {
    if (!(await via(ROUTES.squad))) return 'could not reach Squad';
    const before = await page.evaluate(() => document.querySelector('[data-utab].on')?.dataset.utab);
    await press(5); await page.waitForTimeout(600);
    const after = await page.evaluate(() => document.querySelector('[data-utab].on')?.dataset.utab);
    return before && after && before !== after ? '' : `the tab did not change (${before} → ${after})`;
  });
  await feature('a card is put into the line-up with the pad (squad builder)', async () => {
    // setup, not navigation: a handful of cards in the collection to pick from
    await page.evaluate(async () => {
      const [{ update }, { WORLD }] = await Promise.all([import('/js/state.js'), import('/js/data/generator.js')]);
      const ids = Object.keys(WORLD.playersById).slice(0, 14);
      update((st) => { st.club.collection = [...new Set([...(st.club.collection || []), ...ids])]; });
    });
    if (!(await via(ROUTES.squad))) return 'could not reach Squad';
    // the builder's way: A on a pitch slot, then A on the card that goes in it
    const slots = (await keysHere()).filter((k) => k.startsWith('[data-slot='));
    if (!slots.length) return 'no pitch slot is focusable';
    const target = slots[slots.length - 1];
    if (!(await pressKey(target))) return `could not focus ${target}`;
    const pk = (await keysHere()).find((k) => k.startsWith('[data-player='));
    if (!pk) return 'no player card is focusable';
    const pid = pk.slice('[data-player='.length, -1);
    if (!(await pressKey(pk))) return `could not focus and pick ${pk}`;
    const lineup = await page.evaluate(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).club?.lineup || []);
    return lineup.map(String).includes(pid) ? '' : `player ${pid} is not in the line-up after pick → ${target}`;
  });
  await feature('a slider moves with the D-pad', async () => {
    if (!(await via(ROUTES.settings))) return 'could not reach Settings';
    if (!(await focusOnly('#respRange'))) return 'could not focus the Responsiveness slider';
    const v0 = await page.$eval('#respRange', (e) => Number(e.value));
    await press(DPAD.right); await page.waitForTimeout(200);
    const v1 = await page.$eval('#respRange', (e) => Number(e.value));
    await press(DPAD.left); await page.waitForTimeout(200);
    return v1 > v0 ? '' : `value stayed ${v0} → ${v1}`;
  });
  await feature('text entry with the on-screen keyboard', async () => {
    // the sign-in form on Squad → Online: a name typed with the pad alone
    if (!(await via([...ROUTES.squad, '[data-utab=online]']))) return 'could not reach the Online tab';
    if (!(await focusOnly('#acctName'))) return 'could not focus the account-name field';
    const before = await page.$eval('#acctName', (e) => e.value);
    await press(A); await page.waitForTimeout(300);
    if (!(await page.$('.osk-layer'))) return 'A did not open the keyboard';
    await press(A); await page.waitForTimeout(150); await press(A); await page.waitForTimeout(150);   // types the focused key twice
    await press(START); await page.waitForTimeout(300);
    if (await page.$('.osk-layer')) return 'Start did not close the keyboard';
    const after = await page.$eval('#acctName', (e) => e.value).catch(() => before);
    return after.length === before.length + 2 ? '' : `typed "${before}" → "${after}"`;
  });
  await feature('rebinding a button with the pad takes the next press, not the A that chose it', async () => {
    if (!(await via(ROUTES.settings))) return 'could not reach Settings';
    if (!(await focusOnly('[data-bind=pad:lob]'))) return 'could not focus the Lob pad binding';
    await press(A); await page.waitForTimeout(250);
    await press(3); await page.waitForTimeout(700);             // Y
    const bound = await page.evaluate(() => JSON.parse(localStorage.getItem('apexxi.save.v1')).settings?.controls?.pad?.lob);
    await page.evaluate(async () => { const { update } = await import('/js/state.js'); update((st) => { if (st.settings.controls) st.settings.controls.pad = {}; }); (await import('/js/game/input.js')).setBindings({ keys: {}, pad: {} }); });
    return bound === 3 ? '' : `Lob was bound to ${bound} (A is 0)`;
  });
  await feature('in a match: D-pad up raises the quick tactic, and unplugging the pad pauses', async () => {
    if (!(await via(['go:quick', '#kickOff']))) return 'could not start a match from Quick Match';
    await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase, null, { timeout: 120000 });
    await page.waitForTimeout(800);
    const tac = () => page.evaluate(() => { const m = window.__apexMatch; return m.teams[m.controllers[0].team].tactics.quick || 'balanced'; });
    const t0 = await tac();
    // held across several frames: software GL draws a match at a frame or two a second
    await press(DPAD.up, 1600); await page.waitForTimeout(1200);
    const t1 = await tac();
    if (t1 === t0) return `the tactic stayed ${t0}`;
    await page.evaluate(() => { const p = window.__simPad; p.connected = false; window.dispatchEvent(Object.assign(new Event('gamepaddisconnected'), { gamepad: p })); });
    await page.waitForTimeout(500);
    const paused = await page.evaluate(() => document.getElementById('gmOverlay')?.classList.contains('is-pause'));
    await page.evaluate(() => { window.__simPad.connected = true; });
    await page.evaluate(async () => { (await import('/js/app.js')).navigate('menu'); });
    await page.waitForTimeout(500);
    return paused ? '' : `unplugging did not pause (tactic went ${t0} → ${t1})`;
  });
  await feature('B closes a modal (the release notes)', async () => {
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('apexxi.save.v1')); s.flags.notesSeen = 'v1'; localStorage.setItem('apexxi.save.v1', JSON.stringify(s)); });
    await page.goto(`${server.url}/`); await page.waitForSelector('#startBtn'); await page.waitForTimeout(400);
    await press(A); await page.waitForTimeout(2500);
    if (!(await page.$('.np-layer'))) return 'the release-notes card did not appear (nothing to close)';
    await press(B); await page.waitForTimeout(700);
    return (await page.$('.np-layer')) ? 'B left the card open' : '';
  });
}

/* --explore: the full breadth-first walk, pressing every control with a
   stable identity on every screen. Slow (tens of minutes); for finding
   routes nobody listed, not for CI. */
async function goToScreen(name) {
  await ensureApp();
  if (name === 'menu') return home();
  await page.evaluate(async (n) => { (await import('/js/app.js')).navigate(n); }, name).catch(() => {});
  await page.waitForTimeout(600);
  return (await current()) === name;
}
const queue = process.argv.includes('--explore') ? [process.env.START || 'menu'] : [];
if (process.env.START) reached.set(process.env.START, ['(jump)']);
while (queue.length) {
  const screen = queue.shift();
  if (!(await goToScreen(screen))) { problems.push(`${screen}: could not get back to it`); continue; }
  const keys = [...new Set((await keysHere()).filter((k) => k && !SKIP.has(k) && !/Tgl$/.test(k)))].slice(0, 40);
  for (const key of keys) {
    if (!(await goToScreen(screen))) break;
    lastKey = `${screen} ${key}`;
    if (process.env.DEBUG) console.log('    try', screen, key);
    if (!(await keysHere()).includes(key)) continue;          // this state of the screen does not have it
    if (!(await pressKey(key))) { problems.push(`${screen}: could not focus "${key}" with the D-pad`); continue; }
    await ensureApp();
    const now = await current();
    if (now && !reached.has(now)) {
      reached.set(now, [...reached.get(screen), key]); queue.push(now);
      await checkScreen(now); console.log(`  · ${now}  (${reached.get(now).join(' → ')})`);
    }
  }
}
for (const s of MUST_REACH) if (!reached.has(s)) problems.push(`${s}: not reachable from the menu with a controller`);

await browser.close(); server.stop();
for (const e of errors) problems.push(`page error: ${e}`);
for (const p of problems) console.log('  ✗', p);
console.log(problems.length ? `pad-reach: ${problems.length} problem(s)` : `pad-reach: ok (${reached.size} screens, controller only)`);
process.exit(problems.length ? 1 : 0);
