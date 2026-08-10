/**
 * Penalty shootout.
 *
 * Offered when a Kick Off finishes level. It is not the match simulation — a
 * shootout has no run of play, no positioning and no ball physics worth the
 * name, and forcing it through `Match` would mean inventing a whole set of
 * states that exist for ninety seconds and never again. It is its own small
 * machine: five kicks each, alternating, then sudden death.
 *
 * You take yours by stopping a marker that sweeps across the goal. The CPU's
 * are resolved with the same arithmetic, so neither side is playing a different
 * game — the only difference is whose hand is on the trigger.
 *
 * Deliberately offline only. Two machines agreeing on a shootout means another
 * authoritative state machine on the wire, and a drawn online match already has
 * a result the ladder accepts.
 */
import { sfx } from '../audio.js';

const KICKS = 5;

/** Where the keeper can actually reach, as a fraction of the goal's half width. */
const REACH = 0.42;

/**
 * Resolve one kick.
 *
 * `aim` is -1 (left post) to 1 (right post). Accuracy falls off the further out
 * you aim, which is what makes the corners a gamble rather than a free goal:
 * a 99 shooter can pick a corner, a defender taking the fifth cannot.
 *
 * @returns {{scored: boolean, aim: number, dive: number, why: string}}
 */
function resolveKick(taker, keeper, aim) {
  const shooting = taker?.stats?.shooting ?? 70;
  const handling = keeper?.stats?.defending ?? 70;

  // where it actually ends up
  const wobble = ((100 - shooting) / 100) * 0.42 * (Math.random() * 2 - 1);
  const placed = Math.max(-1.25, Math.min(1.25, aim + wobble));

  if (Math.abs(placed) > 1.02) return { scored: false, aim: placed, dive: 0, why: 'Wide' };

  // The keeper guesses. A better keeper guesses the right way more often, but
  // never always — a shootout that a 99 keeper wins outright is not a shootout.
  const guessRight = Math.random() < 0.34 + (handling / 100) * 0.2;
  const dive = guessRight ? Math.sign(placed) || 0 : -(Math.sign(placed) || 1);

  const sameSide = dive === 0 || Math.sign(placed) === dive || Math.abs(placed) < 0.12;
  if (sameSide && Math.abs(Math.abs(placed) - Math.abs(dive)) < REACH) {
    // within reach of the dive — the closer to the middle, the easier the save
    const savePower = (1 - Math.abs(placed)) * (0.55 + (handling / 100) * 0.45);
    if (Math.random() < savePower) return { scored: false, aim: placed, dive, why: 'Saved' };
  }
  return { scored: true, aim: placed, dive, why: 'Scored' };
}

/** The order a side takes them in: best finishers first. */
const takerOrder = (squad) => squad
  .filter((p) => p.position !== 'GK')
  .slice()
  .sort((a, b) => b.stats.shooting - a.stats.shooting);

/**
 * Run a shootout inside `host`, an element the caller owns.
 *
 * @param {object} opts
 *   home, away   { name, short, xi: player[] , keeper: player }
 *   youAre       0 or 1 — which side the player is taking
 * @returns {Promise<{winner: number, home: number, away: number, log: string[]}>}
 */
export function runShootout(host, opts) {
  const { home, away, youAre = 0 } = opts;
  const sides = [home, away];
  const orders = sides.map((s) => takerOrder(s.xi));
  const score = [0, 0];
  const taken = [0, 0];
  const marks = [[], []];        // 'scored' | 'missed' per kick, for the row of pips

  let turn = 0;                  // whose kick
  let round = 0;
  let done = null;

  host.innerHTML = `
    <div class="so">
      <span class="so-kicker">Penalty shootout</span>
      <div class="so-score">
        <b>${home.short}</b><span id="soScore">0 – 0</span><b>${away.short}</b>
      </div>
      <div class="so-pips"><div id="soPipsH"></div><div id="soPipsA"></div></div>

      <div class="so-goal" id="soGoal">
        <div class="so-net"></div>
        <i class="so-keeper" id="soKeeper"></i>
        <i class="so-marker" id="soMarker"></i>
        <i class="so-ball" id="soBall" hidden></i>
      </div>

      <p class="so-status" id="soStatus">Get ready…</p>
      <button class="btn primary big" id="soGo">Shoot</button>
    </div>`;

  const scoreEl = host.querySelector('#soScore');
  const statusEl = host.querySelector('#soStatus');
  const goBtn = host.querySelector('#soGo');
  const marker = host.querySelector('#soMarker');
  const keeperEl = host.querySelector('#soKeeper');
  const ballEl = host.querySelector('#soBall');
  const pips = [host.querySelector('#soPipsH'), host.querySelector('#soPipsA')];

  const paint = () => {
    scoreEl.textContent = `${score[0]} – ${score[1]}`;
    pips.forEach((el, t) => {
      el.innerHTML = marks[t].map((m) => `<i class="so-pip ${m}"></i>`).join('');
    });
  };

  /* ----------------------------- the marker ---------------------------- *
   * Sweeps across the goal; stopping it is your aim. Speed rises a little as
   * the shootout goes on, so the fifth kick is harder than the first.        */
  let raf = null;
  let sweeping = false;
  let phase = 0;

  const stopSweep = () => {
    sweeping = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  };

  const sweep = () => {
    sweeping = true;
    const speed = 1.5 + round * 0.16;
    let last = performance.now();
    const tick = (now) => {
      if (!sweeping) return;
      phase += ((now - last) / 1000) * speed;
      last = now;
      const aim = Math.sin(phase * Math.PI);
      marker.style.left = `${50 + aim * 46}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const currentAim = () => Math.sin(phase * Math.PI);

  const show = (res, taker) => {
    stopSweep();
    keeperEl.style.transform = `translateX(${res.dive * 76}px) rotate(${res.dive * 12}deg)`;
    ballEl.hidden = false;
    ballEl.style.left = `${50 + res.aim * 46}%`;
    ballEl.classList.toggle('missed', !res.scored);
    statusEl.textContent = `${taker.short} — ${res.why}`;
    statusEl.className = `so-status ${res.scored ? 'good' : 'bad'}`;
    sfx(res.scored ? 'goal' : 'save');
  };

  const reset = () => {
    ballEl.hidden = true;
    ballEl.classList.remove('missed');
    keeperEl.style.transform = '';
    statusEl.className = 'so-status';
  };

  /**
   * Can the side still be caught? Standard shootout arithmetic — once one side
   * cannot be reached the thing stops, which is why a shootout is rarely ten
   * kicks long.
   */
  const decided = () => {
    const left = (t) => Math.max(0, KICKS - taken[t]);
    if (taken[0] >= KICKS && taken[1] >= KICKS) {
      // sudden death: decided only when both have taken the same number
      if (taken[0] === taken[1] && score[0] !== score[1]) return score[0] > score[1] ? 0 : 1;
      return null;
    }
    if (score[0] > score[1] + left(1)) return 0;
    if (score[1] > score[0] + left(0)) return 1;
    return null;
  };

  const finish = (winner) => {
    stopSweep();
    // The kick handler disables the button and only the "carry on" branch of
    // the timeout re-enables it — so arriving here left Continue permanently
    // disabled and the shootout with no way out of it.
    goBtn.disabled = false;
    goBtn.textContent = 'Continue';
    statusEl.textContent = `${sides[winner].name} win ${score[0]}–${score[1]} on penalties`;
    statusEl.className = 'so-status good';
    goBtn.onclick = () => done({ winner, home: score[0], away: score[1] });
  };

  const nextKick = () => {
    reset();
    const t = turn;
    const order = orders[t];
    const taker = order[taken[t] % order.length];
    const keeper = sides[1 - t].keeper;
    const yours = t === youAre;

    statusEl.textContent = yours
      ? `${taker.short} steps up — stop the marker to aim`
      : `${sides[t].short}: ${taker.short} to take it`;
    goBtn.textContent = yours ? 'Shoot' : 'Watch';
    goBtn.disabled = false;
    sweep();

    goBtn.onclick = () => {
      goBtn.disabled = true;
      // the CPU aims for a corner with its own error rather than reading the marker
      const aim = yours ? currentAim() : (Math.random() < 0.5 ? -1 : 1) * (0.55 + Math.random() * 0.4);
      const res = resolveKick(taker, keeper, aim);
      show(res, taker);
      if (res.scored) score[t] += 1;
      marks[t].push(res.scored ? 'scored' : 'missed');
      taken[t] += 1;
      paint();

      setTimeout(() => {
        const w = decided();
        if (w !== null) return finish(w);
        turn = 1 - turn;
        if (turn === 0) round += 1;
        goBtn.disabled = false;
        nextKick();
      }, 1250);
    };
  };

  paint();
  nextKick();

  return new Promise((resolve) => { done = resolve; });
}
