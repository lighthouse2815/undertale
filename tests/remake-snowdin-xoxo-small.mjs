import assert from 'node:assert/strict';

export async function testSnowdinXoxoSmall(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const open = (flags = { 62: 1 }, plot = 51) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 100; w.inventory = [16]; await w.openRoom('room_tundra_xoxosmall'); }, { flags, plot });
  const frames = (n) => page.evaluate((n) => { const s = __remake.scene.snowdinXoxoSmall; for (let i = 0; i < n; i++) s.step(); }, n);
  const tile = (i) => page.evaluate((i) => __remake.scene.snowdinXoxoSmall.tiles[i].frame, i);
  const enterTile = async (i) => { await place(i ? 260 : 180, 105); await page.keyboard.down('ArrowRight'); await page.waitForFunction((i) => __remake.scene.snowdinXoxoSmall.tiles[i].touched, i); await page.keyboard.up('ArrowRight'); };
  const button = async () => { await place(240, 55); await frames(1); };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 62: 1, 70: 4 }; w.plot = 51; await w.openRoom('room_tundra_snowpuzz'); w.player.setPosition(450, 520); window.xoxoSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_xoxosmall');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === xoxoSong, __remake.scene.snowdinEncounter]), [110, 20, true, null]);
  await open(); assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.tiles.map((e) => e.frame)), [0, 0]);
  await enterTile(0); assert.equal(await tile(0), 1); await frames(10); assert.equal(await tile(0), 1, 'Đứng trong cùng vùng không chuyển nhiều lần.');
  await place(180, 105); await frames(1); await enterTile(0); assert.equal(await tile(0), 2); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.victory), false);
  await button(); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinXoxoSmall.tiles.map((e) => e.frame), __remake.scene.snowdinXoxoSmall.button.image.texture.key]), [51, [0, 0], 'spr_groundswitch1:1']);
  await place(240, 100); await frames(3); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.button.image.texture.key), 'spr_groundswitch1:0');
  await enterTile(0); await place(240, 100); await frames(1); await enterTile(1); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.victory), true);
  await place(395, 100); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight'); assert.ok(await page.evaluate(() => __remake.scene.player.x + 20 <= 420));
  await button(); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinXoxoSmall.tiles.map((e) => e.frame), __remake.scene.snowdinXoxoSmall.wall.disabled]), [53, [3, 3], true]);
  assert.ok(await page.evaluate(() => __remake.scene.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room').every((e) => e.image.texture.key.endsWith(':1'))));
  await place(395, 100); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.player.x > 425); await page.keyboard.up('ArrowRight');
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.plot = 51; await w.restoreGame(); }); assert.equal(await page.evaluate(() => __remake.scene.plot), 53);
  assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.tiles.map((e) => e.frame)), [0, 0], 'Vào lại giữ cửa mở; ảnh ô Create về0 như gốc.');
  await place(240, 160, 'u'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Turn every X/); await key('z');
  for (const choice of [0, 1]) {
    await open({}); await place(330, 100); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinXoxoSmall.stage === 'notice'); await page.keyboard.up('ArrowRight');
    const position = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), position);
    await page.waitForFunction(() => !!__remake.scene.dialogue); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 3); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus');
    for (let i = 0; i < 3; i++) await key('z'); assert.deepEqual(await page.evaluate(() => __remake.scene.choiceUi.slice(1).map((e) => e.text)), ['Ate it', 'Left it']);
    await page.waitForTimeout(120); if (choice) await key('ArrowRight'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.flags[62]), choice + 1); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 7);
    for (let i = 0; i < 7; i++) await key('z'); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.locked), false);
    await page.waitForFunction(() => __remake.scene.snowdinXoxoSmall.stage === 'done'); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.inventory]), [51, 100, [16]]);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); }); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.pap ?? null), null);
  }
  for (const [flags, plot, expected, flag62] of [[{ 26: 4 }, 51, 57, 1], [{ 26: 4, 27: 1 }, 51, 51, undefined], [{ 26: 3 }, 51, 51, undefined], [{ 62: 2 }, 53, 53, 2]]) {
    await open(flags, plot); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[62]]), [expected, flag62]);
    assert.equal(await page.evaluate(() => !!__remake.scene.snowdinXoxoSmall.pap), !flag62); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoSmall.wall.disabled), expected > 52);
  }
  await open(); await page.screenshot({ path: '.cache/xoxo-small.png' }); await place(110, 20, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_snowpuzz');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinXoxoSmall]), [450, 520, null]);
  console.log('✓ X/O nhỏ: cửa snowpuzz↔small/nhạc, line chân/X→O→tamgiác/đứngyên/nút/reset/53/tường-gai/SAVE, Papyrus!20frame/Ate-Left/62/khóa/rời/khôngđổiđồ, tuyến4-27');
}
