import assert from 'node:assert/strict';

export async function testChildBedroom(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0;
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const open = async (plot = 19, flags = {}) => page.evaluate(async ([plot, flags]) => {
    const world = __remake.scene; world.flags = flags; world.plot = plot; world.hp = 5; world.maxHp = 20; world.inventory = [];
    await world.openRoom('room_asrielroom', 'obj_markerC');
  }, [plot, flags]);
  const sleep = async () => {
    await place(172, 123, 'r'); await key('z');
    await page.waitForFunction(() => __remake.scene.childBedroom.stage === 'asleep');
  };
  const awake = async () => {
    await page.waitForFunction(() => __remake.scene.childBedroom.stage === 'idle');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.hp, __remake.scene.childBedroom.locked]), [168, 120, 20, false]);
  };
  const use = async (index = 0) => {
    await page.evaluate(() => { __remake.scene.menuSelection = 0; }); await key('c');
    await page.waitForFunction(() => __remake.phase === 'menu'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'items');
    for (let i = 0; i < index; i++) await key('ArrowDown');
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'action'); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 19; world.flags = {}; await world.openRoom('room_torhouse3', 'obj_markerD');
  });
  await place(150, 140); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.room === 'room_asrielroom' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [192, 182]);
  assert.equal(await page.evaluate(() => __remake.scene.childBedroom.pie.image.active), false);
  await place(214, 152); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /cool toys/); await drain();
  await place(118, 104); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /empty photo frame/); await drain();
  await place(92, 96); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /kids' shoes/); await drain();
  await place(64, 100); await key('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.childBedroom.bright.visible, __remake.scene.childBedroom.dark.visible]), [false, true]);
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu');
  await page.waitForFunction(() => __remake.scene.world.childBedroom.music[1].volume > .9);
  await key('x'); await page.waitForFunction(() => __remake.phase === 'running');
  await place(64, 100); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.childBedroom.bright.visible), true);
  await open(); await sleep();
  await key('c'); await key('z'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.equal(await page.evaluate(() => __remake.scene.childBedroom.stage), 'asleep');
  await page.waitForFunction(() => __remake.scene.childBedroom.stage === 'waking');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.flags[103], __remake.scene.childBedroom.cover.visible]), [200, 104, 1, true]);
  await awake(); assert.equal(await page.evaluate(() => __remake.scene.childBedroom.cover.visible), false);
  await page.evaluate(() => { __remake.scene.inventory = Array(8).fill(1); });
  await place(142, 136); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /carrying too/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[103]), 1);
  await place(121, 118, 'r'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.player.x), 121);
  await page.evaluate(() => { __remake.scene.inventory.pop(); });
  await place(142, 136); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /butterscotch-cinnamon/); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory.at(-1), __remake.scene.flags[103], __remake.scene.childBedroom.pie.body.disabled]), [11, 2, true]);
  await place(121, 118, 'r'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x > 142));
  await page.evaluate(() => { __remake.scene.hp = 1; }); await use(7);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await drain();
  await sleep(); await awake();
  assert.equal(await page.evaluate(() => __remake.scene.childBedroom.pie.image.active), false, 'Ngủ lại không tạo bánh mới sau khi đã lấy.');
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_asrielroom');
  await page.evaluate(async () => { const world = __remake.scene; world.flags = {}; world.inventory = []; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[103], __remake.scene.childBedroom.pie.image.active]), [2, false]);
  await place(192, 182); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_torhouse3');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 140]);
  for (const flags of [{}, { 7: 1 }]) {
    await open(24, flags);
    await place(118, 104); await key('z');
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), flags[7] ? /dusted it off/ : /really dusty/); await drain();
    await sleep();
    await page.waitForFunction(() => __remake.scene.childBedroom.stage === 'dream');
    assert.equal(await page.evaluate(() => __remake.scene.childBedroom.black.alpha), 1);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), flags[7] ? 2 : 3);
    assert.ok(await page.evaluate(() => __remake.scene.dialogueText.depth > __remake.scene.childBedroom.black.depth));
    if (!flags[7]) assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[2]), /future\n  of humans/);
    await drain(); await awake();
    assert.equal(await page.evaluate(() => __remake.scene.flags[103] ?? 0), 0, 'Ngủ sau plot 20 không sinh bánh.');
  }
  await open(19, { 6: 1 }); await sleep(); await awake();
  await place(142, 136); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /snail pie/); await drain();
  assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), [63]);
  await page.evaluate(() => { __remake.scene.hp = 5; }); await use();
  assert.equal(await page.evaluate(() => __remake.scene.hp), 19, 'Snail Pie hồi tới maxHp - 1 theo mã gốc.'); await drain();
  await page.evaluate(() => { __remake.scene.hp = 20; __remake.scene.inventory = [63]; }); await use();
  assert.equal(await page.evaluate(() => __remake.scene.hp), 20, 'Snail Pie không trừ HP khi đã đầy.'); await drain();
  console.log('✓ phòng Frisk: cửa/thoại/đèn/mix khi mở menu, ngủ/path/hồi HP, bốn giai đoạn/giấc mơ, bánh/túi đầy/collider/cờ/lưu nạp, ITEM Pie và Snail Pie Hard Mode');
}
