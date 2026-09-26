/**
 * Offline music renderer (v126): the National Day tracks, rendered to MP3.
 *
 *   node tools/music/khaleeji.mjs [--out assets/music]
 *
 * The in-game music is synthesised live from bare oscillators, which is fine
 * for a lobby loop and not for a track anyone is meant to enjoy. These are
 * rendered offline instead, sample by sample, with instruments modelled
 * rather than faked: a plucked-string model (Karplus–Strong) for the oud and
 * the qanun, membrane drums with a pitch drop, layered hand-claps, a riq's
 * jingles, a soft string bed, and a room reverb over the lot. Everything is
 * written here — no samples, no recordings, nothing anybody else wrote — so
 * the result is ours to ship (the game only uses generated or CC0 audio).
 *
 * Two pieces, both original:
 *   green-nights.mp3   the menu track: a khaleeji groove in D Hijaz, oud
 *                      melody, qanun answers, claps on the off-beats
 *   ardah-walkout.mp3  the National Day walk-out: an ardah-style procession —
 *                      big frame drums, a brass-like call, the crowd's claps
 *
 * ffmpeg: $FFMPEG, `ffmpeg` on the PATH, or the imageio-ffmpeg wheel.
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'assets/music');
const SR = 44100;

/* ------------------------------ plumbing ------------------------------ */
let seed = 20260923;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

class Mix {
  constructor(secs) { this.n = Math.ceil(secs * SR); this.L = new Float32Array(this.n); this.R = new Float32Array(this.n); }
  /** Add a mono buffer at time t (s), panned -1..1, at gain g. */
  add(buf, t, g = 1, pan = 0) {
    const o = Math.round(t * SR); const gl = g * Math.cos((pan + 1) * Math.PI / 4); const gr = g * Math.sin((pan + 1) * Math.PI / 4);
    for (let i = 0; i < buf.length; i++) { const j = o + i; if (j < 0 || j >= this.n) continue; this.L[j] += buf[i] * gl; this.R[j] += buf[i] * gr; }
  }
}

/* One-pole filters, in place */
const lowpass = (b, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < b.length; i++) { y = (1 - a) * b[i] + a * y; b[i] = y; } return b; };
const highpass = (b, fc) => { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; let x0 = 0; for (let i = 0; i < b.length; i++) { const x = b[i]; y = a * (y + x - x0); x0 = x; b[i] = y; } return b; };
/** A resonant band-pass (biquad) — for bodies, skins and jingles. */
function bandpass(b, fc, q) {
  const w = 2 * Math.PI * fc / SR; const al = Math.sin(w) / (2 * q); const cs = Math.cos(w);
  const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const out = new Float32Array(b.length);
  for (let i = 0; i < b.length; i++) { const x = b[i]; const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; out[i] = y; }
  return out;
}

/* ----------------------------- instruments ----------------------------- */
/**
 * A plucked string (Karplus–Strong, with a fractional delay for tuning and a
 * loss filter for brightness). `bright` 0..1: the oud is dark and woody, the
 * qanun bright and ringing.
 */
function pluck(freq, dur, { bright = 0.5, body = null, pick = 0.6 } = {}) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n);
  const D = SR / freq; const L = Math.floor(D); const frac = D - L;
  const line = new Float32Array(L + 2);
  // the pluck: noise, shaped by how hard and where the string is struck
  for (let i = 0; i < line.length; i++) line[i] = (rnd() * 2 - 1) * (1 - pick * Math.abs(Math.sin(Math.PI * i / L * 0.23)));
  lowpass(line, 1200 + bright * 5000);
  const loss = 0.9935 + bright * 0.0055;
  let p = 0; let prev = 0;
  for (let i = 0; i < n; i++) {
    const a = line[p]; const b = line[(p + 1) % line.length];
    const s = a + (b - a) * frac;
    const y = loss * (0.5 * s + 0.5 * prev);
    prev = s; line[p] = y; p = (p + 1) % L;
    out[i] = s;
  }
  // a short fade so a note never clicks off
  const fade = Math.min(n, 800); for (let i = 0; i < fade; i++) out[n - 1 - i] *= i / fade;
  if (!body) return out;
  // the instrument's body: a couple of resonances under the string
  const mix = new Float32Array(n);
  for (const [f, q, g] of body) { const r = bandpass(out, f, q); for (let i = 0; i < n; i++) mix[i] += r[i] * g; }
  for (let i = 0; i < n; i++) mix[i] += out[i] * 0.55;
  return mix;
}
const OUD_BODY = [[180, 1.4, 0.9], [420, 2.2, 0.6], [1250, 3, 0.25]];
const QANUN_BODY = [[520, 1.8, 0.4], [2600, 2.5, 0.35]];
const oud = (n, dur) => pluck(midi(n), dur, { bright: 0.18, body: OUD_BODY, pick: 0.7 });
const qanun = (n, dur) => pluck(midi(n), dur, { bright: 0.72, body: QANUN_BODY, pick: 0.3 });

/** A membrane: a sine that drops in pitch, with a thud of noise — doum, or a big ardah drum. */
function membrane(f0, f1, dur, { noise = 0.3, decay = 7 } = {}) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; const f = f1 + (f0 - f1) * Math.exp(-t * 28);
    ph += 2 * Math.PI * f / SR;
    out[i] = (Math.sin(ph) + (rnd() * 2 - 1) * noise * Math.exp(-t * 60)) * Math.exp(-t * decay);
  }
  return out;
}
/** The tak: a slap on the rim — bright noise through the skin's ring. */
function tak(dur = 0.12, f = 1900) {
  const n = Math.ceil(dur * SR); const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = (rnd() * 2 - 1) * Math.exp(-(i / SR) * 45);
  const r = bandpass(nz, f, 4); const r2 = bandpass(nz, f * 1.62, 6);
  for (let i = 0; i < n; i++) r[i] = r[i] * 1.4 + r2[i] * 0.8 + nz[i] * 0.15;
  return r;
}
/** A hand-clap: four or five people, a few milliseconds apart — the sound of a khaleeji song. */
function claps(people = 5) {
  const n = Math.ceil(0.22 * SR); const out = new Float32Array(n);
  for (let k = 0; k < people; k++) {
    const off = Math.floor((rnd() * 0.016) * SR); const f = 1000 + rnd() * 700;
    const nz = new Float32Array(n - off);
    for (let i = 0; i < nz.length; i++) nz[i] = (rnd() * 2 - 1) * Math.exp(-(i / SR) * (38 + rnd() * 10));
    const r = bandpass(nz, f, 1.3);
    for (let i = 0; i < r.length; i++) out[i + off] += r[i] * 0.55;
  }
  return out;
}
/** A riq's jingles: metal on metal, ringing briefly. */
function jingle(dur = 0.16) {
  const n = Math.ceil(dur * SR); const nz = new Float32Array(n);
  for (let i = 0; i < n; i++) nz[i] = (rnd() * 2 - 1) * Math.exp(-(i / SR) * 26);
  const out = new Float32Array(n);
  for (const f of [5400, 7100, 8900]) { const r = bandpass(nz, f, 12); for (let i = 0; i < n; i++) out[i] += r[i]; }
  return highpass(out, 3000);
}
/** A soft string bed: detuned saws, slow attack, darkened. */
function strings(notes, dur) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n);
  for (const m of notes) for (const det of [-0.11, 0.07, 0.13]) {
    const f = midi(m + det); let ph = rnd();
    for (let i = 0; i < n; i++) {
      ph += f / SR; if (ph >= 1) ph -= 1;
      const t = i / SR; const env = Math.min(1, t / 0.9) * Math.min(1, (dur - t) / 0.8);
      out[i] += (2 * ph - 1) * env * 0.08;
    }
  }
  return lowpass(lowpass(out, 1600), 2400);
}
/** A brass-like call (the ardah's horn line): a buzzy tone that opens up as it swells. */
function horn(m, dur) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n); const f = midi(m); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.4);
    ph += f * vib / SR; if (ph >= 1) ph -= 1;
    const env = Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.12);
    const bright = 0.35 + 0.65 * Math.min(1, t / 0.5);
    out[i] = ((2 * ph - 1) * bright + Math.sin(2 * Math.PI * ph) * (1 - bright)) * env;
  }
  return lowpass(out, 3200);
}

/* ------------------------------ the room ------------------------------ */
/** A Schroeder reverb (four combs, two all-passes) — a hall, not a bathroom. */
function reverb(mix, wet = 0.22) {
  const combs = [1557, 1617, 1491, 1422]; const aps = [225, 556];
  for (const [ch, sp] of [[mix.L, 0], [mix.R, 23]]) {
    const src = Float32Array.from(ch); const acc = new Float32Array(src.length);
    for (const d0 of combs) {
      const d = d0 + sp; const buf = new Float32Array(d); let p = 0; let lp = 0;
      for (let i = 0; i < src.length; i++) { const y = buf[p]; lp = y * 0.8 + lp * 0.2; buf[p] = src[i] + lp * 0.8; p = (p + 1) % d; acc[i] += y; }
    }
    for (const d0 of aps) {
      const d = d0 + sp; const buf = new Float32Array(d); let p = 0;
      for (let i = 0; i < acc.length; i++) { const b = buf[p]; const x = acc[i]; buf[p] = x + b * 0.5; acc[i] = b - x * 0.5; p = (p + 1) % d; }
    }
    for (let i = 0; i < ch.length; i++) ch[i] = src[i] + acc[i] * wet * 0.25;
  }
}
/** Level it, gently: a soft limiter and a peak at -1 dB. */
function master(mix) {
  let peak = 0;
  for (const ch of [mix.L, mix.R]) for (let i = 0; i < ch.length; i++) { ch[i] = Math.tanh(ch[i] * 1.3) / 1.3; peak = Math.max(peak, Math.abs(ch[i])); }
  const k = 0.89 / (peak || 1);
  for (const ch of [mix.L, mix.R]) for (let i = 0; i < ch.length; i++) ch[i] *= k;
}
function writeMp3(mix, file, { loopFade = false } = {}) {
  if (loopFade) { const f = Math.floor(0.03 * SR); for (const ch of [mix.L, mix.R]) for (let i = 0; i < f; i++) { ch[i] *= i / f; ch[ch.length - 1 - i] *= i / f; } }
  const n = mix.n; const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mix.L[i] * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mix.R[i] * 32767))), 46 + i * 4);
  }
  const wav = `${file}.wav`; writeFileSync(wav, buf);
  const ff = process.env.FFMPEG || (spawnSync('ffmpeg', ['-version']).status === 0 ? 'ffmpeg'
    : spawnSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).stdout.trim());
  const r = spawnSync(ff, ['-loglevel', 'error', '-y', '-i', wav, '-b:a', '160k', file]);
  rmSync(wav, { force: true });
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr}`);
}

/* ------------------------------- the music ------------------------------- */
// D Hijaz: D Eb F# G A Bb C — the augmented second (Eb to F#) is the sound of it
const D = 62; const HIJAZ = [0, 1, 4, 5, 7, 8, 10];
const deg = (d, oct = 0) => D + HIJAZ[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);

/**
 * Green Nights — the menu track. 104 bpm, a khaleeji groove (a doum-heavy
 * 2/4 with the claps pushing the off-beats), 32 bars that loop: an intro on
 * oud alone, the groove, the tune twice (oud, then qanun answering), a break
 * on the drums and claps, the tune again with the strings under it.
 */
function greenNights() {
  const bpm = 104; const beat = 60 / bpm; const bar = beat * 4; const BARS = 32;
  const mix = new Mix(BARS * bar + 3);
  // the tune: [scale degree, length in eighths]; -1 is a rest
  const A = [[4, 2], [3, 1], [2, 1], [1, 2], [2, 2], [4, 3], [5, 1], [4, 2], [2, 2], [1, 2], [0, 2], [1, 1], [2, 1], [1, 4], [-1, 4]];
  const B = [[7, 2], [6, 1], [5, 1], [4, 2], [5, 1], [4, 1], [2, 2], [1, 2], [2, 2], [4, 1], [2, 1], [1, 2], [0, 6], [-1, 2]];
  const play = (phrase, t0, inst, oct = 0, g = 0.5, pan = 0) => {
    let t = t0;
    for (const [d, len] of phrase) {
      const dur = len * beat / 2;
      if (d >= 0) {
        mix.add(inst(deg(d, oct), dur + 0.9), t, g, pan);
        // the oud's tremolo on a long note, as a player would
        if (inst === oud && len >= 3) for (let k = 1; k < len * 2; k++) mix.add(oud(deg(d, oct), 0.4), t + k * beat / 4, g * 0.35, pan);
      }
      t += dur;
    }
    return t;
  };
  // chords under it all: D (the tonic of Hijaz is major), Cm, Bb, D
  const CH = [[50, 54, 57], [48, 51, 55], [46, 50, 53], [50, 54, 57]];
  for (let b = 0; b < BARS; b++) {
    const t = b * bar;
    const section = b < 4 ? 'intro' : b < 8 ? 'groove' : b < 16 ? 'tuneA' : b < 20 ? 'break' : b < 28 ? 'tuneB' : 'outro';
    // bass: the root on the one, a push before the three
    const root = CH[Math.floor(b / 2) % 4][0] - 12;
    if (section !== 'intro') { mix.add(oud(root, bar * 0.6), t, 0.55, 0); mix.add(oud(root + 7, beat * 1.2), t + beat * 2.5, 0.35, 0); }
    if (section === 'tuneB' || section === 'outro') if (b % 2 === 0) mix.add(strings(CH[Math.floor(b / 2) % 4].map((n) => n + 12), bar * 2), t, 0.5, 0);
    // drums: doum on 1 and the "and" of 2; tak on 2 and 4; claps on the off-beats
    if (section !== 'intro') {
      mix.add(membrane(130, 62, 0.6, { noise: 0.25, decay: 6 }), t, 0.8, -0.1);
      mix.add(membrane(130, 62, 0.5, { noise: 0.25, decay: 7 }), t + beat * 1.5, 0.55, -0.1);
      mix.add(tak(), t + beat, 0.45, 0.25); mix.add(tak(), t + beat * 3, 0.45, 0.25);
      mix.add(tak(0.08, 2300), t + beat * 3.5, 0.25, 0.3);
      if (section !== 'groove' || b >= 6) { mix.add(claps(), t + beat * 1.5, 0.55, -0.35); mix.add(claps(), t + beat * 3.5, 0.55, 0.35); mix.add(claps(4), t + beat * 2.5, 0.3, 0); }
      for (let k = 0; k < 8; k++) mix.add(jingle(), t + k * beat / 2, k % 2 ? 0.12 : 0.2, 0.55);
    }
  }
  // melodies
  play([[0, 3], [1, 1], [2, 2], [4, 2], [2, 4], [1, 2], [0, 2], [-1, 16]], 0, oud, 0, 0.55, -0.15);      // intro
  let t = 8 * bar; t = play(A, t, oud, 0, 0.6, -0.15); play(B, t, oud, 0, 0.6, -0.15);                  // tune on the oud
  t = 12 * bar; t = play(A, t, qanun, 1, 0.3, 0.3); play(B, t, qanun, 1, 0.3, 0.3);                        // the qanun answers
  t = 20 * bar; t = play(A, t, oud, 0, 0.6, -0.15); play(B, t, oud, 0, 0.6, -0.15);
  t = 24 * bar; t = play(A, t, qanun, 1, 0.34, 0.3); play(B, t, oud, 0, 0.55, -0.15);
  // qanun runs into each section
  for (const b of [7, 15, 19, 27]) for (let k = 0; k < 8; k++) mix.add(qanun(deg(7 - k, 0), 0.5), b * bar + beat * 2 + k * beat / 4, 0.26, 0.35);
  reverb(mix, 0.3); master(mix);
  mix.n = Math.round(BARS * bar * SR); mix.L = mix.L.subarray(0, mix.n); mix.R = mix.R.subarray(0, mix.n);
  return mix;
}

/**
 * Ardah Walk-out — the National Day walk-out. An ardah-style procession: a
 * slow march of big frame drums (the tabl), the crowd clapping on the beat,
 * a horn-like call answered by a second, and the drums doubling for the
 * finish. Sixteen bars, about thirty seconds — the length of a walk-out.
 */
function ardah() {
  const bpm = 84; const beat = 60 / bpm; const bar = beat * 4; const BARS = 12;
  const mix = new Mix(BARS * bar + 4);
  const call = [[4, 2], [5, 1], [4, 1], [2, 4], [1, 2], [2, 2], [4, 4], [-1, 0]];
  const answer = [[7, 2], [5, 2], [4, 2], [2, 1], [1, 1], [0, 8]];
  const playHorn = (phrase, t0, oct, g, pan) => { let t = t0; for (const [d, len] of phrase) { const dur = len * beat / 2; if (d >= 0 && len) mix.add(horn(deg(d, oct), dur * 0.95), t, g, pan); t += dur; } };
  for (let b = 0; b < BARS; b++) {
    const t = b * bar; const big = b >= 8;
    for (let k = 0; k < 4; k++) {
      mix.add(membrane(95, 48, 1.1, { noise: 0.4, decay: 3.5 }), t + k * beat, k === 0 ? 1 : 0.75, -0.2);
      if (b >= 2) mix.add(claps(7), t + k * beat, 0.5, k % 2 ? 0.3 : -0.3);
      if (big) mix.add(membrane(140, 70, 0.5, { noise: 0.3, decay: 7 }), t + k * beat + beat / 2, 0.55, 0.2);
    }
    if (b % 2 === 1 && b >= 3) mix.add(tak(0.14, 1500), t + beat * 3.5, 0.5, 0.2);
    if (b >= 2) mix.add(strings([50, 57, 62], bar), t, 0.3, 0);
  }
  playHorn(call, 4 * bar, 0, 0.3, -0.25); playHorn(answer, 6 * bar, 0, 0.28, 0.25);
  playHorn(call, 8 * bar, 0, 0.34, -0.25); playHorn(answer, 10 * bar, 0, 0.34, 0.25);
  playHorn(answer, 10 * bar, -1, 0.2, 0);
  // the last hit, and the room ringing after it
  mix.add(membrane(90, 40, 2.5, { noise: 0.5, decay: 1.8 }), BARS * bar, 1.1, 0);
  reverb(mix, 0.4); master(mix);
  return mix;
}

mkdirSync(OUT, { recursive: true });
writeMp3(greenNights(), join(OUT, 'green-nights.mp3'), { loopFade: true });
writeMp3(ardah(), join(OUT, 'ardah-walkout.mp3'));
console.log(`✔ ${OUT}/green-nights.mp3, ${OUT}/ardah-walkout.mp3`);
