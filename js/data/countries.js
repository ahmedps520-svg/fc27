/**
 * Kick Off by country.
 *
 * Fifty-five countries, strongest first (Spain) to weakest (India), each with
 * its real clubs, plus "International" — the national teams. A club's squad
 * is real footballers of that country: the six countries Manager Career
 * curates (England, Spain, Italy, Germany, France, Saudi Arabia) reuse those
 * curated squads for the clubs they share; every other club is dealt the
 * best available players of its nationality from the world pool, so the
 * names are real and the nationality is right even where the club is an
 * approximation of who plays there this season. Badges are the game's own
 * crest generator in each club's colours — real names, real colours,
 * original artwork.
 */
import { WORLD } from './generator.js';
import { CAREER_CLUBS } from './careerDb.js';
import { squadOf } from '../career.js';
import { nations, nationSquad } from '../world.js';

const C = (name, short, a, b, shape = 'shield') => ({ name, short, colors: [a, b], shape });

/** Strongest first. */
export const COUNTRIES = [
  ['Spain', [C('Real Madrid', 'RMA', '#f4f4f4', '#1a2a6c', 'circle'), C('FC Barcelona', 'BAR', '#a50044', '#004d98'), C('Atlético Madrid', 'ATM', '#cb3524', '#272e61'), C('Athletic Club', 'ATH', '#ee2523', '#f4f4f4'), C('Sevilla', 'SEV', '#f4f4f4', '#d4001f', 'circle'), C('Real Sociedad', 'RSO', '#0067b1', '#f4f4f4')]],
  ['England', [C('Manchester City', 'MCI', '#6cabdd', '#1c2c5b', 'circle'), C('Liverpool', 'LIV', '#c8102e', '#00b2a9'), C('Arsenal', 'ARS', '#ef0107', '#023474'), C('Chelsea', 'CHE', '#034694', '#f4f4f4', 'circle'), C('Manchester United', 'MUN', '#da291c', '#000000'), C('Tottenham Hotspur', 'TOT', '#f4f4f4', '#132257'), C('Newcastle United', 'NEW', '#241f20', '#f4f4f4'), C('Aston Villa', 'AVL', '#670e36', '#95bfe5')]],
  ['Germany', [C('Bayern München', 'BAY', '#dc052d', '#0066b2', 'circle'), C('Borussia Dortmund', 'BVB', '#fde100', '#000000', 'circle'), C('Bayer Leverkusen', 'LEV', '#e32221', '#000000'), C('RB Leipzig', 'RBL', '#f4f4f4', '#dd0741'), C('Eintracht Frankfurt', 'SGE', '#e1000f', '#000000')]],
  ['Italy', [C('Inter', 'INT', '#0068a8', '#000000', 'circle'), C('Juventus', 'JUV', '#f4f4f4', '#000000'), C('AC Milan', 'MIL', '#fb090b', '#000000'), C('Napoli', 'NAP', '#12a0d7', '#003f8f', 'circle'), C('Roma', 'ROM', '#8e1f2f', '#f0bc42'), C('Atalanta', 'ATA', '#1e71b8', '#000000')]],
  ['France', [C('Paris Saint-Germain', 'PSG', '#004170', '#da291c', 'circle'), C('Marseille', 'OM', '#f4f4f4', '#2faee0'), C('Lyon', 'OL', '#f4f4f4', '#da001a'), C('Monaco', 'MON', '#e51b22', '#f4f4f4'), C('Lille', 'LIL', '#e01e13', '#f4f4f4')]],
  ['Brazil', [C('Flamengo', 'FLA', '#c3212b', '#000000'), C('Palmeiras', 'PAL', '#006437', '#f4f4f4', 'circle'), C('São Paulo', 'SAO', '#f4f4f4', '#fe0000'), C('Corinthians', 'COR', '#000000', '#f4f4f4'), C('Grêmio', 'GRE', '#0b83c6', '#000000')]],
  ['Argentina', [C('River Plate', 'RIV', '#f4f4f4', '#e2001a'), C('Boca Juniors', 'BOC', '#0a3f8f', '#ffd400'), C('Racing Club', 'RAC', '#7fc8f4', '#f4f4f4'), C('Independiente', 'IND', '#e2001a', '#f4f4f4')]],
  ['Portugal', [C('Benfica', 'SLB', '#e2001a', '#f4f4f4', 'circle'), C('Porto', 'POR', '#0059a8', '#f4f4f4'), C('Sporting CP', 'SCP', '#008057', '#f4f4f4'), C('Braga', 'BRA', '#d62027', '#f4f4f4')]],
  ['Netherlands', [C('Ajax', 'AJA', '#f4f4f4', '#d2122e'), C('PSV', 'PSV', '#ed1c24', '#f4f4f4', 'circle'), C('Feyenoord', 'FEY', '#e11a22', '#f4f4f4'), C('AZ', 'AZ', '#e11a22', '#f4f4f4', 'circle')]],
  ['Belgium', [C('Club Brugge', 'CLB', '#0a3f8f', '#000000'), C('Anderlecht', 'AND', '#5b2c8f', '#f4f4f4'), C('Genk', 'GNK', '#0a4fa0', '#f4f4f4'), C('Union SG', 'USG', '#ffd300', '#0a4fa0')]],
  ['Turkey', [C('Galatasaray', 'GAL', '#e30a17', '#fdb913'), C('Fenerbahçe', 'FEN', '#ffed00', '#0a2461'), C('Beşiktaş', 'BJK', '#000000', '#f4f4f4'), C('Trabzonspor', 'TRA', '#5e1b2a', '#63b0e3')]],
  ['Saudi Arabia', [C('Al Hilal', 'HIL', '#0048a8', '#f4f4f4', 'circle'), C('Al Nassr', 'NAS', '#ffd200', '#0a2b5c'), C('Al Ittihad', 'ITT', '#ffd200', '#000000'), C('Al Ahli', 'AHL', '#0c6b34', '#f4f4f4')]],
  ['Mexico', [C('Club América', 'AME', '#ffd400', '#0a2b5c'), C('Guadalajara', 'GDL', '#c8102e', '#f4f4f4'), C('Monterrey', 'MTY', '#0a2b5c', '#f4f4f4'), C('Tigres UANL', 'TIG', '#f7a600', '#0a2b5c')]],
  ['USA', [C('Inter Miami', 'MIA', '#f7b5cd', '#231f20', 'circle'), C('LA Galaxy', 'LAG', '#f4f4f4', '#00245d', 'circle'), C('LAFC', 'LFC', '#000000', '#c39e6d'), C('Seattle Sounders', 'SEA', '#5d9741', '#236192', 'circle')]],
  ['Japan', [C('Vissel Kobe', 'KOB', '#8b0f2f', '#f4f4f4'), C('Kawasaki Frontale', 'KAW', '#0a9fdb', '#000000'), C('Urawa Reds', 'URA', '#e60012', '#000000'), C('Yokohama F. Marinos', 'YFM', '#0a2b5c', '#f4f4f4')]],
  ['Morocco', [C('Raja Casablanca', 'RCA', '#0c6b34', '#f4f4f4'), C('Wydad Casablanca', 'WAC', '#d81e05', '#f4f4f4'), C('RS Berkane', 'RSB', '#f7a600', '#000000')]],
  ['Colombia', [C('Atlético Nacional', 'NAC', '#0c6b34', '#f4f4f4'), C('Millonarios', 'MIL', '#0a4fa0', '#f4f4f4'), C('Junior', 'JUN', '#d81e05', '#f4f4f4')]],
  ['Croatia', [C('Dinamo Zagreb', 'DZG', '#0a4fa0', '#f4f4f4'), C('Hajduk Split', 'HAJ', '#f4f4f4', '#0a4fa0'), C('Rijeka', 'RIJ', '#f4f4f4', '#0a9fdb')]],
  ['Denmark', [C('FC København', 'FCK', '#f4f4f4', '#0a2b5c'), C('Midtjylland', 'FCM', '#000000', '#d81e05'), C('Brøndby', 'BIF', '#ffd400', '#0a4fa0')]],
  ['Uruguay', [C('Peñarol', 'PEN', '#ffd400', '#000000'), C('Nacional', 'NAL', '#f4f4f4', '#0a4fa0')]],
  ['Switzerland', [C('Young Boys', 'YB', '#ffd400', '#000000'), C('Basel', 'BAS', '#d81e05', '#0a4fa0'), C('Servette', 'SER', '#8b0f2f', '#f4f4f4')]],
  ['Austria', [C('Red Bull Salzburg', 'RBS', '#f4f4f4', '#d81e05'), C('Sturm Graz', 'STU', '#000000', '#f4f4f4'), C('Rapid Wien', 'RAP', '#0c6b34', '#f4f4f4')]],
  ['Scotland', [C('Celtic', 'CEL', '#0c6b34', '#f4f4f4', 'circle'), C('Rangers', 'RAN', '#0a4fa0', '#f4f4f4'), C('Aberdeen', 'ABE', '#d81e05', '#f4f4f4')]],
  ['Senegal', [C('Jaraaf', 'JAR', '#0c6b34', '#f4f4f4'), C('Casa Sports', 'CAS', '#f4f4f4', '#0a4fa0')]],
  ['South Korea', [C('Ulsan HD', 'ULS', '#0a4fa0', '#ffd400'), C('Jeonbuk Hyundai Motors', 'JEO', '#0c6b34', '#f4f4f4'), C('FC Seoul', 'SEO', '#d81e05', '#000000')]],
  ['Egypt', [C('Al Ahly', 'AHY', '#d81e05', '#f4f4f4', 'circle'), C('Zamalek', 'ZAM', '#f4f4f4', '#d81e05'), C('Pyramids', 'PYR', '#0a4fa0', '#f7a600')]],
  ['Poland', [C('Legia Warszawa', 'LEG', '#0c6b34', '#f4f4f4'), C('Lech Poznań', 'LPO', '#0a4fa0', '#f4f4f4'), C('Raków Częstochowa', 'RAK', '#d81e05', '#0a4fa0')]],
  ['Nigeria', [C('Enyimba', 'ENY', '#0a4fa0', '#f4f4f4'), C('Kano Pillars', 'KAN', '#d81e05', '#f4f4f4'), C('Rivers United', 'RIV', '#0a4fa0', '#ffd400')]],
  ['Sweden', [C('Malmö FF', 'MFF', '#0a9fdb', '#f4f4f4'), C('AIK', 'AIK', '#000000', '#ffd400'), C('Djurgården', 'DIF', '#0a4fa0', '#f4f4f4')]],
  ['Norway', [C('Bodø/Glimt', 'BOD', '#ffd400', '#000000'), C('Molde', 'MOL', '#0a4fa0', '#f4f4f4'), C('Rosenborg', 'RBK', '#f4f4f4', '#000000')]],
  ['Greece', [C('Olympiacos', 'OLY', '#d81e05', '#f4f4f4'), C('Panathinaikos', 'PAO', '#0c6b34', '#f4f4f4'), C('AEK Athens', 'AEK', '#ffd400', '#000000'), C('PAOK', 'PAOK', '#000000', '#f4f4f4')]],
  ['Czech Republic', [C('Slavia Praha', 'SLA', '#d81e05', '#f4f4f4'), C('Sparta Praha', 'SPA', '#8b0f2f', '#ffd400'), C('Viktoria Plzeň', 'PLZ', '#0a4fa0', '#d81e05')]],
  ['Serbia', [C('Crvena Zvezda', 'CZV', '#d81e05', '#f4f4f4'), C('Partizan', 'PAR', '#000000', '#f4f4f4')]],
  ['Ukraine', [C('Shakhtar Donetsk', 'SHA', '#f7a600', '#000000'), C('Dynamo Kyiv', 'DYN', '#f4f4f4', '#0a4fa0')]],
  ['Ghana', [C('Asante Kotoko', 'KOT', '#d81e05', '#ffd400'), C('Hearts of Oak', 'HOO', '#8b0f2f', '#ffd400')]],
  ['Australia', [C('Melbourne City', 'MCY', '#6cabdd', '#f4f4f4'), C('Sydney FC', 'SYD', '#0a9fdb', '#0a2b5c'), C('Melbourne Victory', 'MVC', '#0a2b5c', '#f4f4f4')]],
  ['Ivory Coast', [C('ASEC Mimosas', 'ASE', '#ffd400', '#000000'), C('Africa Sports', 'AFS', '#0c6b34', '#d81e05')]],
  ['Algeria', [C('CR Belouizdad', 'CRB', '#d81e05', '#f4f4f4'), C('MC Alger', 'MCA', '#0c6b34', '#d81e05'), C('JS Kabylie', 'JSK', '#ffd400', '#0c6b34')]],
  ['Iran', [C('Persepolis', 'PER', '#d81e05', '#f4f4f4'), C('Esteghlal', 'EST', '#0a4fa0', '#f4f4f4'), C('Sepahan', 'SEP', '#ffd400', '#000000')]],
  ['Chile', [C('Colo-Colo', 'COL', '#f4f4f4', '#000000'), C('Universidad de Chile', 'UCH', '#0a4fa0', '#d81e05'), C('Universidad Católica', 'UCA', '#f4f4f4', '#0a4fa0')]],
  ['Ecuador', [C('LDU Quito', 'LDU', '#f4f4f4', '#0a4fa0'), C('Barcelona SC', 'BSC', '#ffd400', '#000000'), C('Independiente del Valle', 'IDV', '#000000', '#0a4fa0')]],
  ['Qatar', [C('Al Sadd', 'SAD', '#000000', '#f4f4f4'), C('Al Duhail', 'DUH', '#d81e05', '#f4f4f4')]],
  ['Tunisia', [C('Espérance de Tunis', 'EST', '#d81e05', '#ffd400'), C('Étoile du Sahel', 'ESS', '#d81e05', '#f4f4f4'), C('Club Africain', 'CA', '#d81e05', '#f4f4f4')]],
  ['Cameroon', [C('Coton Sport', 'COT', '#0c6b34', '#f4f4f4'), C('Canon Yaoundé', 'CAN', '#0c6b34', '#d81e05')]],
  ['Canada', [C('Toronto FC', 'TOR', '#d81e05', '#f4f4f4'), C('CF Montréal', 'MTL', '#0a2b5c', '#000000'), C('Vancouver Whitecaps', 'VAN', '#f4f4f4', '#0a4fa0')]],
  ['United Arab Emirates', [C('Al Ain', 'AIN', '#5b2c8f', '#f4f4f4'), C('Al Wahda', 'WAH', '#8b0f2f', '#f4f4f4'), C('Shabab Al Ahli', 'SAA', '#d81e05', '#f4f4f4')]],
  ['Wales', [C('Cardiff City', 'CAR', '#0a4fa0', '#f4f4f4'), C('Swansea City', 'SWA', '#f4f4f4', '#000000'), C('Wrexham', 'WRX', '#d81e05', '#f4f4f4')]],
  ['Romania', [C('FCSB', 'FCSB', '#d81e05', '#0a4fa0'), C('CFR Cluj', 'CFR', '#8b0f2f', '#f4f4f4'), C('Universitatea Craiova', 'UCV', '#0a4fa0', '#f4f4f4')]],
  ['Hungary', [C('Ferencváros', 'FTC', '#0c6b34', '#f4f4f4'), C('Puskás Akadémia', 'PUS', '#0a4fa0', '#ffd400')]],
  ['Peru', [C('Alianza Lima', 'ALI', '#0a2b5c', '#f4f4f4'), C('Universitario', 'UNI', '#8b0f2f', '#f4f4f4'), C('Sporting Cristal', 'CRI', '#6cabdd', '#f4f4f4')]],
  ['Paraguay', [C('Olimpia', 'OLI', '#f4f4f4', '#000000'), C('Cerro Porteño', 'CER', '#d81e05', '#0a4fa0'), C('Libertad', 'LIB', '#000000', '#f4f4f4')]],
  ['Ireland', [C('Shamrock Rovers', 'SHR', '#0c6b34', '#f4f4f4'), C('Shelbourne', 'SHE', '#d81e05', '#f4f4f4'), C("St Patrick's Athletic", 'STP', '#d81e05', '#f4f4f4')]],
  ['Iraq', [C('Al Shorta', 'SHO', '#0c6b34', '#f4f4f4'), C('Al Quwa Al Jawiya', 'QAJ', '#0a4fa0', '#f4f4f4')]],
  ['Slovakia', [C('Slovan Bratislava', 'SLO', '#6cabdd', '#f4f4f4'), C('Spartak Trnava', 'TRN', '#d81e05', '#000000')]],
  ['China', [C('Shanghai Port', 'SHP', '#d81e05', '#f4f4f4'), C('Shandong Taishan', 'SDT', '#f7a600', '#0a4fa0'), C('Beijing Guoan', 'BJG', '#0c6b34', '#f4f4f4')]],
  ['India', [C('Mohun Bagan', 'MBG', '#0c6b34', '#8b0f2f'), C('Mumbai City', 'MCF', '#6cabdd', '#f4f4f4'), C('Bengaluru FC', 'BFC', '#0a4fa0', '#f4f4f4'), C('Kerala Blasters', 'KBF', '#ffd400', '#0a4fa0')]],
].map(([name, clubs], i) => ({ name, rank: i + 1, clubs: clubs.map((c) => ({ ...c, id: `kc-${name}-${c.short}`.replace(/\s+/g, '-').toLowerCase(), country: name })) }));

export const INTERNATIONAL = 'International';

export const countryNames = () => [...COUNTRIES.map((c) => c.name), INTERNATIONAL];
export const countryByName = (name) => COUNTRIES.find((c) => c.name === name) || null;
export const flagOf = (name) => WORLD.players.find((p) => p.nation === name)?.nationColors || ['#888888', '#333333'];

const GROUP = { GK: 'GK', CB: 'DF', LB: 'DF', RB: 'DF', CDM: 'MF', CM: 'MF', CAM: 'MF', LM: 'MF', RM: 'MF', LW: 'FW', RW: 'FW', ST: 'FW' };
const WANT = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW'];
const ref = (p) => ({ id: p.id || `kc-${p.name}`, name: p.name, short: p.short || p.name, position: p.position, overall: p.overall, stats: p.stats, foot: p.foot, rarity: p.rarity || 'gold', nation: p.nation, age: p.age });

/** Pick a best XI in a 4-4-2 shape from a list, and a bench from what is left. */
function pickXI(list) {
  const rest = list.slice().sort((a, b) => b.overall - a.overall);
  const xi = [];
  for (const g of WANT) {
    const i = rest.findIndex((p) => GROUP[p.position] === g);
    xi.push(i >= 0 ? rest.splice(i, 1)[0] : rest.shift());
  }
  return { xi: xi.filter(Boolean), bench: rest.slice(0, 7) };
}

const squadCache = new Map();
/**
 * A club's squad, as the match wants it. Career-curated squads where the club
 * is one Manager Career knows; otherwise the country's players, dealt so the
 * first club named gets the best and no player appears twice in a country.
 */
export function clubSquad(club) {
  if (squadCache.has(club.id)) return squadCache.get(club.id);
  const country = countryByName(club.country);
  const careerById = new Map(CAREER_CLUBS.map((c) => [c.name.toLowerCase(), c]));
  const taken = new Set();
  const dealt = {};
  // the career clubs first, so their curated players are not dealt twice
  const careerLists = {};
  for (const c of country.clubs) {
    const cc = careerById.get(c.name.toLowerCase());
    if (!cc) continue;
    const sq = squadOf(cc.id).map(ref);
    sq.forEach((p) => taken.add(p.name));
    careerLists[c.id] = sq;
  }
  let pool = WORLD.players.filter((p) => p.nation === country.name && !p.sbc && p.rarity !== 'icon' && p.rarity !== 'star' && !taken.has(p.name))
    .sort((a, b) => b.overall - a.overall);
  // a curated squad can be short of a position (the career file lists no keeper for a club or two):
  // top it up from the country's own pool first, then from free agents, before anything else is dealt
  const need = { GK: 2, DF: 6, MF: 6, FW: 4 };
  const spareAll = WORLD.players.filter((p) => !p.clubId && !p.sbc && p.rarity !== 'icon' && p.rarity !== 'star' && !taken.has(p.name) && p.nation !== country.name)
    .sort((a, b) => Math.abs(a.overall - 60) - Math.abs(b.overall - 60));
  for (const [id, list] of Object.entries(careerLists)) {
    for (const g of Object.keys(need)) {
      while (list.filter((p) => GROUP[p.position] === g).length < need[g]) {
        let j = pool.findIndex((p) => GROUP[p.position] === g);
        let src = pool;
        if (j < 0) { j = spareAll.findIndex((p) => GROUP[p.position] === g); src = spareAll; }
        if (j < 0) break;
        const p = src.splice(j, 1)[0]; taken.add(p.name); list.push(ref(p));
      }
    }
    dealt[id] = pickXI(list);
  }
  const others = country.clubs.filter((c) => !dealt[c.id]);
  if (!others.length) { for (const c of country.clubs) squadCache.set(c.id, dealt[c.id]); return dealt[club.id]; }
  // deal round-robin by position group so every club can field an XI
  const per = others.map(() => []);
  const byGroup = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of pool) byGroup[GROUP[p.position] || 'MF'].push(p);
  for (const g of Object.keys(need)) {
    let i = 0;
    for (const p of byGroup[g]) { per[i % per.length].push(p); i += 1; }
  }
  // a country too thin for its clubs borrows the nearest free agents, so the sheet is never short
  const spare = spareAll;
  let s = 0;
  others.forEach((c, i) => {
    const list = per[i];
    for (const g of Object.keys(need)) {
      while (list.filter((p) => GROUP[p.position] === g).length < need[g] && s < spare.length) {
        const j = spare.findIndex((p, k) => k >= s && GROUP[p.position] === g);
        if (j < 0) break;
        list.push(spare[j]); spare.splice(j, 1);
      }
    }
    /* The gradient the list promises: Spain at the top, India at the bottom.
       A country's dealt clubs are scaled to a target that falls with its rank
       (and a little with each club after the first), on copies — the cards
       these players are everywhere else are untouched. The curated career
       clubs keep their real ratings. */
    const target = 85 - country.rank * 0.52 - i * 1.5;
    const picked = pickXI(list.map(ref));
    const avg = picked.xi.reduce((t, p) => t + p.overall, 0) / Math.max(1, picked.xi.length);
    const k = Math.max(0.72, Math.min(1.12, target / Math.max(1, avg)));
    const scale = (p) => ({ ...p, overall: Math.max(40, Math.min(94, Math.round(p.overall * k))), stats: Object.fromEntries(Object.entries(p.stats || {}).map(([key, v]) => [key, Math.max(20, Math.min(99, Math.round(v * k)))])) });
    dealt[c.id] = { xi: picked.xi.map(scale), bench: picked.bench.map(scale) };
  });
  for (const c of country.clubs) squadCache.set(c.id, dealt[c.id]);
  return dealt[club.id];
}

/** The team sheet numbers a select screen shows. */
export function clubSheet(club) {
  const { xi } = clubSquad(club);
  const avg = (list) => (list.length ? Math.round(list.reduce((s, p) => s + p.overall, 0) / list.length) : 0);
  const att = xi.filter((p) => GROUP[p.position] === 'FW');
  const mid = xi.filter((p) => GROUP[p.position] === 'MF');
  const def = xi.filter((p) => GROUP[p.position] === 'DF');
  const overall = avg(xi);
  return { att: avg(att), mid: avg(mid), def: avg(def), overall, stars: Math.max(1, Math.min(5, Math.round((overall - 56) / 6))), star: xi.slice().sort((a, b) => b.overall - a.overall)[0] };
}

/** The custom squad a match takes. */
export function matchSquad(club) {
  const { xi, bench } = clubSquad(club);
  return {
    id: club.id, name: club.name, short: club.short, colors: club.colors, country: club.country,
    crest: { shape: club.shape || 'shield', pattern: 'solid', device: 'star', colors: club.colors },
    xi, bench, rating: clubSheet(club).overall,
  };
}

/** The International "clubs": every national XI, strongest first. */
export function internationalTeams() {
  return nations().map((n) => ({ id: `nat-${n.nation}`, name: n.nation, short: n.short, colors: n.colors, shape: 'circle', country: INTERNATIONAL, national: true, rating: n.rating }));
}
export function internationalSquad(team) { return nationSquad(team.name); }
