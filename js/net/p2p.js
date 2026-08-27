/**
 * Peer-to-peer match transport.
 *
 * The hub in Singapore relays every packet between two players who are usually
 * in the same country, which puts two intercontinental crossings inside every
 * kick. This module opens a WebRTC DataChannel directly between the two
 * browsers and moves the high-rate match traffic — snapshots one way, inputs
 * the other — onto it. Everything else (matchmaking, results, tactics events,
 * the pause protocol) stays on the websocket, which also carries the WebRTC
 * handshake itself: the hub forwards `evt` messages verbatim without reading
 * them, so the two peers can swap offers and ICE candidates through it with no
 * server changes at all.
 *
 * The websocket is not a separate mode, it is the permanent fallback. Sends go
 * through {@link sendMatch}, which uses the channel when it is open and the
 * socket when it is not — per packet, so a channel that dies mid-match (peer
 * behind a mobile carrier NAT losing the path, a network change) degrades to
 * exactly today's behaviour on the next packet, with nothing to renegotiate
 * and no interruption beyond the latency going back up. Received packets from
 * both routes are pushed into the same socket.js handler bus, so the match
 * code cannot tell — and does not care — which way a packet came.
 *
 * The channel is unordered and non-retransmitting on purpose. Snapshots and
 * inputs are absolute state, not deltas: a lost one is superseded by the next
 * within 33ms, and a retransmitted-then-delivered-late one is worse than
 * useless. `injectMessage` drops anything that is not the newest by `ts`.
 *
 * `?nop2p=1` in the URL disables the whole thing (used by the fallback tests,
 * useful for support). Both sides advertise readiness first and only the host
 * offers, so an old client and a new one in the same match simply never
 * upgrade — the hello goes unanswered and the relay carries the match.
 */
import * as net from './socket.js';

const DISABLED = new URLSearchParams(location.search).has('nop2p');

// Public STUN so two peers behind ordinary home/mobile NATs can find their
// external addresses. No TURN: a pair that STUN cannot connect stays on the
// relay, which is the fallback working as designed rather than a failure.
const ICE = { iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }] };

let pc = null;          // RTCPeerConnection
let dc = null;          // the match DataChannel
let open = false;
let offs = [];          // socket subscriptions to detach on stop
let stats = { sent: 0, viaDc: 0, got: 0 };

export const p2pActive = () => open;
export const p2pStats = () => ({ ...stats, open });

/** Send a high-rate match message: DataChannel when open, websocket when not. */
export function sendMatch(obj) {
  stats.sent += 1;
  if (open && dc && dc.readyState === 'open') {
    try { dc.send(JSON.stringify(obj)); stats.viaDc += 1; return true; } catch { /* fall through */ }
  }
  return net.send(obj);
}

function wire(channel) {
  dc = channel;
  dc.onopen = () => { open = true; console.log('[p2p] direct channel open'); };
  dc.onclose = () => { open = false; };
  dc.onerror = () => { open = false; };
  dc.onmessage = (e) => {
    let msg = null;
    try { msg = JSON.parse(e.data); } catch { return; }
    // Only the two match types ever travel this path. Anything else a peer
    // might send is ignored rather than dispatched, so the direct channel
    // cannot be used to fake hub messages like results or oppLeft.
    if (msg && (msg.t === 'snap' || msg.t === 'in')) {
      stats.got += 1;
      net.injectMessage(msg);
    }
  };
}

const sig = (payload) => net.send({ t: 'evt', k: 'rtc', ...payload });

/**
 * Start trying to go direct. Call when the match starts; safe if the peer
 * never answers (older build, disabled) — the match simply stays on the relay.
 */
export function startP2P(online) {
  if (DISABLED || !('RTCPeerConnection' in window)) return;
  stopP2P();
  stats = { sent: 0, viaDc: 0, got: 0 };

  pc = new RTCPeerConnection(ICE);
  pc.onicecandidate = (e) => { if (e.candidate) sig({ ice: e.candidate.toJSON() }); };
  pc.onconnectionstatechange = () => {
    if (!pc) return;
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') open = false;
  };

  const host = !!online.host;

  offs.push(net.on('evt', async (m) => {
    if (m.k !== 'rtc' || !pc) return;
    try {
      if (m.hello && host) {
        if (dc) return;      // the hello retries; the offer must not
        // guest is ready: host makes the offer (one side must, and the host
        // already leads everything else in the match)
        wire(pc.createDataChannel('match', { ordered: false, maxRetransmits: 0 }));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sig({ sdp: pc.localDescription.toJSON() });
      } else if (m.sdp && m.sdp.type === 'offer' && !host) {
        pc.ondatachannel = (e) => wire(e.channel);
        await pc.setRemoteDescription(m.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sig({ sdp: pc.localDescription.toJSON() });
      } else if (m.sdp && m.sdp.type === 'answer' && host) {
        await pc.setRemoteDescription(m.sdp);
      } else if (m.ice) {
        await pc.addIceCandidate(m.ice).catch(() => { /* late/stale candidate */ });
      }
    } catch (err) {
      // any handshake failure means the upgrade is off, nothing more
      console.warn('[p2p] handshake failed, staying on relay:', err.message);
    }
  }));

  // The guest opens the conversation, whoever finished navigating first. The
  // hello retries a few times because the two clients enter the match screen
  // seconds apart and an evt sent before the opponent subscribes is gone.
  if (!host) {
    let tries = 0;
    const hello = setInterval(() => {
      if (open || !pc || tries++ > 5) { clearInterval(hello); return; }
      sig({ hello: 1 });
    }, 1200);
    offs.push(() => clearInterval(hello));
    sig({ hello: 1 });
  }
}

/** Tear down the peer connection. Always safe to call. */
export function stopP2P() {
  for (const off of offs) { try { off(); } catch { /* detaching */ } }
  offs = [];
  open = false;
  try { dc?.close(); } catch { /* closing */ }
  try { pc?.close(); } catch { /* closing */ }
  dc = null;
  pc = null;
}
