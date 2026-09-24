/**
 * Career finances audit (R15 balance part 2, v98).
 *
 * A Manager Career left alone — no transfers, no builder, every match
 * simulated — for several seasons, at clubs from the top of the first tier to
 * the second tier. Per season: the incomes (TV, merchandise, gate, prize), the
 * wage and facilities bill, and the bank at the end. Two things would be
 * wrong: a club that goes broke by doing nothing, and a bank that grows so
 * fast the transfer market stops mattering (measured against what the club's
 * best player costs to buy).
 *
 *   node tools/career-audit.mjs [--seasons 5]
 */
import '../tests/unit/_dom.mjs';
const { getState, update } = await import('../js/state.js');
const career = await import('../js/career.js');
const v2 = await import('../js/careerV2.js');
const v3 = await import('../js/careerV3.js');
const { valueIn } = await import('../js/careerPeople.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const SEASONS = arg('--seasons', 5);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const M = (n) => `${(n / 1e6).toFixed(1)}m`;

// clubs from each end of a first tier, and a second-tier club
const all = v2.allClubs();
const t1 = all.filter((c) => c.tier === 1 || !c.league.endsWith(' 2'));
const league = t1[0].league;
const inLeague = t1.filter((c) => c.league === league)
  .map((c) => ({ c, ovr: career.clubOverall(c.id) })).sort((a, b) => b.ovr - a.ovr);
const t2 = all.find((c) => c.league.endsWith(' 2'));
const picks = [['top of the league', inLeague[0].c], ['mid-table', inLeague[Math.floor(inLeague.length / 2)].c], ['bottom', inLeague.at(-1).c], ['second tier', t2]].filter(([, c]) => c);

let broke = 0; let runaway = 0;
for (const [label, club] of picks) {
  Math.random = mulberry32(2024);
  const car = career.newWorld('Audit', club.id);
  update((s) => { s.career = car; });
  v2.bindState(() => getState().club);
  const start = car.coins;
  console.log(`\n${club.name} (${label}, ${club.league}) — starts with ◈${M(start)}`);
  console.log('season  pos   tv      merch   gate    prize   | wages    facilities  | bank end   best player costs');
  for (let s = 0; s < SEASONS; s++) {
    const season = car.season;
    let guard = 0;
    while (car.season === season && guard++ < 200) {
      // my match is "played" (a simulated score passed in), so the gate is paid as it would be
      const f = career.myFixture(car);
      const score = f && !f.cup ? v2.simScoreV2(car, f.home, f.away) : null;
      career.advanceCar(car, score);
    }
    const h = car.fin.history.at(-1) || {};
    const pos = car.history.at(-1)?.pos;
    const best = Math.max(0, ...(car.squads[car.clubId] || []).map((r) => valueIn(car, r[0]) || 0));
    console.log(`${String(season).padStart(4)}   ${String(pos).padStart(3)}   ${M(h.tv || 0).padStart(6)}  ${M(h.merch || 0).padStart(6)}  ${M(h.tickets || 0).padStart(6)}  ${M(h.prize || 0).padStart(6)}  | ${M(h.wages || 0).padStart(7)}  ${M(h.facilities || 0).padStart(9)}   | ${M(h.end ?? car.coins).padStart(8)}   ${M(best)}`);
    if ((h.end ?? car.coins) < 0) broke += 1;
  }
  const gain = (car.coins - start) / SEASONS;
  const best = Math.max(1, ...(car.squads[car.clubId] || []).map((r) => valueIn(car, r[0]) || 0));
  console.log(`  a season, on average: ${gain >= 0 ? '+' : ''}◈${M(gain)} (${(gain / best).toFixed(2)}× the best player's price)`);
  if (gain / best > 3) runaway += 1;
}
console.log(broke ? `\n✗ ${broke} season-ends in the red with nothing done` : '\n✓ no club goes broke by doing nothing');
console.log(runaway ? `✗ ${runaway} clubs bank more than three best players a season with nothing done` : '✓ no club gets rich enough to stop caring about the market');
process.exitCode = broke || runaway ? 1 : 0;
