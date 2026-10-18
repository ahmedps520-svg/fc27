/**
 * The App Store trailer's score (tools/trailer/appstore): original music,
 * rendered offline, sample by sample, like tools/music/khaleeji.mjs. No
 * samples and no loops anybody else wrote, so it is ours to publish.
 *
 *   node tools/trailer/appstore/score.mjs [out.wav=tests/tmp/as/score.wav]
 *
 * 120 BPM, so a beat is exactly 15 frames of 30 fps video and every cut in
 * cut.mjs can sit on one. D minor, i–VI–III–VII (Dm Bb F C), one chord a bar.
 * Built to the picture (seconds):
 *
 *   0.0  cold open: a sub drone, a heartbeat kick, a string tremolo and a
 *        riser; a whoosh as the ball is struck (1.33), then a hard stop
 *   2.0  IMPACT on the net: boom, crash, a Dm stab ringing under the logo;
 *        a snare build from 3.0
 *   4.0  the groove: drums, a pumping bass and pad, a 16th string ostinato
 *        and the hero motif on a brass-like lead
 *   8.0  the screens: the lead steps aside for glassy FM bells
 *  18.0  breakdown under the stadium crane: choir, long strings, a heartbeat;
 *        snare roll and riser from 20.0, a hard stop
 *  22.0  IMPACT on the header goal: the full groove, the motif an octave up,
 *        a tom fill into
 *  28.0  the final hit, resolving to D major, a bell sting under the logo,
 *        faded out by 29.8 (the cut's last frame)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT = process.argv[2] || 'tests/tmp/as/score.wav';
const SR = 48000;
const BEAT = 0.5; const BAR = 2;
const LEN = 30.6;                      // the cut is 29.8 s; a little air after
const N = Math.ceil(LEN * SR);

/* ------------------------------ plumbing ------------------------------ */
let seed = 20261012;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

class Bus {
  constructor() { this.L = new Float32Array(N); this.R = new Float32Array(N); }
  /** a mono buffer at t seconds, gain g, pan -1..1 (equal power) */
  add(buf, t, g = 1, pan = 0) {
    const o = Math.round(t * SR); const gl = g * Math.cos((pan + 1) * Math.PI / 4) * Math.SQRT2; const gr = g * Math.sin((pan + 1) * Math.PI / 4) * Math.SQRT2;
    const n = Math.min(buf.length, N - o);
    for (let i = Math.max(0, -o); i < n; i++) { this.L[o + i] += buf[i] * gl; this.R[o + i] += buf[i] * gr; }
  }
  add2(L, R, t, g = 1) {
    const o = Math.round(t * SR); const n = Math.min(L.length, N - o);
    for (let i = Math.max(0, -o); i < n; i++) { this.L[o + i] += L[i] * g; this.R[o + i] += R[i] * g; }
  }
  into(bus, g = 1) { for (let i = 0; i < N; i++) { bus.L[i] += this.L[i] * g; bus.R[i] += this.R[i] * g; } }
}

/** A band-limited saw (polyBLEP); `f` a number or a function of time. */
function saw(f, dur, phase = rnd()) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n); let p = phase;
  const fn = typeof f === 'function' ? f : () => f;
  for (let i = 0; i < n; i++) {
    const dt = fn(i / SR) / SR; p += dt; if (p >= 1) p -= 1;
    let v = 2 * p - 1;
    if (p < dt) { const x = p / dt; v -= x + x - x * x - 1; } else if (p > 1 - dt) { const x = (p - 1) / dt; v -= x * x + x + x + 1; }
    out[i] = v;
  }
  return out;
}
function sine(f, dur, phase = 0) {
  const n = Math.ceil(dur * SR); const out = new Float32Array(n); let p = phase;
  const fn = typeof f === 'function' ? f : () => f;
  for (let i = 0; i < n; i++) { p += 2 * Math.PI * fn(i / SR) / SR; out[i] = Math.sin(p); }
  return out;
}
function whiteN(dur) { const n = Math.ceil(dur * SR); const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise(); return o; }

/** Zavalishin's state-variable filter, modulation-safe; `fc` a number or f(t). mode lp|bp|hp */
function svf(buf, fc, q = 0.707, mode = 'lp') {
  const out = new Float32Array(buf.length); const fn = typeof fc === 'function' ? fc : () => fc;
  let ic1 = 0, ic2 = 0; const k = 1 / q; let g = 0;
  for (let i = 0; i < buf.length; i++) {
    if ((i & 15) === 0) g = Math.tan(Math.PI * clamp(fn(i / SR), 20, SR * 0.45) / SR);
    const a1 = 1 / (1 + g * (g + k)); const a2 = g * a1; const a3 = g * a2;
    const v3 = buf[i] - ic2; const v1 = a1 * ic1 + a2 * v3; const v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
    out[i] = mode === 'lp' ? v2 : mode === 'bp' ? v1 : buf[i] - k * v1 - v2;
  }
  return out;
}
/** Multiply by an envelope f(t). */
function env(buf, fn) { for (let i = 0; i < buf.length; i++) buf[i] *= fn(i / SR); return buf; }
const adsr = (a, d, s, r, len) => (t) => (t < a ? t / a : t < a + d ? 1 - (1 - s) * (t - a) / d : t < len ? s : Math.max(0, s * (1 - (t - len) / r)));
const expDecay = (tau, a = 0.002) => (t) => (t < a ? t / a : Math.exp(-(t - a) / tau));
const sat = (buf, drive = 1.5) => { const k = Math.tanh(drive); for (let i = 0; i < buf.length; i++) buf[i] = Math.tanh(buf[i] * drive) / k; return buf; };
const mix = (...bufs) => { const n = Math.max(...bufs.map((b) => b.length)); const o = new Float32Array(n); for (const b of bufs) for (let i = 0; i < b.length; i++) o[i] += b[i]; return o; };
const scale = (buf, g) => { for (let i = 0; i < buf.length; i++) buf[i] *= g; return buf; };
const reverse = (buf) => Float32Array.from(buf).reverse();

/* Freeverb (Jezar's), stereo: eight combs and four all-passes a side. */
function freeverb(L, R, { room = 0.84, damp = 0.3, wet = 1, width = 1 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((x) => Math.round(x * SR / 44100));
  const alls = [556, 441, 341, 225].map((x) => Math.round(x * SR / 44100));
  const side = (input, spread) => {
    const out = new Float32Array(input.length);
    const cb = combs.map((n) => ({ b: new Float32Array(n + spread), i: 0, s: 0 }));
    const ab = alls.map((n) => ({ b: new Float32Array(n + spread), i: 0 }));
    for (let i = 0; i < input.length; i++) {
      const x = input[i] * 0.015; let y = 0;
      for (const c of cb) { const o = c.b[c.i]; c.s = o * (1 - damp) + c.s * damp; c.b[c.i] = x + c.s * room; if (++c.i >= c.b.length) c.i = 0; y += o; }
      for (const a of ab) { const o = a.b[a.i]; const v = -y + o; a.b[a.i] = y + o * 0.5; if (++a.i >= a.b.length) a.i = 0; y = v; }
      out[i] = y;
    }
    return out;
  };
  const wl = side(L, 0); const wr = side(R, 23);
  const w1 = wet * (width / 2 + 0.5); const w2 = wet * ((1 - width) / 2);
  const oL = new Float32Array(L.length); const oR = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++) { oL[i] = wl[i] * w1 + wr[i] * w2; oR[i] = wr[i] * w1 + wl[i] * w2; }
  return [oL, oR];
}
/** A stereo ping-pong delay: left, then right, darker on each repeat. */
function pingpong(L, R, time, fb = 0.35, tone = 3500) {
  const d = Math.round(time * SR); const n = L.length;
  const oL = new Float32Array(n); const oR = new Float32Array(n);
  const lineL = new Float32Array(n); const lineR = new Float32Array(n);
  let lpL = 0, lpR = 0; const a = Math.exp(-2 * Math.PI * tone / SR);
  for (let i = 0; i < n; i++) {
    const outL = i >= d ? lineL[i - d] : 0; const outR = i >= d ? lineR[i - d] : 0;
    lpL = (1 - a) * outL + a * lpL; lpR = (1 - a) * outR + a * lpR;
    lineL[i] = (L[i] + R[i]) * 0.5 + lpR * fb;     // the dry signal and the right side's repeat go left
    lineR[i] = lpL;                                 // the left repeat goes right
    oL[i] = lpL; oR[i] = lpR;
  }
  return [oL, oR];
}

/* ------------------------------ the chart ------------------------------ */
const D = 50;                                   // D3
// one chord a bar from bar 2 (4.0 s): Dm Bb F C
const CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]];
const ROOTS = [38, 34, 41, 36];                 // D2 Bb1 F2 C2
// the chord under each stretch: [from, chord]; the climax starts the cycle again, and C turns to D major at the end
const PROG = [[4, 0], [6, 1], [8, 2], [10, 3], [12, 0], [14, 0], [16, 1], [18, 0], [22, 0], [24, 1], [26, 2], [27, 3]];
const chordAt = (t) => { let c = 0; for (const [from, k] of PROG) if (t >= from - 1e-6) c = k; return c; };
const GROOVE = [[4, 18], [22, 28]];             // where the drums play
const inGroove = (t) => GROOVE.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

const KICKS = []; // every kick time, for the sidechain
const bus = { drums: new Bus(), bass: new Bus(), music: new Bus(), fx: new Bus(), verbSend: new Bus(), delaySend: new Bus() };

/* --------------------------- the instruments --------------------------- */
function kick(t, g = 1, { soft = false } = {}) {
  const dur = soft ? 0.6 : 0.55;
  const body = sine((x) => 50 + 120 * Math.exp(-x / 0.035), dur);
  env(body, (x) => Math.exp(-x / (soft ? 0.2 : 0.22)));
  sat(body, soft ? 1.1 : 2.2);
  const click = svf(env(whiteN(0.012), expDecay(0.003)), 4000, 0.7, 'hp');
  const k = mix(scale(body, 0.95), scale(click, soft ? 0 : 0.35));
  bus.drums.add(soft ? svf(k, 900) : k, t, soft ? g * 0.6 : g);
  KICKS.push({ t, g: soft ? g * 0.5 : g });
}
function snare(t, g = 1, verb = 0.35) {
  const tone = mix(scale(env(sine((x) => 185 + 40 * Math.exp(-x / 0.02), 0.2), expDecay(0.06)), 0.6), scale(env(sine(330, 0.12), expDecay(0.04)), 0.25));
  const nz = svf(env(whiteN(0.32), expDecay(0.11)), 5200, 0.6, 'bp');
  const hp = svf(env(whiteN(0.25), expDecay(0.07)), 7000, 0.7, 'hp');
  const s = sat(mix(tone, scale(nz, 1.1), scale(hp, 0.35)), 1.6);
  bus.drums.add(s, t, g, 0.02); bus.verbSend.add(s, t, g * verb * 0.4);
}
function clap(t, g = 1) {
  const n = Math.ceil(0.3 * SR); const c = new Float32Array(n);
  [0, 0.009, 0.019, 0.031].forEach((o, j) => { const b = env(whiteN(0.3 - o), expDecay(j === 3 ? 0.09 : 0.008)); const s = Math.round(o * SR); for (let i = 0; i < b.length && s + i < n; i++) c[s + i] += b[i]; });
  const out = svf(c, 1400, 1.3, 'bp');
  bus.drums.add(scale(out, 1.6), t, g, -0.05); bus.verbSend.add(out, t, g * 0.25);
}
// a metal: six inharmonic squares, the 808 trick, high-passed
const METAL = [205.3, 304.4, 369.6, 522.7, 540, 800].map((f) => f * 1.7);
function metal(dur, tau) {
  const n = Math.ceil(dur * SR); const o = new Float32Array(n);
  for (const f of METAL) { let p = rnd(); for (let i = 0; i < n; i++) { p += f / SR; o[i] += (p % 1) < 0.5 ? 1 : -1; } }
  return env(svf(o, 8000, 0.8, 'hp'), expDecay(tau));
}
function hat(t, g = 1, open = false, pan = 0.25) {
  const h = mix(scale(metal(open ? 0.5 : 0.08, open ? 0.16 : 0.022), 0.18), scale(env(svf(whiteN(open ? 0.5 : 0.08), 9500, 0.7, 'hp'), expDecay(open ? 0.14 : 0.02)), 0.6));
  bus.drums.add(h, t, g * 0.55, pan);
}
function crash(t, g = 1, rev = false) {
  let c = mix(scale(metal(3.2, 1.1), 0.25), scale(env(svf(whiteN(3.2), 5000, 0.6, 'hp'), expDecay(0.95)), 0.7));
  if (rev) { c = reverse(c); env(c, (x) => Math.min(1, (x / 3.2) ** 3)); }
  bus.drums.add(c, rev ? t - 3.2 : t, g * 0.5, -0.3); bus.drums.add(c, (rev ? t - 3.2 : t) + 0.007, g * 0.5, 0.3);
  bus.verbSend.add(c, rev ? t - 3.2 : t, g * 0.1);
}
function tom(t, f, g = 1, pan = 0) {
  const b = env(sine((x) => f * (1 + 0.6 * Math.exp(-x / 0.03)), 0.6), expDecay(0.2));
  const nz = env(svf(whiteN(0.2), f * 4, 1, 'bp'), expDecay(0.05));
  const s = sat(mix(b, scale(nz, 0.4)), 1.8);
  bus.drums.add(s, t, g, pan); bus.verbSend.add(s, t, g * 0.16);
}
/** The impact: a sub boom, a crushed noise burst, a ringing metal, a long tail. */
function impact(t, g = 1) {
  const boom = sat(env(sine((x) => 27 + 48 * Math.exp(-x / 0.18), 2.6), (x) => (x < 0.004 ? x / 0.004 : Math.exp(-x / 0.85))), 1.6);
  const burst = svf(env(whiteN(1.4), expDecay(0.22)), (x) => 300 + 5200 * Math.exp(-x / 0.12), 0.8, 'lp');
  const ring = env(mix(...[87, 143.5, 211, 397, 611].map((f, j) => scale(sine(f, 2.2, j), 1 / (j + 1)))), expDecay(0.7));
  const hit = mix(scale(boom, 1.25), scale(sat(burst, 2.5), 0.55), scale(ring, 0.14));
  bus.fx.add(hit, t, g); bus.verbSend.add(hit, t, g * 0.5);
  KICKS.push({ t, g: g * 1.4 });
}
/** Rising noise and a climbing saw, cut dead at `end`. */
function riser(t0, end, g = 1) {
  const dur = end - t0;
  const nz = svf(whiteN(dur), (x) => 300 * (8000 / 300) ** (x / dur), 2.2, 'bp');
  const tone = svf(mix(saw((x) => midi(D + 12) * 2 ** (2 * x / dur), dur), saw((x) => midi(D + 12) * 2 ** (2 * x / dur) * 1.006, dur)), (x) => 600 + 6000 * (x / dur) ** 2, 0.9);
  const r = env(mix(scale(nz, 1.2), scale(tone, 0.14)), (x) => (x / dur) ** 2.2 * (x > dur - 0.008 ? (dur - x) / 0.008 : 1));
  bus.fx.add(r, t0, g * 0.55, -0.25); bus.fx.add(r, t0 + 0.011, g * 0.55, 0.25); bus.verbSend.add(r, t0, g * 0.2);
}
function whoosh(t, dur = 0.55, g = 1, dir = 1) {
  const nz = svf(whiteN(dur), (x) => 500 + 5500 * Math.sin(Math.PI * x / dur) ** 2, 1.6, 'bp');
  env(nz, (x) => Math.sin(Math.PI * x / dur) ** 2);
  const n = nz.length; const L = new Float32Array(n); const R = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = dir * (2 * i / n - 1); L[i] = nz[i] * Math.cos((p + 1) * Math.PI / 4) * 1.4; R[i] = nz[i] * Math.sin((p + 1) * Math.PI / 4) * 1.4; }
  bus.fx.add2(L, R, t - dur * 0.5, g * 0.5);
}
/** Seven detuned saws a note, spread across the field. */
function supersaw(notes, t, dur, { g = 1, cutoff = 2600, att = 0.25, rel = 0.5, decay = null, verb = 0.3, q = 0.8 } = {}) {
  const total = dur + rel; const L = new Float32Array(Math.ceil(total * SR)); const R = new Float32Array(L.length);
  const det = [-0.11, -0.065, -0.03, 0, 0.03, 0.065, 0.11];
  for (const m of notes) {
    det.forEach((d, j) => {
      const f = midi(m) * (1 + d * 0.06); const s = saw(f, total);
      const pan = (j / (det.length - 1)) * 2 - 1;
      const gl = Math.cos((pan * 0.8 + 1) * Math.PI / 4); const gr = Math.sin((pan * 0.8 + 1) * Math.PI / 4);
      for (let i = 0; i < s.length; i++) { L[i] += s[i] * gl; R[i] += s[i] * gr; }
    });
  }
  const shape = decay ? expDecay(decay, 0.004) : adsr(att, 0.2, 0.85, rel, dur);
  const fc = typeof cutoff === 'function' ? cutoff : () => cutoff;
  const oL = env(svf(L, fc, q), shape); const oR = env(svf(R, fc, q), shape);
  const k = g * 0.06 / Math.sqrt(notes.length);
  bus.music.add2(oL, oR, t, k); bus.verbSend.add2(oL, oR, t, k * verb);
}
function bassNote(m, t, dur, g = 1) {
  const f = midi(m);
  const s = mix(saw(f, dur + 0.05), scale(saw(f * 1.004, dur + 0.05), 0.7), scale(sine(f, dur + 0.05), 0.9));
  const o = env(svf(s, (x) => 260 + 1100 * Math.exp(-x / 0.07), 1.1), adsr(0.004, 0.08, 0.75, 0.05, dur));
  bus.bass.add(sat(o, 1.4), t, g * 0.3);
}
/** A brass-like lead: three saws, the filter opening as the note swells, vibrato after a moment. */
function brass(m, t, dur, g = 1) {
  const f = midi(m); const vib = (x) => f * (1 + (x > 0.22 ? 0.0045 * Math.sin(2 * Math.PI * 5.3 * x) * Math.min(1, (x - 0.22) / 0.3) : 0));
  const s = mix(saw(vib, dur + 0.25), saw((x) => vib(x) * 1.005, dur + 0.25), scale(saw((x) => vib(x) * 0.5, dur + 0.25), 0.5));
  const o = env(svf(s, (x) => 500 + 3600 * (1 - Math.exp(-x / 0.07)) * (x < dur ? 1 : Math.exp(-(x - dur) / 0.08)), 0.9), adsr(0.035, 0.15, 0.8, 0.22, dur));
  bus.music.add(o, t, g * 0.07, 0.05); bus.verbSend.add(o, t, g * 0.07 * 0.45); bus.delaySend.add(o, t, g * 0.07 * 0.3);
}
/** A glassy FM bell. */
function bell(m, t, g = 1, pan = 0) {
  const f = midi(m); const dur = 1.6; const n = Math.ceil(dur * SR); const o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = i / SR; const I = 3.2 * Math.exp(-x / 0.18); o[i] = Math.sin(2 * Math.PI * f * x + I * Math.sin(2 * Math.PI * f * 3.5 * x)) * Math.exp(-x / 0.45) * Math.min(1, x / 0.002); }
  bus.music.add(o, t, g * 0.05, pan); bus.verbSend.add(o, t, g * 0.05 * 0.6); bus.delaySend.add(o, t, g * 0.05 * 0.5);
}
/** A short string note (the ostinato): saw, quick envelope, a touch of room. */
function stringNote(m, t, dur, g = 1, pan = 0) {
  const f = midi(m);
  const s = mix(saw(f, dur + 0.1), saw(f * 1.003, dur + 0.1));
  const o = env(svf(s, 2400, 0.7), adsr(0.006, 0.06, 0.5, 0.08, dur));
  bus.music.add(o, t, g * 0.035, pan); bus.verbSend.add(o, t, g * 0.035 * 0.35);
}
/** Long bowed strings, slow attack, vibrato. */
function strings(notes, t, dur, g = 1) {
  for (const [j, m] of notes.entries()) {
    const f = midi(m); const vib = (x) => f * (1 + 0.004 * Math.sin(2 * Math.PI * (5 + j * 0.3) * x));
    const s = mix(saw(vib, dur + 0.6), saw((x) => vib(x) * 1.004, dur + 0.6), saw((x) => vib(x) * 0.997, dur + 0.6));
    const o = env(svf(s, 1900, 0.6), adsr(0.5, 0.3, 0.9, 0.6, dur));
    bus.music.add(o, t, g * 0.03, (j / Math.max(1, notes.length - 1)) * 1.2 - 0.6); bus.verbSend.add(o, t, g * 0.03 * 0.6);
  }
}
/** Tremolo strings (the cold open): fast bowing on a held note. */
function tremolo(m, t, dur, g = 1, pan = 0) {
  const f = midi(m); const s = mix(saw(f, dur), saw(f * 1.005, dur));
  const o = env(svf(s, 2600, 0.7), (x) => (0.55 + 0.45 * Math.abs(Math.sin(2 * Math.PI * 7.5 * x))) * Math.min(1, x / 0.4) * (x > dur - 0.01 ? (dur - x) / 0.01 : 1));
  bus.music.add(o, t, g * 0.05, pan); bus.verbSend.add(o, t, g * 0.05 * 0.5);
}
/** A choir "aah": saws through three vowel formants. */
function choir(notes, t, dur, g = 1) {
  for (const [j, m] of notes.entries()) {
    const f = midi(m); const vib = (x) => f * (1 + 0.006 * Math.sin(2 * Math.PI * 4.8 * x + j));
    const s = mix(saw(vib, dur + 0.8), saw((x) => vib(x) * 1.007, dur + 0.8));
    const v = mix(scale(svf(s, 750, 6, 'bp'), 1), scale(svf(s, 1150, 7, 'bp'), 0.6), scale(svf(s, 2700, 8, 'bp'), 0.3));
    env(v, adsr(0.7, 0.4, 0.9, 0.8, dur));
    bus.music.add(v, t, g * 0.07, j % 2 ? 0.4 : -0.4); bus.verbSend.add(v, t, g * 0.07 * 0.8);
  }
}
function drone(t, dur, g = 1) {
  const s = mix(scale(sine(midi(26), dur), 1), scale(svf(saw(midi(38), dur), 180), 0.6), scale(svf(saw(midi(38) * 1.01, dur), 180), 0.6));
  env(s, (x) => Math.min(1, x / 1.2) * (x > dur - 0.01 ? (dur - x) / 0.01 : 1));
  bus.bass.add(s, t, g * 0.2);
}

/* ----------------------------- the arrangement ----------------------------- */
// --- 0 to 2: the cold open
drone(0, 1.97, 1);
for (let b = 0; b < 4; b++) { kick(b * BEAT, 0.55 + b * 0.08, { soft: true }); kick(b * BEAT + 0.17, 0.3 + b * 0.05, { soft: true }); }
tremolo(D + 24, 0.05, 1.92, 1, -0.4); tremolo(D + 31, 0.05, 1.92, 0.8, 0.4);
riser(0.15, 1.96, 1);
crash(1.97, 0.55, true);
whoosh(1.36, 0.42, 0.9, 1);
// --- 2: the net. Impact, crash, a stab under the logo; a snare build into the groove
impact(2.0, 1);
crash(2.0, 0.9);
supersaw([D - 12, D, D + 3, D + 7, D + 12], 2.0, 1.6, { g: 1.25, decay: 0.75, cutoff: (x) => 900 + 6000 * Math.exp(-x / 0.25), verb: 0.7 });
bassNote(D - 12, 2.0, 1.2, 1.1);
strings([D, D + 3, D + 7, D + 12], 2.4, 1.5, 0.8);
for (let i = 0; i < 8; i++) snare(3.0 + i * 0.0625, 0.18 + i * 0.03, 0.2);
for (let i = 0; i < 15; i++) snare(3.5 + i * 0.03125, 0.4 + i * 0.03, 0.2);
riser(3.0, 3.96, 0.6);

// --- the groove (drums), 4–18 and 22–28
for (let t = 4; t < 28 - 1e-6; t += BEAT) {
  if (!inGroove(t)) continue;
  const inBar = Math.round((t - 4) / BEAT) % 4;
  const climax = t >= 22;
  // kick: 1, the "and" of 2, 3 — and 4's "and" every other bar
  if (inBar === 0 || inBar === 2) kick(t, 1);
  if (inBar === 1) kick(t + 0.25, 0.8);
  if (inBar === 3 && Math.round((t - 4) / BAR) % 2 === 1) kick(t + 0.25, 0.7);
  if (inBar === 1 || inBar === 3) { snare(t, 0.95); clap(t, 0.55); }
  // hats: 16ths in the climax, 8ths before, the offbeat open
  const sub = climax ? 4 : 2;
  for (let k = 0; k < sub; k++) { const ht = t + k * BEAT / sub; hat(ht, (k === 0 ? 0.55 : 0.85) * (climax ? 1 : 0.9), !climax && k === 1 && inBar === 3, k % 2 ? 0.3 : -0.2); }
}
[4, 8, 12, 14, 16, 22, 24, 26].forEach((t) => crash(t, t === 22 || t === 4 ? 1 : 0.6));
// fills: toms into 8, 12, 18 (the breakdown) and the final
const fill = (t0, n, g = 1) => { const fs = [190, 160, 135, 110, 95, 82]; for (let i = 0; i < n; i++) tom(t0 + i * 0.125, fs[Math.min(fs.length - 1, Math.floor(i * fs.length / n))], g * (0.7 + 0.3 * i / n), (i / n) * 1.2 - 0.6); };
fill(7.5, 4, 0.8); fill(11.5, 4, 0.8); fill(17.0, 8, 0.9);
fill(27.0, 8, 1.1);

// --- bass and pad, chord by chord, while the groove plays
const SEGS = PROG.map(([from, k], i) => [from, PROG[i + 1] ? PROG[i + 1][0] : 28, k]).filter(([from]) => inGroove(from));
for (const [t, end, c] of SEGS) {
  const len = end - t; const root = ROOTS[c]; const ch = CHORDS[c];
  for (let k = 0; k < Math.round(len / 0.25); k++) bassNote(root + (k % 4 === 3 ? 12 : 0), t + k * 0.25, 0.22, k === 0 ? 1.05 : 0.85);
  supersaw([...ch, ch[0] + 12], t, len - 0.05, { g: t >= 22 ? 0.95 : 0.75, cutoff: t >= 22 ? 3200 : 2300, att: 0.04, rel: 0.25, verb: 0.35 });
  // the 16th ostinato: root, fifth, octave, fifth…
  const pat = [0, 7, 12, 7, 0, 7, 12, 15, 0, 7, 12, 7, 0, 7, 15, 12];
  for (let k = 0; k < Math.round(len / 0.125); k++) stringNote(ch[0] + 12 + pat[k % 16], t + k * 0.125, 0.1, t >= 8 && t < 18 ? 0.75 : 1, k % 2 ? 0.45 : -0.45);
}

// --- the hero motif (two bars), on the lead: 4–8, the bells over the screens, again at 14–18 and an octave up from 22
const MOTIF = [[0, 62, 0.5], [0.5, 65, 0.5], [1.0, 69, 0.75], [1.75, 67, 0.25], [2.0, 65, 0.5], [2.5, 67, 0.5], [3.0, 64, 0.5], [3.5, 62, 0.5]];
const MOTIF_B = [[0, 65, 0.5], [0.5, 69, 0.5], [1.0, 72, 0.75], [1.75, 70, 0.25], [2.0, 69, 0.5], [2.5, 67, 0.5], [3.0, 69, 0.9]];
const play = (m, t0, oct = 0, g = 1) => m.forEach(([o, n, d]) => brass(n + oct, t0 + o, d * 0.95, g));
play(MOTIF, 4); play(MOTIF_B, 6);
play(MOTIF, 14, 0, 0.9); play(MOTIF_B, 16, 0, 0.9);
play(MOTIF, 22, 12, 0.85); play(MOTIF_B, 24, 12, 0.85); play(MOTIF, 26, 12, 0.85);
play(MOTIF, 22, 0, 0.6); play(MOTIF_B, 24, 0, 0.6); play(MOTIF, 26, 0, 0.6);
// bells over the screens (8–14): the chord's tones in a rising 16th pattern
for (let t = 8; t < 14 - 1e-6; t += 0.25) {
  const ch = CHORDS[chordAt(t)]; const k = Math.round((t - 8) / 0.25);
  const n = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[0] + 36][k % 4];
  bell(n, t, k % 4 === 0 ? 1 : 0.7, (k % 4) / 1.5 - 1);
}
// the reveal: a shimmer as the card turns (cut.mjs: the pack opens at 8.0, the card shows at ~9.5)
for (let i = 0; i < 6; i++) bell(D + 36 + [0, 3, 7, 12, 15, 19][i], 9.5 + i * 0.045, 0.9, i / 3 - 1);
whoosh(8.0, 0.5, 0.8, -1); whoosh(12.0, 0.45, 0.7, 1); whoosh(14.0, 0.45, 0.7, -1); whoosh(16.0, 0.45, 0.7, 1);
whoosh(12.67, 0.3, 0.45, -1); whoosh(13.33, 0.3, 0.45, 1);

// --- 18 to 22: the breakdown under the crane
choir([D, D + 3, D + 7, D + 12], 18.0, 3.95, 0.25);
strings([D - 12, D, D + 7, D + 15], 18.0, 3.9, 0.35);
for (let b = 0; b < 4; b++) { kick(18 + b * BEAT * 2, 0.6, { soft: true }); }
bassNote(D - 12, 18.0, 1.9, 0.3); bassNote(D - 14, 20.0, 1.9, 0.3);
for (let i = 0; i < 8; i++) snare(20.0 + i * 0.125, 0.15 + i * 0.03, 0.25);
for (let i = 0; i < 8; i++) snare(21.0 + i * 0.0625, 0.4 + i * 0.03, 0.25);
for (let i = 0; i < 15; i++) snare(21.5 + i * 0.03125, 0.65 + i * 0.025, 0.25);
riser(20.0, 21.96, 1.1);
crash(21.97, 0.6, true);
// --- 22: the header goes in
impact(22.0, 1.15);
supersaw([D - 12, D, D + 3, D + 7, D + 12, D + 15], 22.0, 1.2, { g: 1.1, decay: 0.6, cutoff: (x) => 1200 + 7000 * Math.exp(-x / 0.2), verb: 0.6 });
choir([D + 12, D + 15, D + 19], 22.0, 5.9, 0.3);

// --- 28: the end. D major, a bell sting, out by 29.8
impact(28.0, 1.1);
crash(28.0, 1);
supersaw([D - 12, D, D + 4, D + 7, D + 12, D + 16], 28.0, 1.7, { g: 1.25, decay: 1.1, cutoff: (x) => 900 + 6500 * Math.exp(-x / 0.4), verb: 0.9 });
strings([D, D + 4, D + 7, D + 12], 28.0, 1.5, 1.1);
bassNote(D - 12, 28.0, 1.6, 1);
[0, 4, 7, 12, 16].forEach((o, i) => bell(D + 24 + o, 28.15 + i * 0.09, 1, i / 2 - 1));

/* -------------------------------- the mix -------------------------------- */
// sidechain: the pad, bass and music duck under every kick and impact
const duck = new Float32Array(N).fill(1);
for (const { t, g } of KICKS) {
  const o = Math.round(t * SR); const depth = Math.min(0.75, 0.55 * g);
  for (let i = 0; i < 0.32 * SR && o + i < N; i++) { const x = i / SR; const d = depth * (x < 0.006 ? x / 0.006 : Math.exp(-(x - 0.006) / 0.09)); duck[o + i] = Math.min(duck[o + i], 1 - d); }
}
for (const b of [bus.bass, bus.music]) for (let i = 0; i < N; i++) { b.L[i] *= duck[i]; b.R[i] *= duck[i]; }

if (process.env.DIAG) {
  const W = [[0, 2], [2, 4], [4, 8], [8, 12], [12, 14], [14, 18], [18, 20], [20, 22], [22, 24], [24, 28], [28, 29.8]];
  const rms = (b, a, z) => { let e = 0; const i0 = Math.round(a * SR); const i1 = Math.round(z * SR); for (let i = i0; i < i1; i++) e += b.L[i] ** 2 + b.R[i] ** 2; return (10 * Math.log10(e / (2 * (i1 - i0)) + 1e-12)).toFixed(1); };
  console.log(['bus'.padEnd(9), ...W.map(([a, z]) => `${a}-${z}`.padStart(8))].join(''));
  for (const [k, b] of Object.entries(bus)) console.log([k.padEnd(9), ...W.map(([a, z]) => rms(b, a, z).padStart(8))].join(''));
}
const master = new Bus();
bus.drums.into(master, 0.36);
bus.bass.into(master, 0.7);
bus.music.into(master, 2.5);
bus.fx.into(master, 0.75);
const [vl, vr] = freeverb(bus.verbSend.L, bus.verbSend.R, { room: 0.88, damp: 0.35, wet: 1 });
for (let i = 0; i < N; i++) { master.L[i] += vl[i] * 0.9; master.R[i] += vr[i] * 0.9; }
const [dl, dr] = pingpong(bus.delaySend.L, bus.delaySend.R, 0.375, 0.38);
for (let i = 0; i < N; i++) { master.L[i] += dl[i] * 0.6; master.R[i] += dr[i] * 0.6; }

{ const hl = svf(master.L, 28, 0.7, 'hp'); const hr = svf(master.R, 28, 0.7, 'hp'); master.L.set(hl); master.R.set(hr); }
// the end: faded out by 29.8 s
for (let i = 0; i < N; i++) { const t = i / SR; const g = t < 29.1 ? 1 : t < 29.8 ? Math.cos((t - 29.1) / 0.7 * Math.PI / 2) ** 2 : 0; master.L[i] *= g; master.R[i] *= g; }
// glue: a gentle bus compressor, then a soft clip and a peak ceiling
let envl = 0; const att = Math.exp(-1 / (0.01 * SR)); const rel = Math.exp(-1 / (0.15 * SR));
for (let i = 0; i < N; i++) {
  const lvl = Math.max(Math.abs(master.L[i]), Math.abs(master.R[i]));
  envl = lvl > envl ? att * envl + (1 - att) * lvl : rel * envl + (1 - rel) * lvl;
  const th = 0.35; const gr = envl > th ? (th + (envl - th) / 2.5) / envl : 1;
  master.L[i] = Math.tanh(master.L[i] * gr * 1.1); master.R[i] = Math.tanh(master.R[i] * gr * 1.1);
}
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(master.L[i]), Math.abs(master.R[i]));
const norm = 0.89 / peak;

/* ------------------------------- the file -------------------------------- */
const pcm = Buffer.alloc(44 + N * 4);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + N * 4, 4); pcm.write('WAVE', 8); pcm.write('fmt ', 12);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34);
pcm.write('data', 36); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { pcm.writeInt16LE(Math.round(clamp(master.L[i] * norm, -1, 1) * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round(clamp(master.R[i] * norm, -1, 1) * 32767), 46 + i * 4); }
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, pcm);
console.log(`✔ ${OUT}: ${LEN} s, peak ${peak.toFixed(2)} → normalised`);
