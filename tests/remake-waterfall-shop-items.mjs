import assert from 'node:assert/strict';
import {itemAction,itemNames} from '../remake/src/inventory.mjs';
import data from '../remake/src/inventory.json' with {type:'json'};

export async function testWaterfallShopItems(page){
  const sounds=[],world={inventory:[37,41,44,45],hp:1,maxHp:30,flags:{},armor:4,armorDefense:0,weapon:3,weaponStrength:0,sound:{play:s=>sounds.push(s)},time:{delayedCall:(_,fn)=>fn()}};
  assert.deepEqual(itemNames(world,data),['Crab Apple','Sea Tea','Cloudy Glasses','Torn Notebook']);assert.match(itemAction(world,0,'info',data)[0],/18 HP/);
  itemAction(world,0,'use',data);assert.equal(world.hp,19);const field=itemAction(world,0,'use',data);assert.equal(world.hp,29);assert.doesNotMatch(field[0],/SPEED boosts/);assert.ok(sounds.includes('snd_speedup'));
  itemAction(world,0,'use',data);itemAction(world,1,'use',data);assert.deepEqual([world.armor,world.armorDefense,world.weapon,world.weaponStrength,world.inventory],[44,5,45,2,[4,3]]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.inventory=[41,44,45];w.armor=4;w.armorDefense=0;w.weapon=3;w.weaponStrength=0;w.hp=w.maxHp=20;await w.openRoom('room_water1');__remake.startBattle('froggit');});await page.waitForFunction(()=>__remake.room==='battle_froggit');
  const battle=await page.evaluate(async()=>{const s=__remake.scene,{itemAction}=await import('/src/inventory.mjs'),t=s.cache.json.get('inventory'),w=s.previousScene;s.hp=1;const tea=itemAction(w,0,'use',t,{scene:s,health:s})[0];itemAction(w,0,'use',t,{scene:s,health:s});itemAction(w,1,'use',t,{scene:s,health:s});s.invFrames=0;s.hurt(7);const result=[tea,s.soulSpeed,s.hp,s.invFrames,w.armor,w.weapon];s.finishBattle();return result;});
  assert.match(battle[0],/SPEED boosts/);assert.deepEqual(battle.slice(1),[5,7,75,44,45]);await page.waitForFunction(()=>__remake.phase==='running');
  await page.evaluate(()=>{const w=__remake.scene;w.inventory=[];w.armor=4;w.armorDefense=0;w.weapon=3;w.weaponStrength=0;__remake.startBattle('froggit');});await page.waitForFunction(()=>__remake.room==='battle_froggit');assert.equal(await page.evaluate(()=>__remake.scene.soulSpeed),4);await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Vật phẩm cửa hàng Waterfall: hồi HP, tốc độ, trang bị và bất tử');
}
