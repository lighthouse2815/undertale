import assert from 'node:assert/strict';

export async function testRuinsHoles(page) {
  await page.evaluate(() => {
    const world = __remake.scene;
    const play = world.sound.play;
    world.restoreHoleSound = () => { world.sound.play = play; };
    // Spy ghi nhận rồi gọi API thật, vẫn phát âm thanh qua Phaser.
    world.sound.play = function (key, ...args) { world.holeSounds.push(key); return play.call(this, key, ...args); };
  });
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const open = async (room) => {
    await page.evaluate(async (room) => {
      const world = __remake.scene; world.flags = {}; world.plot = 9.2; world.inventory = [];
      await world.openRoom(room, 'obj_markerA');
      world.holeSounds = [];
    }, room);
  };
  const place = async (x, y) => page.evaluate(({ x, y }) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.updateCamera();
  }, { x, y });
  const snapshot = () => page.evaluate(() => {
    const world = __remake.scene;
    return { x: world.player.x, y: world.player.y, visible: world.player.visible, alpha: world.player.alpha,
      stage: world.ruinsHoles.stage, locked: world.ruinsHoles.locked, facing: world.player.facing };
  });
  const stage = async (value) => page.waitForFunction((value) => __remake.scene.ruinsHoles.stage === value, value);
  const finish = async (x, y) => {
    await stage('idle');
    const result = await snapshot();
    assert.deepEqual({ x: result.x, y: result.y, visible: result.visible, alpha: result.alpha, locked: result.locked },
      { x, y, visible: true, alpha: 1, locked: false });
    assert.equal(await page.evaluate(() => __remake.scene.cameras.main.scrollY),
      await page.evaluate((y) => Math.max(0, Math.min(__remake.scene.dataSource.room.Height - 240, y - 110)), y));
  };

  await open('room_ruins8');
  await place(130, 150); // Góc gần khung chữ nhật cũ nhưng chân chưa chạm x=150.
  await page.waitForTimeout(200);
  assert.equal((await snapshot()).locked, false, 'Khoảng cách gần không được thay cho va chạm hố.');
  await place(150, 150); // holedown2 ScaleY=4, vùng từ y=96 tới175.
  await stage('waiting');
  assert.equal((await snapshot()).visible, true, 'Chờ 10 frame trước khi rơi, không ẩn ngay.');
  await key('c'); await key('z');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await stage('falling');
  assert.equal((await snapshot()).alpha, .5);
  assert.equal((await snapshot()).visible, true);
  const downStart = await snapshot();
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.player.y > 210 && __remake.scene.player.y < 500);
  assert.equal((await snapshot()).x, 150, 'Đang rơi không được đi ngang.');
  assert.notEqual((await snapshot()).y, downStart.y, 'Phải di chuyển qua các vị trí trung gian.');
  assert.ok(await page.evaluate(() => __remake.scene.cameras.main.scrollY > 0));
  await page.keyboard.up('ArrowRight');
  await page.screenshot({ path: 'test-results/remake-ruins-falling.png' });
  await finish(150, 550);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHoles.cosmeticHoles.length), 1);

  // Hai lối lên giữ nguyên x và về tầng trên; không phát tiếng rơi xuống.
  for (const x of [70, 230]) {
    const soundCount = await page.evaluate(() => __remake.scene.holeSounds.length);
    await place(x, 480); await stage('waiting');
    assert.equal((await snapshot()).visible, true);
    await stage('rising');
    assert.equal((await snapshot()).visible, false);
    assert.equal((await snapshot()).facing, 'd');
    await page.waitForFunction(() => __remake.scene.player.y < 350 && __remake.scene.player.y > 100);
    assert.equal((await snapshot()).x, x);
    await finish(x, 80);
    assert.equal(await page.evaluate(() => __remake.scene.holeSounds.length), soundCount);
  }

  await open('room_ruins10');
  // Bảng vô hình lấy vùng tương tác gốc, lời khác nhau giữa hai tầng.
  await place(430, 140);
  await page.evaluate(() => { __remake.scene.player.facing = 'l'; __remake.scene.interactionCooldown = 0; });
  await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  for (const [y, line] of [[140, "* Didn't you read the sign\n  downstairs?"], [540, "* Please don't step on the\n  leaves."]]) {
    await place(430, y);
    await page.evaluate(() => { __remake.scene.player.facing = 'r'; __remake.scene.interactionCooldown = 0; });
    await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
    assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), [line]);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.type), 'BitmapText');
    await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.plot), 9.2);
  }
  // Các pixel đen có alpha 255 trong spr_holemask phải an toàn.
  await place(325, 180);
  await page.waitForTimeout(200);
  assert.equal((await snapshot()).locked, false, 'Vùng đen trong mask không kích hoạt hố.');
  // Pixel trắng ở xa tọa độ object vẫn thuộc vùng sàn sập.
  await place(500, 180); await stage('waiting');
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHoles.hole.item.ObjectName), 'obj_holedown');
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHoles.cosmeticHoles.length), 1);
  await stage('falling');
  const firstFacing = (await snapshot()).facing;
  await page.waitForFunction((facing) => __remake.scene.player.facing !== facing, firstFacing);
  await finish(500, 580);
  assert.ok(await page.evaluate(() => __remake.scene.holeSounds.includes('snd_noise') && __remake.scene.holeSounds.includes('snd_fall2')));

  // Nhánh 11 lần sập: giữ người chơi trên tầng trên, xóa dấu hố và tắt riêng hố hiện tại.
  for (let count = 2; count <= 10; count++) {
    await place(500, 180); await stage('falling');
    await finish(500, 580);
    assert.equal(await page.evaluate(() => __remake.scene.ruinsHoles.cosmeticHoles.length), count);
  }
  await place(500, 180);
  await page.waitForFunction(() => __remake.scene.ruinsHoles.holes[0].body.disabled === true);
  assert.equal((await snapshot()).locked, false);
  assert.equal((await snapshot()).y, 180);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHoles.cosmeticHoles.length), 0);
  assert.ok(await page.evaluate(() => __remake.scene.holeSounds.includes('snd_hero')));
  // Hố thứ hai vẫn hoạt động, vào lại phòng khôi phục cả hai.
  await place(180, 280); await stage('falling'); await finish(180, 680);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_ruins10', 'obj_markerA'); });
  assert.ok(await page.evaluate(() => __remake.scene.ruinsHoles.holes.every(({ body }) => !body.disabled)));
  await place(160, 480); await stage('rising'); await finish(160, 80);
  await page.evaluate(() => { __remake.scene.restoreHoleSound(); delete __remake.scene.restoreHoleSound; });
  console.log('✓ hố Ruins 8/10: mask, scale, hai bảng đúng hướng/lời gốc, chờ/xoay/alpha/âm thanh, lên/xuống 400 pixel, camera/khóa điều khiển và nhánh 11 lần sập');
}
