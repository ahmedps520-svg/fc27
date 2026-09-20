/**
 * The transfer economy: prices that answer to supply and demand.
 *
 * A card's `value` is what the generator thought it was worth in a vacuum.
 * The market price is that number times an index for the card's kind —
 * position group and rating band — and the index moves two ways:
 *
 *   supply  how many cards of that kind exist in the world against how many
 *           the world's clubs want (a 4-3-3 per club, plus depth), so scarce
 *           kinds (good keepers, elite wingers) cost more and the glut of
 *           mid-70s centre-backs costs less;
 *   demand  what has been traded recently — every pack opened, quick-sell,
 *           evolve and career signing bumps a rolling tally per kind, and a
 *           kind that is being bought climbs while one being dumped falls.
 *
 * The rolling tally lives in the save (`club.market`) and decays by half a
 * day at a time, so a price spike from a buying spree fades within a week.
 * Everything is a pure function of the world and that tally, so the same
 * save sees the same prices on every device.
 */
import { WORLD } from './data/generator.js';
import { getState, update } from './state.js';

export const GROUPS = { GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'WNG', RW: 'WNG', ST: 'ST' };
export const BANDS = [[0, 69, 'bronze'], [70, 78, 'silver'], [79, 85, 'gold'], [86, 89, 'elite'], [90, 99, 'legend']];
export const bandOf = (overall) => BANDS.find(([lo, hi]) => overall >= lo && overall <= hi)?.[2] || 'bronze';
export const kindOf = (p) => `${GROUPS[p.position] || 'MID'}:${bandOf(p.overall)}`;

/* How many of each kind the world's clubs would field and carry: per club a
   4-3-3 plus a bench, weighted towards the bands a club of that level uses. */
const WANT_PER_CLUB = { GK: 2, DEF: 6, MID: 6, WNG: 4, ST: 3 };

let supplyCache = null;
/** Supply index per kind: 1.0 is balanced; above 1 is scarce. Computed once per world. */
export function supplyIndex() {
  if (supplyCache) return supplyCache;
  const have = {};
  for (const p of WORLD.players) {
    if (p.rarity === 'icon' || p.sbc) continue;
    const k = kindOf(p);
    have[k] = (have[k] || 0) + 1;
  }
  // demand: every club wants its shape in the bands around its own rating
  const want = {};
  for (const c of WORLD.clubs) {
    const rating = WORLD.clubsById[c.id].roster.slice(0, 11).map((id) => WORLD.playersById[id]?.overall || 70);
    const avg = rating.reduce((a, b) => a + b, 0) / Math.max(1, rating.length);
    for (const [g, n] of Object.entries(WANT_PER_CLUB)) {
      // two thirds in the club's own band, a third one band up (what it aspires to)
      const own = bandOf(Math.round(avg));
      const up = bandOf(Math.min(99, Math.round(avg) + 8));
      want[`${g}:${own}`] = (want[`${g}:${own}`] || 0) + n * 0.67;
      want[`${g}:${up}`] = (want[`${g}:${up}`] || 0) + n * 0.33;
    }
  }
  const out = {};
  for (const k of new Set([...Object.keys(have), ...Object.keys(want)])) {
    const ratio = (want[k] || 1) / Math.max(1, have[k] || 1);
    // damped: the index moves a third as far as the raw ratio, and stays within 0.6..1.8
    out[k] = Math.max(0.6, Math.min(1.8, Math.pow(ratio, 0.35)));
  }
  supplyCache = out;
  return out;
}

const HALF_LIFE_MS = 12 * 3_600_000;
/** The rolling demand tally, decayed to now. */
function tally(s, now = Date.now()) {
  const m = s.club.market || (s.club.market = { at: now, buy: {}, sell: {} });
  const dt = Math.max(0, now - (m.at || now));
  if (dt > 60_000) {
    const k = Math.pow(0.5, dt / HALF_LIFE_MS);
    for (const side of ['buy', 'sell']) for (const key of Object.keys(m[side])) { m[side][key] *= k; if (m[side][key] < 0.05) delete m[side][key]; }
    m.at = now;
  }
  return m;
}

/** Demand index per kind from the tally: 1.0 quiet; buying lifts, selling drops, within 0.7..1.5. */
export function demandIndex(kind, s = getState(), now = Date.now()) {
  const m = s.club?.market;
  if (!m) return 1;
  // read through the decay without writing it: the tally is worth half of
  // itself every twelve hours, whether or not anyone trades in between
  const k = Math.pow(0.5, Math.max(0, now - (m.at || now)) / HALF_LIFE_MS);
  const buy = (m.buy?.[kind] || 0) * k;
  const sell = (m.sell?.[kind] || 0) * k;
  return Math.max(0.7, Math.min(1.5, 1 + (buy - sell) * 0.04));
}

/** The market price of a card, in Apex. */
export function price(p, s = getState()) {
  const k = kindOf(p);
  const base = p.value || 0;
  return Math.round(base * (supplyIndex()[k] || 1) * demandIndex(k, s) / 1000) * 1000;
}

/** Record a trade so the market answers to it. `side` is 'buy' or 'sell'. */
export function trade(p, side, n = 1) {
  update((s) => {
    const m = tally(s);
    const k = kindOf(p);
    m[side][k] = (m[side][k] || 0) + n;
  });
}

/** The market at a glance: the ten hottest and ten coldest kinds. */
export function report(s = getState()) {
  const sup = supplyIndex();
  const rows = Object.keys(sup).map((k) => ({ kind: k, supply: sup[k], demand: demandIndex(k, s), index: sup[k] * demandIndex(k, s) }));
  rows.sort((a, b) => b.index - a.index);
  return rows;
}
