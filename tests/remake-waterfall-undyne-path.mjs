import assert from 'node:assert/strict';

export async function testWaterfallUndynePath(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=106;await w.openRoom('room_water3');w.savedWaterfallMusic=w.waterfallMusic;w.player.setPosition(540,115);});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water4');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.waterfallMusic.key,w.waterfallMusic===w.savedWaterfallMusic,w.waterfallUndyne.stage];}),[15,275,'mus_waterfall',true,'done']);
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water3');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic===__remake.scene.savedWaterfallMusic]),[540,115,true]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={26:8};w.plot=106;await w.openRoom('room_water2');await w.openRoom('room_water4');});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallMusic.key,Math.round(__remake.scene.waterfallMusic.rate*100)]),['mus_waterfall',13]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Đường tới Undyne: cửa hai chiều, marker và nhạc liên tục/tuyến giết');
}
