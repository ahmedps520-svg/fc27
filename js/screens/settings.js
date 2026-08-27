import { getState, update, resetAll } from '../state.js';
import { WORLD } from '../data/generator.js';
import { navigate, applyTheme, toast, APP_VERSION, wheelDiagnostics } from '../app.js';
import { installUpdate, knownBuild } from '../update.js';
import { screenHead } from '../components/screenHead.js';
import { setAudioSettings, startMusic, stopMusic, resumeAudio, sfx } from '../audio.js';
import { startTutorial, tutorialSeen } from '../tutorial.js';

/** Push the saved audio preferences into the engine. */
function applyAudio() {
  const a = getState().settings;
  setAudioSettings({
    enabled: a.sound !== false,
    music: a.musicVol ?? 0.5,
    sfx: a.sfxVol ?? 0.9,
  });
}

export const TITLE = 'Settings';

const QUALITY_NOTE = (q) => (q === 'min'
  ? '<b>Ultra Low:</b> everything turned down at once — sub-native resolution, no shadows, no lighting passes, flat turf, a sparse crowd and the light player figures. It looks like a highlights reel from 2004 and runs on nearly anything.'
  : q === 'ultra' || !q
  ? '<b>Ultra:</b> ambient occlusion, depth of field that follows the ball, volumetric floodlights, above-native resolution, 4K shadows and a full terrace of seats. It will work your GPU hard — turn on Show FPS below and drop to High if it stutters.'
  : '<b>High</b> keeps the occlusion, the floodlight beams and the lens grade, and skips the depth of field and the supersampling. Ultra adds all of it back.');

const MODEL_NOTE = (m) => (m === 'simple'
  ? 'Light figures are built in code — no download, and they run on anything.'
  : '<b>Realistic:</b> a scanned, motion-captured footballer, downloaded once and cached. Twenty-two of them is real work for a phone; switch to Light if the frame rate drops.');

export function render() {
  const s = getState().settings;
  const st = getState();
  return `
    ${screenHead({
      kicker: 'System',
      title: 'Settings',
      sub: 'How the game looks, sounds and runs on this device.',
      motif: 'faders', tone: 'd',
    })}
    <!-- App sits first on purpose. Everything in it is what someone opens
         Settings to find when something is wrong — the build to quote in a bug
         report, the update button, the changelog, and how to reach us. Last in
         the list it was effectively unreachable: this screen is ~2000px tall and
         a phone in landscape shows 430px of it, so the panel sat three screens
         down behind the things people rarely change twice. -->
    <section class="panel glass">
      <header class="panel-head"><h2>App</h2></header>
      <!-- First in the panel that is first on the screen: someone who does not
           know how the game works should not have to know where to look. -->
      <div class="setting-row">
        <div><b>${tutorialSeen() ? 'Replay tutorial' : 'Start tutorial'}</b>
          <span>A guided tour of every mode, from Kick Off to Ultimate XI.</span></div>
        <button class="btn ghost" id="startTut">
          ${tutorialSeen() ? 'Replay' : 'Start'}
        </button>
      </div>
      <div class="setting-row">
        <div><b>Support</b><span>Questions, bugs, feedback — we read all of it.</span></div>
        <a href="mailto:support@apexxi.online" class="btn ghost">Send email</a>
      </div>
      <div class="setting-row">
        <div><b>What's new</b><span>Every change, newest first.</span></div>
        <a href="notes.html" target="_blank" rel="noopener" class="btn ghost">Changelog</a>
      </div>
      <div class="setting-row">
        <div><b>Version</b><span>New builds are offered on the title screen.</span></div>
        <span class="tag">${APP_VERSION}</span>
      </div>
      <div class="setting-row">
        <div><b>Build</b><span>Changes with every commit. Quote this in a bug report.</span></div>
        <span class="tag mono" id="buildTag">checking…</span>
      </div>
      <div class="setting-row">
        <div><b>Force update</b><span>Clears the offline copy and reloads from the server.</span></div>
        <button class="btn ghost" id="forceUpdate">Update now</button>
      </div>
      <!-- Diagnostic, not a feature. The mouse wheel has now had three separate
           causes and none of them reproduced on a test machine, so this reports
           what the wheel actually did on the machine that has the problem:
           scroll over the box it draws and screenshot the readout. -->
      <div class="setting-row">
        <div><b>Scroll check</b><span>If the mouse wheel misbehaves, open this and send the readout.</span></div>
        <button class="btn ghost" id="scrollCheck">Open</button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Career sim</h2></header>
      <div class="setting-row">
        <div><b>Sim speed</b></div>
        <div class="seg" id="speedSeg">
          ${[['normal', 'Normal'], ['fast', 'Fast'], ['instant', 'Instant']].map(([v, l]) =>
            `<button class="${s.simSpeed === v ? 'on' : ''}" data-speed="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div><b>Full commentary</b></div>
        <button class="switch ${s.commentary ? 'on' : ''}" id="commentaryTgl" role="switch"
                aria-checked="${s.commentary}"><i></i></button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Sound</h2></header>
      <div class="setting-row">
        <div><b>Audio</b></div>
        <button class="switch ${s.sound !== false ? 'on' : ''}" id="soundTgl" role="switch"
                aria-checked="${s.sound !== false}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>Music</b></div>
        <div class="seg" id="musicSeg">
          ${[[0, 'Off'], [0.3, 'Low'], [0.5, 'Mid'], [0.85, 'High']].map(([v, l]) =>
            `<button class="${(s.musicVol ?? 0.5) === v ? 'on' : ''}" data-music="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div><b>Effects</b></div>
        <div class="seg" id="sfxSeg">
          ${[[0, 'Off'], [0.5, 'Low'], [0.9, 'Mid'], [1.3, 'High']].map(([v, l]) =>
            `<button class="${(s.sfxVol ?? 0.9) === v ? 'on' : ''}" data-sfx="${v}">${l}</button>`).join('')}
        </div>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Look</h2></header>
      <div class="setting-row">
        <div><b>Reduce motion</b></div>
        <button class="switch ${s.reduceMotion ? 'on' : ''}" id="motionTgl" role="switch"
                aria-checked="${s.reduceMotion}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>3D detail</b><span>Ships on Ultra. Auto reads the device.</span></div>
        <div class="seg" id="qualitySeg">
          ${[['auto', 'Auto'], ['min', 'Ultra Low'], ['low', 'Low'], ['high', 'High'], ['ultra', 'Ultra']].map(([v, l]) =>
            `<button class="${(s.quality || 'auto') === v ? 'on' : ''}" data-quality="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <p class="setting-note ${s.quality === 'ultra' ? 'warn' : ''}" id="qualityNote">
        ${QUALITY_NOTE(s.quality)}
      </p>
      <div class="setting-row">
        <div><b>Player models</b><span>Realistic is a scanned mesh — a one-off download.</span></div>
        <div class="seg" id="modelSeg">
          ${[['realistic', 'Realistic'], ['simple', 'Light']].map(([v, l]) =>
            `<button class="${(s.models || 'realistic') === v ? 'on' : ''}" data-models="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <p class="setting-note ${s.models === 'simple' ? '' : 'warn'}" id="modelNote">
        ${MODEL_NOTE(s.models)}
      </p>
      <div class="setting-row">
        <div><b>Show FPS</b><span>Live frame counter in the corner during a match.</span></div>
        <button class="switch ${s.showFps ? 'on' : ''}" id="fpsTgl" role="switch"
                aria-checked="${!!s.showFps}"><i></i></button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>Save</h2></header>
      <div class="setting-row">
        <div><b>Apex</b><span>Earned from matches and objectives.</span></div>
        <span class="coin-chip">◈ ${(st.club.apex || 0).toLocaleString()}</span>
      </div>
      <div class="setting-row">
        <div><b>Ultimate</b><span>Not obtainable yet.</span></div>
        <span class="coin-chip ult">✦ ${(st.club.ultimate || 0).toLocaleString()}</span>
      </div>
      <div class="setting-row">
        <div><b>${st.club.collection.length} cards · ${st.club.packsOpened} packs</b></div>
      </div>
      <div class="setting-row">
        <div><b>Reset save</b></div>
        <button class="btn ghost danger" id="resetBtn">Reset</button>
      </div>
    </section>

    <section class="panel glass about">
      <header class="panel-head"><h2>Controls</h2></header>
      <div class="ctrl-grid">
        ${[['✕ / Space', 'Pass — hold for a longer ball'], ['◯ / K', 'Shoot — hold for power'],
           ['◯+R1 / K+I', 'Curl it up and bend'], ['□ / J', 'Cross'],
           ['△ / L', 'Through ball'], ['Any of the above', 'Tackle — one committed lunge, off the ball'],
           ['L1 · R1 / Q', 'Switch player'], ['R2 / Shift', 'Sprint'], ['Options / Esc', 'Pause']]
          .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
      </div>
      <p class="disclaimer">${WORLD.clubs.length} clubs · ${WORLD.players.length} players.
        Every player card names a real footballer with their real nationality, and Career
        Mode names real clubs and managers; none of them are endorsed by or affiliated
        with the game. Ultimate XI clubs and all competitions are fictional. Ratings,
        stats and values are invented and are not a claim about anyone's ability; badges
        and portraits are drawn rather than photographed — they are not likenesses.</p>
    </section>`;
}

export function mount(root) {
  /* The build the server is actually serving, which is the only way to tell
   * from the device whether a push has landed. `APP_VERSION` above is written
   * by hand and can lag; this cannot, because the server derives it from the
   * bytes it is sending. A mismatch with the stored build is worth calling
   * out — it means the title screen has an update waiting. */
  const buildTag = root.querySelector('#buildTag');
  fetch('api/version', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((v) => {
      if (!v?.build) { buildTag.textContent = 'offline'; return; }
      buildTag.textContent = v.build;
      const known = knownBuild();
      if (known && known !== v.build) {
        buildTag.classList.add('stale');
        buildTag.title = 'A newer build is available — restart to install it';
      }
    })
    .catch(() => { buildTag.textContent = 'offline'; });

  root.querySelector('#speedSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-speed]');
    if (!b) return;
    update((s) => { s.settings.simSpeed = b.dataset.speed; });
    root.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
  });

  const toggle = (el, key) => el.addEventListener('click', () => {
    const next = !getState().settings[key];
    update((s) => { s.settings[key] = next; });
    el.classList.toggle('on', next);
    el.setAttribute('aria-checked', String(next));
    applyTheme();
  });
  toggle(root.querySelector('#commentaryTgl'), 'commentary');
  toggle(root.querySelector('#motionTgl'), 'reduceMotion');
  toggle(root.querySelector('#fpsTgl'), 'showFps');

  root.querySelector('#soundTgl').addEventListener('click', (e) => {
    const next = getState().settings.sound === false;
    update((s) => { s.settings.sound = next; });
    e.currentTarget.classList.toggle('on', next);
    e.currentTarget.setAttribute('aria-checked', String(next));
    applyAudio();
    if (next) { resumeAudio(); startMusic(); } else stopMusic();
  });

  const audioSeg = (sel, key, attr) => root.querySelector(sel).addEventListener('click', (e) => {
    const b = e.target.closest(`[data-${attr}]`);
    if (!b) return;
    const v = Number(b.dataset[attr]);
    update((s) => { s.settings[key] = v; });
    root.querySelectorAll(`[data-${attr}]`).forEach((x) => x.classList.toggle('on', x === b));
    applyAudio();
    if (key === 'musicVol') { if (v > 0) startMusic(); else stopMusic(); }
    else sfx('select');
  });
  audioSeg('#musicSeg', 'musicVol', 'music');
  audioSeg('#sfxSeg', 'sfxVol', 'sfx');

  root.querySelector('#qualitySeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quality]');
    if (!b) return;
    const q = b.dataset.quality;
    update((s) => { s.settings.quality = q; });
    root.querySelectorAll('[data-quality]').forEach((x) => x.classList.toggle('on', x === b));
    const note = root.querySelector('#qualityNote');
    note.classList.toggle('warn', q === 'ultra');
    note.innerHTML = QUALITY_NOTE(q);
  });

  root.querySelector('#modelSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-models]');
    if (!b) return;
    const m = b.dataset.models;
    update((s) => { s.settings.models = m; });
    root.querySelectorAll('[data-models]').forEach((x) => x.classList.toggle('on', x === b));
    const note = root.querySelector('#modelNote');
    note.classList.toggle('warn', m !== 'simple');
    note.innerHTML = MODEL_NOTE(m);
  });

  /* The accent picker used to live here, with a listener that wrote
     settings.accent and re-ran applyTheme. Both are gone on purpose — see the
     note on GREEN in app.js. Nothing replaced the row; it is simply not there. */

  /**
   * The manual way out of a stale install.
   *
   * The title screen offers an update when the server is on a newer build, but
   * a device wedged on an old copy may never be told there is one — so there
   * has to be a button that throws the offline copy away regardless. It runs
   * the same installer the gate does rather than a second copy of it, and
   * borrows the button itself as the progress readout.
   */
  // The tour drives the app by navigating and clicking real controls, so it
  // cannot be run from on top of the screen that launched it — it leaves
  // Settings almost immediately anyway.
  root.querySelector('#startTut')?.addEventListener('click', () => startTutorial(0));

  /* Scroll check. Draws a panel, samples the wheel log the app keeps, and
     prints the page's own scroll numbers next to it — enough to tell whether
     the wheel is reaching the page at all, which is the thing screenshots of a
     stationary page cannot say. */
  root.querySelector('#scrollCheck')?.addEventListener('click', () => {
    document.querySelector('#scrollDiag')?.remove();
    const box = document.createElement('div');
    box.id = 'scrollDiag';
    box.className = 'scroll-diag';
    document.body.appendChild(box);
    const doc = document.scrollingElement || document.documentElement;
    const draw = () => {
      const log = wheelDiagnostics();
      box.innerHTML = `
        <header><b>Scroll check</b><button class="btn ghost" id="sdClose">Close</button></header>
        <p class="sd-note">Scroll the wheel anywhere on the page, then screenshot this.</p>
        <div class="sd-grid">
          <span>page scrollTop</span><b>${Math.round(doc.scrollTop)}</b>
          <span>page can scroll</span><b>${Math.round(doc.scrollHeight - doc.clientHeight)}px</b>
          <span>wheel events seen</span><b>${log.length ? 'yes' : 'none yet'}</b>
          <span>screen</span><b>${innerWidth}×${innerHeight} @${devicePixelRatio}</b>
        </div>
        <ol class="sd-log">${log.length
          ? log.map((w) => `<li>Δ${w.dy} mode ${w.mode} · ${w.took ? 'page took it' : `handled by ${w.inner || 'browser'}`}
              · ${w.from}→${w.to} of ${w.room}<em>${w.chain.join(' ‹ ')}</em></li>`).reverse().join('')
          : '<li>no wheel events yet — try scrolling now</li>'}</ol>
        <p class="sd-ua">${navigator.userAgent}</p>`;
      box.querySelector('#sdClose').addEventListener('click', () => { stop = true; box.remove(); });
    };
    let stop = false;
    const tick = () => { if (stop || !box.isConnected) return; draw(); setTimeout(tick, 400); };
    tick();
  });

  root.querySelector('#forceUpdate').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    let build = 'unknown';
    try {
      const res = await fetch('api/version', { cache: 'no-store' });
      if (res.ok) build = (await res.json()).build || 'unknown';
    } catch { /* offline — reload anyway, it can hardly make things worse */ }
    installUpdate(build, (pct) => { btn.textContent = `${Math.round(pct)}%`; });
  });

  root.querySelector('#resetBtn').addEventListener('click', () => {
    if (!confirm('Reset the collection, line-up and career save? This cannot be undone.')) return;
    resetAll();
    applyTheme();
    toast('Save reset');
    navigate('menu');
  });
}
