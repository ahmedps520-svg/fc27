import { WORLD } from '../data/generator.js';
import { navigate } from '../app.js';
import { getState } from '../state.js';
import { checkForUpdate, installUpdate } from '../update.js';
import { readPad } from '../game/padRead.js';

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
        <!-- The publisher mark.
             It was a thin outlined A on a plain white disc with two lines of
             letter-spaced caps beside it, which read as a placeholder rather
             than a logo. This is built out of the same parts as everything
             else on the cover: the A is two heavy angled bars, its right leg
             carries on past the apex as the swoosh, and the disc is dark with
             a green rim so it sits on the artwork instead of punching a white
             hole in it. -->
        <div class="mark">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="markG" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stop-color="#3ff08a"/>
                <stop offset="100%" stop-color="#0f9e56"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="46" class="mark-disc" />
            <circle cx="50" cy="50" r="46" class="mark-ring" />
            <!-- the swoosh, clipped to the disc so it reads as part of the badge -->
            <clipPath id="markClip"><circle cx="50" cy="50" r="46" /></clipPath>
            <g clip-path="url(#markClip)">
              <path class="mark-sweep" d="M-8 84 L30 92 L108 26" />
            </g>
            <path class="mark-a" d="M25 75 L50 26 L75 75" />
            <path class="mark-bar" d="M35 59 H65" />
          </svg>
          <span class="mark-type">
            <b class="mark-apex">APEX</b>
            <i class="mark-sports">SPORTS</i>
          </span>
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

        <!-- Swapped in over the start button when the server is on a newer
             build. Hidden markup rather than a re-render, so the title screen's
             entrance animation is not restarted underneath it. -->
        <div class="updater" id="updater" hidden>
          <span class="up-kicker">Update required</span>
          <p class="up-copy" id="upCopy">A new version of APEX XI is available.
            Install it to carry on.</p>
          <button class="start-btn up-start" id="updateBtn"><span>UPDATE</span></button>
          <div class="up-progress" id="upProgress" hidden>
            <div class="up-track"><i id="upFill"></i></div>
            <div class="up-row">
              <span class="up-stage" id="upStage">Contacting server</span>
              <span class="up-pct" id="upPct">0%</span>
            </div>
          </div>
        </div>

        <p class="splash-note">Clubs, leagues and competitions are fictional.</p>
      </div>
    </div>`;
}

export function mount(root) {
  const canvas = root.querySelector('#splashBg');
  const ctx = canvas.getContext('2d');
  const shell = root.querySelector('#splash');
  let raf = null;
  let t = 0;

  /* v100: the backdrop is soft haze and drifting motes — half resolution and
     thirty frames a second look the same and cost a quarter of the painting.
     At full resolution and the display's rate it was the title screen's
     biggest cost: Lighthouse (mobile, 4× CPU) put ~9 s of main-thread
     rendering on this canvas before the game was interactive. */
  const resize = () => {
    const dpr = 0.5;
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

  let lastPaint = 0;
  const frame = (now = 0) => {
    if (now - lastPaint < 32) { raf = requestAnimationFrame(frame); return; }
    lastPaint = now;
    const w = shell.clientWidth;
    const h = shell.clientHeight;
    t += 0.012;                        // v100: half the frames, the same drift speed

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
      m.y -= m.s * 0.0024;
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

  /* ------------------------------ updating ------------------------------ *
   * Asked once, here, because this is the only screen the app is guaranteed to
   * pass through on a cold start and the only one where interrupting somebody
   * costs them nothing.                                                       */
  const startBtn = root.querySelector('#startBtn');
  const updater = root.querySelector('#updater');
  let blocked = false;

  const go = () => { if (!blocked) navigate('menu'); };
  startBtn.addEventListener('click', go);

  /* v95: attract mode. Left alone on the title, the game plays itself — two
   * top-tier sides, CPU against CPU, behind a "press any button" banner
   * (play.js). Not with an update waiting, not with reduced motion or the
   * battery saver on, not while the tab is hidden, and not under automation
   * unless a test asks for it by setting window.__apexAttractMs. */
  const S = getState().settings || {};
  const idleMs = window.__apexAttractMs ?? (navigator.webdriver ? 0 : 40000);
  let idle = null;
  const armIdle = () => {
    clearTimeout(idle);
    if (!idleMs || S.reduceMotion || S.battery) return;
    idle = setTimeout(() => {
      if (blocked || document.hidden) { armIdle(); return; }
      const top = WORLD.clubs.filter((c) => c.tier <= 2);
      const pool = top.length >= 2 ? top : WORLD.clubs;
      const h = pool[Math.floor(Math.random() * pool.length)];
      let a = h; while (a === h) a = pool[Math.floor(Math.random() * pool.length)];
      navigate('play', { attract: true, homeId: h.id, awayId: a.id, duration: 150, mode: 'single' });
    }, idleMs);
  };
  const nudge = () => armIdle();
  for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel']) window.addEventListener(ev, nudge, { passive: true });
  armIdle();

  checkForUpdate().then(({ pending, build }) => {
    if (!pending || !build) return;
    blocked = true;
    startBtn.hidden = true;
    updater.hidden = false;

    const fill = root.querySelector('#upFill');
    const pctEl = root.querySelector('#upPct');
    const stageEl = root.querySelector('#upStage');

    root.querySelector('#updateBtn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.hidden = true;
      root.querySelector('#upCopy').textContent = 'Installing the latest version…';
      root.querySelector('#upProgress').hidden = false;
      installUpdate(build, (pct, label) => {
        fill.style.width = `${pct}%`;
        pctEl.textContent = `${Math.round(pct)}%`;
        stageEl.textContent = label;
      });
    }, { once: true });
  });

  const onKey = (e) => {
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); go(); }
  };
  window.addEventListener('keydown', onKey);

  // any gamepad button starts too
  let padWasDown = false;
  const padPoll = setInterval(() => {
    const pad = readPad();   // v123: the pad being used, whatever slot it is in
    if (!pad) return;
    const down = pad.buttons.some((b) => b.pressed);
    if (down && !padWasDown) go();
    if (down || Math.abs(pad.axes[0] || 0) > 0.3 || Math.abs(pad.axes[1] || 0) > 0.3) armIdle();
    padWasDown = down;
  }, 90);

  return () => {
    cancelAnimationFrame(raf);
    clearInterval(padPoll);
    clearTimeout(idle);
    for (const ev of ['pointermove', 'pointerdown', 'keydown', 'wheel']) window.removeEventListener(ev, nudge);
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKey);
  };
}
