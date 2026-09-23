/**
 * The Grounds gallery (v78; the stadium showcase since v71).
 *
 * Every ground in the world, grouped the way a supporter would group them —
 * community, town, bowl, arena, and the showpiece grounds — each with its
 * story: capacity, the year it opened and its record crowd (all invented,
 * like the grounds), its floodlights, its goals, how it is mown and what is
 * outside it. The real match renderer builds the chosen ground around a still
 * match; a slow orbit shows it off, or switch to Fly and go wherever you like
 * — drag to look, scroll or pinch to move, WASD and Q/E on a keyboard. Time,
 * weather and a winter night can be switched; the renderer is rebuilt for
 * each, which is what a match does anyway. Loaded lazily, disposed on the way
 * out.
 */
import { navigate } from '../app.js';
import { getState } from '../state.js';
import { WORLD } from '../data/generator.js';
import { STADIUMS, atmosphereFor, TIME_LABEL, WEATHER_LABEL } from '../data/stadiums.js';
import { GROUND_CLASSES, groundProfile } from '../data/grounds.js';
import { Match } from '../game/sim.js';
import { makeCamera, orbitCamera, resolveQuality } from '../game/render3d.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { t } from '../i18n.js';

export const TITLE = 'Grounds';

let pick = 'forge';
let time = 'night';
let weather = 'clear';
let winter = false;
let filter = 'all';
let camMode = 'orbit';          // orbit | aerial | fly

const clubOf = (st) => WORLD.clubs.find((c) => c.ground === st.name) || null;
const classOf = (st) => (st.showpiece || st.wonder ? 'showpiece' : groundProfile(st).klass);
const FILTERS = [['all', 'All'], ...GROUND_CLASSES.map((c) => [c.id, c.name]), ['showpiece', 'Showpiece']];
const LAND = { city: 'City skyline', suburbs: 'Suburbs', coast: 'Coast', mountains: 'Mountains', desert: 'Desert' };
const LIGHTS = { rim: 'Roof ring', lattice: 'Four corner pylons', side: 'Masts down the side', mast: 'Roof masts' };
const GOALS = { box: 'Box frame', deep: 'Deep net', stanchion: 'Stanchion' };

export function render(params = {}) {
  if (params.stadium) pick = params.stadium;
  const st = STADIUMS.find((x) => x.id === pick) || STADIUMS[0];
  const club = clubOf(st);
  const pr = groundProfile(st, club ? { id: club.id, name: club.name } : null);
  const list = STADIUMS.filter((x) => filter === 'all' || classOf(x) === filter);
  const klassName = classOf(st) === 'showpiece' ? 'Showpiece' : (GROUND_CLASSES.find((c) => c.id === pr.klass)?.name || '');
  const stat = (k, v) => `<div class="gr-stat"><span>${k}</span><b>${v}</b></div>`;
  return `
    ${screenHead({ kicker: `${STADIUMS.length} grounds`, title: t('stadiums.title'), sub: t('stadiums.sub'), motif: 'pitch', tone: 'c' })}
    <div class="showcase">
      <div class="showcase-view" id="scView">
        <canvas id="scCanvas"></canvas>
        <div class="showcase-cap">
          <b>${st.name}</b>
          <span>${club ? `${club.name} · ${club.league}` : 'Showpiece ground'} · ${klassName}</span>
        </div>
        <div class="seg gr-cam" id="scCam">
          <button class="${camMode === 'orbit' ? 'on' : ''}" data-cam="orbit">Orbit</button>
          <button class="${camMode === 'aerial' ? 'on' : ''}" data-cam="aerial">Aerial</button>
          <button class="${camMode === 'fly' ? 'on' : ''}" data-cam="fly">Fly</button>
        </div>
        <p class="gr-hint" id="scHint" ${camMode === 'fly' ? '' : 'hidden'}>Drag to look · scroll or pinch to move · WASD, Q/E</p>
        <p class="showcase-note" id="scNote">Loading the ground…</p>
      </div>
      <div class="gr-stats">
        ${stat('Capacity', st.capacity.toLocaleString())}
        ${stat('Opened', pr.opened)}
        ${stat('Record crowd', `${pr.record.toLocaleString()} <i>(${pr.recordYear})</i>`)}
        ${stat('Floodlights', LIGHTS[pr.floodlights] || pr.floodlights)}
        ${stat('Goals', GOALS[pr.goalStyle])}
        ${stat('Mowing', pr.pattern[0].toUpperCase() + pr.pattern.slice(1))}
        ${stat('Outside', LAND[pr.landscape] || pr.landscape)}
        ${stat('Roof', st.roof === 'none' ? 'Open' : st.roof[0].toUpperCase() + st.roof.slice(1))}
      </div>
      <div class="showcase-opts">
        <div class="seg" id="scTime">${['day', 'dusk', 'night'].map((v) => `<button class="${time === v ? 'on' : ''}" data-time="${v}">${TIME_LABEL[v]}</button>`).join('')}</div>
        <div class="seg" id="scWeather">${['clear', 'overcast', 'rain', 'snow'].map((v) => `<button class="${weather === v ? 'on' : ''}" data-weather="${v}">${WEATHER_LABEL[v]}</button>`).join('')}</div>
        <button class="btn ghost ${winter ? 'on' : ''}" id="scWinter" aria-pressed="${winter}">❄ Winter night</button>
        ${club ? `<button class="btn primary" id="scPlay">${t('stadiums.playhere')}</button>` : ''}
        <button class="btn ghost" id="scBuild">Design your own →</button>
      </div>
      <div class="seg gr-filter" id="scFilter">${FILTERS.map(([id, label]) => `<button class="${filter === id ? 'on' : ''}" data-filter="${id}">${label}</button>`).join('')}</div>
      <div class="showcase-list">
        ${list.map((x) => {
          const c = clubOf(x);
          return `<button class="sc-item ${x.id === pick ? 'on' : ''}" data-stadium="${x.id}" style="--team:${x.seats[0]}">
            ${c ? crestSVG(c.crest, c.short, 26) : '<span class="sc-star">★</span>'}
            <b>${x.name}</b><span>${x.capacity >= 10000 ? `${(x.capacity / 1000).toFixed(0)}k` : x.capacity.toLocaleString()} · ${c ? c.short : 'showpiece'}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

/** A free-flying camera: yaw/pitch and a position, turned into the renderer's pose. */
function flyRig(start) {
  const s = { x: start.x, y: start.y, z: start.z, yaw: Math.atan2(start.ty - start.y, start.tx - start.x), pitch: Math.atan2(start.tz - start.z, Math.hypot(start.tx - start.x, start.ty - start.y)) };
  return {
    s,
    look(dx, dy) { s.yaw -= dx * 0.005; s.pitch = Math.max(-1.35, Math.min(0.9, s.pitch - dy * 0.004)); },
    move(fwd, side = 0, up = 0) {
      const cx = Math.cos(s.yaw); const cy = Math.sin(s.yaw);
      s.x += cx * fwd * Math.cos(s.pitch) - cy * side; s.y += cy * fwd * Math.cos(s.pitch) + cx * side; s.z += fwd * Math.sin(s.pitch) + up;
      s.x = Math.max(-260, Math.min(365, s.x)); s.y = Math.max(-260, Math.min(330, s.y)); s.z = Math.max(0.8, Math.min(160, s.z));
    },
    pose(cam) {
      cam.x = s.x; cam.y = s.y; cam.z = s.z;
      cam.tx = s.x + Math.cos(s.yaw) * Math.cos(s.pitch) * 10; cam.ty = s.y + Math.sin(s.yaw) * Math.cos(s.pitch) * 10; cam.tz = s.z + Math.sin(s.pitch) * 10;
      cam.hfov = 60;
    },
  };
}

export function mount(root) {
  const canvas = root.querySelector('#scCanvas');
  const view = root.querySelector('#scView');
  const note = root.querySelector('#scNote');
  let gl = null; let raf = 0; let alive = true; let tt = 0; let last = performance.now();
  const cam = makeCamera();
  const st = STADIUMS.find((x) => x.id === pick) || STADIUMS[0];
  const club = clubOf(st) || WORLD.clubs[0];
  const away = WORLD.clubs.find((c) => c.id !== club.id);
  const match = new Match(club.id, away.id, { duration: 60, human: null });
  const atmo = atmosphereFor('showcase', { time: winter ? 'night' : time, weather: winter ? 'clear' : weather });
  if (winter) atmo.frost = weather !== 'snow';
  if (winter && weather === 'snow') atmo.weather = 'snow';
  match.venue = { stadium: { ...st, host: clubOf(st) ? { id: club.id, name: club.name } : null }, atmo, seasonWear: winter ? 0.6 : 0.25 };
  const quality = resolveQuality(getState().settings.quality);
  const size = () => { gl?.resize(canvas.clientWidth || 640, canvas.clientHeight || 360); };

  // the fly camera starts where the orbit is
  orbitCamera(cam, 0, 36 + st.size * 14, 12 + st.size * 12, 0.12);
  const fly = flyRig(cam);
  const keys = new Set();
  const onKey = (e) => { if (camMode !== 'fly') return; if (/^(Key[WASDQE]|Arrow)/.test(e.code)) { e.preventDefault(); if (e.type === 'keydown') keys.add(e.code); else keys.delete(e.code); } };
  window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
  const pts = new Map(); let pinch = 0;
  view.addEventListener('pointerdown', (e) => { if (camMode !== 'fly' || e.target.closest('button')) return; try { view.setPointerCapture?.(e.pointerId); } catch { /* gone */ } pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
  view.addEventListener('pointermove', (e) => {
    const p = pts.get(e.pointerId); if (!p || camMode !== 'fly') return;
    if (pts.size === 1) fly.look(e.clientX - p.x, e.clientY - p.y);
    else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) fly.move((d - pinch) * 0.08);
      pinch = d;
    }
    p.x = e.clientX; p.y = e.clientY;
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
  view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
  view.addEventListener('wheel', (e) => { if (camMode !== 'fly') return; e.preventDefault(); fly.move(-e.deltaY * 0.03); }, { passive: false });

  import('../game/renderGL.js').then((m) => {
    if (!alive) return;
    try { gl = m.createRenderer(canvas, match, quality, false); } catch { note.textContent = 'This device could not open the 3D view.'; return; }
    size();
    gl.tifo(true);
    note.hidden = true;
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; tt += dt;
      if (camMode === 'fly') {
        const sp = (keys.has('ShiftLeft') ? 40 : 16) * dt;
        const k = (c) => (keys.has(c) ? 1 : 0);
        fly.move((k('KeyW') + k('ArrowUp') - k('KeyS') - k('ArrowDown')) * sp, (k('KeyA') + k('ArrowLeft') - k('KeyD') - k('ArrowRight')) * sp, (k('KeyE') - k('KeyQ')) * sp);
        fly.pose(cam);
      } else if (camMode === 'aerial') {
        // high and wide: the ground in the land round it — the streets, the hills, the sea
        orbitCamera(cam, tt, 170 + st.size * 40, 70 + st.size * 22, 0.05);
        cam.tz = 0; cam.hfov = 58;
      } else orbitCamera(cam, tt, 36 + st.size * 14, 12 + st.size * 12, 0.12);
      gl.render(match, cam, dt);
    };
    raf = requestAnimationFrame(frame);
  }).catch(() => { note.textContent = 'WebGL is not available here.'; });
  window.addEventListener('resize', size);

  root.querySelectorAll('[data-stadium]').forEach((b) => b.addEventListener('click', () => { pick = b.dataset.stadium; navigate('stadiums'); }));
  root.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', () => { time = b.dataset.time; winter = false; navigate('stadiums'); }));
  root.querySelectorAll('[data-weather]').forEach((b) => b.addEventListener('click', () => { weather = b.dataset.weather; navigate('stadiums'); }));
  root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; navigate('stadiums'); }));
  root.querySelector('#scWinter')?.addEventListener('click', () => { winter = !winter; navigate('stadiums'); });
  root.querySelectorAll('[data-cam]').forEach((b) => b.addEventListener('click', () => {
    camMode = b.dataset.cam;
    root.querySelectorAll('[data-cam]').forEach((x) => x.classList.toggle('on', x === b));
    root.querySelector('#scHint').hidden = camMode !== 'fly';
    if (camMode === 'fly') { const f = flyRig(cam); Object.assign(fly.s, f.s); }
  }));
  root.querySelector('#scBuild')?.addEventListener('click', () => navigate('builder'));
  root.querySelector('#scPlay')?.addEventListener('click', () => {
    navigate('play', { homeId: club.id, awayId: away.id, duration: 240, skill: 1, mode: 'single', atmo: { time, weather } });
  });
  return () => {
    alive = false; cancelAnimationFrame(raf);
    window.removeEventListener('resize', size); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
    try { gl?.dispose(); } catch { /* gone */ }
  };
}
