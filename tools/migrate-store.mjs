/**
 * Copy the account database from one Redis to another.
 *
 * The whole store is a single key (`apexxi:accounts:v1` unless STORE_KEY says
 * otherwise), so a migration is one GET and one SET — which is the only reason
 * this is safe to do by hand. It exists for moving the server between regions:
 * a database that stays in Singapore while the server moves to Frankfurt adds
 * a round trip to every sign-in and every cloud save.
 *
 * Dry run by default. It reads the source, reports what it found, and refuses
 * to write until you pass --apply. It also refuses to overwrite a destination
 * that already holds accounts unless you pass --force, because the destination
 * being non-empty usually means the migration already happened and the players
 * have moved on — writing then would roll them back.
 *
 *   node tools/migrate-store.mjs \
 *     --from-url https://old.upstash.io --from-token OLD \
 *     --to-url https://new.upstash.io  --to-token NEW [--apply]
 *
 * Take the server down (or put the maintenance page up) while this runs.
 * Anything a player saves to the old database after the read is not copied.
 */
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith('--')) { args.set(a.slice(2), next); i++; } else args.set(a.slice(2), true);
}

const need = (name) => {
  const v = args.get(name);
  if (!v || v === true) { console.error(`missing --${name}`); process.exit(1); }
  return String(v);
};

const KEY = args.get('key') || process.env.STORE_KEY || 'apexxi:accounts:v1';
const apply = args.has('apply');
const force = args.has('force');

async function redis(url, token, command) {
  const res = await fetch(url.replace(/\/+$/, ''), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(20000),
  });
  const text = await res.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
  if (!res.ok || (body && body.error)) {
    throw new Error(`redis ${command[0]} failed: ${res.status} ${(body && body.error) || text.slice(0, 200)}`);
  }
  return body ? body.result : null;
}

const count = (raw) => {
  try {
    const db = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const accounts = db?.accounts || db;
    return Array.isArray(accounts) ? accounts.length : Object.keys(accounts || {}).length;
  } catch { return -1; }
};

const fromUrl = need('from-url'); const fromToken = need('from-token');
const toUrl = need('to-url'); const toToken = need('to-token');

const src = await redis(fromUrl, fromToken, ['GET', KEY]);
if (src == null) { console.error(`source has no ${KEY} — nothing to copy`); process.exit(1); }
const payload = typeof src === 'string' ? src : JSON.stringify(src);
console.log(`source      ${fromUrl}`);
console.log(`key         ${KEY}`);
console.log(`size        ${payload.length.toLocaleString()} bytes`);
console.log(`accounts    ${count(src)}`);

const dst = await redis(toUrl, toToken, ['GET', KEY]);
console.log(`destination ${toUrl}`);
console.log(`             ${dst == null ? 'empty' : `${count(dst)} accounts ALREADY THERE`}`);

if (dst != null && !force) {
  console.error('\nrefusing to overwrite a destination that already has accounts.');
  console.error('if that copy is stale and you are sure, re-run with --force.');
  process.exit(1);
}
if (!apply) { console.log('\ndry run — nothing written. re-run with --apply to copy.'); process.exit(0); }

await redis(toUrl, toToken, ['SET', KEY, payload]);
const check = await redis(toUrl, toToken, ['GET', KEY]);
const ok = (typeof check === 'string' ? check : JSON.stringify(check)) === payload;
console.log(ok ? '\ncopied and verified byte for byte.' : '\nWROTE, BUT THE READ BACK DIFFERS — check before switching over.');
process.exit(ok ? 0 : 1);
