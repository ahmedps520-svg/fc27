import { getState, update, applyResult } from '../state.js';
import { getClub, WORLD } from '../data/generator.js';
import { buildSide, simulateMatch, quickResult } from '../matchEngine.js';
import { crestSVG } from '../components/crest.js';
import { playerCard } from '../components/playerCard.js';
import { navigate, refreshCoins } from '../app.js';

export const TITLE = 'Match Day';

let timer = null;

const SPEEDS = { instant: 0, fast: 45, normal: 130 };

export function render(params) {
  const home = getClub(params.homeId);
  const away = getClub(params.awayId);

  return `
    <div class="match-shell">
      <div class="scoreboard glass">
        <div class="sb-team">
          ${crestSVG(home.crest, home.short, 54)}
          <b>${home.name}</b>
        </div>
        <div class="sb-score">
          <span class="sb-nums"><i id="hg">0</i><em>-</em><i id="ag">0</i></span>
          <span class="sb-clock" id="clock">0'</span>
        </div>
        <div class="sb-team">
          ${crestSVG(away.crest, away.short, 54)}
          <b>${away.name}</b>
        </div>
      </div>

      <div class="match-bars glass">
        <div class="bar-row">
          <span id="possH">50%</span>
          <div class="poss-bar"><b id="possBar" style="width:50%"></b></div>
          <span id="possA">50%</span>
        </div>
        <div class="bar-legend"><span>Possession</span></div>
        <div class="stat-grid">
          <div><b id="shH">0</b><span>Shots</span><b id="shA">0</b></div>
          <div><b id="otH">0</b><span>On target</span><b id="otA">0</b></div>
          <div><b id="coH">0</b><span>Corners</span><b id="coA">0</b></div>
          <div><b id="fkH">0</b><span>Fouls</span><b id="fkA">0</b></div>
        </div>
      </div>

      <div class="commentary glass" id="feed">
        <div class="feed-inner" id="feedInner"></div>
      </div>

      <div class="match-controls">
        <button class="btn" id="skipBtn">Skip to result</button>
        <button class="btn ghost" id="leaveBtn">Leave match</button>
      </div>

      <div class="result-overlay" id="resultOverlay" hidden></div>
    </div>`;
}

export function mount(root, params) {
  const settings = getState().settings;
  const homeSide = buildSide(params.homeId);
  const awaySide = buildSide(params.awayId);
  const result = simulateMatch(homeSide, awaySide, {
    chemHome: params.chemHome || 0,
    chemAway: params.chemAway || 0,
  });
  const feed = root.querySelector('#feedInner');
  const feedBox = root.querySelector('#feed');
  const el = (id) => root.querySelector(`#${id}`);

  let minute = 0;
  let eventIdx = 0;
  const running = { hg: 0, ag: 0 };
  const box = {
    home: { shots: 0, onTarget: 0, corners: 0, fouls: 0 },
    away: { shots: 0, onTarget: 0, corners: 0, fouls: 0 },
  };

  const paint = () => {
    el('clock').textContent = `${minute}'`;
    el('hg').textContent = running.hg;
    el('ag').textContent = running.ag;
    const played = Math.max(minute, 1);
    const possH = minute >= 90 ? result.stats.home.possession
      : Math.round(50 + (result.stats.home.possession - 50) * (played / 90));
    el('possH').textContent = `${possH}%`;
    el('possA').textContent = `${100 - possH}%`;
    el('possBar').style.width = `${possH}%`;
    el('shH').textContent = box.home.shots; el('shA').textContent = box.away.shots;
    el('otH').textContent = box.home.onTarget; el('otA').textContent = box.away.onTarget;
    el('coH').textContent = box.home.corners; el('coA').textContent = box.away.corners;
    el('fkH').textContent = box.home.fouls; el('fkA').textContent = box.away.fouls;
  };

  const pushEvent = (ev) => {
    if (ev.type === 'goal') {
      if (ev.side === 'home') running.hg++; else running.ag++;
      flashGoal(root, ev.side === 'home' ? homeSide : awaySide);
    }
    if (ev.side && box[ev.side]) {
      if (ev.type === 'goal' || ev.type === 'save' || ev.type === 'miss') box[ev.side].shots++;
      if (ev.type === 'goal' || ev.type === 'save') box[ev.side].onTarget++;
      if (ev.text.includes('corner')) box[ev.side].corners++;
      if (ev.text.includes('book') || ev.text.includes('trip')) box[ev.side].fouls++;
    }
    if (!getState().settings.commentary && !['goal', 'half', 'full', 'kickoff'].includes(ev.type)) return;

    const line = document.createElement('div');
    line.className = `fline f-${ev.type} ${ev.side || ''}`;
    line.innerHTML = `
      <span class="fmin">${ev.minute}'</span>
      <span class="ftext">${ev.text}</span>
      ${ev.type === 'goal' ? `<span class="fscore">${ev.score}</span>` : ''}`;
    feed.appendChild(line);
    feedBox.scrollTop = feedBox.scrollHeight;
  };

  const finish = () => {
    clearInterval(timer);
    timer = null;
    minute = 90;
    Object.assign(running, { hg: result.homeGoals, ag: result.awayGoals });
    box.home = { ...result.stats.home };
    box.away = { ...result.stats.away };
    paint();
    commitResult(params, result);
    showResult(root, result, params);
  };

  const step = () => {
    minute++;
    while (eventIdx < result.events.length && result.events[eventIdx].minute <= minute) {
      pushEvent(result.events[eventIdx++]);
    }
    paint();
    if (minute >= 90) finish();
  };

  pushEvent(result.events[0]);
  eventIdx = 1;
  paint();

  const speed = SPEEDS[settings.simSpeed] ?? 130;
  if (speed === 0) {
    while (eventIdx < result.events.length) pushEvent(result.events[eventIdx++]);
    finish();
  } else {
    timer = setInterval(step, speed);
  }

  el('skipBtn').addEventListener('click', () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    while (eventIdx < result.events.length) pushEvent(result.events[eventIdx++]);
    finish();
  });

  el('leaveBtn').addEventListener('click', () => {
    clearInterval(timer);
    timer = null;
    navigate(params.mode === 'career' ? 'career' : 'quick');
  });

  return () => { clearInterval(timer); timer = null; };
}

function flashGoal(root, side) {
  const banner = document.createElement('div');
  banner.className = 'goal-flash';
  banner.style.setProperty('--team', side.crest.colors[0]);
  banner.innerHTML = `<span>GOAL!</span><small>${side.name}</small>`;
  root.querySelector('.match-shell').appendChild(banner);
  setTimeout(() => banner.remove(), 1500);
}

/** Persist a career result (user match) and sim the rest of the matchday. */
function commitResult(params, result) {
  if (params.mode !== 'career') {
    const reward = 350 + result.homeGoals * 60 + result.awayGoals * 20;
    update((s) => { s.club.coins += reward; });
    refreshCoins();
    return;
  }

  const career = getState().career;
  if (!career || career.resolvedMatchday === career.matchday) return;

  update((s) => {
    const c = s.career;
    const round = WORLD.fixtures[c.matchday - 1];
    round.matches.forEach((m) => {
      let hg;
      let ag;
      if (m.home === params.homeId && m.away === params.awayId) {
        hg = result.homeGoals; ag = result.awayGoals;
      } else {
        const q = quickResult(m.home, m.away);
        hg = q.homeGoals; ag = q.awayGoals;
      }
      applyResult(c, m.home, m.away, hg, ag);
      c.results.push({ matchday: c.matchday, home: m.home, away: m.away, hg, ag });
    });
    const won = (params.homeId === c.clubId && result.homeGoals > result.awayGoals)
      || (params.awayId === c.clubId && result.awayGoals > result.homeGoals);
    const drew = result.homeGoals === result.awayGoals;
    c.budget += won ? 2_400_000 : drew ? 1_200_000 : 700_000;
    c.resolvedMatchday = c.matchday;
    c.matchday += 1;
    s.club.coins += won ? 900 : drew ? 500 : 300;
  });
  refreshCoins();
}

function showResult(root, result, params) {
  const overlay = root.querySelector('#resultOverlay');
  const m = result.motm;
  const side = m.side === 'home' ? result.home : result.away;
  const won = result.homeGoals === result.awayGoals ? 'DRAW'
    : `${result.homeGoals > result.awayGoals ? result.home.name : result.away.name} WIN`;

  overlay.hidden = false;
  overlay.classList.add('open');
  overlay.innerHTML = `
    <div class="result-card glass">
      <span class="result-kicker">Full Time</span>
      <div class="result-score">
        <div>${crestSVG(result.home.crest, result.home.short, 46)}<b>${result.home.short}</b></div>
        <span class="rs-nums">${result.homeGoals} - ${result.awayGoals}</span>
        <div>${crestSVG(result.away.crest, result.away.short, 46)}<b>${result.away.short}</b></div>
      </div>
      <p class="result-verdict">${won}</p>

      <div class="motm">
        <span class="motm-label">Man of the Match</span>
        ${playerCard(m.player, { size: 'md' })}
        <div class="motm-line">
          <b>${m.rating.toFixed(1)}</b> rating · ${m.goals} goal${m.goals === 1 ? '' : 's'} · ${m.assists} assist${m.assists === 1 ? '' : 's'} · ${side.name}
        </div>
      </div>

      <div class="result-stats">
        ${[['Possession', `${result.stats.home.possession}%`, `${result.stats.away.possession}%`],
           ['Shots', result.stats.home.shots, result.stats.away.shots],
           ['On target', result.stats.home.onTarget, result.stats.away.onTarget],
           ['Corners', result.stats.home.corners, result.stats.away.corners]]
          .map(([k, h, a]) => `<div><b>${h}</b><span>${k}</span><b>${a}</b></div>`).join('')}
      </div>

      <button class="btn primary" id="doneBtn">
        ${params.mode === 'career' ? 'Back to career hub' : 'Back to Quick Match'}
      </button>
    </div>`;

  overlay.querySelector('#doneBtn').addEventListener('click', () => {
    navigate(params.mode === 'career' ? 'career' : 'quick');
  });
}
