import assert from 'node:assert/strict';

export async function testSnowdinIce(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 42) => page.evaluate(async ({ flags, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; await w.openRoom('room_tundra6');
  }, { flags, plot });
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 42; await w.openRoom('room_tundra5'); window.doggoSong = w.snowdinMusic; });
  await place(425, 160); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra6');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 160]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === doggoSong), true);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinIce.tiles.length), 44);
  await place(100, 160, 'u'); await key('z'); await read(7, /important to remember/);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinIce.talked), 1);
  await place(100, 160, 'u'); await key('z'); await read(1, /remember/);
  await place(100, 160, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(250); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_sans_room'); return w.player.y + 19 >= c.rectangle.bottom; }));
  await place(310, 135, 'u'); await key('z'); await read(3, /North: Ice/);
  // Trigger thật: trả về vị trí trước bước vào băng, rồi trượt3px/frame với texture đứng yên.
  await place(140, 140); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinIce.active); await page.keyboard.up('ArrowRight');
  const start = await page.evaluate(() => { const w = __remake.scene; return [w.player.x, w.player.y, w.player.facing, w.snowdinIce.vx, w.snowdinIce.vy, w.snowdinEncounter.count]; });
  assert.deepEqual(start.slice(2, 5), ['r', 3, 0]);
  await page.keyboard.down('ArrowLeft'); await key('c'); await key('z'); await page.waitForTimeout(120); await page.keyboard.up('ArrowLeft');
  assert.equal(await page.evaluate(() => __remake.phase), 'running'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  assert.ok(await page.evaluate((x) => __remake.scene.player.x > x, start[0]));
  assert.equal(await page.evaluate(() => __remake.scene.player.facing), 'r');
  assert.equal(await page.evaluate(() => __remake.scene.player.texture.key), 'spr_maincharar:0');
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), start[5]);
  await page.waitForFunction(() => !__remake.scene.snowdinIce.active);
  const stop = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await page.waitForTimeout(150);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), stop);
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('x');
  // Các hướng và hai trục, alarm3 được gia hạn khi còn chạm ô, va chạm không xuyên tường.
  const cases = await page.evaluate(() => {
    const w = __remake.scene, ice = w.snowdinIce, results = [];
    for (const [vx, vy] of [[3, 0], [-3, 0], [0, 3], [0, -3], [3, -3]]) {
      ice.active = true; ice.remaining = 3; ice.vx = vx; ice.vy = vy; w.player.setPosition(230, 130);
      const before = [w.player.x, w.player.y]; ice.slide(); ice.contact({ x: 230, y: 130 }, () => false);
      results.push([w.player.x - before[0], w.player.y - before[1], ice.remaining]);
    }
    ice.active = true; ice.remaining = 3; ice.vx = 3; ice.vy = 0; w.player.setPosition(500, 140);
    ice.slide(); const first = [w.player.x, ice.remaining]; ice.slide(); const second = [w.player.x, ice.remaining]; const third = ice.slide();
    results.push(first, second, [third, ice.active, w.player.x]);
    return results;
  });
  assert.deepEqual(cases.slice(0, 5), [[3, 0, 3], [-3, 0, 3], [0, 3, 3], [0, -3, 3], [3, -3, 3]]);
  assert.deepEqual(cases.slice(5), [[503, 2], [506, 1], [false, false, 506]]);
  const wall = await page.evaluate(() => { const w = __remake.scene, ice = w.snowdinIce; ice.active = true; ice.vx = 0; ice.vy = -3; ice.remaining = 3; w.player.setPosition(100, 152); ice.slide(); return w.player.y; });
  assert.equal(wall, 152);
  // Encounter đang đủ bước cũng phải chờ trượt kết thúc rồi mới hiện cảnh báo/trận.
  await open(); await place(140, 140); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinIce.active); await page.keyboard.up('ArrowRight');
  await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; }); await page.waitForTimeout(120);
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await page.waitForFunction(() => __remake.phase === 'encounter');
  assert.equal(await page.evaluate(() => __remake.scene.snowdinIce.active), false);
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  assert.equal(await page.evaluate(() => __remake.scene.monster), 'snowdrake');
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z');
  while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  // Sans biến mất đúng plot/cờ/tuyến và collider cũng mất; đã bỏ tuyến thì có lại.
  for (const [flags, plot, present] of [[{}, 43, false], [{ 413: 1 }, 42, false], [{ 67: 1 }, 42, false], [{ 202: 20, 45: 4 }, 42, false], [{ 203: 16, 27: 1 }, 42, false], [{ 202: 20, 45: 4, 27: 1 }, 42, true]]) {
    await open(flags, plot);
    assert.equal(await page.evaluate(() => !!__remake.scene.snowdinIce.sans), present);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_sans_room')), present);
  }
  await open(); await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinIce.active), false);
  await place(20, 160, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra5');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinIce]), [420, 160, null]);
  console.log('✓ Băng Snowdin6: cửa/nhạc, 44ô/trigger thật/giữ hướng/3px/khóa/menu/không đếm encounter/alarm3/va chạm, Sans/biển/collider/nhánh tuyến và lưu nạp');
}
