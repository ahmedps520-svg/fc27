/**
 * v207 — an online friendly between two phones, one of them slow to load.
 *
 * Two iPhone-sized touch browsers (landscape, coarse pointer) play a friendly
 * by code. The guest's renderer arrives 8 s late (BOTH=1: the host's too, a
 * second later), the way a phone still downloading the match graphics would.
 * Checks:
 *   - neither phone plays while the other is still on the loading screen: the
 *     host holds the kick-off, both veils lift together, the clock reads 0:00
 *     when they do, and the slower phone's veil says who it is waiting for;
 *   - both phones have their touch controls, and they work: a thumb on the
 *     guest's stick moves the guest's player on the host's screen;
 *   - a guest whose phone goes to the background and loses its connection
 *     for 12 s is back in the match the moment it returns (it used to wait out
 *     a reconnect backoff that had grown to 12-25 s), and play resumes;
 *   - both reach full time.
 *
 * `--party` plays a co-op party (both phones on one side, through the hub)
 * instead of a friendly.
 *
 *   node tests/qa/phones-match.mjs [--slow=host|guest] [--party]
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const step = (s) => console.log(`  · ${s}`);
const SLOW = (process.argv.find((a) => a.startsWith('--slow=')) || '--slow=guest').slice(7);
const DELAY = 8000;
const PARTY = process.argv.includes('--party');
const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'] });
const errors = [];
const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
let addr = 0;

async function phone(tag, slow, cuttable = false) {
  const ctx = await browser.newContext({
    viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block',
    extraHTTPHeaders: { 'x-forwarded-for': `10.9.0.${++addr}` },
  });
  /* the hub socket through a tap the test can cut, as a phone that loses its
     connection in the background does: the live one closes on both ends, and
     while `blocked` every new attempt is refused */
  const tap = { live: null, blocked: false };
  if (cuttable) {
    await ctx.routeWebSocket(/\/ws(\?|$)/, (ws) => {
      if (tap.blocked) { ws.close(); return; }
      tap.live = { ws, server: ws.connectToServer() };
    });
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  if (slow) {
    // the renderer module lands late: the phone sits on the loading veil meanwhile
    await page.route(/\/js\/game\/render(GL|GPU)\.js/, async (route) => { await new Promise((r) => setTimeout(r, DELAY)); await route.continue(); });
  }
  const save = { meta: { reset: 'econ-2curr-1', season: 2 }, flags: { notesSeen: notesVersion }, settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple' }, club: { apex: 5000 } };
  await page.addInitScript(({ s }) => { localStorage.setItem('apexxi.save.v1', JSON.stringify(s)); }, { s: save });
  await page.goto(`${server.url}/?nop2p=1`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  await page.tap('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 15000 });
  await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); });
  const name = `${tag}${Date.now().toString(36).slice(-5)}`;
  await page.evaluate(async (n) => { const api = await import('/js/net/api.js'); await api.register(n, 'qa-pass-12345'); }, name);
  await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('squad'); });
  await page.waitForSelector('[data-utab="online"]', { timeout: 10000 });
  await page.evaluate(() => document.querySelector('[data-utab="online"]').click());
  await page.waitForSelector('#olHost', { timeout: 10000 });
  await page.waitForFunction(() => !document.getElementById('olHost')?.disabled, null, { timeout: 15000 });
  // when this phone's veil lifts, and what the match clock read at that moment
  await page.evaluate(() => {
    window.__lift = null;
    const t = setInterval(() => {
      const el = document.getElementById('gmLoad');
      if (el && el.classList.contains('done') && window.__lift == null) { window.__lift = { at: Date.now(), t: window.__apexMatch?.t ?? null }; clearInterval(t); }
    }, 20);
  });
  return { ctx, page, name, tap };
}

const touchState = (page) => page.evaluate(() => {
  const el = document.getElementById('gmTouch');
  const btn = document.querySelector('#gmTouch .tbtn');
  const zone = document.getElementById('stickZone');
  return {
    exists: !!el,
    hidden: el ? el.hidden : null,
    visible: el ? getComputedStyle(el).visibility === 'visible' && getComputedStyle(el).display !== 'none' : false,
    button: btn ? (() => { const r = btn.getBoundingClientRect(); return r.width > 20 && r.height > 20; })() : false,
    zoneTop: zone ? document.elementFromPoint(120, 260)?.id || document.elementFromPoint(120, 260)?.className : null,
  };
});

try {
  const A = await phone('phoneA', SLOW === 'host' || SLOW === 'both');
  const B = await phone('phoneB', SLOW === 'guest' || SLOW === 'both', true);
  if (PARTY) {
    await A.page.evaluate(async () => { const pt = await import('/js/net/party.js'); pt.host('coop2'); });
    let code = null;
    for (let i = 0; i < 60 && !code; i += 1) { code = await A.page.evaluate(async () => (await import('/js/net/party.js')).party()?.code || null); if (!code) await A.page.waitForTimeout(250); }
    await B.page.evaluate(async (c) => { const pt = await import('/js/net/party.js'); pt.join(c); }, code);
    for (let i = 0; i < 60; i += 1) { if (await A.page.evaluate(async () => ((await import('/js/net/party.js')).party()?.members || []).length >= 2)) break; await A.page.waitForTimeout(250); }
    await A.page.evaluate(async () => { const pt = await import('/js/net/party.js'); pt.start(); });
  } else {
    await A.page.evaluate(() => document.getElementById('olHost').click());
    await A.page.waitForFunction(() => /[A-Z0-9]{4}/.test(document.getElementById('olCodeOut')?.textContent || ''), null, { timeout: 15000 });
    const code = await A.page.evaluate(() => (document.getElementById('olCodeOut').textContent.match(/[A-Z0-9]{4}/) || [])[0]);
    await B.page.fill('#olCode', code);
    await B.page.evaluate(() => document.getElementById('olJoin').click());
  }
  for (const X of [A, B]) await X.page.waitForSelector('#gmCanvas', { timeout: 30000 });
  step(`both phones on the match screen (the ${SLOW} loads ${DELAY / 1000} s late)`);

  // the quick phone, once loaded, waits for the slow one rather than playing alone
  const quick = SLOW === 'host' ? B : A;
  await quick.page.waitForTimeout(3000);
  const early = await quick.page.evaluate(() => ({ t: window.__apexMatch?.t ?? 0, text: document.getElementById('gmLoadText')?.textContent || '', lifted: window.__lift }));
  console.log('    quick phone 3 s in:', JSON.stringify(early));

  for (const X of [A, B]) await X.page.waitForFunction(() => window.__lift, null, { timeout: 60000 });
  const [la, lb] = [await A.page.evaluate(() => window.__lift), await B.page.evaluate(() => window.__lift)];
  console.log('    host lifted', JSON.stringify(la), '· guest lifted', JSON.stringify(lb), '· gap', Math.abs(la.at - lb.at), 'ms');
  assert.ok(early.t < 0.5, `the match did not run while the other phone was loading (clock ${early.t.toFixed(1)} s)`);
  assert.equal(early.lifted, null, 'the quick phone kept its veil up while waiting');
  assert.match(early.text, /Waiting for/i, `the veil says who it is waiting for ("${early.text}")`);
  assert.ok(Math.abs(la.at - lb.at) < 1500, `both veils lift together (${Math.abs(la.at - lb.at)} ms apart)`);
  assert.ok((la.t ?? 0) < 1, `the host's clock reads ~0 at kick-off (${la.t})`);
  step(`kick-off held for the slow phone; both veils lifted ${Math.abs(la.at - lb.at)} ms apart`);

  await A.page.waitForTimeout(800);
  for (const [X, who] of [[A, 'host'], [B, 'guest']]) {
    const ts = await touchState(X.page);
    assert.ok(ts.exists && ts.hidden === false && ts.visible && ts.button, `${who} has touch controls ${JSON.stringify(ts)}`);
  }
  step('both phones show their touch controls');

  // a thumb on each phone's stick: the stick appears under it, and the guest's reaches the host
  await A.page.evaluate(async () => { const net = await import('/js/net/socket.js'); window.__maxAx = 0; net.on('in', (m) => { window.__maxAx = Math.max(window.__maxAx, Math.abs(m.ax?.[0] || 0)); }); });
  for (const [X, who] of [[B, 'guest'], [A, 'host']]) {
    const cdp = await X.ctx.newCDPSession(X.page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 140, y: 270, id: 1 }] });
    let shown = false;
    for (let i = 1; i <= 15; i += 1) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 140 + Math.min(60, i * 6), y: 270, id: 1 }] });
      await X.page.waitForTimeout(60);
      shown ||= await X.page.evaluate(() => { const st = document.getElementById('stick'); return !!st && !st.hidden && /translate\(\d/.test(st.querySelector('i')?.style.transform || ''); });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.ok(shown, `the ${who}'s stick follows the thumb`);
  }
  const maxAx = await A.page.evaluate(() => window.__maxAx);
  assert.ok(maxAx > 0.5, `the guest's stick reaches the host (max |x| ${maxAx})`);
  step(`both sticks follow the thumb; the guest's reached the host (|x| up to ${maxAx})`);

  // the guest's phone goes to the background mid-match, loses its connection, and comes back
  if (!PARTY) {
    await B.page.evaluate(async () => { window.__rejoined = 0; window.__dbg = []; const net = await import('/js/net/socket.js'); net.on('rejoined', () => { window.__rejoined += 1; }); net.onAny((m) => { if (!['snap', 'pong', 'in', 'relay'].includes(m.t) && !(m.t === 'evt' && (m.k === 'pp' || m.k === 'pr'))) window.__dbg.push([Math.round(performance.now()), m.t, m.k || '']); }); });
    await A.page.evaluate(async () => { window.__hostEv = []; const net = await import('/js/net/socket.js'); net.onAny((m) => { if (!['snap', 'pong', 'in'].includes(m.t) && !(m.t === 'evt' && (m.k === 'pp' || m.k === 'pr'))) window.__hostEv.push([Math.round(performance.now()), m.t, m.k || '']); }); });
    const setVis = (X, v) => X.page.evaluate((st) => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => st }); document.dispatchEvent(new Event('visibilitychange')); }, v);
    await setVis(B, 'hidden');
    B.tap.blocked = true;
    B.tap.live?.server.close(); B.tap.live?.ws.close();
    await B.page.waitForTimeout(12500);
    B.tap.blocked = false;
    const back = Date.now();
    await setVis(B, 'visible');
    try { await B.page.waitForFunction(() => window.__rejoined > 0, null, { timeout: 30000 }); } catch (e) {
      console.log('    debug guest:', JSON.stringify(await B.page.evaluate(() => window.__dbg)), 'host:', JSON.stringify(await A.page.evaluate(() => window.__hostEv)));
      throw e;
    }
    const took = Date.now() - back;
    const t0 = await A.page.evaluate(() => window.__apexMatch.t);
    await A.page.waitForTimeout(5000);
    const t1 = await A.page.evaluate(() => window.__apexMatch.t);
    assert.ok(took < 5000, `rejoined ${took} ms after coming back`);
    assert.ok(t1 > t0 + 0.5, `the match runs again after the rejoin (${t0.toFixed(1)} → ${t1.toFixed(1)})`);
    step(`the guest went to the background for 12 s: back in the match ${took} ms after returning, and play resumed`);
  }

  await A.page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
  for (const X of [A, B]) await X.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
  step('both reached full time');
  assert.deepEqual(errors, [], errors.join('\n'));
  console.log('phones match: ok');
} finally {
  await browser.close();
  server.stop();
}
