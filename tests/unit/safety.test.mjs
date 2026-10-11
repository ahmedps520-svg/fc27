/**
 * v190 — what App Review asks of anything one player can put in front of
 * another: it is filtered, it can be reported, and its author can be
 * blocked. Against the real server.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from '../smoke/server.mjs';

const require = createRequire(import.meta.url);
const { isOffensive } = require('../../server/names.js');

test('the name filter catches abuse and leaves real names alone', () => {
  for (const n of ['fuck_you', 'xXFuCkXx', 'f.u.c.k', 'sh1t', 'ass69', 'big-dick', 'nazi_1', 'Sharmoota', 'k0s', 'ADMIN', 'apexxi_support', 'b1tch']) assert.ok(isOffensive(n), n);
  for (const n of ['Hassan', 'Nazih', 'Nazir', 'Dickson', 'Bassam', 'Cassano', 'Peacock', 'Classic', 'Scunthorpe', 'Kosovo', 'Ayrton', 'Massimo', 'Abdullah', 'Khalid_9', 'Harbour Athletic']) assert.ok(!isOffensive(n), n);
});

let ip = 0;
const post = (url, path, body, token, extra = {}) => fetch(url + path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.5.${(++ip >> 8) & 255}.${ip & 255}`, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra },
  body: JSON.stringify(body),
});
const get = (url, path, token) => fetch(url + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
  return { wait, got, send: (m) => ws.send(JSON.stringify(m)), open, close: () => ws.close() };
}
const squad = (n) => Array.from({ length: 11 }, (_, i) => `p${n + i}`);

test('names are filtered, players can be blocked and reported, and removed by the operator', async () => {
  process.env.ADMIN_KEY = 'test-admin-key-0123456789';
  const { url, dataDir, stop } = await startServer();
  try {
    // filtered at sign-up and for guilds
    const bad = await (await post(url, '/api/register', { name: 'fuck_you', pass: 'safety-pass-123' })).json();
    assert.match(bad.error || '', /different name/);
    const stamp = Date.now().toString(36).slice(-5);
    const names = ['a', 'b', 'c'].map((x) => `sf${x}${stamp}`);
    const toks = [];
    for (const n of names) {
      const r = await (await post(url, '/api/register', { name: n, pass: 'safety-pass-123' })).json();
      assert.ok(r.token, JSON.stringify(r)); toks.push(r.token);
    }
    const [A, B, C] = toks;
    const g = await (await post(url, '/api/guild', { action: 'create', name: 'Bitch Club' }, A)).json();
    assert.match(g.error || '', /different guild name/);

    // A blocks B: friendship goes, and B cannot befriend A back
    await post(url, '/api/friends', { action: 'add', name: names[1] }, A);
    const bl = await (await post(url, '/api/block', { name: names[1] }, A)).json();
    assert.deepEqual(bl.blocked, [names[1]]);
    const fr = await (await get(url, '/api/friends', A)).json();
    assert.equal(fr.rows.length, 0, 'blocking unfriends');
    const back = await (await post(url, '/api/friends', { action: 'add', name: names[0] }, B)).json();
    assert.match(back.error || '', /No player/);
    // blocking a name that does not exist says nothing about it
    const ghost = await post(url, '/api/block', { name: `nobody${stamp}` }, A);
    assert.equal(ghost.status, 200);

    // B cannot join A's lobby (it looks like a wrong code), C can
    const a = client(url); const b = client(url); const c = client(url);
    await Promise.all([a.open, b.open, c.open]);
    a.send({ t: 'auth', token: A }); b.send({ t: 'auth', token: B }); c.send({ t: 'auth', token: C });
    await a.wait('ready'); await b.wait('ready'); await c.wait('ready');
    a.send({ t: 'host', club: 'c1', squad: squad(1), divIdx: 0 });
    const { code } = await a.wait('hosting');
    b.send({ t: 'join', code, club: 'c2', squad: squad(20), divIdx: 0 });
    assert.equal((await b.wait('joinFail')).error, 'No lobby with that code.');
    // and A and B are never matched from the queue, however long they wait
    a.send({ t: 'cancel' }); await a.wait('idle');
    a.send({ t: 'queue', club: 'c1', squad: squad(1), divIdx: 0 });
    b.send({ t: 'queue', club: 'c2', squad: squad(20), divIdx: 0 });
    await new Promise((r) => setTimeout(r, 3500));
    assert.ok(!a.got.some((m) => m.t === 'match') && !b.got.some((m) => m.t === 'match'), 'blocked players are not paired');
    c.send({ t: 'queue', club: 'c3', squad: squad(40), divIdx: 0 });
    const m = await c.wait('match', 6000);
    assert.ok(m.opp.name === names[0] || m.opp.name === names[1], 'a third player is matched as normal');
    a.close(); b.close(); c.close();

    // reports: a fixed reason only, filed to reports.jsonl, and the same answer for a name that does not exist
    assert.equal((await post(url, '/api/report', { name: names[1], reason: 'free text here' }, A)).status, 400);
    assert.equal((await post(url, '/api/report', { name: names[1], reason: 'name' }, A)).status, 200);
    assert.equal((await post(url, '/api/report', { name: `nobody${stamp}`, reason: 'name' }, A)).status, 200);
    const file = join(dataDir, 'reports.jsonl');
    assert.ok(existsSync(file));
    const lines = readFileSync(file, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    assert.equal(lines.length, 1, 'the report about nobody is not filed');
    assert.equal(lines[0].about, names[1]); assert.equal(lines[0].reason, 'name');

    // the operator's removal: a 404 without the key; with it the account goes and the name is barred
    assert.equal((await post(url, '/api/admin/remove', { name: names[1] })).status, 404);
    assert.equal((await post(url, '/api/admin/remove', { name: names[1] }, null, { 'x-admin-key': 'wrong-key-0123456789abc' })).status, 404);
    assert.equal((await post(url, '/api/admin/remove', { name: names[1] }, null, { 'x-admin-key': process.env.ADMIN_KEY })).status, 200);
    assert.equal((await get(url, '/api/me', B)).status, 401, 'the removed account is signed out');
    const again = await (await post(url, '/api/register', { name: names[1], pass: 'safety-pass-123' })).json();
    assert.match(again.error || '', /taken/);
  } finally { await stop(); delete process.env.ADMIN_KEY; }
});
