/**
 * Frame-exact capture of the game's screens (tools/tiktok). The page's timers,
 * rAF and clock are Playwright's fake clock; every CSS/Web animation is paused
 * and set to the virtual time since it first appeared; so each screenshot is
 * exactly 1/30 s after the last however slow the machine is. js/audio.js is
 * served with a log line in sfx(), so the clip's sound can be rendered offline
 * (sound.mjs) at exactly the moments the game played it.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export async function logSfx(page) {
  const src = readFileSync('js/audio.js', 'utf8')
    .replace('export function sfx(name, ...args) {', 'export function sfx(name, ...args) {\n  (window.__sfxLog ||= []).push([performance.now(), "sfx", name, ...args]);')
    .replace('export function chant(kind = \'hum\', level = 0.6) {', 'export function chant(kind = \'hum\', level = 0.6) {\n  (window.__sfxLog ||= []).push([performance.now(), "chant", kind, level]);');
  await page.route('**/js/audio.js', (r) => r.fulfill({ body: src, contentType: 'text/javascript' }));
}

export async function stepper(page, dir) {
  mkdirSync(dir, { recursive: true });
  // install() alone lets fake time keep flowing with real time; paused, it only moves when stepped
  const T0 = Date.now();
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1000);
  await page.evaluate(() => {
    window.__vt = 0; const seen = new WeakMap();
    window.__stepAnims = (vt) => {
      window.__vt = vt;
      for (const a of document.getAnimations()) {
        if (!seen.has(a)) seen.set(a, vt - (a.currentTime || 0));
        a.pause(); a.currentTime = vt - seen.get(a);
      }
    };
    window.__sfxLog = []; window.__t0 = performance.now();
  });
  let n = 0; let vt = 0;
  // shoot(i) decides whether frame i is kept (a dry run keeps none, and is fast)
  let i = 0; let shoot = () => true;
  const step = async () => {
    await page.clock.runFor(1000 / 30); vt += 1000 / 30;
    await page.evaluate((vt) => window.__stepAnims(vt), vt);
    if (shoot(i++)) await page.screenshot({ path: join(dir, `f${String(n++).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  };
  return {
    frame: step,
    async hold(ms) { for (let i = 0; i < Math.round(ms / (1000 / 30)); i++) await step(); },
    get n() { return n; },
    get i() { return i; },
    keep(fn) { shoot = fn; },
    async finish() {
      const log = await page.evaluate(() => window.__sfxLog.map(([t, ...r]) => [(t - window.__t0) / 1000, ...r]));
      writeFileSync(join(dir, 'sfx.json'), JSON.stringify({ frames: n, log }));
      return { frames: n, log };
    },
  };
}
