/*
 * v208: the simulator tour. Only in a www built with APEX_TOUR=1 (app/build-www.mjs) —
 * never in an App Store build. The app walks itself through its main screens and a
 * match, and logs `APEX_TOUR <stage> …` at each stop with the size it is drawn at and
 * the safe-area insets, so .github/workflows/ios-duo.yml can photograph each one in
 * Xcode's iPhone Duo simulator (folded and unfolded) and the log says what the web
 * view was given.
 */
(function () {
  const HOLD = 9000;          // ms at each stop: the workflow photographs ~3 s after the log line
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const until = async (fn, ms = 60000) => { const end = Date.now() + ms; while (Date.now() < end) { try { if (fn()) return true; } catch { /* not yet */ } await wait(200); } return false; };
  function insets() {
    const p = document.createElement('div');
    p.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
    document.body.appendChild(p);
    const cs = getComputedStyle(p);
    const out = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => parseFloat(v) || 0).join(',');
    p.remove();
    return out;
  }
  function overflow() {
    // anything drawn past the right or bottom edge of the screen, the usual sign of a layout that did not adapt
    const W = innerWidth; const H = innerHeight; const bad = [];
    for (const el of document.querySelectorAll('#screen *, .gm *')) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || el.closest('[hidden]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed') continue;
      if (r.right > W + 2 || r.left < -2) bad.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : ''}`);
      if (bad.length > 6) break;
    }
    return bad.join(' ') || 'none';
  }
  const stop = (name) => console.log(`APEX_TOUR ${name} vw=${innerWidth}x${innerHeight} dpr=${devicePixelRatio} sa=${insets()} off=${overflow()}`);
  const go = async (n, p) => { const app = await import('/js/app.js'); app.navigate(n, p); };

  async function run() {
    await until(() => document.getElementById('startBtn'));
    await wait(2500);
    stop('title'); await wait(HOLD);
    document.getElementById('startBtn').click();
    await until(() => document.querySelector('[data-go="squad"]'));
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
        s.flags = { ...(s.flags || {}), hintMatches: 9 };
      });
    } catch (e) { console.log(`APEX_TOUR note seed failed ${e.message}`); }
    await go('menu'); await wait(2500); stop('menu'); await wait(HOLD);
    await go('squad'); await until(() => document.querySelector('[data-utab="club"]'));
    document.querySelector('[data-utab="club"]').click(); await wait(2500); stop('squad'); await wait(HOLD);
    document.querySelector('[data-utab="store"]')?.click(); await wait(2500); stop('store'); await wait(HOLD);
    await go('today'); await wait(2500); stop('today'); await wait(HOLD);
    await go('career'); await wait(2500); stop('career'); await wait(HOLD);
    await go('settings'); await wait(2500); stop('settings'); await wait(HOLD);
    try {
      const { WORLD } = await import('/js/data/generator.js');
      const big = WORLD.clubs.slice().sort((a, b) => (b.stadium?.capacity || 0) - (a.stadium?.capacity || 0))[0] || WORLD.clubs[0];
      await go('play', { homeId: big.id, awayId: WORLD.clubs.find((c) => c.id !== big.id).id, duration: 900, skill: 1, mode: 'single', atmo: { time: 'night', weather: 'clear' } });
      await until(() => document.getElementById('gmLoad')?.hidden && window.__apexMatch?.phase === 'play', 240000);
      await wait(9000);
      stop('match'); await wait(HOLD);
      document.getElementById('gmPause')?.click(); await wait(2000); stop('pause'); await wait(HOLD);
    } catch (e) { console.log(`APEX_TOUR note match failed ${e.message}`); }
    stop('done');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
}());
