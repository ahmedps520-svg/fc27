/**
 * The trophy room. Every achievement on its shelf, lit when earned, with the
 * reward to collect. A cabinet, not a list: you should be able to see at a
 * glance how much of it is glass and how much is gold.
 */
import { getState } from '../state.js';
import { navigate, refreshCoins, toast } from '../app.js';
import { sfx } from '../audio.js';
import { screenHead } from '../components/screenHead.js';
import { WORLD } from '../data/generator.js';
import { ACHIEVEMENTS, GROUPS, evaluateAll } from '../data/achievements.js';
import { claimAchievement } from '../progress.js';

import { honours } from '../world.js';

import { playerCard } from '../components/playerCard.js';

import { ICONS } from '../data/pools.js';

import { flagSVG } from '../components/crest.js';

import { LEAGUES } from '../data/pools.js';
import { t } from '../i18n.js';

export const TITLE = 'Trophy Room';

const cup = (tier, lit) => `
  <svg class="cup ${tier} ${lit ? 'lit' : ''}" viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.6v1.2A3.4 3.4 0 0 0 9 10.1M16 5.5h2.4v1.2A3.4 3.4 0 0 1 15 10.1"/><path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>
  </svg>`;

/**
 * The Hall of Fame: the Icons, with a line on why each is there and whether
 * the card is in your collection, and the honours board — every finished
 * season's champions, cup winners and Nations Cup winners.
 */
const ICON_LINES = {
  flair: 'the dribble nobody could read',
  power: 'the finish that ended arguments',
  engine: 'the pass that decided the match',
  wall: 'the defender attackers went round rather than through',
  keeper: 'the last line that never moved first',
  fullback: 'the full-back who played as a winger and a defender at once',
};
function hallHTML(s) {
  const owned = new Set(s.club?.collection || []);
  const icons = WORLD.icons.map((id) => WORLD.playersById[id]);
  const board = honours();
  return `
    <section class="panel glass hall">
      <header class="panel-head"><h2>${t('trophies.hall')}</h2><span class="ph-sub">${icons.filter((p) => owned.has(p.id)).length} of ${icons.length} Icons in your collection</span></header>
      <div class="hall-grid">
        ${icons.map((p) => {
          const def = ICONS.find((d) => d.name === p.name) || {};
          return `
          <div class="hall-card ${owned.has(p.id) ? 'owned' : ''}">
            ${playerCard(p, { size: 'mini' })}
            <p class="hall-line">${flagSVG(p.nationColors, 14)} ${p.nation} · ${p.position} — ${ICON_LINES[def.trait] || 'a name the game is named after'}</p>
            ${owned.has(p.id) ? '<span class="hall-tag">In your club</span>' : '<span class="hall-tag dim">Limited Edition packs</span>'}
          </div>`;
        }).join('')}
      </div>
      ${board.length ? `
      <h3 class="wround">${t('trophies.honours')}</h3>
      <table class="wtable honours">
        <thead><tr><th>Season</th>${LEAGUES.map((l, i) => `<th title="${l}">Div ${i + 1}</th>`).join('')}<th>Continental Cup</th><th>Nations Cup</th></tr></thead>
        <tbody>
          ${board.map((h) => `<tr><td>${h.season}</td>${h.champions.map((id) => `<td>${WORLD.clubsById[id].short}</td>`).join('')}<td>${h.cup ? WORLD.clubsById[h.cup].short : '—'}</td><td>${h.nationsCup || '—'}</td></tr>`).join('')}
        </tbody>
      </table>` : '<p class="wzone">The honours board fills in when the first world season ends.</p>'}
    </section>`;
}

export function render() {
  const s = getState();
  const all = evaluateAll(s, WORLD.playersById);
  const earned = all.filter((a) => a.complete).length;
  const unclaimed = all.filter((a) => a.complete && !a.claimed);
  const head = screenHead({ kicker: t('trophies.kicker'), title: t('trophies.title'), sub: `${earned} of ${ACHIEVEMENTS.length} earned${unclaimed.length ? ` · ${unclaimed.length} to collect` : ''}`, motif: 'ladder', tone: 'b' });
  const hall = hallHTML(s);
  return head + `
    <div class="trophies">
      ${hall}
      ${unclaimed.length > 1 ? `<button class="btn primary" id="claimAll">Collect all · ◈ ${unclaimed.reduce((n, a) => n + a.apex, 0).toLocaleString()}</button>` : ''}
      ${GROUPS.map(([gid, label]) => {
        const rows = all.filter((a) => a.group === gid);
        return `
          <section class="panel glass shelf">
            <header class="panel-head"><h2>${label} <small>${rows.filter((a) => a.complete).length}/${rows.length}</small></h2></header>
            <div class="shelf-row">
              ${rows.map((a) => `
                <div class="trophy ${a.complete ? 'earned' : ''} ${a.complete && !a.claimed ? 'claimable' : ''}">
                  ${cup(a.tier, a.complete)}
                  <b>${a.name}</b>
                  <span>${a.blurb}</span>
                  <div class="trophy-bar"><i style="width:${Math.round(100 * a.have / a.need)}%"></i></div>
                  ${a.complete && !a.claimed
                    ? `<button class="btn primary" data-claim="${a.id}">◈ ${a.apex.toLocaleString()}</button>`
                    : `<em>${a.complete ? 'Collected' : `${a.have}/${a.need}`} · ${a.xp} XP</em>`}
                </div>`).join('')}
            </div>
          </section>`;
      }).join('')}
    </div>`;
}

export function mount(root) {
  const claim = (id) => { const a = claimAchievement(id); if (a) { sfx('coin'); toast(`${a.name} · ◈ ${a.apex.toLocaleString()}`, 'good'); } return !!a; };
  root.querySelectorAll('[data-claim]').forEach((b) => b.addEventListener('click', () => { if (claim(b.dataset.claim)) { refreshCoins(); navigate('trophies'); } }));
  root.querySelector('#claimAll')?.addEventListener('click', () => {
    const s = getState();
    let n = 0;
    for (const [id, r] of Object.entries(s.club.achievements || {})) if (!r.claimed && claim(id)) n += 1;
    if (n) { refreshCoins(); navigate('trophies'); }
  });
}
