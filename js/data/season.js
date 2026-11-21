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

/**
 * v205: the Season Pass's paid track — a second reward on every tier for a
 * player who bought the pass for this season (an App Store purchase, iap.js).
 * The tiers are still earned by playing; the pass only adds to what each one
 * pays. About 100 ✦, six Prime packs, a Legends Vault (one Icon) at tier 30,
 * and the pass's own celebration at tier 1, so it is yours the moment you buy.
 * `celebration` unlocks; it is not a balance.
 */
export const PREMIUM_TIERS = Array.from({ length: TIERS }, (_, i) => {
  const t = i + 1;
  if (t === 1) return { celebration: 'crown', label: 'The Crown' };
  if (t === 30) return { pack: 'vault', label: 'Legends Vault' };
  if (t % 5 === 0 || t === 28) return { pack: 'prime' };
  return { ultimate: t % 4 === 0 ? 7 : 4 };
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
  if (r.celebration) parts.push(r.label || 'celebration');
  return parts.join(' + ') || '—';
}
