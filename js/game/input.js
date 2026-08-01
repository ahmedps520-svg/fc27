/* Unified input: DualSense / any standard gamepad, keyboard, and touch. */

const DEAD = 0.22;

// A binding may fire more than one action — R1 switches players off the ball and
// doubles as the curl modifier while shooting.
const KEY_ACTIONS = {
  Space: 'pass', KeyJ: 'cross', KeyK: 'shoot', KeyL: 'through',
  KeyQ: 'switch', KeyE: ['switch', 'curl'], KeyI: 'curl',
  ShiftLeft: 'sprint', ShiftRight: 'sprint',
  Escape: 'pause', KeyP: 'pause',
};

// Standard gamepad mapping — on a DualSense: 0 ✕, 1 ○, 2 □, 3 △, 4 L1, 5 R1, 6 L2, 7 R2, 9 Options.
const PAD_ACTIONS = {
  0: 'pass', 1: 'shoot', 2: 'cross', 3: 'through',
  4: 'switch', 5: ['switch', 'curl'], 7: 'sprint', 9: 'pause',
};

const ACTIONS = ['pass', 'shoot', 'cross', 'through', 'switch', 'curl', 'sprint', 'pause'];

export class Input {
  constructor() {
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
      if (KEY_ACTIONS[e.code] || MOVE_KEYS[e.code]) e.preventDefault();
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
    this.pad = pads.find((g) => g && g.connected) || null;
    this.padName = this.pad ? this.pad.id : '';

    this.was = this.now;
    this.now = new Set();

    // --- direction ---
    let x = 0;
    let y = 0;
    for (const [code, v] of Object.entries(MOVE_KEYS)) {
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
    for (const code of this.keys) {
      const a = KEY_ACTIONS[code];
      if (a) this.now.add(a);
    }
    if (this.pad) {
      for (const [i, a] of Object.entries(PAD_ACTIONS)) {
        if (this.pad.buttons[i]?.pressed) this.now.add(a);
      }
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
  setTouchButton(a, on) { if (on) this.touchButtons.add(a); else this.touchButtons.delete(a); }
}

const MOVE_KEYS = {
  KeyW: [0, -1], ArrowUp: [0, -1],
  KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0],
  KeyD: [1, 0], ArrowRight: [1, 0],
};
