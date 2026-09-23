/**
 * The post-release play session: one full match per device, driven only
 * through that device's real input path — a phone's touch stick and buttons,
 * a desktop keyboard, and a (simulated) controller — by a simple player who
 * chases the ball, tackles, runs at goal and shoots. Not a balance tool: it is
 * there to notice what a person would notice. It reports, per device, whether
 * the controls answered (shots and touches by the person's side), frame rate,
 * how long the loading screen took, any page errors, and writes screenshots at
 * kick-off, mid-match and full time to tests/tmp/session/.
 *
 *   node tests/qa/play-session.mjs [--only touch,keyboard,pad] [--secs 120]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { startServer } from '../smoke/server.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = arg('--only', 'touch,keyboard,pad').split(',');
const SECS = Number(arg('--secs', 120));
const OUT = 'tests/tmp/session'; mkdirSync(OUT, { recursive: true });
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const results = [];

for (const device of ONLY) {
  const phone = device === 'touch';
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }
    : { viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|WebSocket|net::/.test(m.text())) errors.push(m.text()); });
  await page.addInitScript((pad) => {
    localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: 'v999' }, settings: { quality: 'low', reduceMotion: true, tutorialDone: true } }));
    if (pad) {
      const buttons = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
      const p = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 0, axes: [0, 0, 0, 0], buttons };
      navigator.getGamepads = () => [p, null, null, null];
      window.__simPad = p;
    }
  }, device === 'pad');
  await page.goto(`${server.url}/`);
  await page.waitForSelector('#startBtn'); await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
  const t0 = Date.now();
  await page.evaluate(async (secs) => { (await import('/js/app.js')).navigate('play', { homeId: 'c1', awayId: 'c2', duration: secs, skill: 1, mode: 'single', atmo: { time: 'day', weather: 'clear' } }); }, SECS);
  await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden, null, { timeout: 180000 });
  const loadMs = Date.now() - t0;
  await page.screenshot({ path: `${OUT}/${device}-kickoff.png` });

  // the device's hands
  const vp = page.viewportSize();
  let stickDown = false;
  // real touches, through the browser's own touch pipeline (CDP), several at once
  const cdp = phone ? await ctx.newCDPSession(page) : null;
  const touches = new Map();
  const sendTouch = async (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...touches.entries()].map(([id, p]) => ({ x: p.x, y: p.y, id })) });
  const touch = {
    async down(id, x, y) { touches.set(id, { x, y }); await sendTouch('touchStart'); },
    async move(id, x, y) { if (!touches.has(id)) return this.down(id, x, y); touches.set(id, { x, y }); await sendTouch('touchMove'); },
    async up(id) { if (!touches.has(id)) return; touches.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [...touches.entries()].map(([i, p]) => ({ x: p.x, y: p.y, id: i })) }); },
  };
  const centre = async (sel) => page.$eval(sel, (b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }).catch(() => null);
  const hand = {
    async move(sx, sy, sprint) {
      if (device === 'keyboard') {
        for (const [k, on] of [['KeyD', sx > 0.35], ['KeyA', sx < -0.35], ['KeyS', sy > 0.35], ['KeyW', sy < -0.35], ['ShiftLeft', sprint]]) await (on ? page.keyboard.down(k) : page.keyboard.up(k));
      } else if (device === 'pad') {
        await page.evaluate(([x, y, s]) => { const p = window.__simPad; p.axes[0] = x; p.axes[1] = y; p.buttons[7] = { pressed: s, value: s ? 1 : 0 }; p.timestamp++; }, [sx, sy, sprint]);
      } else {
        const cx = vp.width * 0.18; const cy = vp.height * 0.7;
        if (!stickDown) { await touch.down(1, cx, cy); stickDown = true; }
        await touch.move(1, cx + sx * 56, cy + sy * 56);
        const sp = await centre('[data-slot="sprint"]');
        if (sp && sprint && !touches.has(2)) await touch.down(2, sp.x, sp.y);
        else if (!sprint && touches.has(2)) await touch.up(2);
      }
    },
    async tap(action, holdMs = 90) {
      if (device === 'keyboard') { const k = { pass: 'Space', shoot: 'KeyK' }[action]; await page.keyboard.down(k); await page.waitForTimeout(holdMs); await page.keyboard.up(k); }
      else if (device === 'pad') { const b = { pass: 0, shoot: 1 }[action]; await page.evaluate((b) => { window.__simPad.buttons[b] = { pressed: true, value: 1 }; }, b); await page.waitForTimeout(holdMs); await page.evaluate((b) => { window.__simPad.buttons[b] = { pressed: false, value: 0 }; }, b); }
      else { const c = await centre(`[data-slot="${action}"]`); if (!c) return; await touch.down(3, c.x, c.y); await page.waitForTimeout(holdMs); await touch.up(3); }
    },
  };

  const startT = Date.now(); let mid = false; let lastShot = 0; let lastTackle = 0;
  const stats = { shotsTried: 0, tacklesTried: 0 };
  while (Date.now() - startT < (SECS + 90) * 1000) {
    const s = await page.evaluate(() => {
      const m = window.__apexMatch; if (!m) return null;
      const c = m.controllers[0]; const team = m.teams[c.team]; const p = team.players[c.activeIdx];
      const b = m.ball; const B = m.basis;
      const ended = !!document.querySelector('.gm-ft:not([hidden]), .ft-card, #ftCard:not([hidden])') || m.phase === 'end';
      return { ended, phase: m.phase, minute: m.minute(), px: p.x, py: p.y, bx: b.x, by: b.y, own: b.owner === p, oppHas: !!(b.owner && b.owner.team !== c.team), goalX: team.dir > 0 ? m.teams[0].constructor ? 105 : 105 : 0, dir: team.dir, B: B ? { rx: B.rx, ry: B.ry, fx: B.fx, fy: B.fy } : null, W: 105, H: 68 };
    }).catch(() => null);
    if (!s) { await page.waitForTimeout(300); continue; }
    if (s.ended) break;
    if (!mid && Date.now() - startT > SECS * 500) { mid = true; await page.screenshot({ path: `${OUT}/${device}-mid.png` }); }
    const goalX = s.dir > 0 ? s.W : 0;
    const tx = s.own ? goalX : s.bx; const ty = s.own ? s.H / 2 : s.by;
    let wx = tx - s.px; let wy = ty - s.py; const d = Math.hypot(wx, wy) || 1; wx /= d; wy /= d;
    // world direction → screen stick, through the camera basis (sim.js handleSeat, inverted)
    let sx = wx; let sy = -wy;
    if (s.B) { const { rx, ry, fx, fy } = s.B; const det = rx * fy - fx * ry || 1; sx = (wx * fy - fx * wy) / det; const fwd = (rx * wy - ry * wx) / det; sy = -fwd; }
    const n = Math.hypot(sx, sy) || 1;
    await hand.move(sx / n, sy / n, s.phase === 'play' && d > 6);
    const now = Date.now();
    if (s.own && Math.abs(goalX - s.px) < 24 && now - lastShot > 1500) { lastShot = now; stats.shotsTried++; await hand.tap('shoot', 260); }
    else if (s.oppHas && Math.hypot(s.bx - s.px, s.by - s.py) < 2.6 && now - lastTackle > 900) { lastTackle = now; stats.tacklesTried++; await hand.tap('pass'); }
    else if (s.phase !== 'play' && now % 3 === 0) await hand.tap('pass');       // take the set piece
    await page.waitForTimeout(60);
  }
  await page.screenshot({ path: `${OUT}/${device}-end.png` });
  const out = await page.evaluate(() => {
    const m = window.__apexMatch; const c = m.controllers[0];
    const mine = m.teams[c.team]; const theirs = m.teams[1 - c.team];
    const ps = Object.values(m.pst || {}).filter((r) => r.team === c.team);
    return { score: `${mine.score}-${theirs.score}`, shots: mine.shots, theirShots: theirs.shots, passes: ps.reduce((a, r) => a + (r.passes || 0), 0), tackles: ps.reduce((a, r) => a + (r.tackles || 0), 0), minute: m.minute(), phase: m.phase };
  });
  const fps = await page.evaluate(() => window.__apexFps?.() ?? null).catch(() => null);
  results.push({ device, loadMs, ...out, ...stats, fps, errors: errors.length, firstError: errors[0] || '' });
  console.log(`  · ${device}: ${JSON.stringify(results.at(-1))}`);
  await ctx.close();
}
await browser.close(); server.stop();
const bad = results.filter((r) => r.errors || (r.shots === 0 && r.shotsTried > 0));
console.log(bad.length ? `session: ${bad.length} device(s) need a look` : 'session: played on every device');
