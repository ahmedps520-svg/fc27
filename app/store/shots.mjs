/**
 * App Store screenshots of the App Store build itself.
 *
 *   node app/store/shots.mjs [--only iphone|ipad] [--scenes menu,squad,...]
 *
 * Boots the game exactly as the iOS shell does (APEX_APP_STORE, so every name
 * is the original one) on the real server, at an iPhone 6.7" (932×430 @3x →
 * 2796×1290) and a 12.9" iPad (1366×1024 @2x → 2732×2048) held sideways,
 * plays to each scene and photographs it. Then each photo is set into a store
 * image of exactly that size with a headline (compose()), written to
 * app/store/screenshots/<device>/NN-scene.jpg. App Review requires that
 * screenshots show the app in use; these are the app, not artwork of it.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../../tests/smoke/server.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = arg('--only', '');
const ORDER = ['match', 'squad', 'pack', 'career', 'menu'];   // the store order; a scene's file number comes from here
const SCENES = arg('--scenes', ORDER.join(',')).split(',');
const RAW = path.join(HERE, '.raw');
const COMPOSE_ONLY = process.argv.includes('--compose-only');   // rebuild the store images from the last captures

export const DEVICES = [
  { id: 'iphone', css: [932, 430], dpr: 3, type: 'APP_IPHONE_67' },
  { id: 'ipad', css: [1366, 1024], dpr: 2, type: 'APP_IPAD_PRO_3GEN_129' },
];
export const HEADLINES = {
  match: ['Every match, in 3D', 'Tackles, set pieces, penalties and goal replays'],
  squad: ['Build your Ultimate XI', 'Collect players and set your eleven'],
  pack: ['Open packs. Chase the best.', 'Earned by playing, never bought'],
  career: ['Manage a club for seasons', 'Transfers, contracts and your academy'],
  menu: ['Football your way', 'Ultimate XI, Career, online and more'],
};

const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required'];

async function boot(browser, dev, server, notesVersion) {
  const ctx = await browser.newContext({ viewport: { width: dev.css[0], height: dev.css[1] }, deviceScaleFactor: dev.dpr, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [${dev.id}] pageerror ${e.message}`));
  await page.addInitScript(({ origin, notes, q }) => {
    window.APEX_APP_STORE = true; window.APEX_SERVER = origin;
    window.APEX_IOS = { version: '1.0', build: '0', commit: '' };
    if (!localStorage.getItem('apexxi.save.v1')) {
      localStorage.setItem('apexxi.save.v1', JSON.stringify({
        meta: { reset: 'econ-2curr-1' },
        flags: { notesSeen: notes, onboarded: true, hintMatches: 9 },
        settings: { quality: q, reduceMotion: true, tutorialDone: true, music: false, sfx: false, commentary: false },
      }));
    }
  }, { origin: server.url, notes: notesVersion, q: process.env.SHOT_QUALITY || 'cinema' });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 30000 });
  await page.click('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 30000 });
  // a strong, full Ultimate XI and a bank of coins and packs, from the App Store build's own world
  await page.evaluate(async () => {
    const { WORLD } = await import('/js/data/generator.js');
    const st = await import('/js/state.js');
    const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon').sort((a, b) => b.overall - a.overall);
    const shape = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CDM', 'CM', 'LW', 'ST', 'RW'];
    const used = new Set();
    const pick = (pos) => { const p = pool.find((x) => !used.has(x.id) && x.position === pos); if (p) used.add(p.id); return p?.id || null; };
    const lineup = shape.map(pick);
    const bench = ['GK', 'CB', 'CM', 'ST', 'LW'].map(pick);
    const extra = [];   // a pack pull should be new, not "Already yours"
    st.update((s) => {
      s.club.formation = '4-3-3'; s.club.lineup = lineup; s.club.bench = bench;
      s.club.collection = [...new Set([...lineup, ...bench, ...extra, ...s.club.collection])];
      s.club.apex = 184500; s.club.packs = ['prime', 'gold', 'gold', 'midfield', 'silver'];
      s.club.identity = { ...(s.club.identity || {}), name: 'Harbour Athletic', short: 'HAR', crest: { shape: 'shield', pattern: 'halves', device: 'star', colors: ['#2fd47a', '#0b1020'] } };
    });
  });
  return { ctx, page };
}

const go = (page, name, params = {}) => page.evaluate(async ({ n, p }) => { const app = await import('/js/app.js'); app.navigate(n, p); }, { n: name, p: params });

const SCENE = {
  async menu(page) {
    await go(page, 'menu');
    await page.waitForTimeout(6000);
  },
  async squad(page) {
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="club"]');
    await page.click('[data-utab="club"]');
    await page.waitForTimeout(1500);
    // the pitch with the eleven on it, not the header above it
    await page.evaluate(() => document.getElementById('pitch')?.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(1500);
  },
  async pack(page) {
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="store"]');
    await page.click('[data-utab="store"]');
    await page.waitForTimeout(800);
    const locker = await page.$('[data-stab="locker"]');
    if (locker) { await locker.click(); await page.waitForTimeout(800); }
    const btn = await page.$('[data-open-pack]');
    if (btn) {
      await btn.click();
      await page.waitForSelector('#packRip', { timeout: 15000 });
      await page.waitForTimeout(800);
      await page.click('#packRip');
      // the walkout: nation, position, club, then the card itself
      await page.waitForTimeout(Number(process.env.PACK_WAIT || 7000));
    }
  },
  async career(page) {
    await page.evaluate(async () => {
      const car = await import('/js/career.js');
      const { CAREER_CLUBS } = await import('/js/data/careerDb.js');
      const club = CAREER_CLUBS[0];
      car.startCareer({ name: 'Sam Hartley', nation: 'England', age: 41 }, club.id);
    });
    await go(page, 'career');
    await page.waitForTimeout(3000);
  },
  async match(page) {
    await page.evaluate(async () => {
      const { WORLD } = await import('/js/data/generator.js');
      const app = await import('/js/app.js');
      const big = WORLD.clubs.slice().sort((a, b) => (b.stadium?.capacity || 0) - (a.stadium?.capacity || 0))[0] || WORLD.clubs[0];
      app.navigate('play', { homeId: big.id, awayId: WORLD.clubs.find((c) => c.id !== big.id).id, duration: 900, skill: 1, mode: 'single', atmo: { time: 'night', weather: 'clear' } });
    });
    await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexCam, null, { timeout: 2400000 });
    await page.waitForFunction(() => window.__apexMatch?.phase === 'play', null, { timeout: 2400000 });
    await page.waitForFunction(() => window.__apexCam.mode === 'play' && window.__apexCam.modeTime > 5, null, { timeout: 2400000 });
    await page.evaluate(() => { for (const id of ['gmHints']) { const el = document.getElementById(id); if (el) el.hidden = true; } });
  },
};

/** The store image: a dark field in the game's colours, the headline, and the photo. */
export async function compose(browser, dev, scene, rawFile, outFile) {
  const W = dev.css[0] * dev.dpr; const H = dev.css[1] * dev.dpr;
  const [head, sub] = HEADLINES[scene];
  const img = `data:image/png;base64,${fs.readFileSync(rawFile).toString('base64')}`;
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const band = Math.round(H * (dev.id === 'ipad' ? 0.16 : 0.2));
  const pad = Math.round(H * 0.035);
  const shotH = H - band - pad;
  const shotW = Math.round(shotH * (dev.css[0] / dev.css[1]));
  await page.setContent(`<!doctype html><html><head><style>
    html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#05070e;font-family:"Helvetica Neue",Arial,sans-serif}
    .bg{position:absolute;inset:0;background:
      radial-gradient(${W * 0.6}px ${H * 0.9}px at 12% -10%, #123a2a 0%, transparent 60%),
      radial-gradient(${W * 0.5}px ${H * 0.8}px at 95% 0%, #1b1030 0%, transparent 62%),
      linear-gradient(180deg,#070b14 0%,#05070e 100%)}
    .head{position:absolute;left:0;right:0;top:0;height:${band}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(band * 0.04)}px}
    h1{margin:0;color:#fff;font-weight:800;letter-spacing:-.01em;font-size:${Math.round(band * 0.36)}px;line-height:1}
    p{margin:0;color:#7cf2a6;font-weight:600;font-size:${Math.round(band * 0.16)}px;letter-spacing:.02em}
    .shot{position:absolute;top:${band}px;left:50%;transform:translateX(-50%);width:${shotW}px;height:${shotH}px;
      border-radius:${Math.round(shotH * 0.045)}px;overflow:hidden;box-shadow:0 ${Math.round(H * 0.02)}px ${Math.round(H * 0.06)}px rgba(0,0,0,.7),0 0 0 ${Math.max(3, Math.round(H * 0.004))}px rgba(255,255,255,.12)}
    .shot img{width:100%;height:100%;display:block}
  </style></head><body><div class="bg"></div>
  <div class="head"><h1>${head}</h1><p>${sub}</p></div>
  <div class="shot"><img src="${img}"></div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: outFile, type: 'jpeg', quality: 92, timeout: 120000 });
  await page.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(RAW, { recursive: true });
  const server = await startServer();
  const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
  const browser = await chromium.launch({ args: ARGS });
  for (const dev of DEVICES) {
    if (ONLY && dev.id !== ONLY) continue;
    const outDir = path.join(HERE, 'screenshots', dev.id);
    fs.mkdirSync(outDir, { recursive: true });
    for (const scene of SCENES) {
      const n = ORDER.indexOf(scene) + 1;
      const t0 = Date.now();
      const raw = path.join(RAW, `${dev.id}-${scene}.png`);
      const out = path.join(outDir, `${String(n).padStart(2, '0')}-${scene}.jpg`);
      try {
        if (!COMPOSE_ONLY) {
          const { ctx, page } = await boot(browser, dev, server, notesVersion);
          try {
            await SCENE[scene](page, dev);
            await page.screenshot({ path: raw, timeout: 600000 });
          } finally { await ctx.close(); }   // before composing: a match still drawing starves the shared GPU
        }
        if (!fs.existsSync(raw)) throw new Error(`no capture at ${path.relative(process.cwd(), raw)}`);
        await compose(browser, dev, scene, raw, out);
        console.log(`${dev.id} ${scene}: ${path.relative(process.cwd(), out)} (${Math.round((Date.now() - t0) / 1000)} s)`);
      } catch (e) {
        console.log(`${dev.id} ${scene}: FAILED ${e.message.split('\n')[0]}`);
      }
    }
  }
  await browser.close(); await server.close?.();
  process.exit(0);
}
