/**
 * Club crests.
 *
 * A real badge is three things stacked: an outline, a field with some device on
 * it, and the club's name or initials on a band. The first version here had
 * only the outline and the initials, which is why every club looked like a
 * placeholder. This draws all three, from data on the blueprint, so ten clubs
 * come out looking like ten clubs.
 *
 * Everything is geometry — no images, no fonts beyond the one already loaded.
 *
 * The badge has to survive being drawn at 20px in the match scoreline as well
 * as 66px on a club picker, and detail that reads at 66 turns to mud at 20. So
 * there are two builds of the same crest and `size` picks between them: the
 * small one keeps the silhouette, the field pattern and the initials, and drops
 * the device and the banding.
 */

/* ------------------------------- outlines ------------------------------- */
const SHAPES = {
  shield: 'M50 3 L93 18 V50 C93 75 73 92 50 99 C27 92 7 75 7 50 V18 Z',
  circle: 'M50 3 A47 47 0 1 1 49.9 3 Z',
  hex: 'M50 3 L91 26 V74 L50 97 L9 74 V26 Z',
  diamond: 'M50 2 L95 50 L50 98 L5 50 Z',
  chevron: 'M50 3 L93 22 V56 L50 97 L7 56 V22 Z',
  triangle: 'M50 5 L96 90 L4 90 Z',
};

/* -------------------------------- fields --------------------------------- *
 * Drawn inside the outline and clipped to it, so a stripe never runs off the
 * edge of a diamond. `a` is the club's first colour, `b` the second.          */
const PATTERNS = {
  solid: () => '',
  stripes: (a) => [15, 39, 63, 87].map((x) =>
    `<rect x="${x}" y="0" width="12" height="100" fill="${a}" opacity=".85"/>`).join(''),
  halves: (a) => `<rect x="50" y="0" width="50" height="100" fill="${a}" opacity=".9"/>`,
  hoops: (a) => [16, 44, 72].map((y) =>
    `<rect x="0" y="${y}" width="100" height="13" fill="${a}" opacity=".85"/>`).join(''),
  sash: (a) => `<path d="M-10 74 L74 -10 L100 12 L16 96 Z" fill="${a}" opacity=".9"/>`,
  quarters: (a) => `<rect x="0" y="0" width="50" height="50" fill="${a}" opacity=".9"/>`
    + `<rect x="50" y="50" width="50" height="50" fill="${a}" opacity=".9"/>`,
};

/* -------------------------------- devices -------------------------------- *
 * One per club, sitting in the upper half of the badge above the name band.
 * Each is centred on (50, 40) and lives inside about a 40-unit square.        */
const DEVICES = {
  /** Ironvale: a keep, because the town is named for what it forged. */
  keep: (ink) => `<path d="M34 56 V32 h5 v-6 h6 v6 h5 v-6 h6 v6 h5 v-6 h6 v6 h5 v24 Z"
    fill="${ink}"/><rect x="46" y="42" width="8" height="14" fill="#000" opacity=".35"/>`,
  /** Solaris: a sun, rays and all. */
  sun: (ink) => `<circle cx="50" cy="40" r="10" fill="${ink}"/>`
    + Array.from({ length: 8 }, (_, i) => {
      const t = (i / 8) * Math.PI * 2;
      const x1 = 50 + Math.cos(t) * 14;
      const y1 = 40 + Math.sin(t) * 14;
      const x2 = 50 + Math.cos(t) * 20;
      const y2 = 40 + Math.sin(t) * 20;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}"
        y2="${y2.toFixed(1)}" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
    }).join(''),
  /** Duskmoor: the moor at dusk — a crescent. */
  crescent: (ink) => `<path d="M58 24 a17 17 0 1 0 0 32 a13 13 0 1 1 0 -32 Z" fill="${ink}"/>`,
  /** Verano: a leaf, for a club named after the summer. */
  leaf: (ink) => `<path d="M52 20 C72 30 70 52 48 60 C30 52 32 30 52 20 Z" fill="${ink}"/>`
    + `<path d="M48 60 C50 46 52 32 52 20" stroke="#000" stroke-width="2.4" fill="none" opacity=".35"/>`
    + `<path d="M50 50 L38 46 M51 42 L40 37 M52 34 L43 30" stroke="#000" stroke-width="1.8" opacity=".28"/>`
    + `<path d="M48 60 q-4 6 -8 8" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  /** Kestrel: a bird, stooping. */
  bird: (ink) => `<path d="M50 26 q4 0 5 5 l16 -9 q6 -3 4 3 l-7 14 18 -4 q6 -1 2 4
      l-14 13 -18 6 -18 -6 -14 -13 q-4 -5 2 -4 l18 4 -7 -14 q-2 -6 4 -3 l16 9 q1 -5 5 -5 Z"
      fill="${ink}"/>`,
  /** Thornbury: a sprig of thorn. */
  thorn: (ink) => `<path d="M50 58 V26" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`
    + `<path d="M50 34 L36 26 M50 34 L64 26 M50 46 L38 40 M50 46 L62 40"
       stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`,
  /** Marisol: sun over water. */
  wave: (ink) => `<circle cx="50" cy="34" r="9" fill="${ink}"/>`
    + `<path d="M28 48 q11 -7 22 0 t22 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    + `<path d="M28 57 q11 -7 22 0 t22 0" stroke="${ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  /** Aurora Nord: the north star. */
  star: (ink) => `<path d="M50 18 L56 36 L74 40 L56 44 L50 62 L44 44 L26 40 L44 36 Z" fill="${ink}"/>`,
  /** Bastion: battlements. */
  battlement: (ink) => `<path d="M28 56 V34 h7 v-7 h7 v7 h8 v-7 h7 v7 h7 v-7 h7 v7 h4 v22 Z" fill="${ink}"/>`,
  /** Calderon Zenith: the peak the club is named for. */
  peak: (ink) => `<path d="M22 58 L42 26 L54 44 L62 34 L78 58 Z" fill="${ink}"/>`
    + `<path d="M42 26 L34 40 L50 40 Z" fill="#fff" opacity=".5"/>`,
  /** Anything without a device of its own falls back to a ball. */
  ball: (ink) => `<circle cx="50" cy="40" r="14" fill="${ink}"/>`
    + `<path d="M50 30 L58 36 L55 46 H45 L42 36 Z" fill="#000" opacity=".4"/>`,
};

/** Readable ink over a given field: dark badges take a light device, and back. */
function inkFor(hex) {
  const h = String(hex).replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  return (r * 0.299 + g * 0.587 + b * 0.114) > 150 ? '#14161c' : '#ffffff';
}

let seq = 0;

/**
 * @param {{shape:string, colors:[string,string], pattern?:string, device?:string}} crest
 * @param {string} short 3-letter club code
 * @param {number} size rendered width in pixels; under 28 draws the simple build
 */
/** Everything a badge can be built out of, so a picker can offer all of it. */
export const CREST_PARTS = {
  shape: Object.keys(SHAPES),
  pattern: Object.keys(PATTERNS),
  device: Object.keys(DEVICES),
};

export function crestSVG(crest, short, size = 40) {
  const [a, b] = crest.colors;
  // ids have to be unique per badge on the page, and two crests can be built in
  // the same millisecond, so a counter rather than a clock or a random number
  const uid = `cr${(seq += 1)}`;
  const path = SHAPES[crest.shape] || SHAPES.shield;
  const field = (PATTERNS[crest.pattern] || PATTERNS.solid)(a, b);
  const ink = inkFor(b);
  const small = size < 28;

  // A diamond and a triangle have far less usable width at the badge's waist
  // than a shield does, so the device is shrunk to fit rather than clipped.
  const room = crest.shape === 'diamond' ? 0.74 : crest.shape === 'triangle' ? 0.8 : 1;
  const device = small ? '' : `<g transform="translate(50 37) scale(${room}) translate(-50 -40)">
      ${(DEVICES[crest.device] || DEVICES.ball)(ink)}</g>`;

  // Full size puts the initials on a band across the foot of the badge, the way
  // a real crest carries its name; small size centres them, because at 20px the
  // band is three grey pixels and the letters are all anyone can see.
  // The band takes the ink colour and the letters take the field colour, so
  // each reads against what is directly behind it. Doing it the other way round
  // — which the first attempt did — paints dark text onto a dark band.
  const label = small
    ? `<text x="50" y="62" text-anchor="middle" font-size="34" font-weight="800"
             fill="${ink}" style="letter-spacing:-1.5px">${short}</text>`
    : `<g clip-path="url(#${uid}c)">
         <rect x="0" y="64" width="100" height="19" fill="${ink}" opacity=".92"/>
       </g>
       <text x="50" y="78" text-anchor="middle" font-size="16" font-weight="800"
             fill="${shade(b, 0.85)}" style="letter-spacing:.6px">${short}</text>`;

  return `
    <svg class="crest" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
      <defs>
        <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${b}"/>
          <stop offset="100%" stop-color="${shade(b, 0.72)}"/>
        </linearGradient>
        <clipPath id="${uid}c"><path d="${path}"/></clipPath>
      </defs>
      <path d="${path}" fill="url(#${uid})"/>
      <g clip-path="url(#${uid}c)">${field}</g>
      ${device}
      ${label}
      <path d="${path}" fill="none" stroke="${a}" stroke-width="${small ? 6 : 5}"/>
    </svg>`;
}

/** Darken a hex colour towards black by `f` (1 = unchanged). */
function shade(hex, f) {
  const h = String(hex).replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const v = [0, 2, 4].map((i) => Math.round((parseInt(n.slice(i, i + 2), 16) || 0) * f));
  return `#${v.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Two-band flag for the fictional nations. */
export function flagSVG(colors, w = 20) {
  const [a, b] = colors;
  return `
    <svg class="flag" viewBox="0 0 30 20" width="${w}" height="${(w / 3) * 2}" aria-hidden="true">
      <rect width="30" height="20" fill="${b}"/>
      <rect width="30" height="9" fill="${a}"/>
      <circle cx="15" cy="14" r="3.4" fill="${a}" opacity=".85"/>
    </svg>`;
}
