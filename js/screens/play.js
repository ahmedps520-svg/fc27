import { getState, update } from '../state.js';
import { getClub } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { Match } from '../game/sim.js';
import { Input } from '../game/input.js';
import { draw, makeCamera, updateCamera, groundBasis, resolveQuality } from '../game/render3d.js';
import { navigate, refreshCoins } from '../app.js';

export const TITLE = 'Match';

export function render(params) {
  const home = getClub(params.homeId);
  const away = getClub(params.awayId);
  return `
    <div class="gm" id="gmRoot">
      <canvas id="gmCanvas"></canvas>

      <div class="gm-hud">
        <div class="gm-bug">
          <span class="bug-team" style="--team:${home.crest.colors[0]}">
            ${crestSVG(home.crest, home.short, 20)}<b>${home.short}</b>
          </span>
          <b class="bug-score" id="gmScore">0</b>
          <b class="bug-score" id="gmScoreA">0</b>
          <span class="bug-team" style="--team:${away.crest.colors[0]}">
            <b>${away.short}</b>${crestSVG(away.crest, away.short, 20)}
          </span>
          <span class="bug-clock" id="gmClock">0'</span>
        </div>
        <div class="gm-tools">
          <span class="gm-pad" id="gmPad">No pad</span>
          <button class="icon-btn sm" id="gmFs" title="Fullscreen">⛶</button>
          <button class="icon-btn sm" id="gmPause" title="Pause">❚❚</button>
        </div>
      </div>

      <div class="gm-touch" id="gmTouch" hidden>
        <div class="stick" id="stick"><i></i></div>
        <div class="tbtns">
          <button data-act="through">△</button>
          <button data-act="cross">□</button>
          <button data-act="shoot">◯</button>
          <button data-act="pass">✕</button>
        </div>
      </div>

      <div class="gm-overlay" id="gmOverlay" hidden></div>
    </div>`;
}

export function mount(root, params) {
  const shell = root.querySelector('#gmRoot');
  const canvas = root.querySelector('#gmCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const input = new Input();
  const quality = resolveQuality(getState().settings.quality);

  const match = new Match(params.homeId, params.awayId, {
    duration: params.duration || 240,
    skill: params.skill || 1,
  });
  const cam = makeCamera();
  match.basis = groundBasis(cam);        // controls follow the camera

  const scoreH = root.querySelector('#gmScore');
  const scoreA = root.querySelector('#gmScoreA');
  const clockEl = root.querySelector('#gmClock');
  const padEl = root.querySelector('#gmPad');
  const overlay = root.querySelector('#gmOverlay');

  document.body.classList.add('in-game');

  let vw = 0;
  let vh = 0;
  let paused = false;
  let ended = false;
  let raf = null;
  let last = performance.now();

  const resize = () => {
    const dpr = Math.min(quality === 'low' ? 1.25 : 2, window.devicePixelRatio || 1);
    vw = shell.clientWidth;
    vh = shell.clientHeight;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  /* ------------------------------- touch ------------------------------- */
  const touchWrap = root.querySelector('#gmTouch');
  if (window.matchMedia('(pointer: coarse)').matches) {
    touchWrap.hidden = false;
    const stick = root.querySelector('#stick');
    const nub = stick.querySelector('i');
    let stickId = null;
    const R = 44;
    stick.addEventListener('pointerdown', (e) => { stickId = e.pointerId; stick.setPointerCapture(e.pointerId); });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId !== stickId) return;
      const r = stick.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const m = Math.hypot(dx, dy) || 1;
      const cl = Math.min(1, m / R);
      input.setTouchVec((dx / m) * cl, (dy / m) * cl);
      nub.style.transform = `translate(${(dx / m) * cl * R}px, ${(dy / m) * cl * R}px)`;
    });
    const endStick = (e) => {
      if (e.pointerId !== stickId) return;
      stickId = null;
      input.setTouchVec(0, 0);
      nub.style.transform = '';
    };
    stick.addEventListener('pointerup', endStick);
    stick.addEventListener('pointercancel', endStick);

    root.querySelectorAll('.tbtns button').forEach((b) => {
      const act = b.dataset.act;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); input.setTouchButton(act, true); });
      const off = () => input.setTouchButton(act, false);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('pointerleave', off);
    });
  }

  /* -------------------------------- loop ------------------------------- */
  const frame = (now) => {
    const dt = Math.min(0.034, (now - last) / 1000);
    last = now;
    input.poll(dt);

    if (input.pressed('pause') && !ended) setPaused(!paused);

    if (!paused && !ended) {
      match.update(dt, input);
      updateCamera(cam, match, dt);
      match.basis = groundBasis(cam);
      if (match.phase === 'end') { ended = true; finish(); }
    }

    draw(ctx, match, cam, vw, vh, quality, paused ? 0 : dt);

    scoreH.textContent = match.teams[0].score;
    scoreA.textContent = match.teams[1].score;
    clockEl.textContent = `${match.minute()}'`;
    padEl.textContent = input.pad ? 'Pad ✓' : 'No pad';
    padEl.classList.toggle('on', !!input.pad);

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ----------------------------- fullscreen ---------------------------- */
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else shell.requestFullscreen?.().catch(() => {});
  };
  root.querySelector('#gmFs').addEventListener('click', toggleFs);
  const onFsChange = () => setTimeout(resize, 60);
  document.addEventListener('fullscreenchange', onFsChange);

  /* ------------------------------ overlays ----------------------------- */
  function setPaused(v) {
    paused = v;
    if (!v) { overlay.hidden = true; overlay.innerHTML = ''; return; }
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gm-panel glass">
        <h3>Paused</h3>
        <div class="ctrl-grid compact">
          ${[['✕', 'Pass'], ['◯', 'Shoot'], ['□', 'Cross'], ['△', 'Through'], ['L1/R1', 'Switch'], ['R2', 'Sprint']]
            .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
        </div>
        <div class="gm-btns">
          <button class="btn primary" data-o="resume">Resume</button>
          <button class="btn ghost" data-o="quit">Quit</button>
        </div>
      </div>`;
  }

  function finish() {
    const [ph, pa] = match.possession();
    const [h, a] = match.teams;
    const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
      .sort((x, y) => x[1].minute - y[1].minute);
    update((s) => { s.club.coins += 300 + h.score * 80; });
    refreshCoins();

    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gm-panel glass">
        <span class="gm-ft">Full time</span>
        <div class="gm-final">
          <div>${crestSVG(h.club.crest, h.short, 40)}<b>${h.short}</b></div>
          <span>${h.score} – ${a.score}</span>
          <div>${crestSVG(a.club.crest, a.short, 40)}<b>${a.short}</b></div>
        </div>
        ${goals.length ? `<ul class="gm-goals">${goals.map(([t, s]) =>
          `<li><i>${s.minute}'</i> ${s.name} <em>${t}</em></li>`).join('')}</ul>` : ''}
        <div class="gm-stats">
          <div><b>${ph}%</b><span>Possession</span><b>${pa}%</b></div>
          <div><b>${h.shots}</b><span>Shots</span><b>${a.shots}</b></div>
        </div>
        <div class="gm-btns">
          <button class="btn primary" data-o="again">Rematch</button>
          <button class="btn ghost" data-o="quit">Quit</button>
        </div>
      </div>`;
  }

  overlay.addEventListener('click', (e) => {
    const o = e.target.closest('[data-o]')?.dataset.o;
    if (!o) return;
    if (o === 'resume') setPaused(false);
    if (o === 'quit') { document.exitFullscreen?.().catch(() => {}); navigate('quick'); }
    if (o === 'again') navigate('play', params);
  });

  root.querySelector('#gmPause').addEventListener('click', () => { if (!ended) setPaused(!paused); });

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    document.removeEventListener('fullscreenchange', onFsChange);
    document.body.classList.remove('in-game');
    input.destroy();
  };
}
