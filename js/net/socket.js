/**
 * Persistent connection to the match hub.
 *
 * A single socket is shared by every screen: the Online tab uses it to queue,
 * and the match hands it snapshots. Reconnects automatically with a backoff,
 * because dropping the socket between menus and a match would be maddening.
 */
import { authToken } from './api.js';
import { socketURL } from './config.js';
import { NET_PROTOCOL } from './protocol.js';

let sock = null;
let ready = false;
let serverNet = 1;                 // v189: the match protocol the server's own website speaks
let retry = 0;
let retryTimer = null;
let wanted = false;
let boundToken = null;      // the token the live socket authenticated with

const handlers = new Map();     // type -> Set<fn>
const anyHandlers = new Set();

export const isReady = () => ready;

/** Subscribe to a message type. Returns an unsubscribe function. */
export function on(type, fn) {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type).add(fn);
  return () => handlers.get(type)?.delete(fn);
}

export function onAny(fn) {
  anyHandlers.add(fn);
  return () => anyHandlers.delete(fn);
}

function emit(msg) {
  for (const fn of handlers.get(msg.t) || []) {
    try { fn(msg); } catch (err) { console.error('[net] handler failed', err); }
  }
  for (const fn of anyHandlers) {
    try { fn(msg); } catch { /* ignore */ }
  }
}

/**
 * Dispatch a message into the handler bus as if the hub had sent it. Used by
 * the peer-to-peer channel so match code has one place to subscribe whichever
 * route a packet took. Guards against reordering here, centrally: the direct
 * channel is deliberately unordered, so a stale snapshot or input (older `ts`
 * than the newest already delivered of its type) is dropped rather than passed
 * to handlers that assume time moves forwards.
 */
const newest = new Map();      // type (and seat) -> highest ts seen
export function injectMessage(msg) {
  if (msg && typeof msg.ts === 'number') {
    // v202: per seat — in a party the host hears inputs from several guests, each stamped
    // with its own clock, and one guest's newer clock must not silence another's inputs
    const key = msg.sq == null ? msg.t : `${msg.t}:${msg.sq}`;
    const top = newest.get(key) || 0;
    if (msg.ts < top) return;
    newest.set(key, msg.ts);
  }
  emit(msg);
}

/** v202: forget the newest timestamps (a new match: its packets come from another machine's clock, often an earlier one). */
export function resetOrder() { newest.clear(); }

export function send(obj) {
  if (!ready || !sock || sock.readyState !== WebSocket.OPEN) return false;
  try { sock.send(JSON.stringify(obj)); return true; } catch { return false; }
}

export function connect() {
  wanted = true;
  const token = authToken();
  if (!token) return;

  const live = sock && (sock.readyState === WebSocket.OPEN || sock.readyState === WebSocket.CONNECTING);
  // A live socket is bound to whoever authenticated on it. Signing in as someone
  // else has to tear it down, or the hub keeps treating you as the old account.
  if (live && boundToken === token) return;
  if (live) {
    const old = sock;
    sock = null;
    ready = false;
    old.onclose = null;             // this close is intentional, don't back off and retry
    try { old.close(); } catch { /* already gone */ }
  }

  boundToken = token;
  sock = new WebSocket(socketURL());

  sock.onopen = () => {
    retry = 0;
    // v189: see protocol.js. v193: caps — what this client can play beyond a match ('ghost': server.js offerGhosts;
    // v202 'relay': net/relay.js, unless ?norelay)
    const caps = ['ghost']; if (!new URLSearchParams(location.search).has('norelay')) caps.push('relay');
    sock.send(JSON.stringify({ t: 'auth', token, net: NET_PROTOCOL, caps }));
  };

  sock.onmessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.data); } catch { return; }
    if (msg.t === 'ready') { ready = true; serverNet = msg.net | 0 || 1; }
    if (msg.t === 'authFail') { ready = false; wanted = false; }
    // through the same stale-guard as the direct channel: when both routes are
    // live the relayed copy arrives later, and must not rewind the newer one
    injectMessage(msg);
  };

  sock.onclose = () => {
    ready = false;
    emit({ t: 'closed' });
    if (!wanted) return;
    // exponential backoff, capped — a server restart shouldn't spam it
    retry = Math.min(retry + 1, 6);
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, 400 * 2 ** retry);
  };

  sock.onerror = () => { /* onclose always follows */ };
}

export function disconnect() {
  wanted = false;
  ready = false;
  boundToken = null;
  clearTimeout(retryTimer);
  if (sock) { sock.onclose = null; try { sock.close(); } catch { /* ignore */ } }
  sock = null;
}

/** Round-trip time in ms, for the connection pip. */
export function ping() {
  return new Promise((resolve) => {
    const at = performance.now();
    const off = on('pong', (m) => {
      if (m.at !== at) return;
      off();
      resolve(Math.round(performance.now() - at));
    });
    if (!send({ t: 'ping', at })) { off(); resolve(null); }
    setTimeout(() => { off(); resolve(null); }, 3000);
  });
}

/** v189: the match protocol the server's current website speaks — above ours means an update is out. */
export const serverProtocol = () => serverNet;
