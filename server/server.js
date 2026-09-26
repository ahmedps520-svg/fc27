/**
 * APEX XI online server.
 *
 * One process does three jobs:
 *   1. serves the static game (so there's a single thing to run)
 *   2. a small JSON API for accounts and cloud saves
 *   3. a websocket hub that pairs players and relays match traffic
 *
 * The hub deliberately does not simulate anything. One of the two players is
 * elected host and runs the authoritative match; the server only forwards
 * snapshots one way and inputs the other. That keeps the server cheap and means
 * the physics stay byte-identical to an offline match.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const ws = require('./ws');
const store = require('./store');
const guard = require('./guard');
const mm = require('./matchmaking');
const shop = require('./shop');

const ROOT = path.resolve(__dirname, '..');
// Hosting platforms inject the port they want you on; locally an argument wins.
const PORT = Number(process.env.PORT) || Number(process.argv[2]) || 8412;
// Set when the game is served from somewhere else (e.g. GitHub Pages) and only
// the API and match hub live here. Comma-separated, or '*' to allow any origin.
const ALLOWED = (process.env.ALLOW_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
};

/* ------------------------------------------------------------------ *
 * Build identity
 *
 * A short hash of everything the browser is served. It changes when — and only
 * when — the code changes, which is what the client needs to know whether the
 * copy it has cached is the current one.
 *
 * Deliberately not the process start time and not a deploy timestamp: this host
 * spins down when idle, and a restart with identical code must not tell every
 * player there is an update. Deliberately not a hand-bumped constant either,
 * because the whole point is that pushing a commit is enough.
 * ------------------------------------------------------------------ */
const BUILD_DIRS = ['js', 'styles'];
const BUILD_FILES = ['index.html', 'notes.html', 'sw.js', 'manifest.webmanifest'];

function computeBuild() {
  const h = crypto.createHash('sha256');
  const walk = (dir) => {
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    // sorted, or two machines hashing the same tree disagree
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(js|mjs|css|html|json|webmanifest)$/i.test(e.name)) {
        h.update(path.relative(ROOT, full));
        try { h.update(fs.readFileSync(full)); } catch { /* unreadable, skip */ }
      }
    }
  };
  for (const d of BUILD_DIRS) walk(path.join(ROOT, d));
  for (const f of BUILD_FILES) {
    const full = path.join(ROOT, f);
    h.update(f);
    try { h.update(fs.readFileSync(full)); } catch { /* not present */ }
  }
  return h.digest('hex').slice(0, 12);
}

const BUILD = computeBuild();

/* Crash log: one JSON line per report, in the data directory next to the
 * accounts (so it is on the same disk and under the same gitignore), capped so
 * it can never grow past a few megabytes — the oldest half is dropped when it
 * does. Read it with `tail -f server/data/crashes.log`. */
const DATA_DIR = process.env.APEX_DATA_DIR || path.join(__dirname, 'data');
const CRASH_FILE = path.join(DATA_DIR, 'crashes.log');
const CRASH_MAX = 4 * 1024 * 1024;
function crashLog(line) {
  try {
    fs.mkdirSync(path.dirname(CRASH_FILE), { recursive: true });
    fs.appendFileSync(CRASH_FILE, line + '\n');
    const st = fs.statSync(CRASH_FILE);
    if (st.size > CRASH_MAX) {
      const all = fs.readFileSync(CRASH_FILE, 'utf8');
      fs.writeFileSync(CRASH_FILE, all.slice(all.length / 2).replace(/^[^\n]*\n/, ''));
    }
  } catch (e) { console.warn('[crash] could not write report:', e.message); }
  console.warn('[crash]', line.slice(0, 200));
}

/* Watch pairing codes, in memory: a code that does not survive a restart is a
 * code an attacker cannot grind across one. */
// v135: order references already emailed (in memory; a restart forgets, which only allows one repeat)
const seenRefs = new Set();
const PAIR_TTL = 3 * 60 * 1000;
const pairings = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [code, e] of pairings) if (now - e.at > PAIR_TTL) pairings.delete(code);
}, 60 * 1000).unref();

/* ------------------------------------------------------------------ *
 * HTTP: JSON API + static files
 * ------------------------------------------------------------------ */
const json = (res, code, body) => {
  const buf = Buffer.from(JSON.stringify(body), 'utf8');
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': buf.length,
    'Cache-Control': 'no-store',
  });
  res.end(buf);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (c) => {
    raw += c;
    if (raw.length > 512 * 1024) { reject(new Error('too large')); req.destroy(); }
  });
  req.on('end', () => {
    // v87: only an object is a body — an array, a number or a string is treated as empty
    try { const o = raw ? JSON.parse(raw) : {}; resolve(o && typeof o === 'object' && !Array.isArray(o) ? o : {}); } catch { reject(new Error('bad json')); }
  });
  req.on('error', reject);
});

const authOf = (req) => store.byToken((req.headers.authorization || '').replace(/^Bearer /, ''));

async function api(req, res, route) {
  // a blanket ceiling on every endpoint, so no single address can occupy the
  // box that is also running live matches
  if (!guard.apiAllowed(req)) return json(res, 429, { error: 'Too many requests. Wait a moment.' });

  if (route === '/api/register' || route === '/api/login') {
    const body = await readBody(req);
    // v87 (fuzzing): a name or password that is not a string is not a sign-in
    if (typeof body.name !== 'string' || typeof body.pass !== 'string' || body.name.length > 64 || body.pass.length > 256) {
      return json(res, 400, { error: 'Name and password, please.' });
    }
    /* Sign-in is the expensive endpoint (scrypt by design) and the one worth
     * guessing at, so it is limited per address and per account name both.
     * The message is deliberately the same either way: telling an attacker
     * *which* limit they hit is telling them whether the account exists. */
    const gate = route === '/api/register'
      ? guard.registerAllowed(req)
      : guard.loginAllowed(req, body.name);
    if (!gate) {
      console.warn(`[guard] ${route} throttled for ${guard.clientIP(req)}`);
      return json(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
    }
    const r = route === '/api/register'
      ? store.register(body.name, body.pass)
      : store.login(body.name, body.pass);
    if (r.error) {
      // a wrong password is what costs; a correct one never counts against you
      if (route === '/api/login') guard.loginFailed(req, body.name);
      return json(res, 400, { error: r.error });
    }
    return json(res, 200, {
      token: r.account.token,
      profile: store.publicProfile(r.account),
      save: r.account.save,
    });
  }

  if (route === '/api/me') {
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    return json(res, 200, { profile: store.publicProfile(acct), save: acct.save });
  }

  if (route === '/api/save') {
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    if (req.method === 'GET') return json(res, 200, { save: acct.save });
    if (!guard.saveAllowed(acct.name)) return json(res, 429, { error: 'Saving too often.' });
    const body = await readBody(req);
    /* The client is authoritative about its own progress and always will be —
     * but "authoritative" is not "unbounded". The save is checked against what
     * playing the game can actually produce, and anything outside that is
     * clamped and logged rather than trusted or rejected outright. */
    const since = Date.now() - (acct.lastSeen || acct.created || Date.now());
    // the rolling gain budget lives on the account, server-side: a client that
    // can edit its own save must not be able to edit the thing measuring it
    acct.guard = acct.guard || { since: 0, spent: 0 };
    const { save, notes } = guard.sanitiseSave(body.save ?? null, acct.save, since, acct.guard);
    if (notes.length) console.warn(`[guard] save from ${acct.name}: ${notes.join('; ')}`);
    store.putSave(acct, save);
    return json(res, 200, { ok: true });
  }

  /* ------------------------- watch pairing -------------------------- *
   * Typing a password on a watch is miserable, so the phone vouches for the
   * watch instead: a signed-in phone asks for a code, the code is read out on
   * the watch, and the watch is handed its own token.
   *
   * The code is the weak point by construction — six digits, entered by a
   * human — so it is defended by being short-lived (three minutes), single
   * use, thrown away on the first wrong guess against it, and rate limited on
   * both sides. A token minted this way is an ordinary token for that account;
   * it does not carry the phone's, so signing out on one does not disturb the
   * other. */
  if (route === '/api/pair/new') {
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    if (!guard.allow(`pair:new:${acct.name}`, 5, 1 / 30)) return json(res, 429, { error: 'Slow down.' });
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    pairings.set(code, { name: acct.name, at: Date.now() });
    return json(res, 200, { code, expires: PAIR_TTL / 1000 });
  }

  if (route === '/api/pair/claim') {
    const body = await readBody(req);
    if (!guard.allow(`pair:claim:${guard.clientIP(req)}`, 10, 1 / 60)) {
      return json(res, 429, { error: 'Too many attempts.' });
    }
    const code = String(body.code || '').replace(/\D/g, '');
    const entry = pairings.get(code);
    pairings.delete(code);                       // one use, right or wrong
    if (!entry || Date.now() - entry.at > PAIR_TTL) {
      return json(res, 400, { error: 'That code has expired. Get a new one on your phone.' });
    }
    const acct = store.accountByName(entry.name);
    if (!acct) return json(res, 400, { error: 'That account is gone.' });
    const token = store.mintToken(acct);
    return json(res, 200, { token, profile: store.publicProfile(acct), save: acct.save });
  }

  /* Crash reports from the client's error boundary. Kept deliberately dumb:
   * a bounded line in a log file, no storage of who, nothing echoed back.
   * Rate-limited per address so a broken build cannot fill the disk, and the
   * body is truncated rather than rejected — a report that arrives clipped is
   * still a report. */
  if (route === '/api/crash') {
    if (req.method !== 'POST') return json(res, 405, { error: 'POST' });
    if (!guard.crashAllowed(req)) return json(res, 429, { ok: false });
    const body = await readBody(req).catch(() => ({}));
    const line = JSON.stringify({
      at: new Date().toISOString(),
      build: BUILD,
      v: String(body.version || '').slice(0, 12),
      msg: String(body.message || '').slice(0, 300),
      stack: String(body.stack || '').slice(0, 1200),
      where: String(body.where || '').slice(0, 80),
      ua: String(req.headers['user-agent'] || '').slice(0, 160),
    });
    crashLog(line);
    return json(res, 202, { ok: true });
  }

  /* v129: a test-mode purchase. Priced here from the server's own table, one
   * email to the store inbox per order, a running test balance. No card data
   * is sent to this route or kept by it, and nothing is granted. */
  if (route === '/api/purchase') {
    if (req.method !== 'POST') return json(res, 405, { error: 'POST' });
    /* v135: signed-in players only, and few of them — every order is an email
       to the store's inbox, and an open endpoint was a way to fill it. Three
       an hour per account, five an hour per address, and an order reference
       is emailed once however many times it is sent. */
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Sign in to make a test purchase.' });
    if (!guard.allow(`buy:ip:${guard.clientIP(req)}`, 5, 5 / 3600)) return json(res, 429, { error: 'Too many purchases from here. Try again later.' });
    if (!guard.allow(`buy:acct:${acct.name}`, 3, 3 / 3600)) return json(res, 429, { error: 'Three test purchases an hour. Try again later.' });
    const body = await readBody(req).catch(() => ({}));
    const bundle = shop.bundleById(String(body.bundle || ''));
    const ref = String(body.ref || '');
    if (!bundle || !shop.REF_RE.test(ref)) return json(res, 400, { error: 'Unknown order.' });
    if (seenRefs.has(ref)) return json(res, 200, { ok: true, ref, test: true, mail: 'duplicate' });
    seenRefs.add(ref); if (seenRefs.size > 5000) seenRefs.delete(seenRefs.values().next().value);
    const club = String(body.club || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 40);
    const balance = shop.recordSale(DATA_DIR, bundle.cents);
    const mail = shop.purchaseEmail({ bundle, ref, club, player: acct ? store.publicProfile(acct).name : '', balance });
    // v130: wait for the mail (bounded), and say how it went — the receipt shows it,
    // so a refused send is visible without reading the server's logs
    const mailed = await Promise.race([
      shop.sendMail({ ...mail, ref }, { dataDir: DATA_DIR }).then((r) => r.via, (e) => `failed: ${String(e.message).slice(0, 160)}`),
      new Promise((r) => setTimeout(() => r('pending'), 8000)),
    ]);
    console.log(`[shop] ${ref} ${shop.usd(bundle.cents)} mail: ${mailed}`);
    return json(res, 200, { ok: true, ref, test: true, mail: mailed });
  }

  if (route === '/api/weekend') {
    const id = String(new URL(req.url, 'http://x').searchParams.get('id') || '').slice(0, 10);
    return json(res, 200, { id, rows: store.weekendBoard(id) });
  }

  // v82: skill-game boards — read by anyone, written with a token, bounded by the store
  if (route === '/api/skills') {
    if (req.method === 'GET') {
      const game = String(new URL(req.url, 'http://x').searchParams.get('game') || '').slice(0, 16);
      return json(res, 200, { game, rows: store.skillBoard(game) });
    }
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    if (!guard.saveAllowed(acct.name)) return json(res, 429, { error: 'Too often.' });
    const body = await readBody(req);
    const best = store.recordSkill(acct, String(body.game || ''), body.score);
    if (best == null) return json(res, 400, { error: 'Not a score.' });
    return json(res, 200, { best });
  }

  if (route === '/api/leaderboard') {
    return json(res, 200, { rows: store.leaderboard(25) });
  }

  /* ---- social: guilds, friends, live matches ----
   * All behind a token. Nothing here carries free text between players: a
   * guild name is the only string a player writes, it is validated to
   * letters, numbers and spaces, and it is shown to their own guild. */
  if (route === '/api/guild') {
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    if (req.method === 'GET') return json(res, 200, store.guildView(acct, new Set(peers.keys())));
    const body = await readBody(req);
    const r = body.action === 'create' ? store.createGuild(acct, body.name)
      : body.action === 'join' ? store.joinGuild(acct, body.code)
      : body.action === 'leave' ? store.leaveGuild(acct)
      : body.action === 'claim' ? store.claimGuildObjective(acct, body.id)
      : { error: 'Unknown action.' };
    if (r.error) return json(res, 400, r);
    return json(res, 200, { ...r, view: store.guildView(acct, new Set(peers.keys())) });
  }
  if (route === '/api/guild/board') {
    return json(res, 200, { week: store.weekId(), rows: store.guildBoard(25) });
  }
  if (route === '/api/friends') {
    const acct = authOf(req);
    if (!acct) return json(res, 401, { error: 'Signed out.' });
    const live = (name) => { const p = peers.get(name); return p ? { online: true, hosting: p.room || null, matchId: p.matchId || null } : null; };
    if (req.method === 'GET') return json(res, 200, { rows: store.friendsView(acct, live) });
    const body = await readBody(req);
    const r = body.action === 'add' ? store.addFriend(acct, body.name) : body.action === 'remove' ? store.removeFriend(acct, body.name) : { error: 'Unknown action.' };
    if (r.error) return json(res, 400, r);
    return json(res, 200, { rows: store.friendsView(acct, live) });
  }
  if (route === '/api/live') {
    const rows = [];
    for (const p of peers.values()) if (p.isHost && p.opponent && p.matchId) rows.push({ matchId: p.matchId, host: p.name, guest: p.opponent.name, spectators: p.spectators ? p.spectators.size : 0 });
    return json(res, 200, { rows: rows.slice(0, 50) });
  }

  // Somewhere to look when accounts go missing: says where they are being
  // stored and whether that storage survives a restart.
  if (route === '/api/health') {
    return json(res, 200, {
      ok: true, build: BUILD, uptime: Math.round(process.uptime()), store: store.status(), mail: shop.mailMode(),
    });
  }

  // What the client polls on boot to decide whether it is running current code.
  if (route === '/api/version') {
    return json(res, 200, { build: BUILD });
  }

  // Lists whatever models have been dropped into assets/candidates, so the
  // preview page picks them up without anyone editing a list by hand.
  if (route === '/api/models') {
    const dir = path.join(ROOT, 'assets', 'candidates');
    let files = [];
    try {
      files = fs.readdirSync(dir)
        .filter((f) => /\.(glb|gltf)$/i.test(f))
        .map((f) => ({ file: f, bytes: fs.statSync(path.join(dir, f)).size }));
    } catch { /* folder not created yet */ }
    return json(res, 200, { models: files });
  }

  return json(res, 404, { error: 'No such endpoint.' });
}

/** Cross-origin headers, only when a front end elsewhere has been allowed. */
function cors(req, res) {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED.length) return;
  const ok = ALLOWED.includes('*') || ALLOWED.includes(origin);
  if (!ok) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/* Headers on every page.
 *
 * `frame-ancestors 'none'` is the one that matters most here: without it any
 * site can put the game in an invisible iframe over its own buttons and
 * harvest clicks from a signed-in player. The CSP is written around what the
 * game actually does — its own scripts, its own styles, inline `style=`
 * attributes on generated markup, data: images for generated art, and no
 * outbound connections beyond its own origin (wss included, for the hub).
 * `object-src 'none'` and `base-uri 'self'` close the two classic injection
 * escapes. Nothing here changes what the game can do; it changes what a page
 * that manages to inject something could do with it. */
/* The pages carry inline scripts that the game cannot do without — the import
 * map in index.html above all, which is inline because import maps have to be
 * (an external one is not supported widely enough to ship). Rather than open
 * the policy with 'unsafe-inline', every inline block is hashed at boot and
 * the hashes are named in the policy: exactly these scripts, nothing else.
 *
 * This is computed from the files on disk, so editing an inline block updates
 * its hash on the next restart and no one has to remember. The first cut of
 * this shipped without it and the game did not boot at all past the splash —
 * which is the honest argument for testing a CSP against the real app rather
 * than reading it and nodding. */
function inlineScriptHashes() {
  const out = new Set();
  for (const f of ['index.html', 'notes.html', 'watch.html']) {
    let html = '';
    try { html = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      out.add(`'sha256-${crypto.createHash('sha256').update(m[1], 'utf8').digest('base64')}'`);
    }
  }
  return [...out].join(' ');
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHashes()}`,
    "worker-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    // blob: because the scanned player models hand their textures to fetch() as blob URLs
    "connect-src 'self' ws: wss: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

/* v100 (security review): what the site serves, by name. The static
 * server used to hand out anything under the repo root except server/data —
 * .git (the whole history), the server's source, tests, tools and HANDOFF
 * were all a GET away. Now only the game's own files are: the pages at the
 * top level, and four directories. Anything else is a 404, not a 403, so a
 * probe learns nothing about what exists. */
const PUBLIC_FILES = new Set(['index.html', 'notes.html', 'watch.html', 'landing.html', 'maintenance.html',
  'model-preview.html', 'manifest.webmanifest', 'sw.js', 'events.json', 'LICENSE']);
const PUBLIC_DIRS = ['js', 'styles', 'assets', 'icons'];
function isPublic(rel) {
  const parts = rel.split(/[\\/]+/).filter(Boolean);
  if (!parts.length || parts.some((p) => p.startsWith('.'))) return false;   // no dotfiles anywhere
  return parts.length === 1 ? PUBLIC_FILES.has(parts[0]) : PUBLIC_DIRS.includes(parts[0]);
}

const server = http.createServer((req, res) => {
  /* v100: a malformed escape ("/%E0%A4%A") threw here, outside any handler,
   * and one request took the whole process down with every live match on it. */
  let route;
  try { route = decodeURIComponent(req.url.split('?')[0]); } catch { res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request'); return; }

  if (route.startsWith('/api/')) {
    cors(req, res);
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
    /* v87: a malformed request is the client's fault and says so plainly;
     * anything else is ours — logged here, and never echoed back, because an
     * exception message is a map of the server's insides. */
    api(req, res, route).catch((err) => {
      const msg = String(err?.message || '');
      if (msg === 'too large') return json(res, 413, { error: 'Request too large.' });
      if (msg === 'bad json') return json(res, 400, { error: 'Malformed request.' });
      console.error(`[api] ${route}:`, err);
      return json(res, 500, { error: 'Server error.' });
    });
    return;
  }

  const alias = { '/': 'index.html', '/watch': 'watch.html', '/watch/': 'watch.html' };
  let file = path.join(ROOT, alias[route] || route);
  // v100: inside the root means the root plus a separator; a bare prefix let "/../fc27-x" through
  const resolved = path.resolve(file);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  if (!isPublic(path.relative(ROOT, resolved))) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
  // the account database is not part of the served site
  if (path.resolve(file).startsWith(path.join(__dirname, 'data'))) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) file = path.join(file, 'index.html');
    serveStatic(req, res, file);
  });
});

/* ------------------------------------------------------------------ *
 * Static files: compressed, and revalidated rather than refetched
 *
 * Two things this used to get wrong, and both were paid for on every load.
 * Every response was `no-store`, so a returning player downloaded the whole
 * module graph again — three.js alone is 1.3 MB — and nothing was compressed,
 * so it went over the wire at that size. Now text assets are gzipped once
 * (kept in memory, keyed on the file's mtime so an edit invalidates it) and
 * every file carries an ETag with `no-cache`: the browser still asks every
 * time, which is what keeps updates immediate, but the answer to an unchanged
 * file is a 304 and no bytes. The service worker's network-first rule sees
 * exactly the same freshness it did before.
 * ------------------------------------------------------------------ */
const COMPRESSIBLE = /\.(js|mjs|css|html|json|svg|txt|md|webmanifest|glb|gltf|bin)$/i;
const gzCache = new Map();          // file -> { mtime, size, etag, raw, gz }
const GZ_CACHE_MAX = 64 * 1024 * 1024;
let gzCacheBytes = 0;

function serveStatic(req, res, file) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ETag: etag,
      Vary: 'Accept-Encoding',
      ...SECURITY_HEADERS,
    };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers).end(); return; }
    const wantGz = /\bgzip\b/.test(req.headers['accept-encoding'] || '') && COMPRESSIBLE.test(file) && st.size > 1024;
    const cached = gzCache.get(file);
    if (wantGz && cached && cached.mtime === st.mtimeMs && cached.size === st.size) {
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': cached.gz.length });
      res.end(cached.gz);
      return;
    }
    fs.readFile(file, (err2, buf) => {
      if (err2) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
      if (!wantGz) { res.writeHead(200, { ...headers, 'Content-Length': buf.length }); res.end(buf); return; }
      zlib.gzip(buf, { level: 6 }, (err3, gz) => {
        if (err3) { res.writeHead(200, { ...headers, 'Content-Length': buf.length }); res.end(buf); return; }
        if (cached) gzCacheBytes -= cached.gz.length;
        if (gzCacheBytes + gz.length > GZ_CACHE_MAX) { gzCache.clear(); gzCacheBytes = 0; }
        gzCache.set(file, { mtime: st.mtimeMs, size: st.size, etag, gz });
        gzCacheBytes += gz.length;
        res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': gz.length });
        res.end(gz);
      });
    });
  });
}

/* ------------------------------------------------------------------ *
 * WebSocket hub: presence, matchmaking, relay
 * ------------------------------------------------------------------ */
const peers = new Map();      // name -> peer
let queue = [];               // peers waiting for a division opponent
const rooms = new Map();      // code -> peer (private lobbies)
let matchSeq = 1;

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

function leaveQueue(peer) {
  queue = queue.filter((p) => p !== peer);
  if (peer.room && rooms.get(peer.room) === peer) rooms.delete(peer.room);
  peer.room = null;
}

function endMatch(peer, reason) {
  const other = peer.opponent;
  const host = peer.isHost ? peer : other;
  peer.opponent = null;
  peer.matchId = null;
  if (other) {
    other.opponent = null;
    other.matchId = null;
    other.sock.send({ t: 'oppLeft', reason });
  }
  if (host?.spectators) {
    for (const sp of host.spectators) { sp.watching = null; if (sp.sock.open) sp.sock.send({ t: 'oppLeft', reason: 'ended' }); }
    host.spectators = null;
  }
}
function unspectate(peer) {
  const host = peer.watching;
  if (host?.spectators) { host.spectators.delete(peer); tellSpectators(host); }
  peer.watching = null;
}
/* The host is told how many are watching. It matters: a match that has gone
 * browser-to-browser sends nothing through here, and the host has to start
 * copying its picture up again for the watchers (see the snapshot send in
 * play.js). */
function tellSpectators(host) {
  if (host.sock.open) host.sock.send({ t: 'spectators', n: host.spectators ? host.spectators.size : 0 });
}
/* v82: parties — 2v2, co-op against the CPU, five-a-side pro clubs (server/party.js) */
const { createPartyHub } = require('./party.js');
const partyHub = createPartyHub({ store, guard, forget: (p) => { if (p.name && peers.get(p.name) === p) peers.delete(p.name); } });

const EMOTE_IDS = new Set(['gg', 'wow', 'lucky', 'ouch', 'nice', 'rematch', 'thanks', 'nooo']);

function pair(a, b, kind) {
  const id = matchSeq++;
  a.opponent = b; b.opponent = a;
  a.matchId = id; b.matchId = id;
  a.reported = false; b.reported = false;      // one result per match, per pairing
  // whoever waited longer hosts — they are likelier to have a stable connection,
  // and it makes the choice deterministic rather than a race
  a.isHost = true; b.isHost = false;

  const card = (self, opp, host) => ({
    t: 'match',
    matchId: id,
    kind,
    host,
    seat: host ? 0 : 1,
    you: { name: self.name, club: self.club, divIdx: self.divIdx },
    opp: { name: opp.name, club: opp.club, squad: opp.squad, divIdx: opp.divIdx, kit: opp.kit || null },
    wl: self.wl ? self.wl.id : null,
  });
  a.sock.send(card(a, b, true));
  b.sock.send(card(b, a, false));
  console.log(`[match ${id}] ${a.name} (host) vs ${b.name} — ${kind}`);
}

function tryMatchmake() {
  const waiting = queue.filter((p) => p.sock.open && !p.opponent).sort((x, y) => x.queuedAt - y.queuedAt);
  for (const [a, b] of mm.findPairs(waiting)) {
    queue = queue.filter((p) => p !== a && p !== b);
    pair(a, b, a.wl ? 'weekend' : 'division');
  }
  queue = queue.filter((p) => p.sock.open && !p.opponent);
}

// Waiting players are re-checked on a timer as well as on arrival, because the
// widening above is time-based: two lone players in different divisions must
// eventually find each other with no new event to trigger it.
setInterval(() => { if (queue.length >= 2) tryMatchmake(); }, 3000).unref();

ws.attach(server, '/ws', (sock) => {
  const peer = {
    sock, name: null, acct: null, club: null, squad: null, divIdx: 0,
    opponent: null, matchId: null, isHost: false, room: null, queuedAt: 0, reported: false,
  };

  sock.on('message', (m) => {
    /* Flood ceiling. A match sends ~30 snapshots and ~50 inputs a second, so
     * 200/s is double what the game can legitimately produce and still far
     * below what a script can. Over it, the socket goes — a peer flooding the
     * hub is also flooding whoever they are playing. */
    if (!guard.allow(`sock:${sock.id}`, 400, 200)) {
      console.warn(`[guard] flood from ${peer.name || 'unauthed'} — closing`);
      sock.close();
      return;
    }
    if (typeof m !== 'object' || m === null || typeof m.t !== 'string') return;

    // everything except auth requires a signed-in peer
    if (m.t === 'auth') {
      // a token is a password; guessing at one over a socket is limited too
      if (!guard.allow(`wsauth:${sock.id}`, 5, 1 / 60)) { sock.close(); return; }
      const acct = store.byToken(m.token);
      if (!acct) { sock.send({ t: 'authFail' }); sock.close(); return; }
      const existing = peers.get(acct.name);
      /* A reconnect. The old record is still here because its socket dropped
       * inside a match less than a grace period ago: this socket takes over
       * that seat — same opponent, same match id, same host role — and the
       * opponent is told the game is back on. */
      // v82: a party member coming back takes his seat again
      if (existing && existing !== peer && existing.dropped && existing.party) {
        peer.adopted = existing;
        sock.send({ t: 'ready', profile: store.publicProfile(acct), online: peers.size });
        partyHub.onReconnect(existing, sock);
        return;
      }
      if (existing && existing !== peer && existing.dropped && existing.opponent) {
        clearTimeout(existing.dropTimer);
        existing.sock = sock;
        existing.dropped = false;
        peer.adopted = existing;                 // this socket now speaks for that record
        sock.send({ t: 'ready', profile: store.publicProfile(acct), online: peers.size });
        sock.send({ t: 'rejoined', matchId: existing.matchId, host: existing.isHost, seat: existing.isHost ? 0 : 1 });
        existing.opponent.sock.send({ t: 'evt', k: 'resumed', name: existing.name });
        console.log(`[match ${existing.matchId}] ${existing.name} reconnected`);
        return;
      }
      // a second sign-in from elsewhere kicks the first
      if (existing && existing !== peer) {
        existing.sock.send({ t: 'kicked' });
        existing.sock.close();
      }
      peer.acct = acct;
      peer.name = acct.name;
      peers.set(acct.name, peer);
      sock.send({ t: 'ready', profile: store.publicProfile(acct), online: peers.size });
      return;
    }
    if (peer.adopted) return handle(peer.adopted, m);
    if (!peer.acct) return;
    handle(peer, m);
  });

  function handle(peer, m) {
    const sock = peer.sock;
    if ((peer.party || m.t.startsWith('party')) && partyHub.handle(peer, m)) return;
    switch (m.t) {
      case 'queue': {
        leaveQueue(peer);
        // whatever is stored here is relayed to an opponent's machine, so it
        // is rebuilt from known fields rather than forwarded as it arrived
        peer.club = guard.cleanClub(m.club);
        peer.squad = guard.cleanSquad(m.squad);
        peer.kit = guard.cleanKit(m.kit);          // v116
        peer.divIdx = Math.max(0, Math.min(20, m.divIdx | 0));
        peer.wl = mm.cleanWL(m.wl);
        peer.queuedAt = Date.now();
        queue.push(peer);
        sock.send({ t: 'queued', size: queue.length, wl: !!peer.wl });
        tryMatchmake();
        break;
      }

      case 'cancel':
        leaveQueue(peer);
        sock.send({ t: 'idle' });
        break;

      case 'host': {
        leaveQueue(peer);
        peer.club = guard.cleanClub(m.club);
        peer.squad = guard.cleanSquad(m.squad);
        peer.kit = guard.cleanKit(m.kit);          // v116
        peer.divIdx = Math.max(0, Math.min(20, m.divIdx | 0));
        let code = makeCode();
        while (rooms.has(code)) code = makeCode();
        rooms.set(code, peer);
        peer.room = code;
        sock.send({ t: 'hosting', code });
        break;
      }

      case 'join': {
        const code = String(m.code || '').toUpperCase().trim();
        const host = rooms.get(code);
        if (!host || !host.sock.open || host === peer) {
          sock.send({ t: 'joinFail', error: 'No lobby with that code.' });
          return;
        }
        leaveQueue(peer);
        peer.club = guard.cleanClub(m.club);
        peer.squad = guard.cleanSquad(m.squad);
        peer.kit = guard.cleanKit(m.kit);          // v116
        peer.divIdx = Math.max(0, Math.min(20, m.divIdx | 0));
        rooms.delete(code);
        host.room = null;
        pair(host, peer, 'friendly');
        break;
      }

      /* --- in-match relay: forwarded verbatim, never inspected ---
       * Verbatim is the point (it keeps the hub cheap and out of the game's
       * business) but it also means this is the one place a player can put
       * bytes straight onto an opponent's machine, so the size is checked even
       * though the contents are not. */
      case 'snap':
      case 'in':
      case 'evt': {
        if (!peer.opponent || peer.opponent.matchId !== peer.matchId) break;
        const bytes = Buffer.byteLength(JSON.stringify(m));
        if (bytes > guard.MAX_RELAY_BYTES) {
          console.warn(`[guard] oversized ${m.t} (${bytes}B) from ${peer.name}`);
          break;
        }
        peer.opponent.sock.send(m);
        // the host's picture goes to whoever is watching too
        if (peer.isHost && peer.spectators && m.t !== 'in') for (const sp of peer.spectators) if (sp.sock.open) sp.sock.send(m);
        break;
      }

      case 'result': {
        /* A result is only a result if there was a match.
         *
         * This used to record for `peer.isHost || !peer.opponent` — and that
         * second clause meant a client could sign in, send a result with no
         * opponent and no match, and have it counted. On a loop. The
         * leaderboard was one `for` loop away from being fiction. Now the
         * scoreline has to come from a peer that is actually in a match, is
         * reported once, and is clamped to numbers football can produce. */
        const check = guard.checkResult(peer, m);
        if (!check.ok) {
          console.warn(`[guard] result rejected from ${peer.name}: ${check.why}`);
          sock.send({ t: 'recorded', online: store.publicProfile(peer.acct).online });
          break;
        }
        peer.reported = true;
        if (peer.opponent) peer.opponent.reported = true;
        // the host's copy is the authoritative one — it ran the simulation
        if (peer.isHost) {
          store.recordResult(peer.acct, {
            scored: check.scored, conceded: check.conceded, divIdx: check.divIdx,
          });
          // Weekend League: the same validated result, filed under the weekend
          // v87: only the weekend that is open now, as the server reckons it — never a past or future one
          const wl = typeof m.wl === 'string' && m.wl === guard.weekendIdNow() ? m.wl : null;
          if (wl) {
            store.recordWeekend(peer.acct, wl, check.scored > check.conceded);
            if (peer.opponent?.acct) store.recordWeekend(peer.opponent.acct, wl, check.conceded > check.scored);
          }
          if (peer.opponent) {
            store.recordResult(peer.opponent.acct, {
              scored: check.conceded, conceded: check.scored, divIdx: peer.opponent.divIdx,
            });
          }
        } else if (!peer.opponent.sock.open) {
          // the host vanished mid-match: the guest's own copy is all there is
          store.recordResult(peer.acct, {
            scored: check.scored, conceded: check.conceded, divIdx: check.divIdx,
          });
        }
        sock.send({ t: 'recorded', online: store.publicProfile(peer.acct).online });
        endMatch(peer, 'ended');
        break;
      }

      /* ---- social ----
       * invite: the host of a lobby sends its code to a friend by name — the
       * only thing that crosses is the four-letter code. spectate: attach to
       * a live match by id; the host's snapshots are copied to spectators and
       * nothing a spectator sends is ever relayed to the players. emote: an
       * id from the fixed list, to the opponent and the spectators. */
      case 'invite': {
        if (!peer.room) break;
        const to = peers.get(String(m.to || ''));
        if (!to || !to.sock.open) { sock.send({ t: 'inviteFail', error: 'That player is not online.' }); break; }
        if (!(peer.acct.friends || []).includes(to.name) && !(to.acct?.friends || []).includes(peer.name)) { sock.send({ t: 'inviteFail', error: 'Invites go to friends.' }); break; }
        to.sock.send({ t: 'invited', from: peer.name, code: peer.room });
        sock.send({ t: 'inviteSent', to: to.name });
        break;
      }
      case 'spectate': {
        const id = m.matchId | 0;
        let host = null;
        for (const p of peers.values()) if (p.isHost && p.matchId === id && p.opponent) { host = p; break; }
        if (!host) { sock.send({ t: 'spectateFail', error: 'That match is over.' }); break; }
        unspectate(peer);
        host.spectators = host.spectators || new Set();
        if (host.spectators.size >= 8) { sock.send({ t: 'spectateFail', error: 'That match is full of spectators.' }); break; }
        host.spectators.add(peer);
        tellSpectators(host);
        peer.watching = host;
        sock.send({ t: 'spectating', matchId: id, host: { name: host.name, club: host.club, squad: host.squad }, guest: { name: host.opponent.name, club: host.opponent.club, squad: host.opponent.squad } });
        console.log(`[match ${id}] ${peer.name} is watching`);
        break;
      }
      case 'unspectate':
        unspectate(peer);
        break;
      case 'emote': {
        const id = String(m.id || '');
        if (!EMOTE_IDS.has(id)) break;
        if (!guard.allow(`emote:${peer.name}`, 6, 0.5)) break;      // six in the bank, one every two seconds
        const out = { t: 'emote', id, from: peer.name };
        if (peer.opponent && peer.opponent.matchId === peer.matchId) peer.opponent.sock.send(out);
        const host = peer.isHost ? peer : peer.opponent;
        for (const sp of host?.spectators || []) if (sp.sock.open) sp.sock.send(out);
        break;
      }

      case 'leave':
        endMatch(peer, 'left');
        break;

      case 'ping':
        sock.send({ t: 'pong', at: m.at });
        break;

      default:
        break;
    }
  }

  sock.on('close', () => {
    const rec = peer.adopted || peer;
    if (rec.sock !== sock) return;              // an older socket of a reconnected peer
    unspectate(rec);
    leaveQueue(rec);
    if (rec.party && partyHub.onClose(rec)) return;
    /* Mid-match, the seat is held for a grace period rather than ended: the
     * opponent gets a 'dropped' event and pauses; a reconnect within the
     * window resumes, otherwise it is the walkover it always was. */
    if (rec.opponent && rec.opponent.sock.open) {
      rec.dropped = true;
      rec.opponent.sock.send({ t: 'evt', k: 'dropped', name: rec.name, grace: mm.RECONNECT_GRACE_MS / 1000 });
      rec.dropTimer = setTimeout(() => {
        if (!rec.dropped) return;
        endMatch(rec, 'disconnected');
        if (rec.name && peers.get(rec.name) === rec) peers.delete(rec.name);
      }, mm.RECONNECT_GRACE_MS);
      rec.dropTimer.unref?.();
      return;
    }
    endMatch(rec, 'disconnected');
    if (rec.name && peers.get(rec.name) === rec) peers.delete(rec.name);
  });
});

/* ------------------------------------------------------------------ *
 * Start-up and shutdown
 * ------------------------------------------------------------------ */

// Accounts must be in memory before the first request: an empty database would
// answer every sign-in with "no account with that name" and then be written
// back over the real one.
store.load().then(() => {
  server.listen(PORT, () => {
    console.log(`APEX XI server on http://localhost:${PORT}`);
    console.log('  · static game, /api accounts + cloud saves, /ws online play');
  });
}).catch((err) => {
  console.error('[fatal] account storage unavailable:', err.message);
  console.error('        refusing to start rather than serve an empty database.');
  process.exit(1);
});

// Hosts send SIGTERM ahead of a redeploy or a sleep. Writes are debounced, so
// without this the last few seconds of play go with the process.
let closing = false;
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    if (closing) return;
    closing = true;
    console.log(`[${sig}] flushing accounts…`);
    server.close();
    const ok = await store.shutdown();
    if (!ok) console.error('[store] shutting down with unsaved changes');
    process.exit(ok ? 0 : 1);
  });
}
