/**
 * The pack ritual, watch sized.
 *
 * The phone's version is a stage: plinths, clues, a walkout. None of that fits
 * here, and none of it is what makes a pack good. What makes it good is the
 * beat before it opens and the jolt when it lands — so this keeps exactly
 * that: a sealed packet breathing in the colour of the best card inside, one
 * tap to tear it, a white flash, and the card punched onto the screen with a
 * tap of the Taptic engine. Worst card first, best last, same as the phone,
 * so the run always climbs.
 */
export function openPackScreen(app, pack, drawn, opts) {
  const { rarity, dupValue, onDone } = opts;
  const order = drawn
    .map((d, i) => ({ d, i }))
    .sort((a, b) => (a.d.p.overall - b.d.p.overall) || (a.i - b.i))
    .map((o) => o.d);
  const best = order[order.length - 1].p;
  const colour = (r) => rarity[r]?.color || '#c9a227';

  app.innerHTML = `
    <div class="w-screen">
      <div class="w-pack">
        <p class="w-title">${pack.name}</p>
        <div class="w-packet" id="wPacket" style="--rar:${colour(best.rarity)}">UXI</div>
        <p class="w-sub">Tap to rip · ${order.length} card${order.length > 1 ? 's' : ''}</p>
      </div>
    </div>`;

  const packet = app.querySelector('#wPacket');
  let i = 0;
  let coins = 0;

  const flash = () => {
    const f = document.createElement('div');
    f.className = 'w-flash';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 420);
  };

  const showNext = () => {
    if (i >= order.length) { onDone(order.length, coins); return; }
    const { p, dup } = order[i];
    if (dup) coins += dupValue(p);
    // the jolt scales with what turned up: a bronze is a tick, an icon is a run
    const big = p.rarity === 'icon' || p.rarity === 'star' || p.rarity === 'special';
    navigator.vibrate?.(big ? [18, 50, 26, 50, 34] : 12);
    if (big) flash();
    app.querySelector('.w-pack').innerHTML = `
      <p class="w-title">${i + 1} of ${order.length}</p>
      <div class="w-card-out" style="--rar:${colour(p.rarity)}">
        <div class="ov">${p.overall}</div>
        <div class="po">${p.position}</div>
        <div class="nm">${p.short}</div>
        ${dup ? `<div class="w-count">already yours · ◈${dupValue(p)}</div>` : ''}
      </div>
      <button class="w-btn" id="wNext">${i === order.length - 1 ? 'Done' : 'Next'}</button>`;
    app.querySelector('#wNext').addEventListener('click', () => { i += 1; showNext(); });
  };

  packet.addEventListener('click', () => {
    navigator.vibrate?.(20);
    packet.classList.add('rip');
    setTimeout(() => { flash(); showNext(); }, 480);
  }, { once: true });
}
