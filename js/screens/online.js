/**
 * Online: account panel, matchmaking, private lobbies and the leaderboard.
 *
 * Rendered as a tab inside Ultimate XI (see squad.js) and reused by the
 * standalone account screen off the main menu.
 */
import { getState, adoptCloudSave, cloudWins, save } from '../state.js';
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
      <button class="btn ghost sm" id="signOut">Sign out</button>
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
    showSearch('Waiting for a friend…', `Lobby code ${m.code}`);
  }));

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
    homeSquad: m.host ? mine : theirs,
    awaySquad: m.host ? theirs : mine,
  });
});
