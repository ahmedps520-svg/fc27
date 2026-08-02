import { getState, update } from '../state.js';
import { getClub } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { Match, SHAPES, FORMATION_NAMES, PITCH } from '../game/sim.js';
import { Input } from '../game/input.js';
import {
  draw, makeCamera, updateCamera, groundBasis, replayCamera, resolveQuality,
} from '../game/render3d.js';
import { createRenderer } from '../game/renderGL.js';
import { toggleFullscreen, exitFullscreen, fullscreenSupported } from '../fullscreen.js';
import { settleDivisionMatch } from '../ultimate.js';
import { sfx, startCrowd, setCrowd, stopCrowd, stopMusic, resumeAudio } from '../audio.js';
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

      <div class="goal-card" id="goalCard" hidden>
        <span class="gc-word">GOAL</span>
        <span class="gc-scorer" id="gcScorer"></span>
        <span class="gc-score" id="gcScore"></span>
      </div>

      <div class="replay-tag" id="replayTag" hidden>
        <span class="rt-dot"></span>REPLAY
        <em>hold ◯ to skip</em>
      </div>

      <div class="gm-overlay" id="gmOverlay" hidden></div>
    </div>`;
}

export function mount(root, params) {
  const shell = root.querySelector('#gmRoot');
  const canvas = root.querySelector('#gmCanvas');
  const mode = params.mode || 'single';
  const twoUp = mode === 'versus' || mode === 'coop';

  // Seat 1 takes pad 0 and the WASD set; seat 2 takes pad 1 and the arrow/numpad
  // set, so a second person can join with a pad or just the other half of the keyboard.
  const inputs = [new Input({ pad: 0, keys: 'primary' })];
  if (twoUp) inputs.push(new Input({ pad: 1, keys: 'secondary' }));
  const input = inputs[0];
  const quality = resolveQuality(getState().settings.quality);

  const match = new Match(params.homeId, params.awayId, {
    duration: params.duration || 240,
    skill: params.skill || 1,
    mode,
    homeSquad: params.homeSquad || null,
    awaySquad: params.awaySquad || null,
  });
  const cam = makeCamera();
  match.basis = groundBasis(cam);        // controls follow the camera

  const scoreH = root.querySelector('#gmScore');
  const scoreA = root.querySelector('#gmScoreA');
  const clockEl = root.querySelector('#gmClock');
  const padEl = root.querySelector('#gmPad');
  const overlay = root.querySelector('#gmOverlay');
  const goalCard = root.querySelector('#goalCard');
  const gcScorer = root.querySelector('#gcScorer');
  const gcScore = root.querySelector('#gcScore');
  const replayTag = root.querySelector('#replayTag');
  let lastPhase = null;

  /* ---------------------------- goal replay ---------------------------- */
  // Rolling buffer of recent frames, so a goal can be played back afterwards.
  const TAPE_SECONDS = 8;
  const TAPE_MAX = TAPE_SECONDS * 60;
  const tape = [];
  const allPlayers = () => [...match.teams[0].players, ...match.teams[1].players];

  const recordFrame = () => {
    const snap = {
      b: [match.ball.x, match.ball.y, match.ball.z || 0],
      p: allPlayers().map((p) => [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy, p.diveT || 0]),
    };
    tape.push(snap);
    // it is a ring buffer, so the recorded goal index slides as frames drop off
    if (tape.length > TAPE_MAX) { tape.shift(); if (goalTapeIdx > 0) goalTapeIdx -= 1; }
  };

  const applyFrame = (snap) => {
    match.ball.x = snap.b[0];
    match.ball.y = snap.b[1];
    match.ball.z = snap.b[2];
    allPlayers().forEach((p, i) => {
      const s = snap.p[i];
      if (!s) return;
      [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy] = s;
      p.diveT = s[6];
    });
  };

  let goalTapeIdx = -1;
  let replay = null;
  const startReplay = () => {
    if (tape.length < 40 || goalTapeIdx < 0) return false;
    const live = { b: [match.ball.x, match.ball.y, match.ball.z], p: allPlayers().map((p) => [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy, p.diveT || 0]) };
    const celeb = allPlayers().map((p) => p.celebrating);
    allPlayers().forEach((p) => { p.celebrating = false; });
    // window the tape around the goal so the clip runs up to the strike and
    // then keeps going long enough to show the ball bury itself in the net
    const from = Math.max(0, goalTapeIdx - 3.5 * 60);
    const to = Math.min(tape.length, goalTapeIdx + 1.4 * 60);
    replay = {
      frames: tape.slice(from, to),
      i: 0, live, celeb,
      goalX: match.teams[match.goalTeam].dir > 0 ? PITCH.w : 0,
      cam: makeCamera(),
    };
    replayTag.hidden = false;
    return true;
  };

  const endReplay = () => {
    if (!replay) return;
    applyFrame(replay.live);
    allPlayers().forEach((p, i) => { p.celebrating = replay.celeb[i]; });
    replay = null;
    replayTag.hidden = true;
  };

  document.body.classList.add('in-game');
  resumeAudio();
  stopMusic();          // menu music steps aside for the stadium
  startCrowd();

  let vw = 0;
  let vh = 0;
  let paused = false;
  let ended = false;
  let navHeld = false;
  let raf = null;
  let last = performance.now();

  // WebGL is the real renderer; the canvas-2D path stays as a fallback so the
  // match still runs if a machine or driver refuses a GL context.
  let gl = null;
  let ctx = null;
  try {
    gl = createRenderer(canvas, match, quality);
  } catch (err) {
    console.warn('WebGL unavailable, falling back to canvas 2D:', err);
    ctx = canvas.getContext('2d', { alpha: false });
  }

  const resize = () => {
    vw = shell.clientWidth;
    vh = shell.clientHeight;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    if (gl) { gl.resize(vw, vh); return; }
    const dpr = Math.min(quality === 'low' ? 1.25 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
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
    for (const inp of inputs) inp.poll(dt);

    if (input.pressed('pause') && !ended) setPaused(!paused);

    // pad / keyboard navigation of the pause menu
    if (paused && !ended) {
      const ay = input.axis().y;
      if (ay < -0.5 && !navHeld) { navIdx = (navIdx + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length; paintPause(); }
      if (ay > 0.5 && !navHeld) { navIdx = (navIdx + 1) % PAUSE_ITEMS.length; paintPause(); }
      navHeld = Math.abs(ay) > 0.5;
      if (input.pressed('pass')) activate(PAUSE_ITEMS[navIdx].id);
      if (input.pressed('shoot')) setPaused(false);
    } else {
      navHeld = false;
    }

    if (replay) {
      // hold ◯ to bail out of the cinematic
      if (inputs.some((i) => i.held('shoot'))) endReplay();
      else {
        const f = replay.frames[Math.floor(replay.i)];
        if (f) applyFrame(f);
        replayCamera(replay.cam, match.ball, replay.goalX, replay.i / replay.frames.length);
        // slow motion, and slower still over the strike itself
        const near = replay.i / replay.frames.length > 0.68 ? 0.3 : 0.6;
        replay.i += near;
        if (replay.i >= replay.frames.length) endReplay();
      }
    } else if (!paused && !ended) {
      match.update(dt, inputs);
      updateCamera(cam, match, dt);
      match.basis = groundBasis(cam);
      // keep taping through the goal phase, otherwise the clip stops at the line
      if (match.phase === 'play' || match.phase === 'goal') {
        if (match.phase === 'goal' && lastPhase !== 'goal') goalTapeIdx = tape.length;
        recordFrame();
      }
      if (match.phase === 'end') { ended = true; finish(); }

      // drain the sim's audio cues
      while (match.cues.length) {
        const c = match.cues.shift();
        sfx(c.name, c.arg);
      }
      // crowd lifts as play nears either goal, and roars through a celebration
      const near = Math.min(match.ball.x, PITCH.w - match.ball.x) / (PITCH.w / 2);
      setCrowd(match.phase === 'goal' ? 1 : 0.3 + (1 - near) * 0.5);
    }

    const rdt = paused ? 0 : dt;
    const shot = replay ? replay.cam : cam;
    if (gl) gl.render(match, shot, rdt);
    else draw(ctx, match, shot, vw, vh, quality, rdt);

    // goal card rides the celebration phase
    if (match.phase === 'goal' && lastPhase !== 'goal') {
      const t = match.teams[match.goalTeam];
      goalCard.hidden = false;
      goalCard.style.setProperty('--team', t.colors[0]);
      gcScorer.textContent = match.scorerName || '';
      gcScore.textContent = `${t.short}  ${match.teams[0].score} – ${match.teams[1].score}`;
      void goalCard.offsetWidth;
      goalCard.classList.add('show');
    } else if (match.phase !== 'goal' && lastPhase === 'goal') {
      goalCard.classList.remove('show');
      goalCard.hidden = true;
      startReplay();                       // celebration over — roll the tape
    }
    lastPhase = match.phase;

    scoreH.textContent = match.teams[0].score;
    scoreA.textContent = match.teams[1].score;
    clockEl.textContent = `${match.minute()}'`;
    if (twoUp) {
      padEl.textContent = `P1 ${inputs[0].pad ? '✓' : 'kbd'} · P2 ${inputs[1].pad ? '✓' : 'kbd'}`;
      padEl.classList.toggle('on', !!(inputs[0].pad && inputs[1].pad));
    } else {
      padEl.textContent = input.pad ? 'Pad ✓' : 'No pad';
      padEl.classList.toggle('on', !!input.pad);
    }

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  /* ----------------------------- fullscreen ---------------------------- */
  const fsBtn = root.querySelector('#gmFs');
  // iPhone has no Fullscreen API — hide the control rather than offer a dead button
  if (!fullscreenSupported()) fsBtn.hidden = true;
  fsBtn.addEventListener('click', () => toggleFullscreen(shell));
  const onFsChange = () => setTimeout(resize, 60);
  document.addEventListener('fullscreenchange', onFsChange);

  /* ---------------------------- pause menu ----------------------------- */
  const PAUSE_ITEMS = [
    { id: 'resume', label: 'Resume Match' },
    { id: 'team', label: 'Team Management' },
    { id: 'facts', label: 'Match Facts' },
    { id: 'controls', label: 'Controls' },
    { id: 'leave', label: 'Leave Match' },
  ];
  let navIdx = 1;
  let section = 'team';

  const formationSVG = (name) => {
    const shape = SHAPES[name] || [];
    return `<svg class="form-mini" viewBox="0 0 60 92" aria-hidden="true">
      <rect x="1" y="1" width="58" height="90" rx="3" class="fm-pitch"/>
      <line x1="1" y1="46" x2="59" y2="46" class="fm-line"/>
      <circle cx="30" cy="46" r="8" class="fm-line" fill="none"/>
      ${shape.map((s) => {
        // shape x runs own-goal -> opponent goal; draw attacking upwards
        const cx = 4 + s.y * 52;
        const cy = 88 - s.x * 84;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.1"
                  class="fm-dot ${s.role === 'GK' ? 'gk' : ''}"/>`;
      }).join('')}
    </svg>`;
  };

  const panelFor = (id) => {
    const team = match.teams[match.human];
    if (id === 'team') {
      const seg = (key, opts) => `
        <div class="p-row">
          <span>${key === 'mentality' ? 'Mentality' : 'Pressing'}</span>
          <div class="seg">${opts.map((o) => `
            <button class="${team.tactics[key] === o ? 'on' : ''}"
                    data-tactic="${key}" data-val="${o}">${o[0].toUpperCase() + o.slice(1)}</button>`).join('')}
          </div>
        </div>`;
      return `
        <h3>Team Management</h3>
        <div class="p-forms">
          <div class="form-list">
            ${FORMATION_NAMES.map((f) => `
              <button class="form-opt ${team.formation === f ? 'on' : ''}" data-form="${f}">${f}</button>`).join('')}
          </div>
          <div class="form-preview">
            ${formationSVG(team.formation)}
            <span>${team.formation}</span>
          </div>
        </div>
        ${seg('mentality', ['defensive', 'balanced', 'attacking'])}
        ${seg('pressing', ['low', 'normal', 'high'])}
        <p class="p-note">Changes apply immediately — your shape shifts on the next touch.</p>`;
    }
    if (id === 'facts') {
      const [ph, pa] = match.possession();
      const [h, a] = match.teams;
      const rows = [
        ['Possession', `${ph}%`, `${pa}%`],
        ['Shots', h.shots, a.shots],
        ['On target', h.onTarget, a.onTarget],
        ['Goals', h.score, a.score],
      ];
      const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
        .sort((x, y) => x[1].minute - y[1].minute);
      return `
        <h3>Match Facts</h3>
        <div class="p-facts">
          ${rows.map(([k, x, y]) => `<div><b>${x}</b><span>${k}</span><b>${y}</b></div>`).join('')}
        </div>
        ${goals.length
          ? `<ul class="gm-goals">${goals.map(([t, s]) => `<li><i>${s.minute}'</i> ${s.name} <em>${t}</em></li>`).join('')}</ul>`
          : '<p class="p-note">No goals yet.</p>'}`;
    }
    if (id === 'controls') {
      return `
        <h3>Controls</h3>
        <div class="ctrl-grid compact">
          ${[['✕', 'Pass · tackle'], ['◯', 'Shoot — hold for power'], ['◯+R1', 'Curl it up'],
             ['□', 'Cross'], ['△', 'Through ball'], ['L1/R1', 'Switch to nearest'],
             ['R2', 'Sprint'], ['Options', 'Pause']]
            .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
        </div>`;
    }
    return '';
  };

  function paintPause() {
    const home = getClub(params.homeId);
    overlay.innerHTML = `
      <div class="pause">
        <div class="pause-head">
          ${crestSVG(home.crest, home.short, 26)}
          <span>Quick Match</span>
        </div>
        <nav class="pause-nav">
          ${PAUSE_ITEMS.map((it, i) => `
            <button class="pause-item ${i === navIdx ? 'on' : ''} ${it.id === section ? 'open' : ''}"
                    data-nav="${i}">${it.label}</button>`).join('')}
        </nav>
        <div class="pause-panel">${panelFor(section)}</div>
        <div class="pause-hints"><b>✕</b> Select <b>◯</b> Resume</div>
      </div>`;
  }

  function activate(id) {
    if (id === 'resume') { setPaused(false); return; }
    if (id === 'leave') { exitFullscreen(); navigate('quick'); return; }
    section = id;
    paintPause();
  }

  function setPaused(v) {
    paused = v;
    overlay.classList.toggle('is-pause', v);
    if (!v) { overlay.hidden = true; overlay.innerHTML = ''; return; }
    overlay.hidden = false;
    navIdx = Math.max(1, navIdx);
    paintPause();
  }

  function finish() {
    const [ph, pa] = match.possession();
    const [h, a] = match.teams;
    const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
      .sort((x, y) => x[1].minute - y[1].minute);

    // Apex Division matches settle the ladder instead of paying a flat fee
    let div = null;
    if (params.ultimate) {
      div = settleDivisionMatch({ scored: h.score, conceded: a.score });
    } else {
      update((s) => { s.club.coins += 300 + h.score * 80; });
    }
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
        ${div ? `
          <div class="div-result ${div.promoted ? 'up' : div.relegated ? 'down' : ''}">
            <span class="dr-kicker">${div.promoted ? 'Promoted' : div.relegated ? 'Relegated' : 'Apex Division'}</span>
            <b>${div.toDivision}</b>
            <span class="dr-reward">◈ ${div.coins.toLocaleString()}${div.packs.length ? ` · ${div.packs.length} pack${div.packs.length > 1 ? 's' : ''}` : ''}</span>
            ${div.objectivesDone.length
              ? `<ul class="dr-objs">${div.objectivesDone.map((t) => `<li>✓ ${t}</li>`).join('')}</ul>`
              : ''}
          </div>` : ''}
        <div class="gm-btns">
          ${div
            ? '<button class="btn primary" data-o="uxi">Back to Ultimate XI</button>'
            : '<button class="btn primary" data-o="again">Rematch</button>'}
          <button class="btn ghost" data-o="quit">Quit</button>
        </div>
      </div>`;
  }

  overlay.addEventListener('click', (e) => {
    const o = e.target.closest('[data-o]')?.dataset.o;
    if (o) {
      if (o === 'resume') setPaused(false);
      if (o === 'quit') { exitFullscreen(); navigate(params.ultimate ? 'squad' : 'quick'); }
      if (o === 'uxi') { exitFullscreen(); navigate('squad'); }
      if (o === 'again') navigate('play', params);
      return;
    }

    const nav = e.target.closest('[data-nav]');
    if (nav) { navIdx = +nav.dataset.nav; activate(PAUSE_ITEMS[navIdx].id); return; }

    const form = e.target.closest('[data-form]');
    if (form) { match.applyFormation(match.human, form.dataset.form); paintPause(); return; }

    const tac = e.target.closest('[data-tactic]');
    if (tac) { match.setTactic(match.human, tac.dataset.tactic, tac.dataset.val); paintPause(); }
  });

  root.querySelector('#gmPause').addEventListener('click', () => { if (!ended) setPaused(!paused); });

  return () => {
    cancelAnimationFrame(raf);
    stopCrowd();
    gl?.dispose();
    window.removeEventListener('resize', resize);
    document.removeEventListener('fullscreenchange', onFsChange);
    document.body.classList.remove('in-game');
    for (const inp of inputs) inp.destroy();
  };
}
