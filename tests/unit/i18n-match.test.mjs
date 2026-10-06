/**
 * v163 — the match screen speaks Arabic too: every word the HUD shows during
 * a match has both languages, and the button names placed into a hint survive.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './_dom.mjs';

const { t } = await import('../../js/i18n.js');
const { update } = await import('../../js/state.js');
const setLang = (l) => update((st) => { st.settings.lang = l; });
const KEYS = ['match.goal', 'match.halfTime', 'match.halfNote', 'match.fullTime', 'match.ftSpectating', 'match.ended', 'match.oppLeft', 'match.advantage', 'match.replay',
  ...['corner', 'freekick', 'penalty', 'throwin'].flatMap((k) => [`sp.${k}`, `sp.${k}.how`]), 'sp.other',
  'hint.skill.touch', 'hint.skill.pad', 'hint.tactics', 'hint.lob', 'hint.shoot.touch', 'hint.shoot.pad', 'hint.deadball', 'hint.pause', 'hint.defend.touch', 'hint.defend.pad',
  'facts.possession', 'facts.shots', 'facts.onTarget', 'facts.xg', 'facts.bigChances', 'facts.corners', 'facts.fouls', 'facts.goals', 'facts.noGoals', 'pause.secondHalf', 'pause.select', 'pause.resumeShort'];

test('every match HUD word exists in English and Arabic', () => {
  setLang('en');
  const en = KEYS.map((k) => t(k));
  en.forEach((s, i) => assert.notEqual(s, KEYS[i], `${KEYS[i]} missing in English`));
  setLang('ar');
  KEYS.forEach((k, i) => {
    const s = t(k);
    assert.notEqual(s, en[i], `${k} not translated`);
    assert.match(s, /[؀-ۿ]/, `${k} has no Arabic`);
  });
  setLang('en');
});

test('a hint keeps the button it names, in both languages', () => {
  for (const l of ['en', 'ar']) {
    setLang(l);
    assert.ok(t('hint.shoot.pad', { shoot: '<kbd>$&</kbd>', curl: '<kbd>C</kbd>' }).includes('<kbd>$&</kbd>'), `${l}: replacement taken literally`);
    // the set-piece banner names the buttons by their pad label
    for (const k of ['corner', 'freekick', 'penalty', 'throwin']) assert.match(t(`sp.${k}.how`), /\b(SHOOT|CROSS|SHORT|THROW|LONG)\b/);
  }
  setLang('en');
});
