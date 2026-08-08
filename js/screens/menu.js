import { getState } from '../state.js';
import { WORLD } from '../data/generator.js';
import { navigate, toast } from '../app.js';

export const TITLE = 'APEX XI';

const TILES = [
  { id: 'squad', name: 'Ultimate XI', icon: '⬢', blurb: 'Build · rank up · rewards', tone: 'a' },
  { id: 'career', name: 'Career Mode', icon: '▦', blurb: 'Season · table · transfers', tone: 'b', locked: 'Under construction' },
  { id: 'quick', name: 'Kick Off', icon: '⚡', blurb: 'Straight into a match', tone: 'c' },
  { id: 'settings', name: 'Settings', icon: '⚙', blurb: 'Speed · colour · save', tone: 'd' },
];

export function render() {
  const s = getState();

  return `
    <section class="hero">
      <div class="hero-glow"></div>
      <h1 class="hero-title">APEX<span>XI</span></h1>
      <p class="hero-sub">${WORLD.clubs.length} clubs · ${WORLD.players.length} players</p>
      <div class="hero-stats">
        <div class="hstat"><b>${s.club.collection.length}</b><span>Cards owned</span></div>
        <div class="hstat"><b>${s.club.packsOpened}</b><span>Packs opened</span></div>
        <div class="hstat"><b>${s.ultimate.played}</b><span>Matches played</span></div>
      </div>
    </section>

    <div class="tile-grid">
      ${TILES.map((t) => `
        <button class="tile tone-${t.tone} ${t.locked ? 'is-locked' : ''}"
                ${t.locked ? `data-locked="${t.locked}" aria-disabled="true"` : `data-go="${t.id}"`}>
          <span class="tile-icon">${t.icon}</span>
          <span class="tile-name">${t.name}</span>
          <span class="tile-blurb">${t.locked || t.blurb}</span>
          <span class="tile-cta">${t.locked ? '🔒 Locked' : 'Open →'}</span>
        </button>`).join('')}
    </div>

    <p class="disclaimer">Clubs, leagues and competitions are fictional.
      Icon and Star cards name real footballers and are not affiliated with them.</p>`;
}

export function mount(root) {
  root.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
  root.querySelectorAll('[data-locked]').forEach((el) => {
    el.addEventListener('click', () => toast(`Career Mode is ${el.dataset.locked.toLowerCase()}`, 'info'));
  });
}
