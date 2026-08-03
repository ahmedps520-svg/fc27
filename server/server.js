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
const ws = require('./ws');
const store = require('./store');

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
};

store.load();

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
  if (route === '/api/register' || route === '/api/login') {
    const body = await readBody(req);
    const r = route === '/api/register'
      ? store.register(body.name, body.pass)
      : store.login(body.name, body.pass);
    if (r.error) return json(res, 400, { error: r.error });
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
    const body = await readBody(req);
    store.putSave(acct, body.save ?? null);
    return json(res, 200, { ok: true });
  }

  if (route === '/api/leaderboard') {
    return json(res, 200, { rows: store.leaderboard(25) });
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
    opponent: null, matchId: null, isHost: false, room: null, queuedAt: 0,
  };

  sock.on('message', (m) => {
    // everything except auth requires a signed-in peer
    if (m.t === 'auth') {
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
        peer.club = m.club;
        peer.squad = Array.isArray(m.squad) ? m.squad : null;
        peer.divIdx = m.divIdx | 0;
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
        peer.club = m.club;
        peer.squad = Array.isArray(m.squad) ? m.squad : null;
        peer.divIdx = m.divIdx | 0;
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
        peer.club = m.club;
        peer.squad = Array.isArray(m.squad) ? m.squad : null;
        peer.divIdx = m.divIdx | 0;
        rooms.delete(code);
        host.room = null;
        pair(host, peer, 'friendly');
        break;
      }

      // --- in-match relay: forwarded verbatim, never inspected ---
      case 'snap':
      case 'in':
      case 'evt':
        if (peer.opponent && peer.opponent.matchId === peer.matchId) {
          peer.opponent.sock.send(m);
        }
        break;

      case 'result': {
        // each side reports its own scoreline; the server trusts the host's copy
        if (peer.isHost || !peer.opponent) {
          store.recordResult(peer.acct, {
            scored: m.scored | 0, conceded: m.conceded | 0, divIdx: m.divIdx | 0,
          });
        }
        if (peer.opponent && !peer.opponent.isHost) {
          store.recordResult(peer.opponent.acct, {
            scored: m.conceded | 0, conceded: m.scored | 0, divIdx: peer.opponent.divIdx,
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

server.listen(PORT, () => {
  console.log(`APEX XI server on http://localhost:${PORT}`);
  console.log('  · static game, /api accounts + cloud saves, /ws online play');
});
