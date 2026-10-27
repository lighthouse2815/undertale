import assert from 'node:assert/strict';

export async function testNiceCream(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, inventory = [], gold = 30, plot = 43) => page.evaluate(async ({ flags, inventory, gold, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.inventory = inventory; w.gold = gold; w.plot = plot;
    w.hp = 1; w.maxHp = 60; w.lv = 11; w.menuSelection = 0; await w.openRoom('room_tundra8');
    const e = w.niceCream.entry; if (e) { w.player.setPosition(e.item.X + 5, e.item.Y + e.sprite.MarginBottom - 8); w.player.facing = 'u'; w.interactionCooldown = 0; }
  }, { flags, inventory, gold, plot });
  const talk = async () => { await page.evaluate(() => { __remake.scene.interactionCooldown = 0; }); await key('z'); };
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const choice = async (no = false) => { await page.waitForTimeout(120); if (no) await key('ArrowRight'); await key('z'); };
  await open(); assert.equal(await page.evaluate(() => __remake.scene.niceCream.sprite), 'spr_icecreamguy_sad');
  const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await talk(); await read(2, /aren't selling/); assert.equal(await page.evaluate(() => __remake.scene.niceCream.stage), 'turning');
  await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(150); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.phase), 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
  await page.waitForFunction(() => __remake.scene.dialogueText.text.includes('CUSTOMER')); await read(1, /CUSTOMER/);
  assert.equal(await page.evaluate(() => __remake.scene.flags[60]), 1); assert.equal(await page.evaluate(() => __remake.scene.niceCream.sprite), 'spr_icecreamguy_happy');
  assert.deepEqual(await page.evaluate(() => __remake.scene.niceCream.display.slice(2).map((c) => c.text)), ['$ - 30G', 'SPACE - 0/8']);
  await read(2, /Would you like/); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /15G/);
  await choice(true); await read(2, /Tell your friends/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[60], __remake.scene.niceCream.display.length, __remake.scene.niceCream.locked]), [30, [], 1, 0, false]);
  await talk(); await read(2, /Would you like/); await choice();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[60]]), [15, [17], 16]);
  assert.deepEqual(await page.evaluate(() => __remake.scene.niceCream.display.slice(2).map((c) => c.text)), ['$ - 15G', 'SPACE - 1/8']); await read(1, /super-duper/);
  await talk(); await read(1, /Nice Cream/); await choice(); await read(1, /super-duper/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[60]]), [0, [17, 17], 31]);
  await talk(); await read(1, /Nice Cream/); await choice(); await read(2, /enough/); assert.equal(await page.evaluate(() => __remake.scene.flags[60]), 31);
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.flags = {}; w.inventory = []; w.gold = 999; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[60], __remake.scene.niceCream.sprite]), [0, [17, 17], 31, 'spr_icecreamguy_happy']);
  // Không trừG khi đầy; kiểm tra afford trước capacity như SCR_TEXT231.
  for (const [gold, pattern, count] of [[15, /too much stuff/, 1], [14, /enough/, 2]]) {
    await open({ 60: 1 }, Array(8).fill(1), gold); await talk(); await read(2, /Would you like/); await choice(); await read(count, pattern);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory.length, __remake.scene.flags[60]]), [gold, 8, 1]);
  }
  // Va chạm NPC thật và bỏ collider khi biến mất theo tuyến/plot.
  await open({ 60: 1 }); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_nicecreamguy'); return w.player.y + 19 >= c.rectangle.bottom; }));
  for (const [flags, plot, present] of [[{}, 101, false], [{ 202: 20, 45: 4, 52: 1 }, 43, false], [{ 202: 20, 45: 4, 52: 1, 27: 1 }, 43, true], [{ 203: 16, 27: 1 }, 43, false]]) {
    await open(flags, [], 30, plot); assert.equal(await page.evaluate(() => !!__remake.scene.niceCream.entry), present);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_nicecreamguy')), present);
  }
  // ITEM17 qua menu thật và tám lời wrapper, hồi15HP/cap/tiêuhao, không đổi cờ Snowman56.
  await open({ 56: 1, 60: 16 }, [17]); await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('z'); await key('z'); await key('ArrowRight'); await key('z');
  await read(1, /Heals 15 HP/); await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('z'); await key('z'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.hp), 16); assert.equal(await page.evaluate(() => __remake.scene.flags[56]), 1);
  while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z');
  const wrappers = await page.evaluate(async () => {
    const { itemAction } = await import('/src/inventory.mjs'), w = __remake.scene, random = Math.random, lines = [];
    try { for (let i = 0; i < 8; i++) { w.inventory = [17]; w.hp = 55; Math.random = () => (i + .1) / 8; lines.push([itemAction(w, 0, 'use', w.cache.json.get('inventory'))[0], w.hp, w.inventory.length]); } }
    finally { Math.random = random; } return lines;
  });
  assert.equal(new Set(wrappers.map((row) => row[0])).size, 8); assert.ok(wrappers.every((row) => row[1] === 60 && row[2] === 0));
  assert.match(wrappers[0][0], /You're just great/); assert.match(wrappers[7][0], /Love yourself/);
  // Đổi phòng giữa lời mua dọn bảng GOLD/SPACE; phần phòng8 còn lại chuyển riêng.
  await open({ 60: 1 }); await talk(); assert.equal(await page.evaluate(() => __remake.scene.niceCream.display.length), 4);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra6A'); }); assert.equal(await page.evaluate(() => __remake.scene.niceCream), null);
  console.log('✓ Nice Cream Snowdin: intro/31frame/khóa, mua15G/cờ60/No/thiếuG/đầy/ưu tiên/hiệnGOLD-SPACE, collider/tuyến/SAVE, ITEM17/8wrapper/15HP/cap và dọn');
}
