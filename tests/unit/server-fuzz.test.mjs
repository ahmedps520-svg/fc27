/**
 * v87 — server hardening. Every endpoint, every method, with and without a
 * token, fed malformed bodies: nothing may answer 5xx or take the server
 * down, nothing may echo an exception back. The socket is fed garbage too,
 * and a ranked result without a match must not count.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const ROUTES = ['/api/register', '/api/login', '/api/me', '/api/save', '/api/pair/new', '/api/pair/claim', '/api/crash', '/api/weekend', '/api/skills',
  '/api/leaderboard', '/api/guild', '/api/guild/board', '/api/friends', '/api/live', '/api/health', '/api/version', '/api/models', '/api/nope'];
const BODIES = ['', '{', 'null', '[]', '[1,2]', '42', '"str"', '{"name": {"$gt": ""}}', '{"save": "x"}', '{"save": [1]}', '{"action": "create", "name": "<script>"}',
  '{"action": "add", "name": 12}', '{"game": "slalom", "score": "999999"}', '{"code": {"a": 1}}', JSON.stringify({ save: { club: { apex: 1e308, collection: 'x' } } })];

test('every endpoint survives malformed input: no 5xx, no stack traces, still alive', async () => {
  const { url, stop } = await startServer();
  try {
    const reg = await fetch(`${url}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.1.0.1' }, body: JSON.stringify({ name: `fz${Date.now().toString(36).slice(-6)}`, pass: 'fuzz-pass-1234' }) }).then((r) => r.json());
    assert.ok(reg.token);
    let n = 0;
    for (const route of ROUTES) {
      for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
        for (const auth of [null, reg.token, 'forged-token']) {
          for (const body of method === 'GET' ? [null] : BODIES) {
            n += 1;
            const res = await fetch(`${url}${route}?id=${encodeURIComponent('../../etc')}&game=${'x'.repeat(40)}`, {
              method, body, headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.2.${n % 250}.${(n >> 8) % 250}`, ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
            });
            const text = await res.text();
            assert.ok(res.status < 500, `${method} ${route} ${body} → ${res.status} ${text.slice(0, 80)}`);
            assert.ok(!/at .*\.js:\d+|TypeError|ReferenceError|Cannot read/.test(text), `${method} ${route} leaks: ${text.slice(0, 120)}`);
          }
        }
      }
    }
    // a body over the limit is refused, not buffered
    const big = await fetch(`${url}/api/crash`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.3.0.1' }, body: `{"message":"${'x'.repeat(700 * 1024)}"}` }).catch(() => ({ status: 413 }));
    assert.ok(big.status === 413 || big.status === 400 || big.status === 202, `oversize → ${big.status}`);
    const alive = await fetch(`${url}/api/health`).then((r) => r.json());
    assert.equal(alive.ok, true);
    assert.ok(n > 800, `${n} requests`);
  } finally { stop(); }
});

test('the socket shrugs off garbage, and a ranked result without a match does not count', async () => {
  const { url, stop } = await startServer();
  try {
    const reg = await fetch(`${url}/api/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.4.0.1' }, body: JSON.stringify({ name: `ws${Date.now().toString(36).slice(-6)}`, pass: 'fuzz-pass-1234' }) }).then((r) => r.json());
    const ws = new WebSocket(url.replace('http', 'ws') + '/ws');
    await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
    const got = [];
    ws.addEventListener('message', (e) => got.push(JSON.parse(e.data)));
    ws.send(JSON.stringify({ t: 'auth', token: reg.token }));
    await new Promise((r) => setTimeout(r, 300));
    for (const junk of ['nope', '{', '[]', 'null', '{"t": 5}', '{"t": "result", "scored": 99, "conceded": -4}', '{"t": "result", "scored": 3, "conceded": 0, "wl": "2099-01-01"}',
      '{"t": "join", "code": {"x": 1}}', '{"t": "emote", "id": "<b>"}', '{"t": "partyJoin", "code": 12}', '{"t": "partyStart", "setup": "x"}', `{"t": "snap", "b": "${'x'.repeat(70000)}"}`,
      '{"t": "invite", "to": ["a"]}', '{"t": "spectate", "matchId": "1; drop"}', '{"t": "in", "ax": "x"}']) ws.send(junk);
    await new Promise((r) => setTimeout(r, 600));
    const me = await fetch(`${url}/api/me`, { headers: { Authorization: `Bearer ${reg.token}` } }).then((r) => r.json());
    assert.equal(me.profile.online?.played || 0, 0, 'no match, no result');
    assert.deepEqual(Object.keys(me.profile.weekend || {}), [], 'no weekend filed');
    const alive = await fetch(`${url}/api/health`).then((r) => r.json());
    assert.equal(alive.ok, true);
    ws.close();
  } finally { stop(); }
});
