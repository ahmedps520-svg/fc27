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

const GRAV = 16;                   // arcade gravity, m/s^2
export const GOAL_HEIGHT = 2.44;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

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

function makeTeam(clubId, side, isHuman) {
  const club = getClub(clubId);
  const xi = pickXI(clubId);
  const dir = side === 0 ? 1 : -1;

  const players = xi.map((ref, i) => {
    const s = SHAPE[i];
    const sx = side === 0 ? s.x : 1 - s.x;
    const sy = side === 0 ? s.y : 1 - s.y;
    return {
      ref, num: i + 1, team: side, role: s.role, sx, sy,
      x: sx * PITCH.w, y: sy * PITCH.h, vx: 0, vy: 0,
      dirX: dir, dirY: 0,
      maxSpeed: 5.4 + (ref.stats.pace / 100) * 3.8,
      touchLock: 0, stumble: 0, holdT: 0, slide: 0, diveT: 0, diveDir: 0,
    };
  });

  return {
    clubId, club, name: club.name, short: club.short,
    colors: club.crest.colors, dir, side, isHuman,
    players, score: 0, shots: 0, onTarget: 0, poss: 0, scorers: [],
    formation: '4-4-2',
    tactics: { mentality: 'balanced', pressing: 'normal' },
  };
}

export class Match {
  constructor(homeId, awayId, opts = {}) {
    // mode: 'single' | 'versus' | 'coop'. human === null runs both sides on AI.
    this.mode = opts.mode || 'single';
    this.human = opts.human === null ? null : (opts.human ?? 0);
    this.teams = [makeTeam(homeId, 0, this.human === 0), makeTeam(awayId, 1, this.human === 1)];

    // One seat per person at the couch. Each keeps its own selected player and
    // its own shot charge, so two people never fight over the same footballer.
    if (this.human === null) this.controllers = [];
    else if (this.mode === 'versus') {
      this.controllers = [{ team: 0, activeIdx: 10, charge: 0 }, { team: 1, activeIdx: 10, charge: 0 }];
      this.teams[1].isHuman = true;
    } else if (this.mode === 'coop') {
      this.controllers = [{ team: 0, activeIdx: 10, charge: 0 }, { team: 0, activeIdx: 9, charge: 0 }];
    } else {
      this.controllers = [{ team: this.human, activeIdx: 10, charge: 0 }];
    }
    this.duration = opts.duration ?? 240;      // real seconds for the whole match
    this.skill = opts.skill ?? 1;              // CPU aggression multiplier
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
    this.kickoffSide = 1;
    this.resetPositions(0);
  }

  /* ------------------------------ state ------------------------------ */
  get humanTeam() { return this.human === null ? null : this.teams[this.human]; }
  /** Player held by seat 0 — kept for anything that only knows about one human. */
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
      x: PITCH.w / 2, y: CY, z: 0, vx: 0, vy: 0, vz: 0, owner: null, lastTouch: null,
    });
    this.kickoffTaker = taker;
  }

  startPlay() {
    if (this.phase === 'goal' || this.phase === 'kickoff') {
      this.ball.owner = this.kickoffTaker;
      this.kickoffTaker.touchLock = 0;
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
        if (this.phase === 'goal') this.resetPositions(this.pendingKickoff ?? 0);
        if (this.phase === 'half') { this.half = 2; this.resetPositions(0); }
        this.startPlay();
      }
      return;
    }

    this.t += dt;

    if (this.half === 1 && this.t >= this.duration / 2) {
      this.phase = 'half'; this.phaseT = 1.8; this.banner = 'HALF TIME';
      return;
    }
    if (this.t >= this.duration) {
      this.phase = 'end'; this.banner = 'FULL TIME';
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

    for (const team of this.teams) for (const p of team.players) this.integrate(p, dt);
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

  /* ----------------------------- movement ---------------------------- */
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
    const speed = p.maxSpeed * factor * (p.stumble > 0 ? 0.45 : 1);
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
      if (input.pressed('pass')) this.pass(p, aim, false);
      else if (input.pressed('through')) this.pass(p, aim, true);
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
      if (input.pressed('pass') || input.pressed('through') || input.pressed('cross')) this.tackle(p, false);
      if (input.pressed('shoot')) this.tackle(p, true);
    }
    this.charge = this.controllers[0]?.charge || 0;
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
        if (o.holdT > 1.1) { o.holdT = 0; this.pass(o, { x: this.teams[o.team].dir, y: 0 }, true); }
        return;
      }
      const lead = 1.35;
      b.x = o.x + o.dirX * lead;
      b.y = o.y + o.dirY * lead;
      b.vx = o.vx; b.vy = o.vy;
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
            this.shoot(best, null, 0.5, { loft: 0.2 });   // headers are steered down
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

  bounds() {
    const b = this.ball;
    const attackerSide = b.lastTouch ? b.lastTouch.team : 0;

    if (b.y < 0.4 || b.y > PITCH.h - 0.4) {
      b.y = clamp(b.y, 0.8, PITCH.h - 0.8);
      this.giveTo(1 - attackerSide, b.x, b.y);
      return;
    }
    if (b.x < 0.4 || b.x > PITCH.w - 0.4) {
      const leftGoal = b.x < 0.4;
      if (Math.abs(b.y - CY) < GOAL_HALF && b.z < GOAL_HEIGHT) {
        this.scoreGoal(leftGoal ? 1 : 0);
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

    // attackers crowd the six-yard area, defenders mark just goal-side of them
    let i = 0;
    for (const p of atk.players) {
      if (p === taker) continue;
      p.vx = p.vy = 0;
      if (p.role === 'GK') continue;
      p.x = goalX + inw * (6 + (i % 3) * 3.5);
      p.y = CY + ((i % 5) - 2) * 3.4;
      i++;
    }
    let j = 0;
    for (const p of def.players) {
      p.vx = p.vy = 0;
      if (p.role === 'GK') { p.x = goalX + inw * 1.6; p.y = CY; continue; }
      p.x = goalX + inw * (4.5 + (j % 3) * 3.5);
      p.y = CY + ((j % 5) - 2) * 3.4 + 1.4;
      j++;
    }

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

  scoreGoal(side) {
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
    b.vx = b.vy = b.vz = 0;                    // ball settles in the net
    b.owner = null;
    for (const p of team.players) p.celebrating = true;
  }

  /**
   * Runs while phase === 'goal'. The scorer sprints off, team-mates chase them
   * down, the conceding side trudges back into shape.
   */
  updateCelebration(dt) {
    this.celebT += dt;
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
    this.release(p, dx / T, dy / T, 0.5 * GRAV * T);
    this.ball.noTouch = 0.26;
  }

  pass(p, aim, through) {
    const team = this.teams[p.team];
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
      if (d < 3 || d > 48) continue;
      const align = (dx / d) * ax + (dy / d) * ay;
      const forward = ((t.x - p.x) * team.dir) / 40;
      const score = align * 2.6 - d / 45 + forward * (through ? 1.2 : 0.5) + (t.role === 'GK' ? -2.5 : 0);
      if (score > bestScore) { bestScore = score; best = t; }
    }

    if (!best) { this.release(p, ax * 22, ay * 22); return; }

    let tx = best.x;
    let ty = best.y;
    if (through) { tx += team.dir * 9; ty += best.vy * 0.4; }
    let dx = tx - p.x;
    let dy = ty - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const err = ((100 - p.ref.stats.passing) / 100) * 0.16 * (Math.random() - 0.5) * 2;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;
    const speed = clamp(d * 1.35 + 9, 15, 36);
    this.release(p, nx * speed, ny * speed);
  }

  /**
   * @param {object} opts
   *   loft  multiplier on how much the strike lifts (0 = drilled along the floor)
   *   curl  bend the flight sideways; sign picked from aim, or inward towards goal
   */
  shoot(p, aim, power, opts = {}) {
    const { loft = 1, curl = 0 } = opts;
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const dx = goalX - p.x;
    const dy = CY + (aim && Math.abs(aim.y) > 0.2 ? aim.y * GOAL_HALF * 0.9 : 0) - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const acc = p.ref.stats.shooting / 100;
    // accuracy falls off with distance and with a rushed (low power) strike
    const spread = (1.05 - acc) * 0.3 + d / 230 + (1 - power) * 0.06;
    const err = (Math.random() - 0.5) * 2 * spread;
    const c = Math.cos(err);
    const s = Math.sin(err);
    const nx = (dx * c - dy * s) / d;
    const ny = (dx * s + dy * c) / d;

    const speed = 21 + power * 17 + acc * 6;
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

  tackle(p, sliding) {
    const b = this.ball;
    const owner = b.owner;

    if (sliding) {
      p.slide = 0.42;
      p.vx = p.dirX * p.maxSpeed * 1.7;
      p.vy = p.dirY * p.maxSpeed * 1.7;
    }
    if (!owner || owner.team === p.team) return;
    const d = dist(p, owner);
    if (d > (sliding ? 3.4 : 2.6)) { if (!sliding) p.stumble = 0.25; return; }

    const win = (p.ref.stats.defending + (sliding ? 16 : 0)) /
      (p.ref.stats.defending + owner.ref.stats.dribbling + 16);
    if (Math.random() < win) {
      b.owner = p;
      b.lastTouch = p;
      owner.touchLock = 0.55;
      owner.stumble = 0.35;
    } else {
      p.stumble = sliding ? 1.15 : 0.5;
    }
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
    return {
      x: clamp(p.sx * PITCH.w + team.dir * shift, 3, PITCH.w - 3),
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
        if (Math.random() < 1.1 * this.skill * press * dt) this.tackle(p, false);
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

    this.moveTo(p, clamp(target.x + jitterX, 3, PITCH.w - 3),
      clamp(target.y + jitterY, 3, PITCH.h - 3), dt, weHave ? 0.85 : 0.92);
  }

  thinkOnBall(p, dt) {
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const toGoal = Math.hypot(goalX - p.x, CY - p.y);
    const foe = this.nearestTo(1 - p.team, p);
    const pressure = foe ? dist(p, foe) : 99;

    if (toGoal < 24 && (pressure > 2.4 || toGoal < 13)) {
      if (Math.random() < (1.7 - toGoal / 26) * this.skill * dt) {
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
    if (wide && Math.abs(goalX - p.x) < 32 && Math.random() < 2.2 * this.skill * dt) {
      const inBox = team.players.some((t) => t !== p && t.role !== 'GK' && Math.abs(t.x - goalX) < 22);
      if (inBox) { this.cross(p, null); return; }
    }

    if (pressure < 3.6 && Math.random() < 2.6 * dt) {
      this.pass(p, { x: team.dir, y: (Math.random() - 0.5) * 0.6 }, toGoal > 45);
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
   * Keeper contact. A tame shot is gathered; anything struck with real pace is
   * parried away — often wide, which is what turns into a corner.
   * @returns {boolean} true if the keeper kept hold of it
   */
  keeperContact(gk, speed) {
    const b = this.ball;
    const team = this.teams[gk.team];
    const inward = team.dir > 0 ? 1 : -1;
    const hands = gk.ref.overall / 100;
    const holdable = 17 + hands * 13;                 // ~26-30 m/s for a good keeper

    if (speed < holdable && gk.diveT <= 0 && Math.random() < 0.55 + hands * 0.35) {
      return true;                                    // clean catch
    }

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
      const wide = Math.random() < 0.62;
      b.vx = inward * out * (wide ? 0.45 : 0.9);
      b.vy = side * out * (wide ? 1.05 : 0.5);
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
