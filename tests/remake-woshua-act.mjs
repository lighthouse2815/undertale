import assert from 'node:assert/strict';
import { woshuaAct, woshuaStatus } from '../remake/src/woshua-act.mjs';

export async function testWoshuaAct() {
  const state = { heard: -1, slime: 0, clean: 0, mercyModifier: 5, dirtyJoke: 0, monsterAttack: 7 };
  assert.match(woshuaAct(state, 'check').pages[0], /ATK 18 DEF 5/); assert.equal(state.heard, 9);
  assert.match(woshuaAct(state, 'touch').pages[0], /recoils/);
  assert.match(woshuaAct(state, 'clean').pages[0], /hops/); assert.equal(state.clean, 1);
  state.clean = 2; assert.match(woshuaAct(state, 'touch').pages[0], /friendly/);
  assert.match(woshuaAct(state, 'clean').pages[0], /continues/); assert.equal(state.clean, 3);
  state.slime = 1; assert.equal(woshuaAct(state, 'touch').leaves, true); assert.equal(state.mercyModifier, 333);
  const aaron = {}; assert.match(woshuaAct(state, 'joke', { aaron, joke: 1 }).pages[0], /pie/);
  assert.deepEqual(aaron, { heard: 12, mercyModifier: 450 }); assert.equal(state.monsterAttack, 5);
  woshuaAct(state, 'joke'); woshuaAct(state, 'joke'); assert.equal(state.monsterAttack, 3); assert.equal(state.dirtyJoke, 3);
  assert.match(woshuaStatus(0, 30), /tears/); assert.match(woshuaStatus(25, 30), /bird/);
  assert.match(woshuaStatus(50, 30), /pizza/); assert.match(woshuaStatus(75, 30), /fun/);
  assert.match(woshuaStatus(90, 30), /detergent/); assert.match(woshuaStatus(90, 29), /wounds/);
  console.log('✓ Woshua: Check/Touch/Clean/Joke, phối hợp Aaron và trạng thái');
}
