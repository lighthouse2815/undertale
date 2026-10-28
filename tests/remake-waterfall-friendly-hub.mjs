import assert from 'node:assert/strict';
export async function testWaterfallFriendlyHub(page) {
  const open = flags => page.evaluate(async flags => { const w = __remake.scene; w.flags = flags; w.plot = 116; w.hp = 1; await w.openRoom('room_water_friendlyhub'); }, flags);
  const talk = key => page.evaluate(key => { const w = __remake.scene, room = w.waterfallFriendlyHub, e = room[key], s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; if (!room.interact()) throw Error('Không tương tác ' + key); const result = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); return result; }, key);
  await open({5: 80}); assert.match((await talk('sign'))[0], /Blook Acres/); assert.equal((await talk('clam')).length, 4); assert.equal(await page.evaluate(() => __remake.scene.flags[279]), 1); assert.match((await talk('clam'))[0], /Fate/);
  await page.evaluate(() => { const w = __remake.scene, e = w.roomObjects.find(e => e.item.ObjectName === 'obj_savepoint'); w.player.setPosition(e.item.X, e.item.Y + 1); w.player.facing = 'u'; w.tryInteract(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /calming/); assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  await page.evaluate(() => __remake.scene.advanceDialogue()); await page.waitForFunction(() => __remake.phase === 'saving'); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.saved); assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Waterfall - Quiet Area'); await page.keyboard.press('x'); await page.waitForFunction(() => __remake.phase === 'running'); await page.waitForFunction(() => __remake.scene.scene.isActive());
  for (const [flags, expected] of [[{5:79}, false], [{5:90}, false], [{5:80,26:8}, false], [{5:89}, true]]) { await open(flags); assert.equal(await page.evaluate(() => !!__remake.scene.waterfallFriendlyHub.clam), expected); }
  for (const [flags, phrase] of [[{5:80,350:1}, /disturbance/], [{5:80,7:1,279:1}, /never met/], [{5:80,7:1}, /wanted to tell/]]) { await open(flags); assert.match((await talk('clam'))[0], phrase); }
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Quiet Area: điểm lưu, biển và các nhánh Clam Girl');
}
