/**
 * Evolving a card.
 *
 * Five levels, each +1 overall and +1% on every stat (see data/chemistry.js
 * for how that reaches the pitch). The price is either a duplicate of the
 * same card — the second copy a pack hands you is banked as material now,
 * on top of the coins it always paid — or Apex, at a price that climbs with
 * the level and the rating so a 90 costs more to push than a 70.
 *
 * The cap is the cap: a 99 stays 99, and level five is the last level.
 */
import { getState, update } from './state.js';
import { getPlayer } from './data/generator.js';
import { levelOf } from './data/chemistry.js';
import { onEvolve } from './progress.js';

export const EVOLVE_MAX = 5;

/** Apex price of the next level for a card. */
export function apexCost(p, level) {
  const base = 600 + Math.max(0, p.overall - 60) * 90;      // 600 at 60, 3,300 at 90
  return Math.round(base * (1 + level * 0.6) / 50) * 50;
}

export function evolveInfo(id) {
  const p = getPlayer(id);
  const s = getState();
  const level = levelOf(s.club, id);
  const dupes = s.club.dupes?.[id] | 0;
  const capped = level >= EVOLVE_MAX || p.overall + level >= 99;
  return { p, level, dupes, capped, cost: capped ? 0 : apexCost(p, level), max: EVOLVE_MAX };
}

/**
 * Raise a card one level. `pay` is 'dupe' or 'apex'.
 * @returns {{ ok: boolean, level?: number, why?: string }}
 */
export function evolve(id, pay) {
  const info = evolveInfo(id);
  if (info.capped) return { ok: false, why: 'This card is at its final level.' };
  const s = getState();
  if (!s.club.collection.includes(id)) return { ok: false, why: 'You do not own this card.' };
  if (pay === 'dupe' && info.dupes < 1) return { ok: false, why: 'No duplicate banked for this card.' };
  if (pay === 'apex' && (s.club.apex || 0) < info.cost) return { ok: false, why: 'Not enough Apex.' };
  update((st) => {
    if (!st.club.upgrades) st.club.upgrades = {};
    if (pay === 'dupe') st.club.dupes[id] -= 1; else st.club.apex -= info.cost;
    st.club.upgrades[id] = info.level + 1;
  });
  onEvolve(info.level + 1, EVOLVE_MAX);
  return { ok: true, level: info.level + 1 };
}
