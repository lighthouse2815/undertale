import assert from 'node:assert/strict';
export async function testWaterfallWishingDoor(page) {
  const open = async (flags = {}, plot = 107) => page.evaluate(async ({ flags, plot }) => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = plot; await w.openRoom('room_water6'); w.scene.pause(); }, { flags, plot });
  await open();
  const opened = await page.evaluate(() => {
    const w = __remake.scene, room = w.waterfallWishingRoom, blocked = w.colliders.some(c => c.objectName === 'obj_solidtall_2' && c.rectangle.contains(510, 80));
    w.player.setPosition(500, 85); w.player.facing = 'u'; const interacted = room.interact();
    const during = [room.doorOpen, w.plot, room.door.image?.visible, room.doorFrames, w.colliders.some(c => c.objectName === 'obj_solidtall_2' && c.rectangle.contains(510, 80))];
    for (let i = 0; i < 31; i++) room.update(1000 / 30); const after = room.doorFrames; w.scene.resume(); return { blocked, interacted, during, after };
  });
  assert.equal(opened.blocked, true); assert.equal(opened.interacted, true); assert.deepEqual(opened.during, [true, 108, true, 30, false]); assert.equal(opened.after, 0);
  await open({}, 108); assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallWishingRoom.doorOpen, __remake.scene.waterfallWishingRoom.doorFrames ?? 0, __remake.scene.colliders.some(c => c.objectName === 'obj_solidtall_2' && c.rectangle.contains(510, 80))]), [true, 0, false]);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 26: 8 }, 106);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.waterfallWishingRoom.doorOpen]), [108, true]);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 26: 8, 27: 1 }, 106);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.waterfallWishingRoom.doorOpen ?? false]), [106, false]);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Wishing Room: cửa ẩn, plot 108, khóa, mở sẵn và tuyến giết');
}
