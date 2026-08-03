/**
 * Account session + cloud save.
 *
 * The token lives in localStorage so a refresh keeps you signed in. Progress is
 * still written to localStorage first and pushed to the server afterwards —
 * that way the game stays fully playable with the server down, and the cloud
 * copy is a mirror rather than a dependency.
 */
import { apiURL } from './config.js';

const TOKEN_KEY = 'apexxi.token';
const NAME_KEY = 'apexxi.name';

let token = null;
let profile = null;
let pushTimer = null;
let lastPushed = '';

try {
  token = localStorage.getItem(TOKEN_KEY);
} catch { /* private mode — sign-in just won't persist */ }

export const isSignedIn = () => !!token;
export const getProfile = () => profile;
export const getName = () => profile?.name || (() => {
  try { return localStorage.getItem(NAME_KEY); } catch { return null; }
})();

function remember(tok, prof) {
  token = tok;
  profile = prof;
  try {
    localStorage.setItem(TOKEN_KEY, tok);
    if (prof?.name) localStorage.setItem(NAME_KEY, prof.name);
  } catch { /* ignore */ }
}

export function signOut() {
  token = null;
  profile = null;
  lastPushed = '';
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

export const authToken = () => token;

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(apiURL(path), {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
  return data;
}

/** Create an account. Resolves to { profile, save }. */
export async function register(name, pass) {
  const d = await call('/api/register', { method: 'POST', body: { name, pass } });
  remember(d.token, d.profile);
  return d;
}

/** Sign in. Resolves to { profile, save } where save may be null. */
export async function login(name, pass) {
  const d = await call('/api/login', { method: 'POST', body: { name, pass } });
  remember(d.token, d.profile);
  return d;
}

/** Re-establish a stored session on boot. Returns null if the token is stale. */
export async function resume() {
  if (!token) return null;
  try {
    const d = await call('/api/me');
    profile = d.profile;
    return d;
  } catch {
    signOut();
    return null;
  }
}

export async function fetchSave() {
  if (!token) return null;
  const d = await call('/api/save');
  return d.save;
}

/**
 * Push progress to the cloud, debounced and de-duplicated — `save()` fires on
 * every coin change, and none of that needs its own request.
 */
export function pushSave(state) {
  if (!token) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const body = JSON.stringify(state);
    if (body === lastPushed) return;
    try {
      await call('/api/save', { method: 'PUT', body: { save: state } });
      lastPushed = body;
    } catch { /* offline: localStorage already has it, retry on next save */ }
  }, 1200);
}

export async function leaderboard() {
  const d = await call('/api/leaderboard');
  return d.rows || [];
}

export function setProfile(p) { profile = p; }
