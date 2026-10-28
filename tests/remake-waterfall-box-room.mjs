import assert from 'node:assert/strict';

export async function testWaterfallBoxRoom(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;w.inventory=[1];await w.openRoom('room_water3');});
  const interact=(name,index=0)=>page.evaluate(({name,index})=>{const w=__remake.scene,e=w.roomObjects.filter(e=>e.item.ObjectName===name)[index],s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';w.tryInteract();return w.dialogue.lines;},{name,index});
  const close=()=>page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});
  assert.equal(await page.evaluate(()=>__remake.scene.flags[300]),14);
  assert.equal((await interact('obj_sign_room')).length,4);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines.at(-1)),/box hater/);await close();
  assert.match((await interact('obj_echoflower'))[0],/saw something/);await close();
  assert.match((await interact('obj_readable_room4'))[0],/camera/);await close();
  assert.match((await interact('obj_sansbox'))[0],/Use the box/);
  await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.readyAt=0;w.advanceDialogue();});await page.waitForFunction(()=>__remake.phase==='itemBox');
  assert.equal(await page.evaluate(()=>__remake.scene.world.flags[300]),14);await page.waitForTimeout(180);await page.keyboard.press('x');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>__remake.scene.colliders.filter(c=>['obj_sign_room','obj_sansbox','obj_echoflower'].includes(c.objectName)).map(c=>c.objectName).sort()),['obj_echoflower','obj_sansbox','obj_sign_room']);
  await page.evaluate(async()=>{const w=__remake.scene;await w.openRoom('room_water1');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallBoxRoom),null);
  console.log('✓ Phòng BOX Waterfall: biển/hoa/camera, menu BOX thật và va chạm');
}
