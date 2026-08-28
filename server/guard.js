/**
 * Server-side guards: rate limits, save validation, result validation.
 *
 * The game is client-authoritative by design — the browser simulates its own
 * matches and pushes the resulting save — and that is not going to change. So
 * this module is not pretending to make the client trustworthy. It does the
 * two things a server actually can:
 *
 *   1. **Bound the damage.** A tampered client cannot claim a balance that no
 *      amount of playing could produce, cannot grow one faster than playing
 *      would, and cannot hold more cards than exist.
 *   2. **Stop the cheap attacks outright.** Password guessing, account
 *      flooding, result forgery from a peer with no match, and messages sized
 *      to hurt the person on the other end of the relay.
 *
 * Every limit here is deliberately generous: the failure mode of a wrong
 * number must be "a cheat gets clamped a bit late", never "an honest player
 * loses progress". Everything clamped is logged with the account name, so the
 * numbers can be tightened against evidence rather than by feel.
 */

/* ------------------------------------------------------------------ *
 * Rate limiting — token buckets, in memory
 * ------------------------------------------------------------------ */
/* In memory, per process: one box runs this game, and a limiter that survives
 * restarts would need storage that a restart-happy host does not have. Losing
 * the counters on redeploy costs an attacker one redeploy of patience, which
 * is not the threat worth engineering for. */
const buckets = new Map();

/**
 * @param {string} key    what is being limited: `login:1.2.3.4`, `save:someone`
 * @param {number} max    tokens in a full bucket (a burst this big is allowed)
 * @param {number} perSec refill rate
 * @returns {boolean} true when the action is allowed, false when it is over
 */
function allow(key, max, perSec) {
  if (!peek(key, max, perSec)) return false;
  buckets.get(key).tokens -= 1;
  return true;
}

/** Is there a token left, without spending one? */
function peek(key, max, perSec) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) { b = { tokens: max, at: now }; buckets.set(key, b); }
  b.tokens = Math.min(max, b.tokens + ((now - b.at) / 1000) * perSec);
  b.at = now;
  return b.tokens >= 1;
}

/** Spend a token whether or not one was there. Used to charge for failures. */
function spend(key, max, perSec) {
  peek(key, max, perSec);
  const b = buckets.get(key);
  b.tokens = Math.max(-1, b.tokens - 1);
}

// buckets for connections and accounts that have gone away
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [k, b] of buckets) if (b.at < cutoff) buckets.delete(k);
}, 5 * 60 * 1000).unref();

/** The client's address, honouring one proxy hop (Render terminates TLS). */
function clientIP(req) {
  const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket?.remoteAddress || 'unknown';
}

/* Sign-in attempts are limited per address AND per account name, because
 * either alone is trivially sidestepped: per-IP only lets a botnet grind one
 * account, per-account only lets one machine grind every account. scrypt makes
 * each attempt expensive for the *server* too, so this doubles as protection
 * against burning the CPU that runs live matches. */
/* Only FAILURES are charged.
 *
 * The first cut of this spent a token on every attempt, per address as well as
 * per account — and a single wrong password from a household, a school or any
 * carrier-NAT connection then locked out everyone else behind that address.
 * A limiter that takes the game away from honest players is a worse bug than
 * the one it was written to prevent, so: a correct password costs nothing, and
 * the per-address budget is wide enough for a busy shared connection while
 * still ending an automated grind.
 *
 * The tight limit is per ACCOUNT, which is what is actually under attack. */
const LIMITS = {
  loginAcct: { max: 8, perSec: 8 / 600 },    // 8 wrong guesses at one account, then one per ~75s
  loginIP: { max: 40, perSec: 40 / 900 },    // 40 failures from one address per 15 min
  register: { max: 5, perSec: 5 / 3600 },    // 5 new accounts an hour per address
  save: { max: 30, perSec: 1 / 10 },         // a save every 10s sustained, 30 burst
  api: { max: 120, perSec: 4 },              // everything else
};

const acctKey = (name) => `login:who:${String(name || '').toLowerCase()}`;
const ipKey = (req) => `login:ip:${clientIP(req)}`;

/** May this sign-in even be attempted? Checks only — nothing is spent here. */
const loginAllowed = (req, name) =>
  peek(acctKey(name), LIMITS.loginAcct.max, LIMITS.loginAcct.perSec)
  && peek(ipKey(req), LIMITS.loginIP.max, LIMITS.loginIP.perSec);

/** Charge a wrong password to both budgets. Correct ones are free. */
function loginFailed(req, name) {
  spend(acctKey(name), LIMITS.loginAcct.max, LIMITS.loginAcct.perSec);
  spend(ipKey(req), LIMITS.loginIP.max, LIMITS.loginIP.perSec);
}
const registerAllowed = (req) => allow(`reg:${clientIP(req)}`, LIMITS.register.max, LIMITS.register.perSec);
const saveAllowed = (name) => allow(`save:${name}`, LIMITS.save.max, LIMITS.save.perSec);
const apiAllowed = (req) => allow(`api:${clientIP(req)}`, LIMITS.api.max, LIMITS.api.perSec);

/* ------------------------------------------------------------------ *
 * Cloud saves
 * ------------------------------------------------------------------ */
/* What the game can legitimately produce, with room to spare.
 *
 * APEX_CEILING: the top objective rung pays 200,000 and a division win a few
 * thousand; ten million is a player who has done everything, twice.
 *
 * APEX_PER_HOUR is a **rolling budget**, not a per-minute rate, and that
 * distinction is the whole design. The first cut of this capped growth per
 * minute, and a perfectly legal windfall — clearing the top objective rung for
 * 200,000, or selling a whole collection at once — was clamped as cheating.
 * Losing an honest player's coins to an anti-cheat is worse than the cheat.
 *
 * So: spend as much of the hour's million in one save as you like. Nothing in
 * the game pays anywhere near a million an hour (the richest single event is
 * 200,000, and that is a season's work), while the 19-million-coin incident
 * this exists for is stopped dead — and stays stopped, because a script that
 * re-sends every ten seconds is spending from the same hourly budget. */
const APEX_CEILING = 10_000_000;
const ULT_CEILING = 5_000;
const APEX_PER_HOUR = 1_000_000;
const GAIN_WINDOW = 60 * 60 * 1000;
const MAX_COLLECTION = 4_000;         // the world holds ~731 cards; a duplicate-free collection cannot approach this
const MAX_PACKS = 500;
const MAX_SAVE_BYTES = 256 * 1024;

const clampNum = (v, lo, hi, fallback = lo) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.floor(n))) : fallback;
};

/**
 * Sanitise a save on its way into storage.
 *
 * Returns `{ save, notes }` — the save to store, and a list of what had to be
 * corrected. Notes are for the log, not for the player: someone who has just
 * edited their balance does not need a receipt telling them which check caught
 * it. An honest client never produces a note.
 *
 * @param {object|null} incoming  what the client sent
 * @param {object|null} previous  what is already stored for this account
 * @param {number} sinceMs        wall clock since that stored save arrived
 */
function sanitiseSave(incoming, previous, sinceMs, gain) {
  const notes = [];
  if (incoming == null) return { save: null, notes };
  if (typeof incoming !== 'object' || Array.isArray(incoming)) {
    return { save: previous ?? null, notes: ['save was not an object — kept the previous one'] };
  }

  const bytes = Buffer.byteLength(JSON.stringify(incoming));
  if (bytes > MAX_SAVE_BYTES) {
    return { save: previous ?? null, notes: [`save was ${bytes} bytes (cap ${MAX_SAVE_BYTES}) — kept the previous one`] };
  }

  const save = incoming;
  const club = save.club;
  if (club && typeof club === 'object') {
    const before = previous?.club || {};

    // absolute ceilings
    const apex = clampNum(club.apex, 0, APEX_CEILING, 0);
    if (apex !== club.apex) notes.push(`apex ${club.apex} -> ${apex}`);

    /* Growth, against a rolling hourly budget. Only rises are counted —
     * spending is the player's own business and is never touched — and a save
     * with no stored predecessor (a first sync from a long offline career) is
     * taken as it comes, because there is nothing to compare it against. */
    const prevApex = clampNum(before.apex, 0, APEX_CEILING, 0);
    const rise = apex - prevApex;
    club.apex = apex;
    if (previous && rise > 0 && gain) {
      const now = Date.now();
      if (!gain.since || now - gain.since > GAIN_WINDOW) { gain.since = now; gain.spent = 0; }
      const left = Math.max(0, APEX_PER_HOUR - gain.spent);
      if (rise > left) {
        club.apex = prevApex + left;
        notes.push(`apex +${rise} exceeded the hourly budget (${left} left of ${APEX_PER_HOUR}) -> ${club.apex}`);
      }
      gain.spent += Math.min(rise, left);
    }

    const ult = clampNum(club.ultimate, 0, ULT_CEILING, 0);
    if (ult !== club.ultimate) notes.push(`ultimate ${club.ultimate} -> ${ult}`);
    club.ultimate = ult;

    /* A collection is a set of ids. Duplicates are the giveaway of a hand-
     * written save — the game holds one of each and pays coins for repeats —
     * and they are also what would make a squad screen render the same card
     * a thousand times. */
    if (Array.isArray(club.collection)) {
      const seen = new Set();
      const clean = [];
      for (const id of club.collection) {
        if (typeof id !== 'string' || id.length > 24) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        clean.push(id);
        if (clean.length >= MAX_COLLECTION) break;
      }
      if (clean.length !== club.collection.length) {
        notes.push(`collection ${club.collection.length} -> ${clean.length} entries`);
      }
      club.collection = clean;
    } else if (club.collection != null) {
      notes.push('collection was not an array — emptied');
      club.collection = [];
    }

    if (Array.isArray(club.packs)) {
      if (club.packs.length > MAX_PACKS) {
        notes.push(`packs ${club.packs.length} -> ${MAX_PACKS}`);
        club.packs = club.packs.slice(0, MAX_PACKS);
      }
      club.packs = club.packs.filter((p) => typeof p === 'string' && p.length <= 24);
    }
  }
  return { save, notes };
}

/* ------------------------------------------------------------------ *
 * Online results
 * ------------------------------------------------------------------ */
/* A scoreline that could actually have happened. Matches are three minutes;
 * double figures is already absurd, and the point is only to stop a forged
 * 99-0 rewriting the leaderboard. */
const MAX_GOALS = 30;

/**
 * Is this result allowed to be recorded at all?
 *
 * The check that matters is the first one: a peer with no opponent has no
 * match, and a peer with no match cannot have won one. Without it, signing in
 * and sending `{t:'result', scored:9, conceded:0}` on a loop was a leaderboard
 * with no football in it.
 */
function checkResult(peer, m) {
  if (!peer.acct) return { ok: false, why: 'not signed in' };
  if (!peer.opponent || !peer.matchId) return { ok: false, why: 'no match in progress' };
  if (peer.reported) return { ok: false, why: 'already reported' };
  const scored = clampNum(m.scored, 0, MAX_GOALS, 0);
  const conceded = clampNum(m.conceded, 0, MAX_GOALS, 0);
  return { ok: true, scored, conceded, divIdx: clampNum(m.divIdx, 0, 20, 0) };
}

/* ------------------------------------------------------------------ *
 * Socket message hygiene
 * ------------------------------------------------------------------ */
/* Relayed payloads are the one place a player can put bytes directly onto
 * someone else's machine. The hub forwards `snap`/`in`/`evt` verbatim without
 * reading them, which is what keeps it cheap — so the size ceiling has to do
 * the work instead. A snapshot is about a kilobyte. */
const MAX_RELAY_BYTES = 24 * 1024;
const SQUAD_MAX = 24;

/** A club identity from the wire: strings only, short, and no surprises. */
function cleanClub(club) {
  if (!club || typeof club !== 'object') return null;
  const str = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
  const colours = Array.isArray(club.colors)
    ? club.colors.slice(0, 2).map((c) => (typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#22c55e'))
    : ['#22c55e', '#0b1220'];
  return {
    name: str(club.name, 24) || 'Rival',
    short: str(club.short, 4) || 'RIV',
    colors: colours,
    shape: str(club.shape, 12),
    pattern: str(club.pattern, 12),
    device: str(club.device, 12),
  };
}

/** A squad from the wire: at most a bench and an XI of short id strings. */
function cleanSquad(squad) {
  if (!Array.isArray(squad)) return null;
  return squad.slice(0, SQUAD_MAX).filter((id) => typeof id === 'string' && id.length <= 24);
}

module.exports = {
  clientIP, allow, peek, spend,
  loginAllowed, loginFailed, registerAllowed, saveAllowed, apiAllowed,
  sanitiseSave, checkResult, cleanClub, cleanSquad,
  MAX_RELAY_BYTES, MAX_SAVE_BYTES, LIMITS,
};
