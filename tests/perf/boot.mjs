/**
 * Boot cost on a throttled mid-range phone profile.
 *
 * Measures what a player on a so-so connection actually waits for: bytes on
 * the wire and time to the START button, with the CPU slowed 4x and the
 * network held to a 1.6 Mb/s, 150 ms line (Chrome's "Slow 4G"). Run before and
 * after a change and compare; the numbers only mean something relative to each
 * other on the same machine.
 *
 *   node tests/perf/boot.mjs
 */
import { chromium } from 'playwright';
import { startServer } from '../smoke/server.mjs';

// --root <dir> benchmarks another checkout (e.g. a worktree of the previous release)
const rootArg = process.argv.indexOf('--root');
const server = await startServer(undefined, { cwd: rootArg > 0 ? process.argv[rootArg + 1] : process.cwd() });
const browser = await chromium.launch({ args: ['--disable-webgl'] });
const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
// --net fast: a typical 4G line (9 Mb/s, 60 ms) instead of Chrome's "Slow 4G"
const fast = process.argv.includes('--net') && process.argv[process.argv.indexOf('--net') + 1] === 'fast';
await cdp.send('Network.emulateNetworkConditions', fast
  ? { offline: false, latency: 60, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 }
  : { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
let bytes = 0; let requests = 0;
cdp.on('Network.responseReceived', () => { requests += 1; });
cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength || 0; });

const measure = async (label) => {
  bytes = 0; requests = 0;
  const t0 = Date.now();
  await page.goto(`${server.url}/`, { waitUntil: 'commit' });
  await page.waitForSelector('#startBtn', { timeout: 90000 });
  const splash = Date.now() - t0;
  await page.waitForTimeout(2500);        // let the tail of the module graph land
  const js = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.endsWith('.js')).length);
  console.log(`${label}: START button in ${splash} ms · ${requests} requests · ${(bytes / 1024).toFixed(0)} KB on the wire · ${js} scripts`);
  return { splash, kb: Math.round(bytes / 1024), requests };
};
const cold = await measure('cold');
const warm = await measure('warm');
console.log(JSON.stringify({ cold, warm }));
await browser.close(); server.stop();
