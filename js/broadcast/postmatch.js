/**
 * After the whistle (v83): the player of the match reveal, ratings for both
 * sides, the full stat sheet, the momentum of the match as a graph, the
 * dressing room's reaction, and a result card to share.
 *
 * All read from a finished Match (and ratings.js) — nothing here touches the
 * simulation. The result card is drawn on a canvas in our own design and
 * handed to the platform's share sheet, or downloaded where there is none.
 */
import { crestSVG } from '../components/crest.js';
import { faceSVG } from '../components/face.js';

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const band = (r) => (r >= 8 ? 'r-top' : r >= 7 ? 'r-good' : r >= 6 ? 'r-ok' : 'r-low');

/** The reveal: the face, the name, the mark. */
export function potmHTML(potm, match) {
  if (!potm) return '';
  const team = match.teams[potm.side];
  const ref = team.players.find((p) => p.ref.id === potm.id)?.ref || { id: potm.id, name: potm.name };
  return `
    <div class="pm-potm" style="--kit:${team.colors?.[0] || '#243049'}">
      <span class="pm-k">Player of the match</span>
      <div class="pm-face">${faceSVG(ref, 84, team.colors?.[0])}</div>
      <b>${esc(potm.name)}</b>
      <em>${esc(team.short)} · ${potm.goals ? `${potm.goals} goal${potm.goals > 1 ? 's' : ''} · ` : ''}${potm.km} km</em>
      <span class="pm-rating ${band(potm.rating)}">${potm.rating.toFixed(1)}</span>
    </div>`;
}

/** Both sides' ratings, best first. */
export function ratingsHTML(rated, match) {
  const col = (side) => {
    const rows = rated.players.filter((r) => r.side === side);
    return `<div class="pm-col"><header>${crestSVG(match.teams[side].club?.crest, match.teams[side].short, 22)}<b>${esc(match.teams[side].short)}</b></header>
      <ol>${rows.map((r) => `<li><span class="pm-r ${band(r.rating)}">${r.rating.toFixed(1)}</span><b>${esc(r.short)}</b><em>${esc(r.pos)}${r.goals ? ` · ⚽${r.goals > 1 ? `×${r.goals}` : ''}` : ''}${r.assists ? ` · 🅰${r.assists > 1 ? `×${r.assists}` : ''}` : ''}${r.mins < 85 ? ` · ${r.mins}'` : ''}</em>${rated.potm?.id === r.id ? '<i class="pm-star">★</i>' : ''}</li>`).join('')}</ol></div>`;
  };
  return `<div class="pm-ratings">${col(0)}${col(1)}</div>`;
}

/** The full stat sheet: the sim's team counts and the per-player tallies summed. */
export function teamStats(match) {
  const sum = (side, k) => Object.values(match.pst || {}).filter((s) => s.team === side).reduce((n, s) => n + (s[k] || 0), 0);
  const [ph, pa] = match.possession();
  return [
    ['Possession', `${ph}%`, `${pa}%`],
    ['Shots', match.teams[0].shots, match.teams[1].shots],
    ['On target', match.teams[0].onTarget, match.teams[1].onTarget],
    ['Expected goals', (match.teams[0].xg || 0).toFixed(2), (match.teams[1].xg || 0).toFixed(2)],
    ['Big chances', match.teams[0].bigChances || 0, match.teams[1].bigChances || 0],
    ['Passes', sum(0, 'passes'), sum(1, 'passes')],
    ['Tackles won', sum(0, 'tackles'), sum(1, 'tackles')],
    ['Saves', sum(0, 'saves'), sum(1, 'saves')],
    ['Distance (km)', (sum(0, 'dist') / 1000).toFixed(1), (sum(1, 'dist') / 1000).toFixed(1)],
    ['Bookings', (match.bookings || []).filter((b) => b.team === 0 && !b.red).length, (match.bookings || []).filter((b) => b.team === 1 && !b.red).length],
    ...((match.bookings || []).some((b) => b.red) ? [['Sent off', (match.bookings || []).filter((b) => b.team === 0 && b.red).length, (match.bookings || []).filter((b) => b.team === 1 && b.red).length]] : []),
  ];
}
export function statsHTML(match) {
  return `<div class="gm-stats pm-stats">${teamStats(match).map(([k, h, a]) => `<div><b>${h}</b><span>${k}</span><b>${a}</b></div>`).join('')}</div>`;
}

/** The momentum of the whole match as a filled line: home above, away below. */
export function momentumSVG(series, colors = ['#3fd08a', '#e25656']) {
  if (!series || series.length < 3) return '';
  const W = 300; const H = 70; const n = series.length;
  const pts = series.map((v, i) => `${(i / (n - 1)) * W},${H / 2 - v * (H / 2 - 3)}`);
  const area = `M0,${H / 2} L${pts.join(' L')} L${W},${H / 2} Z`;
  return `<svg class="pm-mom" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Momentum through the match">
    <defs><clipPath id="pmTop"><rect x="0" y="0" width="${W}" height="${H / 2}"/></clipPath><clipPath id="pmBot"><rect x="0" y="${H / 2}" width="${W}" height="${H / 2}"/></clipPath></defs>
    <path d="${area}" fill="${colors[0]}" opacity=".75" clip-path="url(#pmTop)"/>
    <path d="${area}" fill="${colors[1]}" opacity=".75" clip-path="url(#pmBot)"/>
    <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" stroke="rgba(255,255,255,.35)"/>
    <line x1="${W / 2}" x2="${W / 2}" y1="0" y2="${H}" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 3"/>
  </svg>`;
}

/**
 * The dressing room afterwards: a scene and the manager's words, by result.
 * Pure and seeded by the score so the same match always reads the same.
 */
export function reaction({ mine, theirs, comeback = false, final = false, manager = 'The manager', lang = 'en' }) {
  const d = mine - theirs;
  const pick = (a) => a[Math.abs(mine * 7 + theirs * 3) % a.length];
  if (lang === 'ar') {
    if (final && d > 0) return { scene: 'غرفة الملابس تشتعل فرحاً: أغانٍ، ماء، والكأس في المنتصف.', quote: pick(['هذه الليلة لكم أيها الجماهير.', 'عملنا طوال الموسم من أجل هذه اللحظة.']) };
    if (d > 0) return { scene: comeback ? 'صيحات وتصفيق: فريق عاد من بعيد.' : 'ابتسامات وتصفيق، والموسيقى عالية.', quote: pick(['أداء رجولي. فخور باللاعبين.', 'ثلاث نقاط مستحقة، ونواصل العمل.', 'هكذا نريد أن نلعب.']) };
    if (d === 0) return { scene: 'هدوء نسبي، بعض الرؤوس منخفضة وبعضها مرفوع.', quote: pick(['نقطة، لكن كان بإمكاننا أكثر.', 'نتيجة عادلة في مباراة صعبة.']) };
    return { scene: 'صمت ثقيل، والمدرب يتحدث بصوت منخفض.', quote: pick(['لم نكن في المستوى اليوم، وسنعود أقوى.', 'الخسارة مؤلمة، والمسؤولية مشتركة.']) };
  }
  if (final && d > 0) return { scene: 'Bedlam in the dressing room — music up, the trophy in the middle of the floor, somebody\'s phone filming it all.', quote: pick(['"That one is for everybody who travelled."', '"We have worked all season for tonight. Enjoy it."']) };
  if (d >= 3) return { scene: 'Music on, laughter, the kit man doing a lap of honour with the ball.', quote: pick(['"That is the standard. Now we keep it."', '"Clinical, disciplined, and fun to watch."']) };
  if (d > 0) return { scene: comeback ? 'A roar as the door shuts — they came from behind and they know what that means.' : 'Handshakes and back-slaps; the manager goes round every player.', quote: pick(['"Proud of them. Three points and we go again."', '"We had to suffer at times, but we found a way."', '"That is how I want us to play."']) };
  if (d === 0) return { scene: 'Quiet. A few heads down, a few nods — the result could have gone either way.', quote: pick(['"A point. We wanted more, but we will take it."', '"Fair result. We have to be sharper in the final third."']) };
  return { scene: 'Silence. Boots off without a word; the manager speaks low and short.', quote: pick(['"Not good enough today. We will be better next week."', '"We win together and we lose together."', '"We made it too easy for them. That is on all of us."']) };
}
export function reactionHTML(r, manager = 'The manager') {
  return `<div class="pm-react"><span class="pm-k">Dressing room</span><p>${esc(r.scene)}</p><blockquote>${esc(r.quote)}<cite>— ${esc(manager)}</cite></blockquote></div>`;
}

/* ------------------------------ result card ------------------------------ */
/** Draw the shareable result card (1080 × 1080) onto a canvas. */
export function drawResultCard(canvas, { home, away, score, scorers = [[], []], venue = '', date = new Date(), potm = null, pens = null }) {
  canvas.width = 1080; canvas.height = 1080;
  const c = canvas.getContext('2d'); if (!c) return canvas;
  const g = c.createLinearGradient(0, 0, 1080, 1080);
  g.addColorStop(0, '#0a1422'); g.addColorStop(1, '#04070d');
  c.fillStyle = g; c.fillRect(0, 0, 1080, 1080);
  // two colour bands, one per side
  c.fillStyle = home.colors?.[0] || '#3fd08a'; c.fillRect(0, 0, 540, 14);
  c.fillStyle = away.colors?.[0] || '#e25656'; c.fillRect(540, 0, 540, 14);
  c.textAlign = 'center'; c.fillStyle = '#fff';
  c.font = '600 34px system-ui, sans-serif'; c.globalAlpha = 0.7; c.fillText('FULL TIME', 540, 130); c.globalAlpha = 1;
  c.font = '800 220px system-ui, sans-serif'; c.fillText(`${score[0]}–${score[1]}`, 540, 470);
  c.font = '700 64px system-ui, sans-serif';
  c.fillText(home.short, 250, 300); c.fillText(away.short, 830, 300);
  c.font = '500 34px system-ui, sans-serif'; c.globalAlpha = 0.85;
  c.fillText(home.name, 250, 350); c.fillText(away.name, 830, 350); c.globalAlpha = 1;
  if (pens) { c.font = '600 40px system-ui, sans-serif'; c.fillText(`${pens[0]}–${pens[1]} on penalties`, 540, 540); }
  c.font = '500 34px system-ui, sans-serif';
  const list = (arr, x) => arr.slice(0, 6).forEach((s, i) => c.fillText(`${s.name} ${s.minute}'`, x, 620 + i * 48));
  list(scorers[0], 270); list(scorers[1], 810);
  if (potm) { c.font = '600 36px system-ui, sans-serif'; c.fillStyle = '#ffd34d'; c.fillText(`★ Player of the match: ${potm.name} (${potm.rating.toFixed(1)})`, 540, 960); c.fillStyle = '#fff'; }
  c.font = '500 28px system-ui, sans-serif'; c.globalAlpha = 0.6;
  c.fillText(`${venue} · ${date.toISOString().slice(0, 10)}`, 540, 1010);
  c.fillText('APEX XI', 540, 1050); c.globalAlpha = 1;
  return canvas;
}

/** Share the card (the platform sheet where there is one) or download it. Returns how. */
export async function shareResultCard(canvas, name = 'apex-xi-result.png') {
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) return 'none';
  const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
  try {
    if (file && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Full time' }); return 'shared'; }
  } catch { /* cancelled, or not allowed: fall through to the download */ }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
