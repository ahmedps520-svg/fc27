/**
 * Side select (v91) — up to four people at one screen, on either side.
 *
 * Every connected controller gets a token, and so do the two halves of the
 * keyboard (WASD and the arrows). Push your token left for the home side,
 * right for the away side, or leave it in the middle to sit out. A is ready,
 * Start (or Enter) kicks off once everyone playing is ready, B backs out.
 * Controllers plugged in while it is open appear at once; one pulled out
 * disappears. Tokens can also be moved with a tap or a click on the arrows.
 *
 * Resolves with the seats — [{ team: 0|1, pad: gamepad.index | null, keys:
 * 'primary' | 'secondary' | 'none' }] in home-then-away order — or null.
 */
import { padKindOf, padGlyph } from '../game/input.js';
import { normPad } from '../game/padRead.js';

const MAX_PLAYING = 4;

export function openSideSelect({ home, away, preset = 'versus' } = {}) {
  return new Promise((resolve) => {
    const tokens = new Map();                // id → { id, label, pad, keys, side, ready }
    const add = (t) => { if (!tokens.has(t.id)) tokens.set(t.id, t); };
    // keyboards first, so a desk player always has a token
    add({ id: 'kb1', label: 'Keyboard · WASD', pad: null, keys: 'primary', side: 0, ready: false });
    add({ id: 'kb2', label: 'Keyboard · arrows', pad: null, keys: 'secondary', side: 0, ready: false });

    const wrap = document.createElement('div');
    wrap.className = 'ss-layer';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'Choose sides');
    document.body.appendChild(wrap);
    document.body.classList.add('pad-capture');          // the menu's pad driver stands down (padMenu.js)

    // the first two people start where the chosen mode would put them
    let seededPads = 0;
    const seed = (t) => {
      if (t.pad != null && seededPads < 2) { t.side = seededPads === 0 ? -1 : (preset === 'coop' ? -1 : 1); seededPads += 1; }
    };
    const playing = () => [...tokens.values()].filter((t) => t.side !== 0);
    const paint = () => {
      const col = (side) => [...tokens.values()].filter((t) => t.side === side).map((t) => `
        <div class="ss-token ${t.ready ? 'is-ready' : ''}" data-ss="${t.id}">
          <button class="ss-arrow" data-ss-move="${t.id}:-1" aria-label="Move ${t.label} left" ${t.side === -1 ? 'disabled' : ''}>◀</button>
          <span><b>${t.label}</b><i>${t.ready ? 'Ready' : t.side ? (t.pad != null ? `${padGlyph(0, padKindOf(t.padId))} when ready` : 'Enter when ready') : 'Sitting out'}</i></span>
          <button class="ss-arrow" data-ss-move="${t.id}:1" aria-label="Move ${t.label} right" ${t.side === 1 ? 'disabled' : ''}>▶</button>
        </div>`).join('') || '<p class="ss-empty">—</p>';
      const n = playing().length; const allReady = n > 0 && playing().every((t) => t.ready);
      wrap.innerHTML = `
        <div class="ss-card">
          <h2>Choose sides</h2>
          <p class="ss-hint">Push left for ${home}, right for ${away}. A (or Enter) when ready · Start to kick off · B to go back · up to ${MAX_PLAYING} players.</p>
          <div class="ss-cols">
            <section class="ss-col home"><h3>${home}</h3>${col(-1)}</section>
            <section class="ss-col mid"><h3>Not playing</h3>${col(0)}</section>
            <section class="ss-col away"><h3>${away}</h3>${col(1)}</section>
          </div>
          <div class="ss-foot">
            <button class="btn ghost" data-ss-act="back">Back</button>
            <button class="btn primary" data-ss-act="go" ${n && allReady ? '' : 'disabled'}>${n ? (allReady ? 'Kick off' : 'Waiting for everyone to be ready') : 'Nobody is playing yet'}</button>
          </div>
        </div>`;
    };

    const move = (t, dir) => {
      const to = Math.max(-1, Math.min(1, t.side + dir));
      if (to === t.side) return;
      if (t.side === 0 && playing().length >= MAX_PLAYING) return;     // four is the most
      t.side = to; t.ready = false; paint();
    };
    const ready = (t) => { if (t.side !== 0) { t.ready = !t.ready; paint(); } };
    const finish = (ok) => {
      cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('gamepadconnected', repaint); window.removeEventListener('gamepaddisconnected', repaint);
      document.body.classList.remove('pad-capture');
      wrap.remove();
      if (!ok) return resolve(null);
      const seats = playing().sort((a, b) => a.side - b.side)
        .map((t) => ({ team: t.side < 0 ? 0 : 1, pad: t.pad, keys: t.keys }));
      resolve(seats);
    };
    const tryGo = () => { const n = playing().length; if (n && playing().every((t) => t.ready)) finish(true); };

    wrap.addEventListener('click', (e) => {
      const mv = e.target.closest('[data-ss-move]');
      if (mv) { const [id, d] = mv.dataset.ssMove.split(':'); const t = tokens.get(id); if (t) move(t, +d); return; }
      const tok = e.target.closest('[data-ss]');
      if (tok && !e.target.closest('button')) { const t = tokens.get(tok.dataset.ss); if (t) ready(t); return; }
      const act = e.target.closest('[data-ss-act]')?.dataset.ssAct;
      if (act === 'back') finish(false);
      if (act === 'go') tryGo();
    });

    const onKey = (e) => {
      const k1 = tokens.get('kb1'); const k2 = tokens.get('kb2');
      const map = { KeyA: [k1, -1], KeyD: [k1, 1], ArrowLeft: [k2, -1], ArrowRight: [k2, 1] };
      if (map[e.code]) { e.preventDefault(); move(...map[e.code]); return; }
      if (e.code === 'Space') { e.preventDefault(); ready(k1); return; }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        if (playing().length && playing().every((t) => t.ready)) tryGo(); else ready(k2.side ? k2 : k1);
        return;
      }
      if (e.code === 'Escape') { e.preventDefault(); finish(false); }
    };
    window.addEventListener('keydown', onKey, true);
    const repaint = () => paint();
    window.addEventListener('gamepadconnected', repaint);
    window.addEventListener('gamepaddisconnected', repaint);

    // pads: one token each, moved by its own stick or D-pad
    const was = new Map();   // pad index → { buttons: [], dir }
    let raf = 0;
    const poll = () => {
      raf = requestAnimationFrame(poll);
      // v123: each in the standard layout, and only things with a controller's buttons (not a headset)
      const pads = (navigator.getGamepads ? [...navigator.getGamepads()] : []).filter((g) => g && g.connected && g.buttons.length >= 4).map(normPad);
      let changed = false;
      for (const g of pads) {
        const id = `pad${g.index}`;
        const down = g.buttons.map((b) => b.pressed);
        if (!tokens.has(id)) {
          const t = { id, label: `Controller ${g.index + 1}`, pad: g.index, padId: g.id, keys: 'none', side: 0, ready: false };
          seed(t); tokens.set(id, t); changed = true;
          // first sight: what is already held (the A that opened this screen) is not a press
          was.set(g.index, { buttons: down, dir: 0 });
          continue;
        }
        const t = tokens.get(id);
        const prev = was.get(g.index) || { buttons: [], dir: 0 };
        const hit = (i) => down[i] && !prev.buttons[i];
        const x = (g.axes[0] || 0) + (down[15] ? 1 : 0) - (down[14] ? 1 : 0);
        const dir = x > 0.6 ? 1 : x < -0.6 ? -1 : 0;
        if (dir && dir !== prev.dir) move(t, dir);
        if (hit(0)) ready(t);
        if (hit(9)) tryGo();
        if (hit(1)) { if (t.side === 0 && !t.ready) { finish(false); return; } if (t.ready) ready(t); else move(t, -t.side); }
        was.set(g.index, { buttons: down, dir });
      }
      // a pad that went away takes its token with it
      for (const [id, t] of tokens) if (t.pad != null && !pads.some((g) => g.index === t.pad)) { tokens.delete(id); changed = true; }
      if (changed) paint();
    };
    paint();
    raf = requestAnimationFrame(poll);
  });
}
