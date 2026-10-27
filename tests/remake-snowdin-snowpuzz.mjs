import assert from 'node:assert/strict';

export async function testSnowdinSnowpuzz(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const open = (flags = {}, plot = 47) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 123; w.inventory = [16]; await w.openRoom('room_tundra_snowpuzz'); }, { flags, plot });
  const near = (name) => page.evaluate((name) => { const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y + e.sprite.MarginBottom - 8); w.player.facing = 'u'; w.interactionCooldown = 0;
  }, name);
  await open(); assert.equal(await page.evaluate(() => __remake.scene.snowdinSnowpuzz.flakes.length), 400);
  assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinSnowpuzz.flakes.slice(0, 5).map((p) => [p.x, p.y, p.motion])), [[82.2, 401, 1], [86.2, 401, 1], [90.2, 401, 1], [94.2, 401, 1], [98, 401, 1]]);
  await place(80, 380); await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => __remake.scene.flags[64] ?? 0), 0, 'Đứng trên tuyết không tự tính đã gạt.');
  const before = await page.evaluate(() => __remake.scene.snowdinSnowpuzz.flakes.map((p) => [p.x, p.y]));
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.flags[64] === -1); await page.keyboard.up('ArrowRight');
  assert.notDeepEqual(await page.evaluate(() => __remake.scene.snowdinSnowpuzz.flakes.map((p) => [p.x, p.y])), before);
  await place(175, 400); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x + 20 <= 200));
  assert.ok(await page.evaluate(() => __remake.scene.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room').every((e) => e.image.texture.key.endsWith(':0'))));
  await place(404, 132, 'u'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /hidden/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[64], __remake.scene.snowdinSnowpuzz.wall.disabled]), [49, -1, true]); await key('z');
  await place(404, 132, 'u'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /stuck/); await key('z');
  assert.ok(await page.evaluate(() => __remake.scene.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room').every((e) => e.image.texture.key.endsWith(':1'))));
  await place(175, 400); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.player.x > 205); await page.keyboard.up('ArrowRight');
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.plot = 47; w.flags = {}; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[64], __remake.scene.snowdinSnowpuzz.wall.disabled, __remake.scene.gold, __remake.scene.inventory]), [49, -1, true, 123, [16]]);
  await open(); await place(404, 132, 'u'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.flags[64]), 1); await key('z');
  await near('obj_readable_room3'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /camera hidden/); await key('z');
  for (const pattern of [/Dog Marriage/, /read that correctly/, /Dog Marriage/]) { await near('obj_sign_room'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); await key('z'); }
  await near('obj_sign_room'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(200); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => { const w = __remake.scene; return w.player.y + 19 >= w.colliders.find((c) => c.objectName === 'obj_sign_room').rectangle.bottom; }));
  for (const flags of [{ 26: 3 }, { 26: 3, 27: 1 }, { 26: 5, 64: -1 }]) {
    await open(flags); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[64], __remake.scene.snowdinSnowpuzz.wall.disabled]), [49, flags[64] || 1, true]);
    await place(404, 132, 'u'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /vines/); await key('z');
  }
  await open({ 26: 2, 27: 1 }); assert.equal(await page.evaluate(() => __remake.scene.snowdinSnowpuzz.wall.disabled), false);
  for (const [flags, plot, exists] of [[{}, 100, false], [{}, 110, true], [{ 7: 1 }, 110, true], [{ 203: 1 }, 110, false]]) {
    await open(flags, plot); assert.equal(await page.evaluate(() => !!__remake.scene.snowdinSnowpuzz.npc), exists);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_icecap_npcg')), exists);
    if (exists) {
      await near('obj_icecap_npcg'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 3); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), flags[7] ? /After all/ : /stop thinking/);
      for (let i = 0; i < 3; i++) await key('z'); assert.equal(await page.evaluate(() => __remake.scene.snowdinSnowpuzz.talking), false);
    }
  }
  await open(); await place(96, 340); await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.scene.flags[64] === -1); await page.keyboard.up('ArrowDown');
  await page.screenshot({ path: '.cache/snowpuzz-snow.png' }); await page.evaluate(async () => __remake.scene.openRoom('room_tundra_spaghetti'));
  assert.equal(await page.evaluate(() => __remake.scene.snowdinSnowpuzz), null);
  console.log('✓ Câu đố tuyết: 400hạt/25mỗiô/đứng yên/đi thật/gạt/64, công tắc/49/tường/gai/lưu nạp, auto tuyến>=3/cờ27, biển3lượt/camera/IceCap/collider/dọn; chưa gồm trận-encounter/cửa');
}
