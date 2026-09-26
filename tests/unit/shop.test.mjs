/**
 * v129 — the test-mode Ultimate shop: card checks in the browser, the server's
 * own price table, and the receipt email to the store inbox.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { BUNDLES, TEST_CARD, TEST_MODE, luhn, cardBrand, formatCard, formatExp, checkCard, orderRef } from '../../js/data/shop.js';

const require = createRequire(import.meta.url);
const shop = require('../../server/shop.js');

test('the client and the server price the same bundles', () => {
  assert.deepEqual(BUNDLES.map(({ id, ultimate, bonus, cents }) => ({ id, ultimate, bonus, cents })), shop.BUNDLES);
  assert.equal(TEST_MODE, true, 'no payment provider yet: the shop stays in test mode');
});

test('card checks: Luhn, brand, formatting, expiry, CVV', () => {
  const june26 = new Date(Date.UTC(2026, 5, 15));
  assert.ok(luhn('4242 4242 4242 4242'));
  assert.ok(!luhn('4242 4242 4242 4241'));
  assert.equal(cardBrand('4242'), 'visa'); assert.equal(cardBrand('5555'), 'mastercard'); assert.equal(cardBrand('3782'), 'amex');
  assert.equal(formatCard('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formatCard('378282246310005'), '3782 822463 10005');
  assert.equal(formatExp('1234'), '12/34');
  assert.deepEqual(checkCard(TEST_CARD, june26), {}, 'the test card passes');
  const bad = checkCard({ number: '4242 4242 4242 4241', exp: '05/26', cvv: '12', name: '', postcode: '' }, june26);
  assert.deepEqual(Object.keys(bad).sort(), ['cvv', 'exp', 'name', 'number', 'postcode']);
  assert.equal(checkCard({ ...TEST_CARD, exp: '06/26' }, june26).exp, undefined, 'this month is still valid');
  assert.ok(checkCard({ ...TEST_CARD, number: '3782 822463 10005', cvv: '123' }, june26).cvv, 'Amex wants four');
  assert.match(orderRef(), shop.REF_RE);
});

test('the receipt: the game\'s look, the bundle, the running balance — and never a card', () => {
  const dir = mkdtempSync(join(tmpdir(), 'apex-shop-'));
  const bundle = shop.bundleById('ult-110');
  const b1 = shop.recordSale(dir, bundle.cents);
  const b2 = shop.recordSale(dir, bundle.cents);
  assert.deepEqual(b2, { cents: 1998, count: 2 });
  assert.deepEqual(b1, { cents: 999, count: 1 });
  const m = shop.purchaseEmail({ bundle, ref: 'AX-ABCDEF23', club: '<b>Red</b> Lions', player: 'ahmed', balance: b2, at: new Date('2026-09-26T15:00:00Z') });
  assert.match(m.subject, /\$9\.99.*110 Ultimate.*AX-ABCDEF23/);
  for (const s of ['You just got a purchase', '+$9.99', '$19.98', '2 purchases', 'TEST MODE', '#23c55e', 'APEX']) assert.ok(m.html.includes(s), s);
  assert.ok(m.html.includes('&lt;b&gt;Red&lt;/b&gt; Lions'), 'the club name is escaped');
  assert.ok(!/4242|cvv|expir/i.test(m.html + m.text), 'nothing about a card');
});

test('without a mail key the email lands in the outbox; with one it goes to the store inbox', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'apex-shop-'));
  const mail = { subject: 's', html: '<p>h</p>', text: 't', ref: 'AX-ABCDEF23' };
  const r = await shop.sendMail(mail, { dataDir: dir, env: {} });
  assert.equal(r.via, 'outbox'); assert.ok(existsSync(r.file)); assert.equal(readFileSync(r.file, 'utf8'), '<p>h</p>');
  let sent = null;
  const r2 = await shop.sendMail(mail, { dataDir: dir, env: { RESEND_API_KEY: 'k' }, fetchImpl: async (url, o) => { sent = { url, body: JSON.parse(o.body), auth: o.headers.Authorization }; return { ok: true }; } });
  assert.equal(r2.via, 'resend');
  assert.deepEqual(sent.body.to, ['support@apexxi.online']);
  assert.equal(sent.auth, 'Bearer k');
});

test('a refused send carries Resend\'s reason, and health says which way mail goes', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'apex-shop-'));
  const refuse = async () => ({ ok: false, status: 403, json: async () => ({ message: 'The apexxi.online domain is not verified.' }) });
  await assert.rejects(shop.sendMail({ subject: 's', html: 'h', text: 't', ref: 'AX-ABCDEF23' }, { dataDir: dir, env: { RESEND_API_KEY: 'k' }, fetchImpl: refuse }), /Resend 403: The apexxi\.online domain is not verified/);
  assert.equal(shop.mailMode({}), 'outbox');
  assert.equal(shop.mailMode({ RESEND_API_KEY: 'k' }), 'resend');
});
