/**
 * Kick Off on a watch face.
 *
 * The same `Match` the phone runs — same physics, same AI, same balance — drawn
 * through the 2D renderer that already exists as the WebGL fallback, because a
 * watch is exactly the machine that fallback was written for.
 *
 * The controls are the whole design problem. There is no room for a stick and
 * four buttons on 162 pixels, so: drag anywhere on the pitch to run (the touch
 * point becomes the stick, wherever it lands), and one fat button in the corner
 * to kick. The kick is contextual — near their goal it shoots, otherwise it
 * passes — which is the same decision the phone's HUD makes for its labels,
 * made for you instead of shown to you.
 */
import { Match, PITCH } from '../game/sim.js';
import { Input } from '../game/input.js';
import { draw, makeCamera, updateCamera, groundBasis } from '../game/render3d.js';
import { stadiumFor } from '../data/stadiums.js';
import { WORLD } from '../data/generator.js';
import { say } from '../data/commentary.js';

/* The home side is the player's own club. The watch has no squad editor, so
 * the eleven is whatever that club fields — the point of Kick Off here is the
 * football, not the team sheet. */
const HOME_ID = WORLD.clubs[0].id;

const DURATION = 60;          // seconds of real time — a glance, not a sitting

/* Three difficulties, one number each: the CPU's skill multiplier, and how
 * much the result pays. Hard pays double because it is. */
export const LEVELS = {
  easy:   { label: 'Easy',   skill: 0.72, pay: 0.7 },
  normal: { label: 'Normal', skill: 1,    pay: 1 },
  hard:   { label: 'Hard',   skill: 1.3,  pay: 2 },
};

/**
 * A 64x22 silhouette of the ground: the three stands in the seat colours,
 * taller for a bigger ground, a roof line when it has one, a bowl's curved
 * corners. Enough to tell The Forge from Colliery Row on a 40mm screen.
 */
export function drawThumb(canvas, st) {
  if (!canvas || !st) return;
  const g = canvas.getContext('2d');
  const W = canvas.width; const H = canvas.height;
  g.fillStyle = '#0b1220'; g.fillRect(0, 0, W, H);
  const h = 4 + Math.round(st.size * 10);
  const [a, b] = st.seats || ['#1c3f6e', '#14335c'];
  g.fillStyle = b;
  // far stand across the top, side stands down the edges
  g.fillRect(8, 2, W - 16, h); g.fillRect(2, 2, 6, H - 4); g.fillRect(W - 8, 2, 6, H - 4);
  g.fillStyle = a; g.fillRect(8, 2, W - 16, 2); g.fillRect(2, 2, 6, 2); g.fillRect(W - 8, 2, 6, 2);
  if (st.bowl) { g.fillStyle = b; g.beginPath(); g.arc(8, 2 + h, h, Math.PI, Math.PI * 1.5); g.lineTo(8, 2); g.fill(); g.beginPath(); g.arc(W - 8, 2 + h, h, Math.PI * 1.5, Math.PI * 2); g.lineTo(W - 8, 2); g.fill(); }
  if (st.roof && st.roof !== 'none') { g.fillStyle = '#e5e7eb'; g.fillRect(8, 1, W - 16, 1); }
  g.fillStyle = '#2e8845'; g.fillRect(9, 3 + h, W - 18, H - 5 - h);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1; g.strokeRect(10.5, 4.5 + h, W - 21, H - 8 - h);
}

export function playMatch(app, awayId, onDone, level = 'normal', opts = {}) {
  const lv = LEVELS[level] || LEVELS.normal;
  const homeClub = WORLD.clubs[0];
  const awayClub = WORLD.clubsById[awayId] || WORLD.clubs[1];
  const ground = stadiumFor(awayClub);            // the CPU side hosts: you are the visitor on the watch
  app.innerHTML = `
    <div class="w-match">
      <canvas id="wPitch"></canvas>
      <div class="w-venue"><canvas id="wThumb" width="64" height="22"></canvas><span>${ground.name}</span></div>
      <div class="w-hud"><span id="wClock">0'</span><b id="wScore">0 – 0</b></div>
      <div class="w-comm" id="wComm" hidden></div>
      <div class="w-sp" id="wSp" hidden></div>
      <button class="w-kick" id="wKick">KICK</button>
    </div>`;

  drawThumb(app.querySelector('#wThumb'), ground);
  const canvas = app.querySelector('#wPitch');
  const ctx = canvas.getContext('2d', { alpha: false });
  const clockEl = app.querySelector('#wClock');
  const scoreEl = app.querySelector('#wScore');
  /* One line of the gantry voice at a time, for the moments that matter on a
   * 40mm screen: goals, saves, chances, set pieces. */
  const commEl = app.querySelector('#wComm');
  const spEl = app.querySelector('#wSp');
  let commT = 0;
  let lastComm = -9;
  const WATCH_CUES = { goal: 'goal', save: 'save', post: 'post', bigChance: 'bigChance', cornerKick: 'cornerKick', freekick: 'freekick', penaltyAwarded: 'penaltyAwarded', injury: 'injury', shotWide: 'shotWide' };
  const commentate = (c) => {
    const key = WATCH_CUES[c.name];
    if (!key || (c.name !== 'goal' && match.t - lastComm < 2)) return;
    lastComm = match.t;
    const t = typeof c.arg === 'number' ? c.arg : c.arg?.team ?? (c.arg?.ref ? c.arg.team : 0);
    const team = match.teams[t] || match.teams[0];
    const gk = match.teams[1 - (team.side || 0)].players.find((q) => q.role === 'GK');
    const line = say(key, {
      player: c.arg?.ref ? c.arg.ref.short : team.short, team: team.short, opp: match.teams[1 - team.side].short,
      score: `${match.teams[0].score}–${match.teams[1].score}`, minute: match.minute(), dist: c.arg?.dist || '',
      keeper: gk ? gk.ref.short : 'the keeper',
    });
    if (!line) return;
    commEl.textContent = line;
    commEl.hidden = false;
    commT = 3;
  };

  // v80: Quickfire Fives on the wrist — five a side on the small pitch
  const match = new Match(HOME_ID, awayId, { duration: DURATION, mode: 'single', human: 0, preset: 'authentic', skill: lv.skill, field: opts.field || 'full' });
  const input = new Input({ keys: 'primary' });
  const cam = makeCamera();
  /* A watch is not a television. The broadcast camera shows the shape of a
   * whole team, which at 162 pixels wide is twenty-two specks — so this one
   * sits close behind the ball with a narrow lens, and the football fills the
   * screen. `updateCamera` still does the following and the easing; this only
   * pulls the result in. */
  const tighten = () => {
    const b = match.ball;
    cam.x = Math.max(12, Math.min(PITCH.w - 12, b.x));
    cam.y = b.y - 21;
    cam.z = 11.5;
    cam.tx = cam.x;
    cam.ty = b.y + 3;
    cam.hfov = 33;
  };
  tighten();
  match.basis = groundBasis(cam);

  const fit = () => {
    const r = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || app.clientWidth;
    const h = canvas.clientHeight || app.clientHeight;
    canvas.width = Math.round(w * r);
    canvas.height = Math.round(h * r);
    ctx.setTransform(r, 0, 0, r, 0, 0);
    return { w, h };
  };
  let size = fit();
  const onResize = () => { size = fit(); };
  window.addEventListener('resize', onResize);

  /* Drag to run. The first touch sets the origin, so the stick appears under
   * the thumb rather than asking a watch-sized screen to spare a corner for
   * one. 26px of travel is full tilt — a watch drag is short. */
  let dragId = null;
  let origin = { x: 0, y: 0 };
  const R = 26;
  canvas.addEventListener('pointerdown', (e) => {
    dragId = e.pointerId; origin = { x: e.clientX, y: e.clientY };
    try { canvas.setPointerCapture?.(e.pointerId); } catch { /* gone */ }
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dragId) return;
    const dx = Math.max(-1, Math.min(1, (e.clientX - origin.x) / R));
    const dy = Math.max(-1, Math.min(1, (e.clientY - origin.y) / R));
    input.setTouchVec(dx, dy);
  });
  const release = (e) => {
    if (e.pointerId !== dragId) return;
    dragId = null;
    input.setTouchVec(0, 0);
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  /* One button, two meanings. Inside shooting range of their goal it shoots;
   * everywhere else it passes — and it holds `sprint` while pressed, so the
   * one control that exists also does the thing a watch player will want most,
   * which is to actually reach the ball. */
  const kick = app.querySelector('#wKick');
  const shootingRange = () => {
    const me = match.active;
    if (!me) return false;
    const goalX = match.teams[0].dir > 0 ? PITCH.w : 0;
    return Math.abs(me.x - goalX) < 30;
  };
  kick.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    navigator.vibrate?.(6);
    const sp = match.setPiece;
    if (sp && sp.human && sp.team === 0) {
      // aim: the stick if it is held, else straight at goal
      const a = Math.hypot(input.axis().x, input.axis().y) > 0.2 ? { x: input.axis().x, y: -input.axis().y } : { x: 1, y: 0 };
      const goalX = PITCH.w;
      const near = Math.abs(sp.taker.x - goalX) < 30;
      const act2 = sp.kind === 'penalty' || (sp.kind === 'freekick' && near) ? 'shoot' : sp.kind === 'corner' ? 'cross' : 'pass';
      match.takeSetPiece(act2, a, 0.7);
      return;
    }
    const act = shootingRange() ? 'shoot' : 'pass';
    input.setTouchButton(act, true);
    kick.dataset.act = act;
    input.setTouchButton('sprint', true);
  });
  const kickUp = () => {
    input.setTouchButton('shoot', false);
    input.setTouchButton('pass', false);
    input.setTouchButton('sprint', false);
  };
  kick.addEventListener('pointerup', kickUp);
  kick.addEventListener('pointercancel', kickUp);
  kick.addEventListener('pointerleave', kickUp);

  let raf = null;
  let last = performance.now();
  let ended = false;
  let lastScore = '0 – 0';

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    input.poll(dt);
    if (!ended) {
      match.update(dt, [input]);
      updateCamera(cam, match, dt);
      tighten();
      match.basis = groundBasis(cam);
      while (match.cues.length) {
        const c = match.cues.shift();
        if (c.name === 'goal') navigator.vibrate?.([16, 40, 24]);
        commentate(c);
      }
      if (commT > 0) { commT -= dt; if (commT <= 0) commEl.hidden = true; }
      // a dead ball for the player: say what KICK will do, and count down
      const sp = match.setPiece;
      if (sp && sp.human && sp.team === 0) {
        const what = sp.kind === 'penalty' ? 'PENALTY · KICK to shoot' : sp.kind === 'corner' ? 'CORNER · KICK to cross'
          : sp.kind === 'throwin' ? 'THROW · KICK to throw' : 'FREE KICK · KICK to take';
        spEl.textContent = `${what} · ${Math.ceil(match.phaseT)}`;
        spEl.hidden = false;
      } else spEl.hidden = true;
      if (match.phase === 'end') { ended = true; finish(); }
    }
    draw(ctx, match, cam, size.w, size.h, 'low', dt, { hideBanner: false });
    clockEl.textContent = `${match.minute()}'`;
    const sc = `${match.teams[0].score} – ${match.teams[1].score}`;
    if (sc !== lastScore) { lastScore = sc; scoreEl.textContent = sc; }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  function finish() {
    const [h, a] = match.teams;
    const won = h.score > a.score;
    const reward = Math.round((200 + h.score * 60 + (won ? 150 : 0)) * lv.pay);
    navigator.vibrate?.(won ? [20, 60, 30] : 14);
    const panel = document.createElement('div');
    panel.className = 'w-end';
    panel.innerHTML = `
      <div>
        <p class="w-title">${won ? 'Win' : h.score === a.score ? 'Draw' : 'Loss'}</p>
        <div class="w-big">${h.score} – ${a.score}</div>
        <p class="w-sub">+◈ ${reward.toLocaleString()}</p>
        <button class="w-btn" id="wBack">Done</button>
      </div>`;
    app.querySelector('.w-match').appendChild(panel);
    panel.querySelector('#wBack').addEventListener('click', () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      input.destroy?.();
      onDone(reward, { goals: h.score, conceded: match.teams[1].score, won, level, field: opts.field || 'full' });
    });
  }
}
