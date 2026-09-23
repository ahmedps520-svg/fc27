/**
 * The pre-match show (v83), as a broadcast runs it:
 *
 *   flyover     the ground from the air, the fixture and the conditions
 *   sheet 0/1   each side's team sheet: the shape on a pitch, the eleven
 *               with faces, numbers and ratings
 *   pundit      the studio preview — key men, form, a prediction
 *   walkout     out of the tunnel and lined up, anthem playing (the play
 *               screen's existing walk-out does the moving)
 *   handshake   along the line
 *   coin        the toss, and who kicks off
 *
 * The show owns the DOM and the timeline; the play screen owns the camera
 * and the players and asks `stage()` each frame. A Skip button (and any key)
 * jumps to the kick-off. `short` runs the walk-out and the toss only.
 * Everything in it — the studio, the pundit, the graphics — is our own.
 */
import { crestSVG } from '../components/crest.js';
import { faceSVG } from '../components/face.js';
import { LOGO_SVG } from './graphics.js';

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const PUNDIT = { en: 'Omar Reyes', ar: 'خالد الراشد' };
const STAGES_FULL = [['flyover', 4], ['sheet0', 4.5], ['sheet1', 4.5], ['pundit', 5.5], ['walkout', 7], ['handshake', 2.4], ['coin', 2.8]];
const STAGES_SHORT = [['walkout', 7], ['coin', 2.8]];
export const stagesFor = (kind) => (kind === 'short' ? STAGES_SHORT : STAGES_FULL);

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const teamRating = (team) => Math.round(avg(team.players.slice(0, 11).map((p) => p.ref.overall || 60)));

/**
 * The pundit's preview: three or four sentences from the facts. Pure, so it
 * can be tested; `lang` 'en' | 'ar'.
 */
export function previewText({ home, away, derby = null, weather = 'clear', final = false, form = new Map(), lang = 'en' }) {
  const hr = teamRating(home); const ar = teamRating(away);
  const key = (t) => [...t.players.slice(0, 11)].sort((a, b) => (b.ref.overall || 0) - (a.ref.overall || 0))[0];
  const hk = key(home); const ak = key(away);
  const hot = [...home.players, ...away.players].slice(0, 22).find((p) => form.get?.(p.ref.id) === 'hot');
  const fav = Math.abs(hr - ar) <= 2 ? -1 : hr > ar ? 0 : 1;
  const out = [];
  if (lang === 'ar') {
    out.push(final ? `نهائي، ولا مجال للخطأ بين ${home.name} و${away.name}.` : derby ? `إنها ${derby}، وهذه المباريات لا تعترف بالترشيحات.` : `مواجهة مثيرة بين ${home.name} و${away.name}.`);
    out.push(`أراقب ${hk.ref.name} من جهة، و${ak.ref.name} من الجهة الأخرى.`);
    if (hot) out.push(`${hot.ref.name} في قمة مستواه، وقد يصنع الفارق.`);
    if (weather === 'rain') out.push('المطر سيجعل الأرضية سريعة، والتسديد من بعيد سلاح مهم.');
    out.push(fav < 0 ? 'توقعي: مباراة متكافئة، وقد يحسمها التفاصيل.' : `توقعي: الأفضلية لـ${(fav === 0 ? home : away).name}.`);
    return out.join(' ');
  }
  out.push(final ? `A final, and nothing to separate ${home.name} and ${away.name} on paper but ninety minutes.`
    : derby ? `It is ${derby}, and you can throw the form book away.`
    : `${home.name} host ${away.name}, and there is plenty to play for.`);
  out.push(`For me the key men are ${hk.ref.name} for ${home.short} and ${ak.ref.name} for ${away.short}.`);
  if (hot) out.push(`Keep an eye on ${hot.ref.name} — he is in terrific form.`);
  if (weather === 'rain') out.push('The rain will make it quick underfoot, so shoot early.');
  else if (weather === 'snow') out.push('In the snow, the side that keeps it simple wins.');
  out.push(fav < 0 ? 'My prediction? Too close to call. A draw would not surprise me.'
    : `My prediction? ${(fav === 0 ? home : away).name} to edge it, ${fav === 0 ? '2–1' : '1–2'}.`);
  return out.join(' ');
}

/** The team sheet for a side: the shape on a pitch and the eleven. */
export function sheetHTML(team, { lang = 'en' } = {}) {
  const xi = team.players.slice(0, 11);
  // the shape slots are fractions of the pitch from the side's own goal (flipped for the away side)
  const flip = team.side === 1;
  const pos = (p) => {
    const up = flip ? 1 - (p.sx ?? 0.5) : (p.sx ?? 0.5);
    const across = flip ? 1 - (p.sy ?? 0.5) : (p.sy ?? 0.5);
    return { l: 8 + across * 84, b: 6 + Math.min(1, up * 1.9) * 86 };
  };
  const kit = team.colors?.[0] || '#243049';
  return `
    <div class="pg-sheet" style="--kit:${kit}">
      <header>${crestSVG(team.club?.crest, team.short, 44)}<div><b>${esc(team.name)}</b><em>${esc(team.formation || '')} · ${lang === 'ar' ? 'التقييم' : 'Rating'} ${teamRating(team)}</em></div></header>
      <div class="pg-shape">${xi.map((p) => { const q = pos(p); return `<span class="pg-dot" style="left:${q.l}%;bottom:${q.b}%"><i>${p.num ?? ''}</i><em>${esc(p.ref.short || p.ref.name)}</em></span>`; }).join('')}</div>
      <ol class="pg-list">${xi.map((p) => `<li>${faceSVG(p.ref, 30, kit)}<i>${p.num ?? ''}</i><b>${esc(p.ref.name)}</b><em>${esc(p.ref.position || '')}</em><span>${p.ref.overall || ''}</span></li>`).join('')}</ol>
    </div>`;
}

/**
 * The show. `onDone` fires once, at the kick-off (or on skip).
 *   kind  'full' | 'short'
 *   info  { home, away, venue, conditions, derby, preview, tossWinner, lang }
 */
export function createPregame(host, { kind = 'full', info, onDone, onStage }) {
  const stages = stagesFor(kind);
  const el = document.createElement('div');
  el.className = 'pg-layer';
  el.innerHTML = `<div class="pg-stage" id="pgStage"></div><button class="btn ghost sm pg-skip" id="pgSkip">Skip intro ▸▸</button>`;
  host.appendChild(el);
  const stageEl = el.querySelector('#pgStage');
  const lang = info.lang || 'en';
  const { home, away } = info;
  let i = -1; let t = 0; let done = false;

  const html = {
    flyover: () => `
      <div class="pg-fly">
        <span class="pg-logo">${LOGO_SVG}</span>
        <div class="pg-fix">${crestSVG(home.club?.crest, home.short, 54)}<b>${esc(home.name)}</b><i>v</i><b>${esc(away.name)}</b>${crestSVG(away.club?.crest, away.short, 54)}</div>
        <span class="pg-where">${esc(info.venue)} · ${esc(info.conditions)}</span>
        ${info.derby ? `<span class="pg-derby">${esc(info.derby)}</span>` : ''}
      </div>`,
    sheet0: () => sheetHTML(home, { lang }),
    sheet1: () => sheetHTML(away, { lang }),
    pundit: () => `
      <div class="pg-pundit">
        <span class="pg-k">${lang === 'ar' ? 'الاستوديو' : 'The studio'} · ${esc(PUNDIT[lang] || PUNDIT.en)}</span>
        <p>${esc(info.preview)}</p>
      </div>`,
    walkout: () => `<div class="pg-strap"><b>${lang === 'ar' ? 'الفريقان يدخلان أرض الملعب' : 'The teams walk out'}</b><em>${esc(info.venue)}</em></div>`,
    handshake: () => `<div class="pg-strap"><b>${lang === 'ar' ? 'المصافحة' : 'The handshakes'}</b><em>${lang === 'ar' ? 'روح رياضية قبل البداية' : 'Respect, before the battle'}</em></div>`,
    coin: () => {
      const w = info.tossWinner === 1 ? away : home;
      const line = info.tossWinner === 1
        ? (lang === 'ar' ? `${away.name} يفوز بالقرعة ويختار الملعب — ${home.name} يبدأ اللعب` : `${away.name} win the toss and pick ends — ${home.name} kick off`)
        : (lang === 'ar' ? `${home.name} يفوز بالقرعة ويبدأ اللعب` : `${home.name} win the toss and will kick off`);
      return `<div class="pg-coin"><span class="coin ${info.tossWinner === 1 ? 'tails' : 'heads'}"><i class="h">${crestSVG(home.club?.crest, home.short, 48)}</i><i class="t">${crestSVG(away.club?.crest, away.short, 48)}</i></span><b>${esc(line)}</b><em>${esc(w.short)}</em></div>`;
    },
  };

  const enter = (k) => {
    i = k; t = 0;
    const name = stages[i]?.[0];
    if (!name) return finish();
    stageEl.className = `pg-stage s-${name}`;
    stageEl.innerHTML = html[name]();
    stageEl.classList.remove('in'); void stageEl.offsetWidth; stageEl.classList.add('in');
    onStage?.(name);
  };
  function finish() {
    if (done) return;
    done = true;
    el.remove();
    window.removeEventListener('keydown', onKey);
    onDone?.();
  }
  const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } };
  window.addEventListener('keydown', onKey);
  el.querySelector('#pgSkip').addEventListener('click', finish);
  enter(0);

  return {
    /** The current stage name, or null when the show is over. */
    stage: () => (done ? null : stages[i]?.[0] || null),
    /** Seconds into the current stage. */
    t: () => t,
    dur: () => stages[i]?.[1] || 0,
    update(dt) {
      if (done) return null;
      t += dt;
      if (t >= stages[i][1]) enter(i + 1);
      return done ? null : stages[i][0];
    },
    /** Jump past the walk-out (it finished early, or was skipped by the play screen). */
    pastWalkout() { if (!done && stages[i]?.[0] === 'walkout') enter(i + 1); },
    skip: finish,
    done: () => done,
    /** Leave without kicking off (the screen is going away). */
    destroy() { if (done) return; done = true; el.remove(); window.removeEventListener('keydown', onKey); },
  };
}
