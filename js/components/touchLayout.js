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
 *
 * v106: a player's own layout (settings.touchLayout, made in
 * components/touchEditor.js) is a size and, per button, a nudge from the arc
 * in units of a main button's size — so a layout made on one phone lands in
 * the same place, relatively, on another. Whatever it asks for, the buttons
 * stay on the screen, out of the stick's half and the HUD's top row, and
 * 10 px apart (fitLayout).
 */

export const SCALE_MIN = 0.8;
export const SCALE_MAX = 1.3;
const GAP = 10;

export const clampScale = (k) => (Number.isFinite(k) ? Math.max(SCALE_MIN, Math.min(SCALE_MAX, k)) : 1);

/** Is this a layout the player changed (anything but the plain arc)? */
export function isCustom(user) {
  if (!user) return false;
  if (clampScale(user.scale) !== 1) return true;
  return Object.values(user.offsets || {}).some((o) => o && (o.dx || o.dy));
}

function baseLayout(W, H, inset, k) {
  const B = Math.round(Math.max(56, Math.min(84, H * 0.19)) * k);   // a main button
  const S = Math.round(B * 1.22);                               // SPRINT
  const s = Math.round(Math.max(48, B * 0.7));                  // SKILL, LOB — Android's 48 dp at the least
  const rx = inset + S / 2; const ry = inset + S / 2;           // the thumb's rest, from the corner
  /* first ring: clear of SPRINT, and wide enough that neighbours 43° apart
     keep a 10 px gap (a chord of 2R·sin 21.5°) — the first cut had them touching */
  const R1 = Math.max(S / 2 + B / 2 + GAP, (B + GAP) / (2 * Math.sin(21.5 * Math.PI / 180))) + 1;   // +1: whole-pixel rounding
  const R2 = R1 + B / 2 + Math.max(B, s) / 2 + GAP;
  const at = (deg, r, size) => {
    const a = deg * Math.PI / 180;                              // 0° = left of the thumb, 90° = above it
    return { size, right: Math.round(rx + Math.cos(a) * r - size / 2), bottom: Math.round(ry + Math.sin(a) * r - size / 2) };
  };
  return {
    B,
    L: {
      sprint: { size: S, right: inset, bottom: inset },
      pass: at(4, R1, B),
      through: at(47, R1, B),
      shoot: at(90, R1, B),
      cross: at(8, R2, B),
      lob: at(40, R2, s),
      skill: at(68, R2, s),
    },
  };
}

/**
 * Where each button goes: its size and its offset from the bottom-right
 * corner (px). `user` is settings.touchLayout; `pin` names a button the
 * others make way for (the one being dragged in the editor).
 */
export function arcLayout(W, H, { inset = 12, user = null, pin = null } = {}) {
  const { B, L } = baseLayout(W, H, inset, clampScale(user?.scale));
  if (!isCustom(user)) return L;
  for (const [k, o] of Object.entries(user.offsets || {})) {
    const p = L[k];
    if (!p || !o) continue;
    // offsets are screen-wise (dx right, dy down); the layout counts from the bottom-right
    p.right -= (Number(o.dx) || 0) * B;
    p.bottom -= (Number(o.dy) || 0) * B;
  }
  return fitLayout(L, W, H, { pin });
}

/**
 * Keep every button on the screen, right of the stick's zone (46% of the
 * width), under the HUD's row (56 px) and 10 px from its neighbours, moving
 * them as little as it can: overlapping pairs are pushed apart along the
 * line between them, then everything is clamped back into bounds, and again.
 */
export function fitLayout(L, W, H, { pin = null, margin = 4, top = 56, stick = 0.46 } = {}) {
  const keys = Object.keys(L);
  const c = keys.map((k, i) => ({ k, i, r: L[k].size / 2, x: L[k].right + L[k].size / 2, y: L[k].bottom + L[k].size / 2 }));
  const maxX = W * (1 - stick); const maxY = H - top;
  const clamp = (p) => {
    p.x = Math.max(margin + p.r, Math.min(maxX - p.r, p.x));
    p.y = Math.max(margin + p.r, Math.min(maxY - p.r, p.y));
  };
  c.forEach(clamp);
  for (let it = 0; it < 300; it++) {
    let moved = false;
    for (let a = 0; a < c.length; a++) {
      for (let b = a + 1; b < c.length; b++) {
        const p = c[a]; const q = c[b];
        let dx = q.x - p.x; let dy = q.y - p.y; let d = Math.hypot(dx, dy);
        const need = p.r + q.r + GAP + 0.5;
        if (d >= need) continue;
        // two buttons on the same spot: part them along a fixed direction per pair
        if (d < 1e-6) { const ang = (a * 7 + b * 3) * 0.9; dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
        const push = need - d; const ux = dx / d; const uy = dy / d;
        const wp = p.k === pin ? 0 : q.k === pin ? 1 : 0.5;
        p.x -= ux * push * wp; p.y -= uy * push * wp;
        q.x += ux * push * (1 - wp); q.y += uy * push * (1 - wp);
        moved = true;
      }
    }
    c.forEach(clamp);
    if (!moved) break;
  }
  const out = {};
  for (const p of c) out[p.k] = { size: L[p.k].size, right: Math.round(p.x - p.r), bottom: Math.round(p.y - p.r) };
  return out;
}

/** The nudges (in button sizes) that put the buttons where `layout` has them. */
export function offsetsFrom(layout, W, H, scale, { inset = 12 } = {}) {
  const { B, L } = baseLayout(W, H, inset, clampScale(scale));
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const out = {};
  for (const k of Object.keys(L)) {
    if (!layout[k]) continue;
    const dx = r3((L[k].right - layout[k].right) / B); const dy = r3((L[k].bottom - layout[k].bottom) / B);
    if (dx || dy) out[k] = { dx, dy };
  }
  return out;
}

/** Put the pad's buttons where arcLayout says, for this screen. */
export function applyTouchLayout(pad, W = innerWidth, H = innerHeight, user = null, pin = null) {
  const L = arcLayout(W, H, { user, pin });
  pad.classList.add('arc');
  for (const el of pad.querySelectorAll('.tbtn[data-slot]')) {
    const p = L[el.dataset.slot];
    if (!p) continue;
    Object.assign(el.style, { width: `${p.size}px`, height: `${p.size}px`, right: `${p.right}px`, bottom: `${p.bottom}px` });
    el.style.setProperty('--tb-font', `${Math.max(9, Math.round(p.size * 0.155))}px`);
  }
  return L;
}

/** Back to the stylesheet's own layout (one-handed mode keeps its column). */
export function clearTouchLayout(pad) {
  pad.classList.remove('arc');
  for (const el of pad.querySelectorAll('.tbtn[data-slot]')) {
    for (const k of ['width', 'height', 'right', 'bottom']) el.style[k] = '';
    el.style.removeProperty('--tb-font');
  }
}
