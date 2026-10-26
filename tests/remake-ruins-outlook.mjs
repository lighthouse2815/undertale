import assert from 'node:assert/strict';

export async function testRuinsOutlook(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'd') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const open = async (room, flags = {}, kills = 0) => page.evaluate(async ([room, flags, kills]) => {
    const world = __remake.scene; world.flags = flags; world.kills = kills; world.plot = 16; world.inventory = [];
    await world.openRoom(room, 'obj_markerA');
  }, [room, flags, kills]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 16; world.flags = {}; world.kills = 0; world.inventory = [];
    world.weapon = 3; world.weaponStrength = 0; await world.openRoom('room_ruins15D', 'obj_markerD');
  });
  await door(355, 160, 'ArrowRight', 'room_ruins16', [20, 280]);
  await door(20, 280, 'ArrowLeft', 'room_ruins15D', [360, 160]);
  await door(355, 160, 'ArrowRight', 'room_ruins16', [20, 280]);
  await door(555, 280, 'ArrowRight', 'room_ruins17', [20, 120]);
  await place(102, 70, 'r'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await place(102, 70, 'l'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.type), 'BitmapText');
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), [
    '* Ribbit, ribbit.\n* (Just between you and me...)',
    '* (I saw TORIEL come out of\n  here just a little\n  while ago.)',
    '* (She was carrying some\n  groceries.)',
    "* (I didn't ask what they\n  were for...)",
    "* (We're all too intimidated\n  to talk to her.)\n* Ribbit.",
  ]);
  await drain();
  await place(102, 70, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(250); await page.keyboard.up('ArrowLeft');
  assert.ok(await page.evaluate(() => __remake.scene.player.x >= 99), 'Froggit phải chặn nhân vật theo phần chân.');
  const frame = await page.evaluate(() => __remake.scene.ruinsOutlook.entry.image.texture.key);
  await page.waitForFunction((frame) => __remake.scene.ruinsOutlook.entry.image.texture.key !== frame, frame);
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu');
  const menuFrame = await page.evaluate(() => __remake.scene.world.ruinsOutlook.entry.image.texture.key);
  await page.waitForFunction((frame) => __remake.scene.world.ruinsOutlook.entry.image.texture.key !== frame, menuFrame);
  await key('x'); await page.waitForFunction(() => __remake.phase === 'running');
  await door(150, 78, 'ArrowUp', 'room_ruins18OLD', [150, 180]);
  await page.evaluate(() => { __remake.scene.inventory = Array(8).fill(1); });
  await place(28, 166, 'r'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* You are carrying too\n  much.'); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory.length, __remake.scene.flags[102] ?? 0, __remake.scene.ruinsOutlook.body.disabled ?? false]), [8, 0, false]);
  await place(24, 166, 'r'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x <= 24), 'Toy Knife chưa nhặt vẫn phải chặn đường.');
  await page.evaluate(() => { __remake.scene.inventory.pop(); });
  await place(28, 166, 'l'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await place(28, 166, 'r'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* You found the Toy Knife.');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory.at(-1), __remake.scene.flags[102]]), [13, 1]);
  await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'running', 'Không mở túi khi đang đọc lời nhặt dao.');
  await drain();
  assert.equal(await page.evaluate(() => __remake.scene.ruinsOutlook.entry), null);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsOutlook.body.disabled), true);
  await place(24, 166, 'r'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x > 44), 'Nhặt xong phải bỏ collider dao.');
  // Dùng dao thật qua ITEM: thay Stick trong đúng ô, giữ sức đánh khi lưu/nạp.
  await page.evaluate(() => { __remake.scene.menuSelection = 0; }); await key('c'); await page.waitForFunction(() => __remake.phase === 'menu');
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'items');
  for (let i = 0; i < 7; i++) await key('ArrowDown');
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'action'); await key('z');
  await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.weapon, __remake.scene.weaponStrength, __remake.scene.inventory.at(-1)]), [13, 3, 3]); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_ruins18OLD');
  await page.evaluate(async () => {
    const world = __remake.scene; world.inventory = []; world.flags = {}; world.weapon = 3; world.weaponStrength = 0;
    await world.restoreGame();
  });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.weapon, __remake.scene.weaponStrength, __remake.scene.inventory.at(-1), __remake.scene.flags[102], __remake.scene.ruinsOutlook.entry]), [13, 3, 3, 1, null]);
  await door(150, 180, 'ArrowDown', 'room_ruins17', [150, 78]);
  await door(150, 78, 'ArrowUp', 'room_ruins18OLD', [150, 180]);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_knife_pickup')), false);
  await door(150, 180, 'ArrowDown', 'room_ruins17', [150, 78]);
  await door(20, 120, 'ArrowLeft', 'room_ruins16', [560, 280]);
  for (const [flags, count, phrase] of [[{ 6: 1 }, 5, 'disappointed'], [{ 7: 1 }, 4, "barrier's open"], [{ 6: 1, 7: 1 }, 5, 'disappointed']]) {
    await open('room_ruins17', flags); await place(102, 70, 'l'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count);
    assert.match(await page.evaluate(() => __remake.scene.dialogue.lines.join('\n')), new RegExp(phrase)); await drain();
  }
  await open('room_ruins17', {}, 1);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsOutlook.entry), null);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsOutlook.body.disabled), true);
  await place(102, 70, 'l'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 85), 'Froggit vắng mặt không được để collider lại.');
  await open('room_ruins17'); await page.evaluate(() => { __remake.scene.kills = 1; });
  await page.waitForFunction(() => __remake.scene.ruinsOutlook.entry === null);
  console.log('✓ Ruins 16/17/18OLD: cửa C/D và nhánh phụ hai chiều, Froggit/animation/ba lời gốc/kill, Toy Knife/túi đầy/va chạm/hướng, ITEM đổi vũ khí và lưu/nạp không nhặt lại');
}
