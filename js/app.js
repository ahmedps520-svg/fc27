import { loadState, getState } from './state.js';
import * as Menu from './screens/menu.js';
import * as Squad from './screens/squad.js';
import * as Career from './screens/career.js';
import * as Quick from './screens/quickmatch.js';
import * as Settings from './screens/settings.js';
import * as MatchScreen from './screens/match.js';
import * as Play from './screens/play.js';

const SCREENS = {
  menu: Menu, squad: Squad, career: Career, quick: Quick, settings: Settings,
  match: MatchScreen, play: Play,
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
  backBtn.hidden = name === 'menu';

  if (typeof mod.mount === 'function') activeCleanup = mod.mount(root, params) || null;
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

backBtn.addEventListener('click', () => navigate('menu'));
document.getElementById('homeBtn').addEventListener('click', () => navigate('menu'));

loadState();
applyTheme();
navigate('menu');   // every state mutation persists through update(), so no unload hook needed
