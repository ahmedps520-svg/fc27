/**
 * The career's big moments, as full-screen scenes (v81):
 *
 *  - `pressScene`    the press room: a sponsor wall of the game's own marks, a
 *                    desk and microphones, the question typed out, the answers
 *  - `signingScene`  the announcement reveal: the club's colours wipe in, the
 *                    crest, the face, "It's official"
 *  - `trophyScene`   the lift: a podium, the trophy raised, confetti in the
 *                    club's colours
 *
 * Each returns a Promise that resolves when it is dismissed (with the chosen
 * answer, for the press). Reduced motion keeps every scene and drops the
 * movement: no confetti fall, no typing, no wipe.
 */
import { getState } from '../state.js';
import { crestSVG } from './crest.js';
import { faceSVG } from './face.js';

const reduced = () => !!getState().settings?.reduceMotion || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mount(cls, html) {
  const el = document.createElement('div');
  el.className = `ceremony ${cls}${reduced() ? ' still' : ''}`;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.innerHTML = html;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  return el;
}
function close(el) { el.classList.remove('in'); setTimeout(() => el.remove(), reduced() ? 0 : 260); }

const WALL = ['APEX XI', 'NOVAFIT', 'AURIC', 'VOLTARA', 'OBSIDIAN', 'KESTREL AIR'];

/** The press room. `answers` is a list of strings; resolves to the index chosen. */
export function pressScene({ question, answers, who = 'The press', club = null }) {
  return new Promise((resolve) => {
    const wall = Array.from({ length: 18 }, (_, i) => `<span>${WALL[i % WALL.length]}</span>`).join('');
    const el = mount('cer-press', `
      <div class="cer-wall" aria-hidden="true">${wall}</div>
      ${club ? `<div class="cer-crest">${crestSVG(club.crest, club.short, 56)}</div>` : ''}
      <div class="cer-desk" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="cer-card glass">
        <span class="cer-kicker">${esc(who)}</span>
        <p class="cer-q" aria-live="polite"></p>
        <div class="cer-answers">${answers.map((a, i) => `<button class="btn ${i ? 'ghost' : 'primary'}" data-a="${i}">${esc(a)}</button>`).join('')}</div>
      </div>`);
    const q = el.querySelector('.cer-q');
    if (reduced()) q.textContent = `“${question}”`;
    else { let i = 0; const full = `“${question}”`; const tick = () => { q.textContent = full.slice(0, ++i); if (i < full.length && el.isConnected) setTimeout(tick, 18); }; tick(); }
    el.querySelector('.cer-answers').addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      close(el); resolve(+b.dataset.a);
    });
    el.querySelector('[data-a]')?.focus();
  });
}

/** The announcement. `player` { name, position, overall, look? }, `club` { name, short, crest }. */
export function signingScene({ player, club, line = "It's official", sub = '' }) {
  return new Promise((resolve) => {
    const c = club.crest?.colors || ['#22c55e', '#0b1020'];
    const el = mount('cer-sign', `
      <div class="cer-wipe" style="--c1:${c[0]};--c2:${c[1] || '#0b1020'}" aria-hidden="true"></div>
      <div class="cer-sign-body">
        <div class="cer-crest big">${crestSVG(club.crest, club.short, 96)}</div>
        <div class="cer-face">${faceSVG({ id: `cer-${player.name}`, name: player.name, look: player.look }, 132, c[0])}</div>
        <span class="cer-kicker">${esc(line)}</span>
        <b class="cer-name">${esc(player.name)}</b>
        <span class="cer-meta">${esc([player.position, player.overall ? `${player.overall} OVR` : '', club.name].filter(Boolean).join(' · '))}</span>
        ${sub ? `<span class="cer-sub">${esc(sub)}</span>` : ''}
        <button class="btn primary big" data-ok>Continue</button>
      </div>`);
    el.querySelector('[data-ok]').addEventListener('click', () => { close(el); resolve(); });
    el.querySelector('[data-ok]').focus();
  });
}

/** The lift. `title` e.g. "Premier League champions", `club` for colours. */
export function trophyScene({ title, club, sub = '', cup = false }) {
  return new Promise((resolve) => {
    const c = club?.crest?.colors || ['#ffd166', '#22c55e'];
    const el = mount('cer-trophy', `
      <canvas class="cer-confetti" aria-hidden="true"></canvas>
      <div class="cer-trophy-body">
        <svg class="cer-cup" viewBox="0 0 120 150" width="150" height="188" aria-hidden="true">
          <defs><linearGradient id="cerGold" x1="0" x2="1"><stop offset="0" stop-color="#b8860b"/><stop offset=".45" stop-color="#ffe08a"/><stop offset="1" stop-color="#a87400"/></linearGradient></defs>
          ${cup
            ? '<path d="M28 18h64v18c0 22-14 38-32 40-18-2-32-18-32-40z" fill="url(#cerGold)"/><path d="M28 26c-16 0-18 26 4 30M92 26c16 0 18 26-4 30" fill="none" stroke="url(#cerGold)" stroke-width="6"/>'
            : '<path d="M60 10l10 22 24 3-18 16 5 24-21-12-21 12 5-24-18-16 24-3z" fill="url(#cerGold)"/><path d="M40 70h40l-6 16H46z" fill="url(#cerGold)"/>'}
          <rect x="50" y="76" width="20" height="30" fill="url(#cerGold)"/>
          <rect x="34" y="106" width="52" height="14" rx="3" fill="#2b2b33"/>
          <rect x="28" y="120" width="64" height="16" rx="3" fill="#1c1c22"/>
        </svg>
        <div class="cer-podium" aria-hidden="true"><i></i><i></i><i></i></div>
        <span class="cer-kicker">Champions</span>
        <b class="cer-name">${esc(title)}</b>
        ${sub ? `<span class="cer-sub">${esc(sub)}</span>` : ''}
        ${club ? `<div class="cer-crest">${crestSVG(club.crest, club.short, 64)}</div>` : ''}
        <button class="btn primary big" data-ok>Lift it</button>
      </div>`);
    const cv = el.querySelector('.cer-confetti');
    let raf = 0;
    if (!reduced()) {
      const g = cv.getContext('2d');
      const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
      fit();
      const cols = [c[0], c[1] || '#ffffff', '#ffd166', '#ffffff'];
      const bits = Array.from({ length: 160 }, () => ({ x: Math.random() * cv.width, y: -Math.random() * cv.height, vy: 1.2 + Math.random() * 2.6, vx: (Math.random() - 0.5) * 1.2, r: Math.random() * 6, w: 4 + Math.random() * 5, c: cols[Math.floor(Math.random() * cols.length)] }));
      const step = () => {
        if (!el.isConnected) return;
        g.clearRect(0, 0, cv.width, cv.height);
        for (const b of bits) {
          b.y += b.vy; b.x += b.vx + Math.sin(b.y / 30); b.r += 0.08;
          if (b.y > cv.height + 10) { b.y = -10; b.x = Math.random() * cv.width; }
          g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c; g.fillRect(-b.w / 2, -2, b.w, 4); g.restore();
        }
        raf = requestAnimationFrame(step);
      };
      step();
    }
    el.querySelector('[data-ok]').addEventListener('click', () => { cancelAnimationFrame(raf); el.classList.add('lifted'); setTimeout(() => { close(el); resolve(); }, reduced() ? 0 : 700); });
    el.querySelector('[data-ok]').focus();
  });
}
