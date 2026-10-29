import assert from 'node:assert/strict';
import { UndyneBattleRules } from '../remake/src/undyne-battle-rules.mjs';

export function testUndyneBattleRules() {
  const rules = new UndyneBattleRules();
  assert.deepEqual(rules.prepareAttack({ green: true, command: 50 }), { kind: 'green', lesson: 1, rating: 16, firingRate: 15, order: 2 });
  rules.finishAttack(0); assert.equal(rules.rating, 15);
  assert.equal(rules.challenge(), true); assert.deepEqual([rules.rating, rules.ratingb], [12, 1]);
  assert.deepEqual(rules.prepareAttack({ green: false, command: 50 }), { kind: 'follow', lesson: 2, rating: 12, firingRate: 17, order: 3 });
  assert.equal(rules.lesson, 2);
  assert.deepEqual(rules.prepareAttack({ green: false, command: 51 }), { kind: 'rising', lesson: 2, rating: 12, firingRate: 20, order: 4 });
  rules.lesson = 6; rules.finishAttack(0); assert.equal(rules.rating, 10);
  rules.finishAttack(2); assert.equal(rules.rating, 12);
  rules.berserk = true; rules.finishAttack(1); assert.equal(rules.rating, 12);
  rules.rating = 7; rules.ratingb = 9; assert.equal(rules.plead(), true); assert.deepEqual([rules.rating, rules.ratingb], [9, 7]);
  rules.rating = 6; rules.ratingb = 6; assert.equal(rules.challenge(), false); assert.equal(rules.plead(), false);
  rules.ratingb = 9; assert.equal(rules.prepareAttack({ green: false, command: 0 }).firingRate, 10);
  console.log('✓ Undyne: thứ tự lượt, nhịp giáo và quy tắc Challenge/Plead');
}
