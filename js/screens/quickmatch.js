import { WORLD } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { padCount } from '../game/input.js';
import { PRESETS } from '../game/sim.js';
import { screenHead } from '../components/screenHead.js';
import { navigate } from '../app.js';
import { enterFullscreen } from '../fullscreen.js';
import { stadiumFor } from '../data/stadiums.js';
import { COUNTRIES, INTERNATIONAL, countryNames, countryByName, flagOf, clubSheet, matchSquad, internationalTeams, internationalSquad } from '../data/countries.js';
import { flagSVG } from '../components/crest.js';
import { t } from '../i18n.js';

export const TITLE = 'Kick Off';

/* v75: teams are picked by country, the way a select screen should read —
   a country (strongest first, Spain to India, then International) and a
   club within it. `pick.home/away` = { country, idx }. */
const pick = { home: { country: 'Spain', idx: 0 }, away: { country: 'England', idx: 0 } };
const teamsOf = (country) => (country === INTERNATIONAL ? internationalTeams() : (countryByName(country)?.clubs || []));
const teamOf = (side) => { const list = teamsOf(pick[side].country); return list[Math.max(0, Math.min(list.length - 1, pick[side].idx))]; };
const sheetOf = (team) => (team.national ? (() => { const sq = internationalSquad(team); const avg = (l) => Math.round(l.reduce((t, p) => t + p.overall, 0) / Math.max(1, l.length)); const grp = { GK: 'GK', CB: 'DF', LB: 'DF', RB: 'DF', CDM: 'MF', CM: 'MF', CAM: 'MF', LM: 'MF', RM: 'MF', LW: 'FW', RW: 'FW', ST: 'FW' }; const o = avg(sq.xi); return { att: avg(sq.xi.filter((p) => grp[p.position] === 'FW')), mid: avg(sq.xi.filter((p) => grp[p.position] === 'MF')), def: avg(sq.xi.filter((p) => grp[p.position] === 'DF')), overall: o, stars: Math.max(1, Math.min(5, Math.round((o - 56) / 6))), star: sq.xi.slice().sort((a, b) => b.overall - a.overall)[0] }; })() : clubSheet(team));
const squadFor = (side) => { const tm = teamOf(side); return tm.national ? internationalSquad(tm) : matchSquad(tm); };
const crestFor = (team) => ({ shape: team.shape || 'shield', pattern: team.national ? 'halves' : 'solid', device: 'star', colors: team.colors });
let duration = 240;
let skill = 1;
let mode = 'single';       // single | versus | coop
let timeOf = 'auto';       // auto | day | dusk | night
let weather = 'auto';      // auto | clear | overcast | rain

const MODES = () => [
  { id: 'single', label: t('quick.1p'), sub: t('quick.1p.sub') },
  { id: 'versus', label: t('quick.2p'), sub: t('quick.2p.sub') },
  { id: 'coop', label: t('quick.coop'), sub: t('quick.coop.sub') },
];

function teamCard(side) {
  const team = teamOf(side);
  const sh = sheetOf(team);
  const stars = '★'.repeat(sh.stars) + '☆'.repeat(5 - sh.stars);
  const list = teamsOf(pick[side].country);
  const country = pick[side].country;
  const league = team.national ? 'National team' : (countryByName(country) ? `${country} · rank ${countryByName(country).rank}` : '');
  return `
    <div class="ts-country">
      <button class="ts-arrow" data-country="${side}" data-dir="-1" aria-label="Previous country">◀</button>
      <span class="ts-flag">${flagSVG(country === INTERNATIONAL ? ['#f4f4f4', '#0a4fa0'] : flagOf(country), 22)}</span>
      <select class="ts-select" data-country-pick="${side}" aria-label="Country">
        ${countryNames().map((n) => `<option value="${n}" ${n === country ? 'selected' : ''}>${n}</option>`).join('')}
      </select>
      <button class="ts-arrow" data-country="${side}" data-dir="1" aria-label="Next country">▶</button>
    </div>
    <div class="ts-card" style="--team:${team.colors[0]};--team2:${team.colors[1]}">
      <div class="ts-head">
        <div class="ts-name">${team.name}</div>
        <div class="ts-meta">${league}</div>
      </div>
      <div class="ts-crest-row">
        <button class="ts-arrow" data-cycle="${side}" data-dir="-1" aria-label="Previous team">◀</button>
        <div class="ts-crest">${crestSVG(crestFor(team), team.short, 128)}</div>
        <button class="ts-arrow" data-cycle="${side}" data-dir="1" aria-label="Next team">▶</button>
      </div>
      <div class="ts-stars">${stars}</div>
      <div class="ts-stats">
        <div><span>ATT</span><b>${sh.att}</b></div>
        <div><span>MID</span><b>${sh.mid}</b></div>
        <div><span>DEF</span><b>${sh.def}</b></div>
        <div class="ovr"><span>OVR</span><b>${sh.overall}</b></div>
      </div>
      ${sh.star ? `
        <div class="ts-star">
          <span class="tss-kicker">Talisman</span>
          <b>${sh.star.name}</b>
          <span class="tss-pos">${sh.star.position}</span>
          <span class="tss-ovr">${sh.star.overall}</span>
        </div>` : ''}
      <div class="ts-kit" title="Colours">
        <i style="background:${team.colors[0]}"></i>
        <i style="background:${team.colors[1]}"></i>
        <span>${list.length} ${team.national ? 'nations' : 'clubs'}</span>
      </div>
    </div>`;
}

/** The country's teams as a row of badges. */
function clubRail(side) {
  const list = teamsOf(pick[side].country);
  const cur = pick[side].idx;
  return `
    <div class="ts-rail" role="listbox" aria-label="${pick[side].country}">
      ${list.map((tm, i) => `
        <button class="ts-chip ${i === cur ? 'on' : ''}" data-pick="${side}" data-idx="${i}"
                title="${tm.name}" aria-label="${tm.name}" style="--team:${tm.colors[0]}">
          ${crestSVG(crestFor(tm), tm.short, 34)}
        </button>`).join('')}
    </div>`;
}

function h2h() {
  const hc = teamOf('home'); const ac = teamOf('away');
  const h = sheetOf(hc); const a = sheetOf(ac);
  const rows = [['ATT', h.att, a.att], ['MID', h.mid, a.mid], ['DEF', h.def, a.def]];
  return `
    <div class="ts-h2h" style="--hc:${hc.colors[0]};--ac:${ac.colors[0]}">
      ${rows.map(([label, x, y]) => {
    const top = Math.max(x, y) || 1;
    return `
        <div class="h2h-row">
          <b class="${x >= y ? 'win' : ''}">${x}</b>
          <span class="h2h-bar left"><i style="width:${(x / top) * 100}%"></i></span>
          <span class="h2h-label">${label}</span>
          <span class="h2h-bar right"><i style="width:${(y / top) * 100}%"></i></span>
          <b class="${y >= x ? 'win' : ''}">${y}</b>
        </div>`;
  }).join('')}
    </div>`;
}

export function render() {
  return `
    ${screenHead({
      kicker: t('quick.kicker'),
      title: t('quick.title'),
      sub: t('quick.sub'),
      motif: 'pitch', tone: 'c',
    })}
    <div class="teamsel">
      <div class="ts-side ts-home">
        <span class="ts-label">${t('quick.home')}</span>
        <div id="tsHome">${teamCard('home')}</div>
        <span class="ts-seat" id="tsSeatH"></span>
        <div id="tsRailH">${clubRail('home')}</div>
      </div>

      <div class="ts-mid">
        <span class="ts-vs">VS</span>
        <div id="tsH2h">${h2h()}</div>
        <div class="ts-opt">
          <span>${t('quick.mode')}</span>
          <div class="seg col" id="modeSeg">
            ${MODES().map((m) => `
              <button class="${mode === m.id ? 'on' : ''}" data-mode="${m.id}">
                <b>${m.label}</b><i>${m.sub}</i>
              </button>`).join('')}
          </div>
        </div>
        <div class="ts-opt">
          <span>${t('quick.length')}</span>
          <div class="seg" id="lenSeg">
            ${[[120, '2m'], [240, '4m'], [420, '7m']].map(([v, l]) =>
              `<button class="${duration === v ? 'on' : ''}" data-len="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="ts-opt" id="skillOpt">
          <span>${t('quick.cpu')}</span>
          <div class="seg" id="skillSeg">
            ${[[0.7, t('easy')], [1, t('pro')], [1.35, t('elite')]].map(([v, l]) =>
              `<button class="${skill === v ? 'on' : ''}" data-skill="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="ts-opt">
          <span>${t('quick.time')}</span>
          <div class="seg" id="timeSeg">
            ${[['auto', t('auto')], ['day', t('day')], ['dusk', t('dusk')], ['night', t('night')]].map(([v, l]) =>
              `<button class="${timeOf === v ? 'on' : ''}" data-time="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="ts-opt">
          <span>${t('quick.weather')}</span>
          <div class="seg" id="weatherSeg">
            ${[['auto', t('auto')], ['clear', t('clear')], ['overcast', t('cloud')], ['rain', t('rain')], ['snow', t('snow')]].map(([v, l]) =>
              `<button class="${weather === v ? 'on' : ''}" data-weather="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <p class="preset-note"><b>${PRESETS.authentic.name}</b> ${PRESETS.authentic.blurb}</p>
        <button class="btn primary big" id="kickOff">${t('quick.go')}</button>
        <button class="btn ghost" id="cupBtn">Custom Cup</button>
        <button class="btn ghost" id="worldBtn">${t('quick.world')}</button>
        <button class="btn ghost" id="stadiumsBtn">${t('quick.stadiums')}</button>
      </div>

      <div class="ts-side ts-away">
        <span class="ts-label">${t('quick.away')}</span>
        <div id="tsAway">${teamCard('away')}</div>
        <span class="ts-seat" id="tsSeatA"></span>
        <div id="tsRailA">${clubRail('away')}</div>
      </div>

      <div class="ts-hints">
        <span><b>✕</b> Select</span>
        <span><b>◀ ▶</b> Change team · country</span>
        <span><b>R</b> Randomise</span>
        <span class="ts-pads" id="tsPads"></span>
      </div>
    </div>`;
}

export function mount(root) {
  const q = (s) => root.querySelector(s);

  const seatText = () => {
    if (!q('#tsSeatH')) return;              // gone: the screen was left under the timer
    const pads = padCount();
    if (mode === 'coop') {
      q('#tsSeatH').textContent = 'P1 + P2';
      q('#tsSeatA').textContent = 'CPU';
    } else if (mode === 'versus') {
      q('#tsSeatH').textContent = 'P1';
      q('#tsSeatA').textContent = 'P2';
    } else {
      q('#tsSeatH').textContent = 'P1';
      q('#tsSeatA').textContent = 'CPU';
    }
    q('#skillOpt').style.display = mode === 'versus' ? 'none' : '';
    q('#tsPads').textContent = pads === 0
      ? 'No pads — keyboard: P1 WASD, P2 arrows'
      : `${pads} controller${pads === 1 ? '' : 's'} connected`;
  };

  const paint = () => {
    q('#tsHome').innerHTML = teamCard('home');
    q('#tsAway').innerHTML = teamCard('away');
    q('#tsRailH').innerHTML = clubRail('home');
    q('#tsRailA').innerHTML = clubRail('away');
    q('#tsH2h').innerHTML = h2h();
    seatText();
  };
  const sameTeam = () => teamOf('home').id === teamOf('away').id;

  const cycle = (side, dir) => {
    const n = teamsOf(pick[side].country).length;
    do { pick[side].idx = (pick[side].idx + dir + n) % n; } while (sameTeam() && n > 1);
    paint();
  };
  const cycleCountry = (side, dir) => {
    const names = countryNames();
    const at = names.indexOf(pick[side].country);
    pick[side].country = names[(at + dir + names.length) % names.length];
    pick[side].idx = 0;
    if (sameTeam()) pick[side].idx = 1;
    paint();
  };

  /* v118: the screen root outlives this screen; without taking these off
     again, every visit to Kick Off stacked another pair — the third visit
     moved three teams for one press of an arrow. */
  const off = new AbortController(); const { signal } = off;
  root.addEventListener('change', (e) => {
    const sel = e.target.closest('[data-country-pick]');
    if (!sel) return;
    const side = sel.dataset.countryPick;
    pick[side].country = sel.value;
    pick[side].idx = 0;
    if (sameTeam()) pick[side].idx = 1;
    paint();
  }, { signal });

  root.addEventListener('click', (e) => {
    const cc = e.target.closest('[data-country]');
    if (cc) { cycleCountry(cc.dataset.country, +cc.dataset.dir); return; }
    const cy = e.target.closest('[data-cycle]');
    if (cy) { cycle(cy.dataset.cycle, +cy.dataset.dir); return; }

    const pk = e.target.closest('[data-pick]');
    if (pk && !pk.disabled) {
      const side = pk.dataset.pick;
      const i = +pk.dataset.idx;
      const was = pick[side].idx;
      pick[side].idx = i;
      if (sameTeam()) pick[side].idx = was;      // the two sides cannot be the same team
      paint();
      return;
    }

    const md = e.target.closest('[data-mode]');
    if (md) {
      mode = md.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x === md));
      seatText();
      return;
    }
    const ln = e.target.closest('[data-len]');
    if (ln) {
      duration = +ln.dataset.len;
      root.querySelectorAll('[data-len]').forEach((x) => x.classList.toggle('on', x === ln));
      return;
    }
    const sk = e.target.closest('[data-skill]');
    if (sk) {
      skill = +sk.dataset.skill;
      root.querySelectorAll('[data-skill]').forEach((x) => x.classList.toggle('on', x === sk));
      return;
    }
    const tm = e.target.closest('[data-time]');
    if (tm) {
      timeOf = tm.dataset.time;
      root.querySelectorAll('[data-time]').forEach((x) => x.classList.toggle('on', x === tm));
      return;
    }
    const wt = e.target.closest('[data-weather]');
    if (wt) {
      weather = wt.dataset.weather;
      root.querySelectorAll('[data-weather]').forEach((x) => x.classList.toggle('on', x === wt));
    }
  }, { signal });

  const onKey = (e) => {
    if (e.code === 'KeyR') {
      const names = countryNames();
      for (const side of ['home', 'away']) {
        pick[side].country = names[Math.floor(Math.random() * names.length)];
        pick[side].idx = Math.floor(Math.random() * teamsOf(pick[side].country).length);
      }
      if (sameTeam()) cycle('away', 1);
      paint();
    }
  };
  window.addEventListener('keydown', onKey);

  const kickOff = (localSeats = null) => {
    enterFullscreen();          // no-ops safely where the API is missing (iPhone)
    // v91: with seats, the mode is wherever the people went — all on one side is co-op
    const m = !localSeats ? mode
      : new Set(localSeats.map((st) => st.team)).size > 1 ? 'versus' : localSeats.length > 1 ? 'coop' : 'single';
    navigate('play', {
      // world ids only anchor the pitch; the picked teams travel as custom squads
      homeId: WORLD.clubs[0].id,
      awayId: WORLD.clubs[1].id,
      homeSquad: squadFor('home'),
      awaySquad: squadFor('away'),
      duration, skill, mode: m,
      localSeats,
      atmo: { time: timeOf === 'auto' ? undefined : timeOf, weather: weather === 'auto' ? undefined : weather },
    });
  };
  q('#kickOff').addEventListener('click', async () => {
    /* v91: co-op and versus pick sides first — up to four people, each on a
       controller or half the keyboard. A touch-only tablet keeps its split-screen
       touch controls instead: there is nobody to hand a token to. */
    const touchOnly = window.matchMedia('(pointer: coarse)').matches && padCount() === 0;
    if ((mode === 'coop' || mode === 'versus') && !touchOnly) {
      const { openSideSelect } = await import('../components/sideSelect.js');
      const seats = await openSideSelect({ home: teamOf('home').name, away: teamOf('away').name, preset: mode });
      if (seats) kickOff(seats);
      return;
    }
    kickOff();
  });

  q('#cupBtn').addEventListener('click', () => navigate('cup'));
  q('#worldBtn').addEventListener('click', () => navigate('world'));
  q('#stadiumsBtn').addEventListener('click', () => navigate('stadiums'));
  seatText();
  const padTimer = setInterval(seatText, 900);
  return () => { clearInterval(padTimer); window.removeEventListener('keydown', onKey); off.abort(); };
}
