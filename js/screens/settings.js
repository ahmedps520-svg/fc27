import { getState, update, resetAll } from '../state.js';
import { skillList } from '../game/skills.js';
import { WORLD } from '../data/generator.js';
import { navigate, applyTheme, toast, APP_VERSION, wheelDiagnostics } from '../app.js';
import { installUpdate, knownBuild } from '../update.js';
import { screenHead } from '../components/screenHead.js';
import { setAudioSettings, startMusic, stopMusic, resumeAudio, sfx } from '../audio.js';
import { startTutorial, tutorialSeen } from '../tutorial.js';
import { t, LANGS, setLang, applyLanguage } from '../i18n.js';
import { describeRenderer } from '../game/gpu.js';
import { deviceClass } from '../game/render3d.js';
import { CAMERA_PRESETS, cameraSettings } from '../game/camera.js';

/* The developer unlock: every tier on every device, for this session. */
const DEV_KEY = 'apexxi.devUnlock';
const devUnlocked = () => { try { return sessionStorage.getItem(DEV_KEY) === '1'; } catch { return false; } };
const DEV_CODE = '549999';

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

const QUALITY_NOTE = (q) => (q === 'ultra' ? QUALITY_NOTE('cinema') : q === 'min'
  ? '<b>Ultra Low:</b> everything turned down at once — sub-native resolution, no shadows, no lighting passes, flat turf, a sparse crowd and the light player figures. It looks like a highlights reel from 2004 and runs on nearly anything.'
  : q === 'cinema'
  ? '<b>Ultra+ (cinematic):</b> everything Ultra does at three times native resolution, with god rays, depth of field on every shot, the waving crowd and the wet-pitch reflections. For a desktop with a real GPU; a phone will not hold it.'
  : q === 'medium'
  ? '<b>Medium:</b> the lighting passes, the floodlight beams, rain and a moving crowd at a native pixel ratio and a lighter shadow map — what a recent phone is dealt on Auto. The built-in player figures; the scanned models come in at High.'
  : q === 'ultra' || !q
  ? '<b>Ultra:</b> ambient occlusion, depth of field that follows the ball, volumetric floodlights, above-native resolution, 4K shadows and a full terrace of seats. It will work your GPU hard — turn on Show FPS below and drop to High if it stutters.'
  : '<b>High</b> keeps the occlusion, the floodlight beams and the lens grade, and skips the depth of field and the supersampling. Ultra adds all of it back.');


/* What the seg highlights for a saved value: the old names map onto the new tiers, and a phone's Auto is Performance. */
function qualityShown(q) {
  const v = q === 'ultra' ? 'cinema' : q === 'min' ? 'low' : (q || 'auto');
  if (deviceClass() === 'phone' && !devUnlocked()) return v === 'cinema' ? 'cinema' : 'medium';
  return v;
}

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
      <header class="panel-head"><h2>${t('settings.access')}</h2></header>
      <div class="setting-row">
        <div><b>${t('settings.language')}</b><span>${t('settings.language.sub')}</span></div>
        <div class="seg" id="langSeg">
          ${Object.entries(LANGS).map(([v, l]) => `<button class="${(s.lang || 'en') === v ? 'on' : ''}" data-lang="${v}" lang="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row">
        <div><b>${t('settings.largeText')}</b><span>${t('settings.largeText.sub')}</span></div>
        <button class="switch ${s.largeText ? 'on' : ''}" id="largeTgl" role="switch" aria-checked="${!!s.largeText}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>${t('settings.colorSafe')}</b><span>${t('settings.colorSafe.sub')}</span></div>
        <button class="switch ${s.colorSafeKits ? 'on' : ''}" id="colorSafeTgl" role="switch" aria-checked="${!!s.colorSafeKits}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>${t('settings.reduceMotion')}</b></div>
        <button class="switch ${s.reduceMotion ? 'on' : ''}" id="motionTgl" role="switch"
                aria-checked="${s.reduceMotion}"><i></i></button>
      </div>
    </section>

    <section class="panel glass">
      <header class="panel-head"><h2>${t('settings.look')}</h2></header>
      <div class="setting-row" hidden>
        <div><b>Reduce motion</b></div>
        <button class="switch ${s.reduceMotion ? 'on' : ''}" id="motionTgl2" role="switch"
                aria-checked="${s.reduceMotion}"><i></i></button>
      </div>
      <div class="setting-row">
        <div><b>3D detail</b><span>${deviceClass() === 'phone' && !devUnlocked() ? 'Performance keeps a phone at its frame rate; Fidelity is everything the desktop Ultra does.' : 'Auto reads the GPU and picks Low, Medium or High. Ultra is for a desktop with a real GPU.'}</span></div>
        <div class="seg" id="qualitySeg">
          ${(deviceClass() === 'phone' && !devUnlocked()
            ? [['medium', 'Performance'], ['cinema', 'Fidelity']]
            : [['auto', 'Auto'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['cinema', 'Ultra']]).map(([v, l]) =>
            `<button class="${qualityShown(s.quality) === v ? 'on' : ''}" data-quality="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <p class="setting-note ${s.quality === 'ultra' ? 'warn' : ''}" id="qualityNote">
        ${QUALITY_NOTE(s.quality)}
      </p>
      ${(() => { const c = cameraSettings(s.camera); return `
      <div class="setting-row cam-row">
        <div><b>Camera</b><span id="camBlurb">${CAMERA_PRESETS.find((p) => p.id === c.preset).blurb} The 🎥 button in a match (V on a keyboard) changes it as you play.</span></div>
        <div class="seg cam-seg" id="camSeg">
          ${CAMERA_PRESETS.map((p) => `<button class="${c.preset === p.id ? 'on' : ''}" data-cam="${p.id}">${p.name}</button>`).join('')}
        </div>
      </div>
      <div class="setting-row cam-sliders">
        <label><span>Height <b id="camHeightV">${Math.round(c.height * 100)}%</b></span><input type="range" id="camHeight" min="60" max="160" step="5" value="${Math.round(c.height * 100)}"></label>
        <label><span>Zoom <b id="camZoomV">${Math.round(c.zoom * 100)}%</b></span><input type="range" id="camZoom" min="70" max="140" step="5" value="${Math.round(c.zoom * 100)}"></label>
        <label><span>Angle <b id="camAngleV">${c.angle > 0 ? '+' : ''}${c.angle}°</b></span><input type="range" id="camAngle" min="-15" max="15" step="1" value="${c.angle}"></label>
        <button class="btn ghost sm" id="camReset">Reset</button>
      </div>`; })()}
      <div class="setting-row">
        <div><b>Renderer</b><span id="rendererNote">${describeRenderer()}</span></div>
        <div class="seg" id="rendererSeg">
          ${[['auto', 'Auto'], ['webgl', 'WebGL2'], ['webgpu', 'WebGPU (beta)']].map(([v, l]) => `<button class="${(s.renderer || 'auto') === v ? 'on' : ''}" data-renderer="${v}">${l}</button>`).join('')}
        </div>
      </div>
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
           ['L1 · R1 / Q', 'Switch player'], ['R2 / Shift', 'Sprint'], ['Options / Esc', 'Pause'],
           ['□ + stick back', 'Cut-back from the byline'], ['□ + R1 / J+I', 'Driven cross'], ['1 – 5 / ⚑', 'Quick tactics'],
           ['L2 / H (hold)', 'Skill move — point the stick, add a modifier, let go']]
          .map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}
      </div>
      <h3 class="skills-head">Skill moves <small>stars on each card show which a player can do · on touch, swipe the SKILL button (long swipe = sprint, curved = curl, with SPRINT held = lob)</small></h3>
      <div class="ctrl-grid skills-grid">
        ${skillList().map((m) => `<div><b>${'★'.repeat(m.stars)} ${m.name}</b><span>${m.combo}</span></div>`).join('')}
      </div>
      <p class="disclaimer">${WORLD.clubs.length} clubs · ${WORLD.players.length} players.
        Every player card names a real footballer with their real nationality, and Career
        Mode names real clubs and managers; none of them are endorsed by or affiliated
        with the game. Ultimate XI clubs and all competitions are fictional. Ratings,
        stats and values are invented and are not a claim about anyone's ability; badges
        and portraits are drawn rather than photographed — they are not likenesses.</p>
    </section>
    <button class="dev-dot" id="devDot" aria-label="Developer">·</button>`;
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
  toggle(root.querySelector('#colorSafeTgl'), 'colorSafeKits');
  root.querySelector('#largeTgl').addEventListener('click', (e) => {
    const next = !getState().settings.largeText;
    update((st) => { st.settings.largeText = next; });
    e.currentTarget.classList.toggle('on', next);
    applyLanguage();
  });
  root.querySelector('#rendererSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-renderer]');
    if (!b) return;
    update((st) => { st.settings.renderer = b.dataset.renderer; });
    root.querySelectorAll('[data-renderer]').forEach((x) => x.classList.toggle('on', x === b));
    root.querySelector('#rendererNote').textContent = describeRenderer();
  });
  root.querySelector('#langSeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    setLang(b.dataset.lang);
    navigate('settings');          // redraw in the new language
  });

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

  // ---- camera
  const saveCam = (patch) => update((st) => { st.settings.camera = cameraSettings({ ...(st.settings.camera || {}), ...patch }); });
  root.querySelector('#camSeg')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cam]');
    if (!b) return;
    saveCam({ preset: b.dataset.cam });
    root.querySelectorAll('[data-cam]').forEach((x) => x.classList.toggle('on', x === b));
    root.querySelector('#camBlurb').firstChild.textContent = `${CAMERA_PRESETS.find((p) => p.id === b.dataset.cam).blurb} `;
  });
  const slider = (id, key, fmt, scale = 100) => {
    const el = root.querySelector(`#${id}`);
    el?.addEventListener('input', () => {
      const v = scale === 1 ? +el.value : +el.value / scale;
      saveCam({ [key]: v });
      root.querySelector(`#${id}V`).textContent = fmt(+el.value);
    });
  };
  slider('camHeight', 'height', (v) => `${v}%`);
  slider('camZoom', 'zoom', (v) => `${v}%`);
  slider('camAngle', 'angle', (v) => `${v > 0 ? '+' : ''}${v}°`, 1);
  root.querySelector('#camReset')?.addEventListener('click', () => {
    update((st) => { st.settings.camera = cameraSettings({ preset: st.settings.camera?.preset }); });
    navigate('settings');
  });

  root.querySelector('#qualitySeg').addEventListener('click', (e) => {
    const b = e.target.closest('[data-quality]');
    if (!b) return;
    const q = b.dataset.quality;
    update((s) => { s.settings.quality = q; });
    root.querySelectorAll('[data-quality]').forEach((x) => x.classList.toggle('on', x === b));
    const note = root.querySelector('#qualityNote');
    note.classList.toggle('warn', q === 'cinema');
    note.innerHTML = QUALITY_NOTE(q);
  });

  /* Developer unlock. A dot in the corner of the last panel; the code opens
     every tier on every device until the tab is closed. */
  root.querySelector('#devDot')?.addEventListener('click', () => {
    if (devUnlocked()) { try { sessionStorage.removeItem(DEV_KEY); } catch { /* ignore */ } toast('Developer options locked'); navigate('settings'); return; }
    const box = document.createElement('div');
    box.className = 'pair-overlay';
    box.innerHTML = `
      <div class="pair-card glass">
        <span class="pair-kicker">Developer</span>
        <input id="devCode" type="password" inputmode="numeric" maxlength="6" placeholder="Code" autocomplete="off" style="font-size:22px;text-align:center;letter-spacing:.3em;padding:10px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:inherit">
        <span class="pair-note">Unlocks every graphics tier on this device for this session.</span>
        <div style="display:flex;gap:8px"><button class="btn primary" id="devGo">Unlock</button><button class="btn ghost" id="devNo">Cancel</button></div>
      </div>`;
    document.body.appendChild(box);
    const close = () => box.remove();
    box.querySelector('#devNo').addEventListener('click', close);
    box.addEventListener('click', (ev) => { if (ev.target === box) close(); });
    const go = () => {
      if (box.querySelector('#devCode').value === DEV_CODE) { try { sessionStorage.setItem(DEV_KEY, '1'); } catch { /* ignore */ } close(); toast('Developer options unlocked for this session', 'good'); navigate('settings'); }
      else { box.querySelector('#devCode').value = ''; toast('Wrong code', 'warn'); }
    };
    box.querySelector('#devGo').addEventListener('click', go);
    box.querySelector('#devCode').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); });
    box.querySelector('#devCode').focus();
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
