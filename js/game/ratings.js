/**
 * Match ratings out of ten (v81).
 *
 * Read from what a finished Match already knows — goals and assists from the
 * scorers list, and the per-player tallies the sim keeps since v81 (passes,
 * shots, won tackles, saves, distance, minutes) — plus the result and the
 * goals conceded for the men whose job is to stop them. Nothing here touches
 * the sim or its dice.
 *
 * Starts at 6.0, the mark of a match that happened to someone; a goal is the
 * biggest single mover, a keeper earns his with saves and a clean sheet, a
 * defender loses a little for every goal against. A cameo is pulled toward
 * 6.0, so a two-minute substitute cannot collect a 9.
 */
const GROUP = { GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF', CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', LW: 'FWD', RW: 'FWD', ST: 'FWD' };
export const groupOf = (pos) => GROUP[pos] || 'MID';

export function rateMatch(m) {
  const out = [];
  const seen = new Set();
  m.teams.forEach((team, side) => {
    const opp = m.teams[1 - side];
    const won = team.score > opp.score; const lost = team.score < opp.score;
    const refs = [...team.players.map((p) => ({ ref: p.ref, cards: p.cards | 0, red: !!p.sentOff })), ...(team.bench || []).filter(Boolean).map((ref) => ({ ref, cards: 0, red: false }))];
    for (const { ref, cards, red } of refs) {
      if (!ref || seen.has(ref.id)) continue;
      const st = m.pst?.[ref.id];
      if (!st) continue;                     // never on the pitch
      seen.add(ref.id);
      const g = groupOf(ref.position);
      const goals = team.scorers.filter((s) => s.id === ref.id && !s.own).length;
      const assists = team.scorers.filter((s) => s.assist === ref.id).length;
      const mins = m.minutesOf ? m.minutesOf(ref.id) : 90;
      let r = 6.0;
      r += goals * (g === 'FWD' ? 1.0 : 1.2) + assists * 0.7;
      r += Math.min(0.6, st.passes * 0.02) + Math.min(0.5, st.shots * 0.08) + Math.min(0.9, st.tackles * (g === 'DEF' || g === 'MID' ? 0.18 : 0.1));
      if (g === 'GK') r += Math.min(2.2, st.saves * 0.35) + (opp.score === 0 ? 0.8 : -0.35 * opp.score);
      else if (g === 'DEF') r += opp.score === 0 ? 0.6 : -0.25 * opp.score;
      else if (g === 'MID') r += opp.score === 0 ? 0.2 : -0.08 * opp.score;
      r += won ? 0.4 : lost ? -0.35 : 0;
      r -= cards * 0.4 + (red ? 1.5 : 0);
      // a cameo drifts back toward an unremarkable 6
      const w = Math.min(1, mins / 60);
      r = 6 + (r - 6) * (0.35 + 0.65 * w);
      r = Math.round(Math.max(3, Math.min(10, r)) * 10) / 10;
      out.push({ id: ref.id, name: ref.name, short: ref.short || ref.name, side, pos: ref.position, rating: r, goals, assists, mins,
        passes: st.passes, shots: st.shots, tackles: st.tackles, saves: st.saves, km: Math.round(st.dist / 100) / 10 });
    }
  });
  out.sort((a, b) => b.rating - a.rating);
  return { players: out, potm: out[0] || null };
}

/**
 * A simulated match's rating for one player (the careers' "sim result"), from
 * the result and his team's goals — no Match object needed.
 */
export function simRating({ pos, won, lost, scored = 0, conceded = 0, goals = 0, assists = 0, form = 0, rnd = Math.random }) {
  const g = groupOf(pos);
  let r = 6.2 + (rnd() - 0.5) * 1.2 + form * 0.15;
  r += goals * (g === 'FWD' ? 1.0 : 1.2) + assists * 0.7;
  if (g === 'GK' || g === 'DEF') r += conceded === 0 ? 0.7 : -0.25 * conceded;
  r += won ? 0.4 : lost ? -0.35 : 0;
  r += scored * 0.05;
  return Math.round(Math.max(3, Math.min(10, r)) * 10) / 10;
}
