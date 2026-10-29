import assert from 'node:assert/strict';
import { undyneBattleSpeech } from '../remake/src/undyne-battle-dialogue.mjs';

export function testUndyneBattleDialogue() {
  const select = (order, extra = {}) => undyneBattleSpeech({ order, command: 50, ...extra });
  assert.deepEqual(select(1).ids, [427,428,429]);
  assert.deepEqual(select(1, { earlyReaction: 1 }).ids, [481,482,483]);
  assert.deepEqual(select(12, { earlyReaction: 4 }).ids, [442,443,444,445,446,447,448,449]);
  assert.deepEqual(select(7, { mercied: 1 }).ids, [519,520]);
  assert.deepEqual(select(9, { flag99: 2 }).ids, [563]);
  assert.deepEqual(select(12, { hitfirst: 4 }).ids, [406]);
  assert.deepEqual(select(22, { damageCause: 3 }).ids, [639]);
  assert.deepEqual(select(-39).ids, [686,687]);
  assert.deepEqual(select(30).ids, [672]);
  assert.equal(select(6).uncancellable, true); assert.equal(select(3).uncancellable, false);
  for (let order = -40; order <= 30; order++) assert.ok(select(order).lines.every(line => typeof line === 'string'));
  console.log('✓ Undyne: chọn hội thoại theo lượt và nhánh trận');
}
