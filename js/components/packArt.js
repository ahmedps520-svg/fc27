/**
 * A pack as a picture, for anywhere a pack is promised — an objective, an
 * SBC reward, a weekend rank, a Season Pass tier. The same stacked-cards art
 * the store draws, at a size that fits in a line of text, coloured by the
 * pack's tone so a Prime reads as Prime at a glance.
 */
import { PACK_BY_ID, packTone } from '../data/packs.js';

export function packArt(packOrId, { size = 'sm', label = true } = {}) {
  const p = typeof packOrId === 'string' ? PACK_BY_ID(packOrId) : packOrId;
  if (!p) return '';
  return `
    <span class="pack-art pack-art-${size} rar-${packTone(p)}" title="${p.name}">
      <span class="sp-art">
        <span class="sp-fan" aria-hidden="true"><i></i><i></i></span>
        <span class="sp-face"><span class="sp-mark">UXI</span><span class="sp-count">×${p.size}</span></span>
        <i class="sp-foil" aria-hidden="true"></i>
      </span>
      ${label ? `<b>${p.name}</b>` : ''}
    </span>`;
}
