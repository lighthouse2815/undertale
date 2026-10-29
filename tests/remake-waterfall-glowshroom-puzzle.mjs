import assert from 'node:assert/strict';

export async function testWaterfallGlowshroomPuzzle(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water15'); w.waterfallEncounter.disabled = true; w.player.setPosition(980, 120); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water16'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, p = w.waterfallGlowshroomPuzzle; w.waterfallEncounter.disabled = true; return [w.player.x, w.player.y, p.mushrooms.length, p.layers.filter(l => l.visible).length, w.waterfallMusic.key, p.mushrooms.map(m => m.image.texture.key), w.colliders.filter(c => c.objectName === 'obj_glowshroom').length]; }), [20, 100, 4, 0, 'mus_waterfall', Array(4).fill('spr_glowshroom:1'), 4]);
  for (let index = 0; index < 4; index++) {
    const result = await page.evaluate(index => { const w = __remake.scene, p = w.waterfallGlowshroomPuzzle, m = p.mushrooms[index]; w.player.setPosition(m.item.X, m.item.Y + 1); w.player.facing = 'u'; w.tryInteract(); return [p.mushrooms.filter(m => !m.glow).length, [...new Set(p.layers.filter(l => l.visible).map(l => l.depth))].sort(), w.flags[270] ?? 0]; }, index);
    assert.equal(result[0], index + 1); assert.equal(result[1].length, index + 1); assert.equal(result[2], index === 3 ? 1 : 0);
  }
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water16'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallGlowshroomPuzzle.mushrooms.every(m => !m.glow), __remake.scene.flags[270]]), [true, 1]);
  await page.evaluate(() => { const w = __remake.scene; w.waterfallEncounter.disabled = true; w.player.setPosition(20, 100); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water15'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallGlowshroomPuzzle]), [980, 120, null]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 118; await w.openRoom('room_water16'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallGlowshroomPuzzle.mushrooms.every(m => !m.glow), __remake.scene.flags[270]]), [true, 1]);
  console.log('✓ Waterfall 16: nấm, lớp đường, cờ, va chạm và cửa hai chiều');
}
