/**
 * The broadcast graphics package (v83): everything a television director
 * lays over the pictures, as one DOM layer on top of the match canvas.
 *
 *   stoppage board   the fourth official's +N, lit up
 *   sub board        who is coming off, who is going on
 *   card graphic     a yellow or red card with the name
 *   name strap       the player on the ball after a restart, with his day
 *   stat pop-up      possession, shots, distance run — one at a time
 *   momentum bar     who is on top, under the scoreboard
 *   review panel     a close offside or penalty checked with animated lines
 *   wipe             the game logo sweeping across between live and replay
 *   subtitles        the commentary desk's lines (broadcast/voice.js)
 *
 * All of it is in our own design: the "A" logo, our colours, nothing lifted
 * from any real broadcaster. Under reduced motion the pieces appear and go
 * without sliding or wiping.
 */
import { crestSVG } from '../components/crest.js';

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** The game mark used on the wipe and the score bug. */
export const LOGO_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" stroke-width="4"/><path d="M20 46 L32 16 L44 46 M25 36 H39" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function createGraphics(host, { reduceMotion = false, rtl = false } = {}) {
  const layer = document.createElement('div');
  layer.className = `bc-layer${reduceMotion ? ' still' : ''}${rtl ? ' rtl' : ''}`;
  layer.innerHTML = `
    <div class="bc-mom" id="bcMom" hidden><i class="h"></i><i class="a"></i><b></b></div>
    <div class="bc-board" id="bcBoard" hidden></div>
    <div class="bc-subs" id="bcSubs" hidden></div>
    <div class="bc-card" id="bcCard" hidden></div>
    <div class="bc-strap" id="bcStrap" hidden></div>
    <div class="bc-stat" id="bcStat" hidden></div>
    <div class="bc-review" id="bcReview" hidden></div>
    <div class="bc-wipe" id="bcWipe" hidden><span class="bc-wipe-band"></span><span class="bc-wipe-logo">${LOGO_SVG}</span></div>
    <div class="bc-sub" id="bcSubtitle" hidden></div>`;
  host.appendChild(layer);
  const $ = (id) => layer.querySelector(`#${id}`);
  const timers = new Map();
  const flash = (id, html, ms) => {
    const el = $(id);
    el.innerHTML = html;
    el.hidden = false;
    el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
    clearTimeout(timers.get(id));
    timers.set(id, setTimeout(() => { el.classList.remove('in'); el.classList.add('out'); setTimeout(() => { el.hidden = true; el.classList.remove('out'); }, reduceMotion ? 0 : 380); }, ms));
  };
  const shown = [];       // a record of what went up, for the tests
  const counts = {};
  const note = (kind, detail) => { counts[kind] = (counts[kind] || 0) + 1; shown.push({ kind, ...detail }); if (shown.length > 60) shown.shift(); };

  return {
    subtitleEl: $('bcSubtitle'),
    shown: () => shown.slice(),
    counts: () => ({ ...counts }),

    /** The momentum bar: -1 (away on top) … +1 (home on top). */
    momentum(v, colors = ['#3fd08a', '#e25656']) {
      const el = $('bcMom');
      el.hidden = false;
      const x = Math.max(-1, Math.min(1, v));
      el.style.setProperty('--hc', colors[0]); el.style.setProperty('--ac', colors[1]);
      el.querySelector('.h').style.width = `${Math.max(0, x) * 50}%`;
      el.querySelector('.a').style.width = `${Math.max(0, -x) * 50}%`;
    },
    hideMomentum() { $('bcMom').hidden = true; },

    stoppage(n) {
      note('stoppage', { n });
      flash('bcBoard', `<span class="bb-k">ADDED TIME</span><b class="bb-n">+${n}</b>`, 4200);
    },

    subs(team, off, on) {
      note('subs', { team: team.short, off, on });
      flash('bcSubs', `
        <span class="bs-crest">${crestSVG(team.club?.crest, team.short, 26)}</span>
        <span class="bs-row off"><i>▼</i><b>${esc(off)}</b></span>
        <span class="bs-row on"><i>▲</i><b>${esc(on)}</b></span>`, 4200);
    },

    card(kind, name, team) {
      note('card', { kind, name });
      flash('bcCard', `<i class="bc-cardface ${kind}"></i><span><b>${esc(name)}</b><em>${esc(team.short)}</em></span>`, 3200);
    },

    strap(p, team, line) {
      note('strap', { name: p.ref.name });
      flash('bcStrap', `
        <span class="st-num" style="--kit:${team.colors?.[0] || '#243049'}">${p.num ?? ''}</span>
        <span class="st-who"><b>${esc(p.ref.name)}</b><em>${esc(p.ref.position || p.role)} · ${esc(team.short)}</em></span>
        ${line ? `<span class="st-line">${esc(line)}</span>` : ''}`, 3800);
    },

    stat(label, h, a, suffix = '') {
      note('stat', { label });
      const tot = (Number(h) + Number(a)) || 1;
      flash('bcStat', `
        <span class="ss-k">${esc(label)}</span>
        <span class="ss-row"><b>${h}${suffix}</b><i><em style="width:${(h / tot) * 100}%"></em></i><b>${a}${suffix}</b></span>`, 4200);
    },

    /**
     * A review. kind 'offside' draws the two lines — the attacker's and the
     * second-last defender's — sliding into place; 'penalty' shows the box and
     * the point of contact. `margin` in metres; `verdict` the call that stands.
     */
    review(kind, { margin = 0, verdict = '', dir = 1 } = {}) {
      note('review', { kind, margin, verdict });
      const cm = Math.round(Math.abs(margin) * 100);
      const el = $('bcReview');
      const off = kind === 'offside';
      const atk = 50 + (dir > 0 ? 1 : -1) * Math.min(18, Math.max(3, Math.abs(margin) * 22));
      el.innerHTML = `
        <span class="rv-k"><i></i>REVIEW · ${off ? 'POSSIBLE OFFSIDE' : 'POSSIBLE PENALTY'}</span>
        <div class="rv-pitch ${off ? 'off' : 'pen'}">
          ${off ? `<i class="rv-line def" style="--x:50%"></i><i class="rv-line atk" style="--x:${atk}%"></i><b class="rv-dot" style="--x:${atk}%"></b>`
            : '<i class="rv-box"></i><b class="rv-dot" style="--x:38%;--y:52%"></b>'}
        </div>
        <span class="rv-v">Checking…</span>`;
      el.hidden = false;
      el.classList.remove('in', 'done'); void el.offsetWidth; el.classList.add('in');
      clearTimeout(timers.get('rv'));
      timers.set('rv', setTimeout(() => {
        el.classList.add('done');
        el.querySelector('.rv-v').textContent = `${verdict}${off && cm ? ` · ${cm} cm` : ''}`;
        timers.set('rv', setTimeout(() => { el.hidden = true; el.classList.remove('in', 'done'); }, 2200));
      }, reduceMotion ? 900 : 2000));
    },

    /** The logo wipe. `mid` runs when the screen is covered (swap the picture then). */
    wipe(mid) {
      note('wipe', {});
      const el = $('bcWipe');
      if (reduceMotion) { mid?.(); return; }
      el.hidden = false;
      el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
      setTimeout(() => mid?.(), 260);
      clearTimeout(timers.get('wipe'));
      timers.set('wipe', setTimeout(() => { el.hidden = true; el.classList.remove('go'); }, 640));
    },

    destroy() { for (const t of timers.values()) clearTimeout(t); layer.remove(); },
  };
}

/* ------------------------------ heat maps ------------------------------ *
 * Where each side's outfield players have been, sampled twice a second into
 * a coarse grid in the team's own attacking direction (so "up" is always
 * toward the goal they attack), drawn as soft blobs on a pitch outline. */
export const HEAT_W = 24; export const HEAT_H = 16;
export function createHeat() {
  const grids = [new Float32Array(HEAT_W * HEAT_H), new Float32Array(HEAT_W * HEAT_H)];
  let acc = 0;
  return {
    grids,
    sample(match, dt, pitch) {
      acc += dt; if (acc < 0.5) return; acc = 0;
      for (let ti = 0; ti < 2; ti++) {
        const team = match.teams[ti];
        for (const p of team.players) {
          if (p.role === 'GK' || p.x < -50) continue;
          const fx = team.dir > 0 ? p.x / pitch.w : 1 - p.x / pitch.w;
          const fy = team.dir > 0 ? p.y / pitch.h : 1 - p.y / pitch.h;
          const gx = Math.max(0, Math.min(HEAT_W - 1, Math.floor(fx * HEAT_W)));
          const gy = Math.max(0, Math.min(HEAT_H - 1, Math.floor(fy * HEAT_H)));
          grids[ti][gy * HEAT_W + gx] += 1;
        }
      }
    },
    total(ti) { return grids[ti].reduce((a, b) => a + b, 0); },
    /** Paint team ti's map onto a canvas. */
    draw(canvas, ti, color = '#ff5a3c') {
      const c = canvas.getContext('2d'); if (!c) return;
      const W = canvas.width; const H = canvas.height;
      c.clearRect(0, 0, W, H);
      c.fillStyle = '#10301f'; c.fillRect(0, 0, W, H);
      const g = grids[ti]; const max = Math.max(1, ...g);
      const cw = W / HEAT_W; const ch = H / HEAT_H;
      c.globalCompositeOperation = 'lighter';
      for (let y = 0; y < HEAT_H; y++) for (let x = 0; x < HEAT_W; x++) {
        const v = g[y * HEAT_W + x] / max; if (v < 0.04) continue;
        const r = Math.max(cw, ch) * 1.6;
        const grd = c.createRadialGradient((x + 0.5) * cw, (y + 0.5) * ch, 0, (x + 0.5) * cw, (y + 0.5) * ch, r);
        grd.addColorStop(0, hexA(color, 0.55 * v)); grd.addColorStop(1, hexA(color, 0));
        c.fillStyle = grd; c.fillRect((x + 0.5) * cw - r, (y + 0.5) * ch - r, r * 2, r * 2);
      }
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;
      c.strokeRect(1, 1, W - 2, H - 2);
      c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
      c.beginPath(); c.arc(W / 2, H / 2, H * 0.14, 0, Math.PI * 2); c.stroke();
      c.strokeRect(0, H * 0.22, W * 0.16, H * 0.56); c.strokeRect(W * 0.84, H * 0.22, W * 0.16, H * 0.56);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.font = `${Math.round(H * 0.08)}px system-ui`; c.fillText('ATTACKING →', W - H * 0.08 * 8, H * 0.1);
    },
  };
}
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}

/* -------------------------------- momentum ------------------------------- *
 * Who is on top: the ball's territory and the last minute's shots, big
 * chances and corners, home-positive, smoothed so it breathes rather than
 * flickers. The series is kept for the full-time graph. */
export function createMomentum() {
  let v = 0; let acc = 0;
  const events = [];
  const series = [];
  return {
    event(team, weight) { events.push({ team, w: weight, age: 0 }); },
    step(match, dt, pitch) {
      for (const e of events) e.age += dt;
      while (events.length && events[0].age > 40) events.shift();
      const territory = match.ball ? ((match.ball.x / pitch.w) - 0.5) * 2 * (match.teams[0].dir > 0 ? 1 : -1) : 0;
      let push = territory * 0.35;
      for (const e of events) push += (e.team === 0 ? 1 : -1) * e.w * (1 - e.age / 40);
      const target = Math.max(-1, Math.min(1, push));
      v += (target - v) * Math.min(1, dt * 0.5);
      acc += dt;
      if (acc >= 2) { acc = 0; series.push(Math.round(v * 100) / 100); if (series.length > 400) series.shift(); }
      return v;
    },
    value: () => v,
    series: () => series.slice(),
  };
}
