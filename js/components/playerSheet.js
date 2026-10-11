/**
 * v190: what you can do about another player — report them, block them.
 *
 * App Review asks that anything one player can put in front of another be
 * reportable and blockable. Names are all there is here (everything else is a
 * fixed emote), so this opens wherever another player's name does: the
 * leaderboard, the friends list, an online match's full time, an invite.
 *
 * Reporting picks one of four reasons — never free text — and goes to the
 * support inbox. Blocking is silent and one-sided: the two are never matched,
 * invited, befriended or shown each other's emotes again.
 */
import * as api from '../net/api.js';
import { toast } from '../app.js';

const REASONS = [['name', 'Offensive name'], ['abuse', 'Abusive behaviour'], ['cheating', 'Cheating'], ['other', 'Something else']];
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function openPlayerSheet(name, { matchId = null, onChange = () => {} } = {}) {
  if (!name || name === api.getName()) return;
  let blocked = [];
  try { blocked = await api.blockedList(); } catch { /* signed out or offline: the buttons still try */ }
  const isBlocked = () => blocked.some((n) => n.toLowerCase() === name.toLowerCase());

  const box = document.createElement('div');
  box.className = 'pair-overlay';
  const paint = (mode = 'menu') => {
    box.innerHTML = `
      <div class="pair-card glass ps-card" role="dialog" aria-modal="true" aria-label="${esc(name)}">
        <span class="pair-kicker">Player</span>
        <b class="ps-name">${esc(name)}</b>
        ${mode === 'report' ? `
          <p class="pair-note">Why are you reporting ${esc(name)}? Our team reviews every report.</p>
          <div class="ps-reasons">${REASONS.map(([id, label]) => `<button class="btn ghost" data-reason="${id}">${label}</button>`).join('')}</div>
          <div class="ps-btns"><button class="btn ghost" data-ps="back">Back</button></div>` : `
          <div class="ps-btns">
            <button class="btn ghost danger" data-ps="report">Report</button>
            <button class="btn ${isBlocked() ? 'ghost' : 'ghost danger'}" data-ps="block">${isBlocked() ? 'Unblock' : 'Block'}</button>
            <button class="btn ghost" data-ps="close">Close</button>
          </div>
          <p class="pair-note">${isBlocked() ? `You have blocked ${esc(name)}.` : 'Blocking stops you being matched, invited or befriended either way. They are not told.'}</p>`}
      </div>`;
  };
  paint();
  document.body.appendChild(box);
  const close = () => box.remove();
  box.addEventListener('click', async (e) => {
    if (e.target === box) return close();
    const b = e.target.closest('button');
    if (!b) return;
    const act = b.dataset.ps;
    if (act === 'close') return close();
    if (act === 'report') return paint('report');
    if (act === 'back') return paint();
    if (act === 'block') {
      b.disabled = true;
      try {
        const r = await api.blockPlayer(name, isBlocked() ? 'unblock' : 'block');
        blocked = r.blocked || [];
        toast(isBlocked() ? `${name} blocked` : `${name} unblocked`, 'info');
        onChange();
        paint();
      } catch (err) { b.disabled = false; toast(err.message, 'warn'); }
      return;
    }
    if (b.dataset.reason) {
      box.querySelectorAll('[data-reason]').forEach((x) => { x.disabled = true; });
      try {
        await api.reportPlayer(name, b.dataset.reason, matchId);
        toast('Thanks — your report has been sent', 'good');
        paint();
      } catch (err) { toast(err.message, 'warn'); box.querySelectorAll('[data-reason]').forEach((x) => { x.disabled = false; }); }
    }
  });
}

/** The players you have blocked, each with an Unblock. */
export async function openBlockedList() {
  let list = [];
  try { list = await api.blockedList(); } catch (err) { toast(err.message, 'warn'); return; }
  const box = document.createElement('div');
  box.className = 'pair-overlay';
  const paint = () => {
    box.innerHTML = `
      <div class="pair-card glass ps-card" role="dialog" aria-modal="true" aria-label="Blocked players">
        <span class="pair-kicker">Blocked players</span>
        ${list.length ? `<div class="ps-list">${list.map((n) => `<div class="ps-row"><b>${esc(n)}</b><button class="btn ghost sm" data-unblock="${esc(n)}">Unblock</button></div>`).join('')}</div>`
          : '<p class="pair-note">You have not blocked anyone.</p>'}
        <div class="ps-btns"><button class="btn ghost" data-ps="close">Close</button></div>
      </div>`;
  };
  paint();
  document.body.appendChild(box);
  box.addEventListener('click', async (e) => {
    if (e.target === box || e.target.closest('[data-ps="close"]')) return box.remove();
    const b = e.target.closest('[data-unblock]');
    if (!b) return;
    try { list = (await api.blockPlayer(b.dataset.unblock, 'unblock')).blocked || []; paint(); } catch (err) { toast(err.message, 'warn'); }
  });
}
