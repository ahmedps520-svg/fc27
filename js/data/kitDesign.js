/**
 * Kit design (v115, backlog #16): your club's home and away strips.
 *
 * A kit is a shirt colour, a trim colour (the pattern's second colour), the
 * shorts, the socks and a pattern. The default is exactly the look the club
 * had before there was a designer — a plain shirt in the badge's first colour,
 * shorts and socks darker shades of it — so a save that never opens the
 * designer runs out as it always did.
 *
 * Both figures paint the pattern: the built figure (Low/Medium) into its shirt
 * texture here (`paintKit`), the scanned model (High/Ultra) in its tint shader
 * (game/playerModel.js), from the same pattern names.
 */

export const KIT_PATTERNS = [
  ['plain', 'Plain'], ['stripes', 'Stripes'], ['hoops', 'Hoops'], ['halves', 'Halves'], ['sash', 'Sash'], ['pinstripe', 'Pinstripe'],
];
const PATTERN_IDS = KIT_PATTERNS.map(([id]) => id);

/** The colours on offer: a football palette, not a colour wheel. */
export const KIT_SWATCHES = [
  '#f4f4f4', '#151515', '#d7263d', '#8b1e2d', '#ff7a1a', '#ffd21f', '#2ecc71', '#0e6b3a',
  '#41d3ff', '#1e5bd8', '#0b1f4f', '#7a3cff', '#ff5fa8', '#9fb0c4', '#c9a227', '#6b4226',
];

const HEX = /^#[0-9a-f]{6}$/i;
const hex = (v, d) => (HEX.test(String(v || '')) ? String(v).toLowerCase() : d);

/** A colour scaled towards black, as the old shorts (×0.6) and socks (×0.8) were. */
export function shade(h, k) {
  const n = parseInt(h.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function strip(k, shirt, trim) {
  const s = hex(k?.shirt, shirt);
  return {
    shirt: s,
    trim: hex(k?.trim, trim),
    shorts: hex(k?.shorts, shade(s, 0.6)),
    socks: hex(k?.socks, shade(s, 0.8)),
    pattern: PATTERN_IDS.includes(k?.pattern) ? k.pattern : 'plain',
  };
}

/**
 * A club's kits, every field present. `colors` are the badge's two colours:
 * the home kit defaults to the first, the away kit to the second with the
 * first as its trim.
 */
export function kitOf(saved, colors = ['#41d3ff', '#0b1020']) {
  const [a, b] = colors;
  return { home: strip(saved?.home, a, b), away: strip(saved?.away, b, a) };
}

/** Is this the untouched default (nothing designed)? */
export function isDefaultKit(kit, colors) {
  return JSON.stringify(kitOf(kit, colors)) === JSON.stringify(kitOf(null, colors));
}

/** Where a pattern puts the trim colour, in a shirt's own 0–1 coordinates (u across, v down). */
export function patternMask(pattern, u, v) {
  switch (pattern) {
    case 'stripes': return (u * 7) % 1 < 0.5;
    case 'pinstripe': return (u * 16) % 1 < 0.12;
    case 'hoops': return (v * 6) % 1 < 0.5;
    case 'halves': return u < 0.5;
    case 'sash': return Math.abs(u - v) < 0.13;
    default: return false;
  }
}

/** Paint a kit's shirt onto a canvas (the built figure's texture): base, then the pattern, drawn as shapes so a pinstripe survives. */
export function paintKit(g, strip_, size) {
  g.fillStyle = strip_.shirt;
  g.fillRect(0, 0, size, size);
  if (strip_.pattern === 'plain' || !strip_.pattern) return;
  g.fillStyle = strip_.trim;
  const bands = (n, w, vertical) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * size; const t = Math.max(1, w / n * size);
      if (vertical) g.fillRect(a, 0, t, size); else g.fillRect(0, a, size, t);
    }
  };
  switch (strip_.pattern) {
    case 'stripes': bands(7, 0.5, true); break;
    case 'pinstripe': bands(16, 0.12, true); break;
    case 'hoops': bands(6, 0.5, false); break;
    case 'halves': g.fillRect(0, 0, size / 2, size); break;
    case 'sash': {
      const w = 0.13 * size;
      g.beginPath(); g.moveTo(-w, 0); g.lineTo(w, 0); g.lineTo(size + w, size); g.lineTo(size - w, size); g.closePath(); g.fill();
      break;
    }
    default: break;
  }
}

/** A shirt-and-shorts preview, as SVG. */
export function kitSVG(s, size = 120) {
  const id = `k${Math.random().toString(36).slice(2, 8)}`;
  const bands = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (patternMask(s.pattern, (i + 0.5) / n, (j + 0.5) / n)) bands.push(`<rect x="${10 + i * 2}" y="${6 + j * 2.1}" width="2.05" height="2.15"/>`);
    }
  }
  return `<svg viewBox="0 0 100 124" width="${size}" height="${Math.round(size * 1.24)}" role="img" aria-label="Kit: ${s.pattern} shirt">
    <defs><clipPath id="${id}"><path d="M30 6 L10 18 L2 40 L16 46 L20 34 L20 90 L80 90 L80 34 L84 46 L98 40 L90 18 L70 6 Q50 16 30 6 Z"/></clipPath></defs>
    <g clip-path="url(#${id})"><rect x="0" y="0" width="100" height="92" fill="${s.shirt}"/><g fill="${s.trim}">${bands.join('')}</g></g>
    <path d="M30 6 L10 18 L2 40 L16 46 L20 34 L20 90 L80 90 L80 34 L84 46 L98 40 L90 18 L70 6 Q50 16 30 6 Z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>
    <path d="M40 8 Q50 14 60 8" fill="none" stroke="${s.trim}" stroke-width="2.4"/>
    <path d="M22 92 L78 92 L76 112 L54 112 L50 102 L46 112 L24 112 Z" fill="${s.shorts}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
    <rect x="27" y="114" width="12" height="9" rx="2" fill="${s.socks}"/><rect x="61" y="114" width="12" height="9" rx="2" fill="${s.socks}"/>
  </svg>`;
}
