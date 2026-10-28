import assert from 'node:assert/strict';
import {itemAction} from '../remake/src/inventory.mjs';
import text from '../remake/src/inventory.json' with {type:'json'};
export function testDogResidue() {
  const sounds=[],world={inventory:[29,1],hp:1,maxHp:20,flags:{},sound:{play:key=>sounds.push(key)},time:{delayedCall:(_,fn)=>fn()}};
  const random=Math.random;
  try {Math.random=()=>0;assert.match(itemAction(world,0,'info',text)[0],/Shiny/);assert.match(itemAction(world,0,'use',text)[1],/filled up/);assert.deepEqual(world.inventory,[1,28,28,28,28,28,28,28]);assert.deepEqual(sounds,['snd_item','snd_dogresidue']);
    const lines=itemAction(world,1,'use',text);assert.match(lines[0],/yappy/);assert.equal(world.hp,20);assert.equal(world.inventory.length,7);
    world.inventory=Array(8).fill(30);Math.random=()=>.5;assert.match(itemAction(world,0,'use',text)[1],/\.\.\./);assert.equal(world.inventory.length,8);assert.ok(world.inventory.every(x=>x>=29&&x<=34));
  } finally {Math.random=random;}
  console.log('✓ Dog Residue và Dog Salad: sinh vật phẩm, hồi HP và túi đầy');
}
