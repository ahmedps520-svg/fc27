#!/usr/bin/env node
/**
 * App Store Connect from CI: put a build on an App Store version, check that
 * everything App Review needs is filled in, and submit it.
 *
 *   KEY_ID=… ISSUER_ID=… KEY_PATH=AuthKey_….p8 \
 *     node app/ci/asc.mjs --bundle online.apexxi.game --version 1.0 --build 5 [--submit]
 *
 * Without --submit it only reads, and reports what is missing. With it, it
 * attaches the build, then submits whatever the checks say: Apple's answer to
 * the submission is the authority, and its errors are printed in full. The
 * checks are there so the report names each gap and where in App Store
 * Connect to fill it.
 *
 * Reads the key from KEY_PATH (cleaned by app/ci/asc-key.sh) and prints nothing
 * secret. Writes a summary to $GITHUB_STEP_SUMMARY when it is set.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BUNDLE = arg('--bundle', 'online.apexxi.game');
const VERSION = arg('--version', '1.0');
const BUILD = arg('--build', '');
const SUBMIT = process.argv.includes('--submit');
const { KEY_ID, ISSUER_ID, KEY_PATH } = process.env;
if (!KEY_ID || !ISSUER_ID || !KEY_PATH) { console.error('KEY_ID, ISSUER_ID and KEY_PATH must be set'); process.exit(2); }
if (!/^\d+$/.test(BUILD)) { console.error(`--build must be the build number, e.g. 5 (got "${BUILD}")`); process.exit(2); }

/* ------------------------------ the API ------------------------------ */
const KEY = fs.readFileSync(KEY_PATH, 'utf8');
const b64u = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
let jwt = null; let jwtExp = 0;
function token() {
  const now = Math.floor(Date.now() / 1000);
  if (jwt && now < jwtExp - 60) return jwt;
  const head = b64u(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }));
  jwtExp = now + 15 * 60;
  const body = b64u(JSON.stringify({ iss: ISSUER_ID, iat: now, exp: jwtExp, aud: 'appstoreconnect-v1' }));
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key: KEY, dsaEncoding: 'ieee-p1363' });
  jwt = `${head}.${body}.${b64u(sig)}`;
  return jwt;
}

class ApiError extends Error {
  constructor(status, method, path, errors) {
    super(`${method} ${path} → ${status}`);
    this.status = status; this.errors = errors || [];
  }
}
const describe = (e) => (e instanceof ApiError
  ? `${e.message}${e.errors.map((x) => `\n    · ${x.code || ''} ${x.title || ''}: ${x.detail || ''}${x.source?.pointer ? ` (${x.source.pointer})` : ''}${(x.meta?.associatedErrors ? `\n${Object.values(x.meta.associatedErrors).flat().map((y) => `      – ${y.code || ''}: ${y.detail || y.title || ''}`).join('\n')}` : '')}`).join('')}`
  : String(e?.message || e));

async function api(method, path, body) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
        method,
        headers: { Authorization: `Bearer ${token()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      if (attempt < 4) { await sleep(2000 * attempt); continue; }
      throw err;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) { await sleep(3000 * attempt); continue; }
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new ApiError(res.status, method, path, json?.errors);
    return json;
  }
}
const get = (p) => api('GET', p);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** GET that answers null for "there is nothing there yet" instead of throwing. */
const maybe = async (p) => { try { return await get(p); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; } };

/* ------------------------------ the report ------------------------------ */
const lines = [];
const problems = [];
const ok = (what) => { lines.push(`✓ ${what}`); console.log(`✓ ${what}`); };
const bad = (what, where) => { problems.push({ what, where }); lines.push(`✗ ${what}${where ? ` — ${where}` : ''}`); console.log(`✗ ${what}${where ? `  [${where}]` : ''}`); };
const note = (what) => { lines.push(`· ${what}`); console.log(`· ${what}`); };
function summary(title) {
  const md = [`### ${title}`, '', ...lines.map((l) => `${l}  `)].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
}

const EDITABLE = new Set(['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY', 'READY_FOR_REVIEW']);
const SUBMITTED = new Set(['WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'PENDING_APPLE_RELEASE', 'READY_FOR_SALE', 'READY_FOR_DISTRIBUTION', 'PROCESSING_FOR_DISTRIBUTION', 'ACCEPTED']);
const stateOf = (v) => v.attributes.appVersionState || v.attributes.appStoreState;

try {
  /* the app */
  const apps = await get(`/v1/apps?filter[bundleId]=${encodeURIComponent(BUNDLE)}&fields[apps]=name,bundleId,primaryLocale,contentRightsDeclaration&limit=1`);
  const app = apps.data[0];
  if (!app) { bad(`No App Store Connect app with bundle ID ${BUNDLE}`, 'App Store Connect → Apps → + → New App'); throw null; }
  const locale = app.attributes.primaryLocale;
  ok(`App: ${app.attributes.name} (${BUNDLE}), primary language ${locale}`);

  /* the build — waiting for Apple's processing if it has only just landed */
  let build = null;
  for (let waited = 0; ; waited += 30) {
    const b = await get(`/v1/builds?filter[app]=${app.id}&filter[version]=${BUILD}&filter[preReleaseVersion.version]=${encodeURIComponent(VERSION)}&fields[builds]=version,processingState,expired,uploadedDate,usesNonExemptEncryption&limit=1`);
    build = b.data[0];
    if (!build) { bad(`Build ${VERSION} (${BUILD}) is not in App Store Connect`, 'run "iOS → TestFlight" first'); throw null; }
    const st = build.attributes.processingState;
    if (st !== 'PROCESSING' || !SUBMIT || waited >= 1500) break;
    if (waited === 0) console.log(`  build ${BUILD} is still processing at Apple; waiting…`);
    await sleep(30000);
  }
  const bst = build.attributes.processingState;
  if (bst !== 'VALID') { bad(`Build ${VERSION} (${BUILD}) is ${bst}${build.attributes.expired ? ', expired' : ''}`, bst === 'PROCESSING' ? 'Apple is still processing it — try again in a few minutes' : 'upload a new build'); throw null; }
  ok(`Build ${VERSION} (${BUILD}) processed (uploaded ${String(build.attributes.uploadedDate).slice(0, 16).replace('T', ' ')})`);

  /* the App Store version */
  const vs = await get(`/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=50`);
  let ver = vs.data.find((v) => v.attributes.versionString === VERSION);
  if (ver && SUBMITTED.has(stateOf(ver))) {
    note(`Version ${VERSION} is already ${stateOf(ver).replace(/_/g, ' ').toLowerCase()} — nothing to submit`);
    summary(`App Store review: ${VERSION} (${BUILD})`);
    process.exit(0);
  }
  if (!ver) {
    const editable = vs.data.filter((v) => EDITABLE.has(stateOf(v)));
    if (!SUBMIT) { bad(`There is no App Store version ${VERSION} yet${editable.length ? ` (the editable one is ${editable[0].attributes.versionString})` : ''}`, 'it is created on submit'); }
    else if (editable.length === 1) {
      ver = (await api('PATCH', `/v1/appStoreVersions/${editable[0].id}`, { data: { type: 'appStoreVersions', id: editable[0].id, attributes: { versionString: VERSION } } })).data;
      ok(`Renamed the editable version ${editable[0].attributes.versionString} to ${VERSION}`);
    } else {
      ver = (await api('POST', '/v1/appStoreVersions', { data: { type: 'appStoreVersions', attributes: { platform: 'IOS', versionString: VERSION }, relationships: { app: { data: { type: 'apps', id: app.id } } } } })).data;
      ok(`Created App Store version ${VERSION}`);
    }
  }
  if (ver) {
    ok(`App Store version ${VERSION}: ${stateOf(ver).replace(/_/g, ' ').toLowerCase()}, release ${String(ver.attributes.releaseType || 'AFTER_APPROVAL').replace(/_/g, ' ').toLowerCase()}`);
    if (ver.attributes.copyright?.trim()) ok(`Copyright: ${ver.attributes.copyright}`); else bad('Copyright is empty', `App Store tab → iOS App ${VERSION} → Copyright (e.g. "2026 your name")`);
    if (SUBMIT) {
      await api('PATCH', `/v1/appStoreVersions/${ver.id}/relationships/build`, { data: { type: 'builds', id: build.id } });
      ok(`Build ${BUILD} attached to version ${VERSION}`);
    } else {
      const cur = await maybe(`/v1/appStoreVersions/${ver.id}/build?fields[builds]=version`);
      if (cur?.data?.attributes?.version === BUILD) ok(`Build ${BUILD} is attached`); else note(`Build ${BUILD} will be attached on submit (now: ${cur?.data?.attributes?.version || 'none'})`);
    }
  }

  /* the version page: text, screenshots, review contact */
  if (ver) {
    const locs = (await get(`/v1/appStoreVersions/${ver.id}/appStoreVersionLocalizations?fields[appStoreVersionLocalizations]=locale,description,keywords,supportUrl,marketingUrl,promotionalText&limit=50`)).data;
    const loc = locs.find((l) => l.attributes.locale === locale) || locs[0];
    const page = `App Store tab → iOS App ${VERSION}`;
    if (!loc) bad('No version page text at all', page);
    else {
      const a = loc.attributes;
      if (a.description?.trim()) ok(`Description (${a.description.length} characters)`); else bad('Description is empty', page);
      if (a.keywords?.trim()) ok('Keywords'); else bad('Keywords are empty', page);
      if (a.supportUrl?.trim()) ok(`Support URL: ${a.supportUrl}`); else bad('Support URL is empty', page);
      const sets = (await get(`/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets?fields[appScreenshotSets]=screenshotDisplayType&include=appScreenshots&limit=50`));
      const count = {};
      for (const s of sets.data) count[s.attributes.screenshotDisplayType] = s.relationships?.appScreenshots?.data?.length || 0;
      const iphone = Object.entries(count).filter(([t, n]) => t.startsWith('APP_IPHONE') && n > 0);
      const ipad = Object.entries(count).filter(([t, n]) => t.startsWith('APP_IPAD') && n > 0);
      if (iphone.length) ok(`iPhone screenshots: ${iphone.map(([t, n]) => `${n} × ${t.replace('APP_', '')}`).join(', ')}`);
      else bad('No iPhone screenshots', `${page} → Previews and Screenshots → iPhone 6.9" (1320 × 2868 or 2868 × 1320)`);
      // build 5 is iPhone and iPad (TARGETED_DEVICE_FAMILY 1,2), so App Review asks for the 13" iPad as well
      if (ipad.length) ok(`iPad screenshots: ${ipad.map(([t, n]) => `${n} × ${t.replace('APP_', '')}`).join(', ')}`);
      else bad('No iPad screenshots (the app runs on iPad, so a 13" set is required)', `${page} → Previews and Screenshots → iPad 13" (2064 × 2752 or 2752 × 2064)`);
    }
    const rd = await maybe(`/v1/appStoreVersions/${ver.id}/appStoreReviewDetail`);
    const r = rd?.data?.attributes;
    const where = `${page} → App Review Information`;
    if (!r) bad('App Review contact details are not filled in', where);
    else {
      const missing = ['contactFirstName', 'contactLastName', 'contactPhone', 'contactEmail'].filter((k) => !r[k]);
      if (missing.length) bad(`App Review contact is missing ${missing.join(', ')}`, where); else ok('App Review contact details');
      if (r.demoAccountRequired && !(r.demoAccountName && r.demoAccountPassword)) bad('"Sign-in required" is ticked but the demo account name or password is empty', where);
      else ok(r.demoAccountRequired ? 'Demo account for the reviewer' : 'No sign-in required for review (all modes play offline)');
    }
  }

  /* app information: privacy policy, category, age rating, content rights */
  const infos = (await get(`/v1/apps/${app.id}/appInfos?limit=10`)).data;
  const info = infos.find((i) => !['READY_FOR_SALE', 'READY_FOR_DISTRIBUTION'].includes(i.attributes.state || i.attributes.appStoreState)) || infos[0];
  if (info) {
    const il = (await get(`/v1/appInfos/${info.id}/appInfoLocalizations?fields[appInfoLocalizations]=locale,name,privacyPolicyUrl,subtitle&limit=50`)).data;
    const pl = il.find((l) => l.attributes.locale === locale) || il[0];
    if (pl?.attributes.privacyPolicyUrl) ok(`Privacy policy URL: ${pl.attributes.privacyPolicyUrl}`);
    else bad('Privacy policy URL is empty', 'App Information → Privacy Policy URL: https://fc27.onrender.com/privacy.html');
    const cat = await maybe(`/v1/appInfos/${info.id}/primaryCategory`);
    if (cat?.data) ok(`Primary category: ${cat.data.id}`); else bad('No primary category', 'App Information → Category: Games, then Sports');
    const age = await maybe(`/v1/appInfos/${info.id}/ageRatingDeclaration`);
    const answered = age?.data ? Object.values(age.data.attributes || {}).filter((v) => v !== null && v !== undefined).length : 0;
    if (answered >= 5) ok(`Age rating questionnaire answered${info.attributes.appStoreAgeRating ? ` (${info.attributes.appStoreAgeRating})` : ''}`);
    else bad('Age rating questionnaire is not answered', 'App Information → Age Rating → Edit');
  }
  if (app.attributes.contentRightsDeclaration) ok(`Content rights: ${app.attributes.contentRightsDeclaration.replace(/_/g, ' ').toLowerCase()}`);
  else bad('Content rights question is not answered', 'App Information → Content Rights');

  /* price and availability */
  // a schedule can exist with no price in it; Apple only counts a manual price
  const price = await maybe(`/v1/apps/${app.id}/appPriceSchedule?include=manualPrices`).catch(() => null);
  if (price?.included?.some((x) => x.type === 'appPrices')) ok('Price set'); else bad('No price set', 'Pricing and Availability → Price: Free (0.00)');
  const avail = await maybe(`/v1/apps/${app.id}/appAvailabilityV2`).catch(() => null);
  if (avail?.data) ok('Availability set'); else note('Could not read country availability (check Pricing and Availability → App Availability)');
  note('App Privacy (the data labels) cannot be read through the API — Apple will refuse the submission below if it is not published');

  /* submit */
  if (!SUBMIT) {
    summary(`App Store review check: ${VERSION} (${BUILD}) — ${problems.length ? `${problems.length} to fix` : 'ready'}`);
    process.exit(problems.length ? 1 : 0);
  }
  if (problems.length) note(`${problems.length} gap(s) found above — submitting anyway, so Apple's own answer is on record`);
  const open = (await get(`/v1/reviewSubmissions?filter[app]=${app.id}&filter[platform]=IOS&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW,UNRESOLVED_ISSUES&limit=10`)).data;
  const live = open.find((s) => ['WAITING_FOR_REVIEW', 'IN_REVIEW'].includes(s.attributes.state));
  if (live) { note(`A submission is already ${live.attributes.state.replace(/_/g, ' ').toLowerCase()}`); summary(`App Store review: ${VERSION} (${BUILD})`); process.exit(0); }
  let sub = open.find((s) => ['READY_FOR_REVIEW', 'UNRESOLVED_ISSUES'].includes(s.attributes.state));
  if (!sub) sub = (await api('POST', '/v1/reviewSubmissions', { data: { type: 'reviewSubmissions', attributes: { platform: 'IOS' }, relationships: { app: { data: { type: 'apps', id: app.id } } } } })).data;
  try {
    await api('POST', '/v1/reviewSubmissionItems', { data: { type: 'reviewSubmissionItems', relationships: { reviewSubmission: { data: { type: 'reviewSubmissions', id: sub.id } }, appStoreVersion: { data: { type: 'appStoreVersions', id: ver.id } } } } });
  } catch (e) {
    // already in this submission is fine; anything else is the real answer
    if (!(e instanceof ApiError && e.status === 409 && /already/i.test(JSON.stringify(e.errors)))) throw e;
  }
  const done = (await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, { data: { type: 'reviewSubmissions', id: sub.id, attributes: { submitted: true } } })).data;
  ok(`Submitted for review: ${String(done.attributes.state || 'WAITING_FOR_REVIEW').replace(/_/g, ' ').toLowerCase()}`);
  summary(`App Store review: ${VERSION} (${BUILD}) submitted`);
} catch (e) {
  if (e) {
    const msg = describe(e);
    lines.push('', '**Apple said:**', '```', msg, '```');
    console.log(`\n✗ Apple refused:\n${msg}`);
  }
  summary(`App Store review: ${VERSION} (${BUILD}) — not submitted${problems.length ? `, ${problems.length} to fix` : ''}`);
  process.exit(1);
}
