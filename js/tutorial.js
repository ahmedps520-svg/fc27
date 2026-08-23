/**
 * The guided tour.
 *
 * A spotlight walk through the real interface — not a slideshow of pictures of
 * it. Every step points at an element that is actually on screen, and the tour
 * gets there by clicking the same tabs and tiles a player would, so it can
 * never drift out of sync with the app the way a hand-drawn walkthrough does.
 * If a tab is renamed the tour breaks loudly in testing rather than quietly
 * teaching the wrong thing.
 *
 * Three pieces:
 *
 *   - **The scrim** is one element with a very large spread `box-shadow`. The
 *     "hole" is the element itself; everything outside it is shadow. That is
 *     far cheaper than an SVG mask or four separate edge panels, and it moves
 *     and resizes as one box.
 *   - **The card** carries the text, and flips above or below the target
 *     depending on which side has room.
 *   - **The arrow** is on the card, pointing back at the hole, so the link
 *     between "read this" and "look at that" never has to be guessed.
 *
 * Positioning runs on an animation frame while the tour is open rather than
 * once per step. Steps land in the middle of the screen transition, the target
 * may still be sliding, panels stagger in underneath it, and the page can
 * scroll — measuring once would put the spotlight where the element used to be.
 * It is one `getBoundingClientRect` a frame on a single element.
 */
import { navigate } from './app.js';
import { getState, update } from './state.js';
import { sfx } from './audio.js';

/* ------------------------------- icons -------------------------------- *
 * Same 24-unit grid and stroke weight as the menu tiles, so the tour looks
 * like part of the game rather than a widget bolted onto it.               */
const I = {
  ball: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4z"/><path d="M12 3.6v3.6M15.4 9.7l3.4-1.1M14.1 13.7l2.1 2.9M9.9 13.7l-2.1 2.9M8.6 9.7L5.2 8.6"/>',
  card: '<path d="M7.5 3.5h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M9.5 7.5h3M9.5 10h2"/><circle cx="12" cy="14" r="1.6"/>',
  pack: '<path d="M5.5 7.5h13v11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z"/><path d="M4.5 4.5h15v3h-15z"/><path d="M12 7.5v13"/>',
  ladder: '<path d="M7 20V5M17 20V5M7 8.5h10M7 12.5h10M7 16.5h10"/>',
  target: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.6v1.2A3.4 3.4 0 0 0 9 10.1M16 5.5h2.4v1.2A3.4 3.4 0 0 1 15 10.1"/><path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7.6l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z"/>',
  faders: '<path d="M6 4.5v5M6 14.5v5M12 4.5v9M12 18.5v.9M18 4.5v2M18 11.5v8"/><circle cx="6" cy="12" r="2.3"/><circle cx="12" cy="16" r="2.3"/><circle cx="18" cy="9" r="2.3"/>',
  flag: '<path d="M6 21V4M6 5h11l-2.2 3.6L17 12H6"/>',
  wand: '<path d="M4 20l9-9M14.5 4.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9zM19 13l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/>',
};

const icon = (name) => `
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none"
       stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
       stroke-linejoin="round">${I[name] || I.ball}</svg>`;

/** A key/button pill, used by the control map. */
const key = (k) => `<kbd>${k}</kbd>`;

/* ------------------------------- content ------------------------------ *
 * `screen` is navigated to before the step is shown; `tab` clicks a tab on
 * the Ultimate XI screen. `target` is what gets the spotlight — leave it out
 * for a centred card with no hole, which is how a chapter introduces itself.  */
const STEPS = [
  /* ---- 1. welcome ---- */
  {
    chapter: 'Welcome', icon: 'ball', screen: 'menu',
    title: 'Welcome to APEX XI',
    body: `A football game and a card-collecting game in one. You play matches,
           earn currency, open packs, and build a squad good enough to climb the
           ladder.<p class="tut-note">This takes about a minute. You can leave
           at any point, and restart it later from Settings.</p>`,
  },
  {
    chapter: 'Welcome', icon: 'flag', screen: 'menu', target: '.tile-grid',
    title: 'Four doors',
    body: `Everything lives behind one of these. <b>Kick Off</b> is a one-off
           match. <b>Ultimate XI</b> is the long game — squad, packs, ladder.
           Career Mode is still being built.`,
  },

  /* ---- 2. kick off ---- */
  {
    chapter: 'Kick Off', icon: 'ball', screen: 'menu', target: '[data-go="quick"]',
    title: 'Start here',
    body: `Pick two teams and play. Nothing is spent and nothing is earned —
           it is the place to get a feel for the football before any of it
           counts.`,
  },
  {
    chapter: 'Kick Off', icon: 'wand', screen: 'menu',
    title: 'Moving and passing',
    body: `<div class="tut-keys">
             <div><span>${key('W A S D')} ${key('◀ ▲ ▶ ▼')}</span><em>Move — or the left half of a touchscreen</em></div>
             <div><span>${key('Space')} ${key('✕')}</span><em>Pass — hold for a longer ball</em></div>
             <div><span>${key('K')} ${key('◯')}</span><em>Shoot — hold for power</em></div>
             <div><span>${key('J')} ${key('□')}</span><em>Cross</em></div>
             <div><span>${key('L')} ${key('△')}</span><em>Through ball</em></div>
           </div>
           <p class="tut-note">Hold a button and let go when the bar is where
           you want it. Tapping is a soft pass; holding is a raking one.</p>`,
  },
  {
    chapter: 'Kick Off', icon: 'target',
    title: 'Defending',
    body: `<div class="tut-keys">
             <div><span>${key('Q')} ${key('L1')}</span><em>Switch to the nearest player</em></div>
             <div><span>${key('Shift')} ${key('R2')}</span><em>Sprint</em></div>
             <div><span>Any action button</span><em>Tackle — one committed lunge</em></div>
           </div>
           <p class="tut-note">There is one tackle and it commits. Thrown from
           close in it is a fair challenge; stretched from range it is a foul,
           and in the box that is a penalty. Timing is the whole skill.</p>`,
  },

  /* ---- 3. ultimate xi ---- */
  {
    chapter: 'Ultimate XI', icon: 'card', screen: 'menu', target: '[data-go="squad"]',
    title: 'The main mode',
    body: `Everything that carries over lives here: your squad, your cards, your
           money and your rank. The rest of the tour is inside it.`,
  },
  {
    chapter: 'Ultimate XI', icon: 'flag', screen: 'squad', target: '#uTabs',
    title: 'Six tabs',
    body: `<b>Club</b> is your team. <b>Apex Division</b> is the ladder.
           <b>Objectives</b> and <b>Challenges</b> are things to chase.
           <b>Store</b> is where packs are bought. We will take them in order.`,
  },

  /* ---- 4. the squad ---- */
  {
    chapter: 'Your squad', icon: 'card', screen: 'squad', tab: 'club', target: '#pitch',
    title: 'Your eleven',
    body: `Tap an empty slot, then tap a card to place it. Tap a placed card to
           pick it up again. You need eleven players and at least one
           goalkeeper before you can play a ranked match.`,
  },
  {
    chapter: 'Your squad', icon: 'target', screen: 'squad', tab: 'club', target: '.sb-metrics',
    title: 'Rating and chemistry',
    body: `Rating is how good the eleven are. <b>Chemistry</b> rewards players
           who share a club or a nation — a squad that fits together plays
           better than the same cards thrown in at random.`,
  },

  /* ---- 5. packs ---- */
  {
    chapter: 'Packs', icon: 'flag', screen: 'squad', tab: 'store', target: '#sSubs',
    title: 'Three sections',
    body: `<b>Packs</b> is the shop. <b>Locker</b> holds what you have bought,
           to open when you like. <b>Icon Exchange</b> is the one place that
           sells an exact Icon.`,
  },
  {
    chapter: 'Packs', icon: 'pack', screen: 'squad', tab: 'store', stab: 'packs', target: '.store-pack:nth-child(3)',
    title: 'Packs that promise something',
    body: `Most packs are a roll of the dice. Some guarantee a card — a
           goalkeeper, a minimum rating, an Icon. If a pack promises it, you
           will get it, every time.`,
  },
  {
    chapter: 'Packs', icon: 'wand', screen: 'squad', tab: 'store', stab: 'locker', target: '.locker',
    title: 'Opening them',
    body: `Packs go to your locker rather than opening on the spot, so you can
           save them. Cards are revealed worst to best, so a pack always builds
           to its biggest name.`,
  },

  /* ---- 6. the ladder ---- */
  {
    chapter: 'Apex Division', icon: 'ladder', screen: 'squad', tab: 'division', target: '.div-hero',
    title: 'Eleven rungs',
    body: `Start in Division 10 and win your way to Apex Elite. Win enough in a
           division and you go up; the opposition gets sharper every rung.`,
  },
  {
    chapter: 'Apex Division', icon: 'coin', screen: 'squad', tab: 'division', target: '.wallet, .coin-chip',
    title: 'What a match pays',
    body: `Every match pays <b>Apex</b> — more for winning, more again for the
           division you are in and how much of the ball you had. Apex buys
           packs. <b>Ultimate</b> is the rarer second currency, and the only
           thing that buys the exact Icon you want.`,
  },

  /* ---- 7. objectives ---- */
  {
    chapter: 'Objectives', icon: 'target', screen: 'squad', tab: 'objectives', target: '.obj-climb',
    title: 'A 32-rung ladder',
    body: `You hold seven at a time out of thirty-two. This bar is the whole
           run; the marker is where the rungs that pay Ultimate begin.`,
  },
  {
    chapter: 'Objectives', icon: 'ladder', screen: 'squad', tab: 'objectives', target: '.obj-list',
    title: 'They tick themselves',
    body: `Nothing to claim — play matches and these fill in. Finish one and it
           is replaced at the next refresh, and anything you are close to
           finishing is highlighted.`,
  },

  /* ---- 8. challenges ---- */
  {
    chapter: 'Challenges', icon: 'trophy', screen: 'squad', tab: 'challenges', target: '.sbc-list',
    title: 'Trade cards for better ones',
    body: `Squad-building challenges ask for a set of cards — a rating, a
           nation, a position — and hand back something better. It is what
           duplicates and cards you will never field are for.`,
  },

  /* ---- 9. settings ---- */
  {
    chapter: 'Settings', icon: 'faders', screen: 'settings', target: '.panel:first-of-type',
    title: 'Where to find help',
    body: `Support, the changelog and this tour all live at the top of Settings.
           <b>Replay tutorial</b> brings you back here whenever you want.`,
  },
  {
    chapter: 'Settings', icon: 'wand', screen: 'settings', target: '#qualitySeg',
    title: 'If the match runs rough',
    body: `Drop <b>3D detail</b> a notch — the game ships on its highest setting
           so you can see what it looks like, which is more than some devices
           can hold. <b>Show FPS</b> puts a frame counter in the match.`,
  },

  /* ---- 10. done ---- */
  {
    chapter: 'Done', icon: 'ball', screen: 'menu',
    title: 'That is everything',
    body: `Play a Kick Off to get a feel for it, then start the ladder in
           Ultimate XI. <p class="tut-note">Settings → Replay tutorial brings
           this back any time.</p>`,
  },
];

/* ------------------------------- engine ------------------------------- */
let live = null;

/** Chapter boundaries, so "Skip section" knows where the next one starts. */
function nextChapterIndex(from) {
  const here = STEPS[from].chapter;
  for (let i = from + 1; i < STEPS.length; i++) if (STEPS[i].chapter !== here) return i;
  return STEPS.length;
}

const chapterList = () => [...new Set(STEPS.map((s) => s.chapter))];

/**
 * Put the app where a step needs it.
 *
 * Tabs are changed by clicking the real button rather than by reaching into
 * `squad.js` for its module-level `tab`, so the tour drives the app the way a
 * player does and cannot get the screen into a state the app itself could not.
 */
function goTo(step) {
  if (step.screen && step.screen !== currentScreen()) navigate(step.screen);
  if (step.tab) {
    const btn = document.querySelector(`[data-utab="${step.tab}"]`);
    if (btn && !btn.classList.contains('on')) btn.click();
  }
  // the Store tab's own row, which has to be clicked after its parent tab has
  // rendered — hence the second lookup rather than one combined selector
  if (step.stab) {
    const btn = document.querySelector(`[data-stab="${step.stab}"]`);
    if (btn && !btn.classList.contains('on')) btn.click();
  }
}

/* `navigate` does not publish where it is, and importing a private from app.js
   for this would be worse than reading the DOM it just wrote. */
function currentScreen() {
  if (document.body.classList.contains('on-splash')) return 'splash';
  if (document.querySelector('#uTabs')) return 'squad';
  if (document.querySelector('.menu-screen')) return 'menu';
  if (document.querySelector('#forceUpdate')) return 'settings';
  return '';
}

function build() {
  const el = document.createElement('div');
  el.className = 'tut';
  el.innerHTML = `
    <div class="tut-scrim" id="tutScrim"></div>
    <div class="tut-hole" id="tutHole" hidden></div>
    <div class="tut-card" id="tutCard" role="dialog" aria-modal="true" aria-label="Tutorial">
      <i class="tut-arrow" id="tutArrow"></i>
      <header>
        <span class="tut-icon" id="tutIcon"></span>
        <div>
          <span class="tut-chapter" id="tutChapter"></span>
          <b id="tutTitle"></b>
        </div>
        <button class="tut-x" id="tutExit" title="Close tutorial" aria-label="Close tutorial">✕</button>
      </header>
      <div class="tut-body" id="tutBody"></div>
      <div class="tut-dots" id="tutDots"></div>
      <footer>
        <button class="btn ghost sm" id="tutBack">Back</button>
        <button class="btn ghost sm" id="tutSkip">Skip section</button>
        <button class="btn primary sm" id="tutNext">Next</button>
      </footer>
    </div>`;
  document.body.appendChild(el);
  return el;
}

/**
 * Start the tour.
 * @param {number} at step index to open on
 */
export function startTutorial(at = 0) {
  if (live) stopTutorial();

  const el = build();
  const hole = el.querySelector('#tutHole');
  const card = el.querySelector('#tutCard');
  const arrow = el.querySelector('#tutArrow');
  let i = Math.max(0, Math.min(STEPS.length - 1, at));
  let raf = 0;

  const chapters = chapterList();

  const place = () => {
    const step = STEPS[i];
    const t = step.target ? document.querySelector(step.target) : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!t) {
      /* No target: the card centres and the scrim does the dimming itself.
       * The hole cannot do it — with nothing to cut out there is no box to
       * cast the shadow from — so the scrim is given a background instead,
       * which is also the one case where dimming the whole screen is right. */
      hole.hidden = true;
      el.classList.add('no-target');
      arrow.hidden = true;
      card.style.left = `${Math.round((vw - card.offsetWidth) / 2)}px`;
      card.style.top = `${Math.round((vh - card.offsetHeight) / 2)}px`;
      return;
    }

    el.classList.remove('no-target');
    const r = t.getBoundingClientRect();
    const pad = 8;
    /* Clip the spotlight to the viewport.
     *
     * A target taller than the screen — the store grid is a thousand pixels of
     * packs — would otherwise put the ring off both edges and dim nothing,
     * which reads as the tour having broken. Clipped, the ring frames the part
     * you can actually see. */
    const box = {
      l: Math.max(6, r.left - pad),
      t: Math.max(6, r.top - pad),
      rt: Math.min(vw - 6, r.right + pad),
      b: Math.min(vh - 6, r.bottom + pad),
    };
    const bw = Math.max(0, box.rt - box.l);
    const bh = Math.max(0, box.b - box.t);
    hole.hidden = false;
    hole.style.left = `${box.l}px`;
    hole.style.top = `${box.t}px`;
    hole.style.width = `${bw}px`;
    hole.style.height = `${bh}px`;

    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    const gap = 16;
    // below if it fits, otherwise above
    const below = box.b + gap + ch <= vh - 8;
    const wanted = below ? box.b + gap : box.t - gap - ch;
    /* Clamped into the viewport, always.
     *
     * This is the line that stops the tour dead-ending. Position the card
     * purely relative to the target and a target below the fold puts the card
     * — and the Next button on it — off the bottom of the screen, where it
     * cannot be pressed and there is no way forward or out but a reload. */
    const top = Math.max(8, Math.min(wanted, vh - ch - 8));
    let left = box.l + bw / 2 - cw / 2;
    left = Math.max(10, Math.min(left, vw - cw - 10));
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;

    /* The arrow only earns its place when the card is still next to the thing
     * it points at. If the clamp above has moved the card away, an arrow
     * pointing at nothing is worse than none. */
    const adjacent = Math.abs(top - wanted) < 2;
    arrow.hidden = !adjacent;
    if (adjacent) {
      arrow.classList.toggle('is-up', below);
      const ax = Math.max(14, Math.min(box.l + bw / 2 - left, cw - 14));
      arrow.style.left = `${Math.round(ax)}px`;
    }
  };

  const render = () => {
    const step = STEPS[i];
    goTo(step);

    el.querySelector('#tutIcon').innerHTML = icon(step.icon);
    el.querySelector('#tutChapter').textContent =
      `${step.chapter} · ${chapters.indexOf(step.chapter) + 1} of ${chapters.length}`;
    el.querySelector('#tutTitle').textContent = step.title;
    el.querySelector('#tutBody').innerHTML = step.body;
    el.querySelector('#tutBack').disabled = i === 0;
    el.querySelector('#tutSkip').hidden = nextChapterIndex(i) >= STEPS.length;
    el.querySelector('#tutNext').textContent = i === STEPS.length - 1 ? 'Finish' : 'Next';

    el.querySelector('#tutDots').innerHTML = chapters
      .map((c, n) => `<i class="${c === step.chapter ? 'on' : ''}${
        n < chapters.indexOf(step.chapter) ? ' seen' : ''}"></i>`).join('');

    /* Bring the target into view before measuring anything. Half the steps
     * point at something below the fold on a phone, and a spotlight on a
     * thing you cannot see teaches nothing. The rAF loop tracks the scroll as
     * it happens, so the ring stays on target for the whole animation. */
    const t = step.target ? document.querySelector(step.target) : null;
    if (t) t.scrollIntoView({ block: 'center', behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });

    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');
    place();
  };

  const go = (n) => {
    if (n >= STEPS.length) { finish(); return; }
    i = Math.max(0, n);
    sfx('select');
    render();
  };

  const finish = () => {
    update((s) => { s.settings.tutorialDone = true; });
    stopTutorial();
  };

  el.querySelector('#tutNext').addEventListener('click', () => go(i + 1));
  el.querySelector('#tutBack').addEventListener('click', () => go(i - 1));
  el.querySelector('#tutSkip').addEventListener('click', () => go(nextChapterIndex(i)));
  el.querySelector('#tutExit').addEventListener('click', finish);
  // a tap on the scrim is almost always "get out of my way", not "next"
  el.querySelector('#tutScrim').addEventListener('click', finish);

  /* Let the page scroll underneath.
   *
   * The scrim has to swallow *clicks* — a stray tap landing on a tile behind it
   * would navigate away and leave the tour pointing at a screen that is no
   * longer there. But swallowing clicks swallowed the wheel with them, and a
   * tour that freezes the page reads as the app having hung: the mouse wheel
   * simply stops working and nothing says why.
   *
   * Scrolling is safe here because the spotlight is repositioned every frame,
   * so it tracks the target as the page moves rather than being left behind.
   * Wheel is forwarded by hand; touch is handed back to the browser with
   * `touch-action` in the stylesheet. */
  el.addEventListener('wheel', (e) => {
    window.scrollBy(0, e.deltaY);
  }, { passive: true });

  const onKey = (e) => {
    if (e.key === 'Escape') { finish(); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };
  window.addEventListener('keydown', onKey, true);

  const loop = () => { place(); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);

  live = {
    el,
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey, true);
      el.remove();
    },
  };
  render();
}

export function stopTutorial() {
  live?.stop();
  live = null;
}

/** Has this device been through it? */
export const tutorialSeen = () => !!getState().settings.tutorialDone;

/**
 * First run.
 *
 * Fired from the menu rather than the title screen, for the same reason the
 * release-notes card is: the title screen already owns the update gate, and
 * stacking a second interruption in front of a START button is how a game gets
 * a reputation for being in the way. By the time this runs the menu is drawn
 * behind it, so the very first thing the tour points at is already there.
 */
export function maybeStartTutorial() {
  if (tutorialSeen()) return false;
  // marked on sight, not on completion: someone who closes it after two steps
  // has decided, and being handed it again every launch is worse than missing it
  update((s) => { s.settings.tutorialDone = true; });
  startTutorial(0);
  return true;
}
