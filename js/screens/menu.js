import { navigate, toast } from '../app.js';

export const TITLE = 'APEX XI';

/**
 * Drawn icons, not glyphs.
 *
 * These were ⬢ ▦ ⚡ ⚙ and a padlock emoji — characters borrowed from whatever
 * font the device happened to have, which is why they rendered as Apple's
 * artwork on an iPad and as something else everywhere else, and why none of
 * them said anything about the mode they sat on. A hexagon is not a squad and
 * a lightning bolt is not a kick-off.
 *
 * Each is now a line drawing of the thing it opens, on the same 24-unit grid
 * with the same stroke weight, so the four read as one set.
 */
const ICONS = {
  /** Ultimate XI: a card, with a card's corner index. */
  squad: `<path d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/>
          <path d="M9.5 7.5h3M9.5 10h2"/>
          <path d="M12 12.4c1.9 0 3.4 1.5 3.4 3.4h-6.8c0-1.9 1.5-3.4 3.4-3.4z"/>
          <circle cx="12" cy="10.4" r="1.5"/>`,
  /** Career Mode: a trophy, which is the point of a season. */
  career: `<path d="M8 4h8v5a4 4 0 0 1-8 0z"/>
           <path d="M8 5.5H5.6v1.2A3.4 3.4 0 0 0 9 10.1M16 5.5h2.4v1.2A3.4 3.4 0 0 1 15 10.1"/>
           <path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>`,
  /** Kick Off: a ball. */
  quick: `<circle cx="12" cy="12" r="8.4"/>
          <path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4z"/>
          <path d="M12 3.6v3.6M15.4 9.7l3.4-1.1M14.1 13.7l2.1 2.9M9.9 13.7l-2.1 2.9M8.6 9.7L5.2 8.6"/>`,
  /** Settings: faders, which is what the screen actually is. */
  settings: `<path d="M6 4.5v5M6 14.5v5M12 4.5v9M12 18.5v.9M18 4.5v2M18 11.5v8"/>
             <circle cx="6" cy="12" r="2.3"/><circle cx="12" cy="16" r="2.3"/><circle cx="18" cy="9" r="2.3"/>`,
  lock: `<rect x="5.5" y="10.5" width="13" height="9" rx="2"/>
         <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>`,
};

const icon = (name, size = 24) => `
  <svg class="tile-glyph" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"
       fill="none" stroke="currentColor" stroke-width="1.6"
       stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const TILES = [
  { id: 'squad', name: 'Ultimate XI', blurb: 'Build · rank up · rewards', tone: 'a' },
  { id: 'career', name: 'Career Mode', blurb: 'Season · table · transfers', tone: 'b', locked: 'Under construction' },
  { id: 'quick', name: 'Kick Off', blurb: 'Straight into a match', tone: 'c' },
  { id: 'settings', name: 'Settings', blurb: 'Speed · colour · save', tone: 'd' },
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
      <!-- The wordmark set exactly as the cover sets it: heavy, italic, white
           APEX against a green XI. It was briefly removed along with the row of
           counters underneath it; the counters were the problem, not this. -->
      <h1 class="menu-wordmark"><span class="t1">APEX</span><span class="t2">XI</span></h1>
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
          <span class="tile-icon">${icon(t.id)}</span>
          <span class="tile-name">${t.name}</span>
          <span class="tile-blurb">${t.locked || t.blurb}</span>
          <span class="tile-cta">${t.locked ? `${icon('lock', 13)} Locked` : 'Open →'}</span>
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
