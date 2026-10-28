import assert from 'node:assert/strict';
export async function testWaterfallStatuePath(page){
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=111;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water14');w.player.setPosition(710,115);window.statuePathMusic=w.townMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_statue');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.statuePathMusic:w.waterfallMusic==null,!!w.waterfallMusicStatue.rain];},ending),[20,120,true,!ending]);
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water14');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.statuePathMusic:w.waterfallMusic.key];},ending),[710,115,ending?true:'mus_ambientwater']);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa hành lang Shyren ↔ tượng âm nhạc');
}
