import assert from 'node:assert/strict';
export async function testWaterfallCrystalRoom(page) {
  const open = (flags = {}) => page.evaluate(async flags => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = 110; w.hp = 1; w.maxHp = 20; await w.openRoom('room_water_savepoint1'); }, flags);
  const talk = key => page.evaluate(key => { const w = __remake.scene, r = w.waterfallCrystalRoom, e = r[key], s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; if (!r.interact()) throw Error(`Không tương tác ${key}`); const result = [...(w.dialogue?.lines ?? [])]; while (w.dialogue) w.advanceDialogue(); return result; }, key);
  await open(); assert.match((await talk('table'))[0], /crystal/); assert.match((await talk('flower'))[0], /Squeak/); assert.deepEqual(await talk('mouse'), []);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallMusic.key, __remake.scene.waterfallCrystalRoom.table.image.texture.key]), ['mus_waterquiet', 'spr_crystaltable:0']);
  await page.evaluate(() => { const w = __remake.scene, e = w.roomObjects.find(e => e.item.ObjectName === 'obj_savepoint'); w.player.setPosition(e.item.X, e.item.Y + 1); w.player.facing = 'u'; w.tryInteract(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /mouse might one/); assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  await page.evaluate(() => { __remake.scene.advanceDialogue(); __remake.scene.advanceDialogue(); }); await page.waitForFunction(() => __remake.phase === 'saving');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.saved); assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Waterfall - Crystal');
  await page.keyboard.press('x'); await page.waitForFunction(() => __remake.phase === 'running');
  await open({ 26: 8, 204: 5 }); assert.match((await talk('flower'))[0], /silent/);
  await open({ 7: 1 }); assert.match((await talk('table'))[0], /freed some/);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Waterfall Crystal: bàn phô mai, chuột, hoa, SAVE và nhạc');
}
