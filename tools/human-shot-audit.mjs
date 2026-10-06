/**
 * v166: how a person's shots fare from 12–20 m. A scripted seat stands a
 * forward on the ball, the defence cleared away and the keeper on his line,
 * holds SHOOT for a set time with the stick aimed at the middle or a corner,
 * and lets go. Counts goals, saves, the woodwork and misses, by distance, by
 * hold and by the shot-timing assist.
 *   node tools/human-shot-audit.mjs [trials per cell = 6] [aim]   ('aim': rows by middle/corner)
 * v166: aimed at a corner, 56% of these missed (aim at 0.9 of the way to the
 * post); aiming at 0.7 of the way brought it to 43%, with goals about level.
 */
import '../tests/unit/_dom.mjs';
const { Match, PITCH } = await import('../js/game/sim.js');
const { CY } = await import('../js/game/field.js');
const { WORLD } = await import('../js/data/generator.js');
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const N = Number(process.argv[2] ?? 6);
const BY_AIM = process.argv[3] === 'aim';
const DISTS = [12, 16, 20]; const LATS = [-6, 0, 6]; const HOLDS = [0.25, 0.5, 0.8]; const AIMS = [0, 1, -1];

function trial(seed, assist, d, lat, hold, aimY) {
  Math.random = mulberry32(seed);
  const C = WORLD.clubs;
  const m = new Match(C[seed % 20].id, C[20 + (seed % 20)].id, { human: 0, duration: 600, assist: { shoot: assist } });
  m.phase = 'play';
  const t = m.teams[0]; const gx = t.dir > 0 ? PITCH.w : 0;
  const p = t.players.find((q) => q.role === 'FWD');
  for (const tm of m.teams) for (const q of tm.players) if (q !== p && q.role !== 'GK') { q.x = PITCH.w / 2 - t.dir * 20; q.y = 5 + Math.random() * 3; q.vx = q.vy = 0; }
  p.x = gx - t.dir * Math.sqrt(Math.max(1, d * d - lat * lat)); p.y = CY + lat; p.vx = p.vy = 0; p.dirX = t.dir; p.dirY = 0;
  m.ball.owner = p; m.ball.x = p.x; m.ball.y = p.y; m.ball.z = 0; m.ball.vx = m.ball.vy = 0;
  const c = m.controllers[0]; c.lockId = undefined; m.setControlled?.(c, p); c.pid = p.id;
  const seen = []; const cue = m.cue.bind(m); m.cue = (n, a) => { seen.push(n); return cue(n, a); };
  const inp = { _p: new Set(), _r: new Set(), _h: new Set(),
    axis: () => ({ x: t.dir * 0.25, y: aimY * 0.95 }), pressed(a) { return this._p.has(a); }, released(a) { return this._r.has(a); }, held(a) { return this._h.has(a); },
    value() { return 1; }, rstick() { return { x: 0, y: 0 }; }, takeGesture() { return null; }, clear() { this._p.clear(); this._r.clear(); } };
  const holdF = Math.round(hold * 60); let shot = false;
  for (let s = 0; s < 60 * 6; s++) {
    inp._h.clear();
    if (s === 0) inp._p.add('shoot');
    if (s < holdF) inp._h.add('shoot'); else if (s === holdF) inp._r.add('shoot');
    m.update(1 / 60, [inp]); inp.clear();
    if (seen.includes('shot')) shot = true;
    if (m.phase === 'goal' || seen.includes('goal')) return 'goal';
    if (shot) {
      if (seen.includes('post')) return 'post';
      if (seen.includes('save')) return 'save';
      if (seen.includes('block')) return 'block';
      if (seen.includes('shotWide') || m.phase !== 'play') return 'miss';
      const k = t === m.teams[0] ? m.teams[1].players.find((q) => q.role === 'GK') : null;
      if (k && m.ball.owner === k) return 'save';
    } else if (m.ball.owner !== p) return 'lost';
  }
  return shot ? 'miss' : 'noshot';
}

const tally = () => ({ goal: 0, save: 0, post: 0, block: 0, miss: 0, lost: 0, noshot: 0, n: 0 });
const rows = {};
let seed = 1;
for (const assist of [0, 1]) for (const d of DISTS) for (const hold of HOLDS) {
  for (const lat of LATS) for (const aimY of AIMS) for (let i = 0; i < N; i++) {
    const k = BY_AIM ? `${aimY ? 'corner' : 'middle'} · ${d} m · hold ${hold}s` : `assist ${assist} · ${d} m · hold ${hold}s`;
    const r = (rows[k] ||= tally()); r[trial(seed++, assist, d, lat, hold, aimY)]++; r.n++;
  }
}
const pc = (x, n) => `${String(Math.round((100 * x) / n)).padStart(3)}%`;
for (const [k, r] of Object.entries(rows)) console.log(`${k.padEnd(30)} goal ${pc(r.goal, r.n)} · saved ${pc(r.save, r.n)} · post ${pc(r.post, r.n)} · miss ${pc(r.miss, r.n)}${r.lost + r.noshot ? ` · no shot ${r.lost + r.noshot}` : ''}`);
