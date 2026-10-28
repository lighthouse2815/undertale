import assert from 'node:assert/strict';
import { itemAction, itemNames } from '../remake/src/inventory.mjs';
import data from '../remake/src/inventory.json' with { type: 'json' };
export async function testAbandonedQuiche() {
  const sounds=[],world={inventory:[23],hp:10,maxHp:50,flags:{},sound:{play:key=>sounds.push(key)},time:{delayedCall:(_ms,fn)=>fn()}};
  assert.deepEqual(itemNames(world,data),['Abandoned Quiche']);assert.match(itemAction(world,0,'info',data)[0],/34 HP/);
  assert.match(itemAction(world,0,'use',data)[0],/34 HP/);assert.deepEqual([world.hp,world.inventory,world.flags[260],sounds],[44,[],1,['snd_swallow','snd_power']]);
  console.log('✓ Abandoned Quiche: tên, INFO, hồi 34 HP và tiêu hao');
}
