/**
 * Cut the App Store trailer (tools/trailer/appstore): 29.8 s, 30 fps, on the
 * 120 BPM score, so every cut is on a beat (15 frames).
 *
 *   node tools/trailer/appstore/cut.mjs [--formats iphone,ipad,wide] [--work tests/tmp/as]
 *
 * Reads the filmed shots (film.mjs → <work>/render/<shot>/), the App Store
 * build's screens (capture.mjs → <work>/ui/<format>/<take>/), the type
 * (titles.mjs → <work>/cards/<format>/<title>/) and the score (score.mjs →
 * <work>/score.wav). Writes, per format:
 *
 *   apex-xi-appstore-iphone.mp4   1920×886   App Store app preview, 6.5"–6.9" iPhone (landscape)
 *   apex-xi-appstore-ipad.mp4     1600×1200  App Store app preview, 12.9"–13" iPad (landscape)
 *   apex-xi-appstore-wide.mp4     1920×1080  16:9, for anywhere else
 *
 * App Store previews: 15–30 s, H.264 High, 30 fps, stereo AAC 256 kbps. The
 * footage is the game's own renderer (the App Store build's names) and the
 * screens are the App Store build; nothing is shown that isn't in the app.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { TITLES } from './titles.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const WORK = arg('--work', 'tests/tmp/as');
const FORMATS = arg('--formats', 'iphone,ipad,wide').split(',');
const FPS = 30;
const TOTAL = 894;                              // 29.8 s
const SIZE = { iphone: [1920, 886], ipad: [1600, 1200], wide: [1920, 1080] };
// the 1920×1080 footage into each frame: a centre crop, then the frame size
const FIT = { iphone: 'crop=1920:886:0:97', ipad: 'crop=1440:1080:240:0,scale=1600:1200:flags=lanczos', wide: 'null' };

function ff(args, what) {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${what}`);
}

/* ------------------------------ the edit ------------------------------ */
// shots: the render's frames [from, from+len); ui: a take's frames with a push in (zoom z0→z1 about cx, cy)
const H = (name, from = 2) => ({ shot: name, from, len: 15 });
const EDIT = [
  { shot: 'A1-coldopen', from: 0, len: 45 },                 // 0.0  slow motion: the strike is coming
  { shot: 'A2-flight', from: 5, len: 15 },                   // 1.5  real time: the ball in the air
  { shot: 'B1-net', from: 0, len: 60, shake: true },         // 2.0  IMPACT, the net in slow motion under the logo
  { shot: 'C1-carry', from: 0, len: 30 },                    // 4.0  the groove: a run
  { shot: 'C2-ball', from: 0, len: 30 },                     //      a ball into the box
  { shot: 'C3-header', from: 0, len: 30 },                   //      a header goes in
  { shot: 'C4-save', from: 0, len: 30 },                     //      a save
  { ui: 'pack', from: 6, len: 24, z: [1.55, 1.7], c: [0.5, 0.28] },   // 8.0  the pack, ripped
  { ui: 'pack', from: 92, len: 66, z: [1.2, 1.32], c: [0.5, 0.45] },  //      the plinths, the card (9.5)
  { ui: 'squad', still: true, from: 0, len: 30, z: [1.02, 1.12], c: [0.5, 0.55] }, //      the eleven
  { shot: 'E1-snow', from: 0, len: 20 },                     // 12.0 weather
  { shot: 'E2-rain', from: 0, len: 20 },
  { shot: 'E3-dusk', from: 0, len: 20 },
  { ui: 'career', still: true, from: 0, len: 60, z: [1.0, 1.1], c: [0.5, 0.45] },  // 14.0 Career
  { ui: 'online', still: true, from: 0, len: 60, z: [1.0, 1.1], c: [0.5, 0.45] },  // 16.0 Online
  { shot: 'G1-crane', from: 0, len: 60 },                    // 18.0 breakdown: the stadium
  { shot: 'G2-carry', from: 0, len: 15 },                    // 20.0 the build: a run
  { shot: 'G3-cross', from: 0, len: 15 },                    //      the cross
  { shot: 'G4-header', from: 0, len: 20 },                   // 21.0 the header, slow
  { shot: 'G5-net', from: 0, len: 10 },                      //      the net
  { shot: 'G6-celebrate', from: 0, len: 60, shake: true },   // 22.0 IMPACT, the celebration
  H('H1-day'), H('H2-duskceleb', 0), H('H3-snownet'), H('H4-night'),   // 24.0 the montage, a beat each
  H('H5-rain', 0), H('H6-dayceleb', 0), H('H7-dusknet'), H('H8-nightceleb', 0),
  { card: 'end', len: 54 },                                  // 28.0 the end card
];
// the type, at the frame it starts (titles.mjs has each one's length)
const OVER = { slam: 60, 'cap-play': 123, 'cap-pack': 243, 'cap-weather': 362, 'cap-career': 422, 'cap-online': 482, 'cap-lights': 546, 'w-ultimate': 720, 'w-career': 750, 'w-online': 780, 'w-street': 810 };
const FLASHES = [[660, 7], [840, 5]];         // white, at the second impact and the end card

/* ------------------------------ the look ------------------------------ */
// footage: a filmic curve (lifted, cool shadows, warm highlights), more colour, the floodlights blooming,
// the edges of the frame softened like a long lens, a vignette
const GRADE = "eq=contrast=1.07:saturation=1.16:brightness=-0.012,curves=r='0/0.015 0.5/0.5 1/1':g='0/0.025 0.5/0.505 1/0.985':b='0/0.06 0.5/0.49 1/0.93'";
function maskFile(fmt) {
  // a soft ellipse: black (sharp) in the middle, white (blurred) toward the edges — written as a PGM
  const [W, Hh] = SIZE[fmt]; const file = join(WORK, `edge-${fmt}.pgm`);
  if (existsSync(file)) return file;
  const head = Buffer.from(`P5\n${W} ${Hh}\n255\n`); const px = Buffer.alloc(W * Hh);
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const dx = (x / W - 0.5) / 0.5; const dy = (y / Hh - 0.47) / 0.5;
    const r = Math.sqrt(dx * dx * 0.85 + dy * dy * 1.15);
    px[y * W + x] = Math.round(255 * Math.min(1, Math.max(0, (r - 0.62) / 0.42)) ** 1.6);
  }
  writeFileSync(file, Buffer.concat([head, px]));
  return file;
}

function segment(fmt, s, i, dir) {
  const [W, Hh] = SIZE[fmt]; const out = join(dir, `${String(i).padStart(2, '0')}.mp4`);
  const enc = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '11', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-frames:v', String(s.len), out];
  if (s.shot) {
    const src = join(WORK, 'render', s.shot, 'f%04d.jpg');
    const shake = s.shake ? `,crop=iw-44:ih-44:x='22+22*sin(n*2.3)*exp(-n/3.5)':y='22+22*cos(n*3.1)*exp(-n/3.5)',scale=${W}:${Hh}:flags=lanczos` : '';
    const fc = `[0:v]setpts=PTS-STARTPTS,${FIT[fmt]}${shake},${GRADE},format=gbrp,split=3[a][b][c];`
      + `[b]curves=all='0/0 0.62/0 1/1',gblur=sigma=${Math.round(W / 90)}[bl];[a][bl]blend=all_mode=screen:all_opacity=0.32[g];`
      + `[c]gblur=sigma=${(W / 420).toFixed(1)}[soft];[1:v]format=gbrp,scale=${W}:${Hh}[m];[g][soft][m]maskedmerge,vignette=PI/5.2,format=yuv420p[v]`;
    ff(['-framerate', String(FPS), '-start_number', String(s.from), '-i', src, '-loop', '1', '-i', maskFile(fmt), '-filter_complex', fc, '-map', '[v]', ...enc], s.shot);
  } else if (s.ui) {
    const src = join(WORK, 'ui', fmt, s.ui, 'f%04d.jpg');
    const [z0, z1] = s.z; const [cx, cy] = s.c; const L = Math.max(1, s.len - 1);
    const z = `${z0}+(${z1 - z0})*on/${L}`;
    const vf = `zoompan=z='${z}':x='max(0,min(iw-iw/zoom,${cx}*iw-iw/zoom/2))':y='max(0,min(ih-ih/zoom,${cy}*ih-ih/zoom/2))':d=1:s=${W}x${Hh}:fps=${FPS},eq=contrast=1.04:saturation=1.08,vignette=PI/6,format=yuv420p`;
    // squad, Career and Online are one frame each (capture.mjs): held, with the push in for motion
    const input = s.still ? ['-loop', '1', '-framerate', String(FPS), '-i', join(WORK, 'ui', fmt, s.ui, 'f0000.jpg')] : ['-framerate', String(FPS), '-start_number', String(s.from), '-i', src];
    ff([...input, '-vf', vf, ...enc], `ui ${s.ui}`);
  } else {
    ff(['-framerate', String(FPS), '-i', join(WORK, 'cards', fmt, s.card, 'f%04d.png'), '-vf', `scale=${W}:${Hh},format=yuv420p`, ...enc], s.card);
  }
  return out;
}

/* ------------------------------ the sound ------------------------------ */
const V = 'assets/voice/us';
const LINES = [[2.1, 'pbp-goal-6.mp3', 1.0], [18.3, 'co-cx-night-0.mp3', 0.9], [20.6, 'pbp-header-1.mp3', 1.0], [22.15, 'pbp-goal-7.mp3', 1.0]];
const ROARS = [[2.0, 1.0], [6.55, 0.7], [22.0, 1.0], [24.45, 0.45], [25.4, 0.45], [25.9, 0.45], [27.4, 0.5]];
const OOH = [[7.6, 0.6]];
function sound() {
  const out = join(WORK, 'audio.wav'); const T = TOTAL / FPS;
  const inputs = ['-i', join(WORK, 'score.wav')];
  for (const [, clip] of LINES) inputs.push('-i', join(V, clip));
  const fc = [];
  fc.push(`[0:a]atrim=0:${T},asetpts=PTS-STARTPTS,volume=1.0[mus]`);
  // the crowd: brown noise shaped into a stadium; down under the screens, gone for the end card
  const cv = 'if(lt(t,8),0.75,if(lt(t,12),0.22,if(lt(t,14),0.8,if(lt(t,18),0.22,if(lt(t,28),1,max(0,1-(t-28)/0.8))))))';
  fc.push(`anoisesrc=color=brown:amplitude=0.5:duration=${T}:seed=7,highpass=f=160,lowpass=f=2400,tremolo=f=0.4:d=0.2,volume='${cv}':eval=frame,volume=0.42[crowd]`);
  const parts = [];
  [...ROARS.map((r) => [...r, false]), ...OOH.map((r) => [...r, true])].forEach(([t, g, ooh], i) => {
    fc.push(`anoisesrc=color=pink:amplitude=0.5:duration=3.4:seed=${21 + i},highpass=f=240,lowpass=f=${ooh ? 1700 : 3400},afade=t=in:st=0:d=${ooh ? 0.22 : 0.08},afade=t=out:st=${ooh ? 0.5 : 0.9}:d=${ooh ? 1.1 : 2.3},volume=${(g * (ooh ? 0.5 : 0.85)).toFixed(2)},adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},apad=whole_dur=${T}[r${i}]`);
    parts.push(`[r${i}]`);
  });
  const vparts = [];
  LINES.forEach(([t, , g], i) => {
    fc.push(`[${i + 1}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=90,volume=${(g * 1.9).toFixed(2)},adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},apad=whole_dur=${T}[v${i}]`);
    vparts.push(`[v${i}]`);
  });
  fc.push(`${vparts.join('')}amix=inputs=${vparts.length}:normalize=0,asplit=2[voice][vkey]`);
  fc.push('[mus][vkey]sidechaincompress=threshold=0.06:ratio=2.2:attack=20:release=260:makeup=1[musd]');
  fc.push(`[crowd]${parts.join('')}amix=inputs=${1 + parts.length}:normalize=0,volume=0.7[crowdall]`);
  fc.push(`[musd][crowdall][voice]amix=inputs=3:normalize=0,atrim=0:${T},afade=t=out:st=${(T - 0.25).toFixed(2)}:d=0.25[aout]`);
  const pre = join(WORK, 'audio-pre.wav');
  ff([...inputs, '-filter_complex', fc.join(';'), '-map', '[aout]', '-ar', '48000', '-ac', '2', pre], 'sound');
  // to -15 LUFS with one linear gain and a true-peak limiter, so the drops stay drops
  const m = spawnSync('ffmpeg', ['-hide_banner', '-i', pre, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const I = +m.slice(m.lastIndexOf('Summary')).match(/I:\s+(-?[\d.]+) LUFS/)[1];
  ff(['-i', pre, '-af', `volume=${(-15 - I).toFixed(2)}dB,alimiter=limit=0.87:attack=2:release=60:level=disabled`, '-ar', '48000', out], 'level');
  return out;
}

/* ------------------------------ per format ------------------------------ */
const audio = sound();
console.log('✔ sound');
if (process.argv.includes('--sound-only')) process.exit(0);
for (const fmt of FORMATS) {
  const [W, Hh] = SIZE[fmt];
  const dir = join(WORK, 'segs', fmt); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const segs = EDIT.map((s, i) => segment(fmt, s, i, dir));
  const sum = EDIT.reduce((a, s) => a + s.len, 0);
  if (sum !== TOTAL) throw new Error(`the edit is ${sum} frames, not ${TOTAL}`);
  const list = join(dir, 'list.txt'); writeFileSync(list, segs.map((s) => `file '${resolve(s)}'`).join('\n'));
  const joined = join(dir, 'joined.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined], 'join');
  // the type over the picture, the flashes, a little grain; then the delivery encode
  const inputs = ['-i', joined]; const fc = []; let last = '[0:v]'; let k = 1;
  for (const [name, at] of Object.entries(OVER)) {
    inputs.push('-framerate', String(FPS), '-i', join(WORK, 'cards', fmt, name, 'f%04d.png'));
    const len = TITLES.find((t) => t.name === name).frames;
    fc.push(`[${k}:v]format=rgba,setpts=PTS-STARTPTS+${at}/${FPS}/TB[t${k}]`);
    fc.push(`${last}[t${k}]overlay=0:0:eof_action=pass:enable='between(n,${at},${at + len - 1})'[o${k}]`);
    last = `[o${k}]`; k++;
  }
  FLASHES.forEach(([at, len], j) => {
    fc.push(`color=c=white:s=${W}x${Hh}:r=${FPS}:d=${(len / FPS).toFixed(3)},format=rgba,fade=t=out:st=0:d=${(len / FPS).toFixed(3)}:alpha=1,setpts=PTS-STARTPTS+${at}/${FPS}/TB[f${j}]`);
    fc.push(`${last}[f${j}]overlay=0:0:eof_action=pass:enable='between(n,${at},${at + len - 1})'[fl${j}]`);
    last = `[fl${j}]`;
  });
  fc.push(`${last}noise=alls=5:allf=t,format=yuv420p[v]`);
  const out = join(WORK, `apex-xi-appstore-${fmt}.mp4`);
  ff([...inputs, '-i', audio, '-filter_complex', fc.join(';'), '-map', '[v]', '-map', `${k}:a`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level:v', '4.0', '-preset', 'slow', '-b:v', '11M', '-maxrate', '12M', '-bufsize', '24M',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-frames:v', String(TOTAL),
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest', '-movflags', '+faststart', out], `final ${fmt}`);
  console.log(`✔ ${out}`);
}
