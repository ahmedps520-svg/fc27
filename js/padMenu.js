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
  // v89: fields and sliders are reachable too — A on a text field opens the
  // on-screen keyboard, left/right moves a slider
  'input:not([type=hidden]):not([disabled])', 'textarea', '[role=slider]',
  // v89: everything a screen listens for clicks on by data attribute (pitch
  // slots, cards, listings, drills...) — before this a controller could not
  // pick a player up and put him in a slot
  '[data-slot], [data-role], [data-pick], [data-mode], [data-filter], [data-weather], [data-watch], [data-venue]',
  '[data-utab], [data-task], [data-talk], [data-tactic], [data-subon], [data-suboff], [data-submit], [data-stab]',
  '[data-sq-save], [data-sq-load], [data-sq-del], [data-speed], [data-skill], [data-shout], [data-sell], [data-sbc]',
  '[data-prac], [data-pm], [data-player], [data-photo], [data-part], [data-osk-act], [data-osk], [data-o]',
  '[data-nav], [data-listing], [data-len], [data-lang], [data-kit], [data-inv], [data-group], [data-format]',
  '[data-form], [data-evolve], [data-evo-start], [data-evo-cancel], [data-emote], [data-drill], [data-detail], [data-cycle]',
  '[data-ctab], [data-country-pick], [data-country], [data-club], [data-close], [data-clear], [data-clash-level], [data-clash]',
  '[data-cancel-pick], [data-cam], [data-buynow], [data-buy-icon], [data-bset], [data-bid], [data-bench], [data-bclear]',
  '[data-bclaim], [data-time], [data-go]',
].join(',');

const CARDLIKE = '[data-player], [data-slot], [data-listing], [data-bench], .tile, .coll-item';

let focusIdx = 0;
let idleT = 0;           // v89: seconds since the ring list was last built
let glyphT = 0;          // ...and since the quick-action glyphs were last painted
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

/* v89: which layer owns the ring. A modal layer appended to <body> (the
   release notes, a save conflict, the on-screen keyboard, a pack reveal, a
   ceremony) takes it while it is up: the last full-screen, fixed layer in the
   document that holds a button, or anything marked as a modal dialog. */
const MODAL_LAYERS = '.np-layer, .osk-layer, [role=dialog][aria-modal=true], #onboardOverlay, .pg-layer, .pair-overlay';
function modalLayer() {
  const osk = oskRoot(); if (osk) return osk;
  // the known modal layers, wherever they were mounted (the release notes sit inside #screen)
  const known = [...document.querySelectorAll(MODAL_LAYERS)].filter((el) => !el.hidden && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && el.querySelector('button'));
  if (known.length) { const top = known[known.length - 1]; return top.closest('.np-layer, .osk-layer, #onboardOverlay, .pg-layer, .pair-overlay') || top; }
  const kids = [...document.body.children].reverse();
  for (const el of kids) {
    if (el.id === 'screen' || el.hidden || !el.querySelector) continue;
    if (el.matches('.toast, .screen-ghost, .bg-grid, .bg-orb, script, style, link')) continue;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const dialog = el.matches('[role=dialog][aria-modal=true]') || el.querySelector(':scope > [role=dialog][aria-modal=true], :scope [aria-modal=true]');
    const r = el.getBoundingClientRect();
    const big = (st.position === 'fixed' || st.position === 'absolute') && r.width > innerWidth * 0.6 && r.height > innerHeight * 0.6;
    if ((dialog || big) && el.querySelector('button')) return el;
  }
  return null;
}

function items() {
  const root = document.getElementById('screen');
  if (!root) return [];
  // an open overlay owns the focus ring while it is up
  const overlay = modalLayer() || root.querySelector('.detail-overlay:not([hidden]), .pack-overlay:not([hidden])');
  const scope = overlay || root;
  const all = [...scope.querySelectorAll(SELECTOR)].filter(visible);
  // a wrapper around other controls is not a stop of its own — only the innermost are
  const set = new Set(all); const wrappers = new Set();
  for (const el of all) for (let p = el.parentElement; p && p !== scope; p = p.parentElement) if (set.has(p)) wrappers.add(p);
  // ...except cards: a card is picked with A, and its own buttons (sell, details) are stops too
  return wrappers.size ? all.filter((el) => !wrappers.has(el) || el.matches(CARDLIKE)) : all;
}

/* v89: B inside a modal layer closes it — its own close control if it has
   one, otherwise the Escape it already listens for. */
function closeLayer(layer) {
  const btn = layer.querySelector('[data-close], .close, [aria-label=Close], [id$=Close], [id$=close], .np-x, .x-btn');
  if (btn && visible(btn)) { btn.click(); return true; }
  const esc = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
  (document.activeElement || document.body).dispatchEvent(esc); window.dispatchEvent(esc);
  return true;
}

/* v89: LB / RB step through the screen's tabs — the first visible tab strip
   (a .tabs nav, a role=tablist, or a segmented control) with one marked on. */
function cycleTabs(dir) {
  const scope = modalLayer() || document.getElementById('screen');
  const strips = [...scope.querySelectorAll('.tabs, [role=tablist], .seg')].filter((g) => visible(g) && g.querySelector('.on, [aria-selected=true]'));
  const strip = strips[0]; if (!strip) return false;
  const tabs = [...strip.querySelectorAll('button, [role=tab]')].filter(visible);
  const cur = tabs.findIndex((b) => b.classList.contains('on') || b.getAttribute('aria-selected') === 'true');
  const next = tabs[(cur + dir + tabs.length) % tabs.length];
  if (!next || next === tabs[cur]) return false;
  next.click(); sfx('move');
  return true;
}

/* v89: X / Y quick actions — an element marked data-pad="x" or "y" in the
   layer that owns the ring, with its glyph shown beside it while a pad is in use. */
function quick(letter) {
  const scope = modalLayer() || document.getElementById('screen');
  const el = [...scope.querySelectorAll(`[data-pad="${letter}"]`)].find(visible);
  if (!el) return false;
  activate(el); return true;
}
function paintGlyphs(on) {
  document.body.classList.toggle('pad-active', on);
  if (!on) return;
  for (const el of document.querySelectorAll('[data-pad]')) {
    const g = padGlyph({ a: 0, b: 1, x: 2, y: 3 }[el.dataset.pad]);
    if (el.dataset.padGlyph !== g) el.dataset.padGlyph = g;
  }
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

import { sfx, resumeAudio } from './audio.js';
import { openOsk, oskButton, oskRoot } from './components/osk.js';
import { padGlyph } from './game/input.js';
import { readPad } from './game/padRead.js';

function activate(el) {
  if (!el) return;
  if ((el.tagName === 'INPUT' && /^(text|search|email|number|tel|url|password|)$/.test(el.type)) || el.tagName === 'TEXTAREA') { openOsk(el); return; }
  if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) { el.click(); return; }
  if (el.tagName === 'INPUT' && el.type === 'file') { el.click(); return; }
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

  // Settings is listening for a button to bind: nothing here may act on it (v90)
  if (document.body.classList.contains('pad-capture')) {
    // keep tracking what is held, so the button just bound is not also a press here
    const pd = readPad();
    prevButtons = pd ? pd.buttons.map((b) => b.pressed) : prevButtons;
    return;
  }
  // v123: the pad in the player's hands, in the standard layout (padRead.js)
  const pad = readPad();
  if (!pad) { if (document.body.classList.contains('pad-active')) paintGlyphs(false); return; }

  /* v88: back and home first. A screen with nothing focusable (the trophy
     room) used to return before these were read, and a controller player
     was stranded there. */
  const down = pad.buttons.map((b) => b.pressed);
  const hit = (i) => down[i] && !prevButtons[i];
  const anyHit = down.some((d, i) => d && !prevButtons[i]);
  if (anyHit) resumeAudio();
  glyphT += dt; idleT += dt;
  if (glyphT > 0.5 || anyHit) { glyphT = 0; paintGlyphs(true); }
  // the on-screen keyboard owns B (cancel) and Start (done)
  if ((hit(1) && oskButton(1)) || (hit(9) && oskButton(9))) { prevButtons = down; return; }
  if (hit(1)) {                                               // circle / B = back
    prevButtons = down;
    const layer = modalLayer();
    if (layer) { closeLayer(layer); return; }
    const back = document.getElementById('backBtn');
    if (back && !back.hidden) back.click();
    return;
  }
  if (hit(9)) { prevButtons = down; document.getElementById('homeBtn')?.click(); return; }   // options = home
  // v89: tabs on the bumpers, quick actions on X / Y
  if (hit(4) || hit(5)) { prevButtons = down; cycleTabs(hit(5) ? 1 : -1); return; }
  if (hit(2) && quick('x')) { prevButtons = down; return; }
  if (hit(3) && quick('y')) { prevButtons = down; return; }
  // v89: the right stick scrolls whatever the ring is in
  const ry = pad.axes[3] || 0;
  if (Math.abs(ry) > 0.25) {
    const scroller = document.scrollingElement || document.documentElement;
    const inner = modalLayer()?.querySelector('.np-body, .np-card, .osk-card') || null;
    (inner || scroller).scrollBy({ top: ry * 900 * dt });
  }

  let x = pad.axes[0] || 0;
  let y = pad.axes[1] || 0;
  if (pad.buttons[12]?.pressed) y = -1;
  if (pad.buttons[13]?.pressed) y = 1;
  if (pad.buttons[14]?.pressed) x = -1;
  if (pad.buttons[15]?.pressed) x = 1;

  const dir = Math.abs(x) > DEAD || Math.abs(y) > DEAD
    ? (Math.abs(x) > Math.abs(y) ? (x > 0 ? 1 : 2) : (y > 0 ? 3 : 4))
    : 0;

  /* v89: the list is built only when there is something to do with it — a
     press, a direction, or a slow refresh so the ring follows a layout that
     moved. Building it every tick cost 10 ms a tick on the Grounds screen at
     4x CPU throttle, most of a phone's frame, with the pad just lying there. */
  const quiet = !anyHit && !dir && !lastDir;
  if (quiet && idleT < 0.25) { prevButtons = down; return; }
  idleT = 0;
  const list = items();
  if (!list.length) { prevButtons = down; lastDir = dir; return; }
  if (focusIdx >= list.length) focusIdx = 0;

  const focused = list[focusIdx];
  const slider = focused && ((focused.tagName === 'INPUT' && focused.type === 'range') || focused.getAttribute?.('role') === 'slider');
  if (slider && (dir === 1 || dir === 2) && (dir !== lastDir || holdT <= 0)) {
    // v89: left / right move a slider rather than the ring
    if (focused.tagName === 'INPUT') {
      const st = Number(focused.step) || 1; const span = (Number(focused.max) || 100) - (Number(focused.min) || 0);
      const inc = Math.max(st, Math.round(span / 40 / st) * st);
      focused.value = String(Math.min(Number(focused.max || 100), Math.max(Number(focused.min || 0), Number(focused.value) + (dir === 1 ? inc : -inc))));
      focused.dispatchEvent(new Event('input', { bubbles: true })); focused.dispatchEvent(new Event('change', { bubbles: true }));
    } else focused.dispatchEvent(new KeyboardEvent('keydown', { key: dir === 1 ? 'ArrowRight' : 'ArrowLeft', bubbles: true }));
    sfx('move');
    holdT = dir !== lastDir ? REPEAT * 1.8 : REPEAT * 0.5;
    lastDir = dir; holdT -= dt; prevButtons = down; paint(list);
    return;
  }
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

  if (hit(0)) activate(list[focusIdx]);                       // cross / A
  prevButtons = down;

  paint(list);
}

/* v87: the keyboard version. Arrow keys move real focus by the same screen
 * geometry (Tab still walks the DOM order); Enter and Space are the browser's
 * own activation. Not while typing, not in a match, not with a modifier. */
function onKey(e) {
  if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
  if (document.body.classList.contains('in-game')) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable || t.closest?.('[role=slider]'))) return;
  const list = items().filter((el) => el.tabIndex >= 0 || el.matches('button, a[href], select'));
  if (!list.length) return;
  const cur = list.indexOf(document.activeElement);
  focusIdx = cur >= 0 ? cur : 0;
  if (cur >= 0) {
    // screen directions, in either language: the step is geometric
    const [dx, dy] = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
    step(list, dx, dy);
  }
  e.preventDefault();
  list[focusIdx]?.focus({ preventScroll: false });
  list[focusIdx]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/* v88: a read-only view for the controller-reachability test (tests/qa/pad-reach.mjs):
   the list the ring moves over, where it is, and where a direction would take it. */
if (typeof window !== 'undefined') {
  window.__padMenu = {
    list: () => items(),
    focus: () => focusIdx,
    peek(i, d) {
      const list = items(); const keep = focusIdx; focusIdx = i;
      const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d];
      step(list, dx, dy); const out = focusIdx; focusIdx = keep; return out;
    },
  };
}

export function startPadMenu() {
  window.addEventListener('keydown', onKey);
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
