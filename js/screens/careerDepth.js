/**
 * Manager Career depth (v81) — the hub tabs added this round, kept out of
 * screens/career.js: Training, the Dressing Room, Finance & Facilities,
 * the Scouting Network, the World, the board's five pillars, loans.
 * Rules live in careerV3.js; every action here mutates inside `update`.
 */
import { getState, update } from '../state.js';
import { toast } from '../app.js';
import { resolveEntry, fmtCoins, careerClub, sortedCareerTable } from '../career.js';
import * as v2 from '../careerV2.js';
import * as v3 from '../careerV3.js';
import { rateOf, ageOf, potOf, valueIn } from '../careerPeople.js';
import { facts, about } from '../components/facts.js';

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = (v) => `${Math.round(v * 100)}`;
const bar = (v, cls = '') => `<i class="dep-bar ${cls}"><b style="width:${Math.round(Math.max(0, Math.min(1, v)) * 100)}%"></b></i>`;
const rows = (car) => (car.squads[car.clubId] || []).map((r) => ({ row: r, name: r[0], pos: r[1], rating: rateOf(car, r[0]), age: ageOf(car, r[0]) })).sort((a, b) => b.rating - a.rating);
let talkTo = null;

export const DEPTH_TABS = [['training', 'Training', '⚙'], ['dressing', 'Dressing room', '☺'], ['finance', 'Finance', '◎'], ['world', 'World', '◍']];

/* ------------------------------ training ------------------------------ */
export function trainingHTML(car) {
  v3.ensureV3(car);
  const sp = car.setPieces;
  const list = rows(car);
  const opt = (sel) => `<option value="">Automatic</option>${list.filter((x) => x.pos !== 'GK').map((x) => `<option value="${esc(x.name)}" ${sel === x.name ? 'selected' : ''}>${esc(x.name)} (${x.rating})</option>`).join('')}`;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Training schedule</h2>${about('Light keeps legs fresh and sharpness drifts; Intense sharpens and grows players faster but tires them and risks injuries. The medical centre speeds recovery.')}</header>
      <div class="chips" id="trSched">${Object.entries(v3.TRAINING).map(([id, t]) => `<button class="chip ${car.training === id ? 'on' : ''}" data-sched="${id}">${t.name}</button>`).join('')}</div>
      ${facts([['heart', 'Light · fresh legs'], ['up', 'Intense · faster growth', 'good'], ['bolt', 'Intense · injury risk', 'warn']])}
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Set-piece takers</h2></header>
      <div class="dep-sp">
        <label>Penalties <select data-sp="pen">${opt(sp.pen)}</select></label>
        <label>Free kicks <select data-sp="fk">${opt(sp.fk)}</select></label>
        <label>Corners <select data-sp="corner">${opt(sp.corner)}</select></label>
      </div>
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Players</h2><span class="tag">fitness · sharpness · plan</span></header>
      <div class="dep-rows">
        ${list.map((x) => { const pl = v3.plOf(car, x.name); const plan = car.plans[x.name]; return `
          <div class="dep-row">
            <b class="dep-ovr">${x.rating}</b><span class="dep-pos">${x.pos}</span>
            <span class="dep-name">${esc(x.name)}${pl.injured ? ' <em class="bad">injured</em>' : ''}</span>
            <span class="dep-m" title="Fitness">${bar(pl.fit)}</span><span class="dep-m" title="Sharpness">${bar(pl.sharp, 'sharp')}</span>
            <select class="dep-plan" data-plan="${esc(x.name)}">
              <option value="">No plan</option>
              ${v3.PLAN_FOCUS.map((f) => `<option value="f:${f}" ${plan?.focus === f ? 'selected' : ''}>Focus: ${f}</option>`).join('')}
              ${['CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].filter((p) => p !== x.pos).map((p) => `<option value="p:${p}" ${plan?.to === p ? 'selected' : ''}>Retrain as ${p}${plan?.to === p ? (plan.done ? ' ✓' : ` (${plan.weeks}/8)`) : ''}</option>`).join('')}
            </select>
          </div>`; }).join('')}
      </div>
    </section>`;
}

/* ------------------------------ dressing room ------------------------------ */
export function dressingHTML(car) {
  v3.ensureV3(car);
  const roles = v3.hierarchy(car);
  const list = rows(car);
  const unhappy = list.filter((x) => v3.plOf(car, x.name).morale < 0.35);
  const req = list.filter((x) => v3.plOf(car, x.name).request);
  const who = talkTo && list.find((x) => x.name === talkTo);
  return `
    ${req.length ? `<section class="panel glass ov-offer"><header class="panel-head"><h2>Transfer requests</h2></header><p class="hint">${req.map((x) => esc(x.name)).join(' · ')} want out. Talk to them, give them games — or sell.</p></section>` : ''}
    ${who ? talkHTML(car, who, roles[who.name]) : ''}
    <section class="panel glass">
      <header class="panel-head"><h2>Squad hierarchy</h2><span class="tag">${unhappy.length} unhappy</span>${about('Every player knows where he stands, and expects the minutes that go with it. Fall short and morale drops; broken promises are remembered.')}</header>
      <div class="dep-rows">
        ${list.map((x) => { const pl = v3.plOf(car, x.name); const role = v3.roleById(roles[x.name]); const share = pl.apps ? Math.round(pl.mins / Math.max(1, (car.week - 1) * 90) * 100) : 0; return `
          <button class="dep-row as-btn ${talkTo === x.name ? 'on' : ''}" data-talkto="${esc(x.name)}">
            <b class="dep-ovr">${x.rating}</b><span class="dep-pos">${x.pos}</span>
            <span class="dep-name">${esc(x.name)}${pl.request ? ' <em class="bad">wants out</em>' : ''}${pl.promise ? ' <em>promised games</em>' : ''}</span>
            <span class="dep-role role-${role.id}">${role.name}</span>
            <span class="dep-m" title="Morale ${pct(pl.morale)}">${bar(pl.morale, pl.morale < 0.35 ? 'bad' : pl.morale > 0.7 ? 'good' : '')}</span>
            <span class="dep-mins">${share}% min · ${pl.ratings.length ? (pl.ratings.reduce((a, b) => a + b, 0) / pl.ratings.length).toFixed(1) : '–'}</span>
          </button>`; }).join('')}
      </div>
    </section>`;
}
function talkHTML(car, x, roleId) {
  const pl = v3.plOf(car, x.name);
  return `<section class="panel glass" id="talkPanel">
    <header class="panel-head"><h2>${esc(x.name)}</h2><span class="tag">${v3.roleById(roleId).name} · morale ${pct(pl.morale)}</span></header>
    <p class="hint">${pl.apps} appearances, ${pl.goals} goals this season. ${pl.promise ? `You promised him ${pl.promise.need} games by week ${pl.promise.by}.` : ''}</p>
    <div class="offer-actions">${v3.TALKS.map((t) => `<button class="btn ${t.id === 'praise' ? 'primary' : 'ghost'}" data-talk="${t.id}">${t.name}</button>`).join('')}</div>
  </section>`;
}

/* ------------------------------ finance & facilities ------------------------------ */
export function financeHTML(car) {
  v3.ensureV3(car);
  const f = car.fin.season;
  const inc = f.tickets + f.tv + f.prize + f.merch + f.sales;
  const out = f.wages + f.buys + f.facilities + f.agents;
  const line = (label, v, neg = false) => `<div class="rr"><span>${label}</span><b class="${neg ? 'neg' : ''}">${neg ? '−' : ''}${fmtCoins(v)}</b></div>`;
  const wb = v3.wageBudget(car); const wk = v3.weeklyWages(car);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Finances · season ${car.season}</h2><span class="tag">Bank ◎ ${fmtCoins(car.coins)}</span></header>
      <div class="ov-cols">
        <div><h3 class="p-sub">Income</h3>${line('Tickets (your ground)', f.tickets)}${line('Television', f.tv)}${line('Shirts & sponsors', f.merch)}${line('Prize money', f.prize)}${line('Player sales', f.sales)}<div class="rr total"><span>Total</span><b>${fmtCoins(inc)}</b></div></div>
        <div><h3 class="p-sub">Spending</h3>${line('Wages', f.wages, true)}${line('Transfer fees', f.buys, true)}${line('Agent fees', f.agents, true)}${line('Facilities', f.facilities, true)}<div class="rr total"><span>Total</span><b class="neg">−${fmtCoins(out)}</b></div></div>
      </div>
      <h3 class="p-sub">Wage budget</h3>
      <div class="ov-meters"><div class="ov-meter"><span>${fmtCoins(wk)} of ${fmtCoins(wb)} a round</span><i><b style="width:${Math.min(100, (wk / Math.max(1, wb)) * 100)}%" class="${wk > wb ? 'over' : ''}"></b></i></div></div>
      ${facts([['players', 'More seats, more tickets'], ['book', 'Budget from last season']])}
      ${car.fin.history.length ? `<h3 class="p-sub">History</h3>${car.fin.history.slice().reverse().slice(0, 6).map((h) => `<div class="rr"><span>Season ${h.season}</span><b>${fmtCoins(h.tickets + h.tv + h.merch + h.prize + h.sales)} in · ${fmtCoins(h.wages + h.buys + h.facilities + h.agents)} out</b></div>`).join('')}` : ''}
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Facilities</h2></header>
      <div class="dep-fac">${v3.FACILITIES.map((fa) => { const lv = car.fac[fa.id]; return `
        <div class="fac"><b>${fa.name}</b><span>${fa.blurb}</span><div class="fac-lv">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= lv ? 'on' : ''}"></i>`).join('')}</div>
          ${lv < 5 ? `<button class="btn" data-fac="${fa.id}">Upgrade · ◎ ${fmtCoins(v3.facilityCost(lv))}</button>` : '<span class="tag">Top level</span>'}</div>`; }).join('')}</div>
    </section>`;
}

/* ------------------------------ scouting network ------------------------------ */
export function networkHTML(car) {
  v3.ensureV3(car);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Scouting network</h2><span class="tag">${car.scouts.length}/3 scouts</span>${about('A scout\'s stars are how close his potential estimates land. Point each at a region; reports arrive every few weeks, quicker with a better scouting HQ.')}</header>
      ${facts([['star', 'Stars = accuracy', 'gold'], ['target', 'Pick a region'], ['clock', 'Reports every few weeks']])}
      ${car.scouts.map((s) => `
        <div class="scout">
          <div class="scout-head"><b>${esc(s.name)}</b><span class="stars">${'★'.repeat(s.rating)}${'☆'.repeat(5 - s.rating)}</span>
            <select data-region="${s.id}"><option value="">Idle</option>${v3.REGIONS.map((r) => `<option ${s.region === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
            ${car.scouts.length > 1 ? `<button class="mini-btn danger" data-fire="${s.id}">Release</button>` : ''}</div>
          ${s.reports.map((r) => `<div class="offer"><div><b>${esc(r.name)}</b><span>${r.position} · ${r.age} · ${esc(careerClub(r.club)?.name || '')}</span></div>
            <b class="offer-fee">${r.rating} <small>→ ${r.potential}±${r.range}</small></b>
            <div class="offer-actions"><span class="hint">${fmtCoins(r.value)}</span><button class="btn" data-shortlist="${esc(r.name)}">Shortlist</button>
              <button class="btn ghost" data-loanin="${esc(r.name)}|${r.club}">Loan in</button></div></div>`).join('') || '<p class="ov-empty">No reports yet.</p>'}
        </div>`).join('')}
      ${car.scouts.length < 3 ? '<button class="btn" id="hireScout">Hire a scout</button>' : ''}
    </section>`;
}

/* ------------------------------ loans ------------------------------ */
export function loansHTML(car) {
  v3.ensureV3(car);
  const mine = rows(car).filter((x) => x.age <= 23);
  const table = sortedCareerTable(car);
  const pos = table.findIndex((r) => r.id === car.clubId) + 1;
  // a loan club: one where he would play — a smaller club in this or the next tier
  const hosts = v2.allClubs().filter((c) => c.id !== car.clubId).map((c) => ({ c, avg: v2.squadOverall(car.squads[c.id] || [], car) })).sort((a, b) => a.avg - b.avg).slice(0, 8);
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>Loans</h2>${about('Send a young player where he will play: minutes grow him, and he comes back in the summer. Loaned-in players return to their clubs at season end.')}</header>
      ${facts([['boot', 'Minutes grow him', 'good'], ['calendar', 'Back in summer']])}
      ${car.loans.length ? car.loans.map((l) => `<div class="rr"><span>${esc(l.name)} · ${l.out ? `out at ${esc(careerClub(l.to)?.short)}` : `in from ${esc(careerClub(l.from)?.short)}`}</span><b>until summer</b></div>`).join('') : ''}
      ${mine.length ? `<div class="dep-loan"><select id="loanWho">${mine.map((x) => `<option value="${esc(x.name)}">${esc(x.name)} (${x.rating}, ${x.age})</option>`).join('')}</select>
        <select id="loanTo">${hosts.map(({ c, avg }) => `<option value="${c.id}">${esc(c.name)} (${avg})</option>`).join('')}</select>
        <button class="btn" id="loanOut">Loan out</button></div>` : '<p class="ov-empty">No one young enough to loan.</p>'}
      <p class="hint">Position ${pos}. Loan-ins: find targets through your scouts.</p>
    </section>`;
}

/* ------------------------------ world ------------------------------ */
export function worldHTML(car) {
  v3.ensureV3(car);
  const w = car.world;
  return `
    <section class="panel glass">
      <header class="panel-head"><h2>News</h2></header>
      <ul class="pro-miles">${w.news.slice(0, 20).map((n) => `<li class="k-${n.kind}"><em>S${n.season}·M${n.week * 2}</em> ${esc(n.text)}</li>`).join('') || '<li>Quiet so far.</li>'}</ul>
    </section>
    <section class="panel glass">
      <header class="panel-head"><h2>Honours board</h2><span class="tag">${w.retired} retired · ${w.regens} new faces</span></header>
      ${w.awards.slice().reverse().slice(0, 10).map((a) => `<div class="rr"><span>S${a.season} · ${esc(a.league)}: <b>${esc(careerClub(a.champion)?.name || '')}</b>${a.manager ? ` (${esc(a.manager)})` : ''}</span>
        <b>${a.pots ? `Player: ${esc(a.pots.name)}` : ''}${a.boot ? ` · Boot: ${esc(a.boot.name)} ${a.boot.goals}` : ''}${a.young ? ` · Young: ${esc(a.young.name)}` : ''}</b></div>`).join('') || '<p class="ov-empty">The first season is still being played.</p>'}
      ${w.cups.length ? `<h3 class="p-sub">Cup winners</h3><p class="hint">${w.cups.slice().reverse().map((c) => `S${c.season} ${esc(careerClub(c.club)?.short || '')}`).join(' · ')}</p>` : ''}
    </section>`;
}

/* ------------------------------ the board's pillars ------------------------------ */
export function pillarsHTML(car) {
  v3.ensureV3(car);
  const t = car.board?.pillars || v3.pillarTargets(car);
  const pos = sortedCareerTable(car).findIndex((r) => r.id === car.clubId) + 1;
  const sc = v3.pillarScores(car, pos);
  return `<h3 class="p-sub">Five pillars · overall ${sc.overall}</h3>
    ${v3.PILLARS.map((p) => `<div class="ov-meter pillar"><span><b>${p.name}</b> — ${esc(t[p.id]?.text || '')}</span><i><b style="width:${Math.round(sc[p.id])}%" class="${sc[p.id] < 35 ? 'over' : ''}"></b></i></div>`).join('')}
    ${facts([['trophy', 'Success counts ×2', 'gold'], ['up', 'Moves board patience']])}`;
}

/* ------------------------------ wiring ------------------------------ */
export function wireDepth(root, rerender) {
  const mut = (fn) => { let r; update((s) => { if (s.career) r = fn(s.career); }); return r; };
  root.querySelectorAll('[data-sched]').forEach((b) => b.addEventListener('click', () => { mut((c) => { c.training = b.dataset.sched; }); rerender(); }));
  root.querySelectorAll('[data-sp]').forEach((sel) => sel.addEventListener('change', () => { mut((c) => { v3.ensureV3(c); c.setPieces[sel.dataset.sp] = sel.value || null; }); toast('Takers set'); }));
  root.querySelectorAll('[data-plan]').forEach((sel) => sel.addEventListener('change', () => {
    const v = sel.value; const name = sel.dataset.plan;
    mut((c) => v3.setPlan(c, name, v.startsWith('f:') ? { focus: v.slice(2) } : v.startsWith('p:') ? { to: v.slice(2) } : {}));
    toast(v ? 'Plan set' : 'Plan cleared');
  }));
  root.querySelectorAll('[data-talkto]').forEach((b) => b.addEventListener('click', () => { talkTo = talkTo === b.dataset.talkto ? null : b.dataset.talkto; rerender(); }));
  root.querySelectorAll('[data-talk]').forEach((b) => b.addEventListener('click', () => {
    const r = mut((c) => v3.talk(c, talkTo, b.dataset.talk));
    if (r) toast(r.note, r.ok && r.delta >= 0 ? 'good' : 'warn');
    rerender();
  }));
  root.querySelectorAll('[data-fac]').forEach((b) => b.addEventListener('click', () => { const r = mut((c) => v3.upgradeFacility(c, b.dataset.fac)); toast(r.note, r.ok ? 'good' : 'warn'); rerender(); }));
  root.querySelectorAll('[data-region]').forEach((sel) => sel.addEventListener('change', () => { mut((c) => v3.assignScout(c, sel.dataset.region, sel.value || null)); toast(sel.value ? `Scout sent: ${sel.value}` : 'Scout stood down'); }));
  root.querySelectorAll('[data-fire]').forEach((b) => b.addEventListener('click', () => { mut((c) => v3.fireScout(c, b.dataset.fire)); rerender(); }));
  root.querySelector('#hireScout')?.addEventListener('click', () => { const r = mut((c) => v3.hireScout(c)); toast(r.note, r.ok ? 'good' : 'warn'); rerender(); });
  root.querySelectorAll('[data-loanin]').forEach((b) => b.addEventListener('click', () => { const [n, cid] = b.dataset.loanin.split('|'); const r = mut((c) => v3.loanIn(c, n, cid)); toast(r.note, r.ok ? 'good' : 'warn'); rerender(); }));
  root.querySelector('#loanOut')?.addEventListener('click', () => {
    const n = root.querySelector('#loanWho').value; const to = root.querySelector('#loanTo').value;
    const r = mut((c) => v3.loanOut(c, n, to)); toast(r.note, r.ok ? 'good' : 'warn'); rerender();
  });
}

export { resolveEntry, potOf, valueIn };
