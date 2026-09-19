import { WORLD, clubRating, rosterOf } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { padCount } from '../game/input.js';
import { PRESETS } from '../game/sim.js';
import { screenHead } from '../components/screenHead.js';
import { navigate } from '../app.js';
import { enterFullscreen } from '../fullscreen.js';
import { stadiumFor } from '../data/stadiums.js';
import { t } from '../i18n.js';

export const TITLE = 'Kick Off';

let homeIdx = 0;
let awayIdx = 1;
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

/** Departmental ratings, so each card reads like a real team sheet. */
function clubStats(clubId) {
  const squad = rosterOf(clubId).slice().sort((a, b) => b.overall - a.overall);
  const avg = (list, key) => (list.length
    ? Math.round(list.reduce((s, p) => s + (key ? p.stats[key] : p.overall), 0) / list.length)
    : 0);
  const att = squad.filter((p) => ['ST', 'LW', 'RW'].includes(p.position)).slice(0, 4);
  const mid = squad.filter((p) => ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(p.position)).slice(0, 5);
  const def = squad.filter((p) => ['CB', 'LB', 'RB'].includes(p.position)).slice(0, 5);
  const overall = clubRating(clubId);
  return {
    att: avg(att), mid: avg(mid), def: avg(def), overall,
    stars: Math.max(1, Math.min(5, Math.round((overall - 66) / 4))),
  };
}

/** The name anyone would recognise: the best player on the books. */
function talisman(clubId) {
  return rosterOf(clubId).slice().sort((a, b) => b.overall - a.overall)[0] || null;
}

function teamCard(idx, side) {
  const c = WORLD.clubs[idx];
  const s = clubStats(c.id);
  const stars = '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars);
  const star = talisman(c.id);
  return `
    <div class="ts-card" style="--team:${c.crest.colors[0]};--team2:${c.crest.colors[1]}">
      <div class="ts-head">
        <div class="ts-name">${c.name}</div>
        <div class="ts-meta">Est. ${c.founded} · ${c.ground} · ${(stadiumFor(c).capacity / 1000).toFixed(0)}k</div>
      </div>
      <div class="ts-crest-row">
        <button class="ts-arrow" data-cycle="${side}" data-dir="-1" aria-label="Previous club">◀</button>
        <div class="ts-crest">${crestSVG(c.crest, c.short, 128)}</div>
        <button class="ts-arrow" data-cycle="${side}" data-dir="1" aria-label="Next club">▶</button>
      </div>
      <div class="ts-stars">${stars}</div>
      <div class="ts-stats">
        <div><span>ATT</span><b>${s.att}</b></div>
        <div><span>MID</span><b>${s.mid}</b></div>
        <div><span>DEF</span><b>${s.def}</b></div>
        <div class="ovr"><span>OVR</span><b>${s.overall}</b></div>
      </div>
      ${star ? `
        <div class="ts-star">
          <span class="tss-kicker">Talisman</span>
          <b>${star.name}</b>
          <span class="tss-pos">${star.position}</span>
          <span class="tss-ovr">${star.overall}</span>
        </div>` : ''}
      <div class="ts-kit" title="Club colours">
        <i style="background:${c.crest.colors[0]}"></i>
        <i style="background:${c.crest.colors[1]}"></i>
        <span>${c.league}</span>
      </div>
    </div>`;
}

/**
 * Every club, as a row of badges. The arrows are still there, but stepping one
 * at a time through ten clubs to reach the one you want is the sort of thing
 * that only survives because nobody sat down and used it.
 */
function clubRail(side, idx, otherIdx) {
  // forty clubs, one row per division, so the rail still reads at a glance
  return WORLD.leagues.map((league, d) => `
    <div class="ts-rail" role="listbox" aria-label="${league}">
      <span class="ts-rail-tag" title="${league}">${d + 1}</span>
      ${WORLD.clubs.map((c, i) => (c.league !== league ? '' : `
        <button class="ts-chip ${i === idx ? 'on' : ''}" data-pick="${side}" data-idx="${i}"
                ${i === otherIdx ? 'disabled aria-disabled="true"' : ''}
                title="${c.name}" aria-label="${c.name}"
                style="--team:${c.crest.colors[0]}">
          ${crestSVG(c.crest, c.short, 34)}
        </button>`)).join('')}
    </div>`).join('');
}

/**
 * Head to head. Bars are drawn against the better of the two sides rather than
 * against 100, because every club in this league sits between 74 and 88 and
 * bars anchored at zero would all look the same length.
 */
function h2h(hIdx, aIdx) {
  const hc = WORLD.clubs[hIdx];
  const ac = WORLD.clubs[aIdx];
  const h = clubStats(hc.id);
  const a = clubStats(ac.id);
  const rows = [['ATT', h.att, a.att], ['MID', h.mid, a.mid], ['DEF', h.def, a.def]];
  return `
    <div class="ts-h2h" style="--hc:${hc.crest.colors[0]};--ac:${ac.crest.colors[0]}">
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
        <div id="tsHome">${teamCard(homeIdx, 'home')}</div>
        <span class="ts-seat" id="tsSeatH"></span>
        <div id="tsRailH">${clubRail('home', homeIdx, awayIdx)}</div>
      </div>

      <div class="ts-mid">
        <span class="ts-vs">VS</span>
        <div id="tsH2h">${h2h(homeIdx, awayIdx)}</div>
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
            ${[['auto', t('auto')], ['clear', t('clear')], ['overcast', t('cloud')], ['rain', t('rain')]].map(([v, l]) =>
              `<button class="${weather === v ? 'on' : ''}" data-weather="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <p class="preset-note"><b>${PRESETS.authentic.name}</b> ${PRESETS.authentic.blurb}</p>
        <button class="btn primary big" id="kickOff">${t('quick.go')}</button>
        <button class="btn ghost" id="worldBtn">${t('quick.world')}</button>
        <button class="btn ghost" id="stadiumsBtn">${t('quick.stadiums')}</button>
      </div>

      <div class="ts-side ts-away">
        <span class="ts-label">${t('quick.away')}</span>
        <div id="tsAway">${teamCard(awayIdx, 'away')}</div>
        <span class="ts-seat" id="tsSeatA"></span>
        <div id="tsRailA">${clubRail('away', awayIdx, homeIdx)}</div>
      </div>

      <div class="ts-hints">
        <span><b>✕</b> Select</span>
        <span><b>◀ ▶</b> Change club</span>
        <span><b>R</b> Randomise</span>
        <span class="ts-pads" id="tsPads"></span>
      </div>
    </div>`;
}

export function mount(root) {
  const q = (s) => root.querySelector(s);

  const seatText = () => {
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
    q('#tsHome').innerHTML = teamCard(homeIdx, 'home');
    q('#tsAway').innerHTML = teamCard(awayIdx, 'away');
    q('#tsRailH').innerHTML = clubRail('home', homeIdx, awayIdx);
    q('#tsRailA').innerHTML = clubRail('away', awayIdx, homeIdx);
    q('#tsH2h').innerHTML = h2h(homeIdx, awayIdx);
    seatText();
  };

  const cycle = (side, dir) => {
    const n = WORLD.clubs.length;
    if (side === 'home') {
      do { homeIdx = (homeIdx + dir + n) % n; } while (homeIdx === awayIdx);
    } else {
      do { awayIdx = (awayIdx + dir + n) % n; } while (awayIdx === homeIdx);
    }
    paint();
  };

  root.addEventListener('click', (e) => {
    const cy = e.target.closest('[data-cycle]');
    if (cy) { cycle(cy.dataset.cycle, +cy.dataset.dir); return; }

    const pick = e.target.closest('[data-pick]');
    if (pick && !pick.disabled) {
      const i = +pick.dataset.idx;
      // the two sides cannot be the same club, and the rail already disables
      // the one the other side holds, so this only guards a stray call
      if (pick.dataset.pick === 'home') { if (i !== awayIdx) homeIdx = i; }
      else if (i !== homeIdx) awayIdx = i;
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
  });

  const onKey = (e) => {
    if (e.code === 'KeyR') {
      const n = WORLD.clubs.length;
      homeIdx = Math.floor(Math.random() * n);
      do { awayIdx = Math.floor(Math.random() * n); } while (awayIdx === homeIdx);
      paint();
    }
  };
  window.addEventListener('keydown', onKey);

  q('#kickOff').addEventListener('click', () => {
    enterFullscreen();          // no-ops safely where the API is missing (iPhone)
    navigate('play', {
      homeId: WORLD.clubs[homeIdx].id,
      awayId: WORLD.clubs[awayIdx].id,
      duration, skill, mode,
      atmo: { time: timeOf === 'auto' ? undefined : timeOf, weather: weather === 'auto' ? undefined : weather },
    });
  });

  q('#worldBtn').addEventListener('click', () => navigate('world'));
  q('#stadiumsBtn').addEventListener('click', () => navigate('stadiums'));
  seatText();
  const padTimer = setInterval(seatText, 900);
  return () => { clearInterval(padTimer); window.removeEventListener('keydown', onKey); };
}
