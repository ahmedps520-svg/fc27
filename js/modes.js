/**
 * Ultimate XI's modes beyond the Apex Division (v80). Every name is original.
 *
 *  - **Quickfire Fives**: five-a-side on a small pitch — your keeper and your
 *    four best outfielders from the XI, two-and-a-half-minute matches, quick
 *    rewards. The phone mode.
 *  - **Squad Clash**: an offline week of twelve curated AI squads — themed
 *    real footballers under invented team names — each played once, at a
 *    difficulty you choose. Points for the result, the goals and a clean sheet
 *    add up to a weekly rank, paid the following week.
 *  - **Apex Division weekly rewards**: the ladder also pays by wins in the week.
 *  - **Weekend League qualification**: ten qualification points before the
 *    weekend opens — from Division, Squad Clash and Fives wins — or no entry.
 */
import { getState, update } from './state.js';
import { WORLD } from './data/generator.js';
import { weekNow } from './data/promos.js';
import { weekendWindow } from './weekend.js';

/* ------------------------------ Quickfire Fives ------------------------------ */
export const FIVES = { duration: 150, venue: 'stationrd', reward: { win: 900, draw: 400, loss: 200, goal: 150 } };

/** Your five: the keeper and four outfielders (a defender, two midfielders, a forward) from the XI. */
export function fivesPick(xi) {
  const role = (p) => (p.position === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p.position) ? 'DEF' : ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position) ? 'MID' : 'FWD');
  const by = (r) => xi.filter((p) => role(p) === r).sort((a, b) => b.overall - a.overall);
  const out = [by('GK')[0], by('DEF')[0], ...by('MID').slice(0, 2), by('FWD')[0]];
  const rest = xi.filter((p) => !out.includes(p)).sort((a, b) => b.overall - a.overall);
  for (let i = 0; i < out.length; i++) if (!out[i]) out[i] = rest.shift();
  return out.filter(Boolean).slice(0, 5);
}

export function settleFives(scored, conceded) {
  const r = FIVES.reward;
  const won = scored > conceded; const drew = scored === conceded;
  const apex = (won ? r.win : drew ? r.draw : r.loss) + scored * r.goal;
  update((s) => {
    const f = s.club.fives || (s.club.fives = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, streak: 0, best: 0 });
    f.played += 1; if (won) f.won += 1; else if (drew) f.drawn += 1; else f.lost += 1;
    f.gf += scored; f.ga += conceded;
    f.streak = won ? f.streak + 1 : 0; f.best = Math.max(f.best, f.streak);
    f.last = { scored, conceded, at: Date.now() };
    s.club.apex += apex;
  });
  addQualifying(won ? 1 : 0);
  return { apex, won, drew };
}

/* -------------------------------- Squad Clash -------------------------------- */
const DESERT = ['Saudi Arabia', 'Qatar', 'United Arab Emirates', 'Iraq', 'Egypt', 'Morocco', 'Algeria', 'Tunisia'];
export const CLASH_THEMES = [
  { id: 'desert', name: 'Desert Kings', pick: (p) => DESERT.includes(p.nation), colors: ['#f0b048', '#3a1c06'] },
  { id: 'young', name: 'Young Guns', pick: (p) => p.age <= 21, colors: ['#19e3ff', '#0a0a22'] },
  { id: 'old', name: 'Old Guard', pick: (p) => p.age >= 32, colors: ['#bfc6d0', '#1b1f28'] },
  { id: 'pace', name: 'Speed Merchants', pick: (p) => p.stats.pace >= 86 || p.position === 'GK' || p.position === 'CB', colors: ['#ff5c38', '#141414'] },
  { id: 'wall', name: 'The Wall', pick: (p) => p.stats.defending >= 78 || p.position === 'ST' || p.position === 'GK', colors: ['#4f6d7a', '#dfe6ea'] },
  { id: 'brazil', name: 'Samba Collective', pick: (p) => p.nation === 'Brazil', colors: ['#009c3b', '#ffdf00'] },
  { id: 'iberia', name: 'Iberian Touch', pick: (p) => p.nation === 'Spain' || p.nation === 'Portugal', colors: ['#c60b1e', '#ffc400'] },
  { id: 'england', name: 'Rainy Tuesday', pick: (p) => p.nation === 'England', colors: ['#ffffff', '#1d2a5c'] },
  { id: 'italy', name: 'Catenaccio Club', pick: (p) => p.nation === 'Italy', colors: ['#0064aa', '#ffffff'] },
  { id: 'germany', name: 'Engine Works', pick: (p) => p.nation === 'Germany' || p.nation === 'Austria', colors: ['#111111', '#dd0000'] },
  { id: 'france', name: 'Tricolour Stars', pick: (p) => p.nation === 'France', colors: ['#0055a4', '#ef4135'] },
  { id: 'argentina', name: 'Albiceleste Spirit', pick: (p) => p.nation === 'Argentina' || p.nation === 'Uruguay', colors: ['#75aadb', '#ffffff'] },
  { id: 'africa', name: 'Continental Force', pick: (p) => ['Nigeria', 'Senegal', 'Ghana', 'Ivory Coast', 'Cameroon', 'Morocco', 'Egypt', 'Algeria'].includes(p.nation), colors: ['#0c6b34', '#ffd400'] },
  { id: 'lowlands', name: 'Total Lowlands', pick: (p) => p.nation === 'Netherlands' || p.nation === 'Belgium', colors: ['#ff6a13', '#1b1b1b'] },
  { id: 'nordic', name: 'Northern Lights', pick: (p) => ['Norway', 'Sweden', 'Denmark', 'Iceland', 'Finland'].includes(p.nation), colors: ['#41d3ff', '#2b2d6e'] },
  { id: 'americas', name: 'Americas United', pick: (p) => ['USA', 'Mexico', 'Canada', 'Colombia', 'Ecuador', 'Chile', 'Peru'].includes(p.nation), colors: ['#b22234', '#3c3b6e'] },
];
export const CLASH_LEVELS = [
  { id: 'amateur', name: 'Amateur', skill: 0.8, delta: -8, points: 60 },
  { id: 'semipro', name: 'Semi-Pro', skill: 0.95, delta: -4, points: 90 },
  { id: 'pro', name: 'Professional', skill: 1.1, delta: 0, points: 130 },
  { id: 'world', name: 'World Class', skill: 1.3, delta: 3, points: 180 },
  { id: 'legend', name: 'Legendary', skill: 1.55, delta: 6, points: 240 },
];
export const CLASH_RANKS = [
  { name: 'Bronze', points: 0, apex: 2000, packs: ['silver'] },
  { name: 'Silver', points: 400, apex: 5000, packs: ['gold'] },
  { name: 'Gold', points: 900, apex: 10000, packs: ['gold', 'inform'] },
  { name: 'Elite', points: 1600, apex: 18000, packs: ['prime', 'inform'] },
  { name: 'Legend', points: 2400, apex: 30000, packs: ['prime', 'campaign'], ultimate: 3 },
];
export const clashRankFor = (pts) => CLASH_RANKS.slice().reverse().find((r) => pts >= r.points) || CLASH_RANKS[0];

function h32(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

/** This week's twelve opponents. */
export function clashWeek(week = weekNow()) {
  const order = CLASH_THEMES.slice().sort((a, b) => h32(`${week}|${a.id}`) - h32(`${week}|${b.id}`));
  return order.slice(0, 12);
}

/** A themed opponent squad near a target rating: real footballers, an invented team. */
export function clashSquad(themeId, targetRating) {
  const th = CLASH_THEMES.find((t) => t.id === themeId) || CLASH_THEMES[0];
  const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon' && th.pick(p));
  const need = [['GK', 1], ['DEF', 4], ['MID', 4], ['FWD', 2]];
  const line = (p) => (p.position === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p.position) ? 'DEF' : ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position) ? 'MID' : 'FWD');
  const xi = [];
  for (const [l, n] of need) {
    const c = pool.filter((p) => line(p) === l && !xi.includes(p)).sort((a, b) => Math.abs(a.overall - targetRating) - Math.abs(b.overall - targetRating) || b.overall - a.overall);
    let take = c.slice(0, n);
    if (take.length < n) take = take.concat(WORLD.players.filter((p) => line(p) === l && !xi.includes(p) && !take.includes(p) && !p.sbc).sort((a, b) => Math.abs(a.overall - targetRating) - Math.abs(b.overall - targetRating)).slice(0, n - take.length));
    xi.push(...take);
  }
  const rating = Math.round(xi.reduce((t, p) => t + p.overall, 0) / xi.length);
  return { xi, bench: [], name: th.name, short: th.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(), colors: th.colors,
    crest: { shape: 'shield', pattern: 'halves', device: 'star', colors: th.colors }, rating, tactics: { mentality: 'balanced' } };
}

function clashState(s, week = weekNow()) {
  let c = s.club.clash;
  if (!c || c.week !== week) {
    if (c && c.points > 0 && !c.claimed) s.club.clashPending = { week: c.week, points: c.points };
    c = s.club.clash = { week, points: 0, played: {}, claimed: false };
  }
  return c;
}
export function clashStatus(now = Date.now()) {
  let out;
  update((s) => { const c = clashState(s, weekNow(now)); out = { ...c, rank: clashRankFor(c.points), pending: s.club.clashPending || null }; });
  return out;
}
export function settleClash(themeId, levelId, scored, conceded) {
  const lv = CLASH_LEVELS.find((l) => l.id === levelId) || CLASH_LEVELS[2];
  const won = scored > conceded; const drew = scored === conceded;
  const pts = Math.round(lv.points * (won ? 1 : drew ? 0.4 : 0.1)) + scored * 8 + (conceded === 0 ? 25 : 0);
  update((s) => { const c = clashState(s); c.points += pts; c.played[themeId] = { level: levelId, scored, conceded, pts }; });
  addQualifying(won ? 2 : 0);
  return { pts, won, drew };
}
export function claimClash() {
  let got = null;
  update((s) => {
    const p = s.club.clashPending;
    if (!p) return;
    const r = clashRankFor(p.points);
    s.club.apex += r.apex; s.club.ultimate = (s.club.ultimate || 0) + (r.ultimate || 0);
    for (const pk of r.packs) s.club.packs.push(pk);
    s.club.clashPending = null;
    got = r;
  });
  return got;
}

/* ------------------------ Apex Division weekly rewards ------------------------ */
export const RIVAL_TIERS = [
  { wins: 3, apex: 3000, packs: ['gold'] },
  { wins: 7, apex: 8000, packs: ['gold', 'inform'] },
  { wins: 12, apex: 15000, packs: ['prime'], ultimate: 1 },
];
/** Call after every Apex Division result. */
export function noteDivisionResult(won) {
  update((s) => {
    const wk = weekNow();
    let r = s.club.rivalsWeek;
    if (!r || r.week !== wk) {
      if (r && r.wins > 0 && !r.claimed) s.club.rivalsPending = r;
      r = s.club.rivalsWeek = { week: wk, wins: 0, claimed: false };
    }
    if (won) r.wins += 1;
  });
  addQualifying(won ? 1 : 0);
}
export function rivalsStatus() {
  const s = getState();
  const wk = weekNow();
  const cur = s.club.rivalsWeek?.week === wk ? s.club.rivalsWeek : { week: wk, wins: 0 };
  return { current: cur, tier: RIVAL_TIERS.filter((t) => cur.wins >= t.wins).pop() || null, next: RIVAL_TIERS.find((t) => cur.wins < t.wins) || null, pending: s.club.rivalsPending || null };
}
export function claimRivals() {
  let got = null;
  update((s) => {
    const p = s.club.rivalsPending;
    if (!p) return;
    const t = RIVAL_TIERS.filter((x) => p.wins >= x.wins).pop();
    if (t) { s.club.apex += t.apex; s.club.ultimate = (s.club.ultimate || 0) + (t.ultimate || 0); for (const pk of t.packs) s.club.packs.push(pk); got = t; }
    s.club.rivalsPending = null;
  });
  return got;
}

/* ------------------------ Weekend League qualification ------------------------ */
export const QUALIFY_POINTS = 10;
export function addQualifying(n, now = new Date()) {
  if (!n) return;
  update((s) => {
    const id = weekendWindow(now).id;
    const q = s.club.qualify?.id === id ? s.club.qualify : (s.club.qualify = { id, points: 0 });
    q.points = Math.min(99, q.points + n);
  });
}
/** Qualified for the weekend that is open or next to open. Once it is open, points no longer change the answer. */
export function qualification(now = new Date()) {
  const s = getState();
  const w = weekendWindow(now);
  const pts = s.club.qualify?.id === w.id ? s.club.qualify.points : 0;
  // an entry already played counts: nobody is thrown out of a weekend mid-way
  const started = s.club.weekend?.id === w.id && (s.club.weekend.played || 0) > 0;
  return { points: pts, need: QUALIFY_POINTS, qualified: started || pts >= QUALIFY_POINTS };
}
