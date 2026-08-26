import {
  FIRST_NAMES, LAST_NAMES, NATIONS, CLUB_BLUEPRINTS, LEAGUE_NAME, POSITIONS, rarityFor,
  ICONS, ICON_TRAITS, STARS, STAR_TRAITS,
} from './pools.js';
import { REAL_PLAYERS, NATION_COLORS } from './realPlayers.js';

/* ------------------------------------------------------------------ *
 * Seeded RNG — the same world is generated on every load so saved
 * career data keeps pointing at the same players.
 * ------------------------------------------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORLD_SEED = 27110;

function makeRand(seed) {
  const r = mulberry32(seed);
  return {
    next: r,
    int: (min, max) => Math.floor(r() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    // bell-ish curve so most players sit mid-range
    around: (mid, spread) => {
      const g = (r() + r() + r()) / 3 - 0.5;
      return Math.round(mid + g * spread * 2);
    },
  };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ------------------------------------------------------------------ *
 * Player
 * ------------------------------------------------------------------ */

// Squad shape used for every club roster (21 players).
const ROSTER_SHAPE = [
  'GK', 'GK', 'GK',
  'LB', 'LB', 'CB', 'CB', 'CB', 'CB', 'RB', 'RB',
  'CDM', 'CDM', 'CM', 'CM', 'CM', 'CAM', 'LM', 'RM',
  'ST', 'ST',
];

// Wide and attacking depth, drawn in a second pass (see buildWorld). The shape
// above is a 4-4-2 squad list with no wingers in it at all, which left nine
// LW/RW in the entire world — not enough to fill the 4-3-3 the card game
// offers, let alone choose between players for the slot.
const DEPTH_SHAPE = ['LW', 'LW', 'RW', 'RW', 'LM', 'RM', 'CAM', 'ST', 'CM', 'CB'];

const STAT_KEYS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

// Rough per-position stat profile: [pace, shooting, passing, dribbling, defending, physical]
// offsets applied around the player's base level.
const PROFILES = {
  GK:  [-18, -30, -6, -12, 10, 6],
  CB:  [-8, -26, -6, -16, 14, 10],
  LB:  [8, -16, 0, 2, 6, -4],
  RB:  [8, -16, 0, 2, 6, -4],
  CDM: [-6, -10, 4, -2, 10, 6],
  CM:  [0, 0, 8, 4, -2, -2],
  CAM: [2, 6, 8, 10, -18, -8],
  LM:  [10, 0, 4, 8, -12, -8],
  RM:  [10, 0, 4, 8, -12, -8],
  LW:  [14, 6, 0, 12, -22, -10],
  RW:  [14, 6, 0, 12, -22, -10],
  ST:  [8, 16, -8, 6, -26, 4],
};

function weightedOverall(position, stats) {
  const w = POSITIONS[position].weights;
  let total = 0;
  for (const k of STAT_KEYS) total += stats[k] * w[k];
  return Math.round(total);
}

function marketValue(overall, age) {
  // exponential-ish curve, discounted for age
  const base = Math.pow(1.135, overall - 58) * 90_000;
  const ageMod = age <= 23 ? 1.35 : age <= 27 ? 1.1 : age <= 30 ? 0.85 : 0.5;
  const raw = base * ageMod;
  return Math.round(raw / 50_000) * 50_000 || 50_000;
}

/**
 * Strong foot, about one player in five left-footed.
 *
 * Hashed off the id rather than drawn from `rand`, and that is the whole point:
 * pulling a number from the generator's stream here would have shifted every
 * name, stat and nation that came after it, and every saved collection points
 * at ids whose cards have to keep being the same cards.
 */
function footFor(id) {
  return ((id * 2654435761) % 100) < 22 ? 'L' : 'R';
}

let idCounter = 0;

function makePlayer(rand, position, baseLevel, clubId) {
  const profile = PROFILES[position];
  const stats = {};
  STAT_KEYS.forEach((key, i) => {
    stats[key] = clamp(rand.around(baseLevel + profile[i], 7), 24, 99);
  });

  // Nudge the key stats until the weighted overall lands near the target level.
  let overall = weightedOverall(position, stats);
  let guard = 0;
  while (Math.abs(overall - baseLevel) > 2 && guard++ < 24) {
    const delta = baseLevel - overall > 0 ? 1 : -1;
    const w = POSITIONS[position].weights;
    const key = STAT_KEYS.slice().sort((a, b) => w[b] - w[a])[guard % 3];
    stats[key] = clamp(stats[key] + delta * 2, 24, 99);
    overall = weightedOverall(position, stats);
  }
  overall = clamp(overall, 60, 99);

  const age = rand.int(17, 35);
  /* A placeholder identity. `nameTheWorld` overwrites the name, short name,
     nation and flag colours of every one of these cards with a real
     footballer's before the world is handed out — these pools only still exist
     so a card is never half-built if that pass ever fails to reach it. */
  const nation = rand.pick(NATIONS);
  const first = rand.pick(FIRST_NAMES);
  const last = rand.pick(LAST_NAMES);
  const id = ++idCounter;

  return {
    id: `p${id}`,
    name: `${first} ${last}`,
    short: `${first[0]}. ${last}`,
    position,
    overall,
    stats,
    rarity: rarityFor(overall),
    clubId,
    nation: nation.name,
    nationColors: nation.colors,
    age,
    foot: footFor(id),
    value: marketValue(overall, age),
    form: 0,
  };
}

/**
 * A hand-written card — an Icon or a Star.
 *
 * Rating is stated rather than derived: these exist to be a specific number,
 * and letting `weightedOverall` have an opinion would make a keeper's 92 mean
 * something different from a winger's. Rarity is stamped on for the same
 * reason `rarityFor` never returns these tiers.
 */
function namedCard(def, stats, overall, rarity, value, id) {
  return {
    id: `p${id}`,
    name: def.name,
    // spelled out on the blueprint: initialising "Neymar Jr" gives "N. Jr"
    short: def.short,
    position: def.position,
    overall,
    stats: { ...stats },
    rarity,
    clubId: null,
    nation: def.nation,
    nationColors: def.colors,
    age: 29,
    // named cards state their own foot; the rest fall back to the hash
    foot: def.foot || footFor(id),
    value,
    form: 0,
  };
}

/* ------------------------------------------------------------------ *
 * World
 * ------------------------------------------------------------------ */
function buildFixtures(clubIds, rand) {
  // Circle method double round-robin -> 18 matchdays for 10 clubs.
  const teams = clubIds.slice();
  const n = teams.length;
  const rounds = [];
  const rotating = teams.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    const order = [teams[0], ...rotating];
    for (let i = 0; i < n / 2; i++) {
      const home = order[i];
      const away = order[n - 1 - i];
      pairs.push(r % 2 === 0 ? { home, away } : { home: away, away: home });
    }
    rounds.push(pairs);
    rotating.unshift(rotating.pop());
  }

  // Second half of the season: same rounds with the venue flipped.
  const second = rounds.map((round) => round.map((m) => ({ home: m.away, away: m.home })));

  // Light shuffle of the two halves so the schedule doesn't feel mirrored.
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  return [...shuffle(rounds), ...shuffle(second)].map((matches, i) => ({
    matchday: i + 1,
    matches: matches.map((m) => ({ ...m, played: false, homeGoals: null, awayGoals: null })),
  }));
}

function buildWorld() {
  idCounter = 0;
  const rand = makeRand(WORLD_SEED);
  const clubs = [];
  const players = [];

  CLUB_BLUEPRINTS.forEach((bp, index) => {
    const clubId = `c${index + 1}`;
    // tier 1 club averages ~82, tier 10 averages ~68
    const clubLevel = 83 - (bp.tier - 1) * 1.7;
    const roster = [];

    ROSTER_SHAPE.forEach((pos, slot) => {
      // starters are stronger than the bench
      const depthPenalty = slot % 3 === 2 ? 6 : slot % 3 === 1 ? 2 : 0;
      const p = makePlayer(rand, pos, clubLevel - depthPenalty, clubId);
      players.push(p);
      roster.push(p.id);
    });

    // Every club gets one headline player so `special` cards exist in the wild.
    const starPos = rand.pick(['ST', 'CAM', 'LW', 'RW', 'CM']);
    const star = makePlayer(rand, starPos, clamp(clubLevel + 9, 60, 94), clubId);
    star.overall = clamp(star.overall + 3, 60, 99);
    star.rarity = rarityFor(star.overall);
    star.value = marketValue(star.overall, star.age);
    players.push(star);
    roster.push(star.id);

    clubs.push({
      id: clubId,
      name: bp.name,
      short: bp.short,
      tier: bp.tier,
      crest: { shape: bp.crest, colors: bp.colors, pattern: bp.pattern, device: bp.device },
      league: LEAGUE_NAME,
      founded: bp.founded,
      ground: bp.ground,
      roster,
      budget: Math.round((12 - bp.tier) * 6_500_000 + 8_000_000),
    });
  });

  // Free agents — the pool the transfer market and packs draw extra names from.
  const freeAgents = [];
  for (let i = 0; i < 34; i++) {
    const pos = rand.pick(Object.keys(POSITIONS));
    const p = makePlayer(rand, pos, rand.around(74, 11), null);
    players.push(p);
    freeAgents.push(p.id);
  }

  /* ---------------------------------------------------------------- *
   * Expansion pass
   *
   * Everything below is generated *after* the league above, and that
   * order matters: ids are handed out as players are made, so appending
   * leaves every id from the original world pointing at the same player
   * and a saved collection survives untouched. Adding these names inside
   * the loops above would have renumbered the lot.
   * ---------------------------------------------------------------- */
  CLUB_BLUEPRINTS.forEach((bp, index) => {
    const club = clubs[index];
    const clubLevel = 83 - (bp.tier - 1) * 1.7;
    DEPTH_SHAPE.forEach((pos, slot) => {
      // squad players, not reserves: a shade behind the first XI, no more
      const p = makePlayer(rand, pos, clubLevel - (slot % 3), club.id);
      players.push(p);
      club.roster.push(p.id);
    });
  });

  // A wider free pool, so packs keep finding names you do not already own.
  for (let i = 0; i < 60; i++) {
    const pos = rand.pick(Object.keys(POSITIONS));
    const p = makePlayer(rand, pos, rand.around(75, 10), null);
    players.push(p);
    freeAgents.push(p.id);
  }

  // Marquee free agents. Six players in the world reached the special tier,
  // which is thin when a Prime pack is sold on a 22% chance of one — and they
  // are unattached so pulling one never depends on a club you have not seen.
  const MARQUEE = ['ST', 'ST', 'LW', 'RW', 'CAM', 'CAM', 'CM', 'CDM', 'CB', 'CB', 'LB', 'GK'];
  MARQUEE.forEach((pos) => {
    const p = makePlayer(rand, pos, rand.int(88, 93), null);
    p.overall = clamp(p.overall + 2, 88, 99);
    p.rarity = rarityFor(p.overall);
    p.value = marketValue(p.overall, p.age);
    players.push(p);
    freeAgents.push(p.id);
  });

  /* --------------------------- Icons and Stars --------------------------- *
   * Twelve Icons at 99 and twenty Stars at 92, all unattached, one of each
   * position in both tiers so a whole XI can be built out of either.
   *
   * Emitted in two waves. Ids are handed out in creation order, and the first
   * eight Icons and twelve Stars already exist in people's collections — so
   * anything added later has to come after *both* original lists, not at the
   * end of its own. Appending four Icons in place would have shifted every
   * Star by four and quietly turned a saved Vinicius into a Rodri.
   * ---------------------------------------------------------------------- */
  const icons = [];
  const stars = [];
  const named = [
    ...ICONS.map((def) => ({ def, tier: 'icon' })),
    ...STARS.map((def) => ({ def, tier: 'star' })),
  ];
  for (const wave of [false, true]) {
    for (const { def, tier } of named) {
      if (!!def.added !== wave) continue;
      const p = tier === 'icon'
        ? namedCard(def, ICON_TRAITS[def.trait], 99, 'icon', 250_000_000, ++idCounter)
        : namedCard(def, STAR_TRAITS[def.trait], 92, 'star', 120_000_000, ++idCounter);
      players.push(p);
      freeAgents.push(p.id);
      (tier === 'icon' ? icons : stars).push(p.id);
    }
  }

  /* ------------------------- filling out the world ------------------------ *
   * Full-backs and wide midfielders were the thinnest positions in the game —
   * LM and RM had no `special` cards at all, so a Prime pack could not find
   * one, and a squad that wanted two full-backs and two wingers was competing
   * for a handful of cards. This pass is aimed squarely at that.             */
  const THIN = ['LB', 'RB', 'LM', 'RM', 'LB', 'RB', 'LM', 'RM', 'GK', 'CB'];
  CLUB_BLUEPRINTS.forEach((bp, index) => {
    const club = clubs[index];
    const clubLevel = 83 - (bp.tier - 1) * 1.7;
    THIN.forEach((pos, slot) => {
      const p = makePlayer(rand, pos, clubLevel - (slot % 4), club.id);
      players.push(p);
      club.roster.push(p.id);
    });
  });

  // and a free pool weighted the same way, with a guaranteed run of high-rated
  // cards in each thin position so every rarity is reachable everywhere
  for (let i = 0; i < 70; i++) {
    const p = makePlayer(rand, rand.pick(THIN), rand.around(76, 9), null);
    players.push(p);
    freeAgents.push(p.id);
  }
  for (const pos of ['LB', 'RB', 'LM', 'RM']) {
    for (let i = 0; i < 5; i++) {
      const p = makePlayer(rand, pos, rand.int(82, 90), null);
      p.rarity = rarityFor(p.overall);
      p.value = marketValue(p.overall, p.age);
      players.push(p);
      freeAgents.push(p.id);
    }
  }
  // a wider general pool on top, so packs keep turning up names you do not own
  for (let i = 0; i < 80; i++) {
    const p = makePlayer(rand, rand.pick(Object.keys(POSITIONS)), rand.around(74, 11), null);
    players.push(p);
    freeAgents.push(p.id);
  }

  nameTheWorld(players);

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const fixtures = buildFixtures(clubs.map((c) => c.id), rand);

  return {
    leagueName: LEAGUE_NAME,
    clubs,
    clubsById: Object.fromEntries(clubs.map((c) => [c.id, c])),
    players,
    playersById: byId,
    freeAgents,
    icons,
    stars,
    fixtures,
  };
}

/* ------------------------------------------------------------------ *
 * Real identities
 * ------------------------------------------------------------------ */
/**
 * Give every generated card a real footballer's name and country.
 *
 * The cards are built first and named second, and that order is the whole
 * point: rating, stats, position, club, age and value are decided by the
 * generator exactly as they always were, so no squad changed strength when the
 * names arrived. Only the identity on the front of the card is new. Icons and
 * Stars are skipped — they already name real players, and the twenty who
 * appeared in both lists were removed from `REAL_PLAYERS` so nobody is on two
 * cards at once.
 *
 * Matching is by position, best effort. Real keepers are kept strictly to
 * keeper cards, because an outfielder in goal is the one swap that looks like a
 * bug; everywhere else a card takes the closest position still unclaimed —
 * a right-back for a left-back, a winger for a wide midfielder — before falling
 * back to whoever is left. The world wants 158 wide midfielders and the list
 * has one, so some approximation is unavoidable; footballers play more than one
 * position anyway.
 *
 * Deterministic: both lists are walked in fixed order, so the same card gets
 * the same person on every load and a saved collection keeps pointing at the
 * people it was pointing at. Never re-sort `REAL_PLAYERS` — that would deal
 * every save a different set of names.
 */
const POS_FALLBACK = {
  GK: ['GK'],
  CB: ['CB', 'CDM', 'LB', 'RB'],
  LB: ['LB', 'RB', 'CB', 'LM', 'LW', 'CDM'],
  RB: ['RB', 'LB', 'CB', 'RM', 'RW', 'CDM'],
  CDM: ['CDM', 'CM', 'CB'],
  CM: ['CM', 'CDM', 'CAM'],
  CAM: ['CAM', 'CM', 'LW', 'RW', 'ST'],
  LM: ['LM', 'LW', 'CAM', 'CM', 'LB', 'RW'],
  RM: ['RM', 'RW', 'CAM', 'CM', 'RB', 'LW'],
  LW: ['LW', 'RW', 'LM', 'CAM', 'ST'],
  RW: ['RW', 'LW', 'RM', 'CAM', 'ST'],
  ST: ['ST', 'CAM', 'LW', 'RW', 'CM'],
};

function nameTheWorld(players) {
  const pool = new Map();          // position -> queue of unclaimed people
  for (const row of REAL_PLAYERS) {
    if (!pool.has(row[3])) pool.set(row[3], []);
    pool.get(row[3]).push(row);
  }
  const take = (pos) => {
    for (const p of POS_FALLBACK[pos] || [pos]) {
      const q = pool.get(p);
      if (q && q.length) return q.shift();
    }
    /* Nothing compatible left. Take from the longest queue, preferring
       outfielders — the list has more keepers than the world has keeper cards,
       so the last dozen outfield cards are named after real goalkeepers rather
       than left with an invented name. A keeper's name on a centre-back is a
       far smaller lie than an outfielder's name in goal, which is why the
       preference runs this way round and never the other. */
    let best = null;
    for (const [p, q] of pool) if (p !== 'GK' && q.length && (!best || q.length > best.length)) best = q;
    if (!best) best = pool.get('GK');
    return best && best.length ? best.shift() : null;
  };

  /* Keepers first, then the scarce positions, so the strict GK rule and the
     thin queues are served before the common ones drain the list. */
  const order = ['GK', 'CDM', 'CAM', 'LB', 'RB', 'CM', 'LW', 'RW', 'ST', 'CB', 'LM', 'RM'];
  const byPos = new Map(order.map((p) => [p, []]));
  for (const p of players) {
    if (p.rarity === 'icon' || p.rarity === 'star') continue;   // already real
    (byPos.get(p.position) || []).push(p);
  }
  for (const pos of order) {
    for (const p of byPos.get(pos)) {
      const row = take(pos);
      if (!row) continue;                                        // ran out: keep the generated name
      [p.name, p.short, p.nation] = row;
      p.nationColors = NATION_COLORS[row[2]] || p.nationColors;
    }
  }
  return players;
}

export const WORLD = buildWorld();

export const getPlayer = (id) => WORLD.playersById[id];
export const getClub = (id) => (id ? WORLD.clubsById[id] : null);
export const clubName = (id) => (id ? WORLD.clubsById[id].name : 'Free Agent');
export const rosterOf = (clubId) => WORLD.clubsById[clubId].roster.map(getPlayer);

/** Club strength on a 0-100 scale, used by the match engine. */
export function clubRating(clubId) {
  const squad = rosterOf(clubId).slice().sort((a, b) => b.overall - a.overall).slice(0, 11);
  return Math.round(squad.reduce((s, p) => s + p.overall, 0) / squad.length);
}
