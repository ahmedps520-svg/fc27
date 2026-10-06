/**
 * v170: a whole match with a scripted person on one side, to catch what only
 * shows over ninety minutes. The seat plays like a plain human: carries the
 * ball at goal, passes after a second or so, shoots inside 22 m, and when the
 * other side has it, runs at the ball, tackles close in and switches to the
 * team-mate nearest the ball when his own man is far away.
 *   node tools/human-match-audit.mjs [matches = 8] [minutes = 6]
 * Prints, per match and in total: the score, shots, passes completed, tackles
 * and fouls by the person's men, cards, switches, and how far the person's man
 * was from the ball while defending (median and the share of time over 25 m).
 */
import '../tests/unit/_dom.mjs';
const { Match, PITCH } = await import('../js/game/sim.js');
const { CY } = await import('../js/game/field.js');
const { WORLD } = await import('../js/data/generator.js');
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const N = Number(process.argv[2] ?? 8); const MIN = Number(process.argv[3] ?? 6);
const tot = { gf: 0, ga: 0, shots: 0, cpuShots: 0, passes: 0, passOk: 0, tackles: 0, fouls: 0, cpuFouls: 0, yel: 0, red: 0, sw: 0, far: 0, def: 0, dists: [], stuck: 0, phases: {} };
for (let g = 0; g < N; g++) {
  Math.random = mulberry32(700 + g);
  const C = WORLD.clubs;
  const m = new Match(C[g].id, C[g + 10].id, { human: 0, duration: MIN * 60 });
  const me = () => m.playerOf(m.controllers[0]);
  const t0 = m.teams[0];
  let carry = 0; let press = null; let pend = null; let lastPos = null; let stillT = 0;
  const inp = { _p: new Set(), _r: new Set(), _h: new Set(), ax: { x: 0, y: 0 },
    axis() { return this.ax; }, pressed(a) { return this._p.has(a); }, released(a) { return this._r.has(a); }, held(a) { return this._h.has(a); },
    value() { return 1; }, rstick() { return { x: 0, y: 0 }; }, takeGesture() { return null; }, clear() { this._p.clear(); this._r.clear(); } };
  const realPass = m.pass.bind(m);
  m.pass = (p, ...a) => { const r = realPass(p, ...a); if (p === me() && m.ball.owner !== p) pend = { p, t: m.t }; return r; };
  const realTackle = m.tackle.bind(m); m.tackle = (p, ...a) => { if (p === me()) tot.tackles++; return realTackle(p, ...a); };
  const cue = m.cue.bind(m);
  m.cue = (n, a) => { if (n === "foul") { if (a?.team === 0) tot.fouls++; else tot.cpuFouls++; const st = new Error().stack.split("\n")[2].match(/sim\.js:(\d+)/)?.[1]; tot.src[`${a?.team}:${st}`] = (tot.src[`${a?.team}:${st}`] || 0) + 1; } return cue(n, a); };
  const cyc = m.cycleActive.bind(m); m.cycleActive = (c) => { tot.sw++; return cyc(c); };
  for (let s = 0; s < MIN * 60 * 60 * 1.5 && m.phase !== 'end'; s++) {
    tot.phases[m.phase] = (tot.phases[m.phase] || 0) + 1;
    const p = me(); const b = m.ball; inp._h.clear();
    if (press) { inp._r.add(press); press = null; }
    if (p && m.phase === 'play') {
      const gx = t0.dir > 0 ? PITCH.w : 0;
      if (b.owner === p) {
        carry += 1 / 60;
        const dx = gx - p.x; const dy = CY - p.y; const d = Math.hypot(dx, dy);
        inp.ax = { x: dx / d, y: dy / d * 0.7 };
        if (d < 22 && carry > 0.4) { inp._p.add('shoot'); inp._h.add('shoot'); press = 'shoot'; carry = 0; }
        else if (carry > 1.1 && Math.random() < 0.04) { inp._p.add('pass'); inp._h.add('pass'); press = 'pass'; carry = 0; }
      } else {
        carry = 0;
        const dx = b.x - p.x; const dy = b.y - p.y; const d = Math.hypot(dx, dy) || 1;
        inp.ax = { x: dx / d, y: dy / d };
        if (b.owner && b.owner.team === 1) {
          tot.def++; tot.dists.push(d); if (d > 25) tot.far++;
          if (d < 1.6 && Math.random() < 0.08) { inp._p.add('pass'); }
          // switch when a team-mate is much nearer the ball
          const near = t0.players.filter((q) => q.role !== 'GK').reduce((a, q) => (Math.hypot(q.x - b.x, q.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? q : a));
          if (near !== p && d > Math.hypot(near.x - b.x, near.y - b.y) + 10 && Math.random() < 0.03) inp._p.add('switch');
        }
      }
      // a man under control who never moves while play goes on
      if (lastPos && Math.hypot(p.x - lastPos.x, p.y - lastPos.y) < 0.01) stillT += 1 / 60; else stillT = 0;
      if (stillT > 4) { tot.stuck++; stillT = 0; }
      lastPos = { x: p.x, y: p.y };
    }
    m.update(1 / 60, [inp]); inp.clear();
    if (pend) { const o = m.ball.owner; if (m.phase !== 'play' || m.t - pend.t > 5) pend = null; else if (o && o !== pend.p) { tot.passes++; if (o.team === 0) tot.passOk++; pend = null; } }
  }
  const [h, a] = m.teams;
  tot.gf += h.score; tot.ga += a.score; tot.shots += h.shots; tot.cpuShots += a.shots;
  tot.yel += m.players?.().filter?.((q) => q.team === 0 && q.yellow).length || 0;
  console.log(`match ${g + 1}: ${h.short} ${h.score}–${a.score} ${a.short} · shots ${h.shots}/${a.shots} · ended ${m.phase}`);
}
const ds = tot.dists.sort((x, y) => x - y);
console.log(`\ntotal over ${N}: goals ${tot.gf}–${tot.ga} · shots ${tot.shots}/${tot.cpuShots} · passes ${tot.passOk}/${tot.passes} · tackles ${tot.tackles} · fouls ${tot.fouls} (CPU ${tot.cpuFouls}) · switches ${tot.sw}`);
console.log(`defending: man under control from the ball, median ${ds[ds.length >> 1]?.toFixed(1)} m, over 25 m ${(100 * tot.far / Math.max(1, tot.def)).toFixed(0)}% of the time · stuck spells ${tot.stuck}`);
console.log('phases (frames):', JSON.stringify(tot.phases));
