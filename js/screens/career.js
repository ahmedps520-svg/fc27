import { getState, update, newCareer, sortedTable, applyResult, blankRow } from '../state.js';
import { WORLD, getClub, getPlayer, clubRating } from '../data/generator.js';
import { quickResult } from '../matchEngine.js';
import { crestSVG } from '../components/crest.js';
import { playerCard, fmtMoney } from '../components/playerCard.js';
import { showDetail } from './squad.js';
import { navigate, toast } from '../app.js';

export const TITLE = 'Career Mode';

const TOTAL_MATCHDAYS = WORLD.fixtures.length;
let tab = 'hub';

/* ------------------------------------------------------------------ */
export function render() {
  const career = getState().career;
  return career ? hubHTML(career) : pickerHTML();
}

function pickerHTML() {
  return `
    <p class="lede">Pick a club to manage.</p>
    <div class="pick-grid">
      ${WORLD.clubs.map((c) => `
        <button class="pick-card glass" data-pick="${c.id}" style="--team:${c.crest.colors[0]};--team2:${c.crest.colors[1]}">
          <div class="pick-crest">${crestSVG(c.crest, c.short, 66)}</div>
          <b class="pick-name">${c.name}</b>
          <div class="pick-meta">
            <span><i>${clubRating(c.id)}</i>Squad</span>
            <span><i>${fmtMoney(c.budget)}</i>Budget</span>
            <span><i>${c.roster.length}</i>Players</span>
          </div>
          <span class="pick-cta">Take the job →</span>
        </button>`).join('')}
    </div>`;
}

function hubHTML(career) {
  const club = getClub(career.clubId);
  const done = career.matchday > TOTAL_MATCHDAYS;
  const row = career.table[career.clubId];
  const pos = sortedTable(career).findIndex((r) => r.club.id === career.clubId) + 1;

  return `
    <header class="career-head glass" style="--team:${club.crest.colors[0]};--team2:${club.crest.colors[1]}">
      <div class="ch-crest">${crestSVG(club.crest, club.short, 62)}</div>
      <div class="ch-id">
        <b>${club.name}</b>
        <span>${WORLD.leagueName} · Season ${career.season}</span>
      </div>
      <div class="ch-stats">
        <div><b>${done ? '—' : career.matchday}<small>/${TOTAL_MATCHDAYS}</small></b><span>Matchday</span></div>
        <div><b>${pos}${ordinal(pos)}</b><span>Position</span></div>
        <div><b>${row.pts}</b><span>Points</span></div>
        <div><b>${fmtMoney(career.budget)}</b><span>Budget</span></div>
      </div>
    </header>

    <nav class="tabs" id="tabs">
      ${[['hub', 'Fixtures'], ['table', 'League Table'], ['squad', 'Squad'], ['market', 'Transfers']]
        .map(([id, label]) => `<button class="tab ${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`).join('')}
    </nav>

    <div id="tabBody">${tabBody(career)}</div>

    <div class="career-foot">
      <button class="btn ghost danger" id="quitCareer">Resign</button>
    </div>`;
}

function tabBody(career) {
  if (tab === 'table') return tableHTML(career);
  if (tab === 'squad') return squadHTML(career);
  if (tab === 'market') return marketHTML(career);
  return fixturesHTML(career);
}

/* ---------------------------- Fixtures --------------------------- */
function fixturesHTML(career) {
  if (career.matchday > TOTAL_MATCHDAYS) {
    const table = sortedTable(career);
    const pos = table.findIndex((r) => r.club.id === career.clubId) + 1;
    const champion = table[0];
    return `
      <section class="panel glass season-end">
        <h2>Season ${career.season} complete</h2>
        <p class="season-line">
          You finished <b>${pos}${ordinal(pos)}</b> with <b>${career.table[career.clubId].pts}</b> points.
          ${champion.club.id === career.clubId
            ? 'Champions of the ' + WORLD.leagueName + '.'
            : `${champion.club.name} took the title on ${champion.pts}.`}
        </p>
        ${tableHTML(career)}
        <button class="btn primary big" id="nextSeason">Start season ${career.season + 1}</button>
      </section>`;
  }

  const round = WORLD.fixtures[career.matchday - 1];
  const mine = round.matches.find((m) => m.home === career.clubId || m.away === career.clubId);
  const home = getClub(mine.home);
  const away = getClub(mine.away);
  const isHome = mine.home === career.clubId;

  return `
    <section class="panel glass next-match">
      <header class="panel-head"><h2>Matchday ${career.matchday}</h2>
        <span class="tag">${isHome ? 'Home' : 'Away'}</span></header>
      <div class="nm-fixture">
        <div class="nm-team">${crestSVG(home.crest, home.short, 52)}<b>${home.name}</b><span>OVR ${clubRating(home.id)}</span></div>
        <span class="nm-vs">VS</span>
        <div class="nm-team">${crestSVG(away.crest, away.short, 52)}<b>${away.name}</b><span>OVR ${clubRating(away.id)}</span></div>
      </div>
      <div class="nm-actions">
        <button class="btn primary big" id="playMatch">Play match</button>
        <button class="btn ghost" id="simMatch">Sim matchday</button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Other fixtures</h2></header>
      <ul class="fixture-list">
        ${round.matches.filter((m) => m !== mine).map((m) => `
          <li>
            <span class="fx-team">${crestSVG(getClub(m.home).crest, getClub(m.home).short, 22)} ${getClub(m.home).name}</span>
            <span class="fx-v">v</span>
            <span class="fx-team right">${getClub(m.away).name} ${crestSVG(getClub(m.away).crest, getClub(m.away).short, 22)}</span>
          </li>`).join('')}
      </ul>
    </section>

    ${career.results.length ? `
      <section class="panel glass">
        <header class="panel-head"><h2>Recent results</h2></header>
        <ul class="fixture-list results">
          ${career.results.slice(-6).reverse().map((r) => `
            <li class="${r.home === career.clubId || r.away === career.clubId ? 'mine' : ''}">
              <span class="fx-md">MD${r.matchday}</span>
              <span class="fx-team">${getClub(r.home).short}</span>
              <span class="fx-score">${r.hg} - ${r.ag}</span>
              <span class="fx-team right">${getClub(r.away).short}</span>
            </li>`).join('')}
        </ul>
      </section>` : ''}`;
}

/* ----------------------------- Table ----------------------------- */
function tableHTML(career) {
  const rows = sortedTable(career);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${WORLD.leagueName}</h2></header>
      <div class="table-scroll">
        <table class="league-table">
          <thead>
            <tr><th>#</th><th class="ta-l">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr class="${r.club.id === career.clubId ? 'is-me' : ''} ${i === 0 ? 'is-top' : ''} ${i >= rows.length - 2 ? 'is-drop' : ''}">
                <td class="pos">${i + 1}</td>
                <td class="ta-l club-cell">${crestSVG(r.club.crest, r.club.short, 22)}<span>${r.club.name}</span></td>
                <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
                <td>${r.gf}</td><td>${r.ga}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td>
                <td class="pts">${r.pts}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>`;
}

/* ----------------------------- Squad ----------------------------- */
function squadHTML(career) {
  const squad = career.squad.map(getPlayer).filter(Boolean).sort((a, b) => b.overall - a.overall);
  return `
    <section class="panel glass">
      <header class="panel-head">
        <h2>Your squad <small>${squad.length}</small></h2>
        <span class="tag">Avg ${Math.round(squad.reduce((s, p) => s + p.overall, 0) / squad.length)}</span>
      </header>
      <div class="card-grid">
        ${squad.map((p) => `
          <div class="grid-item" data-player="${p.id}">
            ${playerCard(p, { size: 'mini' })}
            <div class="coll-tools">
              <button class="mini-btn" data-detail="${p.id}">Info</button>
              <button class="mini-btn danger" data-sellp="${p.id}">Sell ${fmtMoney(Math.round(p.value * 0.85))}</button>
            </div>
          </div>`).join('')}
      </div>
    </section>`;
}

/* --------------------------- Transfers --------------------------- */
function marketHTML(career) {
  const owned = new Set(career.squad);
  const sold = new Set(career.sold);
  const market = WORLD.players
    .filter((p) => !owned.has(p.id) && !sold.has(p.id))
    .filter((p) => p.clubId !== career.clubId)
    .sort((a, b) => b.overall - a.overall)
    .filter((_, i) => i % 3 === 0)     // thin the list so it stays browsable
    .slice(0, 30);

  return `
    <section class="panel glass">
      <header class="panel-head">
        <h2>Transfer market</h2>
        <span class="tag budget">Budget ${fmtMoney(career.budget)}</span>
      </header>
      <p class="hint">Buy +15% · sell 85%.</p>
      <div class="card-grid">
        ${market.map((p) => {
          const fee = Math.round(p.value * 1.15);
          return `
            <div class="grid-item" data-player="${p.id}">
              ${playerCard(p, { size: 'mini' })}
              <div class="coll-tools">
                <button class="mini-btn" data-detail="${p.id}">Info</button>
                <button class="mini-btn buy" data-buy="${p.id}" ${fee > career.budget ? 'disabled' : ''}>
                  Buy ${fmtMoney(fee)}
                </button>
              </div>
            </div>`;
        }).join('')}
      </div>
    </section>`;
}

const ordinal = (n) => (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

/* ---------------------------- Mount ------------------------------ */
export function mount(root) {
  const career = getState().career;

  if (!career) {
    root.querySelectorAll('[data-pick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        newCareer(btn.dataset.pick);
        tab = 'hub';
        toast(`You are now manager of ${getClub(btn.dataset.pick).name}`, 'good');
        navigate('career');
      });
    });
    return;
  }

  const body = root.querySelector('#tabBody');
  const repaintBody = () => { body.innerHTML = tabBody(getState().career); bindBody(); };

  root.querySelector('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    tab = b.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('on', x.dataset.tab === tab));
    repaintBody();
  });

  root.querySelector('#quitCareer').addEventListener('click', () => {
    if (!confirm('Delete this career and return to the club picker?')) return;
    update((s) => { s.career = null; });
    tab = 'hub';
    navigate('career');
  });

  function bindBody() {
    const c = getState().career;

    body.querySelector('#playMatch')?.addEventListener('click', () => {
      const round = WORLD.fixtures[c.matchday - 1];
      const mine = round.matches.find((m) => m.home === c.clubId || m.away === c.clubId);
      navigate('match', { homeId: mine.home, awayId: mine.away, mode: 'career' });
    });

    body.querySelector('#simMatch')?.addEventListener('click', () => {
      simMatchday();
      navigate('career');
    });

    body.querySelector('#nextSeason')?.addEventListener('click', () => {
      update((s) => {
        const cr = s.career;
        cr.season += 1;
        cr.matchday = 1;
        cr.resolvedMatchday = 0;
        cr.results = [];
        cr.table = Object.fromEntries(WORLD.clubs.map((cl) => [cl.id, blankRow()]));
        cr.budget += 18_000_000;
      });
      toast('New season underway — budget topped up', 'good');
      navigate('career');
    });
  }

  function onBodyClick(e) {
    const detail = e.target.closest('[data-detail]');
    if (detail) return showDetail(document, getPlayer(detail.dataset.detail));

    const buy = e.target.closest('[data-buy]');
    if (buy) {
      const p = getPlayer(buy.dataset.buy);
      const fee = Math.round(p.value * 1.15);
      if (fee > getState().career.budget) return toast('Not enough in the budget', 'warn');
      update((s) => {
        s.career.budget -= fee;
        s.career.squad.push(p.id);
        s.career.transfersIn.push(p.id);
      });
      toast(`Signed ${p.name} for ${fmtMoney(fee)}`, 'good');
      return navigate('career');
    }

    const sell = e.target.closest('[data-sellp]');
    if (sell) {
      const p = getPlayer(sell.dataset.sellp);
      const c = getState().career;
      if (c.squad.length <= 14) return toast('Squad too thin to sell — 14 minimum', 'warn');
      const fee = Math.round(p.value * 0.85);
      update((s) => {
        s.career.budget += fee;
        s.career.squad = s.career.squad.filter((id) => id !== p.id);
        s.career.sold.push(p.id);
        s.career.transfersOut.push(p.id);
      });
      toast(`Sold ${p.name} for ${fmtMoney(fee)}`, 'good');
      return navigate('career');
    }
  }

  body.addEventListener('click', onBodyClick);
  bindBody();
}

/** Simulate the whole matchday, including the user's own fixture. */
function simMatchday() {
  const c = getState().career;
  if (c.matchday > TOTAL_MATCHDAYS) return;
  update((s) => {
    const cr = s.career;
    const round = WORLD.fixtures[cr.matchday - 1];
    round.matches.forEach((m) => {
      const q = quickResult(m.home, m.away);
      applyResult(cr, m.home, m.away, q.homeGoals, q.awayGoals);
      cr.results.push({ matchday: cr.matchday, home: m.home, away: m.away, hg: q.homeGoals, ag: q.awayGoals });
      if (m.home === cr.clubId || m.away === cr.clubId) {
        const mineHome = m.home === cr.clubId;
        const won = mineHome ? q.homeGoals > q.awayGoals : q.awayGoals > q.homeGoals;
        const drew = q.homeGoals === q.awayGoals;
        cr.budget += won ? 2_400_000 : drew ? 1_200_000 : 700_000;
        s.club.apex += won ? 900 : drew ? 500 : 300;
      }
    });
    cr.resolvedMatchday = cr.matchday;
    cr.matchday += 1;
  });
}
