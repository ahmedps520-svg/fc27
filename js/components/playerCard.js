import { RARITY } from '../data/pools.js';
import { traitHTML, skillStars } from '../data/traits.js';
import { getClub } from '../data/generator.js';
import { crestSVG, flagSVG } from './crest.js';
import { faceSVG } from './face.js';

const STATS = [
  ['pace', 'PAC'], ['shooting', 'SHO'], ['passing', 'PAS'],
  ['dribbling', 'DRI'], ['defending', 'DEF'], ['physical', 'PHY'],
];

/** Hexagonal radar chart of the six stat categories. */
export function radarSVG(stats, size = 150) {
  const c = size / 2;
  const R = c - 22;
  const pt = (i, r) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return [c + Math.cos(angle) * r, c + Math.sin(angle) * r];
  };
  const ring = (frac) =>
    STATS.map((_, i) => pt(i, R * frac).map((n) => n.toFixed(1)).join(',')).join(' ');

  const shape = STATS
    .map(([key], i) => pt(i, (R * Math.max(stats[key], 12)) / 100).map((n) => n.toFixed(1)).join(','))
    .join(' ');

  const labels = STATS.map(([key, label], i) => {
    const [x, y] = pt(i, R + 13);
    return `<text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" text-anchor="middle"
              font-size="9" font-weight="700" fill="var(--text-dim)">${label}</text>`;
  }).join('');

  const spokes = STATS.map((_, i) => {
    const [x, y] = pt(i, R);
    return `<line x1="${c}" y1="${c}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
              stroke="var(--line)" stroke-width="1"/>`;
  }).join('');

  return `
    <svg class="radar" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img"
         aria-label="Stat radar chart">
      ${[1, 0.75, 0.5, 0.25].map((f) => `<polygon points="${ring(f)}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join('')}
      ${spokes}
      <polygon points="${shape}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"
               stroke-linejoin="round"/>
      ${STATS.map(([key], i) => {
        const [x, y] = pt(i, (R * Math.max(stats[key], 12)) / 100);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="var(--accent)"/>`;
      }).join('')}
      ${labels}
    </svg>`;
}

/** The six stats in one row — the way a card reads when it is the picture, not the sheet. */
function statRow(stats) {
  return `<div class="pc-row">${STATS.map(([key, label]) => `<span><i>${label}</i><b>${stats[key]}</b></span>`).join('')}</div>`;
}

/** A row of cards, for every place that used to be a line of names. */
export function cardStrip(players, { size = 'mini', cls = '', boost = 0 } = {}) {
  const list = (players || []).filter(Boolean);
  if (!list.length) return '';
  return `<div class="card-strip strip-${size} ${cls}">${list.map((p) => playerCard(boost ? { ...p, overall: p.overall + boost } : p, { size })).join('')}</div>`;
}

function statBars(stats) {
  return `<div class="pc-stats">${STATS.map(([key, label]) => `
    <div class="pc-stat">
      <span class="pc-stat-k">${label}</span>
      <span class="pc-stat-v">${stats[key]}</span>
      <i class="pc-stat-bar"><b style="width:${stats[key]}%"></b></i>
    </div>`).join('')}</div>`;
}

/**
 * Reusable player card.
 * @param {object} p player
 * @param {{size?:'mini'|'md'|'full', chem?:number|null, action?:string, selected?:boolean}} opts
 */
export function playerCard(p, opts = {}) {
  const { size = 'md', chem = null, action = '', selected = false } = opts;
  const r = RARITY[p.rarity];
  const club = getClub(p.clubId);
  const crest = club ? crestSVG(club.crest, club.short, size === 'full' ? 34 : 24) : '';

  const chemPip = chem === null ? '' :
    `<span class="pc-chem chem-${chem >= 3 ? 'hi' : chem >= 2 ? 'mid' : 'lo'}" title="Chemistry ${chem}/3">
       ${'●'.repeat(Math.max(chem, 0))}${'○'.repeat(Math.max(3 - chem, 0))}
     </span>`;

  return `
    <article class="pcard pc-${size} rar-${p.rarity}${selected ? ' is-selected' : ''}${opts.evo ? ` evo-${opts.evo}` : ''}"
             data-player="${p.id}" style="--rar:${r.color};--rar-glow:${r.glow}" tabindex="0"
             aria-label="${p.name}, ${p.position}, rated ${p.overall}">
      <div class="pc-sheen"></div>
      <header class="pc-head">
        <div class="pc-rating">
          <b class="pc-ovr">${p.overall}</b>
          <span class="pc-pos">${p.position}</span>
          ${size === 'mini' ? '' : `<span class="pc-stars" title="Skill moves">${'★'.repeat(skillStars(p))}</span>`}
        </div>
        <div class="pc-badges">
          ${crest}
          ${flagSVG(p.nationColors, size === 'full' ? 26 : 20)}
        </div>
      </header>
      <div class="pc-portrait">${faceSVG(p, size === 'full' ? 96 : size === 'mini' ? 52 : size === 'showcase' ? 110 : 66, r.color)}</div>
      <div class="pc-name">${p.name}</div>
      ${size === 'mini' ? '' : `<div class="pc-traits">${traitHTML(p, { max: size === 'full' || size === 'showcase' ? 3 : 1 })}</div>`}
      ${size === 'full' ? `<div class="pc-radar-wrap">${radarSVG(p.stats, 168)}</div>` : ''}
      ${size === 'mini' ? '' : size === 'showcase' ? statRow(p.stats) : statBars(p.stats)}
      <footer class="pc-foot">
        <span class="pc-club">${club ? club.name : 'Free Agent'}</span>
        <span class="pc-meta">${p.nation} · ${p.age}y · ${p.foot === 'L' ? 'Left' : 'Right'} foot</span>
      </footer>
      ${chemPip}
      <span class="pc-rar-tag">${p.iconTier ? `${p.iconTier[0].toUpperCase()}${p.iconTier.slice(1)} Icon` : r.label}</span>
      ${p.iconTier ? `<span class="pc-tier">${p.iconTier.toUpperCase()}</span>` : ''}
      ${p.promoLabel && size !== 'mini' ? `<span class="pc-promo">${p.promoLabel}</span>` : ''}
      ${action}
    </article>`;
}

export const fmtMoney = (n) =>
  n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1000 ? `£${Math.round(n / 1000)}K` : `£${n}`;

/* ---- foil tilt ----
 * One listener on the document, so every card everywhere gets it and nothing
 * has to be wired per screen. The pointer's place over the card becomes the
 * tilt and the foil's angle; leaving the card snaps it back. Touch drags work
 * the same way, which is what makes a foil worth having on a phone. */
if (typeof document !== 'undefined' && !document.__apexFoil) {
  document.__apexFoil = true;
  const FOIL = '.pcard.rar-special, .pcard.rar-star, .pcard.rar-icon';
  let live = null;
  const move = (e) => {
    const card = e.target.closest?.(FOIL);
    if (live && card !== live) { live.classList.remove('is-tilting'); live.style.removeProperty('--tx'); live.style.removeProperty('--ty'); live = null; }
    if (!card) return;
    const r = card.getBoundingClientRect();
    const tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    card.style.setProperty('--tx', tx.toFixed(3));
    card.style.setProperty('--ty', ty.toFixed(3));
    card.classList.add('is-tilting');
    live = card;
  };
  const leave = () => {
    if (!live) return;
    live.classList.remove('is-tilting'); live.style.removeProperty('--tx'); live.style.removeProperty('--ty'); live = null;
  };
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  document.addEventListener('pointerup', leave);
  document.addEventListener('pointercancel', leave);
}
