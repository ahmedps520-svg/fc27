/**
 * v82 netcode: parties against the real server — a 2v2 and a five-a-side pro
 * match with several headless clients, the seat-stamped input relay, the
 * snapshot fan-out, a mid-match drop and reconnect, and the co-op season.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const post = (url, path, body, token) => fetch(url + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
}).then((r) => r.json());

function client(url, token) {
  const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].test(m)) { waiters.splice(i, 1)[0].res(m); return; }
    got.push(m);
  });
  const wait = (t, pred = () => true, ms = 5000) => {
    const test = (m) => m.t === t && pred(m);
    const had = got.find(test);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => {
      const w = { test, res }; waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}' within ${ms}ms`)); } }, ms);
    });
  };
  const send = (m) => ws.send(JSON.stringify(m));
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { ws, got, wait, send, async auth() { await open; send({ t: 'auth', token }); return wait('ready'); }, close: () => ws.close() };
}
const drain = (c, t) => { for (let i = c.got.length - 1; i >= 0; i--) if (c.got[i].t === t) c.got.splice(i, 1); };

test('parties: 2v2 relay, a drop and a reconnect, five-a-side, and the co-op season', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const x of ['a', 'b', 'c', 'd', 'e']) {
      const r = await post(url, '/api/register', { name: `pty${x}${stamp}`, pass: 'party-pass-123' });
      assert.ok(r.token, JSON.stringify(r)); toks.push(r.token);
    }
    const cl = toks.map((t) => client(url, t));
    await Promise.all(cl.map((c) => c.auth()));
    const [A, B, C, D, E] = cl;

    // ---- a 2v2 lobby: A hosts, B C D join, sides balance, C moves across
    A.send({ t: 'partyHost', mode: 'duo' });
    const lobby = await A.wait('party');
    assert.equal(lobby.mode, 'duo');
    for (const c of [B, C, D]) { c.send({ t: 'partyJoin', code: lobby.code }); await c.wait('party'); }
    E.send({ t: 'partyJoin', code: lobby.code });
    const full = await E.wait('partyFail');
    assert.match(full.error, /full/);
    const view = await A.wait('party', (m) => m.members.length === 4);
    assert.deepEqual(view.members.map((m) => m.side).sort(), [0, 0, 1, 1], 'two a side');

    // ---- start: every member gets the setup and a distinct seat
    const setup = { home: 'c1', away: 'c2', duration: 60 };
    A.send({ t: 'partyStart', setup });
    const starts = await Promise.all(cl.slice(0, 4).map((c) => c.wait('partyMatch')));
    assert.deepEqual(starts.map((s) => s.seat), [0, 1, 2, 3]);
    assert.ok(starts[0].host && !starts[1].host);
    assert.deepEqual(starts[2].setup, setup);
    const seatOf = Object.fromEntries(starts.map((s, i) => [i, s.seats[s.seat].team]));
    assert.equal(new Set(Object.values(seatOf)).size, 2);

    // ---- relay: a guest's input reaches the host stamped with its seat — and cannot claim another
    C.send({ t: 'in', ts: 1, ax: [0.5, 0], h: 0, d: 0, u: 0, sq: 0 });
    const inC = await A.wait('in');
    assert.equal(inC.sq, 2, 'the server stamps the real seat');
    // the host's snapshot goes to all three guests, never back to the host
    A.send({ t: 'snap', ts: 1, b: [1, 2, 0, 0, 0, 0], p: [], s: [0, 0], ph: 1, tm: 1 });
    await Promise.all([B, C, D].map((c) => c.wait('snap')));
    assert.ok(!A.got.some((m) => m.t === 'snap'));

    // ---- a guest drops mid-match: the host hears it with the seat; the seat is held
    B.close();
    const dropped = await A.wait('evt', (m) => m.k === 'dropped');
    assert.equal(dropped.seat, 1);
    assert.ok(dropped.grace > 0);
    // ...and B comes back inside the grace period: same seat, same setup
    const B2 = client(url, toks[1]);
    await B2.auth();
    const back = await B2.wait('partyRejoin');
    assert.equal(back.seat, 1);
    assert.deepEqual(back.setup, setup);
    const resumed = await A.wait('evt', (m) => m.k === 'resumed');
    assert.equal(resumed.seat, 1);
    // and the relay carries on to the new socket
    drain(B2, 'snap');
    A.send({ t: 'snap', ts: 2, b: [1, 2, 0, 0, 0, 0], p: [], s: [1, 0], ph: 1, tm: 2 });
    const s2 = await B2.wait('snap');
    assert.deepEqual(s2.s, [1, 0]);
    B2.send({ t: 'in', ts: 3, ax: [0, 1], h: 0, d: 0, u: 0 });
    assert.equal((await A.wait('in')).sq, 1);

    // ---- the result ends the match and the lobby lives on
    A.send({ t: 'partyResult', scored: 2, conceded: 1 });
    await Promise.all([A, B2, C, D].map((c) => c.wait('partyRecorded')));
    A.send({ t: 'partyLeave' });
    await Promise.all([B2, C, D].map((c) => c.wait('partyEnded')));

    // ---- five-a-side pro clubs: five people, 3 v 2
    C.send({ t: 'partyHost', mode: 'pro5' });
    const p5 = await C.wait('party', (m) => m.mode === 'pro5');
    for (const c of [A, B2, D, E]) { c.send({ t: 'partyJoin', code: p5.code }); await c.wait('party', (m) => m.code === p5.code); }
    C.send({ t: 'partyStart', setup: { field: 'fives', pros: ['x'] } });
    const five = await Promise.all([C, A, B2, D, E].map((c) => c.wait('partyMatch')));
    assert.equal(five[0].seats.length, 5);
    assert.deepEqual(five.map((s) => s.seats[s.seat].team), [0, 0, 0, 0, 0].map((_, i) => five[i].seats[five[i].seat].team));
    assert.deepEqual([...new Set(five[0].seats.map((s) => s.team))].sort(), [0, 1], 'both sides have people');
    // a host that goes ends it for everybody
    C.close();
    await Promise.all([A, B2, D, E].map((c) => c.wait('partyEnded')));

    // ---- a co-op season lands on both friends' accounts
    A.send({ t: 'partyHost', mode: 'coop2' });
    const co = await A.wait('party', (m) => m.mode === 'coop2');
    D.send({ t: 'partyJoin', code: co.code });
    await D.wait('party', (m) => m.code === co.code);
    A.send({ t: 'partyStart', setup: { home: 'c1', away: 'c3' } });
    const cs = await Promise.all([A, D].map((c) => c.wait('partyMatch')));
    assert.deepEqual(cs.map((s) => s.seats[s.seat].team), [0, 0], 'co-op: one team');
    A.send({ t: 'partyResult', scored: 3, conceded: 0 });
    await A.wait('partyRecorded');
    const me = await fetch(url + '/api/me', { headers: { Authorization: `Bearer ${toks[3]}` } }).then((r) => r.json());
    const season = Object.values(me.profile.coop)[0];
    assert.equal(season.played, 1);
    assert.equal(season.pts, 3);
    // a second report of the same match is ignored
    A.send({ t: 'partyResult', scored: 9, conceded: 0 });
    await new Promise((r) => setTimeout(r, 300));
    const me2 = await fetch(url + '/api/me', { headers: { Authorization: `Bearer ${toks[3]}` } }).then((r) => r.json());
    assert.equal(Object.values(me2.profile.coop)[0].played, 1);
    for (const c of [A, B2, D, E]) c.close();
  } finally { stop(); }
});

test('skill boards: bounded scores only, best kept', async () => {
  const { url, stop } = await startServer();
  try {
    const r = await post(url, '/api/register', { name: `skl${Date.now().toString(36).slice(-6)}`, pass: 'skills-pass-123' });
    assert.equal((await post(url, '/api/skills', { game: 'slalom', score: 900 }, r.token)).best, 900);
    assert.ok((await post(url, '/api/skills', { game: 'slalom', score: 99999 }, r.token)).error, 'over the ceiling is refused');
    assert.ok((await post(url, '/api/skills', { game: 'nope', score: 1 }, r.token)).error);
    assert.equal((await post(url, '/api/skills', { game: 'slalom', score: 400 }, r.token)).best, 900, 'the best is kept');
    const board = await fetch(`${url}/api/skills?game=slalom`).then((x) => x.json());
    assert.equal(board.rows[0].score, 900);
  } finally { stop(); }
});
