/**
 * Live content: the week's event and the season, from the server.
 *
 * `events.json` is fetched once per boot (network-first, never cached by the
 * browser) and remembered in the save so the game knows the current event
 * offline. The bundled default (`data/liveDefault.js`) is what runs when the
 * fetch has never succeeded. Everything that reads "what is on this week"
 * goes through `activeEvent()` and `season()`, so changing the file is the
 * whole job of running a live event.
 */
import { LIVE_DEFAULT } from './data/liveDefault.js';
import { DEFAULT_TIERS } from './data/season.js';

let live = LIVE_DEFAULT;
let fetchedAt = 0;

const day = (d = new Date()) => d.toISOString().slice(0, 10);

/** ISO week number, for the rotation. */
export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t - yearStart) / 864e5) + 1) / 7);
}

const inWindow = (x, today) => (!x.from || today >= x.from) && (!x.to || today <= x.to);

/** Replace the live set (from a fetch, or from the copy kept in the save). */
export function adopt(data, at = Date.now()) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.events)) return false;
  live = data;
  fetchedAt = at;
  return true;
}

export const liveData = () => live;
export const liveAge = () => (fetchedAt ? Date.now() - fetchedAt : Infinity);

/** Pull the file. Resolves to the data on success, null on any failure. */
export async function refresh() {
  try {
    const res = await fetch('events.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return adopt(data) ? data : null;
  } catch {
    return null;
  }
}

/** The one event that is on right now. Dated events win; otherwise the rotation. */
export function activeEvent(now = new Date()) {
  const today = day(now);
  const dated = live.events.filter((e) => e.from || e.to);
  const hit = dated.find((e) => inWindow(e, today));
  if (hit) return hit;
  const rotation = live.events.filter((e) => !e.from && !e.to);
  if (!rotation.length) return live.events[0] || null;
  return rotation[isoWeek(now) % rotation.length];
}

/** The week key an event's progress is filed under: its id plus the ISO week. */
export const eventKey = (ev, now = new Date()) => (ev ? `${ev.id}:${now.getUTCFullYear()}-w${isoWeek(now)}` : null);

/** When the current event ends — the dated end, or the end of the ISO week (Sunday 23:59 UTC). */
export function eventEndsAt(ev, now = new Date()) {
  if (ev?.to) return new Date(`${ev.to}T23:59:59Z`);
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + (7 - dow));
  d.setUTCHours(23, 59, 59, 0);
  return d;
}

export function season(now = new Date()) {
  const s = live.season || LIVE_DEFAULT.season;
  const today = day(now);
  return {
    ...s,
    tiers: Array.isArray(s.tiers) && s.tiers.length ? s.tiers : DEFAULT_TIERS,
    active: inWindow(s, today),
    daysLeft: s.to ? Math.max(0, Math.ceil((new Date(`${s.to}T23:59:59Z`) - now) / 864e5)) : null,
  };
}

/** The event pack as a pack the store can sell, or null. */
export const eventPack = (ev = activeEvent()) => (ev?.pack ? { ...ev.pack, event: ev.id, cat: 'event', tone: 'special' } : null);
