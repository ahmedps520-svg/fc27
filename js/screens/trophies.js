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

export const TITLE = 'Trophy Room';

const cup = (tier, lit) => `
  <svg class="cup ${tier} ${lit ? 'lit' : ''}" viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.6v1.2A3.4 3.4 0 0 0 9 10.1M16 5.5h2.4v1.2A3.4 3.4 0 0 1 15 10.1"/><path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>
  </svg>`;

export function render() {
  const s = getState();
  const all = evaluateAll(s, WORLD.playersById);
  const earned = all.filter((a) => a.complete).length;
  const unclaimed = all.filter((a) => a.complete && !a.claimed);
  const head = screenHead({ kicker: 'Cabinet', title: 'Trophy Room', sub: `${earned} of ${ACHIEVEMENTS.length} earned${unclaimed.length ? ` · ${unclaimed.length} to collect` : ''}`, motif: 'ladder', tone: 'b' });
  return head + `
    <div class="trophies">
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
