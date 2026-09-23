/**
 * Parties (v82): online matches with more than two people.
 *
 *   coop2   two friends on one team against the CPU — a co-op season
 *   duo     two against two, each side switching between its own players
 *   pro5    five-a-side, up to ten people, each locked to one footballer
 *           (their Player Career pro, or a stand-in); the CPU fills the rest
 *
 * The model is the one the 1v1 game already uses: the host runs the
 * simulation, everybody else streams input up and renders the host's
 * snapshots. What changes is fan-out:
 *
 *   - a guest's `in` goes to the host only, stamped by the server with the
 *     sender's seat (`sq`) — a client never chooses whose seat it drives
 *   - the host's `snap` and `evt` go to every member
 *   - a dropped member's seat is held for the grace period: the host is told
 *     (`evt dropped {seat}`) and hands that seat to the CPU; a reconnect gets
 *     `partyRejoin` with the match setup and the seat, and the host is told
 *     (`evt resumed {seat}`)
 *
 * Nothing here is ranked except the co-op season, which takes the host's
 * validated scoreline once per match. There is no free text anywhere: names
 * are account names, and the setup the host broadcasts is size-checked.
 */
const MODES = {
  coop2: { max: 2, sides: [2, 0] },
  duo: { max: 4, sides: [2, 2] },
  pro5: { max: 10, sides: [5, 5] },
};
const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () => Array.from({ length: 5 }, () => CODE[Math.floor(Math.random() * CODE.length)]).join('');
const MAX_SETUP = 48 * 1024;
const POS = new Set(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST']);
/** A Player Career pro as it may travel: a name, a position, six numbers. Anything else is dropped. */
function cleanPro(p) {
  if (!p || typeof p !== 'object') return null;
  const name = String(p.name || '').replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 24);
  if (name.length < 2 || !POS.has(p.position)) return null;
  const st = {};
  for (const k of ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical']) { const v = Math.round(Number(p.stats?.[k])); if (!(v >= 1 && v <= 99)) return null; st[k] = v; }
  const overall = Math.max(40, Math.min(99, Math.round(Number(p.overall)) || 60));
  return { name, position: p.position, overall, stats: st };
}
const GRACE_MS = 45_000;

function createPartyHub({ store, guard, log = console.log, forget = () => {} }) {
  const parties = new Map();
  let seq = 90_000;

  const view = (p) => ({
    t: 'party', code: p.code, mode: p.mode, started: !!p.matchId,
    members: p.members.map((m) => ({ name: m.name, side: m.partySide, host: m === p.host, dropped: !!m.dropped })),
  });
  const tell = (p, msg, except = null) => { for (const m of p.members) if (m !== except && m.sock.open && !m.dropped) m.sock.send(msg); };
  const sideCount = (p, side) => p.members.filter((m) => m.partySide === side).length;

  function leave(peer, why = 'left') {
    const p = peer.party; if (!p) return;
    p.members = p.members.filter((m) => m !== peer);
    peer.party = null; peer.partySeat = null; peer.partySide = null;
    if (peer === p.host || !p.members.length) {
      tell(p, { t: 'partyEnded', reason: peer === p.host ? 'The host left.' : why });
      for (const m of p.members) { m.party = null; m.partySeat = null; }
      parties.delete(p.code);
      if (p.matchId) log(`[party ${p.code}] ended: ${why}`);
      return;
    }
    if (p.matchId && p.host.sock.open) p.host.sock.send({ t: 'evt', k: 'dropped', seat: peer.partySeat, name: peer.name, grace: 0 });
    tell(p, view(p));
  }

  /** Returns true when the message was a party message. */
  function handle(peer, m) {
    switch (m.t) {
      case 'partyHost': {
        if (peer.party) leave(peer);
        const mode = MODES[m.mode] ? m.mode : 'duo';
        let code = makeCode(); while (parties.has(code)) code = makeCode();
        const p = { code, mode, host: peer, members: [peer], matchId: null, setup: null, reported: false };
        peer.partyPro = cleanPro(m.pro);
        parties.set(code, p);
        peer.party = p; peer.partySide = 0;
        peer.sock.send(view(p));
        return true;
      }
      case 'partyJoin': {
        const p = parties.get(String(m.code || '').toUpperCase().trim());
        if (!p || p.matchId) { peer.sock.send({ t: 'partyFail', error: p ? 'That match has started.' : 'No party with that code.' }); return true; }
        const mode = MODES[p.mode];
        if (p.members.length >= mode.max) { peer.sock.send({ t: 'partyFail', error: 'That party is full.' }); return true; }
        if (peer.party) leave(peer);
        // balance the sides as people arrive (co-op has only the one)
        const c0 = sideCount(p, 0); const c1 = sideCount(p, 1);
        peer.partySide = mode.sides[1] === 0 || (c0 <= c1 && c0 < mode.sides[0]) ? 0 : 1;
        p.members.push(peer); peer.party = p;
        peer.partyPro = cleanPro(m.pro);
        tell(p, view(p));
        return true;
      }
      case 'partySide': {
        const p = peer.party; if (!p || p.matchId) return true;
        const side = m.side === 1 ? 1 : 0;
        if (MODES[p.mode].sides[side] > sideCount(p, side)) peer.partySide = side;
        tell(p, view(p));
        return true;
      }
      case 'partyLeave': leave(peer); peer.sock.send({ t: 'partyEnded', reason: 'You left.' }); return true;
      case 'partyStart': {
        const p = peer.party;
        if (!p || p.host !== peer || p.matchId) return true;
        const bytes = Buffer.byteLength(JSON.stringify(m.setup || {}));
        if (!m.setup || bytes > MAX_SETUP) { peer.sock.send({ t: 'partyFail', error: 'That setup is not valid.' }); return true; }
        // seats: the host first, then members in join order; the order is the controller order in the match
        const seats = p.members.map((x, i) => ({ name: x.name, team: x.partySide, seat: i, pro: p.mode === 'pro5' ? x.partyPro : null }));
        p.members.forEach((x, i) => { x.partySeat = i; });
        p.matchId = seq++;
        p.setup = m.setup;
        p.seats = seats;
        p.reported = false;
        for (const x of p.members) x.sock.send({ t: 'partyMatch', matchId: p.matchId, mode: p.mode, host: x === p.host, seat: x.partySeat, seats, setup: m.setup });
        log(`[party ${p.code}] match ${p.matchId}: ${seats.map((s) => `${s.name}@${s.team}`).join(', ')}`);
        return true;
      }
      // the relay
      case 'in': {
        const p = peer.party; if (!p?.matchId || peer === p.host) return false;
        if (Buffer.byteLength(JSON.stringify(m)) > guard.MAX_RELAY_BYTES) return true;
        if (p.host.sock.open && !p.host.dropped) p.host.sock.send({ ...m, sq: peer.partySeat });
        return true;
      }
      case 'snap':
      case 'evt': {
        const p = peer.party; if (!p?.matchId) return false;
        if (Buffer.byteLength(JSON.stringify(m)) > guard.MAX_RELAY_BYTES) return true;
        if (peer === p.host) tell(p, m, peer);
        // a guest's events (pause requests, substitutions, shape changes, pings) go to the host, stamped with the seat
        else if (m.t === 'evt' && p.host.sock.open && !p.host.dropped) p.host.sock.send({ ...m, sq: peer.partySeat, name: peer.name });
        return true;
      }
      case 'partyResult': {
        const p = peer.party;
        if (!p?.matchId || peer !== p.host || p.reported) return true;
        const s = Math.floor(Number(m.scored)); const c = Math.floor(Number(m.conceded));
        if (!(s >= 0 && s <= 20 && c >= 0 && c <= 20)) return true;
        p.reported = true;
        // the co-op season: both friends' records, on their own accounts
        if (p.mode === 'coop2') {
          const names = p.members.map((x) => x.name).sort();
          for (const x of p.members) if (x.acct) store.recordCoop?.(x.acct, names.join('+'), s, c);
        }
        tell(p, { t: 'partyRecorded', scored: s, conceded: c });
        p.matchId = null; p.seats = null;
        tell(p, view(p));
        return true;
      }
      default: return false;
    }
  }

  /** A party member's socket dropped. Returns true when the party took care of it. */
  function onClose(peer) {
    const p = peer.party; if (!p) return false;
    if (!p.matchId) { leave(peer, 'disconnected'); return true; }
    peer.dropped = true;
    if (peer === p.host) {
      // no host, no simulation: the match cannot outlive it
      tell(p, { t: 'partyEnded', reason: 'The host lost connection.' });
      for (const x of p.members) { x.party = null; }
      parties.delete(p.code);
      return true;
    }
    if (p.host.sock.open) p.host.sock.send({ t: 'evt', k: 'dropped', seat: peer.partySeat, name: peer.name, grace: GRACE_MS / 1000 });
    tell(p, view(p));
    peer.partyTimer = setTimeout(() => { if (peer.dropped) { leave(peer, 'disconnected'); forget(peer); } }, GRACE_MS);
    peer.partyTimer.unref?.();
    return true;
  }

  /** A reconnect for a dropped member: the new socket takes the seat back. Returns true if it was one. */
  function onReconnect(existing, sock) {
    const p = existing.party;
    if (!p?.matchId || !existing.dropped) return false;
    clearTimeout(existing.partyTimer);
    existing.sock = sock; existing.dropped = false;
    sock.send({ t: 'partyRejoin', matchId: p.matchId, mode: p.mode, host: false, seat: existing.partySeat, seats: p.seats, setup: p.setup });
    if (p.host.sock.open) p.host.sock.send({ t: 'evt', k: 'resumed', seat: existing.partySeat, name: existing.name });
    tell(p, view(p));
    log(`[party ${p.code}] ${existing.name} reconnected to seat ${existing.partySeat}`);
    return true;
  }

  return { handle, onClose, onReconnect, parties, GRACE_MS };
}

module.exports = { createPartyHub, MODES };
