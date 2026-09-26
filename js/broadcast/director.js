/**
 * The broadcast director (v83): one object the play screen talks to, which
 * runs the commentary desk, the graphics package, the momentum reading, the
 * heat maps and the broadcast clock off the match as it is played.
 *
 *   cue(name, arg)   every sim cue, as the play screen drains them
 *   line(key, ctx)   a play-by-play line the play screen chose (its feed)
 *   tick(dt, live)   once a frame; `live` = the match clock is running
 *   clock()          the scoreboard's label, stoppage time included
 *   goal(ctx)        a goal went in (after the sim's goal cue)
 *   kickoff(ctx)     the first whistle: derby, final, weather, a man in form
 *   halfTimeHTML()   the half-time heat maps (then drawHeat(root))
 *   fullTime(ctx)    the whistle: context keys, the player of the match line
 *
 * It reads the match and never writes to it: the sweep cannot tell it exists.
 */
import { createGraphics, createHeat, createMomentum } from './graphics.js';
import { createDesk, banks, lineFrom, packLine } from './voice.js';
import { PACK_US, VOICE_PACKS } from '../data/voicePackUS.js';
import { derbyOf, weatherKey, formOf, goalKeys, fullTimeKeys, addedMinutes, broadcastMinute, clockLabel, offsideMargin, BOARD_AT } from './context.js';

const CO_CHANCE = { goal: 0.9, save: 0.55, post: 0.7, bigChance: 0.7, card: 0.55, penaltyAwarded: 0.8, offside: 0.3, foul: 0.2, skill: 0.35, counter: 0.35, sub: 0.4, shotWide: 0.25, header: 0.2, volley: 0.5, bicycle: 0.9, ownGoal: 0.9, comeback: 0.6, lead: 0.5, extend: 0.5, halftime: 0.8, fulltime: 0.9, kickoff: 0.6 };

export function createDirector({ match, host, pitch, clubs, settings = {}, lang = 'en', rtl = false, graphics = true, clock = true, final = false, form = new Map(), venue = '', atmo = {} }) {
  const gfx = graphics ? createGraphics(host, { reduceMotion: !!settings.reduceMotion, rtl }) : null;
  const subEl = gfx ? gfx.subtitleEl : null;
  // v121: a recorded pack unless the player chose the device's own voice (or the language has none)
  const pack = lang === 'en' && settings.commPack !== 'device' ? VOICE_PACKS[settings.commPack || 'us'] || PACK_US : null;
  const desk = createDesk({ lang, voice: settings.commVoice !== false && settings.sound !== false, subtitles: settings.subtitles !== false, el: subEl, pack });
  if (pack) desk.warm(['pbp-goal-0', 'pbp-goal-1', 'pbp-goal-2', 'pbp-kickoff-0', 'pbp-save-0', 'pbp-shot-0', 'co-goal-0'].map((f) => `${f}.mp3`));
  const bank = banks(lang);
  const heat = createHeat();
  const mom = createMomentum();
  // v119: a real rivalry (data/rivalries.js) first; the generated world's own pairs otherwise
  const derby = match.rivalry || derbyOf(match.teams[0].club, match.teams[1].club, clubs);
  const trail = [0, 0];
  const pending = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { pending.delete(id); fn(); }, ms); pending.add(id); };

  // the stoppage board, per half
  const halfLog = { 1: { goals: 0, cards: 0, subs: 0, inj: 0, stop0: 0 }, 2: { goals: 0, cards: 0, subs: 0, inj: 0, stop0: 0 } };
  const added = { 1: 0, 2: 0 };
  // subs: who stands in each slot
  const slots = match.teams.map((t) => t.players.map((p) => p.ref?.id));
  let prevPhase = match.phase; let strapArmed = false; let strapCool = 0; let momT = 0; let lastStatMin = 0; let statIdx = 0; let subT = 0;

  // every placeholder has a sensible default, so no line ever reads "the shape of will tell us"
  const ctxBase = () => ({
    venue, derby: derby || '', weather: atmo.weather || 'clear', score: `${match.teams[0].score}–${match.teams[1].score}`, minute: match.minute(),
    team: match.teams[0].name, opp: match.teams[1].name, player: 'him', goals: 1, dist: 20, poss: match.possession?.()[0] ?? 50,
    keeper: match.teams[1].players.find((p) => p.role === 'GK')?.ref.name || 'the keeper',
  });
  const say = (speaker, text, prio, file) => { if (text) desk.say(speaker, text, prio, file); };
  const co = (key, ctx, delay = 1800) => {
    if (Math.random() > (CO_CHANCE[key] ?? 0.15)) return;
    if (pack) { const l = packLine(pack, 'co', key, 'co'); if (l) later(() => say('co', l.text, 1, l.file), delay); return; }
    const text = lineFrom(bank.co, key, { ...ctxBase(), ...ctx }, 'co');
    if (text) later(() => say('co', text), delay);
  };
  const context = (key, ctx, speaker = 'co', delay = 2600) => {
    if (pack) { const l = packLine(pack, 'context', key, speaker); if (l) later(() => say(speaker, l.text, 1, l.file), delay); return !!l; }
    const text = lineFrom(bank.context, key, { ...ctxBase(), ...ctx }, 'cx');
    if (text) later(() => say(speaker, text), delay);
    return !!text;
  };

  function frac() {
    const hl = match.duration / 2;
    return match.half === 2 ? Math.max(0, (match.t - hl) / hl) : Math.min(1, match.t / hl);
  }

  return {
    derby, desk, gfx, heat, mom,
    /** The play screen's own feed line, spoken by the play-by-play voice. */
    line(key, ctx = {}, fallback = '') {
      const prio = key === 'goal' || key === 'ownGoal' ? 2 : 1;
      if (pack) {
        // the feed keeps its own line with the name in it; the voice says the pack's
        const l = packLine(pack, 'pbp', key, 'pbp');
        if (l) say('pbp', l.text, prio, l.file);
        if (key !== 'goal' && key !== 'ownGoal') co(key, ctx);
        return fallback;
      }
      const text = lang === 'ar' ? lineFrom(bank.pbp, key, { ...ctxBase(), ...ctx }, 'pbp') : fallback;
      say('pbp', text, prio);
      if (key !== 'goal' && key !== 'ownGoal') co(key, ctx);
      return text;
    },

    cue(name, arg) {
      const teamOf = (a) => (a && typeof a === 'object' ? (a.team ?? a.ref?.team ?? null) : (a === 0 || a === 1 ? a : null));
      const t = teamOf(arg);
      if (name === 'shot' && t !== null) mom.event(t, 0.18);
      else if (name === 'bigChance' && t !== null) mom.event(t, 0.3);
      else if (name === 'cornerKick' && t !== null) mom.event(t, 0.1);
      else if (name === 'save' && match.ball?.shotBy) mom.event(match.ball.shotBy.team, 0.12);
      else if (name === 'card' && arg?.ref) {
        halfLog[match.half].cards += 1;
        gfx?.card('yellow', arg.ref.name, match.teams[arg.team]);
      } else if (name === 'injury') halfLog[match.half].inj += 1;
      else if (name === 'offside' && arg?.ref && gfx) {
        const team = match.teams[arg.team];
        const m = offsideMargin(arg, match.teams[1 - arg.team].players, team.dir);
        if (Math.abs(m) < 0.9) {
          gfx.review('offside', { margin: m, verdict: 'Offside — the flag stands', dir: team.dir });
          context('review', {}, 'pbp', 300);
          context('reviewStands', {}, 'co', 2400);
        }
      } else if (name === 'penaltyAwarded' && gfx && Math.random() < 0.35) {
        gfx.review('penalty', { verdict: 'Penalty — the decision stands' });
        context('review', {}, 'pbp', 400);
      }
    },

    goal({ team, scorerId, scorerName, own = false }) {
      halfLog[match.half].goals += 1;
      mom.event(team, 0.6);
      const score = [match.teams[0].score, match.teams[1].score];
      // a deficit only grows when the other side scores, so checking after every goal sees the worst of it
      trail[0] = Math.max(trail[0], score[1] - score[0]);
      trail[1] = Math.max(trail[1], score[0] - score[1]);
      const goals = own ? 0 : match.teams[team].scorers.filter((s) => s.id === scorerId && !s.own).length;
      const keys = goalKeys({ scorerGoals: goals, minute: match.minute(), score, team, derby, own });
      const ctx = { player: scorerName, team: match.teams[team].name, goals };
      co(own ? 'ownGoal' : 'goal', ctx, 2200);
      if (keys.length) context(keys[0], ctx, 'pbp', 3600);
    },

    kickoff() {
      const ctx = {};
      if (final) context('final', ctx, 'pbp', 900);
      else if (derby) context('derby', ctx, 'pbp', 900);
      else context(weatherKey(atmo), ctx, 'pbp', 900);
      const hot = match.teams.flatMap((t) => t.players.slice(0, 11)).find((p) => formOf(form, p.ref) === 'hot');
      if (hot) context('formHot', { player: hot.ref.short || hot.ref.name }, 'co', 3200);
      else co('kickoff', ctx, 3200);
    },

    tick(dt, live) {
      if (!live) { prevPhase = match.phase; return; }
      if (match.phase === 'play') heat.sample(match, dt, pitch);
      const v = mom.step(match, dt, pitch);
      momT += dt;
      if (gfx && momT > 0.25) { momT = 0; gfx.momentum(v, match.teams.map((tm) => tm.colors?.[0])); }
      // substitutions, whoever made them
      subT += dt;
      if (subT > 0.5) {
        subT = 0;
        match.teams.forEach((tm, ti) => tm.players.forEach((p, i) => {
          const id = p.ref?.id;
          if (slots[ti][i] && id && id !== slots[ti][i]) {
            const offRef = (tm.bench || []).find((r) => r?.id === slots[ti][i]);
            halfLog[match.half].subs += 1;
            gfx?.subs(tm, offRef?.name || '—', p.ref.name);
            co('sub', { team: tm.name });
          }
          slots[ti][i] = id;
        }));
      }
      // the name strap: the first man on the ball after a restart
      strapCool -= dt;
      if (prevPhase !== 'play' && match.phase === 'play' && prevPhase !== 'goal') strapArmed = true;
      if (strapArmed && strapCool <= 0 && match.ball?.owner && gfx) {
        const p = match.ball.owner; const st = match.pst?.[p.ref.id];
        const bits = [];
        const goals = match.teams[p.team].scorers.filter((s) => s.id === p.ref.id && !s.own).length;
        if (goals) bits.push(`${goals} goal${goals > 1 ? 's' : ''}`);
        if (st?.shots) bits.push(`${st.shots} shot${st.shots > 1 ? 's' : ''}`);
        if (st?.passes) bits.push(`${st.passes} passes`);
        if (st?.tackles) bits.push(`${st.tackles} tackles won`);
        gfx.strap(p, match.teams[p.team], bits.slice(0, 2).join(' · '));
        strapArmed = false; strapCool = 25;
      }
      prevPhase = match.phase;
      // stat pop-ups at the quarter hours
      const min = match.minute();
      if (gfx && min >= lastStatMin + 15 && min % 15 < 3 && min < 88 && match.phase === 'play') {
        lastStatMin = min - (min % 15);
        const [ph, pa] = match.possession();
        const km = (side) => Object.values(match.pst || {}).filter((s) => s.team === side).reduce((n, s) => n + (s.dist || 0), 0) / 1000;
        const pops = [() => gfx.stat('Possession', ph, pa, '%'), () => gfx.stat('Shots', match.teams[0].shots, match.teams[1].shots),
          () => gfx.stat('Distance run (km)', km(0).toFixed(1), km(1).toFixed(1))];
        pops[statIdx++ % pops.length]();
      }
      // the board goes up
      if (clock) {
        const f = frac(); const h = match.half;
        if (!added[h] && f >= BOARD_AT) {
          const lg = halfLog[h];
          added[h] = addedMinutes({ goals: lg.goals, cards: lg.cards, subs: lg.subs, injuries: lg.inj, stoppages: (match.stoppages || 0) - lg.stop0 });
          if (h === 1) halfLog[2].stop0 = match.stoppages || 0;
          gfx?.stoppage(added[h]);
          context('stoppage', { dist: added[h] }, 'pbp', 600);
        }
      }
    },

    /** The scoreboard's clock, "45+2'" style. */
    clock() {
      if (!clock) return `${match.minute()}'`;
      return clockLabel(broadcastMinute(match.half, frac(), added[match.half]));
    },
    added: () => ({ ...added }),

    halfTime() {
      co('halftime', {}, 1200);
      if (match.teams[0].score + match.teams[1].score === 0) context('goallessHT', {}, 'co', 4200);
    },
    halfTimeHTML() {
      const tm = match.teams;
      return `<div class="bc-heat"><span class="pm-k">Heat maps · first half</span><div class="bc-heat-row">
        <figure><canvas width="240" height="156" data-heat="0"></canvas><figcaption>${tm[0].short}</figcaption></figure>
        <figure><canvas width="240" height="156" data-heat="1"></canvas><figcaption>${tm[1].short}</figcaption></figure></div></div>`;
    },
    drawHeat(root) {
      root.querySelectorAll('canvas[data-heat]').forEach((c) => {
        const ti = Number(c.dataset.heat);
        heat.draw(c, ti, ti === 0 ? '#3fd08a' : '#ff6a4a');
      });
    },

    fullTime({ potm = null, ratings = [70, 70] } = {}) {
      const score = [match.teams[0].score, match.teams[1].score];
      const keys = fullTimeKeys({ score, trail, ratings, final });
      const w = score[0] >= score[1] ? 0 : 1;
      co('fulltime', { team: match.teams[w].name }, 1400);
      if (keys.length) context(keys[0], { team: match.teams[w].name, keeper: match.teams[w].players.find((p) => p.role === 'GK')?.ref.name || 'the keeper' }, 'pbp', 3400);
      if (potm) context('potm', { player: potm.name }, 'co', 6200);
      gfx?.hideMomentum();
      return keys;
    },
    trail: () => trail.slice(),
    wipe(mid) { if (gfx) gfx.wipe(mid); else mid?.(); },
    destroy() { for (const id of pending) clearTimeout(id); pending.clear(); desk.destroy(); gfx?.destroy(); },
  };
}
