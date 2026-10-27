import assert from 'node:assert/strict';

export async function testElectricMaze(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, meetings = 0, plot = 42) => page.evaluate(async ({ flags, meetings, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot;
    localStorage.setItem('undertale-remake-papyrus-meetings', String(meetings)); await w.openRoom('room_tundra7', 'obj_markerC');
  }, { flags, meetings, plot });
  const advance = async (stage) => assert.equal(await page.evaluate((stage) => { const s = __remake.scene.electricMaze; for (let i = 0; i < 500 && s.stage !== stage; i++) s.step(); return s.stage; }, stage), stage);
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 42; await w.openRoom('room_tundra6'); w.player.setPosition(580, 140); window.iceSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra7');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 120]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === iceSong), true);
  for (const meetings of [0, 2]) {
    await open({}, meetings); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_papyrus');
    await read(meetings ? 9 : 5, meetings ? /REALLY THOUGH/ : /LAZY/);
    const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
    await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
    await advance('talking'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 14);
    for (let i = 0; i < 8; i++) await key('z');
    assert.ok(await page.evaluate(() => __remake.scene.electricMaze.pap.texture.key.startsWith('spr_papyrus_orb:')));
    for (let i = 8; i < 14; i++) await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.electricMaze.stage), 'tryFirst');
    assert.ok(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_puzzlewall1')));
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'papShock'); await page.keyboard.up('ArrowRight');
    const shake = await page.evaluate(() => { const s = __remake.scene.electricMaze; s.step(); return [s.pap.x, s.pap.y, s.pap.texture.key]; });
    assert.ok(shake[0] >= 238 && shake[0] <= 243); assert.match(shake[2], /electrocute/);
    await advance('toasted'); await advance('talking'); await read(1, /WHAT DID YOU/); await read(1, /hold the orb/); await read(1, /OKAY/);
    await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'walkToHuman');
    await page.waitForTimeout(300); assert.ok(await page.evaluate(() => __remake.scene.electricMaze.pap.y > 100));
    await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'talking');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.electricMaze.pap.x, __remake.scene.electricMaze.pap.y]), [90, 104]);
    assert.ok(await page.evaluate(() => __remake.scene.electricMaze.footsteps.length > 10));
    await read(1, /HOLD THIS/); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.orbVy), -4);
    await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'talking'); await read(1, /TRY NOW/);
    await page.waitForFunction(() => __remake.scene.electricMaze.onHead);
    assert.equal(await page.evaluate(() => __remake.scene.electricMaze.stage), 'tryMaze');
    const hp = await page.evaluate(() => __remake.scene.hp);
    // Va chạm vùng trắng giật15frame, rung/khóa rồi trả về vị trí cũ, không gây mấtHP.
    await place(170, 120); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'playerShock'); await page.keyboard.up('ArrowRight');
    const memory = await page.evaluate(() => __remake.scene.electricMaze.memory); await advance('tryMaze');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.hp]), [memory.x, memory.y, hp]);
    // Đi hết đường an toàn theo dấu chân bằng phím, không đẩy plot hay hủy mask.
    await place(90, 104);
    for (const [code, axis, target, greater] of [['ArrowRight', 'x', 124, true], ['ArrowUp', 'y', 64, false], ['ArrowRight', 'x', 184, true], ['ArrowDown', 'y', 164, true]]) {
      await page.keyboard.down(code);
      await page.waitForFunction(({ axis, target, greater }) => { const w = __remake.scene; return w.electricMaze.stage === 'playerShock' || (greater ? w.player[axis] >= target : w.player[axis] <= target); }, { axis, target, greater });
      await page.keyboard.up(code); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.stage), 'tryMaze');
    }
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
    await read(8, /INCREDIBLE/); await advance('done');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.electricMaze.locked, __remake.scene.electricMaze.orb.active, __remake.scene.snowdinMusic.key, __remake.scene.snowdinMusic.rate]), [43, false, false, 'mus_snowy', .95]);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_puzzlewall1')), false);
    await place(245, 94, 'u'); await key('z'); await read(7, /hey, thanks/);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.equal(await page.evaluate(() => __remake.scene.electricMaze.stage), 'done'); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.pap ?? null), null);
  }
  for (const meetings of [0, 2]) {
    await open({ 202: 20, 45: 4, 52: 1 }, meetings); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
    await read(meetings ? 9 : 5, meetings ? /REALLY THOUGH/ : /LAZY/); await advance('talking');
    assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
    await read(6, /HUMAN/); await advance('murderWait1'); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.fake.x), 160);
    await advance('talking'); await read(6, /UHHH/); await advance('murderWait2'); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.fake.x), 220);
    await advance('talking'); assert.equal(await page.evaluate(() => __remake.scene.flags[291]), 1); await read(2, /SIGH/); await advance('done');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.player.visible, __remake.scene.player.x, __remake.scene.player.facing, __remake.scene.snowdinMusic.rate]), [43, true, 220, 'd', .5]);
    await place(245, 94, 'u'); await key('z'); await read(1, /played along/);
  }
  await open({ 202: 20, 45: 4, 52: 1, 27: 1 }); assert.equal(await page.evaluate(() => __remake.scene.electricMaze.murder), false);
  // Đổi phòng giữa path/nhân vật thay thế phải dọn tween và hoàn trả Frisk hiển thị.
  await open(); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  await read(5, /LAZY/); await advance('talking'); await read(14, /HUMAN/);
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.electricMaze.stage === 'papShock'); await page.keyboard.up('ArrowRight');
  await advance('talking'); await read(1, /WHAT DID YOU/); await read(1, /hold the orb/); await read(1, /OKAY/);
  await page.evaluate(async () => { const w = __remake.scene; window.mazePath = w.electricMaze.path; await w.openRoom('room_tundra6A'); });
  assert.equal(await page.evaluate(() => mazePath.isPlaying()), false); assert.equal(await page.evaluate(() => __remake.scene.electricMaze), null);
  await open({ 202: 20, 45: 4, 52: 1 }); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  await read(5, /LAZY/); await advance('talking');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra6A'); });
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await open({}, 0, 43); await place(20, 120, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra6'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [580, 140]);
  console.log('✓ Mê cung điện7: cửa/nhạc, intro/kýức, Papyrus giật/path/dấu chân/orb, mask trắng/đen/giật15frame/đường đi thật, giải/43/Sans/SAVE và tuyến giết đi qua/291');
}
