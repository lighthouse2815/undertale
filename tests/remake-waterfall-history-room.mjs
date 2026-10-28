import assert from 'node:assert/strict';
export async function testWaterfallHistoryRoom(page) {
  const open = (flags = {}, plot = 109) => page.evaluate(async ({ flags, plot }) => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = plot; await w.openRoom('room_water7'); w.scene.pause(); }, { flags, plot });
  const interact = name => page.evaluate(name => { const w = __remake.scene, room = w.waterfallHistoryRoom, e = name === 'woshua' ? room.woshua : room.signs.find(s => s.item.ObjectName === name), s = e.sprite;
    w.player.setPosition(e.item.X - (name === 'woshua' ? s.OriginX : 0) + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - (name === 'woshua' ? s.OriginY : 0) + s.MarginBottom - 18); w.player.facing = 'u';
    if (!room.interact()) throw Error('Không tương tác ' + name); const lines = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); return lines; }, name);
  await open(); assert.equal(await page.evaluate(() => !!__remake.scene.waterfallHistoryRoom.woshua), false);
  for (const [i, pattern] of [[1, /Ancient writing/], [2, /humans attack/], [3, /one weakness/], [4, /defeats a human/], [5, /illustration/]]) assert.match((await interact(`obj_readable_room${i}`))[0], pattern);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({}, 122);
  assert.match((await interact('woshua'))[0], /Everything's so dirty/); assert.match((await interact('woshua'))[0], /Don't turn to dust/);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 7: 1 }, 122);
  assert.match((await interact('woshua'))[0], /surface intimidates/);
  await page.evaluate(() => __remake.scene.scene.resume()); await open({ 204: 1 }, 122); assert.equal(await page.evaluate(() => !!__remake.scene.waterfallHistoryRoom.woshua), false);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Phòng lịch sử Waterfall: năm bia, Woshua và điều kiện xuất hiện');
}
