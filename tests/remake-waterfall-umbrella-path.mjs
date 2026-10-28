import assert from 'node:assert/strict';
export async function testWaterfallUmbrellaPath(page){
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=111;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_statue');w.player.setPosition(280,120);window.umbrellaPathRain=w.waterfallRain;window.umbrellaPathMusic=w.townMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_prewaterfall');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.umbrellaPathMusic:w.waterfallRain===window.umbrellaPathRain];},ending),[10,120,true]);
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_statue');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.umbrellaPathMusic:w.waterfallRain===window.umbrellaPathRain];},ending),[280,120,true]);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallRain==null),true);console.log('✓ Cửa tượng ↔ khu lấy ô, marker và âm mưa');
}
