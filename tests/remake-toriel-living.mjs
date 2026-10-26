import assert from 'node:assert/strict';

export async function testTorielLiving(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, [x, y, facing]);
  const open = (plot = 19, flags = {}) => page.evaluate(async ([plot, flags]) => {
    const world = __remake.scene; world.plot = plot; world.flags = flags;
    await world.openRoom('room_torhouse2', 'obj_markerA');
  }, [plot, flags]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue && !__remake.scene.dialogue.choice)) await key('z'); };
  const choose = async (index) => {
    await page.waitForFunction(() => !!__remake.scene.dialogue?.choice); await page.waitForTimeout(120);
    if (index === 1) await key('ArrowRight'); await key('z');
  };
  const talk = async () => { await place(134, 87); await key('z'); };
  const read = async (x, y, expression, facing = 'u') => {
    await place(x, y, facing); await key('z');
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), expression); await drain();
  };
  const move = async (x, y, direction, room) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 19; world.flags = {}; await world.openRoom('room_torhouse1', 'obj_markerA');
    world.livingTracks = [...world.houseMusic];
  });
  await move(25, 140, 'ArrowLeft', 'room_torhouse2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [280, 160]);
  assert.ok(await page.evaluate(() => __remake.scene.houseMusic.every((sound, i) => sound === __remake.scene.livingTracks[i])));
  await read(278, 40, /filed down/);
  await place(226, 44); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 6); await drain();
  await read(164, 60, /pleasantly warm/);
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu');
  const frame = await page.evaluate(() => __remake.scene.world.torielLiving.fire.image.texture.key);
  await page.waitForFunction((frame) => __remake.scene.world.torielLiving.fire.image.texture.key !== frame, frame);
  await key('x'); await page.waitForFunction(() => __remake.phase === 'running');
  await talk(); assert.ok(await page.evaluate(() => __remake.scene.children.list.some((entry) => entry.active && entry.texture?.key === 'spr_face_torielglasses:0'))); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Hello there/); await drain();
  await choose(0); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.1);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Sweet dreams/); await drain();
  await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /stay/); await drain();
  await choose(0); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.2); await drain();
  await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /hello/); await drain();
  await choose(0); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.3);
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torieltalk:0'); await drain();
  await choose(0); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.4); await drain();
  await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /What is it/);
  await choose(0); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /just ask/); await drain();
  await page.evaluate(() => __remake.scene.saveGame());
  await page.evaluate(async () => { __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.plot), 19.4);
  await talk(); await choose(1); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.9);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Stay here/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 20);
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.locked), true);
  const frozen = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await page.keyboard.down('ArrowRight'); await key('c'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), frozen);
  await page.waitForFunction(() => __remake.scene.plot === 21);
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.chair.image.texture.key), 'spr_chairempty:0');
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.chair.body.sprite.MarginLeft), 8);
  await page.waitForFunction(() => __remake.scene.torielLiving.stage === 'idle');
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.npc.active), false);
  await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /right size/); await drain();
  // Nhánh bỏ ngủ đi thẳng tới hỏi về nhà, rồi lảng sang sách và đủ bốn câu ngẫu nhiên.
  await open(); await talk(); await drain(); await choose(1); assert.equal(await page.evaluate(() => __remake.scene.plot), 19.1); await drain();
  await choose(1); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /home now/); await drain();
  await choose(1); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Um/); await drain(); await choose(1); await drain();
  await page.waitForFunction(() => __remake.scene.plot === 21);
  for (const [index, expression] of [[0, /radula/], [1, /digestive/], [2, /shoelaces/], [3, /Slowly/]]) {
    await open(19.3); await page.evaluate((index) => { window.savedRandom = Math.random; Math.random = () => index / 3; }, index);
    await talk(); await page.evaluate(() => { Math.random = savedRandom; delete window.savedRandom; });
    assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[2]), expression);
    await drain(); await choose(0); await drain();
  }
  await open(19, { 103: 1 }); await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Up already/); await drain(); await choose(0); await drain();
  await move(56, 32, 'ArrowUp', 'room_kitchen');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [58, 180]);
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.pie.image.texture.key), 'spr_bigpie:1');
  await read(30, 120, /chocolate/); await read(64, 120, /white fur/); await read(122, 120, /intimidates/);
  await read(92, 120, /cookie cutters/); await read(150, 120, /fire\n  magic/);
  await page.evaluate(() => { __remake.scene.flags[202] = 20; __remake.scene.flags[45] = 4; __remake.scene.flags[7] = 1; });
  await read(92, 120, /knives/); await read(150, 120, /anymore/); await read(122, 120, /dog prints/);
  await move(58, 180, 'ArrowDown', 'room_torhouse2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [56, 32]);
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.fire.image.active), false);
  await open(22); await talk(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /right size/); await drain();
  await move(280, 160, 'ArrowRight', 'room_torhouse1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 160]);
  await page.evaluate(async () => { const world = __remake.scene; world.flags = {}; world.plot = 19; await world.openRoom('room_kitchen', 'obj_markerX'); });
  assert.equal(await page.evaluate(() => __remake.scene.torielLiving.pie.image.texture.key), 'spr_bigpie:0');
  await read(122, 120, /Too hot/); assert.equal(await page.evaluate(() => __remake.scene.flags[103] ?? 0), 0);
  console.log('✓ phòng khách/bếp: cửa/nhạc, sách/lửa/animation menu, toàn bộ lựa chọn plot 19–21/bốn câu ốc, đứng dậy/path/collider/khóa/lưu nạp, bánh và đồ bếp theo cờ');
}
