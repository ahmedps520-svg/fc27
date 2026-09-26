/**
 * The store email's artwork (v131), rendered to PNG at 2x.
 *
 *   node tools/email/art.mjs
 *
 * Mail clients cannot draw the game's glowing SVG lines (Gmail drops SVG and
 * filters entirely), so the parts that carry the look — the cover's swoosh,
 * the division ladder, the wordmark, the lit rules between sections — are
 * pictures, served from the game's own origin. Text stays text in the HTML.
 */
import { chromium } from 'playwright';

const G = '#23c55e';
const glow = (id, sd) => `<filter id="${id}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

const PIECES = {
  // 560x170 — the banner every mode screen opens with, as the email's masthead
  header: [560, 170, `
    <defs>
      <radialGradient id="wash" cx="18%" cy="0%" r="75%"><stop offset="0" stop-color="${G}" stop-opacity=".32"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></radialGradient>
      <linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#070b14"/><stop offset="1" stop-color="#05070e"/></linearGradient>
      <linearGradient id="rule" x1="0" x2="1"><stop offset="0" stop-color="${G}" stop-opacity="0"/><stop offset=".25" stop-color="${G}"/><stop offset="1" stop-color="${G}" stop-opacity=".1"/></linearGradient>
      ${glow('g1', 6)}${glow('g2', 2.5)}
    </defs>
    <rect width="560" height="170" fill="url(#bg)"/>
    <rect width="560" height="170" fill="url(#wash)"/>
    <g stroke="#ffffff" stroke-opacity=".035" stroke-width="1">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 40} 0v170"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${i * 40 + 10}h560"/>`).join('')}</g>
    <g fill="none" stroke="${G}" stroke-opacity=".38" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter" transform="translate(262 22) scale(.92)" filter="url(#g2)">
      <path d="M8 104h44v-14M60 90h44V70M112 70h44V46M164 46h44V18"/>
      <path d="M52 104V90M104 90V70M156 70V46M208 46V18"/>
      <circle cx="208" cy="18" r="5.5"/>
    </g>
    <g fill="none" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M392 182 L436 178 L580 18" stroke="${G}" stroke-width="11" filter="url(#g1)"/>
      <path d="M428 184 L468 182 L580 64" stroke="${G}" stroke-opacity=".35" stroke-width="4.5" filter="url(#g2)"/>
      <path d="M458 186 L494 184 L580 104" stroke="#9dffc6" stroke-opacity=".5" stroke-width="1.6" filter="url(#g2)"/>
      <path d="M362 180 L402 176 L548 -8" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" filter="url(#g2)"/>
    </g>
    <rect x="0" y="0" width="3" height="170" fill="${G}" filter="url(#g2)"/>
    <g transform="translate(32 44)">
      <circle cx="22" cy="22" r="19" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="3.5"/>
      <circle cx="22" cy="22" r="19" fill="none" stroke="${G}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="40 120" transform="rotate(-100 22 22)" filter="url(#g2)"/>
      <text x="22" y="30" text-anchor="middle" font-family="Oswald, 'Arial Narrow', sans-serif" font-weight="700" font-style="italic" font-size="22" fill="#fff">A</text>
      <text x="56" y="31" font-family="Oswald, 'Arial Narrow', sans-serif" font-weight="700" font-style="italic" font-size="28" letter-spacing="1" fill="#f6f9ff">APEX <tspan fill="${G}">XI</tspan></text>
    </g>
    <text x="34" y="122" font-family="Oswald, 'Arial Narrow', sans-serif" font-weight="600" font-size="11" letter-spacing="3.6" fill="${G}">STORE · NEW ORDER</text>
    <rect x="34" y="134" width="150" height="2" fill="url(#rule)" filter="url(#g2)"/>`],
  // 560x14 — a lit rule between sections
  divider: [560, 14, `
    <defs><linearGradient id="r" x1="0" x2="1"><stop offset="0" stop-color="${G}" stop-opacity="0"/><stop offset=".5" stop-color="${G}"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></linearGradient>${glow('g', 3)}</defs>
    <rect width="560" height="14" fill="#0c111b"/>
    <rect x="20" y="6" width="520" height="2" fill="url(#r)" filter="url(#g)"/>
    <path d="M268 11 L276 3 L292 3 L284 11 Z" fill="${G}" filter="url(#g)"/>`],
  // 560x60 — the swoosh again, closing the card
  footer: [560, 60, `
    <defs>${glow('g1', 5)}${glow('g2', 2)}</defs>
    <rect width="560" height="60" fill="#0c111b"/>
    <g fill="none" stroke-linecap="square">
      <path d="M-10 58 L230 58 L262 30 L570 30" stroke="${G}" stroke-opacity=".9" stroke-width="3" filter="url(#g1)"/>
      <path d="M-10 50 L214 50 L240 26 L570 26" stroke="${G}" stroke-opacity=".3" stroke-width="1.5" filter="url(#g2)"/>
    </g>`],
};

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const [name, [w, h, svg]] of Object.entries(PIECES)) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<!doctype html><html><head>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=block" rel="stylesheet">
    <style>html,body{margin:0;background:#05070e}svg{display:block}</style></head>
    <body><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg></body></html>`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `assets/email/${name}.png`, omitBackground: false });
  console.log('assets/email/' + name + '.png');
}
await browser.close();
// the masthead ships as a JPEG (a quarter of the PNG's size):
//   python3 -c "from PIL import Image; Image.open('assets/email/header.png').convert('RGB').save('assets/email/header.jpg', quality=88, optimize=True, progressive=True)"
console.log('now convert header.png to header.jpg (see the comment at the end of this file)');
