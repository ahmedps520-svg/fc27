/** Procedural club crests — a geometric shape plus the club's two-colour palette. */
const SHAPES = {
  shield: 'M50 4 L92 20 V52 C92 76 72 92 50 98 C28 92 8 76 8 52 V20 Z',
  circle: 'M50 5 A45 45 0 1 1 49.9 5 Z',
  hex: 'M50 4 L90 27 V73 L50 96 L10 73 V27 Z',
  diamond: 'M50 3 L97 50 L50 97 L3 50 Z',
  chevron: 'M50 4 L94 24 L94 58 L50 96 L6 58 L6 24 Z',
  triangle: 'M50 6 L95 88 L5 88 Z',
};

/**
 * @param {{shape:string, colors:[string,string]}} crest
 * @param {string} short 3-letter club code
 */
export function crestSVG(crest, short, size = 40) {
  const [a, b] = crest.colors;
  const uid = `cr${Math.random().toString(36).slice(2, 8)}`;
  const path = SHAPES[crest.shape] || SHAPES.shield;
  return `
    <svg class="crest" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
      <defs>
        <linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${a}"/>
          <stop offset="100%" stop-color="${b}"/>
        </linearGradient>
        <clipPath id="${uid}c"><path d="${path}"/></clipPath>
      </defs>
      <path d="${path}" fill="url(#${uid})" stroke="${a}" stroke-width="3"/>
      <g clip-path="url(#${uid}c)">
        <rect x="0" y="0" width="100" height="34" fill="${b}" opacity=".55"/>
        <rect x="0" y="62" width="100" height="38" fill="${a}" opacity=".35"/>
      </g>
      <text x="50" y="60" text-anchor="middle" font-size="30" font-weight="800"
            fill="#fff" style="letter-spacing:-1px">${short}</text>
    </svg>`;
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
