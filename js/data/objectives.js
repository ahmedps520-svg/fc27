/**
 * The objective ladder.
 *
 * Thirty-two of them, in order, and you hold seven at a time. Finish one and
 * it stays finished until the next refresh, which clears the completed slots
 * and deals the next unclaimed rungs into them. The ones you did *not* finish
 * stay exactly where they were with their progress intact — a refresh is a
 * reward for finishing things, not a punishment for being midway through one.
 *
 * The counter reads "6/32 done": progress through the whole ladder, not through
 * whatever seven happen to be on screen.
 *
 * Rewards climb the whole way. The bottom is silver packs and pocket change,
 * the middle is Prime and real money, and the **deepest rungs pay Ultimate** —
 * the currency you otherwise only get for winning in Division 1 and Apex Elite,
 * and the only thing the Icon Exchange takes. That is the point of the ladder:
 * a second route to the one thing Apex cannot buy, priced as a long grind
 * rather than an afternoon. How many rungs those are is `ULTIMATE_RUNGS`,
 * counted from the table rather than written into prose that goes stale the
 * first time a rung is added — which is exactly what happened to "the last
 * six".
 *
 * `metric` is how a match feeds the objective:
 *   win      one per win
 *   played   one per match, won or lost
 *   goal     one per goal scored
 *   clean    one per clean sheet
 *   bigwin   one per win by three or more
 *   control  one per win with 60%+ of the ball
 *   streak   holds your best current run, rather than accumulating
 *   rank     completes the moment you reach the division named in `rank`
 */
export const SLATE_SIZE = 7;

/** How long a slate lasts before the finished slots are refilled.
 *  Was 12 hours; halved because a finished slot is dead space — it pays
 *  nothing and asks nothing, and six hours of it per rung is enough. */
export const REFRESH_MS = 6 * 60 * 60 * 1000;

const L = (id, metric, text, need, apex, pack, extra = {}) =>
  ({ id, metric, text, need, apex, pack, ...extra });

export const LADDER = [
  /* Array order is the order the ladder is climbed. Ids are only save keys, so
     the l25-l32 rungs added later sit where they belong on the difficulty
     curve rather than at the end — an id out of sequence here is deliberate,
     and renumbering the originals would strand every save that has claimed
     them. */

  // ---- getting started: small asks, small change -------------------------
  L('l01', 'played',  'Play 2 Apex Division matches', 2, 800, 'silver'),
  L('l02', 'win',     'Win an Apex Division match', 1, 1000, 'silver'),
  L('l03', 'goal',    'Score 5 goals in the division', 5, 1200, 'silver'),
  L('l25', 'played',  'Play 5 Apex Division matches', 5, 1300, 'keeper'),
  L('l04', 'clean',   'Keep a clean sheet', 1, 1400, 'gold'),
  L('l05', 'win',     'Win 3 Apex Division matches', 3, 1800, 'gold'),
  L('l06', 'goal',    'Score 10 goals in the division', 10, 2200, 'gold'),
  L('l26', 'clean',   'Keep 2 clean sheets', 2, 2500, 'dip'),

  // ---- finding your level ------------------------------------------------
  L('l07', 'streak',  'Win 3 in a row', 3, 2800, 'gold'),
  L('l08', 'clean',   'Keep 3 clean sheets', 3, 3400, 'gold'),
  L('l09', 'bigwin',  'Win a match by 3 goals or more', 1, 4000, 'gold'),
  L('l27', 'played',  'Play 15 Apex Division matches', 15, 4400, 'builder'),
  L('l10', 'rank',    'Reach Division 7', 1, 4800, 'prime', { rank: 3 }),
  L('l11', 'win',     'Win 8 Apex Division matches', 8, 5600, 'prime'),
  L('l12', 'control', 'Win with 60% of the ball', 1, 6500, 'prime'),
  L('l28', 'bigwin',  'Win 2 matches by 3 goals or more', 2, 7200, 'builder'),

  // ---- the grind ---------------------------------------------------------
  L('l13', 'goal',    'Score 30 goals in the division', 30, 8000, 'prime'),
  L('l14', 'streak',  'Win 5 in a row', 5, 9500, 'prime'),
  L('l29', 'clean',   'Keep 5 clean sheets', 5, 10000, 'prime'),
  L('l15', 'rank',    'Reach Division 5', 1, 11000, 'stars', { rank: 5 }),
  L('l16', 'clean',   'Keep 8 clean sheets', 8, 13000, 'stars'),
  L('l30', 'streak',  'Win 4 in a row twice over', 4, 14000, 'stars'),
  L('l17', 'bigwin',  'Win 4 matches by 3 goals or more', 4, 15000, 'stars'),
  L('l18', 'win',     'Win 20 Apex Division matches', 20, 18000, 'stars'),
  L('l31', 'goal',    'Score 50 goals in the division', 50, 20000, 'stars'),

  // ---- the deep end: the only objectives that pay Ultimate ----------------
  L('l19', 'rank',    'Reach Division 3', 1, 22000, 'stars',   { rank: 7, ultimate: 3 }),
  L('l20', 'streak',  'Win 7 in a row', 7, 26000, 'limited',   { ultimate: 4 }),
  L('l21', 'goal',    'Score 75 goals in the division', 75, 30000, 'limited', { ultimate: 5 }),
  L('l32', 'rank',    'Reach Division 2', 1, 33000, 'limited', { rank: 8, ultimate: 6 }),
  L('l22', 'rank',    'Reach Division 1', 1, 36000, 'limited', { rank: 9, ultimate: 8 }),
  L('l23', 'win',     'Win 40 Apex Division matches', 40, 44000, 'legend',   { ultimate: 10 }),
  L('l24', 'rank',    'Reach Apex Elite', 1, 60000, 'legend',  { rank: 10, ultimate: 20 }),
];

/** How many rungs pay Ultimate, counted rather than written down — the prose
 *  used to say "the last six" and went stale the first time a rung was added. */
export const ULTIMATE_RUNGS = LADDER.filter((e) => e.ultimate).length;

/** Fresh copies, because the slate mutates `done` as you play. */
export function slotFrom(entry) {
  return { ...entry, done: 0 };
}

/**
 * Deal a starting slate: the first `SLATE_SIZE` rungs nobody has claimed.
 * @param {string[]} claimed ladder ids already finished
 */
export function dealSlate(claimed = [], keep = []) {
  const held = new Set(keep.map((o) => o.id));
  const done = new Set(claimed);
  const out = keep.slice();
  for (const e of LADDER) {
    if (out.length >= SLATE_SIZE) break;
    if (done.has(e.id) || held.has(e.id)) continue;
    out.push(slotFrom(e));
  }
  return out;
}
