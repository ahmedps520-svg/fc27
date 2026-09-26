/**
 * v132 — which figure each player is drawn with, per tier.
 *
 * Three levels:
 *   0  the full scanned model      ~39.5k triangles (38.6k and the hair)
 *   1  the same model, simplified  ~10k   (tools/models/lod.mjs)
 *   2  the built figure (rig.js)   ~5.7k
 *
 * Only High and Ultra draw the scanned model at all; Low and Medium keep the
 * built figure for everyone, as before. Within High and Ultra the nearest few
 * players to the lens get the full scan, the next ones the light scan, and on
 * High everyone past that the built figure. A replay or a close-up (the lens
 * narrowed, a goal) is the one time the whole picture is looked at, so the
 * counts open up there.
 *
 * The counts are the triangle cap: `capFor(tier)` is the most the players can
 * cost in a frame, and tests/unit/lod.test.mjs holds each tier under it.
 *
 * A player keeps the level he has until he is clearly past the line
 * (HOLD: 12% of the distance), so two players at the same distance do not
 * swap figures every frame.
 */
export const LOD_TRIS = [39500, 10000, 5700];

export const LOD_BUDGET = {
  high: {
    play: { full: 4, fullDist: 24, light: 12, lightDist: 62 },
    close: { full: 10, fullDist: 60, light: 23, lightDist: Infinity },
  },
  cinema: {
    play: { full: 10, fullDist: 40, light: 23, lightDist: Infinity },
    close: { full: 23, fullDist: Infinity, light: 23, lightDist: Infinity },
  },
};

const HOLD = 0.88;

/** Figures a tier may draw at most, as triangles (23 figures: 22 and the referee). */
export function capFor(tier, close = false, figures = 23) {
  const b = LOD_BUDGET[tier]?.[close ? 'close' : 'play'];
  if (!b) return figures * LOD_TRIS[2];
  const full = Math.min(b.full, figures);
  const light = Math.min(b.light, figures) - full;
  return full * LOD_TRIS[0] + light * LOD_TRIS[1] + (figures - full - light) * LOD_TRIS[2];
}

/**
 * @param {{d:number, ahead:boolean, cur:number}[]} list  distance to the lens,
 *        whether he is in front of it, and the level he has now
 * @param {'high'|'cinema'} tier
 * @param {boolean} close   a replay or a close-up
 * @returns {number[]}      a level for each entry, in the same order
 */
export function pickLods(list, tier, close = false) {
  const b = LOD_BUDGET[tier]?.[close ? 'close' : 'play'];
  if (!b) return list.map(() => 2);
  // behind the lens is never seen: last in the queue whatever the distance
  const eff = list.map((e, i) => ({ i, d: e.d, k: (e.ahead ? 0 : 1e6) + e.d * (e.cur === 0 ? HOLD : e.cur === 1 ? 0.94 : 1) }));
  eff.sort((a, b2) => a.k - b2.k);
  const out = new Array(list.length).fill(2);
  let full = 0; let light = 0;
  for (const e of eff) {
    const cur = list[e.i].cur;
    const hold = (lvl) => (cur <= lvl ? 1 / HOLD : 1);
    if (full < b.full && e.d < b.fullDist * hold(0) && list[e.i].ahead) { out[e.i] = 0; full += 1; continue; }
    if (full + light < b.light && e.d < b.lightDist * hold(1)) { out[e.i] = 1; light += 1; continue; }
  }
  return out;
}
