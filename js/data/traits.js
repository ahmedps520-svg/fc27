/**
 * Signature traits (v79).
 *
 * A trait is a small, named thing a player does better than his numbers say
 * — and it has to be *visible in the match*, or it is just a badge. Each one
 * below names the exact behaviour it changes in `game/sim.js` (the sim reads
 * `p.traits` through `hasTrait`). The elite tier ("+") is the same trait,
 * stronger, for the players whose numbers are genuinely exceptional.
 *
 * Traits are dealt from the card itself, deterministically — a player always
 * has the same traits — from his position and his best attributes, up to
 * three per player. All names are original.
 */
import { WORLD } from './generator.js';

export const TRAITS = {
  finesse:  { name: 'Finesse Finisher', short: 'FIN', blurb: 'Curled shots bend more and find the corner more often.' },
  engine:   { name: 'Engine', short: 'ENG', blurb: 'Tires far more slowly and keeps sprinting late on.' },
  rock:     { name: 'Rock at the Back', short: 'RCK', blurb: 'Wins more tackles, gives away fewer fouls and holds his ground in a shoulder duel.' },
  quick:    { name: 'Quick Step', short: 'QST', blurb: 'Explosive over the first few metres and turns sharper at speed.' },
  sweeper:  { name: 'Sweeper Keeper', short: 'SWK', blurb: 'Comes off his line to clear through balls and dives further.' },
  pinged:   { name: 'Pinged Pass', short: 'PNG', blurb: 'Long passes and switches arrive quicker and truer.' },
  aerial:   { name: 'Aerial Threat', short: 'AER', blurb: 'Times his jump for headers and wins more of them.' },
  trickster:{ name: 'Trickster', short: 'TRK', blurb: 'Skill moves come off more often and unlock the harder ones.' },
  anchor:   { name: 'Anchor', short: 'ANC', blurb: 'Reads play: intercepts passes into the space in front of the defence.' },
  cannon:   { name: 'Cannon', short: 'CAN', blurb: 'Hits the ball harder from distance, with the odd knuckling strike.' },
  velvet:   { name: 'Velvet Touch', short: 'VEL', blurb: 'Kills a fast pass dead — almost never a heavy first touch.' },
  deadball: { name: 'Dead Ball', short: 'DBL', blurb: 'Free kicks and corners curl and dip on to the target.' },
};

/** A player's traits: [{ id, elite }], most characteristic first. */
export function traitsOf(ref) {
  if (!ref) return [];
  if (ref._traits) return ref._traits;
  // v80: an evolution can teach a trait — it goes first, and never twice
  if (ref.extraTraits?.length) {
    const base = traitsOf({ ...ref, extraTraits: null });
    const extra = ref.extraTraits.filter((id) => TRAITS[id] && !base.some((t) => t.id === id)).map((id) => ({ id, elite: false }));
    const res = [...extra, ...base].slice(0, 4);
    try { Object.defineProperty(ref, '_traits', { value: res, enumerable: false, configurable: true }); } catch { /* frozen */ }
    return res;
  }
  const s = ref.stats || {};
  const pos = ref.position || 'CM';
  const ovr = ref.overall || 60;
  const out = [];
  const add = (id, score, eliteAt) => out.push({ id, score, elite: score >= eliteAt });
  if (pos === 'GK') {
    add('sweeper', (s.pace || 50) + (s.passing || 50) * 0.6, 150);
    if ((s.passing || 0) > 75) add('pinged', s.passing + 20, 108);
  } else {
    const def = ['CB', 'LB', 'RB', 'CDM'].includes(pos);
    const att = ['ST', 'LW', 'RW', 'CAM'].includes(pos);
    if (att && s.shooting >= 78) add('finesse', s.shooting + s.dribbling * 0.3, 118);
    if (s.shooting >= 82 && s.physical >= 74) add('cannon', s.shooting * 0.6 + s.physical * 0.6, 106);
    if (s.physical >= 80 && s.pace >= 70 && !att) add('engine', s.physical + s.pace * 0.3, 118);
    if (def && s.defending >= 80) add('rock', s.defending + s.physical * 0.3, 118);
    if (s.pace >= 86) add('quick', s.pace + s.dribbling * 0.2, 112);
    if (s.passing >= 82) add('pinged', s.passing + s.dribbling * 0.1, 99);
    if (s.physical >= 80 && (pos === 'ST' || pos === 'CB')) add('aerial', s.physical + (pos === 'ST' ? s.shooting : s.defending) * 0.3, 115);
    if (s.dribbling >= 84) add('trickster', s.dribbling + s.pace * 0.2, 112);
    if (pos === 'CDM' && s.defending >= 74) add('anchor', s.defending + s.passing * 0.3, 112);
    if (s.dribbling >= 80 && s.passing >= 78) add('velvet', s.dribbling * 0.6 + s.passing * 0.6, 106);
    if (s.passing >= 80 && s.shooting >= 76 && ['CM', 'CAM', 'LW', 'RW', 'LM', 'RM'].includes(pos)) add('deadball', s.passing * 0.5 + s.shooting * 0.6, 104);
  }
  // an elite trait needs an elite card too
  for (const t of out) if (ovr < 86) t.elite = false;
  const res = out.sort((a, b) => b.score - a.score).slice(0, ovr >= 84 ? 3 : ovr >= 76 ? 2 : 1).map(({ id, elite }) => ({ id, elite }));
  try { Object.defineProperty(ref, '_traits', { value: res, enumerable: false, configurable: true }); } catch { /* frozen */ }
  return res;
}

/** How strongly a player has a trait: 0 none, 1 the trait, 1.6 elite. */
export function traitLevel(ref, id) {
  const t = traitsOf(ref).find((x) => x.id === id);
  return t ? (t.elite ? 1.6 : 1) : 0;
}

/** A player's skill-move stars, 1–5, from dribbling (and Trickster). */
export function skillStars(ref) {
  if (!ref || ref.position === 'GK') return 1;
  const d = ref.stats?.dribbling || 50;
  let st = d >= 88 ? 5 : d >= 82 ? 4 : d >= 74 ? 3 : d >= 64 ? 2 : 1;
  if (traitLevel(ref, 'trickster') && st < 5) st += 1;
  return st;
}

export function traitHTML(ref, { max = 3 } = {}) {
  return traitsOf(ref).slice(0, max).map((t) => `<span class="trait ${t.elite ? 'elite' : ''}" title="${TRAITS[t.id].blurb}">${TRAITS[t.id].name}${t.elite ? '+' : ''}</span>`).join('');
}

/** For tests and the squad screen: how many of the world's players carry each trait. */
export function traitCensus() {
  const c = {};
  for (const p of WORLD.players) for (const t of traitsOf(p)) c[t.id] = (c[t.id] || 0) + 1;
  return c;
}
