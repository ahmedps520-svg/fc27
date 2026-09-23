/**
 * Parties, client side (v82) — see server/party.js for the model.
 *
 * The lobby state is kept here (`party()`), the Online screen draws it
 * (screens/partyPanel.js), and a `partyMatch` (or `partyRejoin` after a drop)
 * turns into a `play` navigation that every machine builds identically from
 * the host's setup: the same clubs, the same field, the same squads in the
 * same order, one controller per seat in the server's seat order.
 */
import * as net from './socket.js';
import { getState } from '../state.js';
import { WORLD } from '../data/generator.js';
import { navigate, toast } from '../app.js';
import * as api from './api.js';
import { sfx } from '../audio.js';
import { partySquads } from './partySquads.js';

export const MODES = {
  coop2: { name: 'Co-op season', blurb: 'Two friends, one team, against the CPU. Ten-match seasons, recorded for you both.', max: 2, field: 'full', duration: 180 },
  duo: { name: '2 v 2', blurb: 'Two a side, each person switching between their own players.', max: 4, field: 'full', duration: 180 },
  pro5: { name: 'Pro five-a-side', blurb: 'Up to ten people, each playing only their Player Career pro. The CPU fills the gaps.', max: 10, field: 'fives', duration: 150 },
};

let state = null;            // the lobby as the server last described it
const listeners = new Set();
export const party = () => state;
export const onParty = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => { for (const fn of listeners) fn(state); };

/** My Player Career pro as the party carries it (or null). */
export function myPro() {
  const p = getState().pro;
  const person = p?.world?.people?.[p.name];
  if (!p || !person || p.retired) return null;
  return { name: p.name, position: person.pos, overall: Math.round(person.base || 60), stats: person.stats };
}

export function host(mode) { net.send({ t: 'partyHost', mode, pro: myPro() }); }
export function join(code) { net.send({ t: 'partyJoin', code, pro: myPro() }); }
export function side(s) { net.send({ t: 'partySide', side: s }); }
export function leave() { net.send({ t: 'partyLeave' }); state = null; emit(); }
/** Host: pick the clubs and go. */
export function start() {
  if (!state) return;
  const clubs = WORLD.clubs.slice(0, 16);
  const home = clubs[Math.floor(Math.random() * clubs.length)];
  let away = clubs[Math.floor(Math.random() * clubs.length)];
  if (away === home) away = clubs[(clubs.indexOf(home) + 1) % clubs.length];
  const m = MODES[state.mode];
  net.send({ t: 'partyStart', setup: { mode: state.mode, home: home.id, away: away.id, field: m.field, duration: m.duration } });
}

export { partySquads };

function launch(m) {
  const sq = partySquads(m.setup, m.seats);
  const mySeat = m.seats[m.seat];
  sfx('confirm');
  navigate('play', {
    homeId: m.setup.home, awayId: m.setup.away, duration: m.setup.duration || 180, mode: 'single',
    field: m.setup.field || 'full', homeSquad: sq.home, awaySquad: sq.away,
    online: {
      matchId: m.matchId, host: m.host, seat: m.seat, team: mySeat.team, kind: 'party',
      oppName: m.seats.filter((st) => st.seat !== m.seat).map((st) => st.name).join(', '), myName: api.getName(),
      party: { mode: m.mode, seats: m.seats, locks: sq.locks, rejoin: !!m.rejoin },
    },
  });
}

net.on('party', (m) => { state = m; emit(); });
net.on('partyFail', (m) => toast(m.error || 'Party error', 'warn'));
net.on('partyEnded', (m) => { state = null; emit(); if (m.reason) toast(m.reason, 'info'); });
net.on('partyMatch', (m) => launch(m));
net.on('partyRejoin', (m) => { toast('Back in — rejoining your seat', 'good'); launch({ ...m, rejoin: true }); });
net.on('partyRecorded', (m) => { if (state?.mode === 'coop2') toast(`Co-op season: ${m.scored}–${m.conceded} recorded`, 'good'); });
