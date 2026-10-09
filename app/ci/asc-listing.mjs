#!/usr/bin/env node
/**
 * Put the App Store listing in app/store/ onto App Store Connect.
 *
 *   KEY_ID=… ISSUER_ID=… KEY_PATH=… node app/ci/asc-listing.mjs --bundle online.apexxi.game --version 1.0
 *
 * From app/store/listing.json: the version page text (description, keywords,
 * promotional text, support and marketing URLs), copyright and release type,
 * the subtitle and privacy policy URL, the category, the age-rating answers,
 * the content-rights answer, a free price and every territory, and the notes
 * for App Review. From app/store/screenshots/<device>/: the screenshot sets,
 * replaced in file-name order. Safe to run again: everything is set, not
 * appended. Each step reports ✓ or ✗ with Apple's answer, and one failing
 * step does not stop the others.
 *
 * Not here, because the API cannot or should not do it: App Privacy (web only),
 * and the App Review contact name, phone and email (yours to give).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { api, get, maybe, describe, sleep, reporter, EDITABLE, stateOf } from './asc-api.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STORE = path.join(HERE, '..', 'store');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BUNDLE = arg('--bundle', 'online.apexxi.game');
const VERSION = arg('--version', '1.0');
const L = JSON.parse(fs.readFileSync(path.join(STORE, 'listing.json'), 'utf8'));
const SETS = [['iphone', 'APP_IPHONE_67'], ['ipad', 'APP_IPAD_PRO_3GEN_129']];

const R = reporter();
const step = async (what, fn) => {
  try { const out = await fn(); R.ok(out ? `${what}: ${out}` : what); } catch (e) { R.bad(what, describe(e).replace(/\n\s*/g, ' ')); }
};
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')));

try {
  const app = (await get(`/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE)}&limit=1`)).data[0];
  if (!app) throw new Error(`no App Store Connect app with bundle ID ${BUNDLE}`);
  R.ok(`App: ${app.attributes.name} (${BUNDLE})`);

  const vs = (await get(`/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=50`)).data;
  const ver = vs.find((v) => v.attributes.versionString === VERSION);
  if (!ver) throw new Error(`no App Store version ${VERSION} (run "iOS → App Store review" once to create it)`);
  if (!EDITABLE.has(stateOf(ver))) throw new Error(`version ${VERSION} is ${stateOf(ver)} and cannot be edited now`);

  /* the version page */
  let loc = null;
  await step(`Version page text (${L.locale})`, async () => {
    const locs = (await get(`/v1/appStoreVersions/${ver.id}/appStoreVersionLocalizations?limit=50`)).data;
    loc = locs.find((l) => l.attributes.locale === L.locale);
    const attributes = { description: L.description, keywords: L.keywords, supportUrl: L.supportUrl, marketingUrl: L.marketingUrl, promotionalText: L.promotionalText };
    if (loc) loc = (await api('PATCH', `/v1/appStoreVersionLocalizations/${loc.id}`, { data: { type: 'appStoreVersionLocalizations', id: loc.id, attributes } })).data;
    else loc = (await api('POST', '/v1/appStoreVersionLocalizations', { data: { type: 'appStoreVersionLocalizations', attributes: { locale: L.locale, ...attributes }, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } })).data;
    return `description, keywords, promotional text, ${L.supportUrl}`;
  });
  await step('Copyright and release', async () => {
    await api('PATCH', `/v1/appStoreVersions/${ver.id}`, { data: { type: 'appStoreVersions', id: ver.id, attributes: { copyright: L.copyright, releaseType: L.releaseType } } });
    return `"${L.copyright}", ${L.releaseType.replace(/_/g, ' ').toLowerCase()}`;
  });

  /* app information */
  const infos = (await get(`/v1/apps/${app.id}/appInfos?limit=10`)).data;
  const info = infos.find((i) => !['READY_FOR_SALE', 'READY_FOR_DISTRIBUTION'].includes(i.attributes.state || i.attributes.appStoreState)) || infos[0];
  await step(`Subtitle and privacy policy (${L.locale})`, async () => {
    const il = (await get(`/v1/appInfos/${info.id}/appInfoLocalizations?limit=50`)).data;
    const x = il.find((l) => l.attributes.locale === L.locale);
    const attributes = { subtitle: L.subtitle, privacyPolicyUrl: L.privacyPolicyUrl };
    if (x) await api('PATCH', `/v1/appInfoLocalizations/${x.id}`, { data: { type: 'appInfoLocalizations', id: x.id, attributes } });
    else await api('POST', '/v1/appInfoLocalizations', { data: { type: 'appInfoLocalizations', attributes: { locale: L.locale, name: app.attributes.name, ...attributes }, relationships: { appInfo: { data: { type: 'appInfos', id: info.id } } } } });
    return `"${L.subtitle}", ${L.privacyPolicyUrl}`;
  });
  await step('Category', async () => {
    const c = L.category;
    const rel = (id) => ({ data: id ? { type: 'appCategories', id } : null });
    await api('PATCH', `/v1/appInfos/${info.id}`, { data: { type: 'appInfos', id: info.id, relationships: { primaryCategory: rel(c.primary), primarySubcategoryOne: rel(c.primarySub1), primarySubcategoryTwo: rel(c.primarySub2) } } });
    return [c.primary, c.primarySub1, c.primarySub2].filter(Boolean).join(' › ');
  });
  await step('Age rating answers', async () => {
    const decl = await get(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
    const id = decl.data.id;
    await api('PATCH', `/v1/ageRatingDeclarations/${id}`, { data: { type: 'ageRatingDeclarations', id, attributes: clean(L.ageRating) } });
    return 'all none or no, loot boxes yes';
  });
  await step('Content rights', async () => {
    await api('PATCH', `/v1/apps/${app.id}`, { data: { type: 'apps', id: app.id, attributes: { contentRightsDeclaration: L.contentRightsDeclaration } } });
    return L.contentRightsDeclaration.replace(/_/g, ' ').toLowerCase();
  });

  /* price and availability */
  await step('Price', async () => {
    const cur = await maybe(`/v1/apps/${app.id}/appPriceSchedule?include=manualPrices`).catch(() => null);
    if (cur?.included?.some((x) => x.type === 'appPrices')) return 'already set';
    let point = null; let next = `/v1/apps/${app.id}/appPricePoints?filter[territory]=USA&limit=200`;
    while (!point && next) {
      const page = await get(next);
      point = page.data.find((p) => Number(p.attributes.customerPrice) === 0);
      next = page.links?.next ? page.links.next.replace('https://api.appstoreconnect.apple.com', '') : null;
    }
    if (!point) throw new Error('no free price point found');
    await api('POST', '/v1/appPriceSchedules', {
      data: { type: 'appPriceSchedules', relationships: {
        app: { data: { type: 'apps', id: app.id } },
        baseTerritory: { data: { type: 'territories', id: 'USA' } },
        manualPrices: { data: [{ type: 'appPrices', id: '${free}' }] },
      } },
      included: [{ type: 'appPrices', id: '${free}', attributes: { startDate: null }, relationships: { appPricePoint: { data: { type: 'appPricePoints', id: point.id } } } }],
    });
    return 'Free';
  });
  await step('Availability', async () => {
    const cur = await maybe(`/v1/apps/${app.id}/appAvailabilityV2`).catch(() => null);
    if (cur?.data) return 'already set';
    const terr = [];
    let next = '/v1/territories?limit=200';
    while (next) { const page = await get(next); terr.push(...page.data); next = page.links?.next ? page.links.next.replace('https://api.appstoreconnect.apple.com', '') : null; }
    await api('POST', '/v2/appAvailabilities', {
      data: { type: 'appAvailabilities', attributes: { availableInNewTerritories: true }, relationships: {
        app: { data: { type: 'apps', id: app.id } },
        territoryAvailabilities: { data: terr.map((t, i) => ({ type: 'territoryAvailabilities', id: `\${t${i}}` })) },
      } },
      included: terr.map((t, i) => ({ type: 'territoryAvailabilities', id: `\${t${i}}`, attributes: { available: true }, relationships: { territory: { data: { type: 'territories', id: t.id } } } })),
    });
    return `${terr.length} countries and regions`;
  });

  /* notes for App Review (the contact name, phone and email are left to you) */
  await step('App Review notes', async () => {
    const attributes = { demoAccountRequired: L.review.demoAccountRequired, notes: L.review.notes };
    const cur = await maybe(`/v1/appStoreVersions/${ver.id}/appStoreReviewDetail`);
    // Apple refuses any change here until the contact is filled in, so leave notes that are already right alone
    if (cur?.data && cur.data.attributes.notes === attributes.notes && cur.data.attributes.demoAccountRequired === attributes.demoAccountRequired) return 'already set';
    if (cur?.data) await api('PATCH', `/v1/appStoreReviewDetails/${cur.data.id}`, { data: { type: 'appStoreReviewDetails', id: cur.data.id, attributes } });
    else await api('POST', '/v1/appStoreReviewDetails', { data: { type: 'appStoreReviewDetails', attributes, relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } });
    return 'no sign-in needed; notes added';
  });

  /* screenshots */
  for (const [dev, type] of SETS) {
    await step(`Screenshots: ${dev}`, async () => {
      if (!loc) throw new Error('no version page to hang them on');
      const dir = path.join(STORE, 'screenshots', dev);
      const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort() : [];
      if (!files.length) throw new Error(`nothing in app/store/screenshots/${dev}`);
      const sets = (await get(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?limit=50&include=appScreenshots`));
      let set = sets.data.find((s) => s.attributes.screenshotDisplayType === type);
      if (!set) set = (await api('POST', '/v1/appScreenshotSets', { data: { type: 'appScreenshotSets', attributes: { screenshotDisplayType: type }, relationships: { appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: loc.id } } } } })).data;
      for (const old of set.relationships?.appScreenshots?.data || []) await api('DELETE', `/v1/appScreenshots/${old.id}`);
      const ids = [];
      for (const f of files) {
        const buf = fs.readFileSync(path.join(dir, f));
        const shot = (await api('POST', '/v1/appScreenshots', { data: { type: 'appScreenshots', attributes: { fileName: f, fileSize: buf.length }, relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: set.id } } } } })).data;
        for (const op of shot.attributes.uploadOperations || []) {
          const headers = Object.fromEntries((op.requestHeaders || []).map((h) => [h.name, h.value]));
          const res = await fetch(op.url, { method: op.method, headers, body: buf.subarray(op.offset, op.offset + op.length) });
          if (!res.ok) throw new Error(`upload of ${f} failed: ${res.status}`);
        }
        const md5 = crypto.createHash('md5').update(buf).digest('hex');
        await api('PATCH', `/v1/appScreenshots/${shot.id}`, { data: { type: 'appScreenshots', id: shot.id, attributes: { uploaded: true, sourceFileChecksum: md5 } } });
        ids.push(shot.id);
      }
      await api('PATCH', `/v1/appScreenshotSets/${set.id}/relationships/appScreenshots`, { data: ids.map((id) => ({ type: 'appScreenshots', id })) });
      // Apple checks each image after upload; wait for its verdict
      for (let t = 0; t < 24; t++) {
        const states = await Promise.all(ids.map((id) => get(`/v1/appScreenshots/${id}`).then((r) => r.data.attributes.assetDeliveryState?.state)));
        if (states.every((s) => s === 'COMPLETE')) return `${ids.length} uploaded (${type})`;
        const failed = states.filter((s) => s === 'FAILED').length;
        if (failed) throw new Error(`${failed} of ${ids.length} rejected by Apple after upload (wrong size for ${type}?)`);
        await sleep(5000);
      }
      return `${ids.length} uploaded (${type}), still being processed by Apple`;
    });
  }

  R.note('Left for you in App Store Connect: App Privacy (Publish), and the App Review contact name, phone and email');
  R.summary(`App Store listing for ${VERSION}${R.problems.length ? ` — ${R.problems.length} step(s) failed` : ''}`);
  process.exit(R.problems.length ? 1 : 0);
} catch (e) {
  R.bad('Stopped', describe(e));
  R.summary(`App Store listing for ${VERSION} — stopped`);
  process.exit(1);
}
