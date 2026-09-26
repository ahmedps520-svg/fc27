/**
 * v129 — the checkout sheet for an Ultimate bundle.
 *
 * TEST MODE (see js/data/shop.js): a real checkout's fields, checked in the
 * browser and never sent anywhere. The inputs carry no `name` and ask the
 * browser not to autofill, so a saved real card is not offered into them;
 * the banner says plainly that nothing is charged. On "Pay" the fields are
 * blanked, the server is told the bundle and the reference (it emails the
 * store a receipt), and the sheet shows the receipt. The balance is not
 * changed — the owner's call while this is a placeholder.
 */
import { getState } from '../state.js';
import { TEST_MODE, TEST_CARD, price, cardBrand, formatCard, formatExp, checkCard, orderRef, digits } from '../data/shop.js';
import { reportPurchase, isSignedIn } from '../net/api.js';

const BRAND = { visa: 'VISA', mastercard: 'Mastercard', amex: 'AMEX', discover: 'Discover', mada: 'mada' };

/** What happened to the store's email, in words (v130: a refused send says why). */
function receiptLine(mail) {
  if (mail === 'resend') return 'Emailed to the store';
  if (mail === 'outbox') return 'Saved on the server (no mail key)';
  if (mail === 'pending') return 'Sending…';
  if (mail === 'offline') return 'Not sent (offline)';
  if (mail === 'signedout') return 'Not sent — sign in to send it';
  if (mail === 'limited') return 'Not sent — three an hour';
  if (mail === 'duplicate') return 'Already sent';
  return `Not emailed — ${String(mail).replace(/^failed: /, '').replace(/[<>&]/g, '')}`;
}

export function openCheckout(bundle, { onDone } = {}) {
  document.getElementById('checkoutOverlay')?.remove();
  const got = bundle.ultimate + bundle.bonus;
  const el = document.createElement('div');
  el.id = 'checkoutOverlay';
  el.className = 'co-layer';
  el.innerHTML = `
    <form class="co-sheet" novalidate autocomplete="off" role="dialog" aria-modal="true" aria-labelledby="coTitle">
      <button type="button" class="co-x" data-co-close aria-label="Close">✕</button>
      ${TEST_MODE ? '<p class="co-test"><b>TEST MODE</b> No real charge. Do not enter a real card — use the test card.</p>' : ''}
      ${isSignedIn() ? '' : '<p class="co-test co-signin">Sign in (Ultimate XI → Online) to send the store a receipt. You can still try the checkout.</p>'}
      <header class="co-head">
        <span class="co-gem">✦</span>
        <div><h2 id="coTitle">${got} Ultimate</h2><p>${bundle.ultimate}${bundle.bonus ? ` + <b>${bundle.bonus} bonus</b>` : ''}</p></div>
        <strong class="co-total">${price(bundle.cents)}</strong>
      </header>
      <div class="co-card" aria-hidden="true">
        <i class="co-chip"></i><em class="co-brand" id="coBrand"></em>
        <span class="co-num" id="coNumView">•••• •••• •••• ••••</span>
        <span class="co-meta"><span id="coNameView">NAME ON CARD</span><span id="coExpView">MM/YY</span></span>
      </div>
      <label class="co-f co-wide"><span>Card number</span><input id="coNumber" inputmode="numeric" autocomplete="off" placeholder="1234 1234 1234 1234" maxlength="23"><small data-err="number"></small></label>
      <label class="co-f"><span>Expiry</span><input id="coExp" inputmode="numeric" autocomplete="off" placeholder="MM/YY" maxlength="5"><small data-err="exp"></small></label>
      <label class="co-f"><span>CVV</span><input id="coCvv" inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4" type="password"><small data-err="cvv"></small></label>
      <label class="co-f co-wide"><span>Name on card</span><input id="coName" autocomplete="off" placeholder="Full name" maxlength="40"><small data-err="name"></small></label>
      <label class="co-f"><span>Country</span><select id="coCountry"><option>Saudi Arabia</option><option>United Arab Emirates</option><option>United Kingdom</option><option>United States</option><option>Other</option></select></label>
      <label class="co-f"><span>Postcode</span><input id="coPost" autocomplete="off" placeholder="11564" maxlength="10"><small data-err="postcode"></small></label>
      ${TEST_MODE ? '<button type="button" class="btn ghost co-wide co-fill" data-co-fill>Use the test card</button>' : ''}
      <button type="submit" class="btn primary co-wide co-pay">Pay ${price(bundle.cents)}</button>
      <p class="co-fine co-wide">🔒 Card details are checked on this device and never sent or stored.</p>
    </form>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));

  const $ = (id) => el.querySelector(id);
  const f = { number: $('#coNumber'), exp: $('#coExp'), cvv: $('#coCvv'), name: $('#coName'), postcode: $('#coPost') };
  const view = () => {
    const b = cardBrand(f.number.value);
    $('#coBrand').textContent = BRAND[b] || '';
    el.querySelector('.co-card').dataset.brand = b;
    const typed = formatCard(f.number.value);
    $('#coNumView').textContent = typed + '•••• •••• •••• ••••'.slice(typed.length);
    $('#coNameView').textContent = f.name.value.trim().toUpperCase() || 'NAME ON CARD';
    $('#coExpView').textContent = f.exp.value || 'MM/YY';
  };
  f.number.addEventListener('input', () => { f.number.value = formatCard(f.number.value); view(); });
  f.exp.addEventListener('input', () => { f.exp.value = formatExp(f.exp.value); view(); });
  f.cvv.addEventListener('input', () => { f.cvv.value = digits(f.cvv.value).slice(0, 4); });
  f.name.addEventListener('input', view);
  // an error goes the moment its field is touched again
  const clearErr = (k) => { const s = el.querySelector(`[data-err="${k}"]`); if (s) { s.textContent = ''; s.closest('.co-f').classList.remove('bad'); } };
  for (const [k, i] of Object.entries(f)) i.addEventListener('input', () => clearErr(k));

  const close = () => { el.classList.remove('in'); setTimeout(() => el.remove(), 180); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  el.addEventListener('click', (e) => {
    if (e.target === el || e.target.closest('[data-co-close]')) close();
    if (e.target.closest('[data-co-fill]')) {
      f.number.value = TEST_CARD.number; f.exp.value = TEST_CARD.exp; f.cvv.value = TEST_CARD.cvv;
      f.name.value = TEST_CARD.name; f.postcode.value = TEST_CARD.postcode; view(); Object.keys(f).forEach(clearErr);
    }
  });

  el.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const vals = Object.fromEntries(Object.entries(f).map(([k, i]) => [k, i.value]));
    const errs = checkCard(vals);
    el.querySelectorAll('[data-err]').forEach((s) => { s.textContent = errs[s.dataset.err] || ''; s.closest('.co-f').classList.toggle('bad', !!errs[s.dataset.err]); });
    if (Object.keys(errs).length) { el.querySelector('.co-f.bad input')?.focus(); return; }
    const last4 = digits(vals.number).slice(-4);
    const brand = BRAND[cardBrand(vals.number)] || 'Card';
    // the card leaves the DOM before anything else happens
    for (const i of Object.values(f)) i.value = '';
    const ref = orderRef();
    const sheet = el.querySelector('.co-sheet');
    sheet.classList.add('busy');
    sheet.innerHTML = '<div class="co-proc"><div class="sc-mark"><svg class="sc-ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/><circle cx="32" cy="32" r="28" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="52 176"/></svg><b>A</b></div><p>Processing…</p></div>';
    const club = getState().club.identity?.name || 'Ultimate XI';
    // v135: only a signed-in player's order reaches the server (and the store's inbox)
    const sent = !isSignedIn() ? Promise.resolve('signedout')
      : reportPurchase({ bundle: bundle.id, ref, club }).then((r) => r.mail || 'resend', (e) => (/sign in/i.test(e.message) ? 'signedout' : /try again later/i.test(e.message) ? 'limited' : 'offline'));
    const [ok] = await Promise.all([sent, new Promise((r) => setTimeout(r, 1400))]);
    sheet.classList.remove('busy');
    sheet.innerHTML = `
      <button type="button" class="co-x" data-co-close aria-label="Close">✕</button>
      <div class="co-done">
        <div class="co-tick">✓</div>
        <h2>Purchase complete</h2>
        <p class="co-big"><span class="co-gem">✦</span> ${got} Ultimate</p>
        <dl class="co-receipt">
          <dt>Order</dt><dd>${ref}</dd>
          <dt>Paid</dt><dd>${price(bundle.cents)} · ${brand} •••• ${last4}</dd>
          <dt>Receipt</dt><dd class="co-mail">${receiptLine(ok)}</dd>
        </dl>
        ${TEST_MODE ? '<p class="co-test"><b>TEST MODE</b> Nothing was charged, and your Ultimate balance has not changed.</p>' : ''}
        <button type="button" class="btn primary co-wide" data-co-close>Done</button>
      </div>`;
    onDone?.({ ref, ok });
  });
  setTimeout(() => f.number.focus(), 60);
  return el;
}
