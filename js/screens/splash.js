import { WORLD } from '../data/generator.js';
import { navigate } from '../app.js';

export const TITLE = 'APEX XI';

/**
 * Animated title screen. Same furniture as a sports-game cover — roundel mark,
 * oversized wordmark, accent swoosh, start button — but every element is drawn
 * here from scratch: no photography, no real player, no real club or brand.
 */
export function render() {
  return `
    <div class="splash" id="splash">
      <canvas id="splashBg"></canvas>
      <div class="splash-vignette"></div>

      <svg class="swoosh" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
        <path class="swoosh-a" d="M-40 640 L520 700 L1240 300" />
        <path class="swoosh-b" d="M-40 690 L560 700 L1240 360" />
      </svg>

      <div class="splash-body">
        <div class="mark">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="mark-disc" />
            <path class="mark-glyph" d="M28 68 L50 30 L72 68 M37 56 L63 56" />
          </svg>
          <span>APEX<br /><b>SPORTS</b></span>
        </div>

        <h1 class="splash-title">
          <span class="t1">APEX</span><span class="t2">XI</span>
        </h1>
        <p class="splash-tag">
          ${WORLD.clubs.length} clubs · ${WORLD.players.length} players · one season
        </p>

        <button class="start-btn" id="startBtn">
          <span>START</span>
        </button>
        <p class="splash-note">All clubs, players and competitions are fictional.</p>
      </div>
    </div>`;
}

export function mount(root) {
  const canvas = root.querySelector('#splashBg');
  const ctx = canvas.getContext('2d');
  const shell = root.querySelector('#splash');
  let raf = null;
  let t = 0;

  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(shell.clientWidth * dpr);
    canvas.height = Math.round(shell.clientHeight * dpr);
    canvas.style.width = `${shell.clientWidth}px`;
    canvas.style.height = `${shell.clientHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // Drifting floodlit haze and a slow field of motes, so the plate feels alive.
  const motes = Array.from({ length: 70 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.4 + Math.random() * 1.8,
    s: 0.1 + Math.random() * 0.35,
    a: 0.06 + Math.random() * 0.22,
  }));

  const frame = () => {
    const w = shell.clientWidth;
    const h = shell.clientHeight;
    t += 0.006;

    ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w * 0.6, h);
    g.addColorStop(0, '#0a1020');
    g.addColorStop(0.55, '#0a1526');
    g.addColorStop(1, '#05070e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 3; i++) {
      const cx = w * (0.28 + 0.3 * i) + Math.sin(t + i * 2.1) * w * 0.05;
      const cy = h * (0.1 + 0.06 * i);
      const r = Math.max(w, h) * (0.42 + 0.08 * i);
      const beam = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const hue = i === 1 ? '65,211,255' : i === 2 ? '184,255,61' : '123,92,255';
      beam.addColorStop(0, `rgba(${hue},${0.16 + Math.sin(t * 1.4 + i) * 0.05})`);
      beam.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = '#cfe6ff';
    for (const m of motes) {
      m.y -= m.s * 0.0012;
      if (m.y < -0.03) { m.y = 1.03; m.x = Math.random(); }
      ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(t * 3 + m.x * 20));
      ctx.beginPath();
      ctx.arc(m.x * w, m.y * h, m.r, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  const go = () => navigate('menu');
  root.querySelector('#startBtn').addEventListener('click', go);

  const onKey = (e) => {
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); go(); }
  };
  window.addEventListener('keydown', onKey);

  // any gamepad button starts too
  let padWasDown = false;
  const padPoll = setInterval(() => {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const pad = pads.find((p) => p && p.connected);
    if (!pad) return;
    const down = pad.buttons.some((b) => b.pressed);
    if (down && !padWasDown) go();
    padWasDown = down;
  }, 90);

  return () => {
    cancelAnimationFrame(raf);
    clearInterval(padPoll);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
  };
}
