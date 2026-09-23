/* Unified input: DualSense / any standard gamepad, keyboard, and touch. */

const DEAD = 0.22;

// A binding may fire more than one action — R1 switches players off the ball and
// doubles as the curl modifier while shooting.
// Two keyboard sets exist so couch play works even with a single pad, or none.
const KEYSETS = {
  primary: {
    Space: 'pass', KeyJ: 'cross', KeyK: 'shoot', KeyL: 'through', KeyU: 'lob', KeyH: 'skill',
    KeyQ: 'switch', KeyE: ['switch', 'curl'], KeyI: 'curl',
    ShiftLeft: 'sprint',
    Escape: 'pause', KeyP: 'pause',
  },
  secondary: {
    Numpad1: 'pass', Enter: 'pass',
    Numpad2: 'shoot', Numpad3: 'cross', Numpad5: 'through', Numpad6: 'lob', Numpad4: 'skill',
    Numpad0: ['switch', 'curl'], NumpadDecimal: 'curl',
    NumpadAdd: 'sprint', ShiftRight: 'sprint',
    Escape: 'pause',
  },
};

const MOVE_SETS = {
  primary: {
    KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0],
  },
  secondary: {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  },
};

// Standard gamepad mapping — on a DualSense: 0 ✕, 1 ○, 2 □, 3 △, 4 L1, 5 R1, 6 L2, 7 R2, 9 Options.
const PAD_ACTIONS = {
  0: 'pass', 1: 'shoot', 2: 'cross', 3: 'through',
  4: 'switch', 5: ['switch', 'curl'], 6: 'skill', 7: 'sprint', 8: 'lob', 9: 'pause',
};

export const ACTIONS = ['pass', 'shoot', 'cross', 'through', 'lob', 'skill', 'switch', 'curl', 'sprint', 'pause'];

/* ---------------------------------------------------------------- *
 * v82: rebinding and prompts
 *
 * The defaults above stay the defaults. A player's changes are kept as
 * { keys: { action: code }, pad: { action: buttonIndex } } (settings.controls)
 * and laid over them for the primary seat — the one a single player uses and
 * the one a controller drives. Binding an input moves it: a key or button can
 * only mean one thing.
 * ---------------------------------------------------------------- */
let OVERRIDE = { keys: {}, pad: {} };
export function setBindings(b) { OVERRIDE = { keys: { ...(b?.keys || {}) }, pad: { ...(b?.pad || {}) } }; }
export const getBindings = () => ({ keys: { ...OVERRIDE.keys }, pad: { ...OVERRIDE.pad } });
function laid(base, over) {
  const out = { ...base };
  for (const [action, code] of Object.entries(over)) {
    for (const [k, v] of Object.entries(out)) {
      const acts = Array.isArray(v) ? v : [v];
      if (acts.includes(action)) { const rest = acts.filter((a) => a !== action); if (rest.length) out[k] = rest.length === 1 ? rest[0] : rest; else delete out[k]; }
    }
    out[code] = action;
  }
  return out;
}
export const keyMapFor = (set = 'primary') => (set === 'primary' ? laid(KEYSETS.primary, OVERRIDE.keys) : KEYSETS[set]);
export const padMapFor = () => laid(PAD_ACTIONS, OVERRIDE.pad);
/** The first key and pad button an action is on right now. */
export function bindingOf(action) {
  const k = Object.entries(keyMapFor()).find(([, v]) => (Array.isArray(v) ? v : [v]).includes(action))?.[0] || null;
  const p = Object.entries(padMapFor()).find(([, v]) => (Array.isArray(v) ? v : [v]).includes(action))?.[0];
  return { key: k, pad: p == null ? null : +p };
}

/* The last device anyone touched, so prompts can speak its language. */
let LAST = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'keyboard';
let PAD_KIND = 'xbox';
const deviceFns = new Set();
const setDevice = (d) => { if (d !== LAST) { LAST = d; for (const fn of deviceFns) fn(d); } };
export const lastDevice = () => LAST;
export const onDeviceChange = (fn) => { deviceFns.add(fn); return () => deviceFns.delete(fn); };
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('keydown', () => setDevice('keyboard'), true);
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') setDevice('touch'); else if (e.pointerType === 'mouse') setDevice('keyboard'); }, true);
  window.addEventListener('gamepadconnected', (e) => { PAD_KIND = /sony|dualsense|dualshock|playstation|054c/i.test(e.gamepad.id) ? 'ps' : 'xbox'; });
}
const PAD_GLYPH = {
  ps: ['✕', '○', '□', '△', 'L1', 'R1', 'L2', 'R2', 'Create', 'Options', 'L3', 'R3', '↑', '↓', '←', '→'],
  xbox: ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'LS', 'RS', '↑', '↓', '←', '→'],
};
export const padGlyph = (i, kind = PAD_KIND) => PAD_GLYPH[kind][i] ?? `B${i}`;
export const keyLabel = (code) => (code || '').replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace('ShiftLeft', 'Shift').replace('ShiftRight', 'R-Shift').replace('Space', 'Space').replace('Escape', 'Esc');
const TOUCH_WORD = { pass: 'PASS', shoot: 'SHOOT', cross: 'CROSS', through: 'THROUGH', lob: 'LOB', skill: 'SKILL', switch: 'SWITCH', curl: 'CURL', sprint: 'SPRINT', pause: '❚❚' };
/** What to press for an action on the device in use: "K", "○", or "SHOOT". */
export function promptFor(action, device = LAST) {
  const b = bindingOf(action);
  if (device === 'pad' && b.pad != null) return padGlyph(b.pad);
  if (device === 'touch') return TOUCH_WORD[action] || action.toUpperCase();
  return b.key ? keyLabel(b.key) : action;
}

export class Input {
  /**
   * @param {{pad?: number|null, keys?: 'primary'|'secondary'}} opts
   *   pad  index to bind to, or null to grab the first connected one
   *   keys which keyboard set this seat uses, so two people can share one board
   */
  constructor(opts = {}) {
    this.padIndex = opts.pad ?? null;
    this.keyMap = keyMapFor(opts.keys || 'primary');
    this.padMap = (opts.keys || 'primary') === 'primary' ? padMapFor() : PAD_ACTIONS;
    this.moveMap = MOVE_SETS[opts.keys || 'primary'];
    this.keys = new Set();
    this.touchVec = { x: 0, y: 0 };
    this.touchButtons = new Set();
    this.pad = null;
    this.padName = '';
    this.vec = { x: 0, y: 0 };
    this.now = new Set();
    this.was = new Set();
    this.heldFor = Object.fromEntries(ACTIONS.map((a) => [a, 0]));

    this._down = (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if (this.keyMap[e.code] || this.moveMap[e.code]) e.preventDefault();
    };
    this._up = (e) => this.keys.delete(e.code);
    this._blur = () => this.keys.clear();

    window.addEventListener('keydown', this._down);
    window.addEventListener('keyup', this._up);
    window.addEventListener('blur', this._blur);
  }

  destroy() {
    window.removeEventListener('keydown', this._down);
    window.removeEventListener('keyup', this._up);
    window.removeEventListener('blur', this._blur);
  }

  /** Call once per frame before reading anything. */
  poll(dt = 0) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const live = pads.filter((g) => g && g.connected);
    this.pad = this.padIndex === null ? (live[0] || null) : (live[this.padIndex] || null);
    this.padName = this.pad ? this.pad.id : '';

    this.was = this.now;
    this.now = new Set();

    // --- direction ---
    let x = 0;
    let y = 0;
    for (const [code, v] of Object.entries(this.moveMap)) {
      if (this.keys.has(code)) { x += v[0]; y += v[1]; }
    }
    if (this.pad) {
      const ax = this.pad.axes[0] || 0;
      const ay = this.pad.axes[1] || 0;
      if (Math.hypot(ax, ay) > DEAD) { x += ax; y += ay; }
      if (this.pad.buttons[12]?.pressed) y -= 1;
      if (this.pad.buttons[13]?.pressed) y += 1;
      if (this.pad.buttons[14]?.pressed) x -= 1;
      if (this.pad.buttons[15]?.pressed) x += 1;
    }
    x += this.touchVec.x;
    y += this.touchVec.y;
    const mag = Math.hypot(x, y);
    this.vec = mag > 1 ? { x: x / mag, y: y / mag } : { x, y };

    // --- actions ---
    const fire = (a) => { if (Array.isArray(a)) a.forEach((x) => this.now.add(x)); else this.now.add(a); };
    for (const code of this.keys) {
      const a = this.keyMap[code];
      if (a) fire(a);
    }
    if (this.pad) {
      let any = false;
      for (const [i, a] of Object.entries(this.padMap)) {
        if (this.pad.buttons[i]?.pressed) { fire(a); any = true; }
      }
      if (any || Math.hypot(this.pad.axes[0] || 0, this.pad.axes[1] || 0) > 0.5) setDevice('pad');
    }
    for (const a of this.touchButtons) this.now.add(a);

    for (const a of ACTIONS) {
      this.heldFor[a] = this.now.has(a) ? this.heldFor[a] + dt : 0;
    }
  }

  axis() { return this.vec; }
  moving() { return Math.hypot(this.vec.x, this.vec.y) > 0.14; }
  held(a) { return this.now.has(a); }
  pressed(a) { return this.now.has(a) && !this.was.has(a); }
  released(a) { return !this.now.has(a) && this.was.has(a); }
  /** How long an action was held before this frame released it. */
  heldTime(a) { return this.heldFor[a]; }

  setTouchVec(x, y) { this.touchVec = { x, y }; }
  /** v79: a swipe on the touch skill button — its direction (screen space) and modifier. */
  setGesture(g) { this.gesture = g; }
  takeGesture() { const g = this.gesture; this.gesture = null; return g || null; }
  setTouchButton(a, on) { if (on) this.touchButtons.add(a); else this.touchButtons.delete(a); }
}

/** How many pads are plugged in right now — used by the couch-play menus. */
export function padCount() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
  return pads.filter((g) => g && g.connected).length;
}
