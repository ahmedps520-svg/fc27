import { rosterOf, getClub } from '../data/generator.js';

/* ------------------------------------------------------------------ *
 * Real-time arcade match. Units are metres; the pitch is 105 x 68.
 * ------------------------------------------------------------------ */
export const PITCH = { w: 105, h: 68 };
export const GOAL_HALF = 5.5;      // goal spans centre +/- 5.5m
const CY = PITCH.h / 2;
const BOX_W = 16.5;
const BOX_HALF = 20;

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
const SHAPE = SHAPES['4-4-2'];

/** Natural role of a generated player, used when re-slotting into a new shape. */
const ROLE_OF = {
  GK: 'GK', CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  LW: 'FWD', RW: 'FWD', ST: 'FWD',
};

export const MENTALITY = { defensive: 0.72, balanced: 1, attacking: 1.32 };
export const PRESSING = { low: 0.7, normal: 1, high: 1.4 };

/** How many can sit on the bench, and how many of them can come on. */
export const BENCH_SIZE = 5;
export const MAX_SUBS = 3;

const GRAV = 16;                   // arcade gravity, m/s^2
export const GOAL_HEIGHT = 2.44;

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
  return xi.slice(0, 11);
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
  return {
    maxSpeed: 5.4 + (ref.stats.pace / 100) * 3.8,
    // 1 is fresh, 0 is spent. A strong physical player empties slower and
    // fills faster, which is most of what the stat is for.
    stamina: 1,
    stamCost: 1.35 - (ref.stats.physical / 100) * 0.6,
  };
}

function makeTeam(clubId, side, isHuman, custom = null) {
  const club = getClub(clubId);
  const xi = custom?.xi?.length === 11 ? custom.xi : pickXI(clubId);
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
    dir, side, isHuman,
    players, bench, subsLeft: MAX_SUBS,
    score: 0, shots: 0, onTarget: 0, poss: 0, scorers: [],
    formation: '4-4-2',
    // a custom squad may bring an instruction with it — the Apex Division uses
    // this to make the CPU press and push up the higher you climb
    tactics: { mentality: 'balanced', pressing: 'normal', ...(custom?.tactics || {}) },
  };
}

export class Match {
  constructor(homeId, awayId, opts = {}) {
    // mode: 'single' | 'versus' | 'coop'. human === null runs both sides on AI.
    this.mode = opts.mode || 'single';
    this.human = opts.human === null ? null : (opts.human ?? 0);
    this.teams = [
      makeTeam(homeId, 0, this.human === 0, opts.homeSquad || null),
      makeTeam(awayId, 1, this.human === 1, opts.awaySquad || null),
    ];

    // One seat per person at the couch. Each keeps its own selected player and
    // its own shot charge, so two people never fight over the same footballer.
    if (this.human === null) this.controllers = [];
    else if (this.mode === 'versus') {
      this.controllers = [{ team: 0, activeIdx: 10, charge: 0, passCharge: 0 },
        { team: 1, activeIdx: 10, charge: 0, passCharge: 0 }];
      this.teams[1].isHuman = true;
    } else if (this.mode === 'coop') {
      this.controllers = [{ team: 0, activeIdx: 10, charge: 0, passCharge: 0 },
        { team: 0, activeIdx: 9, charge: 0, passCharge: 0 }];
    } else {
      this.controllers = [{ team: this.human, activeIdx: 10, charge: 0, passCharge: 0 }];
    }
    this.duration = opts.duration ?? 240;      // real seconds for the whole match
    this.skill = opts.skill ?? 1;              // CPU aggression multiplier
    /* How much the CPU has raised its game, 0-1. See `updateMomentum`. */
    this.momentum = 0;
    // Authentic unless asked otherwise, so a mode that has not thought about it
    // gets the football one rather than the esports one.
    this.preset = PRESETS[opts.preset] || PRESETS.authentic;
    this.ball = { x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null };
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
  aiSkillFor(team) {
    const me = this.soloHumanSide;
    if (me === null || team === me) return this.skill;
    return this.skill + 0.45 * this.momentum;
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
  isControlled(p) { return this.controllers.some((c) => this.playerOf(c) === p); }
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
        p.touchLock = p.stumble = p.holdT = p.slide = 0;
        p.celebrating = false;
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
      || takers.find((p) => p.role === 'MID') || takers[10];
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
    if (this.phase === 'end') return;

    if (this.phase !== 'play') {
      this.phaseT -= dt;
      if (this.phase === 'goal') this.updateCelebration(dt);
      if (this.phaseT <= 0) {
        if (this.phase === 'corner') { this.takeCorner(); return; }
        if (this.phase === 'penalty') { this.takePenalty(); return; }
        if (this.phase === 'goal') this.resetPositions(this.pendingKickoff ?? 0);
        if (this.phase === 'half') { this.half = 2; this.resetPositions(0); }
        this.startPlay();
      }
      return;
    }

    this.t += dt;
    this.updateMomentum(dt);

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
        .filter((q) => q !== carrier && q.role !== 'GK')
        .sort((a, z) => dist(a, carrier) - dist(z, carrier));
      this.supporters[carrier.team] = [mates[0], mates[1]];
    }

    // one input per seat; a single Input is still accepted for solo play
    const seats = Array.isArray(input) ? input : [input];
    this.controllers.forEach((c, i) => {
      const inp = seats[i] || seats[0];
      if (inp) this.handleSeat(c, dt, inp);
    });

    for (const team of this.teams) {
      for (const p of team.players) {
        p.touchLock = Math.max(0, p.touchLock - dt);
        p.stumble = Math.max(0, p.stumble - dt);
        p.slide = Math.max(0, p.slide - dt);
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
  }

  /**
   * Control follows the ball whenever your side has it — including a teammate
   * receiving your pass. Off the ball nothing moves on its own; you pick with L1/R1.
   */
  switchOnPossession() {
    const o = this.ball.owner;
    if (!o) return;
    const seats = this.controllers.filter((c) => c.team === o.team);
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
    // A keeper comes off for a keeper or the goal is left to a winger.
    if (p.role === 'GK' && incoming.position !== 'GK') return false;

    team.bench[benchIdx] = p.ref;      // the man coming off takes the seat
    p.ref = incoming;
    Object.assign(p, attributesOf(incoming));
    p.touchLock = 0; p.stumble = 0; p.slide = 0; p.diveT = 0;
    team.subsLeft -= 1;
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

  drive(p, dx, dy, dt, factor = 1) {
    if (p.slide > 0) return;
    const m = Math.hypot(dx, dy);
    const tired = 0.82 + p.stamina * 0.18;
    const speed = p.maxSpeed * factor * tired * (p.stumble > 0 ? 0.45 : 1);
    const tx = m > 0.001 ? (dx / m) * speed : 0;
    const ty = m > 0.001 ? (dy / m) * speed : 0;
    const k = Math.min(1, dt * 9);
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
          a.x -= (dx / d) * push; a.y -= (dy / d) * push;
          b.x += (dx / d) * push; b.y += (dy / d) * push;
        }
      }
    }
    this.protectKeeper();
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

    this.drive(p, aim.x, aim.y, dt, input.held('sprint') ? 1.24 : 1);

    if (input.pressed('switch')) this.cycleActive(c);

    const owns = this.ball.owner === p;

    if (owns) {
      /* Pass charges the same way a shot does: hold for a longer, harder ball,
       * tap for a short one. It fires on release rather than on press, which is
       * the only way a hold can mean anything — and it reads identically on a
       * keyboard, a thumb and a pad, because all three land on the same action.
       *
       * A tap still has to be instant to the player's eye, and it is: release
       * follows press by one frame, so the ball leaves on the next tick. */
      if (input.held('pass')) c.passCharge = Math.min(1, c.passCharge + dt / 0.7);
      if (input.released('pass')) {
        // A tap is one frame of hold, which on its own would be a 3-yard nudge.
        // The floor keeps a quick pass playing exactly as it always did; the
        // hold is what buys anything above it.
        this.pass(p, aim, false, Math.max(0.3, c.passCharge));
        c.passCharge = 0;
      }
      if (input.pressed('through')) this.pass(p, aim, true, 0.5);
      else if (input.pressed('cross')) this.cross(p, aim);
      if (input.held('shoot')) c.charge = Math.min(1, c.charge + dt / 0.85);
      if (input.released('shoot')) {
        // R1 held with the shot whips it up and bends it
        const curled = input.held('curl');
        this.shoot(p, aim, Math.max(0.28, c.charge), {
          loft: curled ? 1.35 : 1,
          curl: curled ? 34 : 0,
        });
        c.charge = 0;
      }
    } else {
      c.charge = 0;
      c.passCharge = 0;      // losing the ball mid-hold must not bank a pass
      if (input.pressed('pass') || input.pressed('through') || input.pressed('cross') || input.pressed('shoot')) {
        this.tackle(p);
      }
    }
    this.charge = this.controllers[0]?.charge || 0;
    this.passCharge = this.controllers[0]?.passCharge || 0;
  }

  /** L1 / R1 — jump to whoever is closest to the ball, skipping the other seat's man. */
  cycleActive(c = this.controllers[0]) {
    if (!c) return;
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
    const shape = SHAPES[name];
    if (!shape) return;
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
  pressingOf(teamIdx) { return PRESSING[this.teams[teamIdx].tactics.pressing] ?? 1; }

  /** Only ever called at a restart, so you never lose the controlled player mid-play. */
  selectForKickoff() {
    if (!this.kickoffTaker) return;
    const seat = this.controllers.find((c) => c.team === this.kickoffSide);
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
        // a keeper or a holder clearing his lines hits it long on purpose
        if (o.holdT > 1.1) { o.holdT = 0; this.pass(o, { x: this.teams[o.team].dir, y: 0 }, true, 0.8); }
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
        const push = (0.7 + speed * 0.18) * (1.3 - skill * 0.4);
        b.vx += o.dirX * push;
        b.vy += o.dirY * push;
        o.touchT = (0.3 + Math.random() * 0.16) * tight * (1.25 - skill * 0.33);
        this.cue('touch');
      }

      b.lastTouch = o;
      return;
    }

    // Magnus effect: sidespin pushes the ball perpendicular to its travel, so a
    // curled strike bends through the air and straightens as it slows.
    if (b.curl) {
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 1.5) {
        const k = (b.curl * sp) / 26;
        const vx0 = b.vx;
        const vy0 = b.vy;
        b.vx += (-vy0 / sp) * k * dt;
        b.vy += (vx0 / sp) * k * dt;
      }
      b.curl *= Math.pow(0.55, dt);
      if (b.z <= 0) b.curl = 0;
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.vz -= GRAV * dt;
    if (b.z <= 0) {
      b.z = 0;
      if (b.vz < -1.2) { b.vz = -b.vz * 0.42; b.vx *= 0.8; b.vy *= 0.8; }
      else b.vz = 0;
    }
    const damp = Math.pow(b.z > 0.4 ? 0.998 : 0.986, dt * 60);   // less drag through the air
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
          const r = p.role === 'GK' ? (p.diveT > 0 ? 2.6 : 1.68)
            : (p.slide > 0 ? 2.2 : (b.z > 0.8 ? 2.15 : 1.7));
          const d = dist(p, b);
          if (d < r && d < bestD) { bestD = d; best = p; }
        }
      }
    }

    if (best) {
      // a fast ball can't just be plucked out of the air — it needs a genuine block
      const speed = Math.hypot(b.vx, b.vy);
      const limit = best.role === 'GK' ? 70 : 15 + best.ref.stats.dribbling * 0.17;

      if (speed > limit) {
        if (bestD < 1.5) {
          if (b.shotBy && b.shotBy.team !== best.team) b.shotBy = null;   // blocked
          const a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * 1.1;
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
        if (b.z > 0.85 && best.role !== 'GK') {
          const t = this.teams[best.team];
          const goalX = t.dir > 0 ? PITCH.w : 0;
          if (Math.hypot(goalX - best.x, CY - best.y) < 19) {
            b.lastTouch = best;
            this.cue('header');
            this.shoot(best, null, 0.5, { loft: 0.2, placed: true });   // headers are steered down
            return;
          }
        }

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
    for (const gx of [0, PITCH.w]) {
      if (Math.abs(b.x - gx) > 1.4) continue;

      // uprights
      for (const py of [CY - GOAL_HALF, CY + GOAL_HALF]) {
        if (b.z > GOAL_HEIGHT + 0.1) continue;
        const dx = b.x - gx;
        const dy = b.y - py;
        const d = Math.hypot(dx, dy);
        if (d > R || d < 0.0001) continue;
        const nx = dx / d;
        const ny = dy / d;
        const vn = b.vx * nx + b.vy * ny;
        if (vn > 0) continue;                   // already moving away
        b.vx -= 2 * vn * nx;
        b.vy -= 2 * vn * ny;
        b.vx *= 0.62; b.vy *= 0.62;
        b.x = gx + nx * (R + 0.01);
        b.y = py + ny * (R + 0.01);
        b.curl = 0;
        b.shotBy = null;
        this.cue('post');
        return true;
      }

      // crossbar
      if (Math.abs(b.y - CY) < GOAL_HALF + 0.2
          && Math.abs(b.z - GOAL_HEIGHT) < 0.22 && b.vz > -40) {
        b.vz = -Math.abs(b.vz) * 0.55 - 1.2;
        b.vx *= 0.7; b.vy *= 0.7;
        b.z = GOAL_HEIGHT - 0.24;
        b.curl = 0;
        b.shotBy = null;
        this.cue('post');
        return true;
      }
    }
    return false;
  }

  bounds() {
    const b = this.ball;
    if (!b.inNet && this.hitFrame()) return;
    const attackerSide = b.lastTouch ? b.lastTouch.team : 0;

    if (b.y < 0.4 || b.y > PITCH.h - 0.4) {
      b.y = clamp(b.y, 0.8, PITCH.h - 0.8);
      this.giveTo(1 - attackerSide, b.x, b.y);
      return;
    }
    if (b.x < 0.4 || b.x > PITCH.w - 0.4) {
      const leftGoal = b.x < 0.4;
      if (Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT) {
        this.scoreGoal(leftGoal ? 1 : 0, leftGoal ? -1 : 1, leftGoal ? 0 : PITCH.w);
        return;
      }
      const defending = leftGoal ? 0 : 1;

      // last touch by the defending side (a parry, a block, a deflection)
      // sends it behind for a corner rather than a goal kick
      if (b.lastTouch && b.lastTouch.team === defending) {
        this.startCorner(1 - defending, b.y < CY ? 0 : PITCH.h, leftGoal ? 0 : PITCH.w);
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
    }
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
    const taker = atk.players
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
    this.cornerTaker = taker;
    this.phase = 'corner';
    this.phaseT = 1.5;
    this.banner = 'CORNER';
    this.corners = (this.corners || 0) + 1;
    this.teams[attacking].cornerCount = (this.teams[attacking].cornerCount || 0) + 1;
  }

  /** Whip the corner into the six-yard area and let the crowd of bodies attack it. */
  takeCorner() {
    const taker = this.cornerTaker;
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
    const team = this.teams[side];
    team.score++;
    if (this.ball.shotBy && this.ball.shotBy.team === side) team.onTarget++;
    this.ball.shotBy = null;
    const scorer = this.ball.lastTouch && this.ball.lastTouch.team === side ? this.ball.lastTouch : null;
    if (scorer) team.scorers.push({ name: scorer.ref.name, minute: this.minute() });
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
    b.curl = 0;
    b.shotId = (b.shotId || 0) + 1;
    b.vx = vx; b.vy = vy; b.vz = vz;
    b.x = p.x + p.dirX * 1.3;
    b.y = p.y + p.dirY * 1.3;
    b.z = vz > 0 ? 0.35 : b.z;
    p.touchLock = 0.3;
  }

  /**
   * Lofted ball forward. Inside crossing range it hangs one up in the box for a
   * header; from deeper it becomes a long diagonal to the furthest teammate in
   * range rather than a rocket at the opponent's area from your own half.
   */
  cross(p, aim) {
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
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

    const dx = tx - p.x;
    const dy = ty - p.y;
    const D = Math.hypot(dx, dy) || 1;
    // ~20 m/s delivery: firm enough to reach the box, far off the old 35 m/s rocket,
    // and flat enough that it does not balloon into the clouds
    const T = clamp(D / 20, 0.6, 1.9);
    this.cue('cross');
    this.release(p, dx / T, dy / T, 0.5 * GRAV * T);
    this.ball.noTouch = 0.26;
  }

  /**
   * @param {number} power 0-1. Reaches further and arrives harder, and is a
   *   little less accurate at the top end — a 50-yard ball should not be a
   *   certainty.
   */
  pass(p, aim, through, power = 0.35) {
    const team = this.teams[p.team];
    const reach = 14 + power * 44;
    let ax = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.x : p.dirX;
    let ay = aim && Math.hypot(aim.x, aim.y) > 0.2 ? aim.y : p.dirY;
    const am = Math.hypot(ax, ay) || 1;
    ax /= am; ay /= am;

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
      const forward = ((t.x - p.x) * team.dir) / 40;
      const score = align * 2.6 - d / 45 + forward * (through ? 1.2 : 0.5) + (t.role === 'GK' ? -2.5 : 0);
      if (score > bestScore) { bestScore = score; best = t; }
    }

    this.cue('pass');
    // nobody in range: hit it where you were aiming, as hard as you were holding
    if (!best) {
      const punt = (16 + power * 22) * this.preset.passSpeed;
      this.release(p, ax * punt, ay * punt);
      return;
    }

    let tx = best.x;
    let ty = best.y;
    if (through) { tx += team.dir * 9; ty += best.vy * 0.4; }
    let dx = tx - p.x;
    let dy = ty - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const err = ((100 - p.ref.stats.passing) / 100) * (0.13 + power * 0.1)
      * (this.weakFoot(p) ? 1.55 : 1)
      * (Math.random() - 0.5) * 2;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;
    const speed = clamp((d * 1.35 + 9) * (0.8 + power * 0.6) * this.preset.passSpeed, 14, 48);
    this.release(p, nx * speed, ny * speed);
  }

  /**
   * @param {object} opts
   *   loft  multiplier on how much the strike lifts (0 = drilled along the floor)
   *   curl  bend the flight sideways; sign picked from aim, or inward towards goal
   *   placed  a header or a set piece — no weak-foot penalty, because the ball
   *           is not at anyone's feet when it is struck
   */
  shoot(p, aim, power, opts = {}) {
    const { loft = 1, curl = 0, placed = false } = opts;
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const dx = goalX - p.x;
    const dy = CY + (aim && Math.abs(aim.y) > 0.2 ? aim.y * GOAL_HALF * 0.9 : 0) - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const acc = p.ref.stats.shooting / 100;
    // accuracy falls off with distance and with a rushed (low power) strike
    const weak = !placed && this.weakFoot(p);
    const spread = ((1.05 - acc) * 0.3 + d / 230 + (1 - power) * 0.06) * (weak ? 1.5 : 1);
    const err = (Math.random() - 0.5) * 2 * spread;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;

    this.cue('shot', power);
    const speed = (21 + power * 17 + acc * 6) * (weak ? 0.93 : 1);
    // Longer hold = harder and higher. Overcook it close in and it clears the bar.
    const rise = (0.9 + power * 6.4) * loft + (curl ? 2.4 : 0);

    this.release(p, nx * speed, ny * speed, rise);

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
  tackle(p) {
    const b = this.ball;
    const owner = b.owner;
    const REACH = 3.1;

    p.slide = 0.42;
    p.vx = p.dirX * p.maxSpeed * 1.7;
    p.vy = p.dirY * p.maxSpeed * 1.7;

    if (!owner || owner.team === p.team) return;
    // A keeper with the ball in their hands cannot be challenged — walking in
    // and robbing them at a goal kick was a free goal.
    if (owner.role === 'GK') { p.stumble = 0.35; return; }
    const d = dist(p, owner);
    if (d > REACH) return;
    const frac = d / REACH;               // 0 = point-blank, 1 = the edge of the lunge

    const win = (p.ref.stats.defending + 16) /
      (p.ref.stats.defending + owner.ref.stats.dribbling + 16) * this.preset.tackle;
    if (Math.random() < win) {
      b.owner = p;
      b.lastTouch = p;
      owner.touchLock = 0.55;
      owner.stumble = 0.35;
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
      const chance = 0.21 * frac * frac;
      if (this.inPenaltyArea(owner, p.team) && Math.random() < chance) {
        this.awardPenalty(1 - p.team, p);
      }
    }
  }

  /** Is `pt` inside the box that `defending` is protecting? */
  inPenaltyArea(pt, defending) {
    const goalX = this.teams[defending].dir > 0 ? 0 : PITCH.w;
    return Math.abs(pt.x - goalX) < BOX_W && Math.abs(pt.y - CY) < BOX_HALF;
  }

  /**
   * Set a penalty. Everyone but the taker and the keeper leaves the box, the
   * ball goes on the spot, and the taker is the best finisher on the pitch —
   * which is what a manager would do and saves inventing a taker order.
   */
  awardPenalty(attacking, conceded) {
    const atk = this.teams[attacking];
    const goalX = atk.dir > 0 ? PITCH.w : 0;
    const spotX = goalX + (atk.dir > 0 ? -11 : 11);

    const b = this.ball;
    Object.assign(b, {
      x: spotX, y: CY, z: 0, vx: 0, vy: 0, vz: 0,
      owner: null, lastTouch: null, inNet: null, curl: 0, shotBy: null,
    });

    const taker = atk.players
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
    this.phaseT = 1.6;
    this.banner = 'PENALTY';
    this.cue('whistle', 1);
    this.penalties = (this.penalties || 0) + 1;
  }

  /** Strike the penalty once the phase timer runs out. */
  takePenalty() {
    const p = this.penaltyTaker;
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
    const shift = push * 13 * (weHave ? 1.3 : 0.85) * this.mentalityOf(p.team);
    let x = clamp(p.sx * PITCH.w + team.dir * shift, 3, PITCH.w - 3);
    if (p.role === 'DEF') x = this.holdLine(team, x);
    return {
      x,
      // shift harder towards the ball's side so the block visibly slides across
      y: clamp(p.sy * PITCH.h + (b.y - CY) * 0.42, 3, PITCH.h - 3),
    };
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
    if (!weHave && (isChaser || (!b.owner && dist(p, b) < 14 * press))) {
      this.moveTo(p, b.x + b.vx * 0.25, b.y + b.vy * 0.25, dt, 1.06);
      if (b.owner && b.owner.team !== p.team && dist(p, b.owner) < 2.4) {
        if (Math.random() < 1.1 * this.aiSkillFor(p.team) * press * dt) this.tackle(p);
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

  /** Defenders never collapse onto their own keeper — hold a line off the goal. */
  holdLine(team, x) {
    const gx = team.dir > 0 ? 0 : PITCH.w;
    const MIN = 7.5 * this.preset.discipline;
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

    if (toGoal < 24 && (pressure > 2.4 || toGoal < 13)) {
      if (Math.random() < (1.7 - toGoal / 26) * this.aiSkillFor(p.team) * dt) {
        // CPU keeps most efforts down, but bends the odd one from range
        const far = toGoal > 17;
        this.shoot(p, null, 0.55 + Math.random() * 0.45, {
          loft: 0.32 + Math.random() * 0.3,
          curl: far && Math.random() < 0.3 ? 26 : 0,
        });
        return;
      }
    }
    // wide and deep? whip it into the box instead
    const wide = p.y < 20 || p.y > PITCH.h - 20;
    if (wide && Math.abs(goalX - p.x) < 32 && Math.random() < 2.2 * this.aiSkillFor(p.team) * dt) {
      const inBox = team.players.some((t) => t !== p && t.role !== 'GK' && Math.abs(t.x - goalX) < 22);
      if (inBox) { this.cross(p, null); return; }
    }

    if (pressure < 3.6 && Math.random() < 2.6 * dt) {
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
    let ty = wide && Math.abs(goalX - p.x) < 45
      ? clamp(p.y, 7, PITCH.h - 7)
      : CY + (p.y - CY) * 0.55;
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
        p.readErr = (Math.random() - 0.5) * 2 * (1.34 - p.ref.overall / 100) * 6.0;
        p.reactT = 0.07 + (1.05 - p.ref.overall / 100) * 0.18;  // beatable at pace
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
        if (p.diveT <= 0 && t < 0.62 && Math.abs(gap) > 0.85 && Math.abs(gap) < 4.4) {
          p.diveT = 0.75;
          p.diveDir = Math.sign(gap);
          p.diveHigh = (b.z + b.vz * t) > 1.15;
          p.vy = p.diveDir * (9.5 + p.ref.stats.defending * 0.035);
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
    tx = team.dir > 0 ? clamp(tx, 1, BOX_W - 2) : clamp(tx, PITCH.w - BOX_W + 2, PITCH.w - 1);
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

    if (speed < holdable && gk.diveT <= 0 && Math.random() < 0.55 + hands * 0.35) {
      this.cue('save');
      return true;                                    // clean catch
    }
    this.cue('save');

    // Parry. Most are pushed back into play, but a good save on a shot heading
    // for the corner is tipped round the post — behind the line, so it becomes
    // a corner rather than a rebound.
    const side = Math.sign(b.y - CY) || (Math.random() < 0.5 ? -1 : 1);
    const out = speed * (0.34 + Math.random() * 0.2);
    const tipRound = Math.random() < 0.45;

    if (tipRound) {
      b.vx = -inward * (2 + Math.random() * 4);     // carry it behind the goal line
      b.vy = side * out * 1.1;
      b.vz = 2 + Math.random() * 3;
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
    b.noTouch = 0.18;
    gk.touchLock = 0.35;
    this.parries = (this.parries || 0) + 1;
    return false;
  }
}

export const BOX = { w: BOX_W, half: BOX_HALF };
