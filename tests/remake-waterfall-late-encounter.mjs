import assert from 'node:assert/strict';

export async function testWaterfallLateEncounter(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; w.hp = w.maxHp = 20; w.inventory = []; await w.openRoom('room_water_shop'); w.player.setPosition(290, 115); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water15'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic.key]), [20, 120, 'mus_waterfall']);
  for (const [index, scene] of ['TemmieBattle', 'MoldbyggGroupBattle', 'WaterfallGroupBattle', 'WoshuaMoldbyggBattle'].entries()) {
    await page.evaluate(() => { const e = __remake.scene.waterfallEncounter; e.count = e.steps + 1; e.update(); });
    await page.waitForFunction((key) => __remake.phase === 'battle' && __remake.scene.scene.key === key, scene);
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[358]), index + 1);
    await page.evaluate(() => __remake.scene.flee()); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running');
  }
  await page.evaluate(() => __remake.scene.player.setPosition(20, 120));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water_shop'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic.key]), [290, 115, 'mus_waterquiet']);
  console.log('✓ Waterfall 15: cửa hai chiều, nhạc và bốn trận đầu');
}
