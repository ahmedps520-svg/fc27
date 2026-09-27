/**
 * The watch app on a watch-sized page (tools/tiktok): 198x242 CSS px, the
 * face of a 45 mm watch, at 3x. Not a real watch: the web build at that size.
 *   node tools/tiktok/watch.mjs <out dir> [seed]
 * Club screen, Kick Off → Quickfire Fives (both sides on the AI, so it plays
 * itself), then a pack. Frame-exact (stepper.mjs); frames.json logs the score.
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';
import { stepper } from './stepper.mjs';

const OUT = process.argv[2] || 'tests/tmp/tiktok/watch'; const SEED = +(process.argv[3] || 7);
// frame ranges to keep, 'a-b,c-d' in step numbers (a dry run with '0-0' logs where the goals are)
const KEEP = (process.argv[4] || '').split(',').filter(Boolean).map((r) => r.split('-').map(Number));
const server = await startServer();
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 198, height: 242 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('page error', e.message));
await page.addInitScript((seed) => { let a = seed; Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, SEED);
// the clip is public: every footballer gets a made-up name from the game's own pools (as ui.mjs / pack.mjs do)
const RENAME = ';WORLD.players.forEach((p, i) => { const f = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length]; const l = LAST_NAMES[(i * 13 + 5) % LAST_NAMES.length]; p.name = `${f} ${l}`; p.short = `${f[0]}. ${l}`; });';
const bundle = readFileSync('js/watch/bundle.js', 'utf8').replace('var WORLD = buildWorld(), variantResolver = null;', `var WORLD = buildWorld(), variantResolver = null;${RENAME}`).replace('match = new Match(HOME_ID, awayId, { duration: DURATION, mode: "single", human: 0,', 'match = window.__wMatch = new Match(HOME_ID, awayId, { duration: DURATION, mode: "single", human: null,');
await page.route('**/js/watch/bundle.js', (r) => r.fulfill({ body: bundle, contentType: 'text/javascript' }));
await page.goto(`${server.url}/watch.html`);
await page.waitForSelector('#wSolo'); await page.click('#wSolo');
await page.waitForSelector('[data-tab="play"]');
const cam = await stepper(page, join(OUT, 'frames'));
if (process.argv[4]) cam.keep((i) => KEEP.some(([a, b]) => i >= a && i <= b));
const log = [];
const note = async (tag) => log.push({ n: cam.i, tag, s: await page.evaluate(() => window.__wMatch ? [window.__wMatch.teams[0].score, window.__wMatch.teams[1].score, window.__wMatch.phase] : null) });
await cam.hold(1500); await note('club');
await page.click('[data-tab="play"]', { noWaitAfter: true }); await cam.hold(1200); await note('kickoff');
await page.click('[data-fives]', { noWaitAfter: true });
for (let i = 0; i < 30 * 90; i++) { await cam.frame(); if (i % 5 === 0) await note('match'); if (await page.$('#wBack')) break; }
await cam.hold(1500); await note('ft');
writeFileSync(join(OUT, 'frames.json'), JSON.stringify(log));
await page.click('#wBack', { noWaitAfter: true }).catch(() => {}); await cam.hold(500);
await page.click('[data-tab="packs"]', { noWaitAfter: true, timeout: 5000 }); await cam.hold(1200); await note('packs');
await page.click('[data-open]', { noWaitAfter: true }).catch((e) => console.log('no pack', e.message)); await cam.hold(1000);
await page.click('#wPacket', { noWaitAfter: true }).catch(() => {}); await cam.hold(3500); await note('reveal');
await cam.finish();
writeFileSync(join(OUT, 'frames.json'), JSON.stringify(log));
console.log('✔ watch', cam.i, 'steps,', cam.n, 'kept; goals at', log.filter((l, i) => i && l.s && log[i - 1].s && l.s.slice(0, 2).join() !== log[i - 1].s.slice(0, 2).join()).map((l) => l.n + ':' + l.s.join('-')).join(' '));
await browser.close(); server.stop();
