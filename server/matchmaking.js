/**
 * Matchmaking rules, kept apart from the socket plumbing so they can be tested
 * without one.
 *
 * Two queues live in one list, told apart by `peer.wl`:
 *   - division play pairs by division, widening with wait time (as before);
 *   - Weekend League pairs by *wins this weekend*, so a 7-2 record meets
 *     another 7-2 and not a first-timer, widening to anyone after twenty
 *     seconds. The two never mix: a weekend match counts for the weekend on
 *     both machines, and a division match must not.
 */
const WIDEN = [
  { after: 0, span: 0 },
  { after: 8, span: 1 },
  { after: 16, span: 3 },
  { after: 25, span: 99 },
];
const WIDEN_WL = [
  { after: 0, span: 1 },
  { after: 10, span: 2 },
  { after: 20, span: 99 },
];

function allowedSpan(waitedSec, table) {
  let span = 0;
  for (const step of table) if (waitedSec >= step.after) span = step.span;
  return span;
}

/** The measure two peers are compared on, and how far apart they may be. */
function gapOf(a, b) {
  if (a.wl || b.wl) {
    if (!a.wl || !b.wl || a.wl.id !== b.wl.id) return Infinity;      // never across queues or weekends
    return Math.abs((a.wl.wins | 0) - (b.wl.wins | 0));
  }
  return Math.abs((a.divIdx | 0) - (b.divIdx | 0));
}

/**
 * Pick pairings from `waiting` (already sorted longest-wait first). Returns
 * an array of [a, b] pairs; the caller removes them from the queue.
 */
function findPairs(waiting, now = Date.now()) {
  const pairs = [];
  const taken = new Set();
  for (const a of waiting) {
    if (taken.has(a)) continue;
    const table = a.wl ? WIDEN_WL : WIDEN;
    const span = allowedSpan((now - a.queuedAt) / 1000, table);
    let best = null;
    let bestGap = Infinity;
    for (const b of waiting) {
      if (b === a || taken.has(b)) continue;
      const gap = gapOf(a, b);
      if (!Number.isFinite(gap)) continue;
      const bSpan = allowedSpan((now - b.queuedAt) / 1000, b.wl ? WIDEN_WL : WIDEN);
      if (gap > Math.max(span, bSpan)) continue;
      if (gap < bestGap || (gap === bestGap && b.queuedAt < best.queuedAt)) { best = b; bestGap = gap; }
    }
    if (best) { taken.add(a); taken.add(best); pairs.push([a, best]); }
  }
  return pairs;
}

/** Sanitise a client's weekend tag: { id: 'YYYY-MM-DD', wins: 0..10 } or null. */
function cleanWL(wl) {
  if (!wl || typeof wl !== 'object') return null;
  const id = String(wl.id || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
  return { id, wins: Math.max(0, Math.min(10, wl.wins | 0)) };
}

/* ------------------------------------------------------------------ *
 * Reconnects
 *
 * A socket that drops mid-match keeps its seat for a grace period: the
 * peer record stays, the opponent is told, and a fresh socket that signs in
 * as the same account and names the same match takes the seat back. Past
 * the grace the match ends as a walkover, as it always did.
 * ------------------------------------------------------------------ */
const RECONNECT_GRACE_MS = 45 * 1000;

module.exports = { findPairs, gapOf, allowedSpan, cleanWL, RECONNECT_GRACE_MS, WIDEN, WIDEN_WL };
