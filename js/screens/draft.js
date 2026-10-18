/**
 * v196: the Draft — the screen. js/draft.js keeps the run in the save; this
 * draws whichever step it is at and sends the one thing each step asks for:
 *
 *   entry → formation (one of three) → captain (one of five) → ten picks
 *   (one of five, slot by slot) → four knockout rounds → collect.
 *
 * A round is an ordinary Ultimate XI match (play.js `params.draft`), so a
 * draw goes to penalties there and the result comes back through
 * `settleDraft`; leaving a round part-way, or closing the app in one, is a
 * defeat.
 */
import { getState } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { sfx } from '../audio.js';
import { haptic } from '../native.js';
import { getPlayer, getClub, WORLD } from '../data/generator.js';
import { FORMATIONS, RARITY } from '../data/pools.js';
import { CLASH_THEMES } from '../modes.js';
import { playerCard } from '../components/playerCard.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { facts } from '../components/facts.js';
import { enterFullscreen } from '../fullscreen.js';
import { clubIdentity } from './squad.js';
import { tx } from '../i18n.js';
import {
  DRAFT_ENTRY, DRAFT_ROUNDS, DRAFT_REWARDS, DRAFT_DURATION, draftState, startDraft, chooseFormation, chooseCaptain,
  choosePick, draftRating, draftSquad, draftOpponent, markKickoff, settleUnfinished, abandonDraft, collectDraft, rewardFor,
} from '../draft.js';

export const TITLE = 'Draft';
const money = (n) => `◈${Math.round(n).toLocaleString()}`;
const packName = (id) => ({ silver: 'Silver', gold: 'Gold', prime: 'Prime' }[id] || id);
const rewardLine = (r) => [money(r.apex), r.pack ? `${packName(r.pack)} ${tx('pack')}` : ''].filter(Boolean).join(' + ');
const themeName = (id) => CLASH_THEMES.find((x) => x.id === id)?.name || id;
const themeColors = (id) => CLASH_THEMES.find((x) => x.id === id)?.colors || ['#888', '#222'];

/** The pitch with what is drafted so far; `now` rings the slot being filled. */
function pitchHTML(d, now = null) {
  const { per } = draftRating(d);
  return `
    <div class="pitch draft-pitch">
      <div class="pitch-lines">
        <span class="pl-halfway"></span><span class="pl-circle"></span>
        <span class="pl-box top"></span><span class="pl-box bottom"></span>
        <span class="pl-six top"></span><span class="pl-six bottom"></span>
      </div>
      ${FORMATIONS[d.formation].map((slot, i) => {
        const p = d.lineup[i] ? getPlayer(d.lineup[i]) : null;
        const r = p ? RARITY[p.rarity] : null;
        const club = p ? getClub(p.clubId) : null;
        return `<div class="slot ${p ? 'filled' : ''} ${i === now ? 'draft-now' : ''}" style="left:${slot.x}%;top:${slot.y}%${p ? `;--rar:${r.color};--rar-glow:${r.glow}` : ''}">
          ${p ? `<span class="slot-chem chem-${per[i] >= 3 ? 'hi' : per[i] >= 2 ? 'mid' : 'lo'}">${per[i]}</span>
            <span class="slot-ovr">${p.overall}</span>
            <span class="slot-crest">${club ? crestSVG(club.crest, club.short, 18) : ''}</span>
            <span class="slot-name">${p.short || p.name}${d.captain === p.id ? ' ©' : ''}</span>` : '<span class="slot-plus">+</span>'}
          <span class="slot-pos ${p ? '' : 'empty'}">${slot.pos}</span>
        </div>`;
      }).join('')}
    </div>`;
}
const shapeSVG = (name) => `<svg viewBox="0 0 100 100" class="draft-shape" aria-hidden="true">
  <rect x="2" y="2" width="96" height="96" rx="8" />${FORMATIONS[name].map((s) => `<circle cx="${s.x}" cy="${s.y}" r="5.5" />`).join('')}</svg>`;

function stats(d) {
  const { rating, chem } = draftRating(d);
  return facts([['star', `${rating} ${tx('rated')}`, 'gold'], ['heart', `${chem} ${tx('chemistry')}`, chem >= 70 ? 'good' : ''], ['trophy', `${d.wins} ${tx(d.wins === 1 ? 'win' : 'wins')}`]]);
}

function body() {
  const s = getState();
  const d = draftState();
  if (!d) {
    const st = s.club.draftStats || { runs: 0, best: 0, titles: 0 };
    const can = (s.club.apex | 0) >= DRAFT_ENTRY;
    return `
      <div class="panel glass draft-entry">
        <p>${tx('Pick a formation, a captain and ten more, each from a handful of cards — players you may not own. Then take the squad through four knockout rounds against sides that get stronger each round. A draw goes to penalties; a defeat ends the run. The cards go back when it ends: what you keep is the reward.')}</p>
        ${facts([['coin', `${tx('Entry')} ${money(DRAFT_ENTRY)}`, 'gold'], ['players', tx('4 rounds')], ['trophy', `${st.titles} ${tx('titles')} · ${tx('best')} ${st.best}`]])}
        <ul class="draft-rewards">${DRAFT_REWARDS.map((r) => `<li><b>${r.wins} ${tx(r.wins === 1 ? 'win' : 'wins')}</b><span>${rewardLine(r)}</span></li>`).join('')}</ul>
        <p class="hint">${tx('Leaving a round part-way, or closing the app during one, counts as a defeat.')}</p>
        <button class="btn primary" data-d="start" ${can ? '' : 'disabled'}>${tx('Start a draft')} · ${money(DRAFT_ENTRY)}</button>
        ${can ? '' : `<p class="hint">${tx('You need')} ${money(DRAFT_ENTRY)}.</p>`}
      </div>`;
  }
  if (d.step === 'formation') {
    return `
      <div class="panel glass">
        <h3 class="draft-step">${tx('Pick a formation')}</h3>
        <div class="draft-shapes">${d.formations.map((f) => `<button class="draft-shape-btn" data-form="${f}">${shapeSVG(f)}<b>${f}</b></button>`).join('')}</div>
        <button class="btn ghost sm" data-d="abandon">${tx('Walk away')}</button>
      </div>`;
  }
  if (d.step === 'captain' || d.step === 'pick') {
    const slot = d.step === 'pick' ? FORMATIONS[d.formation][d.slot] : null;
    const done = d.lineup.filter(Boolean).length;
    return `
      <div class="draft-layout">
        <div class="panel glass">${stats(d)}${pitchHTML(d, d.step === 'pick' ? d.slot : null)}</div>
        <div class="panel glass">
          <h3 class="draft-step">${d.step === 'captain' ? tx('Pick your captain') : `${tx('Pick your')} ${slot.pos}`} <small>${d.step === 'captain' ? '1/11' : `${done + 1}/11`}</small></h3>
          <div class="draft-offer">${d.offer.map((id) => `<button class="draft-card" data-pick="${id}">${playerCard(getPlayer(id), { size: 'md' })}</button>`).join('')}</div>
          <button class="btn ghost sm" data-d="abandon">${tx('Walk away')}</button>
        </div>
      </div>`;
  }
  if (d.step === 'cup') {
    const o = draftOpponent(d);
    return `
      <div class="draft-layout">
        <div class="panel glass">${stats(d)}${pitchHTML(d)}</div>
        <div class="panel glass">
          <h3 class="draft-step">${tx(DRAFT_ROUNDS[d.round])}</h3>
          <ol class="draft-bracket">${DRAFT_ROUNDS.map((name, i) => {
            const r = d.results[i];
            const [c1, c2] = themeColors(d.opps[i]);
            return `<li class="${r ? (r.won ? 'won' : 'lost') : i === d.round ? 'next' : ''}" style="--c1:${c1};--c2:${c2}">
              <span>${tx(name)}</span><i class="db-kit"></i><b>${themeName(d.opps[i])}</b>
              <em>${r ? `${r.scored}–${r.conceded}${r.pens ? ` (${tx('pens')})` : ''}` : i === d.round ? `≈${o.squad.rating}` : ''}</em>
            </li>`;
          }).join('')}</ol>
          <p class="hint">${tx('Win it and')}: ${rewardLine(rewardFor(d.wins + 1))} · ${tx('lose it')}: ${rewardLine(rewardFor(d.wins))}</p>
          <button class="btn primary" data-d="play">${tx('Play the')} ${tx(DRAFT_ROUNDS[d.round])}</button>
          <button class="btn ghost sm" data-d="abandon">${tx('Walk away')}</button>
        </div>
      </div>`;
  }
  // done
  const r = rewardFor(d.wins);
  const champ = d.wins >= DRAFT_ROUNDS.length;
  return `
    <div class="draft-layout">
      <div class="panel glass">${stats(d)}${pitchHTML(d)}</div>
      <div class="panel glass draft-done ${champ ? 'champ' : ''}">
        <h3 class="draft-step">${champ ? tx('Draft champions') : `${tx('Draft over')} · ${d.wins} ${tx(d.wins === 1 ? 'win' : 'wins')}`}</h3>
        <ol class="draft-bracket">${d.results.map((x) => `<li class="${x.won ? 'won' : 'lost'}" style="--c1:${themeColors(x.opp)[0]};--c2:${themeColors(x.opp)[1]}"><span>${tx(DRAFT_ROUNDS[x.round])}</span><i class="db-kit"></i><b>${themeName(x.opp)}</b><em>${x.scored}–${x.conceded}${x.pens ? ` (${tx('pens')})` : ''}</em></li>`).join('')}</ol>
        <p class="draft-pay">${rewardLine(r)}</p>
        <button class="btn primary" data-d="collect">${tx('Collect')}</button>
      </div>
    </div>`;
}

export function render() {
  return `
    <section class="screen draft-screen">
      ${screenHead({ kicker: 'Ultimate XI', title: tx('Draft'), sub: tx('Eleven cards you pick on the spot, four knockout rounds, a reward by wins.'), motif: 'ladder', tone: 'b' })}
      <div id="draftBody">${body()}</div>
      <button class="btn ghost" data-d="back">${tx('Back to Ultimate XI')}</button>
    </section>`;
}

export function mount(root) {
  const host = root.querySelector('#draftBody');
  const left = settleUnfinished();
  if (left) toast(tx('That round was left unfinished — it counts as a defeat.'), 'warn');
  const paint = () => { host.innerHTML = body(); };
  if (left) paint();
  const onClick = (e) => {
    const b = e.target.closest('[data-d], [data-form], [data-pick]');
    if (!b) return;
    if (b.dataset.form) { chooseFormation(b.dataset.form); sfx('confirm'); paint(); return; }
    if (b.dataset.pick) {
      const d = draftState();
      const r = d?.step === 'captain' ? chooseCaptain(b.dataset.pick) : choosePick(b.dataset.pick);
      if (r?.error) return toast(r.error, 'warn');
      const p = getPlayer(b.dataset.pick);
      haptic(['special', 'star', 'icon'].includes(p?.rarity) ? 'special' : 'reveal');
      sfx('confirm'); paint();
      return;
    }
    const a = b.dataset.d;
    if (a === 'back') { navigate('squad'); return; }
    if (a === 'start') {
      const r = startDraft();
      if (r.error) return toast(r.error, 'warn');
      refreshCoins(); sfx('confirm'); paint();
      return;
    }
    if (a === 'abandon') {
      if (!confirm(tx('Walk away from this draft? It ends here and pays for the wins so far.'))) return;
      abandonDraft(); paint();
      return;
    }
    if (a === 'play') {
      const d = draftState();
      const squad = draftSquad(clubIdentity(), d);
      const o = draftOpponent(d);
      if (!squad || !o) return;
      markKickoff();
      enterFullscreen();
      navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, mode: 'single', ultimate: true,
        duration: DRAFT_DURATION, skill: o.skill, draft: { round: o.round }, homeSquad: squad, awaySquad: o.squad });
      return;
    }
    if (a === 'collect') {
      const r = collectDraft();
      if (r) { toast(`${tx('Draft reward')}: ${rewardLine(r)}`, 'good'); refreshCoins(); sfx('confirm'); haptic(r.wins >= DRAFT_ROUNDS.length ? 'goal' : 'reveal'); }
      paint();
    }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
