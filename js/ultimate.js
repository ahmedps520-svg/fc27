import { getState, update, DIVISIONS } from './state.js';

/**
 * Settles an Apex Division result: moves you up or down the ladder, banks the
 * rewards, and ticks objectives. Returns a summary the result screen renders.
 */
/**
 * How much Apex a division match pays.
 *
 * Two things decide it. The division sets the size of the purse — climbing is
 * what makes the money worth having — and possession sets a multiplier on top,
 * because a win where you never had the ball should not pay the same as one
 * where you controlled the game. The band is deliberately narrow: ±25% is
 * enough to notice and not enough to make keep-ball the only strategy.
 *
 * @param {number} poss percentage of the ball this player's side had, 0-100
 */
export function matchApex(div, { won, drew, poss }) {
  const outcome = won ? 1 : drew ? 0.35 : 0.15;
  const share = Math.max(0, Math.min(100, Number.isFinite(poss) ? poss : 50));
  const control = 0.5 + (share / 100);
  return Math.round(div.reward * outcome * control);
}

export function settleDivisionMatch({ scored, conceded, possession = 50 }) {
  const before = getState().ultimate;
  const beforeDiv = DIVISIONS[before.divIdx];
  const won = scored > conceded;
  const drew = scored === conceded;

  const out = {
    won, drew,
    promoted: false, relegated: false,
    fromDivision: beforeDiv.name,
    toDivision: beforeDiv.name,
    apex: 0,
    possession: Math.round(possession),
    packs: [],
    objectivesDone: [],
  };

  update((s) => {
    const u = s.ultimate;
    u.played += 1;
    u.goalsFor += scored;
    u.goalsAgainst += conceded;

    if (won) {
      u.wins += 1;
      u.streak = Math.max(1, u.streak + 1);
      u.bestStreak = Math.max(u.bestStreak, u.streak);
      u.progress += 1;
    } else if (drew) {
      u.draws += 1;
      u.streak = 0;
    } else {
      u.losses += 1;
      u.streak = 0;
      u.progress -= 1;
    }

    // ladder movement
    const div = DIVISIONS[u.divIdx];
    if (u.progress >= div.need && u.divIdx < DIVISIONS.length - 1) {
      u.divIdx += 1;
      u.progress = 0;
      out.promoted = true;
    } else if (u.progress < 0) {
      if (u.divIdx > 0) { u.divIdx -= 1; u.progress = Math.max(0, DIVISIONS[u.divIdx].need - 1); out.relegated = true; }
      else u.progress = 0;
    }
    out.toDivision = DIVISIONS[u.divIdx].name;

    // match reward — division sets the purse, possession scales it
    const reward = matchApex(div, { won, drew, poss: possession });
    out.apex += reward;
    s.club.apex += reward;
    // packs land in the store inventory unopened — you choose when to rip them
    if (won) { out.packs.push('silver'); s.club.packs.push('silver'); }
    if (out.promoted) {
      out.packs.push('gold');
      s.club.packs.push('gold');
      out.apex += 1500;
      s.club.apex += 1500;
    }

    // objectives
    const bump = (id, by = 1) => {
      const o = u.objectives.find((x) => x.id === id);
      if (!o || o.done >= o.need) return;
      const wasDone = o.done >= o.need;
      o.done += by;
      if (!wasDone && o.done >= o.need) {
        out.objectivesDone.push(o.text);
        out.apex += o.apex;
        s.club.apex += o.apex;
        out.packs.push(o.pack);
        s.club.packs.push(o.pack);
      }
    };
    if (won) bump('win3');
    if (scored) bump('score8', scored);
    if (u.streak >= 3) bump('streak3', 3);
    if (conceded === 0) bump('clean2');
    if (u.divIdx >= 5) bump('div5');
    if (won) bump('win12');
  });

  return out;
}

export function currentDivision() {
  return DIVISIONS[getState().ultimate.divIdx];
}
