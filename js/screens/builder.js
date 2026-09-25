/**
 * The Stadium Builder — the screen.
 *
 * Left, the ground in 3D: the real match renderer building the design
 * live, on a slow orbit, in whichever light you pick. Right, the choices.
 * Every change rebuilds the renderer (a few hundred milliseconds, the same
 * as a match does) — debounced, so dragging the capacity slider does not
 * build fifty stadiums.
 *
 * The design is saved into the club (`club.stadium.design`) with "Use as my
 * ground"; up to eight more sit in `club.stadium.saved`. A share code is the
 * design's choices and colours — no text — and loading one keeps *your*
 * club's name in the seats. See builder.js for the rules.
 */
import { navigate, toast } from '../app.js';
import { getState, update } from '../state.js';
import { WORLD } from '../data/generator.js';
import { atmosphereFor, TIME_LABEL } from '../data/stadiums.js';
import { Match } from '../game/sim.js';
import { makeCamera, orbitCamera, resolveQuality, deviceClass } from '../game/render3d.js';
import { screenHead } from '../components/screenHead.js';
import { clubIdentity } from './squad.js';
import { careerClub } from '../career.js';
import { sfx } from '../audio.js';
import { t } from '../i18n.js';
import * as B from '../builder.js';

export const TITLE = 'Stadium Builder';

let design = null;          // the one being edited (not yet saved)
let time = 'dusk';
let target = 'club';        // 'club' = Ultimate XI, 'career' = the career club's ground (v73: one design each)

/* Who the ground is for. The Ultimate XI club has its identity; the career
   club has a name and colours of its own, and its design lives on the career
   slice so a new career starts from the club's real colours, not yours. */
const careerClubInfo = () => {
  const car = getState().career;
  if (!car) return null;
  const c = careerClub(car.clubId);
  return c ? { name: c.name, short: c.short, colors: c.crest?.colors || c.colors || ['#41d3ff', '#0b1020'] } : null;
};
const me = () => (target === 'career' && careerClubInfo()) || { ...clubIdentity(), colors: clubIdentity().crest.colors };
const savedDesign = () => (target === 'career' ? getState().career?.ground?.design : getState().club.stadium?.design);
const current = () => design || (design = B.normalise(savedDesign() || B.defaultDesign(me().colors), me().colors));
const seg = (key, list, val, labels) => `<div class="seg bld-seg" data-key="${key}">${list.map((v) => `<button class="${String(val) === String(v) ? 'on' : ''}" data-val="${v}">${labels ? labels[v] : v}</button>`).join('')}</div>`;

export function render(params = {}) {
  if (params.target && params.target !== target) { target = params.target === 'career' && careerClubInfo() ? 'career' : 'club'; design = null; }
  const d = current();
  const id = me();
  const st = B.toDef(d, { clubName: id.name, short: id.short });
  const saved = getState().club.stadium?.saved || [];
  const home = savedDesign();
  const isHome = home && B.encode(home) === B.encode(d);
  const career = careerClubInfo();
  return `
    ${screenHead({ kicker: t('builder.kicker'), title: t('builder.title'), sub: t('builder.sub'), motif: 'pitch', tone: 'c' })}
    <div class="builder">
      <div class="showcase-view bld-view">
        <canvas id="bldCanvas"></canvas>
        <div class="showcase-cap">
          <b id="bldName">${st.name}</b>
          <span id="bldFacts">${st.capacity.toLocaleString()} · ${d.tiers} tier${d.tiers > 1 ? 's' : ''} · ${B.LABELS.roof[d.roof].toLowerCase()} · ${B.LABELS.landscape[d.landscape].toLowerCase()}</span>
        </div>
        <p class="showcase-note" id="bldNote">${t('builder.building')}</p>
        <div class="seg bld-time">${['day', 'dusk', 'night'].map((v) => `<button class="${time === v ? 'on' : ''}" data-time="${v}">${TIME_LABEL[v]}</button>`).join('')}</div>
      </div>

      <div class="bld-panel glass">
        ${career ? `<div class="bld-row"><span>${t('builder.for')}</span><div class="seg bld-target">
          <button class="${target === 'club' ? 'on' : ''}" data-target="club">${clubIdentity().name}</button>
          <button class="${target === 'career' ? 'on' : ''}" data-target="career">${career.name} · Career</button>
        </div></div>` : ''}
        <label class="bld-row"><span>${t('builder.name')}</span>
          <span class="bld-name"><b>${id.name}</b>
            <select id="bldSuffix">${B.SUFFIXES.map((s, i) => `<option value="${i}" ${i === d.suffix ? 'selected' : ''}>${s}</option>`).join('')}</select>
          </span>
        </label>
        <label class="bld-row"><span>${t('builder.capacity')} <b id="bldCapOut">${d.capacity.toLocaleString()}</b></span>
          <input type="range" id="bldCap" min="${B.CAP_MIN}" max="${B.CAP_MAX}" step="${B.CAP_STEP}" value="${d.capacity}">
        </label>
        <div class="bld-row"><span>${t('builder.tiers')}</span>${seg('tiers', B.TIERS, d.tiers)}</div>
        <div class="bld-row"><span>${t('builder.corners')}</span>${seg('bowl', B.BOWLS, d.bowl, B.LABELS.bowl)}</div>
        <div class="bld-row"><span>${t('builder.roof')}</span>${seg('roof', B.ROOFS, d.roof, B.LABELS.roof)}</div>
        <div class="bld-row"><span>${t('builder.lights')}</span>${seg('pylons', B.PYLONS, d.pylons, B.LABELS.pylons)}</div>
        <div class="bld-row"><span>${t('builder.pitch')}</span>${seg('pattern', B.PATTERNS, d.pattern, B.LABELS.pattern)}</div>
        <div class="bld-row"><span>${t('builder.colours')}</span>
          <span class="bld-colours">
            <label>${t('builder.seats')} <input type="color" data-colour="seats0" value="${d.seats[0]}"></label>
            <label>${t('builder.seats')} <input type="color" data-colour="seats1" value="${d.seats[1]}"></label>
            <label>${t('builder.facadeColour')} <input type="color" data-colour="facade" value="${d.facade}"></label>
            <button class="btn ghost sm" id="bldClubColours">${t('builder.clubColours')}</button>
          </span>
        </div>
        <div class="bld-row"><span>${t('builder.facade')}</span>${seg('facadeStyle', B.FACADES, d.facadeStyle, B.LABELS.facade)}</div>
        <div class="bld-row"><span>${t('builder.landscape')}</span>${seg('landscape', B.LANDSCAPES, d.landscape, B.LABELS.landscape)}</div>
        <label class="bld-row bld-check"><span>${t('builder.lettering')}</span><input type="checkbox" id="bldLetters" ${d.lettering ? 'checked' : ''}> <em>${id.name.toUpperCase().slice(0, 14)} ${t('builder.lettering.sub')}</em></label>

        <div class="bld-actions">
          <button class="btn primary" id="bldUse" ${isHome ? 'disabled' : ''}>${isHome ? t('builder.isHome') : t('builder.use')}</button>
          <button class="btn ghost" id="bldSave" ${saved.length >= 8 ? 'disabled' : ''}>${t('builder.save')}${saved.length >= 8 ? ' (8/8)' : ''}</button>
          <button class="btn ghost" id="bldShare">${t('builder.share')}</button>
          <button class="btn ghost" id="bldReset">${t('builder.reset')}</button>
        </div>
        <p class="bld-code" id="bldCode" hidden></p>
        <div class="bld-load">
          <input id="bldIn" placeholder="SB1-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" maxlength="40" aria-label="Share code" spellcheck="false">
          <button class="btn ghost" id="bldLoad">${t('builder.load')}</button>
        </div>
        ${saved.length ? `
          <span class="ol-kicker">${t('builder.saved')}</span>
          <div class="bld-saved">${saved.map((s, i) => `
            <div class="bld-savedrow" style="--a:${s.design.seats[0]};--b:${s.design.seats[1]}">
              <i></i><b>${B.groundName(s.design, id.name)}</b><span>${s.design.capacity.toLocaleString()} · ${s.design.tiers}t · ${B.LABELS.landscape[s.design.landscape]}</span>
              <button class="btn ghost sm" data-load="${i}">${t('builder.open')}</button><button class="icon-btn sm" data-del="${i}" title="Delete">✕</button>
            </div>`).join('')}</div>` : ''}
        <p class="hint">${t('builder.hint')}</p>
      </div>
    </div>`;
}

export function mount(root) {
  const canvas = root.querySelector('#bldCanvas');
  const note = root.querySelector('#bldNote');
  let gl = null; let raf = 0; let alive = true; let clock = 0; let last = performance.now();
  let building = false; let dirty = false; let buildTimer = 0;
  const cam = makeCamera();
  const home = WORLD.clubs[0]; const away = WORLD.clubs[1];
  const match = new Match(home.id, away.id, { duration: 60, human: null });
  // the builder is a workshop, not a benchmark: Ultra rebuilds are slow and this is rebuilt on every change
  const q = resolveQuality(getState().settings.quality);
  // a phone rebuilds this scene on every slider tick; at High that emptied an iPhone's GPU memory and Safari reloaded the page
  const quality = deviceClass() === 'phone' ? 'low' : q === 'ultra' || q === 'cinema' ? 'high' : q;
  let mod = null;

  const size = () => { const w = canvas.clientWidth || 640; const h = canvas.clientHeight || 360; gl?.resize(w, h); };
  const build = () => {
    if (!alive || !mod) return;
    if (building) { dirty = true; return; }
    building = true;
    const d = current(); const id = me();
    match.venue = { stadium: B.toDef(d, { clubName: id.name, short: id.short }), atmo: atmosphereFor('builder', { time, weather: 'clear' }) };
    // v88: same canvas, so keep its context alive for the renderer that follows
    try { gl?.dispose({ keepContext: true }); } catch { /* gone */ }
    try { gl = mod.createRenderer(canvas, match, quality, false); } catch (e) { note.hidden = false; note.textContent = 'This device could not open the 3D view.'; building = false; return; }
    size();
    note.hidden = true;
    building = false;
    if (dirty) { dirty = false; scheduleBuild(); }
  };
  const scheduleBuild = () => { clearTimeout(buildTimer); buildTimer = setTimeout(build, 260); };
  const paintFacts = () => {
    const d = current(); const id = me(); const st = B.toDef(d, { clubName: id.name, short: id.short });
    root.querySelector('#bldName').textContent = st.name;
    root.querySelector('#bldFacts').textContent = `${st.capacity.toLocaleString()} · ${d.tiers} tier${d.tiers > 1 ? 's' : ''} · ${B.LABELS.roof[d.roof].toLowerCase()} · ${B.LABELS.landscape[d.landscape].toLowerCase()}`;
    root.querySelector('#bldCapOut').textContent = d.capacity.toLocaleString();
    const useBtn = root.querySelector('#bldUse');
    const homeD = savedDesign();
    const isHome = homeD && B.encode(homeD) === B.encode(d);
    useBtn.disabled = !!isHome; useBtn.textContent = isHome ? t('builder.isHome') : t('builder.use');
  };
  const change = (fn) => { fn(current()); paintFacts(); scheduleBuild(); };

  import('../game/renderGL.js').then((m) => {
    if (!alive) return;
    mod = m;
    build();
    const frame = (now) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
      const d = current();
      const s = B.sizeFor(d.capacity);
      // high and wide enough to take in the whole bowl, the roof and what lies beyond it
      orbitCamera(cam, clock, 56 + s * 44, 26 + s * 30 + (d.tiers - 1) * 4, 0.1);
      cam.tz = 8 + s * 6; cam.hfov = 60;
      if (gl && !building) gl.render(match, cam, dt);
    };
    raf = requestAnimationFrame(frame);
  }).catch(() => { note.textContent = 'WebGL is not available here.'; });
  window.addEventListener('resize', size);

  /* --- controls --- */
  root.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', () => {
    time = b.dataset.time;
    root.querySelectorAll('[data-time]').forEach((x) => x.classList.toggle('on', x === b));
    scheduleBuild();
  }));
  root.querySelector('#bldSuffix').addEventListener('change', (e) => change((d) => { d.suffix = +e.target.value; }));
  root.querySelector('#bldCap').addEventListener('input', (e) => change((d) => { d.capacity = +e.target.value; }));
  root.querySelectorAll('.bld-seg').forEach((sg) => sg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-val]'); if (!b) return;
    const key = sg.dataset.key; const raw = b.dataset.val;
    sg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    change((d) => { d[key] = key === 'tiers' ? +raw : raw; });
    sfx('tick');
  }));
  root.querySelectorAll('[data-colour]').forEach((inp) => inp.addEventListener('input', (e) => change((d) => {
    const k = e.target.dataset.colour; const v = e.target.value.toLowerCase();
    if (k === 'seats0') d.seats = [v, d.seats[1]]; else if (k === 'seats1') d.seats = [d.seats[0], v]; else d.facade = v;
  })));
  root.querySelector('#bldClubColours').addEventListener('click', () => {
    const c = me().colors;
    change((d) => { d.seats = [c[0], c[1]]; });
    root.querySelector('[data-colour="seats0"]').value = c[0]; root.querySelector('[data-colour="seats1"]').value = c[1];
  });
  root.querySelector('#bldLetters').addEventListener('change', (e) => change((d) => { d.lettering = e.target.checked; }));

  root.querySelectorAll('[data-target]').forEach((b) => b.addEventListener('click', () => { target = b.dataset.target; design = null; navigate('builder'); }));
  root.querySelector('#bldUse').addEventListener('click', () => {
    const d = B.normalise(current());
    update((s) => {
      if (target === 'career' && s.career) s.career.ground = { ...(s.career.ground || { level: 0, income: 0, expandedSeason: 0 }), design: d };
      else s.club.stadium = { ...(s.club.stadium || { saved: [] }), design: d };
    });
    sfx('confirm');
    toast(`${B.groundName(d, me().name)} is your home ground`, 'good');
    paintFacts();
  });
  root.querySelector('#bldSave').addEventListener('click', () => {
    const d = B.normalise(current());
    update((s) => {
      const st = s.club.stadium || (s.club.stadium = { design: null, saved: [] });
      st.saved = [...(st.saved || []), { at: Date.now(), design: d }].slice(-8);
    });
    sfx('confirm');
    navigate('builder');
  });
  root.querySelector('#bldShare').addEventListener('click', async () => {
    const code = B.encode(current());
    const out = root.querySelector('#bldCode');
    out.hidden = false; out.innerHTML = `Share code <b>${code}</b>`;
    try { await navigator.clipboard.writeText(code); toast('Code copied', 'good'); } catch { /* no clipboard: it is on screen */ }
  });
  root.querySelector('#bldLoad').addEventListener('click', () => {
    const d = B.decode(root.querySelector('#bldIn').value, me().colors);
    if (!d) return toast('That is not a stadium code', 'warn');
    design = d;
    sfx('confirm');
    toast('Design loaded — save it or make it your ground', 'good');
    navigate('builder');
  });
  root.querySelector('#bldReset').addEventListener('click', () => { design = B.defaultDesign(me().colors); navigate('builder'); });
  root.querySelectorAll('[data-load]').forEach((b) => b.addEventListener('click', () => {
    const s = (getState().club.stadium?.saved || [])[+b.dataset.load];
    if (!s) return;
    design = B.normalise(s.design); navigate('builder');
  }));
  root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    update((s) => { if (s.club.stadium?.saved) s.club.stadium.saved.splice(+b.dataset.del, 1); });
    navigate('builder');
  }));

  return () => { alive = false; clearTimeout(buildTimer); cancelAnimationFrame(raf); window.removeEventListener('resize', size); try { gl?.dispose(); } catch { /* gone */ } };
}
