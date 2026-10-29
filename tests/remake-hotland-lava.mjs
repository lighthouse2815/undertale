import assert from 'node:assert/strict';

export async function testHotlandLava(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 122; await w.openRoom('room_fire1', 'obj_markerA'); return snapshot;
  });
  const layers = await page.evaluate(() => {
    const lava = __remake.scene.hotlandLava; lava.elapsed = 0; lava.frame = 0;
    const layers = lava.bands.map(b => [b.image.y, b.image.alpha, b.speed, b.image.displayWidth]);
    lava.update(34); const positions = lava.bands.map(b => b.image.tilePositionX);
    window.oldLava = lava.bands[0].image; return [layers, positions];
  });
  assert.deepEqual(layers[0], [[160, .5, .25, 520], [172, .75, .5, 520], [186, 1, .8, 520], [202, 1, .9, 520], [220, 1, 1, 520]]);
  for (const [actual, expected] of layers[1].map((x, i) => [x, [19.75, 19.5, 19.2, 19.1, 19][i]])) assert.ok(Math.abs(actual - expected) < .00001);
  await page.evaluate(async previous => { const w = __remake.scene; await w.openRoom('room_water_undynefinal3', 'obj_markerA'); Object.assign(w, previous); }, previous);
  assert.equal(await page.evaluate(() => { const active = window.oldLava.active; delete window.oldLava; return active; }), false);
  console.log('✓ Dung nham Hotland: năm lớp, tốc độ, độ mờ và dọn khi đổi phòng');
}
