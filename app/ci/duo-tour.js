/*
 * v208: the simulator tour. Only in a www built with APEX_TOUR=1 (app/build-www.mjs) —
 * never in an App Store build. The app walks itself through its main screens and a
 * match on a fixed timetable — stop k is on screen from 25·k s after the page loads —
 * so .github/workflows/ios-duo.yml can photograph each stop in Xcode's iPhone Duo
 * simulator (folded and unfolded) without hearing from the app: the simulator does not
 * pass the page's console on. The first stop, "probe", paints the safe area green and
 * prints the size, scale and insets the web view was given, so the picture carries them.
 */
(function () {
  const SLOT = 25000;
  const t0 = performance.now();
  // a player who has done the first-time tour, before the game's modules read the save
  try {
    if (!localStorage.getItem('apexxi.save.v1')) {
      localStorage.setItem('apexxi.save.v1', JSON.stringify({
        meta: { reset: 'econ-2curr-1', season: 2 },
        flags: { onboarded: true, hintMatches: 9, appGift: true },
        settings: { tutorialDone: true, reduceMotion: true, pregame: 'off', music: false },
      }));
    }
  } catch { /* storage off: the tour still runs */ }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const at = (k) => wait(Math.max(0, t0 + k * SLOT - performance.now()));
  const until = async (fn, ms = 60000) => { const end = Date.now() + ms; while (Date.now() < end) { try { if (fn()) return true; } catch { /* not yet */ } await wait(200); } return false; };
  const go = async (n, p) => { const app = await import('/js/app.js'); app.navigate(n, p); };
  const log = (name) => console.log(`APEX_TOUR ${name} vw=${innerWidth}x${innerHeight} dpr=${devicePixelRatio}`);

  function probe() {
    const box = document.createElement('div');
    box.id = 'tourProbe';
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#300;pointer-events:none;font:600 15px/1.4 -apple-system,system-ui,sans-serif;color:#fff';
    const safe = document.createElement('div');
    safe.style.cssText = 'position:absolute;top:env(safe-area-inset-top);right:env(safe-area-inset-right);bottom:env(safe-area-inset-bottom);left:env(safe-area-inset-left);background:rgba(35,197,94,.35);outline:3px solid #23c55e;display:grid;place-items:center;text-align:center';
    box.appendChild(safe);
    document.body.appendChild(box);
    const cs = getComputedStyle(safe);
    const ins = ['top', 'right', 'bottom', 'left'].map((k) => `${k} ${Math.round(parseFloat(cs[k]) || 0)}`).join(' · ');
    safe.innerHTML = `<div>window ${innerWidth} × ${innerHeight} pt · scale ${devicePixelRatio}<br>screen ${screen.width} × ${screen.height}<br>safe area insets: ${ins}<br>${navigator.userAgent.match(/OS [\d_]+/)?.[0] || ''}</div>`;
    return () => box.remove();
  }

  async function run() {
    await until(() => document.getElementById('startBtn'));
    await at(0.4);
    const unprobe = probe(); log('probe');
    await at(1); unprobe(); log('title');
    try {
      const app = await import('/js/app.js');
      const st = await import('/js/state.js');
      st.update((s) => { s.flags.notesSeen = app.APP_VERSION; s.flags.onboarded = true; s.settings.tutorialDone = true; });
    } catch { /* the notes card may show; it is a real screen too */ }
    await at(2); document.getElementById('startBtn')?.click();
    await until(() => document.querySelector('[data-go="squad"]'), 15000);
    // a full Ultimate XI and some coins and packs, as the store screenshots use
    try {
      const { WORLD } = await import('/js/data/generator.js');
      const st = await import('/js/state.js');
      const pool = WORLD.players.filter((p) => !p.sbc && p.rarity !== 'icon').sort((a, b) => b.overall - a.overall);
      const shape = ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CDM', 'CM', 'LW', 'ST', 'RW'];
      const used = new Set();
      const pick = (pos) => { const p = pool.find((x) => !used.has(x.id) && x.position === pos); if (p) used.add(p.id); return p?.id || null; };
      const lineup = shape.map(pick); const bench = ['GK', 'CB', 'CM', 'ST', 'LW'].map(pick);
      st.update((s) => {
        s.club.formation = '4-3-3'; s.club.lineup = lineup; s.club.bench = bench;
        s.club.collection = [...new Set([...lineup, ...bench, ...s.club.collection])];
        s.club.apex = 184500; s.club.packs = ['prime', 'gold', 'gold', 'midfield', 'silver'];
      });
    } catch { /* an empty club is fine for a layout check */ }
    await go('menu'); log('menu');                                   // slot 2
    await at(3); await go('squad'); await until(() => document.querySelector('[data-utab="club"]'), 10000);
    document.querySelector('[data-utab="club"]')?.click(); log('squad');
    await at(4); document.querySelector('[data-utab="store"]')?.click(); log('store');
    await at(5); await go('today'); log('today');
    await at(6); await go('settings'); log('settings');
    await at(7);
    try {
      const { WORLD } = await import('/js/data/generator.js');
      const big = WORLD.clubs.slice().sort((a, b) => (b.stadium?.capacity || 0) - (a.stadium?.capacity || 0))[0] || WORLD.clubs[0];
      await go('play', { homeId: big.id, awayId: WORLD.clubs.find((c) => c.id !== big.id).id, duration: 900, skill: 1, mode: 'single', atmo: { time: 'night', weather: 'clear' } });
      log('match-start');
      // slots 8–12: the match (loading, kick-off, play); slot 13: the pause menu
      await at(13); document.getElementById('gmPause')?.click(); log('pause');
    } catch (e) { console.log(`APEX_TOUR note match failed ${e.message}`); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
}());
