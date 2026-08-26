import { navigate, toast } from '../app.js';
import { notesPending, showNotes, markNotesSeen } from './notes.js';
import { maybeStartTutorial, tutorialSeen } from '../tutorial.js';

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

/**
 * The wordmark, the club/player count and the three counters used to sit above
 * the tiles. They are gone: the title screen you have just come through says
 * APEX XI at forty times the size, and repeating it — plus a row of statistics
 * nobody opened the app to read — pushed the only thing on this screen anyone
 * came for down past the fold on a phone.
 *
 * What is left is four doors and the line of small print that has to be there.
 */
/* The swoosh, shared by every tile size — the one motif that ties the title
   screen, the app icon and these buttons together. */
const swoosh = `
  <svg class="tile-swoosh" viewBox="0 0 300 190" preserveAspectRatio="none" aria-hidden="true">
    <path class="ts-a" d="M120 200 L182 196 L312 34" />
    <path class="ts-b" d="M150 202 L206 200 L312 74" />
  </svg>`;

/**
 * The hub layout: a rail of small utility tiles on the left, two big doors in
 * the middle — the shape every mobile football game trains people on, so a
 * new player's thumbs already know where everything is.
 *
 * The **content** rule from the last two reverts still stands: the same four
 * destinations, no counters, no statistics, nothing new to read. What changed
 * is only which of the four get the space. Kick Off and Ultimate XI are where
 * every session actually goes, so they are the two big doors; Career (locked)
 * and Settings are visited once a week, so they hold the rail.
 */
export function render() {
  return `
    <section class="menu-screen">
      <!-- The wordmark set exactly as the cover sets it: heavy, italic, white
           APEX against a green XI. It was briefly removed along with the row of
           counters underneath it; the counters were the problem, not this. -->
      <h1 class="menu-wordmark"><span class="t1">APEX</span><span class="t2">XI</span></h1>
    <div class="hub">
      <div class="hub-rail">
        <button class="tile t-mini tone-b is-locked" data-locked="Under construction" aria-disabled="true">
          <span class="tile-icon">${icon('career')}</span>
          <span class="tile-name">Career</span>
          <span class="mini-lock">${icon('lock', 12)}</span>
        </button>
        <button class="tile t-mini tone-d" data-go="settings">
          <span class="tile-icon">${icon('settings')}</span>
          <span class="tile-name">Settings</span>
        </button>
      </div>
      <div class="hub-main">
        <button class="tile t-club tone-a" data-go="squad">
          ${swoosh}
          <span class="tile-icon">${icon('squad')}</span>
          <span class="tile-name">Ultimate XI</span>
          <span class="tile-blurb">Build · rank up · rewards</span>
          <span class="tile-cta">Open →</span>
        </button>
        <button class="tile t-play tone-c" data-go="quick">
          ${swoosh}
          <span class="tile-icon">${icon('quick')}</span>
          <span class="tile-name">Kick Off</span>
          <span class="tile-blurb">Straight into a match</span>
          <span class="tile-cta">Play →</span>
        </button>
      </div>
    </div>

    <p class="disclaimer">Clubs, leagues and competitions are fictional. Player names
      and nationalities are those of real footballers, used without endorsement or
      affiliation. Portraits are drawn and are not likenesses.</p>
    </section>`;
}

export function mount(root) {
  root.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.dataset.go));
  });
  root.querySelectorAll('[data-locked]').forEach((el) => {
    el.addEventListener('click', () => toast(`Career Mode is ${el.dataset.locked.toLowerCase()}`, 'info'));
  });

  /* What's new, once per build.
   *
   * Here rather than on the title screen because the title screen already owns
   * one interruption — the update gate — and stacking a second one in front of
   * a START button is how a game gets a reputation for being in the way. By the
   * time this fires the menu is drawn behind it, so dismissing it leaves you
   * where you were already heading. */
  /* Two overlays on one frame is how a first launch becomes a wall of things to
     dismiss, so exactly one of these runs.
     
     A brand new save has *both* pending — it has never seen this build either —
     and the tour wins, because a changelog for a version you have never run is
     noise to someone who has not played the game at all. The notes are marked
     seen on the way past so they do not ambush the second launch either. */
  let closeNotes = null;
  if (!tutorialSeen()) {
    markNotesSeen();
    maybeStartTutorial();
  } else if (notesPending()) {
    closeNotes = showNotes(root);
  }
  return () => { closeNotes?.(); };
}
