import assert from 'node:assert/strict';

export async function testRuins14(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const open = async (flags = {}) => page.evaluate(async (flags) => {
    const world = __remake.scene; world.plot = 12; world.flags = flags; world.inventory = []; world.hp = 20; world.maxHp = 20;
    world.armor = 4; world.armorDefense = 0;
    await world.openRoom('room_ruins14', 'obj_markerA');
  }, flags);
  const place = async (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const stand = async (name, index = 0, facing = 'r') => page.evaluate(([name, index, facing]) => {
    const world = __remake.scene, entry = world.roomObjects.filter(({ item }) => item.ObjectName === name)[index];
    // Hốc Ribbon hẹp: đứng sát bên trái vật phẩm, tránh đặt Frisk vào tường x=140–159.
    world.player.setPosition(entry.item.X + entry.sprite.MarginLeft - (name === 'obj_ribbon_pickup' ? 20 : 30), entry.item.Y + entry.sprite.MarginTop - 24);
    world.player.facing = facing; world.interactionCooldown = 0; world.updateCamera();
  }, [name, index, facing]);
  const drain = async () => {
    while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z');
  };
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 12; world.flags = {}; await world.openRoom('room_ruins13', 'obj_markerB');
  });
  await door(595, 160, 'ArrowRight', 'room_ruins14', [20, 100]);
  await door(20, 100, 'ArrowLeft', 'room_ruins13', [600, 160]);
  await open({ 36: 1 });
  await stand('obj_readable_room1', 0, 'l'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await stand('obj_readable_room1'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* There is just one switch.');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.type), 'BitmapText'); await drain();

  // Hố xuống dùng mask thật; các lối lên tầng xa đi 510 pixel thay vì 400.
  const down = await page.evaluate(async () => {
    const world = __remake.scene, { blocked } = await import('/src/movement.mjs');
    const body = world.ruinsHoles.holes[0].body;
    for (let y = 110; y < 200; y += 3) for (let x = 280; x < 400; x += 3) if (blocked(world, [body], x, y)) {
      world.player.setPosition(x, y); return [x, y];
    }
  });
  assert.ok(down);
  await page.waitForFunction(() => __remake.scene.ruinsHoles.stage === 'falling');
  assert.equal(await page.evaluate(() => __remake.scene.player.alpha), .5);
  await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await page.waitForFunction(() => !__remake.scene.ruinsHoles.locked);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [down[0], down[1] + 400]);
  const ups = await page.evaluate(() => __remake.scene.ruinsHoles.holes.slice(1).map(({ item }) => [item.X, item.Y - 4]));
  for (const [x, y] of ups) {
    await place(x, y); await page.waitForFunction(() => __remake.scene.ruinsHoles.stage === 'rising');
    assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
    await page.waitForFunction(() => !__remake.scene.ruinsHoles.locked);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.player.visible]), [x, y - (y > 550 ? 510 : 400), true]);
  }
  await place(570, 160); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 581), 'Tường plotwall6 phải chặn lối ra trước khi nhấn công tắc.');
  await stand('obj_plotswitch3', 0, 'l'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 12);
  await stand('obj_plotswitch3'); await key('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.ruins14.wall.disabled, __remake.scene.ruins14.button.image.texture.key]), [13, true, 'spr_switch:1']);
  assert.ok(await page.evaluate(() => __remake.scene.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room').every((entry) => entry.image.texture.key === 'spr_spiketile:1')));
  const lockedPosition = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), lockedPosition);
  await page.waitForFunction(() => !__remake.scene.ruins14.locked);
  await place(570, 160); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x > 585));

  await page.evaluate(() => { __remake.scene.inventory = Array(8).fill(1); });
  await stand('obj_ribbon_pickup');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 162), 'Ribbon còn nằm dưới đất phải có va chạm.');
  await stand('obj_ribbon_pickup'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /carrying too/); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory.length, __remake.scene.flags[100] ?? 0]), [8, 0]);
  await page.evaluate(() => { __remake.scene.inventory.pop(); });
  await stand('obj_ribbon_pickup'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Faded Ribbon/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory.at(-1), __remake.scene.flags[100]]), [12, 1]);
  await drain();
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_ribbon_pickup')), false);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x > 180), 'Nhặt Ribbon xong phải bỏ va chạm của vật phẩm.');

  await stand('obj_napstablook2'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 4); await drain();
  await page.waitForFunction(() => __remake.scene.flags[36] === 2);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_napstablook2')), false);
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_ruins14');
  await page.evaluate(async () => { const world = __remake.scene; world.flags = {}; world.plot = 0; world.inventory = []; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.room, __remake.scene.plot, __remake.scene.inventory.at(-1), __remake.scene.flags[36], __remake.scene.ruins14.wall.disabled]), ['room_ruins14', 13, 12, 2, true]);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => ['obj_napstablook2', 'obj_ribbon_pickup'].includes(item.ObjectName))), false);

  // Cả hai Vegetoid mở trận thật; biến mất trong lần ghé hiện tại, trở lại khi vào lại phòng.
  for (let i = 0; i < 2; i++) {
    await stand('obj_vegetoid_overworld'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.ruins14.locked), true);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.monster === 'vegetoid' && __remake.scene.music?.isPlaying);
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[200]), 202);
    await key('ArrowRight'); await key('ArrowRight'); await key('ArrowRight'); await key('z'); await key('ArrowDown'); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages'); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running');
    assert.equal(await page.evaluate(() => __remake.scene.roomObjects.filter(({ item }) => item.ObjectName === 'obj_vegetoid_overworld').length), 1 - i);
  }
  await open({ 36: 1 });
  assert.equal(await page.evaluate(() => __remake.scene.ruins14.entries.filter((entry) => entry.item.ObjectName === 'obj_vegetoid_overworld' && !entry.removed).length), 2);
  for (const flags of [{ 36: 1, 202: 16 }, { 36: 1, 7: 1 }, { 36: 2, 202: 12 }]) {
    await open(flags);
    assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => ['obj_napstablook2', 'obj_vegetoid_overworld'].includes(item.ObjectName))), false);
    assert.ok(await page.evaluate(() => __remake.scene.ruins14.entries.filter((entry) => entry.removed).every((entry) => entry.body.disabled)));
  }
  console.log('✓ phòng 14: cửa 13 hai chiều, mask hố/6 lối lên 400–510 pixel, biển/công tắc/gai/tường, Ribbon/túi đầy, Napstablook/cờ, lưu/nạp và hai trận Vegetoid thật');
}
