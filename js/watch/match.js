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
import { WORLD } from '../data/generator.js';

/* The home side is the player's own club. The watch has no squad editor, so
 * the eleven is whatever that club fields — the point of Kick Off here is the
 * football, not the team sheet. */
const HOME_ID = WORLD.clubs[0].id;

const DURATION = 60;          // seconds of real time — a glance, not a sitting

export function playMatch(app, awayId, onDone) {
  app.innerHTML = `
    <div class="w-match">
      <canvas id="wPitch"></canvas>
      <div class="w-hud"><span id="wClock">0'</span><b id="wScore">0 – 0</b></div>
      <button class="w-kick" id="wKick">KICK</button>
    </div>`;

  const canvas = app.querySelector('#wPitch');
  const ctx = canvas.getContext('2d', { alpha: false });
  const clockEl = app.querySelector('#wClock');
  const scoreEl = app.querySelector('#wScore');

  const match = new Match(HOME_ID, awayId, { duration: DURATION, mode: 'single', human: 0, preset: 'authentic' });
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
    canvas.setPointerCapture?.(e.pointerId);
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
      }
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
    const reward = 200 + h.score * 60 + (won ? 150 : 0);
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
      onDone(reward);
    });
  }
}
