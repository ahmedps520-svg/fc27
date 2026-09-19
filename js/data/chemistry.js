/**
 * Chemistry: how well eleven cards fit together, and what that does on the pitch.
 *
 * Links. A card gains chemistry from the slot it is in (its own position is
 * worth two, a position in the same group one) and from the players around
 * it: two club-mates, three compatriots, or one of each lift it by one; and
 * from v68 a squad drawn from one league counts too — four league-mates is a
 * link, the way a real dressing room shares a language. 0–3 per card, and the
 * team figure is the sum over 33.
 *
 * What it does. A card at full chemistry plays a shade above its printed
 * stats and a card with none a shade below — about ±1.8%, never more, so a
 * good player on bad chemistry is still a good player. The effect is applied
 * by `moddedRef` to a *copy* of the card handed to the match engine; the
 * cards themselves never change, and the engine knows nothing about it. It
 * is only ever applied to a custom squad (Ultimate XI), so a club's own
 * eleven — the ones the balance sweep measures — play exactly as printed.
 */
import { getPlayer, getClub } from './generator.js';
import { FORMATIONS, POSITIONS } from './pools.js';

export const CHEM_MAX = 3;
/** Stat multiplier per point of chemistry away from the neutral 1.5. */
export const CHEM_STEP = 0.012;
/** Each evolve level is +1 overall and +1% on every stat. */
export const LEVEL_STEP = 0.01;

export function chemistryFor(lineup, formation) {
  const slots = FORMATIONS[formation];
  const ids = lineup.filter(Boolean);
  const placed = ids.map(getPlayer).filter(Boolean);
  const leagueOf = (p) => (p.clubId ? getClub(p.clubId)?.league : null);

  const per = lineup.map((id, i) => {
    if (!id) return 0;
    const p = getPlayer(id);
    if (!p) return 0;
    const slot = slots[i];
    const exact = p.position === slot.pos;
    const sameGroup = POSITIONS[p.position].group === POSITIONS[slot.pos].group;
    let chem = exact ? 2 : sameGroup ? 1 : 0;

    const clubMates = placed.filter((o) => o.id !== p.id && o.clubId && o.clubId === p.clubId).length;
    const nationMates = placed.filter((o) => o.id !== p.id && o.nation === p.nation).length;
    const lg = leagueOf(p);
    const leagueMates = lg ? placed.filter((o) => o.id !== p.id && leagueOf(o) === lg).length : 0;
    if (clubMates >= 2 || nationMates >= 3 || (clubMates >= 1 && nationMates >= 1) || leagueMates >= 4) chem += 1;

    return Math.max(0, Math.min(CHEM_MAX, chem));
  });

  const team = Math.min(100, Math.round((per.reduce((a, b) => a + b, 0) / 33) * 100));
  const rating = placed.length ? Math.round(placed.reduce((s, p) => s + p.overall, 0) / placed.length) : 0;
  return { per, team, rating, placedCount: placed.length };
}

/** The link kinds a card has with the rest of the eleven, for the squad screen. */
export function linksFor(id, lineup) {
  const p = getPlayer(id);
  if (!p) return { club: 0, nation: 0, league: 0 };
  const others = lineup.filter((o) => o && o !== id).map(getPlayer).filter(Boolean);
  const lg = p.clubId ? getClub(p.clubId)?.league : null;
  return {
    club: others.filter((o) => o.clubId && o.clubId === p.clubId).length,
    nation: others.filter((o) => o.nation === p.nation).length,
    league: lg ? others.filter((o) => o.clubId && getClub(o.clubId)?.league === lg).length : 0,
  };
}

/**
 * A copy of a card with chemistry and evolve level applied. `level` is the
 * card's upgrade level (0–5), `chem` its slot chemistry (0–3, or null for a
 * bench player, who takes the neutral value).
 */
export function moddedRef(p, { chem = null, level = 0 } = {}) {
  const c = chem == null ? 1.5 : chem;
  const mult = (1 + (c - 1.5) * CHEM_STEP) * (1 + level * LEVEL_STEP);
  const stats = {};
  for (const [k, v] of Object.entries(p.stats)) stats[k] = Math.min(99, Math.round(v * mult * 100) / 100);
  return { ...p, stats, overall: Math.min(99, p.overall + level), chem: c, level };
}

/** The evolve level of a card in a save, tolerant of saves that predate evolves. */
export const levelOf = (club, id) => (club?.upgrades?.[id] | 0);

/** A card as the player sees it: printed rating plus its evolve level. */
export function shownOverall(club, p) {
  return Math.min(99, p.overall + levelOf(club, p.id));
}
