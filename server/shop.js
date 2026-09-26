'use strict';
/**
 * v129 — test-mode purchases: price the order, keep a running (fake) store
 * balance, and email the store's inbox a receipt in the game's own look.
 *
 * Nothing about a card ever reaches this file. The client sends a bundle id,
 * its order reference and the club's name; the price comes from BUNDLES here.
 *
 * Mail goes through Resend's HTTP API when RESEND_API_KEY is set (MAIL_FROM
 * must be an address on a domain verified there). Without a key each email is
 * written to <data>/outbox/<ref>.html instead, so the design can be opened in
 * a browser and nothing is lost while the key is not configured.
 */
const fs = require('fs');
const path = require('path');

const STORE_INBOX = 'support@apexxi.online';

// keep in step with js/data/shop.js (tests/unit/shop.test.mjs checks)
const BUNDLES = [
  { id: 'ult-20', ultimate: 20, bonus: 0, cents: 199 },
  { id: 'ult-50', ultimate: 50, bonus: 5, cents: 499 },
  { id: 'ult-110', ultimate: 100, bonus: 10, cents: 999 },
  { id: 'ult-240', ultimate: 200, bonus: 40, cents: 1999 },
  { id: 'ult-650', ultimate: 500, bonus: 150, cents: 4999 },
];
const bundleById = (id) => BUNDLES.find((b) => b.id === id) || null;
const usd = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------------------- the test ledger ---------------------------- */
function ledgerFile(dataDir) { return path.join(dataDir, 'store-ledger.json'); }

/** Add a sale to the running test balance; returns the balance after it. */
function recordSale(dataDir, cents) {
  const file = ledgerFile(dataDir);
  let l = { cents: 0, count: 0 };
  try { l = { ...l, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch { /* first sale */ }
  l.cents += cents; l.count += 1; l.at = new Date().toISOString();
  try { fs.mkdirSync(dataDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(l)); } catch (e) { console.warn('[shop] ledger not written:', e.message); }
  return { cents: l.cents, count: l.count };
}

/* ------------------------------- the email ------------------------------- */
/**
 * The receipt. Tables and inline styles only — that is all mail clients
 * render reliably — in the game's colours: near-black, the APEX green, the
 * Ultimate violet for the currency.
 */
function purchaseEmail({ bundle, ref, club, player, balance, at = new Date() }) {
  const got = bundle.ultimate + bundle.bonus;
  const when = at.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const subject = `New purchase ${usd(bundle.cents)} · ${got} Ultimate · ${ref}`;
  const row = (k, v) => `<tr><td style="padding:10px 0;border-bottom:1px solid #1b2230;color:#8b95a7;font-size:13px">${k}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #1b2230;color:#f2f5fa;font-size:14px;font-weight:600">${v}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#05070e;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070e;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="padding:0 4px 18px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td width="34" height="34" style="width:34px;height:34px;border-radius:50%;border:3px solid #23c55e;text-align:center;vertical-align:middle;line-height:34px;color:#fff;font-weight:900;font-style:italic;font-size:18px">A</td>
      <td style="padding-left:12px;color:#fff;font-weight:900;font-style:italic;letter-spacing:3px;font-size:18px">APEX <span style="color:#23c55e">XI</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="background:linear-gradient(135deg,#0f9e56,#23c55e);background-color:#15b05a;border-radius:16px 16px 0 0;padding:26px 26px 22px">
    <div style="color:#d9ffe8;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700">Store · new order</div>
    <div style="color:#fff;font-size:26px;font-weight:900;margin-top:6px">You just got a purchase</div>
    <div style="color:#fff;font-size:44px;font-weight:900;margin-top:10px;letter-spacing:-1px">+${usd(bundle.cents)}</div>
  </td></tr>
  <tr><td style="background:#0c111b;border:1px solid #1b2230;border-top:0;border-radius:0 0 16px 16px;padding:22px 26px 8px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141026;border:1px solid #3a2d63;border-radius:12px;margin-bottom:14px"><tr>
      <td style="padding:14px 16px;color:#b892ff;font-size:28px;font-weight:900">✦ ${got}</td>
      <td align="right" style="padding:14px 16px;color:#cbbcf5;font-size:13px">${bundle.ultimate} Ultimate${bundle.bonus ? `<br><span style="color:#23c55e;font-weight:700">+${bundle.bonus} bonus</span>` : ''}</td>
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Order', esc(ref))}
      ${row('Player', esc(player || 'Guest (not signed in)'))}
      ${row('Club', esc(club || '—'))}
      ${row('Time', when)}
      ${row('Payment', 'Test card · no charge')}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 18px;background:#08140e;border:1px solid #174d31;border-radius:12px"><tr>
      <td style="padding:16px">
        <div style="color:#7fdca4;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700">Store balance</div>
        <div style="color:#fff;font-size:30px;font-weight:900;margin-top:4px">${usd(balance.cents)}</div>
        <div style="color:#8b95a7;font-size:12px;margin-top:4px">${balance.count.toLocaleString('en-US')} purchase${balance.count === 1 ? '' : 's'} · up ${usd(bundle.cents)} with this one</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 6px;color:#5d6778;font-size:11px;line-height:1.6;text-align:center">
    TEST MODE — no card was charged and no money moved. The balance above is a running total of test orders, not real revenue.<br>APEX XI · sent to ${STORE_INBOX}
  </td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    'APEX XI — you just got a purchase',
    `+${usd(bundle.cents)}  ·  ${got} Ultimate (${bundle.ultimate}${bundle.bonus ? ` + ${bundle.bonus} bonus` : ''})`,
    `Order: ${ref}`, `Player: ${player || 'Guest'}`, `Club: ${club || '—'}`, `Time: ${when}`, 'Payment: test card, no charge',
    '', `Store balance: ${usd(balance.cents)} (${balance.count} purchases)`,
    '', 'TEST MODE — no money moved; the balance is a running total of test orders.',
  ].join('\n');
  return { subject, html, text };
}

/* ------------------------------- sending --------------------------------- */
async function sendMail({ subject, html, text, ref }, { dataDir, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  if (env.RESEND_API_KEY) {
    const res = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM || 'APEX XI Store <store@apexxi.online>', to: [env.STORE_INBOX || STORE_INBOX], subject, html, text }),
    });
    if (!res.ok) throw new Error(`mail provider ${res.status}`);
    return { via: 'resend' };
  }
  const dir = path.join(dataDir, 'outbox');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${String(ref).replace(/[^\w-]/g, '')}.html`);
  fs.writeFileSync(file, html);
  return { via: 'outbox', file };
}

const REF_RE = /^AX-[A-Z2-9]{8}$/;

module.exports = { BUNDLES, bundleById, purchaseEmail, recordSale, sendMail, usd, REF_RE, STORE_INBOX };
