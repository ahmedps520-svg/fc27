/**
 * One way to read a controller (v123), for the menus, the title screen and the
 * match alike.
 *
 * Two things went wrong with a real pad that the tests' simulated one never
 * showed:
 *
 *  - **The wrong device.** Everything took the first connected gamepad. With
 *    Steam's virtual pad, a headset, a wheel or a second controller plugged
 *    in, slot 0 is often something nobody is holding, and the menus sat there
 *    ignoring the controller in the player's hands. Now the pad that was last
 *    touched is the one that is read.
 *
 *  - **A layout the browser does not recognise.** Chrome maps most pads to the
 *    "standard" layout (the D-pad is buttons 12–15, Start is 9). Firefox, and
 *    Chrome with generic, 8BitDo-in-D-mode and many Android pads, report
 *    `mapping: ''` instead: the D-pad arrives as two axes (6/7) or as one hat
 *    axis with eight positions, and Start sits at 7. The menu driver only read
 *    buttons 12–15, so the D-pad did nothing. `normPad` turns those into the
 *    standard layout, and leaves a standard pad exactly as it was.
 */

const lastSig = new Map();    // pad index → a fingerprint of its buttons and sticks
const lastUsed = new Map();   // pad index → when that fingerprint last changed
let tick = 0;

const sig = (g) => g.buttons.map((b) => (b.pressed ? 1 : 0)).join('') + g.axes.map((a) => (Math.abs(a) > 0.5 ? Math.sign(a) : 0)).join('');

/** A pad worth reading: connected, and with the buttons of a controller. */
const usable = (g) => g && g.connected && g.buttons && g.buttons.length >= 4;

/**
 * The controller in use: the connected pad whose buttons or sticks changed
 * last; before anything has been pressed, the first standard-mapped pad, else
 * the first usable one. `pads` is for the tests.
 */
export function activePad(pads = (typeof navigator !== 'undefined' && navigator.getGamepads ? [...navigator.getGamepads()] : [])) {
  tick += 1;
  const live = pads.filter(usable);
  if (!live.length) return null;
  for (const g of live) {
    const s = sig(g);
    if (lastSig.get(g.index) !== s) {
      // the first sighting is not a use: a stick resting off-centre must not win
      if (lastSig.has(g.index)) lastUsed.set(g.index, tick);
      lastSig.set(g.index, s);
    }
  }
  let best = null; let bestT = -1;
  for (const g of live) { const t = lastUsed.get(g.index) ?? -1; if (t > bestT) { bestT = t; best = g; } }
  if (bestT >= 0) return best;
  return live.find((g) => g.mapping === 'standard') || live[0];
}

const btn = (pressed, value = pressed ? 1 : 0) => ({ pressed, value, touched: pressed });

/* A hat switch reports one axis: -1 up, then clockwise in steps of 2/7, and
   anything above 1 when centred. */
function hat(v) {
  if (!(v >= -1.05 && v <= 1.05)) return { up: false, down: false, left: false, right: false };
  const pos = Math.round(((v + 1) / 2) * 7) % 8;   // 0 up, 1 up-right, 2 right, … 7 up-left
  return { up: pos === 7 || pos <= 1, right: pos >= 1 && pos <= 3, down: pos >= 3 && pos <= 5, left: pos >= 5 };
}

/**
 * The pad in the standard layout: axes [lx, ly, rx, ry], buttons 0–16 as
 * Chrome's standard mapping numbers them. A standard pad is returned as it is.
 */
export function normPad(g) {
  if (!g || g.mapping === 'standard') return g;
  const b = [...g.buttons];
  const ax = g.axes || [];
  const out = b.slice(0, 17).map((x) => btn(!!x?.pressed, x?.value ?? 0));
  while (out.length < 17) out.push(btn(false));
  /* A PlayStation pad read raw (Firefox, macOS/Linux): 0 □, 1 ✕, 2 ○, 3 △ —
     so ✕, the confirm button, would have been read as □. Put them where the
     standard layout has them: 0 ✕, 1 ○, 2 □, 3 △. */
  if (/054c|playstation|dualsense|dualshock|wireless controller/i.test(g.id || '') && b.length >= 13) {
    const [sq, x, o, tri] = [out[0], out[1], out[2], out[3]];
    out[0] = x; out[1] = o; out[2] = sq; out[3] = tri;
  }
  let up = false; let down = false; let left = false; let right = false;
  // the D-pad as a hat axis (one axis whose resting value is outside ±1)…
  const hatIdx = ax.findIndex((v, i) => i >= 4 && Math.abs(v) > 1.05);
  if (hatIdx >= 0 || ax.length === 10) {
    const h = hat(ax[hatIdx >= 0 ? hatIdx : 9]);
    ({ up, down, left, right } = h);
  } else if (ax.length >= 8) {
    // …or as a pair of axes after the sticks and triggers (xpad on Linux: 6 and 7)
    const dx = ax[6] || 0; const dy = ax[7] || 0;
    left = dx < -0.5; right = dx > 0.5; up = dy < -0.5; down = dy > 0.5;
  }
  // …or already as buttons 12–15 on a pad that has them: keep those
  out[12] = btn(up || !!b[12]?.pressed); out[13] = btn(down || !!b[13]?.pressed);
  out[14] = btn(left || !!b[14]?.pressed); out[15] = btn(right || !!b[15]?.pressed);
  // Start: 9 in the standard layout, 7 on an XInput pad read raw (with 6 Back, 8 Guide)
  if (b.length <= 11 && ax.length >= 6) {
    out[9] = btn(!!b[7]?.pressed); out[8] = btn(!!b[6]?.pressed);
    out[10] = btn(!!b[9]?.pressed); out[11] = btn(!!b[10]?.pressed);   // the stick clicks
    // triggers read raw are axes 2 and 5 (-1 at rest): as buttons 6 and 7
    const tl = ((ax[2] ?? -1) + 1) / 2; const tr = ((ax[5] ?? -1) + 1) / 2;
    out[6] = btn(tl > 0.5, tl); out[7] = btn(tr > 0.5, tr);
    // and the right stick is 3/4 rather than 2/3
    return { id: g.id, index: g.index, connected: true, mapping: 'standard', timestamp: g.timestamp, vibrationActuator: g.vibrationActuator, axes: [ax[0] || 0, ax[1] || 0, ax[3] || 0, ax[4] || 0], buttons: out };
  }
  return { id: g.id, index: g.index, connected: true, mapping: 'standard', timestamp: g.timestamp, vibrationActuator: g.vibrationActuator, axes: [ax[0] || 0, ax[1] || 0, ax[2] || 0, ax[3] || 0], buttons: out };
}

/** The controller in use, in the standard layout — what every reader wants. */
export const readPad = (pads) => normPad(activePad(pads));

/** For the tests: forget which pad was last used. */
export function resetPadRead() { lastSig.clear(); lastUsed.clear(); tick = 0; }
