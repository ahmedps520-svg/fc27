/**
 * v205: Store → Shop in the App Store app — the Starter Pack, Ultimate ✦ and
 * Apex ◈ bundles and the Season Pass, at the prices the player's own App
 * Store shows (iap.js loadProducts), bought through Apple's sheet (Face ID).
 * The website shows its test-mode ✦ shop instead (squad.js ultimateShopView).
 */
import { getState } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { sfx } from '../audio.js';
import { haptic } from '../native.js';
import { tx } from '../i18n.js';
import { about } from '../components/facts.js';
import { PRODUCTS, PASS_SEASON, loadProducts, priceOf, buy, restore } from '../iap.js';

let loaded = false;            // prices fetched once per visit to the tab
let reachable = true;

const fmt = (n) => Math.round(n).toLocaleString();
const priceBtn = (p, cls = 'iap-price') => {
  const pr = priceOf(p);
  return `<span class="${cls}">${pr || (reachable ? '…' : '—')}</span>`;
};

function bundle(p, i, gem) {
  const amount = p.grant.ultimate || p.grant.apex;
  return `<button class="ult-b iap-b tier-${i} ${gem === '◈' ? 'iap-apex' : ''}" data-iap="${p.id}" ${priceOf(p) ? '' : 'disabled'}>
    ${p.tag ? `<i class="ult-tag">${tx(p.tag)}</i>` : ''}
    <span class="ult-stack">${`<em>${gem}</em>`.repeat(Math.min(5, i + 1))}</span>
    <strong>${fmt(amount)}</strong>
    <small>${p.bonus ? `${fmt(amount - p.bonus)} + <b>${p.bonus} ${tx('bonus')}</b>` : gem === '◈' ? tx('Apex') : tx('Ultimate')}</small>
    ${priceBtn(p, 'ult-price')}
  </button>`;
}

export function iapShopView() {
  const s = getState();
  const starter = PRODUCTS.find((p) => p.id === 'starter');
  const pass = PRODUCTS.find((p) => p.id === `pass.${PASS_SEASON}`);
  const hasPass = !!s.club.pass?.[PASS_SEASON];
  return `<section class="ult-shop iap-shop">
    ${reachable ? '' : `<p class="iap-off">${tx('The shop cannot reach the App Store right now. Try again in a moment.')}</p>`}
    ${s.club.starterBought ? '' : `
    <button class="panel glass iap-offer" data-iap="starter" ${priceOf(starter) ? '' : 'disabled'}>
      <span class="iap-offer-k">${tx('One time only')}</span>
      <b>${tx('Starter Pack')}</b>
      <span class="iap-offer-items"><i>✦ 20</i><i>${tx('Prime pack')}</i><i>◈ 10,000</i></span>
      ${priceBtn(starter)}
    </button>`}
    <button class="panel glass iap-offer iap-pass ${hasPass ? 'owned' : ''}" data-iap="${pass.id}" ${hasPass || !priceOf(pass) ? 'disabled' : ''}>
      <span class="iap-offer-k">${tx('Season 2')}</span>
      <b>${tx('Season Pass')}</b>
      <span class="iap-offer-items"><i>${tx('A second reward on all 30 tiers')}</i><i>✦ 103</i><i>${tx('6 Prime packs')}</i><i>${tx('Legends Vault')}</i><i>${tx('The Crown celebration')}</i></span>
      ${hasPass ? `<span class="iap-price owned">✓ ${tx('Active')}</span>` : priceBtn(pass)}
    </button>
    <h3 class="sty-kind">✦ ${tx('Ultimate')} ${about(tx('Ultimate buys Icons and Style items. It never buys a pack.'))}</h3>
    <div class="ult-grid">${PRODUCTS.filter((p) => p.shelf === 'ultimate').map((p, i) => bundle(p, i, '✦')).join('')}</div>
    <h3 class="sty-kind">◈ ${tx('Apex')} ${about(tx('Apex buys packs. Every pack shows its odds behind its ⓘ before you buy.'))}</h3>
    <div class="ult-grid">${PRODUCTS.filter((p) => p.shelf === 'apex').map((p, i) => bundle(p, i, '◈')).join('')}</div>
    <footer class="iap-foot">
      <button class="btn ghost sm" id="iapRestore">${tx('Restore purchases')}</button>
      <small>${tx('Paid with your Apple ID. Everything here can also be earned by playing.')}</small>
    </footer>
  </section>`;
}

export function mountIapShop(root) {
  if (!loaded) {
    loaded = true;
    loadProducts().then((r) => { reachable = !!r && Object.keys(r).length > 0; navigate('squad'); });
  }
  root.querySelector('.iap-shop')?.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-iap]');
    if (!b || b.disabled) return;
    const product = PRODUCTS.find((p) => p.id === b.dataset.iap);
    if (!product) return;
    b.disabled = true;
    const r = await buy(product);
    if (r.ok) {
      sfx('confirm'); haptic('reveal'); refreshCoins();
      toast(`${tx(product.name)} — ${tx('yours')}`, 'good');
      navigate('squad');
    } else if (r.pending) {
      toast(tx('Waiting for approval — it arrives as soon as it is approved'), 'info');
      b.disabled = false;
    } else if (!r.cancelled) {
      toast(r.error || tx('The purchase did not go through.'), 'warn');
      b.disabled = false;
    } else b.disabled = false;
  });
  root.querySelector('#iapRestore')?.addEventListener('click', async (e) => {
    e.currentTarget.disabled = true;
    const r = await restore();
    toast(r.error ? r.error : r.pass ? tx('Season Pass restored') : tx('Nothing to restore'), r.error ? 'warn' : 'good');
    navigate('squad');
  });
}

/** Leaving the tab: fetch prices again next time (a player who signed into the App Store meanwhile). */
export function resetIapShop() { loaded = false; }
