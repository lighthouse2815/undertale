import assert from 'node:assert/strict';
import { woshuaAttack, woshuaCleanHit } from '../remake/src/woshua-attack.mjs';

export async function testWoshuaAttack() {
  const state = { clean: 0, dirtyJoke: 0, monsterAttack: 7 };
  assert.deepEqual(woshuaAttack(state, 49, 1), { kind: 'spiral', duration: 150, rate: 3, cleaner: false, damage: 7 });
  assert.deepEqual(woshuaAttack(state, 50, 2), { kind: 'soap', duration: 160, rate: 4, speed: 4, offset: true, damage: 7 });
  state.clean = 1; state.dirtyJoke = 4; state.monsterAttack = 3;
  assert.deepEqual(woshuaAttack(state, 90, 3), { kind: 'spiral', duration: 180, rate: 13, cleaner: true, damage: 3 });
  assert.deepEqual([state.clean, state.dirtyJoke], [0, 2]);
  const player = { hp: 8, maxHp: 9 }; woshuaCleanHit(state, player);
  assert.deepEqual([player.hp, state.clean, state.mercyModifier], [9, 2, 200]);
  woshuaCleanHit(state, player); assert.equal(player.hp, 9);
  state.clean = 3; assert.equal(woshuaAttack(state, 99, 1).cleaner, true); assert.equal(state.clean, 2);
  assert.equal(woshuaAttack(state, 99, 1).speed, 3);
  console.log('✓ Woshua: chọn đợt, nhịp theo số quái, Clean và hồi máu');
}
