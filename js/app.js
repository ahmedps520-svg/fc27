import { loadState, getState } from './state.js';
import * as Menu from './screens/menu.js';
import * as Squad from './screens/squad.js';
import * as Career from './screens/career.js';
import * as Quick from './screens/quickmatch.js';
import * as Settings from './screens/settings.js';
import * as MatchScreen from './screens/match.js';
import * as Play from './screens/play.js';
import * as Splash from './screens/splash.js';
import { startPadMenu, resetPadFocus } from './padMenu.js';
import { resumeAudio, startMusic, stopMusic, sfx, setAudioSettings } from './audio.js';

const SCREENS = {
  splash: Splash, menu: Menu, squad: Squad, career: Career, quick: Quick,
  settings: Settings, match: MatchScreen, play: Play,
};

const ACCENTS = {
  cyan:  { accent: '#41d3ff', soft: 'rgba(65,211,255,.18)' },
  lime:  { accent: '#b8ff3d', soft: 'rgba(184,255,61,.18)' },
  magenta:{ accent: '#ff2e88', soft: 'rgba(255,46,136,.18)' },
  amber: { accent: '#ffb703', soft: 'rgba(255,183,3,.18)' },
};

const root = document.getElementById('screen');
const title = document.getElementById('topTitle');
const backBtn = document.getElementById('backBtn');
const coinsEl = document.getElementById('coins');

let current = 'menu';
let activeCleanup = null;

export function applyTheme() {
  const s = getState().settings;
  const a = ACCENTS[s.accent] || ACCENTS.cyan;
  document.documentElement.style.setProperty('--accent', a.accent);
  document.documentElement.style.setProperty('--accent-soft', a.soft);
  document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
}

export function refreshCoins() {
  coinsEl.textContent = getState().club.coins.toLocaleString();
}

export function navigate(name, params = {}) {
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

// Audio can only start inside a gesture, so the first tap or key unlocks it.
const unlock = () => { resumeAudio(); if (!document.body.classList.contains('in-game')) startMusic(); };
window.addEventListener('pointerdown', unlock, { once: true });
window.addEventListener('keydown', unlock, { once: true });

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline play just won't be available */ });
  });
}
