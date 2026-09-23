/**
 * On-screen keyboard (v89) — text entry with only a controller.
 *
 * Opened by the pad driver when A is pressed on a text field. A grid of keys
 * the ring moves over like any other screen; A types, X deletes, Y toggles
 * case, Start (or the Done key) accepts, B cancels and puts the old value
 * back. Numbers-only fields get a number pad. The field's own input and
 * change events fire as if the person had typed, so screens need no changes.
 *
 * Original layout and wording; nothing here names a platform's keyboard.
 */
const ROWS_ABC = ['1234567890', 'qwertyuiop', 'asdfghjkl-', 'zxcvbnm_.@'];
const ROWS_NUM = ['123', '456', '789', '0'];

let open = null;

export const oskOpen = () => !!open;

/** Open the keyboard for `field`. Returns a function that closes it. */
export function openOsk(field) {
  if (open) open.close(false);
  const numeric = field.type === 'number' || field.inputMode === 'numeric';
  const max = field.maxLength > 0 ? field.maxLength : 64;
  const before = field.value;
  let upper = false;

  const wrap = document.createElement('div');
  wrap.className = 'osk-layer';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-label', 'Keyboard');
  const rows = numeric ? ROWS_NUM : ROWS_ABC;
  const keyBtn = (k) => `<button class="osk-key" data-osk="${k}">${k}</button>`;
  const paint = () => {
    wrap.innerHTML = `
      <div class="osk-card">
        <div class="osk-field" aria-live="polite">${escape(field.value) || `<i>${escape(field.placeholder || '')}</i>`}<span class="osk-caret"></span></div>
        ${rows.map((r) => `<div class="osk-row">${[...r].map((k) => keyBtn(upper ? k.toUpperCase() : k)).join('')}</div>`).join('')}
        <div class="osk-row osk-actions">
          ${numeric ? '' : `<button class="osk-key wide" data-osk-act="shift" data-pad="y">${upper ? 'abc' : 'ABC'}</button>
          <button class="osk-key wide" data-osk-act="space">Space</button>`}
          <button class="osk-key wide" data-osk-act="del" data-pad="x">Delete</button>
          <button class="osk-key wide osk-done" data-osk-act="done">Done</button>
        </div>
        <p class="osk-hint">A type · X delete${numeric ? '' : ' · Y capitals'} · Start done · B cancel</p>
      </div>`;
  };
  const emit = () => { field.dispatchEvent(new Event('input', { bubbles: true })); };
  const type = (ch) => { if (field.value.length < max) { field.value += ch; emit(); paint(); } };
  const del = () => { field.value = field.value.slice(0, -1); emit(); paint(); };

  wrap.addEventListener('click', (e) => {
    const k = e.target.closest('[data-osk]');
    if (k) { type(k.dataset.osk); return; }
    const a = e.target.closest('[data-osk-act]')?.dataset.oskAct;
    if (a === 'del') del();
    else if (a === 'space') type(' ');
    else if (a === 'shift') { upper = !upper; paint(); }
    else if (a === 'done') close(true);
  });

  function close(accept) {
    if (!open) return;
    if (!accept) { field.value = before; emit(); }
    else field.dispatchEvent(new Event('change', { bubbles: true }));
    wrap.remove();
    open = null;
    field.focus?.({ preventScroll: true });
  }

  paint();
  document.body.appendChild(wrap);
  open = { close, wrap };
  return close;
}

/** Called by the pad driver: true when the keyboard took the button. */
export function oskButton(i) {
  if (!open) return false;
  if (i === 1) { open.close(false); return true; }            // B: cancel
  if (i === 9) { open.close(true); return true; }             // Start: done
  return false;
}

export const oskRoot = () => open?.wrap || null;

function escape(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
