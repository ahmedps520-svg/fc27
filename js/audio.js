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
  crowdOoh(level = 0.6) {
    noise({ dur: 1.1, gain: 0.1 * level, type: 'bandpass', freq: 520, to: 300, q: 0.9, attack: 0.18 });
  },
  crowdGasp() {
    noise({ dur: 0.7, gain: 0.09, type: 'bandpass', freq: 700, to: 420, q: 1, attack: 0.06 });
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
    // roar swells up and hangs
    noise({ dur: 3.4, gain: 0.34, type: 'bandpass', freq: 380, to: 900, q: 0.5, attack: 0.45 });
    noise({ dur: 3.0, gain: 0.18, type: 'highpass', freq: 1400, attack: 0.5, delay: 0.1 });
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
export function startCrowd() {
  if (!ready && !initAudio()) return;
  if (crowdNodes) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 700;
  f.Q.value = 0.4;
  const g = ctx.createGain();
  g.gain.value = 0.0001;

  // slow swell so the bed breathes rather than hissing flat
  const lfo = ctx.createOscillator();
  const lg = ctx.createGain();
  lfo.frequency.value = 0.07;
  lg.gain.value = 220;
  lfo.connect(lg).connect(f.frequency);

  src.connect(f).connect(g).connect(sfxBus);
  src.start();
  lfo.start();
  crowdNodes = { src, g, f, lfo };
  setCrowd(0.35);
}

export function setCrowd(level) {
  crowdLevel = Math.max(0, Math.min(1, level));
  if (!crowdNodes) return;
  crowdNodes.g.gain.setTargetAtTime(0.03 + crowdLevel * 0.12, now(), 0.6);
  crowdNodes.f.frequency.setTargetAtTime(500 + crowdLevel * 900, now(), 0.8);
}

export function stopCrowd() {
  if (!crowdNodes) return;
  const { src, g, lfo } = crowdNodes;
  try {
    g.gain.setTargetAtTime(0.0001, now(), 0.25);
    src.stop(now() + 1.2);
    lfo.stop(now() + 1.2);
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
