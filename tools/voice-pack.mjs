/**
 * Render a recorded commentary pack (v121).
 *
 *   node tools/voice-pack.mjs --kokoro <dir with node_modules/kokoro-js> [--only pbp-goal] [--force]
 *
 * Every line in data/voicePackUS.js becomes assets/voice/<pack>/<file>.mp3:
 * Kokoro-82M (Apache-2.0, fetched from huggingface.co on first run), then
 * ffmpeg trims the silence, levels the loudness and encodes 48 kbps mono.
 * Existing files are skipped unless --force, so a changed line is re-rendered
 * by deleting its file. Kokoro and ffmpeg are build tools only: the game ships
 * the MP3s and never runs either.
 *
 * ffmpeg: the first of $FFMPEG, `ffmpeg` on the PATH, or the imageio-ffmpeg
 * wheel (pip install imageio-ffmpeg).
 */
import { mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { PACK_US, packClips } from '../js/data/voicePackUS.js';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const kdir = arg('--kokoro');
const only = arg('--only');
const force = process.argv.includes('--force');
if (!kdir) { console.error('usage: node tools/voice-pack.mjs --kokoro <dir containing node_modules/kokoro-js>'); process.exit(2); }

function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  const py = spawnSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' });
  if (py.status === 0) return py.stdout.trim();
  throw new Error('no ffmpeg: set FFMPEG, install ffmpeg, or pip install imageio-ffmpeg');
}
const FF = ffmpegPath();
// the caller a touch quicker than the analyst, as the two voices always were
const SPEED = { pbp: 1.08, co: 0.98 };
const FILTER = [
  'silenceremove=start_periods=1:start_threshold=-45dB',
  'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB', 'areverse',
  'highpass=f=80', 'loudnorm=I=-16:TP=-1.5:LRA=9',
].join(',');

const { KokoroTTS } = await import(pathToFileURL(resolve(kdir, 'node_modules/kokoro-js/dist/kokoro.js')).href);
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });

const pack = PACK_US;
const out = join('assets', 'voice', pack.id);
mkdirSync(out, { recursive: true });
const tmp = join(out, '_tmp.wav');
let made = 0; let skipped = 0; let bytes = 0;
for (const c of packClips(pack)) {
  if (only && !c.file.startsWith(only)) continue;
  const dest = join(out, c.file);
  if (existsSync(dest) && !force) { skipped++; bytes += statSync(dest).size; continue; }
  const audio = await tts.generate(c.text, { voice: pack.voices[c.speaker], speed: SPEED[c.speaker] });
  await audio.save(tmp);
  const r = spawnSync(FF, ['-loglevel', 'error', '-y', '-i', tmp, '-af', FILTER, '-ar', '24000', '-ac', '1', '-b:a', '48k', dest]);
  if (r.status !== 0) throw new Error(`ffmpeg failed on ${c.file}: ${r.stderr}`);
  made++; bytes += statSync(dest).size;
  if (made % 25 === 0) console.log(`… ${made} rendered`);
}
rmSync(tmp, { force: true });
console.log(`✔ ${pack.id}: ${made} rendered, ${skipped} kept, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
