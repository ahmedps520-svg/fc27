/**
 * The cloud-save conflict screen (v87).
 *
 * When this device and the account both hold real progress, and they are not
 * the same save, the player chooses — with what each one holds in front of
 * them — instead of a progress score choosing for them. Whichever is not
 * picked is kept as a backup (Settings → Save), so neither choice loses
 * anything for good.
 */
import { summary } from '../saveSafety.js';

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const when = (ms) => (ms ? new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'unknown');

/** Is this a choice worth asking about? Both sides have progress, and they differ. */
export function isRealConflict(cloud, local) {
  if (!cloud || !local) return false;
  if ((cloud.meta?.adminRev || 0) !== (local.meta?.adminRev || 0)) return false;   // an operator correction is an instruction
  const a = summary(cloud); const b = summary(local);
  if (a.weight < 12 || b.weight < 12) return false;
  if (a.savedAt && b.savedAt && a.savedAt === b.savedAt) return false;
  return a.weight !== b.weight || JSON.stringify(cloud.club?.collection || []) !== JSON.stringify(local.club?.collection || []);
}

/** Ask. Resolves 'local' or 'cloud'. */
export function chooseSave(local, cloud) {
  return new Promise((resolve) => {
    const L = summary(local); const C = summary(cloud);
    const el = document.createElement('div');
    el.className = 'np-layer sc-layer in';
    el.innerHTML = `
      <div class="np-scrim"></div>
      <article class="np-card sc-card" role="dialog" aria-modal="true" aria-labelledby="scTitle">
        <h2 id="scTitle">Two saves</h2>
        <p class="sc-lede">This device and your account have different progress. Choose which to play on — the other is kept as a backup in Settings → Save.</p>
        <div class="sc-grid">
          <button class="sc-opt" data-pick="local">
            <b>This device</b><em>Saved ${esc(when(L.savedAt))}</em>
            <ul>${L.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </button>
          <button class="sc-opt" data-pick="cloud">
            <b>Your account</b><em>Saved ${esc(when(C.savedAt))}</em>
            <ul>${C.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </button>
        </div>
      </article>`;
    document.body.appendChild(el);
    el.querySelector(C.weight > L.weight ? '[data-pick="cloud"]' : '[data-pick="local"]').focus();
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (!b) return;
      el.remove();
      resolve(b.dataset.pick);
    });
  });
}
