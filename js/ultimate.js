import { getState, update, DIVISIONS } from './state.js';

/**
 * Settles an Apex Division result: moves you up or down the ladder, banks the
 * rewards, and ticks objectives. Returns a summary the result screen renders.
 */
export function settleDivisionMatch({ scored, conceded }) {
  const before = getState().ultimate;
  const beforeDiv = DIVISIONS[before.divIdx];
  const won = scored > conceded;
  const drew = scored === conceded;

  const out = {
    won, drew,
    promoted: false, relegated: false,
    fromDivision: beforeDiv.name,
    toDivision: beforeDiv.name,
    coins: 0,
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

    // match reward
    const reward = won ? div.reward : drew ? Math.round(div.reward * 0.35) : Math.round(div.reward * 0.15);
    out.coins += reward;
    s.club.coins += reward;
    // packs land in the store inventory unopened — you choose when to rip them
    if (won) { out.packs.push('silver'); s.club.packs.push('silver'); }
    if (out.promoted) {
      out.packs.push('gold');
      s.club.packs.push('gold');
      out.coins += 1500;
      s.club.coins += 1500;
    }

    // objectives
    const bump = (id, by = 1) => {
      const o = u.objectives.find((x) => x.id === id);
      if (!o || o.done >= o.need) return;
      const wasDone = o.done >= o.need;
      o.done += by;
      if (!wasDone && o.done >= o.need) {
        out.objectivesDone.push(o.text);
        out.coins += o.coins;
        s.club.coins += o.coins;
        out.packs.push(o.pack);
        s.club.packs.push(o.pack);
      }
    };
    if (won) bump('win3');
    if (scored) bump('score8', scored);
    if (u.streak >= 3) bump('streak3', 3);
    if (conceded === 0) bump('clean2');
    if (u.divIdx >= 5) bump('div5');
  });

  return out;
}

export function currentDivision() {
  return DIVISIONS[getState().ultimate.divIdx];
}
