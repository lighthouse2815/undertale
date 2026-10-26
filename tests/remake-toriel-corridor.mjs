import assert from 'node:assert/strict';

export async function testTorielCorridor(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const place = async (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing;
    world.interactionCooldown = 0; world.updateCamera();
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const door = async (x, y, direction, room, marker) => {
    await place(x, y); await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 }); await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), marker);
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 18; world.flags = {}; await world.openRoom('room_torhouse1', 'obj_markerD');
  });
  await door(274, 164, 'ArrowRight', 'room_torhouse3', [38, 144]);
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* This is it...');
  await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(150); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.phase, __remake.scene.player.x, __remake.scene.plot]), ['running', 38, 18]);
  await drain(); await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'leading');
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  await page.waitForFunction(() => __remake.scene.player.x > 55 && __remake.scene.player.x < 100);
  assert.equal(await page.evaluate(() => __remake.scene.torielCorridor.npc.texture.key.split(':')[0]), 'spr_toriel_handhold_r');
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 144);
  await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'room');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.torielCorridor.npc.x, __remake.scene.torielCorridor.npc.y, __remake.scene.player.x, __remake.scene.player.y, __remake.scene.player.visible]), [143, 119, 159, 140, true]);
  assert.equal(await page.evaluate(() => __remake.scene.cameras.main.scrollX), 9);
  assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* A room of your own.\n* I hope you like it!');
  await drain(); await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'ruffling');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.visible, __remake.scene.torielCorridor.npc.visible]), [false, false]);
  await page.waitForFunction(() => __remake.scene.torielCorridor.frames >= 10);
  assert.notEqual(await page.evaluate(() => __remake.scene.torielCorridor.ruffle.texture.key), 'spr_toriel_ruffle:0');
  await key('z'); await key('c'); assert.equal(await page.evaluate(() => __remake.scene.torielCorridor.stage), 'ruffling');
  await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'burning');
  assert.equal(await page.evaluate(() => __remake.scene.torielCorridor.frames), 90);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.visible, __remake.scene.torielCorridor.npc.visible, __remake.scene.plot]), [true, true, 18]);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /something burning/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 19);
  await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'complete');
  assert.equal(await page.evaluate(() => __remake.scene.torielCorridor.npc.active), false);
  await door(23, 144, 'ArrowLeft', 'room_torhouse1', [274, 164]);
  await door(274, 164, 'ArrowRight', 'room_torhouse3', [23, 144]);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await place(568, 134); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* "Room under renovations."'); await drain();
  await place(687, 140); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /do not know its name/); await drain();
  await page.evaluate(() => { __remake.scene.flags[50] = 1; }); await place(687, 140); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /water sausage/); await drain();
  await place(537, 140); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /broken crayons/); await drain();
  const name = await page.evaluate(() => __remake.game.registry.get('charname'));
  for (const [flags, phrase] of [[{}, "It's you!"], [{ 7: 1 }, 'Still just you, Frisk.'], [{ 7: 1, 202: 20 }, `It's me, ${name}.`]]) {
    await page.evaluate((flags) => { __remake.scene.flags = flags; }, flags);
    await place(640, 134); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), '* ' + phrase); await drain();
  }
  await place(640, 140, 'd'); await page.waitForTimeout(70);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.torielCorridor.mirror.x, __remake.scene.torielCorridor.mirror.y, __remake.scene.torielCorridor.mirror.texture.key]), [640, 88, 'spr_maincharau:0']);
  await place(640, 160, 'u'); await page.waitForTimeout(70);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.torielCorridor.mirror.y, __remake.scene.torielCorridor.mirror.texture.key]), [73, 'spr_maincharad:0']);
  assert.equal(await page.evaluate(() => __remake.scene.saveGame()?.room), 'room_torhouse3');
  await page.evaluate(async () => { __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.torielCorridor.stage, __remake.scene.dialogue]), [19, 'complete', null]);
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 18; world.flags = {}; await world.openRoom('room_torhouse3', 'obj_markerC'); });
  await page.waitForFunction(() => !!__remake.scene.dialogue); await drain();
  await page.waitForFunction(() => __remake.scene.torielCorridor.stage === 'leading');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_torhouse1', 'obj_markerD'); });
  await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  console.log('✓ hành lang phòng ngủ: cửa sảnh, nắm tay/path/xoa đầu 90 frame, khóa/ẩn/hiện, plot 19/không lặp/lưu nạp, cây/ngăn kéo/biển/gương và phản chiếu');
}
