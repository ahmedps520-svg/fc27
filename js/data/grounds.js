/**
 * Grounds: what kind of place each stadium is (v78).
 *
 * `stadiums.js` says how big a ground is and what it looks like from the
 * pitch. This says what *sort* of ground it is, and the things a visitor
 * would learn about it — all derived, deterministically, from the definition
 * and the club that plays there, so nothing here has to be written by hand
 * for 112 grounds and every one of them is the same every visit.
 *
 *  - **class**: community (a single stand and a fence, under 7,000), town
 *    (terraces and floodlight pylons, to 20,000), bowl (a mid-size modern
 *    ground, to 50,000) and arena (the giants). The renderer builds each
 *    differently; the gallery groups by it; a career club's ground moves up
 *    through them as it is expanded.
 *  - **landscape**: what is outside — the city skyline, suburbs, the coast,
 *    mountains or desert — from the club's country when it has one.
 *  - **floodlights**: roof-mounted rings, four corner pylons, or masts down
 *    the side.
 *  - **orientation**: which way the ground faces, so the sun comes from a
 *    different side at different grounds and the stands' shadows fall across
 *    the pitch accordingly.
 *  - **goal**: box, deep or stanchion frames.
 *  - **grass**: blade length and density, and the mowing pattern.
 *  - **history**: the year it opened and its record attendance. Fictional,
 *    like the grounds.
 */
import { hashStr } from './stadiums.js';

export const GROUND_CLASSES = [
  { id: 'community', name: 'Community', blurb: 'A single stand, a rail and a fence.' },
  { id: 'town', name: 'Town', blurb: 'Terraces and floodlight pylons.' },
  { id: 'bowl', name: 'Bowl', blurb: 'A modern mid-size ground.' },
  { id: 'arena', name: 'Arena', blurb: 'The giants.' },
];

/** By capacity, which is what a supporter would go by. */
export function groundClass(def) {
  const cap = def?.capacity || 0;
  if (def?.showpiece || def?.wonder) return 'arena';
  if (cap < 7000) return 'community';
  if (cap < 20000) return 'town';
  if (cap < 50000) return 'bowl';
  return 'arena';
}

/* What is outside the ground, by country. A big club in a country listed as
   'city' gets the skyline; a small one there gets the suburbs. */
const REGION = {
  desert: ['Saudi Arabia', 'Qatar', 'United Arab Emirates', 'Iraq', 'Egypt', 'Algeria', 'Tunisia', 'Morocco', 'Iran'],
  coast: ['Portugal', 'Brazil', 'Australia', 'Greece', 'Croatia', 'Uruguay', 'Ireland', 'Wales', 'Denmark', 'Ghana', 'Ivory Coast', 'Senegal', 'Nigeria', 'Cameroon'],
  mountains: ['Switzerland', 'Austria', 'Chile', 'Colombia', 'Ecuador', 'Peru', 'Norway', 'Scotland', 'Serbia', 'Slovakia', 'Czech Republic', 'Paraguay'],
};
const LANDSCAPES = ['city', 'suburbs', 'coast', 'mountains', 'desert'];

export function landscapeFor(def, club) {
  if (def?.landscape) return def.landscape;                      // the builder chose
  const klass = groundClass(def);
  const country = club?.country;
  if (country) {
    for (const [k, list] of Object.entries(REGION)) if (list.includes(country)) return k;
    return klass === 'arena' || klass === 'bowl' ? 'city' : 'suburbs';
  }
  // a world club with no country: mostly towns and cities, the odd coast or hills
  const h = hashStr(`land|${def?.id || def?.name || ''}`) % 20;
  if (klass === 'arena') return h < 15 ? 'city' : h < 18 ? 'coast' : 'mountains';
  return h < 9 ? 'suburbs' : h < 14 ? 'city' : h < 17 ? 'coast' : h < 19 ? 'mountains' : 'desert';
}

/** Which floodlight rig: `rim` roof ring, `lattice` four corner pylons, `side` masts down the touchlines, `mast` short roof masts. */
export function floodlightsFor(def) {
  if (def?.pylons === 'rim') return 'rim';
  const klass = groundClass(def);
  if (klass === 'community') return 'side';
  if (klass === 'town') return hashStr(`fl|${def?.id}`) % 3 === 0 ? 'side' : 'lattice';
  return def?.pylons || 'mast';
}

export const GOAL_STYLES = ['box', 'deep', 'stanchion'];
export function goalStyleFor(def) {
  if (def?.goalStyle) return def.goalStyle;
  const klass = groundClass(def);
  const h = hashStr(`goal|${def?.id || def?.name}`) % 10;
  if (klass === 'community') return h < 7 ? 'box' : 'stanchion';
  if (klass === 'town') return h < 5 ? 'stanchion' : h < 8 ? 'box' : 'deep';
  return h < 6 ? 'deep' : h < 9 ? 'box' : 'stanchion';
}

/** Mowing patterns a club can choose from. Every pattern the pitch painter knows. */
export const MOW_PATTERNS = ['stripes', 'checks', 'diagonal', 'rings', 'plain'];
export function mowFor(def, club) {
  if (!club) return def?.pattern || 'stripes';
  // a club mows its own way, whatever ground it was dealt
  return MOW_PATTERNS[hashStr(`mow|${club.id || club.name}`) % 4];      // never 'plain' for a club's own
}

/** Blade length (1 = a televised pitch) and density, by class: longer and thinner lower down. */
export function grassFor(def) {
  const klass = groundClass(def);
  const h = (hashStr(`grass|${def?.id}`) % 100) / 100;
  if (klass === 'community') return { length: 1.35 + h * 0.3, density: 0.7 + h * 0.15, lineFade: 0.35 + h * 0.2 };
  if (klass === 'town') return { length: 1.15 + h * 0.2, density: 0.85 + h * 0.1, lineFade: 0.18 + h * 0.15 };
  if (klass === 'bowl') return { length: 1.0 + h * 0.1, density: 0.95, lineFade: 0.06 + h * 0.08 };
  return { length: 0.92 + h * 0.08, density: 1, lineFade: 0.02 + h * 0.04 };
}

/** Degrees the ground is turned from due north; the sun comes round accordingly. */
export function orientationOf(def) {
  return hashStr(`orient|${def?.id || def?.name}`) % 360;
}

/** The ground's history — invented, like the ground. */
export function historyOf(def) {
  const h = hashStr(`hist|${def?.id || def?.name}`);
  const klass = groundClass(def);
  // the old small grounds are the oldest; the arenas were mostly built this century
  const span = { community: [1880, 1965], town: [1889, 1990], bowl: [1920, 2012], arena: [1990, 2021] }[klass];
  const opened = span[0] + (h % (span[1] - span[0] + 1));
  const cap = def?.capacity || 10000;
  // older grounds held more on the terraces than they seat now
  const terraceBonus = opened < 1970 ? 1.2 + ((h >>> 8) % 60) / 100 : 1 + ((h >>> 8) % 6) / 100;
  const record = Math.round((cap * terraceBonus) / 50) * 50;
  const recordYear = Math.min(2025, Math.max(opened + 1, (opened < 1970 ? 1948 : opened + 2) + ((h >>> 16) % 25)));
  return { opened, record, recordYear };
}

/** Everything the renderer and the gallery want, in one call. */
export function groundProfile(def, club = null) {
  return {
    klass: groundClass(def),
    landscape: landscapeFor(def, club),
    floodlights: floodlightsFor(def),
    goalStyle: goalStyleFor(def),
    grass: grassFor(def),
    orientation: orientationOf(def),
    pattern: mowFor(def, club),
    ...historyOf(def),
  };
}

export { LANDSCAPES };
