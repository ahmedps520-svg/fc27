/**
 * Builds the PWA icon set from the key art in `assets/brand/icon-source.png`.
 *
 *   node tools/make-icons.js [source.png]
 *
 * iOS will not accept an SVG for a home-screen icon and every platform wants a
 * different size, so the master is kept at 1024px and everything else is
 * resampled from it here. There is no canvas and no image library in plain
 * Node and this project has no dependencies, so the PNG reader, the Lanczos
 * resampler and the PNG writer below are all hand-rolled on top of zlib.
 *
 * What each output is for:
 *   · icon-192 / icon-512   launcher and PWA install, shown as drawn
 *   · icon-maskable-512     Android crops this to its own shape, so the art is
 *                           inset to keep the wordmark inside the safe circle
 *   · apple-touch-icon      iOS applies a squircle mask of its own
 *   · favicon-64            browser tabs
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'icons');
const SRC = process.argv[2] || path.join(ROOT, 'assets', 'brand', 'icon-source.png');

/* ------------------------------ PNG reader ------------------------------ */
/** @returns {{width:number, height:number, data:Buffer}} 8-bit RGBA pixels. */
function readPNG(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${file} is not a PNG`);

  let pos = 8;
  let ihdr = null;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') ihdr = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (!ihdr) throw new Error('PNG has no header');

  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const depth = ihdr[8];
  const color = ihdr[9];
  const interlace = ihdr[12];
  if (depth !== 8) throw new Error(`only 8-bit PNGs are supported (got ${depth})`);
  if (interlace) throw new Error('interlaced PNGs are not supported');
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[color];
  if (!channels) throw new Error(`unsupported colour type ${color}`);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(width * height * 4);
  const line = Buffer.alloc(stride);
  let prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    raw.copy(line, 0, y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    // undo the per-row filter: each byte was stored as a delta from its
    // neighbours, which is what makes PNG compress at all
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0;      // left
      const b = prev[i];                           // above
      const c = i >= bpp ? prev[i - bpp] : 0;      // above-left
      let add = 0;
      if (filter === 1) add = a;
      else if (filter === 2) add = b;
      else if (filter === 3) add = (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      line[i] = (line[i] + add) & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const s = x * bpp;
      const d = (y * width + x) * 4;
      if (channels >= 3) {
        out[d] = line[s]; out[d + 1] = line[s + 1]; out[d + 2] = line[s + 2];
        out[d + 3] = channels === 4 ? line[s + 3] : 255;
      } else {
        out[d] = line[s]; out[d + 1] = line[s]; out[d + 2] = line[s];
        out[d + 3] = channels === 2 ? line[s + 1] : 255;
      }
    }
    prev = Buffer.from(line);
  }
  return { width, height, data: out };
}

/* ------------------------------- resampling ------------------------------ */
const LOBES = 3;
const sinc = (x) => (x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));
const lanczos = (x) => (Math.abs(x) >= LOBES ? 0 : sinc(x) * sinc(x / LOBES));

/**
 * Separable Lanczos-3 resize. Box averaging loses the ball's panel edges and
 * the thin light streaks at 64px; Lanczos keeps them.
 */
function resize(img, w, h) {
  const weightsFor = (dstLen, srcLen) => {
    const scale = srcLen / dstLen;
    const support = Math.max(1, scale) * LOBES;
    return Array.from({ length: dstLen }, (_, i) => {
      const centre = (i + 0.5) * scale - 0.5;
      const from = Math.max(0, Math.ceil(centre - support));
      const to = Math.min(srcLen - 1, Math.floor(centre + support));
      const taps = [];
      let sum = 0;
      for (let s = from; s <= to; s++) {
        const wgt = lanczos((s - centre) / Math.max(1, scale));
        if (wgt !== 0) { taps.push([s, wgt]); sum += wgt; }
      }
      return taps.map(([s, wgt]) => [s, wgt / sum]);
    });
  };

  const cols = weightsFor(w, img.width);
  const rows = weightsFor(h, img.height);

  // horizontal pass into a float buffer, then vertical
  const mid = new Float32Array(w * img.height * 4);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0; let g = 0; let b = 0; let a = 0;
      for (const [s, wgt] of cols[x]) {
        const i = (y * img.width + s) * 4;
        r += img.data[i] * wgt; g += img.data[i + 1] * wgt;
        b += img.data[i + 2] * wgt; a += img.data[i + 3] * wgt;
      }
      const o = (y * w + x) * 4;
      mid[o] = r; mid[o + 1] = g; mid[o + 2] = b; mid[o + 3] = a;
    }
  }

  const out = Buffer.alloc(w * h * 4);
  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0; let g = 0; let b = 0; let a = 0;
      for (const [s, wgt] of rows[y]) {
        const i = (s * w + x) * 4;
        r += mid[i] * wgt; g += mid[i + 1] * wgt; b += mid[i + 2] * wgt; a += mid[i + 3] * wgt;
      }
      const o = (y * w + x) * 4;
      out[o] = clamp(r); out[o + 1] = clamp(g); out[o + 2] = clamp(b); out[o + 3] = clamp(a);
    }
  }
  return { width: w, height: h, data: out };
}

/** Square crop of the source, given a centre and a side length in 0..1 units. */
function cropSquare(img, cx, cy, side) {
  const s = Math.round(side * img.width);
  const x0 = Math.round(cx * img.width - s / 2);
  const y0 = Math.round(cy * img.height - s / 2);
  const out = Buffer.alloc(s * s * 4);
  for (let y = 0; y < s; y++) {
    const sy = Math.min(img.height - 1, Math.max(0, y0 + y));
    for (let x = 0; x < s; x++) {
      const sx = Math.min(img.width - 1, Math.max(0, x0 + x));
      img.data.copy(out, (y * s + x) * 4, (sy * img.width + sx) * 4, (sy * img.width + sx) * 4 + 4);
    }
  }
  return { width: s, height: s, data: out };
}

/** Paste `img` centred on a solid square of `size`. */
function onCanvas(img, size, [br, bg, bb] = [0, 0, 0]) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = br; out[i * 4 + 1] = bg; out[i * 4 + 2] = bb; out[i * 4 + 3] = 255;
  }
  const ox = Math.round((size - img.width) / 2);
  const oy = Math.round((size - img.height) / 2);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const s = (y * img.width + x) * 4;
      const d = ((y + oy) * size + (x + ox)) * 4;
      const a = img.data[s + 3] / 255;
      out[d] = img.data[s] * a + out[d] * (1 - a);
      out[d + 1] = img.data[s + 1] * a + out[d + 1] * (1 - a);
      out[d + 2] = img.data[s + 2] * a + out[d + 2] * (1 - a);
      out[d + 3] = 255;
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

/* ---------------------------------- run ---------------------------------- */
// Android masks a maskable icon to its own shape — a circle on some launchers —
// and only the middle 80% is guaranteed to survive. The wordmark runs almost
// the full width of the art, so it is inset rather than cropped.
const MASKABLE_INSET = 0.88;

// A tab favicon is drawn at 16-32px, where the whole composition — wordmark,
// streaks, stands — collapses into green mush. The ball alone still reads as a
// football at 16px, so that is what the favicon is: centre and side, measured
// off the artwork.
const FAVICON_CROP = [0.49, 0.69, 0.40];

const jobs = [
  ['icon-192.png', 192, { fill: 1 }],
  ['icon-512.png', 512, { fill: 1 }],
  ['icon-maskable-512.png', 512, { fill: MASKABLE_INSET }],
  ['apple-touch-icon.png', 180, { fill: 1 }],
  ['favicon-64.png', 64, { fill: 1, crop: FAVICON_CROP }],
];

fs.mkdirSync(OUT, { recursive: true });
const source = readPNG(SRC);
console.log(`source ${path.relative(ROOT, SRC)}  ${source.width}x${source.height}`);

for (const [name, size, { fill, crop }] of jobs) {
  const from = crop ? cropSquare(source, ...crop) : source;
  const inner = Math.round(size * fill);
  const scaled = resize(from, inner, inner);
  const rgba = inner === size ? scaled.data : onCanvas(scaled, size);
  const bytes = writePNG(path.join(OUT, name), rgba, size);
  console.log(`${name}  ${size}x${size}  ${(bytes / 1024).toFixed(1)} KB${crop ? '  (ball crop)' : ''}`);
}
