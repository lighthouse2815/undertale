import assert from 'node:assert/strict';

export async function testHotlandSleepingSans(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 121; await w.openRoom('room_fire1', 'obj_markerA'); return snapshot;
  });
  const sleeping = await page.evaluate(() => {
    const s = __remake.scene.hotlandSleepingSans; s.frame = 0; s.elapsed = 0;
    for (let i = 0; i < 51; i++) s.update(34);
    const result = [!!s.sans, s.particles.length, s.sans.image.texture.key, s.particles.every(p => p.image.y < s.sans.item.Y)];
    window.oldSnooze = s.particles[0].image; return result;
  });
  assert.deepEqual(sleeping, [true, 3, 'spr_sans_sleep:0', true]);
  for (const [plot, flags] of [[122, {}], [121, { 67: 1 }], [121, { 413: 1 }]]) {
    assert.equal(await page.evaluate(async ([plot, flags]) => { const w = __remake.scene; w.plot = plot; w.flags = flags; await w.openRoom('room_fire1', 'obj_markerA'); return w.hotlandSleepingSans.sans; }, [plot, flags]), null);
  }
  assert.equal(await page.evaluate(() => { const active = window.oldSnooze.active; delete window.oldSnooze; return active; }), false);
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Sans ngủ ở Hotland: hoạt ảnh, chữ Z, điều kiện xuất hiện và dọn');
}
