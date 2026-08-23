import { loadState, getState } from './state.js';
import * as Menu from './screens/menu.js';
import * as Squad from './screens/squad.js';
import * as Career from './screens/career.js';
import * as Quick from './screens/quickmatch.js';
import * as Settings from './screens/settings.js';
import * as MatchScreen from './screens/match.js';
import * as Play from './screens/play.js';
import * as Splash from './screens/splash.js';
import * as Online from './screens/online.js';
import { startPadMenu, resetPadFocus } from './padMenu.js';
import { resumeAudio, startMusic, stopMusic, sfx, setAudioSettings } from './audio.js';
import * as api from './net/api.js';
import * as net from './net/socket.js';
import { adoptCloudSave, saveWeight } from './state.js';

const SCREENS = {
  splash: Splash, menu: Menu, squad: Squad, career: Career, quick: Quick,
  settings: Settings, match: MatchScreen, play: Play, online: Online,
};

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
export const APP_VERSION = 'v42';

const root = document.getElementById('screen');
const title = document.getElementById('topTitle');
const backBtn = document.getElementById('backBtn');
const coinsEl = document.getElementById('coins');
const ultEl = document.getElementById('ultCoins');

let current = 'menu';
let activeCleanup = null;

export function applyTheme() {
  const s = getState().settings;
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
const LOCKED = { career: 'Career Mode is under construction' };

export function navigate(name, params = {}) {
  if (LOCKED[name]) {
    toast(LOCKED[name], 'info');
    if (current !== 'menu') navigate('menu');
    return;
  }
  if (typeof activeCleanup === 'function') activeCleanup();
  activeCleanup = null;

  current = name;
  const mod = SCREENS[name];
  root.classList.remove('screen-in');
  root.innerHTML = mod.render(params);
  // force reflow so the entry animation replays on every navigation
  void root.offsetWidth;
  root.classList.add('screen-in');
  root.scrollTop = 0;
  window.scrollTo({ top: 0 });

  title.textContent = mod.TITLE || 'APEX XI';
  backBtn.hidden = name === 'menu' || name === 'splash';
  document.body.classList.toggle('on-splash', name === 'splash');

  if (typeof mod.mount === 'function') activeCleanup = mod.mount(root, params) || null;
  resetPadFocus();
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

loadState();
applyTheme();
{
  const a = getState().settings;
  setAudioSettings({
    enabled: a.sound !== false,
    music: a.musicVol ?? 0.5,
    sfx: a.sfxVol ?? 0.9,
  });
}
navigate('splash');   // every state mutation persists through update(), so no unload hook needed
startPadMenu();       // whole front-end is drivable from a controller
// One speculative attempt now that the saved volumes are in: an installed PWA,
// or a browser that already trusts this site, starts playing with no
// interaction at all. Everywhere else this is a no-op and the listeners above
// pick it up on the first touch.
tryStartAudio();

/* ------------------------------ account ------------------------------ */
// Resume a stored session in the background. If the account holds more progress
// than this device does, that copy wins — otherwise the local one is pushed up.
api.resume().then((d) => {
  if (!d) return;
  if (d.save && saveWeight(d.save) > saveWeight(getState())) {
    adoptCloudSave(d.save);
    applyTheme();
    refreshCoins();
    if (current === 'menu') navigate('menu');
  }
  net.connect();
}).catch(() => { /* offline — the game is fully playable without the server */ });

/* ----------------------------- mobile / PWA ----------------------------- */
// Ask phones to turn sideways — the pitch is a landscape view.
const rotateHint = document.getElementById('rotateHint');
const checkOrientation = () => {
  const phone = window.matchMedia('(pointer: coarse)').matches;
  const portrait = window.innerHeight > window.innerWidth;
  const short = Math.min(window.innerWidth, window.innerHeight) < 500;
  rotateHint.hidden = !(phone && portrait && short);
};
checkOrientation();
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 250));

// Safari fires a synthetic double-tap zoom that steals taps from the touch stick.
document.addEventListener('gesturestart', (e) => e.preventDefault());
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
