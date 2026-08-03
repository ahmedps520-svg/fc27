/**
 * Account + cloud-save storage.
 *
 * A JSON file on disk, held in memory and flushed lazily. This is a game for a
 * handful of friends, not a service — but passwords still get hashed properly
 * (scrypt with a per-account salt) because storing them any other way would be
 * indefensible even here.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.join(__dirname, 'data');
const FILE = path.join(DIR, 'accounts.json');

const NAME_RE = /^[a-zA-Z0-9_.-]{3,16}$/;

let db = { accounts: {}, version: 1 };
let flushTimer = null;

function load() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      if (parsed && parsed.accounts) db = parsed;
    }
  } catch (err) {
    console.error('[store] could not read accounts, starting empty:', err.message);
  }
  return db;
}

function flush() {
  // debounce: a save can land on every match end, but the file is small
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    try {
      const tmp = `${FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
      fs.renameSync(tmp, FILE);         // atomic-ish: never leave a half-written file
    } catch (err) {
      console.error('[store] write failed:', err.message);
    }
  }, 400);
}

const hash = (pass, salt) => crypto.scryptSync(pass, salt, 32).toString('hex');
const newToken = () => crypto.randomBytes(24).toString('hex');
const key = (name) => name.toLowerCase();

function register(name, pass) {
  if (!NAME_RE.test(name || '')) {
    return { error: 'Names are 3–16 characters: letters, numbers, . _ -' };
  }
  if (!pass || pass.length < 6) return { error: 'Password must be at least 6 characters.' };
  if (db.accounts[key(name)]) return { error: 'That name is taken.' };

  const salt = crypto.randomBytes(16).toString('hex');
  const acct = {
    name,
    salt,
    hash: hash(pass, salt),
    token: newToken(),
    created: Date.now(),
    lastSeen: Date.now(),
    save: null,
    online: { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, divIdx: 0 },
  };
  db.accounts[key(name)] = acct;
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

  acct.token = newToken();               // fresh token each sign-in
  acct.lastSeen = Date.now();
  flush();
  return { account: acct };
}

function byToken(token) {
  if (!token) return null;
  for (const a of Object.values(db.accounts)) if (a.token === token) return a;
  return null;
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

module.exports = {
  load, register, login, byToken, putSave, recordResult, leaderboard, publicProfile,
};
