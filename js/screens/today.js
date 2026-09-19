/**
 * Today — the one place to see what there is to do and what there is to claim.
 *
 * The daily login calendar, the week's event, the Season Pass, the objective
 * slate, the weekend, and every reward waiting. Nothing here is a mode;
 * everything here is a reason to open one.
 */
import { getState, update } from '../state.js';
import { navigate, refreshCoins, toast } from '../app.js';
import { sfx } from '../audio.js';
import { screenHead } from '../components/screenHead.js';
import { PACK_BY_ID } from '../data/packs.js';
import { WORLD } from '../data/generator.js';
import { activeEvent, eventKey, eventEndsAt, season, eventPack } from '../live.js';
import { TIER_XP, TIERS, rewardText, tierOf } from '../data/season.js';
import { weekendWindow, currentWeekend, matchesLeft, rankFor, untilText } from '../weekend.js';
import * as progress from '../progress.js';
import { DAILY } from '../progress.js';

export const TITLE = 'Today';

const rewardLabel = (r) => rewardText({ apex: r.apex, ultimate: r.ultimate, pack: r.pack });

function dailyPanel() {
  const d = progress.dailyStatus();
  return `
    <section class="panel glass today-daily">
      <header class="panel-head"><h2>Daily reward <small>day ${d.day} · 🔥 ${d.streak}</small></h2></header>
      <div class="cal">
        ${DAILY.map((r, i) => {
          const day = i + 1;
          const state = day < d.day ? 'past' : day === d.day ? (d.claimable ? 'now' : 'done') : 'next';
          return `<div class="cal-day ${state}"><span>Day ${day}</span><b>${r.pack ? `${PACK_BY_ID(r.pack).name} pack` : ''}${r.pack && r.apex ? ' + ' : ''}${r.apex ? `◈ ${r.apex.toLocaleString()}` : ''}</b></div>`;
        }).join('')}
      </div>
      <button class="btn ${d.claimable ? 'primary' : 'ghost'}" id="claimDaily" ${d.claimable ? '' : 'disabled'}>
        ${d.claimable ? `Claim day ${d.day}` : 'Claimed — back tomorrow'}
      </button>
    </section>`;
}

function eventPanel(s) {
  const ev = activeEvent();
  if (!ev) return '';
  const key = eventKey(ev);
  const slot = s.club.events?.[key] || { done: {}, claimed: [] };
  const pack = eventPack(ev);
  const feat = ev.featured ? WORLD.players.find((p) => p.name === ev.featured.player) : null;
  return `
    <section class="panel glass ev-card" style="--ev:${ev.theme || 'var(--accent)'}">
      <header class="panel-head"><h2>${ev.name} <small>ends in ${untilText(eventEndsAt(ev))}</small></h2></header>
      <p class="hint">${ev.blurb}</p>
      <div class="ev-row">
        ${feat ? `<div class="ev-feat"><span class="ev-kicker">Featured card</span><b>${feat.overall + ev.featured.boost} ${feat.short}</b><span>${feat.position} · +${ev.featured.boost} evolved · ${Math.round(ev.featured.chance * 100)}% in the ${pack?.name || 'event pack'}</span></div>` : ''}
        ${pack ? `<button class="btn primary" data-go="store">${pack.name} · ◈ ${pack.cost.toLocaleString()}</button>` : ''}
      </div>
      <div class="obj-list">
        ${(ev.objectives || []).map((o) => {
          const have = Math.min(o.need, slot.done?.[o.id] | 0);
          const done = slot.claimed?.includes(o.id);
          return `<div class="obj ${done ? 'done' : ''}"><div class="obj-text"><b>${o.text}</b><span>◈ ${o.apex.toLocaleString()} · ${o.xp} XP</span></div><div class="obj-bar"><i style="width:${Math.round(100 * have / o.need)}%"></i></div><span class="obj-count">${done ? '✓' : `${have}/${o.need}`}</span></div>`;
        }).join('')}
      </div>
    </section>`;
}

function seasonPanel(s) {
  const se = season();
  const sp = s.club.season?.id === se.id ? s.club.season : { xp: 0, claimed: [] };
  const tier = tierOf(sp.xp);
  const claimable = Array.from({ length: Math.min(TIERS, tier) }, (_, i) => i + 1).filter((t) => !sp.claimed.includes(t));
  const next = tier < TIERS ? se.tiers[tier] : null;
  return `
    <section class="panel glass season">
      <header class="panel-head"><h2>${se.name} <small>${se.daysLeft != null ? `${se.daysLeft} days left` : ''}</small></h2></header>
      <div class="season-bar">
        <b>Tier ${tier}<small>/${TIERS}</small></b>
        <div class="season-track"><i style="width:${Math.round(100 * (tier >= TIERS ? 1 : (sp.xp % TIER_XP) / TIER_XP))}%"></i></div>
        <span>${tier >= TIERS ? 'Complete' : `${sp.xp % TIER_XP}/${TIER_XP} XP · next: ${rewardLabel(next)}`}</span>
      </div>
      <div class="tiers">
        ${se.tiers.map((r, i) => {
          const t = i + 1;
          const st = sp.claimed.includes(t) ? 'done' : t <= tier ? 'claim' : 'locked';
          return `<button class="tier ${st} ${r.label ? 'milestone' : ''}" data-tier="${t}" ${st === 'claim' ? '' : 'disabled'} title="${rewardLabel(r)}"><b>${t}</b><span>${rewardLabel(r)}</span></button>`;
        }).join('')}
      </div>
      ${claimable.length > 1 ? `<button class="btn primary" id="claimTiers">Claim ${claimable.length} tiers</button>` : ''}
      <p class="hint">XP: 40 a match, +60 a win, +5 a goal · objectives 80 · daily login 50 · challenges 90 · event objectives 120.</p>
    </section>`;
}

function weekendPanel(s) {
  let w, tally;
  update((st) => { ({ window: w, tally } = currentWeekend(st.club)); });
  const pending = s.club.weekendPending || (!w.open && tally.played && !tally.claimed ? tally : null);
  const rank = rankFor(tally.wins);
  return `
    <section class="panel glass wl-card">
      <header class="panel-head"><h2>Weekend League <small>${w.open ? `closes in ${untilText(w.closesAt)}` : `opens in ${untilText(w.opensAt)}`}</small></h2></header>
      ${pending ? `<div class="wl-claim"><span>Last weekend: ${pending.wins} wins · <b>${rankFor(pending.wins).name}</b></span><button class="btn primary" id="claimWeekend">Claim ${rewardText({ apex: rankFor(pending.wins).apex, ultimate: rankFor(pending.wins).ultimate })}</button></div>` : ''}
      ${w.open ? `
        <div class="wl-row">
          <div><span class="ev-kicker">This weekend</span><b>${tally.wins}W ${tally.draws}D ${tally.losses}L</b><span>${matchesLeft(tally)} of 10 left · on course for <b>${rank.name}</b></span></div>
          <button class="btn primary" data-go="weekend">${matchesLeft(tally) ? 'Play' : 'Results'} →</button>
        </div>` : `<p class="hint">Ten matches every weekend, Friday 18:00 to Monday 06:00 UTC. Rank by wins; rewards on Monday.</p>`}
    </section>`;
}

function claimsPanel(s) {
  const pending = s.club.pending || [];
  const ach = Object.entries(s.club.achievements || {}).filter(([, r]) => !r.claimed).length;
  if (!pending.length && !ach) return '';
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>To claim <small>${pending.length + ach}</small></h2></header>
      ${pending.map((p) => `<div class="claim-row"><div><b>${p.title}</b><span>${p.sub || ''}</span></div><button class="btn primary" data-claim="${p.id}">${p.apex ? `◈ ${p.apex.toLocaleString()}` : 'Claim'}</button></div>`).join('')}
      ${ach ? `<div class="claim-row"><div><b>${ach} achievement${ach > 1 ? 's' : ''} unlocked</b><span>Collect them in the trophy room</span></div><button class="btn" data-go="trophies">Trophy room →</button></div>` : ''}
    </section>`;
}

function objectivesPanel(s) {
  const u = s.ultimate;
  const open = (u.objectives || []).filter((o) => o.done < o.need).slice(0, 3);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Objectives <small>${(u.objClaimed || []).length} done</small></h2></header>
      ${open.length ? open.map((o) => `<div class="obj"><div class="obj-text"><b>${o.text}</b><span>◈ ${o.apex.toLocaleString()} · ${o.pack} pack</span></div><div class="obj-bar"><i style="width:${Math.round(100 * o.done / o.need)}%"></i></div><span class="obj-count">${o.done}/${o.need}</span></div>`).join('') : '<p class="empty">All caught up.</p>'}
      <button class="btn ghost" data-go="squad">All objectives →</button>
    </section>`;
}

export function render() {
  const s = getState();
  const head = screenHead({ kicker: 'Every day', title: 'Today', sub: new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }), motif: 'ladder', tone: 'a' });
  return head + `<div class="today">${claimsPanel(s)}${dailyPanel()}${eventPanel(s)}${seasonPanel(s)}${weekendPanel(s)}${objectivesPanel(s)}</div>`;
}

export function mount(root) {
  const refresh = () => navigate('today');
  root.querySelector('#claimDaily')?.addEventListener('click', () => {
    const r = progress.claimDaily();
    if (!r) return;
    sfx('coin'); refreshCoins();
    toast(`Day reward: ${rewardLabel(r)}`, 'good');
    refresh();
  });
  root.querySelectorAll('[data-tier]').forEach((b) => b.addEventListener('click', () => {
    const r = progress.claimTier(+b.dataset.tier);
    if (!r) return;
    sfx('coin'); refreshCoins(); toast(`Tier ${b.dataset.tier}: ${rewardLabel(r)}`, 'good'); refresh();
  }));
  root.querySelector('#claimTiers')?.addEventListener('click', () => {
    let n = 0;
    for (let t = 1; t <= TIERS; t++) if (progress.claimTier(t)) n += 1;
    if (n) { sfx('coin'); refreshCoins(); toast(`${n} tiers claimed`, 'good'); refresh(); }
  });
  root.querySelector('#claimWeekend')?.addEventListener('click', () => {
    const r = progress.claimWeekend();
    if (!r) return;
    sfx('coin'); refreshCoins(); toast(`${r.rank.name} weekend: ${rewardText(r.rank)}`, 'good'); refresh();
  });
  root.querySelectorAll('[data-claim]').forEach((b) => b.addEventListener('click', () => {
    const got = progress.claimPending(b.dataset.claim);
    if (!got) return;
    sfx('coin'); refreshCoins(); toast(`${got.title}${got.apex ? ` · ◈ ${got.apex.toLocaleString()}` : ''}`, 'good'); refresh();
  }));
  root.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.go === 'store') { import('./squad.js').then((m) => { m.openStore(); navigate('squad'); }); return; }
    navigate(b.dataset.go);
  }));
}
