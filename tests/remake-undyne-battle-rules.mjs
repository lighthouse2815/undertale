import assert from 'node:assert/strict';
import { UndyneBattleRules } from '../remake/src/undyne-battle-rules.mjs';

export function testUndyneBattleRules() {
  const rules = new UndyneBattleRules();
  assert.deepEqual(rules.prepareAttack({ green: true, command: 50 }), { kind: 'green', lesson: 1, rating: 16, firingRate: 15, order: 2 });
  rules.finishAttack({ kind: 'green', shieldHits: 0 }); assert.equal(rules.rating, 15);
  assert.equal(rules.challenge(), true); assert.deepEqual([rules.rating, rules.ratingb], [12, 1]);
  assert.deepEqual(rules.prepareAttack({ green: false, command: 50 }), { kind: 'follow', lesson: 2, rating: 12, firingRate: 17, order: 3 });
  assert.equal(rules.lesson, 2);
  assert.deepEqual(rules.prepareAttack({ green: false, command: 51 }), { kind: 'rising', lesson: 2, rating: 12, firingRate: 20, order: 4 });
  rules.lesson = 6; rules.finishAttack({ kind: 'green', shieldHits: 0 }); assert.equal(rules.rating, 10);
  rules.finishAttack({ kind: 'green', shieldHits: 2 }); assert.equal(rules.rating, 12);
  rules.berserk = true; rules.finishAttack({ kind: 'green', shieldHits: 1 }); assert.equal(rules.rating, 12);
  rules.rating = 7; rules.ratingb = 9; assert.equal(rules.plead(), true); assert.deepEqual([rules.rating, rules.ratingb], [9, 7]);
  rules.rating = 6; rules.ratingb = 6; assert.equal(rules.challenge(), false); assert.equal(rules.plead(), false);
  rules.ratingb = 9; assert.equal(rules.prepareAttack({ green: false, command: 0 }).firingRate, 10);
  const threshold = new UndyneBattleRules();
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 75, maxHp: 100 }), { damageCause: 0, flag99: 0, earlyReaction: 0, defense: null });
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 74, maxHp: 100 }), { damageCause: 1, flag99: 0, earlyReaction: 0, defense: null });
  assert.deepEqual([threshold.lesson, threshold.order], [6, 6]);
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 49, maxHp: 100 }), { damageCause: 2, flag99: 2, earlyReaction: 0, defense: null });
  assert.deepEqual(threshold.prepareDialogue({ green: true, hp: 19, maxHp: 100, flag99: 4 }), { damageCause: 3, flag99: 4, earlyReaction: 0, defense: null });
  assert.deepEqual([threshold.lesson, threshold.order, threshold.rating], [20, 22, 18]);
  const redThreshold = new UndyneBattleRules();
  assert.deepEqual(redThreshold.prepareDialogue({ green: false, hp: 1, maxHp: 100 }), { damageCause: 0, flag99: 0, earlyReaction: 0, defense: null });
  assert.deepEqual([redThreshold.lesson, redThreshold.order], [1, 1]);
  const skipped = new UndyneBattleRules();
  assert.equal(skipped.prepareDialogue({ green: true, hp: 1, maxHp: 100 }).damageCause, 3);
  assert.deepEqual([skipped.lesson, skipped.order, skipped.rating], [20, 22, 18]);
  const first = new UndyneBattleRules();
  assert.deepEqual(first.enter({ flag99: 0, flag98: 2, hp: 0 }), { flag99: 1, hp: 1400, emotion: 0, green: true });
  for (const [oldFlag, lesson, order, emotion, green] of [[1, 8, 9, 1, true], [2, 13, 15, 4, true], [3, 22, 22, 5, false], [5, 22, 22, 5, false]]) {
    const resumed = new UndyneBattleRules();
    assert.deepEqual(resumed.enter({ flag99: oldFlag, flag98: 0, hp: 850 }), { flag99: oldFlag + 1, hp: 850, emotion, green });
    assert.deepEqual([resumed.lesson, resumed.order], [lesson, order]);
  }
  for (const [hp, expected] of [[30, -15], [31, -25], [41, -35], [51, -50], [76, -70], [100, -90]]) {
    const defense = new UndyneBattleRules(); defense.lesson = 20;
    assert.equal(defense.prepareDialogue({ green: false, hp, maxHp: 100 }).defense, expected);
    assert.equal(defense.prepareDialogue({ green: false, hp: 1, maxHp: 100 }).defense, null);
  }
  const fatal = new UndyneBattleRules();
  assert.equal(fatal.startDeath(), true); assert.deepEqual([fatal.died, fatal.order, fatal.lesson], [true, -40, -40]);
  assert.equal(fatal.prepareDialogue({ green: true, hp: 0, maxHp: 100 }).damageCause, 0);
  assert.deepEqual(fatal.prepareAttack({ green: false, command: 0 }), { kind: 'follow', lesson: -40, rating: 16, firingRate: 18, order: -39 });
  assert.equal(fatal.startDeath(), false); assert.equal(fatal.order, -39);
  const colors = new UndyneBattleRules(); colors.lesson = 7;
  assert.equal(colors.finishAttack({ kind: 'green', shieldHits: 0, refuse: true }), false);
  assert.equal(colors.finishAttack({ kind: 'follow', shieldHits: 0, transition: null }), false);
  assert.equal(colors.finishAttack({ kind: 'rising', shieldHits: 0, transition: { lesson: 8, delay: 30 } }), true);
  assert.equal(colors.lesson, 8);
  const firstHits = new UndyneBattleRules();
  for (let i = 1; i <= 4; i++) {
    firstHits.prepareAttack({ green: true, command: 0 }); firstHits.finishAttack({ kind: 'green', shieldHits: 1 });
    assert.equal(firstHits.prepareDialogue({ green: true, hp: 100, maxHp: 100 }).earlyReaction, i);
    assert.deepEqual([firstHits.order, firstHits.lesson], i < 4 ? [1, 1] : [12, 11]);
  }
  assert.deepEqual([firstHits.rating, firstHits.berserk, firstHits.hitfirst], [6, true, 4]);
  console.log('✓ Undyne: thứ tự lượt, nhịp giáo và quy tắc Challenge/Plead');
}
