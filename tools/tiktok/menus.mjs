/**
 * The main menu of a build, phone-sized (tools/tiktok): node tools/tiktok/menus.mjs <build dir> <out.jpg>
 */
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { startServer } from '../../tests/smoke/server.mjs';

const [DIR, OUT] = process.argv.slice(2);
const server = await startServer(undefined, { cwd: resolve(DIR) });
const v = await fetch(`${server.url}/js/app.js`).then((r) => r.text()).then((t) => t.match(/APP_VERSION = '(v\d+)'/)[1]);
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.addInitScript((v) => localStorage.setItem('apexxi.save.v1', JSON.stringify({ meta: { reset: 'econ-2curr-1' }, flags: { notesSeen: v }, settings: { quality: 'high', qualityPicked: true, tutorialDone: true, menuTheme: 'off', sound: false } })), v);
await page.goto(`${server.url}/`);
// the early builds walled portrait phones off with a rotate hint: that is what a phone saw, so that is the shot
if (await page.$('#rotateHint:visible')) { await page.waitForTimeout(3000); await page.screenshot({ path: OUT, type: 'jpeg', quality: 92, timeout: 180000 }); console.log('✔ rotate wall', v, OUT); await browser.close(); server.stop(); process.exit(0); }
await page.click('#startBtn');
await page.waitForTimeout(3000);
await page.getByText('Continue', { exact: true }).click({ timeout: 1500 }).catch(() => {});
await page.waitForTimeout(6000);
await page.screenshot({ path: OUT, type: 'jpeg', quality: 92, timeout: 180000 });
console.log('✔', v, OUT);
await browser.close(); server.stop();
