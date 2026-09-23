/**
 * Packs: the table, the odds and the draw.
 *
 * Lifted out of screens/squad.js so it has exactly one home. The store on the
 * phone and the stripped-down store on the watch open packs through this file
 * and no other, because two implementations of "what does a Prime pack
 * contain" is a promise the game would eventually break on one of them.
 *
 * Nothing here touches the DOM or the save — it is the rules, and the screens
 * are what spend coins and store the result.
 */
import { WORLD, getPlayer } from './generator.js';
import { RARITY } from './pools.js';
import { price } from '../economy.js';
import { campaignNow, campaignCards, weekCards, iconTierCards, weekNow } from './promos.js';

/** The nation the Nations Week pack is drawn from: one of twelve, rotating weekly. */
const WEEK_NATIONS = ['France', 'Brazil', 'England', 'Spain', 'Argentina', 'Germany', 'Italy', 'Portugal', 'Netherlands', 'Saudi Arabia', 'Morocco', 'Belgium'];
export const nationOfWeek = (now = Date.now()) => WEEK_NATIONS[Math.floor(now / 604_800_000) % WEEK_NATIONS.length];

export const PACKS = [
  /* v80: the promo shelf. Each promises one card of its kind in the first slot,
     on top of gold filler, and says exactly what that slot can be. */
  { id: 'campaign', cat: 'promo', name: 'Campaign', cost: 25000, size: 3, variant: 'campaign', odds: { bronze: 0, silver: 0, gold: 0.9, special: 0.1 }, floor: 'gold', note: '3 cards · 1 campaign card', promise: '1 guaranteed card from this week\'s campaign', variantOdds: [['Campaign card', 1]] },
  { id: 'inform', cat: 'promo', name: 'In-Form', cost: 18000, size: 3, variant: 'inform', odds: { bronze: 0, silver: 0, gold: 0.92, special: 0.08 }, floor: 'gold', note: '3 cards · 1 in-form', promise: '1 guaranteed In-Form (1 in 8 is Team of the Week)', variantOdds: [['In-Form', 0.875], ['Team of the Week', 0.125]] },
  { id: 'vault', cat: 'limited', name: 'Legends Vault', cost: 120000, size: 1, limited: true, variant: 'icontier', odds: { bronze: 0, silver: 0, gold: 0, special: 1 }, note: '1 Icon · any tier', promise: '1 guaranteed Icon — Early, Peak or Prime', variantOdds: [['Early Icon (92)', 0.7], ['Peak Icon (95)', 0.25], ['Prime Icon (99)', 0.05]] },

  { id: 'bronze', cat: 'free',  name: 'Bronze',  cost: 0,     size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0.00 }, note: '4 cards' },
  /* v73: SBC fodder. Six cheap bodies — bronzes and silvers — for the quick
     SBCs, priced so a pack is always worth less than the challenge it feeds. */
  { id: 'fodder', cat: 'standard', name: 'SBC Fodder', cost: 1500, size: 6, odds: { bronze: 0.62, silver: 0.34, gold: 0.04, special: 0.00 }, tone: 'bronze', note: '6 cards · for SBCs' },
  { id: 'silver', cat: 'standard',  name: 'Silver',  cost: 2000,  size: 4, odds: { bronze: 0.32, silver: 0.52, gold: 0.15, special: 0.01 }, note: '4 cards' },
  /* Sold for what it does, not what it rolls. A squad cannot be fielded without
     a keeper, and the odds of one turning up in a four-card pack are about one
     in four — which is a long way to go for the single card the game will not
     let you play without. Two cards, one of them certainly a GK. */
  {
    id: 'keeper', cat: 'standard', name: 'Keeper', cost: 3500, size: 2,
    odds: { bronze: 0.10, silver: 0.44, gold: 0.44, special: 0.02 },
    forcePosition: 'GK',
    note: '2 cards',
    promise: '1 guaranteed goalkeeper',
  },
  /* The cheap gamble. One card, and the odds are deliberately top-heavy for the
     price — this is the pack you open because the last match paid for it, and
     the whole point is that it is over in one reveal. */
  {
    id: 'dip', cat: 'standard', name: 'Lucky Dip', cost: 5000, size: 1,
    // v93: the audit found its best card averaged below a Silver pack's at 2.5x the price
    odds: { bronze: 0.05, silver: 0.30, gold: 0.45, special: 0.20 },
    note: '1 card · high variance',
  },
  /* The Keeper pack's mirror. A squad with no striker is not blocked the way
     a squad with no keeper is, so this sells convenience rather than rescue —
     same shape, same price, the position everyone actually wants. */
  {
    id: 'striker', cat: 'standard', name: 'Striker', cost: 3500, size: 2,
    odds: { bronze: 0.10, silver: 0.44, gold: 0.44, special: 0.02 },
    forcePosition: 'ST',
    note: '2 cards',
    promise: '1 guaranteed striker',
  },
  /* Cheap bulk below Gold. Six bodies with no bronze in the bottom slot —
     bought for challenge fodder and early-save depth, not for headlines. */
  {
    id: 'stack', cat: 'standard', name: 'Silver Stack', cost: 4500, size: 6,
    odds: { bronze: 0.20, silver: 0.58, gold: 0.20, special: 0.02 },
    floor: 'silver',
    note: '6 · silver min',
  },
  { id: 'gold', cat: 'standard',    name: 'Gold',    cost: 7500,  size: 5, odds: { bronze: 0.06, silver: 0.36, gold: 0.53, special: 0.05 }, floor: 'gold', note: '5 · gold min' },
  /* v73: packs by position and by age, at the Keeper pack's price point. */
  { id: 'youth', cat: 'standard', name: 'Youth Academy', cost: 6000, size: 3, odds: { bronze: 0.10, silver: 0.50, gold: 0.38, special: 0.02 }, filter: { maxAge: 21 }, floor: 'silver', tone: 'silver', note: '3 · aged 21 or under', promise: 'Every card 21 or under' },
  { id: 'defence', cat: 'standard', name: 'Back Four', cost: 6000, size: 4, odds: { bronze: 0.10, silver: 0.50, gold: 0.38, special: 0.02 }, filter: { positions: ['CB', 'LB', 'RB'] }, floor: 'silver', tone: 'keeper', note: '4 · defenders only', promise: 'Four defenders' },
  { id: 'midfield', cat: 'standard', name: 'Engine Room', cost: 6000, size: 3, odds: { bronze: 0.10, silver: 0.50, gold: 0.38, special: 0.02 }, filter: { positions: ['CDM', 'CM', 'CAM', 'LM', 'RM'] }, floor: 'silver', tone: 'silver', note: '3 · midfielders only', promise: 'Three midfielders' },
  /* The bulk option, and the only pack that pays for the gap between Gold and
     Prime. Eight cards at Gold-ish odds is worse per card than Prime and far
     better per Apex — it is the one to buy when a squad-building challenge wants
     bodies rather than a headline. */
  {
    id: 'builder', cat: 'premium', name: 'Squad Builder', cost: 15000, size: 8,
    odds: { bronze: 0.04, silver: 0.40, gold: 0.51, special: 0.05 },
    floor: 'gold', tone: 'gold',
    note: '8 · gold min',
  },
  /* The step between Gold and Prime that did not exist: three cards that are
     all at least useful (78+) without Prime's price or its special odds. */
  {
    id: 'form', cat: 'premium', name: 'Form Signing', cost: 12000, size: 3,
    odds: { bronze: 0.00, silver: 0.10, gold: 0.78, special: 0.12 },
    minOverall: 78, tone: 'gold',
    note: '3 · 78+ min',
  },
  /* A guaranteed special for less than Prime, in exchange for volume: two
     cards, one of them certainly special-or-better. The cheapest certain
     special in the store, and deliberately nothing else. */
  {
    id: 'double', cat: 'premium', name: 'Double Down', cost: 21000, size: 2,
    odds: { bronze: 0.00, silver: 0.10, gold: 0.70, special: 0.20 },
    floor: 'special', tone: 'special',
    note: '2 cards · special min',
    promise: '1 guaranteed Special',
  },
  { id: 'prime', cat: 'premium',   name: 'Prime',   cost: 30000, size: 3, odds: { bronze: 0.00, silver: 0.04, gold: 0.66, special: 0.30 }, minOverall: 82, tone: 'special', note: '3 · 82+ min' },
  /* v73: a division's own pack, the nation of the week, and the biggest bulk pack in the store. */
  { id: 'premier', cat: 'premium', name: 'Premier Pick', cost: 14000, size: 3, odds: { bronze: 0.00, silver: 0.14, gold: 0.74, special: 0.12 }, filter: { leagues: ['Apex Premier Division'] }, floor: 'gold', tone: 'gold', note: '3 · top division only', promise: 'Every card from the Apex Premier Division' },
  { id: 'nations', cat: 'premium', name: 'Nations Week', cost: 12000, size: 3, odds: { bronze: 0.00, silver: 0.20, gold: 0.70, special: 0.10 }, filter: { nationOfWeek: true }, floor: 'gold', tone: 'gold', note: '3 · one nation', promise: 'This week: the nation on the shelf', weekly: true },
  { id: 'mega', cat: 'premium', name: 'Mega', cost: 20000, size: 12, odds: { bronze: 0.06, silver: 0.36, gold: 0.52, special: 0.06 }, floor: 'gold', tone: 'gold', note: '12 · gold min', promise: 'A dozen cards in one reveal' },
  /* The other end of Lucky Dip: one card, no floor, no guarantee, and odds
     that are genuinely top-heavy. It is the most volatile thing in the store —
     a quarter of the time it is the best single card you can buy without
     paying Limited money, and the rest of the time you paid Prime prices for
     one gold. Priced so that is a real decision rather than an obvious yes. */
  {
    /* v93: the audit found it promised "the best single-card odds in the
       store" and delivered a 90+ one time in five — what a 7,500 Gold pack
       does. Now it is the store's premium single card, and says only that. */
    id: 'gamble', cat: 'premium', name: 'High Roller', cost: 18000, size: 1,
    odds: { bronze: 0.00, silver: 0.00, gold: 0.45, special: 0.55 },
    minOverall: 83, tone: 'special',
    note: '1 card · 83+ min',
    promise: 'One card, usually a Special',
  },
  /* Eleven cards, one whole squad's worth, at odds a shade under Gold. The
     bulk option above Squad Builder — bought to fill a squad or feed a
     challenge in one go rather than to chase a headline. */
  {
    id: 'eleven', cat: 'premium', name: 'The Eleven', cost: 45000, size: 11,
    odds: { bronze: 0.00, silver: 0.33, gold: 0.60, special: 0.07 },
    floor: 'special', tone: 'gold',
    note: '11 · one special min',
  },
  {
    id: 'stars', cat: 'limited', name: 'Limited: Stars', cost: 40000, size: 3, limited: true,
    guarantee: 'star',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.55, special: 0.45 },
    note: '3 cards · 79+ min',
    promise: '1 guaranteed 92-rated Star',
  },
  {
    id: 'limited', cat: 'limited', name: 'Limited: Icons', cost: 75000, size: 3, limited: true,
    guarantee: 'icon',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.30, special: 0.70 },
    note: '3 cards · 79+ min',
    promise: '1 guaranteed 99-rated Icon',
  },
  /* One card, Limited money, no guarantee stamped on it — the odds ARE the
     promise. Sits between High Roller (26k, one card, 26% special) and the
     guaranteed Star/Icon packs: nearly always special, never certain. */
  {
    id: 'wildcard', cat: 'limited', name: 'Limited: Wildcard', cost: 55000, size: 1, limited: true,
    odds: { bronze: 0.00, silver: 0.00, gold: 0.10, special: 0.90 },
    minOverall: 86, tone: 'special',
    note: '1 card · 86+ min',
    promise: '90% special or better',
  },
  /* The top of the objective ladder pays this, and almost nothing else does.
     It is in the store so it has a stated price, but 200,000 Apex is roughly
     forty division wins — the intended way to hold one is to earn it. */
  /* v73: four cards with a Star in them, between the Stars pack and the Icons. */
  { id: 'wonder', cat: 'limited', name: 'Limited: Wonder', cost: 90000, size: 4, limited: true, guarantee: 'star', odds: { bronze: 0.00, silver: 0.00, gold: 0.34, special: 0.66 }, minOverall: 84, note: '4 cards · 84+ min', promise: '1 guaranteed Star · 84+ throughout' },
  {
    id: 'legend', cat: 'limited', name: 'Limited: Legends', cost: 200000, size: 5, limited: true,
    guarantee: 'icon',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.14, special: 0.86 },
    note: '5 cards · 84+ min',
    promise: '1 guaranteed Icon · best odds in the game',
  },
];

/** The free bronze recharges on a clock — see the note at the claim site. */
/** How long the free pack takes to come back. Shared with the phone store and the watch. */
export const FREE_MS = 6 * 60 * 60 * 1000;
export const fmtLeft = (ms) => {
  // minutes first, then split — ceiling the remainder alone yields "5h 60m"
  const mins = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
};

/** Limited Edition is also the reward for the hardest objective. */
export const PACK_BY_ID = (id) => PACKS.find((p) => p.id === id) || PACKS[0];

/* Which colour a pack wears in the store and the locker.
 *
 * This used to be written inline as `guarantee || (id === 'prime' ? 'special' :
 * id)`, in two places, which quietly meant "every pack must be named after a
 * rarity". Any pack that was not — Keeper, Lucky Dip, Squad Builder — fell
 * through to the default grey and looked broken next to the others. `tone` lets
 * a pack say what it wants to look like; falling back to `guarantee` then `id`
 * keeps every existing pack exactly the colour it already was. */
export const packTone = (p) => p.tone || p.guarantee || p.id;

/* Cheapest to rarest. `rarityFor` only ever returns the first four — star and
 * icon are set by hand on the named cards — but they rank above `special` so a
 * "gold or better" floor is satisfied by an Icon rather than overwritten by one. */
export const RARITY_RANK = { bronze: 0, silver: 1, gold: 2, special: 3, inform: 3, totw: 4, future: 4, desert: 4, winter: 4, star: 4, icon: 5 };

export function rollRarity(odds) {
  const r = Math.random();
  let acc = 0;
  for (const [rarity, chance] of Object.entries(odds)) {
    acc += chance;
    if (r <= acc) return rarity;
  }
  return 'silver';
}

/**
 * Draw one card of a rarity, avoiding anyone in `seen`.
 *
 * A card you already own is worthless — the collection holds one of each — so a
 * pack that keeps handing them over is a pack that quietly gives you nothing.
 * Cards you do not have come first; only when a whole rarity is exhausted does
 * a repeat come back, and the caller pays that out in coins instead.
 */
export function drawPlayer(rarity, seen, only = null) {
  // SBC reward cards are earned, never pulled
  const matches = (p) => !p.sbc && p.rarity === rarity && (!only || only(p));
  let src = WORLD.players.filter(matches);
  if (!src.length) src = only ? WORLD.players.filter((p) => !p.sbc && only(p)) : WORLD.players.filter((p) => !p.sbc);
  const fresh = seen ? src.filter((p) => !seen.has(p.id)) : src;
  const from = fresh.length ? fresh : src;
  return from[Math.floor(Math.random() * from.length)];
}


export const hasKeeper = (ids) => ids.some((id) => getPlayer(id)?.position === 'GK');

/**
 * @param {boolean} needGK force one goalkeeper into this pack. A squad without
 *   a keeper cannot be fielded at all, and leaving that to a 1-in-14 roll made
 *   a new player's first four packs a coin toss on whether they could play.
 * @returns {{p: object, dup: boolean}[]} one entry per card in the pack.
 */
/**
 * A pack's content filter, from data: `{ nations: [...], leagues: [...],
 * clubs: [...], minOverall: n }`. Event packs are written in events.json and
 * this is what turns that JSON into a predicate. Missing = no restriction.
 */
export function filterOf(f) {
  if (!f) return null;
  return (p) => (!f.nations || f.nations.includes(p.nation))
    && (!f.leagues || (p.clubId && f.leagues.includes(WORLD.clubsById[p.clubId]?.league)))
    && (!f.clubs || f.clubs.includes(p.clubId))
    && (!f.positions || f.positions.includes(p.position))
    && (!f.maxAge || p.age <= f.maxAge)
    && (!f.nationOfWeek || p.nation === nationOfWeek())
    && (!f.minOverall || p.overall >= f.minOverall);
}

export function openPack(pack, seen = new Set(), needGK = false) {
  const scope = filterOf(pack.filter);
  const draw = (rarity, extra = null) => {
    const only = scope && extra ? (p) => scope(p) && extra(p) : (scope || extra);
    const p = drawPlayer(rarity, seen, only);
    const dup = seen.has(p.id);
    seen.add(p.id);
    return { p, dup };
  };

  const pulls = [];
  for (let i = 0; i < pack.size; i++) pulls.push(draw(rollRarity(pack.odds)));

  /* `floor` and `minOverall` used to be `pack.id === 'gold'` and
   * `pack.id === 'prime'` written out longhand here. They are declared on the
   * pack now because they are not properties of those two packs, they are
   * properties any pack can want — and a store that grows by adding an id check
   * in the opener for every new pack is a store that stops growing. */
  if (pack.floor && !pulls.some((x) => RARITY_RANK[x.p.rarity] >= RARITY_RANK[pack.floor])) {
    pulls[pulls.length - 1] = draw(pack.floor);
  }
  /* The replacement has to clear the bar too. This used to redraw at rarity
   * `gold`, and gold starts at 79 — so a pack whose store note reads "82+ min"
   * was handing over 79s and 80s, and measured, only 42% of Prime packs
   * actually held to the number they were sold on. Constraining the redraw is
   * what makes the promise on the card true. */
  if (pack.minOverall) {
    pulls.forEach((x, i) => {
      if (x.p.overall < pack.minOverall) {
        pulls[i] = draw(Math.random() < 0.25 ? 'special' : 'gold',
          (p) => p.overall >= pack.minOverall);
      }
    });
  }
  // Limited Edition never hands back a bronze or a silver. An Icon is left
  // exactly as the roll found it — guaranteeing one would defeat the point.
  if (pack.limited) {
    pulls.forEach((x, i) => {
      if (x.p.rarity === 'bronze' || x.p.rarity === 'silver') {
        pulls[i] = draw(Math.random() < 0.6 ? 'special' : 'gold');
      }
    });
  }
  // Either the squad has no keeper at all (needGK) or the pack promises a
  // position outright. Same mechanism: if the roll did not produce one, the
  // first slot is redrawn constrained to it. `forcePosition` takes any
  // position now, not just GK — the Striker pack is the Keeper pack's mirror
  // and earned the generalisation.
  const wantPos = pack.forcePosition || (needGK ? 'GK' : null);
  if (wantPos && !pulls.some((x) => x.p.position === wantPos)) {
    pulls[0] = draw(rollRarity(pack.odds), (p) => p.position === wantPos);
  }
  // The promised card, last, so nothing above can overwrite it — and in a
  // Random slot, which no longer matters to the reveal — that now sorts by
  // rating so the best card lands last, see runPackAnimation. Kept random
  // anyway because nothing should depend on the guarantee sitting at a fixed
  // index. Slot 0 is skipped when a keeper was forced into it.
  // v80: the promo slot
  if (pack.variant) {
    const r = Math.random();
    let pool = [];
    if (pack.variant === 'campaign') pool = campaignCards(campaignNow());
    else if (pack.variant === 'inform') pool = r < 0.125 ? weekCards('totw', weekNow()) : weekCards('inform', weekNow());
    else if (pack.variant === 'icontier') pool = iconTierCards(r < 0.7 ? 'early' : r < 0.95 ? 'peak' : 'prime');
    if (pool.length) {
      const fresh = pool.filter((p) => !seen.has(p.id));
      const from = fresh.length ? fresh : pool;
      // better cards are rarer: weight towards the lower end of the pool
      const sorted = from.slice().sort((a, b) => a.overall - b.overall);
      const p = sorted[Math.floor(Math.pow(Math.random(), 1.8) * sorted.length)];
      const dup = seen.has(p.id);
      seen.add(p.id);
      pulls[0] = { p, dup };
    }
  }
  if (pack.guarantee) {
    /* `wantGK` here was a leftover from before the move out of squad.js —
     * an undefined name, so every pack with a guarantee (Star, Icon) threw
     * on open. Caught by tests/unit/packs.test.mjs; keep it covered. */
    const lo = wantPos ? 1 : 0;
    const at = lo + Math.floor(Math.random() * Math.max(1, pulls.length - lo));
    pulls[at] = draw(pack.guarantee);
  }
  return pulls;
}

/**
 * Three cards a pack could hand you — the picture on the shelf. The best of
 * what its scope and floor allow, dealt fresh each day so the shelf changes,
 * never the same three the store showed yesterday. Deterministic, so the
 * store does not reshuffle on every render.
 */
export function samplePulls(pack, n = 3, day = Math.floor(Date.now() / 86_400_000)) {
  // v80: a promo pack shows the best of its promo slot
  if (pack.variant) {
    const pool = pack.variant === 'campaign' ? campaignCards(campaignNow()) : pack.variant === 'inform' ? weekCards('totw', weekNow()) : iconTierCards('prime');
    return pool.slice().sort((a, b) => b.overall - a.overall).slice(0, n);
  }
  const scope = filterOf(pack.filter) || (() => true);
  const rank = RARITY_RANK[pack.guarantee || pack.floor || 'gold'] ?? 2;
  const pool = WORLD.players.filter((p) => !p.sbc && scope(p) && (RARITY_RANK[p.rarity] ?? 0) >= rank
    && (!pack.minOverall || p.overall >= pack.minOverall));
  if (!pool.length) return [];
  pool.sort((a, b) => b.overall - a.overall);
  const top = pool.slice(0, Math.min(pool.length, 24));
  let h = 2166136261;
  for (const ch of `${pack.id}|${day}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const out = [];
  while (out.length < n && top.length) { h = (Math.imul(h, 1103515245) + 12345) >>> 0; out.push(top.splice(h % top.length, 1)[0]); }
  return out;
}

/** Exposed so the pack odds can be measured against the real draw code. */
export const __openPackForTest = openPack;

/**
 * What a card you already own is worth — the same as selling it.
 *
 * An Icon is valued at 250M, which at this divisor would pay 10,000 Apex for a
 * repeat. That is deliberate: pulling a second Icon should feel like a result,
 * not like the pack failed.
 */
/* Quick-sell: a slice of the card's *market* price, which answers to supply
   and demand (economy.js) — dumping a kind of card lowers what it fetches. */
export const dupValue = (p) => Math.max(50, Math.round(price(p) / 25_000));
