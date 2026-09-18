/**
 * The error boundary.
 *
 * An uncaught error used to be whatever the browser felt like showing, which
 * on a phone is nothing: the screen stopped responding and the player was left
 * to guess. This catches the two channels an error can escape through
 * (`error` and `unhandledrejection`), puts a card over the page that says what
 * happened in plain words, offers the three things that actually help — carry
 * on, reload, or reload with a clean save — and posts a clipped report to the
 * server so the next build can fix it.
 *
 * Deliberately independent of the rest of the app: no imports from modules
 * that could themselves be the thing that broke.
 */
const SEEN_MAX = 3;                     // reports per page load; a loop must not spam
let seen = 0;
let card = null;
let version = '';
let lastMsg = '';

export function setVersion(v) { version = v; }

function report(message, stack, where) {
  if (seen >= SEEN_MAX) return;
  seen += 1;
  try {
    const body = JSON.stringify({ version, message, stack, where, url: location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon('api/crash', new Blob([body], { type: 'application/json' }));
    else fetch('api/crash', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch { /* reporting must never throw */ }
}

/* Errors that are noise, not crashes: a script tag from another origin with
 * no detail, a media element that could not autoplay, the network. */
const IGNORE = /Script error\.?$|ResizeObserver loop|AbortError|Load failed|NetworkError|Failed to fetch|play\(\) request/i;

function show(message, detail) {
  if (card) { card.querySelector('.crash-detail').textContent = detail; return; }
  card = document.createElement('div');
  card.className = 'crash';
  card.setAttribute('role', 'alertdialog');
  card.innerHTML = `
    <div class="crash-card">
      <p class="crash-eyebrow">Something went wrong</p>
      <h2>APEX XI hit an error</h2>
      <p class="crash-msg">Your progress is saved. You can carry on, or reload if the screen looks stuck.</p>
      <details><summary>Details</summary><pre class="crash-detail"></pre></details>
      <div class="crash-actions">
        <button class="btn primary" data-crash="continue">Carry on</button>
        <button class="btn" data-crash="reload">Reload</button>
        <button class="btn ghost" data-crash="menu">Back to menu</button>
      </div>
      <p class="crash-foot">A report was sent so this can be fixed. ${version}</p>
    </div>`;
  card.querySelector('.crash-detail').textContent = detail;
  card.addEventListener('click', (e) => {
    const act = e.target.closest('[data-crash]')?.dataset.crash;
    if (!act) return;
    if (act === 'continue') { card.remove(); card = null; return; }
    if (act === 'reload') { location.reload(); return; }
    if (act === 'menu') {
      card.remove(); card = null;
      import('./app.js').then((m) => m.navigate('menu')).catch(() => location.reload());
    }
  });
  document.body.appendChild(card);
}

function handle(message, stack, where) {
  const msg = String(message || 'Unknown error');
  if (IGNORE.test(msg)) return;
  if (msg === lastMsg) return;          // the same error every frame is one crash, not sixty
  lastMsg = msg;
  const detail = `${msg}\n${String(stack || '').split('\n').slice(0, 6).join('\n')}`;
  report(msg, stack, where);
  show(msg, detail);
}

export function install() {
  window.addEventListener('error', (e) => {
    handle(e.message || e.error?.message, e.error?.stack, `${e.filename || ''}:${e.lineno || 0}`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    handle(r?.message || (typeof r === 'string' ? r : 'Unhandled promise rejection'), r?.stack, 'promise');
  });
}

/** For screens that catch their own errors but still want the card. */
export const crash = (err, where = '') => handle(err?.message || String(err), err?.stack, where);
