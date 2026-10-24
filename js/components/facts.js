/**
 * Facts, not paragraphs (v120).
 *
 * The screens used to explain themselves in a sentence or two under every
 * heading. A game says it with pictures: an icon and a number. `facts` is a
 * row of icon chips (⏱ 2½ min · 👥 5v5 · ◈500 a win); `about` keeps the
 * sentence for anyone who wants it, folded behind a small ⓘ in the panel
 * head — a <details>, so it needs no script and works with a pad or a reader.
 *
 * The icons are drawn in the same hand as the menu's (24-unit box, round
 * 1.7 strokes, currentColor), so they sit with everything else.
 */

const PATHS = {
  clock: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7.5V12l3 2"/>',
  players: '<circle cx="9" cy="8.5" r="2.8"/><path d="M3.8 19c.6-3 2.7-4.8 5.2-4.8s4.6 1.8 5.2 4.8"/><circle cx="16.6" cy="9.3" r="2.2"/><path d="M15.4 14.4c2.3-.2 4.2 1.3 4.8 4.1"/>',
  coin: '<circle cx="12" cy="12" r="8.2"/><path d="M12 7l4 5-4 5-4-5z"/>',
  goal: '<path d="M3.5 18.5V7h17v11.5"/><path d="M3.5 11h17M3.5 15h17M8 7v11.5M12 7v11.5M16 7v11.5" opacity=".45"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 5.5H5.6v1.2A3.4 3.4 0 0 0 9 10.1M16 5.5h2.4v1.2A3.4 3.4 0 0 1 15 10.1"/><path d="M12 13v3.2M9 20h6M9.6 16.2h4.8L15 20H9z"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  bolt: '<path d="M13 3.5L6 13.5h5l-1 7 7-10h-5z"/>',
  shield: '<path d="M12 3.5l7 2.5v5.5c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  star: '<path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6-5-2.8-5 2.8 1-5.6-4.1-3.9 5.6-.7z"/>',
  up: '<path d="M4 17l5.5-5.5 3.5 3.5L20 8"/><path d="M15 8h5v5"/>',
  percent: '<path d="M6 18L18 6"/><circle cx="7.5" cy="7.5" r="2.2"/><circle cx="16.5" cy="16.5" r="2.2"/>',
  refresh: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19.5 4.5V9H15"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="9" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  card: '<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M9 8h3M9 10.5h2"/><circle cx="12" cy="14.5" r="2"/>',
  glow: '<path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  ball: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4z"/>',
  whistle: '<path d="M4 11.5a4.5 4.5 0 1 0 9 0h6.5V8H8.5"/><circle cx="8.5" cy="11.5" r="1.3"/>',
  target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r=".9"/>',
  boot: '<path d="M5 6.5h5.5l1 5 6.5 2.3c1.3.5 2 1.4 2 2.7v.5H5z"/><path d="M8 19.5v-2.5M11 19.5v-2.5M14 19.5v-2.5"/>',
  hand: '<path d="M8 20v-8.5M8 11.5V6a1.5 1.5 0 0 1 3 0v5M11 10V4.8a1.5 1.5 0 0 1 3 0V10M14 10.5V6.2a1.5 1.5 0 0 1 3 0v7.3c0 3.6-2.4 6.5-6 6.5-2.3 0-3.8-1-5-3l-2-3.3a1.5 1.5 0 0 1 2.5-1.6L8 13"/>',
  swap: '<path d="M6 8.5h12l-3.5-3.5M18 15.5H6l3.5 3.5"/>',
  heart: '<path d="M12 19.5s-7-4.3-7-9.5a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.2-7 9.5-7 9.5z"/>',
  money: '<rect x="3.5" y="6.5" width="17" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v5M17.5 9.5v5"/>',
  book: '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
  // v201: the match settings and the modes, as pictures
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/>',
  dusk: '<path d="M6.5 16a5.5 5.5 0 0 1 11 0"/><path d="M3 19.5h18M12 5.5v3M5 9l1.8 1.8M19 9l-1.8 1.8"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  cloud: '<path d="M7.5 18.5h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7.5 18.5z"/>',
  rain: '<path d="M7.5 14.5h9.5a3.6 3.6 0 0 0 .4-7.2 5 5 0 0 0-9.6 1.2 3 3 0 0 0-.3 6z"/><path d="M9 17.5l-1 2.5M13 17.5l-1 2.5M17 17.5l-1 2.5"/>',
  snow: '<path d="M12 3.5v17M4.6 7.8l14.8 8.4M4.6 16.2l14.8-8.4"/><path d="M10 5l2 1.6L14 5M10 19l2-1.6 2 1.6"/>',
  auto: '<path d="M11 4l1.8 4.6L17.5 10l-4.7 1.4L11 16l-1.8-4.6L4.5 10l4.7-1.4z"/><path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
  person: '<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.7 3.3-5.8 6.5-5.8s5.8 2.1 6.5 5.8"/>',
  pad: '<path d="M7 8.5h10a4 4 0 0 1 3.9 4.9l-.8 3.4a2.4 2.4 0 0 1-4 1.2L14 16h-4l-2.1 2a2.4 2.4 0 0 1-4-1.2l-.8-3.4A4 4 0 0 1 7 8.5z"/><path d="M8 11.5v3M6.5 13h3"/><circle cx="15.5" cy="12.3" r=".8"/><circle cx="17.3" cy="14" r=".8"/>',
  stadium: '<path d="M3.5 10c0-2.2 3.8-4 8.5-4s8.5 1.8 8.5 4v6c0 2.2-3.8 4-8.5 4s-8.5-1.8-8.5-4z"/><path d="M3.5 10c0 2.2 3.8 4 8.5 4s8.5-1.8 8.5-4"/><path d="M8 13.6v4.6M16 13.6v4.6" opacity=".55"/>',
  globe: '<circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4M12 3.8c2.3 2.4 3.3 5.2 3.3 8.2s-1 5.8-3.3 8.2c-2.3-2.4-3.3-5.2-3.3-8.2s1-5.8 3.3-8.2z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
};

export const ICON_NAMES = Object.keys(PATHS);

/** One icon, inline SVG, in the text colour. Unknown names draw nothing. */
export function icon(name, size = 16) {
  const d = PATHS[name];
  if (!d) return '';
  return `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

/**
 * A row of icon chips. Each item is [icon, text] or [icon, text, tone] where
 * tone is 'good' | 'gold' | 'warn'. Text is trusted markup (callers build it
 * from numbers and their own copy).
 */
export function facts(items, cls = '') {
  const list = (items || []).filter(Boolean);
  if (!list.length) return '';
  return `<div class="facts ${cls}">${list.map(([ic, text, tone]) => `<span class="fact ${tone || ''}">${icon(ic, 15)}<b>${text}</b></span>`).join('')}</div>`;
}

/** The long explanation, folded behind an ⓘ. Put it in a panel head. */
export function about(text, label = 'How it works') {
  if (!text) return '';
  return `<details class="about"><summary aria-label="${label}" title="${label}">i</summary><p>${text}</p></details>`;
}

/** A big number with a small label under it — for results and summaries. */
export function bigStat(value, label, ic = '', tone = '') {
  return `<div class="big-stat ${tone}">${ic ? icon(ic, 18) : ''}<b>${value}</b><span>${label}</span></div>`;
}
