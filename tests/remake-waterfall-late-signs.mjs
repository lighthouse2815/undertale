import assert from 'node:assert/strict';

export async function testWaterfallLateSigns(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water15'); });
  for (const [name, index] of [['obj_readable_room1', 0], ['obj_readable_room2', 0], ['obj_readable_room3', 0], ['obj_readable_room1', 1], ['obj_readable_room2', 1], ['obj_readable_room3', 1]]) {
    await page.evaluate(([name, index]) => {
      const w = __remake.scene, e = w.waterfallLateSigns.signs.filter(e => e.item.ObjectName === name)[index];
      w.player.setPosition(e.item.X + 1, e.item.Y + 1); w.player.facing = 'd';
      w.tryInteract();
    }, [name, index]);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue), null, 'Không đọc bia khi quay lưng');
    await page.evaluate(() => { const w = __remake.scene; w.player.facing = 'u'; w.tryInteract(); });
    assert.equal(await page.evaluate(() => __remake.scene.dialogue?.lines.length), 3);
    const actual = await page.evaluate(() => __remake.scene.dialogue.lines.join('\n'));
    assert.match(actual, name.endsWith('1') ? /surrendered/ : name.endsWith('2') ? /seven human SOULs/ : /trapped/);
    await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); });
  }
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water_shop'); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallLateSigns), null);
  console.log('✓ Waterfall 15: ba bia và sáu vùng tương tác');
}
