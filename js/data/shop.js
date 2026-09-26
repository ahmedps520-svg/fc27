/**
 * v129 — the Ultimate shop: premium-currency bundles bought with a card.
 *
 * TEST MODE. There is no payment provider behind this yet. The checkout is
 * the real shape of one (card number, expiry, CVV, name, postcode), but:
 *   - nothing typed into the card fields leaves the page — they are checked
 *     here, in the browser, and cleared the moment the order goes through;
 *   - no money moves, and the in-game Ultimate balance does not change
 *     (the owner's call: show the flow, grant nothing);
 *   - each order is reported to the server (`/api/purchase`) with only the
 *     bundle id, a reference and the club's name, and the server emails the
 *     store's inbox a receipt with a running test balance.
 *
 * `server/shop.js` keeps its own copy of BUNDLES — the server prices an order
 * from its table, never from what a client sends — and a unit test holds the
 * two together.
 */

export const TEST_MODE = true;

/** A card number that passes every check, for the "use a test card" button. */
export const TEST_CARD = { number: '4242 4242 4242 4242', exp: '12/34', cvv: '123', name: 'Test Player', postcode: '11564' };

/** id, Ultimate in the bundle, bonus on top, price in US cents, shelf tag. */
export const BUNDLES = [
  { id: 'ult-20', ultimate: 20, bonus: 0, cents: 199, tag: '' },
  { id: 'ult-50', ultimate: 50, bonus: 5, cents: 499, tag: '' },
  { id: 'ult-110', ultimate: 100, bonus: 10, cents: 999, tag: 'Popular' },
  { id: 'ult-240', ultimate: 200, bonus: 40, cents: 1999, tag: '' },
  { id: 'ult-650', ultimate: 500, bonus: 150, cents: 4999, tag: 'Best value' },
];
export const bundleById = (id) => BUNDLES.find((b) => b.id === id) || null;
export const price = (cents) => `$${(cents / 100).toFixed(2)}`;

export const digits = (s) => String(s || '').replace(/\D/g, '');

/** The Luhn checksum every card number carries. */
export function luhn(num) {
  const d = digits(num);
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

/** Brand from the leading digits — what the field shows as you type. */
export function cardBrand(num) {
  const d = digits(num);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(d)) return 'discover';
  if (/^9/.test(d)) return 'mada';
  return '';
}

/** 4-4-4-4 as you type (Amex: 4-6-5). */
export function formatCard(num) {
  const d = digits(num).slice(0, 19);
  if (cardBrand(d) === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  return d.replace(/(.{4})/g, '$1 ').trim();
}

/** MM/YY as you type. */
export function formatExp(v) {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

/**
 * Every field checked, as the error to show under each (empty object = fine).
 * `now` is a Date, so a test can pin the month.
 */
export function checkCard(f, now = new Date()) {
  const e = {};
  const brand = cardBrand(f.number);
  const len = digits(f.number).length;
  if (!len) e.number = 'Enter the card number';
  else if (len < 13 || len > 19 || !luhn(f.number)) e.number = 'That card number is not valid';
  const m = /^(\d{2})\/(\d{2})$/.exec(String(f.exp || '').trim());
  if (!m) e.exp = 'MM/YY';
  else {
    const mo = +m[1]; const yr = 2000 + +m[2];
    const cur = now.getFullYear() * 12 + now.getMonth();
    if (mo < 1 || mo > 12) e.exp = 'MM/YY';
    else if (yr * 12 + (mo - 1) < cur) e.exp = 'This card has expired';
  }
  const cv = digits(f.cvv);
  if (cv.length !== (brand === 'amex' ? 4 : 3)) e.cvv = brand === 'amex' ? '4 digits' : '3 digits';
  if (String(f.name || '').trim().length < 2) e.name = 'Name on the card';
  if (!String(f.postcode || '').trim()) e.postcode = 'Postcode';
  return e;
}

/** An order reference: short, readable, unguessable enough for a receipt. */
export function orderRef(rand = Math.random) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'AX-';
  for (let i = 0; i < 8; i++) s += A[Math.floor(rand() * A.length)];
  return s;
}
