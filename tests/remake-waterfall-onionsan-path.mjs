import assert from 'node:assert/strict';
export async function testWaterfallOnionsanPath(page) {
  for(const ending of [false,true]) {
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=110;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water12');w.waterfallEncounter.disabled=true;w.player.setPosition(1000,20);window.onionPathMusic=ending?w.townMusic:w.waterfallMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_onionsan');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,ending?w.townMusic===window.onionPathMusic:w.waterfallMusic.key];},ending),[100,190,ending?true:'mus_ambientwater']);
    await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water12');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;w.waterfallEncounter.disabled=true;return [w.player.x,w.player.y,ending?w.townMusic===window.onionPathMusic:w.waterfallMusic.key];},ending),[1000,20,ending?true:'mus_waterfall']);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa Waterfall 12 ↔ Onionsan, marker và nhạc');
}
