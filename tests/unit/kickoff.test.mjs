/**
 * v207 — kick-off together (screens/play.js syncKick).
 *
 * The match card says `syncKick` only when both phones can hold the kick-off
 * (caps 'kick'): a pairing with an older build — the 1.2 and 1.3 apps — plays
 * exactly as before. A party says it when every member can. And a guest's
 * `ready` reaches the host through the hub (repeated by the guest until it sees
 * the kick-off, so this is the whole server side of it).
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
  const open = new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  return { got, wait, open, send: (m) => ws.send(JSON.stringify(m)), close: () => ws.close() };
}

test('syncKick on the match card only when both phones can; a guest\'s ready reaches the host', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const x of ['a', 'b', 'c']) { const r = await post(url, '/api/register', { name: `ko${x}${stamp}`, pass: 'kick-pass-12345' }); assert.ok(r.token, JSON.stringify(r)); toks.push(r.token); }
    const hub = (token, caps) => { const c = sock(url.replace('http', 'ws') + '/ws'); c.auth = async () => { await c.open; c.send({ t: 'auth', token, net: 1, caps }); return c.wait('ready'); }; return c; };
    const [A, B, C] = [hub(toks[0], ['ghost', 'relay', 'kick']), hub(toks[1], ['ghost', 'relay', 'kick']), hub(toks[2], ['ghost', 'relay'])];
    await Promise.all([A, B, C].map((c) => c.auth()));

    const friendly = async (h, g, during) => {
      h.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0 });
      const { code } = await h.wait('hosting');
      g.send({ t: 'join', code, club: 'c2', squad: squad(20), divIdx: 0 });
      const cards = await Promise.all([h.wait('match'), g.wait('match')]);
      if (during) await during();
      h.send({ t: 'leave' }); g.send({ t: 'leave' });
      await sleep(100);
      return cards;
    };

    const [ma, mb] = await friendly(A, B, async () => {
      B.send({ t: 'evt', k: 'ready' });
      const r = await A.wait('evt', (m) => m.k === 'ready');
      assert.equal(r.k, 'ready', 'the guest\'s ready reaches the host');
    });
    assert.equal(ma.syncKick, true); assert.equal(mb.syncKick, true);

    const [mc, md] = await friendly(A, C);
    assert.equal(mc.syncKick, undefined, 'an older build on the other side: no hold');
    assert.equal(md.syncKick, undefined);

    // a party: every member must be able to
    A.send({ t: 'partyHost', mode: 'coop2' });
    let lobby = await A.wait('party');
    B.send({ t: 'partyJoin', code: lobby.code }); await B.wait('party', (m) => m.members?.length === 2);
    A.send({ t: 'partyStart', setup: { mode: 'coop2', home: 'c1', away: 'c2', field: 'full', duration: 180 } });
    const [pa, pb] = await Promise.all([A.wait('partyMatch'), B.wait('partyMatch')]);
    assert.equal(pa.syncKick, true); assert.equal(pb.syncKick, true);
    A.send({ t: 'partyLeave' }); B.send({ t: 'partyLeave' }); await sleep(150);

    A.send({ t: 'partyHost', mode: 'coop2' });
    lobby = await A.wait('party', (m) => m.code && m.code !== lobby.code);
    C.send({ t: 'partyJoin', code: lobby.code }); await C.wait('party', (m) => m.members?.length === 2);
    A.send({ t: 'partyStart', setup: { mode: 'coop2', home: 'c1', away: 'c2', field: 'full', duration: 180 } });
    const [qa] = await Promise.all([A.wait('partyMatch'), C.wait('partyMatch')]);
    assert.equal(qa.syncKick, undefined, 'a party with an older build in it: no hold');
    for (const c of [A, B, C]) c.close();
  } finally { stop(); }
});
