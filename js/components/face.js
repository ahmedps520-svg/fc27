/**
 * Procedural player portraits. Every face is generated from the player's id, so
 * it is stable across sessions and no two squads look alike.
 *
 * The cards name real footballers; these faces are **not** them. Nothing here is
 * derived from a photograph of anyone, and no attempt is made to resemble the
 * person on the card — the seed is the card id, not the name. Keep it that way:
 * a drawn face that chased a likeness would be a portrait of a real person, and
 * that is a different thing to ship entirely.
 */
const SKINS = ['#f6d5b8', '#e9bd95', '#d5a072', '#b57a4d', '#8c5733', '#5f3a22'];
const HAIRS = ['#1b1512', '#2e2019', '#4a3122', '#6d4a26', '#8d6a35', '#c79a54', '#d9d2c8', '#101010'];
const EYES = ['#3d2b1f', '#4a3728', '#2f4858', '#3b5d50', '#5a4632'];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic look for a player — also used to keep the 3D model in step. */
export function faceOf(player) {
  const h = hash(player.id || player.name || 'x');
  const pick = (arr, shift) => arr[(h >> shift) % arr.length];
  return {
    skin: pick(SKINS, 0),
    hair: pick(HAIRS, 4),
    eye: pick(EYES, 8),
    style: (h >> 11) % 6,          // hair silhouette
    beard: ((h >> 14) % 5) === 0,
    brow: 0.9 + ((h >> 17) % 5) * 0.06,
    jaw: 0.92 + ((h >> 20) % 6) * 0.035,
    ears: ((h >> 23) % 4) !== 0,
  };
}

/**
 * Head-and-shoulders portrait as inline SVG.
 * @param {object} player
 * @param {number} size px
 * @param {string} kit shirt colour behind the shoulders
 */
export function faceSVG(player, size = 64, kit = '#243049') {
  const f = faceOf(player);
  const id = `f${hash(player.id || player.name)}`.slice(0, 10);
  const jaw = f.jaw;

  // hair silhouettes, drawn over the crown
  const hair = [
    `<path d="M18 30 Q18 12 32 12 Q46 12 46 30 Q46 22 32 21 Q18 22 18 30 Z" fill="${f.hair}"/>`,
    `<path d="M17 32 Q16 11 32 11 Q48 11 47 32 Q44 18 32 18 Q20 18 17 32 Z" fill="${f.hair}"/>
     <path d="M17 30 Q22 24 26 27 L20 34 Z" fill="${f.hair}"/>`,
    `<path d="M18 28 Q20 10 32 10 Q44 10 46 28 Q40 16 32 16 Q24 16 18 28 Z" fill="${f.hair}"/>
     <ellipse cx="32" cy="13" rx="13" ry="6" fill="${f.hair}"/>`,
    `<path d="M19 31 Q19 13 32 13 Q45 13 45 31 Q45 20 32 20 Q19 20 19 31 Z" fill="${f.hair}"/>
     <path d="M19 28 Q14 34 16 40 Q19 34 20 30 Z" fill="${f.hair}"/>
     <path d="M45 28 Q50 34 48 40 Q45 34 44 30 Z" fill="${f.hair}"/>`,
    `<path d="M20 27 Q22 14 32 14 Q42 14 44 27 Q38 19 32 19 Q26 19 20 27 Z" fill="${f.hair}"/>`,
    `<path d="M18 31 Q17 10 32 10 Q47 10 46 31 Q46 17 32 17 Q18 17 18 31 Z" fill="${f.hair}"/>
     <circle cx="21" cy="16" r="5" fill="${f.hair}"/><circle cx="43" cy="16" r="5" fill="${f.hair}"/>
     <circle cx="32" cy="9" r="6" fill="${f.hair}"/>`,
  ][f.style];

  return `
<svg class="face" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">
  <defs>
    <clipPath id="${id}c"><rect x="0" y="0" width="64" height="64" rx="8"/></clipPath>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,.10)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,.35)"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#${id}c)">
    <rect width="64" height="64" fill="url(#${id}b)"/>
    <!-- shoulders -->
    <path d="M6 64 Q10 48 22 45 L32 50 L42 45 Q54 48 58 64 Z" fill="${kit}"/>
    <path d="M26 44 h12 v8 q-6 4 -12 0 Z" fill="${f.skin}"/>
    <!-- head -->
    ${f.ears ? `<ellipse cx="${32 - 12 * jaw}" cy="33" rx="2.4" ry="3.4" fill="${f.skin}"/>
                <ellipse cx="${32 + 12 * jaw}" cy="33" rx="2.4" ry="3.4" fill="${f.skin}"/>` : ''}
    <path d="M${32 - 12 * jaw} 26 Q${32 - 12 * jaw} 44 32 46 Q${32 + 12 * jaw} 44 ${32 + 12 * jaw} 26 Q${32 + 12 * jaw} 14 32 14 Q${32 - 12 * jaw} 14 ${32 - 12 * jaw} 26 Z" fill="${f.skin}"/>
    ${f.beard ? `<path d="M21 33 Q22 45 32 47 Q42 45 43 33 Q40 42 32 43 Q24 42 21 33 Z" fill="${f.hair}" opacity=".82"/>` : ''}
    <!-- features -->
    <ellipse cx="26.5" cy="31" rx="2.1" ry="1.9" fill="#fff"/>
    <ellipse cx="37.5" cy="31" rx="2.1" ry="1.9" fill="#fff"/>
    <circle cx="26.7" cy="31.2" r="1.15" fill="${f.eye}"/>
    <circle cx="37.3" cy="31.2" r="1.15" fill="${f.eye}"/>
    <rect x="23.4" y="${27.4 * f.brow}" width="6.2" height="1.5" rx=".7" fill="${f.hair}"/>
    <rect x="34.4" y="${27.4 * f.brow}" width="6.2" height="1.5" rx=".7" fill="${f.hair}"/>
    <path d="M32 33 v4 q-1.6 .6 -2.6 .2" stroke="rgba(0,0,0,.25)" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M28.6 40.6 Q32 42.6 35.4 40.6" stroke="rgba(90,40,30,.6)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    ${hair}
  </g>
</svg>`;
}
