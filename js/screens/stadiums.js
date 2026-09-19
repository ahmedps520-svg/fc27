/**
 * The stadium showcase: every ground in the world, walked round in 3D.
 *
 * Pick a venue and the real match renderer builds it — same stadium
 * definitions, same atmosphere code — around a still match between its
 * club and a visitor, and a slow orbit camera goes round it. Time and
 * weather can be switched; the renderer is rebuilt for each, which is what
 * a match does anyway. Loaded lazily, disposed on the way out.
 */
import { navigate } from '../app.js';
import { getState } from '../state.js';
import { WORLD } from '../data/generator.js';
import { STADIUMS, stadiumFor, atmosphereFor, TIME_LABEL, WEATHER_LABEL } from '../data/stadiums.js';
import { Match } from '../game/sim.js';
import { makeCamera, orbitCamera, resolveQuality } from '../game/render3d.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { t } from '../i18n.js';

export const TITLE = 'Stadiums';

let pick = 'forge';
let time = 'night';
let weather = 'clear';

const clubOf = (st) => WORLD.clubs.find((c) => c.ground === st.name) || null;

export function render(params = {}) {
  if (params.stadium) pick = params.stadium;
  const st = STADIUMS.find((x) => x.id === pick) || STADIUMS[0];
  const club = clubOf(st);
  return `
    ${screenHead({ kicker: `${STADIUMS.length} grounds`, title: t('stadiums.title'), sub: t('stadiums.sub'), motif: 'pitch', tone: 'c' })}
    <div class="showcase">
      <div class="showcase-view">
        <canvas id="scCanvas"></canvas>
        <div class="showcase-cap">
          <b>${st.name}</b>
          <span>${club ? `${club.name} · ${club.league}` : 'Showpiece arena'} · ${st.capacity.toLocaleString()} · ${st.roof === 'none' ? 'open' : st.roof} roof · ${st.tiers === 2 ? 'two tiers' : 'one tier'}</span>
        </div>
        <p class="showcase-note" id="scNote">Loading the ground…</p>
      </div>
      <div class="showcase-opts">
        <div class="seg" id="scTime">${['day', 'dusk', 'night'].map((v) => `<button class="${time === v ? 'on' : ''}" data-time="${v}">${TIME_LABEL[v]}</button>`).join('')}</div>
        <div class="seg" id="scWeather">${['clear', 'overcast', 'rain'].map((v) => `<button class="${weather === v ? 'on' : ''}" data-weather="${v}">${WEATHER_LABEL[v]}</button>`).join('')}</div>
        ${club ? `<button class="btn primary" id="scPlay">${t('stadiums.playhere')}</button>` : ''}
      </div>
      <div class="showcase-list">
        ${STADIUMS.map((x) => {
          const c = clubOf(x);
          return `<button class="sc-item ${x.id === pick ? 'on' : ''}" data-stadium="${x.id}" style="--team:${x.seats[0]}">
            ${c ? crestSVG(c.crest, c.short, 26) : '<span class="sc-star">★</span>'}
            <b>${x.name}</b><span>${(x.capacity / 1000).toFixed(0)}k · ${c ? c.short : 'arena'}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

export function mount(root) {
  const canvas = root.querySelector('#scCanvas');
  const note = root.querySelector('#scNote');
  let gl = null; let raf = 0; let alive = true; let t = 0; let last = performance.now();
  const cam = makeCamera();
  const st = STADIUMS.find((x) => x.id === pick) || STADIUMS[0];
  const club = clubOf(st) || WORLD.clubs[0];
  const away = WORLD.clubs.find((c) => c.id !== club.id);
  const match = new Match(club.id, away.id, { duration: 60, human: null });
  match.venue = { stadium: st, atmo: atmosphereFor('showcase', { time, weather }) };
  const quality = resolveQuality(getState().settings.quality);
  const size = () => {
    const w = canvas.clientWidth || 640; const h = canvas.clientHeight || 360;
    gl?.resize(w, h);
  };
  import('../game/renderGL.js').then((m) => {
    if (!alive) return;
    try { gl = m.createRenderer(canvas, match, quality, false); } catch (e) { note.textContent = 'This device could not open the 3D view.'; return; }
    size();
    gl.tifo(true);
    note.hidden = true;
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      orbitCamera(cam, t, 36 + st.size * 14, 12 + st.size * 12, 0.12);
      gl.render(match, cam, dt);
    };
    raf = requestAnimationFrame(frame);
  }).catch(() => { note.textContent = 'WebGL is not available here.'; });
  window.addEventListener('resize', size);

  root.querySelectorAll('[data-stadium]').forEach((b) => b.addEventListener('click', () => { pick = b.dataset.stadium; navigate('stadiums'); }));
  root.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', () => { time = b.dataset.time; navigate('stadiums'); }));
  root.querySelectorAll('[data-weather]').forEach((b) => b.addEventListener('click', () => { weather = b.dataset.weather; navigate('stadiums'); }));
  root.querySelector('#scPlay')?.addEventListener('click', () => {
    navigate('play', { homeId: club.id, awayId: away.id, duration: 240, skill: 1, mode: 'single', atmo: { time, weather } });
  });
  return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', size); try { gl?.dispose(); } catch { /* gone */ } };
}
