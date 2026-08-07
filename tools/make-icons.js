/**
 * Generates the PWA icon set as real PNGs.
 *
 * iOS will not accept an SVG for the home-screen icon, and there is no canvas in
 * plain Node, so the mark is rasterised by hand here and the PNG chunks written
 * directly (zlib is built in). Run: node tools/make-icons.js
 *
 * The art is the game's own key art reduced to what still reads at 48px: a
 * floodlit night, two neon light bars cutting the frame, and the XI wordmark
 * burning white in the middle of its own green glow. No photography, no type
 * foundry — every shape below is a distance field evaluated per pixel.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const SS = 4;                                  // supersample factor for smooth edges

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
};

/** Distance from point p to segment ab — the letters are drawn from these. */
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const len2 = vx * vx + vy * vy || 1;
  const t = clamp01((wx * vx + wy * vy) / len2);
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
}

/** Distance to an infinite line through `c` at angle `ang` — the light bars. */
const lineDist = (u, v, ang, c) => Math.abs(u * Math.cos(ang) + v * Math.sin(ang) - c);

const GREEN = [56, 240, 118];                  // the neon the key art is lit with
const DEEP = [3, 7, 5];                        // night sky behind the stands
const PITCH = [8, 26, 14];                     // grass catching the floodlights

/**
 * The XI wordmark, as stroke segments in 0..1 space. Serifs on the I so it can
 * never be read as a lower-case L at icon size.
 */
const GLYPH = [
  [0.265, 0.360, 0.475, 0.650],                // X, top-left to bottom-right
  [0.475, 0.360, 0.265, 0.650],                // X, top-right to bottom-left
  [0.660, 0.360, 0.660, 0.650],                // I, stem
  [0.585, 0.360, 0.735, 0.360],                // I, top serif
  [0.585, 0.650, 0.735, 0.650],                // I, foot serif
];

function renderIcon(size, { maskable = false } = {}) {
  const S = size * SS;
  const buf = Buffer.alloc(S * S * 4);
  // Maskable icons get their corners eaten by whatever shape the launcher uses,
  // so the artwork shrinks toward the middle while the background stays full.
  const k = maskable ? 0.74 : 1;
  const toArt = (c) => 0.5 + (c - 0.5) / k;    // pixel -> artwork space

  const stroke = 0.055;
  const barW = 0.05;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = toArt((x + 0.5) / S);
      const v = toArt((y + 0.5) / S);

      // --- night sky, warmed toward the grass at the bottom ---
      const horizon = smooth(0.52, 1.05, v);
      let r = lerp(DEEP[0], PITCH[0], horizon);
      let g = lerp(DEEP[1], PITCH[1], horizon);
      let b = lerp(DEEP[2], PITCH[2], horizon);

      // --- floodlights: three blooms along the top, the middle one strongest ---
      for (const [lx, ly, rad, amp] of [[0.16, 0.04, 0.46, 0.34], [0.5, -0.06, 0.6, 0.5], [0.86, 0.04, 0.46, 0.34]]) {
        const d = Math.hypot(u - lx, (v - ly) * 1.35);
        const f = Math.pow(Math.max(0, 1 - d / rad), 3) * amp;
        r += 16 * f; g += 52 * f; b += 28 * f;
      }

      // --- haze off the pitch ---
      const haze = Math.pow(smooth(0.7, 1.04, v), 1.8) * 0.5;
      r += GREEN[0] * 0.05 * haze; g += GREEN[1] * 0.11 * haze; b += GREEN[2] * 0.06 * haze;

      // --- two neon bars raking opposite corners, as on the key art. They are
      // placed clear of the wordmark: a light bar cutting through the letters
      // would read as a strike-through at icon size. ---
      const ANG = -0.86;                        // roughly 50 degrees off horizontal
      for (const [c, w, amp] of [[-0.62, barW, 1], [0.5, barW * 0.4, 0.62]]) {
        const d = lineDist(u, v, ANG, c);
        const core = 1 - smooth(w * 0.5, w * 0.5 + 0.01, d);
        const bloom = Math.pow(Math.max(0, 1 - d / (w * 3)), 2.4) * 0.45;
        const a = Math.min(1, core + bloom) * amp;
        r = lerp(r, GREEN[0], a * 0.9); g = lerp(g, GREEN[1], a * 0.95); b = lerp(b, GREEN[2], a * 0.9);
      }

      // --- the wordmark ---
      let d = Infinity;
      for (const [ax, ay, bx, by] of GLYPH) d = Math.min(d, segDist(u, v, ax, ay, bx, by));
      const edge = d - stroke * 0.5;

      // glow first, so the letters sit inside a halo rather than on top of one
      const halo = Math.pow(Math.max(0, 1 - edge / 0.062), 3.2);
      r += GREEN[0] * 0.62 * halo; g += GREEN[1] * 0.66 * halo; b += GREEN[2] * 0.5 * halo;

      // then the white-hot core, with the faintest green bleed at its rim
      const ink = 1 - smooth(-0.006, 0.002, edge);
      const rim = 1 - smooth(0.001, 0.009, edge);
      r = lerp(r, lerp(188, 250, ink), rim);
      g = lerp(g, lerp(255, 255, ink), rim);
      b = lerp(b, lerp(208, 252, ink), rim);

      // vignette: the key art is a floodlit middle inside dark corners
      const vig = 1 - 0.55 * Math.pow(Math.hypot(u - 0.5, v - 0.5) / 0.72, 2.4);
      r *= vig; g *= vig; b *= vig;

      const i = (y * S + x) * 4;
      buf[i] = Math.min(255, r);
      buf[i + 1] = Math.min(255, g);
      buf[i + 2] = Math.min(255, b);
      buf[i + 3] = 255;
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
