import assert from 'node:assert/strict';
export async function testWaterfallDogPath(page) {
  for(const ending of [false,true]) {
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1,356:1}:{356:1};w.inventory=[];w.plot=111;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_piano');w.player.setPosition(140,72);window.dogPathMusic=w.townMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_dogroom');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.dogPathMusic:w.waterfallMusic==null];},ending),[150,200,true]);
    await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_piano');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.dogPathMusic:w.waterfallMusic==null,w.inventory.includes(27)];},ending),[140,72,true,false]);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa piano ↔ kho báu và dọn chó tạm');
}
