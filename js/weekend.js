/**
 * Weekend League.
 *
 * A window opens every Friday at 18:00 UTC and closes Monday at 06:00 UTC.
 * Inside it you get ten matches; your wins set a rank, and the rank sets the
 * reward, claimable once the window has closed. Offline the ten are against
 * AI sides built to your division; online, any Apex Division match played
 * inside the window counts too, and the server keeps its own tally of those
 * from validated results (see /api/weekend).
 */
const OPEN_DAY = 5;          // Friday
const OPEN_HOUR = 18;
const CLOSE_DAY = 1;         // Monday
const CLOSE_HOUR = 6;
export const WL_MATCHES = 10;

export const RANKS = [
  { name: 'Bronze', wins: 0, apex: 600, packs: ['silver'] },
  { name: 'Silver', wins: 3, apex: 1800, packs: ['gold'] },
  { name: 'Gold', wins: 5, apex: 4000, packs: ['gold', 'gold'] },
  { name: 'Elite', wins: 7, apex: 8000, packs: ['prime'], ultimate: 2 },
  { name: 'Apex', wins: 9, apex: 15000, packs: ['prime', 'prime'], ultimate: 5 },
];

export const rankFor = (wins) => RANKS.slice().reverse().find((r) => wins >= r.wins) || RANKS[0];

/**
 * The window that `now` belongs to. Every moment belongs to exactly one:
 * either the open window or the wait for the next. `id` names the weekend by
 * the Friday it opens on, so a Sunday and the following Monday morning share it.
 */
export function weekendWindow(now = new Date()) {
  const t = new Date(now);
  // find this week's Friday 18:00 UTC
  const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  const dow = d.getUTCDay();
  const toFri = (OPEN_DAY - dow + 7) % 7;
  let opens = new Date(d); opens.setUTCDate(d.getUTCDate() + toFri); opens.setUTCHours(OPEN_HOUR, 0, 0, 0);
  // if that Friday is in the future but the previous window is still open, use the previous
  const prev = new Date(opens); prev.setUTCDate(opens.getUTCDate() - 7);
  const closeOf = (o) => { const c = new Date(o); c.setUTCDate(o.getUTCDate() + ((CLOSE_DAY - OPEN_DAY + 7) % 7)); c.setUTCHours(CLOSE_HOUR, 0, 0, 0); return c; };
  if (opens > now && closeOf(prev) > now) opens = prev;
  if (opens > now && toFri === 0 && now < opens) { /* Friday before 18:00: the coming window */ }
  const closes = closeOf(opens);
  const open = now >= opens && now < closes;
  const id = opens.toISOString().slice(0, 10);
  return { id, open, opensAt: opens, closesAt: closes, next: open ? closes : opens };
}

/** A fresh tally for a window. */
export const freshWeekend = (id) => ({ id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, claimed: false });

/**
 * The tally that applies right now, rolling the stored one over when the
 * window has changed. A finished-but-unclaimed weekend is kept in `pending`
 * so its reward is never lost to the calendar.
 */
export function currentWeekend(club, now = new Date()) {
  const w = weekendWindow(now);
  let cur = club.weekend;
  if (!cur || cur.id !== w.id) {
    if (cur && !cur.claimed && cur.played > 0) club.weekendPending = cur;
    cur = freshWeekend(w.id);
    club.weekend = cur;
  }
  return { window: w, tally: cur };
}

export const matchesLeft = (tally) => Math.max(0, WL_MATCHES - (tally?.played || 0));

/** Time until a moment, as "2d 5h" / "3h 12m". */
export function untilText(when, now = new Date()) {
  const ms = Math.max(0, when - now);
  const h = Math.floor(ms / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h ? `${h}h ${m}m` : `${m}m`;
}
