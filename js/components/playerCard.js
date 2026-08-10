import { RARITY } from '../data/pools.js';
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
    <article class="pcard pc-${size} rar-${p.rarity}${selected ? ' is-selected' : ''}"
             data-player="${p.id}" style="--rar:${r.color};--rar-glow:${r.glow}" tabindex="0"
             aria-label="${p.name}, ${p.position}, rated ${p.overall}">
      <div class="pc-sheen"></div>
      <header class="pc-head">
        <div class="pc-rating">
          <b class="pc-ovr">${p.overall}</b>
          <span class="pc-pos">${p.position}</span>
        </div>
        <div class="pc-badges">
          ${crest}
          ${flagSVG(p.nationColors, size === 'full' ? 26 : 20)}
        </div>
      </header>
      <div class="pc-portrait">${faceSVG(p, size === 'full' ? 96 : size === 'mini' ? 52 : 66, r.color)}</div>
      <div class="pc-name">${p.name}</div>
      ${size === 'full' ? `<div class="pc-radar-wrap">${radarSVG(p.stats, 168)}</div>` : ''}
      ${size === 'mini' ? '' : statBars(p.stats)}
      <footer class="pc-foot">
        <span class="pc-club">${club ? club.name : 'Free Agent'}</span>
        <span class="pc-meta">${p.nation} · ${p.age}y · ${p.foot === 'L' ? 'Left' : 'Right'} foot</span>
      </footer>
      ${chemPip}
      <span class="pc-rar-tag">${r.label}</span>
      ${action}
    </article>`;
}

export const fmtMoney = (n) =>
  n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  : n >= 1000 ? `£${Math.round(n / 1000)}K` : `£${n}`;
