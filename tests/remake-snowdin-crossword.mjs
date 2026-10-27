import assert from 'node:assert/strict';

export async function testSnowdinCrossword(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const read = async (n, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), n); if (pattern) assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); for (let i = 0; i < n; i++) await key('z'); };
  const open = (flags = {}, plot = 43) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 123; w.inventory = [16]; await w.openRoom('room_tundra9', 'obj_markerC'); }, { flags, plot });
  const walk = async (direction, condition) => { await page.keyboard.down(direction); try { await page.waitForFunction(condition); } finally { await page.keyboard.up(direction); } };
  const paper = async (exit = 'x') => {
    await place(150, 130, 'u'); await key('z');
    await page.waitForFunction(() => __remake.scene.snowdinCrossword.sheet?.active);
    assert.equal(await page.evaluate(() => __remake.scene.flags[254]), 1);
    // Kiểm tra1–10 trong cùng callback: độ trễ RPC có thể vượt11frame trước phím X.
    // Vẫn mở/đóng ảnh bằng bàn phím thật; phát event X của Phaser cho từng frame bị khóa.
    const early = await page.evaluate(() => {
      const w = __remake.scene, c = w.snowdinCrossword, position = [w.player.x, w.player.y], states = [];
      c.frames = 1; c.elapsed = 0;
      for (let frame = 1; frame <= 10; frame++) {
        w.keys.up.isDown = true; w.menuPressed = true; w.input.keyboard.emit('keydown-X'); w.update(0, 0);
        states.push([c.frames, c.stage, c.sheet.active, __remake.phase, w.player.x, w.player.y]);
        w.keys.up.isDown = false; w.menuPressed = false;
        if (frame < 10) c.step();
      }
      return { position, states };
    });
    assert.deepEqual(early.states, Array.from({ length: 10 }, (_, i) => [i + 1, 'sheet', true, 'running', ...early.position]));
    await page.waitForFunction(() => __remake.scene.snowdinCrossword.frames >= 11); await key(exit);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.sheet.active), false);
  };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 43; await w.openRoom('room_tundra8'); w.player.setPosition(720, 420); window.crossSong = w.snowdinMusic; });
  await walk('ArrowRight', () => __remake.phase === 'transition'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra9');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === crossSong]), [20, 120, true]);
  for (const [view, choice, murder] of [[false, 0, false], [true, 1, false], [false, 0, true], [true, 0, true]]) {
    await open(murder ? { 202: 20, 45: 4, 52: 1, 27: 1 } : {}); // Phòng9 đọc murderlv>=3 cả khi27=1.
    await walk('ArrowRight', () => !!__remake.scene.dialogue); assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_papyrus');
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus'); await read(1, /READY/);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.stage), 'notice');
    await page.waitForFunction(() => !!__remake.scene.dialogue); await read(3, /WHERE'S/);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.stage), 'explore');
    assert.ok(await page.evaluate(() => __remake.scene.snowdinCrossword.wall.rectangle.height > 10000));
    await place(35, 120); await walk('ArrowLeft', () => !!__remake.scene.dialogue); await read(3, /ESCAPING/);
    assert.equal(await page.evaluate(() => __remake.scene.player.facing), 'r'); assert.equal(await page.evaluate(() => __remake.room), 'room_tundra9');
    if (view) { await paper(); assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.stage), 'explore'); }
    await place(195, 120); await walk('ArrowRight', () => !!__remake.scene.dialogue);
    if (murder) await read(view ? 4 : 5, view ? /DIDN'T SKIP/ : /DID NOTHING/);
    else {
      await read(11, view ? /DIDN'T DO/ : /DIDN'T EVEN/);
      assert.deepEqual(await page.evaluate(() => __remake.scene.choiceUi.slice(1).map((e) => e.text)), ['Jumble', 'Crossword']);
      await page.waitForTimeout(120); if (choice) await key('ArrowRight'); await key('z'); await read(choice ? 7 : 4, choice ? /WEIRD/ : /YES/);
    }
    assert.equal(await page.evaluate(() => __remake.scene.plot), 43);
    await page.waitForFunction(() => __remake.scene.plot === 47);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.snowdinCrossword.wall, __remake.scene.snowdinMusic.key]), [123, [16], null, 'mus_snowy']);
    assert.equal(await page.evaluate(() => __remake.scene.flags[58] ?? 0), choice);
    assert.ok(await page.evaluate(() => __remake.scene.snowdinCrossword.pap.x >= 390));
    await place(240, 116, 'u'); await key('z'); await read(murder ? view ? 2 : 4 : 2, murder ? /word searches/ : choice ? /difficulty/ : /junior jumble/);
    await paper('z');
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[254], __remake.scene.snowdinCrossword.stage, __remake.scene.snowdinCrossword.sansEntry ?? null]), [47, 1, 'done', null]);
  }
  // Cờ56/57 phải cùng tồn tại trong SAVE và ký ức General.fun ngoài SAVE mới đổi ảnh.
  for (const [flag, fun, frame] of [[56, 57, 1], [57, 56, 1], [55, 56, 0], [56, 0, 0]]) {
    await page.evaluate((fun) => localStorage.setItem('undertale-remake-fun', String(fun)), fun); await open({ 5: flag }, 47);
    await place(150, 130, 'u'); await key('z'); await page.waitForFunction(() => __remake.scene.snowdinCrossword.sheet?.active);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.sheet.texture.key), `spr_wordsearch:${frame}`);
    await page.screenshot({ path: `.cache/crossword-${frame}.png` });
    await page.evaluate(async () => __remake.scene.openRoom('room_tundra8'));
    assert.equal(await page.evaluate(() => __remake.scene.children.list.some((e) => e.texture?.key.startsWith('spr_wordsearch'))), false);
  }
  await page.evaluate(() => localStorage.removeItem('undertale-remake-fun'));
  for (const plot of [46, 47, 110]) { await open({}, plot); assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.stage), 'done'); assert.equal(await page.evaluate(() => __remake.scene.snowdinCrossword.sans ?? null), null); }
  await place(20, 120, 'l'); await walk('ArrowLeft', () => __remake.phase === 'transition'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra8');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinCrossword]), [720, 420, null]);
  console.log('✓ Crossword9: cửa dưới8↔9/nhạc, trigger/45frame/khóa/tường quay lại, ảnh thường-nightmare/1-10frame/254, xem-bỏ qua/Jumble-Crossword/58/tuyến27, Papyrus rời/47/Sans/SAVE/dọn');
}
