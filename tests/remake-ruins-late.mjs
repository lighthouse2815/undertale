import assert from 'node:assert/strict';

export async function testRuinsLate(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const place = async (x, y, facing = 'r') => page.evaluate(({ x, y, facing }) => {
    const world = __remake.scene;
    world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, { x, y, facing });
  const stage = async (value) => page.waitForFunction((value) => __remake.scene.ruinsGoofyrock.stage === value, value);
  const position = () => page.evaluate(() => ({ x: __remake.scene.ruinsGoofyrock.rock.x, y: __remake.scene.ruinsGoofyrock.rock.y }));
  const wall = () => page.evaluate(() => __remake.scene.colliders.find((body) => body.objectName === 'obj_plotwall5').disabled);
  const spikes = () => page.evaluate(() => __remake.scene.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room').every(({ image }) => image.texture.key === 'spr_spiketile:1'));
  const close = async () => {
    await page.waitForFunction(() => !!__remake.scene.dialogue);
    const count = await page.evaluate(() => __remake.scene.dialogue.lines.length);
    for (let i = 0; i < count; i++) await key('z');
  };
  const interact = async (x, y, facing) => {
    await place(x, y, facing); await key('z');
    await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 9.2; world.flags = { 35: 1, 33: 0 }; world.inventory = [];
    await world.openRoom('room_ruins9', 'obj_markerB');
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins10');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  await place(238, 138);
  await page.waitForFunction(() => __remake.scene.ruinsHoles.cooldown > 0);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  await place(540, 230);
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins11');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 120 });

  // Hai viên thường chốt riêng cờ 31/32, không được mở gai của Goofyrock.
  for (const [y, flag] of [[125, 31], [85, 32]]) {
    await place(160, y);
    await page.keyboard.down('ArrowRight'); await page.waitForFunction((flag) => __remake.scene.flags[flag] === 1, flag); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate((flag) => __remake.scene.ruinsRock.rocks.find((rock) => rock.flag === flag).entry.image.x, flag), 280);
    assert.equal(await wall(), false); assert.equal(await spikes(), false);
  }
  // Chạm đá tự mở hội thoại, không cần Z.
  await place(190, 165);
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /WHOA there/);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsGoofyrock.stage), 1);
  await close();
  assert.equal(await page.evaluate(() => __remake.scene.ruinsGoofyrock.stage), 2);
  const during = await position(); assert.ok(during.x > 220 && during.x < 230);
  const frozen = await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  await page.keyboard.down('ArrowUp'); await key('c'); await page.waitForTimeout(80); await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), frozen, 'Khóa đi/menu lúc đá đang dời.');
  await stage(3); assert.deepEqual(await position(), { x: 230, y: 175 });
  await interact(205, 165); await close(); await stage(6);
  assert.deepEqual(await position(), { x: 230, y: 165 }, 'Lần thứ hai đá đi lên, không nhảy sang phải.');
  // Đứng bên phải và phía dưới đường đá: nhường xuống rồi sang phải theo Alarm2.
  await interact(248, 157, 'l'); await close();
  await page.waitForFunction(() => __remake.scene.player.y > 160);
  await stage(9); assert.deepEqual(await position(), { x: 280, y: 175 });
  assert.ok(await page.evaluate(() => __remake.scene.player.x > 290));
  assert.equal(await wall(), true); assert.equal(await spikes(), true);
  assert.equal(await page.evaluate(() => __remake.scene.flags[33]), 0);

  // Hỏi "Was that helpful?" không tự tăng sang bước kế tiếp.
  for (let i = 0; i < 2; i++) {
    await interact(300, 165, 'l');
    assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ['* Was that helpful?']);
    await close(); await stage(9); assert.deepEqual(await position(), { x: 280, y: 175 });
  }
  await place(300, 120);
  await page.keyboard.down('ArrowRight'); await stage(11);
  assert.equal(await spikes(), false);
  await stage(12); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await position(), { x: 260, y: 175 });
  assert.equal(await wall(), false);
  assert.ok(await page.evaluate(() => __remake.scene.player.x <= 360), 'Activator dựng lại tường trước gai.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[33]), 0);

  await interact(285, 165, 'l');
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /STAY there/);
  await close(); await stage(15);
  assert.deepEqual(await position(), { x: 280, y: 175 });
  assert.equal(await wall(), true); assert.equal(await spikes(), true);
  assert.equal(await page.evaluate(() => __remake.scene.flags[33]), 1);
  await interact(300, 165, 'l');
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ["* Aren't things easier when\n  you just ask?"]);
  await close();
  await page.evaluate(() => { __remake.scene.flags[7] = 1; });
  await interact(300, 165, 'l');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /exit's open/); await close();

  await page.evaluate(async () => { const world = __remake.scene; world.saveGame(); await world.restoreGame(); });
  await stage(15); assert.deepEqual(await position(), { x: 280, y: 175 });
  assert.equal(await wall(), true); assert.equal(await spikes(), true);
  assert.deepEqual(await page.evaluate(() => __remake.scene.ruinsRock.rocks.map((rock) => ({ flag: rock.flag, x: rock.entry.image.x, pushed: rock.pushed }))),
    [{ flag: 31, x: 280, pushed: true }, { flag: 32, x: 280, pushed: true }]);
  assert.equal(await page.evaluate(() => __remake.scene.dataSource.room.GameObjects.find((item) => item.ObjectName === 'obj_goofyrock').X), 220);
  // Collider đi cùng đá: chạm vị trí cuối, không còn tương tác ở chỗ khởi đầu.
  await place(190, 165); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await place(250, 165);
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /exit's open/); await close();
  await page.screenshot({ path: 'test-results/remake-goofyrock.png' });
  console.log('✓ phòng 10 hố/cửa; ba đá phòng 11, path/chuyển động/va chạm, nhường đường, activator/lùi đá/gai/tường, cờ 31–33, thoại thường/kết thúc và lưu/nạp');
}
