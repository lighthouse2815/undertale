import assert from 'node:assert/strict';
import { moldsmalAct, moldsmalStatus } from '../remake/src/moldsmal-act.mjs';
export async function testMoldsmalAct() {
  const state = { heard: -1, monsterAttack: 6, mercyModifier: 99 }, flags = {};
  assert.match(moldsmalAct(state, 'check', flags), /ATK 6/); assert.equal(state.heard, 0);
  state.monsterAttack = 7; assert.match(moldsmalAct(state, 'check', flags), /ATK 12/);
  assert.match(moldsmalAct(state, 'imitate', flags), /lie immobile/); assert.deepEqual([state.heard, state.mercyModifier, flags[132]], [3, 101, 1]);
  assert.match(moldsmalAct(state, 'flirt', flags), /wiggle/); assert.equal(state.heard, 1);
  assert.match(moldsmalStatus(0, 15), /burbles/); assert.match(moldsmalStatus(30, 15), /pensively/);
  assert.match(moldsmalStatus(70, 15), /ruminating/); assert.match(moldsmalStatus(90, 15), /gelatin/); assert.match(moldsmalStatus(90, 14), /spoil/);
  console.log('✓ Moldsmal: Check/Imitate/Flirt, cờ và trạng thái');
}
