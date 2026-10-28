import assert from 'node:assert/strict';

export async function testPapyrusGarage(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); };
  const open = (flags) => page.evaluate(async (flags) => { const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = 65; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_garage'); }, flags);
  const read = async (name, n, pattern, last) => {
    await page.evaluate((name) => { const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name), s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; w.interactionCooldown = 0; }, name);
    await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue?.lines.length), n); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    if (last) assert.match(await page.evaluate(() => __remake.scene.dialogue.lines.at(-1)), last);
    for (let i = 0; i < n; i++) await key('z');
  };
  for (const [flag, count, first, last] of [[0, 1, /IMPOSSIBLE/, /IMPOSSIBLE/], [-1, 5, /note from Papyrus/, /NYEHFULLY/], [-2, 4, /note from Papyrus/, /BONETROUSLED/], [-3, 4, /note from Papyrus/, /YOUR HOST/]]) {
    await open({ 67: flag }); await read('obj_spagnot', count, first, last);
    await read('obj_dogfood', 1, flag < -1 ? /hot dog/ : /dry food/); await read('obj_doggiebed', 1, /too small/); await read('obj_chewtoy', 1, /chew toy/);
  }
  await open({ 7: 1, 67: 1 }); await read('obj_spagnot', 5, /note from Papyrus/, /PAPYRUS/);
  await open({ 67: -1 });
  const details = await page.evaluate(async () => { const w = __remake.scene, { blocked } = await import('/src/movement.mjs'); const colliders = w.colliders.filter((c) => ['obj_spagnot', 'obj_dogfood', 'obj_doggiebed', 'obj_chewtoy'].includes(c.objectName)); return [w.player.x, w.player.y, w.doors.length, w.doors[0].marker, w.doors[0].musicFade, colliders.length, colliders.every((c) => blocked(w, [c], c.rectangle.x, c.rectangle.y - 19))]; });
  assert.deepEqual(details, [141, 99, 2, 'obj_markerv', true, 4, true]);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(63, 190); w.player.facing = 'd'; });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown'); await page.waitForFunction(() => __remake.room === 'room_tundra_town' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.flags[67], __remake.scene.papyrusGarage]), [2405, 125, -1, null]);
  console.log('✓ Phòng giam Papyrus: 4 đồ vật/collider, thư 0/-1/-2/-3, hai cửa tới town/marker/giữ cờ/dọn');
}
