import assert from 'node:assert/strict';
import {shyrenAct,shyrenStatus} from '../remake/src/shyren-act.mjs';
export function testShyrenAct() {
  const state={encourage:0,creep:0};
  assert.match(shyrenAct(state,'check')[0],/Tone deaf/);
  assert.equal(shyrenAct(state,'smile').length,2);assert.match(shyrenAct(state,'smile')[0],/keep smiling/);
  assert.match(shyrenAct(state,'conduct')[0],/electric/);
  assert.match(shyrenAct(state,'hum',()=>0)[0],/hum/);assert.deepEqual([state.encourage,state.defense,state.mercyModifier],[1,-150,140]);
  assert.match(shyrenAct(state,'check')[0],/talented/);assert.equal(shyrenAct(state,'hum').length,2);
  assert.match(shyrenAct(state,'smile')[0],/darling/);assert.match(shyrenAct(state,'conduct')[0],/crowd/);
  assert.equal(shyrenAct(state,'hum').length,1);assert.equal(shyrenAct(state,'hum').length,2);assert.equal(shyrenAct(state,'hum').length,3);assert.equal(state.encourage,5);
  assert.match(shyrenStatus(90,{},0,66),/music/);assert.match(shyrenStatus(0,{},0,29),/raspy/);assert.match(shyrenStatus(0,{},2,66),/Sans/);assert.match(shyrenStatus(0,{67:1},2,66),/hooded/);assert.equal(shyrenStatus(0,{},5,66),' ');
  console.log('✓ ACT Shyren: Check, Hum, Smile, Conduct và trạng thái');
}
