/**
 * What the match *is*, for the broadcast (v83): the derby, the weather, the
 * form of the men on the pitch, and what a goal or a final score means.
 *
 * Pure functions of the match and a few facts handed in, so the unit suite can
 * ask "is this a hat-trick?" without a browser. The play screen turns the
 * keys these return into lines (data/commentaryVoices.js CONTEXT).
 */

/* ------------------------------- derbies ------------------------------- *
 * The world is generated, so rivalries are too: inside each league the clubs
 * are sorted by id and paired off, 0 with 1, 2 with 3. Every club has exactly
 * one derby rival, it never changes, and the fixture is named after the two
 * clubs' first words — "the Ironvale–Solaris derby". */
const pairs = new Map();
function buildPairs(clubs) {
  if (pairs.size) return;
  const byLeague = new Map();
  for (const c of clubs) { if (!byLeague.has(c.league)) byLeague.set(c.league, []); byLeague.get(c.league).push(c); }
  for (const list of byLeague.values()) {
    list.sort((a, b) => (a.id < b.id ? -1 : 1));
    for (let i = 0; i + 1 < list.length; i += 2) { pairs.set(list[i].id, list[i + 1].id); pairs.set(list[i + 1].id, list[i].id); }
  }
}
const first = (name) => String(name || '').split(/\s+/)[0];
/** The derby's name when these two clubs are rivals, else null. */
export function derbyOf(home, away, clubs) {
  if (!home || !away) return null;
  buildPairs(clubs || []);
  if (pairs.get(home.id) !== away.id) return null;
  return `the ${first(home.name)}–${first(away.name)} derby`;
}

/** The pre-match weather key for the CONTEXT bank. */
export function weatherKey(atmo = {}) {
  if (atmo.weather === 'rain') return 'weatherRain';
  if (atmo.weather === 'snow') return 'weatherSnow';
  if (atmo.weather === 'overcast') return 'weatherOvercast';
  return atmo.time === 'night' ? 'night' : 'weatherClear';
}

/**
 * Form, by card id: 'hot' | 'cold'. From a Manager Career's recent ratings
 * (three or more), and from the week's In-Form list (hot).
 */
export function formMap({ career = null, inForm = [] } = {}) {
  const out = new Map();
  for (const id of inForm) out.set(id, 'hot');
  const pl = career?.pl || {};
  const byName = new Map();
  for (const [name, row] of Object.entries(pl)) {
    const r = row?.ratings || [];
    if (r.length < 3) continue;
    const avg = r.reduce((a, b) => a + b, 0) / r.length;
    if (avg >= 7.3) byName.set(name, 'hot'); else if (avg <= 6.1) byName.set(name, 'cold');
  }
  out.byName = byName;
  return out;
}
export const formOf = (map, ref) => (ref ? map.get(ref.id) || map.byName?.get(ref.name) || null : null);

/**
 * A goal has just gone in. Returns the context keys it earns, strongest first:
 * hatTrick / brace, lateWinner / lateEqualiser, opener, derbyGoal.
 *   scorerGoals  the scorer's goals today, this one included
 *   minute       the displayed minute
 *   score        [home, away] after the goal; team = the scoring side
 */
export function goalKeys({ scorerGoals = 1, minute = 0, score = [0, 0], team = 0, derby = null, own = false }) {
  const keys = [];
  if (!own && scorerGoals === 3) keys.push('hatTrick');
  else if (!own && scorerGoals === 2) keys.push('brace');
  const mine = score[team]; const theirs = score[1 - team];
  if (minute >= 85 && mine === theirs + 1) keys.push('lateWinner');
  else if (minute >= 85 && mine === theirs) keys.push('lateEqualiser');
  if (score[0] + score[1] === 1) keys.push('opener');
  if (derby) keys.push('derbyGoal');
  return keys;
}

/**
 * Full time. `trail` is the most each side trailed by at any point; `ratings`
 * the two sides' strengths. Returns keys for the CONTEXT bank.
 */
export function fullTimeKeys({ score = [0, 0], trail = [0, 0], ratings = [70, 70], final = false, record = false }) {
  const [h, a] = score;
  const keys = [];
  const w = h > a ? 0 : a > h ? 1 : -1;
  if (final && w >= 0) keys.push('finalWin');
  if (record) keys.push('record');
  if (w >= 0 && trail[w] > 0) keys.push('comebackWin');
  if (w >= 0 && ratings[w] + 5 <= ratings[1 - w]) keys.push('upset');
  if (Math.abs(h - a) >= 3) keys.push('bigWin');
  if (h + a >= 5) keys.push('goalfest');
  if (w >= 0 && score[1 - w] === 0) keys.push('cleanSheet');
  return keys;
}

/**
 * Stoppage time for a half, in minutes: one for the half, and more for what
 * stopped it — goals, cards, substitutions, injuries and the dead-ball count.
 */
export function addedMinutes({ goals = 0, cards = 0, subs = 0, injuries = 0, stoppages = 0 }) {
  const m = 1 + goals * 0.5 + cards * 0.25 + subs * 0.3 + injuries * 0.8 + stoppages / 14;
  return Math.max(1, Math.min(6, Math.round(m)));
}

/**
 * The broadcast clock. The simulation's half is a fixed length; the board
 * goes up at 43 of the displayed minutes and the rest of the half is shown as
 * 43 → 45 + added, so the clock and the board always agree and the whistle
 * goes on the last added minute. `frac` is how far through the half (0–1).
 */
export const BOARD_AT = 43 / 45;
export function broadcastMinute(half, frac, added = 0) {
  const base = half === 2 ? 45 : 0;
  if (frac < BOARD_AT || !added) return { minute: base + Math.min(45, Math.floor(frac * 45)), plus: 0 };
  const into = (frac - BOARD_AT) / (1 - BOARD_AT) * (2 + added);   // 0 → 2 + added
  const m = 43 + into;
  if (m < 45) return { minute: base + Math.floor(m), plus: 0 };
  return { minute: base + 45, plus: Math.min(added, Math.floor(m - 45) + 1) };
}
export const clockLabel = ({ minute, plus }) => (plus ? `${minute}+${plus}'` : `${minute}'`);

/**
 * Offside margin: how far the attacker is beyond the second-last defender, in
 * metres, along the attacking direction (positive = offside). Used to decide
 * whether an offside is close enough to review on screen.
 */
export function offsideMargin(attacker, defenders, dir) {
  const xs = defenders.map((d) => d.x * dir).sort((a, b) => b - a);
  const second = xs[1] ?? xs[0] ?? 0;
  return attacker.x * dir - second;
}
