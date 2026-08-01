import { WORLD, clubRating } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { navigate } from '../app.js';

export const TITLE = 'Quick Match';

let homeId = WORLD.clubs[0].id;
let awayId = WORLD.clubs[1].id;
let duration = 240;
let skill = 1;

export function render() {
  return `
    <div class="vs-strip glass">
      <div class="vs-side" id="vsHome">${vsCard(homeId, 'You')}</div>
      <span class="vs-mark">VS</span>
      <div class="vs-side" id="vsAway">${vsCard(awayId, 'CPU')}</div>
    </div>

    <div class="picker-cols">
      ${['home', 'away'].map((side) => `
        <section class="panel glass">
          <header class="panel-head"><h2>${side === 'home' ? 'You' : 'CPU'}</h2></header>
          <div class="club-list" data-side="${side}">
            ${WORLD.clubs.map((c) => `
              <button class="club-row ${(side === 'home' ? homeId : awayId) === c.id ? 'on' : ''}"
                      data-club="${c.id}" style="--team:${c.crest.colors[0]}">
                ${crestSVG(c.crest, c.short, 28)}
                <span class="cr-name">${c.name}</span>
                <span class="cr-rating">${clubRating(c.id)}</span>
              </button>`).join('')}
          </div>
        </section>`).join('')}
    </div>

    <div class="opt-row glass">
      <div class="opt">
        <span>Length</span>
        <div class="seg" id="lenSeg">
          ${[[120, '2m'], [240, '4m'], [420, '7m']].map(([v, l]) =>
            `<button class="${duration === v ? 'on' : ''}" data-len="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="opt">
        <span>CPU</span>
        <div class="seg" id="skillSeg">
          ${[[0.7, 'Easy'], [1, 'Pro'], [1.35, 'Elite']].map(([v, l]) =>
            `<button class="${skill === v ? 'on' : ''}" data-skill="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <button class="btn ghost" id="randomise">Random</button>
      <button class="btn primary big" id="kickOff">Kick Off</button>
    </div>

    <p class="hint center">✕ pass · ◯ shoot · □ cross · △ through · L1/R1 switch · R2 sprint</p>`;
}

function vsCard(clubId, label) {
  const c = WORLD.clubsById[clubId];
  return `
    <span class="vs-label">${label}</span>
    ${crestSVG(c.crest, c.short, 58)}
    <b class="vs-name">${c.name}</b>
    <span class="vs-rating">${clubRating(clubId)}</span>`;
}

export function mount(root) {
  const sync = () => {
    root.querySelector('#vsHome').innerHTML = vsCard(homeId, 'You');
    root.querySelector('#vsAway').innerHTML = vsCard(awayId, 'CPU');
    root.querySelectorAll('[data-side]').forEach((list) => {
      const active = list.dataset.side === 'home' ? homeId : awayId;
      list.querySelectorAll('[data-club]').forEach((b) => b.classList.toggle('on', b.dataset.club === active));
    });
  };

  root.querySelectorAll('[data-side]').forEach((list) => {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-club]');
      if (!btn) return;
      const id = btn.dataset.club;
      if (list.dataset.side === 'home') {
        if (id === awayId) awayId = homeId;
        homeId = id;
      } else {
        if (id === homeId) homeId = awayId;
        awayId = id;
      }
      sync();
    });
  });

  const seg = (sel, key, apply) => root.querySelector(sel).addEventListener('click', (e) => {
    const b = e.target.closest(`[data-${key}]`);
    if (!b) return;
    apply(Number(b.dataset[key]));
    root.querySelectorAll(`[data-${key}]`).forEach((x) => x.classList.toggle('on', x === b));
  });
  seg('#lenSeg', 'len', (v) => { duration = v; });
  seg('#skillSeg', 'skill', (v) => { skill = v; });

  root.querySelector('#randomise').addEventListener('click', () => {
    const pool = WORLD.clubs.map((c) => c.id).sort(() => Math.random() - 0.5);
    [homeId, awayId] = pool;
    sync();
  });

  root.querySelector('#kickOff').addEventListener('click', () => {
    // this click is the user gesture the fullscreen request needs
    document.documentElement.requestFullscreen?.().catch(() => {});
    navigate('play', { homeId, awayId, duration, skill });
  });
}
