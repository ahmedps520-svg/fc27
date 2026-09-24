/**
 * v95 (R15 launch readiness): the install icons and the manifest are checked,
 * not replaced. Each icon is the size the manifest says it is, the maskable
 * icon has no see-through pixel for a launcher's mask to reveal, the
 * home-screen icon on iOS is opaque (iOS paints transparency black), and the
 * service worker keeps every icon and the manifest for offline installs.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const root = new URL('../../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root));

/** Decode an 8-bit RGBA, non-interlaced PNG (what the icons are). */
function png(path) {
  const d = read(path);
  assert.equal(d.readUInt32BE(12), 0x49484452, `${path}: IHDR first`);
  const w = d.readUInt32BE(16); const h = d.readUInt32BE(20);
  assert.equal(d[24], 8, `${path}: 8-bit`); assert.equal(d[25], 6, `${path}: RGBA`); assert.equal(d[28], 0, `${path}: not interlaced`);
  const idat = [];
  for (let o = 8; o < d.length;) {
    const len = d.readUInt32BE(o); const type = d.toString('ascii', o + 4, o + 8);
    if (type === 'IDAT') idat.push(d.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * 4; const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? px[y * stride + x - 4] : 0; const b = y ? px[(y - 1) * stride + x] : 0; const c = x >= 4 && y ? px[(y - 1) * stride + x - 4] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, alpha: (x, y) => px[(y * w + x) * 4 + 3] };
}

const manifest = JSON.parse(read('manifest.webmanifest'));
const html = read('index.html').toString();
const sw = read('sw.js').toString();

test('the manifest has what an install needs', () => {
  for (const k of ['name', 'short_name', 'start_url', 'display', 'background_color', 'theme_color']) assert.ok(manifest[k], `manifest.${k}`);
  assert.ok(manifest.short_name.length <= 12, 'short name fits under a home-screen icon');
  const theme = html.match(/<meta name="theme-color" content="([^"]+)"/)?.[1];
  assert.equal(theme, manifest.theme_color, 'the page and the manifest agree on the theme colour');
  assert.ok(manifest.icons.some((i) => i.sizes === '192x192' && i.purpose !== 'maskable'), 'a 192 icon');
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose !== 'maskable'), 'a 512 icon');
  assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'), 'a maskable icon');
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png"/);
});

test('every icon is the size it claims, and is not blank', () => {
  const linked = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g)].map((m) => ({
    src: m[0].match(/href="([^"]+)"/)[1], sizes: m[0].match(/sizes="([^"]+)"/)?.[1] || '180x180',
  }));
  for (const i of [...manifest.icons, ...linked]) {
    const p = png(i.src); const [w, h] = i.sizes.split('x').map(Number);
    assert.equal(p.w, w, `${i.src} width`); assert.equal(p.h, h, `${i.src} height`);
    assert.ok(p.alpha(w >> 1, h >> 1) > 200, `${i.src} has something in the middle`);
  }
});

test('the maskable and iOS icons have no transparent pixel for a mask to show', () => {
  for (const src of [manifest.icons.find((i) => i.purpose === 'maskable').src, 'icons/apple-touch-icon.png']) {
    const p = png(src); let clear = 0;
    for (let y = 0; y < p.h; y += 3) for (let x = 0; x < p.w; x += 3) if (p.alpha(x, y) < 250) clear += 1;
    assert.equal(clear, 0, `${src}: ${clear} see-through pixels`);
  }
});

test('the service worker precaches the manifest and every icon', () => {
  assert.ok(sw.includes("'./manifest.webmanifest'"), 'manifest precached');
  for (const i of manifest.icons) assert.ok(sw.includes(`'./${i.src}'`), `${i.src} precached`);
  assert.ok(sw.includes("'./icons/apple-touch-icon.png'") && sw.includes("'./icons/favicon-64.png'"));
});
