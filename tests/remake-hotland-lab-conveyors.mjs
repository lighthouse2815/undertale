import assert from 'node:assert/strict';

export async function testHotlandLabConveyors(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 127; await w.openRoom('room_fire_lab1', 'obj_markerC');
    w.player.setPosition(980,90); w.updateCamera(); window.labBeltMusic = w.labMusic; return snapshot;
  });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => !!__remake.scene.hotlandLabConveyors.active); await page.keyboard.up('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.evaluate(() => __remake.scene.player.x), 980, 'Không thể lái ngang khi băng chuyền chở.');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_fire_lab2');
  await page.waitForFunction(() => !__remake.scene.hotlandLabConveyors.active && __remake.scene.player.y < 180);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.labMusic === window.labBeltMusic]), [740, true]);
  const sideways = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandLabConveyors; w.player.setPosition(400,150);
    c.step(); const first = w.player.x; c.step(); return [first, w.player.x, c.horizontal.length];
  });
  assert.deepEqual(sideways, [397,394,1]);
  await page.evaluate(() => __remake.scene.player.setPosition(60,150));
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => !!__remake.scene.hotlandLabConveyors.active); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_fire_lab1');
  await page.waitForFunction(() => !__remake.scene.hotlandLabConveyors.active && __remake.scene.player.y > 60);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.labMusic === window.labBeltMusic]), [300, true]);
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.labBeltMusic; }, previous);
  console.log('✓ Hai tầng lab: băng chuyền lên/xuống, giữ nhạc, khóa điều khiển và băng ngang');
}
