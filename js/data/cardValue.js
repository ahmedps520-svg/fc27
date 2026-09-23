/**
 * A card's market value, as a pure function (v80) — shared by the phone's
 * transfer market (which feeds it the live supply-and-demand price) and the
 * watch (which has no market of its own and shows the guide value from the
 * card's printed worth). Ten times what quick-selling the card pays.
 */
export function roundValue(v) {
  const x = Math.max(150, v);
  return x >= 10000 ? Math.round(x / 500) * 500 : x >= 1000 ? Math.round(x / 50) * 50 : Math.round(x / 10) * 10;
}
/** The value from a price in the economy's units (see economy.js `price`). */
export const valueFromPrice = (pr) => roundValue((pr || 0) / 2500);
/** The guide value with no market pressure either way. */
export const guideValue = (p) => (p ? valueFromPrice(Math.round((p.value || 0) / 1000) * 1000) : 0);
