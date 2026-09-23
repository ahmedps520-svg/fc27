/**
 * The party lobby on the Online screen (v82): host a co-op season, a 2v2 or
 * pro five-a-side; share the code; pick a side; the host starts. Nothing
 * typed here reaches another player except a five-letter code.
 */
import * as P from '../net/party.js';
import { getName } from '../net/api.js';

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function partyHTML() {
  return `<section class="ol-card glass" id="olParty">${inner(P.party())}</section>`;
}

function inner(p) {
  if (!p) {
    return `
      <span class="ol-kicker">Play together</span>
      <h3>Parties</h3>
      <div class="pty-modes">${Object.entries(P.MODES).map(([id, m]) => `
        <button class="pty-mode" data-pmode="${id}"><b>${m.name}</b><span>${m.blurb}</span></button>`).join('')}</div>
      <div class="ol-join"><input id="ptyCode" maxlength="5" placeholder="CODE" aria-label="Party code"><button class="btn ghost" id="ptyJoin">Join party</button></div>
      ${P.myPro() ? `<p class="ol-sub">Pro five-a-side will field ${esc(P.myPro().name)} (${P.myPro().overall}).</p>` : '<p class="ol-sub">No Player Career pro yet: in pro five-a-side you play a stand-in.</p>'}`;
  }
  const m = P.MODES[p.mode];
  const isHost = p.members.some((x) => x.host && x.name === getName());
  const sides = p.mode === 'coop2' ? [0] : [0, 1];
  return `
    <span class="ol-kicker">${esc(m.name)} · ${p.members.length}/${m.max}</span>
    <h3>Party <b class="pty-code">${esc(p.code)}</b></h3>
    <p class="ol-sub">Share the code. ${p.started ? 'Match in progress.' : 'The host starts when everyone is in.'}</p>
    <div class="pty-sides">${sides.map((sd) => `
      <div class="pty-side"><b>${sd === 0 ? 'Home' : 'Away'}</b>
        ${p.members.filter((x) => x.side === sd).map((x) => `<span class="${x.dropped ? 'dropped' : ''}">${esc(x.name)}${x.host ? ' ★' : ''}</span>`).join('') || '<em>CPU</em>'}
        ${sides.length > 1 ? `<button class="btn ghost sm" data-pside="${sd}">Play ${sd === 0 ? 'home' : 'away'}</button>` : ''}
      </div>`).join('')}</div>
    <div class="offer-actions">
      <button class="btn primary" id="ptyStart" ${isHost ? '' : 'hidden'}>Start the match</button>
      <button class="btn ghost" id="ptyLeave">Leave</button>
    </div>`;
}

export function mountParty(root, net) {
  const box = root.querySelector('#olParty');
  if (!box) return () => {};
  const wire = () => {
    box.querySelectorAll('[data-pmode]').forEach((b) => b.addEventListener('click', () => { if (!net.isReady()) net.connect(); P.host(b.dataset.pmode); }));
    box.querySelector('#ptyJoin')?.addEventListener('click', () => { const code = box.querySelector('#ptyCode').value.trim(); if (code) P.join(code); });
    box.querySelectorAll('[data-pside]').forEach((b) => b.addEventListener('click', () => P.side(+b.dataset.pside)));
    box.querySelector('#ptyStart')?.addEventListener('click', () => P.start());
    box.querySelector('#ptyLeave')?.addEventListener('click', () => P.leave());
  };
  wire();
  return P.onParty((p) => { box.innerHTML = inner(p); wire(); });
}
