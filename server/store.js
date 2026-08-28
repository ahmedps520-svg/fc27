/**
 * Account + cloud-save storage.
 *
 * The whole database is held in memory and flushed lazily to a backend. This is
 * a game for a handful of friends, not a service — but passwords still get
 * hashed properly (scrypt with a per-account salt) because storing them any
 * other way would be indefensible even here.
 *
 * Two backends, chosen by environment:
 *
 *   · Redis over HTTP  — used when UPSTASH_REDIS_REST_URL / _TOKEN are set.
 *     The whole database is one JSON string under one key. Plain `fetch`, so
 *     the zero-dependency setup survives.
 *   · A JSON file      — the default, for local play.
 *
 * The file backend is *not* durable on a free hosting tier: those filesystems
 * are wiped on every restart, sleep-wake and redeploy, taking accounts and
 * cloud saves with them. Anything hosted needs the Redis backend.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.join(__dirname, 'data');
const FILE = path.join(DIR, 'accounts.json');

const NAME_RE = /^[a-zA-Z0-9_.-]{3,16}$/;

const EMPTY = () => ({ accounts: {}, version: 1 });

let db = EMPTY();
let backend = null;

/* ------------------------------------------------------------------ *
 * Backends
 *
 * Each is { name, read(), write(db) }. `read` resolves to the stored
 * database, or null when there is nothing stored yet — and *throws* if it
 * could not tell the two apart, because starting empty on a failed read
 * would flush an empty database straight over the real one.
 * ------------------------------------------------------------------ */

function fileBackend() {
  return {
    name: `file (${path.relative(path.resolve(__dirname, '..'), FILE)})`,
    durable: false,
    async read() {
      fs.mkdirSync(DIR, { recursive: true });
      if (!fs.existsSync(FILE)) return null;
      return JSON.parse(fs.readFileSync(FILE, 'utf8'));
    },
    async write(data) {
      fs.mkdirSync(DIR, { recursive: true });
      const tmp = `${FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 1));
      fs.renameSync(tmp, FILE);     // atomic-ish: never leave a half-written file
    },
  };
}

/**
 * Upstash-style Redis REST: one POST per command, the command itself a JSON
 * array in the body. Sending the value in the body rather than the URL is what
 * lets the database be any size without worrying about URL limits.
 */
function redisBackend(url, token, key) {
  const base = url.replace(/\/+$/, '');

  const command = async (args) => {
    const res = await fetch(base, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(10000),
    });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
    if (!res.ok || (body && body.error)) {
      throw new Error(`redis ${args[0]} failed: ${res.status} ${(body && body.error) || text.slice(0, 200)}`);
    }
    return body ? body.result : null;
  };

  return {
    name: `redis (${base.replace(/^https?:\/\//, '')} key ${key})`,
    durable: true,
    async read() {
      const raw = await command(['GET', key]);
      if (raw == null) return null;
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    },
    async write(data) {
      await command(['SET', key, JSON.stringify(data)]);
    },
  };
}

/** Accepts the Upstash names and the two common aliases for the same pair. */
function pickBackend() {
  const env = process.env;
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || env.REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || env.REDIS_REST_TOKEN;
  if (url && token) return redisBackend(url, token, env.STORE_KEY || 'apexxi:accounts:v1');
  if (url || token) {
    throw new Error('Redis storage needs both a REST URL and a REST token; only one was set.');
  }
  return fileBackend();
}

/* ------------------------------------------------------------------ *
 * Writing
 *
 * Mutations mark the database dirty and return immediately; a debounced
 * writer drains it. A failed write keeps it dirty and retries with a
 * backoff, so a blip in the network costs a few seconds rather than an
 * account.
 * ------------------------------------------------------------------ */
const FLUSH_DELAY = 400;
const RETRY_MAX = 30000;

let dirty = false;
let writing = false;
let timer = null;
let retry = 1000;

function schedule(delay = FLUSH_DELAY) {
  if (timer || writing || !dirty) return;
  timer = setTimeout(drain, delay);
  if (timer.unref) timer.unref();
}

async function drain() {
  timer = null;
  if (writing || !dirty) return;
  writing = true;
  dirty = false;                 // anything changed from here on re-dirties
  try {
    await backend.write(db);
    retry = 1000;
  } catch (err) {
    dirty = true;
    console.error(`[store] write failed, retrying in ${retry / 1000}s:`, err.message);
  } finally {
    const wait = dirty ? retry : FLUSH_DELAY;
    if (dirty) retry = Math.min(retry * 2, RETRY_MAX);
    writing = false;
    schedule(wait);
  }
}

/** Mark the database changed. Cheap, and safe to call on every mutation. */
function flush() {
  dirty = true;
  schedule();
}

/**
 * Write out whatever is pending, right now, and wait for it. Called on the
 * way down: hosts send SIGTERM before a redeploy, and the debounce window
 * would otherwise take the last few seconds of play with it.
 */
async function shutdown(attempts = 3) {
  if (timer) { clearTimeout(timer); timer = null; }
  for (let i = 0; i < attempts && (dirty || writing); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await drain();
    if (timer) { clearTimeout(timer); timer = null; }
  }
  return !dirty;
}

/* ------------------------------------------------------------------ *
 * Accounts
 * ------------------------------------------------------------------ */
const hash = (pass, salt) => crypto.scryptSync(pass, salt, 32).toString('hex');
const newToken = () => crypto.randomBytes(24).toString('hex');
const key = (name) => name.toLowerCase();

/**
 * Read the database into memory. Must finish before the server accepts
 * traffic. Throws when the backend cannot be read: refusing to start is the
 * only safe answer, since serving from an empty database would hand every
 * player a "no account with that name" and then overwrite the real one.
 */
async function load() {
  backend = backend || pickBackend();
  let stored = null;
  try {
    stored = await backend.read();
  } catch (err) {
    if (backend.durable) throw new Error(`could not read accounts from ${backend.name}: ${err.message}`);
    // Local file: a missing or corrupt file is not worth refusing to boot over.
    console.error('[store] could not read accounts, starting empty:', err.message);
  }
  db = (stored && stored.accounts) ? stored : EMPTY();
  indexTokens();
  const count = Object.keys(db.accounts).length;
  console.log(`[store] ${backend.name} — ${count} account${count === 1 ? '' : 's'}`);
  if (!backend.durable && (process.env.RENDER || process.env.DYNO || process.env.FLY_APP_NAME)) {
    console.warn('[store] WARNING: storing accounts on a hosted filesystem. Free tiers wipe it on');
    console.warn('[store]          every restart or redeploy. Set UPSTASH_REDIS_REST_URL and');
    console.warn('[store]          UPSTASH_REDIS_REST_TOKEN to keep accounts and cloud saves.');
  }
  return db;
}

function register(name, pass) {
  if (!NAME_RE.test(name || '')) {
    return { error: 'Names are 3–16 characters: letters, numbers, . _ -' };
  }
  /* Eight for new accounts. Existing six-character passwords keep working —
   * locking players out of accounts they already have would be a worse
   * outcome than the marginal weakness of the ones already issued. */
  if (!pass || pass.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (/^(password|12345678|11111111|qwertyui|football)/i.test(pass)) {
    return { error: 'That password is too easy to guess.' };
  }
  if (db.accounts[key(name)]) return { error: 'That name is taken.' };

  const salt = crypto.randomBytes(16).toString('hex');
  const acct = {
    name,
    salt,
    hash: hash(pass, salt),
    token: newToken(),
    tokenAt: Date.now(),
    created: Date.now(),
    lastSeen: Date.now(),
    save: null,
    online: { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, divIdx: 0 },
  };
  db.accounts[key(name)] = acct;
  if (tokenIndex) tokenIndex.set(acct.token, acct);
  flush();
  return { account: acct };
}

function login(name, pass) {
  const acct = db.accounts[key(name || '')];
  if (!acct) return { error: 'No account with that name.' };
  const given = hash(pass || '', acct.salt);
  // constant-time compare so a wrong password can't be probed by timing
  const ok = given.length === acct.hash.length
    && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(acct.hash));
  if (!ok) return { error: 'Wrong password.' };

  if (tokenIndex && acct.token) tokenIndex.delete(acct.token);
  acct.token = newToken();               // fresh token each sign-in
  acct.tokenAt = Date.now();
  if (tokenIndex) tokenIndex.set(acct.token, acct);
  acct.lastSeen = Date.now();
  flush();
  return { account: acct };
}

/* Tokens expire, and are found by index rather than by scanning.
 *
 * TOKEN_TTL is long enough that an active player never notices — every
 * sign-in mints a fresh one — but it means a token that leaks (pasted into a
 * chat, lifted off a shared machine) stops working by itself rather than
 * being good forever. Setting TOKEN_EPOCH in the environment to any new value
 * invalidates every token issued before it: the "sign everybody out now"
 * button, for the day it is needed. */
const TOKEN_TTL = 60 * 24 * 60 * 60 * 1000;        // 60 days
const TOKEN_EPOCH = Number(process.env.TOKEN_EPOCH || 0);

let tokenIndex = null;
const indexTokens = () => {
  tokenIndex = new Map();
  for (const a of Object.values(db.accounts)) if (a.token) tokenIndex.set(a.token, a);
};

function byToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (!tokenIndex) indexTokens();
  const acct = tokenIndex.get(token);
  if (!acct || acct.token !== token) return null;
  const issued = acct.tokenAt || acct.created || 0;
  if (Date.now() - issued > TOKEN_TTL || issued < TOKEN_EPOCH) {
    // expired or revoked wholesale: drop it so the next call is a clean miss
    tokenIndex.delete(token);
    acct.token = null;
    return null;
  }
  return acct;
}

/**
 * Look an account up by name, for administration.
 *
 * `byToken` is what the server uses, because a request proves who it is with a
 * token and never with a name. This is the other direction and exists for
 * operator tools — `tools/set-apex.mjs` — which have a name and no token. It is
 * deliberately not reachable over HTTP: nothing in `server.js` calls it, and
 * adding an endpoint that took a name would be handing out an account
 * enumeration oracle.
 */
function accountByName(name) {
  return db.accounts[key(name || '')] || null;
}

function putSave(acct, save) {
  acct.save = save;
  acct.lastSeen = Date.now();
  flush();
}

function recordResult(acct, { scored, conceded, divIdx }) {
  const o = acct.online;
  o.played += 1;
  o.goalsFor += scored;
  o.goalsAgainst += conceded;
  if (scored > conceded) { o.wins += 1; o.points += 3; }
  else if (scored === conceded) { o.draws += 1; o.points += 1; }
  else o.losses += 1;
  if (typeof divIdx === 'number') o.divIdx = divIdx;
  flush();
  return o;
}

function leaderboard(limit = 25) {
  return Object.values(db.accounts)
    .filter((a) => a.online.played > 0)
    .sort((x, y) => y.online.points - x.online.points
      || (y.online.goalsFor - y.online.goalsAgainst) - (x.online.goalsFor - x.online.goalsAgainst)
      || y.online.wins - x.online.wins)
    .slice(0, limit)
    .map((a, i) => ({
      rank: i + 1,
      name: a.name,
      ...a.online,
      gd: a.online.goalsFor - a.online.goalsAgainst,
    }));
}

/** What the client is allowed to see about itself. */
const publicProfile = (a) => ({ name: a.name, online: a.online, created: a.created });

/** For the health endpoint: where accounts are going, and whether that lasts. */
const status = () => ({
  backend: backend ? backend.name : 'not loaded',
  durable: !!(backend && backend.durable),
  accounts: Object.keys(db.accounts).length,
  pendingWrite: dirty || writing,
});

module.exports = {
  load, shutdown, status,
  register, login, byToken, putSave, recordResult, leaderboard, publicProfile,
  // operator tools only — see the note on accountByName
  accountByName,
};
