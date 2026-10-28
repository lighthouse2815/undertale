import assert from 'node:assert/strict';
import {itemAction,itemNames} from '../remake/src/inventory.mjs';
import text from '../remake/src/inventory.json' with {type:'json'};
export function testAstronautFood(){
  const w={inventory:[35],hp:2,maxHp:30,flags:{},sound:{play(){}},time:{delayedCall(_,fn){fn();}}};
  assert.deepEqual(itemNames(w,text),['Astronaut Food']);assert.deepEqual(itemNames(w,text,true),['AstroFood']);assert.match(itemAction(w,0,'info',text)[0],/21 HP/);assert.match(itemAction(w,0,'use',text)[0],/Astronaut Food/);assert.deepEqual([w.hp,w.inventory.length,w.flags[260]],[23,0,1]);
  console.log('✓ Astronaut Food: tên, mô tả, hồi 21 HP và tiêu thụ');
}
