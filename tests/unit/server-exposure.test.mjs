/**
 * v100 — the security review's findings, held.
 *
 *  - One malformed URL escape crashed the whole server (every live match with it).
 *  - The static server handed out .git, the server's source, tests and HANDOFF.
 *  - The per-address limits trusted the FIRST X-Forwarded-For entry, which the
 *    client writes; behind one proxy only the last is the proxy's.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';
const guard = (await import('../../server/guard.js')).default ?? (await import('../../server/guard.js'));

test('a malformed escape is a 400, and the server is still up', async () => {
  const { url, stop } = await startServer();
  try {
    for (const bad of ['/%E0%A4%A', '/%', '/js/%zz.js', '/api/%E0']) {
      const r = await fetch(url + bad).catch(() => null);
      assert.ok(r && r.status === 400, `${bad} → ${r?.status}`);
    }
    assert.equal((await fetch(`${url}/api/health`)).status, 200, 'still alive');
  } finally { stop(); }
});

test('only the game is served: no repository, source, tests or notes', async () => {
  const { url, stop } = await startServer();
  try {
    for (const p of ['/.git/config', '/.git/HEAD', '/server/server.js', '/server/guard.js', '/server/data/', '/HANDOFF.md', '/README.md',
      '/package.json', '/render.yaml', '/tests/smoke/server.mjs', '/tools/sweep.mjs', '/.github/workflows/ci.yml', '/.gitignore', '/node_modules/playwright/package.json',
      '/js/../server/server.js', '/%2e%2e/etc/passwd', '/assets/../server/store.js']) {
      const r = await fetch(url + p);
      assert.ok(r.status === 404 || r.status === 403, `${p} → ${r.status}`);
    }
    for (const p of ['/', '/index.html', '/landing.html', '/notes.html', '/watch.html', '/sw.js', '/manifest.webmanifest', '/events.json',
      '/js/app.js', '/styles/main.css', '/icons/icon-192.png', '/assets/keyart.jpg']) {
      const r = await fetch(url + p);
      assert.equal(r.status, 200, `${p} → ${r.status}`);
    }
  } finally { stop(); }
});

test('behind one proxy, the address is the one the proxy added; with none, the header is ignored', () => {
  const req = (xff, sock = '9.9.9.9') => ({ headers: xff ? { 'x-forwarded-for': xff } : {}, socket: { remoteAddress: sock } });
  const was = process.env.TRUST_PROXY;
  try {
    process.env.TRUST_PROXY = '1';
    assert.equal(guard.clientIP(req('6.6.6.6, 1.2.3.4')), '1.2.3.4', 'a forged first entry is not the address');
    assert.equal(guard.clientIP(req('1.2.3.4')), '1.2.3.4');
    assert.equal(guard.clientIP(req(null)), '9.9.9.9');
    delete process.env.TRUST_PROXY;
    assert.equal(guard.clientIP(req('6.6.6.6')), '9.9.9.9', 'no proxy: the header counts for nothing');
  } finally { if (was === undefined) delete process.env.TRUST_PROXY; else process.env.TRUST_PROXY = was; }
});
