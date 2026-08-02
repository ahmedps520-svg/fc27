/**
 * Generates the PWA icon set as real PNGs.
 *
 * iOS will not accept an SVG for the home-screen icon, and there is no canvas in
 * plain Node, so this rasterises the APEX mark by hand and writes the PNG chunks
 * itself (zlib is built in). Run: node tools/make-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const SS = 4;                                  // supersample factor for smooth edges

const lerp = (a, b, t) => a + (b - a) * t;

/** Distance from point p to segment ab — used to draw the mark with round caps. */
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len2 = vx * vx + vy * vy || 1;
  let t = (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + vx * t);
  const dy = py - (ay + vy * t);
  return Math.hypot(dx, dy);
}

function renderIcon(size, { maskable = false } = {}) {
  const S = size * SS;
  const buf = Buffer.alloc(S * S * 4);
  const R = size * SS;

  // mark geometry in 0..1 space (the APEX "A": two strokes plus a crossbar)
  const inset = maskable ? 0.20 : 0.13;         // maskable needs a safe zone
  const m = (v) => inset + v * (1 - inset * 2);
  const A = [m(0.20), m(0.80)];
  const B = [m(0.50), m(0.16)];
  const C = [m(0.80), m(0.80)];
  const L = [m(0.325), m(0.545)];
  const Rr = [m(0.675), m(0.545)];
  const stroke = size * SS * 0.085;
  const bar = size * SS * 0.070;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S;
      const v = y / S;

      // background: deep navy with a corner glow
      const gx = (u - 0.28);
      const gy = (v - 0.12);
      const glow = Math.max(0, 1 - Math.hypot(gx, gy) * 1.55);
      let r = lerp(7, 20, glow * glow);
      let g = lerp(11, 42, glow * glow);
      let b = lerp(20, 64, glow * glow);

      // accent swoosh across the lower right
      const band = (u * 0.75 + v) - 1.06;
      if (band > 0 && band < 0.115) {
        const t = Math.min(1, band / 0.115);
        const a = Math.sin(t * Math.PI) * 0.85;
        r = lerp(r, 18, a); g = lerp(g, 200, a); b = lerp(b, 110, a);
      }

      // the mark itself
      const px = x;
      const py = y;
      const d = Math.min(
        segDist(px, py, A[0] * S, A[1] * S, B[0] * S, B[1] * S),
        segDist(px, py, B[0] * S, B[1] * S, C[0] * S, C[1] * S));
      const dbar = segDist(px, py, L[0] * S, L[1] * S, Rr[0] * S, Rr[1] * S);
      const inMark = Math.min(d - stroke, dbar - bar);
      if (inMark < 1.5) {
        const a = Math.max(0, Math.min(1, (1.5 - inMark) / 1.5));
        // vertical gradient on the glyph, mint to cyan
        const gt = (v - 0.16) / 0.7;
        r = lerp(r, lerp(90, 60, gt), a);
        g = lerp(g, lerp(250, 215, gt), a);
        b = lerp(b, lerp(160, 255, gt), a);
      }

      const i = (y * S + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }

  // downsample the supersampled buffer
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * S + (x * SS + sx)) * 4;
          r += buf[i]; g += buf[i + 1]; b += buf[i + 2];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = 255;
    }
  }
  return out;
}

/* --------------------------- minimal PNG writer -------------------------- */
function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function writePNG(file, rgba, size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;                       // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;      // bit depth
  ihdr[9] = 6;      // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
  return png.length;
}

const jobs = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, {}],
  ['favicon-64.png', 64, {}],
];

for (const [name, size, opts] of jobs) {
  const bytes = writePNG(path.join(OUT, name), renderIcon(size, opts), size);
  console.log(`${name}  ${size}x${size}  ${(bytes / 1024).toFixed(1)} KB`);
}
