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
  sameClub: (n) => ({ text: `${n} from one club`, got: (c) => { const by = {}; for (const p of c) if (p.clubId) by[p.clubId] = (by[p.clubId] || 0) + 1; return Math.max(0, ...Object.values(by)); }, need: n }),
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
  /* ---- v73: the easy ones. Three to seven cards, one condition, paid at
   * once — the SBCs a new save can finish on its first day, and the standing
   * sink for the bronzes and silvers every pack drops. All repeatable. ---- */
  { id: 'first-steps', group: 'starter', name: 'First Steps', brief: 'Any three cards. The smallest SBC there is.', reqs: [R.size(3)], reward: { apex: 300, pack: 'bronze' }, repeatable: true },
  { id: 'bronze-trio', group: 'starter', name: 'Bronze Trio', brief: 'Three bronzes for a bronze pack and change.', reqs: [R.size(3), R.rarity('bronze', 3, 'Bronze')], reward: { apex: 400, pack: 'bronze' }, repeatable: true },
  { id: 'five-a-side', group: 'starter', name: 'Five-a-side', brief: 'Five cards, any five.', reqs: [R.size(5)], reward: { apex: 700, pack: 'silver' }, repeatable: true },
  { id: 'two-keepers', group: 'starter', name: 'Safe Hands', brief: 'Two goalkeepers. Everyone has a spare.', reqs: [R.size(2), R.positions(['GK'], 2, 'goalkeepers')], reward: { apex: 600, pack: 'silver' }, repeatable: true },
  { id: 'silver-lining', group: 'starter', name: 'Silver Lining', brief: 'Four silvers in, a silver pack and coins out.', reqs: [R.size(4), R.rarity('silver', 4, 'Silver')], reward: { apex: 1200, pack: 'silver' }, repeatable: true },
  { id: 'two-nations', group: 'starter', name: 'Compatriots', brief: 'Five cards, two of them sharing a flag.', reqs: [R.size(5), R.sameNation(2)], reward: { apex: 900, pack: 'silver' }, repeatable: true },
  { id: 'young-blood', group: 'starter', name: 'Young Blood', brief: 'Four players aged 23 or under.', reqs: [R.size(4), R.maxAge(23, 4)], reward: { apex: 1000, pack: 'silver' }, repeatable: true },
  { id: 'club-pair', group: 'starter', name: 'Club Mates', brief: 'Six cards with three from one club.', reqs: [R.size(6), R.sameClub(3)], reward: { apex: 1300, pack: 'silver' }, repeatable: true },
  { id: 'first-gold', group: 'starter', name: 'First Gold', brief: 'Five cards, one of them gold. Pays a gold pack back.', reqs: [R.size(5), R.rarity('gold', 1, 'Gold')], reward: { apex: 1500, pack: 'gold' } },
  { id: 'seven-up', group: 'starter', name: 'Seven Up', brief: 'Seven cards rated 65 or better.', reqs: [R.size(7), R.minRated(65, 7)], reward: { apex: 1600, pack: 'gold' }, repeatable: true },
  { id: 'defenders-three', group: 'starter', name: 'Back Three', brief: 'Three defenders, silver or better.', reqs: [R.size(3), R.positions(['CB', 'LB', 'RB'], 3, 'defenders'), R.rarity('silver', 3, 'Silver')], reward: { apex: 800, pack: 'silver' }, repeatable: true },
  { id: 'front-two', group: 'starter', name: 'Front Two', brief: 'Two strikers rated 70+.', reqs: [R.size(2), R.positions(['ST'], 2, 'strikers'), R.minRated(70, 2)], reward: { apex: 900, pack: 'silver' }, repeatable: true },
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
  /* ---- v73: sixteen more legends, on the sixth wave (generator.js). ---- */
  { id: 'les-bleus', name: 'Les Bleus', brief: 'Five Frenchmen and a proper spine.', reqs: [R.size(11), R.nation('France', 5), R.rating(78)], reward: { apex: 9000, pack: 'prime', card: 'Lilian Thuram' } },
  { id: 'azzurri', name: 'Azzurri', brief: 'Five Italians, the back line included.', reqs: [R.size(11), R.nation('Italy', 5), R.positions(['CB', 'LB', 'RB', 'GK'], 5, 'defenders or keepers')], reward: { apex: 8500, pack: 'prime', card: 'Fabio Cannavaro' } },
  { id: 'die-mannschaft', name: 'Die Mannschaft', brief: 'Five Germans and chemistry to match.', reqs: [R.size(11), R.nation('Germany', 5), R.chem(50)], reward: { apex: 8500, pack: 'prime', card: 'Michael Ballack' } },
  { id: 'oranje', name: 'Oranje', brief: 'Four from the Netherlands, rated 80 or better.', reqs: [R.size(11), R.nation('Netherlands', 4), R.minRated(80, 4)], reward: { apex: 8000, pack: 'prime', card: 'Ruud van Nistelrooy' } },
  { id: 'canarinha', name: 'Canarinha', brief: 'Brazil, eight deep.', reqs: [R.size(11), R.nation('Brazil', 8), R.rating(79)], reward: { apex: 12000, pack: 'prime', card: 'Ronaldo Nazário' } },
  { id: 'la-roja', name: 'La Roja', brief: 'Five Spaniards in a midfield that keeps the ball.', reqs: [R.size(11), R.nation('Spain', 5), R.positions(['CDM', 'CM', 'CAM'], 4, 'midfielders'), R.chem(55)], reward: { apex: 10000, pack: 'prime', card: 'Xavi' } },
  { id: 'full-backs', name: 'Up and Down', brief: 'Four full-backs rated 80 or better.', reqs: [R.size(11), R.positions(['LB', 'RB'], 4, 'full-backs'), R.minRated(80, 4)], reward: { apex: 9000, pack: 'prime', card: 'Javier Zanetti' } },
  { id: 'free-kicks', name: 'Dead Ball', brief: 'Six players with 84+ passing.', reqs: [R.size(11), { text: '6× passing 84+', got: (c) => c.filter((p) => p.stats.passing >= 84).length, need: 6 }], reward: { apex: 9500, pack: 'prime', card: 'Francesco Totti' } },
  { id: 'clean-sheet', name: 'Clean Sheet', brief: 'Three keepers and a whole gold defence.', reqs: [R.size(11), R.positions(['GK'], 3, 'goalkeepers'), R.positions(['CB', 'LB', 'RB'], 5, 'defenders'), R.rarity('gold', 8, 'Gold')], reward: { apex: 10000, pack: 'prime', card: 'Edwin van der Sar' } },
  { id: 'centre-halves', name: 'Centre Halves', brief: 'Five centre-backs rated 82 or better.', reqs: [R.size(11), R.positions(['CB'], 5, 'centre-backs'), R.minRated(82, 5)], reward: { apex: 10000, pack: 'prime', card: 'Alessandro Nesta' } },
  { id: 'holding', name: 'The Anchor', brief: 'Four holding midfielders and a squad rating of 81.', reqs: [R.size(11), R.positions(['CDM'], 4, 'holding midfielders'), R.rating(81)], reward: { apex: 10500, pack: 'prime', card: 'Patrick Vieira' } },
  { id: 'africa-xi', name: 'Africa XI', brief: 'Six players from African nations.', reqs: [R.size(11), { text: '6× from Africa', got: (c) => c.filter((p) => ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Cameroon', 'Morocco', 'Algeria', 'Tunisia', 'Egypt', 'Mali', 'DR Congo', 'South Africa', 'Guinea', 'Gabon', 'Burkina Faso', 'Zambia', 'Cape Verde', 'Angola', 'Togo', 'Libya', 'Mozambique', 'Tanzania', 'Gambia', 'Guinea-Bissau', 'Central African Republic'].includes(p.nation)).length, need: 6 }, R.rating(76)], reward: { apex: 9000, pack: 'prime', card: 'Samuel Eto\'o' } },
  { id: 'playmakers', name: 'Playmakers', brief: 'Five attacking midfielders, all gold or better.', reqs: [R.size(11), R.positions(['CAM'], 5, 'attacking midfielders'), R.rarity('gold', 5, 'Gold')], reward: { apex: 10000, pack: 'prime', card: 'Kaká' } },
  { id: 'samba-two', name: 'Joga Bonito', brief: 'Four Brazilian attackers with 85+ dribbling.', reqs: [R.size(11), R.nation('Brazil', 4), { text: '4× dribbling 85+', got: (c) => c.filter((p) => p.stats.dribbling >= 85).length, need: 4 }], reward: { apex: 11000, pack: 'prime', card: 'Rivaldo' } },
  { id: 'el-nino', name: 'Poachers', brief: 'Four strikers rated 84 or better, and eleven golds.', reqs: [R.size(11), R.positions(['ST'], 4, 'strikers'), R.minRated(84, 4), R.rarity('gold', 11, 'Gold')], reward: { apex: 12000, pack: 'limited', card: 'Fernando Torres' } },
  { id: 'guaje', name: 'Second Striker', brief: 'Six Spanish attackers.', reqs: [R.size(11), R.nation('Spain', 6), R.positions(['ST', 'LW', 'RW', 'CAM'], 6, 'attackers')], reward: { apex: 11000, pack: 'prime', card: 'David Villa' } },
  {
    id: 'immortals',
    name: 'Immortals',
    brief: 'The hardest thing in the game, and the only challenge that pays Ultimate.',
    reqs: [R.size(11), R.rating(88), R.minRated(90, 6), R.chem(70)],
    reward: { apex: 30000, ultimate: 8, pack: 'limited' },
  },
];

export const challengeById = (id) => CHALLENGES.find((c) => c.id === id) || null;
/** How many cards a challenge takes — its size requirement, or eleven. */
export const sizeOf = (c) => c.reqs.find((r) => /^\d+ players$/.test(r.text))?.need || 11;
export const GROUPS = [
  ['starter', 'Quick SBCs', 'Two to seven cards, one condition, done in a minute. Repeat them as often as the packs keep dropping bronzes.'],
  ['standard', 'Squad SBCs', 'Eleven cards that meet the brief. The classic sink for duplicates.'],
  ['legend', 'Legend SBCs', 'Eleven cards, a legend back: a player who exists nowhere else in the game.'],
];
export const groupOf = (c) => c.group || (c.reward.card ? 'legend' : 'standard');

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
