import assert from 'node:assert/strict';

export async function testWaterfallBoxPath(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_water2');w.player.setPosition(280,120);});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water3');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic.key]),[20,110,'mus_ambientwater']);
  await page.evaluate(()=>{const w=__remake.scene;w.player.setPosition(290,50);w.updateCamera();});await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water3A');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic.key]),[130,180,'mus_ambientwater']);
  await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water3');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[290,50]);
  for(const [flags,plot,key] of [[{},106,'mus_waterfall'],[{223:1},106,'mus_toomuch'],[{223:1,27:1},106,'mus_waterfall'],[{},101,'mus_ambientwater']]) {
    await page.evaluate(async({flags,plot})=>{const w=__remake.scene;w.flags=flags;w.plot=plot;await w.openRoom('room_water2');await w.openRoom('room_water3');},{flags,plot});assert.equal(await page.evaluate(()=>__remake.scene.waterfallMusic.key),key);
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});
  console.log('✓ Waterfall 2–3–3A: cửa/marker, phòng Tutu và ba nhánh nhạc');
}
