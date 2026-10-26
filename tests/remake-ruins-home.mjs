import assert from 'node:assert/strict';

export async function testRuinsHome(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const open = async (hp = 20, plot = 16, flags = {}) => page.evaluate(async ([hp, plot, flags]) => {
    const world = __remake.scene; world.hp = hp; world.maxHp = 20; world.plot = plot; world.flags = flags;
    await world.openRoom('room_ruins19', 'obj_markerX');
  }, [hp, plot, flags]);
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 16; world.flags = {}; world.hp = 20; world.maxHp = 20;
    await world.openRoom('room_ruins16', 'obj_markerX');
  });
  await door(290, 80, 'ArrowUp', 'room_ruins19', [140, 490]);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.stage), 'waiting');
  await place(140, 460); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* Oh dear, that took\n  longer than I\n  thought it would.');
  assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torieltalkside:0');
  const position = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(150); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), position);
  await drain();
  await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'walking');
  await page.waitForFunction(() => __remake.scene.ruinsHome.npc.y > 250 && __remake.scene.ruinsHome.npc.y < 295);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.npc.x), 140);
  await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'phone');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.ruinsHome.npc.x, __remake.scene.ruinsHome.npc.y, __remake.scene.ruinsHome.npc.texture.key]), [200, 350, 'spr_toriel_d_phone:0']);
  await key('z'); await key('c'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await page.waitForFunction(() => !!__remake.scene.ruinsHome.exc);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.ruinsHome.exc.x, __remake.scene.ruinsHome.exc.y]), [210, 340]);
  await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'greeting');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.ruinsHome.npc.x, __remake.scene.ruinsHome.npc.y]), [140, 440]);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 7);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[1]), /Not a scratch/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.ruinsHome.music.isPaused, __remake.scene.ruinsHome.torielMusic.isPlaying, __remake.scene.ruinsHome.torielMusic.rate]), [true, true, .86]);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 16);
  for (let i = 0; i < 4; i++) await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torielembarrassed:0');
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torielhappytalk:0');
  await drain();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 17);
  await page.waitForFunction(() => !__remake.scene.ruinsHome.locked);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.torielMusic), null);
  await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'complete');
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.npc.active), false);
  await door(140, 490, 'ArrowDown', 'room_ruins16', [290, 80]);
  await page.waitForFunction(() => __remake.game.sound.getAll('mus_ruins').length + __remake.game.sound.getAll('mus_toriel').length === 0);
  await door(290, 80, 'ArrowUp', 'room_ruins19', [140, 490]);
  await place(140, 448); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.stage), 'complete');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);

  for (const [hp, phrase] of [[9, 'I will\n  heal you'], [3, 'Who did this to you'], [4, 'I will\n  heal you']]) {
    await open(hp); await place(140, 448); await page.waitForFunction(() => !!__remake.scene.dialogue); await drain();
    await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'greeting');
    assert.ok(await page.evaluate((phrase) => __remake.scene.dialogue.lines[1].includes(phrase), phrase));
    assert.equal(await page.evaluate(() => __remake.scene.hp), 20, 'Toriel hồi HP ngay khi bắt đầu lời chào.');
    await drain(); await page.waitForFunction(() => !__remake.scene.ruinsHome.locked);
  }
  await open(20, 17);
  await place(140, 410); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y >= 388), 'Thân cây phải chặn chân nhân vật.');
  await place(140, 390); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* Every time this old tree\n  grows any leaves, they fall\n  right off.'); await drain();
  await page.evaluate(() => { __remake.scene.flags[7] = 1; });
  await place(140, 390); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /natural for a tree/); await drain();
  await place(200, 390); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Every time this old tree/); await drain();
  const save = async () => {
    await place(60, 190); await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  await page.evaluate(() => { __remake.scene.flags[7] = 0; __remake.scene.hp = 5; });
  await save(); assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /cute, tidy\n  house/); await drain();
  await page.waitForFunction(() => __remake.phase === 'saving'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Ruins - Home'); await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 0; world.hp = 1; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.room, __remake.scene.plot, __remake.scene.hp, __remake.scene.ruinsHome.stage]), ['room_ruins19', 17, 20, 'complete']);
  const saved = await page.evaluate(() => localStorage.getItem('undertale-remake-save-v1'));
  assert.ok(saved);
  await page.evaluate(() => { __remake.scene.flags[202] = 20; __remake.scene.hp = 2; });
  await save(); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* Determination.'); await drain();
  await page.waitForFunction(() => __remake.phase === 'saving'); await key('ArrowRight'); await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => localStorage.getItem('undertale-remake-save-v1')), saved);
  await open(20, 17, { 221: 1 });
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.music.key), 'mus_toomuch');
  await open(20, 17, { 7: 1, 221: 1 });
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.music.key), 'mus_reunited', 'Nhạc sau kết thúc ưu tiên hơn cờ toomuch.');
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome.music.isPlaying), true);
  // Đổi phòng giữa path phải hủy cả tween, dấu chấm than và âm thanh của controller cũ.
  await open(); await place(140, 448); await page.waitForFunction(() => !!__remake.scene.dialogue); await drain();
  await page.waitForFunction(() => __remake.scene.ruinsHome.stage === 'walking');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_ruins16', 'obj_markerX'); });
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsHome), null);
  assert.equal(await page.evaluate(() => ['mus_ruins', 'mus_toriel', 'mus_toomuch', 'mus_reunited'].reduce((count, key) => count + __remake.game.sound.getAll(key).length, 0)), 0);
  console.log('✓ Ruins 19: cửa 16 hai chiều, trigger/khóa, path/điện thoại/dấu chấm than, 3 nhánh HP/hồi máu, plot 17/không lặp, nhạc/fade/hủy, cây và SAVE Home/lưu nạp/Return');
}
