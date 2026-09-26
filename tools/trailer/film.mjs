/**
 * Film a recorded scene on the real game (tools/trailer).
 *
 *   node tools/trailer/film.mjs <scene.json> <out dir> [--cam broadcast|follow|low|goal|orbit]
 *        [--quality high] [--from 0] [--to N] [--time day|dusk|night] [--weather clear|rain|snow]
 *        [--w 1280] [--h 720]
 *
 * The browser's clock and frame loop are taken over (requestAnimationFrame
 * and performance.now), so each frame is rendered exactly 1/30 s after the
 * last however long the software renderer takes over it — smooth footage on
 * a machine that draws half a frame a second. The match's own sim is stopped
 * and each frame's recorded state (scenes.mjs) is written onto it before the
 * frame renders; the renderer, the crowd, the net and the referee react to it
 * exactly as they do in play. The HUD is hidden: the trailer adds its own type.
 */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';

/* Two ways in: one scene (<scene.json> <out dir> [--cam …] [--from] [--to]),
 * or a shot list (--shots shots.json --out dir): [{ name, scene, cam, from, to,
 * time, weather }]. Shots on the same clubs, time and weather share one match
 * load (three minutes on the software renderer), each into <out>/<name>/. */
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const Q = arg('--quality', 'high');
const W = +arg('--w', 1280); const H = +arg('--h', 720);
let SHOTS;
if (arg('--shots')) {
  const dir = arg('--out');
  SHOTS = JSON.parse(readFileSync(arg('--shots'), 'utf8')).map((s) => ({ ...s, out: join(dir, s.name) }))
    .filter((s) => !arg('--only') || arg('--only').split(',').includes(s.name));
} else {
  const [SCENE, OUT] = process.argv.slice(2);
  SHOTS = [{ scene: SCENE, out: OUT, cam: arg('--cam', 'broadcast'), from: +arg('--from', 0), to: +arg('--to', 1e9), time: arg('--time', 'night'), weather: arg('--weather', 'clear') }];
}
for (const s of SHOTS) s.data = JSON.parse(readFileSync(s.scene, 'utf8'));
const groups = new Map();
for (const s of SHOTS) { const k = [s.data.home, s.data.away, s.time || 'night', s.weather || 'clear'].join('|'); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); }

const server = await startServer();
for (const G of groups.values()) {
const v = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => t.match(/APP_VERSION = '(v\d+)'/)[1]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('pageerror', (e) => console.log('page error', e.message));
await page.addInitScript(({ v, Q }) => {
  localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v }, settings: { quality: Q, qualityPicked: true, tutorialDone: true, pregame: 'off', broadcast: false, sound: false } }));
  // the manual clock: off until the scene starts
  const realRAF = window.requestAnimationFrame.bind(window);
  const realNow = performance.now.bind(performance);
  let cbs = []; let fake = null;
  window.__manual = false;
  window.requestAnimationFrame = (cb) => { if (!window.__manual) return realRAF(cb); cbs.push(cb); return cbs.length; };
  performance.now = () => (window.__manual && fake != null ? fake : realNow());
  window.__tick = (ms) => { if (fake == null) fake = realNow(); fake += ms; const run = cbs; cbs = []; for (const cb of run) cb(fake); };
}, { v, Q });
await page.goto(`${server.url}/`);
await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.evaluate(async ({ home, away, time, weather }) => {
  (await import('/js/app.js')).navigate('play', { homeId: home, awayId: away, duration: 600, skill: 1, mode: 'single', atmo: { time, weather } });
}, { home: G[0].data.home, away: G[0].data.away, time: G[0].time || 'night', weather: G[0].weather || 'clear' });
await page.waitForFunction(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', null, { timeout: 1200000 });
await page.addStyleTag({ content: '.gm-hud,.gm-left,#gmFeed,#gmHints,.gm-touch,.bc-layer,.gm-alerts,#gmBooking,#gmAdv,.goal-card,.bc-sub,.gm-sub,.gm-caption,#gmCaption{visibility:hidden!important}' });

// hand the match to the tape, and the camera to the shot
await page.evaluate(({ CAM }) => {
  const m = window.__apexMatch;
  m.update = () => {};
  for (const c of m.controllers) c.ai = true;
  const rig = window.__apexCam; const own = rig.update.bind(rig);
  const S = window.__shotCam = { x: null };
  const ease = (a, b, k) => a + (b - a) * k;
  rig.update = (mm, dt, cam) => {
    const CAM = window.__shotCamMode || 'broadcast';
    if (CAM === 'broadcast') return own(mm, dt, cam);
    const b = mm.ball; const f = window.__shotFrame || 0; const dir = mm.teams[mm.goalTeam >= 0 ? mm.goalTeam : 0].dir;
    const gx = dir > 0 ? 105 : 0;
    let want;
    if (CAM === 'follow') want = { x: b.x - 9, y: b.y - 16, z: 4.2, tx: b.x + 2, ty: b.y + 1, tz: 1.0, hfov: 44 };
    else if (CAM === 'low') want = { x: b.x - 4, y: b.y - 10, z: 1.3, tx: b.x + 1, ty: b.y + 2, tz: 1.1, hfov: 50 };
    // pitch level just off the far post, looking back out at the play
    else if (CAM === 'goal') want = { x: gx - dir * 2.5, y: 34 + 11, z: 1.25, tx: b.x - dir * 4, ty: b.y, tz: 1.0, hfov: 54 };
    // the opening: a crane rising over the halfway line
    else if (CAM === 'crane') { const u = Math.min(1, f / 110); want = { x: 52.5 - 30, y: -18 + u * 6, z: 3 + u * 16, tx: b.x, ty: 34, tz: 0, hfov: 58 }; }
    // tight on whoever has it
    else if (CAM === 'tight') { const c = mm.ball.owner || b; want = { x: c.x - 5, y: c.y - 7.5, z: 1.7, tx: c.x + 1, ty: c.y, tz: 1.05, hfov: 40 }; }
    // round the scorer (the celebrant), drifting after him as he runs
    else if (CAM === 'orbit') { const c = mm.celebrant || b; S.cx = S.cx == null ? c.x : ease(S.cx, c.x, 0.08); S.cy = S.cy == null ? c.y : ease(S.cy, c.y, 0.08); const a = -1.9 + f * 0.018; want = { x: S.cx + Math.cos(a) * 7, y: S.cy + Math.sin(a) * 7, z: 1.9, tx: S.cx, ty: S.cy, tz: 1.15, hfov: 44 }; }
    else want = { x: b.x, y: b.y - 30, z: 12, tx: b.x, ty: b.y, tz: 0, hfov: 50 };
    if (S.x == null) Object.assign(S, want);
    const k = 0.14;
    for (const key of ['x', 'y', 'z', 'tx', 'ty', 'tz', 'hfov']) S[key] = ease(S[key], want[key], key.startsWith('t') ? 0.22 : k);
    cam.x = S.x; cam.y = S.y; cam.z = S.z; cam.tx = S.tx; cam.ty = S.ty; cam.tz = S.tz; cam.hfov = S.hfov;
  };
  const PF = ['x', 'y', 'vx', 'vy', 'dirX', 'dirY', 'diveT', 'downT', 'downMax', 'slide', 'spinT', 'skillT', 'stamina', 'stumble', 'holdT'];
  window.__apply = (F) => {
    const all = [...m.teams[0].players, ...m.teams[1].players];
    m.t = F.t; m.phase = F.ph; m.phaseT = F.pt; m.banner = F.bn;
    m.teams[0].score = F.s[0]; m.teams[1].score = F.s[1];
    const b = m.ball; [b.x, b.y, b.z, b.vx, b.vy, b.vz] = F.b; b.owner = F.o >= 0 ? all[F.o] : null;
    F.p.forEach((row, i) => { const p = all[i]; if (!p) return; PF.forEach((k, j) => { p[k] = row[j]; }); p.celebrating = !!row[PF.length]; p.celebKind = row[PF.length + 1] || null; p.skillKind = row[PF.length + 2] || null; if (row[PF.length + 3]) { p.sentOff = true; } });
    m.goalTeam = F.gt; m.celebT = F.ct; m.celebrant = F.cb >= 0 ? all[F.cb] : null;
    if (F.nh) m.netHit = F.nh;
    while (F.bk && m.bookings.length < F.bkn) m.bookings.push(F.bk);
    m.actives = []; m.active = null;        // nobody is being steered: no player marker
  };
  window.__manual = true;
}, { CAM: 'broadcast' });

for (const shot of G) {
  const scene = shot.data; const OUT = shot.out; mkdirSync(OUT, { recursive: true });
  const FROM = Math.max(0, shot.from || 0); const TO = Math.min(shot.to ?? scene.frames.length, scene.frames.length);
  // a fresh camera for every shot
  await page.evaluate(({ cam }) => { window.__shotCamMode = cam; for (const k of Object.keys(window.__shotCam)) delete window.__shotCam[k]; window.__shotCam.x = null; }, { cam: shot.cam || 'broadcast' });
// a few frames to settle the composer and the camera before the first one kept
  for (let w = 0; w < 4; w++) await page.evaluate(({ F }) => { window.__apply(F); window.__tick(1000 / 30); }, { F: scene.frames[FROM] });
  // the first grab after the switch comes back black: take it and throw it away
  await page.evaluate(() => document.querySelector('#gmCanvas').toDataURL('image/jpeg', 0.5));
  const t0 = Date.now();
  for (let i = FROM; i < TO; i++) {
    const url = await page.evaluate(({ F, i }) => {
      window.__shotFrame = i;
      window.__apply(F);
      window.__tick(1000 / 30);
      return document.querySelector('#gmCanvas').toDataURL('image/jpeg', 0.93);
    }, { F: scene.frames[i], i });
    writeFileSync(join(OUT, `f${String(i - FROM).padStart(4, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
    if ((i - FROM) % 30 === 0) console.log(`frame ${i - FROM}/${TO - FROM} · ${((Date.now() - t0) / 1000 / Math.max(1, i - FROM + 1)).toFixed(1)} s a frame`);
  }
  console.log(`✔ ${shot.name || OUT}: ${TO - FROM} frames`);
}
await browser.close();
}
server.stop();
