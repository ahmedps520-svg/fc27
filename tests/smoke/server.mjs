/** Start the real server on a spare port with a scratch data dir; returns { url, stop }. */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';

/* A port the OS says is free right now. The old random pick in 8400–8799
   collided now and then when several test files started servers at once, and
   a test would talk to another file's server and lose it when that one
   stopped ("fetch failed", a different test each run). */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref(); srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => { const { port } = srv.address(); srv.close(() => resolve(port)); });
  });
}

export async function startServer(port, { cwd = process.cwd() } = {}) {
  port ??= await freePort();
  const dataDir = mkdtempSync(join(tmpdir(), 'apexxi-test-'));
  const child = spawn(process.execPath, ['server/server.js'], {
    cwd,
    env: { ...process.env, PORT: String(port), APEX_DATA_DIR: dataDir, TOKEN_EPOCH: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => { log += d; });
  child.stderr.on('data', (d) => { log += d; });
  const url = `http://127.0.0.1:${port}`;
  let exited = false; child.on('exit', () => { exited = true; });
  for (let i = 0; i < 100; i++) {
    // our child must be the one answering: if it died (port taken), do not talk to whoever holds the port
    if (exited) break;
    try { const r = await fetch(`${url}/api/health`); if (r.ok && !exited) return { url, stop: () => child.kill(), log: () => log }; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  child.kill();
  throw new Error(`server did not start on ${port}\n${log}`);
}
