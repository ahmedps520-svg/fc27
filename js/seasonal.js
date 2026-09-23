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
const lantern = (x, drop, hue) => `
  <g transform="translate(${x} 0)">
    <line x1="0" y1="0" x2="0" y2="${drop}" stroke="#c9a24a" stroke-width="1.2"/>
    <g transform="translate(0 ${drop})" class="sz-lantern">
      <path d="M-7 0 H7 L10 6 H-10 Z" fill="#c9a24a"/>
      <path d="M-9 6 H9 L7 30 H-7 Z" fill="hsl(${hue} 70% 55% / .85)" stroke="#c9a24a" stroke-width="1.2"/>
      <path d="M-4 6 V30 M4 6 V30 M-8 18 H8" stroke="#c9a24a" stroke-width=".8"/>
      <path d="M-7 30 H7 L4 36 H-4 Z" fill="#c9a24a"/>
      <circle cx="0" cy="18" r="4" fill="#ffe7a3" class="sz-glow"/>
    </g>
  </g>`;
const pennants = (n, w) => Array.from({ length: n }, (_, i) => {
  const x = (i + 0.5) * (w / n);
  return `<path d="M${x - 12} 6 L${x + 12} 6 L${x} 30 Z" fill="${i % 2 ? '#fff' : '#1b8a4c'}" opacity=".92"/>`;
}).join('');
const palm = (x, s, flip = 1) => `
  <g transform="translate(${x} 120) scale(${s * flip} ${s})" fill="#0f5a33" opacity=".75">
    <path d="M0 0 C3 -30 2 -60 6 -90 L10 -90 C6 -60 8 -30 6 0 Z"/>
    <path d="M8 -90 C-10 -100 -30 -96 -44 -84 C-26 -92 -10 -90 8 -86 Z"/>
    <path d="M8 -90 C24 -104 44 -102 56 -92 C40 -96 24 -94 8 -86 Z"/>
    <path d="M8 -90 C0 -110 -18 -118 -32 -116 C-16 -112 -4 -104 8 -88 Z"/>
    <path d="M8 -90 C18 -112 36 -120 50 -118 C34 -112 20 -104 8 -88 Z"/>
  </g>`;

export function decorationHTML(theme, { lang = 'en' } = {}) {
  if (!theme) return '';
  const hi = THEMES[theme].greeting[lang] || THEMES[theme].greeting.en;
  if (theme === 'ramadan') {
    return `<div class="season-deco sz-ramadan" aria-hidden="true">
      <svg class="sz-top" viewBox="0 0 400 90" preserveAspectRatio="xMidYMin slice">
        <path d="M0 8 Q100 26 200 8 T400 8" fill="none" stroke="#c9a24a" stroke-width="1.2"/>
        ${lantern(50, 16, 20)}${lantern(120, 30, 200)}${lantern(200, 12, 40)}${lantern(280, 28, 330)}${lantern(350, 18, 160)}
        <g transform="translate(372 58)"><path d="M0 -14 A14 14 0 1 0 0 14 A10 10 0 1 1 0 -14 Z" fill="#ffe7a3"/></g>
        <circle cx="330" cy="70" r="1.4" fill="#ffe7a3"/><circle cx="20" cy="60" r="1.2" fill="#ffe7a3"/><circle cx="240" cy="74" r="1.1" fill="#ffe7a3"/>
      </svg>
      <span class="sz-hi">${hi}</span></div>`;
  }
  if (theme === 'nationalDay') {
    return `<div class="season-deco sz-national" aria-hidden="true">
      <svg class="sz-top" viewBox="0 0 400 40" preserveAspectRatio="none"><path d="M0 6 Q200 18 400 6" fill="none" stroke="#fff" stroke-width="1"/>${pennants(14, 400)}</svg>
      <svg class="sz-palms" viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice">${palm(24, 1)}${palm(376, 1.1, -1)}</svg>
      <span class="sz-hi">${hi}</span></div>`;
  }
  return `<div class="season-deco sz-winter" aria-hidden="true">${Array.from({ length: 28 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${6 + (i % 7)}s;--o:${(i * 13) % 10 / 10}s;--s:${3 + (i % 4)}px"></i>`).join('')}<span class="sz-hi">${hi}</span></div>`;
}
