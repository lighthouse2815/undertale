import assert from 'node:assert/strict';
export async function testWaterfallHistoryPath(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 108; await w.openRoom('room_water6'); w.waterfallEncounter.disabled = true; w.player.setPosition(500, 95); w.updateCamera(); window.historyMusic = w.waterfallMusic; });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water7'); await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.historyMusic]), [130, 300, true]);
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water6'); await page.keyboard.up('ArrowDown');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.historyMusic, __remake.scene.waterfallWishingRoom.doorOpen]), [500, 90, true, true]);
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water7'); w.player.setPosition(510, 121); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallRaft.stage === 'ride'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.scene.waterfallRaft.stage === 'return', null, { timeout: 15000 });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallRaft.x, __remake.scene.player.x, __remake.scene.waterfallMusic.key]), [1000, 999, 'mus_ambientwater']);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Cửa Wishing Room ↔ phòng lịch sử, nhạc và chuyến bè bằng phím');
}
