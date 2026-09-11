/**
 * Penalties, on a watch.
 *
 * The one football moment that already fits a tiny screen: a goal, a ball, a
 * keeper, one decision. Five each, sudden death after. You shoot by tapping
 * when a sweeping marker is where you want the ball; you save by picking a
 * side before their run-up ends. Corners score more and get saved more; the
 * middle is the coward's shot that beats a keeper who has already gone. The
 * sweep gets faster every round so the fifth kick is a different game from
 * the first.
 */
const ROUNDS = 5;
const MAX_ROUNDS = 8;             // sudden death ends somewhere
const REWARD_GOAL = 120;
const REWARD_WIN = 300;

const buzz = (p) => { try { navigator.vibrate?.(p); } catch { /* unsupported */ } };

export function playPens(app, opts, onDone) {
  const { oppShort, onEvent = () => {} } = opts;
  const you = [];                 // true = scored, per kick
  const them = [];
  let round = 0;
  let phase = 'shoot';            // shoot -> dive -> shoot ...
  let raf = null;
  let markerX = 0;                // 0..1 across the goal mouth
  let dir = 1;
  let speed = 0.9;                // sweeps per second
  let live = true;

  app.innerHTML = `
    <div class="w-pens">
      <div class="w-pens-top">
        <div class="w-pens-side"><span>YOU</span><div class="w-dots" id="wYou"></div></div>
        <div class="w-pens-side"><span>${oppShort}</span><div class="w-dots" id="wThem"></div></div>
      </div>
      <div class="w-goal" id="wGoal">
        <div class="w-net"></div>
        <div class="w-keeper" id="wKeeper">▲</div>
        <div class="w-marker" id="wMarker"></div>
        <div class="w-ball" id="wBall" hidden>●</div>
      </div>
      <p class="w-pens-msg" id="wMsg">Tap to shoot</p>
      <div class="w-dive" id="wDive" hidden>
        <button class="w-btn ghost" data-dive="0">◀</button>
        <button class="w-btn ghost" data-dive="1">▲</button>
        <button class="w-btn ghost" data-dive="2">▶</button>
      </div>
    </div>`;
  const $ = (s) => app.querySelector(s);
  const goal = $('#wGoal');
  const marker = $('#wMarker');
  const keeper = $('#wKeeper');
  const ball = $('#wBall');
  const msg = $('#wMsg');
  const dive = $('#wDive');

  const paintDots = () => {
    const dots = (arr) => {
      const n = Math.max(ROUNDS, arr.length);
      return Array.from({ length: n }, (_, i) =>
        `<i class="${i < arr.length ? (arr[i] ? 'g' : 'm') : ''}"></i>`).join('');
    };
    $('#wYou').innerHTML = dots(you);
    $('#wThem').innerHTML = dots(them);
  };
  paintDots();

  const third = (x) => (x < 0.33 ? 0 : x > 0.67 ? 2 : 1);
  const place = (el, x) => { el.style.left = `${8 + x * 84}%`; };
  place(keeper, 0.5);

  let last = performance.now();
  const sweep = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (phase === 'shoot' && live) {
      markerX += dir * speed * 2 * dt;
      if (markerX >= 1) { markerX = 1; dir = -1; }
      if (markerX <= 0) { markerX = 0; dir = 1; }
      place(marker, markerX);
    }
    raf = requestAnimationFrame(sweep);
  };
  raf = requestAnimationFrame(sweep);

  /* Is it over? After five each, whoever leads; before that, whenever the
   * other side cannot catch up; past five, first round with a difference. */
  const decided = () => {
    const y = you.filter(Boolean).length, t = them.filter(Boolean).length;
    const yLeft = Math.max(0, ROUNDS - you.length), tLeft = Math.max(0, ROUNDS - them.length);
    if (you.length < ROUNDS || them.length < ROUNDS) {
      if (y > t + tLeft || t > y + yLeft) return true;
      return false;
    }
    if (you.length === them.length && y !== t) return true;
    return you.length >= MAX_ROUNDS && them.length >= MAX_ROUNDS;
  };

  const shootAt = (x) => {
    if (phase !== 'shoot' || !live) return;
    live = false;
    const aim = third(x);
    const guess = Math.random() < 0.55 ? aim : Math.floor(Math.random() * 3);   // keeper reads you a bit
    place(keeper, guess === 0 ? 0.12 : guess === 2 ? 0.88 : 0.5);
    place(ball, x); ball.hidden = false;
    const corner = x < 0.2 || x > 0.8;
    const pGoal = guess === aim
      ? (corner ? 0.5 : aim === 1 ? 0.22 : 0.3)
      : (corner ? 0.94 : 0.8);
    const scored = Math.random() < pGoal;
    setTimeout(() => {
      you.push(scored); paintDots();
      if (scored) { onEvent('pengoal'); buzz([14, 40, 22]); msg.textContent = 'GOAL'; }
      else { buzz(30); msg.textContent = 'Saved'; }
      round += 1;
      speed = Math.min(2.4, 0.9 + round * 0.22);
      setTimeout(next, 700);
    }, 260);
  };
  goal.addEventListener('pointerdown', (e) => { e.preventDefault(); shootAt(markerX); });

  const diveTo = (side) => {
    if (phase !== 'dive' || !live) return;
    live = false;
    const aim = Math.random() < 0.7 ? Math.floor(Math.random() * 3) : 1;
    place(keeper, side === 0 ? 0.12 : side === 2 ? 0.88 : 0.5);
    place(ball, aim === 0 ? 0.1 : aim === 2 ? 0.9 : 0.5); ball.hidden = false;
    const saved = side === aim ? Math.random() < 0.72 : Math.random() < 0.08;
    setTimeout(() => {
      them.push(!saved); paintDots();
      if (saved) { onEvent('pensave'); buzz([10, 30, 10, 30, 20]); msg.textContent = 'SAVED!'; }
      else { buzz(12); msg.textContent = 'They score'; }
      setTimeout(next, 700);
    }, 260);
  };
  dive.querySelectorAll('[data-dive]').forEach((b) => b.addEventListener('click', () => diveTo(+b.dataset.dive)));

  function next() {
    ball.hidden = true;
    place(keeper, 0.5);
    if (decided()) { finish(); return; }
    if (phase === 'shoot') {
      phase = 'dive'; dive.hidden = false; marker.hidden = true;
      msg.textContent = 'Pick a side';
    } else {
      phase = 'shoot'; dive.hidden = true; marker.hidden = false;
      msg.textContent = 'Tap to shoot';
    }
    live = true;
  }

  function finish() {
    cancelAnimationFrame(raf);
    const y = you.filter(Boolean).length, t = them.filter(Boolean).length;
    const won = y > t;
    if (won) onEvent('penwin');
    const reward = y * REWARD_GOAL + (won ? REWARD_WIN : 0);
    buzz(won ? [20, 60, 30] : 14);
    const panel = document.createElement('div');
    panel.className = 'w-end';
    panel.innerHTML = `
      <div>
        <p class="w-title">${won ? 'Shootout won' : 'Shootout lost'}</p>
        <div class="w-big">${y} – ${t}</div>
        <p class="w-sub">+◈ ${reward.toLocaleString()}</p>
        <button class="w-btn" id="wBack">Done</button>
      </div>`;
    app.querySelector('.w-pens').appendChild(panel);
    panel.querySelector('#wBack').addEventListener('click', () => onDone(reward));
  }
}
