/**
 * v184 — an account can be deleted from inside the app (App Store 5.1.1(v)):
 * only with its password, and afterwards its token is dead and the name is free.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const post = (url, path, body, token, ip = '10.9.0.1') => fetch(`${url}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
}).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));

test('delete needs the password, then the account is gone', async () => {
  const { url, stop } = await startServer();
  try {
    const name = `del${Date.now().toString(36).slice(-6)}`;
    const reg = await post(url, '/api/register', { name, pass: 'delete-me-1234' });
    assert.equal(reg.status, 200);
    const token = reg.body.token;
    assert.equal((await post(url, '/api/account/delete', { pass: 'delete-me-1234' })).status, 401, 'signed out cannot delete');
    const wrong = await post(url, '/api/account/delete', { pass: 'not-it-0000' }, token);
    assert.equal(wrong.status, 400, 'a wrong password does not delete');
    const ok = await post(url, '/api/account/delete', { pass: 'delete-me-1234' }, token);
    assert.equal(ok.status, 200);
    const me = await fetch(`${url}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(me.status, 401, 'the token is dead');
    const again = await post(url, '/api/register', { name, pass: 'another-one-1234' }, null, '10.9.0.2');
    assert.equal(again.status, 200, 'the name is free again');
  } finally { stop(); }
});
