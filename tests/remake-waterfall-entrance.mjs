import assert from 'node:assert/strict';

export async function testWaterfallEntrance(page) {
  await page.evaluate(async () => {const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_fogroom');w.player.setPosition(860,120);});
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water1');
  const initial = await page.evaluate(() => {const w=__remake.scene,c=w.waterfallEntrance;w.scene.pause();return [c.water.length,c.falls.length,c.falls.map(f=>f.images.length),!!c.ice,w.waterfallMusic.key,w.player.x,w.player.y];});
  assert.deepEqual(initial,[16,3,[20,20,20],true,'mus_ambientwater',20,120]);
  const effects = await page.evaluate(() => {const w=__remake.scene,c=w.waterfallEntrance,e=c.water[0];e.image.setPosition(459,50);e.vx=1.5;e.vy=0;e.moved=false;e.sine=0;c.ice.image.setPosition(464,-63);w.cameras.main.scrollX=200;c.step();const turn=[e.moved,e.vx,e.vy,c.ice.image.x,c.ice.image.y,c.falls[0].images[0].x];e.image.y=-14;c.step();return [turn,e.image.x,e.image.y,e.vx,e.vy,e.moved];});
  assert.deepEqual(effects,[[true,0,-1.5,-48,48,0],-10,40,1.5,0,false]);
  await page.evaluate(() => __remake.scene.scene.resume());
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_fogroom');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic]),[860,120,null]);
  for (const flags of [{7:1},{26:7}]) {
    await page.evaluate(async flags => {const w=__remake.scene;w.flags=flags;await w.openRoom('room_water1');},flags);
    assert.equal(await page.evaluate(() => __remake.scene.waterfallEntrance.ice),null);
  }
  await page.evaluate(async () => {const w=__remake.scene;await w.openRoom('room_fogroom');});
  console.log('✓ Đầu Waterfall: cửa hai chiều, nước rẽ/vòng, băng/đường đi, thác thị sai và âm thanh');
}
