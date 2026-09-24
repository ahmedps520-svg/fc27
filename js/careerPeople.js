/**
 * Career people (v81): who a footballer is inside a career save.
 *
 * Shared by the Manager Career (career.js, careerV2.js, careerV3.js) and the
 * Player Career (proCareer.js), and imported by all of them — it imports none
 * of them, so there is no cycle.
 *
 *  - A name resolves to the world's card through a Map (the old
 *    `WORLD.players.find` per lookup cost 13,000 comparisons a call, and a
 *    twenty-season save makes a lot of calls).
 *  - People the world never had — academy regens, your own pro — live in
 *    `car.people[name]` with the season they were born into the save.
 *  - Age moves with the seasons; rating is the base plus the season-by-season
 *    development in `car.dev`; potential is dynamic (`car.pot`), set lazily
 *    and moved by form and minutes at every season end.
 */
import { WORLD } from './data/generator.js';
import { CAREER_RATINGS } from './data/careerDb.js';

let IDX = null;
/** The world's card for a name, first one wins. */
export function cardByName(name) {
  if (!IDX) { IDX = new Map(); for (const p of WORLD.players) if (!IDX.has(p.name)) IDX.set(p.name, p); }
  return IDX.get(name) || null;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function hashOf(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

/** Age this season. World players are their card's age in season one. */
export function ageOf(car, name) {
  const pp = car?.people?.[name];
  if (pp) return pp.age0 + ((car.season || 1) - pp.born);
  return (cardByName(name)?.age ?? 27) + ((car?.season || 1) - 1);
}

/** The printed-plus-development rating. */
export function rateOf(car, name) {
  const pp = car?.people?.[name];
  const base = car?.devBoost?.[name] ?? pp?.base ?? CAREER_RATINGS[name] ?? cardByName(name)?.overall ?? 72;
  return clamp(base + ((car?.dev?.[name]) | 0), 40, 99);
}

/** Potential, set the first time anyone asks and then moved by play. */
export function potOf(car, name) {
  if (!car) return 80;
  car.pot = car.pot || {};
  if (car.pot[name] == null) {
    const r = rateOf(car, name); const age = ageOf(car, name);
    const noise = hashOf(`pot|${name}`) % 7;
    car.pot[name] = clamp(age <= 23 ? r + Math.round((24 - age) * 1.6) + noise : r + (age <= 27 ? 1 + (noise % 3) : 0), r, 95);
  }
  return Math.max(car.pot[name], rateOf(car, name));
}

/** Market value from rating and age — the same curve career.js uses. */
export function valueOfRating(overall, age) {
  const base = Math.max(1, overall - 58) ** 3 * 950;
  const ageMod = age <= 23 ? 1.35 : age <= 27 ? 1.15 : age <= 30 ? 1 : age <= 33 ? 0.62 : 0.34;
  return Math.round(base * ageMod / 1000) * 1000;
}
export function valueIn(car, name) {
  const card = cardByName(name);
  const r = rateOf(car, name);
  /* v99: one money scale in the career. A world card's `value` is the Ultimate
     XI coin price (generator.js marketValue — an 83 is ~2m), not a career
     fee (valueOfRating — an 83 is ~15m); pricing world players off it made
     every club built of them roughly seven times cheaper, in fees and wages,
     than a club of generated players of the same rating (tools/career-audit.mjs). */
  void card;
  return valueOfRating(r, ageOf(car, name));
}

/* ------------------------------ generated people ------------------------------ */
const REGION_NAMES = {
  arab: [['Faisal', 'Salem', 'Nawaf', 'Abdulrahman', 'Turki', 'Hamad', 'Yazeed', 'Rakan', 'Majed', 'Ziyad', 'Omar', 'Khalid'], ['Al-Harbi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Shammari', 'Al-Ghamdi', 'Al-Zahrani', 'Al-Mutairi', 'Al-Dosari', 'Al-Anazi', 'Al-Shehri']],
  iberian: [['Hugo', 'Mateo', 'Íker', 'Rodrigo', 'Tiago', 'Martín', 'Álvaro', 'Nuno', 'Diego', 'Pablo', 'Gonçalo', 'Adrián'], ['Serrano', 'Ortega', 'Pires', 'Valverde', 'Castaño', 'Moreira', 'Navarro', 'Figueira', 'Ibarra', 'Quintana']],
  latin: [['Thiago', 'Lautaro', 'Matías', 'Gabriel', 'Enzo', 'Kauã', 'Bruno', 'Facundo', 'Joaquín', 'Davi'], ['Salvatierra', 'Rocha', 'Benítez', 'Almeida', 'Cardozo', 'Pereyra', 'Monteiro', 'Acuña', 'Barbosa', 'Villalba']],
  english: [['Jack', 'Harry', 'Oliver', 'Callum', 'Reece', 'Tyler', 'Lewis', 'Mason', 'Owen', 'Kieran', 'Ethan'], ['Ashworth', 'Pennock', 'Hartley', 'Brierley', 'Colby', 'Whitfield', 'Oakes', 'Rowntree', 'Tanner', 'Fenwick']],
  french: [['Théo', 'Lucas', 'Enzo', 'Kylian', 'Mathis', 'Noah', 'Rayan', 'Axel', 'Nolan', 'Yanis'], ['Morel', 'Dubreuil', 'Lacaze', 'Fournier', 'Perrin', 'Cissé', 'Marchand', 'Leblanc', 'Tessier', 'Diallo']],
  german: [['Lukas', 'Jonas', 'Finn', 'Leon', 'Niklas', 'Moritz', 'Paul', 'Felix', 'Jannik', 'Tim'], ['Brandt', 'Kessler', 'Vogt', 'Hartmann', 'Reuter', 'Lindner', 'Wagner', 'Seidel', 'Kraus', 'Haber']],
  italian: [['Luca', 'Matteo', 'Lorenzo', 'Riccardo', 'Tommaso', 'Gianluca', 'Davide', 'Federico', 'Samuele', 'Nicolò'], ['Ferrante', 'Bellotti', 'Caruso', 'Gallo', 'Marchetti', 'Pellegrini', 'Santoro', 'Vitale', 'Colombo', 'Rinaldi']],
};
const REGION_OF = {
  'Saudi Arabia': 'arab', Qatar: 'arab', 'United Arab Emirates': 'arab', Egypt: 'arab', Morocco: 'arab', Algeria: 'arab', Tunisia: 'arab', Iraq: 'arab',
  Spain: 'iberian', Portugal: 'iberian', Brazil: 'latin', Argentina: 'latin', Uruguay: 'latin', Colombia: 'latin', Mexico: 'latin',
  England: 'english', USA: 'english', Scotland: 'english', Wales: 'english', France: 'french', Belgium: 'french', Senegal: 'french',
  Germany: 'german', Austria: 'german', Netherlands: 'german', Italy: 'italian',
};
const COUNTRY_NATION = { 'Premier League': 'England', 'La Liga': 'Spain', 'Serie A': 'Italy', Bundesliga: 'Germany', 'Ligue 1': 'France', 'Saudi Pro League': 'Saudi Arabia' };
export const nationForLeague = (league) => COUNTRY_NATION[String(league || '').replace(/ 2$/, '')] || 'England';

/** A name nobody in the save has, from the right part of the world. */
export function newName(car, nation, rnd = Math.random) {
  const [firsts, lasts] = REGION_NAMES[REGION_OF[nation] || 'english'];
  for (let k = 0; k < 40; k++) {
    const n = `${firsts[Math.floor(rnd() * firsts.length)]} ${lasts[Math.floor(rnd() * lasts.length)]}`;
    if (!car.people?.[n] && !cardByName(n) && !taken(car, n)) return n;
  }
  return `${firsts[0]} ${lasts[0]} ${Object.keys(car.people || {}).length + 2}`;
}
function taken(car, name) {
  for (const rows of Object.values(car.squads || {})) for (const r of rows) if (r[0] === name) return true;
  return false;
}

/** Register a generated player (a regen, an academy graduate, your pro). */
export function addPerson(car, name, { age, base, pos, nation, pot, pro = false }) {
  car.people = car.people || {};
  car.people[name] = { age0: age, born: car.season || 1, base, pos, nation, regen: !pro, pro };
  car.pot = car.pot || {};
  car.pot[name] = pot ?? clamp(base + Math.round((24 - age) * 1.8) + (hashOf(name) % 8), base, 94);
  return car.people[name];
}
