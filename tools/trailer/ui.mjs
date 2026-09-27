/**
 * Stills of the game's screens for the trailer's run-through (tools/trailer).
 *
 *   node tools/trailer/ui.mjs <out dir>
 *
 * A fresh save at 1920x1080, every footballer renamed from the game's own
 * pools of made-up names first — the trailer is public, and public images
 * carry no real player's name — then the title, the menu, Ultimate XI (the
 * squad, a pack being opened, the Division), Career, the Custom Cup, Street
 * and the kit designer. assemble.py moves over each still.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';

const OUT = process.argv[2] || 'tests/tmp/trailer/ui';
mkdirSync(OUT, { recursive: true });
const server = await startServer();
const v = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => t.match(/APP_VERSION = '(v\d+)'/)[1]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.log('page error', e.message));
await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({
  meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v },
  settings: { quality: 'high', qualityPicked: true, tutorialDone: true, reduceMotion: false, menuTheme: 'off' },
})), v);
const shot = async (name, wait = 900) => { await page.waitForTimeout(wait); await page.waitForFunction(() => !document.querySelector('#screenCurtain.on')).catch(() => {}); await page.screenshot({ path: join(OUT, `${name}.jpg`), type: 'jpeg', quality: 94 }); console.log('✔', name); };

await page.goto(`${server.url}/`);
await page.waitForSelector('#startBtn');
// made-up names for everyone, before anything draws a card
await page.evaluate(async () => {
  const { WORLD } = await import('/js/data/generator.js');
  const { FIRST_NAMES, LAST_NAMES } = await import('/js/data/pools.js');
  WORLD.players.forEach((p, i) => {
    const f = FIRST_NAMES[(i * 7 + 3) % FIRST_NAMES.length]; const l = LAST_NAMES[(i * 13 + 5) % LAST_NAMES.length];
    p.name = `${f} ${l}`; p.short = `${f[0]}. ${l}`;
  });
});
await shot('01-title', 4000);
await page.click('#startBtn'); await page.waitForSelector('[data-go="squad"]');
await page.getByText('Continue', { exact: true }).click({ timeout: 1500 }).catch(() => {});
await shot('02-menu', 5000);
await page.click('[data-go="squad"]'); await page.waitForSelector('#uTabs');
// a full side on the pitch, not a fresh save's empty shape: a collection to pick from, then Auto fill
await page.evaluate(async () => {
  const { WORLD } = await import('/js/data/generator.js'); const st = await import('/js/state.js');
  const best = WORLD.players.filter((p) => !p.saudiIcon).slice().sort((a, b) => b.overall - a.overall).slice(0, 80).map((p) => p.id);
  st.update((s) => { s.club.collection = [...new Set([...(s.club.collection || []), ...best])]; });
  (await import('/js/app.js')).navigate('squad');
});
await page.waitForSelector('#autoFill'); await page.click('#autoFill').catch(() => {});
await shot('03-squad', 2500);
await page.click('[data-utab="division"]'); await shot('04-division', 1800);
await page.click('[data-utab="store"]'); await page.waitForTimeout(1200);
await shot('05-store', 800);
await page.click('[data-stab="locker"]'); await page.waitForTimeout(1200);
await page.click('[data-open-pack="gold"]').catch(async () => page.click('[data-open-pack]'));
await page.waitForSelector('#packRip', { timeout: 8000 });
await shot('06-pack', 600);
await page.click('#packRip');
for (let i = 0; i < 14; i++) { await page.waitForTimeout(420); await page.screenshot({ path: join(OUT, `07-reveal-${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 94 }); }
console.log('✔ reveal');
await page.evaluate(async () => (await import('/js/app.js')).navigate('squad'));
await page.waitForSelector('#uTabs'); await page.click('[data-utab="club"]'); await page.waitForTimeout(1200);
await page.click('[data-ctab="kit"]').catch(() => {}); await shot('08-kit', 1800);
await page.evaluate(async () => (await import('/js/app.js')).navigate('career'));
await shot('09-career', 3000);
await page.evaluate(async () => (await import('/js/app.js')).navigate('cup'));
// national sides, not the real clubs a league country would list
await page.waitForSelector('#cupCountry');
await page.evaluate(() => { const s = document.querySelector('#cupCountry'); s.value = s.options[s.options.length - 1].value; s.dispatchEvent(new Event('change', { bubbles: true })); });
await page.waitForTimeout(800);
// eight national sides, picked by name (each pick redraws the list, so one at a time)
for (const n of ['Brazil', 'England', 'Spain', 'France', 'Argentina', 'Germany', 'Portugal', 'Saudi Arabia']) {
  await page.locator(`.cup-chip[title="${n}"]`).first().click({ timeout: 2000 }).catch(() => console.log('no chip for', n));
  await page.waitForTimeout(150);
}
await shot('10-cup', 2000);
await page.evaluate(async () => (await import('/js/app.js')).navigate('street'));
await shot('11-street', 3000);
await page.evaluate(async () => (await import('/js/app.js')).navigate('online'));
await shot('12-online', 3000);
await browser.close(); server.stop();
