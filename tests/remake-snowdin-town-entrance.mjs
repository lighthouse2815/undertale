import assert from 'node:assert/strict';
export async function testTownEntrance(page) {
 for(const end of [false,true]){
  await page.evaluate(async end=>{const w=__remake.scene;await w.openRoom('room_area1');w.flags=end?{7:1,70:4}:{70:4};w.plot=end?110:67;w.hp=w.maxHp=20;w.gold=100;w.inventory=[16];await w.openRoom('room_tundra_dangerbridge','obj_markerB');w.bridgeSong=w.snowdinMusic;},end);
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_tundra_town');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return[w.player.x,w.player.y,w.townMusic.key,w.townMusic===w.bridgeSong,w.plot,w.gold];}),[20,120,end?'mus_reunited':'mus_town',end,end?110:67,100]);
  assert.ok(await page.evaluate(()=>!!__remake.scene.snowdinTown&&!!__remake.scene.snowdinTownNpcs&&!!__remake.scene.snowdinTownDogs));
  await page.evaluate(()=>{__remake.scene.previousTownSong=__remake.scene.townMusic;});await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_tundra_dangerbridge');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return[w.player.x,w.player.y,w.snowdinMusic.key,w.snowdinMusic===w.previousTownSong,w.plot,w.gold];}),[1000,120,end?'mus_reunited':'mus_snowy',end,end?110:67,100]);
 }
 console.log('✓ Cầu↔Town: bước/cửa/marker/fade, giữ Reunited sau kết thúc, đổi Snowy↔Town khi thường, plot/GOLD');
}
