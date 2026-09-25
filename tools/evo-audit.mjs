/**
 * Evolutions audit (R15 balance part 2, v98).
 *
 * 1. How long each track takes. Seeded AI-vs-AI matches on the Competitive
 *    preset record what a player in each position does per match (goals,
 *    assists, a win, a clean sheet). A track is then played many times by
 *    drawing matches from that record for a card of a position it fits, and
 *    the matches it took are counted. A person's chosen card gets the ball more
 *    than an AI's average player, so these are upper bounds on the grind.
 * 2. How far tracks stack. `startEvolution` checks the card as already
 *    evolved, so tracks chain; every order is tried from the lowest card each
 *    track takes, and the largest total is reported, with the five paid
 *    levels of evolve.js on top.
 * 3. What the paid levels cost, against a regular player's Apex a day
 *    (tools/economy-audit.mjs).
 *
 *   node tools/evo-audit.mjs [--matches 120] [--trials 4000]
 */
import '../tests/unit/_dom.mjs';
const { Match } = await import('../js/game/sim.js');
const { WORLD } = await import('../js/data/generator.js');
const { EVO_TRACKS } = await import('../js/evolutions.js');
const { apexCost, EVOLVE_MAX } = await import('../js/evolve.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
// v113: 120, not 60 — at 60 RW gets ~65 appearances and a track near the line swung either side of it on the dice alone
const N = arg('--matches', 120); const TRIALS = arg('--trials', 4000);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const realRandom = Math.random;

// ------------------------------------------------------------ 1. the record
const DURATION = 180;                          // an Ultimate XI match
const CLUBS = WORLD.clubs.slice(0, 10);
const rows = {};                               // position → [{ goals, assists, win, clean }]
for (let i = 0; i < N; i++) {
  Math.random = mulberry32(4242 + i * 7919);
  const home = CLUBS[i % CLUBS.length]; let away = CLUBS[(i * 3 + 1) % CLUBS.length];
  if (away === home) away = CLUBS[(i + 5) % CLUBS.length];
  const m = new Match(home.id, away.id, { human: null, duration: DURATION, preset: 'competitive' });
  for (let s = 0; s < DURATION * 60 && m.phase !== 'end'; s++) m.update(1 / 60);
  for (const [k, t] of m.teams.entries()) {
    const o = m.teams[1 - k];
    for (const p of t.players.slice(0, 11)) {
      const pos = p.ref.position;
      (rows[pos] ||= []).push({
        goals: t.scorers.filter((g) => g.id === p.ref.id).length,
        assists: t.scorers.filter((g) => g.assist === p.ref.id).length,
        win: t.score > o.score ? 1 : 0, clean: o.score === 0 ? 1 : 0,
      });
    }
  }
}
Math.random = realRandom;
const rate = (list, k) => list.reduce((a, r) => a + r[k], 0) / list.length;
console.log(`\n1. Per match, by position (${N} AI matches, Competitive, ${DURATION}s)\n`);
console.log('pos    n    goals  assists  win%  clean%');
for (const pos of Object.keys(rows).sort()) {
  const l = rows[pos];
  console.log(`${pos.padEnd(5)} ${String(l.length).padStart(4)}   ${rate(l, 'goals').toFixed(2)}    ${rate(l, 'assists').toFixed(2)}    ${Math.round(100 * rate(l, 'win'))}%    ${Math.round(100 * rate(l, 'clean'))}%`);
}

// ------------------------------------------------------------ 2. the grind
const METRIC = { wins: (r) => r.win, goals: (r) => r.goals, assists: (r) => r.assists, apps: () => 1, cleanSheets: (r) => r.clean, involve: (r) => r.goals + r.assists };
/* Every position a track accepts (read from its own `fits`), so a track a card
   can start but never finish shows up. */
const POSITIONS = Object.keys(rows).sort();
const POS_FOR = Object.fromEntries(EVO_TRACKS.map((t) => [t.id, POSITIONS.filter((pos) => t.fits({ position: pos, age: 19, overall: 70, stats: { pace: 80 } }))]));
const STUCK = 60;          // more than this and a card is, for practical purposes, stuck on the track
const stuck = [];
console.log(`\n2. Matches to finish each track (${TRIALS} runs each, the card starting every match)\n`);
console.log('track      as     mean   p90   ovr   matches per +1');
Math.random = mulberry32(99);
for (const t of EVO_TRACKS) {
  for (const pos of POS_FOR[t.id] || []) {
    const pool = rows[pos]; if (!pool?.length) continue;
    const counts = [];
    for (let k = 0; k < TRIALS; k++) {
      let n = 0;
      for (const st of t.stages) { let prog = 0; while (prog < st.need.n && n < 500) { prog += METRIC[st.need.metric](pool[Math.floor(Math.random() * pool.length)]); n += 1; } }
      counts.push(n);
    }
    counts.sort((a, b) => a - b);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const ovr = t.stages.reduce((a, s) => a + (s.give.ovr || 0), 0);
    const flag = mean > STUCK ? '   ◀ stuck' : '';
    if (flag) stuck.push(`${t.id} as ${pos}`);
    console.log(`${t.id.padEnd(10)} ${pos.padEnd(5)} ${mean.toFixed(1).padStart(5)} ${String(counts[Math.floor(counts.length * 0.9)]).padStart(5)}   +${ovr}      ${(mean / ovr).toFixed(1)}${flag}`);
  }
}
Math.random = realRandom;
console.log(stuck.length ? `\n✗ ${stuck.length} track/position pairs a card can start and practically never finish (> ${STUCK} matches): ${stuck.join(', ')}` : `\n✓ every track finishes within ${STUCK} matches for every position it accepts`);

// ------------------------------------------------------------ 3. stacking
/* The cap each track checks, read from its `fits` by probing: the highest
   overall it still accepts for a card shaped to pass everything else. */
const probe = (t, pos, age, ovr) => t.fits({ position: pos, age, overall: ovr, stats: { pace: 70 } });
const capOf = (t, pos, age) => { let c = -1; for (let o = 40; o <= 99; o++) if (probe(t, pos, age, o)) c = o; return c; };
const gainOf = (t) => t.stages.reduce((a, s) => a + (s.give.ovr || 0), 0);
console.log('\n3. How far tracks stack on one card (every order tried)\n');
let worst = null;
for (const pos of ['GK', 'CB', 'LB', 'CDM', 'CM', 'CAM', 'LM', 'LW', 'RW', 'ST']) {
  for (const age of [19, 25]) {
    const fit = EVO_TRACKS.filter((t) => capOf(t, pos, age) >= 0);
    let best = { gain: 0, order: [] , from: 0 };
    const perms = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perms([...arr.slice(0, i), ...arr.slice(i + 1)]).map((r) => [x, ...r])));
    for (const order of perms(fit)) {
      // start as high as the first track allows, then take each track the card still fits
      for (let start = 60; start <= 85; start++) {
        let ovr = start; const took = [];
        for (const t of order) if (probe(t, pos, age, ovr)) { ovr += gainOf(t); took.push(t.id); }
        if (ovr - start > best.gain || (ovr - start === best.gain && ovr > best.from + best.gain)) best = { gain: ovr - start, order: took, from: start };
      }
    }
    if (best.gain && (!worst || best.gain > worst.gain)) worst = { ...best, pos, age };
    if (best.gain) console.log(`${pos.padEnd(4)} age ${age}: +${best.gain} (${best.from} → ${best.from + best.gain}) via ${best.order.join(' → ')}`);
  }
}
if (worst) console.log(`\nlargest: a ${worst.age}-year-old ${worst.pos} goes ${worst.from} → ${worst.from + worst.gain} on tracks alone, → ${Math.min(99, worst.from + worst.gain + EVOLVE_MAX)} with the ${EVOLVE_MAX} paid levels`);

// ------------------------------------------------------------ 4. paid levels
console.log('\n4. The paid levels (evolve.js), Apex for all five\n');
for (const ovr of [65, 75, 80, 85, 90]) {
  let sum = 0; for (let l = 0; l < EVOLVE_MAX; l++) sum += apexCost({ overall: ovr }, l);
  console.log(`a ${ovr}: ◈${sum.toLocaleString('en-GB')}`);
}

process.exitCode = stuck.length ? 1 : 0;
