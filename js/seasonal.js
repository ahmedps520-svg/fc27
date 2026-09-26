/**
 * Seasonal menu themes (v83).
 *
 *   nationalDay  Saudi National Day (23 September) and the days around it:
 *                green and white, pennant bunting and palms. No flag, no
 *                emblem and no text of anyone else's — our own decoration.
 *   ramadan      the nights of Ramadan: lanterns hung across the top, a
 *                crescent and stars, gold on deep blue. Quiet on purpose —
 *                nothing flashes, nothing plays.
 *   winter       December to February: falling snow, colder light.
 *
 * `auto` picks by date (National Day first, then Ramadan, then winter);
 * Settings can force one or turn them off. Ramadan follows the lunar year,
 * so its start and end are listed per year (the Umm al-Qura estimates, a
 * day either way of the sighting); a year not listed simply has no Ramadan
 * theme rather than a wrong one.
 */
export const THEMES = {
  nationalDay: { name: 'National Day', greeting: { en: 'Happy National Day', ar: 'يوم وطني سعيد' } },
  ramadan: { name: 'Ramadan nights', greeting: { en: 'Ramadan Kareem', ar: 'رمضان كريم' } },
  winter: { name: 'Winter', greeting: { en: 'Winter football', ar: 'كرة الشتاء' } },
};
// [first day, last day] of Ramadan, local dates
const RAMADAN = {
  2025: ['2025-03-01', '2025-03-30'],
  2026: ['2026-02-18', '2026-03-19'],
  2027: ['2027-02-08', '2027-03-09'],
  2028: ['2028-01-28', '2028-02-26'],
  2029: ['2029-01-16', '2029-02-14'],
  2030: ['2030-01-06', '2030-02-04'],
};
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The theme a date calls for, or null. */
export function themeForDate(d = new Date()) {
  const m = d.getMonth() + 1; const day = d.getDate();
  if (m === 9 && day >= 20 && day <= 26) return 'nationalDay';
  const r = RAMADAN[d.getFullYear()];
  const today = ymd(d);
  if (r && today >= r[0] && today <= r[1]) return 'ramadan';
  if (m === 12 || m <= 2) return 'winter';
  return null;
}

/** The theme to show: `setting` is 'auto', 'off' or a theme id. */
export function activeTheme(setting = 'auto', d = new Date()) {
  if (setting === 'off') return null;
  if (THEMES[setting]) return setting;
  return themeForDate(d);
}

/* Decoration, as markup. Lanterns, pennants, palms and flakes are drawn
 * here — plain shapes, nothing traced from anywhere. */
/* v126: National Day, redrawn. v83's pennants were one SVG stretched to the
 * width of the screen (preserveAspectRatio none) and its palms were sliced to
 * fit, so on a wide screen they were smeared triangles and two green bars.
 * Everything here is drawn at a fixed size and repeated or placed, never
 * stretched: a Najdi crenellation (the stepped parapet of the old mud-brick
 * towns) tiled along the top, a palm in each lower corner, fireworks that
 * burst and fade, and a little green-and-white confetti. No flag and no
 * emblem — our own decoration. */
const najdi = `<svg class="sz-najdi" aria-hidden="true"><defs><pattern id="szNajdi" width="36" height="22" patternUnits="userSpaceOnUse">
  <path d="M0 0 H36 V6 H30 L27 3 L24 6 H22 L18 1 L14 6 H12 L9 3 L6 6 H0 Z" fill="#0f7a41"/>
  <path d="M0 8 H36 V10 H0 Z" fill="#e8f5ec" opacity=".9"/>
  <path d="M4 12 L8 18 L12 12 Z M22 12 L26 18 L30 12 Z" fill="#0f7a41" opacity=".85"/>
  <path d="M13 12 L18 20 L23 12 Z" fill="#c9a24a" opacity=".9"/>
</pattern></defs><rect width="100%" height="22" fill="url(#szNajdi)"/></svg>`;
const palmSVG = (flip) => `<svg class="sz-palm${flip ? ' flip' : ''}" viewBox="0 0 160 220" aria-hidden="true">
  <defs><linearGradient id="szTrunk${flip ? 'B' : 'A'}" x1="0" x2="1"><stop offset="0" stop-color="#5b3a1e"/><stop offset=".55" stop-color="#8a5a2e"/><stop offset="1" stop-color="#4a2e17"/></linearGradient></defs>
  <path d="M74 220 C76 170 70 120 86 72 L94 74 C82 122 88 172 88 220 Z" fill="url(#szTrunk${flip ? 'B' : 'A'})"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<path d="M76 ${214 - k * 16} q6 -4 12 0" stroke="#3a2412" stroke-width="1.4" fill="none" opacity=".6"/>`).join('')}
  <g fill="#15834a" stroke="#0b5a31" stroke-width="1">
    <path d="M90 72 C60 52 30 56 6 78 C34 66 58 66 90 76 Z"/>
    <path d="M90 72 C66 40 40 30 18 34 C44 42 64 56 88 76 Z"/>
    <path d="M90 72 C88 40 96 18 112 6 C104 30 100 50 94 74 Z"/>
    <path d="M90 72 C116 44 140 40 158 50 C134 52 114 60 94 76 Z"/>
    <path d="M90 72 C122 68 146 80 156 104 C136 88 116 82 92 78 Z"/>
    <path d="M90 72 C70 80 54 96 48 120 C64 100 76 90 92 78 Z"/>
  </g>
  <g fill="#c68b2c"><circle cx="84" cy="82" r="4"/><circle cx="92" cy="84" r="4"/><circle cx="88" cy="89" r="3.6"/></g>
</svg>`;
/** One firework: rays from a centre, drawn once, burst by CSS. */
const burst = (x, y, color, delay, size) => `<svg class="sz-burst" style="--x:${x}%;--y:${y}px;--d:${delay}s;--s:${size}px" viewBox="-50 -50 100 100" aria-hidden="true">
  <g stroke="${color}" stroke-width="3" stroke-linecap="round">${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return `<line x1="${(Math.cos(a) * 14).toFixed(1)}" y1="${(Math.sin(a) * 14).toFixed(1)}" x2="${(Math.cos(a) * 44).toFixed(1)}" y2="${(Math.sin(a) * 44).toFixed(1)}"/>`; }).join('')}</g>
  <g fill="${color}">${Array.from({ length: 14 }, (_, i) => { const a = ((i + 0.5) / 14) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 34).toFixed(1)}" cy="${(Math.sin(a) * 34).toFixed(1)}" r="2.6"/>`; }).join('')}</g>
</svg>`;
/* v126: Ramadan and winter, redrawn to the same rule — fixed sizes, tiled or
 * placed. v83's lantern string was one SVG sliced to the screen's width, so
 * on a desktop the lanterns were a foot tall and cut off, and the crescent
 * fell off the edge; winter was a few specks. */
const starBand = `<svg class="sz-band" aria-hidden="true"><defs><pattern id="szStars8" width="40" height="24" patternUnits="userSpaceOnUse">
  <path d="M0 2 H40" stroke="#c9a24a" stroke-width="1.4"/><path d="M0 22 H40" stroke="#c9a24a" stroke-width=".8" opacity=".6"/>
  <g transform="translate(20 12)" fill="none" stroke="#e3c16f" stroke-width="1.1">
    <rect x="-6" y="-6" width="12" height="12"/><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)"/>
  </g><circle cx="20" cy="12" r="1.6" fill="#ffe7a3"/><circle cx="0" cy="12" r="1" fill="#c9a24a"/><circle cx="40" cy="12" r="1" fill="#c9a24a"/>
</pattern></defs><rect width="100%" height="24" fill="url(#szStars8)"/></svg>`;
const bigLantern = (hue, i) => `<svg class="sz-lan" style="--x:${[8, 24, 41, 57, 72, 85][i]}%;--drop:${[34, 58, 26, 50, 30, 62][i]}px;--dl:${i * 0.7}s" viewBox="-24 0 48 120" aria-hidden="true">
  <line x1="0" y1="0" x2="0" y2="22" stroke="#c9a24a" stroke-width="1.2"/>
  <g transform="translate(0 22)">
    <path d="M-6 0 H6 L4 -4 H-4 Z" fill="#c9a24a"/><circle cx="0" cy="-7" r="3" fill="none" stroke="#c9a24a" stroke-width="1.4"/>
    <path d="M-11 0 H11 L16 10 H-16 Z" fill="#c9a24a"/>
    <path d="M-15 10 H15 Q19 36 12 58 H-12 Q-19 36 -15 10 Z" fill="hsl(${hue} 72% 52% / .9)" stroke="#c9a24a" stroke-width="1.4"/>
    <path d="M-7 10 Q-9 34 -5 58 M7 10 Q9 34 5 58 M0 10 V58" stroke="#e3c16f" stroke-width="1" fill="none" opacity=".8"/>
    <ellipse class="sz-flame" cx="0" cy="36" rx="7" ry="11" fill="#ffe7a3"/>
    <path d="M-12 58 H12 L7 68 H-7 Z" fill="#c9a24a"/><path d="M0 68 V78" stroke="#c9a24a" stroke-width="1.6"/><circle cx="0" cy="81" r="2.6" fill="#c9a24a"/>
  </g></svg>`;
const crescent = `<svg class="sz-moon" viewBox="-50 -50 100 100" aria-hidden="true">
  <circle r="46" fill="rgba(255,231,163,.10)"/><path d="M8 -38 A40 40 0 1 0 8 38 A32 32 0 1 1 8 -38 Z" fill="#ffe7a3"/>
  <path d="M30 -14 l3.2 7 7.6 .8 -5.7 5.1 1.6 7.5 -6.7 -3.9 -6.7 3.9 1.6 -7.5 -5.7 -5.1 7.6 -.8 Z" fill="#ffe7a3"/></svg>`;
const icicles = `<svg class="sz-band sz-ice" aria-hidden="true"><defs><pattern id="szIce" width="64" height="30" patternUnits="userSpaceOnUse">
  <path d="M0 0 H64 V5 L60 5 L57 22 L54 5 L46 5 L43 14 L40 5 L30 5 L26 28 L22 5 L14 5 L11 16 L8 5 L0 5 Z" fill="#e8f6ff" opacity=".92"/>
  <path d="M0 0 H64 V3 H0 Z" fill="#fff"/></pattern></defs><rect width="100%" height="30" fill="url(#szIce)"/></svg>`;
const flake = (i) => `<svg class="sz-flake" style="--x:${(i * 37 + 11) % 100}%;--d:${9 + (i % 7) * 1.6}s;--o:${-((i * 1.9) % 12)}s;--s:${[10, 16, 24][i % 3]}px;--sw:${(i % 2 ? 1 : -1) * (14 + (i % 4) * 6)}px" viewBox="-12 -12 24 24" aria-hidden="true">
  <g stroke="#fff" stroke-width="1.5" stroke-linecap="round">${[0, 60, 120].map((a) => `<g transform="rotate(${a})"><path d="M0 -10 V10"/><path d="M0 -6 l-3 -3 M0 -6 l3 -3 M0 6 l-3 3 M0 6 l3 3"/></g>`).join('')}</g></svg>`;

/** The anniversary: the Kingdom was unified on 23 September 1932 (2024 was the 94th). */
export const nationalDayNumber = (d = new Date()) => d.getFullYear() - 1930;

export function decorationHTML(theme, { lang = 'en' } = {}) {
  if (!theme) return '';
  const hi = THEMES[theme].greeting[lang] || THEMES[theme].greeting.en;
  if (theme === 'ramadan') {
    return `<div class="season-deco sz-ramadan" aria-hidden="true">
      <div class="sz-glowtop"></div>
      ${starBand}
      ${[20, 200, 40, 330, 160, 280].map(bigLantern).join('')}
      ${crescent}
      ${Array.from({ length: 16 }, (_, i) => `<i class="sz-twinkle" style="--x:${(i * 41 + 7) % 100}%;--y:${40 + ((i * 29) % 150)}px;--t:${(i % 5) * 0.8}s"></i>`).join('')}
      <span class="sz-hi">${hi}</span></div>`;
  }
  if (theme === 'nationalDay') {
    const no = nationalDayNumber();
    return `<div class="season-deco sz-national" aria-hidden="true">
      <div class="sz-glowtop"></div>
      ${najdi}
      ${burst(12, 70, '#2fd27a', 0, 90)}${burst(84, 56, '#ffffff', 1.3, 110)}${burst(60, 120, '#e3c16f', 2.6, 70)}${burst(30, 150, '#ffffff', 3.4, 60)}${burst(94, 170, '#2fd27a', 4.2, 80)}
      ${Array.from({ length: 18 }, (_, i) => `<i class="sz-conf" style="--x:${(i * 53) % 100}%;--d:${7 + (i % 6)}s;--o:${((i * 17) % 10) / 2}s;--c:${['#1fbf62', '#ffffff', '#e3c16f'][i % 3]};--r:${(i * 47) % 360}deg"></i>`).join('')}
      ${palmSVG(false)}${palmSVG(true)}
      <span class="sz-hi"><b>${no}</b>${hi}</span></div>`;
  }
  return `<div class="season-deco sz-winter" aria-hidden="true">
    <div class="sz-glowtop"></div>
    ${icicles}
    ${Array.from({ length: 26 }, (_, i) => flake(i)).join('')}
    <div class="sz-drift"></div>
    <span class="sz-hi">${hi}</span></div>`;
}
