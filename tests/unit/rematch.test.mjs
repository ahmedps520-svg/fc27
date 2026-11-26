/**
 * v210 — a rematch of an online friendly (server.js rememberFriendly).
 *
 * After a friendly whose result is in, either player can ask to play it again;
 * the other is told, and when both have asked the same two are paired again,
 * the same host, with the clubs and squads they brought. A match card says
 * `rematch` only when both phones can (caps 'rematch'): an older build is never
 * left waiting on an ask it cannot see. Walking off the card ends the offer;
 * so does going to play someone else. Ranked matches are never re-paired.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (url, path, body) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);

function sock(url) {
  const ws = new WebSocket(url);
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].test(m)) { waiters.splice(i, 1)[0].res(m); return; }
    got.push(m);
  });
  const wait = (t, pred = () => true, ms = 3000) => {
    const ok = (m) => m.t === t && pred(m);
    const had = got.find(ok);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => {
      const w = { test: ok, res }; waiters.push(w);
      setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}' within ${ms}ms`)); } }, ms);
    });
  };
  const none = async (t, ms = 400) => { await sleep(ms); assert.equal(got.find((m) => m.t === t), undefined, `no '${t}' expected`); };
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { got, wait, none, open, send: (m) => ws.send(JSON.stringify(m)), close: () => ws.close() };
}

test('a friendly played again when both ask; never with an older build, never after walking off', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const x of ['a', 'b', 'c', 'd']) { const r = await post(url, '/api/register', { name: `rm${x}${stamp}`, pass: 'rematch-pass-12345' }); assert.ok(r.token, JSON.stringify(r)); toks.push(r.token); }
    const NEW = ['ghost', 'relay', 'kick', 'rematch'];
    const hub = (token, caps) => { const c = sock(url.replace('http', 'ws') + '/ws'); c.auth = async () => { await c.open; c.send({ t: 'auth', token, net: 1, caps }); return c.wait('ready'); }; return c; };
    const [A, B, C, D] = [hub(toks[0], NEW), hub(toks[1], NEW), hub(toks[2], ['ghost', 'relay', 'kick']), hub(toks[3], NEW)];
    await Promise.all([A, B, C, D].map((c) => c.auth()));

    // a friendly, played to its result (the host's copy is the one that counts)
    const friendly = async (h, g) => {
      h.send({ t: 'host', club: { name: 'Hosts', short: 'HST' }, squad: squad(1), divIdx: 0 });
      const { code } = await h.wait('hosting');
      g.send({ t: 'join', code, club: { name: 'Guests', short: 'GST' }, squad: squad(20), divIdx: 0 });
      return Promise.all([h.wait('match'), g.wait('match')]);
    };
    const fullTime = async (h, g) => { h.send({ t: 'result', scored: 2, conceded: 1, divIdx: 0 }); await h.wait('recorded'); await g.wait('oppLeft', (m) => m.reason === 'ended'); };

    const [m1a, m1b] = await friendly(A, B);
    assert.equal(m1a.rematch, true, 'both can: the card says so'); assert.equal(m1b.rematch, true);
    await fullTime(A, B);

    // the guest asks first; the host hears it; the host says yes; same host, same clubs
    B.send({ t: 'rematch' });
    await B.wait('rematchWait');
    const ask = await A.wait('rematchAsk');
    assert.equal(ask.from, `rmb${stamp}`);
    A.send({ t: 'rematch' });
    const [m2a, m2b] = await Promise.all([A.wait('match'), B.wait('match')]);
    assert.equal(m2a.host, true, 'the same host'); assert.equal(m2b.host, false);
    assert.equal(m2a.kind, 'friendly'); assert.notEqual(m2a.matchId, m1a.matchId, 'a new match');
    assert.equal(m2a.opp.club.name, 'Guests'); assert.deepEqual(m2b.opp.squad, squad(1), 'the squads they brought');
    assert.equal(m2a.rematch, true, 'and it can be played again after that');

    // an ask during a match does nothing to the match
    A.send({ t: 'rematch' }); await A.wait('rematchOff');
    await fullTime(A, B);

    // walking off the card ends it, and the other side is told
    A.send({ t: 'rematchOff' });
    await B.wait('rematchOff');
    B.send({ t: 'rematch' }); await B.wait('rematchOff');
    await A.none('rematchAsk');

    // going to play someone else ends it too
    await friendly(A, B); await fullTime(A, B);
    A.send({ t: 'host', club: { name: 'Hosts', short: 'HST' }, squad: squad(1), divIdx: 0 });
    await A.wait('hosting');
    await B.wait('rematchOff');
    A.send({ t: 'cancel' }); await A.wait('idle');

    // an older build on the other side: no rematch on the card, and an ask is refused at once
    const [mc, md] = await friendly(A, C);
    assert.equal(mc.rematch, undefined); assert.equal(md.rematch, undefined);
    await fullTime(A, C);
    A.send({ t: 'rematch' }); await A.wait('rematchOff');
    await C.none('rematchAsk');

    // a match that ended with someone leaving is not offered again
    await friendly(A, D);
    D.send({ t: 'leave' }); await A.wait('oppLeft');
    A.send({ t: 'rematch' }); await A.wait('rematchOff');
    await D.none('rematchAsk');

    for (const c of [A, B, C, D]) c.close();
  } finally { stop(); }
});
