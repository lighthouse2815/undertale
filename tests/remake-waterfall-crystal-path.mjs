import assert from 'node:assert/strict';
export async function testWaterfallCrystalPath(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 110; await w.openRoom('room_water9'); w.player.setPosition(820, 120); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_savepoint1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic.key]), [20, 120, 'mus_waterquiet']);
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water9');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallUndyneSecond.stage, __remake.scene.waterfallMusic.key]), [820, 120, 'done', 'mus_waterfall']);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 7: 1 }; w.plot = 110; await w.openRoom('room_tundra_town'); await w.openRoom('room_water9'); w.player.setPosition(820, 120); window.crystalReunited = w.townMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_savepoint1');
  assert.equal(await page.evaluate(() => !!window.crystalReunited && __remake.scene.townMusic === window.crystalReunited && __remake.scene.townMusic.key === 'mus_reunited'), true);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Cửa phòng 9 ↔ Crystal, marker và nhạc thường/kết thúc');
}
