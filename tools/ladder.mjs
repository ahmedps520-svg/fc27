/**
 * Apex Division difficulty sweep.
 *
 * `sweep.mjs` measures whether a *match* is balanced — goals, shots,
 * conversion. This measures whether the *ladder* is, which is a different
 * question and the one that was got wrong: every match in the game can be
 * beautifully balanced and the division still be a walkover, because the
 * division decides who you are balanced against.
 *
 * It fields a squad of a stated rating against the real division opponent at
 * every rung and reports the win rate. What we want is a curve: comfortable at
 * the bottom, roughly even in the middle, losing more than you win at the top.
 * A flat line of 100% is the bug this exists to catch.
 *
 *   node tools/ladder.mjs            # a 90-rated squad, 40 matches per rung
 *   node tools/ladder.mjs 96 60      # a stacked squad, 60 per rung
 *
 * Both sides are run by the AI, so this is not a prediction of what a human
 * scores — a person plays better than the CPU. Read it as the shape of the
 * curve, not the absolute numbers.
 */
import { Match } from '../js/game/sim.js';
import { WORLD } from '../js/data/generator.js';
import { DIVISIONS } from '../js/state.js';
import { divisionOpponent, divisionSkill } from '../js/ultimate.js';
import { SHAPES } from '../js/game/sim.js';

const RATING = Number(process.argv[2] || 90);
const N = Number(process.argv[3] || 40);
const SEED = Number(process.argv[4] || 4242);
const DURATION = 240;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stand-in for the player's Ultimate XI, built to an exact rating. */
function playerSquad(rating) {
  const pool = WORLD.players.filter((p) => p.clubId);
  const used = new Set();
  const xi = SHAPES['4-3-3'].map((s, i) => {
    const wantGK = s.role === 'GK';
    let best = null;
    let bestD = Infinity;
    for (const p of pool) {
      if (used.has(p.id) || (p.position === 'GK') !== wantGK) continue;
      const d = Math.abs(p.overall - rating);
      if (d < bestD) { bestD = d; best = p; }
    }
    used.add(best.id);
    const scale = rating / Math.max(40, best.overall);
    const stats = {};
    for (const k of Object.keys(best.stats)) {
      stats[k] = Math.max(28, Math.min(99, Math.round(best.stats[k] * scale)));
    }
    return { ...best, id: `you${i}`, overall: rating, stats, clubId: null };
  });
  return { xi, bench: [], name: 'Your XI', short: 'YOU', colors: ['#41d3ff', '#0b1020'] };
}

const you = playerSquad(RATING);
console.log(`A ${RATING}-rated squad, ${N} matches per rung, seed ${SEED}\n`);
console.log('  division        opp   won  drew  lost    win%   goals for/against');

for (let d = 0; d < DIVISIONS.length; d++) {
  const opp = divisionOpponent(d, RATING);
  let w = 0; let dr = 0; let l = 0; let gf = 0; let ga = 0;
  for (let i = 0; i < N; i++) {
    Math.random = mulberry32(SEED + d * 100003 + i * 7919);
    const m = new Match(WORLD.clubs[0].id, WORLD.clubs[1].id, {
      human: null, duration: DURATION, preset: 'competitive',
      skill: divisionSkill(d), homeSquad: you, awaySquad: opp,
    });
    const steps = Math.ceil(DURATION * 60);
    for (let s = 0; s < steps && m.phase !== 'end'; s++) m.update(1 / 60);
    const a = m.teams[0].score;
    const b = m.teams[1].score;
    gf += a; ga += b;
    if (a > b) w++; else if (a === b) dr++; else l++;
  }
  const pct = ((w / N) * 100).toFixed(0);
  console.log(`  ${DIVISIONS[d].name.padEnd(12)} ${String(opp.rating).padStart(4)}  `
    + `${String(w).padStart(4)} ${String(dr).padStart(5)} ${String(l).padStart(5)}   `
    + `${pct.padStart(4)}%   ${(gf / N).toFixed(2)} / ${(ga / N).toFixed(2)}`);
}
