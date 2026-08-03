/**
 * Where the online server lives.
 *
 * Empty means "same place the page came from", which is the case when you run
 * `node .dev-server.js` locally or deploy the whole thing to one host.
 *
 * Set it when the game is served from static hosting that cannot run Node —
 * GitHub Pages, Netlify, Cloudflare Pages — and only the account API and match
 * hub live elsewhere. Use the full origin, no trailing slash:
 *
 *   export const SERVER_ORIGIN = 'https://apexxi.onrender.com';
 *
 * The server must then be started with that page's origin allowed, e.g.
 * `ALLOW_ORIGIN=https://you.github.io node server/server.js`.
 */
export const SERVER_ORIGIN = '';

/** Absolute URL for an API path. */
export const apiURL = (path) => `${SERVER_ORIGIN}${path}`;

/** WebSocket URL for the match hub, matching the page's security level. */
export function socketURL() {
  if (SERVER_ORIGIN) return `${SERVER_ORIGIN.replace(/^http/, 'ws')}/ws`;
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

/** True when there is no server to talk to — used to explain the Online tab. */
export const onlineAvailable = () => !!SERVER_ORIGIN || location.protocol !== 'file:';
