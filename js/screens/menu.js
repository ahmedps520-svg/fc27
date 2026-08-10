import { navigate, toast } from '../app.js';

export const TITLE = 'APEX XI';

const TILES = [
  { id: 'squad', name: 'Ultimate XI', icon: '⬢', blurb: 'Build · rank up · rewards', tone: 'a' },
  { id: 'career', name: 'Career Mode', icon: '▦', blurb: 'Season · table · transfers', tone: 'b', locked: 'Under construction' },
  { id: 'quick', name: 'Kick Off', icon: '⚡', blurb: 'Straight into a match', tone: 'c' },
  { id: 'settings', name: 'Settings', icon: '⚙', blurb: 'Speed · colour · save', tone: 'd' },
];

/**
 * The wordmark, the club/player count and the three counters used to sit above
 * the tiles. They are gone: the title screen you have just come through says
 * APEX XI at forty times the size, and repeating it — plus a row of statistics
 * nobody opened the app to read — pushed the only thing on this screen anyone
 * came for down past the fold on a phone.
 *
 * What is left is four doors and the line of small print that has to be there.
 */
export function render() {
  return `
    <section class="menu-screen">
    <div class="tile-grid">
      ${TILES.map((t) => `
        <button class="tile tone-${t.tone} ${t.locked ? 'is-locked' : ''}"
                ${t.locked ? `data-locked="${t.locked}" aria-disabled="true"` : `data-go="${t.id}"`}>
          <!-- the cover's swoosh, cut down to fit a card: the one motif that ties
               the title screen, the app icon and these four buttons together -->
          <svg class="tile-swoosh" viewBox="0 0 300 190" preserveAspectRatio="none" aria-hidden="true">
            <path class="ts-a" d="M120 200 L182 196 L312 34" />
            <path class="ts-b" d="M150 202 L206 200 L312 74" />
          </svg>
          <span class="tile-icon">${t.icon}</span>
          <span class="tile-name">${t.name}</span>
          <span class="tile-blurb">${t.locked || t.blurb}</span>
          <span class="tile-cta">${t.locked ? '🔒 Locked' : 'Open →'}</span>
        </button>`).join('')}
    </div>

    <p class="disclaimer">Clubs, leagues and competitions are fictional.
      Icon and Star cards name real footballers and are not affiliated with them.</p>
    </section>`;
}

export function mount(root) {
  root.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
  root.querySelectorAll('[data-locked]').forEach((el) => {
    el.addEventListener('click', () => toast(`Career Mode is ${el.dataset.locked.toLowerCase()}`, 'info'));
  });
}
