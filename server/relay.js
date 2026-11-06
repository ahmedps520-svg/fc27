/**
 * v202: the match relay — a small server that sits close to the players.
 *
 * The main server (server.js, on Render in Frankfurt) keeps everything it has
 * always done: accounts, saves, matchmaking, results, pauses, emotes,
 * spectators. What it hands off is the one stream where distance is felt —
 * the host's snapshots (30 a second) and the guests' inputs (20 a second).
 * The two phones try a direct WebRTC link first (js/net/p2p.js); when that
 * fails, which on mobile data it often does, that stream used to go through
 * Frankfurt. Now, when the players are measurably nearer this relay than
 * Frankfurt, it goes through here instead, and Frankfurt stays the fallback
 * on every packet (js/net/relay.js).
 *
 * The relay knows nothing about accounts. Every connection carries a ticket
 * the main server signed with RELAY_SECRET: which room (a random id per
 * match), which seat (0 is the host), how many seats, whether it is a party,
 * and when it expires. Without a valid ticket nothing is accepted. In a room
 * the host may send only `snap`, which goes to every other seat; a guest may
 * send only `in`, which goes to the host, stamped with the guest's seat in a
 * party (as server/party.js does) — so nobody can drive a seat that is not
 * theirs, and nothing else (results, pauses) can be faked through here.
 *
 * Run it on the machine near the players:
 *
 *   node server/relay.js
 *
 * with RELAY_SECRET set (the same value as on the main server), either in the
 * environment or in a `relay.env` file next to this file (KEY=VALUE lines).
 * It listens on 127.0.0.1:8790 — a tunnel (cloudflared) carries the public
 * wss:// address to it, so nothing is opened on the router. Settings:
 *
 *   RELAY_SECRET  required, 32+ characters
 *   RELAY_PORT    default 8790
 *   RELAY_HOST    default 127.0.0.1
 *   RELAY_LOG     optional file to append the log to (kept under 5 MB)
 *
 * GET /health answers {ok, v, rooms, peers, up}. It needs only ./ws.js beside
 * it, and Node 22 or later. No npm install.
 *
 * The same file gives the main server `signTicket` and `relayWins`; required
 * as a module it starts nothing.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ws = require('./ws');

const RELAY_VERSION = 1;
const MAX_BYTES = 24 * 1024;           // the same cap the main server's relay uses (guard.MAX_RELAY_BYTES)
const MAX_SEATS = 10;                  // a five-a-side party
const MAX_ROOMS = 2000;
const RATE = 90;                       // messages a second a socket may send (a host sends 30, a guest 20)
const BURST = 120;
const PING_MS = 25000;                 // keeps the tunnel's idle timer (100 s at Cloudflare) from closing a quiet socket
const DEAD_MS = 70000;                 // nothing at all, not even a pong, for this long: gone
const PROBE_PINGS = 12;                // a probe socket measures, then closes
const PROBE_MS = 15000;
const SKEW_S = 300;                    // the two machines' clocks may disagree by this much

/* ------------------------------- tickets -------------------------------- */

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const mac = (secret, body) => crypto.createHmac('sha256', secret).update(body).digest();

/**
 * A ticket: base64url(JSON) + '.' + base64url(HMAC-SHA256). Fields:
 *   r  room id (random per match), or '*probe' for a latency probe
 *   s  seat (0 = host)        n  seats in the room
 *   p  1 for a party (guest inputs are stamped with the seat)
 *   x  expiry, Unix seconds
 */
function signTicket(secret, { r, s = 0, n = 2, p = 0, x }) {
  const body = b64(JSON.stringify({ r: String(r), s: s | 0, n: n | 0, p: p ? 1 : 0, x: Math.floor(x) }));
  return `${body}.${b64(mac(secret, body))}`;
}

/** The ticket's fields if it is genuine and current, else null. */
function verifyTicket(secret, ticket, now = Date.now()) {
  if (typeof ticket !== 'string' || ticket.length > 600) return null;
  const dot = ticket.indexOf('.');
  if (dot < 1) return null;
  const body = ticket.slice(0, dot);
  let sig;
  try { sig = Buffer.from(ticket.slice(dot + 1), 'base64url'); } catch { return null; }
  const want = mac(secret, body);
  if (sig.length !== want.length || !crypto.timingSafeEqual(sig, want)) return null;
  let t;
  try { t = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  if (!t || typeof t.r !== 'string' || !t.r || t.r.length > 64) return null;
  if (!Number.isInteger(t.x) || t.x + SKEW_S < now / 1000) return null;
  if (t.r === '*probe') return t;
  if (!Number.isInteger(t.n) || t.n < 2 || t.n > MAX_SEATS || !Number.isInteger(t.s) || t.s < 0 || t.s >= t.n) return null;
  return t;
}

/**
 * Should a match go through the relay? Each player measured the round trip
 * to the relay and to the main server (ms; `relay` null when it could not be
 * reached). Every packet crosses from one player to the server and on to the
 * other, so what the players feel is the sum: the relay has to beat it by a
 * margin, or the main server keeps the match.
 */
function relayWins(rtts, margin = 15) {
  if (!Array.isArray(rtts) || rtts.length < 2) return false;
  let viaRelay = 0; let viaHome = 0;
  for (const r of rtts) {
    if (!r || !Number.isFinite(r.relay) || !Number.isFinite(r.home)) return false;
    viaRelay += r.relay; viaHome += r.home;
  }
  return viaRelay + margin <= viaHome;
}

/* -------------------------------- the relay ------------------------------- */

function createRelay({ secret, log = () => {} } = {}) {
  if (!secret || String(secret).length < 32) throw new Error('RELAY_SECRET must be at least 32 characters');
  const rooms = new Map();             // room id -> { seats: Map<seat, Socket>, n, p }
  const sockets = new Set();
  const started = Date.now();
  let served = 0;

  const roster = (room) => {
    const msg = { t: 'rly', on: [...room.seats.keys()].sort((a, b) => a - b) };
    for (const s of room.seats.values()) if (s.open) s.send(msg);
  };

  const server = http.createServer((req, res) => {
    const route = req.url.split('?')[0];
    if (route === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true, v: RELAY_VERSION, rooms: rooms.size, peers: sockets.size, up: Math.round((Date.now() - started) / 1000), served }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('APEX XI relay\n');
  });

  ws.attach(server, '/relay', (sock, req) => {
    let ticket = null;
    try { ticket = verifyTicket(secret, new URL(req.url, 'http://relay').searchParams.get('t')); } catch { /* bad url */ }
    if (!ticket) { sock.send({ t: 'rlyFail', error: 'ticket' }); sock.close(4001); return; }

    let last = Date.now();
    sock.raw.on('data', () => { last = Date.now(); });
    let tokens = BURST; let refilled = Date.now();
    const allow = () => {
      const now = Date.now();
      tokens = Math.min(BURST, tokens + ((now - refilled) / 1000) * RATE); refilled = now;
      if (tokens < 1) return false;
      tokens -= 1; return true;
    };
    sockets.add(sock);
    const ping = setInterval(() => {
      if (Date.now() - last > DEAD_MS) { sock.close(1001); return; }
      sock._send(0x9, Buffer.alloc(0));
    }, PING_MS);
    ping.unref?.();

    // a latency probe: echo a few pings and go
    if (ticket.r === '*probe') {
      let pings = 0;
      const bye = setTimeout(() => sock.close(1000), PROBE_MS);
      sock.on('message', (m) => {
        if (!m || m.t !== 'pp' || !allow()) return;
        sock.send({ t: 'pp', at: typeof m.at === 'number' ? m.at : 0 });
        if (++pings >= PROBE_PINGS) sock.close(1000);
      });
      sock.on('close', () => { clearTimeout(bye); clearInterval(ping); sockets.delete(sock); });
      return;
    }

    let room = rooms.get(ticket.r);
    if (!room) {
      if (rooms.size >= MAX_ROOMS) { sock.send({ t: 'rlyFail', error: 'full' }); sock.close(4002); clearInterval(ping); sockets.delete(sock); return; }
      room = { seats: new Map(), n: ticket.n, p: !!ticket.p };
      rooms.set(ticket.r, room);
      served += 1;
    }
    if (ticket.n !== room.n || !!ticket.p !== room.p) { sock.close(4003); clearInterval(ping); sockets.delete(sock); return; }
    // the same seat again is that player reconnecting: the newer socket wins
    const before = room.seats.get(ticket.s);
    room.seats.set(ticket.s, sock);
    if (before && before !== sock) { before.replaced = true; before.close(4004); }
    roster(room);

    const seat = ticket.s;
    sock.on('message', (m) => {
      if (!m || typeof m !== 'object' || !allow()) return;
      if (seat === 0) {
        if (m.t !== 'snap') return;
        const bytes = Buffer.byteLength(JSON.stringify(m));
        if (bytes > MAX_BYTES) return;
        for (const [k, s] of room.seats) if (k !== 0 && s.open) s.send(m);
      } else {
        if (m.t !== 'in') return;
        if (room.p) m.sq = seat; else delete m.sq;     // the seat is the relay's to say, never the sender's
        if (Buffer.byteLength(JSON.stringify(m)) > MAX_BYTES) return;
        const host = room.seats.get(0);
        if (host?.open) host.send(m);
      }
    });
    sock.on('close', () => {
      clearInterval(ping);
      sockets.delete(sock);
      if (room.seats.get(seat) === sock) room.seats.delete(seat);
      if (!room.seats.size) rooms.delete(ticket.r);
      else if (!sock.replaced) roster(room);
    });
  });

  // a summary now and then, so the log says the relay is alive and in use
  const summary = setInterval(() => { if (served || sockets.size) log(`[relay] ${rooms.size} rooms, ${sockets.size} sockets, ${served} matches since start`); }, 10 * 60 * 1000);
  summary.unref?.();

  return {
    server,
    listen: (port, host) => new Promise((res, rej) => { server.once('error', rej); server.listen(port, host, () => res(server.address())); }),
    close: () => new Promise((res) => {
      clearInterval(summary);
      for (const s of sockets) { try { s.close(1001); } catch { /* going */ } }
      server.close(() => res());
    }),
    get rooms() { return rooms.size; },
    get peers() { return sockets.size; },
  };
}

/* ------------------------------- run it here ------------------------------- */

/** Settings from relay.env next to this file, then the environment (which wins). */
function settings(dir = __dirname, env = process.env) {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(dir, 'relay.env'), 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  } catch { /* no file: the environment only */ }
  for (const k of ['RELAY_SECRET', 'RELAY_PORT', 'RELAY_HOST', 'RELAY_LOG']) if (env[k]) out[k] = env[k];
  return out;
}

function fileLog(file) {
  if (!file) return (line) => console.log(line);
  return (line) => {
    const text = `${new Date().toISOString()} ${line}\n`;
    try {
      if (fs.existsSync(file) && fs.statSync(file).size > 5 * 1024 * 1024) fs.renameSync(file, `${file}.old`);
      fs.appendFileSync(file, text);
    } catch { /* a log that cannot be written must not stop the relay */ }
    console.log(line);
  };
}

if (require.main === module) {
  const cfg = settings();
  const log = fileLog(cfg.RELAY_LOG);
  let relay;
  try { relay = createRelay({ secret: cfg.RELAY_SECRET, log }); } catch (err) { log(`[relay] cannot start: ${err.message}`); process.exit(1); }
  const port = Number(cfg.RELAY_PORT) || 8790;
  const host = cfg.RELAY_HOST || '127.0.0.1';
  relay.listen(port, host).then(() => log(`[relay] v${RELAY_VERSION} listening on ${host}:${port}`), (err) => { log(`[relay] cannot listen on ${host}:${port}: ${err.message}`); process.exit(1); });
  process.on('uncaughtException', (err) => log(`[relay] error: ${err.stack || err.message}`));
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { relay.close().then(() => process.exit(0)); });
}

module.exports = { signTicket, verifyTicket, relayWins, createRelay, settings, RELAY_VERSION };
