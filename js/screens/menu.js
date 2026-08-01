import { getState } from '../state.js';
import { WORLD, getClub } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { navigate } from '../app.js';

export const TITLE = 'APEX XI';

const TILES = [
  { id: 'squad', name: 'Squad Builder', icon: '⬢', blurb: 'Packs · formations · chemistry', tone: 'a' },
  { id: 'career', name: 'Career Mode', icon: '▦', blurb: 'Season · table · transfers', tone: 'b' },
  { id: 'quick', name: 'Quick Match', icon: '⚡', blurb: 'Play it yourself', tone: 'c' },
  { id: 'settings', name: 'Settings', icon: '⚙', blurb: 'Speed · colour · save', tone: 'd' },
];

export function render() {
  const s = getState();
  const career = s.career;
  const careerClub = career ? getClub(career.clubId) : null;

  return `
    <section class="hero">
      <div class="hero-glow"></div>
      <h1 class="hero-title">APEX<span>XI</span></h1>
      <p class="hero-sub">${WORLD.clubs.length} clubs · ${WORLD.players.length} players</p>
      <div class="hero-stats">
        <div class="hstat"><b>${s.club.collection.length}</b><span>Cards owned</span></div>
        <div class="hstat"><b>${s.club.packsOpened}</b><span>Packs opened</span></div>
        <div class="hstat"><b>${career ? `S${career.season} · MD${Math.min(career.matchday, 18)}` : '—'}</b><span>Career</span></div>
      </div>
    </section>

    ${careerClub ? `
      <button class="resume-card" data-go="career">
        ${crestSVG(careerClub.crest, careerClub.short, 46)}
        <div class="resume-txt">
          <span class="resume-kicker">Continue</span>
          <b>${careerClub.name}</b>
          <span class="resume-meta">S${career.season} · MD${Math.min(career.matchday, 18)}/18</span>
        </div>
        <span class="resume-arrow">→</span>
      </button>` : ''}

    <div class="tile-grid">
      ${TILES.map((t) => `
        <button class="tile tone-${t.tone}" data-go="${t.id}">
          <span class="tile-icon">${t.icon}</span>
          <span class="tile-name">${t.name}</span>
          <span class="tile-blurb">${t.blurb}</span>
          <span class="tile-cta">Open →</span>
        </button>`).join('')}
    </div>

    <p class="disclaimer">All clubs, players and competitions are fictional.</p>`;
}

export function mount(root) {
  root.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
}
