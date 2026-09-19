/**
 * Squad-Building Challenges.
 *
 * Submit eleven cards that meet a set of conditions and they are gone —
 * consumed — in exchange for a reward. This is what turns a duplicate from
 * "ten thousand Apex" into a resource, and it is the reason to keep a bronze
 * you would otherwise have sold.
 *
 * A challenge is deliberately about the *set*, not about positions: there is no
 * formation here and no chemistry links to line up, because asking someone to
 * solve a formation puzzle with a partial collection is how these stop being
 * fun. Rating, nations, clubs and rarities are things you can look at a card
 * and check.
 *
 * `repeatable` challenges can be completed as often as you can afford them and
 * are the standing sink; the rest are once each.
 */

/**
 * Every requirement is a function of the eleven submitted cards plus their
 * chemistry, so a new one needs no new plumbing — just a row here.
 *
 * @typedef {object} Requirement
 * @property {string} text  what the player is told
 * @property {(cards: object[], chem: object) => number} got  where they are now
 * @property {number} need  what it has to reach
 */

import { getClub } from './generator.js';

const avg = (cards) => (cards.length
  ? Math.round(cards.reduce((s, p) => s + p.overall, 0) / cards.length)
  : 0);

const countRarity = (cards, r) => cards.filter((p) => p.rarity === r).length;
const distinct = (cards, key) => new Set(cards.map((p) => p[key]).filter(Boolean)).size;
const maxSameNation = (cards) => {
  const by = {};
  for (const p of cards) by[p.nation] = (by[p.nation] || 0) + 1;
  return Math.max(0, ...Object.values(by));
};

/** Shorthand builders, so a challenge reads as its own description. */
const R = {
  size: (n) => ({ text: `${n} players`, got: (c) => c.length, need: n }),
  rating: (n) => ({ text: `Squad rating ${n}+`, got: (c) => avg(c), need: n }),
  chem: (n) => ({ text: `Team chemistry ${n}+`, got: (c, chem) => chem.team, need: n }),
  rarity: (r, n, label) => ({
    text: `${n}× ${label}`, got: (c) => countRarity(c, r), need: n,
  }),
  minRated: (rating, n) => ({
    text: `${n}× rated ${rating}+`,
    got: (c) => c.filter((p) => p.overall >= rating).length,
    need: n,
  }),
  nations: (n) => ({ text: `${n} different nations`, got: (c) => distinct(c, 'nation'), need: n }),
  sameNation: (n) => ({ text: `${n} from one nation`, got: (c) => maxSameNation(c), need: n }),
  clubs: (n) => ({ text: `${n} different clubs`, got: (c) => distinct(c, 'clubId'), need: n }),
  nation: (nation, n) => ({ text: `${n}× ${nation}`, got: (c) => c.filter((p) => p.nation === nation).length, need: n }),
  league: (league, n) => ({
    text: `${n}× ${league}`,
    got: (c) => c.filter((p) => p.clubId && getClub(p.clubId)?.league === league).length,
    need: n,
  }),
  maxAge: (age, n) => ({ text: `${n}× aged ${age} or under`, got: (c) => c.filter((p) => p.age <= age).length, need: n }),
  minAge: (age, n) => ({ text: `${n}× aged ${age}+`, got: (c) => c.filter((p) => p.age >= age).length, need: n }),
  positions: (group, n, label) => ({
    text: `${n}× ${label}`, got: (c) => c.filter((p) => group.includes(p.position)).length, need: n,
  }),
};

export const CHALLENGES = [
  {
    id: 'starter',
    name: 'Clearing the Locker',
    brief: 'Eleven bodies, any eleven. The cheapest way to turn a pile of bronzes into something.',
    reqs: [R.size(11)],
    reward: { apex: 900, pack: 'silver' },
    repeatable: true,
  },
  {
    id: 'bronzes',
    name: 'Bronze Age',
    brief: 'The cards nobody wants, in bulk.',
    reqs: [R.size(11), R.rarity('bronze', 7, 'Bronze')],
    reward: { apex: 2200, pack: 'gold' },
    repeatable: true,
  },
  {
    id: 'league',
    name: 'Around the League',
    brief: 'One from everywhere. Free agents do not count towards a club.',
    reqs: [R.size(11), R.clubs(7)],
    reward: { apex: 4000, pack: 'gold' },
  },
  {
    id: 'passport',
    name: 'Passport Control',
    brief: 'A squad drawn from across the world.',
    reqs: [R.size(11), R.nations(8), R.rating(75)],
    reward: { apex: 6500, pack: 'prime' },
  },
  {
    id: 'compatriots',
    name: 'Countrymen',
    brief: 'A spine from one nation, which is also how chemistry is won.',
    reqs: [R.size(11), R.sameNation(5), R.chem(55)],
    reward: { apex: 7500, pack: 'prime' },
  },
  {
    id: 'gilded',
    name: 'Gilded',
    brief: 'Golds only, and a squad rating to match.',
    reqs: [R.size(11), R.rarity('gold', 9, 'Gold'), R.rating(80)],
    reward: { apex: 12000, pack: 'prime' },
  },
  {
    id: 'contenders',
    name: 'Contenders',
    brief: 'The kind of eleven that wins a division.',
    reqs: [R.size(11), R.rating(84), R.minRated(85, 5), R.chem(60)],
    reward: { apex: 20000, pack: 'stars' },
  },
  /* ---- v68: the legend challenges. Each pays a unique SBC card — a player
   * who exists nowhere else in the game — on top of the coins. `card` is a
   * name, resolved against WORLD.sbcCards at claim time. ---- */
  {
    id: 'saudi-xi',
    name: 'Saudi XI',
    brief: 'Seven Green Falcons in one squad. The Falcons Pack is the fast way in.',
    reqs: [R.size(11), R.nation('Saudi Arabia', 7), R.rating(74)],
    reward: { apex: 5000, pack: 'gold', card: 'Didier Drogba' },
  },
  {
    id: 'bronze-silver',
    name: 'Bronze to Silver',
    brief: 'Eleven bronzes in, a silver pack and a legend out. The cheapest legend in the game.',
    reqs: [R.size(11), R.rarity('bronze', 11, 'Bronze')],
    reward: { apex: 1500, pack: 'silver', card: 'Carles Puyol' },
  },
  {
    id: 'league-mix',
    name: 'League Mix',
    brief: 'Four from each league, and chemistry that survives it.',
    reqs: [R.size(11), R.league('Apex Premier Division', 4), R.league('Meridian League', 4), R.chem(45)],
    reward: { apex: 6000, pack: 'gold', card: 'Philipp Lahm' },
  },
  {
    id: 'meridian-xi',
    name: 'Meridian XI',
    brief: 'The new league, eight deep.',
    reqs: [R.size(11), R.league('Meridian League', 8), R.rating(76)],
    reward: { apex: 7000, pack: 'prime', card: 'Frank Lampard' },
  },
  {
    id: 'wonderkids',
    name: 'Wonderkids',
    brief: 'Youth, in bulk. Eight players aged 22 or under.',
    reqs: [R.size(11), R.maxAge(22, 8), R.rating(72)],
    reward: { apex: 6500, pack: 'gold', card: 'Wayne Rooney' },
  },
  {
    id: 'old-guard',
    name: 'Old Guard',
    brief: 'Experience. Eight players aged 30 or over, and a proper rating.',
    reqs: [R.size(11), R.minAge(30, 8), R.rating(78)],
    reward: { apex: 8000, pack: 'prime', card: 'Andrea Pirlo' },
  },
  {
    id: 'back-line',
    name: 'The Wall',
    brief: 'Six defenders and two keepers, all gold or better.',
    reqs: [R.size(11), R.positions(['CB', 'LB', 'RB'], 6, 'defenders'), R.positions(['GK'], 2, 'goalkeepers'), R.rarity('gold', 8, 'Gold')],
    reward: { apex: 9000, pack: 'prime', card: 'Iker Casillas' },
  },
  {
    id: 'front-line',
    name: 'Strike Force',
    brief: 'Six attackers rated 82 or better.',
    reqs: [R.size(11), R.positions(['ST', 'LW', 'RW', 'CAM'], 6, 'attackers'), R.minRated(82, 6)],
    reward: { apex: 9500, pack: 'prime', card: 'Sergio Agüero' },
  },
  {
    id: 'engine-room',
    name: 'Engine Room',
    brief: 'Five midfielders from one club — a real engine room.',
    reqs: [R.size(11), R.positions(['CDM', 'CM', 'CAM', 'LM', 'RM'], 5, 'midfielders'), R.chem(60), R.rating(80)],
    reward: { apex: 10000, pack: 'prime', card: 'Steven Gerrard' },
  },
  {
    id: 'world-tour',
    name: 'World Tour',
    brief: 'Eleven nations, eleven players, nobody sharing a flag.',
    reqs: [R.size(11), R.nations(11), R.rating(78)],
    reward: { apex: 11000, pack: 'prime', card: 'Thierry Henry' },
  },
  {
    id: 'samba',
    name: 'Samba',
    brief: 'Six Brazilians and a chemistry to match.',
    reqs: [R.size(11), R.nation('Brazil', 6), R.chem(55), R.rating(80)],
    reward: { apex: 12000, pack: 'prime', card: 'Ronaldinho' },
  },
  {
    id: 'tiki-taka',
    name: 'Tiki-Taka',
    brief: 'Six Spaniards, and the whole eleven rated 82+.',
    reqs: [R.size(11), R.nation('Spain', 6), R.minRated(82, 11)],
    reward: { apex: 15000, pack: 'limited', card: 'Andrés Iniesta' },
  },
  {
    id: 'immortals',
    name: 'Immortals',
    brief: 'The hardest thing in the game, and the only challenge that pays Ultimate.',
    reqs: [R.size(11), R.rating(88), R.minRated(90, 6), R.chem(70)],
    reward: { apex: 30000, ultimate: 8, pack: 'limited' },
  },
];

export const challengeById = (id) => CHALLENGES.find((c) => c.id === id) || null;

/**
 * How a submission measures up.
 * @returns {{rows: {text: string, got: number, need: number, ok: boolean}[], ok: boolean}}
 */
export function evaluate(challenge, cards, chem) {
  const rows = challenge.reqs.map((r) => {
    const got = r.got(cards, chem);
    return { text: r.text, got, need: r.need, ok: got >= r.need };
  });
  return { rows, ok: rows.every((r) => r.ok) };
}
