/**
 * The first launch.
 *
 * A new save is handed a starter squad — sixteen cards dealt from the free
 * pool so a 4-3-3 can be fielded at once — shown one card, and offered a
 * guided match: sixty seconds against a gentle CPU with the controls
 * taught one at a time on the HUD. Whether they play it or skip it, they
 * land on the Today hub with their first rewards waiting to be claimed.
 *
 * Runs once (`flags.onboarded`). Saves that already have cards, or that
 * finished the old tour, are treated as onboarded and never see it.
 */
import { getState, update } from './state.js';
import { WORLD, getPlayer } from './data/generator.js';
import { navigate } from './app.js';
import { playerCard } from './components/playerCard.js';
import { pend } from './progress.js';
import { t } from './i18n.js';

const STARTER_SHAPE = ['GK', 'GK', 'CB', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'ST', 'CM'];

export function needsOnboarding() {
  const s = getState();
  if (s.flags?.onboarded) return false;
  if (s.settings?.tutorialDone) return false;
  if ((s.club?.collection || []).length > 0 || (s.club?.packsOpened || 0) > 0) return false;
  return true;
}

/** Deal the starter squad: the best unowned free agents per slot, capped at gold. */
export function dealStarter() {
  const pool = WORLD.freeAgents.map(getPlayer)
    .filter((p) => p && p.rarity !== 'icon' && p.rarity !== 'star' && !p.sbc && p.overall <= 80 && p.overall >= 68)
    .sort((a, b) => b.overall - a.overall);
  const used = new Set();
  const dealt = [];
  for (const pos of STARTER_SHAPE) {
    const p = pool.find((x) => !used.has(x.id) && x.position === pos) || pool.find((x) => !used.has(x.id) && (x.position === 'GK') === (pos === 'GK'));
    if (p) { used.add(p.id); dealt.push(p); }
  }
  update((s) => {
    for (const p of dealt) if (!s.club.collection.includes(p.id)) s.club.collection.push(p.id);
    const shape = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CDM', 'CM', 'LW', 'ST', 'RW'];
    const left = dealt.slice();
    s.club.formation = '4-3-3';
    s.club.lineup = shape.map((pos) => { const i = left.findIndex((p) => p.position === pos); return i >= 0 ? left.splice(i, 1)[0].id : null; });
    s.club.bench = left.slice(0, 5).map((p) => p.id);
  });
  return dealt;
}

/** Bank the first rewards on the Today hub and mark the save onboarded. */
export function finishOnboarding({ played }) {
  update((s) => {
    s.flags.onboarded = true;
    s.settings.tutorialDone = true;
    pend(s, { title: played ? 'First match played' : 'Welcome to APEX XI', apex: played ? 2500 : 1500, pack: 'gold' });
    pend(s, { title: 'Starter squad bonus', apex: 1000, pack: 'silver' });
  });
}

/** The welcome card over the menu. Returns a closer. */
export function showWelcome(root) {
  const dealt = dealStarter();
  const best = dealt.slice().sort((a, b) => b.overall - a.overall)[0];
  const el = document.createElement('div');
  el.className = 'onboard';
  el.id = 'onboardOverlay';
  el.innerHTML = `
    <div class="onboard-card">
      <div class="onboard-hero">${best ? playerCard(best, { size: 'md' }) : ''}</div>
      <div class="onboard-text">
        <span class="onboard-kicker">${dealt.length} cards · 4-3-3</span>
        <h2>${t('onboard.welcome')}</h2>
        <p>${t('onboard.body')}</p>
        <div class="onboard-actions">
          <button class="btn primary big" id="onboardPlay">${t('onboard.start')}</button>
          <button class="btn ghost" id="onboardSkip">${t('onboard.skip')}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.querySelector('#onboardPlay').addEventListener('click', () => {
    el.remove();
    navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[9].id, duration: 60, skill: 0.55, mode: 'single', guided: true, atmo: { time: 'day', weather: 'clear' } });
  });
  el.querySelector('#onboardSkip').addEventListener('click', () => {
    el.remove();
    finishOnboarding({ played: false });
    navigate('today');
  });
  return () => el.remove();
}

/** The guided match's lesson plan: what to watch for, in order. */
export const GUIDE_STEPS = [
  { id: 'move', key: 'guide.move', done: (m, input) => { const v = input.axis?.() || { x: 0, y: 0 }; return Math.hypot(v.x || 0, v.y || 0) > 0.3; } },
  { id: 'sprint', key: 'guide.sprint', done: (m, input) => input.held('sprint') },
  { id: 'pass', key: 'guide.pass', done: (m, input) => input.pressed('pass') },
  { id: 'shoot', key: 'guide.shoot', done: (m, input) => input.pressed('shoot') },
  { id: 'switch', key: 'guide.switch', done: (m, input) => input.pressed('switch') },
  { id: 'tackle', key: 'guide.tackle', done: (m, input) => input.pressed('pass') && m.ball.owner && m.ball.owner.team === 1 },
];
