/**
 * v202: the near relay — the middle route for a match's high-rate traffic.
 *
 * Three ways a snapshot or an input can travel, best first (p2p.js sendMatch):
 *   1. the direct WebRTC channel between the two phones (p2p.js);
 *   2. this: a relay close to the players (server/relay.js, on a machine in
 *      the region, reached through a tunnel), when the main server judged it
 *      nearer for everyone in the match and put a ticket on the match card;
 *   3. the main server's own relay, over the socket every client already has.
 * Each packet takes the best route that is up at that moment, so a relay that
 * drops mid-match costs nothing but the latency going back up.
 *
 * Measuring: after sign-in the main server sends `relayHi` (the relay's
 * address and a probe ticket) to a client that says it can (caps 'relay').
 * The client times a few round trips to the relay and to the main server,
 * over a websocket both ways so the two numbers compare, and reports them
 * (`rtt`). The main server only routes a match here when the sum over its
 * players is lower (server/relay.js relayWins). Measured again every few
 * minutes while signed in, since a phone moves between Wi-Fi and mobile data.
 *
 * `?norelay=1` turns all of it off, like `?nop2p=1`.
 */
import * as net from './socket.js';

const DISABLED = typeof location !== 'undefined' && new URLSearchParams(location.search).has('norelay');
const REMEASURE_MS = 4 * 60 * 1000;
const SAMPLES = 5;

export const relayCapable = () => !DISABLED && typeof WebSocket !== 'undefined';

/* ------------------------------- measuring ------------------------------- */

let hi = null;            // { url, probe } from the main server
let measureTimer = null;
let lastRtt = null;

const median = (xs) => { const s = xs.filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };

/** Round trips to the relay through a probe socket; null if it cannot be reached. */
function probeRelay(url, ticket, samples = SAMPLES) {
  return new Promise((resolve) => {
    let sock; const times = []; let sentAt = 0; let done = false;
    const finish = () => { if (done) return; done = true; try { sock?.close(); } catch { /* closing */ } resolve(times.length >= 2 ? median(times.slice(1)) : null); };
    const fire = () => { sentAt = performance.now(); try { sock.send(JSON.stringify({ t: 'pp', at: sentAt })); } catch { finish(); } };
    setTimeout(finish, 8000);
    try { sock = new WebSocket(`${url}/relay?t=${encodeURIComponent(ticket)}`); } catch { finish(); return; }
    sock.onopen = fire;
    sock.onmessage = (e) => {
      let m; try { m = JSON.parse(e.data); } catch { return; }
      if (m.t !== 'pp' || m.at !== sentAt) return;
      times.push(performance.now() - sentAt);
      if (times.length > samples) finish(); else fire();
    };
    sock.onerror = finish;
    sock.onclose = finish;
  });
}

async function measure() {
  clearTimeout(measureTimer);
  if (!hi || !net.isReady()) return;
  const relay = await probeRelay(hi.url, hi.probe);
  const homes = [];
  for (let i = 0; i < SAMPLES; i++) { const ms = await net.ping(); if (ms != null) homes.push(ms); }
  const home = median(homes.slice(1).length ? homes.slice(1) : homes);
  lastRtt = { relay, home, at: Date.now() };
  if (home != null) net.send({ t: 'rtt', relay, home });
  measureTimer = setTimeout(measure, REMEASURE_MS);
}

if (relayCapable()) {
  net.on('relayHi', (m) => {
    if (typeof m.url !== 'string' || !/^wss?:\/\//.test(m.url) || typeof m.probe !== 'string') return;
    hi = { url: m.url.replace(/\/$/, ''), probe: m.probe };
    setTimeout(measure, 1500);          // after the sign-in burst, so the numbers are not inflated by it
  });
  net.on('closed', () => { clearTimeout(measureTimer); });
}

/** The last measurement, for support and the tests: { relay, home, at } or null. */
export const relayRtt = () => lastRtt;

/* ------------------------------- the match ------------------------------- */

let sock = null;
let wanted = false;
let present = new Set();      // seats the relay says are connected
let mine = null;              // { url, t, n, host }
let retries = 0;
let retryTimer = null;
let stats = { sent: 0, got: 0 };

function connect() {
  if (!wanted || !mine) return;
  let s;
  try { s = new WebSocket(`${mine.url}/relay?t=${encodeURIComponent(mine.t)}`); } catch { return; }
  sock = s;
  s.onopen = () => { retries = 0; };
  s.onmessage = (e) => {
    let m; try { m = JSON.parse(e.data); } catch { return; }
    if (m.t === 'rly') { present = new Set(Array.isArray(m.on) ? m.on : []); return; }
    if (m.t === 'rlyFail') { wanted = false; return; }
    // only the match's two types, and only the way they flow: snapshots to a guest, inputs to the host
    if ((m.t === 'snap' && !mine.host) || (m.t === 'in' && mine.host)) { stats.got += 1; net.injectMessage(m); }
  };
  s.onclose = () => {
    if (sock === s) { sock = null; present = new Set(); }
    if (!wanted || retries >= 6) return;
    retries += 1;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, 600 * retries);
  };
  s.onerror = () => { /* onclose follows */ };
}

/** Called when a match starts: opens the relay if the match card carried a ticket. Safe either way. */
export function startRelay(online) {
  stopRelay();
  const r = online?.relay;
  if (!relayCapable() || !r || typeof r.url !== 'string' || typeof r.t !== 'string') return;
  mine = { url: r.url.replace(/\/$/, ''), t: r.t, n: Math.max(2, Math.min(10, r.n | 0 || 2)), host: !!online.host };
  wanted = true; retries = 0; stats = { sent: 0, got: 0 };
  connect();
}

export function stopRelay() {
  wanted = false;
  clearTimeout(retryTimer);
  const s = sock; sock = null; present = new Set(); mine = null;
  if (s) { s.onclose = null; try { s.close(); } catch { /* closing */ } }
}

/**
 * Whether a packet sent now reaches everybody it must: the host needs every
 * other seat on the relay (else a guest who could not reach it would see
 * nothing), a guest needs the host there.
 */
export function relayReady() {
  if (!sock || sock.readyState !== 1 || !mine) return false;
  if (!mine.host) return present.has(0);
  for (let s = 1; s < mine.n; s++) if (!present.has(s)) return false;
  return true;
}

export function sendRelay(obj) {
  if (!relayReady()) return false;
  try { sock.send(JSON.stringify(obj)); stats.sent += 1; return true; } catch { return false; }
}

export const relayStats = () => ({ ...stats, ready: relayReady(), ticket: !!mine });
