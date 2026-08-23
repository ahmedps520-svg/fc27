import { getState, update } from '../state.js';
import { LATEST } from '../data/patchNotes.js';
import { sfx } from '../audio.js';

/**
 * The update card, shown over the menu the first time a player opens a build.
 *
 * Deliberately a card and not a screen. It appears after the title screen, on
 * top of the menu that is already drawn behind it, so dismissing it leaves you
 * exactly where you were going anyway — nobody is made to read patch notes to
 * reach their squad.
 *
 * It carries the short version of each change. The long version lives on
 * `notes.html`, built from the same data, and the link at the foot goes there
 * rather than duplicating the text at a second length here.
 */

/** Has this build already been announced on this device? */
export function notesPending() {
  return getState().flags.notesSeen !== LATEST.version;
}

function markSeen() {
  update((s) => { s.flags.notesSeen = LATEST.version; });
}

/** Exported so a first launch can retire the card without ever showing it —
 *  a changelog for a build you have never run is noise. See menu.js. */
export { markSeen as markNotesSeen };

const fmtDate = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
};

function cardHTML(rel) {
  return `
    <div class="np-scrim" id="npScrim"></div>
    <article class="np-card" role="dialog" aria-modal="true" aria-labelledby="npTitle">
      <header class="np-head">
        <div class="np-meta">
          <span class="np-tag">${rel.tag}</span>
          <span class="np-ver">${rel.version}</span>
          <time datetime="${rel.date}">${fmtDate(rel.date)}</time>
        </div>
        <h2 class="np-title" id="npTitle">${rel.title}</h2>
        <p class="np-lede">${rel.lede}</p>
        <button class="np-x" id="npClose" type="button" aria-label="Close">✕</button>
      </header>

      <ol class="np-list">
        ${rel.entries.map((e, i) => `
          <li class="np-item">
            <span class="np-num">${String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>${e.head}</h3>
              <p>${e.summary}</p>
            </div>
          </li>`).join('')}
      </ol>

      <footer class="np-foot">
        <a class="np-more" href="notes.html#${rel.version}" target="_blank" rel="noopener">
          Read the full notes
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h13M13 6l6 6-6 6"/>
          </svg>
        </a>
        <button class="btn primary" id="npGo" type="button">Continue</button>
      </footer>
    </article>`;
}

/**
 * Drops the card into `host` and wires it up. Marks the build as seen the moment
 * it is shown, not when it is dismissed: a player who closes the app mid-read
 * should not be handed the same card every single launch.
 *
 * @returns {() => void} cleanup, safe to call twice
 */
export function showNotes(host) {
  const rel = LATEST;
  const wrap = document.createElement('div');
  wrap.className = 'np-layer';
  wrap.innerHTML = cardHTML(rel);
  host.appendChild(wrap);
  markSeen();
  requestAnimationFrame(() => wrap.classList.add('in'));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    sfx('back');
    wrap.classList.remove('in');
    setTimeout(() => wrap.remove(), 260);
    window.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); };

  wrap.querySelector('#npClose').addEventListener('click', close);
  wrap.querySelector('#npGo').addEventListener('click', close);
  wrap.querySelector('#npScrim').addEventListener('click', close);
  // the link opens a tab of its own; the card stays put behind it
  window.addEventListener('keydown', onKey);

  return close;
}
