/**
 * Gamepad driver for the front-end screens. Keeps a focus ring over whatever is
 * clickable on the current screen so the whole app can be used from the couch.
 * It stands down during a match — the pitch and the pause menu read the pad
 * themselves.
 */
const DEAD = 0.55;
const REPEAT = 0.22;      // seconds between steps while a direction is held

const SELECTOR = [
  'button:not([disabled]):not([hidden])',
  '[data-go]', '[data-pick]', '[data-nav]', '[data-club]', '[data-form]',
  'select', '.coll-item', '.tile',
].join(',');

let focusIdx = 0;
let holdT = 0;
let lastDir = 0;
let prevButtons = [];
let raf = null;

const visible = (el) => {
  if (el.hidden || el.disabled) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return false;
  const s = getComputedStyle(el);
  return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
};

function items() {
  const root = document.getElementById('screen');
  if (!root) return [];
  // an open overlay owns the focus ring while it is up
  const overlay = root.querySelector('.detail-overlay:not([hidden]), .pack-overlay:not([hidden])');
  const scope = overlay || root;
  return [...scope.querySelectorAll(SELECTOR)].filter(visible);
}

function paint(list) {
  document.querySelectorAll('.pad-focus').forEach((e) => e.classList.remove('pad-focus'));
  const el = list[focusIdx];
  if (!el) return;
  el.classList.add('pad-focus');
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/** Move by screen geometry, so left/right and up/down feel physical. */
function step(list, dx, dy) {
  const cur = list[focusIdx];
  if (!cur) { focusIdx = 0; return; }
  const a = cur.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;

  let best = -1;
  let bestScore = Infinity;
  list.forEach((el, i) => {
    if (el === cur) return;
    const r = el.getBoundingClientRect();
    const bx = r.left + r.width / 2;
    const by = r.top + r.height / 2;
    const vx = bx - ax;
    const vy = by - ay;
    // must be meaningfully in the requested direction
    const along = vx * dx + vy * dy;
    if (along <= 6) return;
    const off = Math.abs(vx * dy - vy * dx);
    const score = along + off * 2.2;
    if (score < bestScore) { bestScore = score; best = i; }
  });

  // Nothing that way (a single row, the end of a list) — fall back to DOM order
  // so a direction press always does something rather than dead-ending.
  if (best < 0) {
    const fwd = dx > 0 || dy > 0;
    best = (focusIdx + (fwd ? 1 : -1) + list.length) % list.length;
  }
  focusIdx = best;
}

import { sfx } from './audio.js';

function activate(el) {
  if (!el) return;
  if (el.tagName === 'SELECT') {
    el.selectedIndex = (el.selectedIndex + 1) % el.options.length;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }
  el.click();
}

function tick(dt) {
  // hands off while a match is running; play.js drives the pad there
  if (document.body.classList.contains('in-game')) {
    document.querySelectorAll('.pad-focus').forEach((e) => e.classList.remove('pad-focus'));
    return;
  }

  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  const pad = pads.find((g) => g && g.connected);
  if (!pad) return;

  const list = items();
  if (!list.length) return;
  if (focusIdx >= list.length) focusIdx = 0;

  let x = pad.axes[0] || 0;
  let y = pad.axes[1] || 0;
  if (pad.buttons[12]?.pressed) y = -1;
  if (pad.buttons[13]?.pressed) y = 1;
  if (pad.buttons[14]?.pressed) x = -1;
  if (pad.buttons[15]?.pressed) x = 1;

  const dir = Math.abs(x) > DEAD || Math.abs(y) > DEAD
    ? (Math.abs(x) > Math.abs(y) ? (x > 0 ? 1 : 2) : (y > 0 ? 3 : 4))
    : 0;

  if (dir && (dir !== lastDir || holdT <= 0)) {
    if (dir === 1) step(list, 1, 0);
    else if (dir === 2) step(list, -1, 0);
    else if (dir === 3) step(list, 0, 1);
    else step(list, 0, -1);
    sfx('move');
    holdT = dir !== lastDir ? REPEAT * 1.8 : REPEAT;
  }
  holdT -= dt;
  lastDir = dir;

  const down = pad.buttons.map((b) => b.pressed);
  const hit = (i) => down[i] && !prevButtons[i];
  if (hit(0)) activate(list[focusIdx]);                       // cross
  if (hit(1)) {                                               // circle = back
    const back = document.getElementById('backBtn');
    if (back && !back.hidden) back.click();
  }
  if (hit(9)) document.getElementById('homeBtn')?.click();    // options = home
  prevButtons = down;

  paint(list);
}

export function startPadMenu() {
  // A timer rather than requestAnimationFrame: this is input polling, it does not
  // need to be frame-synced, and it keeps working when the window is not
  // compositing (occluded, background, embedded preview).
  let last = performance.now();
  raf = setInterval(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    try { tick(dt); } catch { /* never let the menu driver break the app */ }
  }, 16);
}

export function resetPadFocus() {
  focusIdx = 0;
  holdT = 0;
  lastDir = 0;
}

export function stopPadMenu() {
  if (raf) clearInterval(raf);
  raf = null;
}
