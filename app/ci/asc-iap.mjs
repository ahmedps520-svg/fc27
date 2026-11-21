/**
 * v205: create (or bring up to date) the app's in-app purchases in App Store
 * Connect from app/store/iap.json — each product's type, reference name,
 * display name and description, its US price (Apple sets every other
 * country's), every territory, and the review screenshot App Review asks for.
 * Run by "iOS → In-app purchases"; safe to run again (it only fills in what is
 * missing or different).
 *
 *   KEY_ID=… ISSUER_ID=… KEY_PATH=… node app/ci/asc-iap.mjs --bundle online.apexxi.game
 *
 * Submitting them is the review run's job (asc.mjs): an app's first in-app
 * purchases go to App Review with an app version.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { api, get, maybe, describe, reporter } from './asc-api.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(HERE, '..', 'store');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BUNDLE = arg('--bundle', 'online.apexxi.game');
const CFG = JSON.parse(fs.readFileSync(path.join(STORE, 'iap.json'), 'utf8'));
const R = reporter();

/** Every page of a GET that pages with links.next. */
async function all(p) {
  const out = [];
  let next = p;
  while (next) {
    const r = await get(next);
    out.push(...(r.data || []));
    next = r.links?.next ? r.links.next.replace('https://api.appstoreconnect.apple.com', '') : null;
  }
  return out;
}

async function upsertProduct(app, existing, p) {
  const productId = CFG.prefix + p.id;
  let iap = existing.find((x) => x.attributes.productId === productId);
  if (!iap) {
    iap = (await api('POST', '/v2/inAppPurchases', { data: { type: 'inAppPurchases', attributes: { name: p.ref, productId, inAppPurchaseType: p.type, reviewNote: p.review, familySharable: false }, relationships: { app: { data: { type: 'apps', id: app.id } } } } })).data;
  } else if (iap.attributes.name !== p.ref || iap.attributes.reviewNote !== p.review) {
    iap = (await api('PATCH', `/v2/inAppPurchases/${iap.id}`, { data: { type: 'inAppPurchases', id: iap.id, attributes: { name: p.ref, reviewNote: p.review } } })).data;
  }
  const done = [];

  // display name and description
  const locs = (await get(`/v2/inAppPurchases/${iap.id}/inAppPurchaseLocalizations?limit=50`)).data;
  const loc = locs.find((l) => l.attributes.locale === CFG.locale);
  if (!loc) { await api('POST', '/v1/inAppPurchaseLocalizations', { data: { type: 'inAppPurchaseLocalizations', attributes: { locale: CFG.locale, name: p.name, description: p.description }, relationships: { inAppPurchaseV2: { data: { type: 'inAppPurchases', id: iap.id } } } } }); done.push('name'); }
  else if (loc.attributes.name !== p.name || loc.attributes.description !== p.description) { await api('PATCH', `/v1/inAppPurchaseLocalizations/${loc.id}`, { data: { type: 'inAppPurchaseLocalizations', id: loc.id, attributes: { name: p.name, description: p.description } } }); done.push('name'); }

  // the US price; every other country's follows it
  const sched = await maybe(`/v2/inAppPurchases/${iap.id}/iapPriceSchedule?include=manualPrices`);
  const hasPrice = (sched?.included || []).some((x) => x.type === 'inAppPurchasePrices');
  if (!hasPrice) {
    const points = await all(`/v2/inAppPurchases/${iap.id}/pricePoints?filter[territory]=USA&limit=200`);
    const point = points.find((x) => Number(x.attributes.customerPrice) === Number(p.usd));
    if (!point) throw new Error(`no US price point of $${p.usd}`);
    await api('POST', '/v1/inAppPurchasePriceSchedules', {
      data: { type: 'inAppPurchasePriceSchedules', relationships: { inAppPurchase: { data: { type: 'inAppPurchases', id: iap.id } }, baseTerritory: { data: { type: 'territories', id: 'USA' } }, manualPrices: { data: [{ type: 'inAppPurchasePrices', id: '${price}' }] } } },
      included: [{ type: 'inAppPurchasePrices', id: '${price}', attributes: { startDate: null }, relationships: { inAppPurchasePricePoint: { data: { type: 'inAppPurchasePricePoints', id: point.id } } } }],
    });
    done.push(`$${p.usd}`);
  }

  // every territory, and new ones as Apple adds them
  const avail = await maybe(`/v2/inAppPurchases/${iap.id}/inAppPurchaseAvailability`);
  if (!avail?.data) {
    const territories = await all('/v1/territories?limit=200');
    await api('POST', '/v1/inAppPurchaseAvailabilities', { data: { type: 'inAppPurchaseAvailabilities', attributes: { availableInNewTerritories: true }, relationships: { inAppPurchase: { data: { type: 'inAppPurchases', id: iap.id } }, availableTerritories: { data: territories.map((t) => ({ type: 'territories', id: t.id })) } } } });
    done.push(`${territories.length} territories`);
  }

  // the screenshot App Review looks at
  const shot = await maybe(`/v2/inAppPurchases/${iap.id}/appStoreReviewScreenshot`);
  if (!shot?.data) {
    const file = path.join(STORE, CFG.reviewScreenshot);
    const buf = fs.readFileSync(file);
    const s = (await api('POST', '/v1/inAppPurchaseAppStoreReviewScreenshots', { data: { type: 'inAppPurchaseAppStoreReviewScreenshots', attributes: { fileName: path.basename(file), fileSize: buf.length }, relationships: { inAppPurchaseV2: { data: { type: 'inAppPurchases', id: iap.id } } } } })).data;
    for (const op of s.attributes.uploadOperations || []) {
      const headers = Object.fromEntries((op.requestHeaders || []).map((h) => [h.name, h.value]));
      const res = await fetch(op.url, { method: op.method, headers, body: buf.subarray(op.offset, op.offset + op.length) });
      if (!res.ok) throw new Error(`screenshot upload failed: ${res.status}`);
    }
    await api('PATCH', `/v1/inAppPurchaseAppStoreReviewScreenshots/${s.id}`, { data: { type: 'inAppPurchaseAppStoreReviewScreenshots', id: s.id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash('md5').update(buf).digest('hex') } } });
    done.push('review screenshot');
  }

  const now = (await get(`/v2/inAppPurchases/${iap.id}`)).data;
  return `${productId} (${p.type.toLowerCase().replace('_', '-')}, $${p.usd}): ${done.length ? `set ${done.join(', ')}` : 'already set'} · ${String(now.attributes.state || '').replace(/_/g, ' ').toLowerCase()}`;
}

try {
  const app = (await get(`/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE)}&limit=1`)).data[0];
  if (!app) throw new Error(`no App Store Connect app with bundle ID ${BUNDLE}`);
  R.ok(`App: ${app.attributes.name} (${BUNDLE})`);
  const existing = await all(`/v1/apps/${app.id}/inAppPurchasesV2?limit=200`);
  for (const p of CFG.products) {
    try { R.ok(await upsertProduct(app, existing, p)); } catch (e) { R.bad(`${CFG.prefix}${p.id}`, describe(e).replace(/\n\s*/g, ' ')); }
  }
  R.note('Selling them needs the Paid Applications Agreement, bank and tax details in App Store Connect → Business (the account holder only).');
} catch (e) {
  R.bad('In-app purchases', describe(e).replace(/\n\s*/g, ' '));
}
R.summary(`In-app purchases${R.problems.length ? ` — ${R.problems.length} problem(s)` : ''}`);
process.exit(R.problems.length ? 1 : 0);
