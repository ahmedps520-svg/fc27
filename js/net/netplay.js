/**
 * Online match plumbing.
 *
 * The host runs the real simulation — the same `Match` an offline game uses, so
 * physics and balance are identical — and ships snapshots. The guest never
 * simulates: it holds an identical `Match` purely as a scene graph and pours
 * snapshot state into it, rendering ~100 ms in the past so packets have time to
 * arrive and can be interpolated between rather than snapped to.
 */
import * as net from './socket.js';

const ACTIONS = ['pass', 'shoot', 'cross', 'through', 'switch', 'curl', 'sprint', 'pause'];
const r2 = (n) => Math.round(n * 100) / 100;
// Positions and velocities go out at 10 cm / 0.1 m/s. The guest interpolates
// between snapshots and nobody can see a tenth of a metre on a 105 m pitch, so
// the extra digit was ~10% of every packet for nothing.
const r1 = (n) => Math.round(n * 10) / 10;

/** How often the host ships the world, in ms. The guest's buffer is sized from
 *  the gaps it actually measures, so this is the only place the rate lives. */
export const SNAP_MS = 33;

/* ------------------------------------------------------------------ *
 * Guest -> host: control state
 * ------------------------------------------------------------------ */
const maskOf = (set) => ACTIONS.reduce((m, a, i) => (set.has(a) ? m | (1 << i) : m), 0);

/** Wraps a local Input and streams it to the host. */
export class InputSender {
  constructor(input, rate = 20) {
    this.input = input;
    this.rate = rate;
    this.acc = 0;
    this.prev = new Set();
    this.downEdges = 0;
    this.upEdges = 0;
  }

  /** Call every frame, after input.poll(). */
  tick(dt) {
    // Edges are accumulated between packets so a quick tap is never dropped,
    // even though we only transmit at a third of the frame rate.
    for (const a of ACTIONS) {
      const now = this.input.held(a);
      const was = this.prev.has(a);
      if (now && !was) this.downEdges |= 1 << ACTIONS.indexOf(a);
      if (!now && was) this.upEdges |= 1 << ACTIONS.indexOf(a);
      if (now) this.prev.add(a); else this.prev.delete(a);
    }

    this.acc += dt * 1000;
    if (this.acc < this.rate) return;
    this.acc = 0;
    const v = this.input.axis();
    net.send({
      t: 'in',
      ax: [r2(v.x), r2(v.y)],
      h: maskOf(this.prev),
      d: this.downEdges,
      u: this.upEdges,
    });
    this.downEdges = 0;
    this.upEdges = 0;
  }
}

/**
 * Stands in for an `Input` on the host, fed by the guest's packets. Exposes the
 * same surface the sim reads, so the match cannot tell the difference.
 */
export class RemoteInput {
  constructor() {
    this.vec = { x: 0, y: 0 };
    this.pad = null;
    this.now = new Set();
    this.was = new Set();
    this.pendingDown = new Set();
    this.pendingUp = new Set();
    this.heldFor = Object.fromEntries(ACTIONS.map((a) => [a, 0]));
    this.lastPacket = performance.now();
  }

  accept(m) {
    this.lastPacket = performance.now();
    this.vec = { x: m.ax?.[0] || 0, y: m.ax?.[1] || 0 };
    const held = new Set();
    ACTIONS.forEach((a, i) => { if (m.h & (1 << i)) held.add(a); });
    ACTIONS.forEach((a, i) => {
      if (m.d & (1 << i)) this.pendingDown.add(a);
      if (m.u & (1 << i)) this.pendingUp.add(a);
    });
    this.held_ = held;
  }

  poll(dt = 0) {
    this.was = this.now;
    const cur = new Set(this.held_ || []);
    // Replay a tap that started and finished between two packets: hold it for
    // this frame so `pressed` fires, and let the queued release land next frame.
    for (const a of this.pendingDown) cur.add(a);
    this.pendingDown.clear();
    for (const a of this.pendingUp) {
      if (!this.was.has(a) && !cur.has(a)) continue;   // wait until the press was seen
      cur.delete(a);
    }
    this.pendingUp.clear();
    this.now = cur;

    // If packets stop, drop the stick rather than leaving them sprinting forever.
    if (performance.now() - this.lastPacket > 1500) {
      this.vec = { x: 0, y: 0 };
      this.now = new Set();
    }
    for (const a of ACTIONS) this.heldFor[a] = this.now.has(a) ? this.heldFor[a] + dt : 0;
  }

  axis() { return this.vec; }
  moving() { return Math.hypot(this.vec.x, this.vec.y) > 0.14; }
  held(a) { return this.now.has(a); }
  pressed(a) { return this.now.has(a) && !this.was.has(a); }
  released(a) { return !this.now.has(a) && this.was.has(a); }
  heldTime(a) { return this.heldFor[a]; }
  setTouchVec() {}
  setTouchButton() {}
  destroy() {}
}

/* ------------------------------------------------------------------ *
 * Host -> guest: world snapshots
 * ------------------------------------------------------------------ */
/**
 * Phase names are sent as an index into this list, so entries may be appended
 * but never reordered — a host and a guest on different builds have to agree.
 * `half` was missing, which made the guest read half time as ordinary play.
 */
const PHASES = ['kickoff', 'play', 'goal', 'corner', 'goalkick', 'throwin', 'freekick', 'end', 'half', 'penalty'];

export function encodeSnapshot(match) {
  const all = [...match.teams[0].players, ...match.teams[1].players];
  const b = match.ball;
  const ownerIdx = b.owner ? all.indexOf(b.owner) : -1;
  return {
    t: 'snap',
    ts: performance.now(),
    b: [r1(b.x), r1(b.y), r2(b.z || 0), r1(b.vx), r1(b.vy), r1(b.vz || 0)],
    o: ownerIdx,
    // Per-player slots are positional and append-only, same rule as PHASES:
    // a guest on an older build reads the first seven and ignores the rest.
    p: all.map((p) => [r1(p.x), r1(p.y), r2(p.dirX), r2(p.dirY), r1(p.vx), r1(p.vy),
      r2(p.diveT || 0), r2(p.stamina ?? 1)]),
    s: [match.teams[0].score, match.teams[1].score],
    ph: PHASES.indexOf(match.phase),
    tm: r2(match.t),
    c: match.controllers.map((c) => c.activeIdx),
    ce: all.map((p) => (p.celebrating ? 1 : 0)).join(''),
    bn: match.banner || '',
    // Who scored, and who put it in. These are written by the simulation, so
    // the guest — which never simulates — has no way to know them otherwise,
    // and the goal card and the replay camera both need them.
    gt: match.goalTeam ?? -1,
    sn: match.scorerName || '',
    // shots, shots on target and time on the ball, so the guest's match facts
    // and full-time screen are the numbers the host is looking at rather than
    // zeroes and a flat 50/50
    st: [match.teams[0].shots, match.teams[0].onTarget,
      match.teams[1].shots, match.teams[1].onTarget,
      r2(match.teams[0].poss), r2(match.teams[1].poss)],
  };
}

/**
 * Applies snapshots to a non-simulating match, rendering slightly in the past so
 * two snapshots always bracket the render time and can be interpolated.
 */
const MIN_DELAY = 55;    // two snapshots at 30 Hz, and nothing spare
const MAX_DELAY = 170;    // past this the match stops feeling live at all

export class SnapshotView {
  constructor(match, delay = 90) {
    this.match = match;
    this.delay = delay;
    this.buf = [];
    this.clock = 0;
    this.started = false;
    this.lastPacket = performance.now();
    this.gap = 0;         // smoothed gap between arrivals
    this.jitter = 0;      // smoothed deviation from that gap
    this.lastRx = 0;
  }

  /* The buffer sizes itself.
   *
   * It used to be a flat 100 ms, picked for the worst connection anyone might
   * have — and every guest paid it, because the guest renders that far in the
   * past by definition. On a steady line two packets plus a small jitter
   * allowance is enough, which is nearer 70 ms, and every millisecond taken off
   * here comes straight off how late your own input looks.
   *
   * It is measured from packet *arrivals*, not from a ping, because arrivals
   * are what the buffer has to cover: a link that delivers late but evenly
   * needs a small buffer, and one that delivers in bursts needs a big one
   * however good its round-trip looks. The easing is deliberate — the render
   * clock is derived from `delay`, so moving it in a step is a visible jump. */
  accept(snap) {
    const now = performance.now();
    if (this.lastRx) {
      const gap = now - this.lastRx;
      this.gap = this.gap ? this.gap + (gap - this.gap) * 0.12 : gap;
      this.jitter += (Math.abs(gap - this.gap) - this.jitter) * 0.12;
      const want = Math.max(MIN_DELAY, Math.min(MAX_DELAY, this.gap * 2 + this.jitter * 2.5));
      this.delay += (want - this.delay) * 0.05;
    }
    this.lastRx = now;
    this.lastPacket = now;
    snap.rx = now;
    this.buf.push(snap);
    if (this.buf.length > 40) this.buf.shift();
    if (!this.started && this.buf.length >= 2) {
      this.clock = snap.rx - this.delay;
      this.started = true;
    }
  }

  get stale() { return performance.now() - this.lastPacket > 3000; }

  update(dt) {
    if (!this.started) return;
    this.clock += dt * 1000;
    const target = this.clock;

    // find the two snapshots bracketing the render time
    let a = null;
    let b = null;
    for (let i = this.buf.length - 1; i >= 0; i--) {
      if (this.buf[i].rx <= target) { a = this.buf[i]; b = this.buf[i + 1] || null; break; }
    }
    if (!a) a = this.buf[0];
    if (!b) b = a;

    const span = b.rx - a.rx;
    const f = span > 0 ? Math.min(1, Math.max(0, (target - a.rx) / span)) : 0;
    this.apply(a, b, f);

    // Drift correction: if we fall too far behind or run ahead of the stream,
    // ease the clock back rather than jumping, which would look like a stutter.
    const newest = this.buf[this.buf.length - 1];
    const lag = newest.rx - this.clock;
    if (lag > this.delay * 3) this.clock += (lag - this.delay) * 0.1;
    else if (lag < this.delay * 0.25) this.clock -= (this.delay * 0.5 - lag) * 0.05;

    while (this.buf.length > 2 && this.buf[1].rx < this.clock - 1000) this.buf.shift();
  }

  apply(a, b, f) {
    const m = this.match;
    const all = [...m.teams[0].players, ...m.teams[1].players];
    const lerp = (x, y) => x + (y - x) * f;

    m.ball.x = lerp(a.b[0], b.b[0]);
    m.ball.y = lerp(a.b[1], b.b[1]);
    m.ball.z = lerp(a.b[2], b.b[2]);
    m.ball.vx = a.b[3]; m.ball.vy = a.b[4]; m.ball.vz = a.b[5];
    m.ball.owner = a.o >= 0 ? all[a.o] : null;

    for (let i = 0; i < all.length; i++) {
      const p = all[i];
      const sa = a.p[i];
      const sb = b.p[i] || sa;
      if (!sa) continue;
      p.x = lerp(sa[0], sb[0]);
      p.y = lerp(sa[1], sb[1]);
      p.dirX = lerp(sa[2], sb[2]);
      p.dirY = lerp(sa[3], sb[3]);
      p.vx = sa[4]; p.vy = sa[5];
      p.diveT = sa[6];
      // an older host does not send this, and a full tank is the safe read
      p.stamina = sa[7] ?? 1;
      p.celebrating = a.ce?.[i] === '1';
    }

    m.teams[0].score = a.s[0];
    m.teams[1].score = a.s[1];
    m.phase = PHASES[a.ph] || 'play';
    m.t = a.tm;
    m.banner = a.bn;
    if (a.gt >= 0) m.goalTeam = a.gt;
    if (a.sn) m.scorerName = a.sn;
    if (a.st) {
      m.teams[0].shots = a.st[0]; m.teams[0].onTarget = a.st[1];
      m.teams[1].shots = a.st[2]; m.teams[1].onTarget = a.st[3];
      if (a.st.length > 4) { m.teams[0].poss = a.st[4]; m.teams[1].poss = a.st[5]; }
    }
    a.c?.forEach((idx, i) => { if (m.controllers[i]) m.controllers[i].activeIdx = idx; });
  }
}

/* Connection quality pip in the match HUD.
 *
 * The bands are set for the *end-to-end* number the HUD now shows — this
 * client to the opponent and back, through the hub — not for the client-to-
 * server ping it used to show. Two players either side of the server are
 * routinely 120 ms apart and are playing a perfectly good match; calling that
 * red was just wrong. */
export function qualityLabel(rtt) {
  if (rtt == null) return { text: '—', cls: '' };
  if (rtt < 90) return { text: `${rtt}ms`, cls: 'good' };
  if (rtt < 190) return { text: `${rtt}ms`, cls: 'ok' };
  return { text: `${rtt}ms`, cls: 'bad' };
}
