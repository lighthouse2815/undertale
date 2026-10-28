import assert from 'node:assert/strict';

export async function testWaterfallCastle(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={91:4};w.plot=111;await w.openRoom('room_water_waterfall2');w.player.setPosition(285,900);window.castleRain=w.waterfallRain;});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.room==='room_water_waterfall3');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.waterfallRain===window.castleRain,w.player.texture.key.startsWith('spr_mainchara')&&w.player.texture.key.includes('_shadow'),!!w.waterfallCastle.kid];}),[22,165,true,true,true]);
  await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallCastle;w.scene.pause();w.player.setPosition(510,165);c.kid.x=450;c.step();const after=[w.flags[91],c.stage];for(let i=0;i<60;i++)c.step();window.castleTest=[after,c.stage,c.kid.x];w.scene.resume();});
  assert.deepEqual(await page.evaluate(()=>window.castleTest),[[6,'running'],'watching',813]);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.evaluate(()=>__remake.scene.player.setPosition(22,165));await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.room==='room_water_waterfall2');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallRain===window.castleRain]),[280,900,true]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={85:1};w.plot=113;await w.openRoom('room_water_waterfall3');});assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallCastle.kid,__remake.scene.player.texture.key.includes('_umbrella')]),[null,true]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={7:1,85:1};w.plot=113;await w.openRoom('room_tundra_town');window.castleEndingMusic=w.townMusic;await w.openRoom('room_water_waterfall3');});assert.deepEqual(await page.evaluate(()=>[__remake.scene.townMusic===window.castleEndingMusic,__remake.scene.waterfallRain]),[true,null]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Đường lâu đài: cửa, bóng Kid, mưa và nhánh plot');
}
