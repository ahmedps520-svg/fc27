import { getState, update, resetAll } from '../state.js';
import { WORLD } from '../data/generator.js';
import { navigate, applyTheme, toast, refreshCoins } from '../app.js';

export const TITLE = 'Settings';

const ACCENTS = [
  ['cyan', '#41d3ff'], ['lime', '#b8ff3d'], ['magenta', '#ff2e88'], ['amber', '#ffb703'],
];

export function render() {
  const s = getState().settings;
  const st = getState();
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Career sim</h2></header>
      <div class="setting-row">
        <div><b>Sim speed</b></div>
        <div class="seg" id="speedSeg">
          ${[['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']].map(([v, l]) =>
            `<button class="${s.simSpeed === v ? 'on' : ''}" data-speed="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div><b>Full commentary</b></div>
        <button class="switch ${s.commentary ? 'on' : ''}" id="commentaryTgl" role="switch"
                aria-checked="${s.commentary}"><i></i></button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Look</h2></header>
      <div class="setting-row">
        <div><b>Accent</b></div>
        <div class="swatches" id="accents">
          ${ACCENTS.map(([id, hex]) =>
            `<button class="swatch ${s.accent === id ? 'on' : ''}" data-accent="${id}"
                     style="--sw:${hex}" aria-label="${id}"></button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div><b>Reduce motion</b></div>
        <button class="switch ${s.reduceMotion ? 'on' : ''}" id="motionTgl" role="switch"
                aria-checked="${s.reduceMotion}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>3D detail</b><span>Low on phones by default.</span></div>
        <div class="seg" id="qualitySeg">
          ${[['auto', 'Auto'], ['high', 'High'], ['low', 'Low']].map(([v, l]) =>
            `<button class="${(s.quality || 'auto') === v ? 'on' : ''}" data-quality="${v}">${l}</button>`).join('')}
        </div>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Save</h2></header>
      <div class="setting-row">
        <div><b>Coins</b></div>
        <span class="coin-chip">◈ ${st.club.coins.toLocaleString()}</span>
      </div>
      <div class="setting-row">
        <div><b>${st.club.collection.length} cards · ${st.club.packsOpened} packs</b></div>
        <button class="btn ghost" id="topUp">+5,000</button>
      </div>
      <div class="setting-row">
        <div><b>Reset save</b></div>
        <button class="btn ghost danger" id="resetBtn">Reset</button>
      </div>
    </section>

    <section class="panel glass about">
      <header class="panel-head"><h2>Controls</h2></header>
      <div class="ctrl-grid">
        ${[['✕ / Space', 'Pass · tackle'], ['◯ / K', 'Shoot (hold)'], ['□ / J', 'Cross'],
           ['△ / L', 'Through ball'], ['L1 · R1 / Q', 'Switch player'], ['R2 / Shift', 'Sprint'],
           ['Options / Esc', 'Pause']]
          .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
      </div>
      <p class="disclaimer">${WORLD.clubs.length} clubs · ${WORLD.players.length} players. All fictional.</p>
    </section>`;
}

export function mount(root) {
  root.querySelector('#speedSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-speed]');
    if (!b) return;
    update((s) => { s.settings.simSpeed = b.dataset.speed; });
    root.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
  });

  const toggle = (el, key) => el.addEventListener('click', () => {
    const next = !getState().settings[key];
    update((s) => { s.settings[key] = next; });
    el.classList.toggle('on', next);
    el.setAttribute('aria-checked', String(next));
    applyTheme();
  });
  toggle(root.querySelector('#commentaryTgl'), 'commentary');
  toggle(root.querySelector('#motionTgl'), 'reduceMotion');

  root.querySelector('#qualitySeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quality]');
    if (!b) return;
    update((s) => { s.settings.quality = b.dataset.quality; });
    root.querySelectorAll('[data-quality]').forEach((x) => x.classList.toggle('on', x === b));
  });

  root.querySelector('#accents').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accent]');
    if (!b) return;
    update((s) => { s.settings.accent = b.dataset.accent; });
    root.querySelectorAll('[data-accent]').forEach((x) => x.classList.toggle('on', x === b));
    applyTheme();
  });

  root.querySelector('#topUp').addEventListener('click', () => {
    update((s) => { s.club.coins += 5000; });
    refreshCoins();
    root.querySelector('.coin-chip').textContent = `◈ ${getState().club.coins.toLocaleString()}`;
    toast('5,000 coins added');
  });

  root.querySelector('#resetBtn').addEventListener('click', () => {
    if (!confirm('Reset the collection, line-up and career save? This cannot be undone.')) return;
    resetAll();
    applyTheme();
    toast('Save reset');
    navigate('menu');
  });
}
