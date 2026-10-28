import assert from 'node:assert/strict';
export async function testWaterfallGoner(page) {
  await page.evaluate(() => { window.previousWaterfallFun = localStorage.getItem('undertale-remake-fun'); });
  const open = (flags = {}, plot = 110, fun = 90) => page.evaluate(async ({ flags, plot, fun }) => { const w = __remake.game.scene.getScene('World'); localStorage.setItem('undertale-remake-fun', String(fun)); w.flags = flags; w.plot = plot; await w.openRoom('room_water7'); w.scene.pause(); }, { flags, plot, fun });
  const talk = () => page.evaluate(() => { const w = __remake.scene, room = w.waterfallHistoryRoom, e = room.goner, s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; if (!room.interact()) throw Error('Không thể tương tác'); const count = w.dialogue.lines.length; while (w.dialogue) w.advanceDialogue(); return count; });
  const exists = () => page.evaluate(() => !!__remake.scene.waterfallHistoryRoom.goner);
  await open({ 5: 90 }); assert.equal(await exists(), true); assert.equal(await talk(), 4); assert.equal(await talk(), 1);
  assert.equal(await page.evaluate(() => __remake.scene.waterfallHistoryRoom.goner.image.texture.key), 'spr_mkid_goner_lt:0');
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 5: 90, 85: 1 }); assert.equal(await talk(), 5); assert.equal(await page.evaluate(() => __remake.scene.flags[5]), 0); assert.equal(await talk(), 1);
  for (const [flags, plot, fun] of [[{ 5: 90 }, 109, 90], [{ 5: 89 }, 110, 90], [{ 5: 90 }, 110, 89], [{ 5: 90, 7: 1 }, 110, 90]]) {
    await page.evaluate(() => __remake.scene.scene.resume()); await open(flags, plot, fun); assert.equal(await exists(), false);
  }
  await page.evaluate(() => __remake.scene.scene.resume()); await open({}, 109);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(e => e.item.ObjectName === 'obj_purpledude')), false);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 26: 8 }, 110);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(e => e.item.ObjectName === 'obj_purpledude')), false);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); if (window.previousWaterfallFun === null) localStorage.removeItem('undertale-remake-fun'); else localStorage.setItem('undertale-remake-fun', window.previousWaterfallFun); await w.openRoom('room_water1'); });
  console.log('✓ Nhân vật bí mật Waterfall: điều kiện xuất hiện, hai nhánh thoại và cờ');
}
