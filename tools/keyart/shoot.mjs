import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import fs from 'node:fs';
const { chromium } = pkg;
const OUT='/tmp/claude-0/-home-user-fc27/bfa9812a-0c38-5b72-ab90-4dee75412d75/scratchpad';
const W=2560, H=1440;
const browser = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({viewport:{width:W,height:H}})).newPage();
page.on('pageerror',(e)=>console.log('PAGEERR',e.message));
await page.goto('http://localhost:8413/',{timeout:30000}); await page.waitForTimeout(1000);
await page.evaluate(()=>{const K='apexxi.save.v1';const s=JSON.parse(localStorage.getItem(K)||'{}');
 s.settings=s.settings||{}; s.settings.tutorialDone=true; s.settings.quality='high'; s.settings.models='realistic';
 s.meta={reset:'econ-2curr-1'}; localStorage.setItem(K,JSON.stringify(s));});
await page.reload(); await page.waitForTimeout(1000);
await page.locator('button:has-text("START")').first().click({timeout:10000}).catch(()=>{});
await page.waitForTimeout(700);
if(await page.locator('#npGo').count().catch(()=>0)){await page.locator('#npGo').click().catch(()=>{});await page.waitForTimeout(400);}
await page.locator('[data-go="quick"]').first().click({timeout:10000}).catch(()=>{});
await page.waitForTimeout(1000);
await page.locator('#kickOff').first().click({timeout:10000}).catch(()=>{});
for(let i=0;i<90;i++){ if(await page.locator('#gmCanvas').count().catch(()=>0)) break; await page.waitForTimeout(1000); }
console.log('canvas up');
const poses = [
  {dx: 5, dy:-9,  z:2.0, tdx:0, tdy:3,  tz:1.1, hfov:62},   // low, close behind play
  {dx:-7, dy:-11, z:1.5, tdx:1, tdy:5,  tz:1.4, hfov:70},   // very low, wide
  {dx: 0, dy:-16, z:3.2, tdx:0, tdy:6,  tz:1.2, hfov:54},   // pitchside dolly
];
let n=0;
for (const p of poses) {
  await page.evaluate((k)=>{ globalThis.__keyart = k; }, p);
  for (let s=0; s<2; s++) {
    await page.waitForTimeout(14000);
    const url = await page.evaluate(() => new Promise((res) => requestAnimationFrame(() => {
      const src=document.querySelector('#gmCanvas');
      const c=document.createElement('canvas'); c.width=src.width; c.height=src.height;
      c.getContext('2d').drawImage(src,0,0); res(c.toDataURL('image/jpeg',0.95));
    })));
    fs.writeFileSync(`${OUT}/cine-${n}.jpg`, Buffer.from(url.split(',')[1],'base64'));
    console.log('shot', n); n++;
  }
}
await browser.close();
