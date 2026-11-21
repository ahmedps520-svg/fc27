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

/**
 * v206: an auto-renewing subscription — its group (and the group's display
 * name), the product, its name and description, every territory, its price
 * (the nearest price point to the owner's in the base territory, and Apple's
 * equalised price in every other one) and the review screenshot.
 */
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function upload(kind, relKey, ownerType, ownerId, file) {
  const buf = fs.readFileSync(file);
  const s = (await api('POST', `/v1/${kind}`, { data: { type: kind, attributes: { fileName: path.basename(file), fileSize: buf.length }, relationships: { [relKey]: { data: { type: ownerType, id: ownerId } } } } })).data;
  for (const op of s.attributes.uploadOperations || []) {
    const headers = Object.fromEntries((op.requestHeaders || []).map((h) => [h.name, h.value]));
    const res = await fetch(op.url, { method: op.method, headers, body: buf.subarray(op.offset, op.offset + op.length) });
    if (!res.ok) throw new Error(`screenshot upload failed: ${res.status}`);
  }
  await api('PATCH', `/v1/${kind}/${s.id}`, { data: { type: kind, id: s.id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash('md5').update(buf).digest('hex') } } });
}

async function upsertSubscription(app, sub) {
  const productId = CFG.prefix + sub.id;
  const done = [];
  const groups = await all(`/v1/apps/${app.id}/subscriptionGroups?limit=200`);
  let g = groups.find((x) => x.attributes.referenceName === sub.group);
  if (!g) { g = (await api('POST', '/v1/subscriptionGroups', { data: { type: 'subscriptionGroups', attributes: { referenceName: sub.group }, relationships: { app: { data: { type: 'apps', id: app.id } } } } })).data; done.push('group'); }
  const gl = (await get(`/v1/subscriptionGroups/${g.id}/subscriptionGroupLocalizations?limit=50`)).data;
  if (!gl.find((l) => l.attributes.locale === CFG.locale)) { await api('POST', '/v1/subscriptionGroupLocalizations', { data: { type: 'subscriptionGroupLocalizations', attributes: { locale: CFG.locale, name: sub.groupName || sub.group }, relationships: { subscriptionGroup: { data: { type: 'subscriptionGroups', id: g.id } } } } }); done.push('group name'); }

  const subs = await all(`/v1/subscriptionGroups/${g.id}/subscriptions?limit=200`);
  let it = subs.find((x) => x.attributes.productId === productId);
  if (!it) { it = (await api('POST', '/v1/subscriptions', { data: { type: 'subscriptions', attributes: { name: sub.ref, productId, subscriptionPeriod: sub.period, familySharable: false, reviewNote: sub.review, groupLevel: sub.level || 1 }, relationships: { group: { data: { type: 'subscriptionGroups', id: g.id } } } } })).data; done.push('product'); }
  else if (it.attributes.reviewNote !== sub.review) await api('PATCH', `/v1/subscriptions/${it.id}`, { data: { type: 'subscriptions', id: it.id, attributes: { reviewNote: sub.review } } });

  const locs = (await get(`/v1/subscriptions/${it.id}/subscriptionLocalizations?limit=50`)).data;
  const loc = locs.find((l) => l.attributes.locale === CFG.locale);
  if (!loc) { await api('POST', '/v1/subscriptionLocalizations', { data: { type: 'subscriptionLocalizations', attributes: { locale: CFG.locale, name: sub.name, description: sub.description }, relationships: { subscription: { data: { type: 'subscriptions', id: it.id } } } } }); done.push('name'); }
  else if (loc.attributes.name !== sub.name || loc.attributes.description !== sub.description) { await api('PATCH', `/v1/subscriptionLocalizations/${loc.id}`, { data: { type: 'subscriptionLocalizations', id: loc.id, attributes: { name: sub.name, description: sub.description } } }); done.push('name'); }

  const avail = await maybe(`/v1/subscriptions/${it.id}/subscriptionAvailability`);
  if (!avail?.data) {
    const territories = await all('/v1/territories?limit=200');
    await api('POST', '/v1/subscriptionAvailabilities', { data: { type: 'subscriptionAvailabilities', attributes: { availableInNewTerritories: true }, relationships: { subscription: { data: { type: 'subscriptions', id: it.id } }, availableTerritories: { data: territories.map((t) => ({ type: 'territories', id: t.id })) } } } });
    done.push(`${territories.length} territories`);
  }

  const prices = await all(`/v1/subscriptions/${it.id}/prices?limit=200`);
  if (!prices.length) {
    const points = await all(`/v1/subscriptions/${it.id}/pricePoints?filter[territory]=${sub.baseTerritory}&limit=200`);
    const want = Number(sub.price);
    const point = points.slice().sort((a, b) => Math.abs(Number(a.attributes.customerPrice) - want) - Math.abs(Number(b.attributes.customerPrice) - want))[0];
    if (!point) throw new Error(`no price points in ${sub.baseTerritory}`);
    const eq = await all(`/v1/subscriptionPricePoints/${point.id}/equalizations?include=territory&limit=200`);
    const set = [[point.id, sub.baseTerritory], ...eq.map((x) => [x.id, x.relationships?.territory?.data?.id]).filter(([, t]) => t && t !== sub.baseTerritory)];
    for (const [pointId, territory] of set) {
      await api('POST', '/v1/subscriptionPrices', { data: { type: 'subscriptionPrices', attributes: { startDate: null, preserveCurrentPrice: false }, relationships: { subscription: { data: { type: 'subscriptions', id: it.id } }, subscriptionPricePoint: { data: { type: 'subscriptionPricePoints', id: pointId } }, territory: { data: { type: 'territories', id: territory } } } } });
      await pause(250);
    }
    done.push(`${point.attributes.customerPrice} ${sub.baseTerritory === 'SAU' ? 'SAR' : sub.baseTerritory} and ${set.length - 1} other countries`);
  }

  const shot = await maybe(`/v1/subscriptions/${it.id}/appStoreReviewScreenshot`);
  if (!shot?.data) { await upload('subscriptionAppStoreReviewScreenshots', 'subscription', 'subscriptions', it.id, path.join(STORE, CFG.reviewScreenshot)); done.push('review screenshot'); }

  const now = (await get(`/v1/subscriptions/${it.id}`)).data;
  return `${productId} (monthly subscription): ${done.length ? `set ${done.join(', ')}` : 'already set'} · ${String(now.attributes.state || '').replace(/_/g, ' ').toLowerCase()}`;
}

try {
  const app = (await get(`/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE)}&limit=1`)).data[0];
  if (!app) throw new Error(`no App Store Connect app with bundle ID ${BUNDLE}`);
  R.ok(`App: ${app.attributes.name} (${BUNDLE})`);
  const existing = await all(`/v1/apps/${app.id}/inAppPurchasesV2?limit=200`);
  for (const p of CFG.products) {
    try { R.ok(await upsertProduct(app, existing, p)); } catch (e) { R.bad(`${CFG.prefix}${p.id}`, describe(e).replace(/\n\s*/g, ' ')); }
  }
  for (const sub of CFG.subscriptions || []) {
    try { R.ok(await upsertSubscription(app, sub)); } catch (e) { R.bad(`${CFG.prefix}${sub.id}`, describe(e).replace(/\n\s*/g, ' ')); }
  }
  R.note('Selling them needs the Paid Applications Agreement, bank and tax details in App Store Connect → Business (the account holder only).');
} catch (e) {
  R.bad('In-app purchases', describe(e).replace(/\n\s*/g, ' '));
}
R.summary(`In-app purchases${R.problems.length ? ` — ${R.problems.length} problem(s)` : ''}`);
process.exit(R.problems.length ? 1 : 0);
