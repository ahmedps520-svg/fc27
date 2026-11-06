/**
 * v202 — the near relay (server/relay.js) and the route to it:
 *   - tickets: signed, tamper-proof, expiring, seat in range;
 *   - relayWins: the relay only when the players' summed round trips are lower;
 *   - the relay: the host's `snap` to every guest, a guest's `in` to the host
 *     (stamped with the seat in a party, never the sender's say), nothing else
 *     either way, a roster of who is connected, a reconnect takes the seat,
 *     no ticket no entry, the probe echoes;
 *   - the main server: `relayHi` only to clients that can, the match card's
 *     tickets only when the relay is quicker for both, party tickets per seat;
 *   - the client (js/net/relay.js): ready only when the other side is there,
 *     inputs and snapshots through, and the per-seat stale guard in socket.js.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from '../smoke/server.mjs';

const require = createRequire(import.meta.url);
const { signTicket, verifyTicket, relayWins, createRelay, signAnnounce } = require('../../server/relay.js');

const SECRET = 'test-relay-secret-0123456789abcdef-xyz';
const later = () => Date.now() / 1000 + 600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sock(url) {
  const ws = new WebSocket(url);
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].test(m)) { waiters.splice(i, 1)[0].res(m); return; }
    got.push(m);
  });
  const closed = new Promise((res) => ws.addEventListener('close', (e) => res(e.code)));
  const wait = (t, pred = () => true, ms = 3000) => {
    const test = (m) => m.t === t && pred(m);
    const had = got.find(test);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => {
      const w = { test, res }; waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}' within ${ms}ms`)); } }, ms);
    });
  };
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { ws, got, wait, open, closed, send: (m) => ws.send(JSON.stringify(m)), close: () => ws.close() };
}

test('tickets: genuine, current and in range, or nothing', () => {
  const t = signTicket(SECRET, { r: 'room1', s: 1, n: 2, x: later() });
  assert.deepEqual({ ...verifyTicket(SECRET, t) }, { r: 'room1', s: 1, n: 2, p: 0, x: Math.floor(later()) });
  assert.equal(verifyTicket('another-secret-0123456789abcdef-xyz', t), null, 'another key');
  const [body, sig] = t.split('.');
  const forged = Buffer.from(JSON.stringify({ r: 'room1', s: 0, n: 2, p: 0, x: Math.floor(later()) })).toString('base64url');
  assert.equal(verifyTicket(SECRET, `${forged}.${sig}`), null, 'a changed seat');
  assert.equal(verifyTicket(SECRET, `${body}.${sig.slice(0, -2)}`), null, 'a cut signature');
  assert.equal(verifyTicket(SECRET, signTicket(SECRET, { r: 'x', s: 0, n: 2, x: Date.now() / 1000 - 3600 })), null, 'expired');
  assert.equal(verifyTicket(SECRET, signTicket(SECRET, { r: 'x', s: 2, n: 2, x: later() })), null, 'seat out of range');
  assert.equal(verifyTicket(SECRET, signTicket(SECRET, { r: 'x', s: 0, n: 11, x: later() })), null, 'too many seats');
  assert.ok(verifyTicket(SECRET, signTicket(SECRET, { r: '*probe', x: later() })), 'a probe');
  for (const junk of [null, '', 'a.b', 'x'.repeat(700), 42]) assert.equal(verifyTicket(SECRET, junk), null);
  assert.throws(() => createRelay({ secret: 'short' }));
});

test('relayWins: only when the players\' summed round trips are lower, by a margin', () => {
  assert.equal(relayWins([{ relay: 20, home: 90 }, { relay: 25, home: 95 }]), true);
  assert.equal(relayWins([{ relay: 20, home: 90 }, { relay: 180, home: 95 }]), false, 'one player far from it');
  assert.equal(relayWins([{ relay: 83, home: 90 }, { relay: 85, home: 90 }]), false, 'inside the margin');
  assert.equal(relayWins([{ relay: null, home: 90 }, { relay: 20, home: 90 }]), false, 'one could not reach it');
  assert.equal(relayWins([{ relay: 20, home: 90 }, null]), false, 'one never measured');
  assert.equal(relayWins([{ relay: 20, home: 90 }]), false);
});

test('the relay: snapshots out from the host, inputs in to it, nothing else, seats its own to say', async () => {
  const relay = createRelay({ secret: SECRET });
  const { port } = await relay.listen(0, '127.0.0.1');
  const base = `ws://127.0.0.1:${port}/relay?t=`;
  try {
    const health = await (await fetch(`http://127.0.0.1:${port}/health`)).json();
    assert.equal(health.ok, true);

    // no ticket, a bad one: refused
    const bad = sock(`${base}nope`); await bad.open;
    assert.equal((await bad.wait('rlyFail')).error, 'ticket');
    assert.equal(await bad.closed, 4001);

    // the probe echoes and goes
    const probe = sock(base + signTicket(SECRET, { r: '*probe', x: later() })); await probe.open;
    probe.send({ t: 'pp', at: 7 });
    assert.equal((await probe.wait('pp')).at, 7);
    probe.close();

    // a 1v1
    const x = later();
    const H = sock(base + signTicket(SECRET, { r: 'm1', s: 0, n: 2, x })); await H.open;
    assert.deepEqual((await H.wait('rly')).on, [0]);
    const G = sock(base + signTicket(SECRET, { r: 'm1', s: 1, n: 2, x })); await G.open;
    assert.deepEqual((await G.wait('rly', (m) => m.on.length === 2)).on, [0, 1]);
    assert.deepEqual((await H.wait('rly', (m) => m.on.length === 2)).on, [0, 1], 'the host is told the guest is here');

    H.send({ t: 'snap', ts: 1, b: [1, 2, 3] });
    assert.deepEqual(await G.wait('snap'), { t: 'snap', ts: 1, b: [1, 2, 3] }, 'verbatim');
    G.send({ t: 'in', ts: 1, mx: 0.5, sq: 3 });
    const inp = await H.wait('in');
    assert.equal(inp.mx, 0.5); assert.equal('sq' in inp, false, 'a 1v1 input carries no seat');
    // the wrong way round, or anything else: dropped
    G.send({ t: 'snap', ts: 2 }); H.send({ t: 'in', ts: 2 }); H.send({ t: 'result', score: [9, 0] }); G.send({ t: 'evt', k: 'pausereq' });
    H.send({ t: 'snap', ts: 3, pad: 'x'.repeat(30 * 1024) });       // oversized
    H.send({ t: 'snap', ts: 4 });
    assert.equal((await G.wait('snap')).ts, 4, 'only the good snapshot');
    await sleep(100);
    assert.equal(G.got.filter((m) => m.t !== 'rly').length, 0); assert.equal(H.got.filter((m) => m.t !== 'rly').length, 0);

    // the same seat again is a reconnect: the newer socket takes it, the old one is closed
    const G2 = sock(base + signTicket(SECRET, { r: 'm1', s: 1, n: 2, x })); await G2.open;
    assert.equal(await G.closed, 4004);
    H.send({ t: 'snap', ts: 5 });
    assert.equal((await G2.wait('snap')).ts, 5);
    // a leaver: the roster says so
    G2.close();
    assert.deepEqual((await H.wait('rly', (m) => m.on.length === 1)).on, [0]);
    H.close(); await sleep(100);
    assert.equal(relay.rooms, 0, 'an empty room is gone');

    // a party: each guest's input reaches the host stamped with that guest's seat, whatever it claimed
    const P = (s) => sock(base + signTicket(SECRET, { r: 'p1', s, n: 3, p: 1, x }));
    const [P0, P1, P2] = [P(0), P(1), P(2)]; await Promise.all([P0.open, P1.open, P2.open]);
    await P0.wait('rly', (m) => m.on.length === 3);
    P2.send({ t: 'in', ts: 1, sq: 1 });
    assert.equal((await P0.wait('in')).sq, 2);
    P0.send({ t: 'snap', ts: 9 });
    assert.equal((await P1.wait('snap')).ts, 9); assert.equal((await P2.wait('snap')).ts, 9);
    // a ticket for the same room that does not match it (a 1v1 shape): refused
    const odd = sock(base + signTicket(SECRET, { r: 'p1', s: 1, n: 2, x })); await odd.open;
    assert.equal(await odd.closed, 4003);
    for (const c of [P0, P1, P2]) c.close();
  } finally { await relay.close(); }
});

const post = (url, path, body) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);

test('the main server: relayHi only to clients that can; tickets on the match card only when the relay is quicker', async () => {
  const relay = createRelay({ secret: SECRET });
  const { port } = await relay.listen(0, '127.0.0.1');
  const { url, stop } = await startServer(undefined, { env: { RELAY_URL: `http://127.0.0.1:${port}`, RELAY_SECRET: SECRET } });
  try {
    // the server finds the relay up
    for (let i = 0; i < 50; i++) { const h = await (await fetch(`${url}/api/health`)).json(); if (h.relay?.up) break; await sleep(100); }
    assert.equal((await (await fetch(`${url}/api/health`)).json()).relay.up, true);

    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const x of ['a', 'b', 'c', 'd']) { const r = await post(url, '/api/register', { name: `rl${x}${stamp}`, pass: 'relay-pass-1234' }); assert.ok(r.token, JSON.stringify(r)); toks.push(r.token); }
    const hub = (token, caps) => { const c = sock(url.replace('http', 'ws') + '/ws'); c.auth = async () => { await c.open; c.send({ t: 'auth', token, net: 1, caps }); return c.wait('ready'); }; return c; };
    const [A, B, C, D] = [hub(toks[0], ['ghost', 'relay']), hub(toks[1], ['ghost', 'relay']), hub(toks[2], []), hub(toks[3], ['relay'])];
    await Promise.all([A, B, C, D].map((c) => c.auth()));
    const hiA = await A.wait('relayHi');
    assert.equal(hiA.url, `ws://127.0.0.1:${port}`);
    assert.equal(verifyTicket(SECRET, hiA.probe).r, '*probe');
    await B.wait('relayHi');
    await sleep(150);
    assert.equal(C.got.some((m) => m.t === 'relayHi'), false, 'a client that cannot (the 1.1 app) is never told');

    const friendly = async (h, g) => {
      h.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0 });
      const { code } = await h.wait('hosting');
      g.send({ t: 'join', code, club: 'c2', squad: squad(20), divIdx: 0 });
      const [mh, mg] = await Promise.all([h.wait('match'), g.wait('match')]);
      h.send({ t: 'leave' }); g.send({ t: 'leave' });
      await sleep(100);
      return [mh, mg];
    };

    // both near the relay: tickets for seats 0 and 1 of one room
    A.send({ t: 'rtt', relay: 18, home: 92 }); B.send({ t: 'rtt', relay: 22, home: 88 });
    await sleep(100);
    const seen = (await (await fetch(`${url}/api/health`)).json()).relay.rtt;
    assert.equal(seen.reports, 2); assert.equal(seen.relayQuicker, 2); assert.ok(seen.relayMs >= 18 && seen.homeMs >= 88, JSON.stringify(seen));
    const [ma, mb] = await friendly(A, B);
    assert.ok(ma.relay && mb.relay, 'tickets on both cards');
    const ta = verifyTicket(SECRET, ma.relay.t); const tb = verifyTicket(SECRET, mb.relay.t);
    assert.equal(ta.s, 0); assert.equal(tb.s, 1); assert.equal(ta.r, tb.r); assert.equal(ta.n, 2); assert.equal(ta.p, 0);
    assert.equal(ma.relay.url, `ws://127.0.0.1:${port}`);

    // one of them far from it: the main server keeps the match
    B.send({ t: 'rtt', relay: 240, home: 88 }); await sleep(100);
    const [m2] = await friendly(A, B);
    assert.equal(m2.relay, undefined);

    // a client that cannot: no ticket, whatever the numbers
    C.send({ t: 'rtt', relay: 5, home: 300 }); B.send({ t: 'rtt', relay: 20, home: 90 }); await sleep(100);
    const [m3] = await friendly(A, C);
    assert.equal(m3.relay, undefined);

    // a party: one ticket per seat, marked as a party
    D.send({ t: 'rtt', relay: 25, home: 95 }); await sleep(50);
    A.send({ t: 'partyHost', mode: 'coop2' });
    const lobby = await A.wait('party');
    D.send({ t: 'partyJoin', code: lobby.code }); await D.wait('party', (m) => m.members?.length === 2);
    A.send({ t: 'partyStart', setup: { mode: 'coop2', home: 'c1', away: 'c2', field: 'full', duration: 180 } });
    const [pa, pd] = await Promise.all([A.wait('partyMatch'), D.wait('partyMatch')]);
    const qa = verifyTicket(SECRET, pa.relay.t); const qd = verifyTicket(SECRET, pd.relay.t);
    assert.equal(qa.s, pa.seat); assert.equal(qd.s, pd.seat); assert.equal(qa.r, qd.r); assert.equal(qa.p, 1); assert.equal(qa.n, 2);
    for (const c of [A, B, C, D]) c.close();
  } finally { stop(); await relay.close(); }
});

test('the client: ready only when the other side is there; inputs and snapshots through; stale guard per seat', async () => {
  globalThis.location ??= { search: '', protocol: 'http:', host: 'localhost' };
  await import('./_dom.mjs');
  const net = await import('../../js/net/socket.js');
  const { startRelay, stopRelay, relayReady, sendRelay } = await import('../../js/net/relay.js');
  const relay = createRelay({ secret: SECRET });
  const { port } = await relay.listen(0, '127.0.0.1');
  const url = `ws://127.0.0.1:${port}`;
  try {
    const x = later();
    // this machine hosts; the guest is a bare socket
    startRelay({ host: true, relay: { url, t: signTicket(SECRET, { r: 'c1', s: 0, n: 2, x }), n: 2 } });
    for (let i = 0; i < 30 && relay.peers < 1; i++) await sleep(30);
    await sleep(50);
    assert.equal(relayReady(), false, 'alone in the room: the host keeps to the main server');
    assert.equal(sendRelay({ t: 'snap', ts: 1 }), false);
    const G = sock(`${url}/relay?t=${signTicket(SECRET, { r: 'c1', s: 1, n: 2, x })}`); await G.open;
    for (let i = 0; i < 30 && !relayReady(); i++) await sleep(30);
    assert.equal(relayReady(), true);
    assert.equal(sendRelay({ t: 'snap', ts: 2 }), true);
    assert.equal((await G.wait('snap')).ts, 2);
    const heard = [];
    const off = net.on('in', (m) => heard.push(m.ts));
    G.send({ t: 'in', ts: 50 }); G.send({ t: 'in', ts: 40 }); G.send({ t: 'in', ts: 60 });
    for (let i = 0; i < 30 && heard.length < 2; i++) await sleep(30);
    assert.deepEqual(heard, [50, 60], 'inputs reach the match code, a stale one dropped');
    G.close();
    for (let i = 0; i < 30 && relayReady(); i++) await sleep(30);
    assert.equal(relayReady(), false, 'the guest gone: back to the main server');
    off(); stopRelay();

    // the stale guard is per seat: in a party a guest whose clock is behind another's is still heard
    net.resetOrder();
    const seen = [];
    const off2 = net.on('in', (m) => seen.push(`${m.sq}:${m.ts}`));
    net.injectMessage({ t: 'in', sq: 1, ts: 9000 }); net.injectMessage({ t: 'in', sq: 2, ts: 300 }); net.injectMessage({ t: 'in', sq: 2, ts: 200 });
    assert.deepEqual(seen, ['1:9000', '2:300']);
    // and a new match starts its own order: a host whose clock is behind the last one's is not ignored
    const snaps = [];
    const off3 = net.on('snap', (m) => snaps.push(m.ts));
    net.injectMessage({ t: 'snap', ts: 7e6 }); net.resetOrder(); net.injectMessage({ t: 'snap', ts: 5e5 });
    assert.deepEqual(snaps, [7e6, 5e5]);
    off2(); off3();
  } finally { stopRelay(); await relay.close(); }
});

test('v203: a relay announces where it is, signed; only a quick tunnel\'s address (or the fixed one), only newer, dry runs apply nothing', async () => {
  const relay = createRelay({ secret: SECRET });
  const { port } = await relay.listen(0, '127.0.0.1');
  const fixed = `http://127.0.0.1:${port}`;
  const { url, stop } = await startServer(undefined, { env: { RELAY_URL: fixed, RELAY_SECRET: SECRET } });
  const health = async () => (await (await fetch(`${url}/api/health`)).json()).relay;
  const announce = (body, signature, q = '') => fetch(`${url}/api/relay/announce${q}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Relay-Signature': signature }, body });
  try {
    for (let i = 0; i < 50 && !(await health()).up; i++) await sleep(100);
    assert.equal((await health()).up, true);
    const now = Math.floor(Date.now() / 1000);
    const quick = 'https://quiet-river-1234.trycloudflare.com';
    let a = signAnnounce(SECRET, quick, now);
    assert.equal((await announce(a.body, a.signature.replace(/^./, (c) => (c === 'a' ? 'b' : 'a')))).status, 401, 'a wrong signature');
    assert.equal((await announce(a.body, signAnnounce('another-secret-0123456789abcdef-xyz', quick, now).signature)).status, 401, 'another key');
    assert.equal((await announce(a.body.replace('1234', '9999'), a.signature)).status, 401, 'the body changed after signing');
    for (const bad of ['https://evil.example.com', 'http://quiet-river-1234.trycloudflare.com', 'https://a.b.trycloudflare.com', 'https://trycloudflare.com.evil.com']) {
      const b = signAnnounce(SECRET, bad, now);
      assert.equal((await announce(b.body, b.signature)).status, 400, bad);
    }
    const old = signAnnounce(SECRET, quick, now - 3600);
    assert.equal((await announce(old.body, old.signature)).status, 400, 'an hour old');
    // a dry run checks and applies nothing
    const dry = await announce(a.body, a.signature, '?dry=1');
    assert.equal(dry.status, 200); assert.equal((await dry.json()).dry, true);
    assert.equal((await health()).url, fixed);
    // the real thing: the address moves (that tunnel does not exist here, so it reads down)
    assert.equal((await announce(a.body, a.signature)).status, 200);
    assert.equal((await health()).url, quick);
    for (let i = 0; i < 50 && (await health()).up; i++) await sleep(100);
    assert.equal((await health()).up, false);
    // an older announcement than the last is ignored; a newer one for the fixed address brings it back up
    const back = signAnnounce(SECRET, fixed, now - 10);
    assert.equal((await (await announce(back.body, back.signature)).json()).stale, true);
    assert.equal((await health()).url, quick);
    const again = signAnnounce(SECRET, fixed, now + 1);
    assert.equal((await announce(again.body, again.signature)).status, 200);
    for (let i = 0; i < 50 && !(await health()).up; i++) await sleep(100);
    const h = await health();
    assert.equal(h.url, fixed); assert.equal(h.up, true);
  } finally { stop(); await relay.close(); }
});

test('v203: with RELAY_SECRET alone the relay is off until it announces; a server with no relay refuses announcements', async () => {
  const a = await startServer(undefined, { env: { RELAY_SECRET: SECRET } });
  const b = await startServer();
  try {
    assert.deepEqual({ url: null, up: false }, (({ url, up }) => ({ url, up }))((await (await fetch(`${a.url}/api/health`)).json()).relay));
    const s = signAnnounce(SECRET, 'https://calm-sea-77.trycloudflare.com');
    const r = await fetch(`${a.url}/api/relay/announce?dry=1`, { method: 'POST', headers: { 'X-Relay-Signature': s.signature }, body: s.body });
    assert.equal(r.status, 200);
    assert.equal((await fetch(`${b.url}/api/relay/announce`, { method: 'POST', headers: { 'X-Relay-Signature': s.signature }, body: s.body })).status, 404);
  } finally { a.stop(); b.stop(); }
});
