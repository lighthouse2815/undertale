import assert from 'node:assert/strict';

export async function testGrillbyRoom(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_tundra_town');w.player.setPosition(1305,110);w.player.facing='u';});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_tundra_grillby');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.grillbyMusic.key,w.doors.length,w.doors[0].marker,w.doors[0].musicFade];}),[167,200,'mus_muscle',3,'obj_markerw',true]);
  const signs=await page.evaluate(()=>{const w=__remake.scene;return ['obj_readable_room1','obj_readable_room2'].map(name=>{const e=w.roomObjects.find(e=>e.item.ObjectName===name),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';w.grillbyNpcs.interact();const text=w.dialogue.lines[0];while(w.dialogue)w.advanceDialogue();return text;});});
  assert.match(signs[0],/jukebox is broken/);assert.match(signs[1],/fire exit/);
  await page.evaluate(()=>{__remake.scene.player.setPosition(157,200);});await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_tundra_town');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.grillbyMusic]),[1315,110,null]);
  for(const flags of [{67:1},{7:1}]) {await page.evaluate(async flags=>{const w=__remake.scene;w.townMusic?.destroy();w.townMusic=null;w.flags=flags;await w.openRoom('room_tundra_town');await w.openRoom('room_tundra_grillby');},flags);assert.equal(await page.evaluate(()=>__remake.scene.grillbyMusic),null);if(flags[7])assert.equal(await page.evaluate(()=>__remake.scene.townMusic.key),'mus_reunited');}
  console.log('✓ Quán Grillby: cửa hai chiều/marker/nhạc, nhánh giết/kết thúc và hai bảng');
}
