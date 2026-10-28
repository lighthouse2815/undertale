import assert from 'node:assert/strict';
export async function testWaterfallPianoPath(page) {
  for(const ending of [false,true]) {
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=111;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water14');w.player.setPosition(260,10);window.pianoPathMusic=ending?w.townMusic:w.waterfallMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_piano');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.pianoPathMusic:w.waterfallMusic===null];},ending),[140,180,true]);
    await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water14');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.pianoPathMusic:w.waterfallMusic.key];},ending),[260,10,ending?true:'mus_ambientwater']);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa hành lang Shyren ↔ piano và nhạc');
}
