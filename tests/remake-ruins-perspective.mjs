import assert from 'node:assert/strict';

export async function testRuinsPerspective(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'd') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const open = async (room, plot = 13, flags = {}) => page.evaluate(async ([room, plot, flags]) => {
    const world = __remake.scene; world.plot = plot; world.flags = flags; await world.openRoom(room, 'obj_markerA');
  }, [room, plot, flags]);
  const stand = async (name, facing = 'd') => page.evaluate(([name, facing]) => {
    const world = __remake.scene, { item } = world.roomObjects.find(({ item }) => item.ObjectName === name);
    world.player.setPosition(item.X + 4, item.Y - 26); world.player.facing = facing; world.interactionCooldown = 0; world.updateCamera();
  }, [name, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const choose = async (index) => {
    await page.waitForFunction(() => !!__remake.scene.dialogue?.choice); await page.waitForTimeout(110);
    if (index) await key('ArrowRight'); await key('z');
  };
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await open('room_ruins14');
  await door(595, 160, 'ArrowRight', 'room_ruins15A', [20, 160]);
  await door(20, 160, 'ArrowLeft', 'room_ruins14', [600, 160]);
  await open('room_ruins15A');
  assert.deepEqual(await page.evaluate(() => __remake.scene.ruinsPerspective.switches.map((entry) => entry.image.texture.key)), ['spr_colorswitch:0', 'spr_colorswitch:1', 'spr_colorswitch:2']);
  await stand('obj_readable_room1', 'u'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await stand('obj_readable_room1'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /rotation\n  in perspective/); await drain();
  await stand('obj_greenswitch_1'); await page.keyboard.down('ArrowDown'); await page.waitForTimeout(200); await page.keyboard.up('ArrowDown');
  assert.ok(await page.evaluate(() => __remake.scene.player.y <= 138), 'Công tắc có va chạm thật.');
  for (const name of ['obj_redswitch_1', 'obj_blueswitch_1', 'obj_greenswitch_1']) {
    await stand(name); await key('z'); await choose(0);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* Nothing happened.'); await drain();
  }
  await stand('obj_blueswitch_1'); await key('z'); await choose(1);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.dialogue, __remake.scene.plot, __remake.scene.flags[43]]), [null, 13, 4]);
  await page.evaluate(() => { __remake.scene.flags[43] = 25; });
  await stand('obj_redswitch_1'); await key('z'); await choose(1);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /uncomfortable/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[43]), 26);
  await door(250, 380, 'ArrowDown', 'room_ruins15B', [260, 120]);
  await stand('obj_readable_room1'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /blue switch/); await drain();
  assert.ok(await page.evaluate(() => {
    const world = __remake.scene;
    return world.roomObjects.find(({ item }) => item.ObjectName === 'obj_pillar_1').image.depth
      > world.ruinsPerspective.switches.find(({ item }) => item.ObjectName === 'obj_blueswitch_1').image.depth;
  }), 'Công tắc xanh phải bị cột phía trên che khuất.');
  await place(65, 320); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(300); await page.keyboard.up('ArrowLeft');
  assert.equal(await page.evaluate(() => __remake.room), 'room_ruins15B');
  assert.ok(await page.evaluate(() => __remake.scene.player.x >= 40), 'Chưa giải phải bị tường chặn.');
  for (const [room, name, plot, word] of [
    ['room_ruins15B', 'obj_blueswitch_1', 14, 'blue'],
    ['room_ruins15C', 'obj_redswitch_1', 15, 'red'],
    ['room_ruins15D', 'obj_greenswitch_1', 16, 'green'],
  ]) {
    assert.equal(await page.evaluate(() => __remake.room), room);
    if (room === 'room_ruins15C') {
      await place(120, 145); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
      assert.equal(await page.evaluate(() => __remake.room), room);
      assert.ok(await page.evaluate(() => __remake.scene.player.y >= 114), 'Tường ngang phải khóa lối trên của 15C.');
    }
    if (room === 'room_ruins15D') {
      await place(310, 160); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(500); await page.keyboard.up('ArrowRight');
      assert.ok(await page.evaluate(() => __remake.scene.player.x < 321), 'Tường đứng phải khóa lối phải của 15D.');
    }
    await stand('obj_readable_room1'); await key('z');
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), new RegExp(`${word} switch`)); await drain();
    await stand(name); await key('z'); await choose(1);
    assert.equal(await page.evaluate(() => __remake.scene.plot), plot - 1);
    assert.equal(await page.evaluate(() => __remake.scene.ruinsPerspective.wall.disabled), false);
    await stand(name); await key('z'); await choose(0);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* You hear a clicking sound.'); await drain();
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.ruinsPerspective.wall.disabled]), [plot, true]);
    assert.ok(await page.evaluate(() => __remake.scene.roomObjects.filter(({ item }) => item.ObjectName === 'obj_spikes_room').every((entry) => entry.image.texture.key === 'spr_spiketile:1')));
    await stand(name); await key('z'); await choose(0); await drain();
    assert.equal(await page.evaluate(() => __remake.scene.plot), plot);
    if (room === 'room_ruins15B') await door(20, 320, 'ArrowLeft', 'room_ruins15C', [360, 320]);
    if (room === 'room_ruins15C') await door(120, 120, 'ArrowUp', 'room_ruins15D', [120, 380]);
  }
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_ruins15D');
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 0; world.flags = {}; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.ruinsPerspective.wall.disabled]), [16, true]);
  await door(120, 380, 'ArrowDown', 'room_ruins15C', [120, 120]);
  await door(360, 320, 'ArrowRight', 'room_ruins15B', [20, 320]);
  await door(260, 120, 'ArrowUp', 'room_ruins15A', [250, 380]);

  // Sáu công tắc sai: chờ 30 frame, rơi/mờ 20 frame, về 15E rồi trở lại markerX ở 15A.
  for (const [room, name, count] of [
    ['room_ruins15B', 'obj_redswitch_1', 1], ['room_ruins15B', 'obj_greenswitch_1', 2],
    ['room_ruins15C', 'obj_blueswitch_1', 0], ['room_ruins15C', 'obj_greenswitch_1', 0],
    ['room_ruins15D', 'obj_redswitch_1', 0], ['room_ruins15D', 'obj_blueswitch_1', 0],
  ]) {
    await open(room, 13, { 51: count === 2 ? 1 : 0 });
    await stand(name); const before = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
    await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
    assert.equal(await page.evaluate(() => __remake.scene.ruinsPerspective.stage), 'waiting');
    await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.phase), 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), before);
    await page.waitForFunction(() => __remake.scene.ruinsPerspective?.stage === 'falling');
    assert.equal(await page.evaluate(() => __remake.scene.player.alpha), .5);
    await page.waitForFunction(() => __remake.room === 'room_ruins15E' && __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.player.alpha, __remake.scene.flags[51], __remake.scene.plot]), [150, 115, 1, count, 13]);
    await door(150, 115, 'ArrowUp', 'room_ruins15A', [140, 120]);
  }
  await open('room_ruins15B', 13, { 51: 2 });
  await place(180, 170); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowDown');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /blue switch behind the/);
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 170, 'Vùng gợi ý trả nhân vật về vị trí trước va chạm.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[51]), 2); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[51]), 3);
  await place(180, 185); await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  console.log('✓ Ruins 15A–15E: cửa/góc nhìn, màu/che khuất/va chạm, biển, Yes/No, ba lời giải/plot/gai/tường, sáu bẫy rơi, trở lại, gợi ý hai lần sai, đếm nhấn và lưu/nạp');
}
