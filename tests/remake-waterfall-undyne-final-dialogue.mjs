import assert from 'node:assert/strict';
import { undyneFinalLines, undyneFinalSpeech, undyneFinalEncounterLines } from '../remake/src/waterfall-undyne-final-dialogue.mjs';

export function testWaterfallUndyneFinalDialogue() {
  const clean = undyneFinalSpeech({ flags: {} });
  assert.equal(undyneFinalSpeech({ flags: { 98: 3 } }).speech[6], 331);
  assert.equal(clean.intro.length, 9); assert.equal(clean.speech.length, 20); assert.equal(clean.speech[6], 332);
  assert.deepEqual(undyneFinalSpeech({ kills: 1, flags: { 4: 1, 98: 1 }, undyneKilledBefore: true }).speech.slice(6, 9), [331,351,352]);
  const killed = undyneFinalSpeech({ kills: 2, flags: { 81: 1, 57: 2, 52: 1, 53: 1, 54: 1, 55: 1 } });
  assert.equal(killed.speech.length, 23); assert.deepEqual(killed.speech.slice(11, 13), [425,426]);
  assert.deepEqual(undyneFinalSpeech({ kills: 2, flags: { 81: 1, 57: 2 } }).speech.slice(11, 13), [392,393]);
  const papyrus = undyneFinalSpeech({ flags: { 67: 1 } });
  assert.deepEqual(papyrus.bridge, [[468,469]]); assert.equal(papyrus.speech.length, 20);
  for (const ids of [clean.intro, clean.speech, ...clean.bridge, killed.speech, papyrus.speech, ...papyrus.bridge]) assert.ok(undyneFinalLines(ids).every(line => typeof line === 'string'));
  assert.equal(undyneFinalEncounterLines(false).length, 2); assert.equal(undyneFinalEncounterLines(true).length, 1);
  console.log('✓ Cảnh Undyne: nhánh thoại theo kết quả Waterfall và Papyrus');
}
