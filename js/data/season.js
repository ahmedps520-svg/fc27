/**
 * The Season Pass: thirty tiers, paid for in XP.
 *
 * XP comes from playing — every match, every objective, every daily login —
 * and each tier costs the same 250, so the pass is a long straight road
 * rather than a curve that stalls halfway. The rewards climb, and the three
 * milestone tiers (10, 20, 30) are the reason to keep walking.
 *
 * Which season it is comes from `events.json` (see live.js); the tier list
 * can too, so a season can have its own rewards without a deploy, and this
 * table is the one used when the file does not say.
 */
export const TIER_XP = 250;
export const TIERS = 30;

export const XP = {
  match: 40,          // showing up
  win: 60,            // on top of the match
  goal: 5,            // per goal, capped below
  goalCap: 25,
  objective: 80,      // any ladder objective
  daily: 50,          // the daily login
  eventObjective: 120,
  sbc: 90,
  weekendMatch: 30,   // on top of the match
};

/** The default tier table. `pack` is a pack id, `apex` coins, `ultimate` the premium currency. */
export const DEFAULT_TIERS = Array.from({ length: TIERS }, (_, i) => {
  const t = i + 1;
  if (t === 30) return { ultimate: 6, pack: 'limited', label: 'Season finale' };
  if (t === 20) return { pack: 'prime', apex: 4000, label: 'Milestone' };
  if (t === 10) return { pack: 'gold', apex: 2000, label: 'Milestone' };
  if (t % 5 === 0) return { pack: 'gold' };
  if (t % 3 === 0) return { pack: 'silver' };
  if (t % 7 === 0) return { pack: 'dip' };
  return { apex: 400 + Math.floor(t / 4) * 200 };
});

/** Tier reached for an XP total (0..TIERS). */
export const tierOf = (xp) => Math.min(TIERS, Math.floor((xp || 0) / TIER_XP));

/** Progress inside the current tier, 0..1. */
export const tierProgress = (xp) => (tierOf(xp) >= TIERS ? 1 : ((xp || 0) % TIER_XP) / TIER_XP);

/** A one-line summary of a tier's reward, for the watch and the hub. */
export function rewardText(r) {
  const parts = [];
  if (r.apex) parts.push(`◈ ${r.apex.toLocaleString()}`);
  if (r.ultimate) parts.push(`✦ ${r.ultimate}`);
  if (r.pack) parts.push(`${r.pack} pack`);
  return parts.join(' + ') || '—';
}
