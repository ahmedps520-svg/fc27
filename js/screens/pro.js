/**
 * Player Career screen (v81): create a footballer, then live his career.
 * The rules are in proCareer.js; the match is screens/play.js with
 * `params.pro` (stick and camera locked to him).
 */
import { getState } from '../state.js';
import { navigate, toast } from '../app.js';
import { screenHead } from '../components/screenHead.js';
import { crestSVG, flagSVG } from '../components/crest.js';
import { faceSVG, LOOK_SKINS, LOOK_HAIRS } from '../components/face.js';
import { NATION_COLORS } from '../data/realPlayers.js';
import { enterFullscreen } from '../fullscreen.js';
import { sortedCareerTable, myFixture, resolveEntry, MONTHS_PER_WEEK } from '../career.js';
import * as v2 from '../careerV2.js';
import * as v3 from '../careerV3.js';
import { rateOf, ageOf } from '../careerPeople.js';
import * as P from '../proCareer.js';
import { signingScene, trophyScene } from '../components/ceremony.js';

export const TITLE = 'Player Career';

let tab = 'overview';
let draft = null;
let drillPick = 'finishing';
let drillRun = null;          // the running mini-game, for cleanup
let seenTrophies = null;      // trophy count already celebrated this session
let seenSigning = null;

const crestOf = (club) => ({ shape: club.shape, pattern: 'solid', device: 'star', colors: club.colors });
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const NATIONS = () => [...new Set(['Saudi Arabia', ...Object.keys(NATION_COLORS)])].sort((a, b) => (a === 'Saudi Arabia' ? -1 : b === 'Saudi Arabia' ? 1 : a.localeCompare(b)));
const STYLES = [0, 1, 2, 3, 4, 5];

export function render() {
  const p = getState().pro;
  if (!p) return createHTML();
  if (p.retired) return legacyHTML(p);
  return hubHTML(p);
}

/* ------------------------------ creation ------------------------------ */
function createHTML() {
  draft = draft || { name: '', nation: 'Saudi Arabia', position: 'ST', foot: 'R', skin: 2, hair: 0, style: 1, beard: false, clubId: null };
  const d = draft;
  const look = { skin: LOOK_SKINS[d.skin], hair: LOOK_HAIRS[d.hair], style: d.style, beard: d.beard };
  const clubs = P.startingClubs();
  const sw = (key, list) => `<div class="cs-swatches" data-key="${key}">${list.map((v, i) => `<button class="cs-sw ${d[key] === i ? 'on' : ''}" data-i="${i}" style="background:${v}" aria-label="${key} ${i + 1}"></button>`).join('')}</div>`;
  return `
    ${screenHead({ kicker: 'Career · Player Mode', title: 'Create your player', sub: 'Seventeen, a second-tier contract, and everything still to play for.', motif: 'season', tone: 'b' })}
    <div class="cs-layout">
      <aside class="cs-preview glass">
        <span class="csp-face">${faceSVG({ id: 'pro-preview', name: d.name || 'You', look }, 104, '#1d2a44')}</span>
        <b>${esc(d.name || 'Your name')}</b>
        <span>${flagSVG(NATION_COLORS[d.nation] || ['#0c6b34', '#ffffff'], 18)} ${esc(d.nation)} · ${d.position} · ${d.foot === 'R' ? 'Right' : 'Left'} foot</span>
      </aside>
      <div class="cs-form glass" id="proForm">
        <label>Name <input id="prName" maxlength="24" value="${esc(d.name)}" placeholder="First and last name"></label>
        <label>Nationality <select id="prNation">${NATIONS().map((n) => `<option ${n === d.nation ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
        <label>Position <select id="prPos">${P.POSITIONS.map((x) => `<option ${x === d.position ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <label>Preferred foot <select id="prFoot"><option value="R" ${d.foot === 'R' ? 'selected' : ''}>Right</option><option value="L" ${d.foot === 'L' ? 'selected' : ''}>Left</option></select></label>
        <div class="cs-row"><span>Skin tone</span>${sw('skin', LOOK_SKINS)}</div>
        <div class="cs-row"><span>Hair colour</span>${sw('hair', LOOK_HAIRS)}</div>
        <div class="cs-row"><span>Hair style</span><div class="cs-swatches" data-key="style">${STYLES.map((i) => `<button class="cs-sw ${d.style === i ? 'on' : ''}" data-i="${i}" style="background:#222">${i + 1}</button>`).join('')}</div></div>
        <label class="cs-check"><input id="prBeard" type="checkbox" ${d.beard ? 'checked' : ''}> Facial hair</label>
      </div>
    </div>
    <section class="panel glass">
      <header class="panel-head"><h2>Your first club</h2><span class="tag">Second tier</span></header>
      <p class="hint">Everyone starts somewhere. Pick the club that gives you your first contract.</p>
      <div class="cc-grid" id="proClubs">
        ${clubs.map((c) => `
          <button class="cc-card glass ${d.clubId === c.id ? 'on' : ''}" data-club="${c.id}" style="--team:${c.colors[0]};--team2:${c.colors[1]}">
            <span class="cc-crest">${crestSVG(crestOf(c), c.short, 48)}</span>
            <b>${esc(c.name)}</b><span class="cc-lg">${esc(c.league)}</span>
          </button>`).join('')}
      </div>
      <button class="btn primary big" id="prStart" ${d.name.trim().length >= 3 && d.clubId ? '' : 'disabled'}>Sign the contract →</button>
      <button class="btn ghost" id="prBack">Back to Career</button>
    </section>`;
}

/* ------------------------------ the hub ------------------------------ */
function hubHTML(p) {
  const w = p.world;
  const m = P.me(p);
  const club = m.club;
  const table = sortedCareerTable(w);
  const pos = table.findIndex((r) => r.id === w.clubId) + 1;
  const NAV = [['overview', 'Overview'], ['training', 'Training'], ['stats', 'Career'], ['agent', `Agent${p.offers.some((o) => o.state === 'open') || p.talks ? ' •' : ''}`], ['country', 'Country'], ['world', 'World']];
  return `
    <header class="chub pro-hub" style="--team:${club.colors[0]};--team2:${club.colors[1]}">
      <div class="chub-top">
        <span class="chub-face">${faceSVG({ id: 'pro-me', name: p.name, look: lookOf(p) }, 74, club.colors[0])}</span>
        <div class="chub-id">
          <b>${esc(p.name)}</b>
          <span>${m.position} · ${esc(club.name)}${p.loan ? ' (on loan)' : ''} · ${esc(club.league)}</span>
          <span class="chub-mgr">${flagSVG(NATION_COLORS[p.nation] || ['#0c6b34', '#fff'], 14)} ${esc(p.nation)} · age ${m.age} · Season ${w.season}</span>
        </div>
        <div class="chub-coins"><span>Overall</span><b>${m.overall}</b><span class="pro-pot">Potential: ${P.potentialWord(p)}</span></div>
      </div>
      <div class="chub-chips">
        <span class="chip"><b>${pos}</b> of ${table.length}</span>
        <span class="chip"><b>${p.season.apps}</b> apps · <b>${p.season.goals}</b> goals</span>
        <span class="chip"><b>${avg(p.season.ratings) || '–'}</b> avg rating</span>
        <span class="chip ${p.trust < 0.3 ? 'bad' : p.trust > 0.65 ? 'good' : ''}"><b>${Math.round(p.trust * 100)}</b> manager trust</span>
        <span class="chip">${statusName(p.status)}</span>
      </div>
    </header>
    <nav class="cnav" id="proTabs">${NAV.map(([id, l]) => `<button class="cnav-b ${tab === id ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('')}</nav>
    <div id="proBody">${body(p)}</div>
    <div class="career-foot">
      ${P.canRetire(p) ? '<button class="btn ghost" id="proRetire">Retire</button>' : ''}
      <button class="btn ghost" id="proCareers">⇆ Careers</button>
    </div>`;
}
const lookOf = (p) => (p.look && Object.keys(p.look).length ? p.look : undefined);
const statusName = (s) => ({ key: 'Key player', starter: 'First-team regular', rotation: 'Rotation', prospect: 'Prospect' }[s] || s);
const avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : '');

function body(p) {
  if (tab === 'training') return trainingHTML(p);
  if (tab === 'stats') return statsHTML(p);
  if (tab === 'agent') return agentHTML(p);
  if (tab === 'country') return countryHTML(p);
  if (tab === 'world') return worldHTML(p);
  return overviewHTML(p);
}

function overviewHTML(p) {
  const w = p.world;
  const fx = myFixture(w);
  const sel = P.selection(p);
  const last = p.lastMatch;
  const selText = { start: 'You are in the starting eleven.', bench: 'On the bench. Be ready.', out: 'Not in the squad this week.' }[sel];
  const home = fx && v2.clubOf(fx.home); const away = fx && v2.clubOf(fx.away);
  return `
    ${fx ? `
    <section class="cfix" style="--th:${home.colors[0]};--ta:${away.colors[0]}">
      <span class="cfix-kicker">${fx.cup ? 'Cup' : 'Matchday'} · Month ${w.week * MONTHS_PER_WEEK} · ${fx.isHome ? 'Home' : 'Away'}</span>
      <div class="cfix-teams">
        <div class="cfix-t">${crestSVG(crestOf(home), home.short, 56)}<b>${home.short}</b></div>
        <span class="cfix-vs">VS</span>
        <div class="cfix-t">${crestSVG(crestOf(away), away.short, 56)}<b>${away.short}</b></div>
      </div>
      <p class="pro-sel sel-${sel}">${selText}</p>
      <div class="cfix-actions">
        ${sel === 'start' ? '<button class="btn primary big" id="proPlay">▶ Play the match</button>' : ''}
        <button class="btn ${sel === 'start' ? 'ghost' : 'primary'}" id="proSim">${sel === 'start' ? 'Sim my match' : 'Sim the week'}</button>
      </div>
    </section>` : `
    <section class="panel glass"><header class="panel-head"><h2>No fixture this month</h2></header>
      <button class="btn primary" id="proSim">Advance</button></section>`}
    ${last?.line ? `<section class="panel glass"><header class="panel-head"><h2>Last match</h2><span class="tag">${last.line.rating.toFixed(1)}</span></header>
      <p class="hint">${last.line.mins}' · ${last.line.goals} goal${last.line.goals === 1 ? '' : 's'} · ${last.line.assists} assist${last.line.assists === 1 ? '' : 's'}${last.line.motm ? ' · Player of the match' : ''}</p></section>` : ''}
    ${p.talks ? '<section class="panel glass ov-offer"><header class="panel-head"><h2>Contract talks</h2></header><p class="hint">Your deal is up. The club wants to talk.</p><button class="btn" data-tab-go="agent">Go to the table →</button></section>' : ''}
    <div class="ov-cols">
      <section class="panel glass"><header class="panel-head"><h2>Attributes</h2></header>${attrsHTML(p)}</section>
      <section class="panel glass"><header class="panel-head"><h2>Form</h2></header>
        <div class="pro-form">${p.form.map((r) => `<span class="${r >= 7 ? 'up' : r < 6 ? 'dn' : ''}">${r.toFixed(1)}</span>`).join('') || '<p class="ov-empty">No matches yet.</p>'}</div>
        <div class="ov-meters"><div class="ov-meter"><span>Manager trust</span><i><b style="width:${Math.round(p.trust * 100)}%"></b></i></div></div>
        <p class="hint">Trust grows with good ratings and good training. Enough of it and the manager picks you over better-rated men.</p>
      </section>
    </div>`;
}
function attrsHTML(p) {
  const st = p.world.people[p.name].stats;
  return `<div class="pro-attrs">${Object.entries(st).map(([k, v]) => `<div><span>${k}</span><i><b style="width:${v}%"></b></i><em>${v}</em></div>`).join('')}</div>`;
}

function trainingHTML(p) {
  const w = p.world;
  const done = p.drillWeek === `${w.season}-${w.week}`;
  const d = P.DRILLS.find((x) => x.id === drillPick);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Training</h2><span class="tag">${done ? 'Done this week' : 'One drill a week'}</span></header>
      <p class="hint">Each drill feeds one attribute; your match ratings feed the ones your position uses. Growth slows as you near your potential, and after thirty the body takes some back.</p>
      <div class="chips" id="drillPicks">${P.DRILLS.map((x) => `<button class="chip ${x.id === drillPick ? 'on' : ''}" data-drill="${x.id}">${x.name}</button>`).join('')}</div>
      <div class="drill ${done ? 'is-done' : ''}" id="drill">
        <p class="drill-blurb">${d.blurb} Three attempts: stop the marker in the zone.</p>
        <div class="drill-bar"><i class="drill-zone"></i><b class="drill-mark"></b></div>
        <div class="drill-row"><button class="btn primary big" id="drillGo" ${done ? 'disabled' : ''}>${done ? 'Come back next week' : 'Go'}</button><span id="drillOut" aria-live="polite"></span></div>
      </div>
      ${attrsHTML(p)}
    </section>`;
}

function statsHTML(p) {
  const t = p.totals;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Career</h2><span class="tag">${t.apps} apps · ${t.goals} goals</span></header>
      <div class="hub-break"><div><b>${t.apps}</b><span>appearances</span></div><div><b>${t.goals}</b><span>goals</span></div><div><b>${t.assists}</b><span>assists</span></div><div><b>${t.apps ? (t.ratingSum / t.apps).toFixed(2) : '–'}</b><span>avg rating</span></div></div>
      <h3 class="p-sub">Seasons</h3>
      <table class="ltable pro-seasons"><thead><tr><th>S</th><th>Club</th><th>Age</th><th>OVR</th><th>Apps</th><th>G</th><th>A</th><th>Avg</th></tr></thead>
        <tbody>${p.history.slice().reverse().map((h) => `<tr><td>${h.season}</td><td>${esc(v2.clubOf(h.club)?.short || '')}</td><td>${h.age}</td><td>${h.ovr}</td><td>${h.apps}</td><td>${h.goals}</td><td>${h.assists}</td><td>${h.avg || '–'}</td></tr>`).join('') || '<tr><td colspan="8">Your first season.</td></tr>'}</tbody></table>
      <h3 class="p-sub">Trophies</h3>
      <p class="hint">${p.trophies.map((x) => `🏆 ${esc(x.name)} (S${x.season})`).join(' · ') || 'None yet.'}</p>
      <h3 class="p-sub">Milestones</h3>
      <ul class="pro-miles">${p.milestones.slice().reverse().slice(0, 20).map((m) => `<li><em>S${m.season}</em> ${esc(m.text)}</li>`).join('')}</ul>
      <h3 class="p-sub">Clubs</h3>
      <p class="hint">${p.clubs.map((c) => `${esc(v2.clubOf(c.id)?.name || c.id)}${c.loan ? ' (loan)' : ''} — ${c.apps} apps, ${c.goals} goals`).join(' · ')}</p>
    </section>`;
}

function agentHTML(p) {
  const open = p.offers.filter((o) => o.state === 'open');
  const off = P.renewalOffer(p);
  const win = v2.inWindow(p.world.week, p.world.fixtures.length);
  return `
    ${p.talks ? `<section class="panel glass" id="proTalks">
      <header class="panel-head"><h2>Contract talks</h2></header>
      <p class="hint">The club offers <b>${off.wage.toLocaleString()}</b> a week for ${off.years} years as a ${statusName(off.role).toLowerCase()}. Ask for more — but not too much.</p>
      <div class="pro-talk"><label>Wage a week <input id="talkWage" type="number" min="1000" step="500" value="${off.wage}"></label>
        <label>Years <select id="talkYears">${[1, 2, 3, 4, 5].map((y) => `<option ${y === off.years ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
        <button class="btn primary" id="talkAsk">Propose</button><button class="btn ghost" id="talkLeave">Leave on a free</button></div>
    </section>` : ''}
    <section class="panel glass">
      <header class="panel-head"><h2>Your agent</h2><span class="tag">${win ? 'Window open' : 'Window closed'}</span></header>
      <p class="hint">Clubs call in the transfer windows. Any move you agree happens in the summer.${p.pending ? ` <b>Agreed: ${p.pending.kind === 'loan' ? 'loan to' : 'move to'} ${esc(v2.clubOf(p.pending.club)?.name)}.</b>` : ''}</p>
      <label class="cs-check"><input type="checkbox" id="proRequest" ${p.request ? 'checked' : ''}> Ask the agent to find me a move (the manager will hear about it)</label>
      ${open.map((o) => { const c = v2.clubOf(o.club); return `<div class="offer"><div><b>${esc(c?.name)}</b><span>${o.kind === 'loan' ? 'Season-long loan' : `Transfer · ${o.years} years`} · ${esc(c?.league)} · as ${statusName(o.role).toLowerCase()}</span></div>
        <b class="offer-fee">${o.wage.toLocaleString()}/wk</b>
        <div class="offer-actions"><button class="btn primary" data-offer="${o.id}:1">Agree</button><button class="btn ghost" data-offer="${o.id}:0">No thanks</button></div></div>`; }).join('') || `<p class="ov-empty">${win ? 'No calls yet this window.' : 'Nothing until the window opens.'}</p>`}
      <p class="hint">Contract: ${p.contract.years} year${p.contract.years === 1 ? '' : 's'} left at ${p.contract.wage.toLocaleString()} a week.</p>
    </section>`;
}

function countryHTML(p) {
  const r = rateOf(p.world, p.name);
  const bar = P.callUpBar(p.nation);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${flagSVG(NATION_COLORS[p.nation] || ['#0c6b34', '#fff'], 18)} ${esc(p.nation)}</h2><span class="tag">${p.totals.caps} caps · ${p.totals.intlGoals} goals</span></header>
      <p class="hint">The national coach picks at every international break (every eighth round). You need to be among the country's best — around ${bar} — or close to it and in form.</p>
      <div class="ov-meters"><div class="ov-meter"><span>You ${r} · squad level ${bar}</span><i><b style="width:${Math.max(4, Math.min(100, 50 + (r - bar) * 8))}%"></b></i></div></div>
    </section>`;
}

function worldHTML(p) {
  const w = p.world;
  const table = sortedCareerTable(w);
  return `
    <div class="ov-cols">
      <section class="panel glass"><header class="panel-head"><h2>${esc(w.leagueOf[w.clubId])}</h2></header>
        <table class="ltable"><tbody>${table.map((r, i) => `<tr class="${r.id === w.clubId ? 'mine' : ''}"><td>${i + 1}</td><td class="lt-club">${crestSVG(crestOf(r.club), r.club.short, 18)} ${esc(r.club.short)}</td><td>${r.p}</td><td><b>${r.pts}</b></td></tr>`).join('')}</tbody></table></section>
      <section class="panel glass"><header class="panel-head"><h2>News</h2></header>
        <ul class="pro-miles">${w.world.news.slice(0, 16).map((n) => `<li><em>S${n.season}</em> ${esc(n.text)}</li>`).join('') || '<li>Quiet so far.</li>'}</ul></section>
    </div>
    <section class="panel glass"><header class="panel-head"><h2>Awards</h2></header>
      ${w.world.awards.slice().reverse().slice(0, 6).map((a) => `<div class="rr"><span>S${a.season} ${esc(a.league)}: ${esc(v2.clubOf(a.champion)?.short || '')} champions</span><b>${a.pots ? `POTS ${esc(a.pots.name)}` : ''}${a.boot ? ` · Boot ${esc(a.boot.name)} (${a.boot.goals})` : ''}</b></div>`).join('') || '<p class="ov-empty">The first season is still being played.</p>'}
    </section>`;
}

function legacyHTML(p) {
  const L = p.legacy || P.legacy(p);
  return `
    ${screenHead({ kicker: 'Player Career', title: 'Legacy', sub: `${p.name} retired at ${p.retired.age}. ${p.retired.why}`, motif: 'season', tone: 'b' })}
    <section class="panel glass legacy">
      <div class="legacy-top"><span class="chub-face">${faceSVG({ id: 'pro-me', name: p.name, look: lookOf(p) }, 110, '#1d2a44')}</span>
        <div><span class="cer-kicker">${esc(L.tier)}</span><b class="legacy-name">${esc(p.name)}</b><span>Legacy score ${L.score}</span></div></div>
      <div class="hub-break">
        <div><b>${L.apps}</b><span>appearances</span></div><div><b>${L.goals}</b><span>goals</span></div><div><b>${L.assists}</b><span>assists</span></div><div><b>${L.avg || '–'}</b><span>avg rating</span></div>
        <div><b>${L.peak}</b><span>peak overall</span></div><div><b>${L.titles}</b><span>team trophies</span></div><div><b>${L.awards}</b><span>awards</span></div><div><b>${L.caps}</b><span>caps (${L.intlGoals} goals)</span></div>
      </div>
      <h3 class="p-sub">The journey</h3>
      <p class="hint">${p.clubs.map((c) => `${esc(v2.clubOf(c.id)?.name || c.id)}${c.loan ? ' (loan)' : ''}: ${c.apps} apps, ${c.goals} goals`).join(' → ')}</p>
      <h3 class="p-sub">Honours</h3>
      <p class="hint">${p.trophies.map((x) => `🏆 ${esc(x.name)} (S${x.season})`).join(' · ') || 'The medals never came. The memories did.'}</p>
      <button class="btn primary big" id="proNew">Start a new player</button>
      <button class="btn ghost" id="proCareers">⇆ Careers</button>
    </section>`;
}

/* ------------------------------ mount ------------------------------ */
export function mount(root) {
  const rerender = () => navigate('pro');
  const p = getState().pro;
  cleanupDrill();
  if (!p) return wireCreate(root, rerender);
  root.querySelector('#proCareers')?.addEventListener('click', () => navigate('career', { modes: true }));
  if (p.retired) {
    root.querySelector('#proNew')?.addEventListener('click', () => { P.endPro(); draft = null; rerender(); });
    return;
  }
  celebrate(p);
  root.querySelectorAll('#proTabs [data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; rerender(); }));
  root.querySelectorAll('[data-tab-go]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tabGo; rerender(); }));
  root.querySelector('#proSim')?.addEventListener('click', () => {
    const r = P.advancePro();
    if (r?.line) toast(`${r.line.rating.toFixed(1)} — ${r.line.goals ? `${r.line.goals} goal${r.line.goals > 1 ? 's' : ''}` : r.line.mins < 90 ? `${r.line.mins} minutes` : 'full match'}`, r.line.rating >= 7 ? 'good' : undefined);
    else if (r?.fx) toast(r.sel === 'out' ? 'Not selected this week' : 'An unused substitute');
    rerender();
  });
  root.querySelector('#proPlay')?.addEventListener('click', () => startProMatch(getState().pro));
  root.querySelector('#proRetire')?.addEventListener('click', () => {
    if (!confirm('Retire now? Your career ends here and your legacy is written.')) return;
    P.retire('On his own terms.'); rerender();
  });
  // training
  root.querySelector('#drillPicks')?.addEventListener('click', (e) => { const b = e.target.closest('[data-drill]'); if (b) { drillPick = b.dataset.drill; rerender(); } });
  const go = root.querySelector('#drillGo');
  if (go && !go.disabled) wireDrill(root, p);
  // agent
  root.querySelector('#proRequest')?.addEventListener('change', (e) => { P.setTransferRequest(e.target.checked); rerender(); });
  root.querySelectorAll('[data-offer]').forEach((b) => b.addEventListener('click', () => { const [id, ok] = b.dataset.offer.split(':'); P.answerOffer(id, ok === '1'); rerender(); }));
  root.querySelector('#talkAsk')?.addEventListener('click', () => {
    const r = P.negotiate({ wage: +root.querySelector('#talkWage').value, years: +root.querySelector('#talkYears').value });
    if (r) toast(r.note, r.ok ? 'good' : 'warn');
    rerender();
  });
  root.querySelector('#talkLeave')?.addEventListener('click', () => { P.leaveOnFree(); rerender(); });
}

function wireCreate(root, rerender) {
  const d = draft;
  const keep = () => {
    d.name = root.querySelector('#prName')?.value || '';
    d.nation = root.querySelector('#prNation')?.value || d.nation;
    d.position = root.querySelector('#prPos')?.value || d.position;
    d.foot = root.querySelector('#prFoot')?.value || d.foot;
    d.beard = !!root.querySelector('#prBeard')?.checked;
  };
  root.querySelector('#prName')?.addEventListener('input', () => { keep(); const b = root.querySelector('#prStart'); if (b) b.disabled = !(d.name.trim().length >= 3 && d.clubId); });
  for (const id of ['#prNation', '#prPos', '#prFoot', '#prBeard']) root.querySelector(id)?.addEventListener('change', () => { keep(); rerender(); });
  root.querySelectorAll('.cs-swatches').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; keep(); d[g.dataset.key] = +b.dataset.i; rerender(); }));
  root.querySelector('#proClubs')?.addEventListener('click', (e) => { const b = e.target.closest('[data-club]'); if (!b) return; keep(); d.clubId = b.dataset.club; rerender(); });
  root.querySelector('#prBack')?.addEventListener('click', () => navigate('career', { modes: true }));
  root.querySelector('#prStart')?.addEventListener('click', () => {
    keep();
    if (d.name.trim().length < 3 || !d.clubId) return;
    P.startPro({ name: d.name.trim(), nation: d.nation, position: d.position, foot: d.foot, clubId: d.clubId,
      look: { skin: LOOK_SKINS[d.skin], hair: LOOK_HAIRS[d.hair], style: d.style, beard: d.beard } });
    draft = null; tab = 'overview';
    const club = v2.clubOf(d.clubId);
    signingScene({ player: { name: d.name.trim(), position: d.position, look: getState().pro.look }, club: { name: club.name, short: club.short, crest: crestOf(club) }, line: 'First professional contract', sub: `Age 17 · ${d.nation}` }).then(rerender);
  });
}

/** Moments worth a scene: a new club, a new trophy. Shown once each. */
function celebrate(p) {
  const w = p.world;
  if (seenTrophies == null) seenTrophies = p.trophies.length;
  if (seenSigning == null) seenSigning = JSON.stringify(p.lastSigning || null);
  const sig = JSON.stringify(p.lastSigning || null);
  if (sig !== seenSigning && p.lastSigning && p.lastSigning.kind !== 'return') {
    seenSigning = sig;
    const c = v2.clubOf(p.lastSigning.club);
    signingScene({ player: { name: p.name, position: w.people[p.name].pos, overall: rateOf(w, p.name), look: lookOf(p) }, club: { name: c.name, short: c.short, crest: crestOf(c) }, line: p.lastSigning.kind === 'loan' ? 'Loan confirmed' : "It's official", sub: c.league });
  } else if (p.trophies.length > seenTrophies) {
    const t = p.trophies[p.trophies.length - 1]; seenTrophies = p.trophies.length;
    const c = v2.clubOf(t.club);
    trophyScene({ title: t.name, club: c && { name: c.name, short: c.short, crest: crestOf(c) }, sub: `Season ${t.season}`, cup: /Cup/.test(t.name) });
  }
}

/* ------------------------------ the drill ------------------------------ */
function cleanupDrill() { if (drillRun) { cancelAnimationFrame(drillRun.raf); drillRun = null; } }
function wireDrill(root, p) {
  const d = P.DRILLS.find((x) => x.id === drillPick);
  const stat = p.world.people[p.name].stats[d.stats[0]];
  const zoneW = 8 + stat / 9;                    // a better player has a wider zone
  const bar = root.querySelector('.drill-bar'); const zone = root.querySelector('.drill-zone'); const mark = root.querySelector('.drill-mark');
  const out = root.querySelector('#drillOut'); const go = root.querySelector('#drillGo');
  let zoneX = 20 + Math.random() * (80 - zoneW - 20);
  zone.style.left = `${zoneX}%`; zone.style.width = `${zoneW}%`;
  const scores = [];
  let x = 0; let dir = 1; let speed = 55;       // % per second
  let last = performance.now();
  const step = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    x += dir * speed * dt; if (x > 100) { x = 100; dir = -1; } if (x < 0) { x = 0; dir = 1; }
    mark.style.left = `${x}%`;
    if (drillRun) drillRun.raf = requestAnimationFrame(step);
  };
  drillRun = { raf: requestAnimationFrame(step) };
  go.textContent = 'Stop (3 left)';
  go.addEventListener('click', () => {
    const c = zoneX + zoneW / 2;
    const off = Math.abs(x - c);
    const sc = off <= zoneW / 2 ? Math.round(100 - (off / (zoneW / 2)) * 30) : Math.max(0, Math.round(70 - (off - zoneW / 2) * 3));
    scores.push(sc);
    out.textContent = scores.map((s) => `${s}`).join(' · ');
    if (scores.length >= 3) {
      cleanupDrill();
      const mean = Math.round(scores.reduce((a, b) => a + b, 0) / 3);
      const r = P.trainDrill(drillPick, mean);
      toast(`Drill score ${mean}${r?.grew?.length ? ` — ${[...new Set(r.grew)].join(', ')} up` : ''}`, mean >= 75 ? 'good' : undefined);
      setTimeout(() => navigate('pro'), 500);
      return;
    }
    speed += 18;
    zoneX = 12 + Math.random() * (88 - zoneW - 12); zone.style.left = `${zoneX}%`;
    go.textContent = `Stop (${3 - scores.length} left)`;
  });
  void bar;
}

/* ------------------------------ the match ------------------------------ */
function startProMatch(p) {
  const w = p.world;
  const fx = myFixture(w);
  if (!fx) return;
  const lu = P.lineupFor(p, 'start');
  const oppId = fx.isHome ? fx.away : fx.home;
  const opp = v3.pickXI(w, oppId);
  const refOf = (name) => {
    const row = Object.values(w.squads).flat().find((r) => r[0] === name) || [name, w.people[name]?.pos || 'CM', p.nation];
    const e = resolveEntry(row.slice(0, 3), row[3], w);
    return { id: `cr-${e.name}`, name: e.name, short: e.short, position: e.position, overall: e.overall, stats: e.stats, foot: e.foot, rarity: 'gold', nation: e.nation, look: e.name === p.name ? lookOf(p) : undefined };
  };
  const squad = (cid, xi, bench) => {
    const c = v2.clubOf(cid);
    return { xi: xi.map(refOf), bench: bench.slice(0, 7).map(refOf), name: c.name, short: c.short, colors: c.colors, crest: crestOf(c), rating: v2.squadOverall(w.squads[cid] || [], w) };
  };
  const mine = squad(w.clubId, lu.xi, lu.bench);
  const theirs = squad(oppId, opp.xi, opp.bench);
  enterFullscreen();
  navigate('play', {
    mode: 'single', homeId: 'c1', awayId: 'c2', duration: 180, skill: 1,
    homeSquad: mine, awaySquad: theirs, venueSquad: fx.isHome ? mine : theirs,
    pro: { cardId: `cr-${p.name}`, swapped: !fx.isHome },
  });
}

export { ageOf };
