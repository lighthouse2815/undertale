import assert from 'node:assert/strict';

export async function testSnowdinPark(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 43, gold = 0) => page.evaluate(async ({ flags, plot, gold }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = gold; w.inventory = [16]; await w.openRoom('room_tundra8');
  }, { flags, plot, gold });
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const near = (name) => page.evaluate((name) => { const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X - e.sprite.OriginX + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y - e.sprite.OriginY + e.sprite.MarginBottom - 8); w.player.facing = 'u'; w.interactionCooldown = 0;
  }, name);
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const choose = async (no = false) => { await page.waitForTimeout(120); if (no) await key('ArrowRight'); await key('z'); };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 43; await w.openRoom('room_tundra7'); w.player.setPosition(290, 120); window.mazeSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra8');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 120]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === mazeSong), true); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter), null);
  await open(); assert.equal(await page.evaluate(() => __remake.scene.snowdinIce.tiles.length), 4);
  assert.ok(await page.evaluate(() => __remake.scene.snowdinIce.tiles.every((tile) => tile.ScaleX === 2 && tile.ScaleY === 2)));
  // Trượt trên40×40 bbox từ sprite event của x4, giữ hướng và khóa menu như phòng6.
  await place(180, 400); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinIce.active); await page.keyboard.up('ArrowRight');
  const start = await page.evaluate(() => __remake.scene.player.x); await page.keyboard.down('ArrowLeft'); await key('c'); await page.keyboard.up('ArrowLeft');
  assert.equal(await page.evaluate(() => __remake.phase), 'running'); assert.ok(await page.evaluate((x) => __remake.scene.player.x > x, start));
  await page.waitForFunction(() => !__remake.scene.snowdinIce.active);
  await near('obj_snowdecahedron'); await key('z'); await read(2, /snow ball/);
  await near('obj_readable_room3'); await key('z'); await read(1, /camera hidden/);
  // Bốn lần từ chối và cả hai câu trả lời cuối với50,000G; đây là đùa, không giao dịch.
  for (const stop of [0, 1, 2, 3, 4, 5]) {
    const gold = stop === 5 ? 50000 : 10; await open({}, 43, gold); await near('obj_sans_room'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_comicsans'); await read(1, /selling treats/);
    const prices = [/5G/, /50G/, /5000G/, /50000G/];
    for (let i = 0; i < 4; i++) {
      assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), prices[i]);
      if (i === stop) { await choose(true); break; }
      await choose();
    }
    await read(stop === 0 || stop === 1 ? 2 : stop === 2 || stop === 3 ? 1 : stop === 5 ? 4 : 3,
      [/you're right/, /you're right/, /raw materials/, /good deal/, /money/, /lot[\s\S]*cash/][stop]);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory]), [gold, [16]]);
  }
  // Các NPC có va chạm và biến mất cùng collider; snowdecahedron còn lời riêng trên tuyến giết.
  await open(); await near('obj_sans_room'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_sans_room'); return w.player.y + 19 >= c.rectangle.bottom; }));
  for (const [flags, plot, sans, chill, murder] of [[{}, 46, false, false, false], [{ 413: 1 }, 43, false, false, false], [{ 67: 1 }, 43, false, false, false], [{ 202: 20, 45: 4 }, 43, false, false, false], [{ 202: 20, 45: 4, 52: 1 }, 43, false, false, true], [{ 202: 20, 45: 4, 52: 1, 27: 1 }, 43, true, false, false], [{ 203: 16, 27: 1 }, 43, false, false, true], [{}, 110, false, true, false], [{ 203: 1 }, 110, false, false, false]]) {
    await open(flags, plot); assert.deepEqual(await page.evaluate(() => [!!__remake.scene.snowdinPark.sans, !!__remake.scene.snowdinPark.chill, __remake.scene.snowdinPark.murder]), [sans, chill, murder]);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_sans_room')), sans);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_chilldrakenpc')), chill);
    await near('obj_snowdecahedron'); await key('z'); await read(murder ? 1 : 2, /snow ball/);
  }
  await open({}, 110); await near('obj_chilldrakenpc'); await key('z'); await read(2, /Guh huh/);
  await open({ 7: 1 }, 110); await near('obj_chilldrakenpc'); await key('z'); await read(2, /getting/);
  await open({ 60: 16, 387: 1 }, 43, 150); await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.flags = {}; w.gold = 0; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[60], __remake.scene.flags[387], __remake.scene.gold, __remake.scene.snowdinIce.active]), [16, 1, 150, false]);
  await place(20, 120, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra7'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinPark]), [280, 120, null]);
  console.log('✓ Phòng8: cửa7↔8/nhạc, băngx4/40×40/khóa, fried snow5→50→5000→50000/No/giàu-nghèo/không đổi đồ-GOLD, camera/snowdecahedron/Chilldrake/collider/tuyến/SAVE');
}
