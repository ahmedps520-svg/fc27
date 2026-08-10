/**
 * The banner every mode screen opens with.
 *
 * The title screen and the menu are built on one idea — heavy italic condensed
 * type, and a pair of bold green lines sweeping up to the right — and until now
 * that idea stopped at the menu. Open Ultimate XI, Kick Off or Settings and the
 * game turned into a stack of grey glass panels that could have belonged to any
 * app. This is the piece that carries the cover through the door.
 *
 * The parts are fixed so the four screens read as one product: a kicker, the
 * italic title, a line of small print, and the swoosh. What varies is the
 * `motif` — a line drawing behind the swoosh that says something about the
 * screen it sits on, so each mode still has an identity of its own.
 *
 * Everything is drawn, not typed. No emoji, no font glyphs — see the note on
 * the menu icons for why that matters.
 */

/**
 * Per-screen artwork. Each is stroked in the accent at low opacity and sits
 * behind the swoosh, bleeding off the right-hand edge of the banner.
 *
 * All four are authored on the same 300x120 canvas with the same stroke weight,
 * which is what stops them reading as four unrelated drawings.
 */
const MOTIFS = {
  /** Ultimate XI — the division ladder, climbing to the right. */
  ladder: `
    <path d="M8 104h44v-14M60 90h44V70M112 70h44V46M164 46h44V18" />
    <path d="M52 104V90M104 90V70M156 70V46M208 46V18" />
    <circle cx="208" cy="18" r="5.5" />`,

  /** Kick Off — the halfway line and the centre circle, straight off a pitch.
      The penalty boxes were in here too and read as stray rectangles once the
      viewBox cropped them; the kick-off spot is the whole idea anyway. */
  pitch: `
    <path d="M150 -10v140" />
    <circle cx="150" cy="60" r="34" />
    <circle cx="150" cy="60" r="3.5" />
    <path d="M262 6a54 54 0 0 1 0 108" />`,

  /** Settings — faders, the same drawing as the menu tile's icon. */
  faders: `
    <path d="M40 12v26M40 58v50M110 12v58M110 90v18M180 12v14M180 46v62M250 12v40M250 72v36" />
    <circle cx="40" cy="48" r="9" /><circle cx="110" cy="80" r="9" />
    <circle cx="180" cy="36" r="9" /><circle cx="250" cy="62" r="9" />`,

  /** Career Mode — a season's fixture grid. */
  season: `
    <path d="M14 22h272M14 60h272M14 98h272" />
    <path d="M82 8v104M150 8v104M218 8v104" />
    <circle cx="116" cy="41" r="7" /><circle cx="184" cy="79" r="7" />`,
};

/**
 * @param {object} o
 *   kicker  the small line above the title, e.g. "MODE 01"
 *   title   the display word — set in the cover's italic, so keep it short
 *   sub     one line of small print under it; optional
 *   motif   which drawing sits behind the swoosh
 *   tone    'a'..'d', the same accent shades the menu tiles use, so a screen
 *           keeps the colour of the tile it was opened from
 */
export function screenHead({ kicker, title, sub = '', motif = 'pitch', tone = 'a' }) {
  return `
    <header class="screen-head tone-${tone}">
      <svg class="sh-motif" viewBox="0 0 300 120" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"
           fill="none" stroke="currentColor" stroke-width="2.4"
           stroke-linecap="round" stroke-linejoin="round">${MOTIFS[motif] || MOTIFS.pitch}</svg>
      <!-- the cover's swoosh, the one motif shared by the title screen, the app
           icon, the menu tiles and now every screen behind them -->
      <svg class="sh-swoosh" viewBox="0 0 300 190" preserveAspectRatio="none" aria-hidden="true">
        <path class="ts-a" d="M120 200 L182 196 L312 34" />
        <path class="ts-b" d="M150 202 L206 200 L312 74" />
      </svg>
      <p class="sh-kicker">${kicker}</p>
      <h1 class="sh-title">${title}</h1>
      ${sub ? `<p class="sh-sub">${sub}</p>` : ''}
    </header>`;
}
