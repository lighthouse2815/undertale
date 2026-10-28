import assert from 'node:assert/strict';
import {itemAction} from '../remake/src/inventory.mjs';
import data from '../remake/src/inventory.json' with {type:'json'};
export async function testWaterfallMysteryKey(page){
  const outside={inventory:[60],flags:{},dataSource:{name:'room_water1'},sound:{play(){}}};assert.match(itemAction(outside,0,'info',data)[0],/keychain/);assert.match(itemAction(outside,0,'use',data)[0],/nothing happened/);assert.deepEqual(outside.inventory,[60]);outside.dataSource.name='room_icecave1';assert.equal(itemAction(outside,0,'use',data).length,3);assert.deepEqual(outside.inventory,[60]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.inventory=[60];w.plot=117;await w.openRoom('room_water_blookyard');});
  const opened=await page.evaluate(async()=>{const w=__remake.scene,{itemAction}=await import('/src/inventory.mjs'),data=(await import('/src/inventory.json',{with:{type:'json'}})).default;const before=[w.waterfallBlookYard.lockedCollider.disabled??false,w.doors.some(d=>d.direction==='C')];const lines=itemAction(w,0,'use',data);const after=[w.flags[433],w.inventory.length,w.waterfallBlookYard.lockedCollider.disabled,w.doors.filter(d=>d.direction==='C').length];w.waterfallBlookYard.unlock();return [before,lines,after,w.doors.filter(d=>d.direction==='C').length];});
  assert.deepEqual(opened[0],[false,false]);assert.match(opened[1][0],/unlocked/);assert.deepEqual(opened[2],[1,0,true,1]);assert.equal(opened[3],1);
  await page.evaluate(async()=>{const w=__remake.scene;w.saveGame();w.flags[433]=0;await w.restoreGame();await w.openRoom('room_water_blookyard');});assert.equal(await page.evaluate(()=>__remake.scene.doors.some(d=>d.direction==='C')),true);
  await page.evaluate(async()=>__remake.scene.openRoom('room_water1'));console.log('✓ Mystery Key: INFO, dùng ngoài phòng, mở cửa và lưu nạp');
}
