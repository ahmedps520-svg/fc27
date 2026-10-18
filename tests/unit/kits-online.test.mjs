/**
 * v192 — your kit in every online match, not just 1v1 (v116): a party side
 * wears its first person's designed kit, the CPU side keeps its club's, a bad
 * kit is dropped, and a spectator gets both players' kits. Against the real
 * server.
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
  return { wait, send, async auth() { await open; send({ t: 'auth', token }); return wait('ready'); }, close: () => ws.close() };
}
const KIT = (shirt) => ({ home: { shirt, trim: '#f4f4f4', shorts: '#151515', socks: shirt, pattern: 'stripes' }, away: { shirt: '#f4f4f4', trim: shirt, shorts: '#f4f4f4', socks: '#f4f4f4', pattern: 'plain' } });
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);

test('party sides wear their people\'s kits; a spectator sees both players\' kits', async () => {
  const { url, stop } = await startServer();
  try {
    const stamp = Date.now().toString(36).slice(-5);
    const toks = [];
    for (const x of ['a', 'b', 'c', 'd', 'e']) {
      const r = await post(url, '/api/register', { name: `kt${x}${stamp}`, pass: 'kit-pass-1234' });
      assert.ok(r.token, JSON.stringify(r)); toks.push(r.token);
    }
    const [A, B, C, D, E] = toks.map((t) => client(url, t));
    await Promise.all([A, B, C, D, E].map((c) => c.auth()));

    // 2v2: A (red) hosts; B (blue) lands on side 1, C sends a broken kit and lands on side 0, D sends none
    A.send({ t: 'partyHost', mode: 'duo', kit: KIT('#d7263d') });
    const lobby = await A.wait('party');
    B.send({ t: 'partyJoin', code: lobby.code, kit: KIT('#1e5bd8') }); await B.wait('party');
    C.send({ t: 'partyJoin', code: lobby.code, kit: { home: { shirt: 'red' } } }); await C.wait('party');
    D.send({ t: 'partyJoin', code: lobby.code }); await D.wait('party');
    A.send({ t: 'partyStart', setup: { mode: 'duo', home: 'c1', away: 'c2', field: 'full', duration: 180 } });
    const [ma, mb, mc] = await Promise.all([A.wait('partyMatch'), B.wait('partyMatch'), C.wait('partyMatch')]);
    const sideOf = (name) => ma.seats.find((st) => st.name === name).team;
    assert.equal(sideOf(`kta${stamp}`), 0); assert.equal(sideOf(`ktb${stamp}`), 1);
    assert.equal(ma.kits[0].home.shirt, '#d7263d', 'side 0 wears the host\'s kit');
    assert.equal(ma.kits[1].home.shirt, '#1e5bd8', 'side 1 wears its first designer\'s kit');
    assert.deepEqual(mb.kits, ma.kits); assert.deepEqual(mc.kits, ma.kits, 'every machine is told the same kits');
    for (const c of [A, B, C, D]) c.send({ t: 'partyLeave' });

    // co-op: the CPU's side keeps its club's kit
    A.send({ t: 'partyHost', mode: 'coop2', kit: KIT('#d7263d') });
    const co = await A.wait('party', (m) => m.mode === 'coop2');
    B.send({ t: 'partyJoin', code: co.code, kit: KIT('#1e5bd8') }); await B.wait('party', (m) => m.code === co.code);
    A.send({ t: 'partyStart', setup: { mode: 'coop2', home: 'c1', away: 'c2', field: 'full', duration: 180 } });
    const cm = await A.wait('partyMatch', (m) => m.mode === 'coop2');
    assert.equal(cm.kits[0].home.shirt, '#d7263d'); assert.equal(cm.kits[1], null);
    for (const c of [A, B]) c.send({ t: 'partyLeave' });

    // 1v1 spectating carries both kits
    A.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0, kit: KIT('#d7263d') });
    const { code } = await A.wait('hosting');
    B.send({ t: 'join', code, club: 'c2', squad: squad(20), divIdx: 0, kit: KIT('#1e5bd8') });
    const m1 = await A.wait('match');
    E.send({ t: 'spectate', matchId: m1.matchId });
    const sp = await E.wait('spectating');
    assert.equal(sp.host.kit.home.shirt, '#d7263d'); assert.equal(sp.guest.kit.home.shirt, '#1e5bd8');
    for (const c of [A, B, C, D, E]) c.close();
  } finally { await stop(); }
});
