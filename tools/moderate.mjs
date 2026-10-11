/**
 * v190: act on a player report.
 *
 * Reports arrive in the support inbox (and server/data/reports.jsonl on the
 * server). When an account has to go — an offensive name, abuse — this
 * removes it and bars the name from being registered again:
 *
 *   ADMIN_KEY=… node tools/moderate.mjs remove <name> [--server https://fc27.onrender.com]
 *
 * It goes through the running server (POST /api/admin/remove) rather than the
 * database, because the server holds every account in memory and writes its
 * whole copy back: an edit made behind its back is overwritten within
 * seconds. The endpoint is off unless the service has ADMIN_KEY set (16+
 * characters, in Render → Environment), and this must send the same key.
 */
const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [cmd, name] = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--server');
const server = (flag('--server', 'https://fc27.onrender.com')).replace(/\/$/, '');
const key = process.env.ADMIN_KEY || '';

if (cmd !== 'remove' || !name) {
  console.error('usage: ADMIN_KEY=… node tools/moderate.mjs remove <name> [--server https://fc27.onrender.com]');
  process.exit(2);
}
if (key.length < 16) { console.error('Set ADMIN_KEY to the same value as the service (16+ characters).'); process.exit(2); }

const res = await fetch(`${server}/api/admin/remove`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
  body: JSON.stringify({ name }),
});
const body = await res.json().catch(() => ({}));
if (res.status === 404) { console.error('The server said no: ADMIN_KEY is not set on the service, or does not match.'); process.exit(1); }
if (!res.ok) { console.error(`Not removed: ${body.error || res.status}`); process.exit(1); }
console.log(`Removed ${name}. The name cannot be registered again.`);
