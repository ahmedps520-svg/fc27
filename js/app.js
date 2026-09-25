import { loadState, getState, update } from './state.js';
import * as Menu from './screens/menu.js';
import * as Splash from './screens/splash.js';
import * as live from './live.js';
import { startPadMenu, resetPadFocus } from './padMenu.js';
import { resumeAudio, startMusic, stopMusic, sfx, setAudioSettings } from './audio.js';
import * as api from './net/api.js';
import * as net from './net/socket.js';
import { adoptCloudSave, cloudWins, save, recoveredFrom } from './state.js';
import { isRealConflict, chooseSave } from './components/saveConflict.js';
import { backupNow } from './saveSafety.js';
import * as crashGuard from './crash.js';
import { persistent } from './storage.js';
import { setBindings, setToggles, setPadTuning } from './game/input.js';
import { applyLanguage } from './i18n.js';

/* v87: code-split. The title screen and the menu ship with the boot; every
 * other screen is its own chunk, fetched the first time it is visited (and
 * prefetched in the background once the menu is up, so it rarely waits).
 * The service worker precaches all of them, so offline play is unchanged. */
const SCREENS = { splash: Splash, menu: Menu };
const LAZY = {
  world: () => import('./screens/world.js'),
  stadiums: () => import('./screens/stadiums.js'),
  builder: () => import('./screens/builder.js'),
  pro: () => import('./screens/pro.js'),
  street: () => import('./screens/street.js'),
  skills: () => import('./screens/skills.js'),
  squad: () => import('./screens/squad.js'),
  career: () => import('./screens/career.js'),
  quick: () => import('./screens/quickmatch.js'),
  settings: () => import('./screens/settings.js'),
  match: () => import('./screens/match.js'),
  play: () => import('./screens/play.js'),
  online: () => import('./screens/online.js'),
  today: () => import('./screens/today.js'),
  trophies: () => import('./screens/trophies.js'),
  weekend: () => import('./screens/weekend.js'),
};
const loading = new Map();
/** Fetch a screen's chunk (once). Resolves to the module. */
export function loadScreen(name) {
  if (SCREENS[name]) return Promise.resolve(SCREENS[name]);
  if (!LAZY[name]) return Promise.reject(new Error(`no screen ${name}`));
  if (!loading.has(name)) {
    loading.set(name, LAZY[name]().then((mod) => { SCREENS[name] = mod; return mod; }, (err) => { loading.delete(name); throw err; }));
  }
  return loading.get(name);
}
/** Warm every chunk, a few at a time, when the device is idle. */
export function prefetchScreens() {
  const names = Object.keys(LAZY).filter((n) => !SCREENS[n]);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  const next = () => { const n = names.shift(); if (!n) return; loadScreen(n).catch(() => {}).finally(() => idle(next)); };
  idle(next);
}
window.__apexScreen = () => current;        // v88: which screen is up, for the controller test
let navToken = 0;
let prefetched = false;

/**
 * The one colour.
 *
 * There used to be a picker offering five of these. It is gone, and so is the
 * choice: APEX green is not decoration, it is the cover, the app icon, the
 * swooshes on every tile and banner, and the mark on the top bar. A magenta
 * build of this game was a different game wearing its badge, and every screen
 * designed since had to be checked against five palettes instead of one.
 *
 * `deep` is the shade the bright accent grades into — the wordmark's vertical
 * gradient, the swoosh's shadow half, the START button.
 */
const GREEN = { accent: '#23c55e', deep: '#0f9e56', soft: 'rgba(35,197,94,.18)' };

/** Shown in Settings so a player can say which build they are actually on. */
export const APP_VERSION = 'v116';

const root = document.getElementById('screen');
const title = document.getElementById('topTitle');
const backBtn = document.getElementById('backBtn');
const coinsEl = document.getElementById('coins');
const ultEl = document.getElementById('ultCoins');

let current = 'menu';
let activeCleanup = null;

export function applyTheme() {
  const s = getState().settings;
  applyLanguage();
  document.documentElement.style.setProperty('--accent', GREEN.accent);
  document.documentElement.style.setProperty('--accent-deep', GREEN.deep);
  document.documentElement.style.setProperty('--accent-soft', GREEN.soft);
  document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
}

export function refreshCoins() {
  const c = getState().club;
  coinsEl.textContent = (c.apex || 0).toLocaleString();
  if (ultEl) ultEl.textContent = (c.ultimate || 0).toLocaleString();
}

// Career is shut for now. Guarding the route rather than only the tile means a
// resume shortcut, a controller focus or an old deep link can't slip past it.
/* Career unlocked in v59 — Manager Mode shipped. The lock mechanism stays for
 * whatever needs it next; Player Mode is gated inside the career screen, where
 * it can look like a plan instead of a dead tile. */
const LOCKED = {};

/**
 * Send the screen you are leaving on its way.
 *
 * Navigation used to replace `innerHTML` outright, so the old screen did not
 * leave — it ceased. The incoming one faded up over whatever was behind it,
 * which is why opening a tile felt like a page load rather than like going
 * somewhere: nothing acknowledged the thing you had just pressed.
 *
 * The outgoing nodes are **moved**, not cloned, into a fixed-position ghost
 * sitting exactly where the screen was. Moving is cheaper than cloning and
 * pixel-identical, and it is safe because `activeCleanup()` has already run by
 * this point — the listeners on those nodes are finished with, and the ghost is
 * dropped a few hundred milliseconds later regardless.
 *
 * `navigate` stays **synchronous**. Nothing waits on an animation to swap the
 * DOM, so no caller has to learn that navigating is now asynchronous, and a
 * second navigation landing mid-transition just replaces the ghost.
 *
 * @param {boolean} back true when heading up to the hub, which reverses the
 *   direction the old screen travels — going in pushes it away from you, coming
 *   back drops it towards you.
 */
let ghostEl = null;
function ghostOut(back) {
  if (!root.firstChild) return;
  // The match screen owns a WebGL canvas and its own veil; ghosting it would
  // mean carrying a dead canvas around for the length of an animation.
  if (current === 'play' || current === 'splash') return;
  if (getState().settings.reduceMotion) return;

  ghostEl?.remove();
  const r = root.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = `screen-ghost ${back ? 'is-back' : ''}`;
  ghost.style.cssText =
    `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${Math.max(0, r.height)}px`;
  while (root.firstChild) ghost.appendChild(root.firstChild);
  document.body.appendChild(ghost);
  ghostEl = ghost;
  const drop = () => { ghost.remove(); if (ghostEl === ghost) ghostEl = null; };
  ghost.addEventListener('animationend', drop, { once: true });
  // belt and braces: an interrupted animation never fires animationend
  setTimeout(drop, 600);
}

export function navigate(name, params = {}) {
  if (LOCKED[name]) {
    toast(LOCKED[name], 'info');
    if (current !== 'menu') navigate('menu');
    return;
  }
  const token = ++navToken;
  if (!SCREENS[name]) {
    // not fetched yet: show a light spinner if it takes a moment, then come back
    const spin = setTimeout(() => { if (token === navToken) document.body.classList.add('screen-loading'); }, 150);
    loadScreen(name).then(() => {
      clearTimeout(spin); document.body.classList.remove('screen-loading');
      if (token === navToken) navigate(name, params);
    }, (err) => {
      clearTimeout(spin); document.body.classList.remove('screen-loading');
      crashGuard.crash(err, `load:${name}`);
      toast('That screen could not load — check your connection', 'warn');
    });
    return;
  }
  if (typeof activeCleanup === 'function') activeCleanup();
  activeCleanup = null;
  // v93: a screen that was listening for a controller button (Settings, the
  // side select) never leaves the menu's pad driver switched off behind it
  document.body.classList.remove('pad-capture');
  /* Overlays that were appended to <body> — a pack reveal opened from the
   * locker, a card detail — belong to the screen that opened them. Leaving
   * that screen mid-reveal used to leave the overlay sitting over every
   * screen after it, with nothing underneath that could close it. */
  for (const id of ['packOverlay', 'detailOverlay']) {
    const el = document.getElementById(id);
    if (el && el.parentElement === document.body) el.remove();
  }

  // The hub is the only place you go *back* to, so it is what names the
  // direction — everything else is deeper in.
  if (current !== name) ghostOut(name === 'menu' || name === 'splash');

  current = name;
  const mod = SCREENS[name];
  root.classList.remove('screen-in');
  root.style.animation = '';        // re-arm: the listener below nulls it
  root.innerHTML = mod.render(params);
  // force reflow so the entry animation replays on every navigation
  void root.offsetWidth;
  root.classList.add('screen-in');
  root.scrollTop = 0;
  window.scrollTo({ top: 0 });

  title.textContent = mod.TITLE || 'APEX XI';
  backBtn.hidden = name === 'menu' || name === 'splash';
  document.body.classList.toggle('on-splash', name === 'splash');
  /* THE SCROLL-WHEEL FIX. `body.in-game` carries `overflow: hidden`, and it
   * used to be owned entirely by the play screen — added in its mount, removed
   * deep in its cleanup, *after* `gl.dispose()` and the crowd audio teardown.
   * Either of those throwing (real GPU drivers do) skipped the removal, and
   * the page was left unscrollable everywhere until a reload. Reported three
   * times as "the wheel doesn't work"; never reproduced here because the test
   * runs never played a match first. Navigation owns the class now: arriving
   * anywhere that is not the match clears it, whatever happened to the match. */
  document.body.classList.toggle('in-game', name === 'play');
  // the key-art backdrop lives on body, not in the screen — a fixed layer
  // inside .screen would ride the entry animation's containing block
  document.body.classList.toggle('on-menu', name === 'menu');

  try {
    if (typeof mod.mount === 'function') {
      const cleanup = mod.mount(root, params) || null;
      /* v86: a screen that navigates while it is still mounting (a redirect,
         a button the pad clicked in the same tick) has already been replaced:
         the screen now showing set its own cleanup. Assigning this one over it
         leaked the new screen's listeners and left this one's timers running
         against a DOM that was gone ("Cannot set properties of null" from the
         quick-match pad poll). Run it now instead. */
      if (token === navToken) activeCleanup = cleanup;
      else if (typeof cleanup === 'function') { try { cleanup(); } catch { /* it was never on screen */ } }
    }
  } catch (err) {
    /* A screen that throws while mounting used to leave whatever half of it
     * had rendered, with no way out but the browser's back button. Show the
     * card, and if this was not already the menu, fall back to it. */
    crashGuard.crash(err, `mount:${name}`);
    if (name !== 'menu') { navigate('menu'); return; }
  }
  resetPadFocus();
  if (name === 'menu' && !prefetched) { prefetched = true; setTimeout(prefetchScreens, 1500); }
  // music belongs to the front end only; the match runs its own crowd bed
  if (name === 'play') stopMusic(); else startMusic();
  refreshCoins();
}

/** Toast notification used across screens. */
export function toast(msg, kind = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, 2400);
}

/* The entry animation must not outlive itself.
 *
 * `screenIn` animates `transform`, and an animation that fills keeps the
 * element computing an identity matrix even though its last keyframe says
 * `none`. Any transform — identity included — makes `.screen` the containing
 * block for `position: fixed`, which pinned the Ultimate XI dock to the page
 * instead of the viewport. Clearing the element's *own* animation once it has
 * played hands fixed positioning back; the class stays on, so the staggered
 * panel animations scoped under it are untouched. `navigate` re-arms it. */
root.addEventListener('animationend', (e) => {
  if (e.target === root) root.style.animation = 'none';
});

/* The page owns the wheel.
 *
 * History: `body.in-game` was left stuck after a match (fixed); panels clipping
 * with `overflow: hidden` latched the gesture and never chained (fixed with
 * `overflow: clip`); and the wheel *still* did not work on the reporter's
 * machine. Three causes, three fixes, one symptom — so this stops diagnosing.
 *
 * Whenever no element under the pointer can actually take the scroll, this
 * takes the wheel off the browser and applies it to the page itself. It does
 * not care *why* the browser was not going to scroll the page — a latched
 * clipping box, a scroller it picked that cannot move, something none of us
 * has thought of yet. If nothing between the pointer and the page can consume
 * the delta, the page gets it.
 *
 * What still behaves normally, because the walk finds a scroller that can move:
 * the collection list, the store shelves, any overlay with its own scroll. And
 * it stays out of the way entirely during a match and under pinch-zoom.
 *
 * `deltaY` is applied as-is, which means no smooth-scroll easing on the frames
 * it handles. That is the trade: a page that scrolls slightly less prettily
 * beats a page that does not scroll. */
const LINE_HEIGHT = 16;         // deltaMode 1 counts lines
const wheelLog = [];            // last few events, for the Settings diagnostic

export function wheelDiagnostics() { return wheelLog.slice(); }

window.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.defaultPrevented) return;                  // pinch zoom
  if (document.body.classList.contains('in-game')) return;      // the match owns its input
  const dy = e.deltaY * (e.deltaMode === 1 ? LINE_HEIGHT : e.deltaMode === 2 ? innerHeight : 1);
  if (!dy) return;

  let inner = null;
  const chain = [];
  for (let n = e.target instanceof Element ? e.target : null; n; n = n.parentElement) {
    if (n === document.body || n === document.documentElement) break;
    const room = n.scrollHeight - n.clientHeight;
    const oy = getComputedStyle(n).overflowY;
    if (chain.length < 5) chain.push(`${n.tagName.toLowerCase()}.${String(n.className || '').split(' ')[0]}(${oy},${room})`);
    if (room <= 0) continue;
    if (oy === 'auto' || oy === 'scroll' || oy === 'overlay') {
      // a real scroller with somewhere left to go in this direction: its scroll
      if (dy > 0 ? n.scrollTop < room - 1 : n.scrollTop > 1) { inner = n; break; }
    }
  }

  const doc = document.scrollingElement || document.documentElement;
  const before = doc.scrollTop;
  const room = doc.scrollHeight - doc.clientHeight;
  let took = false;
  if (!inner && room > 0 && (dy > 0 ? before < room - 1 : before > 1)) {
    e.preventDefault();
    doc.scrollTop = before + dy;
    took = true;
  }
  if (wheelLog.length >= 6) wheelLog.shift();
  wheelLog.push({
    dy: Math.round(dy), mode: e.deltaMode, took, inner: inner ? inner.className || inner.tagName : null,
    from: Math.round(before), to: Math.round(doc.scrollTop), room: Math.round(room), chain,
  });
}, { capture: true, passive: false });

backBtn.addEventListener('click', () => { sfx('back'); navigate('menu'); });
document.getElementById('homeBtn').addEventListener('click', () => { sfx('back'); navigate('menu'); });

/* -------------------------------- audio -------------------------------- */
// Browsers will not let a page make noise until it has been interacted with —
// there is no way around that rule, so the job is to take the very first chance
// going. Every plausible first interaction is listened for (not just a button:
// a scroll, a stray tap, a key, a pad button all count), the attempt is made
// again whenever the tab comes back to the foreground, and the listeners take
// themselves off once sound is actually running.
const AUDIO_GESTURES = [
  'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown',
  'keydown', 'click', 'wheel', 'scroll',
];

function tryStartAudio() {
  if (!document.body.classList.contains('in-game')) startMusic();
  return resumeAudio().then((running) => {
    if (running) AUDIO_GESTURES.forEach((ev) => window.removeEventListener(ev, tryStartAudio, true));
    return running;
  });
}

AUDIO_GESTURES.forEach((ev) =>
  window.addEventListener(ev, tryStartAudio, { capture: true, passive: true }));
// Coming back to the tab or unlocking the phone leaves the context suspended.
document.addEventListener('visibilitychange', () => { if (!document.hidden) tryStartAudio(); });
window.addEventListener('focus', tryStartAudio);

// a click on anything actionable gets a UI blip
document.addEventListener('click', (e) => {
  if (document.body.classList.contains('in-game')) return;
  if (e.target.closest('button, [data-go], [data-utab], [data-nav], .tile, .coll-item')) sfx('select');
}, true);

crashGuard.setVersion(APP_VERSION);
crashGuard.install();
loadState();
setBindings(getState().settings.controls);   // v82: the player's own button map
setToggles({ sprint: !!getState().settings.sprintToggle });   // v87: hold or toggle
setPadTuning({ deadzone: getState().settings.padDeadzone, curve: getState().settings.padCurve });   // v90: stick deadzone and response
applyTheme();
/* Live content: the copy the save remembers is adopted first so the week's
 * event is known offline, then the server's file replaces it when it lands. */
{
  const kept = getState().flags?.live;
  if (kept?.data) live.adopt(kept.data, kept.at);
  live.refresh().then((data) => {
    if (!data) return;
    update((s) => { s.flags.live = { data, at: Date.now() }; });
    if (current === 'menu' || current === 'today') navigate(current);
  });
}
if (!persistent()) {
  // once, quietly: the game works, the save just will not outlive the tab
  setTimeout(() => toast('Storage is blocked in this browser — progress will not be kept after you close the tab. Sign in to save to the cloud.', 'warn'), 2500);
}
{
  const a = getState().settings;
  setAudioSettings({
    enabled: a.sound !== false,
    music: a.musicVol ?? 0.5,
    sfx: a.sfxVol ?? 0.9,
  });
}
navigate('splash');   // every state mutation persists through update(), so no unload hook needed
/* Warm the 3D renderer once the front end is idle. It is no longer part of
 * boot (see play.js), which is what makes the menu fast on a slow line; this
 * fetches it a few seconds later so the first Kick Off does not pay for it
 * either. Skipped when the browser says the player is saving data. */
setTimeout(() => {
  if (navigator.connection?.saveData) return;
  import('./game/renderGL.js').catch(() => { /* the match screen retries and has its own fallback */ });
}, 6000);
startPadMenu();       // whole front-end is drivable from a controller
// One speculative attempt now that the saved volumes are in: an installed PWA,
// or a browser that already trusts this site, starts playing with no
// interaction at all. Everywhere else this is a no-op and the listeners above
// pick it up on the first touch.
tryStartAudio();

// v87: a damaged save was replaced by the newest backup — say so, once
if (recoveredFrom) setTimeout(() => toast(`Your save was damaged, so the backup from ${new Date(recoveredFrom).toLocaleDateString()} was restored. The damaged copy is kept.`, 'warn'), 1200);

/* ------------------------------ account ------------------------------ */
// Resume a stored session in the background. If the account holds more progress
// than this device does — or carries an operator correction — that copy wins;
// otherwise the local one is pushed up. See `cloudWins`.
api.resume().then(async (d) => {
  if (!d) return;
  // v87: a real conflict is the player's call (the loser is kept as a backup)
  let useCloud;
  if (isRealConflict(d.save, getState())) {
    useCloud = (await chooseSave(getState(), d.save)) === 'cloud';
    backupNow(JSON.stringify(useCloud ? getState() : d.save));
    if (!useCloud) save();
  } else useCloud = cloudWins(d.save, getState());
  if (useCloud) {
    adoptCloudSave(d.save);
    applyTheme();
    refreshCoins();
    if (current === 'menu') navigate('menu');
  }
  net.connect();
}).catch(() => { /* offline — the game is fully playable without the server */ });

/* ----------------------------- mobile / PWA ----------------------------- */
// The rotate-your-device wall is gone (v74): every screen works in portrait, and a
// match simply uses the width it has.

// Safari fires a synthetic double-tap zoom that steals taps from the touch stick.
// v100: its pinch is stopped only in a match — menus may be zoomed (accessibility).
document.addEventListener('gesturestart', (e) => { if (document.body.classList.contains('in-game')) e.preventDefault(); });
document.addEventListener('dblclick', (e) => e.preventDefault());

/* ------------------------------------------------------------------ *
 * Updates
 *
 * Registering a service worker and then never speaking to it again is how an
 * installed game gets stuck on the build it was installed with. A home-screen
 * PWA is rarely closed, so the page can sit on an old worker indefinitely:
 * the new one downloads, installs, and then waits politely forever.
 *
 * So: check for a new worker on load and every time the app comes back to the
 * foreground, tell a waiting one to take over, and reload once when it does.
 * ------------------------------------------------------------------ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // updateViaCache 'none' keeps the browser from answering the update
      // check out of its own HTTP cache, which is the classic reason an
      // update never lands however many times you reopen the app
      const reg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });

      const nudge = () => {
        if (reg.waiting) reg.waiting.postMessage('skip-waiting');
      };
      nudge();
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          // only a *replacement* matters; the very first install has no
          // controller and must not trigger a reload
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            // installed and waiting; the gate on the next launch offers it
            nudge();
          }
        });
      });

      const check = () => { reg.update().catch(() => {}); };
      check();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      // and hourly, for a session left open on a tablet all afternoon
      setInterval(check, 60 * 60 * 1000);
    } catch { /* offline play just won't be available */ }
  });

  // Deliberately no reload on `controllerchange`. A new worker taking over
  // mid-session used to reload the page immediately, which could happen during
  // a match. The title screen's update gate is the only place the app restarts
  // itself now, and it does so because somebody pressed a button.
}
