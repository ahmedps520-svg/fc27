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
 * render reliably. v131: the game's own look. The swoosh, the ladder and the
 * lit rules are pictures from assets/email (tools/email/art.mjs), because no
 * mail client draws a glowing SVG line; the glow on the type and the panels is
 * text-shadow and box-shadow, which Apple Mail shows and the rest ignore.
 */
const ART_VERSION = '131';
function purchaseEmail({ bundle, ref, club, player, balance, at = new Date(), origin = process.env.PUBLIC_ORIGIN || 'https://fc27.onrender.com' }) {
  const got = bundle.ultimate + bundle.bonus;
  const when = at.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const subject = `New purchase ${usd(bundle.cents)} · ${got} Ultimate · ${ref}`;
  const art = (f) => `${origin}/assets/email/${f}?v=${ART_VERSION}`;
  const NUM = "font-family:Bahnschrift,'DIN Alternate',Oswald,'Arial Narrow','Helvetica Neue',Arial,sans-serif";
  const G = '#23c55e';
  const rule = `<tr><td style="padding:0;line-height:0;font-size:0"><img src="${art('divider.png')}" width="560" height="14" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0"></td></tr>`;
  const row = (k, v) => `<tr><td style="padding:11px 0;border-bottom:1px solid #182131;color:#7d889c;font-size:12px;letter-spacing:1.6px;text-transform:uppercase">${k}</td><td align="right" style="padding:11px 0;border-bottom:1px solid #182131;color:#f2f5fa;font-size:14px;font-weight:600">${v}</td></tr>`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#05070e;font-family:Inter,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">+${usd(bundle.cents)} · ${got} Ultimate · ${esc(ref)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070e;padding:24px 10px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0c111b;border:1px solid #1b2536;border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px rgba(35,197,94,.12),0 0 40px rgba(35,197,94,.14)">
  <tr><td style="padding:0;line-height:0;font-size:0"><img src="${art('header.jpg')}" width="560" height="170" alt="APEX XI · Store · new order" style="display:block;width:100%;max-width:560px;height:auto;border:0;color:${G};font-size:14px"></td></tr>
  <tr><td style="padding:22px 26px 20px;border-left:3px solid ${G}">
    <div style="${NUM};color:#f6f9ff;font-size:28px;font-weight:800;font-style:italic;letter-spacing:-.5px;line-height:1.05">You just got a purchase</div>
    <div style="${NUM};color:${G};font-size:58px;font-weight:800;font-style:italic;letter-spacing:-2px;line-height:1;margin-top:10px;text-shadow:0 0 18px rgba(35,197,94,.65),0 0 2px rgba(35,197,94,.9)">+${usd(bundle.cents)}</div>
  </td></tr>
  <tr><td style="padding:0 26px 18px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#110d22;border:1px solid #4a3a82;border-left:3px solid #b892ff;border-radius:10px;box-shadow:0 0 22px rgba(184,146,255,.22)"><tr>
      <td style="padding:14px 16px;${NUM};color:#c9b0ff;font-size:30px;font-weight:800;font-style:italic;text-shadow:0 0 14px rgba(184,146,255,.7)">&#10022; ${got}</td>
      <td align="right" style="padding:14px 16px;color:#cbbcf5;font-size:12px;letter-spacing:1.4px;text-transform:uppercase">${bundle.ultimate} Ultimate${bundle.bonus ? `<br><span style="color:${G};font-weight:700">+${bundle.bonus} bonus</span>` : ''}</td>
    </tr></table>
  </td></tr>
  ${rule}
  <tr><td style="padding:8px 26px 6px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Order', `<span style="${NUM};letter-spacing:1px">${esc(ref)}</span>`)}
      ${row('Player', esc(player || 'Guest (not signed in)'))}
      ${row('Club', esc(club || '—'))}
      ${row('Time', when)}
      ${row('Payment', 'Test card · no charge')}
    </table>
  </td></tr>
  <tr><td style="padding:14px 26px 22px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#06150d;border:1px solid ${G};border-radius:10px;box-shadow:0 0 0 1px rgba(35,197,94,.25),0 0 26px rgba(35,197,94,.3),inset 0 0 18px rgba(35,197,94,.12)"><tr>
      <td style="padding:16px 18px">
        <div style="${NUM};color:${G};font-size:11px;letter-spacing:3.4px;text-transform:uppercase;font-weight:700">Store balance</div>
        <div style="${NUM};color:#ffffff;font-size:36px;font-weight:800;font-style:italic;letter-spacing:-1px;margin-top:4px;text-shadow:0 0 16px rgba(35,197,94,.45)">${usd(balance.cents)}</div>
        <div style="color:#8b95a7;font-size:12px;margin-top:4px">${balance.count.toLocaleString('en-US')} purchase${balance.count === 1 ? '' : 's'} · <span style="color:${G};font-weight:700">&#9650; ${usd(bundle.cents)}</span> with this one</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:0;line-height:0;font-size:0"><img src="${art('footer.png')}" width="560" height="60" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0"></td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px"><tr><td style="padding:16px 8px;color:#5d6778;font-size:11px;line-height:1.6;text-align:center">
  TEST MODE — no card was charged and no money moved. The balance above is a running total of test orders, not real revenue.<br>APEX XI · sent to ${STORE_INBOX}
</td></tr></table>
</td></tr></table></body></html>`;
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
    // Resend explains a refusal in the body (an unverified domain, a bad key): keep that, not just the code
    if (!res.ok) { let why = ''; try { why = (await res.json()).message || ''; } catch { /* no body */ } throw new Error(`Resend ${res.status}${why ? `: ${why}` : ''}`); }
    return { via: 'resend' };
  }
  const dir = path.join(dataDir, 'outbox');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${String(ref).replace(/[^\w-]/g, '')}.html`);
  fs.writeFileSync(file, html);
  return { via: 'outbox', file };
}

const REF_RE = /^AX-[A-Z2-9]{8}$/;

/** For /api/health: which way mail goes, never the key. */
const mailMode = (env = process.env) => (env.RESEND_API_KEY ? 'resend' : 'outbox');

module.exports = { mailMode, BUNDLES, bundleById, purchaseEmail, recordSale, sendMail, usd, REF_RE, STORE_INBOX };
