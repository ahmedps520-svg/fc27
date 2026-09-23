/**
 * APEX XI audio. Everything here is synthesised at runtime with the Web Audio
 * API — no sample files, so there is nothing to download, nothing to license,
 * and it all works offline.
 *
 * Browsers refuse to start audio until the page has been interacted with, so the
 * context is created lazily and resumed at the first opportunity. Everything
 * here is written to survive that wait: nothing is scheduled while the context
 * is suspended, because a suspended context's clock is stopped — notes queued
 * against it all pile up at the same instant and arrive as one blare the moment
 * it resumes. `armed` remembers what should be playing and starts it for real
 * once the context is running.
 */

let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let noiseBuf = null;
let ready = false;
let armed = false;              // music wanted as soon as the context allows it

let crowdNodes = null;
let crowdLevel = 0;
let musicTimer = null;
let musicStep = 0;

const settings = { master: 0.9, music: 0.5, sfx: 0.9, enabled: true };

/* ------------------------------- plumbing ------------------------------- */
function makeNoise() {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;      // a little brown tilt, less hissy
    d[i] = (white * 0.7 + last * 3) * 0.35;
  }
  return buf;
}

export function initAudio() {
  if (ready) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = settings.enabled ? settings.master : 0;
  master.connect(ctx.destination);

  musicBus = ctx.createGain();
  musicBus.gain.value = settings.music;
  musicBus.connect(master);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = settings.sfx;
  sfxBus.connect(master);

  noiseBuf = makeNoise();
  // The context can be suspended out from under us — a phone locking, a tab
  // going to the background — so the music loop is rebuilt from whatever state
  // it lands in rather than assumed to still be running.
  ctx.onstatechange = () => {
    if (ctx.state === 'running') { if (armed) startMusic(); }
    else stopMusicLoop();
  };
  ready = true;
  return true;
}

export const audioState = () => (ready && ctx ? ctx.state : 'off');

/**
 * Try to start (or restart) audio. Safe to call as often as you like — from a
 * gesture, on regaining focus, or speculatively at load, where it succeeds on
 * the browsers that allow it and quietly does nothing on the ones that don't.
 */
export function resumeAudio() {
  if (!ready && !initAudio()) return Promise.resolve(false);
  if (ctx.state === 'running') { if (armed) startMusic(); return Promise.resolve(true); }
  return ctx.resume().then(() => {
    if (armed) startMusic();
    return ctx.state === 'running';
  }).catch(() => false);
}

export function setAudioSettings(next) {
  Object.assign(settings, next);
  if (!ready) return;
  master.gain.value = settings.enabled ? settings.master : 0;
  musicBus.gain.value = settings.music;
  sfxBus.gain.value = settings.sfx;
}

export function getAudioSettings() { return { ...settings }; }

const now = () => ctx.currentTime;

/** Simple oscillator voice with an envelope and optional pitch slide. */
function tone({
  freq = 440, to = null, type = 'sine', dur = 0.2, gain = 0.3,
  attack = 0.005, bus = null, detune = 0, delay = 0,
}) {
  const t = now() + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus || sfxBus);
  o.start(t);
  o.stop(t + dur + 0.05);
  return { o, g };
}

/** Filtered noise burst — impacts, crowd, whooshes. */
function noise({
  dur = 0.2, gain = 0.3, type = 'bandpass', freq = 1200, to = null,
  q = 1, bus = null, delay = 0, attack = 0.005,
}) {
  const t = now() + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (to) f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(bus || sfxBus);
  src.start(t);
  src.stop(t + dur + 0.05);
  return { src, g, f };
}

/* -------------------------------- sounds -------------------------------- */
const SOUNDS = {
  // --- ball ---
  pass() {
    noise({ dur: 0.075, gain: 0.24, type: 'highpass', freq: 900, q: 0.7 });
    tone({ freq: 190, to: 90, type: 'sine', dur: 0.09, gain: 0.3 });
  },
  shot(power = 1) {
    noise({ dur: 0.11, gain: 0.3 + power * 0.2, type: 'highpass', freq: 700, q: 0.8 });
    tone({ freq: 230, to: 55, type: 'triangle', dur: 0.16, gain: 0.34 + power * 0.2 });
  },
  cross() {
    noise({ dur: 0.1, gain: 0.26, type: 'highpass', freq: 800 });
    tone({ freq: 210, to: 80, type: 'sine', dur: 0.13, gain: 0.3 });
    noise({ dur: 0.5, gain: 0.06, type: 'bandpass', freq: 1600, to: 700, delay: 0.05 });
  },
  header() {
    tone({ freq: 150, to: 70, type: 'sine', dur: 0.12, gain: 0.32 });
    noise({ dur: 0.06, gain: 0.18, type: 'lowpass', freq: 900 });
  },
  bounce() {
    tone({ freq: 130, to: 70, type: 'sine', dur: 0.07, gain: 0.16 });
  },
  // the soft tap of a dribbler knocking the ball on
  touch() {
    tone({ freq: 165, to: 95, type: 'sine', dur: 0.05, gain: 0.07 });
    noise({ dur: 0.035, gain: 0.05, type: 'highpass', freq: 1600 });
  },
  tackle() {
    noise({ dur: 0.16, gain: 0.28, type: 'bandpass', freq: 420, to: 180, q: 0.8 });
  },
  post() {
    tone({ freq: 1350, to: 900, type: 'triangle', dur: 0.5, gain: 0.3 });
    tone({ freq: 2020, type: 'sine', dur: 0.35, gain: 0.12 });
    SOUNDS.crowdOoh(0.85);                          // v78: the ground goes "ooh" at the woodwork
  },
  // v78: a near miss draws a groan, a foul draws boos from the stands
  shotWide() { SOUNDS.crowdOoh(0.45); },
  foul() {
    noise({ dur: 0.1, gain: 0.2, type: 'bandpass', freq: 380, q: 0.9 });
    SOUNDS.crowdBoo(0.6);
  },
  card() { SOUNDS.crowdBoo(0.4); },
  crowdBoo(level = 0.6) {
    // a low, sustained "ooo" — the vowel of a boo, rather than the rising ooh
    [[240, 4], [520, 6]].forEach(([f, q], i) => {
      noise({ dur: 1.6, gain: 0.08 * level * (1 - i * 0.35), type: 'bandpass', freq: f, to: f * 0.9, q, attack: 0.25 });
    });
  },
  net() {
    noise({ dur: 0.28, gain: 0.14, type: 'bandpass', freq: 2600, to: 1100, q: 0.6 });
  },

  // --- keeper / crowd reactions ---
  save() {
    noise({ dur: 0.12, gain: 0.26, type: 'lowpass', freq: 1400 });
    SOUNDS.crowdOoh(0.55);
  },
  // vowel-shaped so it reads as "oooh" from a stand rather than a gust of wind
  crowdOoh(level = 0.6) {
    [[430, 5], [900, 7], [2300, 9]].forEach(([f, q], i) => {
      noise({
        dur: 1.2, gain: 0.09 * level * (1 - i * 0.28), type: 'bandpass',
        freq: f, to: f * 0.62, q, attack: 0.2,
      });
    });
  },
  crowdGasp() {
    [[620, 6], [1400, 8]].forEach(([f, q], i) => {
      noise({ dur: 0.75, gain: 0.08 * (1 - i * 0.3), type: 'bandpass', freq: f, to: f * 0.7, q, attack: 0.05 });
    });
  },

  // --- whistles ---
  whistle(blasts = 1) {
    for (let i = 0; i < blasts; i++) {
      const d = i * 0.28;
      const { o } = tone({ freq: 2450, type: 'sine', dur: 0.22, gain: 0.22, delay: d, attack: 0.012 });
      // the warble that makes a pea whistle sound like one
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = 42;
      lg.gain.value = 90;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(now() + d);
      lfo.stop(now() + d + 0.3);
      tone({ freq: 3300, type: 'sine', dur: 0.2, gain: 0.07, delay: d });
    }
  },

  // --- goal ---
  goal() {
    // Roar built from vowel formants so it sounds like a stand full of people
    // rather than a wall of hiss, plus scattered shouts riding on top.
    [[420, 3.5, 0.30], [980, 5, 0.22], [2100, 7, 0.13], [3400, 8, 0.06]]
      .forEach(([f, q, g]) => {
        noise({ dur: 3.4, gain: g, type: 'bandpass', freq: f * 0.75, to: f * 1.15, q, attack: 0.4 });
      });
    for (let i = 0; i < 9; i++) {
      const base = 300 + Math.random() * 700;
      noise({
        dur: 0.3 + Math.random() * 0.6, gain: 0.05 + Math.random() * 0.05,
        type: 'bandpass', freq: base, to: base * 1.4,
        q: 6 + Math.random() * 6, attack: 0.05, delay: 0.1 + Math.random() * 1.6,
      });
    }
    // stadium horn: a fifth stack
    [220, 330, 440].forEach((f, i) => {
      tone({ freq: f, type: 'sawtooth', dur: 1.5, gain: 0.09, delay: 0.05 + i * 0.03 });
    });
    tone({ freq: 110, type: 'sine', dur: 1.2, gain: 0.16, delay: 0.05 });
  },

  // --- menus ---
  move() { tone({ freq: 620, type: 'triangle', dur: 0.05, gain: 0.1 }); },
  select() {
    tone({ freq: 880, type: 'triangle', dur: 0.07, gain: 0.14 });
    tone({ freq: 1320, type: 'sine', dur: 0.09, gain: 0.07, delay: 0.03 });
  },
  back() { tone({ freq: 420, to: 300, type: 'triangle', dur: 0.09, gain: 0.11 }); },
  error() { tone({ freq: 200, to: 150, type: 'square', dur: 0.16, gain: 0.1 }); },
  coin() {
    tone({ freq: 1180, type: 'square', dur: 0.06, gain: 0.08 });
    tone({ freq: 1560, type: 'square', dur: 0.1, gain: 0.07, delay: 0.05 });
  },

  // --- packs ---
  packRise(ms = 2600) {
    const d = ms / 1000;
    noise({ dur: d, gain: 0.13, type: 'bandpass', freq: 300, to: 4200, q: 0.7, attack: d * 0.7 });
    tone({ freq: 110, to: 660, type: 'sawtooth', dur: d, gain: 0.05 });
  },
  packStep(i = 0) {
    tone({ freq: 520 + i * 180, type: 'triangle', dur: 0.16, gain: 0.14 });
    tone({ freq: 1040 + i * 360, type: 'sine', dur: 0.2, gain: 0.06, delay: 0.02 });
  },
  reveal(rarity = 'silver') {
    const map = { bronze: 0, silver: 1, gold: 2, special: 3 };
    const lvl = map[rarity] ?? 1;
    const root = [392, 440, 523, 659][lvl];
    [0, 4, 7, 12].slice(0, 2 + lvl).forEach((semi, i) => {
      tone({
        freq: root * (2 ** (semi / 12)), type: 'sine',
        dur: 0.9 + lvl * 0.25, gain: 0.12, delay: i * 0.05,
      });
    });
    noise({ dur: 0.7, gain: 0.06 + lvl * 0.02, type: 'highpass', freq: 3000 });
    if (lvl === 3) {
      noise({ dur: 2.2, gain: 0.2, type: 'bandpass', freq: 500, to: 1400, q: 0.5, attack: 0.3 });
    }
  },
};

export function sfx(name, ...args) {
  if (!settings.enabled || !settings.sfx) return;
  if (!ready && !initAudio()) return;
  if (ctx.state === 'suspended') return;
  const fn = SOUNDS[name];
  if (fn) { try { fn(...args); } catch { /* never let a sound break the game */ } }
}

/* -------------------------- crowd ambience bed -------------------------- */
/**
 * A crowd is thousands of voices, not wind. Filtered noise on its own reads as
 * air, so the bed runs through vowel formants, gets an uneven murmur on top of
 * it, and has individual shouts thrown in — that irregularity is what makes it
 * sound like people.
 */
const FORMANTS = [
  { f: 480, q: 4.5, g: 1.0 },     // "ah" body
  { f: 1180, q: 6, g: 0.62 },     // vowel colour
  { f: 2450, q: 8, g: 0.3 },      // consonant edge
  { f: 3600, q: 9, g: 0.13 },     // air off the top of the stands
];

export function startCrowd() {
  if (!ready && !initAudio()) return;
  if (crowdNodes) return;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  src.playbackRate.value = 0.8;

  const sum = ctx.createGain();
  sum.gain.value = 1;

  const bands = FORMANTS.map((fm) => {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = fm.f;
    bp.Q.value = fm.q;
    const bg = ctx.createGain();
    bg.gain.value = fm.g;
    src.connect(bp).connect(bg).connect(sum);
    return { bp, bg };
  });

  // murmur: a wobble that is deliberately not periodic
  const murmur = ctx.createGain();
  murmur.gain.value = 1;
  const lfoA = ctx.createOscillator();
  const lgA = ctx.createGain();
  lfoA.frequency.value = 0.23;
  lgA.gain.value = 0.22;
  const lfoB = ctx.createOscillator();
  const lgB = ctx.createGain();
  lfoB.frequency.value = 0.71;
  lgB.gain.value = 0.11;
  lfoA.connect(lgA).connect(murmur.gain);
  lfoB.connect(lgB).connect(murmur.gain);

  const out = ctx.createGain();
  out.gain.value = 0.0001;
  sum.connect(murmur).connect(out).connect(sfxBus);

  src.start();
  lfoA.start();
  lfoB.start();

  // individual voices rising out of the mass every so often
  const voices = setInterval(() => {
    if (!crowdNodes) return;
    const chance = 0.25 + crowdLevel * 0.6;
    if (Math.random() > chance) return;
    const base = 260 + Math.random() * 520;
    noise({
      dur: 0.25 + Math.random() * 0.5,
      gain: (0.02 + crowdLevel * 0.05) * (0.5 + Math.random()),
      type: 'bandpass', freq: base, to: base * (0.7 + Math.random() * 0.7),
      q: 5 + Math.random() * 6, attack: 0.06,
    });
  }, 420);

  crowdNodes = { src, out, bands, lfoA, lfoB, voices };
  setCrowd(0.35);
}

export function setCrowd(level) {
  crowdLevel = Math.max(0, Math.min(1, level));
  if (!crowdNodes) return;
  const t = now();
  crowdNodes.out.gain.setTargetAtTime(0.035 + crowdLevel * 0.16, t, 0.7);
  // excitement opens the upper formants — the crowd gets shriller, not just louder
  crowdNodes.bands.forEach((b, i) => {
    b.bg.gain.setTargetAtTime(FORMANTS[i].g * (0.75 + crowdLevel * 0.7), t, 0.9);
  });
}

export function stopCrowd() {
  if (!crowdNodes) return;
  const { src, out, lfoA, lfoB, voices } = crowdNodes;
  clearInterval(voices);
  try {
    out.gain.setTargetAtTime(0.0001, now(), 0.25);
    src.stop(now() + 1.2);
    lfoA.stop(now() + 1.2);
    lfoB.stop(now() + 1.2);
  } catch { /* already stopped */ }
  crowdNodes = null;
}

/* ------------------------------- rain bed ------------------------------- */
/** Rain: two bands of noise, one hiss and one patter, modulated so it gusts. */
let rainNodes = null;
export function startRain(intensity = 0.6) {
  if (!ready && !initAudio()) return;
  if (rainNodes) { setRain(intensity); return; }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf; src.loop = true; src.playbackRate.value = 1.1;
  const hiss = ctx.createBiquadFilter(); hiss.type = 'highpass'; hiss.frequency.value = 2400; hiss.Q.value = 0.5;
  const patter = ctx.createBiquadFilter(); patter.type = 'bandpass'; patter.frequency.value = 900; patter.Q.value = 0.9;
  const pg = ctx.createGain(); pg.gain.value = 0.35;
  const gust = ctx.createGain(); gust.gain.value = 1;
  const lfo = ctx.createOscillator(); const lg = ctx.createGain();
  lfo.frequency.value = 0.09; lg.gain.value = 0.25; lfo.connect(lg).connect(gust.gain);
  const out = ctx.createGain(); out.gain.value = 0.0001;
  src.connect(hiss).connect(gust); src.connect(patter).connect(pg).connect(gust);
  gust.connect(out).connect(sfxBus);
  src.start(); lfo.start();
  rainNodes = { src, out, lfo };
  setRain(intensity);
}
export function setRain(intensity) {
  if (!rainNodes) return;
  rainNodes.out.gain.setTargetAtTime(0.03 + Math.max(0, Math.min(1, intensity)) * 0.09, now(), 1.2);
}
export function stopRain() {
  if (!rainNodes) return;
  const { src, out, lfo } = rainNodes;
  try { out.gain.setTargetAtTime(0.0001, now(), 0.4); src.stop(now() + 1.5); lfo.stop(now() + 1.5); } catch { /* stopped */ }
  rainNodes = null;
}

/* -------------------------------- chants -------------------------------- */
/**
 * A terrace chant: a clap pattern and a hummed line sung by the mass, all
 * generated — a chorus of detuned saws through the crowd's own vowel filter,
 * so it sounds like a stand singing rather than a synth. Three patterns, and
 * the goal one is the longest.
 */
const CHANTS = {
  // [beat, note] pairs in eighths at 132 bpm; note 0 = rest; claps are 'x'
  clap:  { steps: [['x'], ['x'], [], ['x'], ['x'], ['x'], [], []], bars: 2, notes: false },
  hum:   { steps: [[60], [60], [63], [65], [], [65], [63], [60]], bars: 2, notes: true },
  goal:  { steps: [[67], [67], [], [67], [65], [63], [65], [60]], bars: 3, notes: true },
  // v78: the stands sing with the scoreline — a bouncing major line when
  // winning, a slow minor one of defiance when losing, a drum-and-clap when level
  winning: { steps: [[64], [67], [72], [], [72], [71], [69], [67]], bars: 3, notes: true },
  losing:  { steps: [[57], [], [60], [], [59], [57], [], []], bars: 2, notes: true },
  level:   { steps: [['x'], [], ['x'], ['x'], [], ['x'], ['x'], ['x']], bars: 3, notes: false },
};
let chantUntil = 0;
export function chant(kind = 'hum', level = 0.6) {
  if (!settings.enabled || !settings.sfx) return;
  if (!ready && !initAudio()) return;
  if (ctx.state === 'suspended') return;
  const c = CHANTS[kind] || CHANTS.hum;
  const t0 = now();
  if (t0 < chantUntil) return;                       // one at a time
  const eighth = 60 / 132 / 2;
  const total = c.steps.length * c.bars * eighth;
  chantUntil = t0 + total + 1;
  const vowel = ctx.createBiquadFilter(); vowel.type = 'bandpass'; vowel.frequency.value = 620; vowel.Q.value = 1.2;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
  const out = ctx.createGain(); out.gain.value = 0.0001;
  vowel.connect(lp).connect(out).connect(sfxBus);
  out.gain.setTargetAtTime(0.05 + level * 0.09, t0, 0.3);
  out.gain.setTargetAtTime(0.0001, t0 + total - 0.3, 0.25);
  for (let b = 0; b < c.bars; b++) {
    c.steps.forEach((step, i) => {
      const t = t0 + (b * c.steps.length + i) * eighth;
      for (const v of step) {
        if (v === 'x') {
          noise({ dur: 0.08, gain: 0.14 + level * 0.12, type: 'bandpass', freq: 1500, q: 1.2, delay: t - t0, attack: 0.004 });
          continue;
        }
        if (!c.notes) continue;
        const f = 440 * Math.pow(2, (v - 69) / 12) / 2;   // sung an octave down: a crowd, not a choir
        for (const det of [-9, -3, 4, 11]) {
          const o = ctx.createOscillator(); o.type = 'sawtooth';
          o.frequency.value = f; o.detune.value = det * 3;
          const g = ctx.createGain(); g.gain.value = 0.0001;
          g.gain.setTargetAtTime(0.09, t, 0.05);
          g.gain.setTargetAtTime(0.0001, t + eighth * 0.85, 0.06);
          o.connect(g).connect(vowel);
          o.start(t); o.stop(t + eighth * 1.2);
        }
      }
    });
  }
}

/* ------------------------------ the announcer ------------------------------ */
/**
 * The stadium PA, through the browser's own speech synthesis — no recorded
 * voice, nothing downloaded, and silent where the platform offers nothing.
 * Lines are queued behind each other and never over the top of one another.
 */
let paQueue = [];
let paBusy = false;
function paNext() {
  if (paBusy || !paQueue.length) return;
  const text = paQueue.shift();
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 0.85; u.volume = Math.min(1, settings.sfx * settings.master * 0.7);
    const voices = speechSynthesis.getVoices?.() || [];
    const en = voices.find((v) => /^en(-|_)?(GB|US)?/i.test(v.lang) && !/female/i.test(v.name)) || voices.find((v) => /^en/i.test(v.lang));
    if (en) u.voice = en;
    paBusy = true;
    u.onend = u.onerror = () => { paBusy = false; setTimeout(paNext, 350); };
    speechSynthesis.speak(u);
  } catch { paBusy = false; }
}
export function announce(text) {
  if (!settings.enabled || !settings.sfx) return;
  if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return;
  if (paQueue.length > 3) paQueue.shift();
  paQueue.push(String(text));
  paNext();
}
export function silenceAnnouncer() {
  paQueue = [];
  try { speechSynthesis?.cancel?.(); } catch { /* none */ }
  paBusy = false;
}

/* -------------------------------- anthem -------------------------------- *
 * The walk-out anthem: brass-like saw stacks over a slow chord bed, a
 * timpani roll and a crowd swell, generated on the spot and different for
 * each home side (the seed picks the key and the melody shape). */
let anthemNodes = null;
export function startAnthem(seed = 1) {
  if (!settings.enabled || !settings.music) return;
  if (!ready && !initAudio()) return;
  if (ctx.state === 'suspended') return;
  stopAnthem();
  let a = seed >>> 0 || 1;
  const rnd = () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const root = 48 + Math.floor(rnd() * 5);          // C3..E3
  const PROG = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7]];
  const MEL = [0, 4, 7, 12, 11, 7, 9, 4, 5, 7, 12, 14, 12, 7, 4, 0].map((n) => n + (rnd() < 0.5 ? 0 : 12));
  const beat = 0.62;
  const t0 = now();
  const out = ctx.createGain(); out.gain.value = 0.0001;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
  lp.connect(out).connect(musicBus);
  out.gain.setTargetAtTime(0.16, t0, 0.8);
  const f = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const stops = [];
  // chord bed: two saws per note, detuned, four bars
  PROG.forEach((chord, bar) => {
    const tb = t0 + bar * beat * 4;
    for (const n of chord) for (const det of [-6, 6]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f(root + n); o.detune.value = det;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.setTargetAtTime(0.045, tb, 0.25); g.gain.setTargetAtTime(0.0001, tb + beat * 3.7, 0.2);
      o.connect(g).connect(lp); o.start(tb); o.stop(tb + beat * 4.4); stops.push(o);
    }
  });
  // melody: brass-ish (saw + square) an octave up
  MEL.forEach((n, i) => {
    const t = t0 + i * beat;
    for (const type of ['sawtooth', 'square']) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f(root + 12 + n);
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.setTargetAtTime(type === 'square' ? 0.03 : 0.06, t, 0.04); g.gain.setTargetAtTime(0.0001, t + beat * 0.8, 0.08);
      o.connect(g).connect(lp); o.start(t); o.stop(t + beat * 1.1); stops.push(o);
    }
  });
  // timpani on the bar
  for (let b = 0; b < 4; b++) tone({ freq: f(root - 12), to: f(root - 14), type: 'sine', dur: 0.5, gain: 0.35, delay: b * beat * 4, attack: 0.01 });
  // crowd swell under it all
  noise({ dur: beat * 16, gain: 0.05, type: 'bandpass', freq: 500, to: 900, q: 1.5, attack: 2 });
  anthemNodes = { out, stops };
  setTimeout(() => { if (anthemNodes && anthemNodes.out === out) anthemNodes = null; }, beat * 16 * 1000 + 800);
}
export function stopAnthem() {
  if (!anthemNodes) return;
  try { anthemNodes.out.gain.setTargetAtTime(0.0001, now(), 0.3); for (const o of anthemNodes.stops) o.stop(now() + 0.8); } catch { /* done */ }
  anthemNodes = null;
}

/* ------------------------------ lobby music ----------------------------- *
 * v83: a playlist. Every track is generated here from a chord loop, a pad, an
 * arpeggio pattern and a beat — no samples, nothing downloaded, nothing
 * anybody else wrote. A track plays for its length in bars and the next one
 * follows; the menu's player skips, goes back and mutes. The first track is
 * the original v1 loop. */
const N = (m) => 440 * 2 ** ((m - 69) / 12);          // MIDI note → Hz
const tri = (r, q = 'min') => [N(r), N(r + (q === 'min' ? 3 : 4)), N(r + 7)];
export const TRACKS = [
  { name: 'Floodlight Hum', bar: 3.2, bars: 24, chords: [tri(57), tri(53, 'maj'), tri(55, 'maj'), tri(52)], arp: [0, 1, 2, 1, 0, 1, 2, 3], pad: 'sawtooth', beat: 'pulse' },
  { name: 'Terrace Sunrise', bar: 2.4, bars: 32, chords: [tri(60, 'maj'), tri(55, 'maj'), tri(57), tri(53, 'maj')], arp: [0, 2, 1, 2, 0, 2, 1, 3], pad: 'triangle', beat: 'four' },
  { name: 'Desert Night Drive', bar: 2.8, bars: 28, chords: [tri(62), tri(58, 'maj'), tri(60, 'maj'), tri(57)], arp: [0, 1, 2, 3, 2, 1, 0, 1], pad: 'sawtooth', beat: 'half' },
  { name: 'Matchday Morning', bar: 2.2, bars: 32, chords: [tri(55, 'maj'), tri(52), tri(60, 'maj'), tri(62, 'maj')], arp: [0, 1, 2, 1, 2, 3, 2, 1], pad: 'square', beat: 'four' },
  { name: 'Tunnel Lights', bar: 3.0, bars: 24, chords: [tri(52), tri(48, 'maj'), tri(55, 'maj'), tri(50, 'maj')], arp: [0, 2, 0, 3, 0, 2, 0, 1], pad: 'sawtooth', beat: 'pulse' },
  { name: 'Rooftop Five', bar: 2.0, bars: 40, chords: [tri(58), tri(61, 'maj'), tri(63, 'maj'), tri(56, 'maj')], arp: [0, 1, 0, 2, 0, 3, 2, 1], pad: 'triangle', beat: 'break' },
];
/** The highlights bed: brighter and quicker, used only under the reel. */
export const HIGHLIGHTS_BED = { name: 'Highlights', bar: 1.9, bars: 999, chords: [tri(60, 'maj'), tri(57), tri(53, 'maj'), tri(55, 'maj')], arp: [0, 1, 2, 3, 2, 1, 2, 3], pad: 'sawtooth', beat: 'four' };
let trackIdx = 0;
let trackBar = 0;
let muted = false;
const trackFns = new Set();
try { const saved = JSON.parse(localStorage.getItem('apexxi.music') || '{}'); trackIdx = (saved.track | 0) % TRACKS.length; muted = !!saved.muted; } catch { /* first run, or no storage */ }
const keepMusic = () => { try { localStorage.setItem('apexxi.music', JSON.stringify({ track: trackIdx, muted })); } catch { /* none */ } };
const tellTrack = () => { for (const fn of trackFns) fn({ index: trackIdx, name: TRACKS[trackIdx].name, muted }); };
export const currentTrack = () => ({ index: trackIdx, name: TRACKS[trackIdx].name, muted });
export const onTrack = (fn) => { trackFns.add(fn); return () => trackFns.delete(fn); };
export function setTrack(i) {
  trackIdx = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length; trackBar = 0; musicStep = 0;
  keepMusic(); tellTrack();
  if (musicTimer) { stopMusicLoop(); if (armed) startMusic(); }
}
export const nextTrack = () => setTrack(trackIdx + 1);
export const prevTrack = () => setTrack(trackIdx - 1);
export function setMusicMuted(m) {
  muted = !!m; keepMusic(); tellTrack();
  if (muted) stopMusicLoop(); else if (armed) startMusic();
}
export const musicMuted = () => muted;

/** One bar of a track onto the music bus. */
function playBar(tr, step, gainK = 1) {
  const chord = tr.chords[step % tr.chords.length];
  const bar = tr.bar;
  chord.forEach((f, i) => {
    tone({ freq: f, type: tr.pad, dur: bar * 0.95, gain: 0.032 * gainK * (tr.pad === 'square' ? 0.6 : 1), attack: 0.6, bus: musicBus, detune: -6 });
    tone({ freq: f, type: tr.pad, dur: bar * 0.95, gain: 0.028 * gainK * (tr.pad === 'square' ? 0.6 : 1), attack: 0.7, bus: musicBus, detune: 7 });
    tone({ freq: f / 2, type: 'sine', dur: bar * 0.9, gain: 0.04 * gainK, attack: 0.4, bus: musicBus, delay: i * 0.01 });
  });
  tr.arp.forEach((n, i) => {
    const f = chord[n % chord.length] * (n >= chord.length ? 2 : 1);
    tone({ freq: f, type: 'triangle', dur: bar / 8 * 0.9, gain: 0.034 * gainK, bus: musicBus, delay: i * (bar / 8) });
  });
  const kick = (d, g = 0.06) => tone({ freq: 70, to: 45, type: 'sine', dur: 0.22, gain: g * gainK, bus: musicBus, delay: d });
  const hat = (d) => tone({ freq: 7200, type: 'square', dur: 0.03, gain: 0.006 * gainK, bus: musicBus, delay: d });
  if (tr.beat === 'pulse') { kick(0); kick(bar / 2, 0.045); }
  else if (tr.beat === 'four') { for (let k = 0; k < 4; k++) { kick(k * bar / 4, 0.05); hat(k * bar / 4 + bar / 8); } }
  else if (tr.beat === 'half') { kick(0, 0.06); kick(bar * 0.625, 0.04); for (let k = 0; k < 8; k++) hat(k * bar / 8); }
  else if (tr.beat === 'break') { kick(0); kick(bar * 0.375, 0.04); kick(bar * 0.625); for (let k = 0; k < 16; k += 2) hat(k * bar / 16); }
}

function musicBar() {
  if (!ready || !settings.music || muted) { musicTimer = null; return; }
  // never write into a stopped clock — the loop is re-armed by onstatechange
  if (ctx.state !== 'running') { musicTimer = null; return; }
  const tr = TRACKS[trackIdx];
  playBar(tr, musicStep);
  musicStep += 1;
  trackBar += 1;
  if (trackBar >= tr.bars) { trackBar = 0; musicStep = 0; trackIdx = (trackIdx + 1) % TRACKS.length; keepMusic(); tellTrack(); }
  musicTimer = setTimeout(musicBar, tr.bar * 1000);
}

/* The highlights bed runs on its own timer, in a match, where the lobby loop
 * is stopped; it fades in over the reel and stops with it. */
let bedTimer = null; let bedStep = 0;
function bedBar() {
  if (!ready || !settings.music || ctx.state !== 'running') { bedTimer = null; return; }
  playBar(HIGHLIGHTS_BED, bedStep++, bedStep < 2 ? 0.6 : 1);
  bedTimer = setTimeout(bedBar, HIGHLIGHTS_BED.bar * 1000);
}
export function startHighlightsBed() { if (!settings.enabled || bedTimer) return; if (!ready && !initAudio()) return; bedStep = 0; bedBar(); }
export function stopHighlightsBed() { if (bedTimer) clearTimeout(bedTimer); bedTimer = null; }
export const highlightsBedOn = () => !!bedTimer;

/**
 * Ask for the lobby loop. If the context is still locked this only remembers
 * the request; the first bar then plays from its start the moment audio is
 * allowed, instead of the loop having run silently in the meantime.
 */
export function startMusic() {
  if (!settings.enabled) return;
  armed = true;
  if (!ready && !initAudio()) return;
  if (musicTimer || muted || ctx.state !== 'running') return;
  musicBar();
}

/** Stop the loop but keep wanting it — used when the context suspends. */
function stopMusicLoop() {
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = null;
}

export function stopMusic() {
  armed = false;
  stopMusicLoop();
}

export const audioReady = () => ready && ctx && ctx.state === 'running';
