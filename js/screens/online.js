/**
 * Online: account panel, matchmaking, private lobbies and the leaderboard.
 *
 * Rendered as a tab inside Ultimate XI (see squad.js) and reused by the
 * standalone account screen off the main menu.
 */
import { getState, adoptCloudSave, cloudWins, save, update } from '../state.js';
import { pend } from '../progress.js';
import { WORLD, getPlayer } from '../data/generator.js';
import * as api from '../net/api.js';
import * as net from '../net/socket.js';
import { DIVISIONS } from '../state.js';
import { navigate, toast, refreshCoins } from '../app.js';
import { sfx } from '../audio.js';
import { clubIdentity } from './squad.js';

export const TITLE = 'Account';

/* ------------------------------------------------------------------ *
 * Views
 * ------------------------------------------------------------------ */
export function signInPanel(kicker = 'Play online') {
  return `
    <section class="acct glass">
      <span class="acct-kicker">${kicker}</span>
      <h2 class="acct-title">Sign in to APEX XI</h2>
      <p class="acct-sub">Your club, collection and division rank are saved to your
        account, so they follow you to any device.</p>

      <div class="acct-tabs" id="acctTabs">
        <button class="on" data-mode="login">Sign in</button>
        <button data-mode="register">Create account</button>
      </div>

      <form class="acct-form" id="acctForm" autocomplete="on">
        <label class="field">
          <span>Player name</span>
          <input id="acctName" name="username" autocomplete="username"
                 maxlength="16" placeholder="3–16 characters" required>
        </label>
        <label class="field">
          <span>Password</span>
          <input id="acctPass" name="password" type="password"
                 autocomplete="current-password" minlength="6" placeholder="At least 8 characters" required>
        </label>
        <p class="acct-error" id="acctError" hidden></p>
        <button class="btn primary wide" id="acctGo" type="submit">Sign in</button>
      </form>
      <p class="acct-note">Passwords are hashed on the server. Play offline any time —
        signing in only adds cloud saves and online matches.</p>
    </section>`;
}

const profileCard = () => {
  const p = api.getProfile();
  const o = p?.online || { played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
  return `
    <div class="ol-me glass">
      <div class="ol-avatar">${(p?.name || '?')[0].toUpperCase()}</div>
      <div class="ol-id">
        <b>${p?.name || 'Player'}</b>
        <span class="ol-conn" id="olConn">connecting…</span>
      </div>
      <div class="ol-record">
        <div><b>${o.points}</b><span>Points</span></div>
        <div><b>${o.wins}</b><span>W</span></div>
        <div><b>${o.draws}</b><span>D</span></div>
        <div><b>${o.losses}</b><span>L</span></div>
      </div>
      <div class="ol-acct-btns">
        <button class="btn ghost sm" id="pairWatch">Pair a watch</button>
        <button class="btn ghost sm" id="signOut">Sign out</button>
      </div>
    </div>`;
};

export function onlineView() {
  if (!api.isSignedIn()) return signInPanel('Ultimate XI Online');

  const s = getState();
  const div = DIVISIONS[s.ultimate.divIdx];
  const ready = !s.club.lineup.some((id) => !id);

  return `
    ${profileCard()}

    <div class="ol-grid">
      <section class="ol-card glass">
        <span class="ol-kicker">Ranked</span>
        <h3>Division Online</h3>
        <p>Matched against a real player near ${div.name}. Wins climb the same
           ladder as offline Apex Division.</p>
        ${ready ? '' : '<p class="ol-warn">Fill all 11 Ultimate XI positions to play.</p>'}
        <button class="btn primary wide" id="olQueue" ${ready ? '' : 'disabled'}>Find match</button>
      </section>

      <section class="ol-card glass">
        <span class="ol-kicker">Friendly</span>
        <h3>Private lobby</h3>
        <p>Create a lobby and share the four-letter code, or enter a friend's code
           to join them.</p>
        <div class="ol-lobby">
          <button class="btn ghost" id="olHost" ${ready ? '' : 'disabled'}>Create lobby</button>
          <div class="ol-join">
            <input id="olCode" maxlength="4" placeholder="CODE" aria-label="Lobby code">
            <button class="btn ghost" id="olJoin" ${ready ? '' : 'disabled'}>Join</button>
          </div>
        </div>
        <p class="ol-code" id="olCodeOut" hidden></p>
      </section>
    </div>

    <div class="ol-grid">
      <section class="ol-card glass" id="olGuild">
        <span class="ol-kicker">Guild</span>
        <h3>Your guild</h3>
        <p class="ol-empty">Loading…</p>
      </section>

      <section class="ol-card glass" id="olFriends">
        <span class="ol-kicker">Friends</span>
        <h3>Friends</h3>
        <p class="ol-empty">Loading…</p>
      </section>
    </div>

    <section class="ol-board glass">
      <h3>Live now</h3>
      <p class="ol-sub">Watch a match that is being played right now. Spectators see the
         host's view and can never touch the game.</p>
      <div id="olLive" class="ol-rows"><p class="ol-empty">Loading…</p></div>
    </section>

    <section class="ol-board glass">
      <h3>Global leaderboard</h3>
      <div id="olBoard" class="ol-rows"><p class="ol-empty">Loading…</p></div>
    </section>

    <div class="ol-search" id="olSearch" hidden>
      <div class="ols-inner glass">
        <div class="ols-spin"></div>
        <b id="olsTitle">Searching for an opponent…</b>
        <span id="olsSub">Looking for players near ${div.name}</span>
        <button class="btn ghost" id="olCancel">Cancel</button>
      </div>
    </div>`;
}

export const render = () => `<div class="acct-wrap">${onlineView()}</div>`;

/* ------------------------------------------------------------------ *
 * Behaviour
 * ------------------------------------------------------------------ */

/** Wire the sign-in form. `after` runs once a session is established. */
export function mountSignIn(root, after) {
  const form = root.querySelector('#acctForm');
  if (!form) return null;

  const tabs = root.querySelector('#acctTabs');
  const nameEl = root.querySelector('#acctName');
  const passEl = root.querySelector('#acctPass');
  const errEl = root.querySelector('#acctError');
  const goBtn = root.querySelector('#acctGo');
  let mode = 'login';

  const fail = (msg) => { errEl.textContent = msg; errEl.hidden = false; };

  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    mode = b.dataset.mode;
    tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    goBtn.textContent = mode === 'login' ? 'Sign in' : 'Create account';
    passEl.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    errEl.hidden = true;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.hidden = true;
    goBtn.disabled = true;
    goBtn.textContent = mode === 'login' ? 'Signing in…' : 'Creating…';
    try {
      const d = mode === 'login'
        ? await api.login(nameEl.value.trim(), passEl.value)
        : await api.register(nameEl.value.trim(), passEl.value);

      // Conflict: local progress vs whatever the account already holds. Keep the
      // fuller one rather than silently wiping a career.
      const local = getState();
      if (cloudWins(d.save, local, { orEqual: true })) {
        adoptCloudSave(d.save);
      } else {
        save();                       // push the local copy up as the new truth
      }
      net.connect();
      sfx('confirm');
      toast(`Signed in as ${d.profile.name}`, 'good');
      refreshCoins();
      after?.();
    } catch (err) {
      fail(err.message || 'Could not reach the server.');
      goBtn.disabled = false;
      goBtn.textContent = mode === 'login' ? 'Sign in' : 'Create account';
    }
  });
  return null;
}

/** Wire the signed-in online tab. Returns a cleanup function. */
export function mountOnline(root, { rerender }) {
  if (!api.isSignedIn()) return mountSignIn(root, rerender);

  net.connect();
  const offs = [];
  const searchEl = root.querySelector('#olSearch');
  const titleEl = root.querySelector('#olsTitle');
  const subEl = root.querySelector('#olsSub');
  const connEl = root.querySelector('#olConn');
  const codeOut = root.querySelector('#olCodeOut');

  const lineup = () => getState().club.lineup.filter(Boolean);
  const payload = () => ({
    club: WORLD.clubs[0].id,
    squad: lineup(),
    divIdx: getState().ultimate.divIdx,
  });

  let searchTimer = null;
  const showSearch = (title, sub) => {
    titleEl.textContent = title;
    subEl.textContent = sub;
    searchEl.hidden = false;
  };
  const hideSearch = () => { searchEl.hidden = true; clearInterval(searchTimer); };

  /* --- connection pip --- */
  const pip = async () => {
    if (!connEl?.isConnected) return;
    if (!net.isReady()) { connEl.textContent = 'connecting…'; connEl.className = 'ol-conn'; return; }
    const rtt = await net.ping();
    if (!connEl.isConnected) return;
    connEl.textContent = rtt == null ? 'online' : `online · ${rtt}ms`;
    connEl.className = `ol-conn ${rtt == null || rtt < 130 ? 'good' : 'bad'}`;
  };
  pip();
  const pipTimer = setInterval(pip, 5000);

  /* --- leaderboard --- */
  const boardEl = root.querySelector('#olBoard');
  api.leaderboard().then((rows) => {
    if (!boardEl?.isConnected) return;
    boardEl.innerHTML = rows.length
      ? rows.map((r) => `
          <div class="ol-row ${r.name === api.getName() ? 'me' : ''}">
            <i>${r.rank}</i><b>${r.name}</b>
            <span>${r.played} pl</span>
            <span>${r.wins}W ${r.draws}D ${r.losses}L</span>
            <span class="ol-gd">${r.gd > 0 ? '+' : ''}${r.gd}</span>
            <em>${r.points}</em>
          </div>`).join('')
      : '<p class="ol-empty">No ranked matches played yet — be the first.</p>';
  }).catch(() => {
    if (boardEl?.isConnected) boardEl.innerHTML = '<p class="ol-empty">Leaderboard unavailable.</p>';
  });

  /* --- guild --- */
  const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const guildEl = root.querySelector('#olGuild');
  const paintGuild = (v, board) => {
    if (!guildEl?.isConnected) return;
    const objs = (v.objectives || []).map((o) => `
      <li class="gd-obj ${o.complete ? 'done' : ''}">
        <span>${esc(o.text)}</span>
        <em>${o.have || 0}/${o.need}</em>
        <i><b style="width:${Math.min(100, Math.round(100 * (o.have || 0) / o.need))}%"></b></i>
        ${o.claimable ? `<button class="btn primary sm" data-claim="${o.id}">Claim ${o.pack} pack</button>`
          : o.claimed ? '<span class="gd-claimed">Claimed</span>' : `<span class="gd-pay">${o.pack} pack · ◈ ${o.apex}</span>`}
      </li>`).join('');
    const rows = (board?.rows || []).slice(0, 8).map((r) => `
      <div class="ol-row ${v.guild && r.code === v.guild.code ? 'me' : ''}">
        <i>${r.rank}</i><b>${esc(r.name)} <small>[${esc(r.tag)}]</small></b>
        <span>${r.members} members</span><span>${r.wins}W · ${r.goals} goals</span>
        <span class="ol-gd"></span><em>${r.points}</em>
      </div>`).join('');
    guildEl.innerHTML = v.guild ? `
      <span class="ol-kicker">Guild · week ${esc(v.week?.id || '')}</span>
      <h3>${esc(v.guild.name)} <small>[${esc(v.guild.tag)}]</small></h3>
      <p>Code <b class="gd-code">${esc(v.guild.code)}</b> — share it to invite. ${v.rank ? `Rank <b>#${v.rank}</b> of ${v.guilds} this week.` : ''}</p>
      <div class="gd-members">${v.guild.members.map((m) => `<span class="${m.online ? 'on' : ''}"><i></i>${esc(m.name)} <em>${m.points}</em></span>`).join('')}</div>
      <span class="ol-kicker">Weekly objectives</span>
      <ul class="gd-objs">${objs}</ul>
      <span class="ol-kicker">Guild board</span>
      <div class="ol-rows gd-board">${rows || '<p class="ol-empty">No guild has played yet this week.</p>'}</div>
      <button class="btn ghost sm" id="gdLeave">Leave guild</button>` : `
      <span class="ol-kicker">Guild</span>
      <h3>Join a guild</h3>
      <p>Play together: the wins, goals and matches of everyone in a guild count toward the
         same weekly objectives, and each member claims the reward.</p>
      <div class="ol-lobby">
        <div class="ol-join"><input id="gdName" maxlength="20" placeholder="New guild name" aria-label="Guild name"><button class="btn ghost" id="gdCreate">Create</button></div>
        <div class="ol-join"><input id="gdCode" maxlength="5" placeholder="CODE" aria-label="Guild code"><button class="btn ghost" id="gdJoin">Join</button></div>
      </div>
      <span class="ol-kicker">Guild board · this week</span>
      <div class="ol-rows gd-board">${rows || '<p class="ol-empty">No guild has played yet this week.</p>'}</div>`;
  };
  const loadGuild = async () => {
    try {
      const [v, board] = await Promise.all([api.guild(), api.guildBoard().catch(() => null)]);
      paintGuild(v, board);
    } catch (err) {
      if (guildEl?.isConnected) guildEl.innerHTML = `<span class="ol-kicker">Guild</span><p class="ol-empty">${esc(err.message || 'Guilds unavailable.')}</p>`;
    }
  };
  loadGuild();
  guildEl?.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    try {
      if (b.id === 'gdCreate') {
        const r = await api.guildAction({ action: 'create', name: guildEl.querySelector('#gdName').value });
        toast(`Guild founded — code ${r.view?.guild?.code || ''}`, 'good');
      } else if (b.id === 'gdJoin') {
        await api.guildAction({ action: 'join', code: guildEl.querySelector('#gdCode').value.trim().toUpperCase() });
        toast('Joined the guild', 'good');
      } else if (b.id === 'gdLeave') {
        await api.guildAction({ action: 'leave' });
        toast('Left the guild', 'info');
      } else if (b.dataset.claim) {
        const r = await api.guildAction({ action: 'claim', id: b.dataset.claim });
        if (r.reward) {
          update((st) => pend(st, r.reward));
          sfx('confirm');
          toast(`${r.reward.title} — reward waiting on Today`, 'good');
        }
      } else return;
      loadGuild();
    } catch (err) { toast(err.message || 'That did not work', 'warn'); }
  });

  /* --- friends --- */
  const friendsEl = root.querySelector('#olFriends');
  const paintFriends = (rows) => {
    if (!friendsEl?.isConnected) return;
    const hosting = !codeOut.hidden;
    friendsEl.innerHTML = `
      <span class="ol-kicker">Friends</span>
      <h3>Friends</h3>
      <div class="ol-join"><input id="frName" maxlength="16" placeholder="Player name" aria-label="Friend's player name"><button class="btn ghost" id="frAdd">Add</button></div>
      <div class="fr-list">${rows.length ? rows.map((r) => `
        <div class="fr-row ${r.online ? 'on' : ''}">
          <i></i><b>${esc(r.name)}</b>${r.guild ? `<small>[${esc(r.guild)}]</small>` : ''}<span>${r.points} pts</span>
          ${r.online && hosting ? `<button class="btn primary sm" data-invite="${esc(r.name)}">Invite</button>` : ''}
          ${r.inMatch ? `<button class="btn ghost sm" data-watch="${r.inMatch}">Watch</button>` : ''}
          <button class="icon-btn sm" data-remove="${esc(r.name)}" title="Remove">✕</button>
        </div>`).join('') : '<p class="ol-empty">Add friends by their player name. Invites to your lobby and a Watch button appear when they are online.</p>'}</div>`;
  };
  const loadFriends = async () => {
    try { paintFriends((await api.friends()).rows || []); }
    catch (err) { if (friendsEl?.isConnected) friendsEl.innerHTML = `<span class="ol-kicker">Friends</span><p class="ol-empty">${esc(err.message || 'Friends unavailable.')}</p>`; }
  };
  loadFriends();
  const friendsTimer = setInterval(loadFriends, 15000);
  friendsEl?.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    try {
      if (b.id === 'frAdd') {
        await api.friendAction({ action: 'add', name: friendsEl.querySelector('#frName').value.trim() });
        toast('Friend added', 'good');
      } else if (b.dataset.remove) {
        await api.friendAction({ action: 'remove', name: b.dataset.remove });
      } else if (b.dataset.invite) {
        if (!net.isReady()) return toast('Not connected to the server', 'warn');
        net.send({ t: 'invite', to: b.dataset.invite });
        return;
      } else if (b.dataset.watch) {
        if (!net.isReady()) return toast('Not connected to the server', 'warn');
        net.send({ t: 'spectate', matchId: +b.dataset.watch });
        showSearch('Joining as a spectator…', 'Waiting for the host\'s picture');
        return;
      } else return;
      loadFriends();
    } catch (err) { toast(err.message || 'That did not work', 'warn'); }
  });

  /* --- live matches --- */
  const liveEl = root.querySelector('#olLive');
  const loadLive = async () => {
    try {
      const rows = (await api.liveMatches()).rows || [];
      if (!liveEl?.isConnected) return;
      liveEl.innerHTML = rows.length ? rows.map((r) => `
        <div class="ol-row">
          <i>▶</i><b>${esc(r.host)} v ${esc(r.guest)}</b>
          <span>${r.spectators} watching</span><span></span><span class="ol-gd"></span>
          <em><button class="btn ghost sm" data-watch="${r.matchId}">Watch</button></em>
        </div>`).join('') : '<p class="ol-empty">Nobody is playing right now.</p>';
    } catch { if (liveEl?.isConnected) liveEl.innerHTML = '<p class="ol-empty">Live list unavailable.</p>'; }
  };
  loadLive();
  const liveTimer = setInterval(loadLive, 10000);
  liveEl?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-watch]');
    if (!b) return;
    if (!net.isReady()) return toast('Not connected to the server', 'warn');
    net.send({ t: 'spectate', matchId: +b.dataset.watch });
    showSearch('Joining as a spectator…', 'Waiting for the host\'s picture');
  });

  /* --- actions --- */
  root.querySelector('#olQueue')?.addEventListener('click', () => {
    if (!net.isReady()) return toast('Not connected to the server', 'warn');
    net.send({ t: 'queue', ...payload() });
    const div = DIVISIONS[getState().ultimate.divIdx].name;
    showSearch('Searching for an opponent…', `Looking in ${div}`);
    // The server starts with same-division only and widens the net as you wait,
    // so say so rather than leaving a spinner that looks stuck.
    clearInterval(searchTimer);
    const since = Date.now();
    searchTimer = setInterval(() => {
      if (searchEl.hidden) { clearInterval(searchTimer); return; }
      const s = (Date.now() - since) / 1000;
      subEl.textContent = s < 8 ? `Looking in ${div}`
        : s < 16 ? `Widening the search around ${div}…`
          : s < 25 ? 'Looking further up and down the ladder…'
            : 'Matching with anyone available…';
    }, 1000);
  });

  root.querySelector('#olHost')?.addEventListener('click', () => {
    if (!net.isReady()) return toast('Not connected to the server', 'warn');
    net.send({ t: 'host', ...payload() });
  });

  root.querySelector('#olJoin')?.addEventListener('click', () => {
    const code = root.querySelector('#olCode').value.trim().toUpperCase();
    if (code.length !== 4) return toast('Enter the four-letter code', 'warn');
    net.send({ t: 'join', code, ...payload() });
    showSearch('Joining lobby…', code);
  });

  root.querySelector('#olCancel')?.addEventListener('click', () => {
    net.send({ t: 'cancel' });
    hideSearch();
  });

  /* Pairing a watch. The phone is already signed in, so it can vouch: it asks
   * the server for a six-digit code and shows it big enough to read at arm's
   * length. The code dies in three minutes or on first use, whichever comes
   * first — see the pairing endpoints in server.js. */
  root.querySelector('#pairWatch')?.addEventListener('click', async () => {
    const btn = root.querySelector('#pairWatch');
    btn.disabled = true; btn.textContent = 'Getting a code…';
    const r = await api.pairCode();
    btn.disabled = false; btn.textContent = 'Pair a watch';
    if (r.error) { toast(r.error, 'warn'); return; }
    const box = document.createElement('div');
    box.className = 'pair-overlay';
    box.innerHTML = `
      <div class="pair-card glass">
        <span class="pair-kicker">On your watch, open apexxi.online/watch.html</span>
        <b class="pair-code">${r.code.replace(/(\d{3})(\d{3})/, '$1 $2')}</b>
        <span class="pair-note">Enter this code within three minutes. It works once.</span>
        <button class="btn primary" id="pairDone">Done</button>
      </div>`;
    document.body.appendChild(box);
    const close = () => box.remove();
    box.querySelector('#pairDone').addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    setTimeout(close, 3 * 60 * 1000);
  });

  root.querySelector('#signOut')?.addEventListener('click', () => {
    net.disconnect();
    api.signOut();
    toast('Signed out — progress stays on this device', 'info');
    rerender();
  });

  /* --- server messages --- */
  offs.push(net.on('hosting', (m) => {
    codeOut.hidden = false;
    codeOut.innerHTML = `Lobby open — share this code: <b>${m.code}</b>`;
    showSearch('Waiting for a friend…', `Lobby code ${m.code} · invite a friend from the list below`);
    // the search overlay covers the page, so the friends list needs to be usable through it:
    // an invite is the four-letter code delivered by the server, nothing more
    const online = [...root.querySelectorAll('.fr-row.on b')].map((b) => b.textContent);
    if (online.length) {
      const inv = document.createElement('div');
      inv.className = 'ols-invite';
      inv.innerHTML = `<span>Invite</span>${online.map((n) => `<button class="btn ghost sm" data-inv="${n}">${n}</button>`).join('')}`;
      searchEl.querySelector('.ols-inner')?.appendChild(inv);
      inv.addEventListener('click', (e) => { const b = e.target.closest('[data-inv]'); if (b) net.send({ t: 'invite', to: b.dataset.inv }); });
    }
  }));
  offs.push(net.on('inviteSent', (m) => toast(`Invite sent to ${m.to}`, 'good')));
  offs.push(net.on('inviteFail', (m) => toast(m.error, 'warn')));
  offs.push(net.on('spectateFail', (m) => { hideSearch(); toast(m.error, 'warn'); }));
  offs.push(net.on('spectating', hideSearch));

  offs.push(net.on('joinFail', (m) => { hideSearch(); toast(m.error, 'warn'); }));
  offs.push(net.on('queued', () => { /* already showing the search overlay */ }));

  offs.push(net.on('match', hideSearch));

  offs.push(net.on('kicked', () => {
    toast('Signed in somewhere else — this session was closed', 'warn');
  }));

  offs.push(net.on('closed', () => {
    if (connEl?.isConnected) { connEl.textContent = 'offline'; connEl.className = 'ol-conn bad'; }
  }));

  return () => {
    clearInterval(pipTimer);
    clearInterval(searchTimer);
    clearInterval(friendsTimer);
    clearInterval(liveTimer);
    searchEl.querySelector('.ols-invite')?.remove();
    offs.forEach((off) => off());
  };
}

export function mount(root) {
  return api.isSignedIn()
    ? mountOnline(root, { rerender: () => navigate('online') })
    : mountSignIn(root, () => navigate('online'));
}

/* ------------------------------------------------------------------ *
 * Match start
 * ------------------------------------------------------------------ */
// Registered once, at module level, rather than by whichever screen happens to
// be mounted — an opponent can be found after you have wandered off the tab.
net.on('match', (m) => {
  const squadOf = (ids, name, short, crest) => {
    const xi = (ids || []).map(getPlayer).filter(Boolean);
    return xi.length === 11
      ? { xi, name, short, colors: crest.colors, crest }
      : null;
  };
  /* Your own club goes onto the wire as you built it. The opponent's badge does
     not travel — the lobby only carries a name and eleven ids — so they take a
     stock away kit that is guaranteed to clash with nothing. */
  const me = clubIdentity();
  const mine = squadOf(getState().club.lineup.filter(Boolean), me.name, me.short, me.crest);
  const oppName = m.opp.name || 'Rival';
  const theirs = squadOf(m.opp.squad, oppName, oppName.slice(0, 3).toUpperCase(),
    { shape: 'circle', pattern: 'halves', device: 'star', colors: ['#ff2e88', '#160b16'] });

  sfx('confirm');
  navigate('play', {
    // the host is always the home side, so both machines lay the pitch out the same way
    homeId: WORLD.clubs[0].id,
    awayId: WORLD.clubs[1].id,
    // three minutes — see the note on the division fixture in squad.js
    duration: 180,
    mode: 'versus',
    online: {
      matchId: m.matchId,
      host: m.host,
      seat: m.seat,
      kind: m.kind,
      oppName: m.opp.name,
      myName: api.getName(),
    },
    ultimate: m.kind === 'division',
    // a Weekend League pairing counts for the weekend on both machines
    weekend: m.kind === 'weekend' ? (m.wl || null) : null,
    homeSquad: m.host ? mine : theirs,
    awaySquad: m.host ? theirs : mine,
  });
});

/* An invite is a lobby code that arrived by itself. Accepting it is exactly
 * the Join button with the code typed in. */
net.on('invited', (m) => {
  if (!api.isSignedIn()) return;
  sfx('confirm');
  const box = document.createElement('div');
  box.className = 'toast invite-toast';
  box.innerHTML = `<b>${m.from}</b> invited you to a match <button class="btn primary sm" id="invGo">Join</button><button class="btn ghost sm" id="invNo">Later</button>`;
  document.body.appendChild(box);
  const close = () => box.remove();
  box.querySelector('#invNo').addEventListener('click', close);
  box.querySelector('#invGo').addEventListener('click', () => {
    close();
    const lineup = getState().club.lineup.filter(Boolean);
    if (lineup.length !== 11) return toast('Fill all 11 Ultimate XI positions to play', 'warn');
    net.send({ t: 'join', code: m.code, club: WORLD.clubs[0].id, squad: lineup, divIdx: getState().ultimate.divIdx });
  });
  setTimeout(close, 45000);
});

/* Spectating: the match screen in guest mode, with the sender, the pause
 * requests and the result all switched off (see `spectating` in play.js).
 * The two squads travel with the message the way an opponent's does. */
net.on('spectating', (m) => {
  const squadOf = (ids, name, colors) => {
    const xi = (ids || []).map(getPlayer).filter(Boolean);
    const short = (name || '???').slice(0, 3).toUpperCase();
    return xi.length === 11 ? { xi, name, short, colors, crest: { shape: 'shield', pattern: 'halves', device: 'star', colors } } : null;
  };
  const home = squadOf(m.host.squad, m.host.name, ['#2f80ed', '#0b1020']);
  const away = squadOf(m.guest.squad, m.guest.name, ['#ff2e88', '#160b16']);
  sfx('confirm');
  navigate('play', {
    homeId: WORLD.clubs[0].id,
    awayId: WORLD.clubs[1].id,
    duration: 180,
    mode: 'versus',
    online: { matchId: m.matchId, host: false, seat: 1, spectate: true, kind: 'spectate', oppName: `${m.host.name} v ${m.guest.name}`, myName: api.getName() },
    homeSquad: home,
    awaySquad: away,
  });
});

/**
 * Queue for a Weekend League opponent from anywhere (the weekend screen uses
 * this). Same club payload as the division queue plus the weekend tag the
 * server pairs on. Returns false when the socket is not up.
 */
export function queueWeekend(wl) {
  if (!net.isReady()) return false;
  net.send({
    t: 'queue',
    club: WORLD.clubs[0].id,
    squad: getState().club.lineup.filter(Boolean),
    divIdx: getState().ultimate.divIdx,
    wl,
  });
  return true;
}
export const cancelQueue = () => net.send({ t: 'cancel' });
