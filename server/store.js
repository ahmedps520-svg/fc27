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

// APEX_DATA_DIR: where accounts live. Tests point this at a scratch folder so
// a run can never touch the real server/data.
const DIR = process.env.APEX_DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DIR, 'accounts.json');

const NAME_RE = /^[a-zA-Z0-9_.-]{3,16}$/;

const EMPTY = () => ({ accounts: {}, guilds: {}, version: 1 });

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
  if (!db.guilds) db.guilds = {};
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
  for (const a of Object.values(db.accounts)) {
    if (a.token) tokenIndex.set(a.token, a);
    for (const e of a.extra || []) tokenIndex.set(e.token, a);
  }
};

function byToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (!tokenIndex) indexTokens();
  const acct = tokenIndex.get(token);
  if (!acct) return null;
  const paired = (acct.extra || []).find((e) => e.token === token);
  if (acct.token !== token && !paired) return null;
  const issued = paired ? paired.at : (acct.tokenAt || acct.created || 0);
  if (Date.now() - issued > TOKEN_TTL || issued < TOKEN_EPOCH) {
    // expired or revoked wholesale: drop it so the next call is a clean miss
    tokenIndex.delete(token);
    if (paired) acct.extra = acct.extra.filter((e) => e.token !== token);
    else acct.token = null;
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

/**
 * Issue a fresh token for an account without touching the one it already has.
 *
 * `login` rotates the token, which is right for a password sign-in: it ends
 * every other session. Pairing a watch must not do that — the phone that
 * authorised it has to stay signed in — so this mints a second credential and
 * indexes it alongside. The account carries `token` (the newest) plus `extra`
 * (the others), and every one of them expires on the same TTL.
 */
function mintToken(acct) {
  const token = newToken();
  acct.extra = (acct.extra || []).filter((e) => Date.now() - e.at < TOKEN_TTL).slice(-4);
  acct.extra.push({ token, at: Date.now() });
  if (tokenIndex) tokenIndex.set(token, acct);
  flush();
  return token;
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
  // the guild's week counts every member's validated result
  const g = acct.guild && db.guilds[acct.guild];
  if (g) {
    const w = guildWeek(g);
    w.matches += 1; w.goals += scored; if (scored > conceded) w.wins += 1;
    w.points += scored > conceded ? 3 : scored === conceded ? 1 : 0;
  }
  flush();
  return o;
}

/* ------------------------------------------------------------------ *
 * Guilds — clubs of players
 *
 * A guild is a name, a five-letter code to join by, a member list and a
 * tally per week. The week's objectives are the same for every guild and
 * every member claims each completed one once. Points are the members'
 * validated online results, so the board cannot be gamed without winning.
 * ------------------------------------------------------------------ */
const GUILD_NAME_RE = /^[a-zA-Z0-9 _.'-]{3,20}$/;
const weekId = (now = Date.now()) => {
  const d = new Date(now); const day = (d.getUTCDay() + 6) % 7;      // Monday = 0
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
};
const GUILD_OBJECTIVES = [
  { id: 'wins', need: 15, text: 'Win 15 online matches together', pack: 'gold', apex: 1500 },
  { id: 'goals', need: 40, text: 'Score 40 goals between you', pack: 'silver', apex: 1000 },
  { id: 'matches', need: 30, text: 'Play 30 online matches as a guild', pack: 'gold', apex: 1200 },
];
function guildWeek(g, id = weekId()) {
  if (!g.weeks) g.weeks = {};
  const w = g.weeks[id] || (g.weeks[id] = { matches: 0, goals: 0, wins: 0, points: 0, claimed: {} });
  // keep the last four weeks
  const keys = Object.keys(g.weeks).sort();
  while (keys.length > 4) delete g.weeks[keys.shift()];
  return w;
}
const guildCode = () => { let c = ''; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for (let i = 0; i < 5; i++) c += A[crypto.randomInt(A.length)]; return c; };
function createGuild(acct, name) {
  if (acct.guild && db.guilds[acct.guild]) return { error: 'You are already in a guild. Leave it first.' };
  name = String(name || '').trim();
  if (!GUILD_NAME_RE.test(name)) return { error: 'A guild name is 3–20 letters, numbers or spaces.' };
  if (Object.values(db.guilds).some((g) => g.name.toLowerCase() === name.toLowerCase())) return { error: 'That guild name is taken.' };
  let code = guildCode();
  while (db.guilds[code]) code = guildCode();
  const g = { code, name, tag: name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'GLD', created: Date.now(), owner: acct.name, members: [acct.name], weeks: {} };
  db.guilds[code] = g;
  acct.guild = code;
  flush();
  return { guild: g };
}
function joinGuild(acct, code) {
  if (acct.guild && db.guilds[acct.guild]) return { error: 'You are already in a guild. Leave it first.' };
  const g = db.guilds[String(code || '').toUpperCase().trim()];
  if (!g) return { error: 'No guild with that code.' };
  if (g.members.length >= 30) return { error: 'That guild is full (30).' };
  if (!g.members.includes(acct.name)) g.members.push(acct.name);
  acct.guild = g.code;
  flush();
  return { guild: g };
}
function leaveGuild(acct) {
  const g = acct.guild && db.guilds[acct.guild];
  acct.guild = null;
  if (g) {
    g.members = g.members.filter((n) => n !== acct.name);
    if (!g.members.length) delete db.guilds[g.code];
    else if (g.owner === acct.name) g.owner = g.members[0];
  }
  flush();
  return { ok: true };
}
/** What a member sees: the guild, this week's objectives with progress and what they can claim, the board rank. */
function guildView(acct, onlineNames = new Set()) {
  const g = acct.guild && db.guilds[acct.guild];
  if (!g) return { guild: null, objectives: GUILD_OBJECTIVES.map((o) => ({ ...o, have: 0 })) };
  const id = weekId();
  const w = guildWeek(g, id);
  const board = guildBoard(200, id);
  const rank = board.findIndex((r) => r.code === g.code) + 1;
  return {
    guild: { code: g.code, name: g.name, tag: g.tag, owner: g.owner, members: g.members.map((n) => ({ name: n, online: onlineNames.has(n), points: db.accounts[key(n)]?.online?.points || 0 })) },
    week: { id, ...w, claimed: undefined },
    objectives: GUILD_OBJECTIVES.map((o) => {
      const have = Math.min(o.need, w[o.id] || 0);
      const complete = have >= o.need;
      const claimed = !!(w.claimed[o.id] && w.claimed[o.id].includes(acct.name));
      return { ...o, have, complete, claimed, claimable: complete && !claimed };
    }),
    rank, guilds: board.length,
  };
}
function claimGuildObjective(acct, objId) {
  const g = acct.guild && db.guilds[acct.guild];
  if (!g) return { error: 'Not in a guild.' };
  const o = GUILD_OBJECTIVES.find((x) => x.id === objId);
  if (!o) return { error: 'No such objective.' };
  const w = guildWeek(g);
  if ((w[o.id] || 0) < o.need) return { error: 'Not complete yet.' };
  w.claimed[o.id] = w.claimed[o.id] || [];
  if (w.claimed[o.id].includes(acct.name)) return { error: 'Already claimed.' };
  w.claimed[o.id].push(acct.name);
  flush();
  return { reward: { pack: o.pack, apex: o.apex, title: `Guild: ${o.text}` } };
}
function guildBoard(limit = 25, id = weekId()) {
  return Object.values(db.guilds)
    .map((g) => ({ code: g.code, name: g.name, tag: g.tag, members: g.members.length, ...(g.weeks?.[id] || { matches: 0, goals: 0, wins: 0, points: 0 }) }))
    .sort((x, y) => y.points - x.points || y.wins - x.wins || y.goals - x.goals || x.name.localeCompare(y.name))
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, code: r.code, name: r.name, tag: r.tag, members: r.members, points: r.points, wins: r.wins, goals: r.goals, matches: r.matches }));
}

/* ------------------------------------------------------------------ *
 * Friends — a list of names on the account. Adding is one-way (you can
 * follow anyone by name); the list itself is what the invites and the
 * spectating go through. No messages, ever.
 * ------------------------------------------------------------------ */
function addFriend(acct, name) {
  const other = db.accounts[key(name || '')];
  if (!other) return { error: 'No player with that name.' };
  if (other === acct) return { error: 'That is you.' };
  acct.friends = acct.friends || [];
  if (acct.friends.length >= 50) return { error: 'Fifty friends is the limit.' };
  if (!acct.friends.includes(other.name)) acct.friends.push(other.name);
  flush();
  return { ok: true };
}
function removeFriend(acct, name) {
  acct.friends = (acct.friends || []).filter((n) => n.toLowerCase() !== String(name || '').toLowerCase());
  flush();
  return { ok: true };
}
/** The list with live status; `live(name)` is the hub's view of who is where. */
function friendsView(acct, live = () => null) {
  return (acct.friends || []).map((n) => {
    const a = db.accounts[key(n)];
    const st = live(n) || {};
    return { name: n, points: a?.online?.points || 0, guild: a?.guild ? db.guilds[a.guild]?.tag || null : null, online: !!st.online, hosting: st.hosting || null, inMatch: st.matchId || null };
  });
}

/* Weekend League: per-account tallies keyed by the weekend id, written only
 * from validated host results (see the 'result' handler). Ten count. */
function recordWeekend(acct, id, won) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
  if (!acct.weekend) acct.weekend = {};
  const w = acct.weekend[id] || (acct.weekend[id] = { played: 0, wins: 0 });
  if (w.played >= 10) return w;
  w.played += 1;
  if (won) w.wins += 1;
  // keep the last four weekends only
  const keys = Object.keys(acct.weekend).sort();
  while (keys.length > 4) delete acct.weekend[keys.shift()];
  flush();
  return w;
}

function weekendBoard(id, limit = 25) {
  return Object.values(db.accounts)
    .filter((a) => a.weekend?.[id]?.played)
    .map((a) => ({ name: a.name, ...a.weekend[id] }))
    .sort((x, y) => y.wins - x.wins || x.played - y.played || x.name.localeCompare(y.name))
    .slice(0, limit);
}

/* v82: skill games. One best per game per account, bounded by what the
   drill can actually produce (see js/game/drills.js), so an edited client
   cannot top the board with a number no drill could score. */
const SKILL_MAX = { slalom: 1600, freekicks: 750, crossing: 900, passing: 12000 };
function recordSkill(acct, game, score) {
  if (!Object.prototype.hasOwnProperty.call(SKILL_MAX, game)) return null;
  const n = Math.floor(Number(score));
  if (!Number.isFinite(n) || n < 0 || n > SKILL_MAX[game]) return null;
  if (!acct.skills) acct.skills = {};
  if ((acct.skills[game] || 0) >= n) return acct.skills[game];
  acct.skills[game] = n;
  flush();
  return n;
}
function skillBoard(game, limit = 20) {
  if (!Object.prototype.hasOwnProperty.call(SKILL_MAX, game)) return [];
  return Object.values(db.accounts)
    .filter((a) => a.skills?.[game])
    .map((a) => ({ name: a.name, score: a.skills[game] }))
    .sort((x, y) => y.score - x.score || x.name.localeCompare(y.name))
    .slice(0, limit);
}

/* v82: a co-op season — two friends, one team, ten matches, points */
function recordCoop(acct, pair, scored, conceded) {
  if (!/^[A-Za-z0-9_+-]{3,60}$/.test(pair)) return null;
  acct.coop = acct.coop || {};
  const c = acct.coop[pair] || (acct.coop[pair] = { season: 1, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, best: 0 });
  if (c.played >= 10) { c.best = Math.max(c.best, c.pts); Object.assign(c, { season: c.season + 1, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }); }
  c.played += 1; c.gf += scored; c.ga += conceded;
  if (scored > conceded) { c.w += 1; c.pts += 3; } else if (scored === conceded) { c.d += 1; c.pts += 1; } else c.l += 1;
  const keys = Object.keys(acct.coop); while (keys.length > 6) delete acct.coop[keys.shift()];
  flush();
  return c;
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
const publicProfile = (a) => ({ name: a.name, online: a.online, created: a.created, guild: a.guild || null, coop: a.coop || {} });

/** For the health endpoint: where accounts are going, and whether that lasts. */
const status = () => ({
  backend: backend ? backend.name : 'not loaded',
  durable: !!(backend && backend.durable),
  accounts: Object.keys(db.accounts).length,
  pendingWrite: dirty || writing,
});

module.exports = {
  mintToken,
  load, shutdown, status,
  register, login, byToken, putSave, recordResult, leaderboard, publicProfile,
  recordWeekend, weekendBoard, recordSkill, skillBoard, SKILL_MAX, recordCoop,
  createGuild, joinGuild, leaveGuild, guildView, claimGuildObjective, guildBoard, weekId,
  addFriend, removeFriend, friendsView,
  // operator tools only — see the note on accountByName
  accountByName,
};
