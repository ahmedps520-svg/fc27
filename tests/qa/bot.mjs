/**
 * The QA bot: plays through every mode end to end, in a real browser, on
 * the real server, and fails on any page error or any step that does not
 * land where it should.
 *
 *   node tests/qa/bot.mjs [--gl] [--only onboarding,ultimate,career,pro,weekend,online,party,watch]
 *
 * Runs on the 2D canvas path by default (WebGL off) because software WebGL
 * draws a frame in a third of a second and a sixty-second match would take
 * ten minutes; the renderer has its own tests (smoke, gl-scan, gl-fps).
 * Matches are ended by winding the sim's clock forward through the probe
 * the match screen exposes, so every flow after kick-off — the end card,
 * the rewards, the ladder, the tally — is the real code.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const GL = process.argv.includes('--gl');
const ONLY = arg('--only', '').split(',').filter(Boolean);
const want = (f) => !ONLY.length || ONLY.includes(f);
const ARGS = GL
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required']
  : ['--disable-webgl', '--disable-webgl2', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--autoplay-policy=no-user-gesture-required'];
const RESET = 'econ-2curr-1';
const step = (s) => console.log(`  · ${s}`);

const server = await startServer();
const browser = await chromium.launch({ args: ARGS });
const pageErrors = [];
const watch = (page, tag) => {
  page.on('pageerror', (e) => {
    const key = `${tag}: ${e.message}`;
    if (pageErrors.some((x) => x.startsWith(key))) return;
    pageErrors.push(`${key}\n      ${String(e.stack || '').split('\n').slice(1, 5).join('\n      ')}`);
  });
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|WebGL context|Error creating WebGL/.test(m.text())) pageErrors.push(`${tag} console: ${m.text()}`); });
};
const notesVersion = await fetch(`${server.url}/js/data/patchNotes.js`).then((r) => r.text()).then((t) => (t.match(/version: '(v\d+)'/) || [])[1]);

/** A page booted to the menu with a given save. */
// each browser is its own "household" to the server's per-address sign-up limit
let addr = 0;
async function boot(tag, save, viewport = { width: 900, height: 560 }) {
  const ctx = await browser.newContext({ viewport, hasTouch: false, extraHTTPHeaders: { 'x-forwarded-for': `10.9.0.${++addr}` } });
  const page = await ctx.newPage();
  watch(page, tag);
  await page.addInitScript(({ s }) => {
    localStorage.setItem('apexxi.save.v1', JSON.stringify(s));
    // keep the last uncaught error's stack where the bot can read it
    window.addEventListener('error', (e) => { window.__lastErr = String(e.error?.stack || e.message); });
  }, { s: save });
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn', { timeout: 20000 });
  await page.click('#startBtn');
  await page.waitForSelector('[data-go="squad"]', { timeout: 15000 });
  return { ctx, page };
}
const baseSave = (extra = {}) => ({ meta: { reset: RESET }, flags: { notesSeen: notesVersion }, settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple' }, ...extra });
const go = (page, name, params = {}) => page.evaluate(async ({ n, p }) => { const app = await import('/js/app.js'); app.navigate(n, p); }, { n: name, p: params });
const click = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error(`no element ${s}`); el.click(); }, sel);
const save = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('apexxi.save.v1')));
/** Wait for the veil, then wind the clock to the last second and wait for the end card. */
async function playToEnd(page, { seconds = 6 } = {}) {
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
  await page.waitForTimeout(seconds * 1000);
  const minute = await page.evaluate(() => window.__apexMatch?.minute());
  assert.ok(minute >= 0, 'the match is running');
  // wind the clock to the last second — in the second half, or the sim would call half time first
  await page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
  try {
    await page.waitForSelector('[data-o="quit"], [data-o="again"], [data-o="uxi"], [data-o="career"]', { timeout: 90000 });
  } catch (e) {
    const st = await page.evaluate(() => { const m = window.__apexMatch; return { phase: m?.phase, t: m?.t, half: m?.half, dur: m?.duration, btns: [...document.querySelectorAll('[data-o]')].map((b) => b.dataset.o), overlay: document.getElementById('gmOverlay')?.hidden, screen: document.querySelector('#gmRoot') ? 'play' : document.body.className }; });
    throw new Error(`no end card: ${JSON.stringify(st)}`);
  }
  return page.evaluate(() => `${window.__apexMatch.teams[0].score}–${window.__apexMatch.teams[1].score}`);
}

let failed = false;
const flow = async (name, fn) => {
  if (!want(name)) return;
  console.log(name);
  try { await fn(); } catch (e) { failed = true; console.log(`  ✗ ${name}: ${e.message}`); }
};

try {
  await flow('onboarding', async () => {
    const fresh = { meta: { reset: RESET }, flags: { notesSeen: notesVersion }, settings: { quality: 'min', reduceMotion: true } };
    const { ctx, page } = await boot('onboarding', fresh);
    await page.waitForSelector('#onboardOverlay', { timeout: 5000 });
    step('welcome card with a starter squad');
    const s1 = await save(page);
    assert.ok(s1.club.collection.length >= 14, `starter squad dealt (${s1.club.collection.length})`);
    assert.equal(s1.club.lineup.filter(Boolean).length, 11, 'a full XI is set');
    await click(page, '#onboardSkip');
    await page.waitForSelector('.today', { timeout: 5000 });
    const s2 = await save(page);
    assert.ok(s2.flags.onboarded, 'onboarded');
    assert.ok((s2.club.pending || []).length >= 2, 'first rewards pending on Today');
    step(`skip lands on Today with ${s2.club.pending.length} rewards`);
    await click(page, '[data-claim]');
    await page.waitForTimeout(400);
    const s3 = await save(page);
    assert.ok(s3.club.apex > s2.club.apex || s3.club.packs.length > s2.club.packs.length, 'a reward was claimed');
    step('first reward claimed');
    // the guided match itself, on a second fresh save
    const { ctx: c2, page: p2 } = await boot('guided', fresh);
    await p2.waitForSelector('#onboardOverlay', { timeout: 5000 });
    await p2.evaluate(async () => { document.getElementById('onboardOverlay').remove(); const app = await import('/js/app.js'); app.navigate('play', { homeId: 'c1', awayId: 'c10', duration: 30, skill: 0.55, mode: 'single', guided: true, atmo: { time: 'day', weather: 'clear' } }); });
    await p2.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
    await p2.waitForTimeout(1200);
    const hint = await p2.evaluate(() => document.getElementById('gmHints')?.textContent);
    assert.ok(/1\/6/.test(hint), `first lesson on the HUD (${hint})`);
    await p2.keyboard.down('KeyD'); await p2.waitForTimeout(900); await p2.keyboard.up('KeyD');
    await p2.waitForTimeout(1600);
    const hint2 = await p2.evaluate(() => document.getElementById('gmHints')?.textContent);
    assert.ok(/2\/6/.test(hint2), `moving advanced the lesson (${hint2})`);
    step('guided match teaches, and advances on the action');
    await playToEnd(p2, { seconds: 2 });
    await click(p2, '[data-o="quit"]');
    await p2.waitForSelector('.today', { timeout: 5000 });
    const s4 = await save(p2);
    assert.ok(s4.flags.onboarded && s4.club.pending.length >= 2, 'guided match ends on Today with rewards');
    step('guided match ends on Today');
    await ctx.close(); await c2.close();
  });

  await flow('ultimate', async () => {
    const { ctx, page } = await boot('ultimate', baseSave({ club: { apex: 60000 } }));
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="store"]', { timeout: 10000 });
    await click(page, '[data-utab="store"]');
    await page.waitForSelector('[data-buy-pack="gold"]', { timeout: 10000 });
    await click(page, '[data-buy-pack="gold"]');
    await page.waitForSelector('[data-stab="locker"]', { timeout: 10000 });
    await click(page, '[data-stab="locker"]');
    await page.waitForSelector('[data-open-pack="gold"]', { timeout: 10000 });
    await click(page, '[data-open-pack="gold"]');
    await page.waitForSelector('#packRip', { timeout: 10000 });
    await page.click('#packRip', { force: true });
    await page.waitForTimeout(2500);
    step('bought and opened a gold pack');
    // a full XI: deal the starter squad through the onboarding module
    await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); });
    await go(page, 'squad');
    await page.waitForSelector('[data-utab="division"]', { timeout: 10000 });
    await click(page, '[data-utab="division"]');
    await page.waitForSelector('#playDivision:not([disabled])', { timeout: 10000 });
    const before = await save(page);
    await click(page, '#playDivision');
    const score = await playToEnd(page);
    step(`division match played to the end (${score})`);
    await click(page, '[data-o="uxi"]');
    await page.waitForSelector('[data-utab="division"]', { timeout: 10000 });
    const after = await save(page);
    assert.equal(after.ultimate.played, (before.ultimate.played || 0) + 1, 'the ladder counted the match');
    step('ladder updated, back on Ultimate XI');
    await ctx.close();
  });

  await flow('career', async () => {
    const { ctx, page } = await boot('career', baseSave({ settings: { quality: 'min', reduceMotion: true, tutorialDone: true, models: 'simple', simSpeed: 'instant' } }));
    await go(page, 'career');
    await page.waitForSelector('#cmManager', { timeout: 10000 });
    await click(page, '#cmManager');
    await page.waitForSelector('#mgrCustom', { timeout: 10000 });
    await click(page, '#mgrCustom');
    await page.waitForSelector('#csDone', { timeout: 10000 });
    await page.fill('#csFirst', 'Qa'); await page.fill('#csLast', 'Bot');
    await click(page, '#csDone');
    await page.waitForSelector('[data-club]', { timeout: 10000 });
    await page.evaluate(() => document.querySelectorAll('[data-club]')[3].click());
    await page.waitForSelector('#simWeek, #playWeek', { timeout: 10000 });
    step('manager created, club chosen');
    let weeks = 0; let seasons = 0;
    for (let i = 0; i < 120 && seasons < 1; i++) {
      const did = await page.evaluate(() => {
        for (const id of ['acceptReview', 'nextSeason', 'renewDone', 'negClose', 'simWeek']) {
          const el = document.getElementById(id);
          if (el && !el.disabled) { el.click(); return id; }
        }
        const dismiss = document.querySelector('[data-o="dismiss"], [data-close], .btn.primary');
        if (dismiss) { dismiss.click(); return 'dismiss:' + (dismiss.id || dismiss.textContent.trim().slice(0, 20)); }
        return null;
      });
      if (did === 'simWeek') weeks += 1;
      if (did === 'acceptReview' || did === 'nextSeason') seasons += 1;
      if (!did) throw new Error('career hub has nothing to press');
      const err = await page.evaluate(() => { const e = window.__lastErr; window.__lastErr = null; return e; });
      if (err) throw new Error(`career crashed after "${did}" in week ${weeks}: ${err.split('\n').slice(0, 4).join(' | ')}`);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(300);
    const s = await save(page);
    assert.ok(seasons === 1 && weeks >= 17, `a full season simulated (${weeks} weeks, ${seasons} season boundaries)`);
    assert.ok(s.career.season >= 2, 'the career moved into a new season');
    step(`full season simulated in ${weeks} weeks; season ${s.career.season} begins`);
    await ctx.close();
  });

  // v81: the Player Career — create through the form, then live a season and a half
  await flow('pro', async () => {
    const { ctx, page } = await boot('pro', baseSave());
    await go(page, 'career', { modes: true });
    await page.waitForSelector('#cmPlayer', { timeout: 10000 });
    await click(page, '#cmPlayer');
    await page.waitForSelector('#proForm', { timeout: 10000 });
    await page.fill('#prName', 'Bot Player');
    await page.evaluate(() => document.querySelector('#proClubs [data-club]').click());
    await page.waitForSelector('#prStart:not([disabled])', { timeout: 5000 });
    await click(page, '#prStart');
    await page.waitForSelector('.cer-sign [data-ok]', { timeout: 5000 });
    await click(page, '.cer-sign [data-ok]');
    await page.waitForSelector('#proSim', { timeout: 10000 });
    let weeks = 0;
    for (let i = 0; i < 80; i++) {
      const did = await page.evaluate(() => {
        document.querySelectorAll('.ceremony [data-ok]').forEach((b) => b.click());
        const talk = document.getElementById('talkAsk'); if (talk) { talk.click(); return 'talk'; }
        const sim = document.getElementById('proSim'); if (sim) { sim.click(); return 'sim'; }
        const ov = document.querySelector('#proTabs [data-tab="overview"]'); if (ov) { ov.click(); return 'tab'; }
        return null;
      });
      if (did === 'sim') weeks += 1;
      if (!did) throw new Error('player career hub has nothing to press');
      const err = await page.evaluate(() => { const e = window.__lastErr; window.__lastErr = null; return e; });
      if (err) throw new Error(`player career crashed after "${did}" in week ${weeks}: ${err.split('\n').slice(0, 4).join(' | ')}`);
      await page.waitForTimeout(120);
    }
    const s = await save(page);
    assert.ok(s.pro && s.pro.world.season >= 2, `the player reached season 2 (season ${s.pro?.world.season})`);
    assert.ok(s.pro.totals.apps > 0, 'he gets on the pitch');
    step(`player career: ${weeks} weeks, season ${s.pro.world.season}, ${s.pro.totals.apps} apps`);
    await ctx.close();
  });

  await flow('weekend', async () => {
    const { ctx, page } = await boot('weekend', baseSave({ club: { apex: 5000 } }));
    await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); });
    await go(page, 'weekend');
    await page.waitForSelector('.wl-hero', { timeout: 10000 });
    const open = await page.$('#wlPlay:not([disabled])');
    if (!open) { step('weekend league closed today (window is Fri 18:00 → Mon 06:00 UTC); screen renders'); await ctx.close(); return; }
    await click(page, '#wlPlay');
    const score = await playToEnd(page);
    step(`weekend match played (${score})`);
    await click(page, '[data-o="quit"]');
    await page.waitForSelector('.wl-hero', { timeout: 10000 });
    const s = await save(page);
    assert.equal(s.club.weekend?.played, 1, 'the tally counted the match');
    step('tally updated');
    await ctx.close();
  });

  await flow('online', async () => {
    const mk = async (tag) => {
      const { ctx, page } = await boot(tag, baseSave({ club: { apex: 5000 } }));
      await page.evaluate(async () => { const ob = await import('/js/onboarding.js'); ob.dealStarter(); });
      const name = `${tag}${Date.now().toString(36).slice(-5)}`;
      await page.evaluate(async (n) => { const api = await import('/js/net/api.js'); await api.register(n, 'qa-pass-12345'); }, name);
      await go(page, 'squad');
      await page.waitForSelector('[data-utab="online"]', { timeout: 10000 });
      await click(page, '[data-utab="online"]');
      await page.waitForSelector('#olHost, #olQueue', { timeout: 10000 });
      await page.waitForFunction(() => /connected|online/i.test(document.getElementById('olConn')?.textContent || '') || !document.getElementById('olHost')?.disabled, null, { timeout: 15000 });
      return { ctx, page };
    };
    const A = await mk('hostA');
    const B = await mk('guestB');
    await click(A.page, '#olHost');
    await A.page.waitForFunction(() => /[A-Z0-9]{4}/.test(document.getElementById('olCodeOut')?.textContent || ''), null, { timeout: 15000 });
    const code = await A.page.evaluate(() => (document.getElementById('olCodeOut').textContent.match(/[A-Z0-9]{4}/) || [])[0]);
    step(`lobby ${code} open`);
    await B.page.fill('#olCode', code);
    await click(B.page, '#olJoin');
    await A.page.waitForSelector('#gmCanvas', { timeout: 30000 });
    await B.page.waitForSelector('#gmCanvas', { timeout: 30000 });
    await A.page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
    await B.page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
    // the host's sim starts once the guest has synced; give it up to half a minute
    await A.page.waitForFunction(() => (window.__apexMatch?.minute() || 0) > 0, null, { timeout: 30000 }).catch(() => {});
    const [ma, mb] = await Promise.all([A.page.evaluate(() => window.__apexMatch?.minute()), B.page.evaluate(() => window.__apexMatch?.minute())]);
    assert.ok(ma > 0, `host clock running (${ma})`);
    assert.ok(mb >= 0, `guest sees the match (${mb})`);
    step(`two clients in one match: host ${ma}', guest ${mb}'`);

    /* A third client watches. Spectating is the guest path with everything
     * outbound switched off: it must get the host's picture, never send
     * input, and never report a result. An emote from the host reaches it. */
    const C = await mk('watchC');
    // the match id is on the host's play params, not the DOM: the server's live list has it
    const live = await A.page.evaluate(async () => (await (await fetch('/api/live')).json()).rows);
    assert.ok(live.length >= 1, `a live match is listed (${JSON.stringify(live)})`);
    await C.page.evaluate(async (id) => {
      const net = await import('/js/net/socket.js');
      window.__qaSnaps = 0; net.on('snap', () => { window.__qaSnaps += 1; });
      net.send({ t: 'spectate', matchId: id });
    }, live[0].matchId);
    await C.page.waitForSelector('#gmCanvas', { timeout: 30000 });
    await C.page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
    await C.page.waitForFunction(() => /Spectating/.test(document.getElementById('gmNet')?.textContent || ''), null, { timeout: 30000 });
    // headless guests run behind the host by design (the clock is the host's), so count the picture arriving instead
    await C.page.waitForFunction(() => window.__qaSnaps > 20, null, { timeout: 30000 });
    const snaps = await C.page.evaluate(() => window.__qaSnaps);
    assert.equal(await C.page.evaluate(() => document.getElementById('gmEmoteBtn')?.hidden), true, 'spectators have no emote bar');
    step(`spectator joined: ${snaps} snapshots received, Spectating badge up`);
    await click(A.page, '#gmEmoteBtn');
    await click(A.page, '[data-emote="gg"]');
    await B.page.waitForFunction(() => /Good game/.test(document.body.textContent || ''), null, { timeout: 8000 });
    await C.page.waitForFunction(() => /Good game/.test(document.body.textContent || ''), null, { timeout: 8000 });
    step('an emote from the host reached the guest and the spectator');

    await A.page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
    await A.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    await B.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    step('both clients reached full time');
    await C.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    assert.ok(/spectating|Match ended/i.test(await C.page.evaluate(() => document.querySelector('.gm-ft')?.textContent || '')), 'spectator card says so');
    step('the spectator reached full time too');
    await A.ctx.close(); await B.ctx.close(); await C.ctx.close();
  });

  // v82: parties — a co-op season with two browsers, then a 2v2 with four
  await flow('party', async () => {
    const mk = async (tag) => {
      const { ctx, page } = await boot(tag, baseSave({ club: { apex: 5000 } }));
      const name = `${tag}${Date.now().toString(36).slice(-5)}`;
      await page.evaluate(async (n) => { const api = await import('/js/net/api.js'); await api.register(n, 'qa-pass-12345'); }, name);
      await go(page, 'online');
      await page.waitForSelector('#olParty', { timeout: 10000 });
      await page.waitForFunction(async () => (await import('/js/net/socket.js')).isReady(), null, { timeout: 15000 });
      return { ctx, page, name };
    };
    const A = await mk('ptA'); const B = await mk('ptB');
    await click(A.page, '[data-pmode="coop2"]');
    await A.page.waitForSelector('.pty-code', { timeout: 10000 });
    const code = await A.page.evaluate(() => document.querySelector('.pty-code').textContent.trim());
    await B.page.fill('#ptyCode', code);
    await click(B.page, '#ptyJoin');
    await A.page.waitForFunction(() => /2\/2/.test(document.querySelector('#olParty .ol-kicker')?.textContent || ''), null, { timeout: 10000 });
    step(`co-op party ${code}: two in`);
    await click(A.page, '#ptyStart');
    for (const X of [A, B]) {
      await X.page.waitForSelector('#gmCanvas', { timeout: 30000 });
      await X.page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 90000 });
    }
    await A.page.waitForFunction(() => (window.__apexMatch?.t || 0) > 2, null, { timeout: 60000 });
    const seats = await A.page.evaluate(() => window.__apexMatch.controllers.map((c) => c.team));
    assert.deepEqual(seats, [0, 0], 'two seats on one team');
    // the guest's stick reaches the host: hold right on B, watch B's seat move on A
    await B.page.evaluate(async () => { const i = window.__apexMatch; void i; });
    await B.page.keyboard.down('KeyD');
    await A.page.waitForFunction(() => { const m = window.__apexMatch; const p = m.playerOf(m.controllers[1]); window.__qaX = window.__qaX ?? p.x; return p.x - window.__qaX > 1.5; }, null, { timeout: 20000 });
    await B.page.keyboard.up('KeyD');
    step('the guest drives their own seat on the host');
    await A.page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
    await A.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    await B.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    const me = await A.page.evaluate(async () => { const api = await import('/js/net/api.js'); return (await (await fetch('/api/me', { headers: { Authorization: `Bearer ${api.authToken()}` } })).json()).profile.coop; });
    assert.equal(Object.values(me)[0]?.played, 1, 'the co-op season has the match');
    step('co-op match recorded to the season');
    // 2 v 2
    const C = await mk('ptC'); const D = await mk('ptD');
    for (const X of [A, B]) { await go(X.page, 'online'); await X.page.waitForSelector('#olParty', { timeout: 10000 }); }
    // the co-op lobby outlives its match; the host closing it sends everyone back to the list
    await click(A.page, '#ptyLeave');
    for (const X of [A, B]) await X.page.waitForSelector('[data-pmode="duo"]', { timeout: 10000 });
    await click(A.page, '[data-pmode="duo"]');
    await A.page.waitForSelector('.pty-code', { timeout: 10000 });
    const code2 = await A.page.evaluate(() => document.querySelector('.pty-code').textContent.trim());
    for (const X of [B, C, D]) { await X.page.fill('#ptyCode', code2); await click(X.page, '#ptyJoin'); await X.page.waitForSelector('.pty-code', { timeout: 10000 }); }
    await A.page.waitForFunction(() => /4\/4/.test(document.querySelector('#olParty .ol-kicker')?.textContent || ''), null, { timeout: 10000 });
    await click(A.page, '#ptyStart');
    for (const X of [A, B, C, D]) await X.page.waitForSelector('#gmCanvas', { timeout: 30000 });
    await A.page.waitForFunction(() => (window.__apexMatch?.t || 0) > 1, null, { timeout: 90000 });
    const s2 = await A.page.evaluate(() => window.__apexMatch.controllers.map((c) => c.team).sort().join(''));
    assert.equal(s2, '0011', 'two seats a side');
    for (const X of [B, C, D]) await X.page.waitForFunction(() => (window.__apexMatch?.t || 0) > 0.5, null, { timeout: 60000 });
    step('2v2: four clients, four seats, every guest sees the match');
    await A.page.evaluate(() => { const m = window.__apexMatch; m.half = 2; m.t = m.duration - 0.6; });
    for (const X of [A, B, C, D]) await X.page.waitForSelector('[data-o="quit"], [data-o="uxi"]', { timeout: 90000 });
    step('2v2: all four reached full time');
    for (const X of [A, B, C, D]) await X.ctx.close();
  });

  await flow('watch', async () => {
    const wctx = await browser.newContext({ viewport: { width: 396, height: 484 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const w = await wctx.newPage();
    watch(w, 'watch');
    await w.goto(`${server.url}/watch`);
    await w.waitForFunction(() => window.__apexWatchBooted === true, null, { timeout: 15000 });
    await w.click('#wSolo');
    await w.click('[data-tab="packs"]');
    await w.click('[data-open="bronze"]', { force: true });
    await w.waitForSelector('.w-packet', { timeout: 5000 });
    step('watch booted and opened a pack');
    await wctx.close();
  });
} finally {
  await browser.close();
  server.stop();
}
if (pageErrors.length) { failed = true; console.log('page errors:\n  ' + pageErrors.join('\n  ')); }
console.log(failed ? 'qa: FAILED' : 'qa: ok');
process.exit(failed ? 1 : 0);
