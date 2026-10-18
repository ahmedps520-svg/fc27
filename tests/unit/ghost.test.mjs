/**
 * v193 — ghosts: when the ranked queue has nobody for you, an AI-controlled
 * copy of a real player's recent squad (server.js offerGhosts). Only for
 * clients that say they can; never your own or a blocked player's squad; a
 * house side when the pool is empty; one result per ghost, not too quick, a
 * daily cap; walking away is a loss; the squad's owner gets a defence record.
 * Against the real server, with the waits shortened.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

let ip = 0;
const post = (url, path, body, token) => fetch(url + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.9.${(++ip >> 8) & 255}.${ip & 255}`, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
}).then((r) => r.json());
const me = (url, token) => fetch(`${url}/api/me`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
function client(url, token, caps) {
  const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].t === m.t) { waiters.splice(i, 1)[0].res(m); return; }
    got.push(m);
  });
  const wait = (t, ms = 9000) => {
    const had = got.find((m) => m.t === t);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => { const w = { t, res }; waiters.push(w); setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}'`)); } }, ms); });
  };
  const send = (m) => ws.send(JSON.stringify(m));
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { got, wait, send, async auth() { await open; send({ t: 'auth', token, net: 1, ...(caps ? { caps } : {}) }); return wait('ready'); }, close: () => ws.close() };
}
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);
const KIT = { home: { shirt: '#1e5bd8', trim: '#f4f4f4', shorts: '#151515', socks: '#1e5bd8', pattern: 'hoops' }, away: { shirt: '#f4f4f4', trim: '#1e5bd8', shorts: '#f4f4f4', socks: '#f4f4f4', pattern: 'plain' } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test('ghosts: offered to clients that can, built from real squads, counted once, a walk-away is a loss', async () => {
  Object.assign(process.env, { APEX_GHOST_AFTER_MS: '1000', APEX_GHOST_MIN_MS: '400', APEX_GHOST_LEAVE_MS: '300', APEX_GHOST_DAILY: '3' });
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const N = ['a', 'b', 'c', 'd'].map((x) => `gh${x}${stamp}`);
    const T = [];
    for (const n of N) { const r = await post(url, '/api/register', { name: n, pass: 'ghost-pass-123' }); assert.ok(r.token, JSON.stringify(r)); T.push(r.token); }

    // A fresh server: A is first, the pool has only A's own squad — a house side
    const A = client(url, T[0], ['ghost']); await A.auth();
    A.send({ t: 'queue', club: 'c1', squad: squad(1), kit: KIT, divIdx: 4 });
    const house = await A.wait('ghost');
    assert.equal(house.opp.house, true, 'nobody else\'s squad yet: a house side');
    assert.equal(house.opp.divIdx, 4);

    // B (the 1.1 app: no caps) queues and waits: never a ghost, but its squad joins the pool
    const B = client(url, T[1]); await B.auth();
    B.send({ t: 'queue', club: 'c2', squad: squad(20), kit: KIT, divIdx: 5 });
    await sleep(4500);
    assert.ok(!B.got.some((m) => m.t === 'ghost'), 'a client that did not ask never gets a ghost');
    B.send({ t: 'cancel' }); await B.wait('idle');

    // A walks away from the house match and queues again: a loss, and now B's squad is there to play
    await sleep(400);
    A.send({ t: 'queue', club: 'c1', squad: squad(1), kit: KIT, divIdx: 4 });
    const g = await A.wait('ghost');
    assert.equal(g.opp.name, N[1]); assert.equal(g.opp.squad.length, 11); assert.equal(g.opp.kit.home.pattern, 'hoops');
    let prof = (await me(url, T[0])).profile;
    assert.equal(prof.online.losses, 1, 'the abandoned ghost counted as a loss');

    // too quick, then counted once; B's squad lost, so B's defence record shows it
    A.send({ t: 'ghostResult', matchId: g.matchId, scored: 2, conceded: 1 });
    assert.equal((await A.wait('ghostRecorded')).why, 'too quick');
    A.send({ t: 'queue', club: 'c1', squad: squad(1), kit: KIT, divIdx: 4 });
    const g2 = await A.wait('ghost');
    await sleep(500);
    A.send({ t: 'ghostResult', matchId: g2.matchId, scored: 3, conceded: 1 });
    const rec = await A.wait('ghostRecorded');
    assert.equal(rec.counted, true); assert.equal(rec.online.wins, 1);
    A.send({ t: 'ghostResult', matchId: g2.matchId, scored: 9, conceded: 0 });
    assert.equal((await A.wait('ghostRecorded')).counted, false, 'one result per ghost');
    const bp = (await me(url, T[1])).profile;
    assert.ok(bp.ghost && bp.ghost.l >= 1, `B's squad's defence record (${JSON.stringify(bp.ghost)})`);

    // block B: A is never handed B's squad again (house side instead)
    await post(url, '/api/block', { name: N[1] }, T[0]);
    A.send({ t: 'queue', club: 'c1', squad: squad(1), kit: KIT, divIdx: 4 });
    const g3 = await A.wait('ghost');
    assert.ok(g3.opp.house || g3.opp.name !== N[1], 'never a blocked player\'s squad');
    await sleep(500);
    A.send({ t: 'ghostResult', matchId: g3.matchId, scored: 1, conceded: 1 });
    assert.equal((await A.wait('ghostRecorded')).counted, true);

    // the daily cap (3 here): the fourth counted result is refused
    A.send({ t: 'queue', club: 'c1', squad: squad(1), kit: KIT, divIdx: 4 });
    const g4 = await A.wait('ghost'); await sleep(500);
    A.send({ t: 'ghostResult', matchId: g4.matchId, scored: 1, conceded: 0 });
    const capped = await A.wait('ghostRecorded');
    assert.equal(capped.counted, false); assert.equal(capped.why, 'daily');
    prof = (await me(url, T[0])).profile;
    assert.equal(prof.online.played, 3, `loss + win + draw counted, the capped one not (${JSON.stringify(prof.online)})`);

    // a deleted account's squad leaves the pool: C (caps) only ever gets a house side or someone else
    const del = await post(url, '/api/account/delete', { pass: 'ghost-pass-123' }, T[1]);
    assert.ok(del.ok, JSON.stringify(del));
    const C = client(url, T[2], ['ghost']); await C.auth();
    C.send({ t: 'queue', club: 'c3', squad: squad(40), divIdx: 5 });
    const gc = await C.wait('ghost');
    assert.ok(gc.opp.house || gc.opp.name !== N[1], 'a deleted player\'s squad is gone');
    A.close(); B.close(); C.close();
  } finally {
    await stop();
    for (const k of ['APEX_GHOST_AFTER_MS', 'APEX_GHOST_MIN_MS', 'APEX_GHOST_LEAVE_MS', 'APEX_GHOST_DAILY']) delete process.env[k];
  }
});
