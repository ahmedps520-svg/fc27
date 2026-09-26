import { rosterOf, getClub } from '../data/generator.js';
import { traitLevel, skillStars } from '../data/traits.js';
import { pickSkill } from './skills.js';
import { pickCelebration } from './celebrations.js';
import { DEF_STYLES, BUILD_UPS, ROLES, QUICK_TACTICS, defaultTactics, defaultRole, adaptFor } from './tactics.js';

/* ------------------------------------------------------------------ *
 * Real-time arcade match. Units are metres; the pitch is 105 x 68.
 * ------------------------------------------------------------------ */
/* v80: the field is data (game/field.js) — a full pitch unless a match asks
   for a small one. These are live bindings: re-exported so every importer of
   sim.js keeps working, and read at call time, never cached. */
import { PITCH, CY, GOAL_HALF, GOAL_HEIGHT, BOX, FIELD, SCALE, setField } from './field.js';
export { PITCH, GOAL_HALF, GOAL_HEIGHT, BOX, FIELD, setField };

/** v120: how quickly the person's player answers the stick — the same for everyone (it used to be a setting, and a sharper turn is an edge). */
export const RESPONSIVENESS = 0.7;

/**
 * Gameplay presets.
 *
 * The same match engine tuned two ways, because the two modes want opposite
 * things. Kick Off is a game of football and should behave like one: the ball
 * is heavy, defenders hold their shape, a tackle is a real risk and a parry
 * goes where physics sends it. Ultimate XI is a competition, and a competition
 * has to be readable — passes arrive quicker, the touch is tighter, keepers
 * steer their saves to safety, and defenders press rather than sit.
 *
 * Every field is a multiplier centred on 1, so the previous behaviour is
 * roughly the midpoint of the two. That is deliberate: it means neither preset
 * is "the old game" and both had to be swept.
 *
 * @see Match#preset
 */
export const PRESETS = {
  authentic: {
    id: 'authentic',
    name: 'Authentic',
    blurb: 'Heavier ball, disciplined shape, physics-driven rebounds.',
    passSpeed: 0.93,     // the ball takes its time
    control: 0.9,        // looser first touch
    hands: 0.95,         // keepers spill more
    deflect: 0.3,        // and a parry mostly goes where it was hit
    tackle: 1.08,        // defenders win what real defenders win
    discipline: 1.15,    // hold the line instead of chasing
  },
  competitive: {
    id: 'competitive',
    name: 'Competitive',
    blurb: 'Quicker passing, tighter control, keepers steer their saves.',
    passSpeed: 1.1,
    control: 1.12,
    // deliberately not raised: "sharper rebounds" is the steering below, not
    // better shot-stopping. Giving keepers both put the mode a third of a goal
    // a match under Authentic, which is backwards for the attacking preset.
    hands: 1,
    deflect: 0.85,
    tackle: 0.94,
    discipline: 0.9,
  },
};

/**
 * Formations in normalised coords: x = 0 own goal line, 1 = opponent goal line,
 * y = 0..1 across the pitch. Every shape is exactly 11 slots with one keeper.
 */
export const SHAPES = {
  '4-4-2': [
    { x: .045, y: .50, role: 'GK' },
    { x: .20, y: .16, role: 'DEF' }, { x: .16, y: .38, role: 'DEF' },
    { x: .16, y: .62, role: 'DEF' }, { x: .20, y: .84, role: 'DEF' },
    { x: .44, y: .13, role: 'MID' }, { x: .38, y: .40, role: 'MID' },
    { x: .38, y: .60, role: 'MID' }, { x: .44, y: .87, role: 'MID' },
    { x: .66, y: .36, role: 'FWD' }, { x: .66, y: .64, role: 'FWD' },
  ],
  '4-3-3': [
    { x: .045, y: .50, role: 'GK' },
    { x: .20, y: .15, role: 'DEF' }, { x: .16, y: .38, role: 'DEF' },
    { x: .16, y: .62, role: 'DEF' }, { x: .20, y: .85, role: 'DEF' },
    { x: .40, y: .28, role: 'MID' }, { x: .34, y: .50, role: 'MID' },
    { x: .40, y: .72, role: 'MID' },
    { x: .68, y: .16, role: 'FWD' }, { x: .72, y: .50, role: 'FWD' },
    { x: .68, y: .84, role: 'FWD' },
  ],
  '4-2-3-1': [
    { x: .045, y: .50, role: 'GK' },
    { x: .20, y: .15, role: 'DEF' }, { x: .16, y: .38, role: 'DEF' },
    { x: .16, y: .62, role: 'DEF' }, { x: .20, y: .85, role: 'DEF' },
    { x: .32, y: .38, role: 'MID' }, { x: .32, y: .62, role: 'MID' },
    { x: .56, y: .16, role: 'MID' }, { x: .54, y: .50, role: 'MID' },
    { x: .56, y: .84, role: 'MID' },
    { x: .74, y: .50, role: 'FWD' },
  ],
  '3-5-2': [
    { x: .045, y: .50, role: 'GK' },
    { x: .17, y: .28, role: 'DEF' }, { x: .14, y: .50, role: 'DEF' },
    { x: .17, y: .72, role: 'DEF' },
    { x: .46, y: .10, role: 'MID' }, { x: .36, y: .34, role: 'MID' },
    { x: .32, y: .50, role: 'MID' }, { x: .36, y: .66, role: 'MID' },
    { x: .46, y: .90, role: 'MID' },
    { x: .68, y: .38, role: 'FWD' }, { x: .68, y: .62, role: 'FWD' },
  ],
  '5-3-2': [
    { x: .045, y: .50, role: 'GK' },
    { x: .24, y: .10, role: 'DEF' }, { x: .15, y: .30, role: 'DEF' },
    { x: .12, y: .50, role: 'DEF' }, { x: .15, y: .70, role: 'DEF' },
    { x: .24, y: .90, role: 'DEF' },
    { x: .40, y: .30, role: 'MID' }, { x: .36, y: .50, role: 'MID' },
    { x: .40, y: .70, role: 'MID' },
    { x: .66, y: .38, role: 'FWD' }, { x: .66, y: .62, role: 'FWD' },
  ],
};

export const FORMATION_NAMES = Object.keys(SHAPES);
/** v80: five-a-side shapes — a keeper and four. */
export const SHAPES5 = {
  '1-2-1': [
    { x: .05, y: .50, role: 'GK' }, { x: .24, y: .50, role: 'DEF' },
    { x: .46, y: .22, role: 'MID' }, { x: .46, y: .78, role: 'MID' }, { x: .70, y: .50, role: 'FWD' },
  ],
  '2-2': [
    { x: .05, y: .50, role: 'GK' }, { x: .26, y: .30, role: 'DEF' }, { x: .26, y: .70, role: 'DEF' },
    { x: .62, y: .30, role: 'FWD' }, { x: .62, y: .70, role: 'FWD' },
  ],
  '2-1-1': [
    { x: .05, y: .50, role: 'GK' }, { x: .24, y: .30, role: 'DEF' }, { x: .24, y: .70, role: 'DEF' },
    { x: .46, y: .50, role: 'MID' }, { x: .72, y: .50, role: 'FWD' },
  ],
};
export const FIVES_NAMES = Object.keys(SHAPES5);
/* v82: the street — three and four a side, a keeper each */
export const SHAPES4 = {
  '1-2': [{ x: .05, y: .50, role: 'GK' }, { x: .28, y: .50, role: 'DEF' }, { x: .58, y: .26, role: 'FWD' }, { x: .58, y: .74, role: 'FWD' }],
  '2-1': [{ x: .05, y: .50, role: 'GK' }, { x: .26, y: .30, role: 'DEF' }, { x: .26, y: .70, role: 'DEF' }, { x: .62, y: .50, role: 'FWD' }],
  'diamond': [{ x: .05, y: .50, role: 'GK' }, { x: .26, y: .50, role: 'DEF' }, { x: .46, y: .50, role: 'MID' }, { x: .68, y: .50, role: 'FWD' }],
};
export const SHAPES3 = {
  '1-1': [{ x: .05, y: .50, role: 'GK' }, { x: .30, y: .50, role: 'DEF' }, { x: .62, y: .50, role: 'FWD' }],
  'split': [{ x: .05, y: .50, role: 'GK' }, { x: .45, y: .28, role: 'MID' }, { x: .45, y: .72, role: 'MID' }],
};
export const SHAPES1 = { solo: [{ x: .30, y: .50, role: 'FWD' }] };
const SMALL = { 5: [SHAPES5, '1-2-1'], 4: [SHAPES4, '1-2'], 3: [SHAPES3, '1-1'], 1: [SHAPES1, 'solo'] };
const shapesFor = () => (SMALL[FIELD.players]?.[0] || SHAPES);
const defaultShape = () => { const s = SMALL[FIELD.players]; return s ? s[0][s[1]] : SHAPES['4-4-2']; };
export const shapeNamesFor = (n) => Object.keys(SMALL[n]?.[0] || SHAPES);
const SHAPE = SHAPES['4-4-2'];

/** Natural role of a generated player, used when re-slotting into a new shape. */
const ROLE_OF = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  LW: 'FWD', RW: 'FWD', ST: 'FWD',
};

export const MENTALITY = { defensive: 0.72, balanced: 1, attacking: 1.32, allout: 1.55 };
export const PRESSING = { low: 0.7, normal: 1, high: 1.4 };

/** How many can sit on the bench, and how many of them can come on. */
export const BENCH_SIZE = 5;
export const MAX_SUBS = 3;

const GRAV = 16;                   // arcade gravity, m/s^2

/* Behaviour knobs the balance harness can flip. Defaults are the game. */
/* shotRate / tackleRate: v86 retune after the drive() fix (see HANDOFF, "Everyone turns") */
export const TUNE = { drop: 2, squeeze: 0.93, counter: true, sweeper: true, runs: true, keeperDist: true, shotRate: 0.7, tackleRate: 0.6, boxCare: 0.35, support: true, advantage: true, boxRuns: true };

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** +1 for a right-footed player, -1 for a left-footed one. */
const strongSide = (p) => (p.ref.foot === 'L' ? -1 : 1);

function pickXI(clubId) {
  const pool = rosterOf(clubId).slice().sort((a, b) => b.overall - a.overall);
  const take = (list, n, used) => pool.filter((p) => list.includes(p.position) && !used.has(p)).slice(0, n);
  const used = new Set();
  const add = (arr) => { arr.forEach((p) => used.add(p)); return arr; };
  const xi = [
    ...add(take(['GK'], 1, used)),
    ...add(take(['CB', 'LB', 'RB'], 4, used)),
    ...add(take(['CDM', 'CM', 'CAM', 'LM', 'RM'], 4, used)),
    ...add(take(['ST', 'LW', 'RW'], 2, used)),
  ];
  for (const p of pool) { if (xi.length >= 11) break; if (!used.has(p)) { xi.push(p); used.add(p); } }
  if (FIELD.players < 11) return smallFrom(xi, FIELD.players);
  return xi.slice(0, 11);
}
/** The best `n` of an eleven for small-sided football: a keeper, then the best outfielders by role (v82). */
export function smallFrom(xi, n) {
  if (n === 5) return fivesFrom(xi);
  const role = (p) => ROLE_OF[p.position] || 'MID';
  if (n === 1) return [xi.filter((p) => role(p) !== 'GK').sort((a, b) => b.overall - a.overall)[0] || xi[0]];
  const gk = xi.filter((p) => role(p) === 'GK').sort((a, b) => b.overall - a.overall)[0];
  const rest = xi.filter((p) => p !== gk).sort((a, b) => b.overall - a.overall);
  const want = n === 4 ? ['DEF', 'FWD', 'FWD'] : ['DEF', 'FWD'];
  const out = [gk];
  for (const r of want) { const i = rest.findIndex((p) => role(p) === r || (r === 'FWD' && role(p) === 'MID')); out.push(i >= 0 ? rest.splice(i, 1)[0] : rest.shift()); }
  return out.filter(Boolean).slice(0, n);
}
/** A keeper, a defender, two midfielders and a forward, the best of an eleven (v80). */
export function fivesFrom(xi) {
  const role = (p) => ROLE_OF[p.position] || 'MID';
  const by = (r) => xi.filter((p) => role(p) === r).sort((a, b) => b.overall - a.overall);
  const out = [by('GK')[0], by('DEF')[0], ...by('MID').slice(0, 2), by('FWD')[0]];
  for (const p of xi.slice().sort((a, b) => b.overall - a.overall)) { if (out.filter(Boolean).length >= 5) break; if (!out.includes(p)) out[out.findIndex((q) => !q)] = p; }
  return out.filter(Boolean).slice(0, 5);
}

/**
 * @param {object} custom optional { xi, name, short, colors } to field a squad
 *   that is not a club roster — how an Ultimate XI takes the pitch.
 */
/**
 * Everything about a player that comes off his card. Split out because a
 * substitution swaps the card underneath a shirt and every one of these has to
 * be recomputed — a fresh 90-pace winger coming on for a spent 70-pace one has
 * to actually be faster.
 *
 * `stamina` starts full, which is the whole point of a bench.
 */
function attributesOf(ref) {
  const st = ref.stats;
  // v79: the traits the match reads, as levels (0, 1, or 1.6 for the elite tier)
  const tr = {};
  for (const id of ['finesse', 'engine', 'rock', 'quick', 'sweeper', 'pinged', 'aerial', 'trickster', 'anchor', 'cannon', 'velvet', 'deadball']) {
    const l = traitLevel(ref, id); if (l) tr[id] = l;
  }
  return {
    maxSpeed: 5.4 + (st.pace / 100) * 3.8,
    // 1 is fresh, 0 is spent. A strong physical player empties slower and
    // fills faster, which is most of what the stat is for.
    stamina: 1,
    stamCost: (1.35 - (st.physical / 100) * 0.6) * (tr.engine ? 1 - 0.22 * tr.engine : 1),
    /* v79: momentum. How quickly he gets up to speed (per second), and how fast
       he can swing his heading round (radians per second at a jog — much less
       at a sprint). Pace and a Quick Step buy the first; balance on the ball
       the second. */
    accel: 5.2 + st.pace * 0.045 + (tr.quick || 0) * 1.8,
    turn: 6.2 + st.dribbling * 0.035 + (tr.quick || 0) * 1.4,
    strength: st.physical + (tr.rock || 0) * 8,
    control: (st.dribbling * 0.6 + st.passing * 0.4) / 100 + (tr.velvet || 0) * 0.12,
    stars: skillStars(ref),
    tr,
  };
}

/**
 * How hard this player goes in, 0..1.
 *
 * Physicality and a defender's instinct push it up; the touch that lets
 * someone take the ball instead of the man pulls it down. Seeded off the
 * card's own id so a given footballer is the same nuisance in every match,
 * rather than a coin flip per kick-off.
 */
function aggressionOf(ref) {
  const st = ref.stats;
  const base = (st.physical * 0.5 + st.defending * 0.5 - st.dribbling * 0.35) / 100;
  const back = ['CB', 'LB', 'RB', 'CDM'].includes(ref.position) ? 0.16 : ref.position === 'GK' ? -0.4 : 0;
  // a stable per-player wobble, so two identical centre-halves are not identical
  let h = 2166136261;
  for (const ch of String(ref.id || ref.name || '')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return clamp(base + back + ((h % 1000) / 1000 - 0.5) * 0.24, 0.02, 1);
}

function makeTeam(clubId, side, isHuman, custom = null) {
  const club = getClub(clubId);
  const n = FIELD.players;
  const xi = custom?.xi?.length === n ? custom.xi : custom?.xi?.length > n && n < 11 ? smallFrom(custom.xi, n) : pickXI(clubId);
  const SHAPE = defaultShape();
  const dir = side === 0 ? 1 : -1;

  const players = xi.map((ref, i) => {
    const s = SHAPE[i];
    const sx = side === 0 ? s.x : 1 - s.x;
    const sy = side === 0 ? s.y : 1 - s.y;
    return {
      ref, num: i + 1, team: side, role: s.role, sx, sy,
      x: sx * PITCH.w, y: sy * PITCH.h, vx: 0, vy: 0,
      dirX: dir, dirY: 0,
      ...attributesOf(ref),
      touchLock: 0, stumble: 0, holdT: 0, slide: 0, diveT: 0, diveDir: 0,
      skillT: 0, injured: false, runUntil: 0,
      /* How willing this one is to fly in. A physical, defensive-minded player
         with little composure will lunge from further out and more often than
         a technician will — and a lunge from further out is exactly what the
         referee books people for (see `tackle`). Seeded off the card, so the
         same footballer is the same nuisance every match. */
      aggression: aggressionOf(ref),
      tRole: (ROLES[custom?.tactics?.roles?.[i]]?.pos === s.role ? custom.tactics.roles[i] : null) || defaultRole(ref, s),     // v79: what he does inside his slot
      downT: 0,          // seconds spent on the grass after being fouled
      cards: 0,          // yellows
    };
  });

  /* The bench.
   *
   * A custom squad brings its own; a club falls back to the best of its roster
   * that did not make the eleven. Without that, a Quick Match against a real
   * club would have nobody to bring on and substitutions would be a feature
   * only one side of the pitch had.
   */
  const onPitch = new Set(xi.map((r) => r.id));
  const bench = (custom?.bench?.filter(Boolean).length ? custom.bench.filter(Boolean) : null)
    || rosterOf(clubId)
      .filter((r) => !onPitch.has(r.id))
      .sort((a, b) => b.overall - a.overall)
      .slice(0, BENCH_SIZE);

  return {
    clubId, club,
    name: custom?.name || club.name,
    short: custom?.short || club.short,
    colors: custom?.colors || club.crest.colors,
    kit: custom?.kit || null,          // v115: a designed club's home and away strips (data/kitDesign.js)
    dir, side, isHuman,
    players, bench, subsLeft: MAX_SUBS,
    score: 0, shots: 0, onTarget: 0, poss: 0, scorers: [],
    formation: SMALL[n]?.[1] || '4-4-2',
    // a custom squad may bring an instruction with it — the Apex Division uses
    // this to make the CPU press and push up the higher you climb
    tactics: { ...defaultTactics(), ...(custom?.tactics || {}) },
    // v81: a career names its set-piece takers ({ pen, fk, corner }: card ids)
    takers: custom?.takers || null,
  };
}

/** A named set-piece taker, if the side has one on the pitch (v81). */
const namedTaker = (team, kind) => {
  const id = team.takers?.[kind];
  return id ? team.players.find((p) => p.ref.id === id && p.role !== 'GK' && !p.injured) || null : null;
};

export class Match {
  constructor(homeId, awayId, opts = {}) {
    // v80: the field comes first — every distance below reads it
    setField(opts.field || 'full');
    this.field = FIELD.id;
    // mode: 'single' | 'versus' | 'coop'. human === null runs both sides on AI.
    this.mode = opts.mode || 'single';
    this.human = opts.human === null ? null : (opts.human ?? 0);
    this.teams = [
      makeTeam(homeId, 0, this.human === 0, opts.homeSquad || null),
      makeTeam(awayId, 1, this.human === 1, opts.awaySquad || null),
    ];

    // One seat per person at the couch. Each keeps its own selected player and
    // its own shot charge, so two people never fight over the same footballer.
    const last = FIELD.players - 1;
    if (opts.seats?.length) {
      /* v82: a party — any number of people, on either side, one seat each,
         in the order the server dealt them (the snapshot relies on it) */
      const used = [0, 0];
      this.controllers = opts.seats.map((st) => ({ team: st.team, activeIdx: Math.max(1, last - used[st.team]++), charge: 0, passCharge: 0 }));
      for (const t of [0, 1]) if (opts.seats.some((st) => st.team === t)) this.teams[t].isHuman = true;
    } else if (this.human === null) this.controllers = [];
    else if (this.mode === 'versus') {
      this.controllers = [{ team: 0, activeIdx: last, charge: 0, passCharge: 0 },
        { team: 1, activeIdx: last, charge: 0, passCharge: 0 }];
      this.teams[1].isHuman = true;
    } else if (this.mode === 'coop') {
      this.controllers = [{ team: 0, activeIdx: last, charge: 0, passCharge: 0 },
        { team: 0, activeIdx: last - 1, charge: 0, passCharge: 0 }];
    } else {
      this.controllers = [{ team: this.human, activeIdx: last, charge: 0, passCharge: 0 }];
    }
    this.duration = opts.duration ?? 240;      // real seconds for the whole match
    this.skill = opts.skill ?? 1;              // CPU aggression multiplier
    /* How much the CPU has raised its game, 0-1. See `updateMomentum`. */
    this.momentum = 0;
    // Authentic unless asked otherwise, so a mode that has not thought about it
    // gets the football one rather than the esports one.
    this.preset = PRESETS[opts.preset] || PRESETS.authentic;
    // v84 hotfix: how quickly a person's player answers the stick (0–1, Settings → Controls)
    // v120: one feel for everyone — a setting that sharpens your turning is an edge, so it is fixed
    this.responsiveness = RESPONSIVENESS;
    // v87: a person's assists (Settings → Accessibility); the CPU never reads them
    this.celebration = typeof opts.celebration === 'string' ? opts.celebration : 'random';   // v110: a person's own side's goal celebration
    this.assist = { shoot: opts.assist?.shoot ? 1 : 0, pass: [0, 1, 2].includes(opts.assist?.pass) ? opts.assist.pass : 1 };
    this.ball = { x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null };
    /* Out-of-bounds ledger. `bounds()` already rules on every ball that leaves
     * the pitch — throw-in, corner, goal kick, goal — but it ruled silently:
     * nothing outside the sim could tell a restart had happened. The counter
     * ticks once per stoppage and `stoppage` names the last kind, which is what
     * the online pause queue watches for a legal moment to stop the game. */
    this.stoppages = 0;
    this.stoppage = null;
    /* v81: per-player numbers for match ratings, keyed by card id so a
       substitution never mixes two men's figures. Counting only — nothing
       here reads the dice, so the balance sweep is untouched. */
    this.pst = {};
    this.t = 0;
    this.half = 1;
    this.phase = 'kickoff';
    this.phaseT = 1.4;
    this.banner = 'KICK OFF';
    this.activeIdx = 10;
    this.basis = null;                 // set each frame from the camera by the renderer
    this.charge = 0;
    this.feed = [];
    this.cues = [];              // audio cues drained by the play screen each frame
    /* v69 — set pieces, injuries and the stat sheet.
     * `setPiece` is the dead ball being waited on: kind, team, taker and
     * whether a person is taking it (in which case the phase waits on their
     * stick and buttons, up to `phaseT`, instead of an AI timer). */
    this.setPiece = null;
    this.injuries = [];          // { team, name, minute }
    this.fouls = [0, 0];
    this.offsides = [0, 0];          // v79
    this.offsideWatch = null;
    this.advantage = null; this.advantages = [0, 0]; this.advantageBack = [0, 0];   // v113
    this.bookings = [];          // { team, name, minute } — yellows
    this.lastOwnerTeam = null;
    this.kickoffSide = 1;
    this.resetPositions(0);
  }

  /* ------------------------------ state ------------------------------ */
  get humanTeam() { return this.human === null ? null : this.teams[this.human]; }
  /** Player held by seat 0 — kept for anything that only knows about one human. */
  /**
   * The one side a person is playing, or null if that is not a thing here.
   *
   * Couch versus and online both seat a human on each team, and there is no CPU
   * to raise the game of; co-op seats two people on the same team, which is
   * still one human side. Momentum below needs to know the difference.
   */
  get soloHumanSide() {
    if (this.human === null || !this.controllers.length) return null;
    const t = this.controllers[0].team;
    return this.controllers.every((c) => c.team === t) ? t : null;
  }

  /**
   * How hard the CPU on `team` is trying *right now*.
   *
   * `skill` is the match's baseline — `divisionSkill` sets it from the rung you
   * are on, 0.8 at the bottom to 1.9 at the top, 0.11 a rung. Momentum adds up
   * to 0.45 on top, so a side under full momentum plays about four rungs above
   * its own, using the same lever the ladder already uses.
   *
   * **Only the side you are not on gets it.** `skill` drives the off-ball AI of
   * *both* teams — your own ten team-mates included — so adding it globally
   * would have sharpened your press in exact step with theirs and largely
   * cancelled itself out. The boost is asked for by team for that reason.
   *
   * **And it only ever adds.** Momentum is clamped to 0 at the bottom, so the
   * floor is the baseline the match was created with: cruising cannot make the
   * opposition worse than the division it belongs to.
   */
  /**
   * This player's appetite for a challenge right now: his own temperament,
   * lifted by a side that is behind and running out of match, and dropped
   * hard by a booking — a man on a yellow keeps his feet.
   */
  aggressionOf(p) {
    const behind = this.teams[1 - p.team].score - this.teams[p.team].score;
    const late = Math.min(1, this.t / Math.max(1, this.duration));
    const chase = behind > 0 ? Math.min(0.3, behind * 0.1) * (0.35 + late) : 0;
    const booked = p.cards > 0 ? 0.5 : 1;
    return clamp((p.aggression + chase) * booked, 0, 1);
  }

  aiSkillFor(team) {
    /* Manager Career: nobody holds a stick, but one side has a manager on the
     * touchline whose team performance meter is allowed to move the needle —
     * up to ±0.22 skill around the baseline. That is what makes a shout, a
     * team talk and a morale collapse *visible in the football* rather than
     * being a number on a HUD. `mgrSide`/`mgrPerf` are written by the match
     * screen; absent (every other mode), this line is a no-op. */
    const mgr = (this.mgrSide === team && typeof this.mgrPerf === 'number')
      ? (this.mgrPerf - 0.5) * 0.44 : 0;
    const me = this.soloHumanSide;
    if (me === null || team === me) return this.skill + mgr;
    return this.skill + 0.45 * this.momentum + mgr;
  }

  /**
   * Momentum: the CPU raises its game when the match has stopped being one.
   *
   * A three-goal lead with two minutes left is the most boring state this game
   * can be in — the result is settled and nothing that happens next matters.
   * Rather than hand the player a win that plays itself, the opposition starts
   * pressing harder, closing quicker and shooting sooner the further ahead you
   * get, so seeing out a big lead is its own thing to do.
   *
   * One goal is a match, so nothing happens there. It ramps from two, and tops
   * out at a four-goal lead.
   *
   * Rise is quicker than fall on purpose: going 3-0 up should be answered
   * within a few seconds, while the CPU pulling one back should not instantly
   * hand the advantage straight back to you — the lead has to actually be
   * defended for a while before the game eases off again.
   *
   * AI-vs-AI is skipped outright. That is the configuration every balance sweep
   * runs, and it is the baseline the whole economy is tuned against; quietly
   * moving it whenever one CPU went two up would invalidate every number in
   * this file's header.
   */
  updateMomentum(dt) {
    const me = this.soloHumanSide;
    if (me === null) { this.momentum = 0; return; }
    const lead = this.teams[me].score - this.teams[1 - me].score;
    const target = Math.max(0, Math.min(1, (lead - 1) / 3));
    const rate = target > this.momentum ? 1.1 : 0.3;
    this.momentum += (target - this.momentum) * Math.min(1, rate * dt);
  }

  get active() { return this.playerOf(this.controllers[0]); }
  /** Every player currently under human control. */
  get actives() { return this.controllers.map((c) => this.playerOf(c)).filter(Boolean); }

  playerOf(c) { return c ? this.teams[c.team].players[c.activeIdx] : null; }

  /** Street style (v82): points for skills and wall play, chained when they come quickly. Counting only. */
  styleOf(side) { const t = this.teams[side]; return t.style || (t.style = { points: 0, skills: 0, walls: 0, goals: 0, stylish: 0, chain: 0, last: -99 }); }
  styleEvent(p, kind, pts) {
    if (!FIELD.street || !p) return;
    const st = this.styleOf(p.team);
    st[kind] += 1;
    st.chain = this.t - st.last < 5 ? Math.min(5, st.chain + 1) : 1;
    st.last = this.t;
    st.points += pts * st.chain;
  }

  /** Count something a player did (v81). */
  tally(p, k, n = 1) {
    const id = p?.ref?.id; if (!id) return;
    const r = this.pst[id] || (this.pst[id] = { passes: 0, shots: 0, tackles: 0, saves: 0, dist: 0, on: 0, off: null, team: p.team });
    r[k] += n;
  }
  /** Minutes on the pitch for a card id, in match minutes. */
  minutesOf(id) {
    const r = this.pst[id]; if (!r) return 0;
    const end = r.off ?? this.t;
    return Math.round(((end - r.on) / Math.max(1, this.duration)) * 90);
  }
  isControlled(p) { return this.controllers.some((c) => !c.ai && this.playerOf(c) === p); }
  minute() { return Math.min(90, Math.floor((this.t / this.duration) * 90)); }
  possession() {
    const total = this.teams[0].poss + this.teams[1].poss || 1;
    const h = Math.round((this.teams[0].poss / total) * 100);
    return [h, 100 - h];
  }

  resetPositions(kickoffSide) {
    this.kickoffSide = kickoffSide;
    for (const team of this.teams) {
      for (const p of team.players) {
        p.x = p.sx * PITCH.w;
        p.y = p.sy * PITCH.h;
        p.vx = p.vy = 0;
        p.touchLock = p.stumble = p.holdT = p.slide = p.downT = 0;
        p.celebrating = false; p.celebKind = null;
        p.diveT = 0;
      }
      // pull the shape back into its own half for the restart
      const half = team.dir > 0;
      for (const p of team.players) {
        if (half && p.x > PITCH.w / 2 - 2) p.x = PITCH.w / 2 - 2 - (p.role === 'FWD' ? 3 : 8);
        if (!half && p.x < PITCH.w / 2 + 2) p.x = PITCH.w / 2 + 2 + (p.role === 'FWD' ? 3 : 8);
      }
    }
    const takers = this.teams[kickoffSide].players;
    const taker = takers.find((p) => p.role === 'FWD')
      || takers.find((p) => p.role === 'MID') || takers[takers.length - 1];
    taker.x = PITCH.w / 2 - this.teams[kickoffSide].dir * 1.6;
    taker.y = CY;
    this.kickoffTaker = taker;
    this.selectForKickoff();
    Object.assign(this.ball, {
      x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0,
      owner: null, lastTouch: null, inNet: null, curl: 0,
    });
    this.kickoffTaker = taker;
  }

  startPlay() {
    if (this.phase === 'goal' || this.phase === 'kickoff') {
      this.ball.owner = this.kickoffTaker;
      this.kickoffTaker.touchLock = 0;
      this.cue('whistle', 1);
    }
    this.phase = 'play';
    this.banner = '';
  }

  /* ------------------------------ update ----------------------------- */
  update(dt, input) {
    this.step(dt, input);
    /* v103: parked men go back off the pitch after every path through the
       step — the dead-ball phases return early, and a goal's celebration and
       walk back used to bring the whole parked side on in the practice arena */
    if (this.parkedAny) this.repark();
  }

  step(dt, input) {
    if (this.phase === 'end') return;
    if (this.locked) this.lockSeats();
    if (this.parkedAny) this.repark();
    /* Anyone on the grass gets up on his own clock, not the phase's. A foul
     * puts the game into a set piece immediately, so a timer that only ran
     * during play would leave him lying there through the whole free kick. */
    for (const team of this.teams) {
      for (const p of team.players) {
        if (p.downT > 0) { p.downT = Math.max(0, p.downT - dt); p.vx *= 0.82; p.vy *= 0.82; }
      }
    }

    const seats = Array.isArray(input) ? input : [input];

    if (this.phase !== 'play') {
      this.phaseT -= dt;
      if (this.phase === 'goal') this.updateCelebration(dt);
      // a person's set piece: their stick aims it and their button takes it
      if (this.setPiece?.human && this.phaseT > 0) {
        const c = this.controllers.find((k) => k.team === this.setPiece.team);
        const inp = c ? (seats[this.controllers.indexOf(c)] || seats[0]) : null;
        if (c && inp && this.readSetPieceInput(c, inp, dt)) return;
      }
      if (this.phaseT <= 0) {
        if (this.phase === 'corner') { this.takeCorner(); return; }
        if (this.phase === 'penalty') { this.takePenalty(); return; }
        if (this.phase === 'freekick') { this.takeFreeKick(); return; }
        if (this.phase === 'throwin') { this.takeThrowIn(); return; }
        if (this.phase === 'goal') this.resetPositions(this.pendingKickoff ?? 0);
        if (this.phase === 'half') { this.half = 2; this.resetPositions(0); this.adaptAI(true); }
        this.startPlay();
      }
      return;
    }

    this.t += dt;
    this._dt = dt;
    if (this.t / Math.max(1, this.duration) > 0.8) {
      this._adaptT = (this._adaptT || 0) - dt;
      if (this._adaptT <= 0) { this._adaptT = 5; this.adaptAI(false); }
    }
    this.updateMomentum(dt);
    this.updateAdvantage(dt);

    if (this.half === 1 && this.t >= this.duration / 2) {
      this.phase = 'half'; this.phaseT = 1.8; this.banner = 'HALF TIME';
      this.cue('whistle', 2);
      return;
    }
    if (this.t >= this.duration) {
      this.phase = 'end'; this.banner = 'FULL TIME';
      this.cue('whistle', 3);
      return;
    }

    if (this.ball.owner) this.teams[this.ball.owner.team].poss += dt;

    /* Counter-attack trigger: the ball changes hands in the winner's own half
     * and the whole side breaks for three and a half seconds — forwards run
     * the channels, the carrier looks long. Real football's most watchable
     * moment, and the one a shape-holding AI never produced on its own. */
    if (this.ball.owner) {
      const t = this.ball.owner.team;
      if (t !== this.lastOwnerTeam) {
        const ownHalf = (this.ball.x - PITCH.w / 2) * this.teams[t].dir < 0;
        // a break is winning it off a side that had settled on the ball, deep,
        // and not more often than every twelve seconds — a loose-ball scramble
        // that changes hands every second is not a counter-attack
        if (this.lastOwnerTeam !== null && ownHalf && (this.possessT || 0) > 2.5
            && this.t - (this.lastCounterAt || -99) > 12) {
          this.teams[t].counterT = 2.8 * this.buildUpOf(t).counter;
          this.lastCounterAt = this.t;
          this.cue('counter', t);
        }
        this.lastOwnerTeam = t;
        this.possessT = 0;
      }
      this.possessT = (this.possessT || 0) + dt;
    }
    for (const team of this.teams) team.counterT = Math.max(0, (team.counterT || 0) - dt);

    this._tick = (this._tick || 0) + 1;
    this.chasers = [this.nearestTo(0, this.ball, true), this.nearestTo(1, this.ball, true)];
    this.chasers2 = [
      this.pressingOf(0) >= 1.4 ? this.secondNearest(0, this.ball) : null,
      this.pressingOf(1) >= 1.4 ? this.secondNearest(1, this.ball) : null,
    ];

    // two nearest team-mates to the carrier become the short passing options
    this.supporters = [null, null];
    const carrier = this.ball.owner;
    if (carrier) {
      const mates = this.teams[carrier.team].players
        .filter((q) => q !== carrier && q.role !== 'GK' && !q.parked)   // v103: a parked man (the practice arena) is nobody's option
        .sort((a, z) => dist(a, carrier) - dist(z, carrier));
      this.supporters[carrier.team] = [mates[0], mates[1]];
    }
    // v133: runs into the box while a team-mate has it in the crossing zone
    this.boxRuns = [null, null];
    if (TUNE.boxRuns && carrier) this.boxRuns[carrier.team] = this.pickBoxRuns(carrier, dt);

    // one input per seat; a single Input is still accepted for solo play
    this.controllers.forEach((c, i) => {
      const inp = seats[i] || seats[0];
      if (inp) this.handleSeat(c, dt, inp);
    });

    for (const team of this.teams) {
      for (const p of team.players) {
        p.touchLock = Math.max(0, p.touchLock - dt);
        p.stumble = Math.max(0, p.stumble - dt);
        p.slide = Math.max(0, p.slide - dt);
        p.skillT = Math.max(0, (p.skillT || 0) - dt);
        if (p.spinT > 0) p.spinT = Math.max(0, p.spinT - dt);
        if (p.burst) {
          p.burst.t -= dt;
          if (p.burst.t <= 0) { p.vx += p.burst.vx; p.vy += p.burst.vy; p.burst = null; }
        }
        if (this.isControlled(p)) continue;
        this.think(p, dt);
      }
    }

    for (const team of this.teams) {
      for (const p of team.players) {
        this.integrate(p, dt);
        this.fatigue(p, dt);
      }
    }
    this.separate();
    this.updateBall(dt);
    this.switchOnPossession();
    if (this.locked) this.lockSeats();
    if (this.parkedAny) this.repark();
  }

  /**
   * Practice (v82): take players out of the game entirely — the practice arena
   * parks the opposition bar the keeper. A parked man stands far off the
   * pitch and is put back there every step, so no AI, tackle or pickup ever
   * reaches him. Offside goes with them.
   */
  park(teamIdx, test = (p) => p.role !== 'GK') {
    for (const p of this.teams[teamIdx].players) if (test(p)) p.parked = true;
    this.parkedAny = true;
    this.noOffside = true;
    this.repark();
  }
  repark() {
    if (this.phase === 'freekick') return;            // practice keeps a wall to beat
    for (const t of this.teams) for (const p of t.players) if (p.parked) { p.x = -300; p.y = -300; p.vx = p.vy = 0; }
  }

  /**
   * Player lock (v81, the Player Career): a seat with `lockId` only ever
   * steers that one footballer. Returns false when he is not on the pitch
   * (subbed off, or not picked) — the match plays on without a stick.
   */
  lockPlayer(cardId, seat = this.controllers[0]) {
    if (!seat) return false;
    seat.lockId = cardId;
    this.locked = true;
    return this.lockSeats();
  }
  lockSeats() {
    let ok = true;
    for (const c of this.controllers) {
      if (!c.lockId) continue;
      const i = this.teams[c.team].players.findIndex((p) => p.ref.id === c.lockId);
      if (i >= 0) { c.activeIdx = i; c.benched = false; } else { c.benched = true; ok = false; }
    }
    return ok;
  }
  /** The locked footballer, or null. */
  lockedPlayer(c = this.controllers[0]) {
    if (!c?.lockId) return null;
    return this.teams[c.team].players.find((p) => p.ref.id === c.lockId) || null;
  }

  /**
   * Control follows the ball whenever your side has it — including a teammate
   * receiving your pass. Off the ball nothing moves on its own; you pick with L1/R1.
   */
  switchOnPossession() {
    const o = this.ball.owner;
    if (!o) return;
    const seats = this.controllers.filter((c) => c.team === o.team && !c.lockId);
    if (!seats.length) return;
    if (seats.some((c) => this.playerOf(c) === o)) return;   // someone already has him

    // hand the carrier to whichever seat was closest to him
    let best = seats[0];
    let bestD = Infinity;
    for (const c of seats) {
      const d = dist(this.playerOf(c), o);
      if (d < bestD) { bestD = d; best = c; }
    }
    const i = this.teams[best.team].players.indexOf(o);
    if (i >= 0) best.activeIdx = i;
    this.dedupeSeats();
  }

  /** Two people must never end up steering the same footballer. */
  dedupeSeats() {
    for (let i = 1; i < this.controllers.length; i++) {
      const c = this.controllers[i];
      const taken = this.controllers.slice(0, i).map((o) => this.playerOf(o));
      if (!taken.includes(this.playerOf(c))) continue;
      let best = null;
      let bestD = Infinity;
      for (const p of this.teams[c.team].players) {
        if (p.role === 'GK' || taken.includes(p)) continue;
        const d = dist(p, this.ball);
        if (d < bestD) { bestD = d; best = p; }
      }
      if (best) c.activeIdx = this.teams[c.team].players.indexOf(best);
    }
  }

  /* -------------------------- substitutions -------------------------- */
  /**
   * Bring a bench player on for someone on the pitch.
   *
   * The shirt stays where it is — same slot, same role, same shape duty — and
   * only the card underneath it changes, so a substitution can never leave a
   * formation with a hole in it. Position, velocity and possession are all
   * inherited: swapping a man carrying the ball hands the ball to the man
   * coming on rather than dropping it, which is wrong but is a great deal
   * better than a loose ball appearing from nowhere.
   *
   * @param {number} teamIdx
   * @param {number} pitchIdx index into `team.players`
   * @param {number} benchIdx index into `team.bench`
   * @returns {boolean} whether it happened
   */
  substitute(teamIdx, pitchIdx, benchIdx) {
    const team = this.teams[teamIdx];
    if (!team || team.subsLeft <= 0) return false;
    const p = team.players[pitchIdx];
    const incoming = team.bench?.[benchIdx];
    if (!p || !incoming) return false;
    // Once off, off: a man who has been substituted cannot come back on (he used
    // to — fresh, and cured if he had gone off injured).
    if (this.cameOff(incoming.id)) return false;
    // A keeper comes off for a keeper or the goal is left to a winger.
    if (p.role === 'GK' && incoming.position !== 'GK') return false;

    this.tally(p, 'dist', 0); this.pst[p.ref.id].off = this.t;
    team.bench[benchIdx] = p.ref;      // the man coming off takes the seat
    p.ref = incoming;
    Object.assign(p, attributesOf(incoming));
    p.touchLock = 0; p.stumble = 0; p.slide = 0; p.downT = 0; p.diveT = 0; p.injured = false; p.skillT = 0; p.spinT = 0; p.burst = null; p.skillKind = null;
    team.subsLeft -= 1;
    this.tally(p, 'dist', 0); this.pst[incoming.id] && (this.pst[incoming.id].on = this.t);
    this.cue('whistle');
    return true;
  }

  /* ----------------------------- movement ---------------------------- */
  /**
   * Stamina.
   *
   * Drained by how hard a player is running rather than by whether a button is
   * held, so the CPU tires on the same terms a person does. It costs nothing to
   * jog: the drain only bites above roughly two-thirds of a player's top speed,
   * which is the point at which a footballer is actually working. Recovery is
   * slower than the drain, so a match spent sprinting has a price late on.
   *
   * A tired player is slower, never stopped — 82% of top speed at zero is
   * enough to feel and not enough to make the game unplayable.
   *
   * The three numbers below were swept AI-vs-AI, not chosen by feel. They land
   * the league on 2.25 goals and 12.4 shots a match, against 3.20 and 12.5
   * before stamina existed, and leave the players who chase the ball all game
   * near empty at full time while a holding midfielder is barely touched.
   */
  fatigue(p, dt) {
    const speed = Math.hypot(p.vx, p.vy);
    const effort = speed / p.maxSpeed;
    if (effort > 0.66) {
      p.stamina -= (effort - 0.66) * p.stamCost * 0.06 * dt;
    } else {
      // standing still recovers fastest, a jog still recovers
      p.stamina += (0.66 - effort) * 0.075 * dt;
    }
    p.stamina = clamp(p.stamina, 0, 1);
  }

  integrate(p, dt) {
    const pr = this.pst[p.ref.id];
    if (pr) pr.dist += Math.hypot(p.vx, p.vy) * dt; else this.tally(p, 'dist', 0);
    if (p.slide > 0) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.94; p.vy *= 0.94;
    } else {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    p.x = clamp(p.x, 0.5, PITCH.w - 0.5);
    p.y = clamp(p.y, 0.5, PITCH.h - 0.5);
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 0.6) { p.dirX = p.vx / sp; p.dirY = p.vy / sp; }
  }

  /**
   * Movement with momentum (v79).
   *
   * The old model lerped the velocity at nine per second, which let anyone
   * turn on a dime at full sprint — the single thing that most made the game
   * feel like pushing counters. Now a player's heading swings round at his own
   * turn rate, and much slower the faster he is going; asked to go back the
   * way he came at speed he plants a foot and brakes first; and he gets up to
   * speed at his own acceleration. A quick, balanced player cuts; a big one
   * carries on past you.
   */
  /**
   * The person's player (v84 hotfix). The v79 model below — a turn rate that
   * shrinks with speed, a planted foot for a sharp change — is right for the
   * CPU's players and was wrong for the one under a thumb: a 180° at a jog
   * took 1.7 s, swinging out wide, and the player felt like a brick. Here the
   * velocity chases the stick directly, so any direction, straight back
   * included, is where the player goes within a few frames; the only weight
   * left is a slight softening at full sprint. `responsiveness` (0–1) scales
   * the rates; since v120 it is the same fixed value for every player.
   */
  driveHuman(p, dx, dy, dt, factor = 1) {
    if (p.slide > 0 || p.downT > 0) return;
    const m = Math.min(1, Math.hypot(dx, dy));
    const tired = 0.9 + p.stamina * 0.1;
    const speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.6 : 1);
    const L = Math.hypot(dx, dy) || 1;
    // analogue, but generous: half a push is already full speed (a thumb on
    // glass rarely goes further); only a light touch walks
    const push = Math.max(0.35, Math.min(1, (m - 0.08) / 0.42));
    const tx = m > 0.001 ? (dx / L) * speed * push : 0;
    const ty = m > 0.001 ? (dy / L) * speed * push : 0;
    const R = this.responsiveness;
    const cur = Math.hypot(p.vx, p.vy);
    const sprinting = factor > 1.05;
    // momentum builds over a sustained sprint and fades over a quarter second, so
    // a turn out of a flat-out run carries a little weight all the way round
    const frac = sprinting ? Math.min(1, cur / (p.maxSpeed * factor)) : 0;
    p.humanMom = (p.humanMom || 0) + (frac - (p.humanMom || 0)) * (1 - Math.exp(-(frac > (p.humanMom || 0) ? 2.5 : 4) * dt));
    /* jog: 16–34 per second (a full 180 in ~0.07–0.14 s); at the top of a
       sprint 30–65% of that — about 0.2 s at the default — which is all the
       momentum there is */
    const base = 16 + 18 * R;
    const rate = m > 0.001 ? base * (1 - p.humanMom * p.humanMom * (0.7 - 0.35 * R)) : base * 1.2;   // letting go stops him quickly too
    const k = 1 - Math.exp(-rate * dt);
    p.vx += (tx - p.vx) * k;
    p.vy += (ty - p.vy) * k;
    p.planted = false;
  }

  drive(p, dx, dy, dt, factor = 1) {
    if (p.slide > 0 || p.downT > 0) return;
    const m = Math.hypot(dx, dy);
    const tired = 0.82 + p.stamina * 0.18;
    const speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.45 : 1);
    const cur = Math.hypot(p.vx, p.vy);
    let tx = m > 0.001 ? (dx / m) * speed : 0;
    let ty = m > 0.001 ? (dy / m) * speed : 0;
    p.planted = false;
    if (cur > 0.6 && m > 0.001 && p.role !== 'GK') {          // keepers shuffle; they are not sprinting
      const cx = p.vx / cur; const cy = p.vy / cur;
      const wx = dx / m; const wy = dy / m;
      const dot = cx * wx + cy * wy;
      const frac = Math.min(1, cur / p.maxSpeed);
      if (dot < -0.25 && frac > 0.7) {
        // too sharp at this speed: plant and brake along the current line
        tx = cx * cur * 0.3; ty = cy * cur * 0.3;
        p.planted = true;
      } else {
        const want = Math.atan2(wy, wx); const have = Math.atan2(cy, cx);
        let da = want - have;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const omega = (p.turn || 9) * (1.6 - 0.9 * frac);
        const maxTurn = omega * dt;
        const a = have + clamp(da, -maxTurn, maxTurn);
        /* v86: a target inside his turning circle cannot be reached at this
           speed — he would circle it for ever (a loose ball in a street cage
           was orbited for ten seconds by both players). Ease off to the speed
           at which the turn does reach it: radius = speed / omega, and a
           point at distance m and bearing da needs 2·r·|sin da| ≤ m. */
        const side = Math.abs(Math.sin(da));
        let v = speed;
        if (side > 0.05 && m < 2 * (cur / omega) * side) v = Math.min(speed, Math.max(1.5, (m * omega) / (2 * side)));
        /* v86: the heading turns by the capped amount and only the speed is
           eased. Blending the whole vector towards an already-capped heading
           applied the cap and then 15% of it, so a runner really turned at
           about 1 rad/s — an eight-metre circle at a sprint, the "brick" —
           and twice as sharply at 30 fps as at 60. */
        const k = Math.min(1, dt * (v > cur ? (p.accel || 9) : 11));
        const nv = cur + (v - cur) * k;
        p.vx = Math.cos(a) * nv; p.vy = Math.sin(a) * nv;
        return;
      }
    }
    const faster = tx * tx + ty * ty > cur * cur;
    const k = Math.min(1, dt * (faster ? (p.accel || 9) : 11));
    p.vx += (tx - p.vx) * k;
    p.vy += (ty - p.vy) * k;
  }

  moveTo(p, x, y, dt, factor = 1) {
    const dx = x - p.x;
    const dy = y - p.y;
    const d = Math.hypot(dx, dy);
    this.drive(p, dx, dy, dt, d < 1.6 ? factor * (d / 1.6) : factor);
  }

  separate() {
    const all = [...this.teams[0].players, ...this.teams[1].players];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < 2.1) {
          const push = (2.1 - d) / 2;
          /* v79: shoulder to shoulder. Between opponents the push is not shared
             evenly — the stronger man holds his line and the weaker one is
             moved off it — and a duel for the ball can knock someone off it. */
          let wa = 0.5;
          if (a.team !== b.team && a.role !== 'GK' && b.role !== 'GK') {
            const sa = a.strength || 70; const sb = b.strength || 70;
            wa = clamp(sb / (sa + sb), 0.2, 0.8);          // share of the push a takes
            this.duel(a, b, sa, sb, d);
          }
          a.x -= (dx / d) * push * 2 * wa; a.y -= (dy / d) * push * 2 * wa;
          b.x += (dx / d) * push * 2 * (1 - wa); b.y += (dy / d) * push * 2 * (1 - wa);
        }
      }
    }
    this.protectKeeper();
  }

  /**
   * A shoulder duel between two opponents in contact (v79). Only when the ball
   * is at stake: one of them has it, or it is loose between them. The weaker
   * can stumble; a carrier who does loses it, and the ball runs on loose; and a
   * strong man arriving from behind can be penalised for the push.
   */
  duel(a, b, sa, sb, d) {
    const ball = this.ball;
    const carrier = ball.owner === a ? a : ball.owner === b ? b : null;
    const loose = !ball.owner && dist(a, ball) < 3 && dist(b, ball) < 3;
    if (!carrier && !loose) return;
    const dt = this._dt || 1 / 60;
    /* v79: the trip. A carrier going past a defender — quicker than him, the
       defender beaten and stretching — can be brought down; the more
       aggressive the defender, the likelier. */
    if (carrier) {
      const def = carrier === a ? b : a;
      const cs = Math.hypot(carrier.vx, carrier.vy); const ds = Math.hypot(def.vx, def.vy);
      const beaten = (def.x - carrier.x) * (carrier.dirX || 0) + (def.y - carrier.y) * (carrier.dirY || 0) < 0.3;
      if (cs > ds + 0.6 && beaten && def.downT <= 0 && Math.random() < (0.7 + this.aggressionOf(def) * 1.6) * (this.inPenaltyArea(carrier, def.team) ? TUNE.boxCare : 1) * dt) {
        this.fouls[def.team] += 1;
        this.cue('foul', def);
        carrier.downT = 1.2; carrier.downMax = 1.2;
        carrier.stumble = Math.max(carrier.stumble, 1.6);
        if (this.aggressionOf(def) > 0.75 && def.cards < 1 && Math.random() < 0.3) { def.cards += 1; this.cue('card', def); this.bookings.push({ team: def.team, name: def.ref.name, minute: this.minute() }); }
        if (this.inPenaltyArea(carrier, def.team)) this.awardPenalty(1 - def.team, def);
        else this.awardFreeKick(1 - def.team, carrier, def);
        return;
      }
    }
    /* v79: a battle on the touchline. Pinned against the line with a man on
       him, the carrier often loses it off one of them over the line — the
       commonest throw-in in real football. */
    if (carrier) {
      const edge = Math.min(carrier.y, PITCH.h - carrier.y);
      if (edge < 7 && Math.random() < (1.4 - edge * 0.15) * dt) {
        const def = carrier === a ? b : a;
        const off = Math.random() < 0.5 ? carrier : def;
        ball.owner = null; ball.lastTouch = off; ball.noTouch = 0.4;
        ball.vx = carrier.vx * 0.5; ball.vy = (carrier.y < CY ? -1 : 1) * (4 + Math.random() * 3);
        carrier.touchLock = 0.4;
        this.cue('jostle', carrier);
        return;
      }
    }
    const [weak, strong] = sa < sb ? [a, b] : [b, a];
    const edge = Math.abs(sa - sb) / 100;
    if (weak.stumble <= 0 && Math.random() < (0.35 + edge * 2.2) * dt) {
      weak.stumble = 0.3 + edge;
      this.cue('jostle', weak);
      if (carrier === weak) {
        // knocked off it: the ball runs on without him
        ball.owner = null; ball.lastTouch = weak; ball.noTouch = 0.12;
        ball.vx = weak.vx * 0.9 + (strong.dirX || 0) * 1.5; ball.vy = weak.vy * 0.9 + (strong.dirY || 0) * 1.5;
        weak.touchLock = 0.35;
        // from behind, with a shove, is a foul
        const behind = (strong.dirX * weak.dirX + strong.dirY * weak.dirY) > 0.55 && (strong.x - weak.x) * weak.dirX + (strong.y - weak.y) * weak.dirY < 0;
        if (behind && Math.random() < (0.35 + this.aggressionOf(strong) * 0.4 - (strong.tr?.rock ? 0.2 : 0)) * (this.inPenaltyArea(weak, strong.team) ? TUNE.boxCare : 1)) {
          this.fouls[strong.team] += 1;
          this.cue('foul', strong);
          weak.downT = 0.9; weak.downMax = 0.9;
          if (this.inPenaltyArea(weak, strong.team)) this.awardPenalty(1 - strong.team, strong);
          else this.awardFreeKick(1 - strong.team, weak, strong);
        }
      }
    }
  }

  /**
   * While a keeper is holding the ball, opponents are kept out of a ring around
   * them until the ball is released — you cannot stand over a goal kick.
   */
  protectKeeper() {
    const o = this.ball.owner;
    if (!o || o.role !== 'GK') return;
    const R = 7.5;
    for (const p of this.teams[1 - o.team].players) {
      const dx = p.x - o.x;
      const dy = p.y - o.y;
      const d = Math.hypot(dx, dy) || 0.01;
      if (d >= R) continue;
      const push = (R - d);
      p.x += (dx / d) * push;
      p.y += (dy / d) * push;
      // bleed their momentum so they cannot bulldoze back in
      p.vx *= 0.2;
      p.vy *= 0.2;
      p.x = clamp(p.x, 0.5, PITCH.w - 0.5);
      p.y = clamp(p.y, 0.5, PITCH.h - 0.5);
    }
  }

  /* ------------------------------ human ------------------------------ */
  /** Drive one seat's player. Called once per controller per frame. */
  handleSeat(c, dt, input) {
    if (c.ai || c.benched) return;                 // v82: a dropped seat plays on the CPU until its owner is back
    const p = this.playerOf(c);
    if (!p) return;
    // Input arrives in screen space (up is negative). `basis` holds the camera's
    // ground axes, so the stick always agrees with the screen: up the stick moves
    // the player up the screen, right moves right.
    const raw = input.axis();
    const B = this.basis;
    const fwd = -raw.y;
    const aim = B
      ? { x: B.rx * raw.x + B.fx * fwd, y: B.ry * raw.x + B.fy * fwd }
      : { x: raw.x, y: fwd };

    const owns = this.ball.owner === p;
    /* v90: jockey — held while the other side has it: slower, square on to
       the carrier, feet under him, so the stick shadows rather than chases */
    const carrier = this.ball.owner && this.ball.owner.team !== p.team ? this.ball.owner : null;
    const jockey = !owns && carrier && input.held('jockey');
    this.driveHuman(p, aim.x, aim.y, dt, jockey ? 0.62 : input.held('sprint') ? 1.24 : 1);
    if (jockey) {
      const jx = carrier.x - p.x; const jy = carrier.y - p.y; const jd = Math.hypot(jx, jy) || 1;
      p.dirX = jx / jd; p.dirY = jy / jd;
    }

    if (input.pressed('switch')) this.cycleActive(c);

    /* v90: the right stick. A flick (pushed hard from rest) is a skill move
       that way with the ball, and a switch to the team-mate that way without it. */
    const r = input.rstick?.() || { x: 0, y: 0 };
    const rm = Math.hypot(r.x, r.y);
    if (rm > 0.72 && (c.rPrev || 0) < 0.35) {
      const rAim = B ? { x: B.rx * r.x + B.fx * -r.y, y: B.ry * r.x + B.fy * -r.y } : { x: r.x, y: -r.y };
      if (owns) this.skillMove(p, rAim, input.held('sprint') ? 'sprint' : null);
      else this.switchToward(c, p, rAim);
    }
    c.rPrev = rm;

    if (owns) {
      /* Pass charges the same way a shot does: hold for a longer, harder ball,
       * tap for a short one. It fires on release rather than on press, which is
       * the only way a hold can mean anything — and it reads identically on a
       * keyboard, a thumb and a pad, because all three land on the same action.
       *
       * A tap still has to be instant to the player's eye, and it is: release
       * follows press by one frame, so the ball leaves on the next tick. */
      if (input.held('pass')) c.passCharge = Math.min(1, c.passCharge + (dt / 0.7) * (0.6 + 0.4 * (input.value?.('pass') ?? 1)));   // v90: a lighter press on an analogue button charges slower
      if (input.released('pass')) {
        // A tap is one frame of hold, which on its own would be a 3-yard nudge.
        // The floor keeps a quick pass playing exactly as it always did; the
        // hold is what buys anything above it.
        this.pass(p, aim, false, Math.max(0.3, c.passCharge), false, this.assist.pass);
        c.passCharge = 0;
      }
      if (input.pressed('through')) this.pass(p, aim, true, 0.5);
      /* v107: LOB added to a held SHOOT is the chip's modifier (below), not a
         lob pass of its own — it was, and the chip could never be played */
      else if (input.pressed('lob') && !input.held('skill') && !input.held('shoot')) this.pass(p, aim, true, 0.55, true);
      else if (input.pressed('cross')) {
        // v79: cross with the stick pulled back = cut-back; with the curl button held = driven; otherwise floated
        const back = (aim.x * this.teams[p.team].dir) < -0.35;
        this.cross(p, aim, back ? 'cutback' : input.held('curl') ? 'driven' : 'floated');
      }
      /* v79: skill combos. Hold the skill button, point the stick, add a
         modifier (sprint, curl or lob) and let go: the trick fires on the
         release. While it is held, the modifier's own action (a lob pass) is
         swallowed. A touch swipe on the skill button carries its own. */
      const g = input.takeGesture?.();
      if (g) {
        const gAim = B ? { x: B.rx * g.x + B.fx * -g.y, y: B.ry * g.x + B.fy * -g.y } : { x: g.x, y: -g.y };
        this.skillMove(p, Math.hypot(g.x, g.y) > 0.2 ? gAim : null, g.mod);
      }
      if (input.held('skill')) {
        c.skillMod = input.held('sprint') ? 'sprint' : input.held('curl') ? 'curl' : input.held('lob') ? 'lob' : (c.skillMod || null);
      }
      if (input.released('skill')) { this.skillMove(p, aim, c.skillMod || null); c.skillMod = null; }
      if (input.held('shoot')) c.charge = Math.min(1, c.charge + (dt / 0.85) * (0.6 + 0.4 * (input.value?.('shoot') ?? 1)));
      if (input.released('shoot')) {
        // R1 held with the shot whips it up and bends it; the lob button held
        // with it chips the keeper — a soft, high, dipping ball
        const curled = input.held('curl');
        const chip = input.held('lob');
        /* v87: the timing assist — the power is chosen from the distance to
           goal (firm close in, full from range) instead of from the hold */
        if (this.assist.shoot) {
          const gx = this.teams[p.team].dir > 0 ? PITCH.w : 0;
          const dist = Math.hypot(gx - p.x, CY - p.y);
          c.charge = chip ? 0.5 : Math.max(0.42, Math.min(0.92, 0.3 + dist / 38));
        }
        this.shoot(p, aim, Math.max(0.28, c.charge), {
          loft: chip ? 2.6 : curled ? 0.9 : 1,
          curl: curled ? 46 : 0,
          chip,
        });
        c.charge = 0;
      }
    } else {
      c.charge = 0;
      c.passCharge = 0;      // losing the ball mid-hold must not bank a pass
      /* v90: the defending set. Shoot slides in; pass or cross is the
         standing challenge; jockey (held) shadows the carrier, slower and
         facing him, and never lunges; press (held) sends the nearest
         team-mate to close the carrier down alongside you. */
      c.jockey = input.held('jockey');
      c.press2 = input.held('press');
      if (input.pressed('shoot') && !c.jockey) this.tackle(p, { slide: true });
      else if ((input.pressed('pass') || input.pressed('cross')) && !c.jockey) this.tackle(p);
    }
    this.charge = this.controllers[0]?.charge || 0;
    this.passCharge = this.controllers[0]?.passCharge || 0;
  }

  /** v90: right-stick switching — the team-mate the flick points at (bearing first, then distance). */
  switchToward(c, from, dir) {
    if (!c || c.lockId) return;
    const dm = Math.hypot(dir.x, dir.y) || 1;
    const taken = this.controllers.filter((o) => o !== c).map((o) => this.playerOf(o));
    let best = null; let bestScore = -Infinity;
    for (const q of this.teams[c.team].players) {
      if (q === from || q.role === 'GK' || taken.includes(q)) continue;
      const dx = q.x - from.x; const dy = q.y - from.y; const d = Math.hypot(dx, dy) || 1;
      const align = (dx * dir.x + dy * dir.y) / (d * dm);
      if (align < 0.5) continue;
      const score = align * 2 - d / 40;
      if (score > bestScore) { bestScore = score; best = q; }
    }
    if (best) { c.activeIdx = this.teams[c.team].players.indexOf(best); this.cue('switch', best); }
  }

  /** L1 / R1 — jump to whoever is closest to the ball, skipping the other seat's man. */
  cycleActive(c = this.controllers[0]) {
    if (!c || c.lockId) return;
    const taken = this.controllers.filter((o) => o !== c).map((o) => this.playerOf(o));
    let best = null;
    let bestD = Infinity;
    for (const p of this.teams[c.team].players) {
      if (p.role === 'GK' || taken.includes(p)) continue;
      const d = dist(p, this.ball);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (best) c.activeIdx = this.teams[c.team].players.indexOf(best);
  }

  /**
   * Re-slot a side into a different shape, keeping the same eleven players and
   * giving each slot the best natural fit still available.
   */
  applyFormation(teamIdx, name) {
    const shape = shapesFor()[name];
    if (!shape || shape.length !== this.teams[teamIdx].players.length) return;
    const team = this.teams[teamIdx];
    const used = new Set();

    const take = (role) => {
      let best = null;
      let bestScore = -1;
      for (const p of team.players) {
        if (used.has(p)) continue;
        const nat = ROLE_OF[p.ref.position] || 'MID';
        // a natural keeper must never fill an outfield slot, and vice versa
        if ((nat === 'GK') !== (role === 'GK')) continue;
        const s = (nat === role ? 300 : 0) + p.ref.overall;
        if (s > bestScore) { bestScore = s; best = p; }
      }
      if (!best) best = team.players.find((p) => !used.has(p));
      used.add(best);
      return best;
    };

    for (const slot of shape) {
      const p = take(slot.role);
      if (!p) continue;
      p.role = slot.role;
      { const r = team.tactics?.roles?.[team.players.indexOf(p)]; p.tRole = ROLES[r]?.pos === slot.role ? r : defaultRole(p.ref, slot); }
      p.sx = teamIdx === 0 ? slot.x : 1 - slot.x;
      p.sy = teamIdx === 0 ? slot.y : 1 - slot.y;
    }
    team.formation = name;
  }

  setTactic(teamIdx, key, value) {
    const t = this.teams[teamIdx].tactics;
    if (key in t) t[key] = value;
  }

  mentalityOf(teamIdx) { return MENTALITY[this.teams[teamIdx].tactics.mentality] ?? 1; }
  pressingOf(teamIdx) {
    const t = this.teams[teamIdx].tactics;
    // v79: the defensive style multiplies the old pressing instruction; a bad touch or a back pass triggers the press
    const trig = this.pressTrigger && this.pressTrigger.team === teamIdx && this.t - this.pressTrigger.t < 1.4 ? 1.35 : 1;
    return (PRESSING[t.pressing] ?? 1) * (DEF_STYLES[t.defStyle]?.press ?? 1) * trig;
  }
  /** v79: how good the CPU's choices are — the difficulty lever, instead of better numbers. */
  decisionQuality(teamIdx) { return clamp(0.66 + this.aiSkillFor(teamIdx) * 0.18, 0.7, 0.99); }
  buildUpOf(teamIdx) { return BUILD_UPS[this.teams[teamIdx].tactics.buildUp] || BUILD_UPS.balanced; }
  /** A person flicking to one of the five quick tactics mid-match. */
  setQuickTactic(teamIdx, id) {
    const q = QUICK_TACTICS.find((x) => x.id === id);
    if (!q) return false;
    Object.assign(this.teams[teamIdx].tactics, q.set, { quick: id });
    this.cue('tactic', { team: teamIdx, id, name: q.name });
    return true;
  }
  /** The CPU re-reads the game: at half-time, and every few seconds in the last fifth. */
  adaptAI(atHalf) {
    const late = this.t / Math.max(1, this.duration);
    for (const [i, team] of this.teams.entries()) {
      if (team.isHuman || this.controllers.some((c) => c.team === i)) continue;
      const diff = team.score - this.teams[1 - i].score;
      const ch = adaptFor(diff, late, atHalf);
      if (!ch) continue;
      const before = `${team.tactics.mentality}|${team.tactics.defStyle}`;
      Object.assign(team.tactics, ch);
      if (`${team.tactics.mentality}|${team.tactics.defStyle}` !== before) this.cue('adapt', { team: i, ...ch });
    }
  }

  /** Only ever called at a restart, so you never lose the controlled player mid-play. */
  selectForKickoff() {
    if (!this.kickoffTaker) return;
    const seat = this.controllers.find((c) => c.team === this.kickoffSide && !c.lockId);
    if (!seat) return;
    const i = this.teams[seat.team].players.indexOf(this.kickoffTaker);
    if (i >= 0) seat.activeIdx = i;
    this.dedupeSeats();
  }

  /* ------------------------------- ball ------------------------------ */
  updateBall(dt) {
    const b = this.ball;

    if (b.owner) {
      const o = b.owner;
      b.z = 0.16;
      b.vz = 0;
      if (o.role === 'GK') {
        o.holdT += dt;
        b.x = o.x + o.dirX * 1.1;
        b.y = o.y + o.dirY * 1.1;
        b.vx = b.vy = 0;
        // Distribution with intent: a full-back or midfielder in space gets it
        // rolled out; nobody free and it goes long over the top.
        if (o.holdT > (this.teams[o.team].tactics.tempo === 'slow' ? 2.6 : 0.9)) {   // v79: seeing the game out, he takes his time
          o.holdT = 0;
          const team = this.teams[o.team];
          const free = team.players.filter((q) => q !== o && q.role !== 'GK' && dist(q, o) < 34)
            .map((q) => [q, this.nearestTo(1 - o.team, q)])
            .filter(([q, f]) => !f || dist(q, f) > 7)
            .sort((x, y) => dist(x[0], o) - dist(y[0], o))[0];
          if (TUNE.keeperDist && free && Math.random() < 0.7) this.pass(o, { x: free[0].x - o.x, y: free[0].y - o.y }, false, 0.45);
          else this.pass(o, { x: team.dir, y: (Math.random() - 0.5) * 0.5 }, true, 0.85);
        }
        return;
      }
      // Dribbling is a series of touches, not a rigid attachment. The ball is
      // knocked ahead and then rolls on its own until the next touch, so it lags,
      // drifts and rolls instead of floating at a fixed offset.
      const speed = Math.hypot(o.vx, o.vy);
      const dx = b.x - o.x;
      const dy = b.y - o.y;
      const gap = Math.hypot(dx, dy);
      const skill = o.ref.stats.dribbling / 100;

      // Sprung to a point ahead of the dribbler rather than pinned there: it
      // lags on turns, overshoots when they stop, and gets knocked on between
      // touches. Fully detaching it was tried and it simply rolled away — the
      // carrier AI runs at the goal, not at the ball.
      const lead = 0.85 + speed * 0.13;
      // Foot preference: the ball sits on the strong side rather than dead in
      // front, so a right-footed winger carries it on his right and has to
      // shift it to strike with the other one. `strongSide` is +1 for a right
      // foot, and (dirY, -dirX) is the player's own right-hand direction.
      const off = 0.34 * strongSide(o);
      const tx = o.x + o.dirX * lead + o.dirY * off;
      const ty = o.y + o.dirY * lead - o.dirX * off;

      const stiff = (30 + skill * 26) * this.preset.control;   // better dribblers keep it tighter
      const damp = 10;
      b.vx += ((tx - b.x) * stiff - b.vx * damp) * dt;
      b.vy += ((ty - b.y) * stiff - b.vy * damp) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      /* Touch intervals.
       *
       * A knock-on every so often, so the ball is played rather than towed —
       * but how often, and how far, is the difference between a dribbler and
       * someone running alongside a football. A good one takes many small
       * touches and keeps it under him; a poor one hits it a long way and
       * chases. Everybody shortens up with an opponent breathing on them.
       *
       * Both multipliers are centred on skill 0.75, so a typical gold card
       * behaves exactly as it did before any of this existed and only the ends
       * of the range moved.
       */
      o.touchT = (o.touchT || 0) - dt;
      if (o.touchT <= 0 && speed > 1.2) {
        const foe = this.nearestTo(1 - o.team, o);
        const tight = foe && dist(o, foe) < 4 ? 0.75 : 1;
        const push = (0.8 + speed * 0.26) * (1.3 - skill * 0.4);
        b.vx += o.dirX * push;
        b.vy += o.dirY * push;
        o.touchT = (0.3 + Math.random() * 0.16) * tight * (1.25 - skill * 0.33);
        this.cue('touch');
      }

      b.lastTouch = o;
      /* v79: a dribble can go out of play. The ball is sprung ahead of the
         carrier, so running at the line used to carry it past the line
         without the game noticing — and a shot from there was released inside
         the goal and given. Now the moment the ball crosses a line it is out. */
      if (b.x < 0.4 || b.x > PITCH.w - 0.4 || b.y < 0.4 || b.y > PITCH.h - 0.4) {
        b.owner = null;
        o.touchLock = 0.3;
        b.vx = o.vx; b.vy = o.vy;
        // a ball dribbled over the goal line between the posts is not a goal
        if ((b.x < 0.4 || b.x > PITCH.w - 0.4) && Math.abs(b.y - CY) < GOAL_HALF + 0.3) b.y = CY + Math.sign(b.y - CY || 1) * (GOAL_HALF + 0.4);
        this.bounds();
      }
      return;
    }

    // Magnus effect: sidespin pushes the ball perpendicular to its travel, so a
    // curled strike bends through the air and straightens as it slows.
    if (b.curl) {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 1.5) {
        const k = (b.curl * sp) / 58;
        const vx0 = b.vx;
        const vy0 = b.vy;
        b.vx += (-vy0 / sp) * k * dt;
        b.vy += (vx0 / sp) * k * dt;
      }
      b.curl *= Math.pow(0.5, dt);
      if (b.z <= 0) b.curl = 0;
    }

    /* v79: topspin and the knuckleball. A driven strike dips — extra drop on
       top of gravity — and a struck-through, spinless one wobbles side to
       side on its way. Both are set by `shoot` and die when the ball lands. */
    if (b.z > 0.05) {
      if (b.dip) b.vz -= GRAV * b.dip * dt;
      if (b.knuckle) {
        const sp = Math.hypot(b.vx, b.vy) || 1;
        b.knT = (b.knT || 0) + dt;
        const w = Math.sin(b.knT * 11 + (b.knPh || 0)) * b.knuckle;
        b.vx += (-b.vy / sp) * w * dt; b.vy += (b.vx / sp) * w * dt;
      }
    } else { b.dip = 0; b.knuckle = 0; }

    b.px = b.x; b.py = b.y; b.pz = b.z;       // for the swept frame test (hitFrame)
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.vz -= GRAV * dt;
    if (b.z <= 0) {
      b.z = 0;
      if (b.vz < -1.2) { b.vz = -b.vz * (FIELD.ball?.bounce ?? 0.42); b.vx *= 0.8; b.vy *= 0.8; }
      else b.vz = 0;
    }
    const damp = Math.pow(b.z > 0.4 ? 0.9985 : (FIELD.ball?.drag ?? 0.986), dt * 60);   // less drag through the air
    b.vx *= damp; b.vy *= damp;
    if (b.z === 0 && Math.hypot(b.vx, b.vy) < 0.5) { b.vx = 0; b.vy = 0; }

    // brief window as the ball leaves the foot so a marker can't smother it instantly
    b.noTouch = Math.max(0, (b.noTouch || 0) - dt);
    if (b.noTouch > 0) { this.bounds(); return; }

    // pickups — only the closest player in range gets a touch, and only
    // if the ball is low enough to reach
    let best = null;
    let bestD = Infinity;
    if (b.z < 2.5) {
      for (const team of this.teams) {
        for (const p of team.players) {
          if (p.touchLock > 0) continue;
          // a ball in the air can be attacked from further out — you jump for it,
          // and a keeper mid-dive is stretching at full span
          let r = p.role === 'GK' ? (p.diveT > 0 ? 2.6 : 1.68) * Math.min(1, 0.45 + 0.55 * GOAL_HALF / 5.5)
            : (p.slide > 0 ? 2.2 : (b.z > 0.8 ? 2.15 : 1.7));
          /* v79: a ball running out fast right on the touchline is hard to keep
             in — you cannot stretch over the line for it. */
          // v79: an Anchor reads the pass into the space in front of his defence
          if (p.tr?.anchor && !b.owner && b.lastTouch && b.lastTouch.team !== p.team && b.z < 1) r *= 1 + 0.18 * p.tr.anchor;
          if (p.role !== 'GK') {
            const outward = b.y < CY ? -b.vy : b.vy;
            if (Math.min(b.y, PITCH.h - b.y) < 1.6 && outward > 1.5) r *= 0.45;
          }
          const d = dist(p, b);
          if (d < r && d < bestD) { bestD = d; best = p; }
        }
      }
    }

    if (best && this.offsideWatch) {
      const w = this.offsideWatch;
      if (best.team !== w.team) this.offsideWatch = null;
      else if (w.ids.has(best)) {
        this.offsideWatch = null;
        this.offsides[best.team] += 1;
        this.cue('offside', best);
        this.awardFreeKick(1 - best.team, best, null);
        return;
      } else if (best !== b.lastTouch) this.offsideWatch = null;      // an onside man got it: play on
    }
    if (best) {
      // a fast ball can't just be plucked out of the air — it needs a genuine block
      const speed = Math.hypot(b.vx, b.vy);
      const limit = best.role === 'GK' ? 70 : 15 + best.ref.stats.dribbling * 0.17;

      if (speed > limit) {
        if (bestD < 1.7) {
          if (b.shotBy && b.shotBy.team !== best.team) { b.shotBy = null; this.cue('block', best); }   // blocked
          const a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 2.2;
          const s = speed * 0.42;
          b.vx = Math.cos(a) * s;
          b.vy = Math.sin(a) * s;
          b.lastTouch = best;
          best.touchLock = 0.3;
        }
      } else if (best.role === 'GK' && b.shotBy && best.team !== b.shotBy.team) {
        // a keeper reaching an opponent's shot is a save — held or parried away
        this.teams[b.shotBy.team].onTarget++;
        if (!this.keeperContact(best, speed)) return;
        b.shotBy = null;
        b.owner = best;
        b.lastTouch = best;
        best.holdT = 0;
        best.diveT = 0;
      } else {
        b.shotBy = null;

        // meeting a cross above waist height in the box is a header at goal
        const t9 = this.teams[best.team];
        const goalX9 = t9.dir > 0 ? PITCH.w : 0;
        const toGoal9 = Math.hypot(goalX9 - best.x, CY - best.y);
        const attacking = best.role !== 'GK' && toGoal9 < 19 && (!b.lastTouch || b.lastTouch.team === best.team || b.lastTouch.role === 'GK' || true);
        /* v79: what he does with it depends on the height. Head height is a
           header — timed: the nearer the ball is to the top of his jump, the
           truer it goes, and an Aerial Threat jumps higher and times it better.
           Thigh to waist height, from a cross, is a volley. And over his head
           with his back to goal, a player with the tricks tries the overhead. */
        if (attacking && b.z > 1.95 && best.stars >= 4 && Math.random() < 0.3) {
          const facingAway = (best.dirX * (goalX9 - best.x)) < 0;
          if (facingAway || Math.random() < 0.35) {
            b.lastTouch = best;
            this.cue('bicycle', best);
            best.spinT = 0.7;
            this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.4 }, 0.8, { loft: 0.35, placed: true });
            this.ball.shotKind = 'bicycle';
            return;
          }
        }
        /* v79: a defender meeting a cross in his own box heads it clear — up and
           away, and now and then glancing off him behind for a corner. */
        const ownBox = best.role !== 'GK' && Math.hypot((t9.dir > 0 ? 0 : PITCH.w) - best.x, CY - best.y) < 20;
        if (ownBox && b.z > 0.85 && b.lastTouch && b.lastTouch.team !== best.team) {
          b.lastTouch = best; b.owner = null; b.noTouch = 0.2; best.touchLock = 0.3;
          this.cue('header');
          if (Math.random() < 0.22 && Math.abs(best.y - CY) > 3) {
            // off his head and behind — away from the goal mouth, never into his own net
            const away = Math.sign(best.y - CY);
            b.vx = -t9.dir * (4 + Math.random() * 4); b.vy = away * (6 + Math.random() * 5); b.vz = 3 + Math.random() * 2;
          } else {
            const a = Math.atan2((Math.random() - 0.5) * 1.8, t9.dir);
            const sp = 12 + Math.random() * 8;
            b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.vz = 4 + Math.random() * 3;
          }
          b.shotBy = null;
          return;
        }
        if (attacking && b.z > 0.85) {
          const jump = 2.25 + (best.tr?.aerial || 0) * 0.3 + (best.ref.stats.physical - 70) / 100;
          const timing = clamp(1 - Math.abs(b.z - Math.min(jump, 1.9)) / 1.2, 0.2, 1);
          b.lastTouch = best;
          this.cue('header');
          // v133: a defender at his shoulder makes it a contested header — rarely clean
          const foeH = this.nearestTo(1 - best.team, best, true);
          // (bodies keep about two metres apart here, so 'at his shoulder' is inside 2.6 m)
          const contested = foeH && dist(foeH, best) < 2.6 ? 1.3 : 0;
          this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.5 }, 0.5 + timing * 0.28 - (contested ? 0.12 : 0), { loft: 0.2, placed: true, sloppy: 1 - timing + contested + (best.tr?.aerial ? -0.2 : 0) });   // headers are steered down
          return;
        }
        if (attacking && b.z > 0.42 && b.z <= 0.85 && toGoal9 < 17 && Math.random() < 0.7) {
          b.lastTouch = best;
          this.cue('volley', best);
          this.shoot(best, { x: 0, y: (Math.random() - 0.5) * 1.6 }, 0.85, { loft: 0.45, placed: true, sloppy: 0.5 });
          this.ball.shotKind = 'volley';
          return;
        }

        /* v79: the first touch. A ball arriving hot, bouncing, or with a man
           on his back is harder to kill, and how hard is the receiver's own
           touch (dribbling and passing, a Velvet Touch). A heavy one gets away
           from him — a loose ball the other side can press, and near the line
           one that runs out of play. The CPU presses a bad touch hard. */
        if (best.role !== 'GK' && (!b.lastTouch || b.lastTouch !== best)) {
          const foe = this.nearestTo(1 - best.team, best);
          const tight = foe && dist(foe, best) < 2.6 ? 0.28 : 0;
          const hard = Math.max(0, speed - 9) / 19 + (b.z > 0.45 ? 0.26 : 0) + tight;
          const heavy = clamp(hard - (best.control || 0.7) * 0.6 * this.preset.control, 0, 0.55);
          if (Math.random() < heavy) {
            const a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 1.3;
            const sp = Math.max(3.5, speed * (0.32 + Math.random() * 0.22));
            b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.vz = Math.max(0, b.vz) * 0.3;
            b.lastTouch = best; b.noTouch = 0.22;
            best.touchLock = 0.4;
            this.pressTrigger = { team: 1 - best.team, t: this.t };     // the other side smells it
            this.cue('heavyTouch', best);
            this.bounds();
            return;
          }
        }
        if (b.passer && b.passer.team !== best.team) b.passer = null;   // the other side won it: no assist
        b.owner = best;
        b.lastTouch = best;
        best.holdT = 0;
      }
    }

    this.bounds();
  }

  /**
   * The frame is solid. Posts are vertical cylinders at each side of the goal,
   * the bar is the line across the top — a ball hitting either rebounds back
   * into play instead of sailing through.
   */
  hitFrame() {
    const b = this.ball;
    const R = 0.11 + 0.11;                      // post radius plus ball radius
    /* Swept, not sampled (v77). A shot covers 0.3–1.2 m a frame and the
       contact band is 44 cm wide, so testing only where the ball ended up let
       a strike pass straight through a post; and because the goal line is
       judged 40 cm short of the posts, a ball clipping the inside of one was
       given as a goal before it ever reached it. The path from last frame's
       position is tested instead, carried on to the line if this frame takes
       it over, and the ball is put back at the first point of contact. */
    const px = Number.isFinite(b.px) ? b.px : b.x;
    const py0 = Number.isFinite(b.py) ? b.py : b.y;
    const pz = Number.isFinite(b.pz) ? b.pz : b.z;
    let ex = b.x; let ey = b.y; let ez = b.z;
    const jump = Math.hypot(ex - px, ey - py0);
    const sx = jump > 4 ? ex : px; const sy = jump > 4 ? ey : py0; const sz = jump > 4 ? ez : pz;   // a teleport, not a flight
    for (const gx of [0, PITCH.w]) {
      if (Math.abs(b.x - gx) > 2.6 && Math.abs(sx - gx) > 2.6) continue;
      const inw = gx === 0 ? -1 : 1;
      // this frame takes it over the line: follow the path on to the posts
      if ((ex - gx) * inw > -0.4 && (sx - gx) * inw < 0 && Math.abs(b.vx) > 0.01) {
        const t = (gx + inw * 0.3 - sx) / (ex - sx || 1e-6);
        if (t > 1) { ex = sx + (ex - sx) * t; ey = sy + (ey - sy) * t; ez = sz + (ez - sz) * t; }
      }
      const dx = ex - sx; const dy = ey - sy;
      const L2 = dx * dx + dy * dy;

      // uprights: first contact along the segment
      for (const py of [CY - GOAL_HALF, CY + GOAL_HALF]) {
        let hx; let hy; let hz;
        if (L2 < 1e-8) {
          if (Math.hypot(ex - gx, ey - py) > R) continue;
          hx = ex; hy = ey; hz = ez;
        } else {
          // solve |S + t·D − C| = R for the smaller root in [0, 1]
          const fx = sx - gx; const fy = sy - py;
          const bq = 2 * (fx * dx + fy * dy);
          const cq = fx * fx + fy * fy - R * R;
          let t;
          if (cq <= 0) t = 0;                                  // already touching
          else {
            const disc = bq * bq - 4 * L2 * cq;
            if (disc < 0) continue;
            t = (-bq - Math.sqrt(disc)) / (2 * L2);
            if (t < 0 || t > 1) continue;
          }
          hx = sx + dx * t; hy = sy + dy * t; hz = sz + (ez - sz) * t;
        }
        if (hz > GOAL_HEIGHT + 0.1) continue;
        let nx = hx - gx; let ny = hy - py;
        const d = Math.hypot(nx, ny);
        if (d < 1e-4) { nx = -inw; ny = 0; } else { nx /= d; ny /= d; }
        const vn = b.vx * nx + b.vy * ny;
        if (vn > 0) continue;                   // already moving away
        b.vx -= 2 * vn * nx;
        b.vy -= 2 * vn * ny;
        b.vx *= 0.62; b.vy *= 0.62;
        b.x = gx + nx * (R + 0.01);
        b.y = py + ny * (R + 0.01);
        b.z = Math.max(0, hz);
        b.px = b.x; b.py = b.y; b.pz = b.z;
        b.curl = 0;
        b.shotBy = null;
        this.cue('post');
        return true;
      }

      // crossbar: the path through the goal line at the height of the bar
      if ((sx - gx) * inw < R && (ex - gx) * inw > -R) {
        const tx = Math.abs(ex - sx) > 1e-6 ? clamp((gx - sx) / (ex - sx), 0, 1) : 1;
        const cy = sy + (ey - sy) * tx; const cz = sz + (ez - sz) * tx;
        if (Math.abs(cy - CY) < GOAL_HALF + 0.2 && Math.abs(cz - GOAL_HEIGHT) < 0.22 && b.vz > -40) {
          b.vz = -Math.abs(b.vz) * 0.55 - 1.2;
          b.vx *= 0.7; b.vy *= 0.7;
          b.x = gx - inw * (R + 0.02); b.y = cy;
          b.z = GOAL_HEIGHT - 0.24;
          b.px = b.x; b.py = b.y; b.pz = b.z;
          b.curl = 0;
          b.shotBy = null;
          this.cue('post');
          return true;
        }
      }
    }
    return false;
  }

  bounds() {
    const b = this.ball;
    if (!b.inNet && this.hitFrame()) return;
    const attackerSide = b.lastTouch ? b.lastTouch.team : 0;
    if (FIELD.walls && this.walls()) return;

    if (b.y < 0.4 || b.y > PITCH.h - 0.4) {
      if (b.shotBy) { this.cue('shotWide', b.shotBy); b.shotBy = null; }
      this.startThrowIn(1 - attackerSide, b.x, b.y);
      this.markStoppage('throwin');
      return;
    }
    if (b.x < 0.4 || b.x > PITCH.w - 0.4) {
      const leftGoal = b.x < 0.4;
      if (Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT) {
        this.scoreGoal(leftGoal ? 1 : 0, leftGoal ? -1 : 1, leftGoal ? 0 : PITCH.w);
        return;
      }
      const defending = leftGoal ? 0 : 1;
      if (b.shotBy && b.shotBy.team !== defending) { this.cue('shotWide', b.shotBy); b.shotBy = null; }

      // last touch by the defending side (a parry, a block, a deflection)
      // sends it behind for a corner rather than a goal kick
      if (b.lastTouch && b.lastTouch.team === defending) {
        this.startCorner(1 - defending, b.y < CY ? 0 : PITCH.h, leftGoal ? 0 : PITCH.w);
        this.markStoppage('corner');
        return;
      }

      // by role, not index — a formation change can re-slot the squad
      const side = this.teams[defending];
      const gk = side.players.find((p) => p.role === 'GK') || side.players[0];
      b.x = clamp(b.x, 3, PITCH.w - 3);
      b.y = clamp(b.y, 6, PITCH.h - 6);
      b.z = 0;
      gk.x = leftGoal ? 6 : PITCH.w - 6;
      gk.y = b.y;
      b.vx = b.vy = b.vz = 0;
      b.owner = gk;
      b.lastTouch = gk;
      gk.holdT = 0;
      this.markStoppage('goalkick');
    }
  }

  /**
   * The street cage (v82): the ball comes back off the walls instead of going
   * out. Between the posts it is still a goal. A carried ball is simply held
   * at the wall. Returns true when the wall dealt with it.
   */
  walls() {
    const b = this.ball;
    const e = 0.62;                                    // how much a boarded wall gives back
    let hit = false;
    const inMouth = Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT;
    if (b.y < 0.4) { b.y = 0.4; b.vy = Math.abs(b.vy) * e; hit = true; }
    else if (b.y > PITCH.h - 0.4) { b.y = PITCH.h - 0.4; b.vy = -Math.abs(b.vy) * e; hit = true; }
    if (!inMouth) {
      if (b.x < 0.4) { b.x = 0.4; b.vx = Math.abs(b.vx) * e; hit = true; }
      else if (b.x > PITCH.w - 0.4) { b.x = PITCH.w - 0.4; b.vx = -Math.abs(b.vx) * e; hit = true; }
    }
    if (!hit) return false;
    if (b.owner) { b.vx = b.owner.vx; b.vy = b.owner.vy; }
    if (b.shotBy) { this.cue('shotWide', b.shotBy); b.shotBy = null; }
    this.wallHits = (this.wallHits || 0) + 1;
    if (b.lastTouch && !b.owner) this.styleEvent(b.lastTouch, 'walls', 10);
    this.cue('wall');
    return true;
  }

  /** Record a dead-ball restart. Called by bounds() and scoreGoal, read by whoever polls. */
  markStoppage(kind) {
    this.advantage = null;   // v113: a stoppage ends any advantage being played
    this.offsideWatch = null;
    this.stoppages += 1;
    this.stoppage = kind;
    this.autoSubInjured(0);
    this.autoSubInjured(1);
  }

  /**
   * Corner kick. Everyone is placed for the set piece, then the taker whips it
   * in when the phase timer expires.
   */
  startCorner(attacking, cornerY, cornerX) {
    const b = this.ball;
    const atk = this.teams[attacking];
    const def = this.teams[1 - attacking];

    b.x = cornerX < PITCH.w / 2 ? 0.6 : PITCH.w - 0.6;
    b.y = cornerY < CY ? 0.6 : PITCH.h - 0.6;
    b.z = 0;
    b.vx = b.vy = b.vz = 0;
    b.owner = null;
    b.curl = 0;
    b.shotBy = null;

    const goalX = cornerX < PITCH.w / 2 ? 0 : PITCH.w;
    const inw = goalX < PITCH.w / 2 ? 1 : -1;

    // taker: the closest attacker to the flag
    const taker = namedTaker(atk, 'corner') || atk.players
      .filter((p) => p.role !== 'GK')
      .sort((a, z) => Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(z.x - b.x, z.y - b.y))[0];
    taker.x = b.x + inw * 1.4;
    taker.y = b.y + (b.y < CY ? 1.2 : -1.2);
    taker.vx = taker.vy = 0;

    // Only a handful of bodies go up for it. Everyone piling into the six-yard
    // box was chaos and left nobody covering the counter.
    const ATTACK_IN_BOX = 4;      // the aerial threats
    const DEFEND_IN_BOX = 5;      // markers plus a keeper

    const attackers = atk.players
      .filter((p) => p !== taker && p.role !== 'GK')
      .sort((a, z) => (z.ref.stats.physical + z.ref.overall) - (a.ref.stats.physical + a.ref.overall));

    attackers.forEach((p, i) => {
      p.vx = p.vy = 0;
      if (i < ATTACK_IN_BOX) {
        // spread across the six-yard line and the penalty spot
        p.x = goalX + inw * (5.5 + (i % 2) * 5);
        p.y = CY + (i - (ATTACK_IN_BOX - 1) / 2) * 3.6;
      } else if (i === ATTACK_IN_BOX) {
        p.x = goalX + inw * 20;                       // edge of the box for the cut-back
        p.y = CY + (b.y < CY ? -6 : 6);
      } else {
        // the rest hold their shape and guard against the break
        p.x = clamp(goalX + inw * (34 + (i - ATTACK_IN_BOX) * 9), 6, PITCH.w - 6);
        p.y = clamp(CY + ((i % 3) - 1) * 12, 6, PITCH.h - 6);
      }
    });

    const defenders = def.players
      .filter((p) => p.role !== 'GK')
      .sort((a, z) => z.ref.stats.defending - a.ref.stats.defending);

    const gk = def.players.find((p) => p.role === 'GK');
    if (gk) { gk.vx = gk.vy = 0; gk.x = goalX + inw * 1.6; gk.y = CY; }

    defenders.forEach((p, i) => {
      p.vx = p.vy = 0;
      if (i < DEFEND_IN_BOX) {
        // goal-side of the attackers they are picking up
        const t = attackers[i];
        if (t) { p.x = t.x - inw * 1.6; p.y = t.y + (i % 2 ? 1.3 : -1.3); }
        else { p.x = goalX + inw * 5; p.y = CY + (i - 2) * 3.2; }
      } else if (i === DEFEND_IN_BOX) {
        p.x = goalX + inw * 12; p.y = CY;             // sweeper on the spot
      } else {
        p.x = clamp(goalX + inw * (26 + (i - DEFEND_IN_BOX) * 10), 5, PITCH.w - 5);
        p.y = clamp(CY + ((i % 3) - 1) * 14, 5, PITCH.h - 5);
      }
    });

    this.cue('whistle', 1);
    this.cue('cornerKick', attacking);
    this.cornerTaker = taker;
    this.phase = 'corner';
    this.banner = 'CORNER';
    this.setPiece = this.beginSetPiece('corner', attacking, taker, 1.5);
    this.corners = (this.corners || 0) + 1;
    this.teams[attacking].cornerCount = (this.teams[attacking].cornerCount || 0) + 1;
  }

  /** Whip the corner into the six-yard area and let the crowd of bodies attack it. */
  takeCorner() {
    const taker = this.cornerTaker;
    this.setPiece = null;
    this.phase = 'play';
    this.banner = '';
    if (!taker) return;

    const team = this.teams[taker.team];
    const b = this.ball;
    const goalX = Math.abs(b.x - 0) < Math.abs(b.x - PITCH.w) ? 0 : PITCH.w;
    const inw = goalX === 0 ? 1 : -1;

    b.owner = taker;
    taker.touchLock = 0;
    // aim at the near-to-middle of the six-yard box, where the bodies are
    const tx = goalX + inw * (7 + Math.random() * 4);
    const ty = CY + (Math.random() - 0.5) * 9;
    const dx = tx - b.x;
    const dy = ty - b.y;
    const D = Math.hypot(dx, dy) || 1;
    const T = clamp(D / 18, 0.8, 1.8);
    this.release(taker, dx / T, dy / T, 0.5 * GRAV * T);
    this.ball.noTouch = 0.24;
    this.cornerTaker = null;
  }

  giveTo(side, x, y) {
    const b = this.ball;
    b.vx = b.vy = 0;
    b.x = clamp(x, 1, PITCH.w - 1);
    b.y = clamp(y, 1, PITCH.h - 1);
    const p = this.nearestTo(side, b, true);
    if (!p) return;
    p.x = b.x - this.teams[side].dir * 1.2;
    p.y = b.y;
    p.touchLock = 0;
    b.owner = p;
    b.lastTouch = p;
  }

  scoreGoal(side, inw = 1, goalLineX = PITCH.w) {
    this.markStoppage('goal');
    const team = this.teams[side];
    // v82: on the street a goal off a chain of skills and walls is worth more
    if (FIELD.street) { const st = this.styleOf(side); const hot = this.t - st.last < 6; st.points += 100 + (hot ? 50 * st.chain : 0); st.goals += 1; if (hot && st.chain >= 2) st.stylish += 1; st.chain = 0; }
    team.score++;
    // a goal is on target, whatever it was meant to be — a cross that drifts in counts too (v79)
    if ((this.ball.shotBy && this.ball.shotBy.team === side) || (!this.ball.shotBy && this.ball.lastTouch?.team === side)) team.onTarget++;
    this.ball.shotBy = null;
    const scorer = this.ball.lastTouch && this.ball.lastTouch.team === side ? this.ball.lastTouch : null;
    // v80: who made it — the last team-mate to pass or cross it in
    const assist = this.ball.passer && this.ball.passer.team === side && this.ball.passer !== scorer ? this.ball.passer : null;
    if (scorer) team.scorers.push({ name: scorer.ref.name, id: scorer.ref.id, assist: assist?.ref.id || null, assistName: assist?.ref.name || null, minute: this.minute() });
    this.feed.unshift(`${this.minute()}'  ${team.short} — ${scorer ? scorer.ref.name : 'own goal'}`);
    this.banner = 'GOAL';
    this.goalTeam = side;
    this.phase = 'goal';
    this.phaseT = 4.2;
    this.cue('goal');
    this.cue('net');

    // Hold the restart until the celebration is over — positions reset when the
    // phase ends, not now, so there is something to actually watch.
    this.pendingKickoff = 1 - side;
    this.celebrant = scorer;
    this.celebT = 0;
    this.scorerName = scorer ? scorer.ref.name : 'Own goal';

    // peel away towards the nearest corner of the end they scored at
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const from = scorer || this.ball;
    this.celebSpot = {
      x: goalX - team.dir * 12,
      y: from.y < CY ? 7 : PITCH.h - 7,
    };

    const b = this.ball;
    // hand the strike to the renderer so the netting can be punched properly
    this.netHit = {
      x: b.x, y: b.y, z: Math.max(0.2, b.z),
      vx: b.vx, vy: b.vy, vz: b.vz, at: this.t,
    };
    // Keep the ball live so it is seen crossing the line and burying itself in
    // the netting — freezing it here is what made goals cut out at the post.
    b.owner = null;
    b.inNet = { inw, back: goalLineX + inw * 1.75 };
    for (const p of team.players) p.celebrating = true;
    /* v110: the scorer's celebration. A person's side does the one they
       picked; everyone else picks by who they are (never Math.random — the
       sweep's goals must not shift the dice). Only the look changes: the run
       to the corner is the same for all of them. */
    if (scorer) {
      const own = this.controllers.some((c) => !c.ai && c.team === scorer.team);
      scorer.celebKind = pickCelebration(own ? this.celebration : null, scorer.ref?.id ?? scorer.ref?.name ?? '', team.score);
    }
  }

  /** Ball flight after it has crossed the line: the net drags it to a stop. */
  settleBallInNet(dt) {
    const b = this.ball;
    if (!b.inNet) return;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.vz -= GRAV * dt;

    const drag = Math.pow(0.045, dt);            // netting kills the pace fast
    b.vx *= drag; b.vy *= drag; b.vz *= drag;

    if (b.z <= 0) { b.z = 0; b.vz = Math.abs(b.vz) * 0.25; if (b.vz < 0.4) b.vz = 0; }
    const { inw, back } = b.inNet;
    b.x = inw > 0 ? Math.min(b.x, back) : Math.max(b.x, back);
    b.y = clamp(b.y, CY - GOAL_HALF + 0.25, CY + GOAL_HALF - 0.25);
    b.z = Math.min(b.z, GOAL_HEIGHT - 0.2);
  }

  /**
   * Runs while phase === 'goal'. The scorer sprints off, team-mates chase them
   * down, the conceding side trudges back into shape.
   */
  updateCelebration(dt) {
    this.celebT += dt;
    this.settleBallInNet(dt);
    const hero = this.celebrant;
    const scoring = this.goalTeam;

    for (const team of this.teams) {
      for (const p of team.players) {
        if (p.role === 'GK') {
          const gx = team.dir > 0 ? 2.5 : PITCH.w - 2.5;
          this.moveTo(p, gx, CY, dt, 0.45);
        } else if (p.team === scoring) {
          if (hero && p === hero) this.moveTo(p, this.celebSpot.x, this.celebSpot.y, dt, 1.12);
          else if (hero) {
            // fan in behind the scorer rather than piling on the same spot
            const i = team.players.indexOf(p);
            this.moveTo(p, hero.x - Math.cos(i) * 3.2, hero.y - Math.sin(i * 1.7) * 3.2, dt, 1.0);
          } else this.moveTo(p, p.sx * PITCH.w, p.sy * PITCH.h, dt, 0.6);
        } else {
          this.moveTo(p, p.sx * PITCH.w, p.sy * PITCH.h, dt, 0.45);
        }
        p.touchLock = 0.5;                     // nobody picks the ball up mid-celebration
        this.integrate(p, dt);
      }
    }
    this.separate();
  }

  /* ------------------------------ actions ---------------------------- */
  /** Queue an audio cue for the presentation layer. */
  cue(name, arg) {
    if (this.cues.length < 24) this.cues.push({ name, arg });
  }

  release(p, vx, vy, vz = 0) {
    const b = this.ball;
    b.owner = null;
    b.lastTouch = p;
    b.shotBy = null;
    b.noTouch = 0.13;
    b.curl = 0; b.dip = 0; b.knuckle = 0;
    b.shotId = (b.shotId || 0) + 1;
    b.vx = vx; b.vy = vy; b.vz = vz;
    // released from in front of him, but never from beyond a line (v79)
    b.x = clamp(p.x + p.dirX * 1.3, 0.5, PITCH.w - 0.5);
    b.y = clamp(p.y + p.dirY * 1.3, 0.5, PITCH.h - 0.5);
    b.z = vz > 0 ? 0.35 : b.z;
    p.touchLock = 0.3;
  }

  /**
   * Lofted ball forward. Inside crossing range it hangs one up in the box for a
   * header; from deeper it becomes a long diagonal to the furthest teammate in
   * range rather than a rocket at the opponent's area from your own half.
   */
  /**
   * A clearance (v79): high and long, angled towards the touchline on his own
   * side, with the error of a ball hit in a hurry. It is meant to be safe, not
   * accurate — which is why so many of them end up in the stand.
   */
  clear(p) {
    const team = this.teams[p.team];
    const side = Math.sign(p.y - CY) || (Math.random() < 0.5 ? -1 : 1);
    const ownX = team.dir > 0 ? 0 : PITCH.w;
    // shinned behind from near his own byline, now and then
    if (Math.abs(p.x - ownX) < 10 && Math.abs(p.y - CY) > GOAL_HALF + 3 && Math.random() < 0.3) {
      this.cue('clear', p);
      this.release(p, -team.dir * (6 + Math.random() * 6), side * (3 + Math.random() * 5), 3);
      this.ball.noTouch = 0.3;
      return;
    }
    const a = Math.atan2(side * (0.55 + Math.random() * 0.65), team.dir) + (Math.random() - 0.5) * 0.5;
    const sp = 24 + Math.random() * 9 + p.ref.stats.physical * 0.04;
    this.cue('clear', p);
    this.release(p, Math.cos(a) * sp, Math.sin(a) * sp, 6 + Math.random() * 3);
    this.ball.noTouch = 0.3;
  }

  cross(p, aim, kind = 'floated') {
    this.tally(p, 'passes');
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    /* v79: a cut-back is a pass, not a cross — along the ground from the
       byline to whoever is arriving at the edge of the box or the spot. */
    if (kind === 'cutback') {
      let best = null; let bd = Infinity;
      const spot = { x: goalX - team.dir * 12, y: CY };
      for (const t of team.players) {
        if (t === p || t.role === 'GK') continue;
        const d2 = Math.hypot(t.x - spot.x, t.y - spot.y);
        if (d2 < bd && d2 < 14) { bd = d2; best = t; }
      }
      if (best) {
        this.cue('cutback', p);
        this.noteOffside(p);
        const dx = best.x + best.vx * 0.5 - p.x; const dy = best.y + best.vy * 0.5 - p.y; const dd = Math.hypot(dx, dy) || 1;
        const sp = clamp(dd * 1.2 + 10, 14, 30);
        this.release(p, (dx / dd) * sp, (dy / dd) * sp);
        this.ball.passer = p;
        return;
      }
      kind = 'driven';
    }
    const aimY = aim && Math.abs(aim.y) > 0.2 ? CY + aim.y * 9 : (p.y > CY ? CY - 5 : CY + 5);
    const RANGE = 40;

    // preferred target: a teammate already in the box
    let tx = goalX - team.dir * 9;
    let ty = aimY;
    let best = null;
    let bestD = Infinity;
    for (const t of team.players) {
      if (t === p || t.role === 'GK') continue;
      if (Math.abs(t.x - goalX) > 24) continue;
      const d = Math.hypot(t.x - tx, t.y - ty);
      if (d < bestD) { bestD = d; best = t; }
    }
    /* v133: the CPU picks the man in the box with the most room — a runner
       arriving counts double for it, because he is moving onto the ball and
       his marker is not — and puts it where he will be, not where he is. */
    const runs = !aim ? this.boxRuns?.[p.team] : null;
    if (!aim) {
      const foes = this.teams[1 - p.team].players;
      let bestScore = -Infinity; let pick = null;
      for (const t of team.players) {
        if (t === p || t.role === 'GK' || Math.abs(t.x - goalX) > 20) continue;
        let room = 99;
        for (const f of foes) { const d = Math.hypot(f.x - t.x, f.y - t.y); if (d < room) room = d; }
        const score = Math.min(room, 6) * (runs?.has(t) ? 1.5 : 1) - Math.abs(t.x - goalX) * 0.15 + (kind === 'driven' && Math.abs(t.y - p.y) < 12 ? 1 : 0);
        if (score > bestScore) { bestScore = score; pick = t; }
      }
      if (pick) best = pick;
    }
    // Lead the runner: aim where they will be when the ball lands, not where
    // they are now. The ball only passes through head height in the last couple
    // of metres, so the landing point has to sit on them.
    if (best) {
      const rough = clamp(Math.hypot(best.x - p.x, best.y - p.y) / 20, 0.6, 1.9);
      tx = best.x + best.vx * rough * 0.85 + team.dir * 0.4;
      ty = best.y + best.vy * rough * 0.85;
    }

    // too far to reach the box? float it to whoever is furthest forward in range
    if (Math.hypot(tx - p.x, ty - p.y) > RANGE) {
      let out = null;
      let bestAdv = -Infinity;
      for (const t of team.players) {
        if (t === p || t.role === 'GK') continue;
        if (Math.hypot(t.x - p.x, t.y - p.y) > RANGE) continue;
        const adv = (t.x - p.x) * team.dir;
        if (adv > bestAdv) { bestAdv = adv; out = t; }
      }
      if (out) { tx = out.x + team.dir * 3; ty = out.y; }
      else {
        tx = p.x + team.dir * 26;
        ty = clamp(p.y + (aim ? aim.y * 10 : 0), 4, PITCH.h - 4);
      }
    }

    /* v79: crosses are not all perfect. The worse the crosser, the more he
       over- or under-hits it — and an overhit one sails out for a goal kick. */
    const cerr = (1.1 - (p.ref.stats.passing / 100)) * 14 * (kind === 'driven' ? 0.7 : 1);
    tx += team.dir * (Math.random() * 1.3 - 0.3) * cerr; ty += (Math.random() - 0.5) * cerr;
    const dx = tx - p.x;
    const dy = ty - p.y;
    const D = Math.hypot(dx, dy) || 1;
    // ~20 m/s delivery: firm enough to reach the box, far off the old 35 m/s rocket,
    // and flat enough that it does not balloon into the clouds
    // floated hangs up at ~20 m/s; a driven one is whipped in low and quick
    const T = kind === 'driven' ? clamp(D / 27, 0.45, 1.3) : clamp(D / 20, 0.6, 1.9);
    this.cue('cross');
    this.ball.passer = p;
    /* v79: a defender standing up to the crosser blocks it — mostly behind for
       a corner, which is where most corners in real football come from. */
    const blocker = this.teams[1 - p.team].players.find((q) => q.role !== 'GK' && dist(q, p) < 2.6
      && ((q.x - p.x) * (tx - p.x) + (q.y - p.y) * (ty - p.y)) > 0);
    if (blocker && Math.random() < 0.45) {
      this.cue('block', blocker);
      const b0 = this.ball;
      this.release(p, 0, 0, 0);
      b0.lastTouch = blocker;
      b0.vx = team.dir * (4 + Math.random() * 4); b0.vy = (p.y < CY ? -1 : 1) * (4 + Math.random() * 4); b0.vz = 2 + Math.random() * 2;
      b0.noTouch = 0.25;
      return;
    }
    this.noteOffside(p);
    // v133: the men on their runs keep going while it is in the air (see think)
    let lead = null;
    if (runs && runs.size) { let ld = Infinity; for (const q of runs.keys()) { const d = Math.hypot(q.x - tx, q.y - ty); if (d < ld) { ld = d; lead = q; } } }
    // and the defender nearest where it is coming down goes to meet it too
    let guard = null;
    { let gd = Infinity; for (const q of this.teams[1 - p.team].players) { if (q.role === 'GK') continue; const d = Math.hypot(q.x - tx, q.y - ty); if (d < gd) { gd = d; guard = q; } } }
    this.crossRun = runs && runs.size ? { team: p.team, runners: new Map(runs), lead, guard, until: this.t + T + 0.6, lx: tx, ly: ty } : null;
    this.release(p, dx / T, dy / T, 0.5 * GRAV * T * (kind === 'driven' ? 0.62 : 1));
    this.ball.noTouch = 0.26;
    if (kind === 'driven' && p.tr?.deadball) this.ball.curl = (Math.sign(CY - p.y) || 1) * 18;
  }

  /**
   * @param {number} power 0-1. Reaches further and arrives harder, and is a
   *   little less accurate at the top end — a 50-yard ball should not be a
   *   certainty.
   */
  /** How well a player executes right now: tired legs and injuries blunt technique. */
  formOf(p) {
    return 1 - (1 - (p.stamina ?? 1)) * 0.3 - (p.injured ? 0.25 : 0);
  }

  pass(p, aim, through, power = 0.35, lob = false, assist = 1) {
    this.tally(p, 'passes');
    const team = this.teams[p.team];
    /* v87: pass assist, for a person's passes only (the CPU always plays at 1).
       0 manual: only a man almost exactly on the line of the stick is found;
       otherwise the ball goes where it was aimed. 2 full: the best open man in
       a wider reach, with the aim only a tiebreak. */
    const reach = 14 + power * 44 + (assist === 2 ? 10 : 0);
    const alignW = assist === 2 ? 0.9 : 2.6;
    let ax = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.x : p.dirX;
    let ay = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.y : p.dirY;
    const am = Math.hypot(ax, ay) || 1;
    ax /= am; ay /= am;

    /* v103 (backlog #21): is he open? A clear lane from the passer and room
       from his marker now count towards who the ball goes to — the pass used
       to pick by angle, distance and forwardness alone and went into marked
       men and through defenders (58% of passes arrived). The CPU weighs it by
       its decision quality (so difficulty still matters); a person's pass
       assist weighs it too, fully at "full", and manual (0) not at all — there
       the ball goes where it was aimed. */
    const human = this.controllers.some((k) => this.playerOf?.(k) === p);
    const openW = assist === 0 ? 0 : !human ? this.decisionQuality(p.team) : assist === 2 ? 1 : 0.6;
    const opp = this.teams[1 - p.team].players;
    /* ...but not so much that nobody ever gives it to a centre-forward, who is
       always marked: the first cut of this cut strikers' goals from 0.49 to
       0.15 a match (tools/evo-audit.mjs). A through ball is judged by the space
       ahead of the runner, not by his marker or the lane to his feet (it is
       played into that space), and in the final third a side accepts the
       risk — openness counts for a third as much there. */
    const goalXp = team.dir > 0 ? PITCH.w : 0;
    const openness = (t) => {
      if (!openW) return 0;
      const risk = Math.abs(goalXp - t.x) < 36 * SCALE ? 0.35 : 1;
      if (through) {
        const sx = t.x + team.dir * 8; let room = 9;
        for (const o of opp) room = Math.min(room, Math.hypot(o.x - sx, o.y - t.y));
        return (Math.min(room, 6) - 3) * 0.2 * openW * risk;
      }
      const vx = t.x - p.x; const vy = t.y - p.y; const L = vx * vx + vy * vy || 1;
      let lane = 9; let mark = 9;
      for (const o of opp) {
        const u = clamp(((o.x - p.x) * vx + (o.y - p.y) * vy) / L, 0.08, 1);
        lane = Math.min(lane, Math.hypot(p.x + vx * u - o.x, p.y + vy * u - o.y));
        mark = Math.min(mark, dist(o, t));
      }
      return ((Math.min(lane, 4) - 2) * 0.35 + (Math.min(mark, 5) - 2.5) * 0.15) * openW * risk;
    };
    let best = null;
    let bestScore = -Infinity;
    for (const t of team.players) {
      if (t === p) continue;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const d = Math.hypot(dx, dy);
      // how far you are willing to look for a team-mate is what the hold buys
      if (d < 3 || d > reach) continue;
      const align = (dx / d) * ax + (dy / d) * ay;
      if (assist === 0 && align < 0.94) continue;
      const forward = ((t.x - p.x) * team.dir) / 40;
      // v79: a side told to play wide looks for the man on the touchline
      const wideBonus = (Math.abs(t.y - CY) / CY) * (team.tactics?.width ?? 0.5) * 0.9;
      const score = align * alignW - d / 45 + forward * (through ? 1.2 : 0.5) + wideBonus + (t.role === 'GK' ? -2.5 : 0) + (this.isOffside(t) ? -1.5 : 0) + openness(t);
      if (score > bestScore) { bestScore = score; best = t; }
    }

    this.cue('pass');
    this.ball.passer = p;
    // nobody in range: hit it where you were aiming, as hard as you were holding
    if (!best) {
      const punt = (16 + power * 22) * this.preset.passSpeed;
      this.release(p, ax * punt, ay * punt);
      return;
    }

    let tx = best.x;
    let ty = best.y;
    /* v79: a through ball's weight is the hold. The runner is led by 5 m on a
       tap up to 17 m on a full hold — into his stride, or past him and out
       of play if it was overhit. */
    if (through) { const lead = 5 + power * 12; tx += team.dir * lead; ty += best.vy * 0.4 * (lead / 9); }
    this.noteOffside(p);
    /* v79: a back pass to a defender or the keeper is a pressing trigger for
       the other side; a forward pass between two attackers sets a third man
       running in behind. */
    if ((best.x - p.x) * team.dir < -4 && (best.role === 'DEF' || best.role === 'GK')) this.pressTrigger = { team: 1 - p.team, t: this.t };
    if (p.role !== 'DEF' && p.role !== 'GK' && (best.x - p.x) * team.dir > 2 && Math.random() < 0.45) {
      let third = null; let td = Infinity;
      for (const q of team.players) {
        if (q === p || q === best || q.role === 'GK' || q.role === 'DEF') continue;
        const dq = dist(q, best);
        if (dq < td && dq < 20) { td = dq; third = q; }
      }
      if (third) {
        third.thirdUntil = 1.8;
        // a third of these runs are timed a fraction early — which is most offsides in real football
        third.thirdX = this.onsideX(team, best.x + team.dir * 14, Math.random() < 0.35 ? 2.2 : 0);
        third.thirdY = clamp(best.y + (third.y > best.y ? 7 : -7), 5, PITCH.h - 5);
      }
    }
    let dx = tx - p.x;
    let dy = ty - p.y;
    const d = Math.hypot(dx, dy) || 1;
    // under pressure it goes astray more; a Pinged Pass is truer over distance
    const foeP = this.nearestTo(1 - p.team, p);
    const hurried = foeP && dist(foeP, p) < 2.4 ? 1.55 : 1;
    const pinged = p.tr?.pinged && d > 22 ? 1 - 0.25 * p.tr.pinged : 1;
    const err = ((100 - p.ref.stats.passing) / 100) * (0.13 + power * 0.1)
      * (this.weakFoot(p) ? 1.55 : 1) * (2 - this.formOf(p)) * hurried * pinged
      * (1 + Math.max(0, d - 22) / 20)                     // v79: a long ball is a less certain thing
      * (Math.random() - 0.5) * 2;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;
    const speed = clamp((d * 1.35 + 9) * (0.8 + power * 0.6) * this.preset.passSpeed * (p.tr?.pinged && d > 22 ? 1.06 : 1), 14, 48);
    if (lob) {
      // a chipped ball over the line: slower along the ground, hangs in the air
      const T = clamp(d / 17, 0.7, 1.7);
      this.cue('lob', p);
      this.release(p, nx * (d / T), ny * (d / T), 0.5 * GRAV * T);
      this.ball.noTouch = 0.3;
      return;
    }
    // v79: a hard, long ball is driven — it skims off the grass rather than rolling
    this.release(p, nx * speed, ny * speed, power > 0.8 && d > 24 ? 1.6 : 0);
    this.ball.passKind = power > 0.8 && d > 24 ? 'driven' : 'ground';
  }

  /**
   * @param {object} opts
   *   loft  multiplier on how much the strike lifts (0 = drilled along the floor)
   *   curl  bend the flight sideways; sign picked from aim, or inward towards goal
   *   placed  a header or a set piece — no weak-foot penalty, because the ball
   *           is not at anyone's feet when it is struck
   */
  shoot(p, aim, power, opts = {}) {
    this.tally(p, 'shots');
    const { loft = 1, curl = 0, placed = false, chip = false, sloppy = 0 } = opts;
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const dx = goalX - p.x;
    const dy = CY + (aim && Math.abs(aim.y) > 0.2 ? aim.y * GOAL_HALF * 0.9 : 0) - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const acc = p.ref.stats.shooting / 100;
    // accuracy falls off with distance and with a rushed (low power) strike
    const weak = !placed && this.weakFoot(p);
    /* v79: wider than it was — four in five shots used to hit the target,
       against about a third in real football — narrowed again by a Finesse
       Finisher bending one in, and widened by a mistimed header or volley. */
    const spread = this.shotSpread(p, d, power, { curl, weak, sloppy });
    /* Expected goals: how good the chance was, before the strike decides it.
     * Distance and angle do most of the work, a defender within two metres
     * takes a third off. The stat sheet sums it; a chance over a quarter of a
     * goal is a "big chance" and gets its own line of commentary. */
    {
      const angle = Math.atan2(GOAL_HALF * 2 * Math.abs(dx), d * d - GOAL_HALF * GOAL_HALF) || 0.01;
      const foe = this.nearestTo(1 - p.team, p);
      const close = foe && dist(p, foe) < 2 ? 0.66 : 1;
      const xg = clamp(0.92 * Math.exp(-d / 11) * Math.min(1, angle / 0.9) * close, 0.02, 0.8);
      team.xg = (team.xg || 0) + xg;
      if (xg >= 0.25) { team.bigChances = (team.bigChances || 0) + 1; this.cue('bigChance', p); }
    }
    const err = (Math.random() - 0.5) * 2 * spread;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;

    this.cue('shot', power);
    /* Longer hold = harder and higher. A full-power strike now climbs to
       about three metres at its peak (it was under two, and read as a ball
       that never left the floor); overcook it close in and it clears the bar.
       A chip is slow and steep: over the keeper, dropping under the bar. */
    const speed = chip
      ? (13 + power * 6) * (weak ? 0.93 : 1)
      : (23.5 + power * 19 + acc * 6) * (weak ? 0.93 : 1) * (p.tr?.cannon && d > 20 ? 1.08 : 1);
    const rise = chip
      ? 7.5 + power * 3
      : (1.3 + power * 8.2) * loft + (curl ? 1.2 : 0);

    this.release(p, nx * speed, ny * speed, rise);
    if (chip) this.cue('lob', p);
    // v79: a driven strike dips; a Cannon (or anyone, rarely, from range) can knuckle it
    if (!chip && !curl && power > 0.75) this.ball.dip = 0.25 + power * 0.2;
    if (!chip && !curl && power > 0.85 && d > 22 && Math.random() < (p.tr?.cannon ? 0.45 : 0.12)) {
      this.ball.knuckle = 2.2 + Math.random() * 1.8; this.ball.knPh = Math.random() * 6.28;
      this.cue('knuckle', p);
    }
    this.ball.shotKind = null;

    if (curl) {
      // bend away from the aim side, defaulting to whipping it back towards goal
      let sign = aim && Math.abs(aim.y) > 0.2 ? -Math.sign(aim.y) : Math.sign(CY - p.y) || 1;
      this.ball.curl = sign * curl * (0.55 + acc * 0.6);
    }

    this.ball.shotBy = p;      // resolved as on target only if it beats a defender to the keeper or goes in
    team.shots++;
  }

  /**
   * One tackle, not two.
   *
   * This used to be a standing challenge and a separate slide, distinguished by
   * a boolean nobody could actually feel the difference of — same button-press
   * shape, similar range, and a foul chance that was just a flat coin flip
   * decoupled from how the tackle was actually made. There is one challenge now,
   * and it always commits: a lunge towards the ball, the way a slide always
   * looked.
   *
   * The foul risk is what replaces the old two-tackle split, and it is tied to
   * something real: `d`, how far away the ball was when you committed. A dive
   * thrown in from point-blank range is a fair, well-timed challenge that
   * either wins the ball or simply loses the duel — that is not a foul, that is
   * defending. A dive launched from near the edge of your reach is a lunge at
   * something you were not actually going to reach in time, which is what a
   * mistimed tackle *is* in real football — arriving late. `frac` stands in for
   * that lateness, and both the foul chance and the recovery cost scale off it,
   * so a reckless committal costs you twice: the whistle, and the time spent
   * picking yourself up.
   */
  /**
   * `slide` (v90, people only — the CPU never asks for it, so the balance
   * sweep is untouched): a slide tackle. Longer reach and a longer lunge, and
   * he is on the grass for longer if he misses; a clean one wins it from
   * further away, a late one is a clearer foul.
   */
  tackle(p, { slide = false } = {}) {
    // v113: the man whose foul is being played on cannot have another go while it runs
    if (this.advantage && this.advantage.offender === p) return;
    const b = this.ball;
    const owner = b.owner;
    const REACH = slide ? 4.3 : 3.1;

    p.slide = slide ? 0.8 : 0.42;
    p.vx = p.dirX * p.maxSpeed * (slide ? 2.05 : 1.7);
    p.vy = p.dirY * p.maxSpeed * (slide ? 2.05 : 1.7);
    if (slide) this.cue('slide', p);

    if (!owner || owner.team === p.team) return;
    // A keeper with the ball in their hands cannot be challenged — walking in
    // and robbing them at a goal kick was a free goal.
    if (owner.role === 'GK') { p.stumble = 0.35; return; }
    // a feint sold: the tackler lunges at where the ball was
    if (owner.skillT > 0) { p.stumble = 0.6; this.cue('skill', owner); return; }
    const d = dist(p, owner);
    if (d > REACH) return;
    const frac = d / REACH;               // 0 = point-blank, 1 = the edge of the lunge

    const win = (p.ref.stats.defending + 16) /
      (p.ref.stats.defending + owner.ref.stats.dribbling + 16) * this.preset.tackle;
    if (Math.random() < win) {
      this.tally(p, 'tackles');
      owner.touchLock = 0.55;
      owner.stumble = 0.35;
      /* v79: not every won tackle is a clean take. Nearly half poke it loose —
         a ball that squirts off somewhere, sometimes out of play. */
      if (Math.random() < 0.55) {
        const a = Math.atan2(p.dirY, p.dirX) + (Math.random() - 0.5) * 2.4;
        const sp = 4 + Math.random() * 6;
        b.owner = null; b.lastTouch = p; b.noTouch = 0.18;
        b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.vz = Math.random() < 0.3 ? 1.5 : 0;
        p.touchLock = 0.25;
      } else {
        b.owner = p;
        b.lastTouch = p;
      }
    } else {
      // a clean, close challenge is back on his feet quickly; a wild one from
      // distance is caught out of the game for a real moment
      p.stumble = 0.45 + frac * 0.7;
      /* A mistimed challenge in your own box is a penalty.
       *
       * Fouls exist only here, and only inside the area. That is a deliberate
       * limit rather than an oversight: there is no free-kick set piece in this
       * game, so a foul anywhere else would have nowhere to go and would just
       * be a turnover with a whistle on it. Inside the box there is somewhere
       * for it to go, and it is the moment that matters.
       *
       * The chance itself is quadratic in `frac` — a challenge thrown in from
       * distance is disproportionately more likely to be the bad one, which is
       * the whole point: it is a foul only if it was bad play.
       *
       * 0.21 rather than a rounder number because it was measured, not guessed:
       * a flat first pass at this landed penalties at roughly double the old
       * two-tier system's rate (0.28/match over 240 AI-vs-AI matches on two
       * seeds, against 0.15/match before), because the CPU's own commit range
       * sits well inside REACH and so was living in the upper half of `frac`
       * more often than assumed. This constant was picked to bring it back to
       * the same ballpark rather than quietly double the penalty count. */
      /* A rash player fouls; a composed one mistimes it and stands there
       * looking foolish. `0.21` was the flat rate before aggression existed
       * and is kept as the middle of the new range, so the match-wide foul
       * count is in the same place while *who* gives them away changes. */
      // v79: re-tuned against real foul counts (about one in four challenges from
      // the edge of his reach is a foul); a Rock at the Back is cleaner
      const chance = (0.42 + 0.7 * this.aggressionOf(p)) * Math.pow(frac, 0.85) * (p.tr?.rock ? 1 - 0.3 * p.tr.rock : 1)
        * (this.inPenaltyArea(owner, p.team) ? TUNE.boxCare : 1)       // v86: nobody dives in in his own box
        * (slide ? 1.3 : 1);                                            // v90: a late slide is a clearer foul
      if (Math.random() < chance) {
        this.fouls[p.team] += 1;
        this.cue('foul', p);
        /* v113: advantage. Fouled in the other half with nobody else on him,
           he rides it — stumbles, keeps the ball, and the referee lets play
           go on; lose it inside 2.5 s and the free kick comes back. */
        const adv = TUNE.advantage && !this.inPenaltyArea(owner, p.team) && this.advantageFor(owner, p);
        if (adv) {
          owner.stumble = Math.max(owner.stumble, 0.2);
          p.stumble = Math.max(p.stumble, 1.0);      // the man who fouled is out of it: he is not the one to win it back
          this.advantage = { team: owner.team, x: owner.x, y: owner.y, offender: p, t: 2.5 };
          this.advantages[owner.team] += 1;
          this.cue('advantage', owner);
        } else {
        /* The man goes down — properly down, flat on the grass, for a second
         * or two while play stops and he gets up. It is the thing that makes
         * a foul read as a foul rather than as a turnover with a noise. */
        owner.downT = 1.1 + frac * 0.9;
        owner.downMax = owner.downT;          // the renderers read both to time the fall and the get-up
        owner.vx = p.dirX * 3.4; owner.vy = p.dirY * 3.4;     // knocked the way the challenge came in
        owner.stumble = Math.max(owner.stumble, owner.downT + 0.5);
        }
        /* A foul can hurt. One in eight leaves the fouled man limping for the
         * rest of the match — slower, less accurate, a candidate for the next
         * substitution — and the career keeps him out for weeks. */
        if (!owner.injured && Math.random() < 0.125) this.injure(owner);
        // the lunge from distance is the bookable one
        if (frac > 0.82 && p.cards < 1) { p.cards += 1; this.cue('card', p); this.bookings.push({ team: p.team, name: p.ref.name, minute: this.minute() }); }
        if (this.inPenaltyArea(owner, p.team)) this.awardPenalty(1 - p.team, p);
        else if (!adv) this.awardFreeKick(1 - p.team, owner, p);
      }
    }
  }

  /** v113: may the referee play advantage? In the fouled side's attacking half but out of shooting range, going forward with pace, and nobody but the offender within 6 m of him. */
  advantageFor(owner, offender) {
    const dir = this.teams[owner.team].dir;
    if ((owner.x - PITCH.w / 2) * dir <= 0) return false;
    if (owner.vx * dir < 3.5) return false;       // a man breaking, not one shielding it with his back to goal
    // within shooting range the free kick is the better chance: the referee gives it
    if (Math.hypot((dir > 0 ? PITCH.w : 0) - owner.x, CY - owner.y) < 30) return false;
    for (const q of this.teams[offender.team].players) if (q !== offender && dist(q, owner) < 6) return false;
    return true;
  }

  /** v113: advantage running — the free kick comes back if the ball is lost; otherwise it is played. */
  updateAdvantage(dt) {
    const a = this.advantage;
    if (!a) return;
    const o = this.ball.owner;
    if (o && o.team !== a.team) {
      this.advantage = null;
      this.advantageBack[a.team] += 1;
      this.awardFreeKick(a.team, { x: a.x, y: a.y }, a.offender);
      return;
    }
    a.t -= dt;
    if (a.t <= 0) this.advantage = null;
  }

  /** A player is hurt: he stays on, diminished, until someone takes him off. */
  injure(p) {
    p.injured = true;
    p.maxSpeed *= 0.62;
    p.stumble = Math.max(p.stumble, 0.9);
    this.injuries.push({ team: p.team, name: p.ref.name, id: p.ref.id, minute: this.minute() });
    this.cue('injury', p);
  }

  /** Has this player already been substituted off in this match? */
  cameOff(id) { return (this.pst?.[id]?.off ?? null) !== null; }

  /** The CPU brings an injured man off at the next dead ball, if it can. */
  autoSubInjured(teamIdx) {
    const team = this.teams[teamIdx];
    if (team.isHuman || team.subsLeft <= 0) return;
    const i = team.players.findIndex((q) => q.injured && q.role !== 'GK');
    if (i < 0) return;
    const bench = team.bench.map((r, j) => [r, j]).filter(([r]) => r && r.position !== 'GK' && !this.cameOff(r.id))
      .sort((a, b) => b[0].overall - a[0].overall);
    if (!bench.length) return;
    const p = team.players[i];
    if (this.substitute(teamIdx, i, bench[0][1])) { p.injured = false; this.cue('sub', p); }
  }

  /**
   * Skill moves. One button, four tricks, chosen by where the stick points
   * relative to the way the player faces:
   *   sideways  — the feint: a burst across a lunging tackler
   *   forward   — stepovers: the ball stands still for a beat, then a burst
   *   backward  — the roulette: a spin with the ball glued to the foot
   *   a defender within two metres ahead — the nutmeg: through the legs
   * Every one costs legs, keeps the tackler off for its duration
   * (`skillT`, see tackle), and can fail: a heavy touch that runs away from a
   * player who is not a dribbler. `skillKind` and `spinT` are for the
   * renderer, which turns the roulette into a spin.
   */
  skillMove(p, aim, mod = null) {
    if (p.skillT > 0 || p.stumble > 0 || p.stamina < 0.15) return;
    const skill = p.ref.stats.dribbling / 100;
    const b = this.ball;
    const hasBall = b.owner === p;
    const am = aim ? Math.hypot(aim.x, aim.y) : 0;
    const lateral = am > 0.2 ? (aim.x * p.dirY - aim.y * p.dirX) / am : 0;
    const along = am > 0.2 ? (aim.x * p.dirX + aim.y * p.dirY) / am : 0;
    const foe = this.nearestTo(1 - p.team, p);
    const foeAhead = foe && dist(p, foe) < 2.4 && ((foe.x - p.x) * p.dirX + (foe.y - p.y) * p.dirY) > 0.8;
    const dir = am <= 0.2 ? 'none' : Math.abs(lateral) > Math.abs(along) ? 'side' : along > 0 ? 'fwd' : 'back';
    const move = pickSkill(dir, mod, p.stars || 1, foeAhead);
    p.skillKind = move.id;
    if (hasBall) this.styleEvent(p, 'skills', 25 + (foeAhead ? 15 : 0));
    p.stamina = Math.max(0, p.stamina - 0.04);
    /* It can fail — a heavy touch that runs away. A real dribbler rarely; the
       harder the move against his stars, the likelier; a Trickster less. */
    const over = Math.max(0, move.stars - 2) * 0.05;
    const okP = clamp(0.5 + skill * 0.48 + (p.tr?.trickster || 0) * 0.08 - over + ((p.stars || 1) - move.stars) * 0.03, 0.3, 0.97);
    if (hasBall && Math.random() > okP) {
      p.skillT = 0.2;
      p.stumble = 0.35;
      this.release(p, p.dirX * 6, p.dirY * 6);
      this.cue('skill', p);
      return;
    }
    const fx = move.fx;
    const side = dir === 'side' ? Math.sign(lateral) || 1 : (Math.random() < 0.5 ? -1 : 1);
    const q = 0.75 + skill * 0.4;
    p.skillT = fx.t * (0.9 + skill * 0.25);
    if (fx.spin) p.spinT = p.skillT;
    // turn first (a drag-back spins him round; a heel chop cuts him square)
    if (fx.turn) {
      const a = Math.atan2(p.dirY, p.dirX) + (fx.turn >= Math.PI ? Math.PI : side * fx.turn);
      p.dirX = Math.cos(a); p.dirY = Math.sin(a);
    }
    p.vx *= fx.brake; p.vy *= fx.brake;
    // the right-hand direction of his (new) facing, times the side
    const rx = p.dirY * -side; const ry = -p.dirX * -side;
    const bx = (p.dirX * fx.burst.fwd + rx * fx.burst.side) * q;
    const by = (p.dirY * fx.burst.fwd + ry * fx.burst.side) * q;
    if (fx.burst.fwd > 5 || fx.ball !== 'keep') p.burst = { t: Math.min(0.12, p.skillT * 0.4), vx: bx, vy: by };
    else { p.vx += bx; p.vy += by; }
    if (hasBall && fx.ball === 'past') {
      // knocked beyond the man (through his legs, or round him) and chased
      this.release(p, p.dirX * (9 + skill * 4), p.dirY * (9 + skill * 4));
      b.noTouch = 0.06; b.owner = null;
    } else if (hasBall && fx.ball === 'lift') {
      // the rainbow: over his head, dropping in front of the carrier
      this.release(p, p.dirX * 6.5, p.dirY * 6.5, 6.2);
      b.noTouch = 0.55; b.owner = null;
    }
    // the man in front is sold
    if (foe && dist(p, foe) < 3.4 && Math.random() < fx.freeze * (0.7 + skill * 0.5)) foe.stumble = Math.max(foe.stumble, 0.35 + fx.freeze * 0.4);
    this.cue('skill', p);
  }

  /* -------------------------- free kicks & throw-ins ------------------- *
   * Fouls used to exist only inside the box, because there was nowhere else
   * for one to go. Now a foul anywhere is a free kick with a wall, and every
   * ball over the line is a throw-in taken by a person if a person is
   * playing. Both share the same waiting mechanism as corners and penalties:
   * `phaseT` is the AI's delay, or the person's time limit.                 */
  awardFreeKick(attacking, at, offender) {
    const atk = this.teams[attacking];
    const def = this.teams[1 - attacking];
    const goalX = atk.dir > 0 ? PITCH.w : 0;
    const b = this.ball;
    Object.assign(b, { x: clamp(at.x, 2, PITCH.w - 2), y: clamp(at.y, 2, PITCH.h - 2), z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null, inNet: null, curl: 0, shotBy: null });
    const toGoal = Math.hypot(goalX - b.x, CY - b.y);
    const shootingRange = toGoal < 32;
    // taker: the best striker of a dead ball in range, else the nearest passer
    const taker = (shootingRange && namedTaker(atk, 'fk')) || atk.players.filter((q) => q.role !== 'GK')
      .sort((x, y) => (shootingRange ? y.ref.stats.shooting - x.ref.stats.shooting : dist(x, b) - dist(y, b)))[0];
    taker.x = b.x - atk.dir * 2.6; taker.y = b.y + (b.y < CY ? -0.8 : 0.8);
    taker.vx = taker.vy = 0; taker.touchLock = 0;
    if (offender) offender.stumble = Math.max(offender.stumble, 0.6);

    // the wall: three (four close in) between ball and goal, ten yards off
    const wallN = toGoal < 24 ? 4 : shootingRange ? 3 : 0;
    const wx = goalX - b.x, wy = CY - b.y, wd = Math.hypot(wx, wy) || 1;
    const defenders = def.players.filter((q) => q.role !== 'GK')
      .sort((x, y) => y.ref.stats.physical - x.ref.stats.physical);
    defenders.forEach((q, i) => {
      q.vx = q.vy = 0; q.touchLock = 0.5;
      if (i < wallN) {
        const across = (i - (wallN - 1) / 2) * 1.1;
        q.x = clamp(b.x + (wx / wd) * 9.15 + (-wy / wd) * across, 1, PITCH.w - 1);
        q.y = clamp(b.y + (wy / wd) * 9.15 + (wx / wd) * across, 1, PITCH.h - 1);
      } else if (dist(q, b) < 9.15) {
        // everyone else at least ten yards away
        const ax = q.x - b.x, ay = q.y - b.y, ad = Math.hypot(ax, ay) || 1;
        q.x = clamp(b.x + (ax / ad) * 9.5, 1, PITCH.w - 1); q.y = clamp(b.y + (ay / ad) * 9.5, 1, PITCH.h - 1);
      }
    });
    const gk = def.players.find((q) => q.role === 'GK');
    if (gk) { gk.x = goalX - atk.dir * 1.2; gk.y = CY + (b.y - CY) * 0.15; gk.vx = gk.vy = 0; }
    // three attackers up for a delivery when it is in crossing range
    if (toGoal < 40) {
      atk.players.filter((q) => q !== taker && q.role !== 'GK')
        .sort((x, y) => (y.ref.stats.physical + y.ref.overall) - (x.ref.stats.physical + x.ref.overall))
        .slice(0, 3).forEach((q, i) => {
          q.vx = q.vy = 0;
          q.x = clamp(goalX - atk.dir * (8 + i * 2.5), 2, PITCH.w - 2);
          q.y = clamp(CY + (i - 1) * 4.5, 2, PITCH.h - 2);
        });
    }
    this.cue('whistle', 1);
    this.cue('freekick', { team: attacking, dist: Math.round(toGoal) });
    this.phase = 'freekick';
    this.banner = 'FREE KICK';
    this.setPiece = this.beginSetPiece('freekick', attacking, taker, shootingRange ? 1.9 : 1.2);
    this.markStoppage('freekick');
  }

  /** The AI's free kick: shoot over the wall in range, otherwise deliver or play short. */
  takeFreeKick() {
    const sp = this.setPiece;
    this.setPiece = null;
    this.phase = 'play'; this.banner = '';
    if (!sp) return;
    const p = sp.taker;
    const atk = this.teams[p.team];
    const goalX = atk.dir > 0 ? PITCH.w : 0;
    const toGoal = Math.hypot(goalX - p.x, CY - p.y);
    this.ball.owner = p; p.touchLock = 0;
    if (toGoal < 30 && Math.abs(this.ball.y - CY) < 22) {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.shoot(p, { x: atk.dir, y: side * 0.7 }, 0.78 + Math.random() * 0.2, { loft: 1.5, curl: 30 + (p.tr?.deadball || 0) * 12, placed: true });
    } else if (toGoal < 44) {
      this.cross(p, null);
    } else {
      this.pass(p, { x: atk.dir, y: (Math.random() - 0.5) * 0.8 }, false, 0.5);
    }
  }

  startThrowIn(side, x, y) {
    const b = this.ball;
    const team = this.teams[side];
    b.x = clamp(x, 1, PITCH.w - 1); b.y = y < CY ? 0.3 : PITCH.h - 0.3; b.z = 0;
    b.vx = b.vy = b.vz = 0; b.owner = null; b.lastTouch = null; b.curl = 0; b.shotBy = null;
    const thrower = this.nearestTo(side, b, true);
    if (!thrower) return;
    thrower.x = b.x; thrower.y = y < CY ? 0.4 : PITCH.h - 0.4; thrower.vx = thrower.vy = 0; thrower.touchLock = 0;
    // two team-mates come short to offer, everyone else keeps shape
    team.players.filter((q) => q !== thrower && q.role !== 'GK')
      .sort((a, z) => dist(a, b) - dist(z, b)).slice(0, 2)
      .forEach((q, i) => { q.x = clamp(b.x + team.dir * (i ? -6 : 7), 2, PITCH.w - 2); q.y = clamp(b.y + (y < CY ? 1 : -1) * (5 + i * 4), 2, PITCH.h - 2); q.vx = q.vy = 0; });
    this.cue('throwin', side);
    this.phase = 'throwin';
    this.banner = '';
    this.setPiece = this.beginSetPiece('throwin', side, thrower, 0.9);
  }

  takeThrowIn() {
    const sp = this.setPiece;
    this.setPiece = null;
    this.phase = 'play'; this.banner = '';
    if (!sp) return;
    const p = sp.taker;
    this.ball.owner = p; p.touchLock = 0;
    this.pass(p, { x: this.teams[p.team].dir, y: (CY - p.y) / PITCH.h }, false, 0.3);
    // futsal restarts with the foot, along the floor
    if (FIELD.kickIn) { this.ball.vz = 0; this.ball.z = 0; } else { this.ball.vz = 3.2; this.ball.z = 1.6; }
  }

  /**
   * Common set-piece bookkeeping. A person taking it gets a generous window
   * (the AI timer becomes a deadline) and the play screen shows the taker UI;
   * the CPU takes it when the short timer expires.
   */
  beginSetPiece(kind, team, taker, aiDelay) {
    // a locked seat only takes the restarts its own man takes
    const mine = (c) => c.team === team && !c.ai && (!c.lockId || c.lockId === taker?.ref?.id);
    const human = this.controllers.some(mine);
    this.phaseT = human ? (kind === 'throwin' ? 6 : 9) : aiDelay + (this.teams[team].tactics.tempo === 'slow' ? 1.4 : 0);
    // v82: the street plays on — restarts are quick, for people and the CPU alike
    if (FIELD.street) this.phaseT = human ? 2.5 : Math.min(this.phaseT, 0.5);
    // the person's stick drives the taker: put the seat on him
    if (human) {
      const c = this.controllers.find(mine);
      if (c) c.activeIdx = this.teams[team].players.indexOf(taker);
    }
    return { kind, team, taker, human, aim: { x: this.teams[team].dir, y: 0 }, charge: 0, action: null };
  }

  /**
   * Read a person's stick and buttons during a set piece. Returns true while
   * the phase should keep waiting (the take happens here, on release).
   */
  readSetPieceInput(c, input, dt) {
    const sp = this.setPiece;
    const raw = input.axis();
    const B = this.basis;
    const fwd = -raw.y;
    if (Math.hypot(raw.x, raw.y) > 0.2) {
      sp.aim = B ? { x: B.rx * raw.x + B.fx * fwd, y: B.ry * raw.x + B.fy * fwd } : { x: raw.x, y: fwd };
    }
    const kinds = sp.kind === 'throwin' ? ['pass', 'through'] : ['shoot', 'pass', 'cross', 'through'];
    for (const a of kinds) {
      if (input.held(a)) { sp.action = a; sp.charge = Math.min(1, sp.charge + dt / 0.8); }
      if (input.released(a)) { this.takeSetPiece(a, sp.aim, Math.max(0.3, sp.charge)); return true; }
    }
    this.charge = sp.charge;
    return true;
  }

  /** The angular error (radians, either side) a strike is drawn from. */
  shotSpread(p, d, power, { curl = 0, weak = false, sloppy = 0 } = {}) {
    const acc = p.ref.stats.shooting / 100;
    const finesse = curl ? 1 - 0.22 * (p.tr?.finesse || 0) : 1;
    return ((1.05 - acc) * 0.34 + d / 170 + (1 - power) * 0.07) * (weak ? 1.5 : 1) * (2 - this.formOf(p)) * finesse * (1 + sloppy * 0.8) * 1.5 * Math.min(1, 0.6 + 0.4 * GOAL_HALF / 5.5);
  }

  /**
   * v109: the aim guide for a person's dead ball — what the renderer draws so
   * a set piece is not taken blind. Null unless a person is taking one.
   *   dir, len   the ground arrow: where the stick points, and roughly how
   *              far a pass would go at the power held so far
   *   goal       when the kick can be a shot (a penalty, a free kick within
   *              35 m): where on the goal line it is aimed and how far either
   *              side of that the strike can stray — the same spread the
   *              shot is drawn from, at the power held so far
   */
  setPieceGuide() {
    const sp = this.setPiece;
    if (!sp || !sp.human || !sp.taker) return null;
    const p = sp.taker; const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const bx = this.ball.x; const by = this.ball.y;
    const a = Math.hypot(sp.aim.x, sp.aim.y) > 0.2 ? sp.aim : { x: team.dir, y: 0 };
    const m = Math.hypot(a.x, a.y) || 1;
    const charge = sp.charge || 0;
    const out = { kind: sp.kind, action: sp.action, x: bx, y: by, dir: { x: a.x / m, y: a.y / m }, len: sp.kind === 'throwin' ? 6 + charge * 16 : 9 + charge * 30, goal: null };
    const toGoal = Math.hypot(goalX - bx, CY - by);
    if (sp.kind === 'penalty' || (sp.kind === 'freekick' && toGoal < 35)) {
      const pen = sp.kind === 'penalty';
      const ay = pen ? clamp(a.y * 1.4, -1, 1) : clamp(a.y, -1, 1);
      const ty = CY + (Math.abs(ay) > 0.2 ? ay * GOAL_HALF * 0.9 : 0);
      const d = Math.hypot(goalX - bx, ty - by) || 1;
      const power = pen ? clamp(Math.max(0.3, charge), 0.45, 1) : Math.max(0.3, charge);
      const err = this.shotSpread(p, d, power, { curl: pen ? 0 : 1 });
      out.goal = { x: goalX, y: ty, spread: Math.min(GOAL_HALF * 2, d * Math.tan(err)), power };
      // a shot goes where the target is, not where the stick points: the arrow runs to it
      if (pen || sp.action === 'shoot') { out.dir = { x: (goalX - bx) / d, y: (ty - by) / d }; out.len = d; out.shot = true; }
    }
    return out;
  }

  /** A person takes the dead ball. Also what the watch and tests call. */
  takeSetPiece(action, aim, power = 0.6) {
    const sp = this.setPiece;
    if (!sp) return false;
    const p = sp.taker;
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    this.setPiece = null;
    this.phase = 'play'; this.banner = '';
    this.ball.owner = p; p.touchLock = 0;
    this.charge = 0;
    const a = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim : { x: team.dir, y: 0 };
    if (sp.kind === 'penalty') {
      // aim across the goal, power adds pace and risk
      this.shoot(p, { x: team.dir, y: clamp(a.y * 1.4, -1, 1) }, clamp(power, 0.45, 1), { loft: 0.16 + power * 0.5, placed: true });
      this.penaltyTaker = null;
      return true;
    }
    if (sp.kind === 'throwin') {
      this.pass(p, a, action === 'through', clamp(power, 0.3, 0.7));
      this.ball.vz = 3.2; this.ball.z = 1.6;
      return true;
    }
    if (action === 'shoot') {
      const toGoal = Math.hypot(goalX - p.x, CY - p.y);
      this.shoot(p, { x: team.dir, y: clamp(a.y, -1, 1) }, power, { loft: toGoal < 30 ? 1.5 : 1, curl: 26 + (p.tr?.deadball || 0) * 12, placed: true });
    } else if (action === 'cross') this.cross(p, a);
    else this.pass(p, a, action === 'through', power);
    if (sp.kind === 'corner') this.cornerTaker = null;
    return true;
  }


  /** Is `pt` inside the box that `defending` is protecting? */
  inPenaltyArea(pt, defending) {
    const goalX = this.teams[defending].dir > 0 ? 0 : PITCH.w;
    return Math.abs(pt.x - goalX) < BOX.w && Math.abs(pt.y - CY) < BOX.half;
  }

  /**
   * Set a penalty. Everyone but the taker and the keeper leaves the box, the
   * ball goes on the spot, and the taker is the best finisher on the pitch —
   * which is what a manager would do and saves inventing a taker order.
   */
  awardPenalty(attacking, conceded) {
    const atk = this.teams[attacking];
    const goalX = atk.dir > 0 ? PITCH.w : 0;
    const spotX = goalX + (atk.dir > 0 ? -FIELD.spot : FIELD.spot);

    const b = this.ball;
    Object.assign(b, {
      x: spotX, y: CY, z: 0, vx: 0, vy: 0, vz: 0,
      owner: null, lastTouch: null, inNet: null, curl: 0, shotBy: null,
    });

    const taker = namedTaker(atk, 'pen') || atk.players
      .filter((p) => p.role !== 'GK')
      .sort((x, y) => y.ref.stats.shooting - x.ref.stats.shooting)[0];
    taker.x = spotX - atk.dir * 2.2;
    taker.y = CY;
    taker.vx = taker.vy = 0;
    taker.touchLock = 0;

    // everyone else outside the area, spread across the D
    let n = 0;
    for (const t of [0, 1]) {
      for (const p of this.teams[t].players) {
        if (p === taker) continue;
        if (p.role === 'GK') {
          if (t === attacking) { p.x = this.teams[t].dir > 0 ? 6 : PITCH.w - 6; p.y = CY; }
          else { p.x = goalX + (atk.dir > 0 ? -0.7 : 0.7); p.y = CY; }
          p.vx = p.vy = 0;
          continue;
        }
        const side = n % 2 ? 1 : -1;
        p.x = spotX - atk.dir * (7 + (n % 3) * 2.2);
        p.y = clamp(CY + side * (5 + (n % 4) * 3.4), 3, PITCH.h - 3);
        p.vx = p.vy = 0;
        p.touchLock = 0.4;
        n += 1;
      }
    }

    this.penaltyTaker = taker;
    this.conceded = conceded;
    this.phase = 'penalty';
    this.banner = 'PENALTY';
    this.setPiece = this.beginSetPiece('penalty', attacking, taker, 1.6);
    this.cue('penaltyAwarded', attacking);
    this.cue('whistle', 1);
    this.penalties = (this.penalties || 0) + 1;
  }

  /** Strike the penalty once the phase timer runs out. */
  takePenalty() {
    const p = this.penaltyTaker;
    this.setPiece = null;
    if (!p) { this.startPlay(); return; }
    const atk = this.teams[p.team];
    const goalX = atk.dir > 0 ? PITCH.w : 0;
    this.ball.owner = p;
    p.touchLock = 0;
    // Aimed into a corner with an error that shrinks as shooting rises: a 99
    // buries it, a centre-back does not.
    const side = Math.random() < 0.5 ? -1 : 1;
    const spread = (100 - p.ref.stats.shooting) / 100;
    const aimY = CY + side * (GOAL_HALF - 1.1) + (Math.random() - 0.5) * spread * 5.2;
    this.shoot(p, { x: goalX > PITCH.w / 2 ? 1 : -1, y: (aimY - CY) / 12 },
      0.72 + Math.random() * 0.22, { loft: 0.16, placed: true });
    this.penaltyTaker = null;
    this.phase = 'play';
  }

  /* -------------------------------- AI ------------------------------- */
  nearestTo(side, pt, outfieldOnly = false) {
    let best = null;
    let bestD = Infinity;
    for (const p of this.teams[side].players) {
      if (outfieldOnly && p.role === 'GK') continue;
      const d = dist(p, pt);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  /** v90: the team-mate a person's Press sends: nearest the ball who is not a person's player. */
  pressMate(side) {
    const mine = this.controllers.filter((k) => k.team === side).map((k) => this.playerOf(k));
    let best = null; let bestD = Infinity;
    for (const q of this.teams[side].players) {
      if (q.role === 'GK' || mine.includes(q)) continue;
      const d = dist(q, this.ball); if (d < bestD) { bestD = d; best = q; }
    }
    return best;
  }

  /** Second-closest outfielder — the extra presser when pressing is set high. */
  secondNearest(side, pt) {
    const first = this.nearestTo(side, pt, true);
    let best = null;
    let bestD = Infinity;
    for (const p of this.teams[side].players) {
      if (p.role === 'GK' || p === first) continue;
      const d = dist(p, pt);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  shapeTarget(p) {
    const team = this.teams[p.team];
    const b = this.ball;
    const weHave = b.owner && b.owner.team === p.team;
    const push = ((b.x - PITCH.w / 2) / (PITCH.w / 2)) * team.dir;
    const shift = push * 13 * SCALE * (weHave ? 1.3 : 0.85) * this.mentalityOf(p.team);
    // Without the ball the block drops and narrows — more so for a cautious
    // side — so a shape is a shape when defending, not a line of statues.
    const drop = weHave ? 0 : TUNE.drop * (2 - this.mentalityOf(p.team));
    const squeeze = weHave ? 1 : TUNE.squeeze;
    /* v79: the instructions. Line height and the defensive style move the
       block up or down (the back line most, the forwards least); width
       stretches the shape in possession; and each player's role nudges him
       within his slot — an inverted wing-back tucks in, a false nine drops. */
    const tac = team.tactics || {};
    const lineShift = ((DEF_STYLES[tac.defStyle]?.line ?? 0) + ((tac.line ?? 0.5) - 0.5) * 16) * SCALE;
    const k = p.role === 'DEF' ? 1 : p.role === 'MID' ? 0.6 : 0.3;
    const width = weHave ? 0.84 + (tac.width ?? 0.5) * 0.5 : squeeze;
    let x = p.sx * PITCH.w + team.dir * (shift - drop + lineShift * k);
    let y = CY + (p.sy * PITCH.h - CY) * width + (b.y - CY) * 0.42;
    const role = ROLES[p.tRole];
    if (role) {
      const adj = weHave ? role.has : role.not;
      x += team.dir * adj.fwd;
      const toMid = CY - y;
      y += adj.in >= 0 ? Math.sign(toMid) * Math.min(Math.abs(toMid), adj.in) : -Math.sign(toMid || 1) * -adj.in;
    }
    x = clamp(x, 3, PITCH.w - 3);
    /* v79: the back line holds as one — the centre-backs set it and the full-
       backs step up to it (unless one is off on an overlap), which is what
       leaves a forward stranded offside when it steps up together. */
    if (p.role === 'DEF' && !weHave) {
      const defs = team.players.filter((q) => q.role === 'DEF');
      const lineX = defs.reduce((acc, q) => acc + q.sx * PITCH.w, 0) / (defs.length || 1) + team.dir * (shift - drop + lineShift);
      x = lineX + (x - lineX) * 0.25;
    }
    if (p.role === 'DEF') x = this.holdLine(team, x);
    // in possession the front men stay level with the last defender rather than drifting offside
    if (weHave && p.role !== 'DEF' && b.owner !== p) x = this.onsideX(team, x);
    return { x, y: clamp(y, 3, PITCH.h - 3) };
  }

  think(p, dt) {
    if (p.role === 'GK') return this.thinkGK(p, dt);

    const b = this.ball;
    const team = this.teams[p.team];
    if (b.owner === p) return this.thinkOnBall(p, dt);

    const weHave = b.owner && b.owner.team === p.team;
    const press = this.pressingOf(p.team);
    const isChaser = this.chasers[p.team] === p || this.chasers2?.[p.team] === p;
    const target = this.shapeTarget(p);
    const goalX = team.dir > 0 ? PITCH.w : 0;

    // ---- pressing the ball -------------------------------------------------
    const triggered = this.pressTrigger && this.pressTrigger.team === p.team && this.t - this.pressTrigger.t < 1.4 && dist(p, b) < 16;
    /* v90: second-man press — a person holding Press sends the nearest free
       team-mate to close the carrier down (only ever set by a person's seat) */
    if (b.owner && b.owner.team !== p.team && this.controllers.some((k) => k.team === p.team && k.press2) && this.pressMate(p.team) === p) {
      this.moveTo(p, b.owner.x, b.owner.y, dt, 1.1);
      return;
    }
    if (!weHave && (isChaser || triggered || (!b.owner && dist(p, b) < 14 * press))) {
      this.moveTo(p, b.x + b.vx * 0.25, b.y + b.vy * 0.25, dt, 1.06);
      /* Going in. How close they insist on being before they commit, and how
         often they commit at all, is the player's own aggression lifted by
         how badly the side is chasing the game — a centre-half 2-0 down with
         ten minutes left will fly into things he would have stood up in the
         first half. A lunge from the edge of that range is the one that
         takes the man (see `tackle`), so a nasty side gives away fouls. */
      const agg = this.aggressionOf(p);
      /* v79: the tactical foul. The other side has broken and he is the man who
         can stop it: a clever, cynical pull in midfield — a free kick and
         usually a booking, which a side will take over a goal. */
      const opp = this.teams[1 - p.team];
      if (b.owner && b.owner.team !== p.team && opp.counterT > 0 && dist(p, b.owner) < 2.6 && p.downT <= 0
          && Math.abs(b.owner.x - PITCH.w / 2) < 30 && p.cards < 1 && Math.random() < (0.5 + agg) * dt) {
        const o = b.owner;
        this.fouls[p.team] += 1;
        this.cue('foul', p);
        o.downT = 0.8; o.downMax = 0.8;
        if (Math.random() < 0.7) { p.cards += 1; this.cue('card', p); this.bookings.push({ team: p.team, name: p.ref.name, minute: this.minute() }); }
        opp.counterT = 0;
        this.awardFreeKick(1 - p.team, o, p);
        return;
      }
      const commit = 2.3 + agg * 1.6;                      // v79: 2.3 m composed, 3.9 m rash (real sides make ~35 tackles a match)
      if (b.owner && b.owner.team !== p.team && dist(p, b.owner) < commit) {
        if (Math.random() < (1.4 + agg * 2.2) * TUNE.tackleRate * this.aiSkillFor(p.team) * press * dt) this.tackle(p);
      }
      return;
    }

    // Per-player timer so nobody moves in lockstep. Everything below is a small
    // offset applied on top of the formation slot — larger repositioning was
    // tried and it collapsed possession, because defenders converged on every
    // carrier and no attack survived midfield.
    p.runT = (p.runT || Math.random() * 4) + dt;
    const jitterX = Math.sin(p.runT * 0.62 + p.num * 1.3) * 3.2;
    const jitterY = Math.sin(p.runT * 0.83 + p.num * 2.1) * 4.4;

    /* The break. For three and a half seconds after winning it deep, every
     * midfielder and forward sprints into the space the other side left. */
    if (TUNE.counter && weHave && team.counterT > 0 && p.role !== 'DEF') {
      const lane = clamp(p.sy * PITCH.h + (p.num % 2 ? 6 : -6), 5, PITCH.h - 5);
      this.moveTo(p, clamp(target.x + team.dir * 22, 4, PITCH.w - 4), lane, dt, 1.1);
      return;
    }
    /* Off-the-ball runs. A midfielder near the carrier in the final third
     * picks a moment, and then a line beyond the ball, and goes — a run
     * that a through ball has somewhere to land. Per-player timer so the
     * runs are staggered rather than a wave. */
    /* v79: an overlapping full-back. When a team-mate carries it down his flank
       in the attacking half he goes round the outside — somewhere to cross from. */
    if (weHave && ROLES[p.tRole]?.flag === 'overlap' && b.owner && b.owner !== p) {
      const flank = Math.abs(b.owner.y - p.y) < 16 && Math.abs(b.owner.y - CY) > 12;
      const advanced = (b.owner.x - PITCH.w / 2) * team.dir > 4;
      if (flank && advanced) {
        const tl = p.sy < 0.5 ? 4 : PITCH.h - 4;
        this.moveTo(p, clamp(this.onsideX(team, b.owner.x + team.dir * 11), 4, PITCH.w - 4), tl, dt, 1.12);
        return;
      }
    }
    /* v133: attacking the box. While a team-mate has it wide in the crossing
       zone, up to three forwards and midfielders go for the near post, the far
       post and the penalty spot (pickBoxRuns), staying onside until it is
       played in. The carrier's nearest team-mate is never taken, so he keeps
       a short option. */
    // ...and while the cross is in the air nobody has it, so the runners carry on to where it is coming down
    const cr = this.crossRun;
    if (cr && cr.team === p.team && !b.owner && this.t < cr.until && cr.runners.has(p)) {
      // the man it is meant for goes to meet it; the others hold their posts for the second ball
      const sp = p === cr.lead ? { x: cr.lx, y: cr.ly } : cr.runners.get(p);
      this.moveTo(p, clamp(sp.x, 2, PITCH.w - 2), clamp(sp.y, 2, PITCH.h - 2), dt, p === cr.lead ? 1.12 : 0.9);
      return;
    }
    if (cr && cr.team !== p.team && cr.guard === p && !b.owner && this.t < cr.until) {
      this.moveTo(p, clamp(cr.lx, 2, PITCH.w - 2), clamp(cr.ly, 2, PITCH.h - 2), dt, 1.12);
      return;
    }
    const boxSpot = weHave ? this.boxRuns?.[p.team]?.get(p) : null;
    if (boxSpot) {
      const tx = this.onsideX(team, boxSpot.x);
      const far = Math.hypot(tx - p.x, boxSpot.y - p.y);
      this.moveTo(p, clamp(tx, 2, PITCH.w - 2), clamp(boxSpot.y, 2, PITCH.h - 2), dt, far > 6 ? 1.1 : 0.8);
      return;
    }
    // a third-man run set off by a pass between two others (see `pass`)
    if (weHave && p.thirdUntil > 0) {
      p.thirdUntil -= dt;
      this.moveTo(p, clamp(p.thirdX, 4, PITCH.w - 4), clamp(p.thirdY, 4, PITCH.h - 4), dt, 1.14);
      return;
    }
    const runner = p.role === 'MID' || ROLES[p.tRole]?.flag === 'runs';
    if (TUNE.runs && weHave && runner && p.role !== 'DEF' && b.owner && b.owner !== p) {
      const finalThird = (b.x - PITCH.w / 2) * team.dir > 12;
      p.runClock = (p.runClock || 0) - dt;
      if (p.runClock <= 0 && finalThird && dist(p, b.owner) < 22 && Math.random() < 0.35 * dt) {
        p.runClock = 4 + Math.random() * 3;
        p.runUntil = 1.6;
        p.runY = clamp(b.owner.y + (p.y > b.owner.y ? 9 : -9), 5, PITCH.h - 5);
        p.runSlack = Math.random() < 0.35 ? 2.4 : 0;
      }
      if (p.runUntil > 0) {
        p.runUntil -= dt;
        this.moveTo(p, clamp(this.onsideX(team, b.owner.x + team.dir * 16, p.runSlack || 0), 4, PITCH.w - 4), p.runY, dt, 1.12);
        return;
      }
    }

    /* v103 (backlog #21): support. The two team-mates nearest the carrier
       (this.supporters, picked every frame since v69 but never acted on) now
       go and make themselves an option: every ~0.35 s each scores spots 9–17 m
       from the ball — a clear lane from the carrier, room from the nearest
       marker, a little forward if it is on — without straying far from his
       place in the shape or standing on the other supporter, and moves there.
       Before this, one moment in five on the ball had nobody open and 58% of
       passes arrived (tools/support-audit.mjs). */
    const sup = weHave && b.owner && b.owner !== p ? this.supporters[p.team] : null;
    if (TUNE.support && sup && (sup[0] === p || sup[1] === p) && team.counterT <= 0) {
      p.supT = (p.supT || 0) - dt;
      if (p.supT <= 0 || p.supFor !== b.owner) {
        p.supT = 0.35; p.supFor = b.owner;
        const spot = this.supportSpot(p, b.owner, target, sup[0] === p ? sup[1] : sup[0]);
        p.supX = spot.x; p.supY = spot.y;
      }
      if (p.supX != null) {
        const far = Math.hypot(p.supX - p.x, p.supY - p.y);
        this.moveTo(p, p.supX, p.supY, dt, far > 8 ? 1.02 : 0.9);
        return;
      }
    }

    if (weHave && p.role === 'FWD') {
      // forwards push the line and drift across it in bursts
      const burst = Math.sin(p.runT * 0.85 + p.num) > 0.2 ? 4 : 0;
      this.moveTo(p, clamp(target.x + team.dir * (8 + burst), 4, PITCH.w - 4),
        clamp(target.y + jitterY, 4, PITCH.h - 4), dt, 0.95);
      return;
    }

    if (weHave && p.role === 'DEF' && (p.sy < 0.3 || p.sy > 0.7) && Math.abs(b.y - p.y) < 26) {
      // wide defenders step up the flank when play is on their side
      this.moveTo(p, clamp(target.x + team.dir * 9, 4, PITCH.w - 4),
        clamp(target.y, 3, PITCH.h - 3), dt, 0.9);
      return;
    }

    // ---- defending our own third --------------------------------------
    // Defenders pick up a runner and sit goal-side of them. Scoped to our own
    // third on purpose: marking across the whole pitch strangles every passing
    // lane and kills the game in midfield.
    if (!weHave && p.role === 'DEF') {
      const gx = team.dir > 0 ? 0 : PITCH.w;
      // Only inside genuine danger. Wider than this and defenders chase runners
      // around midfield, closing every passing lane and killing attacking play.
      const underPressure = Math.abs(b.x - gx) < 24;
      if (underPressure) {
        const mark = this.markFor(p);
        if (mark) {
          const gs = Math.sign(gx - mark.x) || 1;
          const tx = this.holdLine(team, mark.x + gs * 3.2);
          const ty = mark.y + Math.sign(CY - mark.y) * 0.7;
          this.moveTo(p, clamp(tx, 2, PITCH.w - 2), clamp(ty, 2, PITCH.h - 2), dt, 1.02);
          return;
        }
        // nobody to pick up — tuck into the box rather than hugging the touchline
        const tuck = CY + (target.y - CY) * 0.62;
        this.moveTo(p, this.holdLine(team, target.x), clamp(tuck, 3, PITCH.h - 3), dt, 0.95);
        return;
      }
    }

    this.moveTo(p, clamp(target.x + jitterX, 3, PITCH.w - 3),
      clamp(target.y + jitterY, 3, PITCH.h - 3), dt, weHave ? 0.85 : 0.92);
  }

  /* ------------------------------ offside (v79) ------------------------------
   * The line is the second-last defender (the keeper usually being the last),
   * or the ball if that is further forward, and only in the opponents' half.
   * A pass or a cross notes who is beyond it at the moment it is played; if
   * one of them is the next to get the ball before a defender touches it, the
   * flag goes up and the defenders take an indirect free kick where he was. */
  offsideLine(defTeam) {
    const t = this.teams[defTeam];
    const own = t.dir > 0 ? 0 : PITCH.w;
    const depth = t.players.map((q) => Math.abs(q.x - own)).sort((a, b) => a - b);
    const second = depth[1] ?? depth[0] ?? 0;
    return own + (t.dir > 0 ? second : -second);
  }
  isOffside(q, lineX = null) {
    if (this.noOffside) return false;
    const atk = this.teams[q.team];
    const line = lineX ?? this.offsideLine(1 - q.team);
    const beyond = (q.x - line) * atk.dir > 0.25;
    const pastBall = (q.x - this.ball.x) * atk.dir > 0;
    const theirHalf = (q.x - PITCH.w / 2) * atk.dir > 0;
    return beyond && pastBall && theirHalf;
  }
  noteOffside(passer) {
    if (this.phase !== 'play' || !FIELD.offside || this.noOffside) { this.offsideWatch = null; return; }
    const line = this.offsideLine(1 - passer.team);
    const ids = new Set();
    for (const q of this.teams[passer.team].players) if (q !== passer && q.role !== 'GK' && this.isOffside(q, line)) ids.add(q);
    this.offsideWatch = ids.size ? { team: passer.team, ids } : null;
  }
  /** The side with the ball keeps its forwards level with the last defender (AI). */
  /** v103: the best spot near the carrier for a team-mate to receive it. */
  supportSpot(p, c, home, other) {
    const team = this.teams[p.team];
    const opp = this.teams[1 - p.team].players;
    const laneOf = (x, y) => {
      let best = 99;
      const vx = x - c.x; const vy = y - c.y; const L = vx * vx + vy * vy || 1;
      for (const o of opp) {
        const t = clamp(((o.x - c.x) * vx + (o.y - c.y) * vy) / L, 0, 1);
        best = Math.min(best, Math.hypot(c.x + vx * t - o.x, c.y + vy * t - o.y));
      }
      return best;
    };
    const roomAt = (x, y) => { let best = 99; for (const o of opp) best = Math.min(best, Math.hypot(o.x - x, o.y - y)); return best; };
    const sc = Math.max(0.6, SCALE);
    let best = null; let bestScore = -1e9;
    for (const deg of [-150, -110, -70, -35, 0, 35, 70, 110, 150]) {
      const a = deg * Math.PI / 180;
      for (const r of [9, 13, 17]) {
        let x = c.x + team.dir * Math.cos(a) * r * sc;
        const y = c.y + Math.sin(a) * r * sc;
        if (y < 3 || y > PITCH.h - 3 || x < 3 || x > PITCH.w - 3) continue;
        if ((x - c.x) * team.dir > 0) x = this.onsideX(team, x);
        const lane = Math.min(5, laneOf(x, y));
        const room = Math.min(8, roomAt(x, y));
        const fwd = ((x - c.x) * team.dir) / (r * sc);
        const stray = Math.max(0, Math.hypot(x - home.x, y - home.y) - 10 * sc);
        const travel = Math.hypot(x - p.x, y - p.y);
        const crowd = other && other.supX != null && Math.hypot(x - other.supX, y - other.supY) < 7 * sc ? 3 : 0;
        const score = lane * 1.0 + room * 0.55 + fwd * 1.4 - stray * 0.22 - travel * 0.07 - crowd;
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
    }
    return best || { x: home.x, y: home.y };
  }

  /**
   * v133: who attacks the box, and where. Only while the carrier is wide in
   * the crossing zone (the same test his own cross decision uses); the spots
   * are the near post, the far post and the penalty spot, relative to the side
   * the ball is on. Assignments hold for half a second so runners do not swap
   * spots every frame, and are dropped the moment the ball leaves the zone.
   * @returns {Map<object, {x:number, y:number, tag:string}>|null}
   */
  pickBoxRuns(c, dt) {
    const team = this.teams[c.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const k = PITCH.h / 68;
    const wideM = 20 * k;
    const wide = c.y < wideM || c.y > PITCH.h - wideM;
    if (!wide || Math.abs(goalX - c.x) > 32 * SCALE || this.phase !== 'play') { team.boxRun = null; return null; }
    const side = Math.sign(c.y - CY) || 1;
    const spots = [
      { x: goalX - team.dir * 5.5 * k, y: CY + side * 3.2 * k, tag: 'near' },
      { x: goalX - team.dir * 6.5 * k, y: CY - side * 4.5 * k, tag: 'far' },
      { x: goalX - team.dir * 11 * k, y: CY - side * 1.5 * k, tag: 'spot' },
    ];
    team.boxRunT = (team.boxRunT || 0) - dt;
    if (team.boxRun && team.boxRunFor === c && team.boxRunT > 0) {
      // same carrier, still in the zone: the same men, the spots re-aimed for his side
      const m = new Map();
      for (const [q, tag] of team.boxRun) m.set(q, spots.find((s2) => s2.tag === tag));
      return m;
    }
    const keep = this.supporters[c.team]?.[0];
    const pool = team.players.filter((q) => q !== c && q !== keep && (q.role === 'FWD' || q.role === 'MID')
      && !q.parked && !this.isControlled(q) && Math.abs(goalX - q.x) < 40 * SCALE);
    const out = new Map(); const tags = new Map();
    // each spot slides up to 2.5 m off the defender nearest it — a run is into a gap, not onto a man
    const foes = this.teams[1 - c.team].players.filter((f) => f.role !== 'GK');
    for (const sp of spots) {
      let near = null; let nd = Infinity;
      for (const f of foes) { const d = Math.hypot(f.x - sp.x, f.y - sp.y); if (d < nd) { nd = d; near = f; } }
      if (near && nd < 3) { const dy = sp.y - near.y || side; sp.y += Math.sign(dy) * (3 - nd) * 0.85; }
    }
    for (const sp of spots) {
      let best = null; let bd = 30 * k;
      for (const q of pool) {
        if (out.has(q)) continue;
        // forwards first for the posts; the late run to the spot is the attacking midfielder's
        const cam = q.ref?.position === 'CAM';
        const w = q.role === 'FWD' ? (sp.tag === 'spot' ? 0.9 : 0.8) : cam ? (sp.tag === 'spot' ? 0.65 : 0.9) : 1;
        const d = Math.hypot(q.x - sp.x, q.y - sp.y) * w;
        if (d < bd) { bd = d; best = q; }
      }
      if (best) { out.set(best, sp); tags.set(best, sp.tag); }
    }
    team.boxRun = tags; team.boxRunFor = c; team.boxRunT = 0.5;
    return out.size ? out : null;
  }

  onsideX(team, x, slack = 0) {
    if (!FIELD.offside || this.noOffside) return x;
    const line = this.offsideLine(1 - team.side);
    const lim = line - team.dir * (0.8 - slack);
    const ballLim = this.ball.x;
    const cap = team.dir > 0 ? Math.max(lim, ballLim) : Math.min(lim, ballLim);
    return team.dir > 0 ? Math.min(x, cap) : Math.max(x, cap);
  }

  /** Defenders never collapse onto their own keeper — hold a line off the goal. */
  holdLine(team, x) {
    const gx = team.dir > 0 ? 0 : PITCH.w;
    const MIN = 7.5 * this.preset.discipline * Math.max(0.45, SCALE);
    return team.dir > 0 ? Math.max(x, gx + MIN) : Math.min(x, gx - MIN);
  }

  /**
   * Is this player about to strike the ball with his weaker foot?
   *
   * Read off where the ball actually is relative to which way he is facing,
   * rather than off the direction of the pass — so it changes shot to shot as
   * he shifts it, which is the point. A ball dead in front of him is neither
   * foot and never counts as weak.
   */
  weakFoot(p) {
    const b = this.ball;
    // the player's own right-hand direction, from his facing
    const across = (b.x - p.x) * p.dirY + (b.y - p.y) * -p.dirX;
    if (Math.abs(across) < 0.15) return false;
    return Math.sign(across) !== strongSide(p);
  }

  /** Nearest opponent no other defender has claimed this tick. */
  markFor(p) {
    const gx = this.teams[p.team].dir > 0 ? 0 : PITCH.w;
    // How far a defender will travel to pick someone up. A positionally
    // responsible side tracks the runner; a looser one lets him go and leaves
    // the space an attacking mode wants.
    const reach = 18 * this.preset.discipline;
    let best = null;
    let bestD = Infinity;
    for (const f of this.teams[1 - p.team].players) {
      if (f.role === 'GK') continue;
      if (Math.abs(f.x - gx) > 26) continue;             // only real threats
      if (f._markTick === this._tick && f._markedBy !== p) continue;
      const d = dist(p, f);
      if (d < bestD && d < reach) { bestD = d; best = f; }
    }
    if (best) { best._markedBy = p; best._markTick = this._tick; }
    return best;
  }

  thinkOnBall(p, dt) {
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const toGoal = Math.hypot(goalX - p.x, CY - p.y);
    const foe = this.nearestTo(1 - p.team, p);
    const pressure = foe ? dist(p, foe) : 99;
    const bu = this.buildUpOf(p.team);
    const q = this.decisionQuality(p.team);
    const slow = team.tactics.tempo === 'slow';
    const ownGoalX = team.dir > 0 ? 0 : PITCH.w;
    const fromOwn = Math.abs(p.x - ownGoalX);

    /* v79: seeing it out. Winning late, a man in the attacking third with no
       shot on takes it to the corner flag and shields it there. */
    if (slow && toGoal < 30 && toGoal > 14 && pressure > 1.4 && Math.random() < 0.8) {
      const cornerY = p.y < CY ? 1.5 : PITCH.h - 1.5;
      this.moveTo(p, clamp(goalX - team.dir * 2, 2, PITCH.w - 2), cornerY, dt, 0.55);
      return;
    }
    /* v79: under pressure in his own third, a defender (or anyone less sure of
       himself) gets rid of it — high and long, usually towards the touchline. */
    if (fromOwn < 32 && pressure < 3.4 && (p.role === 'DEF' || p.control < 0.72)
        && Math.random() < (2.3 + bu.longBias * 2) * dt) {
      this.clear(p);
      return;
    }

    const sc = Math.max(0.55, SCALE);
    if (toGoal < 31 * sc && (pressure > 1.7 || toGoal < 16 * sc)) {
      /* v99: difficulty above 1 buys better chances, not more of them. Up to
         1.0 the skill scales the shot rate as it always has (the sweep runs
         at 1.0 and is unchanged); above it, the extra makes the CPU patient —
         keener in the box, far less keen from range — and placed. Scaling the
         rate alone only added shots from worse positions: from Pro (1.0) to
         Apex Elite (1.9) the CPU's goals did not rise at all
         (tools/difficulty-audit.mjs). */
      const sk = this.aiSkillFor(p.team);
      const over = clamp(sk - 1, 0, 0.9);
      const rateMul = over ? Math.max(0.25, 1 + over * (toGoal < 16 * sc ? 1.2 : toGoal < 22 * sc ? 0.2 : -0.7)) : sk;
      if (Math.random() < (3.3 - toGoal / (22 * sc)) * TUNE.shotRate * rateMul * (slow && toGoal > 14 ? 0.4 : 1) * dt) {
        // CPU keeps most efforts down, but bends the odd one from range
        const far = toGoal > 17;
        const gk = this.teams[1 - p.team].players.find((q) => q.role === 'GK');
        const gkOut = gk && Math.abs(gk.x - goalX) > 7 && toGoal < 20 && toGoal > 9;
        const chip = gkOut && Math.random() < 0.35 * this.aiSkillFor(p.team);
        // v79: the CPU picks a corner — usually the far post — instead of hitting the keeper
        let post = (Math.random() < 0.62 ? Math.sign(CY - p.y) : -Math.sign(CY - p.y)) || 1;
        // v99: a better CPU looks up first — the side the keeper is not covering, and tighter to it
        if (over && gk && Math.random() < over) post = -Math.sign(gk.y - CY) || post;
        this.shoot(p, { x: 0, y: post * (0.35 + Math.random() * 0.55) * (team.dir > 0 ? 1 : 1) }, 0.55 + Math.random() * 0.45, {
          loft: chip ? 2.6 : 0.32 + Math.random() * 0.3,
          curl: !chip && far && Math.random() < 0.4 ? 30 : 0,
          chip,
          ...(over ? { sloppy: -0.45 * over } : {}),
        });
        return;
      }
    }
    // wide and deep? whip it into the box instead
    const wideM = 20 * (PITCH.h / 68);
    const wide = p.y < wideM || p.y > PITCH.h - wideM;
    if (wide && Math.abs(goalX - p.x) < 32 * SCALE && Math.random() < 2.2 * this.aiSkillFor(p.team) * dt) {
      const inBox = team.players.some((t) => t !== p && t.role !== 'GK' && Math.abs(t.x - goalX) < 22);
      if (inBox) {
        // v79: the delivery that suits it — pulled back from the byline, whipped in, or floated
        const byline = Math.abs(goalX - p.x) < 9;
        const kind = byline && Math.random() < 0.5 ? 'cutback' : Math.random() < 0.35 ? 'driven' : 'floated';
        this.cross(p, null, kind);
        return;
      }
    }

    // on the break the ball goes early and long, before the shape reforms
    if (TUNE.counter && team.counterT > 0 && toGoal > 26 && Math.random() < 2.4 * dt) {
      // only when someone is actually ahead to run onto it
      const runner = team.players.find((t) => t !== p && t.role !== 'GK' && (t.x - p.x) * team.dir > 12 && dist(t, p) < 42);
      if (runner) { this.pass(p, { x: runner.x - p.x, y: runner.y - p.y }, true, 0.7); return; }
    }
    if (pressure < 3.6 && Math.random() < 2.6 * bu.passRate * (slow ? 0.75 : 1) * dt) {
      /* v79: difficulty is decision quality. A good side picks the pass it
         meant; a poorer one sometimes plays the wrong one — square into a
         man, or back when forward was on. */
      if (Math.random() > q) {
        const a = (Math.random() - 0.5) * 3.2;
        this.pass(p, { x: Math.cos(a) * team.dir, y: Math.sin(a) }, false, 0.6);
        return;
      }
      if (Math.random() < bu.longBias * 0.22 && toGoal > 30) {
        this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.8 }, true, 0.9);
        return;
      }
      // The CPU never holds a button, so its power has to be stated. 0.75 gives
      // it a 47m passing range, which is the flat 48m it had before power
      // existed — the point is to add the mechanic without moving the balance.
      // Swept at 0.5 / 0.62 / 0.75 over 40 matches: 2.30/12.3, 2.33/12.2 and
      // 2.58/11.9. They are barely distinguishable, so the range match is the
      // reason to prefer this one, not the numbers.
      this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.6 }, toGoal > 45, 0.75);
      return;
    }

    // carry toward goal — wide players stay in their channel and attack the
    // byline so crosses actually happen, everyone else cuts inside
    let tx = goalX;
    // v79: wide men stay on the touchline; everyone else drifts in less than before
    let ty = wide && Math.abs(goalX - p.x) < 60
      ? clamp(p.y + Math.sign(p.y - CY) * 2, 2.5, PITCH.h - 2.5)
      : CY + (p.y - CY) * 0.85;
    if (foe && pressure < 8) {
      tx += (p.x - foe.x) * 0.5;
      ty += (p.y - foe.y) * 1.4;
    }
    this.moveTo(p, clamp(tx, 2, PITCH.w - 2), clamp(ty, 3, PITCH.h - 3), dt, 1.0);
  }

  thinkGK(p, dt) {
    const team = this.teams[p.team];
    const b = this.ball;
    const goalX = team.dir > 0 ? 0 : PITCH.w;
    const inward = team.dir > 0 ? 1 : -1;

    if (b.owner === p) { this.drive(p, inward, 0, dt, 0.3); return; }

    /* Sweeper-keeper. A loose ball in his own third that he is nearer to than
     * any defender is his to take — and a ball hanging in the air over his
     * six-yard box is claimed, not watched. Both used to be left to the back
     * four, which is how a hopeful punt became a one-on-one. */
    const loose = !b.owner && b.noTouch <= 0;
    const dGoal = Math.hypot(b.x - goalX, b.y - CY);
    if (TUNE.sweeper && loose && dGoal < 26 + (p.tr?.sweeper || 0) * 6 && b.z < 0.9 && !(b.vx * inward < -6)) {
      const mine = this.nearestTo(p.team, b, true);
      if (mine && dist(p, b) < dist(mine, b) - 1.5) { this.moveTo(p, b.x + b.vx * 0.15, b.y + b.vy * 0.15, dt, 1.12); return; }
    }
    if (loose && b.z > 1.0 && b.vz < 0 && dGoal < 9 && Math.abs(b.y - CY) < GOAL_HALF + 3) {
      const tAir = b.vz < -0.1 ? Math.max(0, b.z / -b.vz) : 0.5;
      this.moveTo(p, b.x + b.vx * tAir, b.y + b.vy * tAir, dt, 1.15);
      return;
    }

    const dx = b.x - goalX;
    const dy = b.y - CY;
    const d = Math.hypot(dx, dy) || 1;
    const closing = b.vx * inward < -1;      // ball travelling towards this goal

    // stand on the ball-to-goal line so the angle is covered
    let standOff = clamp(d * 0.18, 1.6, 5.5);
    let tx = goalX + inward * standOff;
    let ty = CY + dy * (standOff / d);
    let urgency = 1.06;

    if (!b.owner && closing && d < 30) {
      // read the shot: intercept where it will cross the keeper's line.
      // The read is judged once per shot and carries an error scaled to the keeper's quality.
      if (p.readId !== b.shotId) {
        p.readId = b.shotId;
        p.readErr = (Math.random() - 0.5) * 2 * (1.34 - p.ref.overall / 100) * 7.6 * (2.2 - 1.2 * Math.min(1, GOAL_HALF / 5.5));   // v80: shots come quicker in small-sided
        p.reactT = 0.09 + (1.05 - p.ref.overall / 100) * 0.22;  // beatable at pace (v79: a touch slower)
      }
      p.reactT = Math.max(0, (p.reactT || 0) - dt);
      const t = (tx - b.x) / b.vx;
      if (p.reactT <= 0 && t > 0 && t < 2.2) {
        const cross = b.y + b.vy * t + p.readErr;
        ty = cross;
        urgency = 1.12;

        // Committed dive: if the ball is heading somewhere the keeper cannot
        // simply step to, they leave their feet and stretch for it.
        const gap = cross - p.y;
        // v79: how far he can get is his rating (and a Sweeper Keeper's spring)
        const reach = (3.2 + (p.ref.overall - 70) * 0.06 + (p.tr?.sweeper || 0) * 0.35) * Math.min(1, 0.35 + 0.65 * GOAL_HALF / 5.5);   // v80: a small goal, a smaller dive
        if (p.diveT <= 0 && t < 0.62 && Math.abs(gap) > 0.85 && Math.abs(gap) < reach) {
          p.diveT = 0.75;
          p.diveDir = Math.sign(gap);
          p.diveHigh = (b.z + b.vz * t) > 1.15;
          p.vy = p.diveDir * (8.6 + p.ref.stats.defending * 0.03 + (p.ref.overall - 70) * 0.05);
          p.vx = inward * -0.8;
        }
      }
    } else if (d < 13 && b.owner && b.owner.team !== p.team) {
      tx = goalX + inward * clamp(d * 0.34, 2, 5.5);   // narrow the angle on a one-on-one
      ty = b.y;
      urgency = 1.1;
    }

    // mid-dive the keeper is committed — no steering, just the stretch
    if (p.diveT > 0) {
      p.diveT -= dt;
      p.vx *= 0.94;
      p.vy *= 0.965;
      return;
    }

    ty = clamp(ty, CY - GOAL_HALF - 2.5, CY + GOAL_HALF + 2.5);
    tx = team.dir > 0 ? clamp(tx, 1, BOX.w - 2) : clamp(tx, PITCH.w - BOX.w + 2, PITCH.w - 1);
    this.moveTo(p, tx, ty, dt, urgency);
  }

  /**
   * Where a keeper steers a parry.
   *
   * Reflecting the shot puts the ball straight back out in front of goal,
   * which is exactly where the striker is standing — for a long time that was
   * the cheapest goal in this game. A keeper does not do that. He puts it round
   * the post, out for a throw, or wide of the box away from anyone in an
   * attacking shirt, and this picks whichever of a fan of angles is emptiest.
   *
   * Returns a unit vector in pitch space.
   */
  deflectionAim(gk) {
    const inward = this.teams[gk.team].dir > 0 ? 1 : -1;
    let best = { x: inward, y: 0 };
    let bestScore = -Infinity;
    for (let i = 0; i <= 10; i++) {
      // a fan from square across one post round to the other
      const a = -1.35 + (i / 10) * 2.7;
      const dx = inward * Math.cos(a);
      const dy = Math.sin(a);
      let score = Math.abs(a) * 0.9;              // sideways beats straight back out
      for (const team of this.teams) {
        for (const q of team.players) {
          if (q === gk) continue;
          const rx = q.x - gk.x;
          const ry = q.y - gk.y;
          const along = rx * dx + ry * dy;
          if (along < 1 || along > 22) continue;
          const off = Math.abs(rx * dy - ry * dx);         // perpendicular miss
          const near = Math.max(0, 1 - off / 5);           // 1 = dead in the path
          score += (q.team === gk.team ? 0.8 : -2.6) * near * (1 - along / 26);
        }
      }
      if (score > bestScore) { bestScore = score; best = { x: dx, y: dy }; }
    }
    return best;
  }

  /**
   * Keeper contact. A tame shot is gathered; anything struck with real pace is
   * parried away — often wide, which is what turns into a corner.
   * @returns {boolean} true if the keeper kept hold of it
   */
  keeperContact(gk, speed) {
    const b = this.ball;
    const team = this.teams[gk.team];
    const inward = team.dir > 0 ? 1 : -1;
    const hands = (gk.ref.overall / 100) * this.preset.hands;
    const holdable = 17 + hands * 13;                 // ~26-30 m/s for a good keeper

    this.tally(gk, 'saves');
    if (speed < holdable && gk.diveT <= 0 && Math.random() < 0.36 + hands * 0.34) {   // v79: fewer clean catches, more parries
      this.cue('save');
      return true;                                    // clean catch
    }
    this.cue('save');

    // Parry. Most are pushed back into play, but a good save on a shot heading
    // for the corner is tipped round the post — behind the line, so it becomes
    // a corner rather than a rebound.
    const side = Math.sign(b.y - CY) || (Math.random() < 0.5 ? -1 : 1);
    const out = speed * (0.34 + Math.random() * 0.2);
    const tipRound = Math.random() < 0.55;

    if (tipRound) {
      b.vx = -inward * (5 + Math.random() * 5);     // carry it behind the goal line
      b.vy = side * out * 1.1;
      b.vz = 2 + Math.random() * 3;
      b.noTouch = 0.6;                              // v79: not straight back into his own hands
    } else {
      /* Deflection control.
       *
       * Blend where the ball was going anyway against where the keeper wants
       * it. How much of the second he gets is the preset's call and his own
       * quality: on Authentic a parry is mostly physics and a scramble is a
       * real possibility, on Competitive a good keeper puts it where he means
       * to nearly every time.
       */
      const wide = Math.random() < 0.62;
      const raw = { x: inward * (wide ? 0.45 : 0.9), y: side * (wide ? 1.05 : 0.5) };
      const aim = this.deflectionAim(gk);
      const w = clamp(this.preset.deflect * (0.55 + hands * 0.5), 0, 1);
      let dx = raw.x * (1 - w) + aim.x * w;
      let dy = raw.y * (1 - w) + aim.y * w;
      const m = Math.hypot(dx, dy) || 1;
      b.vx = (dx / m) * out;
      b.vy = (dy / m) * out;
      b.vz = 1.5 + Math.random() * 2.5;
    }
    b.owner = null;
    b.lastTouch = gk;                                 // keeper touched it last -> corner if it goes out
    b.shotBy = null;
    b.noTouch = Math.max(b.noTouch || 0, 0.18);
    gk.touchLock = tipRound ? 0.8 : 0.35;
    this.parries = (this.parries || 0) + 1;
    return false;
  }
}

