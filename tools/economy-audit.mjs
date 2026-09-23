/**
 * Economy audit (R15, v93): what the game pays and charges, from the real
 * tables and functions, not from memory.
 *
 *   1. Every pack: price against the quick-sell value of what it gives, over
 *      many seeded openings — a pack whose cards sell for more than it costs
 *      is an infinite-money loop.
 *   2. Every way to earn in a match: Apex per real minute (match length plus
 *      a minute and a half either side), wins and losses.
 *   3. A month for three players — casual, regular, grinder — through the
 *      ladder, with the daily login and the season pass: what they earn, how
 *      many packs that is, and how long the dearest things take.
 *
 *   node tools/economy-audit.mjs [--opens 2000]
 */
import '../tests/unit/_dom.mjs';
const { PACKS, openPack } = await import('../js/data/packs.js');
const { DIVISIONS } = await import('../js/state.js');
const { matchApex } = await import('../js/ultimate.js');
const { FIVES } = await import('../js/modes.js');
const { DAILY } = await import('../js/progress.js');
const { WORLD } = await import('../js/data/generator.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OPENS = Number(arg('--opens', 2000));
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const quickSell = (p) => Math.round((p?.value || 0) / 25_000);
const fmt = (n) => Math.round(n).toLocaleString('en-GB');

// ------------------------------------------------------------------ 1. packs
console.log('\n1. Packs — price against quick-sell value (mean over ' + OPENS + ' opens)\n');
console.log('pack              price   sells for   ratio   special%   best card mean   a 90+');
const packValue = {};
for (const pack of PACKS) {
  if (pack.limited && pack.cost > 100000) { /* the vault: priced for what it is, one legend */ }
  Math.random = mulberry32(1234 + pack.id.length * 97);
  let sold = 0; let specials = 0; let best = 0; let n = 0; let ninety = 0;
  for (let i = 0; i < OPENS; i++) {
    let pulls;
    try { pulls = openPack(pack, new Set(), false); } catch { pulls = null; }
    if (!Array.isArray(pulls) || !pulls.length) continue;
    n += 1;
    const cards = pulls.map((x) => (x?.p ? x.p : x && x.id ? x : WORLD.playersById[x])).filter(Boolean);
    sold += cards.reduce((a, p) => a + quickSell(p), 0);
    specials += cards.some((p) => p.rarity && !['bronze', 'silver', 'gold'].includes(p.rarity)) ? 1 : 0;
    const top = Math.max(0, ...cards.map((p) => p.overall || 0)); best += top; if (top >= 90) ninety += 1;
  }
  if (!n) { console.log(`${pack.id.padEnd(16)}  (could not open outside the game)`); continue; }
  const mean = sold / n; packValue[pack.id] = mean;
  const ratio = pack.cost ? mean / pack.cost : Infinity;
  const flag = pack.cost && ratio >= 1 ? '  ◀ SELLS FOR MORE THAN IT COSTS' : '';
  console.log(`${pack.id.padEnd(16)} ${String(fmt(pack.cost)).padStart(7)} ${String(fmt(mean)).padStart(10)}   ${pack.cost ? ratio.toFixed(2).padStart(5) : '  free'}   ${(100 * specials / n).toFixed(1).padStart(7)}%   ${(best / n).toFixed(1).padStart(14)}   ${(100 * ninety / n).toFixed(1).padStart(5)}%${flag}`);
}

// ------------------------------------------------------------------ 2. modes
const OVERHEAD = 1.5;                         // minutes of pre-match, loading and the full-time screen
const perMin = (apex, matchSecs) => apex / (matchSecs / 60 + OVERHEAD);
const silver = PACKS.find((p) => p.id === 'silver')?.cost || 2000;
console.log('\n2. Earning in a match — Apex per real minute (a won match\'s pack counted at shop price)\n');
console.log('mode                               win      draw     loss    per min (win / loss)');
const rows = [];
for (const [i, d] of DIVISIONS.entries()) {
  if (![0, 3, 6, 10].includes(i)) continue;
  const w = matchApex(d, { won: true, poss: 50 }) + silver; const dr = matchApex(d, { drew: true, poss: 50 }); const l = matchApex(d, { poss: 50 });
  rows.push([`Ultimate XI · ${d.name}`, w, dr, l, 180]);
}
const f = FIVES.reward;
rows.push([`Quickfire Fives (2 goals for)`, f.win + 2 * f.goal, f.draw + 2 * f.goal, f.loss + 2 * f.goal, FIVES.duration]);
rows.push([`Street (3 stars / 1 star)`, 500 + 3 * 150, 0, 150 + 1 * 150, 150]);
rows.push([`Kick Off friendly (2 goals)`, 200 + 2 * 60, 200 + 2 * 60, 200 + 2 * 60, 240]);
rows.push([`Skills drill (good score)`, 150, 0, 60, 45]);
for (const [name, w, dr, l, secs] of rows) {
  console.log(`${name.padEnd(34)} ${String(fmt(w)).padStart(6)} ${String(fmt(dr)).padStart(8)} ${String(fmt(l)).padStart(8)}    ${fmt(perMin(w, secs))} / ${fmt(perMin(l, secs))}`);
}

// ------------------------------------------------------------------ 3. a month
console.log('\n3. A month of play — through the Ultimate XI ladder, with the daily login\n');
const dailyApex = DAILY.reduce((a, r) => a + (r.apex || 0) + (r.pack ? (PACKS.find((p) => p.id === r.pack)?.cost || 0) : 0), 0) / DAILY.length;
const PLAYERS = [['casual', 3, 0.45], ['regular', 8, 0.52], ['grinder', 20, 0.58]];
const vault = PACKS.find((p) => p.id === 'vault');
console.log('player     matches/day  win%   Apex/day (cash + packs)   month total   division reached   days to a Legends Vault');
for (const [name, perDay, winRate] of PLAYERS) {
  Math.random = mulberry32(99 + perDay);
  let divIdx = 0; let progress = 0; let apex = 0; let packs = 0; let cashOnly = 0;
  for (let day = 0; day < 30; day++) {
    apex += dailyApex; cashOnly += DAILY[day % 7].apex || 0;
    for (let m = 0; m < perDay; m++) {
      // a harder division is harder to win in
      const wr = Math.max(0.2, winRate - divIdx * 0.025);
      const r = Math.random(); const won = r < wr; const drew = !won && r < wr + 0.22;
      const div = DIVISIONS[divIdx];
      const cash = matchApex(div, { won, drew, poss: 50 });
      apex += cash; cashOnly += cash;
      if (won) { packs += 1; apex += silver; }
      progress += won ? 1 : drew ? 0 : -1;
      if (progress >= div.need && divIdx < DIVISIONS.length - 1) { divIdx += 1; progress = 0; apex += 1500; cashOnly += 1500; }
      else if (progress < 0) { if (divIdx > 0) { divIdx -= 1; progress = Math.max(0, DIVISIONS[divIdx].need - 1); } else progress = 0; }
    }
  }
  const perDayApex = apex / 30;
  const vaultDays = vault ? vault.cost / (cashOnly / 30) : NaN;
  console.log(`${name.padEnd(10)} ${String(perDay).padStart(11)}  ${String(Math.round(winRate * 100)).padStart(3)}%   ${fmt(perDayApex).padStart(10)} (${fmt(cashOnly / 30)} cash)   ${fmt(apex).padStart(11)}   ${DIVISIONS[divIdx].name.padEnd(16)}   ${vaultDays.toFixed(1)}`);
}
console.log('\n(Season-pass tiers, objectives, challenges and events come on top; they are paced by the calendar, not by matches.)');
