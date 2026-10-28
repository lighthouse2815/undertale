import assert from 'node:assert/strict';

export async function testWaterfallMystery(page) {
  await page.evaluate(() => { window.savedMysteryFun = localStorage.getItem('undertale-remake-fun'); });
  await page.evaluate(async () => {
    const w = __remake.scene; w.flags = { 5: 66 }; w.plot = 110; localStorage.setItem('undertale-remake-fun', '66');
    await w.openRoom('room_water_savepoint1'); w.player.setPosition(280, 120);
  });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_fakehallway');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.flags[5], localStorage.getItem('undertale-remake-fun')]), [10, 0, '0']);
  await page.evaluate(async () => { const random = Math.random; Math.random = () => 0; try { await __remake.scene.openRoom('room_water_fakehallway'); } finally { Math.random = random; } });
  assert.equal(await page.evaluate(() => !!__remake.scene.waterfallMystery.door), false);
  await page.evaluate(async () => { const random = Math.random; Math.random = () => .4; try { await __remake.scene.openRoom('room_water_fakehallway'); } finally { Math.random = random; } });
  assert.equal(await page.evaluate(() => !!__remake.scene.waterfallMystery.door), true);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(140, 112); w.player.facing = 'u'; });
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_mysteryman');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 190]);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(150, 100); w.player.facing = 'u'; });
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.waterfallMystery.fading);
  await page.waitForFunction(() => !__remake.scene.waterfallMystery.man);
  await page.evaluate(() => __remake.scene.player.setPosition(150, 190));
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_fakehallway');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [140, 120]);
  await page.evaluate(() => __remake.scene.player.setPosition(290, 120));
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water11');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [15, 120]);
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_savepoint1');
  await page.evaluate(async () => { if (window.savedMysteryFun === null) localStorage.removeItem('undertale-remake-fun'); else localStorage.setItem('undertale-remake-fun', window.savedMysteryFun); await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Hành lang fun 66, cửa hiếm và nhân vật bí mật');
}
