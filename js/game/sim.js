import { rosterOf, getClub } from '../data/generator.js';

/* ------------------------------------------------------------------ *
 * Real-time arcade match. Units are metres; the pitch is 105 x 68.
 * ------------------------------------------------------------------ */
export const PITCH = { w: 105, h: 68 };
export const GOAL_HALF = 5.5;      // goal spans centre +/- 5.5m
const CY = PITCH.h / 2;
const BOX_W = 16.5;
const BOX_HALF = 20;

// 4-4-2 shape in normalised coords: x = 0 own goal line, 1 = opponent goal line.
const SHAPE = [
  { x: .045, y: .50, role: 'GK' },
  { x: .20, y: .16, role: 'DEF' }, { x: .16, y: .38, role: 'DEF' },
  { x: .16, y: .62, role: 'DEF' }, { x: .20, y: .84, role: 'DEF' },
  { x: .44, y: .13, role: 'MID' }, { x: .38, y: .40, role: 'MID' },
  { x: .38, y: .60, role: 'MID' }, { x: .44, y: .87, role: 'MID' },
  { x: .66, y: .36, role: 'FWD' }, { x: .66, y: .64, role: 'FWD' },
];

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
      touchLock: 0, stumble: 0, holdT: 0, slide: 0,
    };
  });

  return {
    clubId, club, name: club.name, short: club.short,
    colors: club.crest.colors, dir, side, isHuman,
    players, score: 0, shots: 0, onTarget: 0, poss: 0, scorers: [],
  };
}

export class Match {
  constructor(homeId, awayId, opts = {}) {
    // human === null runs both sides on AI (used for balance testing)
    this.human = opts.human === null ? null : (opts.human ?? 0);
    this.teams = [makeTeam(homeId, 0, this.human === 0), makeTeam(awayId, 1, this.human === 1)];
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
  get active() { return this.human === null ? null : this.humanTeam.players[this.activeIdx]; }
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
      }
      // pull the shape back into its own half for the restart
      const half = team.dir > 0;
      for (const p of team.players) {
        if (half && p.x > PITCH.w / 2 - 2) p.x = PITCH.w / 2 - 2 - (p.role === 'FWD' ? 3 : 8);
        if (!half && p.x < PITCH.w / 2 + 2) p.x = PITCH.w / 2 + 2 + (p.role === 'FWD' ? 3 : 8);
      }
    }
    const taker = this.teams[kickoffSide].players.find((p) => p.role === 'FWD');
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
      if (this.phaseT <= 0) {
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

    this.chasers = [this.nearestTo(0, this.ball, true), this.nearestTo(1, this.ball, true)];

    if (this.human !== null) this.handleHuman(dt, input);

    const active = this.active;
    for (const team of this.teams) {
      for (const p of team.players) {
        p.touchLock = Math.max(0, p.touchLock - dt);
        p.stumble = Math.max(0, p.stumble - dt);
        p.slide = Math.max(0, p.slide - dt);
        if (p === active && team.isHuman) continue;
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
    if (this.human === null) return;
    const o = this.ball.owner;
    if (!o || o.team !== this.human) return;
    const i = this.humanTeam.players.indexOf(o);
    if (i >= 0) this.activeIdx = i;
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
  handleHuman(dt, input) {
    const team = this.humanTeam;
    const p = this.active;
    // Sticks, keys and the touch nub all report screen space, where up is
    // negative. On screen, up the frame is *away* from the camera — which is
    // +y in the world — so the vertical axis has to be flipped once here.
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

    if (input.pressed('switch')) this.cycleActive();

    const owns = this.ball.owner === p;

    if (owns) {
      if (input.pressed('pass')) this.pass(p, aim, false);
      else if (input.pressed('through')) this.pass(p, aim, true);
      else if (input.pressed('cross')) this.cross(p, aim);
      if (input.held('shoot')) this.charge = Math.min(1, this.charge + dt / 0.75);
      if (input.released('shoot')) { this.shoot(p, aim, Math.max(0.28, this.charge)); this.charge = 0; }
    } else {
      this.charge = 0;
      if (input.pressed('pass') || input.pressed('through') || input.pressed('cross')) this.tackle(p, false);
      if (input.pressed('shoot')) this.tackle(p, true);
    }
  }

  cycleActive() {
    const team = this.humanTeam;
    const ranked = team.players
      .map((p, i) => ({ i, p, d: dist(p, this.ball) }))
      .filter((o) => o.p.role !== 'GK')
      .sort((a, b) => a.d - b.d);
    const at = ranked.findIndex((o) => o.i === this.activeIdx);
    this.activeIdx = ranked[(at + 1) % ranked.length].i;
  }

  /** Only ever called at a restart, so you never lose the controlled player mid-play. */
  selectForKickoff() {
    if (this.human === null || this.kickoffSide !== this.human || !this.kickoffTaker) return;
    const i = this.humanTeam.players.indexOf(this.kickoffTaker);
    if (i >= 0) this.activeIdx = i;
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
    if (b.z < 2.2) {
      for (const team of this.teams) {
        for (const p of team.players) {
          if (p.touchLock > 0) continue;
          const r = p.role === 'GK' ? 1.9 : (p.slide > 0 ? 2.2 : 1.7);
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
      } else {
        // a keeper gathering an opponent's shot is a save
        if (b.shotBy && best.role === 'GK' && best.team !== b.shotBy.team) {
          this.teams[b.shotBy.team].onTarget++;
        }
        b.shotBy = null;

        // meeting a cross above waist height in the box is a header at goal
        if (b.z > 1.05 && best.role !== 'GK') {
          const t = this.teams[best.team];
          const goalX = t.dir > 0 ? PITCH.w : 0;
          if (Math.hypot(goalX - best.x, CY - best.y) < 19) {
            b.lastTouch = best;
            this.shoot(best, null, 0.5);
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
      const gk = this.teams[defending].players[0];
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
    this.phaseT = 1.9;
    this.resetPositions(1 - side);
  }

  /* ------------------------------ actions ---------------------------- */
  release(p, vx, vy, vz = 0) {
    const b = this.ball;
    b.owner = null;
    b.lastTouch = p;
    b.shotBy = null;
    b.noTouch = 0.13;
    b.shotId = (b.shotId || 0) + 1;
    b.vx = vx; b.vy = vy; b.vz = vz;
    b.x = p.x + p.dirX * 1.3;
    b.y = p.y + p.dirY * 1.3;
    b.z = vz > 0 ? 0.35 : b.z;
    p.touchLock = 0.3;
  }

  /** Lofted ball into the box — the payoff is a header on the end of it. */
  cross(p, aim) {
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const aimY = aim && Math.abs(aim.y) > 0.2 ? CY + aim.y * 9 : (p.y > CY ? CY - 5 : CY + 5);

    let best = null;
    let bestD = Infinity;
    for (const t of team.players) {
      if (t === p || t.role === 'GK') continue;
      if (Math.abs(t.x - goalX) > 24) continue;
      const d = Math.hypot(t.x - (goalX - team.dir * 9), t.y - aimY);
      if (d < bestD) { bestD = d; best = t; }
    }

    const tx = best ? best.x + team.dir * 2.5 : goalX - team.dir * 9;
    const ty = best ? best.y : aimY;
    const dx = tx - p.x;
    const dy = ty - p.y;
    const D = Math.hypot(dx, dy) || 1;
    const T = clamp(D / 19, 0.62, 1.7);
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

  shoot(p, aim, power) {
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
    const speed = 22 + power * 14 + acc * 6;
    this.release(p, nx * speed, ny * speed);
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

  shapeTarget(p) {
    const team = this.teams[p.team];
    const b = this.ball;
    const weHave = b.owner && b.owner.team === p.team;
    const push = ((b.x - PITCH.w / 2) / (PITCH.w / 2)) * team.dir;
    const shift = push * 13 * (weHave ? 1.3 : 0.85);
    return {
      x: clamp(p.sx * PITCH.w + team.dir * shift, 3, PITCH.w - 3),
      y: clamp(p.sy * PITCH.h + (b.y - CY) * 0.24, 3, PITCH.h - 3),
    };
  }

  think(p, dt) {
    if (p.role === 'GK') return this.thinkGK(p, dt);

    const b = this.ball;
    const team = this.teams[p.team];
    if (b.owner === p) return this.thinkOnBall(p, dt);

    const weHave = b.owner && b.owner.team === p.team;
    const isChaser = this.chasers[p.team] === p;
    const target = this.shapeTarget(p);

    if (!weHave && (isChaser || (!b.owner && dist(p, b) < 14))) {
      this.moveTo(p, b.x + b.vx * 0.25, b.y + b.vy * 0.25, dt, 1.06);
      if (b.owner && b.owner.team !== p.team && dist(p, b.owner) < 2.4) {
        if (Math.random() < 1.1 * this.skill * dt) this.tackle(p, false);
      }
      return;
    }

    if (weHave && p.role === 'FWD') {
      this.moveTo(p, clamp(target.x + team.dir * 8, 4, PITCH.w - 4), target.y, dt, 0.95);
      return;
    }
    this.moveTo(p, target.x, target.y, dt, weHave ? 0.85 : 0.92);
  }

  thinkOnBall(p, dt) {
    const team = this.teams[p.team];
    const goalX = team.dir > 0 ? PITCH.w : 0;
    const toGoal = Math.hypot(goalX - p.x, CY - p.y);
    const foe = this.nearestTo(1 - p.team, p);
    const pressure = foe ? dist(p, foe) : 99;

    if (toGoal < 24 && (pressure > 2.4 || toGoal < 13)) {
      if (Math.random() < (1.7 - toGoal / 26) * this.skill * dt) {
        this.shoot(p, null, 0.55 + Math.random() * 0.45);
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
    let urgency = 1.15;

    if (!b.owner && closing && d < 30) {
      // read the shot: intercept where it will cross the keeper's line.
      // The read is judged once per shot and carries an error scaled to the keeper's quality.
      if (p.readId !== b.shotId) {
        p.readId = b.shotId;
        p.readErr = (Math.random() - 0.5) * 2 * (1.34 - p.ref.overall / 100) * 4.2;
      }
      const t = (tx - b.x) / b.vx;
      if (t > 0 && t < 2.2) {
        ty = b.y + b.vy * t + p.readErr;
        urgency = 1.28;
      }
    } else if (d < 13 && b.owner && b.owner.team !== p.team) {
      tx = goalX + inward * clamp(d * 0.45, 2, 7.5);   // narrow the angle on a one-on-one
      ty = b.y;
      urgency = 1.3;
    }

    ty = clamp(ty, CY - GOAL_HALF - 2.5, CY + GOAL_HALF + 2.5);
    tx = team.dir > 0 ? clamp(tx, 1, BOX_W - 2) : clamp(tx, PITCH.w - BOX_W + 2, PITCH.w - 1);
    this.moveTo(p, tx, ty, dt, urgency);
  }
}

export const BOX = { w: BOX_W, half: BOX_HALF };
