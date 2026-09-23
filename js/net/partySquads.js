/** v82: the squads of a party match — pure, so every machine (and a test) builds the same thing. */
import { WORLD } from '../data/generator.js';

/**
 * The squads for a match from the setup and the seats. Deterministic: every
 * machine must build exactly the same eleven (or five) in the same order.
 * Five-a-side: each side's pros first, then the best of the club to make five
 * with a keeper among them. The pro cards get ids by seat (`pty-<seat>`), and
 * each human seat is locked to its own.
 */
export function partySquads(setup, seats) {
  if (setup.field !== 'fives') return { home: null, away: null, locks: {} };
  const locks = {};
  const build = (clubId, team) => {
    const club = WORLD.clubsById[clubId] || WORLD.clubs[0];
    const pros = seats.filter((st) => st.team === team).map((st) => {
      const pr = st.pro || { name: st.name, position: 'CM', overall: 72, stats: { pace: 72, shooting: 70, passing: 72, dribbling: 72, defending: 60, physical: 70 } };
      const id = `pty-${st.seat}`;
      locks[st.seat] = id;
      return { id, name: pr.name, short: pr.name.split(' ').pop(), position: pr.position, overall: pr.overall, stats: pr.stats, foot: 'R', rarity: 'gold', nation: '' };
    });
    const roster = club.roster.map((id) => WORLD.playersById[id]).filter(Boolean).sort((a, b) => b.overall - a.overall);
    const xi = [...pros];
    if (!xi.some((p) => p.position === 'GK')) xi.unshift(roster.find((p) => p.position === 'GK'));
    for (const p of roster) { if (xi.length >= 5) break; if (p.position !== 'GK' && !xi.includes(p)) xi.push(p); }
    // keeper first: the shape's first slot is the goal
    xi.sort((a, b) => (a.position === 'GK' ? -1 : b.position === 'GK' ? 1 : 0));
    return { xi: xi.slice(0, 5), bench: [], name: club.name, short: club.short, colors: club.crest.colors, crest: club.crest };
  };
  return { home: build(setup.home, 0), away: build(setup.away, 1), locks };
}

