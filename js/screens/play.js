import { getState, update } from '../state.js';
import { getClub } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { Match, SHAPES, FORMATION_NAMES, PITCH } from '../game/sim.js';
import { Input } from '../game/input.js';
import {
  draw, makeCamera, updateCamera, groundBasis, replayCamera, resolveQuality,
} from '../game/render3d.js';
import { createRenderer } from '../game/renderGL.js';
import { toggleFullscreen, exitFullscreen, fullscreenSupported } from '../fullscreen.js';
import { settleDivisionMatch } from '../ultimate.js';
import { sfx, startCrowd, setCrowd, stopCrowd, stopMusic, resumeAudio } from '../audio.js';
import { navigate, refreshCoins, toast } from '../app.js';
import * as net from '../net/socket.js';
import {
  InputSender, RemoteInput, SnapshotView, encodeSnapshot, qualityLabel,
} from '../net/netplay.js';

export const TITLE = 'Match';

export function render(params) {
  const home = getClub(params.homeId);
  const away = getClub(params.awayId);
  return `
    <div class="gm" id="gmRoot">
      <canvas id="gmCanvas"></canvas>

      <div class="gm-hud">
        <div class="gm-bug">
          <span class="bug-team" style="--team:${home.crest.colors[0]}">
            ${crestSVG(home.crest, home.short, 20)}<b>${home.short}</b>
          </span>
          <b class="bug-score" id="gmScore">0</b>
          <b class="bug-score" id="gmScoreA">0</b>
          <span class="bug-team" style="--team:${away.crest.colors[0]}">
            <b>${away.short}</b>${crestSVG(away.crest, away.short, 20)}
          </span>
          <span class="bug-clock" id="gmClock">0'</span>
        </div>
        <div class="gm-tools">
          <span class="gm-net" id="gmNet" hidden></span>
          <span class="gm-pad" id="gmPad">No pad</span>
          <button class="icon-btn sm" id="gmFs" title="Fullscreen">⛶</button>
          <button class="icon-btn sm" id="gmPause" title="Pause">❚❚</button>
        </div>
      </div>

      <div class="gm-touch" id="gmTouch" hidden>
        <!-- the whole left half is the stick: it appears under your thumb
             wherever that lands, rather than asking you to find a fixed pad -->
        <div class="tstick-zone" id="stickZone">
          <div class="tstick" id="stick" hidden><span class="ts-base"></span><i></i></div>
        </div>
        <div class="tpad" id="tpad">
          <button class="tbtn t-cross" data-slot="cross"><b>CROSS</b></button>
          <button class="tbtn t-through" data-slot="through"><b>THROUGH</b></button>
          <button class="tbtn t-shoot" data-slot="shoot"><i class="tb-charge"></i><b>SHOOT</b></button>
          <button class="tbtn t-pass" data-slot="pass"><b>PASS</b></button>
          <button class="tbtn t-sprint" data-slot="sprint"><b>SPRINT</b></button>
        </div>
      </div>

      <div class="goal-card" id="goalCard" hidden>
        <span class="gc-word">GOAL</span>
        <span class="gc-scorer" id="gcScorer"></span>
        <span class="gc-score" id="gcScore"></span>
      </div>

      <div class="replay-tag" id="replayTag" hidden>
        <span class="rt-dot"></span>REPLAY
        <em>hold ◯ to skip</em>
      </div>

      <div class="gm-overlay" id="gmOverlay" hidden></div>
    </div>`;
}

export function mount(root, params) {
  const shell = root.querySelector('#gmRoot');
  const canvas = root.querySelector('#gmCanvas');
  const mode = params.mode || 'single';
  const online = params.online || null;
  // Online is one person per machine, so the local seat is the only local input.
  const twoUp = !online && (mode === 'versus' || mode === 'coop');

  // Seat 1 takes pad 0 and the WASD set; seat 2 takes pad 1 and the arrow/numpad
  // set, so a second person can join with a pad or just the other half of the keyboard.
  const localInput = new Input({ pad: 0, keys: 'primary' });
  let inputs;
  let remote = null;
  if (online) {
    // The host drives seat 0 and receives seat 1 over the wire; the guest holds
    // seat 1 locally and streams it up. Both keep the seats in the same order so
    // the match object is identical on both machines.
    // The guest never simulates, so it only needs its own seat locally.
    remote = online.host ? new RemoteInput() : null;
    inputs = online.host ? [localInput, remote] : [localInput];
  } else {
    inputs = [localInput];
    if (twoUp) inputs.push(new Input({ pad: 1, keys: 'secondary' }));
  }
  const input = localInput;
  const quality = resolveQuality(getState().settings.quality);

  const match = new Match(params.homeId, params.awayId, {
    duration: params.duration || 240,
    skill: params.skill || 1,
    mode,
    homeSquad: params.homeSquad || null,
    awaySquad: params.awaySquad || null,
  });
  const cam = makeCamera();
  match.basis = groundBasis(cam);        // controls follow the camera

  const scoreH = root.querySelector('#gmScore');
  const scoreA = root.querySelector('#gmScoreA');
  const clockEl = root.querySelector('#gmClock');
  const padEl = root.querySelector('#gmPad');
  const overlay = root.querySelector('#gmOverlay');
  const goalCard = root.querySelector('#goalCard');
  const gcScorer = root.querySelector('#gcScorer');
  const gcScore = root.querySelector('#gcScore');
  const replayTag = root.querySelector('#replayTag');
  let lastPhase = null;

  /* ---------------------------- goal replay ---------------------------- */
  // Rolling buffer of recent frames, so a goal can be played back afterwards.
  const TAPE_SECONDS = 8;
  const TAPE_MAX = TAPE_SECONDS * 60;
  const tape = [];
  const allPlayers = () => [...match.teams[0].players, ...match.teams[1].players];

  // How the clip is cut. The build-up is taken from the rolling tape the moment
  // the goal goes in; the rest is recorded live straight into the clip.
  const PRE_FRAMES = Math.round(3.5 * 60);      // dribble and the strike
  const POST_FRAMES = 60;                       // ball crossing the line into the net
  const HOLD_SECONDS = 2;                       // freeze on the finish

  /**
   * Playback speed across the clip. The strike is the moment worth slowing for;
   * once the ball is in the net nothing moves, so lingering there just stalls.
   *
   * This was the real fault in the old replay: the slow-motion threshold sat at
   * t > 0.68 and the goal landed at t ≈ 0.71, so it dropped to 0.3x exactly as
   * the ball came to rest and then ground through eighty static frames — 44% of
   * the replay was a still image of the ball sitting in the goal.
   *
   * `GOAL_T` is where the ball crosses the line: PRE / (PRE + POST).
   */
  const GOAL_T = PRE_FRAMES / (PRE_FRAMES + POST_FRAMES);
  const playbackSpeed = (t) => {
    if (t < GOAL_T - 0.16) return 0.8;           // the dribble, near enough real time
    if (t < GOAL_T + 0.07) return 0.34;          // the shot and the ball crossing the line
    return 0.85;                                 // tail: get to the hold
  };

  const recordFrame = () => {
    const snap = {
      b: [match.ball.x, match.ball.y, match.ball.z || 0],
      p: allPlayers().map((p) => [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy, p.diveT || 0]),
    };
    tape.push(snap);
    if (tape.length > TAPE_MAX) tape.shift();
    // once a goal is captured, keep feeding the clip until it has its tail
    if (clip && clip.post < POST_FRAMES) { clip.frames.push(snap); clip.post += 1; }
  };

  const applyFrame = (snap) => {
    match.ball.x = snap.b[0];
    match.ball.y = snap.b[1];
    match.ball.z = snap.b[2];
    allPlayers().forEach((p, i) => {
      const s = snap.p[i];
      if (!s) return;
      [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy] = s;
      p.diveT = s[6];
    });
  };

  /**
   * Which team just scored. `goalTeam` is written by the simulation, so on a
   * guest — which never simulates — it arrives in the snapshot, and on an older
   * host it may not arrive at all. Falling back to whichever score moved keeps
   * every consumer of this honest rather than reading `teams[undefined]`.
   */
  let lastScores = [match.teams[0].score, match.teams[1].score];
  const scoringTeam = () => {
    const gt = match.goalTeam;
    if (gt === 0 || gt === 1) return match.teams[gt];
    const moved = match.teams[0].score !== lastScores[0] ? 0
      : match.teams[1].score !== lastScores[1] ? 1 : null;
    return moved === null ? null : match.teams[moved];
  };

  /**
   * Cut the clip the instant the ball crosses the line.
   *
   * It used to be windowed out of the rolling tape when the celebration ended,
   * which quietly broke it: the tape is a ring buffer and recording continues
   * through the celebration, so a long one pushed the entire build-up out and
   * the "replay" was nothing but the ball already sitting in the net. Taking the
   * build-up here, while it is still in the buffer, makes the clip independent
   * of how long anyone wheels away for.
   */
  let clip = null;
  const captureGoal = () => {
    const team = scoringTeam();
    clip = {
      frames: tape.slice(Math.max(0, tape.length - PRE_FRAMES)),
      post: 0,
      goalX: team && team.dir > 0 ? PITCH.w : 0,
    };
  };

  let replay = null;
  const startReplay = () => {
    if (!clip || clip.frames.length < 60) return false;
    const live = { b: [match.ball.x, match.ball.y, match.ball.z], p: allPlayers().map((p) => [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy, p.diveT || 0]) };
    const celeb = allPlayers().map((p) => p.celebrating);
    allPlayers().forEach((p) => { p.celebrating = false; });
    replay = {
      frames: clip.frames,
      i: 0, live, celeb,
      goalX: clip.goalX,
      cam: makeCamera(),
      hold: 0,
    };
    clip = null;
    replayTag.hidden = false;
    return true;
  };

  const endReplay = () => {
    if (!replay) return;
    applyFrame(replay.live);
    allPlayers().forEach((p, i) => { p.celebrating = replay.celeb[i]; });
    replay = null;
    replayTag.hidden = true;
  };

  /* ------------------------------ online ------------------------------ */
  // Host: simulate, broadcast snapshots, consume the guest's input stream.
  // Guest: never simulate — pour snapshots into the match and stream input up.
  const netOffs = [];
  const view = online && !online.host ? new SnapshotView(match) : null;
  const sender = online && !online.host ? new InputSender(localInput) : null;
  const netEl = root.querySelector('#gmNet');
  let snapAcc = 0;
  let oppGone = null;
  let rtt = null;
  const pendingCues = [];

  if (online) {
    netEl.hidden = false;
    match.online = true;
    // Only the host's clock is authoritative, so the guest must not tick its own.
    if (online.host) {
      netOffs.push(net.on('in', (m) => remote.accept(m)));
    } else {
      netOffs.push(net.on('snap', (m) => {
        view.accept(m);
        // sounds are made by the host's simulation and ride along with the world
        for (const [name, arg] of m.cu || []) sfx(name, arg);
      }));
    }
    netOffs.push(net.on('oppLeft', () => {
      if (ended) return;
      oppGone = true;
      ended = true;
      finish();
    }));
    netOffs.push(net.on('closed', () => {
      if (!ended) toast('Lost connection to the server', 'warn');
    }));
    const pingTimer = setInterval(async () => { rtt = await net.ping(); }, 3000);
    netOffs.push(() => clearInterval(pingTimer));
  }

  document.body.classList.add('in-game');
  resumeAudio();
  stopMusic();          // menu music steps aside for the stadium
  startCrowd();

  let vw = 0;
  let vh = 0;
  let paused = false;
  let ended = false;
  let navHeld = false;
  let raf = null;
  let last = performance.now();

  // WebGL is the real renderer; the canvas-2D path stays as a fallback so the
  // match still runs if a machine or driver refuses a GL context.
  let gl = null;
  let ctx = null;
  try {
    gl = createRenderer(canvas, match, quality);
  } catch (err) {
    console.warn('WebGL unavailable, falling back to canvas 2D:', err);
    ctx = canvas.getContext('2d', { alpha: false });
  }

  const resize = () => {
    vw = shell.clientWidth;
    vh = shell.clientHeight;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    if (gl) { gl.resize(vw, vh); return; }
    const dpr = Math.min(quality === 'low' ? 1.25 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  /* ------------------------------- touch ------------------------------- */
  /**
   * Phone and tablet controls.
   *
   * The old pad was a fixed 104px ring and four 46px buttons wearing PlayStation
   * glyphs, with no way to change player at all — which made defending
   * impossible, since off the ball nothing presses unless you pick the presser.
   * This is the layout every mobile football game settles on instead: a stick
   * that appears wherever your left thumb lands, and big named buttons that say
   * what they do and change with the situation.
   */
  const touchWrap = root.querySelector('#gmTouch');
  let updateTouchContext = () => {};
  if (window.matchMedia('(pointer: coarse)').matches) {
    touchWrap.hidden = false;
    const zone = root.querySelector('#stickZone');
    const stick = root.querySelector('#stick');
    const nub = stick.querySelector('i');
    const R = 56;                       // travel to full tilt, in px
    let stickId = null;

    const moveStick = (e) => {
      if (e.pointerId !== stickId) return;
      const r = stick.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const m = Math.hypot(dx, dy) || 1;
      const cl = Math.min(1, m / R);
      input.setTouchVec((dx / m) * cl, (dy / m) * cl);
      nub.style.transform = `translate(${(dx / m) * cl * R}px, ${(dy / m) * cl * R}px)`;
    };
    const endStick = (e) => {
      if (e.pointerId !== stickId) return;
      stickId = null;
      stick.hidden = true;
      input.setTouchVec(0, 0);
      nub.style.transform = '';
    };

    zone.addEventListener('pointerdown', (e) => {
      if (stickId !== null) return;
      stickId = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      // plant the stick under the thumb, kept clear of the screen edges
      const pad = R + 18;
      const x = Math.min(Math.max(e.clientX, pad), window.innerWidth - pad);
      const y = Math.min(Math.max(e.clientY, pad), window.innerHeight - pad);
      stick.style.left = `${x}px`;
      stick.style.top = `${y}px`;
      stick.hidden = false;
      moveStick(e);
    });
    zone.addEventListener('pointermove', moveStick);
    zone.addEventListener('pointerup', endStick);
    zone.addEventListener('pointercancel', endStick);

    // Each button owns one slot. What the slot does depends on whether your side
    // has the ball, so the same thumb position is pass or tackle as the game
    // demands, and nothing is buried in a menu.
    const IN_POSSESSION = {
      pass: ['pass', 'PASS'], through: ['through', 'THROUGH'], cross: ['cross', 'CROSS'],
      shoot: ['shoot', 'SHOOT'], sprint: ['sprint', 'SPRINT'],
    };
    const DEFENDING = {
      pass: ['pass', 'TACKLE'], through: ['switch', 'SWITCH'], cross: [null, ''],
      shoot: ['shoot', 'SLIDE'], sprint: ['sprint', 'SPRINT'],
    };

    const buttons = [...root.querySelectorAll('.tbtn')].map((el) => {
      const slot = el.dataset.slot;
      let action = IN_POSSESSION[slot][0];
      const press = (e) => {
        e.preventDefault();
        if (!action) return;
        el.classList.add('is-down');
        input.setTouchButton(action, true);
        navigator.vibrate?.(8);
        // Capture keeps a thumb that slides off the button still holding it —
        // but it must never be what decides whether the press counted, so the
        // input is already set and a refusal here is ignored.
        try { el.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
      };
      const release = () => {
        el.classList.remove('is-down');
        // release whatever this button is currently bound to, and its other
        // binding too: the context can flip mid-press, and a stuck sprint or a
        // shot that never fires is worse than an extra clear
        input.setTouchButton(IN_POSSESSION[slot][0], false);
        if (DEFENDING[slot][0]) input.setTouchButton(DEFENDING[slot][0], false);
      };
      el.addEventListener('pointerdown', press);
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('lostpointercapture', release);
      return {
        el,
        label: el.querySelector('b'),
        set(map) {
          const [act, text] = map[slot];
          if (act !== action) { release(); action = act; }
          el.hidden = !act;
          if (text) el.querySelector('b').textContent = text;
        },
      };
    });

    const charge = root.querySelector('.tb-charge');
    let attacking = null;
    updateTouchContext = () => {
      const seat = match.controllers[0];
      const mine = !!match.ball.owner && seat && match.ball.owner.team === seat.team;
      if (mine !== attacking) {
        attacking = mine;
        for (const b of buttons) b.set(mine ? IN_POSSESSION : DEFENDING);
      }
      // the shot charges while held, so the button shows how much power is on it
      if (charge) charge.style.setProperty('--charge', `${Math.round((seat?.charge || 0) * 100)}%`);
    };
    updateTouchContext();
  }

  /* -------------------------------- loop ------------------------------- */
  /**
   * One frame. Everything below is wrapped so that a throw costs a frame and
   * not the match: the next frame is requested from a `finally`, because the
   * request used to be the last statement of the body and anything that threw
   * above it silently ended the game. That is what turned a missing `goalTeam`
   * on a guest — one line, at the first goal — into a screen frozen for
   * ninety minutes while the other player carried on.
   */
  let frameErrors = 0;
  let running = true;
  const frame = (now) => {
    if (!running) return;
    try {
      step(now);
    } catch (err) {
      frameErrors += 1;
      // noisy once, then quiet: a broken frame usually breaks every frame
      if (frameErrors <= 3) console.error('[match] frame failed, continuing:', err);
      if (frameErrors === 4) console.error('[match] further frame errors suppressed');
    } finally {
      if (running) raf = requestAnimationFrame(frame);
    }
  };

  const step = (now) => {
    const dt = Math.min(0.034, (now - last) / 1000);
    last = now;
    for (const inp of inputs) inp.poll(dt);
    updateTouchContext();
    // an online match cannot be frozen — the other player is still out there
    const frozen = paused && !online;
    sender?.tick(dt);

    if (input.pressed('pause') && !ended) setPaused(!paused);

    // pad / keyboard navigation of the pause menu
    if (paused && !ended) {
      const ay = input.axis().y;
      if (ay < -0.5 && !navHeld) { navIdx = (navIdx + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length; paintPause(); }
      if (ay > 0.5 && !navHeld) { navIdx = (navIdx + 1) % PAUSE_ITEMS.length; paintPause(); }
      navHeld = Math.abs(ay) > 0.5;
      if (input.pressed('pass')) activate(PAUSE_ITEMS[navIdx].id);
      if (input.pressed('shoot')) setPaused(false);
    } else {
      navHeld = false;
    }

    if (replay) {
      // hold ◯ to bail out of the cinematic
      if (inputs.some((i) => i.held('shoot'))) endReplay();
      else {
        const N = replay.frames.length;
        if (replay.i < N) {
          applyFrame(replay.frames[Math.min(N - 1, Math.floor(replay.i))]);
          const t = replay.i / N;
          replayCamera(replay.cam, match.ball, replay.goalX, t);
          // advanced against the clock, not the frame: the tape was recorded at
          // 60 Hz, and online both machines roll their own copy — a guest at
          // 30 fps would otherwise sit out twice as much of the match as the
          // host does
          replay.i += playbackSpeed(t) * dt * 60;
        } else {
          // Hold on the finish: the ball sits in the net, everyone frozen, so
          // the goal actually registers before we cut back to the match.
          applyFrame(replay.frames[N - 1]);
          replayCamera(replay.cam, match.ball, replay.goalX, 1);
          replay.hold += dt;
          if (replay.hold >= HOLD_SECONDS) endReplay();
        }
      }
    } else if (!frozen && !ended) {
      if (view) {
        // guest: the world arrives over the wire rather than being computed
        view.update(dt);
      } else {
        match.update(dt, inputs);
      }
      updateCamera(cam, match, dt);
      match.basis = groundBasis(cam);
      // keep taping through the goal phase, otherwise the clip stops at the line
      if (match.phase === 'play' || match.phase === 'goal') {
        // capture before recording, so the build-up ends on the strike itself
        if (match.phase === 'goal' && lastPhase !== 'goal') captureGoal();
        recordFrame();
      }
      if (match.phase === 'end') { ended = true; finish(); }

      // drain the sim's audio cues
      const outgoing = [];
      while (match.cues.length) {
        const c = match.cues.shift();
        sfx(c.name, c.arg);
        if (online?.host) outgoing.push([c.name, c.arg ?? 0]);
      }

      // host: ship the world at 20 Hz, with any sounds it made since the last one
      if (online?.host) {
        pendingCues.push(...outgoing);
        snapAcc += dt;
        if (snapAcc >= 0.05) {
          snapAcc = 0;
          const snap = encodeSnapshot(match);
          if (pendingCues.length) { snap.cu = pendingCues.slice(0, 12); pendingCues.length = 0; }
          net.send(snap);
        }
      }
      // crowd lifts as play nears either goal, and roars through a celebration
      const near = Math.min(match.ball.x, PITCH.w - match.ball.x) / (PITCH.w / 2);
      setCrowd(match.phase === 'goal' ? 1 : 0.3 + (1 - near) * 0.5);
    }

    const rdt = frozen ? 0 : dt;
    const shot = replay ? replay.cam : cam;
    if (gl) gl.render(match, shot, rdt);
    else draw(ctx, match, shot, vw, vh, quality, rdt);

    // goal card rides the celebration phase
    if (match.phase === 'goal' && lastPhase !== 'goal') {
      const t = scoringTeam();
      goalCard.hidden = false;
      goalCard.style.setProperty('--team', t ? t.colors[0] : 'var(--accent)');
      gcScorer.textContent = match.scorerName || '';
      gcScore.textContent = `${t ? t.short : ''}  ${match.teams[0].score} – ${match.teams[1].score}`;
      void goalCard.offsetWidth;
      goalCard.classList.add('show');
      // A guest never simulates, so nothing has written this goal into the
      // scorer list its full-time screen reads from. Rebuild it from what the
      // snapshot carried.
      if (view && t) t.scorers.push({ name: match.scorerName || '', minute: match.minute() });
    } else if (match.phase !== 'goal' && lastPhase === 'goal') {
      goalCard.classList.remove('show');
      goalCard.hidden = true;
      startReplay();                       // celebration over — roll the tape
    }
    lastPhase = match.phase;

    scoreH.textContent = match.teams[0].score;
    scoreA.textContent = match.teams[1].score;
    clockEl.textContent = `${match.minute()}'`;
    if (twoUp) {
      padEl.textContent = `P1 ${inputs[0].pad ? '✓' : 'kbd'} · P2 ${inputs[1].pad ? '✓' : 'kbd'}`;
      padEl.classList.toggle('on', !!(inputs[0].pad && inputs[1].pad));
    } else {
      padEl.textContent = input.pad ? 'Pad ✓' : 'No pad';
      padEl.classList.toggle('on', !!input.pad);
    }
    if (online) {
      const q = qualityLabel(rtt);
      // the host stops broadcasting while it plays its own replay, so a stale
      // stream during one is expected rather than a connection problem
      const lost = view?.stale && !replay;
      netEl.textContent = lost ? 'reconnecting…' : `${online.oppName} · ${q.text}`;
      netEl.className = `gm-net ${lost ? 'bad' : q.cls}`;
    }
    lastScores = [match.teams[0].score, match.teams[1].score];
  };
  raf = requestAnimationFrame(frame);

  /* ----------------------------- fullscreen ---------------------------- */
  const fsBtn = root.querySelector('#gmFs');
  // iPhone has no Fullscreen API — hide the control rather than offer a dead button
  if (!fullscreenSupported()) fsBtn.hidden = true;
  fsBtn.addEventListener('click', () => toggleFullscreen(shell));
  const onFsChange = () => setTimeout(resize, 60);
  document.addEventListener('fullscreenchange', onFsChange);

  /* ---------------------------- pause menu ----------------------------- */
  const PAUSE_ITEMS = [
    { id: 'resume', label: 'Resume Match' },
    { id: 'team', label: 'Team Management' },
    { id: 'facts', label: 'Match Facts' },
    { id: 'controls', label: 'Controls' },
    { id: 'leave', label: 'Leave Match' },
  ];
  let navIdx = 1;
  let section = 'team';

  const formationSVG = (name) => {
    const shape = SHAPES[name] || [];
    return `<svg class="form-mini" viewBox="0 0 60 92" aria-hidden="true">
      <rect x="1" y="1" width="58" height="90" rx="3" class="fm-pitch"/>
      <line x1="1" y1="46" x2="59" y2="46" class="fm-line"/>
      <circle cx="30" cy="46" r="8" class="fm-line" fill="none"/>
      ${shape.map((s) => {
        // shape x runs own-goal -> opponent goal; draw attacking upwards
        const cx = 4 + s.y * 52;
        const cy = 88 - s.x * 84;
        return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.1"
                  class="fm-dot ${s.role === 'GK' ? 'gk' : ''}"/>`;
      }).join('')}
    </svg>`;
  };

  const panelFor = (id) => {
    const team = match.teams[online ? online.seat : match.human];
    if (id === 'team') {
      const seg = (key, opts) => `
        <div class="p-row">
          <span>${key === 'mentality' ? 'Mentality' : 'Pressing'}</span>
          <div class="seg">${opts.map((o) => `
            <button class="${team.tactics[key] === o ? 'on' : ''}"
                    data-tactic="${key}" data-val="${o}">${o[0].toUpperCase() + o.slice(1)}</button>`).join('')}
          </div>
        </div>`;
      return `
        <h3>Team Management</h3>
        <div class="p-forms">
          <div class="form-list">
            ${FORMATION_NAMES.map((f) => `
              <button class="form-opt ${team.formation === f ? 'on' : ''}" data-form="${f}">${f}</button>`).join('')}
          </div>
          <div class="form-preview">
            ${formationSVG(team.formation)}
            <span>${team.formation}</span>
          </div>
        </div>
        ${seg('mentality', ['defensive', 'balanced', 'attacking'])}
        ${seg('pressing', ['low', 'normal', 'high'])}
        <p class="p-note">Changes apply immediately — your shape shifts on the next touch.</p>`;
    }
    if (id === 'facts') {
      const [ph, pa] = match.possession();
      const [h, a] = match.teams;
      const rows = [
        ['Possession', `${ph}%`, `${pa}%`],
        ['Shots', h.shots, a.shots],
        ['On target', h.onTarget, a.onTarget],
        ['Goals', h.score, a.score],
      ];
      const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
        .sort((x, y) => x[1].minute - y[1].minute);
      return `
        <h3>Match Facts</h3>
        <div class="p-facts">
          ${rows.map(([k, x, y]) => `<div><b>${x}</b><span>${k}</span><b>${y}</b></div>`).join('')}
        </div>
        ${goals.length
          ? `<ul class="gm-goals">${goals.map(([t, s]) => `<li><i>${s.minute}'</i> ${s.name} <em>${t}</em></li>`).join('')}</ul>`
          : '<p class="p-note">No goals yet.</p>'}`;
    }
    if (id === 'controls') {
      return `
        <h3>Controls</h3>
        <div class="ctrl-grid compact">
          ${[['✕', 'Pass · tackle'], ['◯', 'Shoot — hold for power'], ['◯+R1', 'Curl it up'],
             ['□', 'Cross'], ['△', 'Through ball'], ['L1/R1', 'Switch to nearest'],
             ['R2', 'Sprint'], ['Options', 'Pause']]
            .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
        </div>`;
    }
    return '';
  };

  function paintPause() {
    const home = getClub(params.homeId);
    overlay.innerHTML = `
      <div class="pause">
        <div class="pause-head">
          ${crestSVG(home.crest, home.short, 26)}
          <span>${online ? `Online · vs ${online.oppName}` : 'Quick Match'}</span>
        </div>
        ${online ? '<p class="pause-live">The match is still running — this menu does not pause it.</p>' : ''}
        <nav class="pause-nav">
          ${PAUSE_ITEMS.map((it, i) => `
            <button class="pause-item ${i === navIdx ? 'on' : ''} ${it.id === section ? 'open' : ''}"
                    data-nav="${i}">${it.label}</button>`).join('')}
        </nav>
        <div class="pause-panel">${panelFor(section)}</div>
        <div class="pause-hints"><b>✕</b> Select <b>◯</b> Resume</div>
      </div>`;
  }

  function activate(id) {
    if (id === 'resume') { setPaused(false); return; }
    if (id === 'leave') {
      exitFullscreen();
      if (online) { net.send({ t: 'leave' }); navigate('squad'); return; }
      navigate('quick');
      return;
    }
    section = id;
    paintPause();
  }

  function setPaused(v) {
    paused = v;
    overlay.classList.toggle('is-pause', v);
    if (!v) { overlay.hidden = true; overlay.innerHTML = ''; return; }
    overlay.hidden = false;
    navIdx = Math.max(1, navIdx);
    paintPause();
  }

  function finish() {
    const [ph, pa] = match.possession();
    const [h, a] = match.teams;
    const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
      .sort((x, y) => x[1].minute - y[1].minute);

    // Online, "my" side depends on which seat this machine holds.
    const meIdx = online ? online.seat : 0;
    const mine = match.teams[meIdx].score;
    const theirs = match.teams[1 - meIdx].score;

    if (online) {
      // A walkover still counts: the player who stayed takes the points.
      const scored = oppGone ? Math.max(mine, theirs + 1) : mine;
      const conceded = oppGone ? theirs : theirs;
      net.send({
        t: 'result',
        scored,
        conceded,
        divIdx: getState().ultimate.divIdx,
      });
    }

    // Apex Division matches settle the ladder instead of paying a flat fee
    let div = null;
    if (params.ultimate) {
      div = settleDivisionMatch({
        scored: online ? (oppGone ? Math.max(mine, theirs + 1) : mine) : h.score,
        conceded: online ? theirs : a.score,
      });
    } else {
      update((s) => { s.club.coins += 300 + (online ? mine : h.score) * 80; });
    }
    refreshCoins();

    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gm-panel glass">
        <span class="gm-ft">${oppGone ? 'Opponent left — win awarded' : 'Full time'}</span>
        <div class="gm-final">
          <div>${crestSVG(h.club.crest, h.short, 40)}<b>${h.short}</b></div>
          <span>${h.score} – ${a.score}</span>
          <div>${crestSVG(a.club.crest, a.short, 40)}<b>${a.short}</b></div>
        </div>
        ${goals.length ? `<ul class="gm-goals">${goals.map(([t, s]) =>
          `<li><i>${s.minute}'</i> ${s.name} <em>${t}</em></li>`).join('')}</ul>` : ''}
        <div class="gm-stats">
          <div><b>${ph}%</b><span>Possession</span><b>${pa}%</b></div>
          <div><b>${h.shots}</b><span>Shots</span><b>${a.shots}</b></div>
        </div>
        ${div ? `
          <div class="div-result ${div.promoted ? 'up' : div.relegated ? 'down' : ''}">
            <span class="dr-kicker">${div.promoted ? 'Promoted' : div.relegated ? 'Relegated' : 'Apex Division'}</span>
            <b>${div.toDivision}</b>
            <span class="dr-reward">◈ ${div.coins.toLocaleString()}${div.packs.length ? ` · ${div.packs.length} pack${div.packs.length > 1 ? 's' : ''}` : ''}</span>
            ${div.objectivesDone.length
              ? `<ul class="dr-objs">${div.objectivesDone.map((t) => `<li>✓ ${t}</li>`).join('')}</ul>`
              : ''}
          </div>` : ''}
        <div class="gm-btns">
          ${online
            ? '<button class="btn primary" data-o="uxi">Back to Ultimate XI</button>'
            : div
              ? '<button class="btn primary" data-o="uxi">Back to Ultimate XI</button>'
              : '<button class="btn primary" data-o="again">Rematch</button>'}
          <button class="btn ghost" data-o="quit">Quit</button>
        </div>
      </div>`;
  }

  overlay.addEventListener('click', (e) => {
    const o = e.target.closest('[data-o]')?.dataset.o;
    if (o) {
      if (o === 'resume') setPaused(false);
      if (o === 'quit') { exitFullscreen(); navigate(online || params.ultimate ? 'squad' : 'quick'); }
      if (o === 'uxi') { exitFullscreen(); navigate('squad'); }
      if (o === 'again') navigate('play', params);
      return;
    }

    const nav = e.target.closest('[data-nav]');
    if (nav) { navIdx = +nav.dataset.nav; activate(PAUSE_ITEMS[navIdx].id); return; }

    const form = e.target.closest('[data-form]');
    if (form) { setShape('formation', form.dataset.form); paintPause(); return; }

    const tac = e.target.closest('[data-tactic]');
    if (tac) { setShape(tac.dataset.tactic, tac.dataset.val); paintPause(); }
  });

  /**
   * Shape and tactics belong to the team you are actually managing. Offline that
   * is seat 0; online it is your seat, and a guest's change has to be applied on
   * the host, since the host owns the simulation.
   */
  function setShape(key, val) {
    const team = online ? online.seat : match.human;
    if (key === 'formation') match.applyFormation(team, val);
    else match.setTactic(team, key, val);
    if (online && !online.host) net.send({ t: 'evt', k: 'shape', team, key, val });
  }
  if (online?.host) {
    netOffs.push(net.on('evt', (m) => {
      if (m.k !== 'shape') return;
      if (m.key === 'formation') match.applyFormation(m.team, m.val);
      else match.setTactic(m.team, m.key, m.val);
    }));
  }

  root.querySelector('#gmPause').addEventListener('click', () => { if (!ended) setPaused(!paused); });

  return () => {
    // the loop re-arms itself from a `finally`, so leaving has to say stop as
    // well as cancelling the frame already in flight
    running = false;
    cancelAnimationFrame(raf);
    stopCrowd();
    gl?.dispose();
    window.removeEventListener('resize', resize);
    document.removeEventListener('fullscreenchange', onFsChange);
    document.body.classList.remove('in-game');
    for (const inp of inputs) inp.destroy?.();
    // tell the hub we are gone, so the other player is not left waiting
    if (online && !ended) net.send({ t: 'leave' });
    netOffs.forEach((off) => off());
  };
}
