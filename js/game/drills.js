/**
 * Skill games (v82): four drills on a top-down training pitch, each a short
 * self-contained game with a score for the leaderboard.
 *
 *  - slalom     dribble through eight gates against the clock; a missed gate
 *               costs three seconds
 *  - freekicks  five free kicks at a goal with five targets; a wall in the way
 *  - crossing   six crosses from the byline into the zone that lights up
 *  - passing    sixty seconds of passing through the gate that lights up
 *
 * Controls come from the game's Input (keyboard, gamepad) and a touch pad
 * the screen draws: the stick moves (or aims), the action button strikes —
 * hold it longer for more power.
 *
 * Not the match sim: a drill has no opponents to run and wants exact,
 * repeatable targets, so the ball here is a small point-mass with friction.
 * The numbers (ball speeds, friction) are chosen to feel like the match.
 */
export const DRILLS = [
  { id: 'slalom', name: 'Dribbling slalom', blurb: 'Eight gates, a stopwatch, and your close control.', unit: 'pts' },
  { id: 'freekicks', name: 'Free-kick targets', blurb: 'Five kicks, five targets, one wall.', unit: 'pts' },
  { id: 'crossing', name: 'Crossing', blurb: 'Hit the lit zone from the byline. Six balls.', unit: 'pts' },
  { id: 'passing', name: 'Passing gates', blurb: 'Sixty seconds. Pass through the gate that lights up.', unit: 'pts' },
];

const FRICTION = 0.985;             // per 1/60 s on the ground
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Create a drill. `W`×`H` metres of pitch. Returns a state object the loop
 * steps with `step(dt, ctl)` where ctl = { ax, ay, strike (held), released,
 * power (0..1 at release) }, and `done` / `score` when it ends.
 */
export function createDrill(id, rnd = Math.random) {
  const d = { id, t: 0, score: 0, done: false, msgs: [], W: 60, H: 40, ball: { x: 0, y: 0, vx: 0, vy: 0, z: 0, vz: 0 }, me: { x: 0, y: 0, vx: 0, vy: 0, dir: 0 }, aim: { x: 1, y: 0 } };
  const say = (text) => { d.msgs.push({ text, t: d.t }); if (d.msgs.length > 3) d.msgs.shift(); };
  d.say = say;
  if (id === 'slalom') {
    d.W = 70; d.H = 30;
    d.me.x = 4; d.me.y = 15; d.ball.x = 5; d.ball.y = 15;
    d.gates = Array.from({ length: 8 }, (_, i) => ({ x: 12 + i * 6.6, y: 15 + (i % 2 ? 6 : -6), w: 3.4, passed: false, missed: false }));
    d.finish = 66; d.penalty = 0;
  } else if (id === 'freekicks') {
    d.W = 40; d.H = 36;
    d.goal = { x: 38, y: 18, half: 3.66, height: 2.44 };
    d.kick = 0; d.kicks = 5;
    d.targets = [{ y: -2.8, z: 2.0, r: 0.6, pts: 150 }, { y: 2.8, z: 2.0, r: 0.6, pts: 150 }, { y: -2.9, z: 0.5, r: 0.7, pts: 100 }, { y: 2.9, z: 0.5, r: 0.7, pts: 100 }, { y: 0, z: 1.9, r: 0.8, pts: 60 }];
    placeFK(d, rnd);
  } else if (id === 'crossing') {
    d.W = 40; d.H = 44;
    d.cross = 0; d.crosses = 6;
    d.zones = [{ x: 34.5, y: 18, r: 2.2, name: 'near post' }, { x: 29, y: 22, r: 2.4, name: 'penalty spot' }, { x: 33.5, y: 27.5, r: 2.2, name: 'far post' }, { x: 26, y: 18.5, r: 2.4, name: 'edge of the box' }];
    placeCross(d, rnd);
  } else if (id === 'passing') {
    d.W = 50; d.H = 36;
    d.me.x = 25; d.me.y = 18;
    d.gates = [{ x: 25, y: 4 }, { x: 44, y: 11 }, { x: 44, y: 25 }, { x: 25, y: 32 }, { x: 6, y: 25 }, { x: 6, y: 11 }].map((g) => ({ ...g, w: 3 }));
    d.lit = Math.floor(rnd() * d.gates.length); d.litT = 0; d.limit = 60; d.hits = 0; d.streak = 0;
    d.ball.x = d.me.x + 1; d.ball.y = d.me.y;
  }
  d.rnd = rnd;
  return d;
}
function placeFK(d, rnd) {
  const ang = (rnd() - 0.5) * 0.9; const dist = 20 + rnd() * 8;
  d.ball.x = d.goal.x - Math.cos(ang) * dist; d.ball.y = d.goal.y + Math.sin(ang) * dist; d.ball.z = 0; d.ball.vx = d.ball.vy = d.ball.vz = 0;
  const dx = d.goal.x - d.ball.x; const dy = d.goal.y - d.ball.y; const L = Math.hypot(dx, dy);
  d.wall = { x: d.ball.x + dx / L * 9.15, y: d.ball.y + dy / L * 9.15, nx: dx / L, ny: dy / L, half: 2.1, h: 1.9 };
  d.aim = { y: 0, z: 1 }; d.flying = false;
}
function placeCross(d, rnd) {
  d.ball.x = 36 + rnd() * 3; d.ball.y = rnd() < 0.5 ? 3 : 41; d.ball.z = 0; d.ball.vx = d.ball.vy = d.ball.vz = 0;
  d.litZone = Math.floor(rnd() * d.zones.length);
  d.aim = { x: 30, y: 22 }; d.flying = false;
}

/** One frame. */
export function step(d, dt, ctl) {
  if (d.done) return;
  d.t += dt;
  const b = d.ball; const me = d.me;
  if (d.id === 'slalom' || d.id === 'passing') {
    // run: acceleration toward the stick, a top speed, a turn that costs control
    const top = ctl.sprint ? 8.2 : 6.2;
    me.vx += (ctl.ax * top - me.vx) * Math.min(1, dt * 5);
    me.vy += (ctl.ay * top - me.vy) * Math.min(1, dt * 5);
    me.x = clamp(me.x + me.vx * dt, 0.5, d.W - 0.5); me.y = clamp(me.y + me.vy * dt, 0.5, d.H - 0.5);
    if (Math.hypot(me.vx, me.vy) > 0.3) me.dir = Math.atan2(me.vy, me.vx);
  }
  if (d.id === 'slalom') {
    // the ball is kept a stride ahead; a sprint pushes it further out
    const lead = Math.hypot(me.vx, me.vy) > 0.5 ? (ctl.sprint ? 1.25 : 0.8) : 0.5;
    const tx = me.x + Math.cos(me.dir) * lead; const ty = me.y + Math.sin(me.dir) * lead;
    b.x += (tx - b.x) * Math.min(1, dt * (ctl.sprint ? 6 : 10)); b.y += (ty - b.y) * Math.min(1, dt * (ctl.sprint ? 6 : 10));
    for (const g of d.gates) {
      if (g.passed || g.missed) continue;
      if (b.x >= g.x) {
        if (Math.abs(b.y - g.y) <= g.w / 2) { g.passed = true; d.say('Gate ✓'); } else { g.missed = true; d.penalty += 3; d.say('Missed a gate +3 s'); }
      }
    }
    if (b.x >= d.finish) {
      d.done = true;
      const time = d.t + d.penalty;
      d.score = Math.max(0, Math.round(1600 - time * 60));
      d.result = `${time.toFixed(2)} s (${d.penalty ? `+${d.penalty} s penalties` : 'clean'})`;
    }
    if (d.t > 60) { d.done = true; d.score = 0; d.result = 'Out of time'; }
    return;
  }
  if (d.id === 'freekicks') {
    if (!d.flying) {
      // aim on the goal face: left/right across it, up/down for height
      d.aim.y = clamp(d.aim.y + ctl.ax * dt * 4, -d.goal.half - 1, d.goal.half + 1);
      d.aim.z = clamp(d.aim.z - ctl.ay * dt * 2.5, 0.2, 3.2);
      if (ctl.released) {
        // flight time from power; aim decides where it crosses the goal line
        const power = clamp(ctl.power, 0.1, 1);
        const T = 1.25 - power * 0.6;                 // seconds to the goal line
        const err = (1 - power) * 0.35 + (power > 0.92 ? (power - 0.92) * 9 : 0);   // too hard skies it
        d.shot = { T, t: 0, sx: b.x, sy: b.y, ey: d.goal.y + d.aim.y + (d.rnd() - 0.5) * err, ez: d.aim.z + (power > 0.92 ? (power - 0.92) * 14 : 0) + (d.rnd() - 0.5) * err * 0.6, power };
        d.flying = true;
      }
      return;
    }
    const s = d.shot; s.t += dt;
    const f = Math.min(1, s.t / s.T);
    b.x = s.sx + (d.goal.x - s.sx) * f; b.y = s.sy + (s.ey - s.sy) * f;
    // an arc over the wall that comes down to the aimed height
    b.z = Math.sin(f * Math.PI) * (1.6 + (1 - s.power) * 2.2) * (1 - f * 0.6) + s.ez * f;
    // the wall: blocked if it is still low when it gets there
    const wd = (b.x - d.wall.x) * d.wall.nx + (b.y - d.wall.y) * d.wall.ny;
    if (!s.checkedWall && wd >= 0) {
      s.checkedWall = true;
      const lat = Math.abs((b.x - d.wall.x) * -d.wall.ny + (b.y - d.wall.y) * d.wall.nx);
      if (lat < d.wall.half && b.z < d.wall.h) { resultKick(d, 0, 'Blocked by the wall'); return; }
    }
    if (f >= 1) {
      const y = s.ey - d.goal.y; const z = s.ez;
      if (Math.abs(y) > d.goal.half || z > d.goal.height || z < 0) { resultKick(d, 0, 'Wide'); return; }
      let pts = 25; let hit = null;
      for (const tg of d.targets) if (Math.hypot(y - tg.y, z - tg.z) <= tg.r) { pts = tg.pts; hit = tg; break; }
      resultKick(d, pts, hit ? `Target! +${pts}` : 'On target +25');
    }
    return;
  }
  if (d.id === 'crossing') {
    if (!d.flying) {
      d.aim.x = clamp(d.aim.x + ctl.ax * dt * 12, 18, 39); d.aim.y = clamp(d.aim.y + ctl.ay * dt * 12, 6, 38);
      if (ctl.released) {
        const power = clamp(ctl.power, 0.1, 1);
        const want = Math.hypot(d.aim.x - b.x, d.aim.y - b.y);
        const reach = 12 + power * 30;                // how far this much power carries it
        const k = reach / Math.max(1, want);
        const err = 1.2 + Math.abs(1 - k) * 4;
        const ang = Math.atan2(d.aim.y - b.y, d.aim.x - b.x) + (d.rnd() - 0.5) * 0.08;
        d.shot = { T: 1.1, t: 0, sx: b.x, sy: b.y, ex: b.x + Math.cos(ang) * reach + (d.rnd() - 0.5) * err, ey: b.y + Math.sin(ang) * reach + (d.rnd() - 0.5) * err };
        d.flying = true;
      }
      return;
    }
    const s = d.shot; s.t += dt; const f = Math.min(1, s.t / s.T);
    b.x = s.sx + (s.ex - s.sx) * f; b.y = s.sy + (s.ey - s.sy) * f; b.z = Math.sin(f * Math.PI) * 4.5;
    if (f >= 1) {
      const z = d.zones[d.litZone];
      const off = Math.hypot(s.ex - z.x, s.ey - z.y);
      const pts = off <= z.r ? Math.round(150 - (off / z.r) * 50) : off <= z.r * 2 ? 30 : 0;
      d.score += pts; d.cross += 1;
      d.say(pts >= 100 ? `Perfect to the ${z.name} +${pts}` : pts ? `Close +${pts}` : 'Missed the zone');
      if (d.cross >= d.crosses) { d.done = true; d.result = `${d.score} points from ${d.crosses} crosses`; } else placeCross(d, d.rnd);
    }
    return;
  }
  if (d.id === 'passing') {
    d.litT += dt;
    const owned = Math.hypot(b.x - me.x, b.y - me.y) < 1.2 && Math.hypot(b.vx, b.vy) < 6;
    if (owned && !d.inPlay) { b.x = me.x + Math.cos(me.dir) * 0.8; b.y = me.y + Math.sin(me.dir) * 0.8; b.vx = b.vy = 0; }
    if (owned && ctl.released) {
      const power = clamp(ctl.power, 0.15, 1);
      const ax = ctl.ax || Math.cos(me.dir); const ay = ctl.ay || Math.sin(me.dir); const m = Math.hypot(ax, ay) || 1;
      b.vx = ax / m * (10 + power * 18); b.vy = ay / m * (10 + power * 18); d.inPlay = true;
    }
    if (d.inPlay) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      const fr = Math.pow(FRICTION, dt * 60); b.vx *= fr; b.vy *= fr;
      const g = d.gates[d.lit];
      if (Math.hypot(b.x - g.x, b.y - g.y) < g.w / 2 + 0.3) {
        d.hits += 1; d.streak += 1;
        const bonus = Math.max(0, Math.round(60 - d.litT * 12));
        d.score += 100 + bonus + (d.streak >= 3 ? 25 : 0);
        d.say(`Through! +${100 + bonus}${d.streak >= 3 ? ' streak' : ''}`);
        resetPass(d);
      } else if (b.x < 0 || b.x > d.W || b.y < 0 || b.y > d.H || Math.hypot(b.vx, b.vy) < 0.8) {
        d.streak = 0; d.say('Missed'); resetPass(d);
      }
    }
    if (d.t >= d.limit) { d.done = true; d.result = `${d.hits} gates in ${d.limit} s`; }
  }
}
function resetPass(d) {
  d.inPlay = false; d.ball.vx = d.ball.vy = 0; d.ball.x = d.me.x + 1; d.ball.y = d.me.y;
  let n = d.lit; while (n === d.lit) n = Math.floor(d.rnd() * d.gates.length);
  d.lit = n; d.litT = 0;
}
function resultKick(d, pts, text) {
  d.score += pts; d.kick += 1; d.say(text);
  if (d.kick >= d.kicks) { d.done = true; d.result = `${d.score} points from ${d.kicks} kicks`; } else placeFK(d, d.rnd);
}

/* ------------------------------ drawing ------------------------------ */
/** Draw the drill top-down into a 2D canvas context sized w×h px. */
export function draw(g, d, w, h, ctl = {}) {
  const S = Math.min(w / d.W, h / d.H);
  const ox = (w - d.W * S) / 2; const oy = (h - d.H * S) / 2;
  const X = (x) => ox + x * S; const Y = (y) => oy + y * S;
  g.fillStyle = '#0b1a10'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#2f8a45' : '#358f4b'; g.fillRect(X(i * d.W / 10), Y(0), d.W / 10 * S + 1, d.H * S); }
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1, S * 0.12); g.strokeRect(X(0), Y(0), d.W * S, d.H * S);
  const cone = (x, y, c = '#ff7a1a', lit = false) => { g.fillStyle = c; g.beginPath(); g.moveTo(X(x), Y(y) - S * 0.6); g.lineTo(X(x) - S * 0.4, Y(y) + S * 0.3); g.lineTo(X(x) + S * 0.4, Y(y) + S * 0.3); g.closePath(); g.fill(); if (lit) { g.strokeStyle = '#fff'; g.stroke(); } };
  if (d.id === 'slalom') {
    for (const gt of d.gates) { const c = gt.passed ? '#3ddc97' : gt.missed ? '#ff5c5c' : '#ff7a1a'; cone(gt.x, gt.y - gt.w / 2, c); cone(gt.x, gt.y + gt.w / 2, c); }
    g.strokeStyle = '#ffd166'; g.setLineDash([S * 0.6, S * 0.4]); g.beginPath(); g.moveTo(X(d.finish), Y(0)); g.lineTo(X(d.finish), Y(d.H)); g.stroke(); g.setLineDash([]);
  }
  if (d.id === 'freekicks') {
    // the goal seen from above, and the target board beside it
    g.fillStyle = '#fff'; g.fillRect(X(d.goal.x), Y(d.goal.y - d.goal.half), S * 0.4, d.goal.half * 2 * S);
    g.fillStyle = '#1b2433'; g.fillRect(X(d.wall.x) - S * 0.3, Y(d.wall.y) - S * 0.3, S * 0.6, S * 0.6);
    const wx = -d.wall.ny; const wy = d.wall.nx;
    g.strokeStyle = '#1b2433'; g.lineWidth = S * 0.7; g.beginPath(); g.moveTo(X(d.wall.x - wx * d.wall.half), Y(d.wall.y - wy * d.wall.half)); g.lineTo(X(d.wall.x + wx * d.wall.half), Y(d.wall.y + wy * d.wall.half)); g.stroke();
    drawGoalFace(g, d, w, h);
  }
  if (d.id === 'crossing') {
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = Math.max(1, S * 0.12);
    g.strokeRect(X(d.W - 16.5), Y(d.H / 2 - 20), 16.5 * S, 40 * S); g.strokeRect(X(d.W - 5.5), Y(d.H / 2 - 9.2), 5.5 * S, 18.4 * S);
    d.zones.forEach((z, i) => { g.fillStyle = i === d.litZone ? 'rgba(255,209,102,.55)' : 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(X(z.x), Y(z.y), z.r * S, 0, Math.PI * 2); g.fill(); });
    if (!d.flying) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(X(d.aim.x), Y(d.aim.y), S * 0.8, 0, Math.PI * 2); g.moveTo(X(d.aim.x) - S, Y(d.aim.y)); g.lineTo(X(d.aim.x) + S, Y(d.aim.y)); g.moveTo(X(d.aim.x), Y(d.aim.y) - S); g.lineTo(X(d.aim.x), Y(d.aim.y) + S); g.stroke(); }
  }
  if (d.id === 'passing') {
    d.gates.forEach((gt, i) => { const lit = i === d.lit; cone(gt.x - gt.w / 2, gt.y, lit ? '#ffd166' : '#7a8699', lit); cone(gt.x + gt.w / 2, gt.y, lit ? '#ffd166' : '#7a8699', lit); if (lit) { g.fillStyle = 'rgba(255,209,102,.25)'; g.beginPath(); g.arc(X(gt.x), Y(gt.y), S * 2, 0, Math.PI * 2); g.fill(); } });
  }
  // the player
  if (d.id === 'slalom' || d.id === 'passing') {
    g.fillStyle = '#19e3ff'; g.beginPath(); g.arc(X(d.me.x), Y(d.me.y), S * 0.55, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(d.me.x), Y(d.me.y)); g.lineTo(X(d.me.x + Math.cos(d.me.dir) * 0.9), Y(d.me.y + Math.sin(d.me.dir) * 0.9)); g.stroke();
  }
  // the ball, with its shadow
  const b = d.ball;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X(b.x), Y(b.y), S * 0.35, S * 0.22, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(X(b.x), Y(b.y) - b.z * S * 0.5, S * (0.3 + b.z * 0.03), 0, Math.PI * 2); g.fill();
  // power meter
  if (ctl.charging) { g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(12, h - 26, 160, 12); g.fillStyle = ctl.power > 0.92 ? '#ff5c5c' : '#3ddc97'; g.fillRect(12, h - 26, 160 * ctl.power, 12); }
}
function drawGoalFace(g, d, w, h) {
  // an inset view of the goal mouth from behind the ball: targets, aim, and the last kick
  const bw = Math.min(260, w * 0.42); const bh = bw * (d.goal.height + 0.6) / (d.goal.half * 2 + 1);
  const x0 = w - bw - 12; const y0 = 12;
  const sx = bw / (d.goal.half * 2 + 1); const zy = (z) => y0 + bh - 6 - z * sx; const gy = (y) => x0 + (y + d.goal.half + 0.5) * sx;
  g.fillStyle = 'rgba(5,10,20,.75)'; g.fillRect(x0, y0, bw, bh);
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(gy(-d.goal.half), zy(0)); g.lineTo(gy(-d.goal.half), zy(d.goal.height)); g.lineTo(gy(d.goal.half), zy(d.goal.height)); g.lineTo(gy(d.goal.half), zy(0)); g.stroke();
  for (const t of d.targets) { g.strokeStyle = t.pts >= 150 ? '#ffd166' : t.pts >= 100 ? '#3ddc97' : '#41d3ff'; g.lineWidth = 2; g.beginPath(); g.arc(gy(t.y), zy(t.z), t.r * sx, 0, Math.PI * 2); g.stroke(); }
  if (!d.flying) { g.fillStyle = '#ff3fa4'; g.beginPath(); g.arc(gy(d.aim.y), zy(d.aim.z), 5, 0, Math.PI * 2); g.fill(); }
  else if (d.shot) { g.fillStyle = '#fff'; g.beginPath(); g.arc(gy(d.shot.ey - d.goal.y), zy(Math.max(0, d.shot.ez)), 4, 0, Math.PI * 2); g.fill(); }
}
