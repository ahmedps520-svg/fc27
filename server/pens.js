/**
 * v194: the online penalty duel.
 *
 * Two people, one goal: five kicks each, alternating, then sudden death. On
 * each kick the shooter stops a sweeping marker to aim and the other player,
 * in goal, picks a dive — left, stay or right — at the same time, against a
 * clock. The server collects both, resolves the kick with the same rules for
 * everyone (`resolveKick`, below; nothing about a card's stats, so neither
 * side's client can lean on the result) and tells both what happened.
 *
 * Found by a random queue (any two duellists; blocked pairs never meet) or a
 * four-letter code shared with a friend. Nobody in the queue for NOBODY_MS:
 * the client is told, and offers the CPU instead. Leaving — the button, or a
 * dropped connection — hands the other player the win. What travels between
 * players: a name, card ids for the takers and the keeper, and a kit; never
 * text either of them typed.
 */
const KICKS = 5;
const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * One kick. `aim` -1 (left post) to 1 (right post), as the screen shows it;
 * `dive` -1, 0 or 1. A small wobble on every shot (more when the shooter ran
 * out of time) is what makes a corner a gamble rather than a free goal.
 */
function resolveKick(aim, dive, rnd = Math.random, rushed = false) {
  const wobble = (rnd() * 2 - 1) * (rushed ? 0.5 : 0.16);
  const placed = Math.max(-1.25, Math.min(1.25, (Number(aim) || 0) + wobble));
  if (Math.abs(placed) > 1.02) return { scored: false, aim: placed, why: 'Wide' };
  const side = Math.sign(placed);
  let save = 0;
  if (dive === 0 && Math.abs(placed) < 0.33) save = 0.85;                       // stood tall, struck down the middle
  else if (dive !== 0 && side === dive && Math.abs(placed) >= 0.2) save = Math.abs(placed) > 0.85 ? 0.35 : 0.75;   // right way: the corner is fingertips
  if (save && rnd() < save) return { scored: false, aim: placed, why: 'Saved' };
  return { scored: true, aim: placed, why: 'Scored' };
}

/** Standard shootout arithmetic: the winner once one side cannot be caught, else null. */
function decided(score, taken) {
  const left = (t) => Math.max(0, KICKS - taken[t]);
  if (taken[0] >= KICKS && taken[1] >= KICKS) return taken[0] === taken[1] && score[0] !== score[1] ? (score[0] > score[1] ? 0 : 1) : null;
  if (score[0] > score[1] + left(1)) return 0;
  if (score[1] > score[0] + left(0)) return 1;
  return null;
}

const ID_RE = /^[\w:.-]{1,48}$/;
const cleanTeam = (m) => ({
  takers: (Array.isArray(m?.takers) ? m.takers : []).filter((x) => typeof x === 'string' && ID_RE.test(x)).slice(0, 11),
  keeper: typeof m?.keeper === 'string' && ID_RE.test(m.keeper) ? m.keeper : null,
});

function createPensHub({ store, guard, log = console.log, rnd = Math.random,
  turnMs = Number(process.env.APEX_PENS_TURN_MS) || 4000, nobodyMs = Number(process.env.APEX_PENS_NOBODY_MS) || 20000,
  gapMs = Number(process.env.APEX_PENS_GAP_MS) || 1900 } = {}) {
  let queue = [];
  const rooms = new Map();         // code → host peer
  let seq = 1;

  const sendTo = (p, msg) => { if (p?.sock?.open) p.sock.send(msg); };
  const leaveWaiting = (peer) => {
    queue = queue.filter((p) => p !== peer);
    if (peer.pensRoom && rooms.get(peer.pensRoom) === peer) rooms.delete(peer.pensRoom);
    peer.pensRoom = null;
    clearTimeout(peer.pensNobody);
  };
  const busy = (peer) => !!(peer.pens || peer.opponent || peer.party);

  function start(a, b) {
    leaveWaiting(a); leaveWaiting(b);
    const d = { id: seq++, p: [a, b], score: [0, 0], taken: [0, 0], marks: [[], []], turn: 0, round: 0, pending: null, over: false, timer: null };
    a.pens = { duel: d, side: 0 }; b.pens = { duel: d, side: 1 };
    d.p.forEach((p, i) => {
      const o = d.p[1 - i];
      sendTo(p, { t: 'pensStart', id: d.id, you: i, opp: { name: o.name, takers: o.pensTeam.takers, keeper: o.pensTeam.keeper, kit: o.pensKit || null } });
    });
    log(`[pens ${d.id}] ${a.name} v ${b.name}`);
    d.timer = setTimeout(() => turn(d), gapMs);
  }
  function turn(d) {
    if (d.over) return;
    const shooter = d.turn;
    d.pending = { shooter, aim: null, dive: null };
    for (const p of d.p) sendTo(p, { t: 'pensTurn', id: d.id, shooter, round: d.round, kick: d.taken[shooter], ms: turnMs });
    d.timer = setTimeout(() => resolve(d), turnMs + 350);
  }
  function resolve(d) {
    const k = d.pending; if (!k || d.over) return;
    d.pending = null; clearTimeout(d.timer);
    const rushed = k.aim === null;
    const aim = rushed ? (rnd() * 2 - 1) * 0.5 : k.aim;
    const dive = k.dive === null ? [-1, 0, 1][Math.floor(rnd() * 3)] : k.dive;
    const r = resolveKick(aim, dive, rnd, rushed);
    const t = k.shooter;
    if (r.scored) d.score[t] += 1;
    d.marks[t].push(r.scored ? 'scored' : 'missed');
    d.taken[t] += 1;
    const msg = { t: 'pensKick', id: d.id, shooter: t, aim: Math.round(r.aim * 1000) / 1000, dive, why: r.why, scored: r.scored, rushed, late: k.dive === null, score: d.score.slice(), marks: d.marks.map((x) => x.slice()) };
    for (const p of d.p) sendTo(p, msg);
    const w = decided(d.score, d.taken);
    if (w !== null) { d.timer = setTimeout(() => end(d, w), gapMs); return; }
    d.turn = 1 - d.turn; if (d.turn === 0) d.round += 1;
    d.timer = setTimeout(() => turn(d), gapMs);
  }
  function end(d, winner, walkover = false) {
    if (d.over) return;
    d.over = true; clearTimeout(d.timer);
    d.p.forEach((p, i) => {
      if (p.pens?.duel === d) p.pens = null;
      sendTo(p, { t: 'pensEnd', id: d.id, winner, you: i, score: d.score.slice(), walkover });
    });
    if (d.p[winner].acct) store.recordPens?.(d.p[winner].acct, true);
    if (d.p[1 - winner].acct) store.recordPens?.(d.p[1 - winner].acct, false);
    log(`[pens ${d.id}] ${d.p[winner].name} won ${d.score.join('–')}${walkover ? ' (walkover)' : ''}`);
  }

  function handle(peer, m) {
    switch (m.t) {
      case 'pensQueue': {
        if (busy(peer)) { sendTo(peer, { t: 'pensFail', error: 'Finish what you are playing first.' }); return true; }
        leaveWaiting(peer);
        peer.pensTeam = cleanTeam(m); peer.pensKit = guard.cleanKit?.(m.kit) || null;
        const other = queue.find((p) => p !== peer && p.sock.open && !busy(p) && !store.blocks(p.acct, peer.acct));
        if (other) { start(other, peer); return true; }
        queue.push(peer);
        sendTo(peer, { t: 'pensQueued' });
        peer.pensNobody = setTimeout(() => { if (queue.includes(peer)) { leaveWaiting(peer); sendTo(peer, { t: 'pensNobody' }); } }, nobodyMs);
        peer.pensNobody.unref?.();
        return true;
      }
      case 'pensHost': {
        if (busy(peer)) { sendTo(peer, { t: 'pensFail', error: 'Finish what you are playing first.' }); return true; }
        leaveWaiting(peer);
        peer.pensTeam = cleanTeam(m); peer.pensKit = guard.cleanKit?.(m.kit) || null;
        let code = ''; do { code = Array.from({ length: 4 }, () => CODE[Math.floor(Math.random() * CODE.length)]).join(''); } while (rooms.has(code));
        rooms.set(code, peer); peer.pensRoom = code;
        sendTo(peer, { t: 'pensHosting', code });
        return true;
      }
      case 'pensJoin': {
        const code = String(m.code || '').toUpperCase().trim();
        const host = rooms.get(code);
        // a blocked pair looks like a wrong code, as everywhere else (v190)
        if (!host || host === peer || !host.sock.open || store.blocks(host.acct, peer.acct)) { sendTo(peer, { t: 'pensFail', error: 'No duel with that code.' }); return true; }
        if (busy(peer) || busy(host)) { sendTo(peer, { t: 'pensFail', error: 'That duel has started.' }); return true; }
        leaveWaiting(peer);
        peer.pensTeam = cleanTeam(m); peer.pensKit = guard.cleanKit?.(m.kit) || null;
        start(host, peer);
        return true;
      }
      case 'pensCancel': leaveWaiting(peer); sendTo(peer, { t: 'pensIdle' }); return true;
      case 'pensShoot':
      case 'pensDive': {
        const s = peer.pens; const k = s?.duel?.pending; if (!k) return true;
        if (m.t === 'pensShoot' && s.side === k.shooter && k.aim === null) k.aim = Math.max(-1.2, Math.min(1.2, Number(m.aim) || 0));
        else if (m.t === 'pensDive' && s.side !== k.shooter && k.dive === null) k.dive = [-1, 0, 1].includes(m.dive) ? m.dive : 0;
        if (k.aim !== null && k.dive !== null) resolve(s.duel);
        return true;
      }
      case 'pensLeave': {
        leaveWaiting(peer);
        const s = peer.pens; if (s) end(s.duel, 1 - s.side, true);
        return true;
      }
      default: return false;
    }
  }
  /** A socket closed: out of the queue, and a duel in progress goes to the other player. */
  function onClose(peer) {
    leaveWaiting(peer);
    const s = peer.pens; if (s) end(s.duel, 1 - s.side, true);
  }
  return { handle, onClose, _state: () => ({ queue: queue.length, rooms: rooms.size }) };
}

module.exports = { createPensHub, resolveKick, decided, KICKS };
