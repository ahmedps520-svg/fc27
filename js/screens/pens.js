/**
 * v194: the online penalty duel — the screen. server/pens.js runs the duel;
 * this draws it and sends the two things a player does: stop the marker to
 * shoot, or pick a dive in goal.
 *
 *   navigate('pens', { start: 'queue' | 'host' | 'join', code })
 *
 * Takers and the keeper come from your Ultimate XI (best finishers first) and
 * travel as card ids; the other side's names are looked up here, so nothing a
 * player typed is shown. Nobody free: the CPU instead, through the offline
 * shootout (shootout.js). A win pays a little, a loss a little less.
 */
import * as net from '../net/socket.js';
import { getState, update } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { sfx } from '../audio.js';
import { haptic } from '../native.js';
import { getPlayer, WORLD } from '../data/generator.js';
import { clubIdentity, ultimateSquad } from './squad.js';
import { runShootout } from './shootout.js';
import { screenHead } from '../components/screenHead.js';
import { tx } from '../i18n.js';

export const TITLE = 'Penalty duel';
export const WIN_COINS = 250;
export const LOSS_COINS = 60;

const cardOf = (id) => getPlayer(id) || (typeof id === 'string' && id.includes(':') ? getPlayer(id.split(':').pop()) : null);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** My side as it travels: card ids, best finishers first, and the keeper. */
export function myTeam() {
  const sq = ultimateSquad();
  const xi = sq?.xi || [];
  const keeper = xi.find((p) => p.position === 'GK') || null;
  const takers = xi.filter((p) => p !== keeper).slice().sort((a, b) => (b.stats?.shooting || 0) - (a.stats?.shooting || 0)).map((p) => p.id);
  return { takers, keeper: keeper?.id || null, squad: sq };
}

export function render() {
  return `
    <section class="screen pens-screen">
      ${screenHead({ kicker: tx('Online'), title: tx('Penalty duel'), sub: tx('Five each, then sudden death. You shoot, they save — then swap.'), motif: 'pitch', tone: 'c' })}
      <div class="panel glass pens-panel" id="pensPanel">
        <p class="pens-status" id="pensLobby">${tx('Connecting…')}</p>
      </div>
    </section>`;
}

export function mount(root, params = {}) {
  const panel = root.querySelector('#pensPanel');
  const offs = [];
  let duel = null;           // { id, you, opp, score, marks, takers }
  let sweep = null;
  let clock = null;
  const me = myTeam();
  if (me.takers.length < 5 || !me.keeper) {
    panel.innerHTML = `<p class="pens-status">${tx('Fill your Ultimate XI, with a keeper, to take part.')}</p><button class="btn primary" data-p="back">${tx('Back')}</button>`;
    panel.querySelector('[data-p="back"]').onclick = () => navigate('online');
    return () => {};
  }
  const kit = (() => { try { return clubIdentity().kit || null; } catch { return null; } })();
  const payload = () => ({ takers: me.takers, keeper: me.keeper, kit });

  const lobby = (html) => { stopSweep(); panel.innerHTML = html; };
  const begin = () => {
    if (!net.isReady()) { lobby(`<p class="pens-status">${tx('Not connected to the server.')}</p><button class="btn ghost" data-p="back">${tx('Back')}</button>`); wire(); return; }
    if (params.start === 'host') net.send({ t: 'pensHost', ...payload() });
    else if (params.start === 'join') net.send({ t: 'pensJoin', code: String(params.code || '').toUpperCase(), ...payload() });
    else net.send({ t: 'pensQueue', ...payload() });
    lobby(`<p class="pens-status">${params.start === 'join' ? tx('Joining…') : tx('Looking for an opponent…')}</p><button class="btn ghost" data-p="cancel">${tx('Cancel')}</button>`);
    wire();
  };
  function wire() {
    panel.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.p;
      if (a === 'back') navigate('online');
      if (a === 'cancel') { net.send({ t: 'pensCancel' }); navigate('online'); }
      if (a === 'again') { params = { start: 'queue' }; begin(); }
      if (a === 'wait') begin();
      if (a === 'cpu') playCpu();
    }));
  }

  /* ---------------------------- the duel ---------------------------- */
  const takerName = (side, kick) => {
    const ids = side === duel.you ? me.takers : duel.opp.takers;
    const c = cardOf(ids[kick % Math.max(1, ids.length)]);
    return c ? (c.short || c.name) : (side === duel.you ? tx('You') : duel.opp.name);
  };
  function drawDuel() {
    const mine = duel.you; const names = [null, null];
    names[mine] = tx('You'); names[1 - mine] = esc(duel.opp.name);
    panel.innerHTML = `
      <div class="so pens-duel">
        <div class="so-score"><b>${names[0]}</b><span id="soScore">0 – 0</span><b>${names[1]}</b></div>
        <div class="so-pips"><div id="soPips0"></div><div id="soPips1"></div></div>
        <div class="so-goal" id="soGoal">
          <div class="so-net"></div>
          <i class="so-keeper" id="soKeeper"></i>
          <i class="so-marker" id="soMarker" hidden></i>
          <i class="so-ball" id="soBall" hidden></i>
        </div>
        <i class="pens-clock" id="pensClock"><b></b></i>
        <p class="so-status" id="soStatus">${tx('Get ready…')}</p>
        <div class="pens-act" id="pensAct"></div>
        <button class="btn ghost sm pens-leave" data-p="leave">${tx('Leave (counts as a loss)')}</button>
      </div>`;
    panel.querySelector('[data-p="leave"]').onclick = () => { net.send({ t: 'pensLeave' }); };
  }
  const $ = (id) => panel.querySelector(`#${id}`);
  function paint(score, marks) {
    $('soScore').textContent = `${score[0]} – ${score[1]}`;
    [0, 1].forEach((t) => { $(`soPips${t}`).innerHTML = (marks?.[t] || []).map((m) => `<i class="so-pip ${m}"></i>`).join(''); });
  }
  function stopSweep() { if (sweep) cancelAnimationFrame(sweep.raf); sweep = null; }
  function startSweep(round) {
    stopSweep();
    const marker = $('soMarker'); marker.hidden = false;
    const speed = 1.5 + round * 0.16;
    sweep = { phase: Math.random() * 2, last: performance.now(), raf: 0 };
    const tick = (now) => {
      if (!sweep) return;
      sweep.phase += ((now - sweep.last) / 1000) * speed; sweep.last = now;
      marker.style.left = `${50 + Math.sin(sweep.phase * Math.PI) * 46}%`;
      sweep.raf = requestAnimationFrame(tick);
    };
    sweep.raf = requestAnimationFrame(tick);
  }
  function runClock(ms) {
    const bar = $('pensClock')?.querySelector('b'); if (!bar) return;
    bar.style.transition = 'none'; bar.style.width = '100%';
    void bar.offsetWidth;
    bar.style.transition = `width ${ms}ms linear`; bar.style.width = '0%';
  }
  function onTurn(m) {
    if (!duel || m.id !== duel.id) return;
    const kp = $('soKeeper'); kp.style.transform = ''; $('soBall').hidden = true; $('soBall').classList.remove('missed');
    $('soStatus').className = 'so-status';
    const shooting = m.shooter === duel.you;
    const act = $('pensAct');
    runClock(m.ms);
    if (shooting) {
      $('soStatus').textContent = `${takerName(duel.you, m.kick)} ${tx('steps up — stop the marker to aim')}`;
      act.innerHTML = `<button class="btn primary big" id="pensShoot">${tx('Shoot')}</button>`;
      startSweep(m.round);
      $('pensShoot').onclick = () => {
        const aim = Math.sin((sweep?.phase || 0) * Math.PI);
        stopSweep(); act.innerHTML = '';
        net.send({ t: 'pensShoot', aim: Math.round(aim * 1000) / 1000 });
        $('soStatus').textContent = tx('Struck…');
      };
    } else {
      stopSweep(); $('soMarker').hidden = true;
      $('soStatus').textContent = `${takerName(m.shooter, m.kick)} ${tx('to take it — pick your dive')}`;
      act.innerHTML = `<div class="pens-dives"><button class="btn" data-dive="-1">◀ ${tx('Left')}</button><button class="btn" data-dive="0">${tx('Stay')}</button><button class="btn" data-dive="1">${tx('Right')} ▶</button></div>`;
      act.querySelectorAll('[data-dive]').forEach((b) => { b.onclick = () => {
        const dive = Number(b.dataset.dive);
        act.innerHTML = '';
        net.send({ t: 'pensDive', dive });
        $('soKeeper').style.transform = `translateX(${dive * 76 * 0.35}px)`;
        $('soStatus').textContent = tx('Set…');
      }; });
    }
  }
  function onKick(m) {
    if (!duel || m.id !== duel.id) return;
    stopSweep(); $('pensAct').innerHTML = ''; $('soMarker').hidden = true;
    $('soKeeper').style.transform = `translateX(${m.dive * 76}px) rotate(${m.dive * 12}deg)`;
    const ball = $('soBall'); ball.hidden = false; ball.style.left = `${50 + Math.max(-1.25, Math.min(1.25, m.aim)) * 46}%`;
    ball.classList.toggle('missed', !m.scored);
    const mineShot = m.shooter === duel.you;
    const good = mineShot ? m.scored : !m.scored;
    $('soStatus').textContent = `${tx(m.why)}${m.rushed && mineShot ? ` — ${tx('out of time')}` : ''}`;
    $('soStatus').className = `so-status ${good ? 'good' : 'bad'}`;
    sfx(m.scored ? 'goal' : 'save');
    haptic(m.scored ? (mineShot ? 'goal' : 'post') : 'save');
    paint(m.score, m.marks);
  }
  function onEnd(m) {
    if (!duel || m.id !== duel.id) return;
    stopSweep();
    const won = m.winner === m.you;
    const coins = won ? WIN_COINS : LOSS_COINS;
    update((s) => { s.club.apex += coins; });
    refreshCoins();
    haptic(won ? 'special' : 'tap');
    const [a, b] = m.score;
    duel = null;
    lobby(`<div class="pens-end ${won ? 'good' : ''}">
      <b>${won ? tx('You win the duel') : tx('You lose the duel')}</b>
      <span>${a} – ${b}${m.walkover ? ` · ${won ? tx('they left') : tx('you left')}` : ''} · ◈${coins}</span>
      <div class="pens-btns"><button class="btn primary" data-p="again">${tx('Find another')}</button><button class="btn ghost" data-p="back">${tx('Back')}</button></div>
    </div>`);
    wire();
  }

  /* ------------------------ nobody free: the CPU ------------------------ */
  function playCpu() {
    const sq = me.squad;
    const club = WORLD.clubs[Math.floor(Math.random() * Math.min(16, WORLD.clubs.length))];
    const theirXi = (club.roster || []).map((id) => getPlayer(id)).filter(Boolean).sort((x, y) => y.overall - x.overall).slice(0, 11);
    const keeperOf = (xi) => xi.find((p) => p.position === 'GK') || xi[0];
    const id = clubIdentity();
    panel.innerHTML = '<div id="pensCpu"></div>';
    runShootout(panel.querySelector('#pensCpu'), {
      home: { name: id.name, short: id.short, xi: sq.xi, keeper: keeperOf(sq.xi) },
      away: { name: club.name, short: club.short, xi: theirXi, keeper: keeperOf(theirXi) },
      youAre: 0,
    }).then((r) => {
      const won = r.winner === 0;
      update((s) => { s.club.apex += won ? 120 : 30; }); refreshCoins();
      lobby(`<div class="pens-end ${won ? 'good' : ''}"><b>${won ? tx('You beat the CPU') : tx('The CPU wins it')}</b><span>${r.home} – ${r.away} · ◈${won ? 120 : 30}</span>
        <div class="pens-btns"><button class="btn primary" data-p="again">${tx('Look for a person')}</button><button class="btn ghost" data-p="back">${tx('Back')}</button></div></div>`);
      wire();
    });
  }

  offs.push(net.on('pensQueued', () => {}));
  offs.push(net.on('pensHosting', (m) => {
    lobby(`<p class="pens-status">${tx('Your duel code')}</p><b class="pens-code">${esc(m.code)}</b><p class="hint">${tx('Your friend enters it under Online → Penalty duel → Join.')}</p><button class="btn ghost" data-p="cancel">${tx('Cancel')}</button>`);
    wire();
  }));
  offs.push(net.on('pensFail', (m) => { toast(tx(m.error || 'Could not start the duel.'), 'warn'); navigate('online'); }));
  offs.push(net.on('pensNobody', () => {
    lobby(`<p class="pens-status">${tx('Nobody is free for a duel right now.')}</p><div class="pens-btns"><button class="btn primary" data-p="cpu">${tx('Take on the CPU')}</button><button class="btn ghost" data-p="wait">${tx('Keep looking')}</button><button class="btn ghost" data-p="back">${tx('Back')}</button></div>`);
    wire();
  }));
  offs.push(net.on('pensStart', (m) => {
    duel = { id: m.id, you: m.you, opp: { name: m.opp?.name || '?', takers: m.opp?.takers || [], keeper: m.opp?.keeper || null } };
    sfx('confirm');
    drawDuel(); paint([0, 0], [[], []]);
  }));
  offs.push(net.on('pensTurn', onTurn));
  offs.push(net.on('pensKick', onKick));
  offs.push(net.on('pensEnd', onEnd));
  begin();

  return () => {
    stopSweep(); clearTimeout(clock);
    // leaving the screen mid-duel is leaving the duel; waiting is just stopping
    if (duel) net.send({ t: 'pensLeave' }); else net.send({ t: 'pensCancel' });
    offs.forEach((off) => off());
  };
}
