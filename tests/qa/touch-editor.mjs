/**
 * v106 (backlog #20): the touch button editor, driven by a finger. On a
 * landscape phone: open it from Settings, drag SHOOT to the left, make the
 * buttons bigger, Done — then a match puts SHOOT where it was left, at the
 * new size, clear of its neighbours; and Reset brings the arc back.
 * v107: in that match, flicks — SHOOT up chips, sideways bends; PASS flicked
 * is a through ball, tapped a pass.
 *
 *   node tests/qa/touch-editor.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';
import { watchConsole } from '../lib/console.mjs';

const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? '✓' : '✗'} ${what}`); if (!ok) failed += 1; };
const W = 844; const H = 390;
const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errs = watchConsole(page, { origin: server.url });
await page.addInitScript(() => {
  if (sessionStorage.getItem('seeded')) return;
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999', hintMatches: 9 }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
  sessionStorage.setItem('seeded', '1');
});
const box = (sel) => page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width }; }, sel);
const cdp = await ctx.newCDPSession(page);
const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });

try {
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.tap('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  await page.evaluate(async () => (await import('/js/app.js')).navigate('settings'));
  await page.waitForSelector('#touchLayoutBtn');
  await page.tap('#touchLayoutBtn');
  await page.waitForSelector('.tedit .tbtn[data-slot="shoot"]');
  const s0 = await box('.tedit [data-slot="shoot"]');
  // a finger drags SHOOT 120 px to the left, in steps
  await touch('touchStart', s0.x, s0.y);
  for (let i = 1; i <= 12; i++) await touch('touchMove', s0.x - 10 * i, s0.y);
  await touch('touchEnd');
  const s1 = await box('.tedit [data-slot="shoot"]');
  check(await page.evaluate(() => !document.querySelector('.tedit .is-down')), 'letting go lets go');
  check(Math.abs(s1.x - (s0.x - 120)) < 3 && Math.abs(s1.y - s0.y) < 3, `SHOOT follows the finger (moved ${(s0.x - s1.x).toFixed(0)} px left)`);
  // bigger
  await page.evaluate(() => { const r = document.getElementById('teSize'); r.value = 120; r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); });
  const s2 = await box('.tedit [data-slot="shoot"]');
  check(Math.abs(s2.w / s0.w - 1.2) < 0.03, `the size slider scales the buttons (${(s2.w / s0.w * 100).toFixed(0)}%)`);
  const edited = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.tedit .tbtn')].map((b) => { const r = b.getBoundingClientRect(); return [b.dataset.slot, { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }]; })));
  await page.tap('#teDone');
  const saved = await page.evaluate(async () => (await import('/js/state.js')).getState().settings.touchLayout);
  check(saved && saved.scale === 1.2 && saved.offsets?.shoot, 'Done saves the layout');

  // the match uses it
  await page.evaluate(async () => (await import('/js/app.js')).navigate('play', { homeId: 'c1', awayId: 'c2', duration: 1200, skill: 1, mode: 'single' }));
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 180000 });
  const inMatch = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#tpad .tbtn')].map((b) => { const r = b.getBoundingClientRect(); return [b.dataset.slot, { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, r: r.width / 2 }]; })));
  const off = Math.max(...Object.keys(edited).map((k) => Math.hypot(edited[k].x - inMatch[k].x, edited[k].y - inMatch[k].y)));
  check(off <= 2, `every button is where it was left in the editor (worst ${off.toFixed(1)} px)`);
  const c = Object.values(inMatch); let gap = 1e9;
  for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) gap = Math.min(gap, Math.hypot(c[i].x - c[j].x, c[i].y - c[j].y) - c[i].r - c[j].r);
  check(gap >= 9, `the buttons keep apart (closest ${gap.toFixed(1)} px)`);
  // SHOOT still shoots from its new spot
  await page.evaluate(() => { const b = document.querySelector('#tpad [data-slot="shoot"]'); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 5, pointerType: 'touch' })); });
  await page.waitForTimeout(120);
  const down = await page.evaluate(() => document.querySelector('#tpad [data-slot="shoot"]').classList.contains('is-down'));
  await page.evaluate(() => { const b = document.querySelector('#tpad [data-slot="shoot"]'); b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 5, pointerType: 'touch' })); });
  check(down, 'SHOOT answers a press where it now is');

  // v107: flicks — a finger flicked up off SHOOT chips; flicked off PASS plays a through ball
  const flickTest = async (slot, dx, dy) => {
    await page.evaluate(() => {
      const m = window.__apexMatch; const c = m.controllers[0]; const me = m.playerOf(c);
      const dir = m.teams[me.team].dir; const gx = dir > 0 ? 105 : 0;
      // open play: the plain press above can slide in and give a free kick away
      m.setPiece = null; m.phase = 'play'; m.banner = '';
      me.x = gx - dir * 20; me.y = 34; me.vx = me.vy = 0;
      // nobody close enough to win it back while a software GPU draws the hold (~2 fps)
      for (const q of m.teams[1 - me.team].players) if (q.role !== 'GK' && Math.hypot(q.x - me.x, q.y - me.y) < 15) { q.x = me.x - dir * 18; q.vx = q.vy = 0; } m.ball.owner = me; m.ball.x = me.x; m.ball.y = me.y; m.ball.z = 0;
      window.__kicks = [];
      if (!m.__spied) {
        m.__spied = true;
        const sh = m.shoot.bind(m); m.shoot = (p, a, pw, o = {}) => { if (p === m.playerOf(m.controllers[0])) window.__kicks.push(o.chip ? 'chip' : o.curl ? 'finesse' : 'shot'); return sh(p, a, pw, o); };
        const pa = m.pass.bind(m); m.pass = (p, a, th, pw, lob, ...r) => { if (p === m.playerOf(m.controllers[0])) window.__kicks.push(lob ? 'lofted' : th ? 'through' : 'pass'); return pa(p, a, th, pw, lob, ...r); };
      }
    });
    // a few sim frames, so the pad reads "in possession" (a software GPU draws slowly)
    // drawn frames, not the match clock (which stands still through a stoppage)
    const frames = (n) => page.evaluate((k) => new Promise((res) => { let i = 0; const f = () => (++i >= k ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
    await frames(4);
    const b = await box(`#tpad [data-slot="${slot}"]`);
    await touch('touchStart', b.x, b.y);
    for (let i = 1; i <= 6; i++) { await touch('touchMove', b.x + (dx * i) / 6, b.y + (dy * i) / 6); await page.waitForTimeout(16); }
    await frames(3);
    const badge = await page.evaluate((s) => document.querySelector(`#tpad [data-slot="${s}"]`).dataset.flick || '', slot);
    await touch('touchEnd');
    await page.waitForFunction(() => window.__kicks.length, null, { timeout: 30000 }).catch(() => {});
    /* the kick is all this checks: take the ball back before it can go in —
       a goal (the chip scored on CI) stops the clock for the celebration and
       the replay, minutes at a software GPU's frame rate */
    await page.evaluate(() => { const m = window.__apexMatch; const me = m.playerOf(m.controllers[0]); m.ball.owner = me; m.ball.x = me.x; m.ball.y = me.y; m.ball.z = 0; m.ball.vx = m.ball.vy = m.ball.vz = 0; });
    return { badge, kicks: await page.evaluate(() => window.__kicks) };
  };
  const chip = await flickTest('shoot', 0, -60);
  check(chip.badge === 'CHIP' && chip.kicks[0] === 'chip' && !chip.kicks.includes('lofted'), `SHOOT flicked up is a chip (badge ${chip.badge || '–'}, kicks ${chip.kicks.join(', ') || 'none'})`);
  const fin = await flickTest('shoot', -60, 0);
  check(fin.kicks[0] === 'finesse', `SHOOT flicked sideways bends it (kicks ${fin.kicks.join(', ') || 'none'})`);
  const thr = await flickTest('pass', -60, 10);
  check(thr.kicks[0] === 'through', `PASS flicked is a through ball (kicks ${thr.kicks.join(', ') || 'none'})`);
  const tap = await flickTest('pass', 0, 0);
  check(tap.kicks[0] === 'pass', `PASS tapped is still a pass (kicks ${tap.kicks.join(', ') || 'none'})`);

  // Reset → the arc again
  await page.evaluate(async () => (await import('/js/app.js')).navigate('settings'));
  await page.waitForSelector('#touchLayoutBtn'); await page.tap('#touchLayoutBtn');
  await page.waitForSelector('#teReset'); await page.tap('#teReset'); await page.tap('#teDone');
  check(await page.evaluate(async () => !(await import('/js/state.js')).getState().settings.touchLayout), 'Reset and Done bring back the arc');
  check(!errs.length, `no console errors${errs.length ? `: ${errs.slice(0, 3).join(' | ')}` : ''}`);
} catch (e) { console.error(e); failed += 1; }
await browser.close(); server.stop();
console.log(failed ? `\n${failed} check(s) failed` : '\ntouch editor: all checks passed');
process.exitCode = failed ? 1 : 0;
