import assert from 'node:assert/strict';
export async function testWaterfallStarRoom(page) {
  const open = flags => page.evaluate(async flags => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = 110; await w.openRoom('room_water11'); }, flags);
  const talk = key => page.evaluate(key => { const w = __remake.scene, room = w.waterfallStarRoom, e = key === 'sign' ? room.signs[0] : room[key], s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; if (!room.interact()) throw Error(`Không tương tác ${key}`); const result = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); return result; }, key);
  await open({}); assert.equal((await talk('npc')).length, 6); assert.equal((await talk('sign')).length, 2); assert.match((await talk('telescope'))[0], /telescope/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallStarRoom.npc.image.texture.key, __remake.scene.waterfallStarRoom.npc.item.Y, __remake.scene.waterfallMusic.key]), ['spr_tonsildude:0', 102, 'mus_waterquiet']);
  for (const [flags, count, phrase] of [[{ 85: 1 }, 1, /holding/], [{ 7: 1 }, 2, /real stars/], [{ 7: 1, 350: 1 }, 2, /faded/]]) { await open(flags); const lines = await talk('npc'); assert.equal(lines.length, count); assert.match(lines[0], phrase); }
  await open({ 26: 8 }); assert.equal(await page.evaluate(() => __remake.scene.waterfallStarRoom.npc), undefined);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Phòng sao: Tonsil, biển, kính lạ, nhạc và các nhánh');
}
