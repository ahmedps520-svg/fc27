/**
 * The game's own sound, rendered offline for a clip (tools/tiktok).
 *
 *   node tools/tiktok/sound.mjs <timeline.json>:<out.wav> [...]
 *
 * A timeline is { dur, events: [[t, fn, ...args]] } with fn one of js/audio.js's
 * sfx / startCrowd / setCrowd / chant / startRain. The page swaps the browser's
 * AudioContext for an OfflineAudioContext before audio.js makes one, then
 * suspends the render at each event's time and calls the game's own function
 * there — so every roar, kick and whistle is the synthesis the game plays,
 * placed to the sample, without waiting on real time.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { startServer } from '../../tests/smoke/server.mjs';

const jobs = process.argv.slice(2).map((a) => a.split(':'));
const server = await startServer();
const browser = await chromium.launch();
for (const [tl, out] of jobs) {
  const T = JSON.parse(readFileSync(tl, 'utf8'));
  const page = await browser.newPage();
  await page.addInitScript((dur) => {
    const RATE = 48000;
    // audio.js checks ctx.state before it plays anything: this context always reads as running
    class Off extends OfflineAudioContext { get state() { return 'running'; } }
    window.AudioContext = function () { const c = new Off(2, Math.ceil(dur * RATE), RATE); window.__off = c; return c; };
  }, T.dur);
  await page.goto(`${server.url}/`);
  const bytes = await page.evaluate(async (T) => {
    const a = await import('/js/audio.js');
    a.setAudioSettings({ enabled: true, master: 0.9, music: 0, sfx: 0.9 });
    a.initAudio();
    const c = window.__off;
    const at = new Map();
    for (const [t, fn, ...args] of T.events) { const k = Math.max(1, Math.round(t * 48000 / 128)) * 128 / 48000; if (!at.has(k)) at.set(k, []); at.get(k).push([fn, args]); }
    for (const [k, list] of at) {
      c.suspend(k).then(() => { for (const [fn, args] of list) { try { if (fn === 'sfx') a.sfx(...args); else a[fn](...args); } catch (e) { console.log(fn, e.message); } } c.resume(); });
    }
    const buf = await c.startRendering();
    const L = buf.getChannelData(0); const R = buf.getChannelData(1); const n = L.length;
    const dv = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, 48000, true); dv.setUint32(28, 48000 * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
    const u = new Uint8Array(dv.buffer); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return btoa(s);
  }, T);
  writeFileSync(out, Buffer.from(bytes, 'base64'));
  console.log('✔', out);
  await page.close();
}
await browser.close(); server.stop();
