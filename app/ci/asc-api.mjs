/**
 * The App Store Connect API, for the CI scripts next to this file: a signed
 * token from KEY_ID / ISSUER_ID / KEY_PATH (the key cleaned by asc-key.sh),
 * requests that retry on a network blip or a 429/5xx, and Apple's errors
 * kept whole so a refusal can be printed as Apple wrote it. Nothing secret is
 * ever printed.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';

const { KEY_ID, ISSUER_ID, KEY_PATH } = process.env;
if (!KEY_ID || !ISSUER_ID || !KEY_PATH) { console.error('KEY_ID, ISSUER_ID and KEY_PATH must be set'); process.exit(2); }
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

export class ApiError extends Error {
  constructor(status, method, path, errors) {
    super(`${method} ${path} → ${status}`);
    this.status = status; this.errors = errors || [];
  }
}
export const describe = (e) => (e instanceof ApiError
  ? `${e.message}${e.errors.map((x) => `\n    · ${x.code || ''} ${x.title || ''}: ${x.detail || ''}${x.source?.pointer ? ` (${x.source.pointer})` : ''}${(x.meta?.associatedErrors ? `\n${Object.values(x.meta.associatedErrors).flat().map((y) => `      – ${y.code || ''}: ${y.detail || y.title || ''}`).join('\n')}` : '')}`).join('')}`
  : String(e?.message || e));

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function api(method, path, body) {
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
export const get = (p) => api('GET', p);
/** GET that answers null for "there is nothing there yet" instead of throwing. */
export const maybe = async (p) => { try { return await get(p); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; } };

export const EDITABLE = new Set(['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY', 'READY_FOR_REVIEW']);
export const SUBMITTED = new Set(['WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'PENDING_APPLE_RELEASE', 'READY_FOR_SALE', 'READY_FOR_DISTRIBUTION', 'PROCESSING_FOR_DISTRIBUTION', 'ACCEPTED']);
export const stateOf = (v) => v.attributes.appVersionState || v.attributes.appStoreState;

/** A line-by-line report, also written to the job summary. */
export function reporter() {
  const lines = []; const problems = [];
  return {
    lines, problems,
    ok(what) { lines.push(`✓ ${what}`); console.log(`✓ ${what}`); },
    bad(what, where) { problems.push({ what, where }); lines.push(`✗ ${what}${where ? ` — ${where}` : ''}`); console.log(`✗ ${what}${where ? `  [${where}]` : ''}`); },
    note(what) { lines.push(`· ${what}`); console.log(`· ${what}`); },
    summary(title) {
      const md = [`### ${title}`, '', ...lines.map((l) => `${l}  `)].join('\n');
      if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
    },
  };
}
