import assert from 'node:assert/strict';
export async function testWaterfallNiceCreamPath(page) {
  for (const ending of [false,true]) {
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=110;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water11');w.player.setPosition(290,90);window.nicePathMusic=ending?w.townMusic:w.waterfallMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_nicecream');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.nicePathMusic];},ending),[150,380,true]);
    await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water11');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.nicePathMusic];},ending),[290,90,true]);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa phòng sao ↔ Nice Cream Waterfall và nhạc');
}
