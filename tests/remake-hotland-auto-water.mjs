import assert from 'node:assert/strict';

export async function testHotlandAutoWater(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(() => structuredClone({ flags: __remake.scene.flags, plot: __remake.scene.plot }));
  for (const [room, lines] of [
    ['room_fire1', ['* (The cup of water returned\n  to the water cooler.)']],
    ['room_fire2', ['* (The cup of water was erased\n  by a mysterious force.)']],
    ['room_fire_prelab', ['* (The water evaporated from\n  the heat.)', '* (The cup evaporated, too.)']],
  ]) {
    const actual = await page.evaluate(async room => {
      const w = __remake.scene; w.flags = { 366: 1 }; w.plot = 122; await w.openRoom(room, 'obj_markerA');
      const auto = w.hotlandAutoWater; auto.update(101); const lines = w.dialogue?.lines;
      const before = w.flags[366]; while (w.dialogue) w.advanceDialogue(); auto.update(100);
      return [lines, before, w.flags[366], !!w.dialogue];
    }, room);
    assert.deepEqual(actual, [lines, 1, 0, false]);
  }
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Cốc nước bị loại bỏ khi đổi phòng Hotland');
}
