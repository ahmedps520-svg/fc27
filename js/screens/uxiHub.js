/**
 * Ultimate XI's v80 panels, kept out of squad.js (already the biggest screen):
 *
 *  - Division tab: the modes — Quickfire Fives, Squad Clash, the Division's
 *    weekly rewards and Weekend League qualification.
 *  - Objectives tab: daily and weekly tasks, and the club level track.
 *  - Club tab: Evolutions.
 *  - Store tab: the Transfer Market and the Binder.
 *
 * Each view is a string; `mountHub` wires every one of them with delegated
 * listeners, and every action re-renders through `navigate('squad')`.
 */
import { getState } from '../state.js';
import { getPlayer, WORLD } from '../data/generator.js';
import { RARITY, POSITIONS } from '../data/pools.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { playerCard } from '../components/playerCard.js';
import { fmtLeft } from '../data/packs.js';
import { divisionOpponent, divisionSkill } from '../ultimate.js';
import { enterFullscreen } from '../fullscreen.js';
import {
  FIVES, fivesPick, CLASH_LEVELS, CLASH_RANKS, clashWeek, clashSquad, clashStatus, claimClash,
  RIVAL_TIERS, rivalsStatus, claimRivals, qualification } from '../modes.js';
import { taskBoard, claimTask, clubLevel, levelReward, LEVEL_MAX } from '../tasks.js';
import { EVO_TRACKS, MAX_ACTIVE, trackById, startEvolution, cancelEvolution, evolvedRef } from '../evolutions.js';
import { settle, search, buyNow, placeBid, listCard, priceRange, historySVG, marketValue, TAX } from '../market.js';
import { sets, setProgress, claimSet, binderSummary } from '../binder.js';
import { weekendWindow, untilText } from '../weekend.js';

const money = (n) => `◈${Math.round(n).toLocaleString()}`;
const packName = (id) => ({ gold: 'Gold', silver: 'Silver', prime: 'Prime', inform: 'In-Form', campaign: 'Campaign', vault: 'Legends Vault' }[id] || id);
const rewardLine = (r) => [r.apex ? money(r.apex) : '', ...(r.packs || []).map(packName), r.ultimate ? `✦${r.ultimate}` : ''].filter(Boolean).join(' · ');

/* ================================ Modes ================================ */
let clashLevel = 'pro';

export function modesView(squad) {
  const s = getState();
  const f = s.club.fives || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, best: 0 };
  const five = squad ? fivesPick(squad.xi) : [];
  const cs = clashStatus();
  const rv = rivalsStatus();
  const q = qualification();
  const w = weekendWindow();
  const myRating = squad ? Math.round(squad.xi.reduce((t, p) => t + p.overall, 0) / squad.xi.length) : 0;
  const lv = CLASH_LEVELS.find((l) => l.id === clashLevel);
  const opponents = clashWeek();
  const nextRank = CLASH_RANKS.find((r) => r.points > cs.points);

  return `
    <section class="panel glass mode-card fives-card">
      <header class="panel-head"><h2>Quickfire Fives</h2><span class="tag">2½ minutes · 5 a side</span></header>
      <p class="hint">Your keeper and four best outfielders on a small pitch. Short, sharp, pays straight away:
        ${money(FIVES.reward.win)} a win, ${money(FIVES.reward.goal)} a goal.</p>
      <div class="fives-five">${five.map((p) => `<span class="ff-p"><b>${p.overall}</b><i>${p.position}</i>${p.short || p.name}</span>`).join('') || '<span class="empty">Fill your XI first.</span>'}</div>
      <div class="mode-rec"><span>${f.won}W ${f.drawn}D ${f.lost}L</span><span>${f.gf}–${f.ga}</span><span>Best run ${f.best}</span>
        ${f.last ? `<span>Last: ${f.last.scored}–${f.last.conceded}</span>` : ''}</div>
      <button class="btn primary" id="playFives" ${squad ? '' : 'disabled'}>Play Fives</button>
    </section>

    <section class="panel glass mode-card clash-card">
      <header class="panel-head"><h2>Squad Clash</h2><span class="tag">${cs.rank.name} · ${cs.points} pts</span></header>
      <p class="hint">Twelve curated squads this week, one match each, at the difficulty you choose. Points for the result,
        goals and clean sheets set your weekly rank, paid next week.
        ${nextRank ? `${nextRank.points - cs.points} points to ${nextRank.name}.` : 'Top rank reached.'}</p>
      ${cs.pending ? `<div class="claim-row"><span>Last week: ${cs.pending.points} pts — ${rewardLine(CLASH_RANKS.slice().reverse().find((r) => cs.pending.points >= r.points))}</span>
        <button class="btn primary" id="claimClash">Claim</button></div>` : ''}
      <div class="chips" id="clashLevels">${CLASH_LEVELS.map((l) => `<button class="chip ${l.id === clashLevel ? 'on' : ''}" data-clash-level="${l.id}">${l.name}<small> ${l.points}</small></button>`).join('')}</div>
      <div class="clash-grid">
        ${opponents.map((th) => {
          const done = cs.played[th.id];
          const rating = Math.max(55, Math.min(95, myRating + lv.delta));
          return `<div class="clash-opp ${done ? 'done' : ''}" style="--c1:${th.colors[0]};--c2:${th.colors[1]}">
            <i class="co-kit"></i><b>${th.name}</b>
            <span>${done ? `${done.scored}–${done.conceded} · +${done.pts}` : `≈${rating} rated`}</span>
            ${done ? '<em>Played</em>' : `<button class="mini-btn" data-clash="${th.id}" ${squad ? '' : 'disabled'}>Play</button>`}
          </div>`;
        }).join('')}
      </div>
      <div class="rank-strip">${CLASH_RANKS.map((r) => `<span class="${cs.rank === r ? 'on' : ''}"><b>${r.name}</b>${r.points}+<em>${rewardLine(r)}</em></span>`).join('')}</div>
    </section>

    <section class="panel glass mode-card">
      <header class="panel-head"><h2>Division weekly rewards</h2><span class="tag">${rv.current.wins} wins this week</span></header>
      <p class="hint">Apex Division wins also count toward a weekly reward, paid once the week turns.</p>
      <div class="rank-strip">${RIVAL_TIERS.map((t) => `<span class="${rv.current.wins >= t.wins ? 'on' : ''}"><b>${t.wins} wins</b><em>${rewardLine(t)}</em></span>`).join('')}</div>
      ${rv.pending ? `<div class="claim-row"><span>Last week: ${rv.pending.wins} wins</span><button class="btn primary" id="claimRivals">Claim</button></div>` : ''}
    </section>

    <section class="panel glass mode-card">
      <header class="panel-head"><h2>Weekend League qualification</h2>
        <span class="tag ${q.qualified ? 'good' : ''}">${q.qualified ? 'Qualified' : `${q.points}/${q.need} points`}</span></header>
      <p class="hint">${q.qualified ? 'You are in for the weekend.' : 'Earn qualification points before the weekend opens: a Division win or a Fives win is 1, a Squad Clash win 2.'}
        ${w.open ? `Open now, closes in ${untilText(w.closesAt)}.` : `Opens in ${untilText(w.opensAt)}.`}</p>
      <i class="obj-bar"><b style="width:${Math.min(100, (q.points / q.need) * 100)}%"></b></i>
      <button class="btn ${q.qualified ? 'primary' : 'ghost'}" id="goWeekend">Weekend League</button>
    </section>`;
}

function launch(params) {
  enterFullscreen();
  navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, mode: 'single', ultimate: true, ...params });
}

export function mountModes(root, ultimateSquad) {
  root.querySelector('#playFives')?.addEventListener('click', () => {
    const squad = ultimateSquad();
    if (!squad) return toast('Fill all 11 positions first', 'warn');
    const five = fivesPick(squad.xi);
    const rating = Math.round(five.reduce((t, p) => t + p.overall, 0) / five.length);
    const u = getState().ultimate;
    const opp = divisionOpponent(u.divIdx, rating);
    launch({ field: 'fives', venueId: FIVES.venue, duration: FIVES.duration, skill: divisionSkill(u.divIdx),
      fives: true, homeSquad: { ...squad, xi: five, bench: [] }, awaySquad: { ...opp, bench: [] } });
  });
  root.querySelector('#clashLevels')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-clash-level]'); if (!b) return;
    clashLevel = b.dataset.clashLevel; navigate('squad');
  });
  root.querySelector('.clash-grid')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-clash]'); if (!b) return;
    const squad = ultimateSquad();
    if (!squad) return toast('Fill all 11 positions first', 'warn');
    const lv = CLASH_LEVELS.find((l) => l.id === clashLevel);
    const rating = Math.round(squad.xi.reduce((t, p) => t + p.overall, 0) / squad.xi.length);
    const opp = clashSquad(b.dataset.clash, Math.max(55, Math.min(95, rating + lv.delta)));
    launch({ duration: 180, skill: lv.skill, clash: { theme: b.dataset.clash, level: lv.id }, homeSquad: squad, awaySquad: opp });
  });
  root.querySelector('#claimClash')?.addEventListener('click', () => {
    const r = claimClash(); if (r) { toast(`${r.name} rewards: ${rewardLine(r)}`, 'good'); refreshCoins(); }
    navigate('squad');
  });
  root.querySelector('#claimRivals')?.addEventListener('click', () => {
    const r = claimRivals(); toast(r ? `Weekly rewards: ${rewardLine(r)}` : 'No reward tier reached last week', r ? 'good' : 'warn'); refreshCoins();
    navigate('squad');
  });
  root.querySelector('#goWeekend')?.addEventListener('click', () => navigate('weekend'));
}

/* ============================== Objectives ============================== */
export function tasksView() {
  const b = taskBoard();
  const lvl = clubLevel();
  const next = [];
  for (let l = lvl.level + 1; l <= Math.min(LEVEL_MAX, lvl.level + 5); l++) next.push([l, levelReward(l)]);
  const row = (t) => {
    const done = t.have >= t.need;
    return `<li class="${t.claimed ? 'done' : ''} ${done && !t.claimed ? 'close' : ''}">
      <span class="obj-tick">${t.claimed ? '✓' : ''}</span>
      <div class="obj-body"><b>${t.text}</b><i class="obj-bar"><b style="width:${(t.have / t.need) * 100}%"></b></i>
        <span>${t.have}/${t.need}</span></div>
      <span class="obj-reward">${money(t.apex)}<em>+${t.xp} XP${t.pack ? ` · ${packName(t.pack)}` : ''}</em>
        ${done && !t.claimed ? `<button class="mini-btn" data-task="${t.id}">Claim</button>` : ''}</span>
    </li>`;
  };
  return `
    <section class="panel glass club-level">
      <header class="panel-head"><h2>Club level ${lvl.level}</h2><span class="tag">${lvl.need ? `${lvl.into}/${lvl.need} XP` : 'Max level'}</span></header>
      <i class="obj-bar"><b style="width:${lvl.need ? (lvl.into / lvl.need) * 100 : 100}%"></b></i>
      <p class="hint">Every match, task and Season Pass tier adds club XP. It never resets, and every level pays.</p>
      <div class="lvl-track">${next.map(([l, r]) => `<span class="${l % 5 === 0 ? 'big' : ''}"><b>${l}</b>${r.text}</span>`).join('')}</div>
    </section>
    <section class="panel glass" id="taskBoard">
      <header class="panel-head"><h2>Daily</h2><span class="tag">New in ${fmtLeft(b.dayEndsIn)}</span></header>
      <ul class="obj-list">${b.daily.map(row).join('')}</ul>
      <header class="panel-head"><h2>Weekly</h2><span class="tag">New in ${fmtLeft(b.weekEndsIn)}</span></header>
      <ul class="obj-list">${b.weekly.map(row).join('')}</ul>
    </section>`;
}
export function mountTasks(root) {
  root.querySelector('#taskBoard')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-task]'); if (!b) return;
    const r = claimTask(b.dataset.task);
    if (r.ok) { toast(`${money(r.apex)} · +${r.xp} XP${r.pack ? ` · ${packName(r.pack)} pack` : ''}`, 'good'); refreshCoins(); }
    navigate('squad');
  });
}

/* ============================== Evolutions ============================== */
let evoPick = {};   // track id → chosen card id

export function evosView() {
  const s = getState();
  const club = s.club;
  const evos = club.evos || {};
  const active = Object.keys(evos).length;
  const own = [...new Set(club.collection)].map(getPlayer).filter(Boolean);
  const path = (t, stage, prog) => `<ol class="evo-path">${t.stages.map((st, i) => `
    <li class="${i < stage ? 'done' : i === stage ? 'now' : ''}">
      <b>${i + 1}</b><span>${st.need.text}${i === stage ? ` — ${prog}/${st.need.n}` : ''}</span>
      <em>+${st.give.ovr} OVR${Object.entries(st.give.stats).map(([k, v]) => ` · ${k.slice(0, 3).toUpperCase()} +${v}`).join('')}${st.give.trait ? ` · trait: ${st.give.trait}` : ''}</em>
    </li>`).join('')}</ol>`;

  const running = Object.entries(evos).map(([id, e]) => {
    const t = trackById(id); const p = getPlayer(e.card);
    if (!t || !p) return '';
    const ev = evolvedRef(club, p);
    return `<article class="evo-run">
      <div class="evo-card">${playerCard(ev, { size: 'mini', evo: ev.evoStage || 0 })}</div>
      <div class="evo-info"><b>${t.name}</b><span>${p.name} · stage ${e.stage}/${t.stages.length}</span>${path(t, e.stage, e.prog)}
        <button class="mini-btn danger" data-evo-cancel="${id}">Stop (keeps stages done)</button></div>
    </article>`;
  }).join('');

  const tracks = EVO_TRACKS.filter((t) => !evos[t.id]).map((t) => {
    const fits = own.filter((p) => t.fits(evolvedRef(club, p)) && !(club.evoDone?.[p.id]?.tracks || []).includes(t.id)
      && !Object.values(evos).some((e) => e.card === p.id)).sort((a, b) => b.overall - a.overall);
    const pick = evoPick[t.id] && fits.find((p) => p.id === evoPick[t.id]) ? evoPick[t.id] : fits[0]?.id;
    return `<article class="evo-track">
      <header><b>${t.name}</b><span>${t.blurb}</span></header>
      ${path(t, -1, 0)}
      ${fits.length ? `<div class="evo-start"><select data-evo-pick="${t.id}">${fits.slice(0, 60).map((p) => `<option value="${p.id}" ${p.id === pick ? 'selected' : ''}>${p.overall} ${p.position} ${p.name}</option>`).join('')}</select>
        <button class="btn primary" data-evo-start="${t.id}" ${active >= MAX_ACTIVE ? 'disabled' : ''}>Start</button></div>`
        : '<p class="empty">No eligible card in your collection yet.</p>'}
    </article>`;
  }).join('');

  const finished = Object.entries(club.evoDone || {}).map(([id, r]) => {
    const p = getPlayer(id); if (!p) return '';
    const ev = evolvedRef(club, p);
    return `<div class="evo-fin">${playerCard(ev, { size: 'mini', evo: ev.evoStage })}<span>${r.tracks.map((x) => trackById(x)?.name).join(', ')}</span></div>`;
  }).join('');

  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Evolutions</h2><span class="tag">${active}/${MAX_ACTIVE} running</span></header>
      <p class="hint">Pick a card that fits a track and play Ultimate XI matches with him in the XI — Division, Fives, Squad Clash
        or the Weekend League. Each stage done adds stats and a stage of glow to the card, for good.</p>
      ${running || '<p class="empty">Nothing evolving. Start a track below.</p>'}
    </section>
    <section class="panel glass"><header class="panel-head"><h2>Tracks</h2></header><div class="evo-tracks">${tracks}</div></section>
    ${finished ? `<section class="panel glass"><header class="panel-head"><h2>Evolved</h2></header><div class="evo-done-grid">${finished}</div></section>` : ''}`;
}
export function mountEvos(root) {
  root.querySelectorAll('[data-evo-pick]').forEach((sel) => sel.addEventListener('change', () => { evoPick[sel.dataset.evoPick] = sel.value; }));
  root.addEventListener('click', (e) => {
    const st = e.target.closest('[data-evo-start]');
    if (st) {
      const id = st.dataset.evoStart;
      const card = root.querySelector(`[data-evo-pick="${id}"]`)?.value;
      const r = startEvolution(id, card);
      toast(r.ok ? 'Evolution started' : r.why, r.ok ? 'good' : 'warn');
      if (r.ok) navigate('squad');
      return;
    }
    const c = e.target.closest('[data-evo-cancel]');
    if (c) { cancelEvolution(c.dataset.evoCancel); navigate('squad'); }
  });
}

/* ================================ Market ================================ */
let mf = { text: '', position: '', rarity: '', minOvr: '', maxPrice: '', sort: 'ovr' };
let mSel = null;        // listing id shown in detail
let mSellCard = null;   // your card being listed
let mResults = [];

export function marketView() {
  const events = settle();
  for (const ev of events) {
    toast(ev.kind === 'sold' ? `${ev.card} sold for ${money(ev.amount)} (${money(ev.net)} after tax)`
      : ev.kind === 'won' ? `You won ${ev.card} for ${money(ev.amount)}`
        : ev.kind === 'outbid' ? `Outbid on ${ev.card} — ${money(ev.amount)} returned` : `${ev.card} did not sell and is back in your club`, ev.kind === 'outbid' || ev.kind === 'unsold' ? 'warn' : 'good');
  }
  if (events.length) refreshCoins();
  const s = getState();
  const m = s.club.mkt || { mine: [], watch: [] };
  mResults = search({ ...mf, minOvr: +mf.minOvr || 0, maxPrice: +mf.maxPrice || 0 });
  const sel = mResults.find((l) => l.id === mSel);
  const inSquad = new Set([...s.club.lineup, ...(s.club.bench || [])].filter(Boolean));
  const sellable = [...new Set(s.club.collection)].map(getPlayer).filter((p) => p && !p.sbc && !inSquad.has(p.id)).sort((a, b) => b.overall - a.overall);
  const sp = mSellCard ? getPlayer(mSellCard) : sellable[0];
  const range = sp ? priceRange(sp) : null;

  return `
    <section class="panel glass mkt">
      <header class="panel-head"><h2>Transfer Market</h2><span class="coin-chip">${money(s.club.apex || 0)}</span></header>
      <p class="hint">Every card has a price range — nothing lists or sells outside it — and sales pay ${Math.round(TAX * 100)}% tax.
        New listings every four hours. No real money, ever.</p>
      <form class="mkt-filters" id="mktFilters">
        <input name="text" placeholder="Name" value="${mf.text}" maxlength="24">
        <select name="position"><option value="">Any position</option>${Object.keys(POSITIONS).map((p) => `<option ${mf.position === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
        <select name="rarity"><option value="">Any rarity</option>${['bronze', 'silver', 'gold', 'special', 'inform', 'totw', 'future', 'desert', 'winter'].filter((r) => RARITY[r]).map((r) => `<option value="${r}" ${mf.rarity === r ? 'selected' : ''}>${RARITY[r].label}</option>`).join('')}</select>
        <input name="minOvr" type="number" min="40" max="99" placeholder="Min OVR" value="${mf.minOvr}">
        <input name="maxPrice" type="number" min="0" step="100" placeholder="Max price" value="${mf.maxPrice}">
        <select name="sort"><option value="ovr" ${mf.sort === 'ovr' ? 'selected' : ''}>Best first</option><option value="price" ${mf.sort === 'price' ? 'selected' : ''}>Cheapest first</option></select>
        <button class="btn ghost" type="submit" data-pad="y">Search</button>
      </form>
      <div class="mkt-list" id="mktList">
        ${mResults.slice(0, 30).map((l) => `<button class="mkt-row ${l.id === mSel ? 'on' : ''}" data-listing="${l.id}" style="--rar:${RARITY[l.p.rarity]?.color || '#ccc'}">
          <b class="mr-ovr">${l.p.overall}</b><span class="mr-name">${l.p.name}<small>${l.p.position} · ${RARITY[l.p.rarity]?.label || ''}</small></span>
          <span class="mr-bid">${l.bid ? money(l.bid) : `from ${money(l.start)}`}</span><span class="mr-bn">${money(l.buyNow)}</span>
          <span class="mr-end">${fmtLeft(l.ends - Date.now())}</span></button>`).join('') || '<p class="empty">Nothing matches — widen the search.</p>'}
      </div>
      ${sel ? detailHTML(sel) : ''}
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Sell a card</h2></header>
      ${sp ? `<div class="mkt-sell" id="mktSell">
        <select id="mktSellCard">${sellable.slice(0, 120).map((p) => `<option value="${p.id}" ${p.id === sp.id ? 'selected' : ''}>${p.overall} ${p.position} ${p.name}</option>`).join('')}</select>
        <span class="mkt-range">Range ${money(range.min)} – ${money(range.max)} · value ${money(range.value)}</span>
        ${historySVG(sp.id, 240, 60)}
        <label>Start <input id="mktStart" type="number" min="${range.min}" max="${range.max}" step="10" value="${Math.max(range.min, Math.round(range.value * 0.8 / 10) * 10)}"></label>
        <label>Buy now <input id="mktBN" type="number" min="${range.min}" max="${range.max}" step="10" value="${range.value}"></label>
        <label>Hours <select id="mktHours"><option>1</option><option>3</option><option selected>6</option><option>12</option><option>24</option></select></label>
        <button class="btn primary" id="mktListBtn">List</button>
      </div>` : '<p class="empty">Nothing to sell — cards in your XI or bench cannot be listed.</p>'}
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Your activity</h2></header>
      <ul class="mkt-mine">
        ${(m.mine || []).map((l) => { const p = getPlayer(l.cardId); return p ? `<li><b>${p.name}</b><span>${l.done ? (l.done === 'sold' ? `Sold ${money(l.soldFor)}` : 'Unsold — returned') : `Listed ${money(l.start)}/${money(l.buyNow)} · ${fmtLeft(l.ends - Date.now())}`}</span></li>` : ''; }).join('')}
        ${(m.watch || []).map((w) => { const p = getPlayer(w.cardId); return p ? `<li><b>${p.name}</b><span>${w.done === 'won' ? `Won at ${money(w.bid)}` : w.done === 'outbid' ? 'Outbid — refunded' : `Your bid ${money(w.bid)} · ${fmtLeft(w.ends - Date.now())}`}</span></li>` : ''; }).join('')}
      </ul>
      ${(m.mine || []).length + (m.watch || []).length ? '' : '<p class="empty">No listings or bids yet.</p>'}
    </section>`;
}
function detailHTML(l) {
  const { min, max, value } = priceRange(l.p);
  const least = Math.max(l.start, min);
  return `<div class="mkt-detail" id="mktDetail">
    <div>${playerCard(l.p, { size: 'mini' })}</div>
    <div class="md-info">
      <b>${l.p.name}</b><span>Value ${money(value)} · range ${money(min)}–${money(max)}</span>
      ${historySVG(l.cardId)}
      <div class="md-act">
        <button class="btn primary" data-buynow="${l.id}">Buy now ${money(l.buyNow)}</button>
        <input id="mktBid" type="number" min="${least}" max="${l.buyNow - 10}" step="10" value="${least}">
        <button class="btn ghost" data-bid="${l.id}">Bid</button>
      </div>
    </div></div>`;
}
export function mountMarket(root) {
  root.querySelector('#mktFilters')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    mf = { ...mf, ...Object.fromEntries(fd.entries()) }; mSel = null;
    navigate('squad');
  });
  root.querySelector('#mktList')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-listing]'); if (!b) return;
    mSel = mSel === b.dataset.listing ? null : b.dataset.listing; navigate('squad');
  });
  root.querySelector('.mkt')?.addEventListener('click', (e) => {
    const bn = e.target.closest('[data-buynow]');
    const bd = e.target.closest('[data-bid]');
    const l = mResults.find((x) => x.id === (bn?.dataset.buynow || bd?.dataset.bid));
    if (!l) return;
    const r = bn ? buyNow(l) : placeBid(l, +root.querySelector('#mktBid').value);
    toast(r.ok ? (bn ? `${l.p.name} joins your club` : 'Bid placed — the money is held until the listing ends') : r.why, r.ok ? 'good' : 'warn');
    if (r.ok) { mSel = null; refreshCoins(); navigate('squad'); }
  });
  root.querySelector('#mktSellCard')?.addEventListener('change', (e) => { mSellCard = e.target.value; navigate('squad'); });
  root.querySelector('#mktListBtn')?.addEventListener('click', () => {
    const card = root.querySelector('#mktSellCard').value;
    const r = listCard(card, +root.querySelector('#mktStart').value, +root.querySelector('#mktBN').value, +root.querySelector('#mktHours').value);
    toast(r.ok ? 'Listed' : r.why, r.ok ? 'good' : 'warn');
    if (r.ok) { mSellCard = null; navigate('squad'); }
  });
}

/* ================================ Binder ================================ */
let binderOpen = null;
export function binderView() {
  const club = getState().club;
  const sum = binderSummary(club);
  const all = sets();
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>The Binder</h2><span class="tag">${sum.cards} cards collected · ${sum.setsDone}/${sum.sets} sets</span></header>
      <p class="hint">Every card you have ever owned stays in the binder, even after you sell it. Finish a set and it pays once.</p>
      <div class="binder-sets" id="binderSets">
        ${all.map((set) => {
          const pr = setProgress(set, club);
          const open = binderOpen === set.id;
          return `<article class="bset ${pr.done ? 'done' : ''} ${pr.claimed ? 'claimed' : ''}">
            <header data-bset="${set.id}"><b>${set.name}</b><span>${set.blurb}</span></header>
            <i class="obj-bar"><b style="width:${(pr.have / pr.need) * 100}%"></b></i>
            <div class="bset-foot"><span>${pr.have}/${pr.need}</span><em>${rewardLine(set.reward)}</em>
              ${pr.claimed ? '<span class="tag">Claimed</span>' : pr.done ? `<button class="mini-btn" data-bclaim="${set.id}">Claim</button>` : ''}</div>
            ${open ? `<div class="bset-cards">${set.ids.slice(0, 40).map((id) => { const p = getPlayer(id); const has = club.everOwned?.[id] || club.collection.includes(id); return p ? `<span class="bc ${has ? 'has' : ''}"><b>${p.overall}</b>${p.short || p.name}</span>` : ''; }).join('')}</div>` : ''}
          </article>`;
        }).join('')}
      </div>
    </section>`;
}
export function mountBinder(root) {
  root.querySelector('#binderSets')?.addEventListener('click', (e) => {
    const c = e.target.closest('[data-bclaim]');
    if (c) { const r = claimSet(c.dataset.bclaim); toast(r.ok ? `Set complete: ${rewardLine(r.reward)}` : r.why, r.ok ? 'good' : 'warn'); refreshCoins(); navigate('squad'); return; }
    const h = e.target.closest('[data-bset]');
    if (h) { binderOpen = binderOpen === h.dataset.bset ? null : h.dataset.bset; navigate('squad'); }
  });
}

export { marketValue };
