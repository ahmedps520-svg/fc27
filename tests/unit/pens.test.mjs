/**
 * v194 — the online penalty duel (server/pens.js): the kick's rules, the
 * shootout arithmetic, and whole duels against the real server — paired from
 * the queue, by code (never with a blocked player), the clock running out,
 * nobody free, and a walk-out handing the other player the win.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from '../smoke/server.mjs';

const require = createRequire(import.meta.url);
const { resolveKick, decided } = require('../../server/pens.js');
const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };

test('a kick: wide past the post, saved the right way, scored the wrong way, the middle needs a stand', () => {
  // rnd 0.5 → no wobble
  assert.equal(resolveKick(1.1, 0, seq(0.5)).why, 'Wide');
  assert.equal(resolveKick(0.6, 1, seq(0.5, 0.1)).why, 'Saved', 'right way, within reach');
  assert.equal(resolveKick(0.6, -1, seq(0.5, 0.1)).why, 'Scored', 'wrong way');
  assert.equal(resolveKick(0.95, 1, seq(0.5, 0.5)).why, 'Scored', 'the corner beats a right-way dive more often than not');
  assert.equal(resolveKick(0.05, 0, seq(0.5, 0.1)).why, 'Saved', 'down the middle at a keeper who stood');
  assert.equal(resolveKick(0.05, 1, seq(0.5, 0.1)).why, 'Scored', 'down the middle at a keeper who dived');
  // a rushed kick wobbles far more
  let wide = 0; for (let i = 0; i < 400; i++) if (resolveKick(0.9, 0, Math.random, true).why === 'Wide') wide++;
  assert.ok(wide > 60, `rushed corners go wide (${wide}/400)`);
});

test('shootout arithmetic: stops when one side cannot be caught; sudden death after five', () => {
  assert.equal(decided([3, 0], [3, 3]), 0, '3–0 after three each: two left cannot catch up');
  assert.equal(decided([2, 1], [3, 3]), null);
  assert.equal(decided([4, 4], [5, 5]), null, 'level after five: sudden death');
  assert.equal(decided([5, 4], [6, 6]), 0);
  assert.equal(decided([5, 4], [6, 5]), null, 'the other side still has its kick');
});

let ip = 0;
const post = (url, path, body, token) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.7.${(++ip >> 8) & 255}.${ip & 255}`, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }).then((r) => r.json());
const me = (url, token) => fetch(`${url}/api/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
function client(url, token) {
  const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].ts.includes(m.t)) { waiters.splice(i, 1)[0].res(m); return; }
    got.push(m);
  });
  /** The first message of any of these types (one waiter, removed when it fires — no stale listeners). */
  const wait = (t, ms = 8000) => {
    const ts = [].concat(t);
    const had = got.find((m) => ts.includes(m.t));
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => { const w = { ts, res }; waiters.push(w); setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${ts}'`)); } }, ms); });
  };
  const send = (m) => ws.send(JSON.stringify(m));
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { got, wait, send, async auth() { await open; send({ t: 'auth', token, net: 1 }); return wait('ready'); }, close: () => ws.close() };
}
const TEAM = { takers: ['p1', 'p2', 'p3', 'p4', 'p5'], keeper: 'gk1' };

/** Play a duel to the end: each side shoots `aim` and dives `dive`, or sits out (clock). */
async function playOut(X, Y, { idle = false } = {}) {
  const sides = [X, Y];
  let kicks = 0;
  for (;;) {
    const m = await X.wait(['pensTurn', 'pensEnd'], 9000);
    if (m.t === 'pensEnd') { await Y.wait('pensEnd'); return { end: m, kicks }; }
    await Y.wait('pensTurn');
    const shooter = m.shooter;
    if (!idle) {
      // A places it away from B's dive every time; B blazes it past the post every time
      sides[shooter].send({ t: 'pensShoot', aim: shooter ? -1.2 : 0.7 });
      sides[1 - shooter].send({ t: 'pensDive', dive: shooter ? 1 : -1 });
    }
    const [kx, ky] = await Promise.all([X.wait('pensKick'), Y.wait('pensKick')]);
    assert.deepEqual(kx.score, ky.score, 'both see the same kick');
    if (idle) { assert.equal(kx.rushed, true); assert.equal(kx.late, true); }
    kicks += 1;
  }
}

test('duels against the server: queue, code, the clock, nobody free, a walk-out', async () => {
  Object.assign(process.env, { APEX_PENS_TURN_MS: '500', APEX_PENS_GAP_MS: '60', APEX_PENS_NOBODY_MS: '900' });
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const names = ['a', 'b', 'c', 'd'].map((x) => `pn${x}${stamp}`);
    const toks = [];
    for (const n of names) { const r = await post(url, '/api/register', { name: n, pass: 'pens-pass-123' }); assert.ok(r.token, JSON.stringify(r)); toks.push(r.token); }
    const [A, B, C, D] = toks.map((t) => client(url, t));
    await Promise.all([A, B, C, D].map((c) => c.auth()));

    // the queue pairs two duellists; each is told the other's takers by id
    A.send({ t: 'pensQueue', ...TEAM }); await A.wait('pensQueued');
    B.send({ t: 'pensQueue', ...TEAM, takers: ['x1', 'bad id with spaces', 'x2'] });
    const [sa, sb] = await Promise.all([A.wait('pensStart'), B.wait('pensStart')]);
    assert.equal(sa.you, 0); assert.equal(sb.you, 1);
    assert.equal(sa.opp.name, names[1]); assert.deepEqual(sa.opp.takers, ['x1', 'x2'], 'ids only, and only clean ones');
    // A always scores, B always misses: 3–0 after three each, and it stops there
    const r1 = await playOut(A, B);
    assert.equal(r1.end.winner, 0); assert.deepEqual(r1.end.score, [3, 0]); assert.equal(r1.kicks, 6, 'stopped when B could not catch up');

    // nobody acts: every kick still resolves on the clock
    A.send({ t: 'pensQueue', ...TEAM }); B.send({ t: 'pensQueue', ...TEAM });
    await Promise.all([A.wait('pensStart'), B.wait('pensStart')]);
    const r2 = await playOut(A, B, { idle: true });
    assert.ok(r2.kicks >= 6, `the clock plays it out (${r2.kicks} kicks)`);

    // by code: C is blocked by A, so A's code looks wrong to C; D gets in
    await post(url, '/api/block', { name: names[2] }, toks[0]);
    A.send({ t: 'pensHost', ...TEAM });
    const { code } = await A.wait('pensHosting');
    C.send({ t: 'pensJoin', code, ...TEAM });
    assert.equal((await C.wait('pensFail')).error, 'No duel with that code.');
    D.send({ t: 'pensJoin', code, ...TEAM });
    await Promise.all([A.wait('pensStart'), D.wait('pensStart')]);
    // a walk-out: D leaves, A wins
    await A.wait('pensTurn'); await D.wait('pensTurn');
    D.send({ t: 'pensLeave' });
    const [ea, ed] = await Promise.all([A.wait('pensEnd'), D.wait('pensEnd')]);
    assert.equal(ea.winner, 0); assert.equal(ea.walkover, true); assert.equal(ed.you, 1);

    // alone in the queue: told nobody is free
    C.send({ t: 'pensQueue', ...TEAM });
    await C.wait('pensQueued');
    await C.wait('pensNobody', 3000);

    // the records
    const pa = (await me(url, toks[0])).profile.pens;
    assert.equal(pa.w + pa.l, 3, JSON.stringify(pa)); assert.ok(pa.w >= 2);
    assert.equal((await me(url, toks[3])).profile.pens.l, 1);
    for (const c of [A, B, C, D]) c.close();
  } finally {
    await stop();
    for (const k of ['APEX_PENS_TURN_MS', 'APEX_PENS_GAP_MS', 'APEX_PENS_NOBODY_MS']) delete process.env[k];
  }
});
