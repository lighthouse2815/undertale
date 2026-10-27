import assert from 'node:assert/strict';

export async function testSnowman(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, inventory = [], plot = 42) => page.evaluate(async ({ flags, inventory, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.inventory = inventory; w.plot = plot;
    w.hp = 1; w.maxHp = 60; w.lv = 11; w.menuSelection = 0; await w.openRoom('room_tundra6A');
  }, { flags, inventory, plot });
  const near = () => page.evaluate(() => { const w = __remake.scene; w.player.setPosition(140, 85); w.player.facing = 'u'; w.interactionCooldown = 0; });
  const talk = async () => { await near(); await key('z'); };
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const choose = async (no = false) => { await page.waitForTimeout(120); if (no) await key('ArrowRight'); await key('z'); };
  const item = async (action) => {
    await page.evaluate(() => { __remake.scene.menuSelection = 0; }); await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('z'); await key('z');
    for (let i = 0; i < action; i++) await key('ArrowRight'); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  };
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 42; w.flags = {}; await w.openRoom('room_tundra6'); w.player.setPosition(320, 20); window.iceSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra6A');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [140, 180]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === iceSong), true); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter), null);
  await open(); await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(140, 100); });
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(350); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y + 19 >= 95));
  await talk(); await read(3, /snowman/); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /very far away/);
  await choose(true); await read(1, /Good journey/); assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[56] ?? 0]), [[], 0]);
  await talk(); await read(3, /snowman/); await choose(); await read(2, /good luck/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[56]]), [[16], 1]);
  await talk(); await read(1, /How am I doing/); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), [16]);
  // INFO/USE/DROP qua menu thật; mảnh trong hộp ngăn cấp trùng, gồm cả hộp điện thoại312–322 trong SAVE.
  await item(1); await read(1, /Heals 45 HP/); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), [16]);
  await page.evaluate(() => { const w = __remake.scene; w.inventory = []; w.flags[309] = 16; }); await talk(); await read(1, /How am I doing/);
  assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), []);
  await page.evaluate(() => { const w = __remake.scene; w.flags[309] = 0; w.flags[322] = 16; }); await talk(); await read(1, /How am I doing/);
  await page.evaluate(() => { const w = __remake.scene; w.flags[322] = 0; w.inventory = Array(8).fill(1); });
  await talk(); await read(3, /How am I doing/); assert.equal(await page.evaluate(() => __remake.scene.flags[56]), 1);
  await page.evaluate(() => { __remake.scene.inventory = []; }); await talk(); await read(4, /How am I doing/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[56], __remake.scene.inventory]), [2, [16]]);
  await talk(); await read(1, /Thank you for taking care/);
  await item(2); while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), []);
  await talk(); await read(5, /Again/); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), []);
  // Túi đầy ở câu hỏi ban đầu không đặt56; nhận lại khi có chỗ.
  await open({}, Array(8).fill(1)); await talk(); await read(3, /snowman/); await choose(); await read(1, /enough room/);
  assert.equal(await page.evaluate(() => __remake.scene.flags[56] ?? 0), 0);
  // Ăn trước mặt: hồi45HP/56=4 ngay khi dùng, lời phản ứng4→5 và lời lần sau.
  await open({ 56: 1 }, [16]); await item(0); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /recovered 45 HP/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.flags[56], __remake.scene.inventory]), [46, 4, []]);
  await read(1, /ate the Snowman/); await talk(); assert.equal(await page.evaluate(() => __remake.scene.flags[56]), 5); await read(3, /Consume/);
  await talk(); await read(1, /given myself/);
  // Ăn ở phòng khác không đặt56=4 và vẫn có lần cấp bù hợp lệ.
  await open({ 56: 1 }, [16]); await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_tundra6'); w.player.setPosition(20, 160); });
  await item(0); await read(1, /ate the Snowman/); assert.equal(await page.evaluate(() => __remake.scene.flags[56]), 1);
  // Tuyến giết lấy ngay3mảnh, tăng253 chỉ sau đọc xong/đổiảnh, không dùng Yes/No; túi đầy không phá người tuyết.
  await open({ 202: 20, 45: 4 }, Array(8).fill(1)); await talk(); await read(1, /too many/);
  assert.equal(await page.evaluate(() => __remake.scene.flags[253] ?? 0), 0);
  await page.evaluate(() => { __remake.scene.inventory = []; });
  for (let i = 0; i < 3; i++) {
    await talk(); assert.equal(await page.evaluate(() => __remake.scene.inventory.filter((id) => id === 16).length), i + 1);
    assert.equal(await page.evaluate(() => __remake.scene.flags[253] ?? 0), i);
    await read(i === 2 ? 2 : 3, [/snowman/, /What are you doing/, /Please/][i]);
    assert.equal(await page.evaluate(() => __remake.scene.flags[253]), i + 1);
    assert.equal(await page.evaluate(() => __remake.scene.snowman.entry.image.texture.key), `spr_sadsnowman_d1:${i}`);
  }
  await talk(); await read(1, /useless pile/); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), [16, 16, 16]);
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.flags = {}; w.inventory = []; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[253], __remake.scene.inventory, __remake.scene.snowman.entry.image.texture.key]), [4, [16, 16, 16], 'spr_sadsnowman_d1:2']);
  // cờ27 không ghi đè scr_murderlv ở người tuyết; cờ26 vẫn ghi đè toàn tuyến.
  await open({ 202: 20, 45: 4, 27: 1 }); await talk(); await read(3, /cannot move/); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), [16]);
  await open({ 202: 20, 45: 4, 26: 1 }); await talk(); await read(3, /snowman/); await choose(true); await read(1, /Good journey/);
  // Lời sau kết thúc: giữ trong túi/BOX, mất, ăn và chưa từng nhận; kiểm tra dòng122 ghi đè121 như source.
  for (const [flags, inventory, count, pattern] of [
    [{ 7: 1 }, [], 3, /About that piece/], [{ 7: 1, 56: 1 }, [16], 5, /well taken/],
    [{ 7: 1, 56: 2, 300: 16 }, [], 5, /well taken/], [{ 7: 1, 56: 1 }, [], 3, /very far/],
    [{ 7: 1, 56: 4 }, [], 4, /barrier's open/], [{ 7: 1, 56: 5 }, [], 4, /barrier's open/],
  ]) {
    await open(flags, inventory, 110); await talk();
    if (count === 5) assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[1]), /barrier's opened/);
    await read(count, pattern); assert.deepEqual(await page.evaluate(() => __remake.scene.inventory), inventory);
  }
  // ITEM trong trận hồi45HP nhưng room battle không tính là ăn trước mặt người tuyết.
  await open({ 56: 1 }, [16]); await page.evaluate(() => __remake.startBattle('snowdrake'));
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(() => { __remake.scene.menuIndex = 2; }); await key('z'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.hp), 46);
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[56]), 1);
  while (await page.evaluate(() => __remake.scene.mode === 'pages')) await key('z');
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.invFrames = 1000; for (let i = 0; i < 140 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul(); });
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z');
  while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  await open(); await page.evaluate(() => { __remake.scene.player.setPosition(140, 200); });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra6');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowman]), [320, 20, null]);
  console.log('✓ Người tuyết6A: cửa/nhạc/collider, Yes-No/túi đầy/BOX/cấp bù2lần, INFO/USE45HP/DROP/ăn trước mặt, ba mảnh tuyến giết/253/ảnh/lưu nạp và các lời sau kết thúc');
}
