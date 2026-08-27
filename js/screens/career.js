/**
 * Manager Career — the screens. The rules live in js/career.js; the matchday
 * itself is played in screens/play.js with mode 'career'.
 *
 * Flow: mode select (Player Mode is honestly labelled a future feature, not a
 * dead button) -> pick or build a manager -> take a job -> the hub. The hub is
 * one screen with six tabs because a career is lived weekly: Overview is where
 * you land, everything else is a look sideways.
 */
import { getState, update } from '../state.js';
import {
  CAREER_CLUBS, REAL_MANAGERS, careerClub, leagueClubs, squadOf, clubOverall,
  startCareer, myFixture, advanceWeek, sortedCareerTable, marketPool, askingPrice,
  openNegotiation, respondToFee, respondToTerms, completeTransfer, renewContract,
  releaseExpired, resolveEntry, fmtCoins, simScore, START_COINS,
} from '../career.js';
import { NATION_COLORS } from '../data/realPlayers.js';
import { crestSVG, flagSVG } from '../components/crest.js';
import { faceSVG, faceOf } from '../components/face.js';
import { navigate, toast } from '../app.js';
import { screenHead } from '../components/screenHead.js';

export const TITLE = 'Career';

let step = 'modes';        // pre-career flow position
let tab = 'overview';      // hub tab
let custom = null;         // the custom-manager draft
let market = { q: '', pos: 'all', league: 'all', maxAge: 40, minOvr: 0, sort: 'value' };

const crestOf = (club) => ({ shape: club.shape, pattern: 'solid', device: 'star', colors: club.colors });
const managerFace = (name, i = 0) => faceSVG({ id: `mgr-${name}-${i}`, name }, 72, '#1a2130');

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */
export function render() {
  const car = getState().career;
  if (car?.v === 2) return hubHTML(car);
  if (step === 'manager') return managerHTML();
  if (step === 'custom') return customHTML();
  if (step === 'club') return clubsHTML();
  return modesHTML();
}

function modesHTML() {
  return `
    ${screenHead({ kicker: 'Mode 03', title: 'Career', sub: 'Take a real club. Live with the results.', motif: 'season', tone: 'b' })}
    <div class="cm-modes">
      <button class="cm-mode glass" id="cmManager">
        <span class="cm-kicker">Available now</span>
        <b>MANAGER MODE</b>
        <p>You are the manager. Pick your touchline persona, take charge of a real club,
           work the transfer market, and influence matches from the technical area —
           the players are yours to steer, never to control.</p>
        <span class="cm-cta">Start →</span>
      </button>
      <div class="cm-mode glass is-locked">
        <span class="cm-kicker">In development</span>
        <b>PLAYER MODE</b>
        <p>One footballer, one boot-room locker, a whole career from prospect to icon.</p>
        <span class="cm-uc">UNDER CONSTRUCTION</span>
      </div>
    </div>`;
}

function managerHTML() {
  return `
    ${screenHead({ kicker: 'Manager Mode', title: 'Choose your manager', sub: 'A real name on the touchline, or your own.', motif: 'season', tone: 'b' })}
    <div class="mgr-grid">
      <button class="mgr-card glass is-custom" id="mgrCustom">
        <span class="mgr-face plus">+</span>
        <b>Create your own</b>
        <span class="mgr-sub">Name, look, nationality — the touchline model is built from it.</span>
      </button>
      ${REAL_MANAGERS.map((m, i) => `
        <button class="mgr-card glass" data-mgr="${i}">
          <span class="mgr-face">${managerFace(m.name, i)}</span>
          <b>${m.name}</b>
          <span class="mgr-sub">${flagSVG(NATION_COLORS[m.nation] || ['#888', '#444'], 18)} ${m.nation} · ${m.age}</span>
        </button>`).join('')}
    </div>
    <p class="disclaimer">Managers are named after real people; portraits and models are drawn, not likenesses,
      and no manager is affiliated with or endorses the game.</p>`;
}

const SKINS = ['#f6d5b8', '#e9bd95', '#d5a072', '#b57a4d', '#8c5733', '#5f3a22'];
const HAIRS = ['#15100c', '#3a2a1a', '#6d4a26', '#a67b3c', '#c9c3ba', '#8d8d94'];
const SUITS = ['#1c222e', '#101318', '#28303f', '#3a2f2a', '#232a24', '#2e2337'];
const TIES  = ['#22c55e', '#c0392b', '#2456a4', '#c9a227', '#666e7c', '#7b2d8b'];

function customHTML() {
  const c = custom;
  const nations = Object.keys(NATION_COLORS).sort();
  const seg = (key, list, kind) => `
    <div class="cs-swatches" data-key="${key}">
      ${list.map((v, i) => `<button class="cs-sw ${c[key] === i ? 'on' : ''}" data-i="${i}"
          style="background:${kind === 'hairstyle' ? '#222' : v}">${kind === 'hairstyle' ? i + 1 : ''}</button>`).join('')}
    </div>`;
  return `
    ${screenHead({ kicker: 'Manager Mode', title: 'Create your manager', sub: 'This is who stands in your technical area.', motif: 'season', tone: 'b' })}
    <div class="cs-layout">
      <aside class="cs-preview glass">
        <span class="csp-face">${faceSVG({ id: `cust-${c.skin}-${c.hair}-${c.hairColor}-${c.beard}`, name: c.first || 'You' }, 96, SUITS[c.suit])}</span>
        <b>${(c.first || 'New')} ${(c.last || 'Manager')}</b>
        <span>${flagSVG(NATION_COLORS[c.nation] || ['#888', '#444'], 18)} ${c.nation} · ${c.age} · ${c.gender}</span>
        <div class="csp-suit">
          <i style="background:${SUITS[c.suit]}"></i><i style="background:${TIES[c.tie]}"></i>
          <span>Suit & tie — worn on the touchline</span>
        </div>
      </aside>
      <div class="cs-form glass">
        <label>First name <input id="csFirst" maxlength="14" value="${c.first}"></label>
        <label>Last name <input id="csLast" maxlength="16" value="${c.last}"></label>
        <label>Nationality
          <select id="csNation">${nations.map((n) => `<option ${n === c.nation ? 'selected' : ''}>${n}</option>`).join('')}</select>
        </label>
        <label>Age <input id="csAge" type="number" min="28" max="75" value="${c.age}"></label>
        <label>Gender
          <select id="csGender">${['Male', 'Female', 'Other'].map((g) => `<option ${g === c.gender ? 'selected' : ''}>${g}</option>`).join('')}</select>
        </label>
        <label>Height <input id="csHeight" type="range" min="160" max="200" value="${c.height}"> <b>${c.height}cm</b></label>
        <div class="cs-row"><span>Skin tone</span>${seg('skin', SKINS)}</div>
        <div class="cs-row"><span>Hair colour</span>${seg('hairColor', HAIRS)}</div>
        <div class="cs-row"><span>Suit</span>${seg('suit', SUITS)}</div>
        <div class="cs-row"><span>Tie</span>${seg('tie', TIES)}</div>
        <label class="cs-check"><input id="csBeard" type="checkbox" ${c.beard ? 'checked' : ''}> Facial hair</label>
        <button class="btn primary wide" id="csDone">Continue to club selection →</button>
      </div>
    </div>`;
}

function clubsHTML() {
  const leagues = [...new Set(CAREER_CLUBS.map((c) => c.league))];
  return `
    ${screenHead({ kicker: 'Manager Mode', title: 'Choose your club', sub: 'Every squad is real. So is the table you will answer to.', motif: 'season', tone: 'b' })}
    ${leagues.map((lg) => `
      <section class="cc-league">
        <h3>${lg} <span>${leagueClubs(lg)[0].country}</span></h3>
        <div class="cc-grid">
          ${leagueClubs(lg).map((c) => `
            <button class="cc-card glass" data-club="${c.id}" style="--team:${c.colors[0]};--team2:${c.colors[1]}">
              <span class="cc-crest">${crestSVG(crestOf(c), c.short, 56)}</span>
              <b>${c.name}</b>
              <div class="cc-meta">
                <span><i>${clubOverall(c.id)}</i>OVR</span>
                <span><i>${squadOf(c.id).length}</i>Squad</span>
                <span><i>${fmtCoins(START_COINS)}</i>Budget</span>
              </div>
              <span class="cc-cta">Take the job →</span>
            </button>`).join('')}
        </div>
      </section>`).join('')}`;
}

/* ------------------------------------------------------------------ *
 * The hub
 * ------------------------------------------------------------------ */
function hubHTML(car) {
  const club = careerClub(car.clubId);
  const table = sortedCareerTable(car);
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  return `
    <header class="career-head glass" style="--team:${club.colors[0]};--team2:${club.colors[1]}">
      <div class="ch-crest">${crestSVG(crestOf(club), club.short, 62)}</div>
      <div class="ch-id">
        <b>${club.name}</b>
        <span>${club.league} · Season ${car.season} · ${car.manager.name}</span>
      </div>
      <div class="ch-stats">
        <div><b>${car.week <= car.fixtures.length ? car.week : '—'}<small>/${car.fixtures.length}</small></b><span>Week</span></div>
        <div><b>${pos}${ordinal(pos)}</b><span>Position</span></div>
        <div><b class="ch-coins">◎ ${fmtCoins(car.coins)}</b><span>Club Coins</span></div>
        <div><b>${Math.round(car.morale * 100)}</b><span>Morale</span></div>
      </div>
    </header>
    <nav class="tabs" id="cTabs">
      ${[['overview', 'Overview'], ['squad', 'Squad'], ['transfers', 'Transfers'],
        ['fixtures', 'Fixtures'], ['club', 'Club'], ['career', 'Career']]
        .map(([id, l]) => `<button class="tab ${tab === id ? 'on' : ''}" data-tab="${id}">${l}</button>`).join('')}
    </nav>
    <div id="cBody">${hubBody(car)}</div>
    <div class="career-foot"><button class="btn ghost danger" id="quitCareer">Resign</button></div>`;
}

function hubBody(car) {
  if (tab === 'squad') return squadHTML(car);
  if (tab === 'transfers') return transfersHTML(car);
  if (tab === 'fixtures') return fixturesHTML(car);
  if (tab === 'club') return clubHTML(car);
  if (tab === 'career') return careerTabHTML(car);
  return overviewHTML(car);
}

function overviewHTML(car) {
  const club = careerClub(car.clubId);
  if (car.expiring?.length) return renewalsHTML(car);
  if (car.week > car.fixtures.length) return seasonEndHTML(car);
  const fx = myFixture(car);
  const table = sortedCareerTable(car).slice(0, 6);
  const recent = car.results.filter((r) => r.h === car.clubId || r.a === car.clubId).slice(-5).reverse();
  const next = fx && {
    home: careerClub(fx.home), away: careerClub(fx.away),
  };
  return `
    ${next ? `
    <section class="panel glass ov-next">
      <header class="panel-head"><h2>Week ${car.week} · ${club.league}</h2><span class="tag">${fx.isHome ? 'Home' : 'Away'}</span></header>
      <div class="nm-fixture">
        <div class="nm-team">${crestSVG(crestOf(next.home), next.home.short, 52)}<b>${next.home.name}</b><span>OVR ${clubOverall(next.home.id, car.squads)}</span></div>
        <span class="nm-vs">VS</span>
        <div class="nm-team">${crestSVG(crestOf(next.away), next.away.short, 52)}<b>${next.away.name}</b><span>OVR ${clubOverall(next.away.id, car.squads)}</span></div>
      </div>
      <div class="nm-actions">
        <button class="btn primary big" id="playWeek">▶ Matchday — take the touchline</button>
        <button class="btn ghost" id="simWeek">Sim result</button>
      </div>
    </section>` : `
    <section class="panel glass"><header class="panel-head"><h2>Week ${car.week} — no fixture</h2></header>
      <p class="lede">A free week. The league plays on without you.</p>
      <button class="btn primary" id="simWeek">Advance the week</button></section>`}
    <div class="ov-cols">
      <section class="panel glass">
        <header class="panel-head"><h2>Table</h2></header>
        ${miniTable(table, car.clubId)}
      </section>
      <section class="panel glass">
        <header class="panel-head"><h2>Recent results</h2></header>
        ${recent.length ? recent.map((r) => resultRow(r, car)).join('') : '<p class="ov-empty">The season starts this week.</p>'}
        <div class="ov-meters">
          ${meter('Team morale', car.morale)}
          ${meter('Reputation', car.stats.rep / 100)}
        </div>
      </section>
    </div>`;
}

const meter = (label, v) => `
  <div class="ov-meter"><span>${label}</span><i><b style="width:${Math.round(v * 100)}%"></b></i></div>`;

const resultRow = (r, car) => {
  const h = careerClub(r.h); const a = careerClub(r.a);
  const mineHome = r.h === car.clubId;
  const win = mineHome ? r.hg > r.ag : r.ag > r.hg;
  const draw = r.hg === r.ag;
  return `<div class="rr ${win ? 'win' : draw ? 'draw' : 'loss'}">
    <span>${h.short} ${r.hg} – ${r.ag} ${a.short}</span><b>${win ? 'W' : draw ? 'D' : 'L'}</b></div>`;
};

function miniTable(rows, mine) {
  return `<table class="ltable"><thead><tr><th></th><th></th><th>P</th><th>GD</th><th>Pts</th></tr></thead>
    <tbody>${rows.map((r, i) => `
      <tr class="${r.id === mine ? 'mine' : ''}">
        <td>${i + 1}</td><td class="lt-club">${crestSVG(crestOf(r.club), r.club.short, 20)} ${r.club.short}</td>
        <td>${r.p}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.pts}</b></td>
      </tr>`).join('')}</tbody></table>`;
}

function squadHTML(car) {
  const sq = car.squads[car.clubId].map((r) => resolveEntry(r.slice(0, 3), r[3]))
    .sort((a, b) => b.overall - a.overall);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Squad · ${sq.length} players</h2>
        <span class="tag">Wage bill ${fmtCoins(sq.reduce((s, p) => s + (p.contract?.wage ?? p.wage), 0))}/wk</span></header>
      <div class="cq-rows">
        ${sq.map((p) => `
          <div class="cq-row">
            <b class="cq-ovr rar-${p.overall >= 88 ? 'special' : p.overall >= 80 ? 'gold' : 'silver'}">${p.overall}</b>
            <span class="cq-pos">${p.position}</span>
            <span class="cq-name">${p.name}</span>
            <span class="cq-nat">${flagSVG(NATION_COLORS[p.nation] || ['#888', '#444'], 16)} ${p.age}y</span>
            <span class="cq-form ${p.form > 0 ? 'up' : p.form < 0 ? 'dn' : ''}">${p.form > 0 ? '▲' : p.form < 0 ? '▼' : '–'}</span>
            <span class="cq-val">◎ ${fmtCoins(p.value)}</span>
            <span class="cq-wage">${fmtCoins(p.contract?.wage ?? p.wage)}/wk</span>
            <span class="cq-con ${p.contract.years <= 1 ? 'warn' : ''}">${p.contract.years}y</span>
          </div>`).join('')}
      </div>
    </section>`;
}

/* --------------------------- transfers --------------------------- */
function transfersHTML(car) {
  if (car.negotiation) return negotiationHTML(car);
  const pool = marketPool(car);
  const q = market.q.toLowerCase();
  const GROUPS = { GK: ['GK'], DF: ['CB', 'LB', 'RB'], MF: ['CDM', 'CM', 'CAM', 'LM', 'RM'], FW: ['LW', 'RW', 'ST'] };
  let rows = pool.filter((p) =>
    (!q || p.name.toLowerCase().includes(q) || p.club.name.toLowerCase().includes(q) || p.nation.toLowerCase().includes(q))
    && (market.pos === 'all' || GROUPS[market.pos].includes(p.position))
    && (market.league === 'all' || p.club.league === market.league)
    && p.age <= market.maxAge && p.overall >= market.minOvr);
  rows.sort(market.sort === 'ovr' ? (a, b) => b.overall - a.overall
    : market.sort === 'age' ? (a, b) => a.age - b.age : (a, b) => b.value - a.value);
  rows = rows.slice(0, 40);
  const short = new Set(car.shortlist);
  const leagues = [...new Set(CAREER_CLUBS.map((c) => c.league))];
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Transfer market</h2><span class="tag">◎ ${fmtCoins(car.coins)} available</span></header>
      <div class="tm-tools">
        <input id="tmQ" placeholder="Player, club or nation…" value="${market.q}">
        <select id="tmPos">${['all', 'GK', 'DF', 'MF', 'FW'].map((p) => `<option ${market.pos === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
        <select id="tmLeague"><option ${market.league === 'all' ? 'selected' : ''}>all</option>
          ${leagues.map((l) => `<option ${market.league === l ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <select id="tmSort">${[['value', 'By value'], ['ovr', 'By rating'], ['age', 'By age']]
          .map(([v, l]) => `<option value="${v}" ${market.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      </div>
      <div class="cq-rows">
        ${rows.map((p) => `
          <div class="cq-row tm-row">
            <b class="cq-ovr rar-${p.overall >= 88 ? 'special' : p.overall >= 80 ? 'gold' : 'silver'}">${p.overall}</b>
            <span class="cq-pos">${p.position}</span>
            <span class="cq-name">${p.name}<small>${p.club.name} · ${p.contract?.years ?? '?'}y left</small></span>
            <span class="cq-val">◎ ${fmtCoins(askingPrice(p, p.contract))}</span>
            <button class="mini-btn ${short.has(p.name) ? 'on' : ''}" data-short="${p.name}">★</button>
            <button class="btn sm" data-offer="${p.name}" data-from="${p.clubId}">Offer</button>
          </div>`).join('')}
        ${rows.length ? '' : '<p class="ov-empty">Nobody matches those filters.</p>'}
      </div>
    </section>
    ${car.shortlist.length ? `
    <section class="panel glass"><header class="panel-head"><h2>Shortlist</h2></header>
      <div class="cq-rows">${car.shortlist.map((n) => {
        const p = pool.find((x) => x.name === n);
        return p ? `<div class="cq-row tm-row"><b class="cq-ovr">${p.overall}</b>
          <span class="cq-name">${p.name}<small>${p.club.name}</small></span>
          <button class="btn sm" data-offer="${p.name}" data-from="${p.clubId}">Offer</button>
          <button class="mini-btn on" data-short="${p.name}">★</button></div>` : '';
      }).join('')}</div></section>` : ''}
    <section class="panel glass"><header class="panel-head"><h2>Incoming offers</h2></header>
      <p class="ov-empty">No club has moved for your players yet.</p></section>`;
}

function negotiationHTML(car) {
  const neg = car.negotiation;
  const pool = marketPool(car);
  const p = pool.find((x) => x.name === neg.player);
  if (!p || neg.state === 'off') {
    return `<section class="panel glass"><header class="panel-head"><h2>Negotiation over</h2></header>
      <p class="lede">${p ? 'The deal is dead — they have ended talks.' : 'The player is no longer available.'}</p>
      <button class="btn primary" id="negClose">Back to the market</button></section>`;
  }
  const ask = askingPrice(p, p.contract);
  if (neg.state === 'fee') return `
    <section class="panel glass neg">
      <header class="panel-head"><h2>Transfer offer · ${p.name}</h2><span class="tag">${p.club.name}</span></header>
      <div class="neg-facts">
        <span><b>${p.overall}</b> OVR</span><span><b>${p.age}</b> Age</span>
        <span><b>${p.contract?.years ?? '?'}y</b> Contract left</span>
        <span><b>◎ ${fmtCoins(p.value)}</b> Value</span>
      </div>
      <p class="neg-note">${neg.counter ? `Their counter: <b>◎ ${fmtCoins(neg.counter)}</b>` : `They value him around <b>◎ ${fmtCoins(ask)}</b>. A short contract is your leverage.`}</p>
      <div class="neg-offer">
        <input id="negFee" type="number" step="1000000" min="0" value="${neg.counter || Math.round(ask * 0.85)}">
        <button class="btn primary" id="negSubmit">Submit offer</button>
        <button class="btn ghost" id="negClose">Walk away</button>
      </div>
      <span class="neg-round">Round ${neg.rounds + 1} of 3 · ◎ ${fmtCoins(car.coins)} available</span>
    </section>`;
  if (neg.state === 'terms') return `
    <section class="panel glass neg">
      <header class="panel-head"><h2>Contract talks · ${p.name}</h2><span class="tag">Fee agreed ◎ ${fmtCoins(neg.agreedFee)}</span></header>
      <p class="neg-note">${neg.floorNote || `He earns ${fmtCoins(p.wage)}/wk now. Longer deals buy a lower wage.`}</p>
      <div class="neg-offer">
        <label>Wage/week <input id="negWage" type="number" step="1000" value="${Math.round(p.wage * 1.15)}"></label>
        <label>Years <select id="negYears">${[1, 2, 3, 4].map((y) => `<option ${y === 3 ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
        <button class="btn primary" id="negTerms">Offer terms</button>
        <button class="btn ghost" id="negClose">Walk away</button>
      </div>
    </section>`;
  return `
    <section class="panel glass neg is-done">
      <header class="panel-head"><h2>✓ ${p.name} joins ${careerClub(car.clubId).name}</h2></header>
      <p class="lede">◎ ${fmtCoins(neg.agreedFee)} to ${p.club.name} · ${fmtCoins(neg.wage)}/wk for ${neg.years} year${neg.years === 1 ? '' : 's'}.</p>
      <button class="btn primary" id="negComplete">Complete the transfer</button>
    </section>`;
}

/* ----------------------------- others ---------------------------- */
function fixturesHTML(car) {
  const mine = car.results.filter((r) => r.h === car.clubId || r.a === car.clubId);
  const upcoming = car.fixtures.slice(car.week - 1).map((round, i) => {
    const m = round.find(([h, a]) => h === car.clubId || a === car.clubId);
    return m ? { week: car.week + i, h: m[0], a: m[1] } : null;
  }).filter(Boolean).slice(0, 8);
  return `
    <div class="ov-cols">
      <section class="panel glass"><header class="panel-head"><h2>Played</h2></header>
        ${mine.length ? mine.slice().reverse().map((r) => resultRow(r, car)).join('') : '<p class="ov-empty">Nothing yet.</p>'}
      </section>
      <section class="panel glass"><header class="panel-head"><h2>Upcoming</h2></header>
        ${upcoming.map((f) => `<div class="rr"><span>W${f.week} · ${careerClub(f.h).short} v ${careerClub(f.a).short}</span>
          <b>${f.h === car.clubId ? 'H' : 'A'}</b></div>`).join('') || '<p class="ov-empty">Season over.</p>'}
      </section>
    </div>`;
}

function clubHTML(car) {
  const club = careerClub(car.clubId);
  const sq = car.squads[car.clubId].map((r) => resolveEntry(r.slice(0, 3), r[3]));
  const value = sq.reduce((s, p) => s + p.value, 0);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${club.name}</h2><span class="tag">${club.country}</span></header>
      <div class="neg-facts">
        <span><b>${club.league}</b> League</span>
        <span><b>${clubOverall(car.clubId, car.squads)}</b> Squad OVR</span>
        <span><b>◎ ${fmtCoins(value)}</b> Squad value</span>
        <span><b>◎ ${fmtCoins(car.coins)}</b> Transfer funds</span>
        <span><b>${car.stats.rep}</b> Reputation</span>
      </div>
    </section>
    <section class="panel glass"><header class="panel-head"><h2>League table</h2></header>
      ${miniTable(sortedCareerTable(car), car.clubId)}
    </section>`;
}

function careerTabHTML(car) {
  const m = car.manager;
  const s = car.stats;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${m.name}</h2><span class="tag">${m.nation} · ${m.age}</span></header>
      <div class="neg-facts">
        <span><b>${s.w}</b> Wins</span><span><b>${s.d}</b> Draws</span><span><b>${s.l}</b> Losses</span>
        <span><b>${s.trophies}</b> Trophies</span><span><b>${s.seasons}</b> Seasons</span><span><b>${s.rep}</b> Reputation</span>
      </div>
      ${car.history.length ? `<div class="cq-rows">${car.history.map((h) =>
        `<div class="rr"><span>Season ${h.season}</span><b>${h.pos}${ordinal(h.pos)} · ${h.pts} pts</b></div>`).join('')}</div>` : ''}
    </section>`;
}

function renewalsHTML(car) {
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Contracts expiring</h2></header>
      <p class="lede">These deals are up. Renew them or let the players walk.</p>
      <div class="cq-rows">
        ${car.expiring.map((n) => {
          const row = car.squads[car.clubId].find((r) => r[0] === n);
          if (!row) return '';
          const p = resolveEntry(row.slice(0, 3), row[3]);
          return `<div class="cq-row"><b class="cq-ovr">${p.overall}</b>
            <span class="cq-name">${p.name}<small>wants ~${fmtCoins(Math.round(p.wage * 1.1))}/wk</small></span>
            <button class="btn sm" data-renew="${n}">Renew 2y</button>
            <button class="btn sm ghost" data-release="${n}">Let go</button></div>`;
        }).join('')}
      </div>
      <button class="btn primary" id="renewDone">Done — start the season</button>
    </section>`;
}

function seasonEndHTML(car) {
  const table = sortedCareerTable(car);
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  return `
    <section class="panel glass season-end">
      <h2>Season ${car.season} complete</h2>
      <p class="season-line">You finished <b>${pos}${ordinal(pos)}</b> with <b>${car.table[car.clubId].pts}</b> points.
        ${pos === 1 ? 'Champions.' : `${table[0].club.name} took the title.`}</p>
      ${miniTable(table, car.clubId)}
      <button class="btn primary big" id="nextSeason">Continue to season ${car.season + 1}</button>
    </section>`;
}

const ordinal = (n) => (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

/* ------------------------------------------------------------------ *
 * Mount
 * ------------------------------------------------------------------ */
export function mount(root) {
  const rerender = () => { root.innerHTML = render(); wire(root); };
  wire(root, rerender);
  return () => {};
}

function wire(root) {
  const rerender = () => { root.innerHTML = render(); wire(root); };
  const car = () => getState().career;

  root.querySelector('#cmManager')?.addEventListener('click', () => { step = 'manager'; rerender(); });
  root.querySelectorAll('[data-mgr]').forEach((el) => el.addEventListener('click', () => {
    const m = REAL_MANAGERS[+el.dataset.mgr];
    custom = { real: true, name: m.name, nation: m.nation, age: m.age };
    step = 'club'; rerender();
  }));
  root.querySelector('#mgrCustom')?.addEventListener('click', () => {
    custom = { real: false, first: '', last: '', nation: 'England', age: 42, gender: 'Male',
      height: 180, skin: 1, hair: 0, hairColor: 0, beard: false, suit: 0, tie: 0 };
    step = 'custom'; rerender();
  });

  // custom builder
  if (step === 'custom' && custom) {
    const c = custom;
    const bind = (id, key, num = false) => root.querySelector(id)?.addEventListener('change', (e) => {
      c[key] = num ? +e.target.value : e.target.value; rerender();
    });
    bind('#csFirst', 'first'); bind('#csLast', 'last'); bind('#csNation', 'nation');
    bind('#csAge', 'age', true); bind('#csGender', 'gender'); bind('#csHeight', 'height', true);
    root.querySelector('#csBeard')?.addEventListener('change', (e) => { c.beard = e.target.checked; rerender(); });
    root.querySelectorAll('.cs-swatches').forEach((row) => row.querySelectorAll('.cs-sw').forEach((sw) =>
      sw.addEventListener('click', () => { c[row.dataset.key] = +sw.dataset.i; rerender(); })));
    root.querySelector('#csDone')?.addEventListener('click', () => {
      if (!c.first.trim() && !c.last.trim()) { toast('Give your manager a name', 'warn'); return; }
      c.name = `${c.first.trim()} ${c.last.trim()}`.trim();
      step = 'club'; rerender();
    });
  }

  root.querySelectorAll('[data-club]').forEach((el) => el.addEventListener('click', () => {
    startCareer(custom, el.dataset.club);
    tab = 'overview'; step = 'modes';
    toast(`Appointed at ${careerClub(el.dataset.club).name}. ◎ ${fmtCoins(START_COINS)} to spend.`, 'good');
    rerender();
  }));

  // hub
  root.querySelectorAll('#cTabs [data-tab]').forEach((el) => el.addEventListener('click', () => { tab = el.dataset.tab; rerender(); }));
  root.querySelector('#quitCareer')?.addEventListener('click', () => {
    update((s) => { s.career = null; }); step = 'modes'; rerender();
  });
  root.querySelector('#playWeek')?.addEventListener('click', () => startMatchday(car()));
  root.querySelector('#simWeek')?.addEventListener('click', () => {
    const fx = myFixture(car());
    advanceWeek(fx ? simScore(fx.home, fx.away, car().squads) : null);
    rerender();
  });
  root.querySelector('#nextSeason')?.addEventListener('click', rerender);

  // transfers
  const remember = () => {
    market.q = root.querySelector('#tmQ')?.value ?? market.q;
    market.pos = root.querySelector('#tmPos')?.value ?? market.pos;
    market.league = root.querySelector('#tmLeague')?.value ?? market.league;
    market.sort = root.querySelector('#tmSort')?.value ?? market.sort;
  };
  root.querySelector('#tmQ')?.addEventListener('input', () => { remember(); rerender(); root.querySelector('#tmQ')?.focus(); });
  ['#tmPos', '#tmLeague', '#tmSort'].forEach((id) =>
    root.querySelector(id)?.addEventListener('change', () => { remember(); rerender(); }));
  root.querySelectorAll('[data-short]').forEach((el) => el.addEventListener('click', () => {
    update((s) => {
      const l = s.career.shortlist; const n = el.dataset.short;
      const i = l.indexOf(n); if (i >= 0) l.splice(i, 1); else l.push(n);
    }); rerender();
  }));
  root.querySelectorAll('[data-offer]').forEach((el) => el.addEventListener('click', () => {
    update((s) => { s.career.negotiation = openNegotiation(s.career, el.dataset.offer, el.dataset.from); });
    rerender();
  }));
  root.querySelector('#negClose')?.addEventListener('click', () => { update((s) => { s.career.negotiation = null; }); rerender(); });
  root.querySelector('#negSubmit')?.addEventListener('click', () => {
    const fee = +root.querySelector('#negFee').value || 0;
    if (fee > car().coins) { toast('You do not have that much', 'warn'); return; }
    update((s) => {
      const neg = s.career.negotiation;
      const p = marketPool(s.career).find((x) => x.name === neg.player);
      const res = respondToFee(neg, fee, p, p.contract);
      toast(res.note, res.ok ? 'good' : 'info');
    });
    rerender();
  });
  root.querySelector('#negTerms')?.addEventListener('click', () => {
    const wage = +root.querySelector('#negWage').value || 0;
    const years = +root.querySelector('#negYears').value || 3;
    update((s) => {
      const neg = s.career.negotiation;
      const p = marketPool(s.career).find((x) => x.name === neg.player);
      const res = respondToTerms(neg, wage, years, p);
      if (!res.ok && res.note) { neg.floorNote = res.note; }
    });
    rerender();
  });
  root.querySelector('#negComplete')?.addEventListener('click', () => {
    update((s) => {
      const ok = completeTransfer(s.career, s.career.negotiation);
      toast(ok ? `${s.career.negotiation.player} has signed` : 'The transfer fell through', ok ? 'good' : 'warn');
      s.career.negotiation = null;
    });
    rerender();
  });

  // renewals
  root.querySelectorAll('[data-renew]').forEach((el) => el.addEventListener('click', () => {
    update((s) => {
      const ok = renewContract(s.career, el.dataset.renew, 2);
      if (ok) s.career.expiring = s.career.expiring.filter((n) => n !== el.dataset.renew);
      toast(ok ? `${el.dataset.renew} signs on` : `${el.dataset.renew} rejected the offer`, ok ? 'good' : 'warn');
    }); rerender();
  }));
  root.querySelectorAll('[data-release]').forEach((el) => el.addEventListener('click', () => {
    update((s) => {
      const rows = s.career.squads[s.career.clubId];
      const i = rows.findIndex((r) => r[0] === el.dataset.release);
      if (i >= 0) rows.splice(i, 1);
      s.career.expiring = s.career.expiring.filter((n) => n !== el.dataset.release);
    }); rerender();
  }));
  root.querySelector('#renewDone')?.addEventListener('click', () => {
    update((s) => releaseExpired(s.career)); rerender();
  });
}

/* ------------------------------------------------------------------ *
 * Matchday launch
 * ------------------------------------------------------------------ */
function startMatchday(car) {
  const fx = myFixture(car);
  if (!fx) return;
  const mk = (cid) => {
    const sq = car.squads[cid].map((r) => resolveEntry(r.slice(0, 3), r[3]));
    // best XI in a 4-4-2 shape: GK, back four, mid four, front two
    const want = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW'];
    const GROUPS = { GK: 'GK', CB: 'DF', LB: 'DF', RB: 'DF', CDM: 'MF', CM: 'MF', CAM: 'MF', LM: 'MF', RM: 'MF', LW: 'FW', RW: 'FW', ST: 'FW' };
    const rest = sq.slice().sort((a, b) => b.overall - a.overall);
    const xi = [];
    for (const g of want) {
      const i = rest.findIndex((p) => GROUPS[p.position] === g);
      xi.push(i >= 0 ? rest.splice(i, 1)[0] : rest.shift());
    }
    const club = careerClub(cid);
    const ref = (p) => ({ id: `cr-${p.name}`, name: p.name, short: p.short, position: p.position,
      overall: p.overall, stats: p.stats, foot: p.foot, rarity: 'gold', nation: p.nation });
    return {
      xi: xi.map(ref),
      bench: rest.slice(0, 7).map(ref),
      name: club.name, short: club.short, colors: club.colors, crest: crestOf(club),
    };
  };
  /* The colours the touchline model wears. A custom manager chose them; a
     real one gets a drawn look derived from his name and a charcoal suit. */
  const look = car.manager.real
    ? { ...faceOf({ id: `mgr-${car.manager.name}`, name: car.manager.name }), suit: '#1c222e' }
    : { skin: ['#f6d5b8', '#e9bd95', '#d5a072', '#b57a4d', '#8c5733', '#5f3a22'][car.manager.skin] || '#e9bd95',
        hair: ['#15100c', '#3a2a1a', '#6d4a26', '#a67b3c', '#c9c3ba', '#8d8d94'][car.manager.hairColor] || '#3a2a1a',
        suit: ['#1c222e', '#101318', '#28303f', '#3a2f2a', '#232a24', '#2e2337'][car.manager.suit] || '#1c222e' };
  navigate('play', {
    mode: 'career',
    homeId: 'c1', awayId: 'c2',           // world ids only anchor the pitch; squads override everything
    duration: 90,
    homeSquad: mk(fx.home),
    awaySquad: mk(fx.away),
    career: { isHome: fx.isHome, manager: { ...car.manager, look, height: car.manager.height || 182 }, morale: car.morale },
  });
}
