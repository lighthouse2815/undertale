import assert from 'node:assert/strict';

export async function testWaterfallFlowerHall(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 118; await w.openRoom('room_water18'); w.player.setPosition(360, 20); });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_water19'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, h = w.waterfallFlowerHall; return [w.player.x, w.player.y, h.flowers.length, h.pollen.length, w.waterfallMusic.key, w.roomObjects.some(e => e.item.ObjectName === 'obj_savepoint')]; }), [140, 580, 5, 100, 'mus_ambientwater', false]);
  for (const [y, pages] of [[160,3],[240,2],[320,3],[420,2],[460,2]]) {
    const count = await page.evaluate(y => { const w = __remake.scene, f = w.waterfallFlowerHall.flowers.find(e => e.item.Y === y); w.player.setPosition(f.item.X, f.item.Y + f.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); const n = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue(); return n; }, y);
    assert.equal(count, pages);
  }
  const trigger = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallFlowerHall; w.player.setPosition(220, 150); h.checkTrigger(); const f = h.flowers.find(e => e.item.Y === 420); w.player.setPosition(f.item.X, f.item.Y + f.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); const pages = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue(); return [w.plot, h.floweyHeard, !!h.flowey, pages]; });
  assert.deepEqual(trigger, [119, true, true, 7]);
  await page.evaluate(() => __remake.scene.player.setPosition(140, 580));
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.room === 'room_water18'); await page.keyboard.up('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallFlowerHall]), [360, 20, null]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 11}; w.plot = 119; await w.openRoom('room_water19'); });
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(e => e.item.ObjectName === 'obj_savepoint')), true);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 10, 204: 12}; w.plot = 118; await w.openRoom('room_water19'); });
  const route = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallFlowerHall, f = h.flowers[0]; w.player.setPosition(f.item.X, f.item.Y + f.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); const flower = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); w.player.setPosition(140, 350); h.checkTrigger(); const warning = w.dialogue?.lines[0]; return [flower.length, warning, h.doom]; });
  assert.equal(route[0], 1); assert.match(route[1], /6 left/); assert.equal(route[2], null);
  await page.evaluate(async () => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); w.flags = {}; w.plot = 117; await w.openRoom('room_water18'); });
  assert.equal(await page.evaluate(() => __remake.scene.doors.some(d => d.destination === 'room_water19') && !__remake.scene.findDoor(360, 0)), true);
  console.log('✓ Waterfall 19: cửa, hoa, Flowey, phấn hoa và điểm lưu theo tuyến');
}
