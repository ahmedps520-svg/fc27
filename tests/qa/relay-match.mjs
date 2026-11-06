/**
 * v202 — an online match through the near relay, in two real browsers.
 *
 * A relay (server/relay.js) and the main server, with RELAY_FORCE so the
 * match goes through the relay whatever two clients on one machine measure.
 * Both pages run with ?nop2p=1, as two phones would whose direct link failed.
 * Checks: both clients measure and report; the match card's tickets take the
 * traffic (the host's snapshots and the guest's inputs go through the relay,
 * the badge says so); a spectator still sees the match (the host copies its
 * picture up to the main server); the relay dying mid-match costs nothing —
 * the main server carries on; both reach full time.
 *
 *   node tests/qa/relay-match.mjs
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from '../smoke/server.mjs';

const require = createRequire(import.meta.url);
const { createRelay } = require('../../server/relay.js');
const step = (s) => console.log(`  · ${s}`);
const SECRET = 'qa-relay-secret-0123456789abcdef-qa';

const relay = createRelay({ secret: SECRET });
const { port } = await relay.listen(0, '127.0.0.1');
const server = await startServer(undefined, { env: { RELAY_URL: `http://127.0.0.1:${port}`, RELAY_SECRET: SECRET, RELAY_FORCE: '1' } });
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const errors = [];
const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
let addr = 0;
/** waitForFunction treats a promise as truthy, so async checks are polled here. */
async function until(page, fn, arg, ms = 15000) {
  const end = Date.now() + ms;
  for (;;) {
    if (await page.evaluate(fn, arg)) return;
    if (Date.now() > end) throw new Error(`timed out: ${fn}`);
    await page.waitForTimeout(250);
  }
}

async function player(tag) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 560 }, extraHTTPHeaders: { 'x-forwarded-for': `10.8.0.${++addr}` } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
  const save = { meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notesVersion }, settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple' }, club: { apex: 5000 } };
  await page.addInitScript(({ s }) => { localStorage.setItem('apexxi.save.v1', JSON.stringify(s)); }, { s: save });
  await page.goto(`${server.url}/?nop2p=1`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  await page.click('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 15000 });
  await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); });
  const name = `${tag}${Date.now().toString(36).slice(-5)}`;
  await page.evaluate(async (n) => { const api = await import('/js/net/api.js'); await api.register(n, 'qa-pass-12345'); }, name);
  await page.evaluate(async () => { const app = await import('/js/app.js'); app.navigate('squad'); });
  await page.waitForSelector('[data-utab="online"]', { timeout: 10000 });
  await page.evaluate(() => document.querySelector('[data-utab="online"]').click());
  await page.waitForSelector('#olHost', { timeout: 10000 });
  await page.waitForFunction(() => !document.getElementById('olHost')?.disabled, null, { timeout: 15000 });
  return { ctx, page };
}

try {
  const A = await player('relayA');
  const B = await player('relayB');
  for (const X of [A, B]) await until(X.page, async () => !!(await import('/js/net/relay.js')).relayRtt(), null, 20000);
  const rtt = await A.page.evaluate(async () => (await import('/js/net/relay.js')).relayRtt());
  assert.ok(Number.isFinite(rtt.relay) && Number.isFinite(rtt.home), JSON.stringify(rtt));
  step(`both measured (relay ${rtt.relay} ms, main server ${rtt.home} ms on this machine)`);

  await A.page.evaluate(() => document.getElementById('olHost').click());
  await A.page.waitForFunction(() => /[A-Z0-9]{4}/.test(document.getElementById('olCodeOut')?.textContent || ''), null, { timeout: 15000 });
  const code = await A.page.evaluate(() => (document.getElementById('olCodeOut').textContent.match(/[A-Z0-9]{4}/) || [])[0]);
  await B.page.fill('#olCode', code);
  await B.page.evaluate(() => document.getElementById('olJoin').click());
  for (const X of [A, B]) {
    await X.page.waitForSelector('#gmCanvas', { timeout: 30000 });
    await X.page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
  }
  await A.page.waitForFunction(() => (window.__apexMatch?.minute() || 0) > 0, null, { timeout: 30000 });
  await B.page.evaluate(async () => { const net = await import('/js/net/socket.js'); window.__snaps = 0; net.on('snap', () => { window.__snaps += 1; }); });
  await A.page.waitForTimeout(3000);
  const host = await A.page.evaluate(async () => ({ p2p: (await import('/js/net/p2p.js')).p2pStats(), relay: (await import('/js/net/relay.js')).relayStats(), badge: document.getElementById('gmNet')?.textContent }));
  const guest = await B.page.evaluate(async () => ({ relay: (await import('/js/net/relay.js')).relayStats(), snaps: window.__snaps, badge: document.getElementById('gmNet')?.textContent }));
  assert.equal(relay.rooms, 1, 'one room on the relay');
  assert.equal(host.p2p.open, false, 'no direct link (nop2p)');
  assert.ok(host.p2p.viaRelay > 30 && host.p2p.viaRelay >= host.p2p.sent * 0.8, `the host's snapshots go through the relay (${JSON.stringify(host.p2p)})`);
  assert.ok(guest.relay.got > 30, `the guest receives them from it (${JSON.stringify(guest.relay)})`);
  assert.ok(host.relay.got > 20, `and the guest's inputs reach the host through it (${JSON.stringify(host.relay)})`);
  assert.ok(/near server/.test(host.badge) && /near server/.test(guest.badge), `the badge says so (${host.badge} / ${guest.badge})`);
  step(`through the relay: host sent ${host.p2p.viaRelay}/${host.p2p.sent} snapshots by it, got ${host.relay.got} inputs; guest got ${guest.relay.got} snapshots`);

  // a spectator watches through the main server: the host copies its picture up
  const C = await player('relayC');
  const live = await A.page.evaluate(async () => (await (await fetch('/api/live')).json()).rows);
  await C.page.evaluate(async (id) => { const net = await import('/js/net/socket.js'); window.__qaSnaps = 0; net.on('snap', () => { window.__qaSnaps += 1; }); net.send({ t: 'spectate', matchId: id }); }, live[0].matchId);
  await C.page.waitForFunction(() => window.__qaSnaps > 20, null, { timeout: 30000 });
  step('a spectator sees the match');

  // the relay dies mid-match: the main server carries the rest
  await relay.close();
  await until(A.page, async () => !(await import('/js/net/relay.js')).relayStats().ready, null, 10000);
  const before = await B.page.evaluate(() => window.__snaps);
  await B.page.waitForFunction((n) => window.__snaps > n + 30, before, { timeout: 15000 });
  const sentBefore = (await A.page.evaluate(async () => (await import('/js/net/p2p.js')).p2pStats())).viaRelay;
  await A.page.waitForTimeout(1000);
  assert.equal((await A.page.evaluate(async () => (await import('/js/net/p2p.js')).p2pStats())).viaRelay, sentBefore, 'nothing more sent to a dead relay');
  step('relay gone mid-match: the guest kept getting the picture through the main server');

  await A.page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
  for (const X of [A, B]) await X.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
  step('both reached full time');
  assert.deepEqual(errors, [], errors.join('\n'));
  console.log('relay match: ok');
} finally {
  await browser.close();
  server.stop();
  await relay.close().catch(() => {});
}
