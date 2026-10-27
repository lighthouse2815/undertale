import assert from 'node:assert/strict';

export async function testSnowdinStart(page) {
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const place = (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, [x, y, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const open = (flags = {}, plot = 30) => page.evaluate(async ({ flags, plot }) => {
    const world = __remake.game.scene.getScene('World');
    await world.openRoom('room_ruinsexit', 'obj_markerB');
    world.flags = flags; world.plot = plot; await world.openRoom('room_tundra1', 'obj_markerA');
  }, { flags, plot });
  // Đi qua cửa thật, trắng dần 180 frame rồi ba màn 150 frame; danh bạ đổi ở cuối.
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 28; world.flags = { 45: 5 }; world.phone = [201, 205];
    await world.openRoom('room_ruinsexit', 'obj_markerB');
  });
  await place(150, 175); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => __remake.scene.floweyExit?.stage === 'whiteout'); await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 30);
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 205]);
  await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await page.waitForTimeout(1300);
  const white = await page.evaluate(() => ({ alpha: __remake.scene.floweyExit.white.alpha, pos: [__remake.scene.player.x, __remake.scene.player.y] }));
  assert.ok(white.alpha > .1 && white.alpha < .7);
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(200); await page.keyboard.up('ArrowDown');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), white.pos);
  await page.waitForFunction(() => __remake.phase === 'chapterTitle');
  assert.equal(await page.evaluate(() => __remake.scene.con), 0);
  assert.equal(await page.evaluate(() => __remake.scene.logo.visible), true);
  assert.equal(await page.evaluate(() => __remake.scene.world.scene.isSleeping()), true);
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.con), 0);
  await page.evaluate(() => { const scene = __remake.scene; while (scene.con === 0) scene.step(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.logo.visible, __remake.scene.credit.visible, __remake.scene.credit.text]), [false, true, 'By Toby Fox']);
  await page.evaluate(() => { const scene = __remake.scene; while (scene.con === 1) scene.step(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.logo.visible, __remake.scene.credit.visible]), [false, false]);
  await page.evaluate(() => { const scene = __remake.scene; while (scene.con === 2) scene.step(); });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.player.facing, __remake.scene.phone]), [50, 140, 'r', [206]]);
  assert.equal(await page.evaluate(() => __remake.scene.scene.isActive()), true);
  assert.equal(await page.evaluate(() => __remake.game.scene.isActive('ChapterTitle')), false);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinStart.music.key), 'mus_tone2');
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinStart.music.volume), 1);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.find((e) => e.item.ObjectName === 'obj_ruins_reentrance').image.active), false);
  assert.ok(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_sul' && c.mask)));
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(700); await page.keyboard.up('ArrowLeft');
  assert.equal(await page.evaluate(() => __remake.room), 'room_tundra1');
  assert.ok(await page.evaluate(() => __remake.scene.player.x >= 35));
  await place(80, 128, 'd'); await key('z');
  assert.equal(await page.evaluate(() => !!__remake.scene.dialogue), false, 'Không đọc camera khi quay sai hướng.');
  await place(80, 128); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /camera hidden\n  in the bushes/); await drain();
  // 206 dùng menu CELL thật, không chịu nhánh busy hoặc silent của danh bạ cũ.
  await page.evaluate(() => { const w = __remake.scene; w.flags[37] = 1; w.flags[45] = 4; w.menuSelection = 2; });
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('z');
  assert.ok(await page.evaluate(() => __remake.scene.children.list.some((child) => child.text === "Toriel's Phone")));
  await key('z'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ['* Dialing... ', '* ... ', '* Nobody picked up.']); await drain();
  // Kết thúc: 18 nhánh tin nhắn, số đã đọc/khả dụng và thứ tự danh bạ được lưu lại.
  for (let index = 0; index < 18; index++) {
    const result = await page.evaluate(async (index) => {
      const { callToriel } = await import('/src/phone.mjs'); const w = __remake.scene;
      w.flags = { 7: 1, 286: index, 287: 30 }; w.phone = [201, 206, 205];
      callToriel(w, 206, w.cache.json.get('phone-dialogue'));
      return { count: w.dialogue.lines.length, read: w.flags[286], phone: w.phone, lines: w.dialogue.lines };
    }, index);
    assert.equal(result.count, [11, 6, 4, 1, 4, 2, 3, 5, 3, 2, 3, 4, 4, 5, 4, 4, 6, 1][index]);
    assert.equal(result.read, index + 1); assert.deepEqual(result.phone, [206, 201, 205]);
    assert.ok(result.lines.every((line) => !/[\^%]|\\[ET]/.test(line)));
    await drain();
  }
  await page.evaluate(async () => {
    const { callToriel } = await import('/src/phone.mjs'); const w = __remake.scene;
    w.flags = { 7: 1, 286: 3, 287: 3 }; callToriel(w, 206, w.cache.json.get('phone-dialogue'));
  });
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /not sent any/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[286]), 3);
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.phone = []; w.flags[286] = 0; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.phone, __remake.scene.flags[286]]), [[206, 201, 205], 3]);
  for (const [flags, plot, song, rate] of [
    [{}, 36, 'mus_snowy', .95], [{ 202: 20, 45: 4 }, 36, 'mus_snowy', .4],
    [{ 202: 20, 45: 4, 26: 1 }, 36, 'mus_snowy', .95], [{ 222: 1 }, 36, 'mus_toomuch', 1],
    [{ 222: 1, 27: 1 }, 36, 'mus_snowy', .95], [{ 7: 1, 222: 1 }, 30, 'mus_reunited', 1],
  ]) {
    await open(flags, plot);
    assert.deepEqual(await page.evaluate(() => { const m = __remake.scene.snowdinStart.music; return [m.key, m.rate]; }), [song, rate]);
  }
  // Tuyến kết thúc đi hai chiều, không logo và không ghi đè danh bạ/plot.
  await page.evaluate(() => { __remake.scene.phone = [206, 201]; });
  await place(50, 140, 'l'); await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruinsexit');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 175]);
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.phone, __remake.scene.plot]), [50, 140, [206, 201], 30]);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.find((e) => e.item.ObjectName === 'obj_ruins_reentrance').image.active), true);
  console.log('✓ Cửa Ruins → logo/credit/đen → Snowdin: thời gian/khóa/phone206, camera/va chạm/nhạc, 18 nhánh tin nhắn/lưu nạp và cửa kết thúc hai chiều');
}
