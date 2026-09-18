/** Start the real server on a spare port with a scratch data dir; returns { url, stop }. */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function startServer(port = 8400 + Math.floor(Math.random() * 400), { cwd = process.cwd() } = {}) {
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
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(`${url}/api/health`); if (r.ok) return { url, stop: () => child.kill(), log: () => log }; } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  child.kill();
  throw new Error(`server did not start on ${port}\n${log}`);
}
