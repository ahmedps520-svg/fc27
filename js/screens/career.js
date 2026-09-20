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
  releaseExpired, resolveEntry, fmtCoins, simScore, START_COINS, parseAmount,
  frozenOut, MONTHS_PER_WEEK,
} from '../career.js';
import { NATION_COLORS } from '../data/realPlayers.js';
import { crestSVG, flagSVG } from '../components/crest.js';
import { faceSVG, faceOf } from '../components/face.js';
import { navigate, toast } from '../app.js';
import { screenHead } from '../components/screenHead.js';
import * as v2 from '../careerV2.js';
import { GROUND_LEVELS, groundLevel, groundCapacity, gateIncome, groundOf, expansionOffer, expand } from '../builder.js';
import { sfx } from '../audio.js';

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
  if (car?.v >= 2) return hubHTML(car);
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
/* The hub. One banner that IS the club — crest large, colours bleeding through
 * the whole header, the season's vital numbers as chips — over a segmented
 * in-flow nav (`.cnav`, deliberately NOT `.tabs`: that class is the Ultimate
 * XI bottom dock, position:fixed, and borrowing it pinned the career nav over
 * the page's own content — the "menu looks broken" bug). */
function hubHTML(car) {
  const club = careerClub(car.clubId);
  const table = sortedCareerTable(car);
  const row = car.table[car.clubId];
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  const offersN = (car.offers || []).filter((o) => o.state === 'open').length;
  const NAV = [['overview', 'Overview', '◉'], ['squad', 'Squad', '⬢'], ['transfers', 'Transfers', '⇄'],
    ['offers', `Offers${offersN ? ` (${offersN})` : ''}`, '✉'], ['youth', 'Academy', '❋'], ['scout', 'Scouting', '◎'],
    ['fixtures', 'Fixtures', '▤'], ['cup', 'Cup', '🏆'], ['board', 'Board', '▦'], ['club', 'Club', '⛨'], ['career', 'Career', '★']];
  return `
    <header class="chub" style="--team:${club.colors[0]};--team2:${club.colors[1]}">
      <div class="chub-top">
        <span class="chub-crest">${crestSVG(crestOf(club), club.short, 74)}</span>
        <div class="chub-id">
          <b>${club.name}</b>
          <span>${club.league} · Season ${car.season}</span>
          <span class="chub-mgr">${car.manager.name}</span>
        </div>
        <div class="chub-coins"><span>Club Coins</span><b>◎ ${fmtCoins(car.coins)}</b></div>
      </div>
      <div class="chub-chips">
        <span class="chip"><b>${pos}${ordinal(pos)}</b> of ${table.length}</span>
        <span class="chip"><b>${row.pts}</b> pts</span>
        <span class="chip"><b>${row.w}-${row.d}-${row.l}</b> W-D-L</span>
        <span class="chip"><b>M${Math.min(car.week, car.fixtures.length) * MONTHS_PER_WEEK}</b> of ${car.fixtures.length * MONTHS_PER_WEEK}</span>
        <span class="chip ${car.morale < 0.35 ? 'bad' : car.morale > 0.7 ? 'good' : ''}"><b>${Math.round(car.morale * 100)}</b> morale</span>
      </div>
    </header>
    <nav class="cnav" id="cTabs">
      ${NAV.map(([id, l, ic]) => `<button class="cnav-b ${tab === id ? 'on' : ''}" data-tab="${id}"><i>${ic}</i>${l}</button>`).join('')}
    </nav>
    <div id="cBody">${hubBody(car)}</div>
    <div class="career-foot"><button class="btn ghost danger" id="quitCareer">Resign</button></div>`;
}

function hubBody(car) {
  if (car.review) return reviewHTML(car);
  if (tab === 'offers') return offersHTML(car);
  if (tab === 'youth') return youthHTML(car);
  if (tab === 'scout') return scoutHTML(car);
  if (tab === 'cup') return cupHTML(car);
  if (tab === 'board') return boardHTML(car);
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
  const press = car.pressPending ? pressHTML(car) : '';
  const cupWeek = car.fixtures[car.week - 1]?.type === 'cup';
  return `
    ${press}
    ${next ? `
    <section class="cfix" style="--th:${next.home.colors[0]};--ta:${next.away.colors[0]}">
      <span class="cfix-kicker">${fx.cup ? `Cup · ${cupRoundName(car, fx.round)}` : `Matchday · ${car.leagueOf?.[car.clubId] || club.league}`} · Month ${car.week * MONTHS_PER_WEEK} · ${fx.isHome ? 'Home' : 'Away'}</span>
      <div class="cfix-teams">
        <div class="cfix-t">${crestSVG(crestOf(next.home), next.home.short, 64)}<b>${next.home.short}</b><span>${clubOverall(next.home.id, car.squads)} OVR</span></div>
        <span class="cfix-vs">VS</span>
        <div class="cfix-t">${crestSVG(crestOf(next.away), next.away.short, 64)}<b>${next.away.short}</b><span>${clubOverall(next.away.id, car.squads)} OVR</span></div>
      </div>
      <div class="cfix-actions">
        <button class="btn primary big" id="playWeek">▶ Take the touchline</button>
        <button class="btn ghost" id="simWeek">Sim result</button>
      </div>
    </section>` : `
    <section class="panel glass"><header class="panel-head"><h2>Month ${car.week * MONTHS_PER_WEEK} — ${cupWeek ? 'out of the cup' : 'no fixture'}</h2></header>
      <p class="lede">${cupWeek ? 'The cup round goes on without you.' : 'A free month. The league plays on without you.'}</p>
      <button class="btn primary" id="simWeek">Advance</button></section>`}
    ${(car.offers || []).some((o) => o.state === 'open') ? `<section class="panel glass ov-offer"><header class="panel-head"><h2>Offers on the table <small>${car.offers.filter((o) => o.state === 'open').length}</small></h2></header>
      <p class="hint">${car.offers.filter((o) => o.state === 'open').map((o) => `${careerClub(o.from)?.name} want ${o.player} — ${fmtCoins(o.fee)}`).join(' · ')}</p>
      <button class="btn" data-tab-go="offers">Answer them →</button></section>` : ''}
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
          ${car.board ? meter(`Board patience · ${car.board.text}`, car.board.patience) : ''}
        </div>
      </section>
    </div>
    ${(car.transferNews || []).length ? `<section class="panel glass"><header class="panel-head"><h2>Transfer news</h2></header>
      ${car.transferNews.slice(0, 5).map((d) => `<div class="rr"><span>${d.player} · ${careerClub(d.from)?.short} → ${careerClub(d.to)?.short}</span><b>${fmtCoins(d.fee)}</b></div>`).join('')}</section>` : ''}`;
}

const cupRoundName = (car, round) => {
  const left = (car.cup?.rounds || 4) - round;
  return left === 1 ? 'Final' : left === 2 ? 'Semi-final' : left === 3 ? 'Quarter-final' : `Round ${round + 1}`;
};

/* ------------------------------ v2 panels ------------------------------ */
function pressHTML(car) {
  const qi = (car.week + car.season - 1) % v2.PRESS.length;
  const q = v2.PRESS[qi];
  return `
    <section class="panel glass press">
      <header class="panel-head"><h2>Press conference</h2></header>
      <p class="press-q">“${q.q}”</p>
      <div class="press-a">${q.a.map(([txt], i) => `<button class="btn ghost" data-press="${qi}:${i}">${txt}</button>`).join('')}</div>
    </section>`;
}

function offersHTML(car) {
  const open = (car.offers || []).filter((o) => o.state === 'open');
  const past = (car.offers || []).filter((o) => o.state !== 'open').slice(-6).reverse();
  const win = v2.inWindow(car.week, car.fixtures.length);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Incoming offers <small>${win ? 'window open' : 'window closed'}</small></h2></header>
      ${open.length ? open.map((o) => `
        <div class="offer">
          <div><b>${o.player}</b><span>${careerClub(o.from)?.name} · expires week ${o.until}</span></div>
          <b class="offer-fee">${fmtCoins(o.fee)}</b>
          <div class="offer-actions">
            <button class="btn primary" data-offer="${o.id}:accept">Accept</button>
            <button class="btn" data-offer="${o.id}:counter">Counter</button>
            <button class="btn ghost" data-offer="${o.id}:reject">Reject</button>
          </div>
        </div>`).join('') : `<p class="ov-empty">${win ? 'Nobody has bid this week. Your best players draw the interest.' : 'Offers arrive in the transfer windows: the first three weeks of the season and three at the halfway point.'}</p>`}
      ${past.length ? `<h3 class="p-sub">Recent</h3>${past.map((o) => `<div class="rr"><span>${o.player} · ${careerClub(o.from)?.short}</span><b>${o.state}</b></div>`).join('')}` : ''}
    </section>`;
}

function youthHTML(car) {
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Academy <small>${(car.youth || []).length} prospects</small></h2></header>
      <p class="hint">Prospects train every week and grow toward their potential — faster when the dressing room is happy. Promote one to your squad when he is ready.</p>
      ${(car.youth || []).map((y) => `
        <div class="offer">
          <div><b>${y.name}</b><span>${y.position} · ${y.nation} · ${y.age + (car.season - 1)} · ${y.weeks} weeks in</span></div>
          <b class="offer-fee">${y.rating} <small>→ ${y.potential}</small></b>
          <div class="offer-actions"><button class="btn ${y.rating >= y.potential - 4 ? 'primary' : ''}" data-promote="${y.name}">Promote</button></div>
        </div>`).join('') || '<p class="ov-empty">The academy is empty until next season.</p>'}
    </section>`;
}

function scoutHTML(car) {
  const s = car.scouting;
  const leagues = [...new Set(v2.allClubs().map((c) => c.league))];
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Scouting</h2></header>
      ${s && !s.results ? `<p class="lede">The scout is in ${s.league}. Report in ${s.weeksLeft} week${s.weeksLeft === 1 ? '' : 's'}.</p>` : ''}
      ${s?.results ? `<h3 class="p-sub">Report: ${s.league}</h3>${s.results.map((r) => `
        <div class="offer">
          <div><b>${r.name}</b><span>${r.position} · ${r.nation} · ${r.age} · ${careerClub(r.club)?.name}</span></div>
          <b class="offer-fee">${r.rating} <small>→ ${Math.round(r.potential)}</small></b>
          <div class="offer-actions"><span class="hint">${fmtCoins(r.value)}</span><button class="btn" data-shortlist="${r.name}">Shortlist</button></div>
        </div>`).join('')}` : ''}
      <h3 class="p-sub">Send the scout</h3>
      <div class="scout-leagues">${leagues.map((l) => `<button class="chip ${s?.league === l && !s.results ? 'on' : ''}" data-scout="${l}">${l}</button>`).join('')}</div>
    </section>`;
}

function cupHTML(car) {
  const cup = car.cup;
  if (!cup) return '<section class="panel glass"><p class="ov-empty">No cup this season.</p></section>';
  const mine = cup.results.filter((r) => r.h === car.clubId || r.a === car.clubId);
  const status = cup.winner ? (cup.winner === car.clubId ? 'Winners!' : `${careerClub(cup.winner)?.name} won the cup`) : cup.alive.includes(car.clubId) ? `Still in · ${cupRoundName(car, cup.results.length ? cup.results[cup.results.length - 1].round + 1 : 0)} next` : 'Out';
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>The Cup <small>${status}</small></h2></header>
      <p class="hint">Every club in the country, one leg, a round every fifth week. Penalties settle a draw.</p>
      ${mine.length ? mine.map((r) => `<div class="rr ${r.winner === car.clubId ? 'win' : 'loss'}"><span>${cupRoundName(car, r.round)} · ${careerClub(r.h)?.short} ${r.hg} – ${r.ag} ${careerClub(r.a)?.short}${r.pens ? ' (pens)' : ''}</span><b>${r.winner === car.clubId ? 'W' : 'L'}</b></div>`).join('') : '<p class="ov-empty">Your first tie is coming.</p>'}
      <h3 class="p-sub">Still in</h3>
      <p class="hint">${cup.alive.map((id) => careerClub(id)?.short).join(' · ')}</p>
    </section>`;
}

function boardHTML(car) {
  const b = car.board;
  const table = sortedCareerTable(car);
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>The board</h2></header>
      ${b ? `<p class="lede">This season: <b>${b.text}</b> You are ${pos}${ordinal(pos)}.</p>
      <div class="ov-meters">${meter('Patience', b.patience)}</div>
      <p class="hint">Patience drops when you sit well below the objective and with careless answers to the press; it recovers with results. Below a third of it at season's end, with the objective missed, and you are gone — a cup or a promotion saves you.</p>` : ''}
      <h3 class="p-sub">History</h3>
      ${(car.history || []).map((h) => `<div class="rr"><span>Season ${h.season}</span><b>${h.pos}${ordinal(h.pos)} · ${h.pts} pts</b></div>`).join('') || '<p class="ov-empty">First season.</p>'}
      <p class="hint">Trophies ${car.stats.trophies} · Cups ${car.stats.cups | 0} · Sackings ${car.stats.sackings | 0} · Sold ${car.stats.sold | 0} · Academy graduates ${car.stats.youthPromoted | 0}</p>
    </section>`;
}

function reviewHTML(car) {
  const r = car.review;
  return `
    <section class="panel glass season-end">
      <h2>Season ${car.season - 1} review</h2>
      <p class="season-line">${r.league}: finished <b>${r.pos}${ordinal(r.pos)}</b>${r.champion ? ' — champions!' : ''}${r.cup ? ' · Cup winners' : r.cupRound ? ` · Cup: out after ${r.cupRound} round${r.cupRound > 1 ? 's' : ''}` : ''}</p>
      <p class="season-line">Board asked: <b>${r.objective || '—'}</b> · ${r.met ? 'Met.' : 'Missed.'}</p>
      ${r.promoted ? '<p class="season-line"><b>Promoted!</b> Next season in the top tier.</p>' : ''}
      ${r.relegated ? '<p class="season-line"><b>Relegated.</b> Next season in the second tier.</p>' : ''}
      ${r.moves ? `<p class="hint">Down: ${r.moves.down.map((id) => careerClub(id)?.short).join(', ')} · Up: ${r.moves.up.map((id) => careerClub(id)?.short).join(', ')}</p>` : ''}
      ${r.sacked ? `<p class="season-line"><b>The board have dismissed you.</b> Your reputation earns you these interviews:</p>
        <div class="offer-actions">${r.offers.map((id) => `<button class="btn primary" data-job="${id}">${careerClub(id)?.name} <small>${careerClub(id)?.league}</small></button>`).join('')}</div>`
        : `<button class="btn primary big" id="acceptReview">On to season ${car.season}</button>`}
    </section>`;
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
            ${frozenOut(car, p.name)
              ? `<span class="tm-frozen" title="You insulted them recently">${frozenOut(car, p.name) * MONTHS_PER_WEEK}mo</span>`
              : `<button class="btn sm" data-offer="${p.name}" data-from="${p.clubId}">Offer</button>`}
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
  const tension = `
    <div class="neg-tension ${neg.tension > 0.66 ? 'hot' : neg.tension > 0.33 ? 'warm' : ''}">
      <span>Patience</span><i><b style="width:${Math.round((1 - neg.tension) * 100)}%"></b></i>
      <em>${neg.tension > 0.66 ? 'One more bad number ends this' : neg.tension > 0.33 ? 'They are losing interest' : 'Talks are cordial'}</em>
    </div>`;
  if (neg.state === 'fee') return `
    <section class="panel glass neg">
      <header class="panel-head"><h2>Transfer offer · ${p.name}</h2><span class="tag">${p.club.name}</span></header>
      <div class="neg-facts">
        <span><b>${p.overall}</b> OVR</span><span><b>${p.age}</b> Age</span>
        <span><b>${p.contract?.years ?? '?'}y</b> Contract left</span>
        <span><b>◎ ${fmtCoins(p.value)}</b> Value</span>
      </div>
      ${tension}
      <div class="neg-vs">
        <div><span>They want</span><b>◎ ${fmtCoins(neg.counter || ask)}</b></div>
        <div class="nv-you"><span>You offer</span><b id="negEcho">—</b></div>
      </div>
      <p class="neg-note">Insult them with a joke number and talks end for 10 months.</p>
      <div class="neg-offer">
        <input id="negFee" inputmode="text" placeholder="e.g. 60m or 500k"
               value="${fmtCoins(neg.counter || Math.round(ask * 0.85))}">
        <button class="btn primary" id="negSubmit">Submit offer</button>
        <button class="btn ghost" id="negClose">Walk away</button>
      </div>
      <span class="neg-round">Round ${neg.rounds + 1} of 3 · ◎ ${fmtCoins(car.coins)} available</span>
    </section>`;
  if (neg.state === 'terms') return `
    <section class="panel glass neg">
      <header class="panel-head"><h2>Contract talks · ${p.name}</h2><span class="tag">Fee agreed ◎ ${fmtCoins(neg.agreedFee)}</span></header>
      ${tension}
      <div class="neg-vs">
        <div><span>He earns now</span><b>◎ ${fmtCoins(p.wage)}/wk</b></div>
        <div class="nv-you"><span>Your offer</span><b id="negEcho">—</b></div>
      </div>
      <p class="neg-note">${neg.floorNote || 'Longer deals buy a lower wage. A joke offer ends it for 10 months.'}</p>
      <div class="neg-offer">
        <label>Wage / week <input id="negWage" inputmode="text" placeholder="e.g. 300k" value="${fmtCoins(Math.round(p.wage * 1.15))}"></label>
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
    if (round.type === 'cup') return { week: car.week + i, cup: true, label: cupRoundName(car, round.round) };
    const pairs = round.type === 'league' ? round.pairs : round;
    const m = pairs.find(([h, a]) => h === car.clubId || a === car.clubId);
    return m ? { week: car.week + i, h: m[0], a: m[1] } : null;
  }).filter(Boolean).slice(0, 10);
  return `
    <div class="ov-cols">
      <section class="panel glass"><header class="panel-head"><h2>Played</h2></header>
        ${mine.length ? mine.slice().reverse().map((r) => resultRow(r, car)).join('') : '<p class="ov-empty">Nothing yet.</p>'}
      </section>
      <section class="panel glass"><header class="panel-head"><h2>Upcoming</h2></header>
        ${upcoming.map((f) => f.cup ? `<div class="rr"><span>W${f.week} · Cup · ${f.label}</span><b>🏆</b></div>` : `<div class="rr"><span>W${f.week} · ${careerClub(f.h).short} v ${careerClub(f.a).short}</span>
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
    ${stadiumHTML(car)}
    <section class="panel glass"><header class="panel-head"><h2>League table</h2></header>
      ${miniTable(sortedCareerTable(car), car.clubId)}
    </section>`;
}

/* The ground: what it holds, what it pays, and the next expansion — the
 * board's money when the club is on target, the club's when it is not. */
function stadiumHTML(car) {
  const pos = sortedCareerTable(car).findIndex((r) => r.id === car.clubId) + 1;
  const o = expansionOffer(car, pos);
  const g = groundOf(car);
  const design = getState().club.stadium?.design;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>The ground</h2><span class="tag">Level ${groundLevel(car) + 1} of ${GROUND_LEVELS.length}</span></header>
      <div class="neg-facts">
        <span><b>${groundCapacity(car).toLocaleString()}</b> Capacity</span>
        <span><b>◎ ${fmtCoins(gateIncome(car))}</b> Gate per home match</span>
        <span><b>◎ ${fmtCoins(g.income || 0)}</b> Gate income so far</span>
      </div>
      ${o.done ? '<p class="hint">The ground is as big as they come.</p>' : `
        <p class="hint">Next: <b>${o.nextCapacity.toLocaleString()}</b> seats for <b>◎ ${fmtCoins(o.cost)}</b>.
          ${o.thisSeason ? 'The builders are in — one expansion a season.'
            : o.boardPays ? 'The board will fund it in full: the club is on target.'
            : o.clubCanPay ? `The board will not pay while the club is below its target (${car.board?.text || 'their brief'}) — the club can.`
            : 'The board will not pay while the club is below its target, and the club cannot afford it.'}</p>
        <div class="offer-actions">
          <button class="btn ${o.boardPays ? 'primary' : ''}" id="groundExpand" ${o.thisSeason || (!o.boardPays && !o.clubCanPay) ? 'disabled' : ''}>${o.boardPays ? 'Ask the board to build it' : 'Fund the expansion'}</button>
          <button class="btn ghost" id="groundDesign">${design ? 'Redesign the ground' : 'Design the ground'}</button>
        </div>`}
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
  // v2
  root.querySelectorAll('[data-tab-go]').forEach((el) => el.addEventListener('click', () => { tab = el.dataset.tabGo; rerender(); }));
  root.querySelector('#groundDesign')?.addEventListener('click', () => navigate('builder'));
  root.querySelector('#groundExpand')?.addEventListener('click', () => {
    let r = null;
    update((s) => { const c = s.career; if (!c) return; const pos = sortedCareerTable(c).findIndex((x) => x.id === c.clubId) + 1; r = expand(c, pos); });
    if (!r) return;
    if (!r.ok) return toast(r.why, 'warn');
    sfx('confirm');
    toast(r.boardPaid ? `The board are building: ${r.capacity.toLocaleString()} seats next home match` : `Expansion funded: ${r.capacity.toLocaleString()} seats`, 'good');
    rerender();
  });
  root.querySelectorAll('[data-press]').forEach((el) => el.addEventListener('click', () => {
    const [qi, ai] = el.dataset.press.split(':').map(Number);
    update((s) => { if (s.career) { v2.answerPress(s.career, qi, ai); s.career.pressPending = false; } });
    rerender();
  }));
  root.querySelectorAll('[data-offer]').forEach((el) => el.addEventListener('click', () => {
    const [id, action] = el.dataset.offer.split(':');
    let fee = 0;
    if (action === 'counter') {
      const o = car().offers.find((x) => x.id === id);
      const ask = prompt(`They offer ${fmtCoins(o.fee)}. Ask for (e.g. 45m):`, '');
      if (ask == null) return;
      fee = parseAmount(ask);
      if (!fee) return toast('That is not an amount', 'warn');
    }
    let r;
    update((s) => { r = v2.respondToOffer(s.career, id, action, fee); });
    toast(r.note, r.ok ? 'good' : 'warn');
    rerender();
  }));
  root.querySelectorAll('[data-promote]').forEach((el) => el.addEventListener('click', () => {
    update((s) => v2.promoteYouth(s.career, el.dataset.promote));
    toast(`${el.dataset.promote} joins the first-team squad`, 'good');
    rerender();
  }));
  root.querySelectorAll('[data-scout]').forEach((el) => el.addEventListener('click', () => {
    update((s) => v2.scout(s.career, el.dataset.scout));
    toast(`Scout sent to ${el.dataset.scout} — report in 4 weeks`, 'info');
    rerender();
  }));
  root.querySelectorAll('[data-shortlist]').forEach((el) => el.addEventListener('click', () => {
    update((s) => { if (!s.career.shortlist.includes(el.dataset.shortlist)) s.career.shortlist.push(el.dataset.shortlist); });
    toast(`${el.dataset.shortlist} shortlisted — find him under Transfers`, 'good');
  }));
  root.querySelector('#acceptReview')?.addEventListener('click', () => { update((s) => { s.career.review = null; }); rerender(); });
  root.querySelectorAll('[data-job]').forEach((el) => el.addEventListener('click', () => {
    update((s) => v2.takeJob(s.career, el.dataset.job));
    toast(`Appointed at ${careerClub(el.dataset.job)?.name}`, 'good');
    rerender();
  }));

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
  // money inputs take human shorthand and echo what it means as you type
  const echoAmount = (inputId, suffix = '') => {
    const inp = root.querySelector(inputId);
    const echo = root.querySelector('#negEcho');
    if (!inp || !echo) return;
    const paint = () => {
      const n = parseAmount(inp.value);
      echo.textContent = isNaN(n) ? '—' : `◎ ${fmtCoins(n)}${suffix}`;
      echo.classList.toggle('bad', isNaN(n));
    };
    inp.addEventListener('input', paint);
    paint();
  };
  echoAmount('#negFee');
  echoAmount('#negWage', '/wk');
  root.querySelector('#negSubmit')?.addEventListener('click', () => {
    const fee = parseAmount(root.querySelector('#negFee').value);
    if (isNaN(fee)) { toast('Type an amount like 60m or 500k', 'warn'); return; }
    if (fee > car().coins) { toast('You do not have that much', 'warn'); return; }
    update((s) => {
      const neg = s.career.negotiation;
      const p = marketPool(s.career).find((x) => x.name === neg.player);
      const res = respondToFee(s.career, neg, fee, p, p.contract);
      toast(res.note, res.ok ? 'good' : 'info');
    });
    rerender();
  });
  root.querySelector('#negTerms')?.addEventListener('click', () => {
    const wage = parseAmount(root.querySelector('#negWage').value);
    if (isNaN(wage)) { toast('Type a wage like 300k', 'warn'); return; }
    const years = +root.querySelector('#negYears').value || 3;
    update((s) => {
      const neg = s.career.negotiation;
      const p = marketPool(s.career).find((x) => x.name === neg.player);
      const res = respondToTerms(s.career, neg, wage, years, p);
      if (!res.ok && res.note) { neg.floorNote = res.note; }
      if (neg.state === 'off') toast(res.note, 'warn');
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
