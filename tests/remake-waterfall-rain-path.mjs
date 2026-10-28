import assert from 'node:assert/strict';
export async function testWaterfallRainPath(page){
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1,85:1}:{85:1};w.plot=114;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_prewaterfall');w.player.setPosition(310,120);window.rainPathMusic=ending?w.townMusic:w.waterfallRain;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_waterfall');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallRain)===window.rainPathMusic,w.player.texture.key.includes('_umbrella')];},ending),[20,140,true,true]);
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_prewaterfall');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallRain)===window.rainPathMusic];},ending),[310,120,true]);
  }
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1,85:1}:{85:1};w.plot=114;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_waterfall');w.player.setPosition(1540,210);window.rainPathMusic=ending?w.townMusic:w.waterfallRain;},ending);
    await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_waterfall2');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallRain)===window.rainPathMusic,w.waterfallRainRoom.vertical];},ending),[140,20,true,true]);
    await page.waitForFunction(()=>__remake.scene.waterfallRainRoom.drops.length>0);
    assert.equal(await page.evaluate(()=>__remake.scene.waterfallRainRoom.drops.every(d=>d.x>=120&&d.x<180)),true);
    await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_waterfall');
    assert.deepEqual(await page.evaluate(ending=>[__remake.scene.player.x,__remake.scene.player.y,(ending?__remake.scene.townMusic:__remake.scene.waterfallRain)===window.rainPathMusic],ending),[1540,180,true]);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa khu ô ↔ hành lang mưa và âm thanh');
}
