/**
 * A controller the way real ones arrive (v123): not in slot 0, and not in the
 * standard layout. Slot 0 holds a virtual pad nobody touches (Steam's, say);
 * the player's pad is in slot 1, read raw — an Xbox pad as Firefox on Linux
 * reports it (D-pad on axes 6/7, Start on 7), then a PlayStation pad as
 * Firefox on macOS reports it (D-pad on a hat axis, ✕ on 1, ○ on 2).
 *
 * The menus have to answer it: A on the title, the D-pad moving the ring, A
 * opening a screen, B coming back, Start going home.
 *
 *   node tests/qa/pad-real.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch();
const appVersion = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => (t.match(/APP_VERSION = '(v\d+)'/) || [])[1]);
const problems = [];

const KINDS = {
  xpad: {
    id: '045e-028e-Microsoft X-Box 360 pad', buttons: 11, axes: [0, 0, -1, 0, 0, -1, 0, 0],
    A: 0, B: 1, START: 7,
    dpad: (a, d) => { a[6] = d === 'left' ? -1 : d === 'right' ? 1 : 0; a[7] = d === 'up' ? -1 : d === 'down' ? 1 : 0; },
  },
  ds4: {
    id: '054c-09cc-Wireless Controller', buttons: 14, axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2857],
    A: 1, B: 2, START: 9,
    dpad: (a, d) => { a[9] = { up: -1, right: -0.4286, down: 0.1429, left: 0.7143 }[d] ?? 1.2857; },
  },
};

for (const [name, K] of Object.entries(KINDS)) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`${name}: page error ${e.message}`));
  const consoleIssues = watchConsole(page, { tag: name, origin: server.url });
  await page.addInitScript(({ ver, K }) => {
    localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: ver }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
    const mk = (n) => Array.from({ length: n }, () => ({ pressed: false, touched: false, value: 0 }));
    const phantom = { id: 'Steam Virtual Gamepad', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons: mk(17) };
    const real = { id: K.id, index: 1, connected: true, mapping: '', timestamp: 0, axes: [...K.axes], buttons: mk(K.buttons) };
    navigator.getGamepads = () => [phantom, real, null, null];
    window.__real = real;
  }, { ver: appVersion, K: { id: K.id, buttons: K.buttons, axes: K.axes } });

  const press = async (i) => {
    await page.evaluate((i) => { const b = window.__real.buttons[i]; b.pressed = true; b.value = 1; }, i);
    await page.waitForTimeout(90);
    await page.evaluate((i) => { const b = window.__real.buttons[i]; b.pressed = false; b.value = 0; }, i);
    await page.waitForTimeout(120);
  };
  const dpad = async (d) => {
    const f = K.dpad.toString();
    await page.evaluate(({ f, d }) => { (0, eval)(`(${f})`)(window.__real.axes, d); }, { f, d });
    await page.waitForTimeout(90);
    await page.evaluate(({ f }) => { (0, eval)(`(${f})`)(window.__real.axes, null); }, { f });
    await page.waitForTimeout(120);
  };
  const screen = () => page.evaluate(() => window.__apexScreen?.() || '');
  const focus = () => page.evaluate(() => window.__padMenu.focus());

  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 30000 });
  await page.waitForTimeout(400);
  await press(K.A);
  const inMenu = await page.waitForSelector('[data-go="squad"]', { timeout: 15000 }).then(() => true, () => false);
  if (!inMenu) { problems.push(`${name}: A on the title did not reach the menu`); await ctx.close(); continue; }

  const f0 = await focus();
  await dpad('down'); await dpad('right');
  const f1 = await focus();
  if (f1 === f0) problems.push(`${name}: the D-pad did not move the focus ring (${f0} → ${f1})`);
  const ringed = await page.$('.pad-focus');
  if (!ringed) problems.push(`${name}: no focus ring drawn`);

  // A opens whatever is focused; walk until one is a new screen
  let opened = '';
  for (let tries = 0; tries < 6 && !opened; tries++) {
    await press(K.A); await page.waitForTimeout(500);
    const s = await screen();
    if (s && s !== 'menu') opened = s; else await dpad('down');
  }
  if (!opened) problems.push(`${name}: A never opened a screen from the menu`);
  else {
    await press(K.B); await page.waitForTimeout(600);
    const back = await screen();
    if (back !== 'menu') {
      await press(K.START); await page.waitForTimeout(600);
      if ((await screen()) !== 'menu') problems.push(`${name}: neither B nor Start got back to the menu from ${opened} (at ${await screen()})`);
      else problems.push(`${name}: B did not go back from ${opened} (Start did)`);
    }
    // Start from a screen goes home
    await press(K.A); await page.waitForTimeout(500);
    if ((await screen()) !== 'menu') { await press(K.START); await page.waitForTimeout(600); if ((await screen()) !== 'menu') problems.push(`${name}: Start did not go home`); }
  }
  console.log(`${problems.some((p) => p.startsWith(name)) ? '✗' : '✔'} ${name}: title, ring, open ${opened || '—'}, back`);
  problems.push(...consoleIssues);
  await ctx.close();
}

await browser.close(); server.stop();
if (problems.length) { console.error(`✘ real controllers\n  - ${problems.join('\n  - ')}`); process.exit(1); }
console.log('✔ a controller in slot 1, read raw, drives the menus');
