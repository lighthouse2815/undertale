import assert from 'node:assert/strict';

export async function testSnowdinFog(page) {
  const open = (flags={},plot=65) => page.evaluate(async ({flags,plot}) => { const w=__remake.game.scene.getScene('World'); w.flags=flags; w.plot=plot; await w.openRoom('room_fogroom'); },{flags,plot});
  await open();
  const result = await page.evaluate(() => {
    const w=__remake.scene, f=w.snowdinFog; w.scene.pause(); w.player.x=220;
    for(let i=0;i<4;i++) f.step(); const fog=[f.tiles.length,f.offset,f.alpha,f.tiles[0].frame.cutX,f.tiles[0].alpha,f.water.length,!!f.ice];
    w.player.x=660; f.step(); const ordinary=[f.alpha,f.tiles[0].alpha]; w.plot=100; f.step(); const late=[f.alpha,f.tiles[0].alpha];
    f.frozen=true; w.player.x=100; f.step(); const frozen=f.alpha;
    const water=f.water[0]; water.image.x=901; f.ice.image.x=901; f.step(); const wrap=[water.image.x,f.ice.image.x];
    const old=f.tiles[0]; w.scene.resume(); return {fog,ordinary,late,frozen,wrap,old};
  });
  assert.deepEqual(result.fog,[39,1,.5,1,.5,42,true]); assert.deepEqual(result.ordinary,[1.5,1]); assert.deepEqual(result.late,[.5,.5]); assert.equal(result.frozen,.5); assert.deepEqual(result.wrap,[-10,-60]);
  await page.screenshot({path:'.cache/snowdin-fog.png'});
  await open({7:1}); assert.equal(await page.evaluate(() => __remake.scene.snowdinFog.ice),null);
  await open({26:7}); assert.equal(await page.evaluate(() => __remake.scene.snowdinFog.ice),null);
  const destroyed=await page.evaluate(async () => {const w=__remake.scene, tile=w.snowdinFog.tiles[0]; await w.openRoom('room_tundra_garage'); return [w.snowdinFog,!tile.active];}); assert.deepEqual(destroyed,[null,true]);
  console.log('✓ Phòng sương: 39 ô/offset/alpha/khóa, 42 vệt nước, tảng băng/ẩn/đảo vòng và dọn');
}
