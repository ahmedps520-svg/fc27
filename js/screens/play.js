import { getState, update } from '../state.js';
import { getClub, WORLD } from '../data/generator.js';
import { crestSVG } from '../components/crest.js';
import { Match, SHAPES, FORMATION_NAMES, PITCH } from '../game/sim.js';
import { Input, SimLatch, promptFor, lastDevice } from '../game/input.js';
import { createGovernor, loadFor } from '../game/governor.js';
import {
  draw, makeCamera, groundBasis, replayCamera, resolveQuality,
  orbitCamera, walkoutCamera,
} from '../game/render3d.js';
import { toggleFullscreen, exitFullscreen, fullscreenSupported } from '../fullscreen.js';
import { settleDivisionMatch } from '../ultimate.js';
import { settleFives, settleClash, noteDivisionResult } from '../modes.js';
import { recordEvoMatch } from '../evolutions.js';
import { rateMatch } from '../game/ratings.js';
import { advancePro } from '../proCareer.js';
import { settleStreet } from '../streetMode.js';
import { runShootout } from './shootout.js';
import { sfx, startCrowd, setCrowd, stopCrowd, stopMusic, resumeAudio, setAudioSettings, startRain, stopRain, chant, announce, silenceAnnouncer, startAnthem, stopAnthem, startHighlightsBed, stopHighlightsBed } from '../audio.js';
import { createDirector } from '../broadcast/director.js';
import { createPregame, previewText, teamRating } from '../broadcast/pregame.js';
import { applyTouchLayout, clearTouchLayout } from '../components/touchLayout.js';
import { formMap } from '../broadcast/context.js';
import { potmHTML, ratingsHTML, statsHTML, momentumSVG, reaction, reactionHTML, drawResultCard, shareResultCard } from '../broadcast/postmatch.js';
import { trophyScene } from '../components/ceremony.js';
import { weekCards, baseOf } from '../data/promos.js';
import { say } from '../data/commentary.js';
import { groundProfile } from '../data/grounds.js';
import { stadiumFor, STADIUM_BY_ID, atmosphereFor, TIME_LABEL, WEATHER_LABEL, hashStr } from '../data/stadiums.js';
import { GUIDE_STEPS, finishOnboarding } from '../onboarding.js';
import { navigate, refreshCoins, toast } from '../app.js';
import { t, lang, isRTL } from '../i18n.js';
import { EMOTES, emoteText } from '../data/emotes.js';
import * as tournament from '../tournament.js';
import { createCameraRig, venueBounds, collideCamera, directReplay, presetById } from '../game/camera.js';
import { QUICK_TACTICS, DEF_STYLES, BUILD_UPS, rolesFor } from '../game/tactics.js';
import { toDef as builderDef, groundCapacity, groundFill } from '../builder.js';
import * as net from '../net/socket.js';
import { startP2P, stopP2P, sendMatch, p2pActive } from '../net/p2p.js';
import { advanceWeek } from '../career.js';
import * as progress from '../progress.js';
import { weekendWindow } from '../weekend.js';
import {
  InputSender, RemoteInput, SnapshotView, encodeSnapshot, qualityLabel, SNAP_MS,
} from '../net/netplay.js';

export const TITLE = 'Match';
import { CY } from '../game/field.js';

/**
 * What the loading screen says while it waits.
 *
 * Shuffled and stepped through, because a fixed order gives the game away the
 * second time you see it. Half of these are true and half are jokes, which is
 * the correct ratio for a loading screen.
 */
const LOADING_TIPS = [
  'Hold pass for a longer ball; a tap plays it short.',
  'On a touch screen, flick SHOOT up to chip the keeper, or sideways to bend it.',
  'Hold the curl button as you shoot to bend it round the keeper.',
  'Pull the stick back when you cross from the byline for a cut-back.',
  'Quick tactics are on 1–5, or the flag button on touch.',
  'Hold skill, point the stick, add sprint, curl or lob, and let go.',
  'Settings → Broadcast turns the commentary, subtitles and pre-match show up or down.',
  'Battery saver in Settings caps a match at 30 fps for long sessions.',
  'A through ball\'s weight is the hold: tap to lead a runner, hold to send him.',
  'Pass assist and shot timing assist live in Settings → Accessibility.',
  'In the practice arena, stage a free kick wherever your player stands.',
];
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

/**
 * Where and when this match is played.
 *
 * The home club's own ground, unless the fixture is a showpiece (the Weekend
 * League and cup finals are played at one of the four arenas). Time and
 * weather come from the fixture and the day, so the same ground is seen in
 * every light; Kick Off can force either through `params.atmo`.
 */
/** v82: split-screen touch for local two-player on a tablet. */
function buildSplitTouch(root, inputs) {
  const host = document.createElement('div');
  host.className = 'gm-split';
  host.innerHTML = [0, 1].map((i) => `
    <div class="split-half ${i ? 'right' : 'left'}" data-seat="${i}">
      <div class="split-zone"><div class="tstick" hidden><span class="ts-base"></span><i></i></div></div>
      <div class="split-btns">${[['pass', 'PASS · TACKLE'], ['shoot', 'SHOOT'], ['sprint', 'SPRINT'], ['switch', 'SWITCH']].map(([a, l]) => `<button class="tbtn" data-act="${a}"><b>${l}</b></button>`).join('')}</div>
      <span class="split-tag">P${i + 1}</span>
    </div>`).join('');
  root.querySelector('.gm-root, #gmRoot')?.appendChild(host) || root.appendChild(host);
  host.querySelectorAll('.split-half').forEach((half) => {
    const inp = inputs[+half.dataset.seat]; if (!inp) return;
    const zone = half.querySelector('.split-zone'); const stick = half.querySelector('.tstick'); const nub = stick.querySelector('i');
    const R = 48; let id = null;
    const move = (e) => { if (e.pointerId !== id) return; const r = stick.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2); const dy = e.clientY - (r.top + r.height / 2); const m = Math.hypot(dx, dy) || 1; const cl = Math.min(1, m / R); inp.setTouchVec((dx / m) * cl, (dy / m) * cl); nub.style.transform = `translate(${(dx / m) * cl * R}px, ${(dy / m) * cl * R}px)`; };
    const end = (e) => { if (e.pointerId !== id) return; id = null; stick.hidden = true; inp.setTouchVec(0, 0); nub.style.transform = ''; };
    zone.addEventListener('pointerdown', (e) => { if (id !== null) return; id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch { /* the pointer is already gone */ } const zr = zone.getBoundingClientRect(); stick.style.left = `${e.clientX - zr.left}px`; stick.style.top = `${e.clientY - zr.top}px`; stick.hidden = false; move(e); });
    zone.addEventListener('pointermove', move); zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
    half.querySelectorAll('[data-act]').forEach((b) => {
      const a = b.dataset.act;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); inp.setTouchButton(a, true); b.classList.add('is-down'); try { b.setPointerCapture(e.pointerId); } catch { /* fine */ } });
      const up = () => { inp.setTouchButton(a, false); b.classList.remove('is-down'); };
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    });
  });
}

/** A finished Match as the Manager Career's record of it (names, not card ids). */
function careerExtra(match, side, possession) {
  const nm = (id) => String(id).replace(/^cr-/, '');
  const team = match.teams[side];
  const rated = rateMatch(match).players.filter((x) => x.side === side);
  const xi = []; const subs = [];
  for (const [id, st] of Object.entries(match.pst || {})) { if (st.team !== side) continue; (st.on > 0 ? subs : xi).push(nm(id)); }
  return {
    xi, subs,
    ratings: Object.fromEntries(rated.map((x) => [nm(x.id), x.rating])),
    goals: team.scorers.map((g) => nm(g.id)).filter(Boolean),
    assists: team.scorers.map((g) => g.assist && nm(g.assist)).filter(Boolean),
    possession,
  };
}

function venueOf(params) {
  /* A custom home squad — a Career club, your Ultimate XI, an online opponent
     — brings its own identity, so it gets its own ground: dealt by name from
     the same set, sized by its rating, in its colours. A world club plays at
     the ground its blueprint names. */
  // a Player Career match fields your side as the home team; `venueSquad` is who really hosts (v81)
  const sq = params.venueSquad || params.homeSquad;
  const home = sq?.name
    ? { id: sq.id || sq.name, name: sq.name, colors: sq.colors || sq.crest?.colors, country: sq.country || null, level: Math.max(0.1, Math.min(1, ((sq.rating || 74) - 60) / 30)) }
    : getClub(params.homeId);
  const showpiece = !!(params.weekend || params.final || params.showpiece || params.online);
  /* Your own ground, when you built one (the Stadium Builder) and this is a
     home fixture of yours: an Ultimate XI match, or a Career home game —
     where the bowl is only as big as the board has paid for. Finals and
     online matches are still played at the arenas. */
  const car = params.career ? getState().career : null;
  // the career club has its own design (v73); Ultimate XI has yours
  // v78: a Career club always plays at home in its own ground — designed or the default — so every
  // expansion, and every promotion, is a bigger ground on the next home match
  const design = car ? (car.ground?.design || (params.career?.isHome ? {} : null)) : getState().club.stadium?.design;
  // yours whenever you are the home side and nothing else claims the venue: Ultimate XI, a
  // Career home game, or a Kick Off match with you on the home team (v74)
  const humanHome = params.mode !== 'career' && !params.online && (params.human ?? 0) === 0;
  const mine = !showpiece && design && !params.venueId && (params.ultimate || (params.career?.isHome && sq?.name) || (!params.career && humanHome));
  const stadium = mine
    ? builderDef(design, { clubName: sq?.name || (car ? home?.name : (getState().club.identity?.name || 'Ultimate XI')), short: sq?.short || (car ? home?.short : (getState().club.identity?.short || 'XI')),
      capacity: car ? groundCapacity(car) : null, fill: car ? groundFill(car) : 0.86 })
    : params.venueDef || (params.venueId && STADIUM_BY_ID[params.venueId]) || stadiumFor(home, { showpiece });   // v82: a street venue brings its own definition
  const day = Math.floor(Date.now() / 86_400_000);
  const seed = params.atmoSeed || `${params.homeId}|${params.awayId}|${day}|${params.career?.week ?? ''}`;
  /* v78: where in the season this is. A Career match knows its week; any other
     match is played on today's date, the season running August to May. It
     decides the month (and so the chance of frost and snow) and how worn the
     goalmouths already are. */
  const now = new Date();
  const frac = params.career?.week
    ? Math.max(0, Math.min(1, (params.career.week - 1) / Math.max(1, (params.career.weeks || 38) - 1)))
    : Math.max(0, Math.min(1, (((now.getMonth() + 12 - 7) % 12) + now.getDate() / 31) / 10));
  const month = params.career?.week ? (7 + Math.floor(frac * 10)) % 12 : now.getMonth();
  const profile = groundProfile(stadium, stadium.host || null);
  const atmo = atmosphereFor(seed, params.atmo || {}, { month, warm: profile.landscape === 'desert' });
  /* A quarter of matches see the weather turn: rain arriving in a clear
     second half, or a wet first half clearing. Decided by the seed, so the
     same fixture on the same day turns the same way; never when the
     conditions were chosen by hand. */
  if (params.atmoChange) atmo.change = params.atmoChange;
  else if (!params.atmo?.weather) {
    const h = hashStr(`turn|${seed}`);
    if ((h & 0xff) < 64) atmo.change = { minute: 30 + ((h >>> 8) % 45), to: atmo.weather === 'rain' ? 'clear' : 'rain' };
  }
  // a final, a showpiece, or two strong sides: the ground sells out
  const strong = (s) => (s?.rating || 0) >= 84;
  const bigGame = showpiece || !!params.final || (strong(params.homeSquad) && strong(params.awaySquad));
  return { stadium, atmo, seasonWear: 0.08 + frac * 0.82, bigGame, label: `${stadium.name} · ${TIME_LABEL[atmo.time]} · ${WEATHER_LABEL[atmo.weather]}${atmo.frost ? ' · Frost' : ''}` };
}

export function render(params) {
  const home = sideOf(params, 'home');
  const away = sideOf(params, 'away');
  const venue = venueOf(params);
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
          <p class="gl-venue">${venue.label}</p>
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
          <button class="icon-btn sm" id="gmEmoteBtn" title="Emotes" hidden>💬</button>
          <button class="icon-btn sm" id="gmCamBtn" title="Camera (V)" aria-label="Change camera">🎥</button>
          <button class="icon-btn sm" id="gmTacBtn" title="Quick tactics (1–5)" aria-label="Quick tactics">⚑</button>
          <button class="icon-btn sm" id="gmFs" title="Fullscreen">⛶</button>
          <button class="icon-btn sm" id="gmPause" title="Pause">❚❚</button>
        </div>
      </div>

      <!-- Everything one player can say to another: the fixed emote list, by
           id. There is no free-text chat anywhere in the game, by design. -->
      <div class="gm-emotes" id="gmEmotes" hidden>
        ${EMOTES.map((e) => `<button data-emote="${e.id}" title="${e.en}">${e.icon}</button>`).join('')}
      </div>

      <!-- v82: the practice arena's set-piece bench -->
      <div class="gm-practice" id="gmPractice" hidden>
        <button class="btn sm" data-prac="freekick">Free kick here</button>
        <button class="btn sm" data-prac="penalty">Penalty</button>
        <button class="btn sm" data-prac="corner">Corner</button>
        <button class="btn sm ghost" data-prac="reset">Reset</button>
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
          <button class="tbtn t-skill" data-slot="skill"><b>SKILL</b></button>
          <button class="tbtn t-lob" data-slot="lob"><b>LOB</b></button>
        </div>
      </div>

      <div class="gm-feed" id="gmFeed" aria-live="polite"></div>
      <div class="gm-setpiece" id="gmSetPiece" hidden></div>
      <div class="gm-hints" id="gmHints" hidden></div>
      <div class="gm-booking" id="gmBooking" role="status" hidden><i class="gb-card" aria-hidden="true"></i><b></b><span></span></div>

      <div class="goal-card" id="goalCard" hidden>
        <span class="gc-word">GOAL</span>
        <span class="gc-scorer" id="gcScorer"></span>
        <span class="gc-score" id="gcScore"></span>
      </div>

      <div class="replay-tag" id="replayTag" hidden>
        <span class="rt-dot"></span>REPLAY <i class="rt-angle" id="rtAngle"></i>
        <em>hold ◯</em>
        <button class="rt-skip" id="rtSkip" type="button">SKIP</button>
      </div>

      <div class="gm-overlay" id="gmOverlay" hidden></div>
    </div>`;
}

export function mount(root, params) {
  const shell = root.querySelector('#gmRoot');
  const canvas = root.querySelector('#gmCanvas');
  // v87: accessibility — a colour-vision filter on the picture, and the one-handed touch layout
  { const st = getState().settings;
    if (st.colorFilter && st.colorFilter !== 'none') canvas.classList.add(`cb-${st.colorFilter}`);
    if (st.oneHanded) shell.classList.add('one-hand', `one-hand-${st.oneHandedSide === 'left' ? 'left' : 'right'}`); }
  const mode = params.mode || 'single';
  const online = params.online || null;
  /* v95: the attract demo — the title screen left alone plays a CPU match
     behind a "press any button" banner. Nobody holds a stick, nothing is
     paid or recorded, and any input (or the final whistle) goes back to the
     title. */
  const attract = !!params.attract;
  /* A spectator is a guest that never speaks: the host's snapshots pour in
   * exactly as they do for the away player, and nothing goes back up — no
   * input, no pause requests, no result. */
  const spectating = !!online?.spectate;
  // Online is one person per machine, so the local seat is the only local input.
  /* v91: seats from the side-select screen — up to four people at one
     screen, each on their own controller or half of the keyboard. */
  const localSeats = !online && Array.isArray(params.localSeats) && params.localSeats.length ? params.localSeats.slice(0, 4) : null;
  const twoUp = !online && (mode === 'versus' || mode === 'coop' || (localSeats?.length > 1));
  const seatInput = (st) => new Input({ padSlot: st.pad == null ? -1 : st.pad, keys: st.keys || 'none' });

  // Seat 1 takes pad 0 and the WASD set; seat 2 takes pad 1 and the arrow/numpad
  // set, so a second person can join with a pad or just the other half of the keyboard.
  const localInput = localSeats ? seatInput(localSeats[0]) : new Input({ pad: 0, keys: 'primary', arrows: !twoUp });
  let inputs;
  let remote = null;
  let remotes = null;   // v82: party host — a RemoteInput per seat
  if (online && online.team == null) online.team = online.seat;
  if (online) {
    // The host drives seat 0 and receives seat 1 over the wire; the guest holds
    // seat 1 locally and streams it up. Both keep the seats in the same order so
    // the match object is identical on both machines.
    // The guest never simulates, so it only needs its own seat locally.
    remote = online.host ? new RemoteInput() : null;
    inputs = online.host ? [localInput, remote] : [localInput];
    // v82: a party host takes one input per guest seat, routed by the seat the server stamps
    if (online.party && online.host) { remotes = online.party.seats.map((st, i) => (i === 0 ? null : new RemoteInput())); inputs = [localInput, ...remotes.slice(1)]; }
  } else {
    inputs = [localInput];
    if (localSeats) for (const st of localSeats.slice(1)) inputs.push(seatInput(st));
    else if (twoUp) inputs.push(new Input({ pad: 1, keys: 'secondary' }));
  }
  const input = localInput;
  const quality = resolveQuality(getState().settings.quality);
  // Scanned players are a 14 MB download, so they are never forced on the
  // low-detail path — a machine that asked for Low did so for a reason. Medium
  // (a phone, usually) gets them only when Realistic was chosen on purpose.
  /* The scanned models on High and above. Measured on Medium they are 2.5M
     triangles and 200 textures against the figures' 660k — a phone on
     Medium lost half its frame rate — so Medium, Low and Ultra Low draw
     the built-in figures. This is the tier deciding, not an option. */
  const useModels = quality === 'high' || quality === 'ultra' || quality === 'cinema';

  const match = new Match(params.homeId, params.awayId, {
    responsiveness: getState().settings.responsiveness ?? 0.7,   // v84 hotfix
    celebration: getState().settings.celebration || 'random',     // v110: your side's goal celebration
    assist: { shoot: getState().settings.shootAssist, pass: getState().settings.passAssist ?? 1 },
    duration: params.duration || 240,
    skill: params.skill || 1,
    // the manager holds no stick: career matches are AI against AI, influenced
    human: mode === 'career' || attract ? null : undefined,
    mode,
    // Kick Off is a game of football; Ultimate XI is a competition. Both sides
    // of an online match derive this from the same `ultimate` flag, so host and
    // guest never disagree about which engine they are watching.
    preset: params.ultimate ? 'competitive' : 'authentic',
    homeSquad: params.homeSquad || null,
    awaySquad: params.awaySquad || null,
    // v80: Quickfire Fives plays on a small pitch with five a side
    field: params.field || 'full',
    // v82: a party brings one seat per person, in the server's order
    seats: online?.party ? online.party.seats.map((st) => ({ team: st.team }))
      : localSeats ? localSeats.map((st) => ({ team: st.team })) : undefined,
  });
  // v82: pro five-a-side — every person is locked to their own pro
  if (online?.party?.locks) for (const [seat, id] of Object.entries(online.party.locks)) { const c = match.controllers[+seat]; if (c) { c.lockId = id; match.locked = true; } }
  if (match.locked) match.lockSeats();
  // the ground and the weather, for the renderer and the commentary
  match.venue = venueOf(params);
  /* The camera rig (game/camera.js): presets, springs, set-piece angles, the
     celebration orbit, and collision against this ground's stands and nets. */
  const camBounds = venueBounds(match.venue?.stadium);
  // v81: a Player Career match locks the stick and the camera to your footballer
  if (params.pro) match.lockPlayer(params.pro.cardId);
  // v82: the practice arena — the other side is only its keeper, and there is no offside
  if (params.practice) match.park(1);
  const camRig = createCameraRig({ settings: params.pro ? { ...(getState().settings.camera || {}), preset: 'lock' } : getState().settings.camera, bounds: camBounds });
  window.__apexMatch = match;            // the QA bot and the perf harness reach the sim through this
  window.__apexCam = camRig;             // the camera regression shots switch presets through this
  // colour-safe kits: the away strip is chosen against every kind of colour vision
  match.vision = getState().settings.colorSafeKits ? 'all' : 'normal';
  const cam = makeCamera();
  match.basis = groundBasis(cam);        // controls follow the camera
  let celebT = 0;
  let chantT = 18;                       // first song a while after kick-off
  /* The walk-out: seven seconds before kick-off with both sides lined up on
     the halfway line, the anthem playing and the home end's tifo up, on a
     tracking shot along the lines. Skipped online (two clocks), for guests,
     and under reduced motion, which is also what the smoke suite runs on. */
  let walkout = null;
  const showCam = makeCamera();          // half-time show and photo mode
  let showT = 0;
  let photo = null;                      // { yaw, pitch, dist, filter } while photo mode is open

  /* ------------------------------ commentary ------------------------------ *
   * The voice in the gantry. Every cue the sim raises that has lines in
   * data/commentary.js becomes one, plus a few from the clock and the stat
   * sheet. Two lines live on the HUD; the whole log goes to Match Facts. */
  const feedEl = root.querySelector('#gmFeed');
  const commentLog = [];
  let feedTimer = 0;
  const teamOf = (i) => match.teams[i];
  const commentCtx = (arg) => {
    const ctx = { score: `${match.teams[0].score}–${match.teams[1].score}`, minute: match.minute(), venue: match.venue?.stadium?.name || match.teams[0].club?.ground || 'the stadium' };
    let t = null;
    if (arg && typeof arg === 'object' && arg.ref) { ctx.player = arg.ref.short || arg.ref.name; t = arg.team; }
    else if (arg && typeof arg === 'object' && typeof arg.team === 'number') {
      t = arg.team; ctx.dist = arg.dist;
      // v79: a tactics change names itself
      if (arg.name || arg.mentality) ctx.tactic = arg.name || ({ allout: 'all-out attack', attacking: 'an attacking shape', defensive: 'a defensive shape', balanced: 'a balanced shape' })[arg.mentality] || 'a new shape';
    }
    else if (typeof arg === 'number' && (arg === 0 || arg === 1)) t = arg;
    if (t === null && match.ball.owner) t = match.ball.owner.team;
    if (t === null) t = 0;
    ctx.team = teamOf(t).name; ctx.opp = teamOf(1 - t).name;
    const gk = teamOf(1 - t).players.find((q) => q.role === 'GK');
    ctx.keeper = gk ? (gk.ref.short || gk.ref.name) : 'the keeper';
    ctx.poss = Math.round(match.possession()[t]);
    return ctx;
  };
  /* v83: the broadcast — commentary desk, graphics, clock (broadcast/director.js)
     and the pre-match show (broadcast/pregame.js). Built when the veil lifts. */
  let director = null;
  let pregame = null;
  const comment = (key, arg, ctxExtra = {}) => {
    const fullCtx = { ...commentCtx(arg), ...ctxExtra };
    let line = say(key, fullCtx);
    // the desk speaks it (in Arabic, its own line, which the feed shows too)
    const spoken = director?.line(key, fullCtx, line);
    if (director?.desk.lang === 'ar' && spoken) line = spoken;
    if (!line) return;
    commentLog.push({ minute: match.minute(), line });
    if (commentLog.length > 80) commentLog.shift();
    if (!feedEl) return;
    const recent = commentLog.slice(-2);
    feedEl.innerHTML = recent.map((c, i) => `<span class="${i === recent.length - 1 ? 'now' : ''}"><i>${c.minute}'</i>${c.line}</span>`).join('');
    feedEl.classList.remove('flash'); void feedEl.offsetWidth; feedEl.classList.add('flash');
    feedTimer = 6;
  };
  const CUE_KEY = {
    goal: 'goal', shot: 'shot', shotWide: 'shotWide', save: 'save', post: 'post', cross: 'cross', header: 'header',
    bigChance: 'bigChance', cornerKick: 'cornerKick', freekick: 'freekick', penaltyAwarded: 'penaltyAwarded',
    throwin: 'throwin', foul: 'foul', card: 'card', injury: 'injury', sub: 'sub', counter: 'counter', skill: 'skill', lob: 'lob',
    offside: 'offside', volley: 'volley', bicycle: 'bicycle', knuckle: 'knuckle', heavyTouch: 'heavyTouch', tactic: 'tactic', adapt: 'adapt',
  };
  let lastCommentAt = -9;
  const commentCue = (name, arg) => {
    const key = CUE_KEY[name];
    if (!key) return;
    // the feed is a voice, not a ticker: one line a second at most, goals always
    if (name !== 'goal' && match.t - lastCommentAt < 1.1) return;
    if (name === 'shot' && Math.random() < 0.5) return;        // not every effort
    lastCommentAt = match.t;
    if (name === 'goal') {
      const own = !match.celebrant;
      const before = commentCtx(match.goalTeam);
      comment(own ? 'ownGoal' : 'goal', match.celebrant || match.goalTeam, before);
      const [hs, as] = [match.teams[0].score, match.teams[1].score];
      const lead = match.goalTeam === 0 ? hs - as : as - hs;
      if (lead === 0) setTimeout(() => comment('comeback', match.goalTeam), 1600);
      else if (lead === 1) setTimeout(() => comment('lead', match.goalTeam), 1600);
      else if (lead >= 2) setTimeout(() => comment('extend', match.goalTeam), 1600);
      return;
    }
    comment(key, arg);
  };
  let lastClockLine = -1;
  const clockCommentary = () => {
    const m = match.minute();
    if ([15, 30, 60, 75].includes(m) && lastClockLine !== m && match.t - lastCommentAt > 4) {
      lastClockLine = m; lastCommentAt = match.t;
      const [ph, pa] = match.possession();
      const t = ph >= pa ? 0 : 1;
      if (Math.max(ph, pa) >= 64) comment('possession', t); else comment('clock', t);
    }
    if (m >= 85 && lastClockLine !== 85 && match.t - lastCommentAt > 4) { lastClockLine = 85; comment('late', match.teams[0].score >= match.teams[1].score ? 0 : 1); }
  };

  /* --------------------------- set-piece prompt --------------------------- */
  const spEl = root.querySelector('#gmSetPiece');
  let spShown = null;
  const SP_TEXT = {
    corner: ['Corner', 'Aim with the stick · CROSS into the box · SHORT to a team-mate'],
    freekick: ['Free kick', 'Aim with the stick · hold SHOOT for power · CROSS or SHORT'],
    penalty: ['Penalty', 'Pick a side with the stick · hold SHOOT — more power, more risk'],
    throwin: ['Throw-in', 'Aim with the stick · THROW short or LONG'],
  };
  const paintSetPiece = () => {
    const sp = match.setPiece;
    const seat = match.controllers[online ? online.seat : 0];
    const mine = sp && sp.human && seat && sp.team === seat.team;
    if (!mine) { if (spShown) { spEl.hidden = true; spShown = null; } return; }
    const secs = Math.ceil(match.phaseT);
    const key = `${sp.kind}:${secs}`;
    if (key === spShown) return;
    spShown = key;
    const [title, how0] = SP_TEXT[sp.kind] || ['Set piece', ''];
    // v82: name the buttons on the device in hand (touch already shows the words on its buttons)
    const how = lastDevice() === 'touch' ? how0 : how0.replace(/\b(SHOOT|CROSS|SHORT|THROW|LONG)\b/g, (w) => `${w} (${promptFor({ SHOOT: 'shoot', CROSS: 'cross', SHORT: 'pass', THROW: 'pass', LONG: 'through' }[w])})`);
    spEl.hidden = false;
    spEl.innerHTML = `<b>${title}</b><span>${how}</span><i class="sp-clock">${secs}</i>`;
  };

  /* ------------------------------- hints -------------------------------- *
   * Three matches of rotating tips for the new controls, then never again. */
  const hintsEl = root.querySelector('#gmHints');
  /* v112: a booking gets a card on screen — the referee shows it on the pitch
     (game/referee.js), but from the broadcast camera that is a speck, and the
     commentary line can be skipped when the feed is busy */
  const bookingEl = root.querySelector('#gmBooking');
  let bookingsSeen = 0; let bookingT = 0;
  const showBookings = (dt) => {
    const n = match.bookings?.length || 0;
    if (n > bookingsSeen) {
      const bk = match.bookings[n - 1];
      bookingEl.querySelector('b').textContent = bk.name;
      bookingEl.querySelector('span').textContent = `${match.teams[bk.team]?.short || match.teams[bk.team]?.name || ''} · booked ${bk.minute}'`;
      bookingEl.hidden = false; bookingEl.classList.remove('in'); void bookingEl.offsetWidth; bookingEl.classList.add('in');
      bookingT = 3;
    }
    bookingsSeen = n;
    if (bookingT > 0) { bookingT -= dt; if (bookingT <= 0) bookingEl.hidden = true; }
  };
  const HINTS = [
    // v82: the prompts name the button on whatever you are holding — keyboard, controller or touch
    () => (lastDevice() === 'touch'
      ? 'Swipe the SKILL button for a trick — a long swipe sprints, a curved one curls: 13 tricks by star rating'
      : `SKILL (hold ${promptFor('skill')}) — point the stick, add Sprint, Curl or Lob, let go: 13 tricks by star rating`),
    () => `${lastDevice() === 'keyboard' ? 'Keys 1–5 or the flag button switch' : 'The flag button switches'} quick tactics, from Park the bus to All-out attack`,
    () => `LOB (${promptFor('lob')}) — chip it over the defence to a runner`,
    () => (lastDevice() === 'touch'
      ? 'Flick SHOOT up to chip the keeper, sideways to bend it · flick PASS for a through ball, up for a lofted one'
      : `Hold ${promptFor('pass')} or ${promptFor('shoot')} for more power · CURL with ${promptFor('curl')} while shooting · hold ${promptFor('lob')} as you let go of a shot to chip it`),
    'Dead ball? Aim with the stick and pick the kick — corners, free kicks, throws are yours',
    'Pause at any stoppage for Substitutions and Team Management',
    () => `Defending: ${promptFor('shoot')} slides in · hold ${promptFor('jockey')} to jockey · hold ${promptFor('press')} to send a team-mate to press`,
  ];
  let hintIdx = 0;
  let hintTimer = 0;
  /* The guided match (onboarding): the lesson plan replaces the rotating
     hints, each step staying up until the player does the thing, and the
     end of the match banks the first rewards and lands on Today. */
  const guided = !!params.guided;
  let guideIdx = 0;
  let guideHold = 0;
  const wantHints = (getState().flags?.hintMatches | 0) < 3 && mode !== 'career' && !online && !attract;
  if (wantHints) update((st) => { st.flags.hintMatches = (st.flags.hintMatches | 0) + 1; });

  const scoreH = root.querySelector('#gmScore');
  const scoreA = root.querySelector('#gmScoreA');
  const clockEl = root.querySelector('#gmClock');
  const padEl = root.querySelector('#gmPad');
  const overlay = root.querySelector('#gmOverlay');
  const goalCard = root.querySelector('#goalCard');
  const gcScorer = root.querySelector('#gcScorer');
  const gcScore = root.querySelector('#gcScore');
  const replayTag = root.querySelector('#replayTag');
  const rtAngle = root.querySelector('#rtAngle');
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
  const goalClips = [];            // every goal's tape, for the highlights after the match
  const captureGoal = () => {
    const team = scoringTeam();
    clip = {
      frames: tape.slice(Math.max(0, tape.length - PRE_FRAMES)),
      post: 0,
      goalX: team && team.dir > 0 ? PITCH.w : 0,
      minute: match.minute(),
      angle: goalClips.length % 4,
      seq: goalClips.length,
    };
    /* The director picks the passes: the build-up first, then one or two
       slowed angles chosen by the kind of goal (see directReplay). */
    clip.passes = directReplay(clip, { late: match.minute() >= 80 });
    goalClips.push(clip);
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

  let linedUp = false;       // the XIs are on the halfway line, not at kick-off positions
  const startWalkout = () => {
    walkout = { t: 0, dur: 7 };
    lineUp(); linedUp = true;
    startAnthem(match.venue?.stadium?.name?.length || 1);
  };
  /** Both XIs on the halfway line, facing the near touchline, keepers at the ends. */
  const lineUp = () => {
    for (let t = 0; t < 2; t++) {
      const xi = match.teams[t].players.slice(0, 11);
      xi.forEach((p, i) => {
        p.x = PITCH.w / 2 + (t === 0 ? -1.6 : 1.6);
        p.y = CY + 7 - i * 1.5;
        p.vx = 0; p.vy = 0; p.dirX = 0; p.dirY = -1;
      });
    }
    match.ball.x = PITCH.w / 2; match.ball.y = CY - 12; match.ball.z = 0; match.ball.vx = 0; match.ball.vy = 0;
  };
  /** Photo mode's free camera: an orbit round the ball, dragged by the pointer. */
  const photoCamera = () => {
    const b = match.ball;
    const r = photo.dist;
    showCam.x = b.x + Math.cos(photo.yaw) * r;
    showCam.y = b.y + Math.sin(photo.yaw) * r;
    showCam.z = 1 + Math.sin(photo.pitch) * r;
    showCam.tx = b.x; showCam.ty = b.y; showCam.tz = 1;
    showCam.hfov = photo.fov;
    return showCam;
  };

  let replay = null;
  /* Highlights: the goal clips, one after another, over the full-time card.
   * Uses the replay machinery unchanged — each clip is a replay, and when one
   * ends the next starts. */
  let highlightIdx = -1;
  const playHighlights = () => {
    if (!goalClips.length) return;
    highlightIdx = 0;
    startHighlightsBed();
    overlay.hidden = true;
    clip = goalClips[0];
    startReplay();
  };
  /* Shareable clips: the highlights reel, recorded off the canvas with
   * MediaRecorder while it plays, and handed over as a WebM download when the
   * last goal ends. No server, no upload — the file is the player's. */
  let recorder = null;
  const clipSupported = () => typeof MediaRecorder !== 'undefined' && typeof canvas.captureStream === 'function';
  const recordClip = () => {
    if (!clipSupported() || recorder || !goalClips.length) return;
    try {
      const stream = canvas.captureStream(30);
      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
      const chunks = [];
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 6e6 } : undefined);
      recorder.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
      recorder.onstop = () => {
        recorder = null;
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const [h, aw] = match.teams;
        a.href = url; a.download = `apexxi-${h.short}-${h.score}-${aw.score}-${aw.short}.webm`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        toast(`Clip saved · ${(blob.size / 1048576).toFixed(1)} MB`, 'good');
      };
      recorder.start(500);
      toast('Recording the highlights…', 'info');
      playHighlights();
    } catch (err) {
      recorder = null;
      toast('Could not record a clip on this device', 'warn');
      console.warn('clip', err);
    }
  };
  const stopClip = () => { if (recorder && recorder.state !== 'inactive') recorder.stop(); };

  const nextHighlight = () => {
    if (highlightIdx < 0) return false;
    highlightIdx += 1;
    if (highlightIdx >= goalClips.length) { highlightIdx = -1; stopHighlightsBed(); overlay.hidden = false; stopClip(); return false; }
    clip = goalClips[highlightIdx];
    return startReplay();
  };

  const startReplay = () => {
    if (!clip || clip.frames.length < 60) return false;
    const live = { b: [match.ball.x, match.ball.y, match.ball.z], p: allPlayers().map((p) => [p.x, p.y, p.dirX, p.dirY, p.vx, p.vy, p.diveT || 0]) };
    const celeb = allPlayers().map((p) => p.celebrating);
    allPlayers().forEach((p) => { p.celebrating = false; });
    replay = {
      frames: clip.frames,
      i: 0, live, celeb,
      goalX: clip.goalX,
      passes: clip.passes || [{ angle: clip.angle || 0, speed: 1 }],
      pass: 0,
      angle: (clip.passes?.[0]?.angle) ?? (clip.angle || 0),
      speed: (clip.passes?.[0]?.speed) ?? 1,
      cam: makeCamera(),
      hold: 0,
    };
    clip = null;
    replayTag.hidden = false;
    rtAngle.textContent = replay.passes.length > 1 ? `· ANGLE 1/${replay.passes.length}` : '';
    director?.wipe();
    gl?.setReplay(true);
    return true;
  };

  const endReplay = () => {
    if (!replay) return;
    applyFrame(replay.live);
    allPlayers().forEach((p, i) => { p.celebrating = replay.celeb[i]; });
    replay = null;
    replayTag.hidden = true;
    director?.wipe();
    gl?.setReplay(false);
    if (highlightIdx >= 0) nextHighlight();
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
  const sender = online && !online.host && !spectating ? new InputSender(localInput, 20, sendMatch) : null;
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
  let spectators = 0;      // host: how many are watching through the hub
  let rtt = null;          // this client to the server
  let peerRtt = null;      // this client to the opponent and back — what you feel
  let lastPeerPing = 0;
  const pendingCues = [];

  if (online) {
    netEl.hidden = false;
    match.online = true;
    // Only the host's clock is authoritative, so the guest must not tick its own.
    if (online.host) {
      netOffs.push(net.on('in', (m) => (remotes ? remotes[m.sq]?.accept(m) : remote.accept(m))));
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
    if (!spectating && !online.party) startP2P(online);   // a party goes through the hub: one host, many guests
    /* Reconnects. The hub holds a dropped player's seat for a grace period.
     * Their opponent gets 'dropped' and the match pauses through the same
     * synchronised pause a menu uses, with the grace as its countdown; a
     * 'resumed' cuts that to three seconds. On this side, losing the socket
     * mid-match is no longer the end of it: the socket retries on its own,
     * re-authenticates, and the hub hands the seat back with 'rejoined'. */
    netOffs.push(net.on('evt', (m) => {
      // v82: in a party one person dropping does not stop everybody — the CPU takes the seat until they are back
      if (online.party && (m.k === 'dropped' || m.k === 'resumed')) {
        const c = match.controllers[m.seat];
        if (c && online.host) c.ai = m.k === 'dropped';
        if (!ended) toast(m.k === 'dropped' ? `${m.name || 'A player'} dropped — the CPU has their seat` : `${m.name || 'A player'} is back`, m.k === 'dropped' ? 'warn' : 'good');
        return;
      }
      if (m.k === 'dropped' && !ended) {
        if (online.host) { requestPause(m.name || online.oppName); syncLeft = Math.max(syncLeft, m.grace || 45); }
        showQueueBanner(`${m.name || 'Opponent'} lost connection — holding the match…`);
        toast(`${m.name || 'Opponent'} disconnected — waiting up to ${m.grace || 45}s`, 'warn');
      }
      if (m.k === 'resumed' && !ended) {
        if (online.host) syncLeft = Math.min(syncLeft || 3, 3);
        showQueueBanner(null);
        toast(`${m.name || 'Opponent'} is back`, 'good');
      }
    }));
    if (online.party) {
      netOffs.push(net.on('partyEnded', () => { if (!ended) { ended = true; finish(); } }));
      netOffs.push(net.on('partyRecorded', () => { if (!ended) { ended = true; finish(); } }));
    }
    netOffs.push(net.on('closed', () => {
      if (!ended) toast('Connection lost — reconnecting…', 'warn');
    }));
    netOffs.push(net.on('spectators', (m) => {
      const n = m.n | 0;
      if (online.host && n > spectators) toast(`${n} watching`, 'info');
      spectators = n;
    }));
    netOffs.push(net.on('rejoined', (m) => {
      if (ended) return;
      toast('Reconnected — match resumes', 'good');
      if (online.host) syncLeft = Math.min(syncLeft || 3, 3);
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
      if (spectating) return;
      if (m.k === 'pp') { net.send({ t: 'evt', k: 'pr', at: m.at }); return; }
      if (m.k === 'pr' && m.at === lastPeerPing) peerRtt = Math.round(performance.now() - m.at);
    }));
    const pingTimer = setInterval(async () => { rtt = await net.ping(); }, 3000);
    const peerTimer = setInterval(() => {
      if (spectating) return;
      lastPeerPing = performance.now();
      net.send({ t: 'evt', k: 'pp', at: lastPeerPing });
    }, 2000);
    netOffs.push(() => { clearInterval(pingTimer); clearInterval(peerTimer); });

    /* Emotes. The receiver renders the id in its own language; the server
     * drops anything that is not on the list, so nothing else can arrive. */
    netOffs.push(net.on('emote', (m) => {
      const text = emoteText(m.id, lang());
      if (text) toast(`${m.from || online.oppName}: ${text}`, 'info');
    }));
    const emoteBar = root.querySelector('#gmEmotes');
    const emoteBtn = root.querySelector('#gmEmoteBtn');
    if (!spectating && emoteBar && emoteBtn) {
      emoteBtn.hidden = false;
      emoteBtn.addEventListener('click', () => { emoteBar.hidden = !emoteBar.hidden; });
      let lastEmote = 0;
      emoteBar.addEventListener('click', (e) => {
        const id = e.target.closest('[data-emote]')?.dataset.emote;
        if (!id) return;
        const now = performance.now();
        if (now - lastEmote < 1500) return;                 // the server rate-limits too; this just keeps taps honest
        lastEmote = now;
        net.send({ t: 'emote', id });
        toast(`You: ${emoteText(id, lang())}`, 'info');
        emoteBar.hidden = true;
      });
    }
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
  /* A career match opens on YOUR manager — the mode's whole identity is
   * standing on the touchline, so that is the first thing you see. C (or the
   * camera button) flips to the TV broadcast and back. Every other mode keeps
   * the broadcast camera it has always had. */
  let camMode = careerCtx ? 'manager' : 'broadcast';
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
  if (match.venue?.atmo?.wet) startRain(match.venue.atmo.intensity);

  let vw = 0;
  let vh = 0;
  let paused = false;
  let ended = false;
  let navHeld = false;
  let raf = null;
  let last = performance.now();

  // WebGL is the real renderer; the canvas-2D path stays as a fallback so the
  // match still runs if a machine or driver refuses a GL context.
  let running = true;   // false once the screen is torn down; every async tail checks it
  let gl = null;
  /* v87: the frame governor drops effects before the frame rate drops
     (game/governor.js); battery mode caps the match at 30 fps and starts light. */
  const battery = !!getState().settings.battery;
  const governor = createGovernor({ start: battery ? 3 : 0, down: battery ? 45 : 38, up: battery ? 36 : 21 });
  window.__apexGov = governor;
  let lastDraw = 0;
  let ctx = null;
  /* The renderer — and three.js under it, 1.3 MB of it — is loaded here and
   * not at boot. Nothing before this screen draws a triangle, so the menu,
   * the squad and the store no longer pay for the pitch. The loading veil
   * below is already on screen for five to seven seconds; the download rides
   * inside that. `running` guards the callback because a player can leave the
   * screen before the module lands, and a renderer created into a dead canvas
   * is a leaked GL context. */
  // v73: the WebGPU renderer (beta) is opt-in from Settings; Auto keeps WebGL2 for matches
  const wantGPU = getState().settings.renderer === 'webgpu';
  const glLoad = (wantGPU ? import('../game/renderGPU.js') : import('../game/renderGL.js')).then(async (m) => {
    if (!running) return;
    gl = await m.createRenderer(canvas, match, quality, useModels);
    if (!running) { try { gl.dispose(); } catch { /* torn down while the GPU device was coming up */ } gl = null; return; }
    window.__apexGL = gl; window.__apexMatch = match; window.__apexDbg = () => ({ walkout, phase: match.phase, minute: match.minute(), paused, loading, ended }); // the perf harness reads renderer.info through this
    // v87: battery mode starts light (no post chain, frozen shadows, 80% resolution)
    if (gl.setLoad && governor.level()) gl.setLoad(loadFor(governor.level()));
    resize();
    gl.ready.then(() => { assetsReady = true; });
  }).catch((err) => {
    if (!running) return;
    console.warn('WebGL unavailable, falling back to canvas 2D:', err);
    ctx = canvas.getContext('2d', { alpha: false });
    resize();
    assetsReady = true;
  });
  void glLoad;

  const resize = () => {
    vw = shell.clientWidth;
    vh = shell.clientHeight;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    if (gl) { gl.resize(vw, vh); return; }
    if (!ctx) return;                 // nothing to size yet: the renderer is still on its way
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
  // v87: a shorter floor now the pre-match show carries the build-up (was 5–7 s)
  const LOAD_MS = online ? 0 : 3000 + Math.random() * 1000;
  const LOAD_CEILING = 22000;
  const loadEl = root.querySelector('#gmLoad');
  const loadFill = root.querySelector('#gmLoadFill');
  const loadText = root.querySelector('#gmLoadText');
  let loading = true;
  const loadStart = performance.now();
  let assetsReady = false;                  // set by the renderer load above, either path

  // v87: tips between the flavour lines — something useful to read while it loads
  const tips = LOADING_TIPS.slice().sort(() => Math.random() - 0.5);
  const lines = LOADING_LINES.slice().sort(() => Math.random() - 0.5).flatMap((l, i) => (i % 2 === 1 && tips[i >> 1] ? [l, `Tip: ${tips[i >> 1]}`] : [l]));
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
    // v87: the bar is the real thing — what the renderer has loaded and compiled —
    // held back only by the short floor, so it never races ahead of either
    const clock = LOAD_MS ? Math.min(1, elapsed / LOAD_MS) : 1;
    const real = assetsReady ? 1 : Math.min(0.96, gl?.progress ?? 0.1);
    const pct = Math.min(real, Math.max(clock, 0.05));
    loadFill.style.width = `${(pct * 100).toFixed(1)}%`;
    if (elapsed < LOAD_MS) return false;
    if (!assetsReady && elapsed < LOAD_CEILING) return false;

    loading = false;
    clearInterval(lineTimer);
    loadFill.style.width = '100%';
    loadEl.classList.add('done');
    setTimeout(() => { loadEl.hidden = true; }, 420);
    /* The PA welcomes the crowd as the veil lifts — the ground, the two
       sides and the gate. Once per match, and not online, where the two
       machines lift their veils at different moments. */
    const S = getState().settings;
    const bcAllowed = !params.practice && !spectating;
    if (bcAllowed) {
      let inForm = [];
      try { inForm = weekCards('inform').map((c) => baseOf(c)); } catch { /* no promos this week */ }
      const commLang = S.commLang === 'ar' || S.commLang === 'en' ? S.commLang : (lang() === 'ar' ? 'ar' : 'en');
      director = createDirector({
        match, host: shell, pitch: PITCH, clubs: WORLD.clubs, settings: S, lang: commLang, rtl: isRTL(),
        graphics: !online && S.broadcastGfx !== false, clock: !online, final: !!params.final,
        form: formMap({ career: mode === 'career' ? getState().career : null, inForm }),
        venue: match.venue?.stadium?.name || 'the stadium', atmo: match.venue?.atmo || {},
      });
      window.__apexBC = director;
      // subtitles replace the text feed (they carry the same lines, and who said them)
      if (director.gfx && S.subtitles !== false) shell.classList.add('bc-subtitled');
    }
    if (!online && !S.reduceMotion && !view) {
      const kind = S.pregame || 'full';
      if (kind !== 'off' && bcAllowed && !guided && !attract) {
        const [hm, aw] = match.teams;
        const atmo = match.venue?.atmo || {};
        const preLang = director?.desk.lang || 'en';
        pregame = createPregame(shell, {
          kind,
          info: {
            home: hm, away: aw, lang: preLang, derby: director?.derby || null, tossWinner: Math.random() < 0.5 ? 0 : 1,
            venue: match.venue?.stadium?.name || 'The stadium',
            conditions: `${TIME_LABEL[atmo.time] || ''}${atmo.weather ? ` · ${WEATHER_LABEL[atmo.weather]}` : ''}`,
            preview: previewText({ home: hm, away: aw, derby: director?.derby, weather: atmo.weather, final: !!params.final, lang: preLang }),
          },
          onStage: (name) => { if (name === 'walkout' && !walkout) startWalkout(); if (name === 'coin') sfx('coin'); },
          onDone: () => {
            pregame = null;
            shell.classList.remove('pregame-on');
            if (walkout) { walkout = null; stopAnthem(); }
            if (linedUp) { match.resetPositions(0); linedUp = false; }
            sfx('whistle');
            director?.kickoff();
            last = performance.now();
          },
        });
        window.__apexPregame = pregame;
        shell.classList.add('pregame-on');
      } else startWalkout();
      gl?.tifo(true);
    } else { gl?.tifo(true); director?.kickoff(); }
    if (match.venue?.stadium && !online) {
      const st = match.venue.stadium;
      const gate = Math.round((st.capacity || 30000) * (0.7 + match.venue.atmo.intensity * 0.25) / 100) * 100;
      const pa = `Welcome to ${st.name}. Today's match: ${match.teams[0].name} against ${match.teams[1].name}. Attendance ${gate.toLocaleString()}.`;
      announce(pa);
      director?.desk.caption('pa', pa);
    }
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
  const touchOffs = [];                  // v105: listeners the touch layer adds, removed on leaving
  let updateTouchContext = () => {};
  /* Career: the manager holds no stick, so the entire player touch layer —
   * stick zone, action buttons, contextual labels — must not exist. The wheel
   * and the walk arrows are the whole touch surface of a career match. */
  /* v82: two people, one tablet — each half of the screen is one player's:
     a stick that lands under the thumb, and four buttons on the inside edge. */
  const splitTouch = twoUp && window.matchMedia('(pointer: coarse)').matches && window.innerWidth >= 900;
  if (splitTouch) buildSplitTouch(root, inputs);
  if (window.matchMedia('(pointer: coarse)').matches && mode !== 'career' && !splitTouch) {
    touchWrap.hidden = false;
    /* v105: the buttons fan out round the right thumb, sized to the screen
       (components/touchLayout.js); the one-handed layout keeps its column */
    const tpad = root.querySelector('#tpad');
    const layoutPad = () => { if (shell.classList.contains('one-hand')) clearTouchLayout(tpad); else applyTouchLayout(tpad, shell.clientWidth || innerWidth, shell.clientHeight || innerHeight, getState().settings.touchLayout); };
    layoutPad();
    window.addEventListener('resize', layoutPad);
    touchOffs.push(() => window.removeEventListener('resize', layoutPad));
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
      /* v88: capture can throw when the pointer is already gone; unguarded, it
         left stickId set with no stick shown, and every later touch was
         ignored — the stick was dead until that phantom finger lifted */
      try { zone.setPointerCapture(e.pointerId); } catch { /* moves still arrive on the zone itself */ }
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
      shoot: ['shoot', 'SHOOT'], sprint: ['sprint', 'SPRINT'], skill: ['skill', 'SKILL'], lob: ['lob', 'LOB'],
    };
    // a dead ball: the same thumbs, but the labels say what the kick will be
    const SET_PIECE = {
      pass: ['pass', 'SHORT'], through: ['through', 'DRIVEN'], cross: ['cross', 'CROSS'],
      shoot: ['shoot', 'SHOOT'], sprint: [null, ''], skill: [null, ''], lob: [null, ''],
    };
    const THROW_IN = {
      pass: ['pass', 'THROW'], through: ['through', 'LONG'], cross: [null, ''],
      shoot: [null, ''], sprint: [null, ''], skill: [null, ''], lob: [null, ''],
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
    /* v90: the full defending set on touch too — the shoot slot slides in,
       skill is held to jockey, and cross is held to send a team-mate to press. */
    const DEFENDING = {
      pass: ['pass', 'TACKLE'], through: ['switch', 'SWITCH'], cross: ['press', 'PRESS'],
      shoot: ['shoot', 'SLIDE'], sprint: ['sprint', 'SPRINT'], skill: ['jockey', 'JOCKEY'], lob: [null, ''],
    };

    const buttons = [...root.querySelectorAll('.tbtn')].map((el) => {
      const slot = el.dataset.slot;
      let action = IN_POSSESSION[slot][0];
      let swipe = null;
      /* v107: a flick on SHOOT or PASS, in open play with the ball. SHOOT
         flicked up chips the keeper, sideways bends it (finesse); PASS flicked
         up is a lofted ball, any other way a through ball. The flick holds the
         same modifier a keyboard or pad would (LOB, CURL) or presses the same
         button (THROUGH), so the sim sees nothing new. */
      let flick = null;
      const FLICK = 30;                 // px the thumb travels before a press becomes a flick
      const press = (e) => {
        e.preventDefault();
        if (!action) return;
        el.classList.add('is-down');
        /* v79: the skill button is a swipe pad. Its direction is the trick's
           direction; a long swipe adds the sprint modifier, a curved one the
           curl, and one made while SPRINT is held the lob (see game/skills.js). */
        if (action === 'skill') {
          swipe = { x0: e.clientX, y0: e.clientY, mx: e.clientX, my: e.clientY, n: 0 };
          try { el.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
          return;
        }
        input.setTouchButton(action, true);
        flick = (slot === 'shoot' || slot === 'pass') && attacking === true && action === slot ? { x0: e.clientX, y0: e.clientY, id: e.pointerId, mod: null } : null;
        if (getState().settings.rumble !== false) navigator.vibrate?.(8);   // v105: the Vibration switch covers the buttons' tick too
        // Capture keeps a thumb that slides off the button still holding it —
        // but it must never be what decides whether the press counted, so the
        // input is already set and a refusal here is ignored.
        try { el.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
      };
      el.addEventListener('pointermove', (e) => {
        if (flick && !flick.mod && e.pointerId === flick.id) {
          const dx = e.clientX - flick.x0; const dy = e.clientY - flick.y0;
          if (Math.hypot(dx, dy) >= FLICK) {
            const up = -dy > Math.abs(dx) * 0.8;
            flick.mod = slot === 'shoot' ? (up ? 'lob' : dy > Math.abs(dx) ? 'none' : 'curl') : (up ? 'lob' : 'through');
            if (flick.mod !== 'none') {
              input.setTouchButton(flick.mod, true);
              el.dataset.flick = slot === 'shoot' ? (up ? 'CHIP' : 'FINESSE') : (up ? 'LOFTED' : 'THROUGH');
              if (getState().settings.rumble !== false) navigator.vibrate?.(12);
            }
          }
        }
        if (!swipe) return;
        swipe.n += 1;
        if (swipe.n === 4) { swipe.mx = e.clientX; swipe.my = e.clientY; }
        swipe.x1 = e.clientX; swipe.y1 = e.clientY;
      });
      const release = () => {
        el.classList.remove('is-down');
        if (swipe) {
          const x1 = swipe.x1 ?? swipe.x0; const y1 = swipe.y1 ?? swipe.y0;
          const dx = x1 - swipe.x0; const dy = y1 - swipe.y0; const len = Math.hypot(dx, dy);
          let mod = null;
          if (len > 18) {
            const a1 = Math.atan2(swipe.my - swipe.y0, swipe.mx - swipe.x0); const a2 = Math.atan2(y1 - swipe.my, x1 - swipe.mx);
            let bend = Math.abs(a2 - a1); if (bend > Math.PI) bend = Math.PI * 2 - bend;
            mod = input.held('sprint') ? 'lob' : bend > 0.9 ? 'curl' : len > 70 ? 'sprint' : null;
          }
          input.setGesture(len > 18 ? { x: dx / len, y: dy / len, mod } : { x: 0, y: 0, mod: null });
          swipe = null;
          return;
        }
        // release whatever this button is currently bound to, and its other
        // binding too: the context can flip mid-press, and a stuck sprint or a
        // shot that never fires is worse than an extra clear
        input.setTouchButton(IN_POSSESSION[slot][0], false);
        if (DEFENDING[slot][0]) input.setTouchButton(DEFENDING[slot][0], false);
        if (flick) {
          // the modifier outlives the button by a frame: the sim reads it on the shot's release
          const mod = flick.mod; flick = null; delete el.dataset.flick;
          if (mod && mod !== 'none') requestAnimationFrame(() => requestAnimationFrame(() => input.setTouchButton(mod, false)));
        }
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
      const sp = match.setPiece;
      const dead = sp && sp.human && seat && sp.team === seat.team ? sp.kind : null;
      const mine = dead ? `sp:${dead}` : (!!match.ball.owner && seat && match.ball.owner.team === seat.team);
      if (mine !== attacking) {
        attacking = mine;
        const map = dead === 'throwin' ? THROW_IN : dead ? SET_PIECE : mine ? IN_POSSESSION : DEFENDING;
        for (const b of buttons) b.set(map);
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
      fpsEl.textContent = `${Math.round((fpsFrames * 1000) / span)} FPS`;
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
  const frame = (now) => {
    if (!running) return;
    // battery mode: a 30 fps cap (the sim keeps real time; it just draws half as often)
    if (battery && now - lastDraw < 31) { raf = requestAnimationFrame(frame); return; }
    const took = lastDraw ? now - lastDraw : 16.7;
    lastDraw = now;
    if (!loading && gl?.setLoad && getState().settings.governor !== false) {
      const lvl = governor.sample(took);
      if (lvl !== null) gl.setLoad(loadFor(lvl));
    }
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

  const SIM_STEP = 1 / 60;
  let simAcc = 0;
  const latches = new Map();
  const latchFor = (inp) => { let l = latches.get(inp); if (!l) { l = new SimLatch(inp); latches.set(inp, l); } return l; };

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
    for (const inp of inputs) latchFor(inp).absorb();
    dpadTactics?.();
    updateTouchContext();
    if (!loading) showBookings(Math.min(0.1, raw));
    if (loading) tickLoading(now);
    /* When is the world actually stopped?
     * Offline: whenever the menu is up — the sim belongs to this machine.
     * Online: only during the synchronized pause, which the host declares and
     * the guest reads back out of snapshots. The local menu on its own never
     * stops an online match (the other player is still out there). */
    const syncActive = online ? (online.host ? syncLeft > 0 : guestSynced) : false;
    const frozen = ((paused || loading || !!walkout || !!pregame || !!photo) && !online) || syncActive;
    sender?.tick(dt);

    if (photo && input.pressed('pause')) closePhoto();
    else if (input.pressed('pause') && !ended && !loading) {
      if (careerCtx && halfTime && !talkEl.hidden) { /* the talk is modal */ }
      else if (!online) setPaused(!paused);
      else if (!syncActive) {
        /* Every pause input — Options on either pad, Esc, the HUD button (it
         * synthesizes this press) — queues the shared pause AND opens the local
         * non-blocking menu, which keeps subs and tactics reachable mid-play
         * exactly as before. During the synced pause the menu is pinned open:
         * the input neither closes it nor queues anything new. */
        if (spectating) { setPaused(!paused); return; }
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
          replayCamera(replay.cam, match.ball, replay.goalX, t, replay.angle);
          collideCamera(replay.cam, camBounds);
          // advanced against the clock, not the frame: the tape was recorded at
          // 60 Hz, and online both machines roll their own copy — a guest at
          // 30 fps would otherwise sit out twice as much of the match as the
          // host does
          replay.i += playbackSpeed(t) * replay.speed * dt * 60;
        } else {
          // Hold on the finish: the ball sits in the net, everyone frozen, so
          // the goal actually registers before we cut back to the match.
          applyFrame(replay.frames[N - 1]);
          replayCamera(replay.cam, match.ball, replay.goalX, 1, replay.angle);
          collideCamera(replay.cam, camBounds);
          replay.hold += dt;
          const lastPass = replay.pass >= replay.passes.length - 1;
          if (replay.hold >= (lastPass ? HOLD_SECONDS : 0.45)) {
            if (lastPass) endReplay();
            else {
              // the next angle: same tape, a new camera
              replay.pass += 1;
              rtAngle.textContent = `· ANGLE ${replay.pass + 1}/${replay.passes.length}`;
              director?.wipe();
              replay.angle = replay.passes[replay.pass].angle;
              replay.speed = replay.passes[replay.pass].speed;
              replay.i = 0; replay.hold = 0;
              replay.cam = makeCamera();
            }
          }
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
        /* v86: fixed 1/60 s steps, whatever the display does — the match a
           30 fps phone plays is the one the balance sweep measured, and the
           CPU turns as sharply there as on a 144 Hz monitor */
        simAcc = Math.min(simAcc + dt, SIM_STEP * 4);
        const seats = inputs.map(latchFor);
        let n = 0;
        while (simAcc >= SIM_STEP - 1e-6 && n < 4) {
          match.update(SIM_STEP, seats);
          for (const st of seats) st.clear();
          simAcc -= SIM_STEP; n += 1;
        }
      }
      camRig.update(match, dt, cam);
      // a slide just started tears a divot (v78; the renderer paints m.divots)
      for (const tm of match.teams) for (const pl of tm.players) {
        if (pl.slide > 0 && !pl._slid) { (match.divots ||= []).push({ x: pl.x, y: pl.y, a: Math.atan2(pl.dirY || 0, pl.dirX || 1) }); if (match.divots.length > 12) match.divots.shift(); }
        pl._slid = pl.slide > 0;
      }
      tickManager(dt);
      tickCamera(dt);
      match.basis = groundBasis(cam);
      // keep taping through the goal phase, otherwise the clip stops at the line
      if (match.phase === 'play' || match.phase === 'goal') {
        // capture before recording, so the build-up ends on the strike itself
        if (match.phase === 'goal' && lastPhase !== 'goal') captureGoal();
        recordFrame();
      }
      if (match.phase === 'end') {
        // v82: the whistle goes out with a last picture, so every guest sees the end the host saw
        if (online?.host) sendMatch(encodeSnapshot(match));
        ended = true;
        if (attract) { navigate('splash'); return; }
        finish();
      }

      // drain the sim's audio cues
      const outgoing = [];
      while (match.cues.length) {
        const c = match.cues.shift();
        sfx(c.name, c.arg);
        if ((c.name === 'tackle' || c.name === 'foul') && c.arg && typeof c.arg === 'object' && Number.isFinite(c.arg.x)) {
          (match.divots ||= []).push({ x: c.arg.x, y: c.arg.y, a: Math.atan2(c.arg.dirY || 0, c.arg.dirX || 1) });
          if (match.divots.length > 12) match.divots.shift();
        }
        if (c.name === 'post' || c.name === 'save') match.crowdStir = 1; else if (c.name === 'shotWide' || c.name === 'foul') match.crowdStir = Math.max(match.crowdStir || 0, 0.6);
        // the scanned models play a kick, a slide or a header for these moments
        if (c.arg && typeof c.arg === 'object' && c.arg.ref) {
          const act = c.name === 'shot' || c.name === 'pass' || c.name === 'cross' || c.name === 'lob' ? 'kick'
            : c.name === 'tackle' || c.name === 'foul' ? 'tackle' : c.name === 'header' ? 'header' : null;
          if (act) { c.arg._act = act; c.arg._actT = 0.55; }
        }
        rumbleCue(c);
        mgrCue(c.name);
        commentCue(c.name, c.arg);
        director?.cue(c.name, c.arg);
        if (online?.host) outgoing.push([c.name, typeof c.arg === 'object' ? (c.arg?.team ?? 0) : (c.arg ?? 0)]);
      }

      if (online?.host) pendingCues.push(...outgoing);
      // crowd lifts as play nears either goal, and roars through a celebration
      const near = Math.min(match.ball.x, PITCH.w - match.ball.x) / (PITCH.w / 2);
      setCrowd(match.phase === 'goal' ? 1 : 0.3 + (1 - near) * 0.5);
      // the stands sing every so often while the ball is in play, louder when it is close
      chantT -= dt;
      if (chantT <= 0 && match.phase === 'play' && !paused && !replay) {
        chantT = 28 + Math.random() * 30;
        // v78: what they sing follows the score, from the home end's point of view
        const diff = match.teams[0].score - match.teams[1].score;
        const song = diff > 0 ? (Math.random() < 0.7 ? 'winning' : 'clap') : diff < 0 ? (Math.random() < 0.6 ? 'losing' : 'hum') : (Math.random() < 0.5 ? 'level' : 'hum');
        chant(song, 0.35 + (1 - near) * 0.5 + (Math.abs(diff) > 1 && diff > 0 ? 0.15 : 0));
      }
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
        // watchers only ever see what goes through the hub: a match running
        // browser-to-browser has to copy its picture up for them as well
        if (spectators > 0 && p2pActive()) net.send(snap);
      }
    }

    const rdt = frozen && !reel ? 0 : dt;
    if (feedTimer > 0) { feedTimer -= dt; if (feedTimer <= 0) feedEl?.classList.remove('flash'); }
    paintSetPiece();
    if (!loading && !ended) clockCommentary();
    director?.tick(dt, !frozen && !loading && !ended && !replay && !reel);
    if (guided && !loading && !paused && !ended) {
      const stepDef = GUIDE_STEPS[guideIdx];
      if (stepDef) {
        hintsEl.hidden = false;
        hintsEl.textContent = `${guideIdx + 1}/${GUIDE_STEPS.length} · ${t(stepDef.key)}`;
        hintsEl.classList.add('guide');
        guideHold -= dt;
        let ok = false;
        try { ok = stepDef.done(match, input); } catch { ok = false; }
        if (ok && guideHold <= 0) { guideIdx += 1; guideHold = 1.2; sfx('coin'); }
      } else if (hintsEl.textContent !== t('guide.done')) { hintsEl.textContent = t('guide.done'); }
    } else if (wantHints && !loading && !paused) {
      hintTimer -= dt;
      if (hintTimer <= 0) {
        hintTimer = 7;
        if (hintIdx < HINTS.length) { hintsEl.hidden = false; const hn = HINTS[hintIdx++]; hintsEl.textContent = typeof hn === 'function' ? hn() : hn; }
        else hintsEl.hidden = true;
      }
    }
    /* The celebration cut: the goal phase gets its own camera beside the
     * scorer; broadcast resumes for the restart. Not during a replay (which
     * has its own) and not in a career manager cam. */
    let liveCam = cam;
    if (pregame && !walkout) {
      const pg = pregame;              // update() can end the show (and null `pregame`) mid-frame
      pg.update(Math.min(0.25, raw));
      const st = pg.stage(); const pt = pg.t();
      if (st === 'flyover') liveCam = collideCamera(orbitCamera(showCam, pt * 0.8 + 0.4, 118, 52, 0.11), camBounds);
      else if (st === 'handshake' || st === 'coin') {
        lineUp();
        const close = st === 'coin';
        showCam.x = PITCH.w / 2 + (close ? 3.5 : -6 + pt * 3); showCam.y = CY - (close ? 7 : 13); showCam.z = close ? 2.1 : 2.8;
        showCam.tx = PITCH.w / 2; showCam.ty = close ? CY - 1 : CY; showCam.tz = close ? 0.9 : 1.3; showCam.hfov = close ? 40 : 52;
        liveCam = collideCamera(showCam, camBounds);
      } else if (st) liveCam = collideCamera(orbitCamera(showCam, pt * 0.5 + 2.2, 84, 28, 0.06), camBounds);
    } else if (walkout) {
      walkout.t += Math.min(0.25, raw);   // wall clock, so a slow device still walks out in seven seconds
      lineUp();
      /* v78: out of the tunnel. For the first four seconds the two sides walk
         out side by side from the tunnel mouth on the halfway line to where
         they line up, one pair every quarter-second, and the camera starts at
         the tunnel and swings round with them. */
      const W = 4.2;
      if (walkout.t < W) {
        for (let tm = 0; tm < 2; tm++) {
          match.teams[tm].players.slice(0, 11).forEach((p, i) => {
            const f = Math.max(0, Math.min(1, (walkout.t - i * 0.22) / 2.6));
            const ex = p.x; const ey = p.y;
            const sx = PITCH.w / 2 + (tm === 0 ? -0.7 : 0.7); const sy = -4.5;
            p.x = sx + (ex - sx) * f; p.y = sy + (ey - sy) * f;
            const moving = f > 0 && f < 1;
            p.vx = moving ? (ex - sx) / 2.6 : 0; p.vy = moving ? (ey - sy) / 2.6 : 0;
            if (moving) { const h = Math.hypot(p.vx, p.vy) || 1; p.dirX = p.vx / h; p.dirY = p.vy / h; }
          });
        }
        const e = Math.min(1, walkout.t / W); const k = e * e * (3 - 2 * e);
        showCam.x = PITCH.w / 2 - 9 + k * 2; showCam.y = -11 + k * 8; showCam.z = 2.4 + k * 0.6;
        showCam.tx = PITCH.w / 2; showCam.ty = -3 + k * 30; showCam.tz = 1.3; showCam.hfov = 46;
        liveCam = collideCamera(showCam, camBounds);
      } else liveCam = walkoutCamera(showCam, (walkout.t - W) * (walkout.dur / (walkout.dur - W)) * 0.6 + walkout.dur * 0.4, walkout.dur);
      if (walkout.t >= walkout.dur) {
        walkout = null;
        stopAnthem();
        // with the pre-match show on, the handshakes and the toss come first
        if (pregame) pregame.pastWalkout();
        else { match.resetPositions(0); linedUp = false; sfx('whistle'); director?.kickoff(); }
      }
    } else if (photo) {
      liveCam = collideCamera(photoCamera(), camBounds);
    } else if (paused && halfTime && !careerCtx) {
      // the half-time show: a slow orbit of the ground behind the facts
      showT += Math.min(0.25, raw);
      liveCam = collideCamera(orbitCamera(showCam, showT, 74, 24), camBounds);
    } else if (match.phase === 'goal' && !replay && !reel && (!careerCtx || mgr?.camMode !== 'manager')) {
      if (celebT === 0) gl?.setReplay(true);
      celebT += dt;
      liveCam = cam;                     // the rig is already orbiting the scorer
    } else if (celebT > 0) { celebT = 0; if (!replay) gl?.setReplay(false); }
    const shot = replay ? replay.cam : reel ? reel.cam : liveCam;
    if (gl) gl.render(match, shot, rdt);
    else if (ctx) draw(ctx, match, shot, vw, vh, quality, rdt, { hideBanner: paused || loading });

    // goal card rides the celebration phase
    if (match.phase === 'goal' && lastPhase !== 'goal') {
      const t = scoringTeam();
      goalCard.hidden = false;
      goalCard.style.setProperty('--team', t ? t.colors[0] : 'var(--accent)');
      gcScorer.textContent = match.scorerName || '';
      chant('goal', 1);
      if (t && match.scorerName && match.scorerName !== 'Own goal') announce(`Goal for ${t.name}. ${match.scorerName}.`);   // (the desk's goal call carries the subtitle)
      if (t && director) { const lastGoal = t.scorers[t.scorers.length - 1]; director.goal({ team: match.teams.indexOf(t), scorerId: lastGoal?.id, scorerName: match.scorerName, own: !!lastGoal?.own || match.scorerName === 'Own goal' }); }
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
    if (match.phase === 'half' && lastPhase !== 'half' && !online && !ended && !attract) {   // the demo plays straight through
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
        director?.halfTime();
        section = 'facts';
        navIdx = PAUSE_ITEMS.findIndex((it) => it.id === 'facts');
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
    clockEl.textContent = director ? director.clock() : `${match.minute()}'`;
    if (twoUp) {
      padEl.textContent = inputs.map((inp, i) => `P${i + 1} ${inp.pad ? '✓' : 'kbd'}`).join(' · ');
      padEl.classList.toggle('on', inputs.every((inp) => inp.pad || inp.keyMap && Object.keys(inp.keyMap).length));
    } else {
      padEl.textContent = input.pad ? 'Pad ✓' : 'No pad';
      padEl.classList.toggle('on', !!input.pad);
      // v88: on a phone, "No pad" is noise — shown only once a controller is in play
      padEl.hidden = !input.pad && lastDevice() === 'touch';
    }
    if (online) {
      const q = qualityLabel(peerRtt ?? rtt);
      // the host stops broadcasting while it plays its own replay, so a stale
      // stream during one is expected rather than a connection problem
      const lost = view?.stale && !replay;
      // '· direct' = this match is running browser-to-browser, not through the relay
      netEl.textContent = lost ? 'reconnecting…' : spectating ? `👁 Spectating · ${online.oppName}` : `${online.oppName} · ${q.text}${p2pActive() ? ' · direct' : ''}`;
      netEl.className = `gm-net ${lost ? 'bad' : q.cls}`;
    }
    lastScores = [match.teams[0].score, match.teams[1].score];
  };
  raf = requestAnimationFrame(frame);

  /* ----------------------------- fullscreen ---------------------------- */
  /* The camera button: tap through the seven presets. V on a keyboard.
     The choice is saved, so the next match starts on it. */
  const cycleCamera = () => {
    const id = camRig.cyclePreset(1);
    update((st) => { st.settings.camera = { ...(st.settings.camera || {}), ...camRig.settings }; });
    toast(`Camera: ${presetById(id).name}`, 'info');
  };
  root.querySelector('#gmCamBtn')?.addEventListener('click', cycleCamera);
  const onCamKey = (e) => { if (e.code === 'KeyV' && !paused && !ended) cycleCamera(); };
  window.addEventListener('keydown', onCamKey);
  /* v79: quick tactics — five settings from Park the bus to All-out attack,
     on the number keys or the ⚑ button (which steps through them). */
  const myTeam = match.controllers[0]?.team ?? null;
  const setTactic = (id) => {
    if (myTeam === null || paused || ended || online) return;
    if (match.setQuickTactic(myTeam, id)) toast(`Tactic: ${QUICK_TACTICS.find((q) => q.id === id).name}`, 'info');
  };
  root.querySelector('#gmTacBtn')?.addEventListener('click', () => {
    if (myTeam === null) return;
    const cur = QUICK_TACTICS.findIndex((q) => q.id === (match.teams[myTeam].tactics.quick || 'balanced'));
    setTactic(QUICK_TACTICS[(cur + 1) % QUICK_TACTICS.length].id);
  });
  const onTacKey = (e) => { const n = Number(e.key); if (n >= 1 && n <= 5 && !e.repeat) setTactic(QUICK_TACTICS[n - 1].id); };
  window.addEventListener('keydown', onTacKey);
  /* v90: quick tactics on the D-pad — up is a step more attacking, down a step
     more defensive, right straight to all-out attack, left to park the bus. */
  let dpadWas = [false, false, false, false];
  const dpadTactics = () => {
    const pad = input?.pad; if (!pad || myTeam === null || paused || ended) { dpadWas = [false, false, false, false]; return; }
    const now = [12, 13, 14, 15].map((i) => !!pad.buttons[i]?.pressed);
    const was = dpadWas; dpadWas = now;
    const hitD = (k) => now[k] && !was[k];
    if (!(hitD(0) || hitD(1) || hitD(2) || hitD(3))) return;
    const cur = QUICK_TACTICS.findIndex((q) => q.id === (match.teams[myTeam].tactics.quick || 'balanced'));
    const to = hitD(0) ? Math.min(QUICK_TACTICS.length - 1, cur + 1) : hitD(1) ? Math.max(0, cur - 1) : hitD(3) ? QUICK_TACTICS.length - 1 : 0;
    if (to !== cur) setTactic(QUICK_TACTICS[to].id);
  };
  /* v90: rumble — a goal shakes every pad; a shot, a slide, a foul, a save
     or a header only the pad of the person whose player it was. */
  const RUMBLE = { goal: [520, 1, 0.7], post: [220, 0.7, 0.5], shot: [110, 0.35, 0.5], slide: [160, 0.6, 0.3], foul: [200, 0.8, 0.4], save: [140, 0.4, 0.4], header: [90, 0.3, 0.4], volley: [120, 0.4, 0.5], bicycle: [160, 0.6, 0.6] };
  const rumbleCue = (c) => {
    // v105: "not set" is on, as the Settings switch shows it (older saves never rumbled)
    if (getState().settings.rumble === false) return;
    const fx = RUMBLE[c.name]; if (!fx) return;
    /* v105: a phone buzzes too, where it can (Android; iOS Safari has no
       vibration for web pages) — shorter than a pad's rumble, a tap not a shake */
    const buzz = () => { if (!touchWrap.hidden) navigator.vibrate?.(Math.min(60, Math.round(fx[0] * 0.4))); };
    if (c.name === 'goal' || c.name === 'post') { for (const inp of inputs) inp.rumble?.(...fx); buzz(); return; }
    const who = c.arg && typeof c.arg === 'object' && c.arg.ref ? c.arg : null; if (!who) return;
    match.controllers.forEach((ct, i) => { if (match.playerOf(ct) === who) { inputs[i]?.rumble?.(...fx); buzz(); } });
  };
  /* v90: hot-plug. A controller dropping out pauses an offline match (the
     player has lost their hands); one arriving is announced. */
  const onPadGone = (e) => {
    if (online || ended || loading || attract) return;
    if (inputs.some((inp) => inp.pad && inp.pad.index === e.gamepad.index) || lastDevice() === 'pad') {
      if (!paused) setPaused(true);
      toast('Controller disconnected — paused', 'warn');
    }
  };
  const onPadBack = (e) => { if (!ended) toast(`Controller connected${e.gamepad?.id ? '' : ''}`, 'info'); };
  window.addEventListener('gamepaddisconnected', onPadGone);
  window.addEventListener('gamepadconnected', onPadBack);
  const fsBtn = root.querySelector('#gmFs');
  // iPhone has no Fullscreen API — hide the control rather than offer a dead button
  if (!fullscreenSupported()) fsBtn.hidden = true;
  fsBtn.addEventListener('click', () => toggleFullscreen(shell));
  const onFsChange = () => setTimeout(resize, 60);
  document.addEventListener('fullscreenchange', onFsChange);

  /* ---------------------------- pause menu ----------------------------- */
  const PAUSE_ITEMS = [
    { id: 'resume', label: t('pause.resume') },
    { id: 'team', label: t('pause.team') },
    { id: 'subs', label: t('pause.subs') },
    { id: 'facts', label: t('pause.facts') },
    { id: 'controls', label: t('pause.controls') },
    { id: 'sound', label: t('pause.sound') },
    { id: 'photo', label: t('pause.photo') },
    { id: 'leave', label: t('pause.leave') },
  ];
  const PHOTO_FILTERS = [['none', 'None'], ['saturate(1.25) contrast(1.08)', 'Vivid'], ['sepia(.35) contrast(1.05) saturate(1.2)', 'Warm'], ['hue-rotate(-12deg) saturate(.9) contrast(1.1)', 'Cool'], ['grayscale(1) contrast(1.15)', 'Mono'], ['sepia(.6) contrast(.95) brightness(1.05)', 'Film']];
  let photoBar = null;
  function openPhoto() {
    if (!gl) { toast('Photo mode needs the 3D renderer', 'info'); return; }
    photo = { yaw: Math.atan2(cam.y - match.ball.y, cam.x - match.ball.x), pitch: 0.35, dist: 14, fov: 42, filter: 'none' };
    overlay.hidden = true;
    photoBar = document.createElement('div');
    photoBar.className = 'photo-bar';
    photoBar.innerHTML = `
      <div class="photo-filters">${PHOTO_FILTERS.map(([v, l], i) => `<button class="${i === 0 ? 'on' : ''}" data-filter="${v}">${l}</button>`).join('')}</div>
      <div class="photo-actions"><span class="photo-hint">${t('photo.hint')}</span><button class="btn primary" data-photo="save">${t('photo.save')}</button><button class="btn ghost" data-photo="done">${t('photo.done')}</button></div>`;
    root.appendChild(photoBar);
    /* The way out, in the corner where every phone puts its close button —
       the bar at the bottom sat under the home indicator on iPhones and
       people were stuck in photo mode. Esc and the pause button close it too. */
    const photoExit = document.createElement('button');
    photoExit.className = 'icon-btn photo-exit';
    photoExit.setAttribute('aria-label', t('photo.done'));
    photoExit.textContent = '✕';
    photoExit.addEventListener('click', () => closePhoto());
    root.appendChild(photoExit);
    const photoKey = (e) => { if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); closePhoto(); } };
    window.addEventListener('keydown', photoKey);
    photo.exitEl = photoExit; photo.keyOff = () => window.removeEventListener('keydown', photoKey);
    root.classList.add('photo-mode');
    photoBar.addEventListener('click', async (e) => {
      const f = e.target.closest('[data-filter]');
      if (f) { photo.filter = f.dataset.filter; canvas.style.filter = photo.filter; photoBar.querySelectorAll('[data-filter]').forEach((x) => x.classList.toggle('on', x === f)); return; }
      const a = e.target.closest('[data-photo]');
      if (!a) return;
      if (a.dataset.photo === 'save') {
        const blob = await gl.snapshot(match, photoCamera(), photo.filter);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `apexxi-${match.teams[0].short}-${match.teams[1].short}-${match.minute()}.png`;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        toast('Photo saved', 'good');
        return;
      }
      closePhoto();
    });
    let drag = null;
    const down = (e) => { drag = { x: e.clientX, y: e.clientY }; };
    const move = (e) => {
      if (!drag || !photo) return;
      photo.yaw -= (e.clientX - drag.x) * 0.008;
      photo.pitch = Math.max(0.03, Math.min(1.3, photo.pitch + (e.clientY - drag.y) * 0.006));
      drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => { drag = null; };
    const wheel = (e) => { if (photo) { photo.dist = Math.max(3, Math.min(60, photo.dist * (e.deltaY > 0 ? 1.1 : 0.9))); e.preventDefault(); } };
    canvas.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    canvas.addEventListener('wheel', wheel, { passive: false });
    photo.off = () => { canvas.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); canvas.removeEventListener('wheel', wheel); };
  }
  function closePhoto() {
    if (!photo) return;
    photo.off?.();
    photo.keyOff?.();
    photo.exitEl?.remove();
    photo = null;
    canvas.style.filter = '';
    photoBar?.remove(); photoBar = null;
    root.classList.remove('photo-mode');
    paintPause();
    overlay.hidden = false;
  }
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
    const team = match.teams[online ? online.team : (match.human ?? mgr?.side ?? 0)];
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
        ${(() => {
          // v79: the full instructions — defensive style, build-up, width, line and roles
          const segN = (key, label, map) => `
            <div class="p-row"><span>${label}</span><div class="seg">${Object.entries(map).map(([id, o]) => `
              <button class="${team.tactics[key] === id ? 'on' : ''}" data-tactic="${key}" data-val="${id}">${o.name}</button>`).join('')}</div></div>`;
          const slider = (key, label, lo, hi) => `
            <label class="p-row p-slider"><span>${label}</span><small>${lo}</small>
              <input type="range" min="0" max="1" step="0.05" value="${team.tactics[key] ?? 0.5}" data-tactic-range="${key}"><small>${hi}</small></label>`;
          const roleRows = team.players.map((pl, i) => {
            if (pl.role === 'GK') return '';
            const opts = rolesFor(pl.role);
            return `<label class="role-row"><b>${pl.ref.short}</b><select data-role="${i}">${opts.map((o) => `<option value="${o.id}" ${pl.tRole === o.id ? 'selected' : ''}>${o.name}</option>`).join('')}</select></label>`;
          }).join('');
          return `${segN('defStyle', 'Defending', DEF_STYLES)}${segN('buildUp', 'Build-up', BUILD_UPS)}
            ${slider('width', 'Width', 'Narrow', 'Wide')}${slider('line', 'Line', 'Deep', 'High')}
            <details class="p-roles"><summary>Player roles</summary><div class="role-grid">${roleRows}</div></details>`;
        })()}
        <p class="p-note">Changes apply immediately — your shape shifts on the next touch. Quick tactics: 1–5 or ⚑.</p>`;
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
              // and a man who has already come off cannot go back on
              const used = match.cameOff(r.id);
              const ok = (!gkOnly || r.position === 'GK') && !used;
              return `
                <button class="sub-row ${ok ? '' : 'is-off'}" data-subon="${i}"
                        ${subFrom === null || !ok || team.subsLeft <= 0 ? 'disabled' : ''}>
                  <b>${r.overall}</b>
                  <span class="sub-name">${r.short}</span>
                  <em>${used ? 'OFF' : r.position}</em>
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
        ['Expected goals', (h.xg || 0).toFixed(2), (a.xg || 0).toFixed(2)],
        ['Big chances', h.bigChances || 0, a.bigChances || 0],
        ['Corners', h.cornerCount || 0, a.cornerCount || 0],
        ['Fouls', match.fouls?.[0] || 0, match.fouls?.[1] || 0],
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
          : '<p class="p-note">No goals yet.</p>'}
        ${commentLog.length ? `<h3 class="p-sub">Commentary</h3><ul class="p-log">${commentLog.slice(-12).reverse().map((c) => `<li><i>${c.minute}'</i>${c.line}</li>`).join('')}</ul>` : ''}`;
    }
    if (id === 'controls') {
      return `
        <h3>Controls</h3>
        <div class="ctrl-grid compact">
          ${[['✕', 'Pass'], ['◯', 'Shoot — hold for power'], ['◯+R1', 'Curl it up'],
             ['□', 'Cross'], ['△', 'Through ball'], ['L2 / H', 'Skill move — feint past a tackle'],
             ['Select / U', 'Lob over the defence'], ['✕ / □ / △ / ◯', 'Tackle, off the ball'],
             ['L1/R1', 'Switch to nearest'], ['R2', 'Sprint'], ['Options', 'Pause'],
             ['Stick + button', 'Set pieces: aim, then pick the kick']]
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
            ${director && match.half === 1 ? director.halfTimeHTML() : ''}
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
                    data-nav="${i}">${it.id === 'sound' ? `Sound: ${getState().settings.sound === false ? 'Off' : 'On'}` : it.id === 'resume'
                      ? (halfTime ? 'Start Second Half'
                        : (online && (online.host ? syncLeft > 0 : guestSynced)) ? 'Resuming soon…' : it.label)
                      : it.label}</button>`).join('')}
        </nav>
        <div class="pause-panel">${panelFor(section)}</div>
        <div class="pause-hints"><b>✕</b> Select <b>◯</b> Resume</div>
      </div>`;
    if (halfTime && director) director.drawHeat(overlay);
  }

  function activate(id) {
    const syncNow = online ? (online.host ? syncLeft > 0 : guestSynced) : false;
    if (id === 'resume') { if (!syncNow) setPaused(false); return; }
    if (id === 'leave') {
      exitFullscreen();
      if (spectating) { net.send({ t: 'unspectate' }); navigate('online'); return; }
      if (online) { net.send({ t: 'leave' }); navigate('squad'); return; }
      navigate('quick');
      return;
    }
    if (id === 'photo') { openPhoto(); return; }
    if (id === 'sound') {
      // one switch for everything the match makes: crowd, whistle, kicks, commentary cues
      update((st) => { st.settings.sound = st.settings.sound === false; });
      const a = getState().settings;
      setAudioSettings({ enabled: a.sound !== false, music: a.musicVol ?? 0.5, sfx: a.sfxVol ?? 0.9 });
      if (a.sound === false) { stopCrowd(); stopRain(); silenceAnnouncer(); } else { startCrowd(); if (match.venue?.atmo?.wet) startRain(match.venue.atmo.intensity); }
      paintPause();
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
    if (params.final || params.weekend || params.showpiece) gl?.fireworks(16);
    const [ph, pa] = match.possession();
    const [h, a] = match.teams;
    const goals = [...h.scorers.map((s) => [h.short, s]), ...a.scorers.map((s) => [a.short, s])]
      .sort((x, y) => x[1].minute - y[1].minute);

    // Online, "my" side depends on which seat this machine holds.
    const meIdx = online ? online.team : 0;
    const mine = match.teams[meIdx].score;
    const theirs = match.teams[1 - meIdx].score;
    // offered once: after the shootout there is nothing left to settle
    const drawnKickOff = mine === theirs && !online && !params.ultimate && !params.pro && !params.street && !params.skills && !shootoutResult;

    if (online?.party) {
      // v82: only the host's simulation has a result; the co-op season takes it (server/party.js)
      if (online.host) net.send({ t: 'partyResult', scored: match.teams[0].score, conceded: match.teams[1].score });
    } else if (online && !spectating) {
      // A walkover still counts: the player who stayed takes the points.
      const scored = oppGone ? Math.max(mine, theirs + 1) : mine;
      const conceded = oppGone ? theirs : theirs;
      const wl = weekendWindow();
      net.send({
        t: 'result',
        scored,
        conceded,
        divIdx: getState().ultimate.divIdx,
        // inside the weekend window, an online division match counts for it
        wl: wl.open && params.ultimate ? wl.id : null,
      });
    }

    // Apex Division matches settle the ladder instead of paying a flat fee
    let div = null;
    let sub = null;   // v80: a Fives or Squad Clash settlement
    let proLine = null;   // v81: my Player Career line
    let streetRes = null; // v82: a street match's stars and style
    if (spectating) {
      // nothing to bank: it was somebody else's match
    } else if (params.fives) {
      sub = settleFives(h.score, a.score);
    } else if (params.clash) {
      sub = settleClash(params.clash.theme, params.clash.level, h.score, a.score);
    } else if (params.ultimate) {
      div = settleDivisionMatch({
        scored: online ? (oppGone ? Math.max(mine, theirs + 1) : mine) : h.score,
        conceded: online ? theirs : a.score,
        // possession is reported home-first, and "mine" depends on the seat
        possession: online && online.team === 1 ? pa : ph,
      });
      noteDivisionResult((online ? (oppGone ? Math.max(mine, theirs + 1) : mine) : h.score) > (online ? theirs : a.score));
    } else if (params.street) {
      // v82: the street pays for the result and for the style it was won with
      const st = match.styleOf(0);
      streetRes = settleStreet({ venueId: params.street.venueId, game: params.street.game, scored: h.score, conceded: a.score, style: st.points });
      streetRes.style = st;
    } else if (params.pro) {
      /* Player Career: my rating out of ten from the match itself; the score
         goes back in fixture order (my side was fielded as the home team). */
      const rated = rateMatch(match);
      const line = rated.players.find((x) => x.id === params.pro.cardId);
      const score = params.pro.swapped ? [a.score, h.score] : [h.score, a.score];
      proLine = line ? { ...line, motm: rated.potm?.id === line.id } : null;
      advancePro({ score, rating: line?.rating ?? 6, goals: line?.goals || 0, assists: line?.assists || 0, mins: line?.mins ?? 90, motm: !!proLine?.motm, possession: ph });
    } else if (mode === 'career') {
      /* The result flows into the career: my score home-first, the rest of the
       * round simulated, the table and the calendar moved on. Morale carries
       * out of the match — advanceWeek folds the result on top of it. */
      update((s) => { if (s.career) s.career.morale = mgr ? mgr.morale : s.career.morale; });
      // v81: what the match knew — who started, who came on, ratings, scorers, the ball
      advanceWeek([h.score, a.score], careerExtra(match, params.career?.isHome === false ? 1 : 0, params.career?.isHome === false ? pa : ph));
    } else if (params.weekend) {
      // Weekend League pays at the end of the window, by rank; the match itself is tallied below
    } else {
      // a friendly is pocket money next to a division match
      update((s) => { s.club.apex += 200 + (online ? mine : h.score) * 60; });
    }
    /* Everything the result counts for beyond this screen — achievements,
     * season XP, the week's event, the weekend tally — goes through one call. */
    const myScore = online ? (oppGone ? Math.max(mine, theirs + 1) : mine) : h.score;
    const theirScore = online ? theirs : a.score;
    let tourney = null;
    if (params.tournament) tourney = tournament.onResult(myScore, theirScore);
    const prog = spectating ? {} : progress.onMatch({
      mode: params.weekend ? 'weekend' : params.ultimate ? 'ultimate' : mode,
      scored: myScore, conceded: theirScore, online: !!online,
      possession: online && online.team === 1 ? pa : ph, weekend: !!params.weekend,
      sub: params.fives ? 'fives' : params.clash ? 'clash' : null,
    });
    // v80: evolutions move on with every Ultimate XI match the squad plays
    const evoDone = !spectating && params.homeSquad && (params.ultimate || params.fives || params.clash || params.weekend)
      ? recordEvoMatch(match, online ? online.seat : 0, (params.homeSquad.xi || []).map((p) => p.id)) : [];
    if (div?.objectivesDone?.length) progress.onObjective(div.objectivesDone.length);
    if (prog.tiers) toast(`Season Pass: tier up! +${prog.tiers}`, 'good');
    refreshCoins();

    comment('fulltime', h.score >= a.score ? 0 : 1);
    /* v83: the broadcast's full time — the player of the match, ratings, the
       full stat sheet, the momentum graph, the dressing room, a result card. */
    let bcPost = '';
    let ratedAll = null;
    if (director && !params.street && !spectating) {
      ratedAll = rateMatch(match);
      director.fullTime({ potm: ratedAll.potm, ratings: [teamRating(h), teamRating(a)] });
      const mgrName = mode === 'career' ? (getState().career?.manager?.name || 'The manager') : 'The manager';
      const trail = director.trail();
      const rx = reaction({ mine: myScore, theirs: theirScore, comeback: trail[meIdx] > 0 && myScore > theirScore, final: !!params.final, lang: director.desk.lang });
      bcPost = `
        <div class="pm-block">
          ${potmHTML(ratedAll.potm, match)}
          <div class="pm-tabs" role="tablist">
            <button data-pm="ratings">Ratings</button><button data-pm="stats">Stats</button><button data-pm="momentum">Momentum</button><button data-pm="room">Dressing room</button>
          </div>
          <div class="pm-pane" data-pane="ratings" hidden>${ratingsHTML(ratedAll, match)}</div>
          <div class="pm-pane" data-pane="stats" hidden>${statsHTML(match)}</div>
          <div class="pm-pane" data-pane="momentum" hidden>${momentumSVG(director.mom.series(), [h.colors?.[0], a.colors?.[0]]) || '<p class="hint">Not enough of the match to draw.</p>'}</div>
          <div class="pm-pane" data-pane="room" hidden>${reactionHTML(rx, mgrName)}</div>
          <button class="btn ghost" data-o="share">⇪ Share the result card</button>
        </div>`;
    }
    if (params.final && myScore > theirScore && !spectating) {
      const champ = match.teams[meIdx];
      setTimeout(() => { if (running) trophyScene({ title: 'Champions', club: { name: champ.name, short: champ.short, crest: champ.club?.crest }, sub: `${h.short} ${h.score}–${a.score} ${a.short}`, cup: true }); }, 1800);
    }
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="gm-panel glass">
        <span class="gm-ft">${spectating ? (oppGone ? 'Match ended' : 'Full time · spectating') : oppGone ? 'Opponent left — win awarded' : 'Full time'}</span>
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
          <div><b>${h.shots}</b><span>Shots (${h.onTarget} on)</span><b>${a.shots}</b></div>
          <div><b>${(h.xg || 0).toFixed(2)}</b><span>Expected goals</span><b>${(a.xg || 0).toFixed(2)}</b></div>
          <div><b>${h.bigChances || 0}</b><span>Big chances</span><b>${a.bigChances || 0}</b></div>
        </div>
        ${goalClips.length ? `<button class="btn ghost" data-o="highlights">▶ Highlights · ${goalClips.length} goal${goalClips.length > 1 ? 's' : ''}</button>` : ''}
        ${goalClips.length && clipSupported() ? '<button class="btn ghost" data-o="clip">⬇ Save highlights as a clip (WebM)</button>' : ''}
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
        ${sub ? `
          <div class="div-result ${sub.won ? 'up' : ''}">
            <span class="dr-kicker">${params.fives ? 'Quickfire Fives' : 'Squad Clash'}</span>
            <b>${sub.won ? 'Win' : sub.drew ? 'Draw' : 'Defeat'}</b>
            <span class="dr-reward">${params.fives ? `◈ ${sub.apex.toLocaleString()}` : `+${sub.pts} clash points`}</span>
          </div>` : ''}
        ${streetRes ? `
          <div class="div-result ${streetRes.won ? 'up' : ''}">
            <span class="dr-kicker">Street · ${'★'.repeat(streetRes.stars)}${'☆'.repeat(3 - streetRes.stars)}</span>
            <b>${streetRes.style.points} style</b>
            <span class="dr-reward">${streetRes.style.skills} skills · ${streetRes.style.walls} off the wall · ${streetRes.style.stylish} stylish goals · +${streetRes.xp} XP · ◈ ${streetRes.apex}</span>
            ${streetRes.recruit ? `<span class="dr-ladder">${streetRes.recruit} joins your crew</span>` : ''}
            ${streetRes.unlocked.length ? `<span class="dr-ladder">Unlocked: ${streetRes.unlocked.join(', ')}</span>` : ''}
          </div>` : ''}
        ${proLine ? `
          <div class="div-result ${proLine.rating >= 7 ? 'up' : proLine.rating < 6 ? 'down' : ''}">
            <span class="dr-kicker">${proLine.motm ? 'Player of the match' : 'Your rating'}</span>
            <b>${proLine.rating.toFixed(1)}</b>
            <span class="dr-reward">${proLine.goals} goal${proLine.goals === 1 ? '' : 's'} · ${proLine.assists} assist${proLine.assists === 1 ? '' : 's'} · ${proLine.passes} passes · ${proLine.tackles} tackles won · ${proLine.km} km</span>
          </div>` : ''}
        ${evoDone.length ? `<ul class="dr-objs evo-done">${evoDone.map((e) => `<li>✦ ${e.track}: stage ${e.stage} complete</li>`).join('')}</ul>` : ''}
        ${mgr ? `
          <div class="gm-stats mgr-ft">
            <div><b>${Math.round(mgr.morale * 100)}</b><span>Team morale</span><b>${Math.round(mgr.perf * 100)}</b></div>
            <div><span class="mgr-ft-note">Performance — where the touchline left them</span></div>
          </div>` : ''}
        ${bcPost}
        ${graphicsPrompt()}
        ${drawnKickOff && mode !== 'career' ? `
          <button class="btn ghost so-offer" data-o="pens">Settle it on penalties</button>` : ''}
        <div class="gm-btns">
          ${mode === 'career'
            ? `<button class="btn primary" data-o="career">${t('end.continue')}</button>`
            : spectating
            ? '<button class="btn primary" data-o="quit">Back online</button>'
            : online
            ? '<button class="btn primary" data-o="uxi">Back to Ultimate XI</button>'
            : div
              ? '<button class="btn primary" data-o="uxi">Back to Ultimate XI</button>'
              : `<button class="btn primary" data-o="again">${t('end.rematch')}</button>`}
          ${tourney ? `<p class="season-line tourney-line">${tourney.champion ? `🏆 World Tournament champions!` : tourney.out ? 'Out of the World Tournament.' : tourney.advanced ? `Through to the next round: ${tourney.stage === 'r16' ? 'Round of 16' : tourney.stage === 'qf' ? 'Quarter-finals' : tourney.stage === 'sf' ? 'Semi-finals' : tourney.stage === 'final' ? 'the Final' : 'the knockouts'}.` : 'Group stage continues.'}</p>` : ''}
          <button class="btn ghost" data-o="quit">${t('end.quit')}</button>
        </div>
      </div>`;
  }

  overlay.addEventListener('click', (e) => {
    const pm = e.target.closest('[data-pm]');
    if (pm) {
      const open = !pm.classList.contains('on');
      overlay.querySelectorAll('[data-pm]').forEach((b) => b.classList.toggle('on', open && b === pm));
      overlay.querySelectorAll('[data-pane]').forEach((x) => { x.hidden = !open || x.dataset.pane !== pm.dataset.pm; });
      return;
    }
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
      if (o === 'highlights') { playHighlights(); return; }
      if (o === 'share') {
        const cv = drawResultCard(document.createElement('canvas'), {
          home: match.teams[0], away: match.teams[1], score: [match.teams[0].score, match.teams[1].score],
          scorers: match.teams.map((tm) => tm.scorers.map((x) => ({ name: x.name, minute: x.minute }))),
          venue: match.venue?.stadium?.name || '', potm: rateMatch(match).potm,
          pens: shootoutResult ? [shootoutResult.home, shootoutResult.away] : null,
        });
        window.__apexShareCard = cv;
        shareResultCard(cv).then((how) => { if (how === 'downloaded') toast('Result card saved', 'good'); });
        return;
      }
      if (o === 'clip') { recordClip(); return; }
      if (o === 'quit') { exitFullscreen(); if (spectating) { net.send({ t: 'unspectate' }); navigate('online'); return; } if (guided) { finishOnboarding({ played: true }); navigate('today'); return; } if (params.tournament) { navigate('world', { tab: 9 }); return; } if (params.pro) { navigate('pro'); return; } if (params.street) { navigate('street'); return; } if (online?.party) { navigate('online'); return; } navigate(params.weekend ? 'weekend' : online || params.ultimate ? 'squad' : 'quick'); }
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
    if (e.target.closest('[data-role], [data-tactic-range], details, summary')) return;

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
    const teamIdx = online ? online.team : match.human;
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
    const team = online ? online.team : (match.human ?? mgr?.side ?? 0);
    if (key === 'formation') match.applyFormation(team, val);
    else if (key === 'role') { const [i, r] = val; const pl = match.teams[team].players[i]; if (pl) pl.tRole = r; match.teams[team].tactics.roles[i] = r; }
    else match.setTactic(team, key, val);
    if (online && !online.host) net.send({ t: 'evt', k: 'shape', team, key, val });
    // Ultimate XI keeps its instructions for the next match (v79)
    if (params.ultimate && key !== 'formation') update((st) => { st.club.tactics = { ...(st.club.tactics || {}), ...match.teams[team].tactics, roles: { ...match.teams[team].tactics.roles } }; });
  }
  // sliders and role pickers report on change, not click
  overlay.addEventListener('change', (e) => {
    const r = e.target.closest('[data-tactic-range]');
    if (r) { setShape(r.dataset.tacticRange, Number(r.value)); return; }
    const ro = e.target.closest('[data-role]');
    if (ro) setShape('role', [Number(ro.dataset.role), ro.value]);
  });
  if (online?.host) {
    netOffs.push(net.on('evt', (m) => {
      if (m.k === 'sub') { match.substitute(m.team, m.pitchIdx, m.benchIdx); return; }
      if (m.k !== 'shape') return;
      if (m.key === 'formation') match.applyFormation(m.team, m.val);
      else if (m.key === 'role') { const pl = match.teams[m.team].players[m.val?.[0]]; if (pl) pl.tRole = m.val[1]; }
      else match.setTactic(m.team, m.key, m.val);
    }));
  }

  // v82: practice — stage a set piece where the controlled player stands
  if (params.practice) {
    const bar = root.querySelector('#gmPractice');
    bar.hidden = false;
    const stage = (kind) => {
      const me = match.playerOf(match.controllers[0]) || match.teams[0].players[9];
      if (kind === 'penalty') match.awardPenalty(0, null);
      else if (kind === 'corner') match.startCorner(0, Math.random() < 0.5 ? 0 : PITCH.h, match.teams[0].dir > 0 ? PITCH.w : 0);
      else if (kind === 'freekick') match.awardFreeKick(0, { x: me.x, y: me.y }, null);
      else { match.resetPositions(0); match.startPlay(); }
      match.park(1);
    };
    bar.addEventListener('click', (e) => { const b = e.target.closest('[data-prac]'); if (b) stage(b.dataset.prac); });
    const f = params.practice.focus;
    // practice has no kickoff to wait for: skip it, then stage the set piece
    if (f && f !== 'free') setTimeout(() => { if (ended) return; if (match.phase === 'kickoff') match.startPlay(); stage(f); }, 1200);
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

  /* v95: the attract demo's way out. Any key, tap, click or controller
   * button goes back to the title; so does the final whistle (in the loop)
   * and, as a backstop, a hard cap on the demo's length. */
  let attractOff = () => {};
  if (attract) {
    shell.classList.add('attract');
    const banner = document.createElement('div');
    banner.className = 'gm-attract';
    banner.innerHTML = '<b>Demo</b><span>Press any button to play</span>';
    shell.appendChild(banner);
    let left = false;
    const leave = (e) => { if (left) return; left = true; e?.preventDefault?.(); e?.stopPropagation?.(); navigate('splash'); };
    const held = new Set();
    for (const g of navigator.getGamepads ? [...navigator.getGamepads()] : []) if (g) g.buttons.forEach((b, i) => { if (b.pressed) held.add(`${g.index}:${i}`); });
    const padPoll = setInterval(() => {
      for (const g of navigator.getGamepads ? [...navigator.getGamepads()] : []) {
        if (!g?.connected) continue;
        g.buttons.forEach((b, i) => { const k = `${g.index}:${i}`; if (b.pressed && !held.has(k)) leave(); else if (!b.pressed) held.delete(k); });
      }
    }, 90);
    const cap = setTimeout(() => leave(), (params.attractSecs || 180) * 1000);
    window.addEventListener('keydown', leave, true);
    window.addEventListener('pointerdown', leave, true);
    attractOff = () => {
      clearInterval(padPoll); clearTimeout(cap);
      window.removeEventListener('keydown', leave, true);
      window.removeEventListener('pointerdown', leave, true);
    };
  }

  return () => {
    // the loop re-arms itself from a `finally`, so leaving has to say stop as
    // well as cancelling the frame already in flight
    running = false;
    cancelAnimationFrame(raf);
    attractOff();
    touchOffs.forEach((off) => off());
    /* Give the document back FIRST. `in-game` puts overflow:hidden on the
     * body, and it used to be removed after gl.dispose() — so a throwing GPU
     * teardown left the whole app unscrollable until a reload. The disposals
     * are each guarded for the same reason: none of them is allowed to stop
     * the ones after it. navigate() also clears the class as a backstop. */
    document.body.classList.remove('in-game');
    if (mgr) window.removeEventListener('keydown', onWheelKey);
    stopP2P();
    if (spectating && net.isReady()) net.send({ t: 'unspectate' });
    stopClip();
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onCamKey); window.removeEventListener('keydown', onTacKey);
    window.removeEventListener('gamepaddisconnected', onPadGone); window.removeEventListener('gamepadconnected', onPadBack);
    document.removeEventListener('fullscreenchange', onFsChange);
    try { stopCrowd(); stopRain(); silenceAnnouncer(); stopAnthem(); stopHighlightsBed(); photo?.off?.(); } catch { /* audio teardown must not block the rest */ }
    try { pregame?.destroy(); director?.destroy(); } catch { /* the broadcast layer is DOM only */ }
    if (window.__apexBC === director) window.__apexBC = null;
    try { gl?.dispose(); } catch { /* GPU teardown least of all */ }
    for (const inp of inputs) { try { inp.destroy?.(); } catch { /* ditto */ } }
    // tell the hub we are gone, so the other player is not left waiting
    if (online && !ended) net.send({ t: 'leave' });
    netOffs.forEach((off) => off());
  };
}
