import {
  FIRST_NAMES, LAST_NAMES, NATIONS, CLUB_BLUEPRINTS, LEAGUE_NAME, LEAGUES, POSITIONS, rarityFor,
  ICONS, ICON_TRAITS, STARS, STAR_TRAITS,
} from './pools.js';
import { REAL_PLAYERS, REAL_PLAYERS_EXTRA, REAL_PLAYERS_WAVE3, REAL_PLAYERS_WAVE4, REAL_PLAYERS_WAVE5, NATION_COLORS } from './realPlayers.js';

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

/* [name, short, nation, position, overall, age] — see the SBC block in buildWorld. */
const SBC_LEGENDS = [
  ['Thierry Henry', 'T. Henry', 'France', 'ST', 91, 27],
  ['Ronaldinho', 'Ronaldinho', 'Brazil', 'LW', 91, 26],
  ['Andrés Iniesta', 'A. Iniesta', 'Spain', 'CM', 90, 28],
  ['Andrea Pirlo', 'A. Pirlo', 'Italy', 'CDM', 89, 30],
  ['Steven Gerrard', 'S. Gerrard', 'England', 'CM', 89, 27],
  ['Sergio Agüero', 'S. Agüero', 'Argentina', 'ST', 89, 26],
  ['Didier Drogba', 'D. Drogba', 'Ivory Coast', 'ST', 89, 29],
  ['Iker Casillas', 'I. Casillas', 'Spain', 'GK', 89, 27],
  ['Wayne Rooney', 'W. Rooney', 'England', 'ST', 88, 25],
  ['Frank Lampard', 'F. Lampard', 'England', 'CAM', 88, 28],
  ['Philipp Lahm', 'P. Lahm', 'Germany', 'RB', 88, 28],
  ['Carles Puyol', 'C. Puyol', 'Spain', 'CB', 88, 29],
];

/* The original ten. Every generation loop below runs over these and only
 * these: the league clubs added in v68 draw no random numbers of their own
 * (their squads are dealt from the free pool at the end), which is what keeps
 * the whole original world — and both balance sweeps — byte-identical. */
const CORE = CLUB_BLUEPRINTS.filter((bp) => !bp.league);

function buildWorld() {
  idCounter = 0;
  const rand = makeRand(WORLD_SEED);
  const clubs = [];
  const players = [];

  CORE.forEach((bp, index) => {
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
      league: bp.league || LEAGUE_NAME,
      division: 1,
      founded: bp.founded,
      ground: bp.ground,
      roster,
      budget: Math.round((12 - bp.tier) * 6_500_000 + 8_000_000),
    });
  });

  CLUB_BLUEPRINTS.filter((bp) => bp.league).forEach((bp, i) => {
    clubs.push({
      id: `c${CORE.length + i + 1}`,
      name: bp.name,
      short: bp.short,
      tier: bp.tier,
      crest: { shape: bp.crest, colors: bp.colors, pattern: bp.pattern, device: bp.device },
      league: bp.league,
      division: bp.division || LEAGUES.indexOf(bp.league) + 1,
      founded: bp.founded,
      ground: bp.ground,
      roster: [],                       // dealt (Meridian) or generated (wave 3) at the end of buildWorld
      budget: Math.round((14 - bp.tier) * (bp.wave === 5 ? [0, 5_000_000, 3_500_000, 2_000_000, 1_500_000, 900_000, 700_000, 500_000, 400_000][bp.division] : bp.wave === 4 ? 900_000 : bp.wave === 3 ? 2_000_000 : 5_000_000) + (bp.wave === 4 || bp.wave === 5 ? 1_200_000 : bp.wave === 3 ? 2_500_000 : 6_000_000)),
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
  CORE.forEach((bp, index) => {
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
  CORE.forEach((bp, index) => {
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

  const fixtures = buildFixtures(clubs.slice(0, CORE.length).map((c) => c.id), rand);

  /* --------------------------- the second wave --------------------------- *
   * v66 grew the world by half again: every club gets a full extra shape of
   * squad players, and the free pool a wide new run so packs keep finding
   * names you do not own. Two things keep this from touching anything that
   * already exists. It runs after the fixtures, on its *own* seeded stream,
   * so every draw the original world made — and the fixture list — is
   * byte-identical to v65 (`node tools/sweep.mjs` proves it). And it is named
   * from its own list, REAL_PLAYERS_EXTRA, so the first list is still dealt to
   * the first cards exactly as before. Ids simply continue.                  */
  const wave = makeRand(WORLD_SEED ^ 0x2a3b4c5d);
  const wavePlayers = [];
  const WAVE_SHAPE = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST'];
  CORE.forEach((bp, index) => {
    const club = clubs[index];
    const clubLevel = 83 - (bp.tier - 1) * 1.7;
    WAVE_SHAPE.forEach((pos, slot) => {
      // squad depth: a shade behind the XI, never ahead of it
      const p = makePlayer(wave, pos, clubLevel - 3 - (slot % 3) * 1.5, club.id);
      players.push(p); wavePlayers.push(p);
      club.roster.push(p.id);
    });
  });
  const WAVE_POOL = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM', 'LW', 'LW', 'RW', 'RW', 'ST', 'ST', 'ST'];
  for (let i = 0; i < 200; i++) {
    const p = makePlayer(wave, wave.pick(WAVE_POOL), wave.around(75, 10), null);
    players.push(p); wavePlayers.push(p);
    freeAgents.push(p.id);
  }
  // and a guaranteed run of headline cards, one per position and then some,
  // so the new names are not all squad players
  for (const pos of [...Object.keys(POSITIONS), 'ST', 'CAM', 'LW', 'RW', 'CB', 'CM', 'GK']) {
    const p = makePlayer(wave, pos, wave.int(84, 91), null);
    p.rarity = rarityFor(p.overall);
    p.value = marketValue(p.overall, p.age);
    players.push(p); wavePlayers.push(p);
    freeAgents.push(p.id);
  }
  nameTheWorld(wavePlayers, REAL_PLAYERS_EXTRA);

  /* ------------------------- the Meridian League ------------------------- *
   * v68: the world grows from ten clubs to twenty. The ten new clubs are the
   * blueprints tagged with a league, and their squads are *dealt from the
   * players who were unattached* — no new cards, no new names, no new ids:
   * the only thing that changes about a dealt player is `clubId`. Saves that
   * hold those cards are untouched. Icons, Stars and the marquee free agents
   * (88+) stay unattached, because they are pack prizes, not squad players.
   *
   * The deal is a snake draft per position over the pool sorted by rating, so
   * tier one of the new league is the strongest and the depth is even. It is
   * deterministic and consumes no random numbers, which is how the original
   * fixture list above and both balance sweeps stay byte-identical.        */
  const newClubs = clubs.filter((c) => c.league === 'Meridian League' && !CLUB_BLUEPRINTS.find((bp) => bp.name === c.name)?.wave);
  if (newClubs.length) {
    const dealable = freeAgents.map((id) => players.find((p) => p.id === id))
      .filter((p) => p && p.rarity !== 'icon' && p.rarity !== 'star' && p.overall < 88 && !p.sbc);
    const WANT = ['GK', 'GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'LB', 'RB', 'RB', 'CDM', 'CDM',
      'CM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM', 'LW', 'LW', 'RW', 'RW', 'ST', 'ST', 'ST'];
    const byPos = new Map();
    for (const p of dealable) {
      if (!byPos.has(p.position)) byPos.set(p.position, []);
      byPos.get(p.position).push(p);
    }
    for (const q of byPos.values()) q.sort((a, b) => b.overall - a.overall || (a.id < b.id ? -1 : 1));
    const counts = new Map(WANT.map((pos) => [pos, 0]));
    for (const pos of WANT) counts.set(pos, counts.get(pos) + 1);
    const dealt = new Set();
    for (const [pos, n] of counts) {
      const q = byPos.get(pos) || [];
      // round r of this position goes down the table, then back up (snake)
      for (let r = 0; r < n; r++) {
        const order = r % 2 ? newClubs.slice().reverse() : newClubs;
        for (const club of order) {
          const p = q.shift();
          if (!p) break;
          p.clubId = club.id;
          club.roster.push(p.id);
          dealt.add(p.id);
        }
      }
    }
    for (let i = freeAgents.length - 1; i >= 0; i--) if (dealt.has(freeAgents[i])) freeAgents.splice(i, 1);
  }

  /* ---------------------------- SBC reward cards ---------------------------- *
   * Twelve legends, obtainable only by completing a Squad-Building Challenge.
   * `sbc: true` keeps them out of every pack. Appended last, on their own
   * seeded stream, so nothing above moves. */
  const sbcRand = makeRand(WORLD_SEED ^ 0x5bc5bc);
  const sbcCards = [];
  for (const [name, short, nation, pos, overall, age] of SBC_LEGENDS) {
    const p = makePlayer(sbcRand, pos, overall, null);
    p.name = name; p.short = short; p.nation = nation; p.age = age;
    p.nationColors = NATION_COLORS[nation] || p.nationColors;
    p.overall = overall;
    for (const k of Object.keys(p.stats)) p.stats[k] = clamp(Math.round(p.stats[k] + (overall - 80) * 0.6), 40, 99);
    p.rarity = 'special';
    p.sbc = true;
    p.value = marketValue(overall, age);
    players.push(p);
    sbcCards.push(p.id);
  }

  /* ----------------------- the third and fourth divisions ----------------------- *
   * v70: forty clubs. The twenty blueprints tagged `wave: 3` get whole new
   * squads — 27 cards each, the same shape the Meridian deal wanted — plus a
   * wider free pool, all on their own seeded stream and appended after the
   * SBC cards so every id above is untouched. Named from the third list of
   * real players. Ratings sit below the Meridian League: the third division
   * tops out in the mid 70s, the fourth in the high 60s, so promotion means
   * something and a fourth-division youngster is a project, not a signing. */
  const w3 = makeRand(WORLD_SEED ^ 0x3a7e70);
  const w3Players = [];
  const W3_SHAPE = ['GK', 'GK', 'GK', 'CB', 'CB', 'CB', 'CB', 'LB', 'LB', 'RB', 'RB', 'CDM', 'CDM',
    'CM', 'CM', 'CM', 'CAM', 'CAM', 'LM', 'RM', 'LW', 'LW', 'RW', 'RW', 'ST', 'ST', 'ST'];
  for (const club of clubs) {
    if (CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)?.wave !== 3) continue;
    const base = (club.division === 3 ? 76 : 70) - (club.tier - 1) * 1.2;
    W3_SHAPE.forEach((pos, slot) => {
      const depth = slot % 3 === 2 ? 5 : slot % 3 === 1 ? 2 : 0;
      const p = makePlayer(w3, pos, base - depth, club.id);
      players.push(p); w3Players.push(p);
      club.roster.push(p.id);
    });
    // one name worth knowing at every club, so the lower leagues have stars of their own
    const star = makePlayer(w3, w3.pick(['ST', 'CAM', 'LW', 'RW', 'CM']), clamp(base + 7, 60, 84), club.id);
    players.push(star); w3Players.push(star);
    club.roster.push(star.id);
  }
  const W3_POOL = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'ST'];
  for (let i = 0; i < 380; i++) {
    const p = makePlayer(w3, w3.pick(W3_POOL), w3.around(72, 10), null);
    players.push(p); w3Players.push(p);
    freeAgents.push(p.id);
  }
  nameTheWorld(w3Players, REAL_PLAYERS_WAVE3);

  /* ------------------------ the fifth and sixth divisions ------------------------ *
   * v71: sixty clubs. Same recipe as the third wave, its own stream, appended
   * after everything above, named from the fourth list. Ratings run 66 down
   * to the floor of 60, which is where a card stops being a footballer and
   * starts being a project. */
  const w4 = makeRand(WORLD_SEED ^ 0x4b4b71);
  const w4Players = [];
  for (const club of clubs) {
    if (CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)?.wave !== 4) continue;
    const base = (club.division === 5 ? 68 : 65) - (club.tier - 1) * 0.7;
    W3_SHAPE.forEach((pos, slot) => {
      const depth = slot % 3 === 2 ? 4 : slot % 3 === 1 ? 2 : 0;
      const p = makePlayer(w4, pos, base - depth, club.id);
      players.push(p); w4Players.push(p);
      club.roster.push(p.id);
    });
    const star = makePlayer(w4, w4.pick(['ST', 'CAM', 'LW', 'RW', 'CM']), clamp(base + 6, 60, 78), club.id);
    players.push(star); w4Players.push(star);
    club.roster.push(star.id);
  }
  for (let i = 0; i < 480; i++) {
    const p = makePlayer(w4, w4.pick(W3_POOL), w4.around(70, 9), null);
    players.push(p); w4Players.push(p);
    freeAgents.push(p.id);
  }
  nameTheWorld(w4Players, REAL_PLAYERS_WAVE4);

  /* --------------------------- the hundred-club world --------------------------- *
   * v72: forty more clubs, two joining each of the first six divisions and
   * thirteen each in the seventh and eighth. Rated for the division they
   * join — a new top-flight club is an 82, a Lowland one a 60 — on their own
   * stream, appended after everything, named from the fifth wave. A wider
   * free pool as well: 1,400 more names in packs. */
  const w5 = makeRand(WORLD_SEED ^ 0x5a5a72);
  const w5Players = [];
  const DIV_BASE = [0, 82, 79, 75, 71, 68, 65, 63, 61];
  for (const club of clubs) {
    if (CLUB_BLUEPRINTS.find((bp) => bp.name === club.name)?.wave !== 5) continue;
    const base = DIV_BASE[club.division] - (club.tier - 1) * 0.35;
    W3_SHAPE.forEach((pos, slot) => {
      const depth = slot % 3 === 2 ? 4 : slot % 3 === 1 ? 2 : 0;
      const p = makePlayer(w5, pos, base - depth, club.id);
      players.push(p); w5Players.push(p);
      club.roster.push(p.id);
    });
    const star = makePlayer(w5, w5.pick(['ST', 'CAM', 'LW', 'RW', 'CM']), clamp(base + 6, 60, 88), club.id);
    players.push(star); w5Players.push(star);
    club.roster.push(star.id);
  }
  for (let i = 0; i < 1400; i++) {
    const p = makePlayer(w5, w5.pick(W3_POOL), w5.around(71, 10), null);
    players.push(p); w5Players.push(p);
    freeAgents.push(p.id);
  }
  nameTheWorld(w5Players, REAL_PLAYERS_WAVE5);

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));

  return {
    leagueName: LEAGUE_NAME,
    clubs,
    clubsById: Object.fromEntries(clubs.map((c) => [c.id, c])),
    players,
    playersById: byId,
    freeAgents,
    icons,
    stars,
    sbcCards,
    leagues: LEAGUES,
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

function nameTheWorld(players, list = REAL_PLAYERS) {
  const pool = new Map();          // position -> queue of unclaimed people
  for (const row of list) {
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
