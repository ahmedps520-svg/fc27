/**
 * The App Store trailer's screen footage (tools/trailer/appstore): the App
 * Store build itself, recorded frame by frame at 30 fps.
 *
 *   node tools/trailer/appstore/capture.mjs [--formats iphone,ipad,wide] [--takes pack,squad,career,online]
 *        [--out tests/tmp/as/ui]
 *
 * Boots the game as the iOS shell does (APEX_APP_STORE: the invented names,
 * no paid items) against the local server, at the size each video needs:
 *
 *   iphone  932×430 points @3 (2796×1290) → 1920×886 in the cut (App Store preview, 6.5"–6.9" iPhone)
 *   ipad   1366×1024 @2 (2732×2048)      → 1600×1200 (App Store preview, 12.9"–13" iPad)
 *   wide   1280×720 @2 (2560×1440)       → 1920×1080 (16:9, for anywhere else)
 *
 * Captured above the video size, so the cut can push in on a card without going soft.
 *
 * A software-rendered page can't keep up with 30 fps, so it runs on a virtual
 * clock: setTimeout, setInterval, requestAnimationFrame, performance.now and
 * Date.now are taken over, and every CSS animation and transition is paused
 * and stepped by hand (document.getAnimations). Each frame is exactly 1/30 s
 * of the game's time, however long the screenshot takes — so the pack's rip,
 * the plinths and the walk-out card move exactly as they do on a phone.
 * Writes <out>/<format>/<take>/f####.jpg.
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../../../tests/smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', 'tests/tmp/as/ui');
const FORMATS = {
  iphone: { css: [932, 430], dpr: 3, mobile: true },
  ipad: { css: [1366, 1024], dpr: 2, mobile: true },
  wide: { css: [1280, 720], dpr: 2, mobile: false },
};
const WANT_F = arg('--formats', Object.keys(FORMATS).join(',')).split(',');
const WANT_T = arg('--takes', 'pack,squad,career,online').split(',');
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];

/* The virtual clock, installed before the game's first script and switched on per take. */
function clockScript() {
  const real = { st: window.setTimeout.bind(window), ct: window.clearTimeout.bind(window), si: window.setInterval.bind(window), ci: window.clearInterval.bind(window), raf: window.requestAnimationFrame.bind(window), caf: window.cancelAnimationFrame.bind(window), now: performance.now.bind(performance), dnow: Date.now };
  const V = window.__vclock = { on: false, t: 0, base: 0, dbase: 0, timers: new Map(), rafs: new Map(), id: 1e7 };
  window.setTimeout = (fn, ms = 0, ...a) => { if (!V.on) return real.st(fn, ms, ...a); const id = ++V.id; V.timers.set(id, { at: V.t + Math.max(0, +ms || 0), fn, a }); return id; };
  window.setInterval = (fn, ms = 0, ...a) => { if (!V.on) return real.si(fn, ms, ...a); const id = ++V.id; const every = Math.max(1, +ms || 0); V.timers.set(id, { at: V.t + every, fn, a, every }); return id; };
  window.clearTimeout = (id) => { if (V.timers.has(id)) V.timers.delete(id); else real.ct(id); };
  window.clearInterval = (id) => { if (V.timers.has(id)) V.timers.delete(id); else real.ci(id); };
  window.requestAnimationFrame = (cb) => { if (!V.on) return real.raf(cb); const id = ++V.id; V.rafs.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { if (V.rafs.has(id)) V.rafs.delete(id); else real.caf(id); };
  performance.now = () => (V.on ? V.base + V.t : real.now());
  Date.now = () => (V.on ? V.dbase + V.t : real.dnow());
  V.start = () => { V.base = real.now(); V.dbase = real.dnow(); V.t = 0; V.on = true; };
  // back to real time: what is still waiting goes to the real clock, the animations run again
  V.stop = () => {
    V.on = false;
    for (const [, x] of V.timers) { if (x.every) real.si(x.fn, x.every, ...x.a); else real.st(x.fn, Math.max(0, x.at - V.t), ...x.a); }
    V.timers.clear();
    for (const cb of V.rafs.values()) real.raf(cb);
    V.rafs.clear();
    for (const an of document.getAnimations()) { if (an.__v) { an.__v = false; try { an.play(); } catch { /* gone */ } } }
  };
  V.step = (ms) => {
    const end = V.t + ms;
    for (let guard = 0; guard < 5000; guard++) {
      let next = null;
      for (const [id, x] of V.timers) if (x.at <= end && (!next || x.at < next[1].at)) next = [id, x];
      if (!next) break;
      const [id, x] = next; V.t = Math.max(V.t, x.at);
      if (x.every) x.at += x.every; else V.timers.delete(id);
      try { if (typeof x.fn === 'function') x.fn(...x.a); } catch (e) { console.error(e); }
    }
    V.t = end;
    const cbs = [...V.rafs.values()]; V.rafs.clear();
    for (const cb of cbs) { try { cb(V.base + V.t); } catch (e) { console.error(e); } }
    for (const an of document.getAnimations()) {
      if (!an.__v) { an.__v = true; try { an.pause(); } catch { /* gone */ } }
      try { an.currentTime = (an.currentTime || 0) + ms; } catch { /* gone */ }
    }
  };
}

async function boot(browser, F, server, notes) {
  const ctx = await browser.newContext({ viewport: { width: F.css[0], height: F.css[1] }, deviceScaleFactor: F.dpr, isMobile: F.mobile, hasTouch: F.mobile });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('  pageerror', e.message));
  await page.addInitScript(clockScript);
  await page.addInitScript(({ origin, notes }) => {
    window.APEX_APP_STORE = true; window.APEX_SERVER = origin;
    window.APEX_IOS = { version: '1.1', build: '7', commit: '' };
    if (!localStorage.getItem('apexxi.save.v1')) {
      localStorage.setItem('apexxi.save.v1', JSON.stringify({
        meta: { reset: 'econ-2curr-1' },
        flags: { notesSeen: notes, onboarded: true, hintMatches: 9 },
        settings: { quality: 'high', reduceMotion: false, tutorialDone: true, music: false, sfx: false, commentary: false, menuTheme: 'off' },
      }));
    }
  }, { origin: server.url, notes });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 60000 });
  await page.click('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 60000 });
  // the same club as the App Store screenshots: a strong, full eleven of the App Store build's own players
  await page.evaluate(async () => {
    const { WORLD } = await import('/js/data/generator.js');
    const st = await import('/js/state.js');
    const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon').sort((a, b) => b.overall - a.overall);
    const shape = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CDM', 'CM', 'LW', 'ST', 'RW'];
    const used = new Set();
    const pick = (pos) => { const p = pool.find((x) => !used.has(x.id) && x.position === pos); if (p) used.add(p.id); return p?.id || null; };
    const lineup = shape.map(pick);
    const bench = ['GK', 'CB', 'CM', 'ST', 'LW'].map(pick);
    st.update((s) => {
      s.club.formation = '4-3-3'; s.club.lineup = lineup; s.club.bench = bench;
      s.club.collection = [...new Set([...lineup, ...bench, ...s.club.collection])];
      s.club.apex = 184500; s.club.packs = ['prime', 'gold', 'gold'];
      s.club.identity = { ...(s.club.identity || {}), name: 'Harbour Athletic', short: 'HAR', crest: { shape: 'shield', pattern: 'halves', device: 'star', colors: ['#2fd47a', '#0b1020'] } };
    });
  });
  return { ctx, page };
}
const go = (page, name, params = {}) => page.evaluate(async ({ n, p }) => { (await import('/js/app.js')).navigate(n, p); }, { n: name, p: params });

/** Record `frames` frames of the page on the virtual clock; `at` runs page code at given frames;
 *  only the frames `keep` wants are photographed (the clock still runs through the rest). */
async function record(page, dir, frames, at = {}, keep = () => true) {
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  await page.evaluate(() => window.__vclock.start());
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    if (at[f]) await page.evaluate(at[f]);
    await page.evaluate(() => window.__vclock.step(1000 / 30));
    if (!keep(f)) continue;
    await page.screenshot({ path: join(dir, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93, timeout: 120000 });
  }
  console.log(`  ✔ ${dir}: ${frames} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

const TAKES = {
  /* the pack: a Prime pack in hand, the rip, the plinths, the walk-out card. The draw is
     seeded until it pulls a special (the reveal with confetti), so every format shows the same card. */
  async pack(page, dir) {
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="store"]');
    await page.click('[data-utab="store"]'); await page.waitForTimeout(800);
    const locker = await page.$('[data-stab="locker"]'); if (locker) { await locker.click(); await page.waitForTimeout(800); }
    let seed = 0; let ok = false;
    for (; seed < 400 && !ok; seed++) {
      ok = await page.evaluate(async (seed) => {
        let a = 7001 + seed * 7919;
        const m32 = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        const realRandom = window.__realRandom || (window.__realRandom = Math.random);
        Math.random = m32;
        const btn = document.querySelector('[data-open-pack="prime"]');
        if (!btn) { Math.random = realRandom; return false; }
        btn.click();
        await new Promise((r) => setTimeout(r, 120));
        Math.random = realRandom;
        const ov = document.getElementById('packOverlay');
        const good = !!ov && /rar-special/.test(ov.className) && !!document.getElementById('packRip');
        if (!good && ov) {
          // not this one: put the pack back and the collection as it was
          ov.hidden = true; ov.innerHTML = ''; ov.className = '';
          const st = await import('/js/state.js');
          st.update((s) => { s.club.packs = ['prime', 'gold', 'gold']; });
          (await import('/js/app.js')).navigate('squad', { tab: 'store' });
        }
        return good;
      }, seed);
      if (!ok) {
        await page.waitForTimeout(250);
        const store = await page.$('[data-utab="store"]'); if (store) await store.click().catch(() => {});
        await page.waitForTimeout(250);
        const lk = await page.$('[data-stab="locker"]'); if (lk) await lk.click().catch(() => {});
        await page.waitForTimeout(250);
      }
    }
    console.log(`  pack: ${ok ? `a special on seed ${seed - 1}` : 'no special found, filming what came'}`);
    await page.waitForTimeout(600);
    // in hand for half a second, then the rip; the show runs about 3.4 s and the card holds
    // the cut (cut.mjs) uses 6–29 (the rip) and 92–157 (the plinths and the card)
    await record(page, dir, 158, { 14: () => document.getElementById('packRip')?.click() }, (f) => (f >= 6 && f < 30) || f >= 92);
  },
  async squad(page, dir) {
    await page.evaluate(() => { const ov = document.getElementById('packOverlay'); if (ov) { ov.hidden = true; ov.innerHTML = ''; } });
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="club"]');
    await page.click('[data-utab="club"]'); await page.waitForTimeout(1500);
    await page.evaluate(() => document.getElementById('pitch')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1200);
    await record(page, dir, 1);
  },
  async career(page, dir) {
    await page.evaluate(async () => {
      const car = await import('/js/career.js');
      const { CAREER_CLUBS } = await import('/js/data/careerDb.js');
      car.startCareer({ name: 'Sam Hartley', nation: 'England', age: 41 }, CAREER_CLUBS[0].id);
    });
    await go(page, 'career');
    await page.waitForTimeout(3000);
    await record(page, dir, 1);
  },
  /* online: a fresh account on the local server, then a private lobby with its code showing */
  async online(page, dir) {
    await go(page, 'online');
    await page.waitForSelector('[data-mode="register"]', { timeout: 30000 });
    await page.click('[data-mode="register"]');
    const name = `Harbour${Date.now().toString(36).slice(-4)}`;
    await page.fill('#acctName', name);
    await page.fill('#acctPass', 'trailer-pass-123');
    await page.click('#acctGo');
    await page.waitForSelector('#olHost', { timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.click('#olHost').catch(() => {});
    await page.waitForTimeout(2500);
    await record(page, dir, 1);
  },
};

const server = await startServer();
const notes = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
const browser = await chromium.launch({ args: ARGS });
for (const fid of WANT_F) {
  const F = FORMATS[fid]; console.log(`${fid}: ${F.css.join('×')} @${F.dpr.toFixed(3)}`);
  const { ctx, page } = await boot(browser, F, server, notes);
  for (const t of WANT_T) {
    try { await TAKES[t](page, join(OUT, fid, t)); } catch (e) { console.log(`  ✗ ${t}: ${e.message.split('\n')[0]}`); }
    // back to real time between takes
    await page.evaluate(() => window.__vclock.stop());
  }
  await ctx.close();
}
await browser.close(); server.stop();
