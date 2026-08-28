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
const ws = require('./ws');
const store = require('./store');
const guard = require('./guard');

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
    try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('bad json')); }
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

  if (route === '/api/leaderboard') {
    return json(res, 200, { rows: store.leaderboard(25) });
  }

  // Somewhere to look when accounts go missing: says where they are being
  // stored and whether that storage survives a restart.
  if (route === '/api/health') {
    return json(res, 200, {
      ok: true, build: BUILD, uptime: Math.round(process.uptime()), store: store.status(),
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
  for (const f of ['index.html', 'notes.html']) {
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
    "connect-src 'self' ws: wss:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

const server = http.createServer((req, res) => {
  const route = decodeURIComponent(req.url.split('?')[0]);

  if (route.startsWith('/api/')) {
    cors(req, res);
    if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }
    api(req, res, route).catch((err) => json(res, 400, { error: err.message }));
    return;
  }

  let file = path.join(ROOT, route === '/' ? 'index.html' : route);
  if (!path.resolve(file).startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  // the account database is not part of the served site
  if (path.resolve(file).startsWith(path.join(__dirname, 'data'))) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (err2, buf) => {
      if (err2) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...SECURITY_HEADERS,
      });
      res.end(buf);
    });
  });
});

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
  peer.opponent = null;
  peer.matchId = null;
  if (other) {
    other.opponent = null;
    other.matchId = null;
    other.sock.send({ t: 'oppLeft', reason });
  }
}

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
    opp: { name: opp.name, club: opp.club, squad: opp.squad, divIdx: opp.divIdx },
  });
  a.sock.send(card(a, b, true));
  b.sock.send(card(b, a, false));
  console.log(`[match ${id}] ${a.name} (host) vs ${b.name} — ${kind}`);
}

// How far apart two players' divisions may be, as a function of how long the
// one who has waited longer has been queuing. Same division is always preferred;
// the net widens every few seconds until it will accept anybody, so a lone
// player in Apex Elite still gets a game rather than waiting forever.
const WIDEN = [
  { after: 0, span: 0 },     // same division only
  { after: 8, span: 1 },
  { after: 16, span: 3 },
  { after: 25, span: 99 },   // anyone at all
];

const allowedSpan = (waitedSec) => {
  let span = 0;
  for (const step of WIDEN) if (waitedSec >= step.after) span = step.span;
  return span;
};

function tryMatchmake() {
  const now = Date.now();
  let paired = true;

  // Repeat until no further pairing is possible: one pass can free up players
  // whose only acceptable partner was taken by an earlier pairing.
  while (paired) {
    paired = false;
    // longest-waiting player gets first pick
    const waiting = queue.filter((p) => p.sock.open)
      .sort((x, y) => x.queuedAt - y.queuedAt);

    for (const a of waiting) {
      if (a.opponent) continue;
      const span = allowedSpan((now - a.queuedAt) / 1000);

      // Best available opponent: closest in division, and among equals the one
      // who has been waiting longest.
      let best = null;
      let bestGap = Infinity;
      for (const b of waiting) {
        if (b === a || b.opponent) continue;
        const gap = Math.abs(a.divIdx - b.divIdx);
        // either player having waited long enough is enough to widen the net
        const bSpan = allowedSpan((now - b.queuedAt) / 1000);
        if (gap > Math.max(span, bSpan)) continue;
        if (gap < bestGap || (gap === bestGap && b.queuedAt < best.queuedAt)) {
          best = b;
          bestGap = gap;
        }
      }

      if (best) {
        queue = queue.filter((p) => p !== a && p !== best);
        pair(a, best, 'division');
        paired = true;
        break;
      }
    }
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
      // a second sign-in from elsewhere kicks the first
      const existing = peers.get(acct.name);
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
    if (!peer.acct) return;

    switch (m.t) {
      case 'queue': {
        leaveQueue(peer);
        // whatever is stored here is relayed to an opponent's machine, so it
        // is rebuilt from known fields rather than forwarded as it arrived
        peer.club = guard.cleanClub(m.club);
        peer.squad = guard.cleanSquad(m.squad);
        peer.divIdx = Math.max(0, Math.min(20, m.divIdx | 0));
        peer.queuedAt = Date.now();
        queue.push(peer);
        sock.send({ t: 'queued', size: queue.length });
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

      case 'leave':
        endMatch(peer, 'left');
        break;

      case 'ping':
        sock.send({ t: 'pong', at: m.at });
        break;

      default:
        break;
    }
  });

  sock.on('close', () => {
    leaveQueue(peer);
    endMatch(peer, 'disconnected');
    if (peer.name && peers.get(peer.name) === peer) peers.delete(peer.name);
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
