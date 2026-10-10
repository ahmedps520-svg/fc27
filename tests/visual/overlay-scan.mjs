/**
 * v189: every pop-over on a phone held sideways, which is the only way the
 * iPhone app runs.
 *
 * The layout scan covers screens on portrait phones; the screens scroll. What
 * it cannot see is a pop-over taller than a sideways phone that cannot scroll
 * — the full-time card that hid "Back to Ultimate XI" (v187) and the pack
 * reveal that dropped its card below the edge (v188) were both that. So: open
 * each pop-over at iPhone SE, 14 and 15 Pro Max sizes held sideways, in the
 * App Store build, and fail on any control that is off the screen with no way
 * to scroll to it.
 *
 *   node tests/visual/overlay-scan.mjs [--only se,p14,pm]
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PHONES = [
  { name: 'se', width: 667, height: 375 },
  { name: 'p14', width: 844, height: 390 },
  { name: 'pm', width: 932, height: 430 },
].filter((p) => !arg('--only', '') || arg('--only', '').split(',').includes(p.name));

const server = await startServer();
const browser = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);
const problems = [];
const errors = [];
let addr = 0;

/** Controls inside `sel` that are off screen and that nothing can scroll into view. */
const UNREACHABLE = (sel) => {
  const root = document.querySelector(sel);
  if (!root) return [`(nothing matches ${sel})`];
  const out = [];
  const fixedAncestor = (el) => { for (let b = el; b; b = b.parentElement) if (getComputedStyle(b).position === 'fixed') return true; return false; };
  for (const el of root.querySelectorAll('button, a.btn, input, select, [role="button"]')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
    if (r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1) continue;
    let ok = false;
    for (let a = el.parentElement; a && !ok; a = a.parentElement) {
      const s = getComputedStyle(a);
      const scrolls = /(auto|scroll)/.test(s.overflowY) && a.scrollHeight > a.clientHeight + 1;
      const blocked = s.touchAction === 'none';
      if (scrolls && !blocked) ok = true;
    }
    if (!ok && !fixedAncestor(el) && getComputedStyle(document.body).overflowY !== 'hidden' && document.scrollingElement.scrollHeight > innerHeight + 1) ok = true;
    if (!ok) out.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''} "${(el.textContent || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 28)}" at ${Math.round(r.top)}–${Math.round(r.bottom)} of ${innerHeight}`);
  }
  return out;
};

async function boot(ph, save) {
  const ctx = await browser.newContext({ viewport: { width: ph.width, height: ph.height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, extraHTTPHeaders: { 'x-forwarded-for': `10.6.0.${++addr}` } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${ph.name}: ${e.message}`));
  await page.addInitScript(({ s, origin }) => {
    window.APEX_APP_STORE = true; window.APEX_SERVER = origin;
    if (s) localStorage.setItem('apexxi.save.v1', JSON.stringify(s));
  }, { s: save, origin: server.url });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  await page.click('#startBtn');
  return { ctx, page };
}
const save = (extra = {}) => ({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notesVersion, onboarded: true, ...extra.flags }, settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple' }, club: { apex: 50000 }, ...extra.rest });
const go = (page, n, p = {}) => page.evaluate(async ({ n: nn, p: pp }) => (await import('/js/app.js')).navigate(nn, pp), { n, p });
const check = async (ph, page, what, sel) => {
  const bad = await page.evaluate(UNREACHABLE, sel);
  if (bad.length) problems.push(`${ph.name} ${ph.width}×${ph.height} · ${what}: ${bad.join('; ')}`);
  console.log(`  ${bad.length ? '✗' : '✓'} ${what}${bad.length ? ` — ${bad.join('; ')}` : ''}`);
};

for (const ph of PHONES) {
  console.log(`${ph.name} ${ph.width}×${ph.height}`);

  // the release notes card a returning player sees
  {
    const { ctx, page } = await boot(ph, save({ flags: { notesSeen: 'v184' } }));
    await page.waitForSelector('.np-card', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
    await check(ph, page, "what's new card", '.np-card');
    await ctx.close();
  }
  // a brand-new player's welcome
  {
    const { ctx, page } = await boot(ph, { meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: notesVersion }, settings: { quality: 'min', reduceMotion: true } });
    await page.waitForSelector('#onboardOverlay', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
    await check(ph, page, 'welcome', '#onboardOverlay');
    await ctx.close();
  }
  // a pack reveal
  {
    const { ctx, page } = await boot(ph, save({ rest: { club: { apex: 50000, packs: ['gold'] } } }));
    await page.waitForSelector('[data-go="squad"]');
    await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); const st = await import('/js/state.js'); st.update((s) => { s.club.packs = ['gold']; }); });
    await go(page, 'squad');
    await page.click('[data-utab="store"]'); await page.waitForTimeout(500);
    const locker = await page.$('[data-stab="locker"]'); if (locker) { await locker.click(); await page.waitForTimeout(400); }
    await page.click('[data-open-pack]');
    await page.waitForSelector('#packRip'); await page.waitForTimeout(400);
    await check(ph, page, 'pack, before the rip', '.pack-overlay');
    await page.click('#packRip'); await page.waitForTimeout(6000);
    await check(ph, page, 'pack, the card', '.pack-overlay');
    await ctx.close();
  }
  // a match: every pause section, then full time
  {
    const { ctx, page } = await boot(ph, save());
    await page.waitForSelector('[data-go="squad"]');
    await go(page, 'play', { homeId: 'c1', awayId: 'c4', duration: 600, skill: 1, mode: 'single', atmo: { time: 'day', weather: 'clear' } });
    await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 120000 });
    await page.click('#gmPause');
    await page.waitForTimeout(500);
    const items = await page.$$eval('.pause-item', (els) => els.map((e, i) => [i, e.textContent.trim()]));
    if (items.length < 4) problems.push(`${ph.name}: the pause menu has ${items.length} items`);
    for (const [i, label] of items) {
      if (/resume|photo|leave|quit/i.test(label)) continue;   // these leave the menu
      await page.evaluate((k) => document.querySelectorAll('.pause-item')[k]?.click(), i);
      await page.waitForTimeout(400);
      await check(ph, page, `pause · ${label}`, '#gmOverlay');
    }
    await ctx.close();
  }
  {
    const { ctx, page } = await boot(ph, save());
    await page.waitForSelector('[data-go="squad"]');
    await go(page, 'play', { homeId: 'c1', awayId: 'c4', duration: 600, skill: 1, mode: 'single', atmo: { time: 'day', weather: 'clear' } });
    await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 120000 });
    await page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.4; });
    await page.waitForSelector('#gmOverlay:not([hidden]) [data-o]', { timeout: 60000 });
    await page.waitForTimeout(500);
    await check(ph, page, 'full time', '#gmOverlay');
    await ctx.close();
  }
  // online: the account dialogs
  {
    const { ctx, page } = await boot(ph, save());
    await page.waitForSelector('[data-go="squad"]');
    await page.evaluate(async (n) => { const api = await import('/js/net/api.js'); await api.register(n, 'scan-pass-12345'); }, `ov${ph.name}${Date.now().toString(36).slice(-5)}`);
    await go(page, 'online');
    await page.waitForSelector('#deleteAcct', { timeout: 15000 });
    await page.click('#deleteAcct'); await page.waitForTimeout(400);
    await check(ph, page, 'delete account', '.del-card');
    await page.click('#delCancel');
    await page.click('#pairWatch').catch(() => {}); await page.waitForTimeout(800);
    if (await page.$('.pair-card')) await check(ph, page, 'pair a watch', '.pair-card');
    await ctx.close();
  }
}

await browser.close(); await server.stop?.(); await server.close?.();
if (errors.length) console.log(`page errors:\n  ${errors.join('\n  ')}`);
if (problems.length) { console.log(`\noverlay-scan: ${problems.length} unreachable\n  ${problems.join('\n  ')}`); process.exit(1); }
console.log('\noverlay-scan: ok');
process.exit(0);
