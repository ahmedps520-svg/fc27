/**
 * v138: original colours and badges for the real clubs.
 *
 * Manager Career, Kick Off by country and the Custom Cup name real clubs.
 * Until now they also wore those clubs' real colours, on a badge that was the
 * same plain star for every one of them. The names stay; the look is the
 * game's own:
 *
 * - **Colours** come from a palette of two-colour pairs that are deliberately
 *   not any famous club's (no red-and-white, no sky-and-navy, no black-and-white
 *   stripes). Each club gets a pair whose main hue sits at least 60° round the
 *   colour wheel from its real colours, so nobody's kit reads as the original.
 *   Clubs in the same league are dealt different pairs where the palette
 *   allows, so a league table is not four teal teams.
 * - **Badges** get their own shape, field pattern and device from the crest
 *   generator (components/crest.js), picked from the club's name.
 *
 * Deterministic: the same name always comes out the same, on every device and
 * in every mode, so a club looks alike in a career and in a Kick Off.
 */

/** Two-colour pairs: [main, second]. Chosen to be unlike any famous club's colours. */
export const PALETTE = [
  ['#0f7c7a', '#ff8a5b'], ['#5b2a86', '#f2c14e'], ['#1f5e3b', '#f1e4c3'], ['#d9622b', '#16213e'],
  ['#2bb3a3', '#1b1b1f'], ['#8c2f39', '#f4d58d'], ['#2445a8', '#c7f464'], ['#e4572e', '#29335c'],
  ['#3a506b', '#f7b267'], ['#11998e', '#f0f3bd'], ['#ffb627', '#3d315b'], ['#4b3f72', '#c5d86d'],
  ['#b23a48', '#fcb9b2'], ['#2d6a4f', '#ffd166'], ['#0081a7', '#fed9b7'], ['#7b2cbf', '#e0aaff'],
  ['#ef476f', '#073b4c'], ['#06d6a0', '#3c1642'], ['#f3722c', '#277da1'], ['#577590', '#f9c74f'],
  ['#9d4edd', '#ffd60a'], ['#264653', '#e9c46a'], ['#e76f51', '#2a9d8f'], ['#fb5607', '#1a1a2e'],
  ['#8338ec', '#06d6a0'], ['#3d5a80', '#ee6c4d'], ['#a4133c', '#ffccd5'], ['#344e41', '#dad7cd'],
  ['#5f0f40', '#fb8b24'], ['#0b525b', '#e3d5ca'], ['#9a031e', '#0f4c5c'], ['#6a4c93', '#8ac926'],
  ['#ff595e', '#1a535c'], ['#2ec4b6', '#ff9f1c'], ['#bc6c25', '#283618'], ['#48cae4', '#6a040f'],
];

const SHAPES = ['shield', 'heater', 'roundel', 'hex', 'chevron', 'shield', 'heater', 'roundel'];
const PATTERNS = ['solid', 'stripes', 'halves', 'hoops', 'sash', 'quarters', 'chevrons', 'solid'];
const DEVICES = ['star', 'anchor', 'bolt', 'tree', 'cog', 'tower', 'wave', 'peak', 'bird', 'sun', 'leaf', 'battlement'];

/** A name as the same club, whichever table spells it: case, accents and "FC"/"AC" dropped. */
export function clubKey(name) {
  return String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\bmunchen\b/g, 'munich')
    .replace(/\b(fc|cf|ac|afc|sc|ssc|as|cd|sl)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Hue in degrees, or null for a colour too grey to have one (white, black, greys). */
export function hueOf(hex) {
  const h = String(hex || '').replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16) / 255; const g = parseInt(n.slice(2, 4), 16) / 255; const b = parseInt(n.slice(4, 6), 16) / 255;
  if (![r, g, b].every(Number.isFinite)) return null;
  const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const d = mx - mn;
  if (d < 0.18 || mx < 0.15) return null;
  let hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}
const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** Is this pair far enough from the club's real colours? */
export function farFromReal(pair, real = []) {
  const realHues = real.map(hueOf).filter((h) => h != null);
  const [m, s] = pair.map(hueOf);
  return realHues.every((rh) => (m == null || hueGap(m, rh) >= 60) && (s == null || hueGap(s, rh) >= 35));
}

const cache = new Map();
const byLeague = new Map();       // league → palette indices already dealt there

/**
 * The look of a real club: { colors, shape, pattern, device }. `club` needs a
 * name; its real `colors` (if any) are only used to stay away from them, and
 * its `league` to keep neighbours apart.
 */
export function clubLook(club) {
  const key = clubKey(club.name);
  if (cache.has(key)) return cache.get(key);
  const h = hash(key);
  const real = club.realColors || club.colors || [];
  const used = byLeague.get(club.league) || new Set();
  let pick = -1;
  // the first palette pair, in this club's own order, that is far from its real colours and free in its league;
  // failing that, far from its real colours; failing that (never, with this palette), its first choice
  for (const needFree of [true, false]) {
    for (let i = 0; i < PALETTE.length && pick < 0; i++) {
      const j = (h + i * 7) % PALETTE.length;
      if (needFree && used.has(j)) continue;
      if (farFromReal(PALETTE[j], real)) pick = j;
    }
    if (pick >= 0) break;
  }
  if (pick < 0) pick = h % PALETTE.length;
  used.add(pick);
  if (club.league) byLeague.set(club.league, used);
  const look = {
    colors: PALETTE[pick].slice(),
    shape: SHAPES[(h >>> 5) % SHAPES.length],
    pattern: PATTERNS[(h >>> 9) % PATTERNS.length],
    device: DEVICES[(h >>> 13) % DEVICES.length],
  };
  cache.set(key, look);
  return look;
}

/** Give a list of real clubs their look in place (colors, shape, pattern, device); keeps the real pair as `realColors`. */
export function applyLooks(clubs) {
  // dealt in a fixed order so the same league always shares out the palette the same way
  const order = clubs.slice().sort((a, b) => clubKey(a.name).localeCompare(clubKey(b.name)));
  for (const c of order) {
    if (!c.realColors) c.realColors = c.colors;
    Object.assign(c, clubLook(c));
  }
  return clubs;
}

/** The crest object crestSVG wants, for a club that has had its look applied. */
export const lookCrest = (c) => ({ shape: c.shape || 'shield', pattern: c.pattern || 'solid', device: c.device || 'star', colors: c.colors });
