import assert from 'node:assert/strict';

export async function testSnowdinDogHouse(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 58) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.hp = 7; w.maxHp = 20; w.gold = 100; w.inventory = [16]; await w.openRoom('room_tundra_lesserdog'); }, { flags, plot });
  const placeEntry = (name, facing = 'u') => page.evaluate(([name, facing]) => { const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name), s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = facing; w.interactionCooldown = 0; }, [name, facing]);
  const read = async (count, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); for (let i = 0; i < count; i++) await key('z'); };
  const interact = async (name, count, pattern) => { await placeEntry(name); await key('z'); await read(count, pattern); };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 62: 1 }; w.plot = 58; await w.openRoom('room_tundra_randoblock'); w.player.setPosition(280, 120); window.dogHouseSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_lesserdog'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === dogHouseSong, __remake.scene.snowdinEncounter]), [20, 120, true, null]);
  for (const [flags, plot, count, npc, key, y] of [[{}, 58, 1, true, 'spr_lessdogsnow', 150], [{ 55: 1 }, 58, 1, false, 'spr_dogmush', 140], [{ 55: 2 }, 58, 10, true, 'spr_dogpillar2', 120], [{}, 67, 1, true, 'spr_dogpillar2', 120]]) {
    await open(flags, plot); assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, s = w.snowdinDogHouse, p = s.sculptures.find((e) => e.item.ObjectName === 'obj_dogpillar2'); return [s.sculptures.length, !!s.npc, p.object.Sprite, p.item.Y, p.image.y, w.colliders.filter((c) => /^obj_dog(pillar|neck)/.test(c.objectName)).length]; }), [count, npc, key, y, y, count]);
    await interact('obj_dogpillar2', 1, flags[55] === 1 ? /mushy snow/ : !flags[55] && plot < 67 ? /staring blankly/ : /base of a/);
    if (npc) await interact('obj_dogroom_npc', flags[55] === 2 ? 5 : plot < 67 ? 2 : 4, flags[55] === 2 ? /inspiration/ : plot < 67 ? /dog/ : /dog/);
  }
  await open({ 55: 2, 7: 1 }, 101); await interact('obj_dogroom_npc', 3, /free/);
  await interact('obj_dogpillarparent', 1, /base of a/); await interact('obj_dogneckparent', 1, /broken head/);
  await interact('obj_sign_room', 1, /AWARE OF DOG/); await interact('obj_readable_room1', 1, /pomeraisins/); await interact('obj_readable_room3', 1, /camera/);
  // Vùng va chạm của ảnh thay thế dùng đúng mask/vị trí mới, không giữ chân của tượng cũ.
  for (const state of [0, 1, 2]) {
    await open({ 55: state }); const collision = await page.evaluate(async () => { const { blocked } = await import('./src/movement.mjs'); const w = __remake.scene, e = w.snowdinDogHouse.sculptures.find((e) => e.item.ObjectName === 'obj_dogpillar2'), c = w.colliders.find((c) => c.objectName === 'obj_dogpillar2'); return [c.sprite === e.sprite, c.y === e.item.Y, blocked(w, [c], c.rectangle.x, c.rectangle.bottom - 19), c.rectangle.height > 0]; }); assert.deepEqual(collision, [true, true, false, true]);
    const bottom = await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_dogpillar2'); w.player.setPosition(c.rectangle.centerX - 10, c.rectangle.bottom - 16); return c.rectangle.bottom; }); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(250); await page.keyboard.up('ArrowUp'); assert.ok(await page.evaluate((bottom) => __remake.scene.player.y + 19 >= bottom, bottom));
  }
  // SAVE theo hai trạng thái tuyết, hồi HP/tên phòng/Return/ghi file/nạp.
  for (const state of [0, 1]) {
    await open({ 55: state }); await placeEntry('obj_savepoint'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await read(2, state ? /Snow can always/ : /never give up/); await page.waitForFunction(() => __remake.phase === 'saving');
    await key('z'); assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Snowdin - Dog House'); await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
    await page.evaluate(async () => { const w = __remake.scene; w.flags[55] = 2; w.hp = 1; await w.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[55], __remake.scene.hp, __remake.scene.plot, __remake.scene.gold, __remake.scene.inventory]), [state, 20, 58, 100, [16]]);
  }
  for (const [flags, pattern, red] of [[{ 26: 4, 203: 3 }, /13 left/, true], [{ 26: 5 }, /comedian/, true], [{ 26: 4, 203: 16, 57: 2 }, /Determination/, false], [{ 26: 4, 203: 16 }, /comedian/, false], [{ 26: 4, 27: 1 }, /never give up/, false]]) {
    await open(flags); await placeEntry('obj_savepoint'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), red ? 'fnt_maintext:red' : 'fnt_maintext');
    while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); await page.waitForFunction(() => __remake.phase === 'saving'); await key('x'); await page.waitForFunction(() => __remake.phase === 'running');
  }
  await open({ 55: 2 }); await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(360, 144); w.updateCamera(); }); await page.screenshot({ path: '.cache/dog-house.png' });
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(20, 120); }); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_randoblock'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinDogHouse]), [280, 120, null]);
  console.log('✓ Dog House: cửa/nhạc, cờ55/plot67/10tượng-chó-tuyết/mush/ảnh-mask-va chạm/dọn, NPC4nhánh/biển/nhà/camera, SAVE2lời/tuyến/tên file/hồiHP/lưu nạp');
}
