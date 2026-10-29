import assert from 'node:assert/strict';

export async function testWaterfallPuzzleHater(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 119; await w.openRoom('room_water21'); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallPuzzleHater.locked), true);
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 6);
  await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.waterfallPuzzleHater.locked, __remake.scene.waterfallPuzzleHater.npc]), [120, false, null]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 122; await w.openRoom('room_water21'); });
  const talk = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallPuzzleHater, e = h.npc; w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); const out = [w.dialogue.lines.length, w.flags[280], w.colliders.filter(c => ['obj_puzzlehater','obj_puzzlehaterbox'].includes(c.objectName)).length]; while (w.dialogue) w.advanceDialogue(); return out; });
  assert.deepEqual(talk, [7, 1, 2]);
  const box = await page.evaluate(() => { const w = __remake.scene, h = w.waterfallPuzzleHater, e = h.box; w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); const out = [w.dialogue.lines.length, w.flags[280], w.player.facing]; while (w.dialogue) w.advanceDialogue(); w.player.facing = 'u'; w.tryInteract(); const repeat = w.dialogue.lines.length; while (w.dialogue) w.advanceDialogue(); return [...out, repeat]; });
  assert.deepEqual(box, [2, 2, 'l', 1]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {280: 1}; w.plot = 122; await w.openRoom('room_water21'); });
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, h = w.waterfallPuzzleHater; w.player.setPosition(h.box.item.X, h.box.item.Y - 4); const triggered = h.checkTrigger(); const result = [triggered, w.flags[280], w.dialogue?.lines.length]; while (w.dialogue) w.advanceDialogue(); return result; }), [true, 2, 2]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 8}; w.plot = 122; await w.openRoom('room_water21'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallPuzzleHater.npc, __remake.scene.waterfallPuzzleHater.box]), [null, null]);
  console.log('✓ Phòng trước Undyne: lời Monster Kid, NPC, hộp và điều kiện tuyến');
}
