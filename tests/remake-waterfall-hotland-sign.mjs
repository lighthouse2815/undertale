import assert from 'node:assert/strict';

export async function testWaterfallHotlandSign(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = { 354: 2 }; w.plot = 121; await w.openRoom('room_water_undynefinal3', 'obj_markerA'); return snapshot;
  });
  const active = await page.evaluate(() => {
    const s = __remake.scene.waterfallHotlandSign; s.elapsed = 0; s.frame = 0; s.offset = 20; s.brightness = 0;
    for (let i = 0; i < 15; i++) s.update(34);
    const animated = [s.offset, s.brightness, s.letters.alpha, s.cover.displayWidth, !!s.letters.mask];
    s.offset = -80; s.frame = 4; s.elapsed = 0; s.update(34);
    window.oldHotlandSign = s.letters; return [animated, s.offset];
  });
  assert.deepEqual(active, [[17, 1, 1, 480, true], 60]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags[350] = 1; w.plot = 122; await w.openRoom('room_water_undynefinal3', 'obj_markerA'); });
  assert.deepEqual(await page.evaluate(() => {
    const s = __remake.scene.waterfallHotlandSign, before = [s.offset, s.brightness]; s.update(2000);
    return [window.oldHotlandSign.active, s.inactive, s.letters.alpha, before, [s.offset, s.brightness]];
  }), [false, true, .5, [20, 0], [20, 0]]);
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.oldHotlandSign; }, previous);
  console.log('✓ Biển Hotland: chữ chạy, viền, trạng thái sau trận và dọn');
}
