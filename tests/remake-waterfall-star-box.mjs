import assert from 'node:assert/strict';
export async function testWaterfallStarBox(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = { 300: 14 }; w.inventory = []; w.plot = 110; await w.openRoom('room_water11'); const e = w.waterfallStarRoom.box, s = e.sprite; w.player.setPosition(e.item.X + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y + s.MarginBottom - 18); w.player.facing = 'u'; w.waterfallStarRoom.interact(); });
  await page.waitForTimeout(150); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'itemBox');
  await page.waitForFunction(() => __remake.scene.time.now >= __remake.scene.readyAt);
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('z'); await page.keyboard.press('x'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[300]]), [[14], 0]);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ BOX phòng sao: mở, rút găng tay và đồng bộ túi');
}
