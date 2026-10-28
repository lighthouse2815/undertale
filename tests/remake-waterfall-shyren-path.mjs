import assert from 'node:assert/strict';
export async function testWaterfallShyrenPath(page) {
  for(const ending of [false,true]) {
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1,496:5}:{496:5};w.plot=111;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_onionsan');w.player.setPosition(1190,120);window.shyrenPathMusic=ending?w.townMusic:w.waterfallMusic;},ending);
    await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water14');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.shyrenPathMusic];},ending),[10,115,true]);
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_onionsan');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.shyrenPathMusic];},ending),[1190,120,true]);
  }
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={496:5};w.plot=110;w.hp=w.maxHp=20;await w.openRoom('room_water_onionsan');w.player.setPosition(1190,120);});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water14');
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.player.x>=180);await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.scene.player.y>=169);await page.keyboard.up('ArrowDown');
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.scene.scene.key==='ShyrenBattle');await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(()=>__remake.scene.previousScene.plot),111);await page.evaluate(()=>__remake.scene.flee());await page.keyboard.press('z');await page.waitForFunction(()=>__remake.phase==='running');await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cửa Onionsan ↔ hành lang Shyren và nhạc');
}
