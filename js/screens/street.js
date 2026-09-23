/**
 * Street screen (v82): create your baller, then the tour, quick games in any
 * cage, the locker and the crew. Rules: streetMode.js; venues: data/street.js.
 */
import { getState, update } from '../state.js';
import { navigate, toast } from '../app.js';
import { screenHead } from '../components/screenHead.js';
import { crestSVG } from '../components/crest.js';
import { faceSVG, LOOK_SKINS, LOOK_HAIRS } from '../components/face.js';
import { enterFullscreen } from '../fullscreen.js';
import { FIELDS } from '../game/field.js';
import { STREET_VENUES, venueDef, FORMATS } from '../data/street.js';
import * as S from '../streetMode.js';

export const TITLE = 'Street';
let tab = 'tour';
let draft = null;
let quick = { venue: 'st-rooftop', format: null };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const POS = ['CAM', 'ST', 'LW', 'RW', 'CM'];
const NATIONS = ['Saudi Arabia', 'Brazil', 'France', 'England', 'Spain', 'Argentina', 'Morocco', 'Egypt', 'Portugal', 'Nigeria', 'Japan', 'USA'];

export function render() {
  const st = getState().street;
  if (!st?.baller) return createHTML();
  const lvl = S.ballerLevel(st.xp);
  const into = st.xp % S.LEVEL_XP;
  const NAV = [['tour', 'Tour'], ['quick', 'Quick game'], ['locker', 'Baller & locker'], ['crew', 'Crew']];
  return `
    ${screenHead({ kicker: 'Mode · Street', title: 'Street', sub: `${st.baller.name} · level ${lvl} · ${st.rep} rep · ${st.won}/${st.played} won`, motif: 'ladder', tone: 'c' })}
    <div class="st-bar"><span>Level ${lvl}</span><i class="obj-bar"><b style="width:${(into / S.LEVEL_XP) * 100}%"></b></i><span>${into}/${S.LEVEL_XP} XP</span></div>
    <nav class="cnav" id="stTabs">${NAV.map(([id, l]) => `<button class="cnav-b ${tab === id ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('')}</nav>
    ${tab === 'quick' ? quickHTML() : tab === 'locker' ? lockerHTML(st) : tab === 'crew' ? crewHTML(st) : tourHTML(st)}`;
}

function createHTML() {
  draft = draft || { name: '', number: 10, position: 'CAM', nation: 'Saudi Arabia', skin: 2, hair: 0, style: 2, beard: false };
  const d = draft;
  const look = { skin: LOOK_SKINS[d.skin], hair: LOOK_HAIRS[d.hair], style: d.style, beard: d.beard };
  const sw = (key, list) => `<div class="cs-swatches" data-key="${key}">${list.map((v, i) => `<button class="cs-sw ${d[key] === i ? 'on' : ''}" data-i="${i}" style="background:${v}" aria-label="${key} ${i + 1}"></button>`).join('')}</div>`;
  return `
    ${screenHead({ kicker: 'Mode · Street', title: 'Create your baller', sub: 'Three a side on a rooftop, five on the sand. Skills win you style; style wins you the street.', motif: 'ladder', tone: 'c' })}
    <div class="cs-layout">
      <aside class="cs-preview glass"><span class="csp-face">${faceSVG({ id: 'baller', name: d.name || 'You', look }, 104, '#1d2a44')}</span>
        <b>${esc(d.name || 'Your street name')}</b><span>#${d.number} · ${d.position} · ${esc(d.nation)}</span></aside>
      <div class="cs-form glass" id="stForm">
        <label>Street name <input id="stName" maxlength="20" value="${esc(d.name)}" placeholder="What the court calls you"></label>
        <label>Number <input id="stNum" type="number" min="1" max="99" value="${d.number}"></label>
        <label>Position <select id="stPos">${POS.map((p) => `<option ${p === d.position ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
        <label>Nation <select id="stNation">${NATIONS.map((n) => `<option ${n === d.nation ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <div class="cs-row"><span>Skin tone</span>${sw('skin', LOOK_SKINS)}</div>
        <div class="cs-row"><span>Hair colour</span>${sw('hair', LOOK_HAIRS)}</div>
        <div class="cs-row"><span>Hair style</span><div class="cs-swatches" data-key="style">${[0, 1, 2, 3, 4, 5].map((i) => `<button class="cs-sw ${d.style === i ? 'on' : ''}" data-i="${i}" style="background:#222">${i + 1}</button>`).join('')}</div></div>
        <label class="cs-check"><input id="stBeard" type="checkbox" ${d.beard ? 'checked' : ''}> Facial hair</label>
        <button class="btn primary big" id="stCreate" ${d.name.trim().length >= 2 ? '' : 'disabled'}>Hit the street →</button>
      </div>
    </div>`;
}

function tourHTML(st) {
  const view = S.tourView(st);
  return `<div class="st-tour">${view.map((stop, i) => {
    const v = stop.venue;
    return `<section class="panel glass st-stop ${stop.unlocked ? '' : 'locked'} ${stop.done ? 'done' : ''}" style="--s1:${v.surface.base};--s2:${v.cage.neon || v.cage.mesh}">
      <header class="panel-head"><h2>${i + 1}. ${esc(v.name)}</h2><span class="tag">${FORMATS[v.field]} · ${stop.stars}/9 ★</span></header>
      <p class="hint">${esc(v.city)} — ${esc(v.blurb)}</p>
      <div class="st-games">${[0, 1, 2].map((g) => {
        const crew = S.tourCrew(i, g, FIELDS[v.field].players);
        const res = stop.games[g];
        const prevWon = g === 0 || stop.games[g - 1]?.won;
        return `<div class="st-game ${g === 2 ? 'boss' : ''} ${res?.won ? 'won' : ''}">
          <span class="st-crest">${crestSVG(crew.crest, crew.short, 34)}</span>
          <b>${esc(crew.name)}</b><span>${g === 2 ? 'Boss' : 'Crew'} · ≈${crew.rating}</span>
          <em>${res ? `${'★'.repeat(res.stars)}${'☆'.repeat(3 - res.stars)} · ${res.score[0]}–${res.score[1]}` : '☆☆☆'}</em>
          <button class="btn ${res?.won ? 'ghost' : 'primary'}" data-tour="${i}:${g}" ${stop.unlocked && prevWon ? '' : 'disabled'}>${res ? 'Replay' : 'Play'}</button>
        </div>`;
      }).join('')}</div>
    </section>`;
  }).join('')}
  <p class="hint">Stars: win for one, ${S.STAR_STYLE[1]} style for two, ${S.STAR_STYLE[2]} for three. Beat a boss and his best player joins your crew.</p></div>`;
}

function quickHTML() {
  const v = STREET_VENUES.find((x) => x.id === quick.venue) || STREET_VENUES[0];
  const fmt = quick.format || v.field;
  return `<section class="panel glass">
    <header class="panel-head"><h2>Quick game</h2></header>
    <p class="hint">Any cage, any format, against a crew of your level. No tour progress, full style and XP.</p>
    <div class="st-venues" id="stVenues">${STREET_VENUES.map((x) => `<button class="st-venue ${x.id === v.id ? 'on' : ''}" data-venue="${x.id}" style="--s1:${x.surface.base};--s2:${x.cage.neon || x.cage.mesh}"><b>${esc(x.name)}</b><span>${esc(x.city)} · ${FORMATS[x.field]}</span></button>`).join('')}</div>
    <div class="chips" id="stFormats">${Object.entries(FORMATS).map(([id, l]) => `<button class="chip ${id === fmt ? 'on' : ''}" data-format="${id}">${l}</button>`).join('')}</div>
    <button class="btn primary big" id="stQuick">Play at ${esc(v.name)}</button>
  </section>`;
}

function lockerHTML(st) {
  const card = S.ballerCard(st);
  const kinds = ['kit', 'boots', 'ball', 'celebration'];
  return `<section class="panel glass">
    <header class="panel-head"><h2>${esc(st.baller.name)} #${st.baller.number}</h2><span class="tag">${card.overall} overall</span></header>
    <div class="pro-attrs">${Object.entries(card.stats).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%"></b></i><em>${v}</em></div>`).join('')}</div>
    <p class="hint">Every level adds a point everywhere, up to 92. Style, wins and goals all give XP.</p>
  </section>
  ${kinds.map((k) => `<section class="panel glass"><header class="panel-head"><h2>${k[0].toUpperCase() + k.slice(1)}</h2></header>
    <div class="st-cos">${S.COSMETICS.filter((c) => c.kind === k).map((c) => {
      const owned = st.owned.includes(c.id); const on = st.equipped[k] === c.id;
      const sw = c.colors ? `<i style="background:linear-gradient(90deg,${c.colors[0]} 50%,${c.colors[1]} 50%)"></i>` : c.color ? `<i style="background:${c.color}"></i>` : '';
      return `<button class="st-co ${on ? 'on' : ''} ${owned ? '' : 'locked'}" data-equip="${c.id}" ${owned ? '' : 'disabled'}>${sw}<b>${esc(c.name)}</b><span>${owned ? (on ? 'Equipped' : 'Equip') : c.boss ? `Beat the boss at ${esc(S.streetVenue(c.boss).name)}` : `${c.rep} rep`}</span></button>`;
    }).join('')}</div></section>`).join('')}`;
}

function crewHTML(st) {
  const crew = S.myCrew(99, st);
  return `<section class="panel glass"><header class="panel-head"><h2>Your crew</h2><span class="tag">${crew.xi.length} players</span></header>
    <div class="dep-rows">${crew.xi.map((p) => `<div class="dep-row"><b class="dep-ovr">${p.overall}</b><span class="dep-pos">${p.position}</span><span class="dep-name">${esc(p.name)}${p.id === 'street-baller' ? ' <em>you</em>' : ''}</span></div>`).join('')}</div>
    <p class="hint">The best of them play; you always do. Beat a tour boss to recruit his best player.</p></section>`;
}

export function mount(root) {
  const rerender = () => navigate('street');
  const st = getState().street;
  if (!st?.baller) {
    const d = draft;
    const keep = () => { d.name = root.querySelector('#stName').value; d.number = +root.querySelector('#stNum').value || 10; d.position = root.querySelector('#stPos').value; d.nation = root.querySelector('#stNation').value; d.beard = root.querySelector('#stBeard').checked; };
    root.querySelector('#stName')?.addEventListener('input', () => { keep(); root.querySelector('#stCreate').disabled = d.name.trim().length < 2; });
    for (const id of ['#stNum', '#stPos', '#stNation', '#stBeard']) root.querySelector(id)?.addEventListener('change', () => { keep(); rerender(); });
    root.querySelectorAll('.cs-swatches').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; keep(); d[g.dataset.key] = +b.dataset.i; rerender(); }));
    root.querySelector('#stCreate')?.addEventListener('click', () => {
      keep();
      S.createBaller({ name: d.name.trim(), number: d.number, position: d.position, nation: d.nation, look: { skin: LOOK_SKINS[d.skin], hair: LOOK_HAIRS[d.hair], style: d.style, beard: d.beard } });
      draft = null; toast('Welcome to the street', 'good'); rerender();
    });
    return;
  }
  root.querySelectorAll('#stTabs [data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  root.querySelectorAll('[data-tour]').forEach((b) => b.addEventListener('click', () => {
    const [i, g] = b.dataset.tour.split(':').map(Number);
    const v = STREET_VENUES[i];
    launch(v, v.field, S.tourCrew(i, g, FIELDS[v.field].players), { venueId: v.id, game: g });
  }));
  root.querySelector('#stVenues')?.addEventListener('click', (e) => { const b = e.target.closest('[data-venue]'); if (b) { quick.venue = b.dataset.venue; quick.format = null; rerender(); } });
  root.querySelector('#stFormats')?.addEventListener('click', (e) => { const b = e.target.closest('[data-format]'); if (b) { quick.format = b.dataset.format; rerender(); } });
  root.querySelector('#stQuick')?.addEventListener('click', () => {
    const v = S.streetVenue(quick.venue);
    const fmt = quick.format || v.field;
    const lvl = S.ballerLevel(getState().street.xp);
    const opp = S.tourCrew(Math.min(5, Math.floor(lvl / 3)), (lvl + getState().street.played) % 2, FIELDS[fmt].players);
    launch(v, fmt, opp, { venueId: v.id, game: null });
  });
  root.querySelectorAll('[data-equip]').forEach((b) => b.addEventListener('click', () => { S.equip(b.dataset.equip); rerender(); }));
}

function launch(v, fmt, opp, street) {
  const n = FIELDS[fmt].players;
  const field = v.sand ? { ...FIELDS[fmt], ball: { bounce: 0.14, drag: 0.972 } } : fmt;
  enterFullscreen();
  navigate('play', {
    mode: 'single', homeId: 'c1', awayId: 'c2', duration: fmt === 'futsal' ? 180 : 150, skill: 0.9 + (opp.rating - 68) / 40,
    homeSquad: S.myCrew(n), awaySquad: opp, field, venueDef: venueDef(v), atmo: { time: v.time, weather: 'clear' }, street,
  });
}
