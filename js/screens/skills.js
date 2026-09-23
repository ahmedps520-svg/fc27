/**
 * Skills & Practice (v82): the four skill games with leaderboards, a
 * stand-alone penalty shootout, and the practice arena (free roam and
 * set-piece training in a real match engine).
 */
import { getState, update } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { screenHead } from '../components/screenHead.js';
import { Input } from '../game/input.js';
import { DRILLS, createDrill, step, draw } from '../game/drills.js';
import { runShootout } from './shootout.js';
import { WORLD } from '../data/generator.js';
import { enterFullscreen } from '../fullscreen.js';
import * as api from '../net/api.js';

export const TITLE = 'Skills';
let tab = 'drills';
let running = null;
let penClub = null;
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bests = () => getState().skills?.best || {};

export function render() {
  const NAV = [['drills', 'Skill games'], ['pens', 'Penalty shootout'], ['practice', 'Practice arena']];
  return `
    ${screenHead({ kicker: 'Quick modes', title: 'Skills & Practice', sub: 'Drills with leaderboards, a shootout, and a pitch to yourself.', motif: 'season', tone: 'c' })}
    <nav class="cnav" id="skTabs">${NAV.map(([id, l]) => `<button class="cnav-b ${tab === id ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('')}</nav>
    ${tab === 'pens' ? pensHTML() : tab === 'practice' ? practiceHTML() : drillsHTML()}
    <div class="drill-stage" id="drillStage" hidden></div>`;
}

function drillsHTML() {
  const b = bests();
  return `<div class="sk-grid">${DRILLS.map((d) => `
    <section class="panel glass sk-card">
      <header class="panel-head"><h2>${d.name}</h2><span class="tag">Best ${b[d.id] ?? '–'}</span></header>
      <p class="hint">${d.blurb}</p>
      <ol class="sk-board" data-board="${d.id}"><li class="empty">${api.isSignedIn() ? 'Loading the board…' : 'Sign in (Ultimate XI → Online) to post to the board.'}</li></ol>
      <button class="btn primary" data-drill="${d.id}">Play</button>
    </section>`).join('')}</div>
    <p class="hint">Keyboard: WASD or arrows to move and aim, K (or Space) to strike — hold longer for power. Pad: left stick and ○/✕. Touch: the pad and the button on screen.</p>`;
}

function pensHTML() {
  const clubs = WORLD.clubs.slice(0, 40);
  penClub = penClub || clubs[0].id;
  return `<section class="panel glass">
    <header class="panel-head"><h2>Penalty shootout</h2></header>
    <p class="hint">Five each, then sudden death. Stop the marker to place your kick; the keeper guesses.</p>
    <label class="field"><span>Your side</span><select id="penClub">${clubs.map((c) => `<option value="${c.id}" ${c.id === penClub ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
    <button class="btn primary big" id="penGo">Take the walk</button>
    <div id="penStage"></div>
  </section>`;
}

function practiceHTML() {
  return `<section class="panel glass">
    <header class="panel-head"><h2>Practice arena</h2></header>
    <p class="hint">Your team on a full pitch against a keeper and nobody else. No clock, no offside. Free-roam, or stage a set piece from the pause menu: a free kick where you stand, a penalty, a corner.</p>
    <div class="offer-actions">
      <button class="btn primary big" data-practice="free">Free roam</button>
      <button class="btn" data-practice="freekick">Free kicks</button>
      <button class="btn" data-practice="penalty">Penalties</button>
      <button class="btn" data-practice="corner">Corners</button>
    </div>
  </section>`;
}

export function mount(root) {
  const rerender = () => navigate('skills');
  root.querySelectorAll('#skTabs [data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  // boards
  if (tab === 'drills' && api.isSignedIn()) {
    for (const el of root.querySelectorAll('[data-board]')) {
      api.skillBoard(el.dataset.board).then((d) => {
        el.innerHTML = d.rows?.length ? d.rows.slice(0, 5).map((r, i) => `<li><i>${i + 1}</i><b>${esc(r.name)}</b><em>${r.score}</em></li>`).join('') : '<li class="empty">Nobody on the board yet.</li>';
      }).catch(() => { el.innerHTML = '<li class="empty">Offline — the board needs a connection.</li>'; });
    }
  }
  root.querySelectorAll('[data-drill]').forEach((b) => b.addEventListener('click', () => playDrill(root, b.dataset.drill)));
  root.querySelector('#penClub')?.addEventListener('change', (e) => { penClub = e.target.value; });
  root.querySelector('#penGo')?.addEventListener('click', () => {
    const mine = WORLD.clubsById[penClub] || WORLD.clubs[0];
    const opp = WORLD.clubs.filter((c) => c.id !== mine.id)[Math.floor(Math.random() * 39)];
    const sq = (c) => { const xi = c.roster.map((id) => WORLD.playersById[id]).sort((a, b) => b.overall - a.overall).slice(0, 11); return { name: c.name, short: c.short, xi, keeper: xi.find((p) => p.position === 'GK') || xi[0] }; };
    const stage = root.querySelector('#penStage');
    stage.innerHTML = '<div class="gm-panel glass"></div>';
    runShootout(stage.querySelector('.gm-panel'), { home: sq(mine), away: sq(opp), youAre: 0 }).then(({ winner, home, away }) => {
      const won = winner === 0;
      update((s) => { s.club.apex += won ? 300 : 100; });
      refreshCoins();
      stage.innerHTML = `<p class="lede">${won ? 'You win' : 'You lose'} ${home}–${away} on penalties. ◈ ${won ? 300 : 100}.</p>`;
    });
  });
  root.querySelectorAll('[data-practice]').forEach((b) => b.addEventListener('click', () => {
    enterFullscreen();
    navigate('play', { mode: 'single', homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, duration: 24 * 3600, skill: 0.6, practice: { focus: b.dataset.practice } });
  }));
  return () => { stopDrill(); document.body.classList.remove('in-drill'); };
}

/* ------------------------------ a drill ------------------------------ */
function stopDrill() {
  if (!running) return;
  cancelAnimationFrame(running.raf);
  running.input.destroy();
  running.cleanup?.();
  running = null;
}
function playDrill(root, id) {
  stopDrill();
  const stage = root.querySelector('#drillStage');
  stage.hidden = false;
  document.body.classList.add('in-drill');
  stage.innerHTML = `
    <div class="drill-top"><b>${DRILLS.find((d) => d.id === id).name}</b><span id="drillHud"></span><button class="btn ghost" id="drillQuit">Quit</button></div>
    <canvas id="drillCv" aria-label="Skill game"></canvas>
    <div class="drill-msgs" id="drillMsgs" aria-live="polite"></div>
    <div class="drill-touch"><div class="drill-pad" id="drillPad"><i></i></div><button class="drill-btn" id="drillBtn">STRIKE</button></div>
    <div class="drill-end" id="drillEnd" hidden></div>`;
  const cv = stage.querySelector('#drillCv'); const g = cv.getContext('2d');
  const hud = stage.querySelector('#drillHud'); const msgs = stage.querySelector('#drillMsgs');
  const input = new Input({ keys: 'primary' });
  const d = createDrill(id);
  let charge = 0; let wasHeld = false; let last = performance.now();
  // touch: a pad on the left, a strike button on the right
  const pad = stage.querySelector('#drillPad'); const knob = pad.querySelector('i');
  const onPad = (e) => {
    const r = pad.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e;
    const x = ((t.clientX - r.left) / r.width - 0.5) * 2; const y = ((t.clientY - r.top) / r.height - 0.5) * 2; const m = Math.max(1, Math.hypot(x, y));
    input.setTouchVec(x / m, y / m); knob.style.transform = `translate(${(x / m) * 28}px, ${(y / m) * 28}px)`;
  };
  const offPad = () => { input.setTouchVec(0, 0); knob.style.transform = ''; };
  pad.addEventListener('pointerdown', (e) => { pad.setPointerCapture(e.pointerId); onPad(e); });
  pad.addEventListener('pointermove', (e) => { if (e.buttons) onPad(e); });
  pad.addEventListener('pointerup', offPad); pad.addEventListener('pointercancel', offPad);
  const btn = stage.querySelector('#drillBtn');
  btn.addEventListener('pointerdown', () => input.setTouchButton('shoot', true));
  btn.addEventListener('pointerup', () => input.setTouchButton('shoot', false));
  btn.addEventListener('pointercancel', () => input.setTouchButton('shoot', false));
  const fit = () => { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit(); addEventListener('resize', fit);
  const loop = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    input.poll(dt);
    const held = input.held('shoot') || input.held('pass');
    if (held) charge = Math.min(1.05, charge + dt * 0.9);
    const released = wasHeld && !held;
    const ax = input.axis();
    step(d, dt, { ax: ax.x, ay: ax.y, sprint: input.held('sprint'), released, power: charge });
    if (released) charge = 0;
    wasHeld = held;
    const r = cv.getBoundingClientRect();
    draw(g, d, r.width, r.height, { charging: held, power: Math.min(1, charge) });
    hud.textContent = `${d.score} pts · ${d.id === 'passing' ? `${Math.max(0, Math.ceil(d.limit - d.t))} s` : d.id === 'slalom' ? `${(d.t + d.penalty).toFixed(1)} s` : d.id === 'freekicks' ? `kick ${Math.min(d.kicks, d.kick + 1)}/${d.kicks}` : `cross ${Math.min(d.crosses, d.cross + 1)}/${d.crosses}`}`;
    msgs.innerHTML = d.msgs.filter((m) => d.t - m.t < 2.5).map((m) => `<span>${esc(m.text)}</span>`).join('');
    if (d.done) return finishDrill(stage, d);
    running.raf = requestAnimationFrame(loop);
  };
  running = { input, raf: requestAnimationFrame(loop), cleanup: () => removeEventListener('resize', fit) };
  stage.querySelector('#drillQuit').addEventListener('click', () => { stopDrill(); stage.hidden = true; stage.innerHTML = ''; document.body.classList.remove('in-drill'); });
}
function finishDrill(stage, d) {
  const prev = bests()[d.id] || 0;
  const best = Math.max(prev, d.score);
  update((s) => { s.skills = s.skills || { best: {} }; s.skills.best[d.id] = best; s.club.apex += Math.round(d.score / 10); });
  refreshCoins();
  if (api.isSignedIn() && d.score > 0) api.postSkill(d.id, d.score).catch(() => {});
  const end = stage.querySelector('#drillEnd');
  end.hidden = false;
  end.innerHTML = `<div class="gm-panel glass"><span class="gm-ft">${d.score > prev ? 'New best!' : 'Drill complete'}</span>
    <b class="drill-score">${d.score}</b><p class="hint">${esc(d.result || '')} · ◈ ${Math.round(d.score / 10)}</p>
    <div class="offer-actions"><button class="btn primary" data-again="${d.id}">Again</button><button class="btn ghost" data-close>Done</button></div></div>`;
  end.querySelector('[data-again]').addEventListener('click', () => { const root = stage.parentElement; playDrill(root, d.id); });
  end.querySelector('[data-close]').addEventListener('click', () => { stopDrill(); navigate('skills'); });
  running.input.destroy(); running.cleanup?.(); running = null;
}
