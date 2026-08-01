import { WORLD, clubRating, rosterOf } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { padCount } from '../game/input.js';
import { navigate } from '../app.js';

export const TITLE = 'Select Teams';

let homeIdx = 0;
let awayIdx = 1;
let duration = 240;
let skill = 1;
let mode = 'single';       // single | versus | coop

const MODES = [
  { id: 'single', label: '1 Player', sub: 'You vs CPU' },
  { id: 'versus', label: '2P Versus', sub: 'Head to head' },
  { id: 'coop', label: '2P Co-op', sub: 'Same team' },
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

function teamCard(idx, side) {
  const c = WORLD.clubs[idx];
  const s = clubStats(c.id);
  const stars = '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars);
  return `
    <div class="ts-card" style="--team:${c.crest.colors[0]};--team2:${c.crest.colors[1]}">
      <div class="ts-name">${c.name}</div>
      <div class="ts-crest-row">
        <button class="ts-arrow" data-cycle="${side}" data-dir="-1" aria-label="Previous club">◀</button>
        <div class="ts-crest">${crestSVG(c.crest, c.short, 132)}</div>
        <button class="ts-arrow" data-cycle="${side}" data-dir="1" aria-label="Next club">▶</button>
      </div>
      <div class="ts-stars">${stars}</div>
      <div class="ts-stats">
        <div><span>ATT</span><b>${s.att}</b></div>
        <div><span>MID</span><b>${s.mid}</b></div>
        <div><span>DEF</span><b>${s.def}</b></div>
      </div>
      <div class="ts-league">${WORLD.leagueName}</div>
    </div>`;
}

export function render() {
  return `
    <div class="teamsel">
      <div class="ts-side ts-home">
        <span class="ts-label">HOME</span>
        <div id="tsHome">${teamCard(homeIdx, 'home')}</div>
        <span class="ts-seat" id="tsSeatH"></span>
      </div>

      <div class="ts-mid">
        <span class="ts-vs">VS</span>
        <div class="ts-opt">
          <span>Mode</span>
          <div class="seg col" id="modeSeg">
            ${MODES.map((m) => `
              <button class="${mode === m.id ? 'on' : ''}" data-mode="${m.id}">
                <b>${m.label}</b><i>${m.sub}</i>
              </button>`).join('')}
          </div>
        </div>
        <div class="ts-opt">
          <span>Length</span>
          <div class="seg" id="lenSeg">
            ${[[120, '2m'], [240, '4m'], [420, '7m']].map(([v, l]) =>
              `<button class="${duration === v ? 'on' : ''}" data-len="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <div class="ts-opt" id="skillOpt">
          <span>CPU</span>
          <div class="seg" id="skillSeg">
            ${[[0.7, 'Easy'], [1, 'Pro'], [1.35, 'Elite']].map(([v, l]) =>
              `<button class="${skill === v ? 'on' : ''}" data-skill="${v}">${l}</button>`).join('')}
          </div>
        </div>
        <button class="btn primary big" id="kickOff">Kick Off</button>
      </div>

      <div class="ts-side ts-away">
        <span class="ts-label">AWAY</span>
        <div id="tsAway">${teamCard(awayIdx, 'away')}</div>
        <span class="ts-seat" id="tsSeatA"></span>
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
    document.documentElement.requestFullscreen?.().catch(() => {});
    navigate('play', {
      homeId: WORLD.clubs[homeIdx].id,
      awayId: WORLD.clubs[awayIdx].id,
      duration, skill, mode,
    });
  });

  seatText();
  const padTimer = setInterval(seatText, 900);
  return () => { clearInterval(padTimer); window.removeEventListener('keydown', onKey); };
}
