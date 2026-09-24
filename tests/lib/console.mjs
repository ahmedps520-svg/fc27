/**
 * R15 final hardening (v100): one watcher for everything a page complains
 * about, so "zero console errors" means the same thing in every QA run.
 *
 * Counted: uncaught exceptions, console.error, and any response of 400 or
 * more from our own server — a missing file is a bug even when the page
 * carries on. Not counted, and only these: the software GPU's own WebGL
 * noise, and the browser's automatic favicon.ico guess (the page names its
 * icons). The old per-script filters also hid "Failed to load resource" and
 * net::ERR, which is exactly how a 404 would have gone unseen.
 */
const BENIGN = /WebGL context|Error creating WebGL|GPU stall due to ReadPixels|GL_INVALID|swiftshader/i;

/** Watch `page`; returns the list it fills. `origin` limits response checks to our server. */
export function watchConsole(page, { tag = '', origin = '', allow = null } = {}) {
  const found = [];
  const add = (s) => { const t = `${tag ? `${tag}: ` : ''}${s}`.slice(0, 300); if (!found.includes(t)) found.push(t); };
  page.on('pageerror', (e) => add(`page error ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (BENIGN.test(t) || (allow && allow.test(t))) return;
    // the browser's own line for a failed response; the response hook below names the URL
    if (/^Failed to load resource/.test(t)) return;
    add(`console: ${t}`);
  });
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() < 400 || (origin && !u.startsWith(origin))) return;
    if (/\/favicon\.ico$/.test(u)) return;
    if (allow && allow.test(u)) return;
    add(`HTTP ${r.status()} ${u.replace(origin, '')}`);
  });
  return found;
}

/** Only the response half: any 4xx/5xx from `origin` goes into `list`. For
 *  scripts that keep their own console filter (a few of their flows provoke
 *  network errors on purpose, and allow them by message). */
export function watchResponses(page, origin, list, tag = '', allow = null) {
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() < 400 || !u.startsWith(origin) || /\/favicon\.ico$/.test(u) || (allow && allow.test(u))) return;
    const t = `${tag ? `${tag}: ` : ''}HTTP ${r.status()} ${u.replace(origin, '')}`;
    if (!list.includes(t)) list.push(t);
  });
}
