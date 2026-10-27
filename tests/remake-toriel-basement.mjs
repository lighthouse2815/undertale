import assert from 'node:assert/strict';

export async function testTorielBasement(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const open = (room = 'room_basement1', plot = 21, flags = {}) => page.evaluate(async ([room, plot, flags]) => {
    const world = __remake.scene; world.plot = plot; world.flags = flags; await world.openRoom(room, 'obj_markerX');
  }, [room, plot, flags]);
  const move = async (x, y, direction, room) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.room === room && __remake.phase === 'running', room);
  };
  const warning = async (x = 270, y = 120) => {
    await place(x, y); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => __remake.scene.torielBasement.locked); await page.keyboard.up('ArrowRight');
    await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 21; world.flags = {}; await world.openRoom('room_torhouse1'); });
  // Đi hết cầu thang chữ U: trái trên bậc, xuống chiếu nghỉ rồi quay phải.
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.player.x >= 240); await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.scene.player.y <= 60); await page.keyboard.up('ArrowUp');
  await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(() => __remake.scene.player.x <= 108); await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.scene.player.y >= 98); await page.keyboard.up('ArrowDown');
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.room === 'room_basement1' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [95, 113]);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.basementMusic.key, __remake.scene.basementMusic.rate]), ['mus_intronoise', .3]);
  await page.waitForFunction(() => Math.abs(__remake.scene.basementMusic.volume - .4) < 1e-6);
  assert.ok(await page.evaluate(() => Math.abs(__remake.scene.basementMusic.volume - .4) < 1e-6));
  await page.evaluate(() => { __remake.scene.basementTrack = __remake.scene.basementMusic; });
  await warning(320); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 6);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /return "home/);
  const frozen = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await page.keyboard.down('ArrowRight'); await key('c'); await page.waitForTimeout(90); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), frozen);
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.plot), 22);
  assert.equal(await page.evaluate(() => __remake.scene.torielBasement.locked), false);
  await move(450, 120, 'ArrowRight', 'room_basement2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 120]);
  assert.ok(await page.evaluate(() => __remake.scene.basementMusic === __remake.scene.basementTrack));
  await warning(310); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 9);
  assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torielcold:0');
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[6]), /ASGORE/);
  assert.ok(await page.evaluate(() => !__remake.scene.dialogue.lines.some((line) => /\\[RW]/.test(line))));
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.plot), 23);
  await page.evaluate(() => __remake.scene.saveGame());
  await page.evaluate(async () => { __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.plot), 23);
  assert.equal(await page.evaluate(() => !!__remake.scene.torielBasement.npc), false, 'Nạp lại sau cảnh không sinh Toriel cũ.');
  await move(450, 120, 'ArrowRight', 'room_basement3');
  assert.ok(await page.evaluate(() => __remake.scene.basementMusic === __remake.scene.basementTrack));
  await warning(65); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.plot), 24);
  await page.waitForFunction(() => __remake.scene.torielBasement.stage === 'complete');
  assert.equal(await page.evaluate(() => __remake.scene.torielBasement.npc.active), false);
  await move(20, 120, 'ArrowLeft', 'room_basement2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [450, 120]);
  await move(20, 120, 'ArrowLeft', 'room_basement1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [450, 120]);
  // Đường dẫn về nhà phải chạy cùng nhân vật ẩn và giữ cờ lần nhắc.
  for (const [plot, previous, expression] of [[19, 0, /play upstairs/], [19, 4, /nothing/], [19, 9, /\.\.\./], [19, 10, /\.\.\./], [18, 6, /do not go down/]]) {
    await open('room_basement1', plot, { 44: previous });
    await warning(); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), expression);
    assert.equal(await page.evaluate(() => __remake.scene.flags[44]), plot < 19 ? 0 : previous + 1);
    assert.equal(await page.evaluate(() => __remake.scene.flags[45]), 1);
    if (plot < 19) assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
    await drain(); assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
    await page.waitForFunction(() => __remake.room === 'room_torhouse1' && __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.player.visible]), [106, 98, true]);
    await page.waitForFunction(() => __remake.scene.flags[45] === 0);
    assert.equal(await page.evaluate(() => __remake.scene.basementMusic), null);
  }
  await open('room_basement1', 24, { 7: 1 });
  assert.equal(await page.evaluate(() => __remake.scene.basementMusic.key), 'mus_reunited');
  await move(95, 113, 'ArrowUp', 'room_torhouse1');
  assert.equal(await page.evaluate(() => __remake.scene.basementMusic), null);
  assert.equal(await page.evaluate(() => __remake.scene.houseMusic[0].key), 'mus_reunited');
  console.log('✓ basement 1–3: cửa/marker hai chiều, nhạc liên tục/Reunited, cảnh plot 21–24/khóa/path/không lặp/lưu nạp và xuống sớm/dẫn về/cờ 44–45');
}
