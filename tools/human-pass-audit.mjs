/**
 * v161: how a person's passes fare. A scripted seat pushes the stick towards
 * the goal it attacks (with a slow sideways wander) and taps PASS after carrying
 * for about a second; over 10 four-minute matches it counts how often those
 * passes reach a team-mate, against the CPU side's.
 *   node tools/human-pass-audit.mjs [assist 0|1|2 = 1]
 * At v161: assist 0 84%, 1 82%, 2 83% (CPU side 71–76%).
 */


import '../tests/unit/_dom.mjs';
const { Match, PITCH } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ASSIST = Number(process.argv[2] ?? 1);
const st = { me: { n: 0, ok: 0 }, cpu: { n: 0, ok: 0 } };
for (let g = 0; g < 10; g++) {
  Math.random = mulberry32(500 + g);
  const C = WORLD.clubs;
  const m = new Match(C[g].id, C[g + 10].id, { human: 0, duration: 240, assist: { pass: ASSIST } });
  let pend = null; let carry = 0; let wander = 0; let press = 0;
  const inp = {
    _p: new Set(), _r: new Set(), _h: new Set(),
    axis() { const d = m.teams[0].dir; return { x: Math.sin(wander) * 0.5, y: -d * 0.0 + 0 }; },
    pressed(a) { return this._p.has(a); }, released(a) { return this._r.has(a); }, held(a) { return this._h.has(a); },
    value() { return 1; }, rstick() { return { x: 0, y: 0 }; }, takeGesture() { return null; }, clear() { this._p.clear(); this._r.clear(); },
  };
  // the screen basis: up the stick = towards the attacked goal (basis null → x is the pitch x)
  inp.axis = () => { const d = m.teams[0].dir; return { x: d * 0.9, y: Math.sin(wander) * 0.6 }; };
  const realPass = m.pass.bind(m);
  m.pass = (p, ...a) => { const r = realPass(p, ...a); if (m.ball.owner !== p && m.ball.passTo) pend = { team: p.team, p, t: m.t, me: p.team === 0 && m.controllers.some((c) => m.playerOf(c) === p) }; return r; };
  for (let s = 0; s < 240 * 60 && m.phase !== 'end'; s++) {
    wander += 0.02;
    const mine = m.ball.owner && m.controllers.some((c) => m.playerOf(c) === m.ball.owner);
    carry = mine ? carry + 1 / 60 : 0;
    inp._h.clear();
    if (press === 1) { inp._r.add('pass'); press = 0; }
    if (mine && carry > 0.9 && Math.random() < 0.05) { inp._h.add('pass'); press = 1; }
    m.update(1 / 60, [inp]); inp.clear();
    if (pend) {
      const o = m.ball.owner;
      if (m.phase !== 'play' || m.t - pend.t > 5) pend = null;
      else if (o && o !== pend.p) { const k = pend.me ? 'me' : 'cpu'; if (pend.team === 0 && !pend.me) { pend = null; continue; } st[k].n++; if (o.team === pend.team) st[k].ok++; pend = null; }
    }
  }
}
const pct = (x) => `${(100 * x.ok / Math.max(1, x.n)).toFixed(0)}% of ${x.n}`;
console.log(`assist ${ASSIST}: person ${pct(st.me)} · CPU side ${pct(st.cpu)}`);
