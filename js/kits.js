/**
 * Kit clash detection that colour-blind players can trust.
 *
 * Two kits are "different enough" only if they stay apart when seen through
 * the three common forms of colour vision deficiency as well as normal
 * vision — red against green is the classic clash that looks fine to most
 * of the room and identical to a deutan. The simulation is the standard
 * linear approximation (Machado-style matrices), which is plenty for a
 * threshold decision.
 */
const CVD = {
  deutan: [[0.367, 0.861, -0.228], [0.280, 0.673, 0.047], [-0.012, 0.043, 0.969]],
  protan: [[0.152, 1.053, -0.205], [0.115, 0.786, 0.099], [-0.004, -0.048, 1.052]],
  tritan: [[1.256, -0.077, -0.179], [-0.078, 0.931, 0.147], [0.005, 0.691, 0.304]],
};

export const hexToRgb = (hex) => {
  const h = String(hex).replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const clamp = (v) => Math.max(0, Math.min(255, v));
export function simulate(rgb, type) {
  const m = CVD[type];
  if (!m) return rgb;
  return m.map((row) => clamp(row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2]));
}

/** Perceptual-ish distance: weighted RGB, 0..~765. */
export function distance(a, b) {
  const rm = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0]; const dg = a[1] - b[1]; const db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}
const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

/**
 * Do two kit colours clash for a viewer with `vision` ('normal' | 'deutan' |
 * 'protan' | 'tritan' | 'all')? 'all' is the strict test used to choose kits:
 * they must be apart in every kind of vision.
 */
export function clash(hexA, hexB, vision = 'all') {
  const a = hexToRgb(hexA); const b = hexToRgb(hexB);
  const types = vision === 'all' ? ['normal', 'deutan', 'protan', 'tritan'] : [vision];
  for (const t of types) {
    const sa = t === 'normal' ? a : simulate(a, t);
    const sb = t === 'normal' ? b : simulate(b, t);
    // colour distance OR a clear brightness gap is enough
    if (distance(sa, sb) < 150 && Math.abs(luma(sa) - luma(sb)) < 70) return true;
  }
  return false;
}

/**
 * Pick the away side's shirt: its first colour, then its second, then the
 * neutral change strips — the first that does not clash with the home shirt
 * for the given vision. `vision` 'all' when the player has turned on
 * colour-safe kits, which then also guards the keeper's yellow.
 */
export function pickAwayHex(homeHex, awayColors, vision = 'normal') {
  const tryCols = [...(awayColors || []), '#f2f4f8', '#1b1d24', '#ffd23f', '#00c2ff'];
  for (const c of tryCols) if (c && !clash(homeHex, c, vision)) return c;
  return '#f2f4f8';
}
