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
import { WORLD } from './generator.js';
import { RARITY } from './pools.js';

export const PACKS = [
  { id: 'bronze', cat: 'free',  name: 'Bronze',  cost: 0,     size: 4, odds: { bronze: 0.68, silver: 0.28, gold: 0.04, special: 0.00 }, note: '4 cards' },
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
    odds: { bronze: 0.14, silver: 0.36, gold: 0.38, special: 0.12 },
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
  { id: 'prime', cat: 'premium',   name: 'Prime',   cost: 30000, size: 3, odds: { bronze: 0.00, silver: 0.06, gold: 0.72, special: 0.22 }, minOverall: 82, tone: 'special', note: '3 · 82+ min' },
  /* The other end of Lucky Dip: one card, no floor, no guarantee, and odds
     that are genuinely top-heavy. It is the most volatile thing in the store —
     a quarter of the time it is the best single card you can buy without
     paying Limited money, and the rest of the time you paid Prime prices for
     one gold. Priced so that is a real decision rather than an obvious yes. */
  {
    id: 'gamble', cat: 'premium', name: 'High Roller', cost: 26000, size: 1,
    odds: { bronze: 0.00, silver: 0.00, gold: 0.74, special: 0.26 },
    minOverall: 79, tone: 'special',
    note: '1 card · 79+ min',
    promise: 'Best single-card odds in the store',
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
  {
    id: 'legend', cat: 'limited', name: 'Limited: Legends', cost: 200000, size: 5, limited: true,
    guarantee: 'icon',
    odds: { bronze: 0.00, silver: 0.00, gold: 0.14, special: 0.86 },
    note: '5 cards · 84+ min',
    promise: '1 guaranteed Icon · best odds in the game',
  },
];

/** The free bronze recharges on a clock — see the note at the claim site. */
const FREE_MS = 6 * 60 * 60 * 1000;
const fmtLeft = (ms) => {
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
export const RARITY_RANK = { bronze: 0, silver: 1, gold: 2, special: 3, star: 4, icon: 5 };

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
  const matches = (p) => p.rarity === rarity && (!only || only(p));
  let src = WORLD.players.filter(matches);
  if (!src.length) src = only ? WORLD.players.filter(only) : WORLD.players;
  const fresh = seen ? src.filter((p) => !seen.has(p.id)) : src;
  const from = fresh.length ? fresh : src;
  return from[Math.floor(Math.random() * from.length)];
}

/** The player ids a pull would be a repeat of: the collection plus this batch. */
const ownedIds = () => new Set(getState().club.collection);

const hasKeeper = (ids) => ids.some((id) => getPlayer(id)?.position === 'GK');

/**
 * @param {boolean} needGK force one goalkeeper into this pack. A squad without
 *   a keeper cannot be fielded at all, and leaving that to a 1-in-14 roll made
 *   a new player's first four packs a coin toss on whether they could play.
 * @returns {{p: object, dup: boolean}[]} one entry per card in the pack.
 */
export function openPack(pack, seen = new Set(), needGK = false) {
  const draw = (rarity, only = null) => {
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
  if (pack.guarantee) {
    const lo = wantGK ? 1 : 0;
    const at = lo + Math.floor(Math.random() * Math.max(1, pulls.length - lo));
    pulls[at] = draw(pack.guarantee);
  }
  return pulls;
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
export const dupValue = (p) => Math.round(p.value / 25_000);
