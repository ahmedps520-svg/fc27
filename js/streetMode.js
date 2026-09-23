/**
 * Street (v82): the tour, the crews, your baller and what they wear.
 *
 *  - **Your baller**: a created player (name, number, look) who plays in your
 *    crew. Street XP raises his six attributes; street rep unlocks cosmetics.
 *  - **Your crew**: your baller plus the regulars you start with, and one
 *    player recruited from every boss you beat.
 *  - **The tour**: six stops, one per venue, three games each — two crews and
 *    a boss. A stop is won when all three are; stars (1–3) come from the win
 *    and the style points you scored on the way.
 *  - **Style**: skills, balls off the wall, and a goal on the end of a chain
 *    (the sim counts it: `Match.styleOf`).
 *  - **Cosmetics**: kits, boots, balls and a celebration — earned by playing,
 *    never bought.
 */
import { getState, update } from './state.js';
import { WORLD, getPlayer } from './data/generator.js';
import { STREET_VENUES, streetVenue } from './data/street.js';

export const COSMETICS = [
  { id: 'kit-plain', kind: 'kit', name: 'Plain tee', colors: ['#e9ecef', '#212529'], rep: 0 },
  { id: 'kit-sunset', kind: 'kit', name: 'Sunset fade', colors: ['#ff7a1a', '#7b2cbf'], rep: 150 },
  { id: 'kit-palm', kind: 'kit', name: 'Palm print', colors: ['#2a9d8f', '#e9c46a'], rep: 400 },
  { id: 'kit-grid', kind: 'kit', name: 'Night grid', colors: ['#111827', '#19e3ff'], rep: 800 },
  { id: 'kit-sand', kind: 'kit', name: 'Sandstorm', colors: ['#d4a373', '#3d2b1f'], boss: 'st-dune' },
  { id: 'kit-neon', kind: 'kit', name: 'Hall of Neon', colors: ['#ff3fa4', '#12121a'], boss: 'st-neon' },
  { id: 'boots-white', kind: 'boots', name: 'Classic white', color: '#f8f9fa', rep: 0 },
  { id: 'boots-volt', kind: 'boots', name: 'Volt', color: '#c6ff00', rep: 250 },
  { id: 'boots-ember', kind: 'boots', name: 'Ember', color: '#ff5c38', rep: 600 },
  { id: 'boots-gold', kind: 'boots', name: 'Rooftop gold', color: '#ffd166', boss: 'st-rooftop' },
  { id: 'ball-classic', kind: 'ball', name: 'Street classic', rep: 0 },
  { id: 'ball-tape', kind: 'ball', name: 'Taped-up', rep: 300 },
  { id: 'ball-wave', kind: 'ball', name: 'Harbour wave', boss: 'st-harbour' },
  { id: 'cel-slide', kind: 'celebration', name: 'Knee slide', rep: 0 },
  { id: 'cel-bow', kind: 'celebration', name: 'The bow', rep: 500 },
  { id: 'cel-phone', kind: 'celebration', name: 'Call me', boss: 'st-underpass' },
  { id: 'cel-sand', kind: 'celebration', name: 'Sand angel', boss: 'st-beach' },
];

const CREW_NAMES = [
  ['Rooftop Rebels', 'Skyline Kings'], ['Dune Runners', 'Mirage FC'], ['Dockside Five', 'Tidebreakers'],
  ['Night Shift', 'Voltage'], ['Concrete Crew', 'Overpass Owls'], ['Sandbar Social', 'Corniche Crew'],
];
const BOSSES = ['The Architect', 'Sultan of Sand', 'Harbour Master', 'Neon Queen', 'The Tunnel', 'King of the Beach'];

function h32(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }

export function streetState(s = getState()) {
  return s.street || null;
}
export function ensureStreet(s) {
  if (s.street) return s.street;
  // four regulars to start: honest 70s from the world, the same for everyone
  const pool = WORLD.players.filter((p) => !p.sbc && p.overall >= 69 && p.overall <= 74 && p.position !== 'GK').sort((a, b) => (a.id < b.id ? -1 : 1));
  const gk = WORLD.players.filter((p) => !p.sbc && p.position === 'GK' && p.overall >= 68 && p.overall <= 74).sort((a, b) => (a.id < b.id ? -1 : 1))[3];
  s.street = {
    baller: null, xp: 0, rep: 0,
    crew: [gk?.id, ...[0, 7, 13, 21].map((i) => pool[i]?.id)].filter(Boolean),
    owned: COSMETICS.filter((c) => c.rep === 0).map((c) => c.id),
    equipped: { kit: 'kit-plain', boots: 'boots-white', ball: 'ball-classic', celebration: 'cel-slide' },
    tour: {}, played: 0, won: 0, stylePoints: 0, best: 0,
  };
  return s.street;
}

/* ------------------------------ your baller ------------------------------ */
export const LEVEL_XP = 300;
export const ballerLevel = (xp) => 1 + Math.floor((xp || 0) / LEVEL_XP);
export function createBaller({ name, number = 10, look = {}, position = 'CAM', nation = 'Saudi Arabia' }) {
  update((s) => { const st = ensureStreet(s); st.baller = { name: name.slice(0, 20), number: Math.max(1, Math.min(99, number | 0)), look, position, nation }; });
}
/** Your baller as a card the sim can field: 70 at level 1, +1 a level to 92. */
export function ballerCard(st = streetState()) {
  if (!st?.baller) return null;
  const lvl = ballerLevel(st.xp);
  const o = Math.min(92, 69 + lvl);
  const b = st.baller;
  const bias = { pace: 2, shooting: 0, passing: 0, dribbling: 5, defending: -14, physical: -4 };
  const stats = Object.fromEntries(Object.entries(bias).map(([k, v]) => [k, Math.max(30, Math.min(99, o + v))]));
  return { id: 'street-baller', name: b.name, short: b.name.split(' ').pop(), position: b.position || 'CAM', overall: o, stats, foot: 'R', rarity: 'gold', nation: b.nation || 'Saudi Arabia', look: b.look, stars: Math.min(5, 2 + Math.floor(lvl / 4)), number: b.number };
}

/* ------------------------------ crews ------------------------------ */
/** Your crew for a format: the baller always plays; the best of the rest fill the places. */
export function myCrew(n, st = streetState()) {
  const cards = st.crew.map(getPlayer).filter(Boolean);
  const gk = cards.filter((p) => p.position === 'GK').sort((a, b) => b.overall - a.overall)[0];
  const out = cards.filter((p) => p !== gk).sort((a, b) => b.overall - a.overall);
  const me = ballerCard(st);
  const xi = [gk, me, ...out].filter(Boolean).slice(0, n);
  const kit = COSMETICS.find((c) => c.id === st.equipped.kit) || COSMETICS[0];
  return { xi, bench: [], name: st.baller ? `${st.baller.name}'s crew` : 'Your crew', short: 'YOU', colors: kit.colors, crest: { shape: 'circle', pattern: 'halves', device: 'star', colors: kit.colors } };
}

/** An opponent crew for a tour game (0, 1 = crews, 2 = the boss), built near a target rating. */
export function tourCrew(stopIdx, game, n) {
  const v = STREET_VENUES[stopIdx];
  const boss = game === 2;
  const target = 68 + stopIdx * 3 + game * 2 + (boss ? 3 : 0);
  const seed = h32(`${v.id}|${game}`);
  const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon' && Math.abs(p.overall - target) <= 3);
  const pick = (test, k) => pool.filter(test).sort((a, b) => (h32(`${seed}|${a.id}`) - h32(`${seed}|${b.id}`))).slice(0, k);
  const xi = [...pick((p) => p.position === 'GK', 1), ...pick((p) => p.position !== 'GK', n - 1)];
  const name = boss ? BOSSES[stopIdx] : CREW_NAMES[stopIdx][game];
  const colors = boss ? ['#ffd166', '#111111'] : [['#e63946', '#1d3557'], ['#2a9d8f', '#264653']][game];
  return { xi, bench: [], name, short: name.replace(/^The /, '').slice(0, 3).toUpperCase(), colors, crest: { shape: boss ? 'shield' : 'circle', pattern: 'solid', device: boss ? 'crown' : 'star', colors }, rating: target, boss };
}

/** The whole tour, with progress. */
export function tourView(st = streetState()) {
  return STREET_VENUES.map((v, i) => {
    const res = st?.tour?.[v.id] || {};
    const games = [0, 1, 2].map((g) => res[g] || null);
    const unlocked = i === 0 || STREET_VENUES.slice(0, i).every((pv) => [0, 1, 2].every((g) => st?.tour?.[pv.id]?.[g]?.won));
    return { venue: v, games, unlocked, done: games.every((g) => g?.won), stars: games.reduce((t, g) => t + (g?.stars || 0), 0) };
  });
}

export const STAR_STYLE = [0, 350, 800];
/** After a street match: stars, XP, rep, unlocks, recruits. */
export function settleStreet({ venueId, game = null, scored, conceded, style }) {
  const won = scored > conceded;
  const stars = won ? 1 + (style >= STAR_STYLE[1] ? 1 : 0) + (style >= STAR_STYLE[2] ? 1 : 0) : 0;
  const xp = Math.round(style / 6) + (won ? 60 : 20) + scored * 10;
  const out = { won, stars, xp, rep: Math.round(xp / 2), unlocked: [], recruit: null, apex: (won ? 500 : 150) + stars * 150 };
  update((s) => {
    const st = ensureStreet(s);
    st.played += 1; if (won) st.won += 1;
    st.xp += xp; st.rep += out.rep; st.stylePoints += style; st.best = Math.max(st.best, style);
    s.club.apex += out.apex;
    if (game != null) {
      const t = st.tour[venueId] || (st.tour[venueId] = {});
      const prev = t[game];
      if (!prev || stars > prev.stars || (won && !prev.won)) t[game] = { won: won || !!prev?.won, stars: Math.max(stars, prev?.stars || 0), score: [scored, conceded], style };
      // a beaten boss joins the crew (his best player), and leaves a cosmetic behind
      if (game === 2 && won && !prev?.won) {
        const idx = STREET_VENUES.findIndex((v) => v.id === venueId);
        const boss = tourCrew(idx, 2, 5);
        const best = boss.xi.filter((p) => p.position !== 'GK').sort((a, b) => b.overall - a.overall)[0];
        if (best && !st.crew.includes(best.id)) { st.crew.push(best.id); out.recruit = best.name; }
        for (const c of COSMETICS.filter((x) => x.boss === venueId)) if (!st.owned.includes(c.id)) { st.owned.push(c.id); out.unlocked.push(c.name); }
      }
    }
    for (const c of COSMETICS.filter((x) => x.rep != null && x.rep <= st.rep)) if (!st.owned.includes(c.id)) { st.owned.push(c.id); out.unlocked.push(c.name); }
  });
  return out;
}

export function equip(id) {
  const c = COSMETICS.find((x) => x.id === id);
  update((s) => { const st = ensureStreet(s); if (c && st.owned.includes(id)) st.equipped[c.kind] = id; });
}

export { STREET_VENUES, streetVenue };
