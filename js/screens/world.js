/**
 * The World: four league tables, today's fixtures, promotion and relegation.
 * Read-only apart from one thing — any of today's fixtures can be played.
 */
import { navigate } from '../app.js';
import { WORLD } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { screenHead } from '../components/screenHead.js';
import { worldState } from '../world.js';
import { stadiumFor } from '../data/stadiums.js';
import { enterFullscreen } from '../fullscreen.js';

export const TITLE = 'World';

let tab = 0;

function tableHTML(div) {
  const n = div.table.length;
  return `
    <table class="wtable">
      <thead><tr><th>#</th><th class="club">Club</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th class="form">Form</th></tr></thead>
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
  if (!div.today.length) return '';
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Today's fixtures</h2><span class="ph-sub">Round ${state.round} of ${state.rounds}</span></header>
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
            <button class="btn small" data-play="${h}|${a}">Play</button>
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
      <header class="panel-head"><h2>Last season</h2></header>
      <div class="wmovers">
        <div><span class="z-up">▲ Promoted</span>${list(state.movers.promoted, 'up')}</div>
        <div><span class="z-down">▼ Relegated</span>${list(state.movers.relegated, 'down')}</div>
      </div>
    </section>`;
}

export function render() {
  const state = worldState();
  const div = state.divisions[tab] || state.divisions[0];
  return `
    ${screenHead({
      kicker: 'Forty clubs · four divisions',
      title: 'The World',
      sub: `Season ${state.season} · Round ${state.round} of ${state.rounds} · a round a day, two up and two down`,
      motif: 'ladder', tone: 'b',
    })}
    <div class="seg wtabs" id="wtabs">
      ${state.divisions.map((d, i) => `<button class="${i === tab ? 'on' : ''}" data-tab="${i}"><b>${d.division}</b><i>${d.name}</i></button>`).join('')}
    </div>
    <section class="panel glass">
      <header class="panel-head"><h2>${div.name}</h2><span class="ph-sub">Division ${div.division}</span></header>
      ${tableHTML(div)}
    </section>
    ${fixturesHTML(div, state)}
    ${moversHTML(state)}`;
}

export function mount(root) {
  root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    tab = +b.dataset.tab;
    navigate('world');
  }));
  root.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => {
    const [homeId, awayId] = b.dataset.play.split('|');
    enterFullscreen();
    navigate('play', { homeId, awayId, duration: 240, skill: 1, mode: 'single' });
  }));
}
