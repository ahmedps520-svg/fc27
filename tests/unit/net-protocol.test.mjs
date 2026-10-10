/**
 * v189 — the match protocol handshake (js/net/protocol.js). The website and
 * the installed iPhone app play each other; when their match protocols
 * differ the server must never put them in one match, and must say who has
 * to update. A client that says nothing (App Store build 5) speaks 1.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from '../smoke/server.mjs';

const require = createRequire(import.meta.url);
const mm = require('../../server/matchmaking.js');
const { NET_PROTOCOL } = await import('../../js/net/protocol.js');

test('the matchmaker never pairs across protocols', () => {
  const now = Date.now();
  const a = { divIdx: 3, queuedAt: now - 60000 };            // build 5: says nothing
  const b = { divIdx: 3, queuedAt: now - 60000, net: 1 };
  const c = { divIdx: 3, queuedAt: now - 60000, net: 2 };
  assert.equal(mm.gapOf(a, b), 0, 'saying nothing is protocol 1');
  assert.equal(mm.gapOf(b, c), Infinity);
  assert.deepEqual(mm.findPairs([a, c], now), [], 'a long wait does not bridge versions');
  assert.equal(mm.findPairs([a, b], now).length, 1);
});

const post = (url, path, body) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
function client(url) {
  const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
  const got = []; const waiters = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data); got.push(m);
    for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].t === m.t) waiters.splice(i, 1)[0].res(m);
  });
  const wait = (t, ms = 4000) => {
    const had = got.find((m) => m.t === t);
    if (had) { got.splice(got.indexOf(had), 1); return Promise.resolve(had); }
    return new Promise((res, rej) => { const w = { t, res }; waiters.push(w); setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error(`no '${t}'`)); } }, ms); });
  };
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const send = (m) => ws.send(JSON.stringify(m));
  return { wait, send, open, close: () => ws.close() };
}
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);

test('lobbies and parties refuse a mismatched protocol, and say who must update', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const n of ['old', 'new', 'cur']) toks.push((await post(url, '/api/register', { name: `np${n}${stamp}`, pass: 'proto-pass-123' })).token);
    const old = client(url); const nu = client(url); const cur = client(url);
    await Promise.all([old.open, nu.open, cur.open]);
    old.send({ t: 'auth', token: toks[0] });                       // build 5: no protocol
    nu.send({ t: 'auth', token: toks[1], net: NET_PROTOCOL + 1 });  // a future website
    cur.send({ t: 'auth', token: toks[2], net: NET_PROTOCOL });     // today's website
    const r = await old.wait('ready');
    assert.equal(r.net, NET_PROTOCOL, 'the server tells clients what its website speaks');
    await nu.wait('ready'); await cur.wait('ready');

    // the newer host's lobby turns the old client away, telling it to update
    nu.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0 });
    const { code } = await nu.wait('hosting');
    old.send({ t: 'join', code, club: 'c2', squad: squad(20), divIdx: 0 });
    const f = await old.wait('joinFail');
    assert.match(f.error, /Your game is out of date/);
    assert.equal(f.update, true);

    // build 5 and today's website are the same protocol and still play each other
    cur.send({ t: 'host', club: 'c1', squad: squad(40), divIdx: 0 });
    const { code: code2 } = await cur.wait('hosting');
    old.send({ t: 'join', code: code2, club: 'c2', squad: squad(60), divIdx: 0 });
    const m1 = await old.wait('match'); const m2 = await cur.wait('match');
    assert.equal(m1.matchId, m2.matchId);

    // a party hosted on the newer protocol turns away a client on today's: the joiner is the one behind
    nu.send({ t: 'partyHost', mode: 'coop2' });
    const pv = await nu.wait('party');
    {
      const third = client(url); await third.open;
      const t3 = (await post(url, '/api/register', { name: `np3${stamp}`, pass: 'proto-pass-123' })).token;
      third.send({ t: 'auth', token: t3, net: NET_PROTOCOL }); await third.wait('ready');
      third.send({ t: 'partyJoin', code: pv.code });
      const pf = await third.wait('partyFail');
      assert.match(pf.error, /out of date/);
      third.close();
    }
    old.close(); nu.close(); cur.close();
  } finally { await stop(); }
});
