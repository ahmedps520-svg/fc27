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
import { runShootout } from './shootout.js';
import { sfx, startCrowd, setCrowd, stopCrowd, stopMusic, resumeAudio } from '../audio.js';
import { navigate, refreshCoins, toast } from '../app.js';
import * as net from '../net/socket.js';
import { startP2P, stopP2P, sendMatch, p2pActive } from '../net/p2p.js';
import { advanceWeek } from '../career.js';
import {
  InputSender, RemoteInput, SnapshotView, encodeSnapshot, qualityLabel, SNAP_MS,
} from '../net/netplay.js';

export const TITLE = 'Match';

/**
 * What the loading screen says while it waits.
 *
 * Shuffled and stepped through, because a fixed order gives the game away the
 * second time you see it. Half of these are true and half are jokes, which is
 * the correct ratio for a loading screen.
 */
const LOADING_LINES = [
  'Loading packages',
  'Loading models',
  'Touching grass',
  'Inflating the ball',
  'Painting the lines',
  'Mowing the stripes',
  'Warming up the keeper',
  'Selling the perimeter boards',
  'Filling the stands',
  'Compiling shaders',
  'Tuning the floodlights',
  'Checking the offside trap',
  'Bribing the referee',
  'Polishing the boots',
  'Reticulating splines',
  'Waking the substitutes',
];

/**
 * Who is actually playing, for anything that draws a badge.
 *
 * A custom squad borrows a real club's id purely so the pitch and the fixture
 * have something to hang off, which meant the scoreboard showed Ironvale's crest
 * over your own Ultimate XI. If the squad brought an identity with it, that wins.
 */
function sideOf(params, which) {
  const squad = which === 'home' ? params.homeSquad : params.awaySquad;
  const club = getClub(which === 'home' ? params.homeId : params.awayId);
  if (!squad?.crest) return club;
  return { ...club, name: squad.name || club.name, short: squad.short || club.short, crest: squad.crest };
}

export function render(params) {
  const home = sideOf(params, 'home');
  const away = sideOf(params, 'away');
  return `
    <div class="gm" id="gmRoot">
      <canvas id="gmCanvas"></canvas>

      <!-- Sits over everything until the match is genuinely ready to look at.
           See the loading block in mount() for what "ready" means. -->
      <div class="gm-load" id="gmLoad">
        <div class="gl-inner">
          <div class="gl-teams">
            <span class="gl-team">${crestSVG(home.crest, home.short, 54)}<b>${home.short}</b></span>
            <span class="gl-vs">VS</span>
            <span class="gl-team">${crestSVG(away.crest, away.short, 54)}<b>${away.short}</b></span>
          </div>
          <div class="gl-bar"><i id="gmLoadFill"></i></div>
          <p class="gl-status" id="gmLoadText">Loading packages</p>
        </div>
      </div>

      <div class="gm-hud">
        <!-- the scoreline and the stamina bar stack together on the left; the
             HUD itself is a row, so they need their own column -->
        <div class="gm-left">
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
        <!-- the player you are actually steering, and how much he has left -->
        <div class="gm-stam" id="gmStam" hidden>
          <span class="stam-who" id="gmStamWho"></span>
          <i><b id="gmStamFill"></b></i>
        </div>
        </div>
        <div class="gm-tools">
          <span class="gm-fps" id="gmFps" hidden>-- FPS</span>
          <span class="gm-net" id="gmNet" hidden></span>
          <span class="gm-pad" id="gmPad">No pad</span>
          <button class="icon-btn sm" id="gmFs" title="Fullscreen">⛶</button>
          <button class="icon-btn sm" id="gmPause" title="Pause">❚❚</button>
        </div>
      </div>

      <!-- "X has queued a pause" — mirrored on both screens by the host -->
      <div class="gm-queue" id="gmQueue" hidden></div>

      <!-- Manager Career: the touchline HUD. The wheel is the manager's voice —
           four contextual shouts that rotate with the situation; the meters are
           the two numbers the whole mode runs on. -->
      <div class="mgr-hud" id="mgrHud" hidden>
        <div class="mgr-meters">
          <div class="mm"><span>MORALE</span><i><b id="mmMorale"></b></i><em id="mmMoraleV">65</em></div>
          <div class="mm"><span>PERFORM</span><i><b id="mmPerf"></b></i><em id="mmPerfV">50</em></div>
        </div>
        <div class="mgr-wheel" id="mgrWheel"></div>
        <button class="icon-btn sm mgr-cam" id="mgrCam" title="Camera: broadcast / manager (C)">🎥</button>
      </div>
      <!-- walking the technical area: stick/arrow keys on desktop, these on touch -->
      <div class="mgr-walk" id="mgrWalk" hidden>
        <button class="mw-arrow" id="mgrLeft" aria-label="Walk left">◀</button>
        <button class="mw-arrow" id="mgrRight" aria-label="Walk right">▶</button>
      </div>
      <div class="mgr-shout" id="mgrShout" hidden></div>
      <div class="mgr-talk" id="mgrTalk" hidden></div>

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
          <button class="tbtn t-pass" data-slot="pass"><i class="tb-charge"></i><b>PASS</b></button>
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
        <em>hold ◯</em>
        <button class="rt-skip" id="rtSkip" type="button">SKIP</button>
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
  // Scanned players are a 14 MB download, so they are never forced on the
  // low-detail path — a machine that asked for Low did so for a reason.
  const useModels = getState().settings.models !== 'simple' && quality !== 'low' && quality !== 'min';

  const match = new Match(params.homeId, params.awayId, {
    duration: params.duration || 240,
    skill: params.skill || 1,
    // the manager holds no stick: career matches are AI against AI, influenced
    human: mode === 'career' ? null : undefined,
    mode,
    // Kick Off is a game of football; Ultimate XI is a competition. Both sides
    // of an online match derive this from the same `ultimate` flag, so host and
    // guest never disagree about which engine they are watching.
    preset: params.ultimate ? 'competitive' : 'authentic',
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

  /* ------------------------------ pause reel ------------------------------ *
   * The pause menu sits over the live scene, and a frozen scene makes it a
   * still image. So while the world is actually stopped, the recent tape plays
   * back on a slow drifting camera behind the menu — the same footage the goal
   * replay uses, minus the drama. Too early for any tape (a pause seconds into
   * kick-off) and the camera drifts over the frozen scene instead: less to
   * watch, still alive. The live state is captured before the first frame is
   * applied and restored on resume, exactly like the goal replay.            */
  let reel = null;
  const captureLive = () => ({
    b: [match.ball.x, match.ball.y, match.ball.z],
    p: allPlayers().map((p2) => [p2.x, p2.y, p2.dirX, p2.dirY, p2.vx, p2.vy, p2.diveT || 0]),
  });
  const startReel = () => {
    if (reel || replay) return;
    const frames = tape.length >= 150 ? tape.slice(-Math.min(tape.length, 420)) : null;
    reel = { frames, i: 0, live: frames ? captureLive() : null, drift: 0, cam: makeCamera() };
  };
  const endReel = () => {
    if (!reel) return;
    if (reel.live) applyFrame(reel.live);
    reel = null;
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

  /* Skipping a replay used to be a controller-only gesture — hold ◯ — which on
   * a phone meant sitting through every one of them. The tag doubles as the
   * button. `pointerdown` rather than `click` so it lands on the first touch
   * instead of waiting for the release. */
  root.querySelector('#rtSkip')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    endReplay();
  });

  /* ------------------------------ online ------------------------------ */
  // Host: simulate, broadcast snapshots, consume the guest's input stream.
  // Guest: never simulate — pour snapshots into the match and stream input up.
  const netOffs = [];
  const view = online && !online.host ? new SnapshotView(match) : null;
  // input rides the direct channel when one is up — sendMatch falls back to the
  // websocket per packet, so this is safe before, during and after an upgrade
  const sender = online && !online.host ? new InputSender(localInput, 20, sendMatch) : null;
  const netEl = root.querySelector('#gmNet');
  let snapAcc = 0;

  /* ------------------------- synchronized pause ------------------------- *
   * Online, pausing is a request, not an act. The requester's name goes up on
   * both screens at once ("X has queued a pause"), play carries on, and the
   * match stops at the next dead ball — throw-in, corner, goal kick, goal,
   * half time — the way a real referee holds a substitution. Then both clients
   * sit in the pause menu behind one 20-second clock and resume on the same
   * frame.
   *
   * All of it is host state. The guest only ever *asks* (evt k:'pausereq');
   * the queue, the stoppage ruling, and the countdown live on the host and
   * travel to the guest inside ordinary snapshots (`pq` while queued,
   * `pz` while counting), so the two screens cannot disagree: whatever
   * the host believes is on the wire, and a duplicate request is refused in
   * exactly one place. If the ball simply refuses to go out, the queue force-
   * activates after 40 seconds — a pause that can never arrive is worse than a
   * slightly impatient one. */
  const PAUSE_HOLD = 20;      // seconds both players sit in the menu
  const PAUSE_FORCE = 40;     // queued this long -> stop at the next frame regardless
  let pq = null;              // {name, waitT} — host only
  let syncLeft = 0;           // seconds of synced pause remaining — host only
  let lastStoppages = 0;      // host: sim stoppage counter at the last frame
  let pauseSnap = null;       // host: the world as it stood at the whistle
  let lastTickSec = -1;       // last countdown second painted, so the menu is not rebuilt 30x/s
  let guestSynced = false;    // guest: currently held in the synced pause
  let guestPz = null;         // guest: [name, tenths] from the latest snapshot
  const queueEl = root.querySelector('#gmQueue');
  const showQueueBanner = (name) => {
    queueEl.hidden = !name;
    if (name) queueEl.innerHTML = `<b>${name}</b> has queued a pause · match stops at the next dead ball`;
  };
  const requestPause = (name) => {
    // one queue, one timer: a second request while one is pending or active
    // changes nothing (and re-showing the banner would reset nothing anyway)
    if (pq || syncLeft > 0 || ended) return;
    pq = { name: name || 'Player', waitT: 0 };
    showQueueBanner(pq.name);
  };
  let oppGone = null;
  let rtt = null;          // this client to the server
  let peerRtt = null;      // this client to the opponent and back — what you feel
  let lastPeerPing = 0;
  const pendingCues = [];

  if (online) {
    netEl.hidden = false;
    match.online = true;
    // Only the host's clock is authoritative, so the guest must not tick its own.
    if (online.host) {
      netOffs.push(net.on('in', (m) => remote.accept(m)));
      netOffs.push(net.on('evt', (m) => { if (m.k === 'pausereq') requestPause(m.name || online.oppName); }));
    } else {
      netOffs.push(net.on('snap', (m) => {
        view.accept(m);
        // sounds are made by the host's simulation and ride along with the world
        for (const [name, arg] of m.cu || []) sfx(name, arg);
        /* The pause protocol, guest side: obey the snapshot. `pq` = banner up,
         * `pz` = held in the menu with the host's countdown. Reading the very
         * latest packet (not the interpolated pair) is deliberate — a pause is
         * a state, not a position, and 100ms of extra menu is invisible where
         * 100ms of extra gameplay on one screen only is a desync. */
        showQueueBanner(m.pq || (m.pz && m.pz[0]) || null);
        guestPz = m.pz || null;
        if (guestPz && !guestSynced) { guestSynced = true; setPaused(true); }
        if (!guestPz && guestSynced) { guestSynced = false; setPaused(false); }
        if (guestSynced && paused) {
          const secs = Math.ceil((guestPz[1] || 0) / 10);
          if (secs !== lastTickSec) { lastTickSec = secs; paintPause(); }
        }
      }));
    }
    netOffs.push(net.on('oppLeft', () => {
      if (ended) return;
      // whatever the pause machinery was doing dies with the opponent — a
      // disconnect during a queued or active pause must not strand the menu
      pq = null; syncLeft = 0; guestSynced = false; guestPz = null;
      showQueueBanner(null);
      if (paused) setPaused(false);
      oppGone = true;
      ended = true;
      finish();
    }));
    // try to go direct; the relay carries the match until (and unless) it works
    startP2P(online);
    netOffs.push(net.on('closed', () => {
      if (!ended) toast('Lost connection to the server', 'warn');
    }));
    /* Two numbers, and the second one is the honest one.
     *
     * `net.ping()` measures this client to the server. What a player feels is
     * their input going to the opponent and the world coming back, which is
     * this client to the server to the *opponent* and all the way back — very
     * nearly the sum of both players' pings. The HUD used to show the first and
     * call it the connection, which read as half the lag people were feeling.
     *
     * The bounce rides on `evt`, which the hub relays verbatim without
     * inspecting it, so this needs nothing from the server. An opponent on an
     * older build simply never answers, and the readout falls back to the
     * server ping it always showed. */
    netOffs.push(net.on('evt', (m) => {
      if (m.k === 'pp') { net.send({ t: 'evt', k: 'pr', at: m.at }); return; }
      if (m.k === 'pr' && m.at === lastPeerPing) peerRtt = Math.round(performance.now() - m.at);
    }));
    const pingTimer = setInterval(async () => { rtt = await net.ping(); }, 3000);
    const peerTimer = setInterval(() => {
      lastPeerPing = performance.now();
      net.send({ t: 'evt', k: 'pp', at: lastPeerPing });
    }, 2000);
    netOffs.push(() => { clearInterval(pingTimer); clearInterval(peerTimer); });
  }

  /* ========================== Manager Career ========================== *
   * The manager is a system, not a screen: a figure on the touchline the
   * renderer draws, two meters the sim actually reads, a four-shout wheel
   * whose options follow the match, and a half-time talk. Everything here is
   * a no-op in every other mode (`mgr` stays null).
   *
   * The one rule, from the spec and worth keeping: no cosmetic buttons. Every
   * shout lands somewhere real — the tactics the AI already obeys, or the
   * performance meter the sim reads through aiSkillFor — and the costs are
   * real too, which is what makes CALM DOWN after PRESS a decision.          */
  const careerCtx = mode === 'career' ? (params.career || {}) : null;
  const mgr = careerCtx ? {
    side: careerCtx.isHome ? 0 : 1,
    morale: careerCtx.morale ?? 0.65,
    perf: 0.5,
    momentum: 0,
    wheel: [],            // the four options on offer
    wheelT: 0,            // seconds until the wheel rotates on its own
    coolT: 0,             // shout cooldown — the wheel is disabled while it runs
    lockT: 0,             // cooldown after a pick before the next rotation
    shoutT: 0,            // temporary-tactic revert timer
    baseTactics: null,
    talkDone: false,
    fig: { x: PITCH.w / 2 - 8, y: -1.7, dirX: 1, dirY: 0, pose: 'idle', poseT: 0, walk: 0 },
  } : null;
  if (mgr) {
    match.mgrSide = mgr.side;
    match.mgrPerf = mgr.perf;
    match.managerFig = mgr.fig;
    match.managerLook = careerCtx.manager || {};
    root.querySelector('#mgrHud').hidden = false;
    if (window.matchMedia('(pointer: coarse)').matches) root.querySelector('#mgrWalk').hidden = false;
  }
  // held-down state of the on-screen walk arrows
  let walkTouch = 0;
  for (const [id, dir] of [['#mgrLeft', -1], ['#mgrRight', 1]]) {
    const el = root.querySelector(id);
    el?.addEventListener('pointerdown', (e) => { e.preventDefault(); walkTouch = dir; });
    el?.addEventListener('pointerup', () => { walkTouch = 0; });
    el?.addEventListener('pointercancel', () => { walkTouch = 0; });
    el?.addEventListener('pointerleave', () => { walkTouch = 0; });
  }
  let camMode = 'broadcast';                    // career can switch to 'manager'
  let camBlend = 0;                             // 0 broadcast .. 1 manager
  const mgrCamera = { ...cam };

  const shoutEl = root.querySelector('#mgrShout');
  const wheelEl = root.querySelector('#mgrWheel');
  let shoutHide = null;
  const sayShout = (text) => {
    shoutEl.textContent = text;
    shoutEl.hidden = false;
    clearTimeout(shoutHide);
    shoutHide = setTimeout(() => { shoutEl.hidden = true; }, 2600);
  };

  /* The shout book. `mood` is how it lands on morale, `perf` on the meter the
   * sim reads, `tactics` is a temporary override of the real team instructions
   * (reverted after ~14s), and `line` is what the manager bellows. */
  const SHOUTS = {
    pass:    { label: 'PASS THE BALL', line: 'PASS THE BALL!', perf: +0.07, mood: -0.02, tactics: { mentality: 'balanced' } },
    attack:  { label: 'ATTACK',        line: 'GO AT THEM!', perf: +0.05, mood: +0.01, tactics: { mentality: 'attacking' } },
    switchp: { label: 'SWITCH PLAY',   line: 'SWITCH IT WIDE!', perf: +0.04, mood: 0 },
    slow:    { label: 'SLOW DOWN',     line: 'CALM! KEEP THE BALL!', perf: +0.02, mood: +0.02, tactics: { mentality: 'defensive' } },
    press:   { label: 'PRESS',         line: 'PRESS! PRESS!', perf: +0.06, mood: -0.01, tactics: { pressing: 'high' }, stamina: 0.05 },
    drop:    { label: 'DROP BACK',     line: 'DROP OFF! HOLD THE LINE!', perf: +0.03, mood: 0, tactics: { pressing: 'low', mentality: 'defensive' } },
    tight:   { label: 'MARK TIGHT',    line: 'TIGHTER! NOBODY FREE!', perf: +0.05, mood: -0.01, tactics: { pressing: 'high' } },
    compact: { label: 'STAY COMPACT',  line: 'COMPACT! STAY TOGETHER!', perf: +0.03, mood: +0.01, tactics: { pressing: 'normal', mentality: 'defensive' } },
    enc:     { label: 'ENCOURAGE',     line: 'COME ON! KEEP GOING!', perf: +0.03, mood: +0.06 },
    calm:    { label: 'CALM DOWN',     line: 'HEADS UP! PLAY OUR GAME!', perf: +0.02, mood: +0.04, tactics: { mentality: 'balanced', pressing: 'normal' } },
    demand:  { label: 'DEMAND MORE',   line: 'NOT GOOD ENOUGH! MORE!', perf: +0.09, mood: -0.06 },
    shoot:   { label: 'SHOOT',         line: 'HIT IT! SHOOT!', perf: +0.05, mood: 0, tactics: { mentality: 'attacking' } },
    cross:   { label: 'CROSS',         line: 'GET IT IN THE BOX!', perf: +0.04, mood: 0 },
    space:   { label: 'ATTACK SPACE',  line: 'RUN IN BEHIND!', perf: +0.05, mood: 0, tactics: { mentality: 'attacking' } },
    change:  { label: 'CHANGE TACTICS', line: 'NEW SHAPE! LISTEN!', perf: +0.04, mood: -0.02, tactics: { pressing: 'high', mentality: 'attacking' } },
  };

  /* Which four shouts fit this moment. Conceding recently outranks everything;
   * then whether the ball is ours and where it is. */
  let concededAt = -99;
  const wheelFor = () => {
    const t = match.t;
    if (t - concededAt < 14) return ['enc', 'calm', 'change', 'demand'];
    const b = match.ball;
    const ours = b.owner && b.owner.team === mgr.side;
    const attackingThird = mgr.side === 0 ? b.x > PITCH.w * 0.68 : b.x < PITCH.w * 0.32;
    if (ours && attackingThird) return ['shoot', 'cross', 'pass', 'space'];
    if (ours) return ['pass', 'attack', 'switchp', 'slow'];
    return ['press', 'drop', 'tight', 'compact'];
  };

  /* The wheel: four fat quadrant buttons around a hub, each numbered — press
   * 1–4 on a keyboard, tap on touch. Repainted only when the set changes. */
  const paintWheel = () => {
    wheelEl.innerHTML = `
      <span class="mw-hub" aria-hidden="true">SHOUT</span>
      ${mgr.wheel.map((k, i) =>
        `<button class="mw-opt p${i}" data-shout="${k}"><i>${i + 1}</i>${SHOUTS[k].label}</button>`).join('')}`;
  };
  // number keys are the pad-free way to shout without touching the mouse
  const onWheelKey = (e) => {
    if (paused || ended || loading) return;
    const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (i >= 0 && mgr.wheel[i]) applyShout(mgr.wheel[i]);
    if (e.code === 'KeyC') root.querySelector('#mgrCam')?.click();
  };
  if (mgr) window.addEventListener('keydown', onWheelKey);
  const rotateWheel = () => { mgr.wheel = wheelFor(); mgr.wheelT = 10; paintWheel(); };

  /* Personality-weighted delivery: a volatile squad takes DEMAND MORE badly
   * and a spark-heavy one lifts further under it — computed from the XI. */
  const squadTemper = () => {
    const ps = match.teams[mgr.side].players;
    let temper = 0; let spark = 0;
    for (const p of ps) {
      let h = 0; for (const ch of (p.ref?.name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      temper += (h % 100) / 100; spark += ((h >> 7) % 100) / 100;
    }
    return { temper: temper / ps.length, spark: spark / ps.length };
  };

  const SHOUT_COOLDOWN = 8;      // seconds between shouts — a voice, not a firehose
  const applyShout = (key) => {
    if (mgr.coolT > 0) return;
    const sh = SHOUTS[key];
    const pers = squadTemper();
    const moodHit = sh.mood < 0 ? sh.mood * (0.6 + pers.temper) : sh.mood;
    const perfHit = sh.perf * (sh.mood < 0 ? 0.7 + pers.spark * 0.6 : 1);
    mgr.morale = Math.max(0.05, Math.min(1, mgr.morale + moodHit));
    mgr.perf = Math.max(0.1, Math.min(1, mgr.perf + perfHit));
    if (sh.tactics) {
      if (!mgr.baseTactics) mgr.baseTactics = { ...match.teams[mgr.side].tactics };
      for (const [k, v] of Object.entries(sh.tactics)) match.setTactic(mgr.side, k, v);
      mgr.shoutT = 14;
    }
    if (sh.stamina) for (const p of match.teams[mgr.side].players) p.stamina = Math.max(0.05, p.stamina - sh.stamina);
    sayShout(sh.line);
    mgr.fig.pose = 'shout'; mgr.fig.poseT = 1.6;
    mgr.coolT = SHOUT_COOLDOWN;
    mgr.lockT = 5;
    mgr.wheelT = 5;                                  // fresh options soon after a pick
    wheelEl.classList.add('cooling');
    sfx('whistle', 0);
  };
  wheelEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-shout]');
    if (b && mgr && !paused && !ended) applyShout(b.dataset.shout);
  });

  /* Half-time talk: four options, once, and the players hear it in the second
   * half through the same two meters everything else moves. */
  const talkEl = root.querySelector('#mgrTalk');
  const TALKS = [
    ['enc',    'ENCOURAGE',   '“We are doing well. Keep going.”',      { mood: +0.10, perf: +0.03 }],
    ['demand', 'DEMAND MORE', '“We need to do better than this.”',     { mood: -0.05, perf: +0.10 }],
    ['calm',   'CALM DOWN',   '“Stay focused. Play our game.”',        { mood: +0.05, perf: +0.05 }],
    ['rage',   'HAIRDRYER',   '“This is not good enough. Nowhere near.”', { mood: -0.12, perf: +0.15 }],
  ];
  const showTalk = () => {
    const [h, a] = match.teams;
    talkEl.innerHTML = `
      <div class="mt-card glass">
        <span class="mt-kicker">Half time · ${h.score}–${a.score}</span>
        <h3>The dressing-room huddle is yours</h3>
        <div class="mt-opts">
          ${TALKS.map(([id, label, line]) => `
            <button class="mt-opt" data-talk="${id}"><b>${label}</b><span>${line}</span></button>`).join('')}
        </div>
      </div>`;
    talkEl.hidden = false;
    // the huddle: my XI gathers around the manager while the talk is open
    const f = mgr.fig;
    match.teams[mgr.side].players.forEach((p, i) => {
      const ang = (i / 11) * Math.PI * 2;
      p.x = f.x + Math.cos(ang) * 3.2; p.y = Math.max(1.4, f.y + 4 + Math.sin(ang) * 2.4);
      p.vx = p.vy = 0; p.dirX = f.x - p.x; p.dirY = (f.y + 4) - p.y;
    });
  };
  talkEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-talk]');
    if (!b) return;
    const t = TALKS.find(([id]) => id === b.dataset.talk);
    const pers = squadTemper();
    const mood = t[3].mood < 0 ? t[3].mood * (0.6 + pers.temper) : t[3].mood;
    mgr.morale = Math.max(0.05, Math.min(1, mgr.morale + mood));
    mgr.perf = Math.max(0.1, Math.min(1, mgr.perf + t[3].perf * (t[3].mood < 0 ? 0.7 + pers.spark * 0.6 : 1)));
    mgr.talkDone = true;
    talkEl.hidden = true;
    setPaused(false);
  });

  root.querySelector('#mgrCam')?.addEventListener('click', () => {
    camMode = camMode === 'broadcast' ? 'manager' : 'broadcast';
    toast(camMode === 'manager' ? 'Manager cam — the touchline view' : 'Broadcast cam', 'info');
  });

  /** Per-frame manager update: meters drift, wheel rotates, figure moves. */
  const tickManager = (dt) => {
    if (!mgr || ended) return;
    // performance is pulled between morale and the run of play, never pinned
    const pull = 0.35 + mgr.morale * 0.3 + mgr.momentum * 0.2;
    mgr.perf += (pull - mgr.perf) * dt * 0.05;
    mgr.momentum *= 1 - dt * 0.04;
    match.mgrPerf = mgr.perf;

    if (mgr.lockT > 0) mgr.lockT -= dt;
    if (mgr.coolT > 0) {
      mgr.coolT -= dt;
      const hub = wheelEl.querySelector('.mw-hub');
      if (hub) hub.textContent = mgr.coolT > 0 ? Math.ceil(mgr.coolT) : 'SHOUT';
      if (mgr.coolT <= 0) { wheelEl.classList.remove('cooling'); rotateWheel(); }
    }
    mgr.wheelT -= dt;
    if (mgr.wheelT <= 0 && mgr.lockT <= 0 && mgr.coolT <= 0) rotateWheel();

    if (mgr.shoutT > 0) {
      mgr.shoutT -= dt;
      if (mgr.shoutT <= 0 && mgr.baseTactics) {
        for (const [k, v] of Object.entries(mgr.baseTactics)) match.setTactic(mgr.side, k, v);
        mgr.baseTactics = null;
      }
    }

    /* The figure is YOURS to walk. Left stick / arrow keys / the on-screen
     * arrows move him along the technical area; nobody autopilots him. Facing
     * is strict: travel direction while walking, the pitch while standing —
     * the manager never has a reason to look into the lens. */
    const f = mgr.fig;
    const half = PITCH.w / 2;
    const lo = mgr.side === 0 ? half - 17 : half + 1;
    const ax = Math.max(-1, Math.min(1, (paused ? 0 : (input?.axis().x || 0)) + walkTouch));
    if (Math.abs(ax) > 0.2) {
      f.x = Math.max(lo, Math.min(lo + 16, f.x + ax * dt * 3.4));
      f.walk += dt * 6;
      f.dirX = Math.sign(ax);
      f.dirY = 0;
    } else {
      f.walk = 0;
      f.dirX = 0;
      f.dirY = 1;                          // face the football, always
    }
    if (f.poseT > 0) { f.poseT -= dt; if (f.poseT <= 0) f.pose = 'idle'; }

    // meters into the HUD, colour shifting with the number
    const mB = root.querySelector('#mmMorale'); const pB = root.querySelector('#mmPerf');
    const mV = Math.round(mgr.morale * 100); const pV = Math.round(mgr.perf * 100);
    mB.style.width = `${mV}%`; pB.style.width = `${pV}%`;
    mB.className = mV < 35 ? 'low' : mV > 70 ? 'high' : '';
    pB.className = pV < 35 ? 'low' : pV > 70 ? 'high' : '';
    root.querySelector('#mmMoraleV').textContent = mV;
    root.querySelector('#mmPerfV').textContent = pV;
  };

  /** Career reactions to match events, fed from the cue stream. */
  const mgrCue = (name) => {
    if (!mgr) return;
    if (name === 'goal') {
      const mine = match.goalTeam === mgr.side;
      if (mine) { mgr.fig.pose = 'celebrate'; mgr.fig.poseT = 4; mgr.morale = Math.min(1, mgr.morale + 0.08); mgr.momentum = Math.min(1, mgr.momentum + 0.5); }
      else { mgr.fig.pose = 'slump'; mgr.fig.poseT = 4; mgr.morale = Math.max(0.05, mgr.morale - 0.08); concededAt = match.t; rotateWheel(); }
    }
    if (name === 'save' || name === 'post') { mgr.fig.pose = 'head'; mgr.fig.poseT = 2.2; }
    if (name === 'whistle') { mgr.fig.pose = 'idle'; }
  };

  /** The manager camera: over the shoulder on the touchline, pitch readable. */
  const tickCamera = (dt) => {
    const wantBlend = careerCtx && camMode === 'manager' ? 1 : 0;
    camBlend += (wantBlend - camBlend) * Math.min(1, dt * 2.2);
    if (!careerCtx || camBlend < 0.003) { camBlend = wantBlend ? camBlend : 0; return; }
    /* Third person means the manager is IN the shot: camera over his right
     * shoulder, low, him in the lower third and the pitch opening up beyond —
     * not a first-person view from where he stands. */
    const f = mgr.fig;
    mgrCamera.x = f.x - 1.6;
    mgrCamera.y = f.y - 5.4;
    mgrCamera.z = 2.8;
    mgrCamera.tx = f.x + 0.6;
    mgrCamera.ty = f.y + 16;
    mgrCamera.tz = 0.8;
    mgrCamera.hfov = 55;
    const k = camBlend;
    for (const key of ['x', 'y', 'z', 'tx', 'ty', 'tz', 'hfov']) {
      cam[key] = cam[key] * (1 - k) + mgrCamera[key] * k;
    }
  };

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
    gl = createRenderer(canvas, match, quality, useModels);
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
    const dpr = Math.min(quality === 'min' ? 1 : quality === 'low' ? 1.25 : 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  /* ---------------------------- loading screen ----------------------------
   *
   * Two jobs, and the second is the real one.
   *
   * The obvious job is to look like a game rather than dumping you onto a pitch
   * the instant the screen changes. The important job is that a match used to
   * start on the built-in figures and swap to the scanned players when the
   * 14 MB model finished downloading — so the opening seconds looked cheap and
   * then abruptly did not. Waiting on `gl.ready` means the picture you kick off
   * with is the picture you keep.
   *
   * The clock and the assets are both floors, not deadlines: the screen stays up
   * until the randomised 5-7 s has passed *and* the renderer says it is done.
   * `LOAD_CEILING` is the escape hatch, because a model that never arrives must
   * not be able to lock someone out of their own match.
   */
  /* Offline the wait is deliberate and the match is held still behind it.
   * Online it is not: the rule everywhere else in this file is that an online
   * match cannot be frozen because the other player is still out there, and a
   * six-second stall on one machine only is a desync with a nice animation on
   * top. So online keeps the veil — the model pop is worth hiding either way —
   * but only for as long as the assets genuinely take. */
  const LOAD_MS = online ? 0 : 5000 + Math.random() * 2000;
  const LOAD_CEILING = 22000;
  const loadEl = root.querySelector('#gmLoad');
  const loadFill = root.querySelector('#gmLoadFill');
  const loadText = root.querySelector('#gmLoadText');
  let loading = true;
  const loadStart = performance.now();
  let assetsReady = !gl;                    // the canvas-2D path has nothing to wait for
  gl?.ready.then(() => { assetsReady = true; });

  const lines = LOADING_LINES.slice().sort(() => Math.random() - 0.5);
  let lineIdx = 0;
  loadText.textContent = lines[0];
  const lineTimer = setInterval(() => {
    lineIdx = (lineIdx + 1) % lines.length;
    loadText.textContent = lines[lineIdx];
  }, 700 + Math.random() * 500);

  /** @returns {boolean} true once the veil has been lifted */
  function tickLoading(now) {
    const elapsed = now - loadStart;
    // Creeps towards 96% on the clock and only completes when the assets are
    // in, so a long download reads as "nearly there" rather than as a hang.
    const clock = Math.min(1, elapsed / LOAD_MS);
    const pct = assetsReady ? Math.max(clock, 0.96) : clock * 0.96;
    loadFill.style.width = `${(pct * 100).toFixed(1)}%`;
    if (elapsed < LOAD_MS) return false;
    if (!assetsReady && elapsed < LOAD_CEILING) return false;

    loading = false;
    clearInterval(lineTimer);
    loadFill.style.width = '100%';
    loadEl.classList.add('done');
    setTimeout(() => { loadEl.hidden = true; }, 420);
    // the clock restarts here, or the match opens having "missed" the wait
    last = performance.now();
    return true;
  }

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
  /* Career: the manager holds no stick, so the entire player touch layer —
   * stick zone, action buttons, contextual labels — must not exist. The wheel
   * and the walk arrows are the whole touch surface of a career match. */
  if (window.matchMedia('(pointer: coarse)').matches && mode !== 'career') {
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
    /* One tackle button, not two. There used to be a TACKLE slot and a
     * separately-bound SLIDE slot for the same underlying action with a boolean
     * flipped — indistinguishable to press and, on sim.js's side, not much more
     * distinguishable to feel either. sim.js now has one committed tackle, so
     * there is one button for it: the shoot slot sits out while defending,
     * which also hands its space back to the pad, letting TACKLE grow.
     *
     * Still bound to the plain 'pass' action rather than a new one — sim.js's
     * off-ball branch already treats pass/through/cross/shoot as interchangeable
     * tackle triggers, which is what keyboard and pad already ride on, so touch
     * takes the same path rather than a parallel one that could drift from it. */
    const DEFENDING = {
      pass: ['pass', 'TACKLE'], through: ['switch', 'SWITCH'], cross: [null, ''],
      shoot: [null, ''], sprint: ['sprint', 'SPRINT'],
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

    const charge = root.querySelector('.t-shoot .tb-charge');
    const passCharge = root.querySelector('.t-pass .tb-charge');
    let attacking = null;
    updateTouchContext = () => {
      /* Your seat, not seat zero. Online both machines build the same two-seat
       * match — controllers[0] is the host's, controllers[1] the guest's — so
       * hardcoding [0] read the *opponent's* seat on a guest. Every label came
       * out inverted (PASS/SHOOT while defending, TACKLE while on the ball) and
       * the charge rings below filled with the host's power, not yours. Same
       * expression the input loop and the scoreboard already use. */
      const seat = match.controllers[online ? online.seat : 0];
      const mine = !!match.ball.owner && seat && match.ball.owner.team === seat.team;
      if (mine !== attacking) {
        attacking = mine;
        for (const b of buttons) b.set(mine ? IN_POSSESSION : DEFENDING);
      }
      // the shot charges while held, so the button shows how much power is on it
      if (charge) charge.style.setProperty('--charge', `${Math.round((seat?.charge || 0) * 100)}%`);
      // the pass button fills the same way, so a held pass is visibly a held pass
      if (passCharge) {
        passCharge.style.setProperty('--charge', `${Math.round((seat?.passCharge || 0) * 100)}%`);
      }
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
  /* --------------------------------- fps -------------------------------- *
   * Two readings off the same counter. The badge is a short average, because a
   * number that changes sixty times a second is unreadable; the match average
   * is the whole game, and it is what the post-match prompt argues from — one
   * bad second while the model streams in should not decide anything.        */
  const fpsEl = root.querySelector('#gmFps');
  const showFps = !!getState().settings.showFps;
  fpsEl.hidden = !showFps;
  let fpsFrames = 0;
  let fpsSince = performance.now();
  let matchFrames = 0;
  let matchSeconds = 0;

  /* ---------------------- the black-frame detector ----------------------- *
   * Six fixes have now shipped on six theories and the flash is still there,
   * so the job is not a seventh theory, it is to make the thing catchable. It
   * lasts a split second and repeats, which is why it never survives a
   * screenshot — a person cannot press the key inside one frame.
   *
   * Every counter below is one three already maintains, so watching them is
   * free. No `readPixels`: that stalls the pipeline every frame to answer a
   * question these can answer for nothing.
   *
   * Three different faults produce a one-frame black area, and each leaves a
   * different fingerprint. Counting them separately is what makes the next
   * report conclusive instead of another round of guessing:
   *
   * - **draw** — the frame issued almost no draw calls, so we did not draw it.
   * - **prog** — a shader program was compiled *during* play. three builds a
   *   material's program the first time it is actually drawn, and the object
   *   can render black for the frame or two that takes. `warmUp()` exists to
   *   do all of it behind the loading screen; if this counter moves after
   *   kick-off then warmUp missed a material, and this is the original
   *   compilation theory finally being measured rather than assumed.
   * - **tex** — a texture or geometry was uploaded during play. An object
   *   whose texture is not resident yet draws black, and a texture is a
   *   rectangle, which is the shape being reported.
   *
   * A silent detector is itself a result: it means the frame was drawn, in
   * full, with nothing newly compiled or uploaded, and the fault is in what
   * the shading produced or in what the browser did with the finished frame. */
  let drawMedian = 0;
  let blackish = 0;
  let progHits = 0;
  let texHits = 0;
  let lastProg = -1;
  let lastTex = -1;
  const checkDrawCall = () => {
    const info = gl?.info;
    const calls = info?.render?.calls;
    if (!calls && calls !== 0) return;

    const progs = info.programs?.length ?? -1;
    const tex = (info.memory?.textures ?? 0) + (info.memory?.geometries ?? 0);

    // Only judge a frame once there is a normal to judge it against, and only
    // while the match is actually playing — the loading veil and the end card
    // legitimately draw almost nothing, and everything is still arriving.
    if (match.phase !== 'play' || loading) {
      if (calls > 0) drawMedian = drawMedian || calls;
      lastProg = progs; lastTex = tex;
      return;
    }
    if (!drawMedian) { drawMedian = calls; lastProg = progs; lastTex = tex; return; }

    if (calls < drawMedian * 0.35) {
      blackish += 1;
      console.warn('[apexxi] suspect DRAW frame: %d calls (normal ~%d) at %ds',
        calls, Math.round(drawMedian), Math.round(match.t));
    }
    if (lastProg >= 0 && progs > lastProg) {
      progHits += 1;
      console.warn('[apexxi] shader compiled mid-match: %d -> %d programs at %ds — warmUp missed one',
        lastProg, progs, Math.round(match.t));
    }
    if (lastTex >= 0 && tex > lastTex) {
      texHits += 1;
      console.warn('[apexxi] upload mid-match: %d -> %d textures+geometries at %ds',
        lastTex, tex, Math.round(match.t));
    }
    lastProg = progs;
    lastTex = tex;
    // slow-follow the normal so a quality change or a substitution does not
    // permanently poison the baseline
    drawMedian += (calls - drawMedian) * 0.02;
  };

  const countFrame = (now, dt) => {
    // stalls (tab hidden, a long GC) are not frame rate, and would poison an average
    if (dt > 0 && dt < 0.5) { matchFrames += 1; matchSeconds += dt; }
    fpsFrames += 1;
    checkDrawCall();
    const span = now - fpsSince;
    if (span < 500) return;
    if (showFps) {
      // Each counter names its own fault, so one photo of the badge says which
      // of the three it is — see the note on the detector above.
      fpsEl.textContent = `${Math.round((fpsFrames * 1000) / span)} FPS`
        + (blackish ? ` · ${blackish} draw` : '')
        + (progHits ? ` · ${progHits} prog` : '')
        + (texHits ? ` · ${texHits} tex` : '');
    }
    fpsFrames = 0;
    fpsSince = now;
  };
  const matchFps = () => (matchSeconds > 0 ? matchFrames / matchSeconds : 0);

  /* ------------------------------- stamina ------------------------------ *
   * Shows the man under your thumb, whoever that currently is. Online it is
   * the seat this machine holds; a guest reads it off the snapshot rather than
   * simulating it, same as everything else it draws.                        */
  const stamEl = root.querySelector('#gmStam');
  const stamWho = root.querySelector('#gmStamWho');
  const stamFill = root.querySelector('#gmStamFill');
  let stamShown = -1;
  let stamName = '';
  const updateStamina = () => {
    const seat = match.controllers[online ? online.seat : 0];
    const p = match.playerOf(seat);
    if (!p) { stamEl.hidden = true; return; }
    stamEl.hidden = false;
    const name = p.ref?.short || p.ref?.name || '';
    if (name !== stamName) { stamName = name; stamWho.textContent = name; }
    // whole percent only: this runs every frame and the DOM does not need
    // to be touched sixty times a second for a bar two hundred pixels wide
    const pct = Math.round((p.stamina ?? 1) * 100);
    if (pct === stamShown) return;
    stamShown = pct;
    stamFill.style.width = `${pct}%`;
    stamEl.classList.toggle('low', pct <= 45);
    stamEl.classList.toggle('spent', pct <= 20);
  };

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
    const raw = (now - last) / 1000;
    const dt = Math.min(0.034, raw);
    last = now;
    // Frames drawn behind the loading veil are not match frames: nothing is
    // simulated and half of them are spent compiling shaders, so counting them
    // would skew the average the end-of-match graphics prompt is judged on.
    if (!loading) countFrame(now, raw);
    updateStamina();
    for (const inp of inputs) inp.poll(dt);
    updateTouchContext();
    if (loading) tickLoading(now);
    /* When is the world actually stopped?
     * Offline: whenever the menu is up — the sim belongs to this machine.
     * Online: only during the synchronized pause, which the host declares and
     * the guest reads back out of snapshots. The local menu on its own never
     * stops an online match (the other player is still out there). */
    const syncActive = online ? (online.host ? syncLeft > 0 : guestSynced) : false;
    const frozen = ((paused || loading) && !online) || syncActive;
    sender?.tick(dt);

    if (input.pressed('pause') && !ended && !loading) {
      if (careerCtx && halfTime && !talkEl.hidden) { /* the talk is modal */ }
      else if (!online) setPaused(!paused);
      else if (!syncActive) {
        /* Every pause input — Options on either pad, Esc, the HUD button (it
         * synthesizes this press) — queues the shared pause AND opens the local
         * non-blocking menu, which keeps subs and tactics reachable mid-play
         * exactly as before. During the synced pause the menu is pinned open:
         * the input neither closes it nor queues anything new. */
        if (online.host) requestPause(online.myName);
        else net.send({ t: 'evt', k: 'pausereq', name: online.myName });
        setPaused(!paused);
      }
    }

    // pad / keyboard navigation of the pause menu
    if (paused && !ended && !loading) {
      const ay = input.axis().y;
      if (ay < -0.5 && !navHeld) { navIdx = (navIdx + PAUSE_ITEMS.length - 1) % PAUSE_ITEMS.length; paintPause(); }
      if (ay > 0.5 && !navHeld) { navIdx = (navIdx + 1) % PAUSE_ITEMS.length; paintPause(); }
      navHeld = Math.abs(ay) > 0.5;
      if (input.pressed('pass')) activate(PAUSE_ITEMS[navIdx].id);
      if (input.pressed('shoot') && !syncActive) setPaused(false);
    } else {
      navHeld = false;
    }

    /* The reel runs only while the world is genuinely stopped for this client:
     * any offline pause, or the synchronized online pause. The online menu
     * open over *live* play needs no reel — the match itself is the moving
     * background there. */
    const wantReel = paused && !replay && !ended && !loading && (!online || syncActive);
    if (wantReel && !reel) startReel();
    if (!wantReel && reel) endReel();
    if (reel) {
      reel.drift += dt;
      if (reel.frames) {
        applyFrame(reel.frames[Math.floor(reel.i)]);
        reel.i += dt * 54;                                  // just under real speed
        if (reel.i >= reel.frames.length) reel.i = 0;       // and around again
      }
      // slow pitchside dolly around wherever the ball is
      const b = match.ball;
      const w = Math.sin(reel.drift * 0.24);
      reel.cam.x = Math.max(14, Math.min(PITCH.w - 14, b.x + w * 9));
      reel.cam.y = -24 + Math.cos(reel.drift * 0.19) * 3;
      reel.cam.z = 11 + Math.sin(reel.drift * 0.16) * 3;
      reel.cam.tx = b.x; reel.cam.ty = Math.min(34, b.y * 0.8 + 6); reel.cam.tz = 1;
      reel.cam.hfov = 40;
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
    }

    /* Host: rule on the queued pause. A dead ball is the sim's stoppage
     * ledger ticking (throw-in, corner, goal kick, goal) or the phase already
     * being a set piece; the one moment excluded is the goal celebration,
     * because the replay owns both screens there — the kickoff that follows it
     * converts the queue instead. `waitT` is the anti-stuck valve. */
    if (online?.host && !ended && !loading) {
      if (pq && syncLeft <= 0) {
        pq.waitT += dt;
        const deadBall = match.stoppages !== lastStoppages
          || match.phase === 'corner' || match.phase === 'half' || match.phase === 'penalty';
        if ((deadBall || pq.waitT > PAUSE_FORCE) && match.phase !== 'goal') {
          syncLeft = PAUSE_HOLD;
          /* One snapshot, taken at the whistle, is what the guest sees for the
           * whole pause (with a live countdown riding on it). The sim is
           * frozen but the *scene* is not — the reel plays old footage through
           * the same objects — and encoding that would ship the reel to the
           * guest's buffer and glitch the first second after resume. */
          pauseSnap = encodeSnapshot(match);
          showQueueBanner(null);
          sfx('whistle');
          if (!paused) setPaused(true);
          paintPause();
        }
      }
      if (syncLeft > 0) {
        syncLeft -= dt;
        const secs = Math.ceil(syncLeft);
        if (paused && secs !== lastTickSec) { lastTickSec = secs; paintPause(); }
        if (syncLeft <= 0) {
          syncLeft = 0;
          pq = null;
          pauseSnap = null;
          endReel();               // restore live state before the sim steps again
          setPaused(false);
          sfx('whistle');
        }
      }
      lastStoppages = match.stoppages;
    }

    /* `!replay` restores what the old `else if` chain provided: the host's sim
     * does not advance while its own goal replay plays. */
    if (!replay && !frozen && !ended) {
      if (view) {
        // guest: the world arrives over the wire rather than being computed
        view.update(dt);
      } else {
        match.update(dt, inputs);
      }
      updateCamera(cam, match, dt);
      tickManager(dt);
      tickCamera(dt);
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
        mgrCue(c.name);
        if (online?.host) outgoing.push([c.name, c.arg ?? 0]);
      }

      if (online?.host) pendingCues.push(...outgoing);
      // crowd lifts as play nears either goal, and roars through a celebration
      const near = Math.min(match.ball.x, PITCH.w - match.ball.x) / (PITCH.w / 2);
      setCrowd(match.phase === 'goal' ? 1 : 0.3 + (1 - near) * 0.5);
    }

    /* Host: ship the world at 30 Hz. Outside the step block on purpose — the
     * synced pause freezes the sim but the stream must keep flowing, because
     * the snapshots are what carry the countdown (and its ending) to the
     * guest. The pause fields ride on the snapshot rather than being their own
     * message so they can never race the world state they describe. */
    if (online?.host && !ended && !replay) {
      snapAcc += dt;
      if (snapAcc >= SNAP_MS / 1000) {
        snapAcc = 0;
        const snap = (syncLeft > 0 && pauseSnap)
          ? { ...pauseSnap, ts: performance.now() }
          : encodeSnapshot(match);
        if (pendingCues.length) { snap.cu = pendingCues.slice(0, 12); pendingCues.length = 0; }
        if (pq && syncLeft <= 0) snap.pq = pq.name;
        if (syncLeft > 0) snap.pz = [pq ? pq.name : '', Math.ceil(syncLeft * 10)];
        sendMatch(snap);
      }
    }

    const rdt = frozen && !reel ? 0 : dt;
    const shot = replay ? replay.cam : reel ? reel.cam : cam;
    if (gl) gl.render(match, shot, rdt);
    else draw(ctx, match, shot, vw, vh, quality, rdt, { hideBanner: paused || loading });

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
    }

    /* Half time is a break, not a jump cut.
     *
     * The sim gives the phase 1.8 seconds and then teleports everyone back to
     * their starting spots, which from the pitch looked like the game had
     * glitched. Pausing here holds `phaseT` where it is — the frozen branch
     * above never calls `match.update` — so nothing moves until the whistle is
     * asked for, and the interval is long enough to actually be worth something:
     * it opens on substitutions, because a spent full-back at 45 minutes is
     * exactly the decision a half-time break exists for.
     *
     * Online is excluded for the same reason pausing is: the other player's
     * clock keeps running whatever this one does. */
    if (match.phase === 'half' && lastPhase !== 'half' && !online && !ended) {
      if (careerCtx) {
        /* The interval belongs to the team talk. The sim freezes exactly as an
         * ordinary pause; the huddle is drawn by moving the XI, which the
         * second-half position reset undoes the moment play resumes. */
        halfTime = true;
        setPaused(true);
        overlay.hidden = true; overlay.innerHTML = '';   // the talk replaces the menu
        showTalk();
      } else {
        halfTime = true;
        section = 'subs';
        navIdx = PAUSE_ITEMS.findIndex((it) => it.id === 'subs');
        setPaused(true);
      }
    }

    if (match.phase !== 'goal' && lastPhase === 'goal') {
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
      const q = qualityLabel(peerRtt ?? rtt);
      // the host stops broadcasting while it plays its own replay, so a stale
      // stream during one is expected rather than a connection problem
      const lost = view?.stale && !replay;
      // '· direct' = this match is running browser-to-browser, not through the relay
      netEl.textContent = lost ? 'reconnecting…' : `${online.oppName} · ${q.text}${p2pActive() ? ' · direct' : ''}`;
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
    { id: 'subs', label: 'Substitutions' },
    { id: 'facts', label: 'Match Facts' },
    { id: 'controls', label: 'Controls' },
    { id: 'leave', label: 'Leave Match' },
  ];
  let navIdx = 1;
  let section = 'team';
  let subFrom = null;      // the shirt selected to come off, if any
  let halfTime = false;    // the pause menu is standing in for the interval
  let shootoutResult = null;

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
    const team = match.teams[online ? online.seat : (match.human ?? mgr?.side ?? 0)];
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
    /* ------------------------------ subs ------------------------------ *
     * Two columns, tap one then the other. Deliberately not drag-and-drop:
     * this is a pause menu that on a phone is being operated with a thumb, and
     * online it does not pause anything, so the fewer gestures between opening
     * it and the change taking effect the better.                            */
    if (id === 'subs') {
      const bench = team.bench || [];
      const gkOnly = subFrom !== null && team.players[subFrom]?.role === 'GK';
      return `
        <h3>Substitutions <small>${team.subsLeft} left</small></h3>
        ${team.subsLeft <= 0 ? '<p class="p-note">No substitutions remaining.</p>' : ''}
        <div class="sub-cols">
          <div class="sub-col">
            <span class="sub-head">On the pitch</span>
            ${team.players.map((p, i) => `
              <button class="sub-row ${subFrom === i ? 'on' : ''}"
                      data-suboff="${i}" ${team.subsLeft <= 0 ? 'disabled' : ''}>
                <b>${p.ref.overall}</b>
                <span class="sub-name">${p.ref.short}</span>
                <em>${p.role}</em>
                <i class="sub-stam ${p.stamina < 0.45 ? 'low' : ''}"
                   style="--s:${Math.round((p.stamina ?? 1) * 100)}%"></i>
              </button>`).join('')}
          </div>
          <div class="sub-col">
            <span class="sub-head">Bench</span>
            ${bench.length ? bench.map((r, i) => {
              // a keeper may only be replaced by a keeper, so the rest grey out
              const ok = !gkOnly || r.position === 'GK';
              return `
                <button class="sub-row ${ok ? '' : 'is-off'}" data-subon="${i}"
                        ${subFrom === null || !ok || team.subsLeft <= 0 ? 'disabled' : ''}>
                  <b>${r.overall}</b>
                  <span class="sub-name">${r.short}</span>
                  <em>${r.position}</em>
                </button>`;
            }).join('') : '<p class="p-note">Nobody named on the bench.</p>'}
          </div>
        </div>
        <p class="p-note">${subFrom === null
          ? 'Pick the player coming off, then who replaces him. The bar is how much he has left.'
          : 'Now pick his replacement.'}</p>`;
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
          ${[['✕', 'Pass'], ['◯', 'Shoot — hold for power'], ['◯+R1', 'Curl it up'],
             ['□', 'Cross'], ['△', 'Through ball'], ['✕ / □ / △ / ◯', 'Tackle, off the ball'],
             ['L1/R1', 'Switch to nearest'], ['R2', 'Sprint'], ['Options', 'Pause']]
            .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
        </div>`;
    }
    return '';
  };

  function paintPause() {
    const home = sideOf(params, 'home');
    overlay.innerHTML = `
      <div class="pause ${halfTime ? 'is-half' : ''}">
        ${halfTime ? `
          <div class="half-head">
            <span class="half-word">HALF TIME</span>
            <span class="half-score">
              ${match.teams[0].short} ${match.teams[0].score} – ${match.teams[1].score} ${match.teams[1].short}
            </span>
            <span class="half-note">Make your changes, then kick off the second half.</span>
          </div>` : `
          <div class="pause-head">
            ${crestSVG(home.crest, home.short, 26)}
            <span>${online ? `Online · vs ${online.oppName}` : 'Quick Match'}</span>
          </div>`}
        ${(() => {
          if (!online) return '';
          const syncNow = online.host ? syncLeft > 0 : guestSynced;
          if (!syncNow) return '<p class="pause-live">The match is still running — this menu does not pause it.</p>';
          const secs = Math.max(0, Math.ceil(online.host ? syncLeft : ((guestPz?.[1] || 0) / 10)));
          return `<p class="pause-sync"><b>${secs}</b> Match paused for both players — kicks off again automatically</p>`;
        })()}
        <nav class="pause-nav">
          ${PAUSE_ITEMS.map((it, i) => `
            <button class="pause-item ${i === navIdx ? 'on' : ''} ${it.id === section ? 'open' : ''}"
                    data-nav="${i}">${it.id === 'resume'
                      ? (halfTime ? 'Start Second Half'
                        : (online && (online.host ? syncLeft > 0 : guestSynced)) ? 'Resuming soon…' : it.label)
                      : it.label}</button>`).join('')}
        </nav>
        <div class="pause-panel">${panelFor(section)}</div>
        <div class="pause-hints"><b>✕</b> Select <b>◯</b> Resume</div>
      </div>`;
  }

  function activate(id) {
    const syncNow = online ? (online.host ? syncLeft > 0 : guestSynced) : false;
    if (id === 'resume') { if (!syncNow) setPaused(false); return; }
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
    if (!v) {
      // resuming out of the interval is the second-half whistle
      if (halfTime) { halfTime = false; sfx('whistle'); }
      overlay.hidden = true; overlay.innerHTML = '';
      return;
    }
    overlay.hidden = false;
    navIdx = Math.max(1, navIdx);
    paintPause();
  }

  /* ----------------------- the one-time graphics ask ---------------------- *
   * The game ships on Ultra with scanned players, which is the right default —
   * but on a phone that may be twenty frames a second, and a player who has
   * never seen the settings screen would just conclude the game is broken.
   * So the first full match, and only ever the first, ends by asking.
   *
   * It is asked once whatever the answer is: nagging after every match would be
   * worse than the stutter. Nothing to lower means nothing to ask.            */
  function graphicsPrompt() {
    const s = getState().settings;
    if (s.graphicsAsked) return '';
    if (s.models === 'simple' && s.quality !== 'ultra' && s.quality !== 'high') return '';
    const fps = Math.round(matchFps());
    // too short to have measured anything — leave the question for a real match
    if (matchSeconds < 20) return '';
    update((st) => { st.settings.graphicsAsked = true; });
    const rough = fps > 0 && fps < 45;
    return `
      <div class="gfx-ask ${rough ? 'rough' : ''}">
        <span class="ga-kicker">Graphics</span>
        <p>${rough
          ? `That match ran at about <b>${fps} FPS</b>. Lower settings would make it smoother — the players get simpler, everything else stays.`
          : `That match ran at about <b>${fps} FPS</b>, so your device is handling the full detail. Keep it, or trade some of the look for headroom.`}</p>
        <div class="ga-btns">
          <button class="btn ${rough ? 'primary' : 'ghost'}" data-o="gfxLower">Lower them</button>
          <button class="btn ${rough ? 'ghost' : 'primary'}" data-o="gfxKeep">Keep them</button>
        </div>
        <em>Either way, this is in Settings → Look from now on.</em>
      </div>`;
  }

  /**
   * A drawn Kick Off can go to penalties. Only a Kick Off: the Apex Division
   * already accepts a draw and settles the ladder on it, and an online shootout
   * would need a second authoritative state machine on the wire for a result
   * that is already agreed.
   */
  function offerShootout() {
    const [h, a] = match.teams;
    const squadOf = (t) => ({
      name: t.name,
      short: t.short,
      xi: t.players.map((p) => p.ref),
      keeper: (t.players.find((p) => p.role === 'GK') || t.players[0]).ref,
    });
    overlay.innerHTML = '<div class="gm-panel glass"></div>';
    runShootout(overlay.querySelector('.gm-panel'), {
      home: squadOf(h), away: squadOf(a), youAre: match.human ?? 0,
    }).then(({ winner, home, away }) => {
      // The shootout does not touch the scoreline — a 2-2 is still a 2-2, which
      // is how football records it — so it pays out on its own.
      const won = winner === (match.human ?? 0);
      update((st) => { st.club.apex += won ? 400 : 150; });
      refreshCoins();
      shootoutResult = { winner, home, away, won };
      finish();
    });
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
    // offered once: after the shootout there is nothing left to settle
    const drawnKickOff = mine === theirs && !online && !params.ultimate && !shootoutResult;

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
        // possession is reported home-first, and "mine" depends on the seat
        possession: online && online.seat === 1 ? pa : ph,
      });
    } else if (mode === 'career') {
      /* The result flows into the career: my score home-first, the rest of the
       * round simulated, the table and the calendar moved on. Morale carries
       * out of the match — advanceWeek folds the result on top of it. */
      update((s) => { if (s.career) s.career.morale = mgr ? mgr.morale : s.career.morale; });
      advanceWeek([h.score, a.score]);
    } else {
      // a friendly is pocket money next to a division match
      update((s) => { s.club.apex += 200 + (online ? mine : h.score) * 60; });
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
        ${shootoutResult ? `
          <div class="so-result ${shootoutResult.won ? 'won' : 'lost'}">
            <span>${shootoutResult.won ? 'Won' : 'Lost'} on penalties</span>
            <b>${shootoutResult.home} – ${shootoutResult.away}</b>
          </div>` : ''}
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
            <span class="dr-reward">◈ ${div.apex.toLocaleString()}${div.packs.length ? ` · ${div.packs.length} pack${div.packs.length > 1 ? 's' : ''}` : ''}</span>
            <span class="dr-why">${div.possession}% of the ball</span>
            <span class="dr-ladder">${
              div.promoted || div.relegated
                ? 'The ladder resets from here.'
                : div.progress <= 0
                  ? 'One more defeat and you drop a division.'
                  : `${div.progress}/${div.need} wins toward promotion`
            }</span>
            ${div.objectivesDone.length
              ? `<ul class="dr-objs">${div.objectivesDone.map((t) => `<li>✓ ${t}</li>`).join('')}</ul>`
              : ''}
          </div>` : ''}
        ${mgr ? `
          <div class="gm-stats mgr-ft">
            <div><b>${Math.round(mgr.morale * 100)}</b><span>Team morale</span><b>${Math.round(mgr.perf * 100)}</b></div>
            <div><span class="mgr-ft-note">Performance — where the touchline left them</span></div>
          </div>` : ''}
        ${graphicsPrompt()}
        ${drawnKickOff && mode !== 'career' ? `
          <button class="btn ghost so-offer" data-o="pens">Settle it on penalties</button>` : ''}
        <div class="gm-btns">
          ${mode === 'career'
            ? '<button class="btn primary" data-o="career">Continue the season</button>'
            : online
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
      if (o === 'gfxLower' || o === 'gfxKeep') {
        if (o === 'gfxLower') {
          // one step down on both axes: the light figures, and detail left to
          // the device rather than pinned to the top
          update((s) => { s.settings.models = 'simple'; s.settings.quality = 'auto'; });
          toast('Graphics lowered — takes effect next match');
        } else {
          toast('Keeping full detail');
        }
        e.target.closest('.gfx-ask')?.remove();
        return;
      }
      if (o === 'pens') { offerShootout(); return; }
      if (o === 'resume') setPaused(false);
      if (o === 'quit') { exitFullscreen(); navigate(online || params.ultimate ? 'squad' : 'quick'); }
      if (o === 'uxi') { exitFullscreen(); navigate('squad'); }
      if (o === 'career') { navigate('career'); return; }
      if (o === 'again') navigate('play', params);
      return;
    }

    const nav = e.target.closest('[data-nav]');
    if (nav) { navIdx = +nav.dataset.nav; activate(PAUSE_ITEMS[navIdx].id); return; }

    const form = e.target.closest('[data-form]');
    if (form) { setShape('formation', form.dataset.form); paintPause(); return; }

    const tac = e.target.closest('[data-tactic]');
    if (tac) { setShape(tac.dataset.tactic, tac.dataset.val); paintPause(); return; }

    const off = e.target.closest('[data-suboff]');
    if (off) {
      const i = +off.dataset.suboff;
      subFrom = subFrom === i ? null : i;
      paintPause();
      return;
    }
    const on = e.target.closest('[data-subon]');
    if (on && subFrom !== null) {
      makeSub(subFrom, +on.dataset.subon);
      subFrom = null;
      paintPause();
    }
  });

  /**
   * A substitution belongs to the team you are managing, and online the host
   * owns the simulation — so a guest asks rather than acts, exactly as it does
   * for a formation change.
   */
  function makeSub(pitchIdx, benchIdx) {
    const teamIdx = online ? online.seat : match.human;
    if (online && !online.host) {
      net.send({ t: 'evt', k: 'sub', team: teamIdx, pitchIdx, benchIdx });
      toast('Substitution sent', 'info');
      return;
    }
    const team = match.teams[teamIdx];
    const coming = team.bench?.[benchIdx];
    const going = team.players[pitchIdx];
    if (match.substitute(teamIdx, pitchIdx, benchIdx)) {
      toast(`${coming.short} on for ${going.ref.short}`);
    } else {
      toast('That substitution is not allowed', 'warn');
    }
  }

  /**
   * Shape and tactics belong to the team you are actually managing. Offline that
   * is seat 0; online it is your seat, and a guest's change has to be applied on
   * the host, since the host owns the simulation.
   */
  function setShape(key, val) {
    const team = online ? online.seat : (match.human ?? mgr?.side ?? 0);
    if (key === 'formation') match.applyFormation(team, val);
    else match.setTactic(team, key, val);
    if (online && !online.host) net.send({ t: 'evt', k: 'shape', team, key, val });
  }
  if (online?.host) {
    netOffs.push(net.on('evt', (m) => {
      if (m.k === 'sub') { match.substitute(m.team, m.pitchIdx, m.benchIdx); return; }
      if (m.k !== 'shape') return;
      if (m.key === 'formation') match.applyFormation(m.team, m.val);
      else match.setTactic(m.team, m.key, m.val);
    }));
  }

  root.querySelector('#gmPause').addEventListener('click', () => {
    if (ended) return;
    if (!online) { setPaused(!paused); return; }
    const syncNow = online.host ? syncLeft > 0 : guestSynced;
    if (syncNow) return;                       // pinned open behind the countdown
    if (online.host) requestPause(online.myName);
    else net.send({ t: 'evt', k: 'pausereq', name: online.myName });
    setPaused(!paused);
  });

  return () => {
    // the loop re-arms itself from a `finally`, so leaving has to say stop as
    // well as cancelling the frame already in flight
    running = false;
    cancelAnimationFrame(raf);
    /* Give the document back FIRST. `in-game` puts overflow:hidden on the
     * body, and it used to be removed after gl.dispose() — so a throwing GPU
     * teardown left the whole app unscrollable until a reload. The disposals
     * are each guarded for the same reason: none of them is allowed to stop
     * the ones after it. navigate() also clears the class as a backstop. */
    document.body.classList.remove('in-game');
    if (mgr) window.removeEventListener('keydown', onWheelKey);
    stopP2P();
    window.removeEventListener('resize', resize);
    document.removeEventListener('fullscreenchange', onFsChange);
    try { stopCrowd(); } catch { /* audio teardown must not block the rest */ }
    try { gl?.dispose(); } catch { /* GPU teardown least of all */ }
    for (const inp of inputs) { try { inp.destroy?.(); } catch { /* ditto */ } }
    // tell the hub we are gone, so the other player is not left waiting
    if (online && !ended) net.send({ t: 'leave' });
    netOffs.forEach((off) => off());
  };
}
