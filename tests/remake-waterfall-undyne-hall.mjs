import assert from 'node:assert/strict';

export async function testWaterfallUndyneHall(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water17'); w.waterfallEncounter.disabled = true; w.player.setPosition(610, 290); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water18'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(300, 110); w.waterfallUndyneHall.update(); });
  await page.waitForFunction(() => Math.abs(__remake.scene.waterfallMusic.volume - .5) < .01);
  const early = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallUndyneHall; return [w.waterfallMusic.key, h.halo.alpha, Math.round(w.waterfallMusic.volume * 100) / 100, h.blocker.disabled, h.layers.every(e => !e.visible), !!w.waterfallShallowWater, w.waterfallGrass.grass.length]; });
  assert.deepEqual(early, ['mus_ambientwater', .75, .5, false, true, true, 3]);
  await page.evaluate(() => __remake.scene.player.setPosition(20, 110));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water17'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic.key, __remake.scene.waterfallUndyneHall]), [610, 290, 'mus_waterfall', null]);
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 118; await w.openRoom('room_water18'); });
  const late = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallUndyneHall, e = h.flower; w.player.setPosition(e.item.X, e.item.Y + 1); w.player.facing = 'u'; w.tryInteract(); return [h.halo ?? null, h.blocker.disabled, h.layers.every(e => e.visible), w.dialogue?.lines.length]; });
  assert.deepEqual(late, [null, true, true, 1]);
  await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); });
  console.log('✓ Hành lang Undyne: cửa, nước, cỏ, bóng tối và trạng thái sau cảnh');
}
