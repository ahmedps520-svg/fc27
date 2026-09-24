/**
 * AI difficulty curve (R15 balance part 2, v98).
 *
 * Every mode passes the match a `skill` (sim.js `aiSkillFor`): it scales the
 * CPU's shooting and tackling rates and its decision quality. There is no
 * person in a headless match, so a stand-in plays the person's side: the same
 * AI held at skill 1.0 (Kick Off's "Pro"). The CPU side is set to each skill
 * the game uses, fixtures are played from both ends so neither club's
 * strength counts, and the CPU's results against the stand-in are counted.
 * What matters is the shape — every step harder than the last, no cliff, no
 * plateau — not the absolute win rate, which a person beats more easily.
 *
 *   node tools/difficulty-audit.mjs [--per 30]
 */
import '../tests/unit/_dom.mjs';
const { Match } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');
const { divisionSkill } = await import('../js/ultimate.js');
const { DIVISIONS } = await import('../js/state.js');
const { CLASH_LEVELS } = await import('../js/modes.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const PER = arg('--per', 30);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Where each skill comes from in the game
const LEVELS = new Map();
const add = (s, label) => { const k = +s.toFixed(3); LEVELS.set(k, [...(LEVELS.get(k) || []), label]); };
add(0.7, 'Kick Off Easy'); add(1, 'Kick Off Pro'); add(1.35, 'Kick Off Elite');
for (const l of CLASH_LEVELS) add(l.skill, `Clash ${l.name}`);
for (const [i, d] of DIVISIONS.entries()) add(divisionSkill(i), `UXI ${d.name}`);

// the stand-in is team 0 at 1.0; the CPU is team 1 at `cpu`
let CPU = 1;
const real = Match.prototype.aiSkillFor;
Match.prototype.aiSkillFor = function (team) { return (team === this.__cpu ? CPU : 1) + (real.call(this, team) - this.skill); };

const CLUBS = WORLD.clubs.slice(0, 10);
console.log(`\nThe CPU at each skill the game uses, against the same AI held at 1.0 (${PER} matches each, both ends, Competitive, 180s)\n`);
console.log('skill   CPU win  draw  loss   goals for–against   shots for–against   xG for–against   CPU on target   used by');
const rows = [];
const ONLY = process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1].split(',').map(Number) : null;
for (const s of [...LEVELS.keys()].sort((a, b) => a - b).filter((x) => !ONLY || ONLY.some((o) => Math.abs(o - x) < 0.006))) {
  CPU = s;
  let w = 0, d = 0, l = 0, gf = 0, ga = 0, sf = 0, sa = 0, xf = 0, xa = 0, of = 0;
  for (let i = 0; i < PER; i++) {
    Math.random = mulberry32(31337 + i * 7919);          // same dice at every level: only the skill differs
    const a = CLUBS[Math.floor(i / 2) % CLUBS.length]; const b = CLUBS[(Math.floor(i / 2) * 3 + 1) % CLUBS.length] === a ? CLUBS[(i + 5) % CLUBS.length] : CLUBS[(Math.floor(i / 2) * 3 + 1) % CLUBS.length];
    const cpuSide = i % 2;                                // the CPU plays each fixture from both ends
    const m = new Match(a.id, b.id, { human: null, duration: 180, preset: 'competitive', skill: 1 });
    m.__cpu = cpuSide;
    for (let k = 0; k < 180 * 60 && m.phase !== 'end'; k++) m.update(1 / 60);
    const c = m.teams[cpuSide]; const o = m.teams[1 - cpuSide];
    gf += c.score; ga += o.score; sf += c.shots; sa += o.shots; xf += c.xg || 0; xa += o.xg || 0; of += c.onTarget || 0;
    if (c.score > o.score) w += 1; else if (c.score === o.score) d += 1; else l += 1;
  }
  const r = { s, win: w / PER, draw: d / PER, loss: l / PER, gd: (gf - ga) / PER };
  rows.push(r);
  console.log(`${s.toFixed(2).padStart(5)}   ${String(Math.round(100 * r.win)).padStart(5)}%  ${String(Math.round(100 * r.draw)).padStart(3)}%  ${String(Math.round(100 * r.loss)).padStart(3)}%     ${(gf / PER).toFixed(2)}–${(ga / PER).toFixed(2)}           ${(sf / PER).toFixed(1)}–${(sa / PER).toFixed(1)}          ${(xf / PER).toFixed(2)}–${(xa / PER).toFixed(2)}        ${(of / PER).toFixed(1)}           ${LEVELS.get(s).join(', ')}`);
}
// the shape: points per match the CPU takes, level to level
console.log('\nstep                     CPU points a match');
for (let i = 1; i < rows.length; i++) {
  const pts = (r) => 3 * r.win + r.draw;
  const dlt = pts(rows[i]) - pts(rows[i - 1]);
  console.log(`${rows[i - 1].s.toFixed(2)} → ${rows[i].s.toFixed(2)}             ${pts(rows[i - 1]).toFixed(2)} → ${pts(rows[i]).toFixed(2)}  (${dlt >= 0 ? '+' : ''}${dlt.toFixed(2)})`);
}
