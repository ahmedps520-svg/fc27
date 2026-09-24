/**
 * SBC audit (R15 balance part 2, v97): can the repeatable challenges be
 * farmed forever?
 *
 * A repeatable SBC is a loop: cards in, Apex and a pack out, the pack's cards
 * back in. If the pack reliably returns enough cards that meet the brief, the
 * loop never ends and pays Apex (and season XP) for clicking. This plays the
 * loop with the real tables — `CHALLENGES`, `evaluate`, `PACKS`, `openPack`,
 * `dupValue` — from a small starting pile, submitting whatever it can with
 * the cheapest cards that fit, until nothing can be submitted or a cap is hit.
 *
 *   node tools/sbc-audit.mjs [--start 10] [--cap 3000] [--seeds 5]
 *
 * `--start` is how many silver packs of cards the pile begins with.
 */
import '../tests/unit/_dom.mjs';
const { CHALLENGES, evaluate, sizeOf } = await import('../js/data/challenges.js');
const { PACKS, openPack, dupValue } = await import('../js/data/packs.js');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? Number(process.argv[i + 1]) : d; };
const START = arg('--start', 10); const CAP = arg('--cap', 3000); const SEEDS = arg('--seeds', 5);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const packById = (id) => PACKS.find((p) => p.id === id);
const fmt = (n) => Math.round(n).toLocaleString('en-GB');

/** The cheapest submission that meets `c`, from `pile` (cards), or null. */
function pick(c, pile) {
  const size = sizeOf(c);
  const byLow = [...pile].sort((a, b) => a.overall - b.overall);
  const chosen = new Set();
  const take = (cands, n) => { for (const p of cands) { if (n <= 0) break; if (!chosen.has(p)) { chosen.add(p); n -= 1; } } return n <= 0; };
  // the narrowest conditions first, each with the lowest-rated cards that satisfy it
  const filters = [];
  for (const r of c.reqs) {
    const m = r.text.match(/^(\d+)× (.+)$/);
    if (!m) continue;
    const n = +m[1];
    filters.push({ n, ok: (p) => r.got([p], { team: 0 }) >= 1 });
  }
  // several conditions on the same cards (e.g. 3× defenders AND 3× silver): satisfy them together
  const all = (p) => filters.every((f) => f.n < size ? true : f.ok(p));
  for (const f of filters.sort((a, b) => b.n - a.n)) {
    const cands = byLow.filter((p) => f.ok(p) && (f.n === size ? all(p) : true));
    if (!take(cands.filter((p) => filters.every((g) => g === f || g.n < size || g.ok(p))), f.n) && !take(cands, f.n)) return null;
  }
  const same = c.reqs.find((r) => / from one (nation|club)$/.test(r.text));
  if (same) {
    const key = /nation$/.test(same.text) ? 'nation' : 'clubId';
    const groups = {};
    for (const p of byLow) if (p[key]) (groups[p[key]] ||= []).push(p);
    const g = Object.values(groups).find((l) => l.length >= same.need);
    if (!g) return null;
    take(g, same.need - [...chosen].filter((p) => p[key] === g[0][key]).length);
  }
  take(byLow, size - chosen.size);
  const cards = [...chosen].slice(0, size);
  return cards.length === size && evaluate(c, cards, { team: 0 }).ok ? cards : null;
}

const REPEAT = CHALLENGES.filter((c) => c.repeatable && !c.reqs.some((r) => /chemistry/i.test(r.text)));
console.log(`\nRepeatable SBCs: cards in, cards back (the reward pack's size), Apex paid\n`);
console.log('challenge          in   back   net   Apex   pack');
for (const c of REPEAT) {
  const pk = packById(c.reward.pack);
  const net = (pk?.size || 0) - sizeOf(c);
  console.log(`${c.id.padEnd(17)} ${String(sizeOf(c)).padStart(3)} ${String(pk?.size ?? 0).padStart(6)} ${String(net > 0 ? `+${net}` : net).padStart(5)} ${String(c.reward.apex).padStart(6)}   ${c.reward.pack || '—'}${net >= 0 ? '   ◀ returns as many cards as it takes' : ''}`);
}

console.log(`\nThe loop, played: start with ${START} silver packs' worth of cards, submit whatever can be met with the cheapest cards, open what it pays, repeat (cap ${CAP} submissions)\n`);
const silver = packById('silver');
/** Work a fresh pile through `list` (in order, as often as each can be met). */
function run(seed, list) {
  Math.random = mulberry32(seed * 7919);
  const seen = new Set(); const pile = new Map();
  let apex = 0; let subs = 0; const per = {};
  const open = (pk) => { for (const { p, dup } of openPack(pk, seen, false)) { if (dup || pile.has(p.id)) apex += dupValue(p); else pile.set(p.id, p); } };
  for (let i = 0; i < START; i++) open(silver);
  let progressed = true;
  while (progressed && subs < CAP) {
    progressed = false;
    for (const c of list) {
      const cards = pick(c, pile.values());
      if (!cards) continue;
      for (const p of cards) pile.delete(p.id);
      apex += c.reward.apex; subs += 1; per[c.id] = (per[c.id] || 0) + 1; progressed = true;
      if (c.reward.pack) open(packById(c.reward.pack));
      if (subs >= CAP) break;
    }
  }
  return { apex, subs, per, ratio: apex / (START * silver.cost), endless: subs >= CAP };
}
let endless = 0; const ratios = [];
{ // the alternative: quick-sell the same starting pile
  Math.random = mulberry32(7919); const seen = new Set(); let qs = 0;
  for (let i = 0; i < START; i++) for (const { p } of openPack(silver, seen, false)) qs += Math.round((p.value || 0) / 25_000);
  console.log(`(quick-selling the same starting pile pays ◈${fmt(qs)}, ${(qs / (START * silver.cost)).toFixed(2)}×)\n`);
}
// every repeatable at once, and each one alone: a farmer picks whichever pays best
const plans = [['all of them', REPEAT], ...REPEAT.map((c) => [c.id, [c]])];
console.log('plan               runs dry after   paid (× the starting packs\' cost, worst seed)');
for (const [name, list] of plans) {
  let worst = null;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = run(seed, list);
    if (r.endless) endless += 1;
    ratios.push(r.ratio);
    if (!worst || r.ratio > worst.ratio) worst = r;
  }
  console.log(`${name.padEnd(18)} ${worst.endless ? 'NEVER' : String(worst.subs).padStart(5) + ' goes'}        ◈${fmt(worst.apex).padStart(9)}  ${worst.ratio.toFixed(2)}×${worst.ratio >= 1 ? '  ◀' : ''}`);
}
/* The bar: working a pile of cards through every repeatable SBC must pay back
   less than the packs that made the pile cost. Above 1× the sink is a mint —
   buy packs, feed the SBCs, come out ahead, forever. */
const worst = Math.max(...ratios);
const bad = endless || worst >= 1;
console.log(bad ? `\n✗ the repeatables pay out ${worst.toFixed(2)}× what their cards cost: a money loop` : `\n✓ every run ran dry and paid back at most ${worst.toFixed(2)}× what its cards cost`);
process.exitCode = bad ? 1 : 0;
