import assert from 'node:assert/strict';

export async function testRuinsPath(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 9.2; world.flags = {}; world.flags[35] = 0;
    world.kills = 0; world.inventory = []; await world.openRoom('room_ruins7', 'obj_markerA');
    world.player.setPosition(280, 340); world.player.facing = 'r';
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins8');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  await page.evaluate(() => { __remake.scene.player.setPosition(70, 482); });
  await page.waitForFunction(() => __remake.scene.ruinsHoles.cooldown > 0);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 440);
  await page.evaluate(() => { __remake.scene.player.setPosition(280, 110); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins9');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  const place = async (x, y, facing) => page.evaluate(({ x, y, facing }) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
  }, { x, y, facing });
  const rockX = () => page.evaluate(() => __remake.scene.ruinsRock.rocks[0].entry.image.x);
  await place(160, 125, 'r');
  await page.waitForTimeout(150);
  assert.equal(await rockX(), 180, 'Đứng gần và nhìn sang phải không tự đẩy đá.');
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.ruinsRock.rocks[0].entry.image.x >= 195);
  await page.keyboard.up('ArrowRight');
  const middle = await rockX();
  assert.ok(middle >= 195 && middle < 240, 'Đá phải đi từng bước trước khi chạm nút.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[35] ?? 0), 0);
  await place(middle + 18, 125, 'l');
  await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(() => __remake.scene.ruinsRock.rocks[0].entry.image.x === 180);
  await page.waitForTimeout(150); await page.keyboard.up('ArrowLeft');
  assert.equal(await rockX(), 180, 'Không đẩy lùi qua vị trí khởi đầu.');
  await place(160, 125, 'r');
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.flags[35] === 1);
  await page.waitForTimeout(150); await page.keyboard.up('ArrowRight');
  assert.equal(await rockX(), 240);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.rocks[0].entry.image.visible), true);
  assert.equal(await page.evaluate(() => __remake.scene.colliders.find((body) => body.objectName === 'obj_plotwall4').disabled), true);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.find(({item}) => item.ObjectName === 'obj_spikes_room').image.texture.key), 'spr_spiketile:1');
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.rocks[0].body.rectangle.x), 242);
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 225), 'Đá đã chốt vẫn chặn Frisk.');
  await page.evaluate(async () => { const world = __remake.scene; world.saveGame(); await world.restoreGame(); });
  assert.equal(await rockX(), 240);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.rocks[0].pushed), true);
  assert.equal(await page.evaluate(() => __remake.scene.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_pushrock3').X), 180, 'Không sửa dữ liệu phòng trong cache khi đá di chuyển.');
  await page.screenshot({ path: 'test-results/remake-ruins-rock.png' });
  console.log('✓ cửa room_ruins7→8→9, hố rơi, đẩy/lùi đá từng bước, nút/cờ 35, đá còn hiện và chặn tại vị trí mới, lưu/nạp');
}
