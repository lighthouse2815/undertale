import assert from 'node:assert/strict';

export async function testSnowdinSpaghetti(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const near = (name, facing = 'u') => page.evaluate(({ name, facing }) => { const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X - e.sprite.OriginX + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y - e.sprite.OriginY + e.sprite.MarginBottom - 8); w.player.facing = facing; w.interactionCooldown = 0;
  }, { name, facing });
  const drain = async () => { const count = await page.evaluate(() => __remake.scene.dialogue.lines.length); for (let i = 0; i < count; i++) await key('z'); };
  const open = (flags = {}) => page.evaluate(async (flags) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = 47; w.gold = 123; w.inventory = [16]; await w.openRoom('room_tundra_spaghetti'); }, flags);
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 47; w.flags = {}; await w.openRoom('room_tundra9'); w.player.setPosition(280, 120); window.spagSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_spaghetti');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === spagSong, __remake.scene.snowdinEncounter]), [20, 120, true, null]);
  await page.screenshot({ path: '.cache/spaghetti-room.png' });
  const frame = await page.evaluate(() => __remake.scene.snowdinSpaghetti.star.image.texture.key);
  await page.waitForFunction((frame) => __remake.scene.snowdinSpaghetti.star.image.texture.key !== frame, frame);
  assert.notEqual(await page.evaluate(() => __remake.scene.snowdinSpaghetti.star.image.texture.key), frame);
  for (const ending of [false, true]) {
    await open(ending ? { 7: 1 } : {});
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), ending ? 'mus_reunited' : 'mus_snowy');
    for (const [name, pattern] of [['obj_spaghetti', ending ? /lukewarm/ : /frozen/], ['obj_microwave', /unplugged/]]) {
      await near(name); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
      assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); await drain();
    }
    await near('obj_spagnot'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), ending ? 5 : 8);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_maintext'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), ending ? /STILL/ : /ENJOY/);
    const count = await page.evaluate(() => __remake.scene.dialogue.lines.length - __remake.scene.dialogue.index); for (let i = 0; i < count; i++) await key('z');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.inventory]), [47, 123, [16]]);
  }
  await open();
  await page.evaluate(() => { const w = __remake.scene, play = w.sound.play; w.mouseCalls = 0; w.restoreMouseSound = () => { w.sound.play = play; }; w.sound.play = function(...args) { if (args[0] === 'snd_movemenu') w.mouseCalls++; return play.apply(this, args); }; });
  await near('obj_mousehole', 'd'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.mouseCalls), 0);
  await near('obj_mousehole'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.mouseCalls), 1); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  assert.equal(await page.evaluate(() => { const w = __remake.scene, play = w.sound.play; let calls = 0; w.sound.stopByKey('snd_movemenu'); w.sound.play = function(...args) { if (args[0] === 'snd_movemenu') calls++; return play.apply(this, args); }; w.snowdinSpaghetti.interact(); w.snowdinSpaghetti.interact(); w.sound.play = play; return calls; }), 1);
  await page.evaluate(() => __remake.scene.restoreMouseSound());
  for (const name of ['obj_spaghetti', 'obj_microwave', 'obj_spagnot']) {
    await near(name); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(200); await page.keyboard.up('ArrowUp');
    assert.ok(await page.evaluate((name) => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === name); return w.player.y + 19 >= c.rectangle.bottom; }, name));
  }
  for (const [flags, pattern, red] of [[{}, /heat/, false], [{ 202: 20, 45: 4, 203: 3 }, /13 left/, true], [{ 26: 5 }, /That comedian/, true], [{ 202: 20, 45: 4, 203: 16 }, /comedian got away/, false], [{ 202: 20, 45: 4, 203: 16, 57: 2 }, /Determination/, false], [{ 202: 20, 45: 4, 27: 1 }, /heat/, false], [{ 26: 16 }, /Determination/, false]]) {
    await page.evaluate((flags) => { const w = __remake.scene; w.flags = flags; w.hp = 3; w.maxHp = 20; }, flags);
    await near('obj_savepoint'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), red ? 'fnt_maintext:red' : 'fnt_maintext'); assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
    await drain(); await page.waitForFunction(() => __remake.phase === 'saving'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Snowdin - Spaghetti'); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running');
  }
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.gold = 0; w.inventory = []; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.inventory]), [47, 123, [16]]);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(20, 120); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra9');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinSpaghetti]), [280, 120, null]);
  console.log('✓ Spaghetti: cửa9↔phòng/nhạc, đĩa/microwave/note8-5trang/font/collider, chuột/hướng/không chồng, SAVE7nhánh/màu/HP/tên file/lưu-nạp/sao động');
}
