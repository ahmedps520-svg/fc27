/**
 * The card ecosystem beyond the base cards (v80).
 *
 *  - **Campaigns**: three themed promos that take turns, a week each —
 *    Future Stars (the best young players, quicker and trickier), Heroes of
 *    the Desert (players from the Gulf and North Africa, boosted hard) and
 *    Winter Legends (the old heads, stronger and wiser). Each has its own
 *    card design.
 *  - **In-Form** cards: a player who had a great week in the world's own
 *    simulated round of matches gets a card a few points above his base one.
 *  - **Team of the Week**: the best eleven of that round, a point higher
 *    again, in their own design.
 *  - **Icon tiers**: every Icon comes in three — Early (92), Peak (95) and
 *    Prime (99, the card that already existed).
 *
 * All of them are *variants* of a base card, named by id (`pr:<campaign>:<id>`,
 * `if:<week>:<id>`, `tw:<week>:<id>`, `ic:<tier>:<id>`), built on first request
 * and cached by `generator.getPlayer`. They are never in a club's roster or in
 * WORLD.players, so AI squads and ordinary packs never see them; they are
 * pulled from the packs below that ask for them, and earned from objectives
 * and evolutions. A variant and its base are the same footballer, so a squad
 * may field only one of them (`baseOf`).
 */
import { WORLD, setVariantResolver } from './generator.js';
import { RARITY } from './pools.js';

const WEEK = 604_800_000;
export const weekNow = (now = Date.now()) => Math.floor(now / WEEK);

const DESERT = ['Saudi Arabia', 'Qatar', 'United Arab Emirates', 'Iraq', 'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Jordan', 'Oman', 'Kuwait', 'Bahrain', 'Libya'];

export const CAMPAIGNS = [
  { id: 'future', name: 'Future Stars', blurb: 'The best of the next generation, quicker and trickier.', colors: ['#19e3ff', '#6a1bff'],
    eligible: (p) => p.age <= 21 && p.overall >= 70 && p.position !== 'GK', boost: 6, stats: { pace: 6, dribbling: 6, shooting: 4, passing: 3, physical: 2, defending: 2 } },
  { id: 'desert', name: 'Heroes of the Desert', blurb: 'The Gulf and North Africa\'s finest, boosted hard.', colors: ['#f0b048', '#6b2b0e'],
    eligible: (p) => DESERT.includes(p.nation) && p.overall >= 66, boost: 8, stats: { pace: 5, dribbling: 5, shooting: 6, passing: 5, physical: 6, defending: 5 } },
  { id: 'winter', name: 'Winter Legends', blurb: 'The old heads: stronger, wiser, harder to beat.', colors: ['#d8f1ff', '#1f3f66'],
    eligible: (p) => p.age >= 30 && p.overall >= 76, boost: 5, stats: { pace: 1, dribbling: 3, shooting: 4, passing: 6, physical: 6, defending: 6 } },
];
export const campaignNow = (now = Date.now()) => CAMPAIGNS[weekNow(now) % CAMPAIGNS.length];
/** Seconds until the campaign turns over. */
export const campaignEndsIn = (now = Date.now()) => Math.ceil(((weekNow(now) + 1) * WEEK - now) / 1000);

export const ICON_TIERS = [
  { id: 'early', name: 'Early', drop: 7 },
  { id: 'peak', name: 'Peak', drop: 4 },
  { id: 'prime', name: 'Prime', drop: 0 },
];

/* The rarities the new cards wear (added to RARITY in pools.js by the card component). */
export const PROMO_RARITY = {
  inform: { label: 'In-Form', color: '#7cff6b', glow: 'rgba(124,255,107,.6)' },
  totw: { label: 'Team of the Week', color: '#ffe066', glow: 'rgba(255,224,102,.7)' },
  future: { label: 'Future Stars', color: '#19e3ff', glow: 'rgba(25,227,255,.7)' },
  desert: { label: 'Heroes of the Desert', color: '#f0b048', glow: 'rgba(240,176,72,.7)' },
  winter: { label: 'Winter Legends', color: '#d8f1ff', glow: 'rgba(216,241,255,.7)' },
};

// the new rarities join the table every card component reads
Object.assign(RARITY, PROMO_RARITY);

const cap = (v) => Math.max(1, Math.min(99, Math.round(v)));
function derive(base, id, { boost = 0, stats = {}, rarity, promo = null, label = null, tier = null }) {
  const st = {};
  for (const [k, v] of Object.entries(base.stats)) st[k] = cap(v + (stats[k] ?? boost * 0.8));
  return {
    ...base, id, baseId: base.id,
    overall: cap(base.overall + boost), stats: st, rarity, promo, promoLabel: label, iconTier: tier,
    value: Math.round((base.value || 1e6) * (1 + Math.max(0, boost) * 0.18)),
    sbc: false,
  };
}

/* --------------------------- the world's week --------------------------- *
 * Who had a great week. A round of the world's league is simulated cheaply
 * and deterministically from the week number: every club plays one match,
 * goals are dealt to its attackers weighted by shooting, assists by passing,
 * clean sheets to its defence, and a rating out of ten falls out of it. The
 * best eleven by position are the Team of the Week; the next twenty-four are
 * In-Form. The same week always gives the same cards. */
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const weekCache = new Map();
export function weekPerformers(week = weekNow()) {
  if (weekCache.has(week)) return weekCache.get(week);
  const r = mulberry(week * 7919 + 17);
  const clubs = WORLD.clubs.slice();
  for (let i = clubs.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [clubs[i], clubs[j]] = [clubs[j], clubs[i]]; }
  const scores = [];
  for (let i = 0; i + 1 < clubs.length; i += 2) {
    const [a, b] = [clubs[i], clubs[i + 1]];
    const squad = (c) => c.roster.map((id) => WORLD.playersById[id]).filter(Boolean).sort((x, y) => y.overall - x.overall).slice(0, 11);
    const sa = squad(a); const sb = squad(b);
    const str = (s) => s.reduce((t, p) => t + p.overall, 0) / Math.max(1, s.length);
    const goals = (s, o) => Math.max(0, Math.round((str(s) - str(o)) / 6 + r() * 3.2 - 0.6));
    const ga = goals(sa, sb); const gb = goals(sb, sa);
    for (const [s, gf, gc] of [[sa, ga, gb], [sb, gb, ga]]) {
      const rate = new Map(s.map((p) => [p, 5.8 + (p.overall - 70) / 25 + r() * 1.3]));
      const pick = (w) => { const tot = s.reduce((t, p) => t + w(p), 0); let x = r() * tot; for (const p of s) { x -= w(p); if (x <= 0) return p; } return s[0]; };
      for (let g = 0; g < gf; g++) {
        const sc = pick((p) => (['ST', 'LW', 'RW', 'CAM'].includes(p.position) ? 3 : p.position === 'GK' ? 0 : 1) * p.stats.shooting);
        rate.set(sc, rate.get(sc) + 1.0);
        const as = pick((p) => (p === sc || p.position === 'GK' ? 0 : 1) * p.stats.passing);
        rate.set(as, rate.get(as) + 0.5);
      }
      if (gc === 0) for (const p of s) if (['GK', 'CB', 'LB', 'RB', 'CDM'].includes(p.position)) rate.set(p, rate.get(p) + 0.8);
      if (gf > gc) for (const p of s) rate.set(p, rate.get(p) + 0.3);
      for (const [p, v] of rate) scores.push({ p, rating: Math.min(10, v) });
    }
  }
  scores.sort((x, y) => y.rating - x.rating);
  const need = { GK: 1, DEF: 4, MID: 3, FWD: 3 };
  const line = (p) => (p.position === 'GK' ? 'GK' : ['CB', 'LB', 'RB'].includes(p.position) ? 'DEF' : ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position) ? 'MID' : 'FWD');
  const totw = []; const inform = [];
  for (const sc of scores) {
    if (sc.p.rarity === 'icon' || sc.p.rarity === 'star' || sc.p.sbc) continue;
    const l = line(sc.p);
    if (need[l] > 0) { need[l] -= 1; totw.push(sc); } else if (inform.length < 24) inform.push(sc);
    if (inform.length >= 24 && Object.values(need).every((n) => n <= 0)) break;
  }
  const res = { week, totw, inform };
  weekCache.set(week, res);
  if (weekCache.size > 16) weekCache.delete(weekCache.keys().next().value);
  return res;
}

/* ------------------------------ resolution ------------------------------ */
function resolve(id) {
  const [kind, a, baseId] = String(id).split(':');
  const base = baseId && WORLD.playersById[baseId];
  if (!base) return undefined;
  let card;
  if (kind === 'pr') {
    const c = CAMPAIGNS.find((x) => x.id === a);
    if (!c || !c.eligible(base)) return undefined;
    card = derive(base, id, { boost: c.boost, stats: c.stats, rarity: c.id, promo: c.id, label: c.name });
  } else if (kind === 'if' || kind === 'tw') {
    const week = Number(a);
    if (!Number.isFinite(week)) return undefined;
    card = derive(base, id, { boost: kind === 'tw' ? 4 : 2, rarity: kind === 'tw' ? 'totw' : 'inform', promo: kind, label: kind === 'tw' ? `Team of the Week ${week % 52 + 1}` : `In-Form · week ${week % 52 + 1}` });
  } else if (kind === 'ic') {
    const t = ICON_TIERS.find((x) => x.id === a);
    if (!t || base.rarity !== 'icon') return undefined;
    card = derive(base, id, { boost: -t.drop, rarity: 'icon', label: `${t.name} Icon`, tier: t.id });
  } else return undefined;
  WORLD.playersById[id] = card;
  return card;
}
setVariantResolver(resolve);

/** The footballer behind a card — the same for a base card and all its variants. */
export const baseOf = (card) => card?.baseId || card?.id;

/** Every card of a campaign (for the store shelf and the tests). */
export function campaignCards(c = campaignNow()) {
  return WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon' && p.rarity !== 'star' && c.eligible(p)).map((p) => resolve(`pr:${c.id}:${p.id}`)).filter(Boolean);
}
export function weekCards(kind = 'inform', week = weekNow()) {
  const w = weekPerformers(week);
  return (kind === 'totw' ? w.totw : w.inform).map((x) => resolve(`${kind === 'totw' ? 'tw' : 'if'}:${week}:${x.p.id}`)).filter(Boolean);
}
export function iconTierCards(tier) {
  // the Prime tier is the Icon card that already existed
  if (tier === 'prime') return (WORLD.icons || []).map((id) => WORLD.playersById[id]).filter(Boolean);
  return (WORLD.icons || []).map((id) => resolve(`ic:${tier}:${id}`)).filter(Boolean);
}
