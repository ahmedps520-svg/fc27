/**
 * v198: cosmetics — how your side looks, never how it plays.
 *
 * Three kinds, each one an extra option in a menu the game already has:
 *   kit          a shirt pattern (Club → Kit; data/kitDesign.js draws it)
 *   celebration  your scorers' goal celebration (Settings; game/celebrations.js)
 *   pitch        how your own ground is mown (Stadium Builder; builder.js PATTERNS)
 * None of them was free before: everything a player already had stays free.
 *
 * Paying. Every item has a price per currency, and today only Apex is
 * accepted (`PAYABLE`). The ✦ Ultimate currency, which can be bought for real
 * money on the web, is wired through the same `buyCosmetic(id, currency)` so
 * selling for it later is a price and a switch — `ULTIMATE_SALES` — not a new
 * code path. The App Store build never takes it: anything bought with real
 * money there would have to go through Apple's in-app purchase, which this
 * build does not have.
 *
 * Ownership lives in the save (`club.cosmetics.owned`). A kit or a ground is
 * drawn the same for everyone who sees it, owned or not: locking only
 * decides what *you* can pick.
 */
import { getState, update } from './state.js';
import { APP_STORE } from './platform.js';

export const ULTIMATE_SALES = false;
export const COSMETICS = [
  { id: 'kit:chevron', kind: 'kit', value: 'chevron', name: 'Chevron', price: { apex: 6000 } },
  { id: 'kit:band', kind: 'kit', value: 'band', name: 'Chest band', price: { apex: 6000 } },
  { id: 'kit:quarters', kind: 'kit', value: 'quarters', name: 'Quarters', price: { apex: 8000 } },
  { id: 'kit:checks', kind: 'kit', value: 'checks', name: 'Checks', price: { apex: 8000 } },
  { id: 'kit:fade', kind: 'kit', value: 'fade', name: 'Fade', price: { apex: 10000 } },
  { id: 'celeb:flex', kind: 'celebration', value: 'flex', name: 'Muscle Flex', price: { apex: 10000 } },
  { id: 'celeb:drummer', kind: 'celebration', value: 'drummer', name: 'Drum Roll', price: { apex: 10000 } },
  { id: 'celeb:archer', kind: 'celebration', value: 'archer', name: 'The Archer', price: { apex: 12000 } },
  { id: 'celeb:whirlwind', kind: 'celebration', value: 'whirlwind', name: 'Whirlwind', price: { apex: 15000 } },
  { id: 'pitch:waves', kind: 'pitch', value: 'waves', name: 'Waves', price: { apex: 12000 } },
  { id: 'pitch:chevron', kind: 'pitch', value: 'chevron', name: 'Chevrons', price: { apex: 12000 } },
  { id: 'pitch:diamonds', kind: 'pitch', value: 'diamonds', name: 'Diamonds', price: { apex: 15000 } },
];
export const KINDS = [['kit', 'Kit patterns'], ['celebration', 'Celebrations'], ['pitch', 'Pitch patterns']];
export const cosmeticById = (id) => COSMETICS.find((c) => c.id === id) || null;
const itemOf = (kind, value) => COSMETICS.find((c) => c.kind === kind && c.value === value) || null;

/** May a purchase be paid in this currency, on this build? */
export function payable(currency) {
  if (currency === 'apex') return true;
  if (currency === 'ultimate') return ULTIMATE_SALES && !APP_STORE;
  return false;
}

const ownedList = (s = getState()) => s.club.cosmetics?.owned || [];
export const owns = (id, s = getState()) => ownedList(s).includes(id);
/** Is this option one you would have to buy first? (Anything that is not for sale is free.) */
export function locked(kind, value, s = getState()) {
  const it = itemOf(kind, value);
  return !!it && !owns(it.id, s);
}

export function buyCosmetic(id, currency = 'apex') {
  const it = cosmeticById(id);
  if (!it) return { error: 'Not for sale.' };
  if (!payable(currency) || it.price[currency] == null) return { error: 'Not for sale that way.' };
  let out = null;
  update((s) => {
    if (owns(id, s)) { out = { error: 'Already yours.' }; return; }
    const cost = it.price[currency];
    const have = currency === 'apex' ? s.club.apex | 0 : s.club.ultimate | 0;
    if (have < cost) { out = { error: currency === 'apex' ? `You need ◈${cost.toLocaleString()}.` : 'Not enough ✦.' }; return; }
    if (currency === 'apex') s.club.apex -= cost; else s.club.ultimate -= cost;
    const c = s.club.cosmetics || (s.club.cosmetics = { owned: [] });
    c.owned.push(id);
    out = { item: it };
  });
  return out;
}

/**
 * Put an owned item on: the home kit's pattern, your celebration, or your
 * ground's mow (a ground is made from the club colours if there is none yet).
 */
export function useCosmetic(id, { defaultDesign } = {}) {
  const it = cosmeticById(id);
  if (!it || !owns(id)) return false;
  update((s) => {
    if (it.kind === 'kit') {
      const idn = s.club.identity || (s.club.identity = {});
      const kit = idn.kit || (idn.kit = {});
      kit.home = { ...(kit.home || {}), pattern: it.value };
    } else if (it.kind === 'celebration') {
      s.settings.celebration = it.value;
    } else if (it.kind === 'pitch') {
      const st = s.club.stadium || (s.club.stadium = { design: null, saved: [] });
      st.design = { ...(st.design || defaultDesign?.() || {}), pattern: it.value };
    }
  });
  return true;
}
/** Is an owned item the one in use? */
export function inUse(id, s = getState()) {
  const it = cosmeticById(id); if (!it) return false;
  if (it.kind === 'kit') return s.club.identity?.kit?.home?.pattern === it.value || s.club.identity?.kit?.away?.pattern === it.value;
  if (it.kind === 'celebration') return s.settings.celebration === it.value;
  return s.club.stadium?.design?.pattern === it.value;
}
