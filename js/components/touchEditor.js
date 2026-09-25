/**
 * The touch button editor (v106, backlog #20): Settings → Accessibility →
 * Touch buttons. The match's own buttons over a stand-in pitch, at this
 * screen's size: drag one and the others make way; the slider sizes them all
 * (80–130%); Reset puts back the arc. Arrow keys nudge the focused button.
 *
 * What is saved (settings.touchLayout) is a size and a nudge per button in
 * units of a main button's size, measured from the arc
 * (components/touchLayout.js) — so it carries to a phone of another size.
 */
import { applyTouchLayout, arcLayout, offsetsFrom, clampScale, isCustom, SCALE_MIN, SCALE_MAX } from './touchLayout.js';

const BUTTONS = [['cross', 'CROSS'], ['through', 'THROUGH'], ['shoot', 'SHOOT'], ['pass', 'PASS'], ['sprint', 'SPRINT'], ['skill', 'SKILL'], ['lob', 'LOB']];

/** Open the editor on `current` (settings.touchLayout). Resolves the new layout, null for the plain arc, or undefined if cancelled. */
export function openTouchEditor(current) {
  return new Promise((resolve) => {
    let draft = { scale: clampScale(current?.scale), offsets: { ...(current?.offsets || {}) } };
    const el = document.createElement('div');
    el.className = 'tedit';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Customise touch buttons');
    el.innerHTML = `
      <div class="tedit-stick" aria-hidden="true"><span>Stick</span></div>
      <div class="tedit-bar">
        <label class="tedit-size">Size <input type="range" id="teSize" min="${SCALE_MIN * 100}" max="${SCALE_MAX * 100}" step="5" value="${Math.round(draft.scale * 100)}"><output id="teSizeOut">${Math.round(draft.scale * 100)}%</output></label>
        <button class="btn ghost sm" id="teReset">Reset</button>
        <button class="btn ghost sm" id="teCancel">Cancel</button>
        <button class="btn primary sm" id="teDone">Done</button>
      </div>
      <p class="tedit-hint" id="teHint">Drag a button to move it.</p>
      <div class="tpad arc" id="tePad">${BUTTONS.map(([slot, label]) => `<button class="tbtn t-${slot}" data-slot="${slot}" aria-label="${label} — drag, or use the arrow keys, to move"><b>${label}</b></button>`).join('')}</div>`;
    document.body.appendChild(el);
    const pad = el.querySelector('#tePad');
    const size = () => ({ W: el.clientWidth || innerWidth, H: el.clientHeight || innerHeight });
    let shown = null;
    const draw = (pin = null) => { const { W, H } = size(); shown = applyTouchLayout(pad, W, H, draft, pin); };
    // whatever is on screen becomes the draft, so what the player lets go of is what is saved
    const settle = () => { const { W, H } = size(); draft = { scale: draft.scale, offsets: offsetsFrom(shown, W, H, draft.scale) }; draw(); };
    const hint = el.querySelector('#teHint');
    const portrait = () => { hint.textContent = innerHeight > innerWidth ? 'Turn the phone sideways to see the match layout. Drag a button to move it.' : 'Drag a button to move it.'; };
    portrait(); draw();
    const onResize = () => { portrait(); draw(); };
    window.addEventListener('resize', onResize);

    // moving one button: its nudge follows the finger, the others make way
    const moveTo = (slot, right, bottom) => {
      const { W, H } = size();
      const B = arcLayout(W, H, { user: { scale: draft.scale } }).pass.size;
      const base = arcLayout(W, H, { user: { scale: draft.scale } })[slot];
      draft.offsets = { ...offsetsFrom(shown, W, H, draft.scale), [slot]: { dx: (base.right - right) / B, dy: (base.bottom - bottom) / B } };
      draw(slot);
    };
    let drag = null;
    pad.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.tbtn'); if (!b) return;
      e.preventDefault(); b.setPointerCapture?.(e.pointerId); b.classList.add('is-down');
      const p = shown[b.dataset.slot];
      drag = { b, id: e.pointerId, x: e.clientX, y: e.clientY, right: p.right, bottom: p.bottom };
    });
    pad.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      moveTo(drag.b.dataset.slot, drag.right - (e.clientX - drag.x), drag.bottom - (e.clientY - drag.y));
    });
    const end = (e) => { if (!drag || e.pointerId !== drag.id) return; drag.b.classList.remove('is-down'); drag = null; settle(); };
    pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end);
    pad.addEventListener('keydown', (e) => {
      const b = e.target.closest('.tbtn'); const d = { ArrowLeft: [8, 0], ArrowRight: [-8, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] }[e.key];
      if (!b || !d) return;
      e.preventDefault();
      const p = shown[b.dataset.slot];
      moveTo(b.dataset.slot, p.right + d[0], p.bottom + d[1]); settle();
    });

    const sizeIn = el.querySelector('#teSize'); const sizeOut = el.querySelector('#teSizeOut');
    sizeIn.addEventListener('input', () => { draft.scale = clampScale(Number(sizeIn.value) / 100); sizeOut.textContent = `${Math.round(draft.scale * 100)}%`; draw(); });
    sizeIn.addEventListener('change', settle);
    el.querySelector('#teReset').addEventListener('click', () => { draft = { scale: 1, offsets: {} }; sizeIn.value = 100; sizeOut.textContent = '100%'; draw(); });
    const close = (result) => { window.removeEventListener('resize', onResize); document.removeEventListener('keydown', onKey); el.remove(); resolve(result); };
    const onKey = (e) => { if (e.key === 'Escape') close(undefined); };
    document.addEventListener('keydown', onKey);
    el.querySelector('#teCancel').addEventListener('click', () => close(undefined));
    el.querySelector('#teDone').addEventListener('click', () => close(isCustom(draft) ? draft : null));
    el.querySelector('#teDone').focus();
  });
}
