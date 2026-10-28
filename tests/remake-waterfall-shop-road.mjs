import assert from 'node:assert/strict';

export async function testWaterfallShopRoad(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=117;w.inventory=[1];await w.openRoom('room_water_friendlyhub');w.player.setPosition(590,100);window.shopRoadMusic=w.waterfallMusic;});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.room==='room_water_shop');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.waterfallMusic===window.shopRoadMusic,w.flags[300],w.colliders.some(e=>e.objectName==='obj_sansbox')];}),[10,115,true,14,true]);
  const prompt=await page.evaluate(()=>{const w=__remake.scene,e=w.waterfallShopRoad.box,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!w.waterfallShopRoad.interact())throw Error('BOX fora de alcance');return w.dialogue.lines[0];});assert.match(prompt,/Use the box/);
  await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.index=0;w.dialogue.choice.readyAt=0;w.advanceDialogue();});await page.waitForFunction(()=>__remake.phase==='itemBox');
  await page.evaluate(()=>{const box=__remake.scene;box.column=0;box.row=0;box.transfer();box.close();});await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.inventory,__remake.scene.flags[300],__remake.scene.flags[301]]),[[],14,1]);
  await page.evaluate(()=>__remake.scene.player.setPosition(10,115));await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.room==='room_water_friendlyhub');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic===window.shopRoadMusic]),[590,100,true]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags[300]=0;w.flags[301]=0;await w.openRoom('room_water_shop');const e=w.waterfallShopRoad.box,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';w.waterfallShopRoad.interact();w.dialogue.choice.index=0;w.dialogue.choice.readyAt=0;w.advanceDialogue();});
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/You have no items/);await page.evaluate(async()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();await w.openRoom('room_water1');});console.log('✓ Đường cửa hàng: BOX dùng chung, hộp rỗng, cửa và nhạc');
}
