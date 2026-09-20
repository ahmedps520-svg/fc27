/**
 * The World: four league tables, today's fixtures, promotion and relegation.
 * Read-only apart from one thing — any of today's fixtures can be played.
 */
import { navigate } from '../app.js';
import { WORLD } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { worldState, continentalCup, clubWorldCup, calendar, nations, nationsCup, nationSquad, CUP_ROUNDS, worldTournament, WT_EVERY } from '../world.js';
import * as tourney from '../tournament.js';
import { getState } from '../state.js';
import { flagSVG } from '../components/crest.js';
import { stadiumFor } from '../data/stadiums.js';
import { cardStrip } from '../components/playerCard.js';
import { enterFullscreen } from '../fullscreen.js';
import { t } from '../i18n.js';

export const TITLE = 'World';

let tab = 0;

function tableHTML(div) {
  const n = div.table.length;
  // the faces of the division above its numbers: the four best players in it
  const stars = div.table.map((row) => WORLD.clubsById[row.id]).filter(Boolean)
    .flatMap((c) => c.roster.map((id) => WORLD.playersById[id])).filter(Boolean)
    .sort((x, y) => y.overall - x.overall).slice(0, 4);
  return `
    ${cardStrip(stars, { size: 'mini', cls: 'wstars' })}
    <table class="wtable">
      <thead><tr><th>#</th><th class="club">${t('world.club')}</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th class="form">${t('world.form')}</th></tr></thead>
      <tbody>
        ${div.table.map((row, i) => {
          const c = WORLD.clubsById[row.id];
          const zone = i < div.upZone ? 'up' : i >= n - div.downZone ? 'down' : '';
          const gd = row.gf - row.ga;
          return `
          <tr class="${zone}">
            <td>${i + 1}</td>
            <td class="club"><span class="wclub" style="--team:${c.crest.colors[0]}">${crestSVG(c.crest, c.short, 22)}<b>${c.name}</b></span></td>
            <td>${row.p}</td><td>${row.w}</td><td>${row.d}</td><td>${row.l}</td>
            <td>${gd > 0 ? '+' : ''}${gd}</td><td class="pts">${row.pts}</td>
            <td class="form">${row.form.slice(-5).map((f) => `<i class="f-${f}">${f}</i>`).join('')}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="wzone">${div.upZone ? `<span class="z-up">■</span> Promotion` : 'Top division'}${div.downZone ? ` · <span class="z-down">■</span> Relegation` : ' · no relegation from the bottom tier'}</p>`;
}

function fixturesHTML(div, state) {
  if (div.resting) return `<section class="panel glass"><header class="panel-head"><h2>${t('world.today')}</h2></header><p class="wzone">Season over for this division — ${state.rounds - state.round + 1} day${state.rounds - state.round ? 's' : ''} until the new season.</p></section>`;
  if (!div.today.length) return '';
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${t('world.today')}</h2><span class="ph-sub">Round ${div.round} of ${div.rounds}</span></header>
      <div class="wfix">
        ${div.today.map(([h, a]) => {
          const hc = WORLD.clubsById[h];
          const ac = WORLD.clubsById[a];
          return `
          <div class="wfix-row">
            <span class="wclub" style="--team:${hc.crest.colors[0]}">${crestSVG(hc.crest, hc.short, 22)}<b>${hc.short}</b></span>
            <span class="wfix-v">v</span>
            <span class="wclub" style="--team:${ac.crest.colors[0]}">${crestSVG(ac.crest, ac.short, 22)}<b>${ac.short}</b></span>
            <span class="wfix-ground">${stadiumFor(hc).name}</span>
            <button class="btn small" data-play="${h}|${a}">${t('world.play')}</button>
          </div>`;
        }).join('')}
      </div>
    </section>`;
}

function moversHTML(state) {
  if (!state.movers.promoted.length && !state.movers.relegated.length) return '';
  const list = (ids, cls) => ids.map((id) => {
    const c = WORLD.clubsById[id];
    return `<span class="wclub ${cls}" style="--team:${c.crest.colors[0]}">${crestSVG(c.crest, c.short, 20)}<b>${c.name}</b></span>`;
  }).join('');
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${t('world.last')}</h2></header>
      <div class="wmovers">
        <div><span class="z-up">▲ Promoted</span>${list(state.movers.promoted, 'up')}</div>
        <div><span class="z-down">▼ Relegated</span>${list(state.movers.relegated, 'down')}</div>
      </div>
    </section>`;
}

function tieRow(t, nameOf, crestOf, playAttr) {
  const score = t.winner ? `${t.gh}–${t.ga}${t.pens ? ` <small>(${Array.isArray(t.pens) ? `${t.pens[0]}–${t.pens[1]} pens` : 'pens'})</small>` : ''}` : 'v';
  return `
    <div class="wfix-row cup">
      <span class="wclub ${t.winner === t.home ? 'won' : ''}">${crestOf(t.home)}<b>${nameOf(t.home)}</b></span>
      <span class="wfix-v">${score}</span>
      <span class="wclub ${t.winner === t.away ? 'won' : ''}">${crestOf(t.away)}<b>${nameOf(t.away)}</b></span>
      <span></span>
      ${!t.winner && playAttr ? `<button class="btn small" ${playAttr(t)}>Play</button>` : '<span></span>'}
    </div>`;
}

function cupHTML() {
  const { season, played } = calendar();
  const cup = continentalCup(season, played);
  const nameOf = (id) => WORLD.clubsById[id].short;
  const crestOf = (id) => crestSVG(WORLD.clubsById[id].crest, WORLD.clubsById[id].short, 22);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Continental Cup</h2><span class="ph-sub">Season ${season + 1} · the top eight of last season</span></header>
      <p class="wzone">Quarter-finals on day 6, semi-finals on day 12, the final on day 17, at the arenas.${cup.winner ? ` <b>Champions: ${WORLD.clubsById[cup.winner].name}.</b>` : ''}</p>
      ${cup.rounds.map((r) => `
        <h3 class="wround">${r.name}${r.today ? ' · <em>today</em>' : r.done ? '' : ` · day ${r.day + 1}`}</h3>
        <div class="wfix">${r.ties.map((t) => tieRow(t, nameOf, crestOf, (x) => `data-play="${x.home}|${x.away}" data-final="1"`)).join('')}</div>`).join('')}
    </section>`;
}

function nationsHTML() {
  const { season, played } = calendar();
  const cup = nationsCup(season, played);
  const all = nations();
  const nameOf = (n) => all.find((x) => x.nation === n)?.short || n;
  const crestOf = (n) => flagSVG(all.find((x) => x.nation === n)?.colors || ['#fff', '#222'], 20);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Nations Cup</h2><span class="ph-sub">International break · days 8 and 9</span></header>
      <p class="wzone">The eight best national sides, built from every player in the world.${cup.winner ? ` <b>Champions: ${cup.winner}.</b>` : ''}</p>
      ${cup.rounds.map((r) => `
        <h3 class="wround">${r.name}${r.today ? ' · <em>today</em>' : r.done ? '' : ` · day ${r.day + 1}`}</h3>
        <div class="wfix">${r.ties.map((t) => tieRow(t, nameOf, crestOf, (x) => `data-nation="${x.home}|${x.away}"`)).join('')}</div>`).join('')}
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>National teams</h2><span class="ph-sub">${all.length} nations</span></header>
      <div class="wnations">
        ${all.map((n, i) => `
          <button class="wnation" data-nation-view="${n.nation}">
            <span class="wn-rank">${i + 1}</span>
            ${flagSVG(n.colors, 24)}
            <b>${n.nation}</b>
            <span class="wn-pool">${n.poolSize} players</span>
            <span class="wn-ovr">${n.rating}</span>
          </button>`).join('')}
      </div>
    </section>`;
}

function nationDetailHTML(nation) {
  const sq = nationSquad(nation);
  if (!sq) return '';
  const others = nations().filter((n) => n.nation !== nation).slice(0, 12);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${flagSVG(sq.colors, 24)} ${nation}</h2><span class="ph-sub">Rated ${sq.rating}</span></header>
      ${cardStrip(sq.xi, { size: 'mini', cls: 'wxi-cards' })}
      <div class="wfix" style="margin-top:12px">
        <div class="wfix-row"><span>Friendly against</span>
          <select id="natOpp">${others.map((n) => `<option value="${n.nation}">${n.nation} (${n.rating})</option>`).join('')}</select>
          <span></span><span></span><button class="btn small primary" data-nation-play="${nation}">Play</button></div>
      </div>
      <button class="btn ghost" data-tab="7" style="margin-top:10px">← All nations</button>
    </section>`;
}

function cwcHTML() {
  const { season, played } = calendar();
  const cup = clubWorldCup(season, played);
  const nameOf = (id) => WORLD.clubsById[id].short;
  const crestOf = (id) => crestSVG(WORLD.clubsById[id].crest, WORLD.clubsById[id].short, 22);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Club World Cup</h2><span class="ph-sub">Season ${season + 1} · days 21, 23 and 25 at the wonders</span></header>
      <p class="wzone">Last season's champions of the top four divisions, the Continental Cup winner and the next best of the top flight.${cup.winner ? ` <b>Champions: ${WORLD.clubsById[cup.winner].name}.</b>` : ''}</p>
      ${cup.rounds.map((r) => `
        <h3 class="wround">${r.name}${r.today ? ' · <em>today</em>' : r.done ? '' : ` · day ${r.day + 1}`}</h3>
        <div class="wfix">${r.ties.map((t) => tieRow(t, nameOf, crestOf, (x) => `data-play="${x.home}|${x.away}" data-final="1"`)).join('')}</div>`).join('')}
    </section>`;
}

function tournamentHTML() {
  const t = tourney.current();
  const all = nations();
  const flag = (n) => flagSVG(all.find((x) => x.nation === n)?.colors || ['#fff', '#222'], 18);
  if (!t) {
    const { season } = calendar();
    const edition = Math.floor(season / WT_EVERY);
    const sim = worldTournament(edition);
    return `
      <section class="panel glass">
        <header class="panel-head"><h2>World Tournament</h2><span class="ph-sub">32 nations · 8 groups · knockouts</span></header>
        <p class="wzone">Take a nation through the draw: three group games, then the round of 16, quarter-finals, semi-finals and the final at the wonders. Every other result is decided by the world.</p>
        <div class="wfix" style="margin-top:10px">
          <div class="wfix-row"><span>Your nation</span>
            <select id="wtNation">${sim.teams.map((n) => `<option value="${n.nation}" ${n.nation === 'Saudi Arabia' ? 'selected' : ''}>${n.nation} (${n.rating})</option>`).join('')}</select>
            <span></span><span></span><button class="btn small primary" id="wtStart">Enter</button></div>
        </div>
        <h3 class="wround">The world's edition ${edition + 1} — champions: ${sim.winner}</h3>
        <div class="wgroups">${sim.groups.map((g, i) => `<div class="wgroup"><b>Group ${String.fromCharCode(65 + i)}</b>${g.table.map((r) => `<span>${flag(r.id)} ${r.id} <i>${r.pts}</i></span>`).join('')}</div>`).join('')}</div>
      </section>`;
  }
  const table = tourney.groupTable(t);
  const next = tourney.nextMatch();
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>${flag(t.nation)} ${t.nation}</h2><span class="ph-sub">World Tournament · ${t.stage === 'group' ? 'Group ' + String.fromCharCode(65 + t.groupIndex) : t.stage === 'done' ? (t.champion ? 'Champions!' : 'Out') : t.stage.toUpperCase()}</span></header>
      <table class="wtable"><thead><tr><th>#</th><th class="club">Nation</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>${table.map((r, i) => `<tr class="${i < 2 ? 'up' : ''} ${r.id === t.nation ? 'mine' : ''}"><td>${i + 1}</td><td class="club"><span class="wclub">${flag(r.id)}<b>${r.id}</b></span></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf - r.ga}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table>
      <h3 class="wround">Your matches</h3>
      <div class="wfix">
        ${[...t.fixtures, ...t.knockout].map((m) => `<div class="wfix-row"><span class="wclub">${flag(m.home)}<b>${m.home}</b></span><span class="wfix-v">${m.played ? `${m.gh}–${m.ga}` : 'v'}</span><span class="wclub">${flag(m.away)}<b>${m.away}</b></span><span class="wfix-ground">${m.stage ? m.stage.toUpperCase() : 'Group'}</span><span></span></div>`).join('')}
      </div>
      <div class="showcase-opts" style="margin-top:12px">
        ${next ? `<button class="btn primary" id="wtPlay">Play: ${next.home} v ${next.away}</button>` : ''}
        <button class="btn ghost" id="wtQuit">${t.stage === 'done' ? 'Finish' : 'Withdraw'}</button>
      </div>
    </section>`;
}

export function render(params = {}) {
  const state = worldState();
  if (params.nation) tab = 8;
  if (params.tab !== undefined) tab = params.tab;
  const div = state.divisions[tab] || state.divisions[0];
  const body = tab === 6 ? cupHTML() + cwcHTML() : tab === 7 ? nationsHTML() : tab === 8 ? nationDetailHTML(params.nation || viewNation) : tab === 9 ? tournamentHTML() : `
    <section class="panel glass">
      <header class="panel-head"><h2>${div.name}</h2><span class="ph-sub">Division ${div.division}</span></header>
      ${tableHTML(div)}
    </section>
    ${fixturesHTML(div, state)}
    ${moversHTML(state)}`;
  return `
    ${screenHead({
      kicker: 'A hundred clubs · eight divisions',
      title: t('world.title'),
      sub: `Season ${state.season} · Round ${state.round} of ${state.rounds} · a round a day, two up and two down`,
      motif: 'ladder', tone: 'b',
    })}
    <div class="seg wtabs" id="wtabs">
      ${state.divisions.map((d, i) => `<button class="${i === tab ? 'on' : ''}" data-tab="${i}"><b>${d.division}</b><i>${d.name}</i></button>`).join('')}
      <button class="${tab === 6 ? 'on' : ''}" data-tab="6"><b>★</b><i>${t('world.cup')}</i></button>
      <button class="${tab === 7 || tab === 8 ? 'on' : ''}" data-tab="7"><b>⚑</b><i>${t('world.nations')}</i></button>
      <button class="${tab === 9 ? 'on' : ''}" data-tab="9"><b>🌍</b><i>World Tournament</i></button>
    </div>
    ${body}`;
}
let viewNation = 'Saudi Arabia';

export function mount(root) {
  root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    tab = +b.dataset.tab;
    navigate('world');
  }));
  root.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
    const [homeId, awayId] = b.dataset.play.split('|');
    enterFullscreen();
    navigate('play', { homeId, awayId, duration: 240, skill: 1, mode: 'single', final: !!b.dataset.final });
  }));
  root.querySelectorAll('[data-nation-view]').forEach((b) => b.addEventListener('click', () => {
    viewNation = b.dataset.nationView; tab = 8; navigate('world', { nation: viewNation });
  }));
  const playNations = (home, away) => {
    const h = nationSquad(home); const a = nationSquad(away);
    if (!h || !a) return;
    enterFullscreen();
    navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, homeSquad: h, awaySquad: a, duration: 240, skill: 1, mode: 'single', final: true, showpiece: true });
  };
  root.querySelectorAll('[data-nation]').forEach((b) => b.addEventListener('click', () => {
    const [h, a] = b.dataset.nation.split('|'); playNations(h, a);
  }));
  root.querySelectorAll('[data-nation-play]').forEach((b) => b.addEventListener('click', () => {
    playNations(b.dataset.nationPlay, root.querySelector('#natOpp')?.value);
  }));
  root.querySelector('#wtStart')?.addEventListener('click', () => {
    tourney.start(root.querySelector('#wtNation').value);
    navigate('world', { tab: 9 });
  });
  root.querySelector('#wtQuit')?.addEventListener('click', () => { tourney.quit(); navigate('world', { tab: 9 }); });
  root.querySelector('#wtPlay')?.addEventListener('click', () => {
    const p = tourney.matchParams();
    if (!p) return;
    enterFullscreen();
    navigate('play', { homeId: WORLD.clubs[0].id, awayId: WORLD.clubs[1].id, ...p });
  });
}
