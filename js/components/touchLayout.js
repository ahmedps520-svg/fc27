/**
 * The touch buttons, laid out around the right thumb (v105, backlog #20).
 *
 * They used to be a fixed grid, the same 72 px on every landscape phone, with
 * SKILL and LOB at its far left — about 250 px from where the right thumb
 * rests (tools/touch-audit.mjs), a stretch on a small phone and a hand shift
 * on a big one. Now they sit on two arcs round the thumb's rest point:
 *
 *   SPRINT under the thumb;
 *   PASS, THROUGH, SHOOT on the first ring (left, diagonal, up);
 *   CROSS, LOB, SKILL on the second — the rarer actions, still in reach.
 *
 * Sizes follow the screen's height, so an SE gets a pad that leaves it some
 * pitch and a Pro Max one its thumb can find without looking.
 */

/** Where each button goes: its size and its offset from the bottom-right corner (px). */
export function arcLayout(W, H, { inset = 12 } = {}) {
  const B = Math.round(Math.max(56, Math.min(84, H * 0.19)));   // a main button
  const S = Math.round(B * 1.22);                               // SPRINT
  const s = Math.round(Math.max(48, B * 0.7));                  // SKILL, LOB — Android's 48 dp at the least
  const rx = inset + S / 2; const ry = inset + S / 2;           // the thumb's rest, from the corner
  const GAP = 10;
  /* first ring: clear of SPRINT, and wide enough that neighbours 43° apart
     keep a 10 px gap (a chord of 2R·sin 21.5°) — the first cut had them touching */
  const R1 = Math.max(S / 2 + B / 2 + GAP, (B + GAP) / (2 * Math.sin(21.5 * Math.PI / 180))) + 1;   // +1: whole-pixel rounding
  const R2 = R1 + B / 2 + Math.max(B, s) / 2 + GAP;
  const at = (deg, r, size) => {
    const a = deg * Math.PI / 180;                              // 0° = left of the thumb, 90° = above it
    return { size, right: Math.round(rx + Math.cos(a) * r - size / 2), bottom: Math.round(ry + Math.sin(a) * r - size / 2) };
  };
  return {
    sprint: { size: S, right: inset, bottom: inset },
    pass: at(4, R1, B),
    through: at(47, R1, B),
    shoot: at(90, R1, B),
    cross: at(8, R2, B),
    lob: at(40, R2, s),
    skill: at(68, R2, s),
  };
}

/** Put the pad's buttons where arcLayout says, for this screen. */
export function applyTouchLayout(pad, W = innerWidth, H = innerHeight) {
  const L = arcLayout(W, H);
  pad.classList.add('arc');
  for (const el of pad.querySelectorAll('.tbtn[data-slot]')) {
    const p = L[el.dataset.slot];
    if (!p) continue;
    Object.assign(el.style, { width: `${p.size}px`, height: `${p.size}px`, right: `${p.right}px`, bottom: `${p.bottom}px` });
    el.style.setProperty('--tb-font', `${Math.max(9, Math.round(p.size * 0.155))}px`);
  }
}

/** Back to the stylesheet's own layout (one-handed mode keeps its column). */
export function clearTouchLayout(pad) {
  pad.classList.remove('arc');
  for (const el of pad.querySelectorAll('.tbtn[data-slot]')) {
    for (const k of ['width', 'height', 'right', 'bottom']) el.style[k] = '';
    el.style.removeProperty('--tb-font');
  }
}
