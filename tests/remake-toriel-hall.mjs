import assert from 'node:assert/strict';

export async function testTorielHall(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const open = async (plot = 18, flags = {}) => page.evaluate(async ([plot, flags]) => {
    const world = __remake.scene; world.plot = plot; world.flags = flags; await world.openRoom('room_torhouse1', 'obj_markerA');
  }, [plot, flags]);
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 17; world.flags = {}; await world.openRoom('room_ruins19', 'obj_markerB');
  });
  await door(150, 180, 'ArrowUp', 'room_torhouse1', [150, 198]);
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 7);
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.type), 'BitmapText');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* Do you smell that?');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.torielHall.introNpc.x, __remake.scene.torielHall.introNpc.y]), [140, 120]);
  assert.deepEqual(await page.evaluate(() => __remake.scene.torielHall.music.map((music) => [music.key, music.isPlaying, Number(music.volume.toFixed(4)), music.rate])), [['mus_house1', true, 1, 1], ['mus_house2', true, .01, 1]]);
  await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.plot]), [150, 198, 17]);
  await key('z'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* It is a butterscotch-\n  cinnamon pie.'); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 18);
  await page.waitForFunction(() => __remake.scene.torielHall.introNpc.x > 160 && __remake.scene.torielHall.introNpc.x < 260);
  assert.equal(await page.evaluate(() => __remake.scene.torielHall.introNpc.y), 120);
  await page.waitForFunction(() => !__remake.scene.torielHall.introNpc.active);
  assert.equal(await page.evaluate(() => __remake.scene.torielHall.introNpc.x < 314), true, 'Toriel biến mất khi phần chân chạm toribuster, trước điểm cuối path.');
  await place(254, 60, 'd'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await place(254, 60); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* These books are worn...\n* They must have been read\n  many times.'); await drain();
  await place(100, 150); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y >= 123), 'Lan can phải chặn Frisk từ phía dưới.');
  assert.equal(await page.evaluate(() => __remake.scene.colliders.find((body) => body.objectName === 'obj_staircollission').mask), 'spr_stairmask:mask');
  // Một bậc riêng trên phần sàn hợp lệ; mỗi hướng chỉ dịch y một lần khi còn đứng trên bậc.
  await place(200, 41, 'r'); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 40);
  await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.player.y), 40);
  await page.evaluate(() => { __remake.scene.player.facing = 'l'; }); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 41);
  await place(240, 80, 'r'); await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.player.y), 80);
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_torhouse1');
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 0; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.torielHall.stage, __remake.scene.dialogue]), [18, 'complete', null]);
  // Cửa musicfade hạ âm lượng trong lúc chuyển, rồi dọn hai lớp nhạc khi về sân.
  await place(150, 198); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.scene.torielHall?.music[0].volume < .8);
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins19');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 180]);
  await page.waitForFunction(() => ['mus_house1', 'mus_house2'].every((key) => __remake.game.sound.getAll(key).length === 0));
  await door(150, 180, 'ArrowUp', 'room_torhouse1', [150, 198]);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  assert.equal(await page.evaluate(() => __remake.scene.torielHall.npcs.length), 0);
  await open(17, { 6: 1 }); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 8);
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torieltalkside:0');
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torielhappytalk:0');
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* I have baked a snail\n  pie.'); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 18);
  for (const plot of [18, 19]) {
    await open(plot, { 45: 1 });
    await page.waitForFunction(() => __remake.scene.torielHall.npcs.length === 1);
    assert.equal(await page.evaluate(() => __remake.scene.flags[45]), 0);
    await page.waitForFunction(() => __remake.scene.torielHall.npcs[0].y > 85 && __remake.scene.torielHall.npcs[0].y < 115);
    assert.equal(await page.evaluate(() => __remake.scene.torielHall.npcs[0].x), 240);
    await page.waitForFunction((plot) => {
      const npc = __remake.scene.torielHall.npcs[0]; return npc.y === 120 && (plot < 19 ? npc.x > 260 : npc.x < 220);
    }, plot);
    await page.waitForFunction(() => !__remake.scene.torielHall.npcs[0].active);
    assert.equal(await page.evaluate(() => __remake.scene.plot), plot);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  }
  await open(20, { 45: 4 });
  await page.waitForFunction(() => __remake.scene.torielHall.music[1].volume < .02);
  assert.deepEqual(await page.evaluate(() => __remake.scene.torielHall.music.map((music) => [music.key, music.rate, Number(music.volume.toFixed(4))])), [['mus_toriel', .4, 1], ['mus_toriel', .4, .01]]);
  await open(20, { 45: 4, 7: 1 });
  assert.deepEqual(await page.evaluate(() => __remake.scene.torielHall.music.map((music) => [music.key, music.rate, music.volume])), [['mus_reunited', 1, 1]]);
  await open(18, { 45: 1 });
  await page.waitForFunction(() => __remake.scene.torielHall.npcs.length === 1);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_ruins16', 'obj_markerX'); });
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(() => __remake.scene.torielHall), null);
  assert.equal(await page.evaluate(() => ['mus_house1', 'mus_house2', 'mus_toriel', 'mus_reunited'].reduce((n, key) => n + __remake.game.sound.getAll(key).length, 0)), 0);
  console.log('✓ sảnh Toriel: cửa sân hai chiều/fade nhạc, thoại thường/Hard Mode, plot 18/không lặp/lưu nạp, path/buster/cờ 45 hai hướng, sách/lan can/bậc thang và hai lớp nhạc/nhạc chậm/Reunited');
}
