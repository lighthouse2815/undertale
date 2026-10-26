import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testCorridor(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(50); };
  const close = async (count) => {
    for (let index = 0; index < count; index++) {
      await page.waitForFunction((index) => __remake.scene.dialogue?.index === index, index);
      await key('z');
    }
  };
  const position = () => page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  await page.evaluate(async () => { __remake.scene.plot = 8.5; await __remake.scene.openRoom('room_ruins6', 'obj_markerA'); });
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.stage), 'waiting');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null, 'Plot 8.5 không phát lại bài học.');
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.filter(({item}) => item.ObjectName === 'obj_toroverworld7').length), 0);
  await page.evaluate(async () => {
    const world = __remake.scene;
    world.plot = 8; world.flags = {}; world.phone = [];
    world.saveGame(); window.corridorRegularSave = localStorage.getItem('undertale-remake-save-v1');
    await world.openRoom('room_ruins6', 'obj_markerA');
  });
  await page.waitForFunction(() => __remake.scene.corridorLesson.stage === 'explaining');
  const entrance = await position();
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await position(), entrance, 'Bài học đầu hành lang khóa di chuyển.');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 5);
  await close(5);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 8.5);
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  assert.equal((await position()).x, 27, 'Tường do Toriel tạo chặn cửa quay lại.');
  await page.waitForTimeout(500);
  assert.ok(await page.evaluate(() => __remake.scene.corridorLesson.runner.image.x > 180));
  await page.evaluate(() => { const world = __remake.scene; world.player.setPosition(2280, 65); world.player.facing = 'r'; world.updateCamera(); });
  await page.waitForTimeout(300); await key('z');
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 1);
  await page.screenshot({ path: join(root, 'test-results/remake-corridor-pillar.png') });
  await close(1);
  await page.evaluate(() => __remake.scene.player.setPosition(2320, 100));
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.corridorLesson.stage === 'returning');
  await page.keyboard.up('ArrowRight');
  assert.deepEqual(await position(), { x: 2320, y: 100 }, 'Trigger hoàn lại bước di chuyển trước khi Toriel trở lại.');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 9);
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.wall.disabled), true, 'Plot 9 gỡ tường phía đầu phòng.');
  const stopped = await position();
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  assert.deepEqual(await position(), stopped);
  await page.waitForFunction(() => __remake.scene.corridorLesson.stage === 'phone' && !!__remake.scene.dialogue);
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.corridorLesson.entry.image.x, y: __remake.scene.corridorLesson.entry.image.y })), { x: 2382, y: 80 });
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 203, 204, 205]);
  await page.screenshot({ path: join(root, 'test-results/remake-corridor-phone.png') });
  await close(10);
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.locked), false);
  assert.equal(await page.evaluate(() => localStorage.getItem('undertale-remake-save-v1') === window.corridorRegularSave), true, 'Lưu tạm không ghi đè SAVE.');
  assert.deepEqual(await page.evaluate(() => { const save = JSON.parse(localStorage.getItem('undertale-remake-temp-v1')); return { plot: save.flags.plot, phone: save.phone }; }),
    { plot: 9, phone: [201, 203, 204, 205] });
  // Chỉ bỏ qua thời gian chờ nhiều phút, vẫn chạy bộ đếm và phím/hộp thoại thật.
  await page.evaluate(() => {
    window.corridorSounds = [];
    const world = __remake.scene, play = world.sound.play.bind(world.sound);
    world.sound.play = (key, ...args) => { window.corridorSounds.push(key); return play(key, ...args); };
  });
  for (const [call, pages] of [8, 12, 11, 13, 13, 13, 4].entries()) {
    await page.evaluate((index) => { const controller = __remake.scene.corridorLesson; controller.dogFrames = (index + 1) * 6000 - 1; controller.elapsed = 0; }, call);
    await page.waitForFunction(() => !!__remake.scene.dialogue);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), pages);
    assert.equal(await page.evaluate(() => __remake.scene.flags[37] ?? 0), call >= 2 ? 1 : 0);
    const frozen = await page.evaluate(() => __remake.scene.corridorLesson.dogFrames);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.dogFrames), frozen, 'Không tính thời gian khi đang đọc cuộc gọi.');
    if (call === 6) assert.equal(frozen, 36400);
    await close(pages);
  }
  assert.equal(await page.evaluate(() => window.corridorSounds.filter((key) => key === 'snd_phone').length), 7);
  assert.equal(await page.evaluate(() => window.corridorSounds.filter((key) => key === 'snd_pombark').length), 2);
  await page.evaluate(() => { __remake.scene.corridorLesson.dogFrames = 41999; });
  await page.waitForFunction(() => __remake.scene.dialogue?.lines.length === 4);
  await close(4);
  assert.equal(await page.evaluate(() => __remake.scene.flags[9] ?? 0), 0, 'Flowey chưa chìm khi ở ngoài camera.');
  await page.evaluate(() => { __remake.scene.player.setPosition(300, 100); __remake.scene.updateCamera(); });
  await page.waitForFunction(() => __remake.scene.corridorLesson.flowey?.anims.isPlaying);
  await page.screenshot({ path: join(root, 'test-results/remake-corridor-flowey.png') });
  await page.waitForFunction(() => __remake.scene.flags[9] === 1);
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.flowey), null);
  await page.evaluate(async () => { __remake.scene.saveGame(); __remake.scene.phone = []; await __remake.scene.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 203, 204, 205]);
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.dogFrames), null, 'Bộ đếm cuộc gọi không tồn tại sau khi tạo lại phòng, như object gốc.');
  assert.equal(await page.evaluate(() => __remake.scene.corridorLesson.entry ?? null), null);
  await page.evaluate(() => __remake.scene.player.setPosition(30, 102));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins5');
  assert.deepEqual(await position(), { x: 1160, y: 100 });
  console.log('✓ Hành lang Toriel, cột ẩn, đường đi, điện thoại, lưu tạm riêng, bảy cuộc gọi/lặp, tiếng chó, Flowey và quay lại phòng trước');
}
