import { getState, update, DIVISIONS } from './state.js';
import { WORLD } from './data/generator.js';
import { SHAPES } from './game/sim.js';

/* ------------------------- the division opponent -------------------------
 *
 * The ladder used to field a real club: division 10 played the worst club in
 * the world, Apex Elite played the best. The best club in the world is rated
 * 86. An Ultimate XI with a few Icons in it is 90+, so the *ceiling of the
 * entire ladder* sat below a decent squad — you could reach division 5 without
 * losing a match and win 6-0, 9-0, 4-0, which is exactly what happened.
 *
 * The opponent is now built to measure. It tracks the squad you actually field,
 * so improving your team raises the bar rather than lowering it, and the
 * division decides whether you are favourite or underdog:
 *
 *     division 10   0.86x your rating   comfortable
 *     division 5    0.96x               a real game
 *     Apex Elite    1.06x               you are the underdog
 *
 * That is where the stress lives. A ladder you climb by collecting is not a
 * ladder; the collection has to buy you a *chance*, not a result.
 */

/** Positions a 4-3-3 asks for, in the order `SHAPES` lists them. */
const OPP_FORMATION = '4-3-3';

/** Club names down the ladder, so the run of fixtures reads as a competition. */
const OPP_CLUBS = [
  { name: 'Harrowgate Town', short: 'HGT', colors: ['#8a8f98', '#15171c'] },
  { name: 'Peldon Rangers', short: 'PEL', colors: ['#c0552f', '#1a1210'] },
  { name: 'Vasquine United', short: 'VAS', colors: ['#3f7fbf', '#0b1220'] },
  { name: 'Okrant Athletic', short: 'OKR', colors: ['#d4b03c', '#1c1809'] },
  { name: 'Serravalle FC', short: 'SRV', colors: ['#2f9e6b', '#0a1712'] },
  { name: 'Brackwater City', short: 'BRK', colors: ['#6b4fbf', '#120c1e'] },
  { name: 'Tarn Volante', short: 'TRN', colors: ['#bf3f5f', '#1a0c12'] },
  { name: 'Ashgrove Select', short: 'ASH', colors: ['#4fb8bf', '#08181a'] },
  { name: 'Kolvane Sporting', short: 'KOL', colors: ['#bf7a2f', '#1a1208'] },
  { name: 'Norvik Dynamo', short: 'NRV', colors: ['#e04a4a', '#160a0a'] },
  { name: 'Apex Select', short: 'APX', colors: ['#f0f4ff', '#0a0d16'] },
];

const clampStat = (v) => Math.max(28, Math.min(99, Math.round(v)));

/**
 * A card built to a target rating.
 *
 * Cloned off a real player so the name, nation and shape of the profile are a
 * footballer's rather than a spreadsheet's, then scaled to the number this
 * division needs. Scaling rather than searching the world for a 94 matters:
 * there are only 68 players above 88 in existence and they are the Icons and
 * Stars the *player* is collecting — pulling from that pool would field an
 * opponent made of the cards you are trying to win.
 */
function scaledCard(src, target, seq) {
  const scale = target / Math.max(40, src.overall);
  const stats = {};
  for (const k of Object.keys(src.stats)) stats[k] = clampStat(src.stats[k] * scale);
  return {
    ...src,
    id: `cpu${seq}`,
    overall: clampStat(target),
    stats,
    clubId: null,
  };
}

/**
 * @param {number} divIdx  index into DIVISIONS, 0 = Division 10
 * @param {number} yourRating  the average overall of the XI being fielded
 */
export function divisionOpponent(divIdx, yourRating) {
  const top = DIVISIONS.length - 1;
  const idx = Math.max(0, Math.min(top, divIdx));
  const club = OPP_CLUBS[idx] || OPP_CLUBS[OPP_CLUBS.length - 1];

  // relative to you, plus a floor so an unbuilt squad still meets a real team
  const relative = yourRating * (0.88 + idx * 0.022);
  const floor = 60 + idx * 2.6;
  const target = clampStat(Math.max(relative, floor));

  /* Pick the donor players by position so the profile fits the shirt — a
   * scaled-up centre-back should still be a centre-back. Donors are taken from
   * the middle of the world rather than the top, because a low-rated donor
   * scaled to 94 ends up with a shape nothing like a 94. */
  const shape = SHAPES[OPP_FORMATION];
  const pool = WORLD.players.filter((p) => p.clubId);
  const used = new Set();
  const pickDonor = (role) => {
    const wantGK = role === 'GK';
    let best = null;
    let bestD = Infinity;
    for (const p of pool) {
      if (used.has(p.id)) continue;
      if ((p.position === 'GK') !== wantGK) continue;
      const d = Math.abs(p.overall - target);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (best) used.add(best.id);
    return best;
  };

  let seq = 0;
  const xi = shape.map((s) => {
    const donor = pickDonor(s.role);
    return donor ? scaledCard(donor, target, seq++) : null;
  }).filter(Boolean);

  const bench = Array.from({ length: 5 }, () => {
    const donor = pickDonor(seq % 5 === 0 ? 'GK' : 'MID');
    return donor ? scaledCard(donor, target - 2, seq++) : null;
  }).filter(Boolean);

  return {
    xi,
    bench,
    name: club.name,
    short: club.short,
    colors: club.colors,
    crest: { shape: 'shield', pattern: 'stripes', device: 'peak', colors: club.colors },
    /* Higher divisions press and push up. This is a second difficulty lever and
     * a distinct one: `skill` decides how often the CPU tries something, while
     * the tactics decide how much room you get to do anything. */
    tactics: {
      mentality: idx >= 6 ? 'attacking' : 'balanced',
      /* High pressing from division 5 up, and this is the lever that actually
         bites a human. `pressing >= 1.4` is the threshold at which the sim
         sends a *second* presser at the ball carrier, so from here on you are
         not given time on the ball — which is the difference between a scoreline
         and a contest. Rating alone cannot do this: AI against AI, a 13-point
         rating advantage is worth about four points of win rate, while a human
         beats a same-rated CPU nearly every time. Competence is the lever. */
      pressing: idx >= 5 ? 'high' : idx >= 2 ? 'normal' : 'low',
    },
    rating: target,
  };
}

/** How hard the CPU tries, by rung. Was 0.75 -> 1.45; the top end was too kind. */
export function divisionSkill(divIdx) {
  return 0.8 + Math.max(0, divIdx) * 0.11;
}


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

/**
 * Ultimate, the second currency.
 *
 * Only the top of the ladder pays it, and only for a win. It is not a faster
 * Apex — it is the thing you cannot grind, which is what makes the Icon
 * Exchange it buys into worth wanting. A promotion into the top two divisions
 * is the entry fee.
 */
export function matchUltimate(divIdx, won) {
  if (!won) return 0;
  const top = DIVISIONS.length - 1;
  if (divIdx >= top) return 2;          // Apex Elite
  if (divIdx >= top - 1) return 1;      // Division 1
  return 0;
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
    ultimate: 0,
    // where the ladder now stands, so the result screen can say what is at
    // stake next time rather than only what just happened
    progress: 0,
    need: 0,
    possession: Math.round(possession),
    packs: [],
    objectivesDone: [],
  };

  update((s) => {
    const u = s.ultimate;
    if (!Array.isArray(u.objClaimed)) u.objClaimed = [];
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
    out.progress = u.progress;
    out.need = DIVISIONS[u.divIdx].need;

    // match reward — division sets the purse, possession scales it
    const reward = matchApex(div, { won, drew, poss: possession });
    out.apex += reward;
    s.club.apex += reward;

    // and the premium currency, which only the top of the ladder pays
    const ult = matchUltimate(u.divIdx, won);
    if (ult) { out.ultimate += ult; s.club.ultimate = (s.club.ultimate || 0) + ult; }
    // packs land in the store inventory unopened — you choose when to rip them
    if (won) { out.packs.push('silver'); s.club.packs.push('silver'); }
    if (out.promoted) {
      out.packs.push('gold');
      s.club.packs.push('gold');
      out.apex += 1500;
      s.club.apex += 1500;
    }

    /* Objectives.
     *
     * Matched by `metric` rather than by id, which is what lets a 24-rung
     * ladder reuse the same handful of ways a match can feed an objective —
     * adding a rung is a line of data, not a line of code here.
     *
     * `streak` and `rank` are set-to rather than added-to: your best run and
     * the division you have reached are states, not tallies, so a loss must not
     * be able to walk them backwards once banked. */
    const gain = {
      played: 1,
      win: won ? 1 : 0,
      goal: scored,
      clean: conceded === 0 ? 1 : 0,
      bigwin: won && scored - conceded >= 3 ? 1 : 0,
      control: won && possession >= 60 ? 1 : 0,
    };

    for (const o of u.objectives) {
      if (!o || o.done >= o.need) continue;
      if (o.metric === 'streak') o.done = Math.max(o.done, u.streak);
      else if (o.metric === 'rank') { if (u.divIdx >= (o.rank ?? 99)) o.done = o.need; }
      else o.done += gain[o.metric] || 0;
      if (o.done < o.need) continue;

      o.done = o.need;
      out.objectivesDone.push(o.text);
      out.apex += o.apex;
      s.club.apex += o.apex;
      if (o.ultimate) {
        out.ultimate += o.ultimate;
        s.club.ultimate = (s.club.ultimate || 0) + o.ultimate;
      }
      out.packs.push(o.pack);
      s.club.packs.push(o.pack);
      // banked against the ladder, so the finished rung is never dealt again
      if (!u.objClaimed.includes(o.id)) u.objClaimed.push(o.id);
    }
  });

  return out;
}

export function currentDivision() {
  return DIVISIONS[getState().ultimate.divIdx];
}
