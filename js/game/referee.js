/**
 * The referee (v112, backlog #15 — the referee and card animations).
 *
 * There was no one in the middle: fouls were whistled and players booked by
 * nobody you could see. Now there is a referee — presentation only. He is
 * moved here, each frame, from what the match already knows (where the ball
 * is, the phase, the bookings), never by the simulation, so no balance number
 * moves and the sweep is untouched.
 *
 *   in play      the diagonal: about fifteen metres off the ball, on the side
 *                of it nearer the middle of the pitch, sprinting to keep up
 *   dead ball    in close to the spot, facing it
 *   a booking    stops, faces the player, and holds the card up (2.5 s)
 *   a goal       jogs back towards the centre circle
 *
 * He keeps a couple of metres off every player, and stays on the grass.
 * `celebKind: 'refcard'` borrows the celebration poser (game/celebrations.js)
 * for the raised arm, on both figures.
 */
import { PITCH } from './field.js';

const CARD_SECONDS = 2.5;
const RUN = 7.2;          // m/s, a fit official at full tilt
const ACCEL = 9;

export function createReferee(m) {
  return {
    x: PITCH.w / 2 - 6, y: PITCH.h / 2 + 8, vx: 0, vy: 0, dirX: 1, dirY: 0,
    celebrating: false, celebKind: null, stumble: 0, holdT: 0, _phase: 0,
    card: null,            // { t, player } while showing one
    seen: m.bookings?.length || 0,
    ref: { id: 'referee', name: 'Referee', stats: {} },
  };
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Where he wants to be, and what he looks at. */
function aimFor(r, m) {
  const b = m.ball;
  const W = PITCH.w; const H = PITCH.h;
  if (r.card) return { x: r.x, y: r.y, look: r.card.player || b };
  if (m.phase === 'goal' || m.phase === 'kickoff' || m.phase === 'half') {
    return { x: W / 2 - 4, y: H / 2 + 10, look: { x: W / 2, y: H / 2 } };
  }
  const dead = m.phase !== 'play';
  // the side of the ball nearer the middle, off it by 15 m in play or 7 m at a dead ball
  const off = dead ? 7 : 15;
  const sx = b.x < W / 2 ? 1 : -1; const sy = b.y < H / 2 ? 1 : -1;
  return {
    x: clamp(b.x + sx * off * 0.62, 3, W - 3),
    y: clamp(b.y + sy * off * 0.78, 2, H - 2),
    look: b,
  };
}

export function updateReferee(r, m, dt) {
  if (!dt) return r;
  // a new booking: stop and show it
  const n = m.bookings?.length || 0;
  if (n > r.seen) {
    const bk = m.bookings[n - 1];
    const player = m.teams[bk.team]?.players.find((q) => q.ref?.name === bk.name) || null;
    r.card = { t: CARD_SECONDS, player };
  }
  r.seen = n;
  if (r.card) { r.card.t -= dt; if (r.card.t <= 0) r.card = null; }

  const a = aimFor(r, m);
  // steer: accelerate toward the spot, ease in over the last few metres
  const dx = a.x - r.x; const dy = a.y - r.y; const d = Math.hypot(dx, dy);
  const want = r.card ? 0 : Math.min(RUN, d * 1.1);
  const wx = d > 0.05 ? (dx / d) * want : 0; const wy = d > 0.05 ? (dy / d) * want : 0;
  const k = Math.min(1, ACCEL * dt / Math.max(0.001, Math.hypot(wx - r.vx, wy - r.vy)));
  r.vx += (wx - r.vx) * k; r.vy += (wy - r.vy) * k;
  // never through a player: step aside from anyone closer than 2 m
  for (const t of m.teams) {
    for (const q of t.players) {
      const ex = r.x - q.x; const ey = r.y - q.y; const e = Math.hypot(ex, ey);
      if (e < 2 && e > 1e-3) { r.vx += (ex / e) * (2 - e) * 6 * dt * 10; r.vy += (ey / e) * (2 - e) * 6 * dt * 10; }
    }
  }
  const sp = Math.hypot(r.vx, r.vy);
  if (sp > RUN) { r.vx *= RUN / sp; r.vy *= RUN / sp; }
  r.x = clamp(r.x + r.vx * dt, 1, PITCH.w - 1);
  r.y = clamp(r.y + r.vy * dt, 0.5, PITCH.h - 0.5);
  // eyes on the ball, or on the man being booked
  const lx = a.look.x - r.x; const ly = a.look.y - r.y; const l = Math.hypot(lx, ly);
  if (l > 0.3) {
    const tx = lx / l; const ty = ly / l;
    const turn = Math.min(1, dt * 8);
    r.dirX += (tx - r.dirX) * turn; r.dirY += (ty - r.dirY) * turn;
    const dl = Math.hypot(r.dirX, r.dirY) || 1; r.dirX /= dl; r.dirY /= dl;
  }
  r.celebrating = !!r.card; r.celebKind = r.card ? 'refcard' : null;
  return r;
}
