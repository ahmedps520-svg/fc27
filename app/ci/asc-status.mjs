#!/usr/bin/env node
/**
 * v207: where an App Store version stands, read from Apple — its state, every
 * open review submission and what is in it, and each in-app purchase and
 * subscription. With --unstage, the version is taken back out of a draft
 * submission (one not yet sent): App Store Connect hides a version's "In-App
 * Purchases and Subscriptions" section while the version sits in a draft, and
 * an app's first purchases can only be chosen there.
 *
 *   KEY_ID=… ISSUER_ID=… KEY_PATH=AuthKey_….p8 \
 *     node app/ci/asc-status.mjs --bundle online.apexxi.game --version 1.4 [--unstage]
 */
import fs from 'node:fs';
import { api, get, describe, reporter, ApiError, stateOf } from './asc-api.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BUNDLE = arg('--bundle', 'online.apexxi.game');
const VERSION = arg('--version', '1.0');
const UNSTAGE = process.argv.includes('--unstage');
const R = reporter();
const low = (s) => String(s || '').replace(/_/g, ' ').toLowerCase();

try {
  const app = (await get(`/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE)}&limit=1`)).data[0];
  if (!app) { R.bad(`No app with bundle ID ${BUNDLE}`); throw null; }
  const versions = async () => (await get(`/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=50`)).data;
  let all = await versions();
  for (const v of all.slice(0, 4)) R.note(`Version ${v.attributes.versionString}: ${low(stateOf(v))}`);
  const ver = all.find((v) => v.attributes.versionString === VERSION);
  if (!ver) { R.bad(`No version ${VERSION}`); throw null; }

  // open review submissions and their items
  const subs = (await get(`/v1/reviewSubmissions?filter[app]=${app.id}&filter[platform]=IOS&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW,UNRESOLVED_ISSUES,CANCELING&limit=20`)).data;
  if (!subs.length) R.ok('No open review submission');
  for (const s of subs) {
    const items = (await get(`/v1/reviewSubmissions/${s.id}/items?include=appStoreVersion&limit=50`)).data;
    R.note(`Review submission ${s.id.slice(0, 8)}…: ${low(s.attributes.state)}, ${items.length} item(s): ${items.map((i) => `${Object.keys(i.relationships || {}).filter((k) => i.relationships[k]?.data).join('/') || 'item'} (${low(i.attributes?.state)})`).join(', ') || 'none'}`);
    const mine = items.filter((i) => i.relationships?.appStoreVersion?.data?.id === ver.id);
    if (UNSTAGE && s.attributes.state === 'READY_FOR_REVIEW' && mine.length) {
      for (const it of mine) {
        try {
          await api('DELETE', `/v1/reviewSubmissionItems/${it.id}`);
          R.ok(`Took version ${VERSION} out of the draft submission`);
        } catch (e) {
          if (!(e instanceof ApiError)) throw e;
          R.note(`Apple would not remove the item (${describe(e).replace(/\n\s*/g, ' ')}); cancelling the draft instead`);
          await api('PATCH', `/v1/reviewSubmissions/${s.id}`, { data: { type: 'reviewSubmissions', id: s.id, attributes: { canceled: true } } });
          R.ok('Cancelled the draft submission');
        }
      }
    }
  }

  // the purchases
  const iapCfg = JSON.parse(fs.readFileSync(new URL('../store/iap.json', import.meta.url), 'utf8'));
  const have = [];
  for (let next = `/v1/apps/${app.id}/inAppPurchasesV2?limit=200`; next;) {
    const r = await get(next); have.push(...(r.data || []));
    next = r.links?.next ? r.links.next.replace('https://api.appstoreconnect.apple.com', '') : null;
  }
  const counts = {};
  for (const p of iapCfg.products) { const it = have.find((x) => x.attributes.productId === iapCfg.prefix + p.id); const st = low(it?.attributes.state || 'missing'); counts[st] = (counts[st] || 0) + 1; }
  R.note(`In-app purchases: ${Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ')}`);
  const groups = await get(`/v1/apps/${app.id}/subscriptionGroups?limit=200&include=subscriptions`);
  for (const s of (groups.included || []).filter((x) => x.type === 'subscriptions')) R.note(`Subscription ${s.attributes.productId}: ${low(s.attributes.state)}`);

  all = await versions();
  const after = all.find((v) => v.attributes.versionString === VERSION);
  R.ok(`Version ${VERSION} now: ${low(stateOf(after))}`);
  R.summary(`App Store status: ${VERSION} ${low(stateOf(after))}`);
} catch (e) {
  if (e) { console.log(`\n✗ Apple said:\n${describe(e)}`); }
  R.summary(`App Store status: ${VERSION} — failed`);
  process.exit(1);
}
