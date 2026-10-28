import assert from 'node:assert/strict';
import { itemAction, itemNames } from '../remake/src/inventory.mjs';
import data from '../remake/src/inventory.json' with { type: 'json' };

export async function testOldTutu() {
  const sounds=[], world={inventory:[24],armor:12,armorDefense:3,sound:{play:(key)=>sounds.push(key)}};
  assert.deepEqual(itemNames(world,data),['Old Tutu']);assert.match(itemAction(world,0,'info',data)[0],/DF 10/);
  assert.deepEqual(itemAction(world,0,'use',data),['* You equipped the Old Tutu.']);
  assert.deepEqual([world.armor,world.armorDefense,world.inventory[0],sounds], [24,10,12,['snd_item']]);
  itemAction(world,0,'use',data);assert.deepEqual([world.armor,world.armorDefense,world.inventory[0]],[12,3,24]);
  console.log('✓ Old Tutu: INFO, trang bị/đổi lại, phòng thủ và âm thanh');
}
