/**
 * Weekend League — the competitive weekend.
 *
 * Ten matches inside the window against opponents built to your division;
 * online division matches inside the window count too. Wins set the rank,
 * the rank sets Monday's reward. Also shows the online board for the weekend.
 */
import { getState, update } from '../state.js';
import { navigate, toast } from '../app.js';
import { screenHead } from '../components/screenHead.js';
import { divisionOpponent, divisionSkill } from '../ultimate.js';
import { ultimateSquad, chemistryFor } from './squad.js';
import { DIVISIONS } from '../state.js';
import { weekendWindow, currentWeekend, matchesLeft, rankFor, RANKS, WL_MATCHES, untilText } from '../weekend.js';
import { rewardText } from '../data/season.js';
import { packArt } from '../components/packArt.js';
import { enterFullscreen } from '../fullscreen.js';
import { apiURL } from '../net/config.js';
import { WORLD } from '../data/generator.js';
import * as net from '../net/socket.js';
import { isSignedIn } from '../net/api.js';
import { queueWeekend, cancelQueue } from './online.js';

export const TITLE = 'Weekend League';

export function render() {
  const s = getState();
  let w, tally;
  update((st) => { ({ window: w, tally } = currentWeekend(st.club)); });
  const rank = rankFor(tally.wins);
  const left = matchesLeft(tally);
  const squadReady = !!ultimateSquad();
  const head = screenHead({ kicker: 'Competitive', title: 'Weekend League', sub: w.open ? `Open · closes in ${untilText(w.closesAt)}` : `Opens in ${untilText(w.opensAt)}`, motif: 'ladder', tone: 'c' });
  return head + `
    <div class="wl">
      <section class="panel glass">
        <div class="wl-hero">
          <div class="wl-big"><b>${tally.wins}</b><span>wins</span></div>
          <div class="wl-info">
            <span class="ev-kicker">${w.open ? 'This weekend' : 'Last weekend'}</span>
            <b>${rank.name}</b>
            <span>${tally.played}/${WL_MATCHES} played · ${tally.draws}D ${tally.losses}L · ${tally.goalsFor}–${tally.goalsAgainst}</span>
            <div class="div-pips">${Array.from({ length: WL_MATCHES }, (_, i) => `<i class="${i < tally.wins ? 'on' : i < tally.played ? 'lost' : ''}"></i>`).join('')}</div>
          </div>
          ${w.open && left ? `<div class="wl-btns">
            <button class="btn primary big" id="wlPlay" ${squadReady ? '' : 'disabled'}>Play match ${tally.played + 1}</button>
            <button class="btn big" id="wlOnline" ${squadReady && isSignedIn() ? '' : 'disabled'}>Find an opponent online</button>
          </div>` : ''}
        </div>
        <div class="wl-search" id="wlSearch" hidden><span>Searching for a weekend opponent with a similar record…</span><button class="btn ghost" id="wlCancel">Cancel</button></div>
        ${!squadReady ? '<p class="setting-note warn">Fill all eleven slots of your Ultimate XI first.</p>' : ''}
        ${!w.open ? '<p class="hint">Rewards for a finished weekend are claimed on the Today screen once the window closes.</p>' : ''}
      </section>
      <section class="panel glass">
        <header class="panel-head"><h2>Ranks</h2></header>
        <div class="wl-ranks">
          ${RANKS.map((r) => `<div class="wl-rank ${rank === r ? 'on' : ''}"><b>${r.name}</b><span>${r.wins}+ wins</span><em>${rewardText({ apex: r.apex, ultimate: r.ultimate })}</em><span class="wl-packs">${r.packs.map((id) => packArt(id, { size: 'xs', label: false })).join('')}</span></div>`).join('')}
        </div>
      </section>
      <section class="panel glass" id="wlBoard">
        <header class="panel-head"><h2>Online board <small>${w.id}</small></h2></header>
        <p class="hint">Apex Division matches played online inside the window count here, validated by the server.</p>
        <div class="lb" id="wlRows"><p class="empty">Loading…</p></div>
      </section>
    </div>`;
}

export function mount(root) {
  const s = getState();
  const w = weekendWindow();
  root.querySelector('#wlPlay')?.addEventListener('click', () => {
    const squad = ultimateSquad();
    if (!squad) return toast('Fill your XI first', 'warn');
    const chem = chemistryFor(s.club.lineup, s.club.formation);
    const opp = divisionOpponent(s.ultimate.divIdx, chem.rating);
    enterFullscreen();
    // same shape as the Apex Division launch in squad.js
    navigate('play', {
      homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id,
      homeSquad: squad, awaySquad: opp,
      duration: 180, skill: divisionSkill(s.ultimate.divIdx), mode: 'single',
      weekend: w.id,
    });
  });
  root.querySelector('#wlOnline')?.addEventListener('click', () => {
    const tally = getState().club.weekend || { wins: 0 };
    if (!net.isReady()) net.connect();
    if (!queueWeekend({ id: w.id, wins: tally.wins | 0 })) return toast('Connecting… try again in a moment', 'warn');
    root.querySelector('#wlSearch').hidden = false;
  });
  root.querySelector('#wlCancel')?.addEventListener('click', () => { cancelQueue(); root.querySelector('#wlSearch').hidden = true; });
  fetch(apiURL(`/api/weekend?id=${w.id}`)).then((r) => r.json()).then((d) => {
    const el = root.querySelector('#wlRows');
    if (!el) return;
    el.innerHTML = d.rows?.length
      ? d.rows.map((r, i) => `<div class="lb-row"><i>${i + 1}</i><b>${r.name}</b><span>${r.wins}W · ${r.played} played</span><em>${rankFor(r.wins).name}</em></div>`).join('')
      : '<p class="empty">Nobody on the board yet this weekend.</p>';
  }).catch(() => { const el = root.querySelector('#wlRows'); if (el) el.innerHTML = '<p class="empty">Offline — the board needs a connection.</p>'; });
}
