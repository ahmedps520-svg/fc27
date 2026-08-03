/**
 * APEX XI audio. Everything here is synthesised at runtime with the Web Audio
 * API — no sample files, so there is nothing to download, nothing to license,
 * and it all works offline.
 *
 * Browsers (iOS especially) refuse to start audio outside a user gesture, so the
 * context is created lazily and resumed on the first tap or key press.
 */

let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let noiseBuf = null;
let ready = false;

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
  ready = true;
  return true;
}

export function resumeAudio() {
  if (!ready && !initAudio()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
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

/* ------------------------------ lobby music ----------------------------- */
// An original loop: four chords, a pad, and a soft arpeggio on top.
const CHORDS = [
  [220.0, 261.6, 329.6],      // Am
  [174.6, 220.0, 261.6],      // F
  [196.0, 246.9, 293.7],      // G
  [164.8, 196.0, 246.9],      // Em
];

function musicBar() {
  if (!ready || !settings.music) return;
  const chord = CHORDS[musicStep % CHORDS.length];
  const bar = 3.2;

  chord.forEach((f, i) => {
    tone({ freq: f, type: 'sawtooth', dur: bar * 0.95, gain: 0.035, attack: 0.6, bus: musicBus, detune: -6 });
    tone({ freq: f, type: 'sawtooth', dur: bar * 0.95, gain: 0.03, attack: 0.7, bus: musicBus, detune: 7 });
    tone({ freq: f / 2, type: 'sine', dur: bar * 0.9, gain: 0.04, attack: 0.4, bus: musicBus, delay: i * 0.01 });
  });

  // arpeggio
  for (let i = 0; i < 8; i++) {
    const f = chord[i % chord.length] * (i > 4 ? 2 : 1);
    tone({ freq: f, type: 'triangle', dur: 0.28, gain: 0.035, bus: musicBus, delay: i * (bar / 8) });
  }
  // heartbeat pulse
  tone({ freq: 70, to: 45, type: 'sine', dur: 0.22, gain: 0.06, bus: musicBus });
  tone({ freq: 70, to: 45, type: 'sine', dur: 0.22, gain: 0.045, bus: musicBus, delay: bar / 2 });

  musicStep += 1;
  musicTimer = setTimeout(musicBar, bar * 1000);
}

export function startMusic() {
  if (!ready && !initAudio()) return;
  if (musicTimer) return;
  musicStep = 0;
  musicBar();
}

export function stopMusic() {
  if (musicTimer) clearTimeout(musicTimer);
  musicTimer = null;
}

export const audioReady = () => ready && ctx && ctx.state === 'running';
