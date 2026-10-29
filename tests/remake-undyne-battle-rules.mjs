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
  const threshold = new UndyneBattleRules();
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 75, maxHp: 100 }), { damageCause: 0, flag99: 0, earlyReaction: 0 });
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 74, maxHp: 100 }), { damageCause: 1, flag99: 0, earlyReaction: 0 });
  assert.deepEqual([threshold.lesson, threshold.order], [6, 6]);
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 49, maxHp: 100 }), { damageCause: 2, flag99: 2, earlyReaction: 0 });
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 19, maxHp: 100, flag99: 4 }), { damageCause: 3, flag99: 4, earlyReaction: 0 });
  assert.deepEqual([threshold.lesson, threshold.order, threshold.rating], [20, 22, 18]);
  const redThreshold = new UndyneBattleRules();
  assert.deepEqual(redThreshold.prepareDialogue({ green: false, hp: 1, maxHp: 100 }), { damageCause: 0, flag99: 0, earlyReaction: 0 });
  assert.deepEqual([redThreshold.lesson, redThreshold.order], [1, 1]);
  const skipped = new UndyneBattleRules();
  assert.equal(skipped.prepareDialogue({ green: true, hp: 1, maxHp: 100 }).damageCause, 3);
  assert.deepEqual([skipped.lesson, skipped.order, skipped.rating], [20, 22, 18]);
  const firstHits = new UndyneBattleRules();
  for (let i = 1; i <= 4; i++) {
    firstHits.prepareAttack({ green: true, command: 0 }); firstHits.finishAttack(1);
    assert.equal(firstHits.prepareDialogue({ green: true, hp: 100, maxHp: 100 }).earlyReaction, i);
    assert.deepEqual([firstHits.order, firstHits.lesson], i < 4 ? [1, 1] : [12, 11]);
  }
  assert.deepEqual([firstHits.rating, firstHits.berserk, firstHits.hitfirst], [6, true, 4]);
  console.log('✓ Undyne: thứ tự lượt, nhịp giáo và quy tắc Challenge/Plead');
}
