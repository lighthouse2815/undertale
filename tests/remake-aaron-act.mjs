import assert from 'node:assert/strict';
import { aaronAct, aaronStatus } from '../remake/src/aaron-act.mjs';
export async function testAaronAct() {
  const s={heard:-1,flex:0,attack:130,monsterAttack:24,mercyModifier:5}, flags={};
  assert.equal(aaronAct(s,'check',flags).pages.length,2);assert.equal(s.heard,9);
  assert.equal(aaronAct(s,'shoo',flags).leaves,false);assert.equal(s.mercyModifier,-10);
  assert.match(aaronAct(s,'flex',flags).pages[0],/twice/);assert.match(aaronAct(s,'flex',flags).pages[0],/thrice/);
  const last=aaronAct(s,'flex',flags);assert.equal(last.leaves,true);assert.match(last.pages[1],/out of/);assert.deepEqual([s.flex,s.attack,s.monsterAttack,s.mercyModifier,flags[143]],[3,160,27,400,1]);
  assert.equal(aaronAct(s,'shoo',{95:1}).leaves,true);assert.equal(s.mercyModifier,222);
  assert.match(aaronStatus(0,{95:1},0,100),/fearful/);assert.match(aaronStatus(25,{95:1},0,100),/sweating/);assert.match(aaronStatus(90,{},1,100),/next flex/);assert.match(aaronStatus(90,{},1,29),/droop/);
  console.log('✓ Aaron: Check/Shoo/Flex, tăng ATK, rời trận và ưu tiên lời trạng thái');
}
