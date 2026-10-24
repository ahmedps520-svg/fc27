/**
 * v198: Store → Style — the cosmetics (cosmetics.js) in the Ultimate XI
 * store: kit patterns, goal celebrations and pitch patterns for your ground,
 * each with a preview, its price in Apex, and Use once it is yours.
 */
import { getState } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { sfx } from '../audio.js';
import { haptic } from '../native.js';
import { kitSVG } from '../data/kitDesign.js';
import { CELEBRATIONS, celebPose, armDirs } from '../game/celebrations.js';
import { defaultDesign } from '../builder.js';
import { clubIdentity } from './squad.js';
import { COSMETICS, KINDS, owns, buyCosmetic, useCosmetic, inUse, payable } from '../cosmetics.js';
import { tx } from '../i18n.js';
import { about } from '../components/facts.js';

const money = (n) => `◈${Math.round(n).toLocaleString()}`;

/** The celebration's held pose, front on: a stick figure from the same pose the renderers draw. */
function poseSVG(kind) {
  const P = celebPose(kind, 0.55, false);
  const pt = (x, y) => `${(50 + x).toFixed(1)},${(64 - y).toFixed(1)}`;
  const arm = (a, side) => {
    const { upper, fore } = armDirs(a);
    const sx = side * 9; const sy = 34;
    const ex = sx + side * upper[1] * 15; const ey = sy + upper[2] * 15;
    const hx = ex + side * fore[1] * 13; const hy = ey + fore[2] * 13;
    return `<polyline points="${pt(sx, sy)} ${pt(ex, ey)} ${pt(hx, hy)}" />`;
  };
  const lift = (P.lift || 0) * 12; const kneel = (P.kneel || 0) * 10;
  return `<svg viewBox="0 0 100 80" class="sty-pose" aria-hidden="true"><g transform="translate(0 ${(-lift + kneel).toFixed(1)})">
    <circle cx="50" cy="${64 - 44}" r="6.5" />
    <line x1="50" y1="${64 - 37}" x2="50" y2="${64 - 14}" />
    ${arm(P.armL, -1)}${arm(P.armR, 1)}
    <polyline points="${pt(-7, -6 + kneel * 0.6)} ${pt(0, 14)} ${pt(7, -6 + kneel * 0.6)}" />
  </g></svg>`;
}

/** A pitch mown in the pattern, in the same shapes renderGL.js mows it. */
function pitchSVG(pattern) {
  const W = 120; const H = 78; const n = 12; const sw = W / n;
  let bands = '';
  if (pattern === 'diamonds') {
    for (const [a, o] of [[28, 1], [-28, 0.45]]) {
      let r = ''; for (let i = -12; i < 12; i += 2) r += `<rect x="${60 + i * 9}" y="-60" width="9" height="200" />`;
      bands += `<g transform="rotate(${a} 60 39)" opacity="${o}">${r}</g>`;
    }
  } else {
    const off = pattern === 'waves' ? (y) => Math.sin((y / H) * Math.PI * 3) * sw * 0.45 : (y) => (Math.abs(y - H / 2) / H) * sw * 2.4;
    for (let i = -1; i <= n; i += 2) {
      const pts = [];
      for (let k = 0; k <= 24; k++) { const y = (k / 24) * H; pts.push(`${(sw * i + off(y)).toFixed(1)},${y.toFixed(1)}`); }
      for (let k = 24; k >= 0; k--) { const y = (k / 24) * H; pts.push(`${(sw * (i + 1) + off(y)).toFixed(1)},${y.toFixed(1)}`); }
      bands += `<polygon points="${pts.join(' ')}" />`;
    }
  }
  return `<svg viewBox="0 0 ${W} ${H}" class="sty-pitch" aria-hidden="true">
    <defs><clipPath id="stp-${pattern}"><rect width="${W}" height="${H}" rx="6" /></clipPath></defs>
    <g clip-path="url(#stp-${pattern})"><rect width="${W}" height="${H}" fill="#2f7d33" /><g fill="#3d9a40">${bands}</g>
    <g fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.2"><rect x="4" y="4" width="${W - 8}" height="${H - 8}" /><line x1="60" y1="4" x2="60" y2="${H - 4}" /><circle cx="60" cy="39" r="9" /></g></g></svg>`;
}

function previewOf(it) {
  if (it.kind === 'kit') return kitSVG({ ...clubIdentity().kit.home, pattern: it.value }, 64);
  if (it.kind === 'celebration') return poseSVG(it.value);
  return pitchSVG(it.value);
}
const blurbOf = (it) => (it.kind === 'celebration' ? CELEBRATIONS.find((c) => c.id === it.value)?.blurb || ''
  : it.kind === 'kit' ? 'For your home or away shirt, in your colours.' : 'How your own ground is mown.');

export function styleView() {
  const s = getState();
  const mine = COSMETICS.filter((c) => owns(c.id, s)).length;
  return `
    <section class="panel glass sty-head">
      <header class="panel-head"><h2>${tx('Style')}</h2><span class="tag">${mine}/${COSMETICS.length} ${tx('owned')}</span>${about(tx('How your side looks — never how it plays. Bought with Apex; everything you already had stays free.'))}</header>
    </section>
    ${KINDS.map(([kind, label]) => `
      <h3 class="sty-kind">${tx(label)}</h3>
      <div class="sty-grid">${COSMETICS.filter((c) => c.kind === kind).map((it) => {
        const have = owns(it.id, s); const on = have && inUse(it.id, s);
        return `<article class="panel glass sty-item ${have ? 'owned' : ''}">
          <div class="sty-prev">${previewOf(it)}</div>
          <b title="${tx(blurbOf(it))}">${tx(it.name)}</b>
          ${!have ? `<button class="btn primary sm" data-sty-buy="${it.id}" ${(s.club.apex | 0) >= it.price.apex && payable('apex') ? '' : 'disabled'}>${money(it.price.apex)}</button>`
            : on ? `<span class="sty-on">✓ ${tx('In use')}</span>` : `<button class="btn ghost sm" data-sty-use="${it.id}">${tx('Use')}</button>`}
        </article>`;
      }).join('')}</div>`).join('')}`;
}

export function mountStyle(root) {
  root.querySelectorAll('[data-sty-buy]').forEach((b) => b.addEventListener('click', () => {
    const r = buyCosmetic(b.dataset.styBuy, 'apex');
    if (r.error) return toast(r.error, 'warn');
    sfx('confirm'); haptic('reveal'); refreshCoins();
    toast(`${tx(r.item.name)} — ${tx('yours')}`, 'good');
    navigate('squad');
  }));
  root.querySelectorAll('[data-sty-use]').forEach((b) => b.addEventListener('click', () => {
    const it = COSMETICS.find((c) => c.id === b.dataset.styUse);
    if (!useCosmetic(it.id, { defaultDesign: () => defaultDesign(clubIdentity().crest.colors) })) return;
    sfx('tick');
    toast(it.kind === 'kit' ? tx('On your home shirt — change it any time in Club → Kit') : it.kind === 'celebration' ? tx('Your scorers will celebrate like this') : tx('Your ground is mown like this now'), 'good');
    navigate('squad');
  }));
}
