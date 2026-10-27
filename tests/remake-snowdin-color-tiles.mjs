import assert from 'node:assert/strict';

export async function testSnowdinColorTiles(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const open = (flags = {}, plot = 56) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 100; w.inventory = [16]; await w.openRoom('room_tundra_randoblock'); w.player.setPosition(20, 100); }, { flags, plot });
  const enter = async () => { await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinColorTiles.stage === 'notice'); await page.keyboard.up('ArrowRight'); };
  const read = async (count, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); for (let i = 0; i < count; i++) await key('z'); };
  const choose = async (choice) => { await page.waitForTimeout(120); if (choice) await key('ArrowRight'); await key('z'); };
  const finish = () => page.evaluate(() => { const s = __remake.scene.snowdinColorTiles; for (let i = 0; i < 1000 && s.stage !== 'done'; i++) s.step(); });
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 62: 1 }; w.plot = 56; w.gold = 100; w.inventory = [16]; await w.openRoom('room_tundra_xoxopuzz'); w.player.setPosition(780, 100); window.colorSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_randoblock');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === colorSong, __remake.scene.snowdinEncounter]), [20, 100, true, null]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinColorTiles.tiles.length), 48);
  assert.ok(await page.evaluate(() => __remake.scene.snowdinColorTiles.tiles.every((t) => { const a = t.color & 255, b = (t.color >> 8) & 255, c = (t.color >> 16) & 255; return a === b && b === c && a >= 120 && a <= 247; })));
  await enter(); const stopped = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), stopped);
  await page.waitForFunction(() => !!__remake.scene.dialogue); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus'); await read(33, /HEY!/);
  assert.deepEqual(await page.evaluate(() => __remake.scene.choiceUi.slice(1).map((e) => e.text)), ['Of course', 'No']); await choose(0); await read(7, /GREAT/);
  const spin = await page.evaluate(() => {
    const w = __remake.scene, s = w.snowdinColorTiles; for (let i = 0; i < 3; i++) s.step();
    const palette = s.tiles.every((t) => [0x0000ff, 0xffff00, 0x00ff00, 0x800080, 0xffa040, 0xff0000, 0xff6464].includes(t.color));
    const pitch = s.computer.rate; for (let i = 0; i < 1000 && s.stage === 'spinning'; i++) s.step();
    const terminal = [s.stage, s.randofactor, s.finalrando, s.tiles.every((t) => t.color === (t.y < 120 || t.y >= 160 ? 0xff0000 : 0xff6464)), s.computer, s.papMusic, w.plot, s.locked];
    for (let i = 0; i < 109; i++) s.step(); const wait = s.stage; s.step(); return [palette, pitch, terminal, wait, s.stage];
  }); assert.equal(spin[0], true); assert.ok(spin[1] > .1); assert.deepEqual(spin.slice(2), [['spinWait', -1, 121, true, null, null, 56, true], 'spinWait', 'papDown']);
  await finish(); assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, s = w.snowdinColorTiles; return [w.plot, s.stage, s.locked, s.pap.active, s.sans.x, s.sans.y, w.snowdinMusic.key, w.snowdinMusic.rate, w.gold, w.inventory]; }), [58, 'done', false, false, 245, 140, 'mus_snowy', .95, 100, [16]]);
  // Các hàng đỏ thật sự chặn, hành lang hồng đi ngang được.
  await place(100, 101, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(200); await page.keyboard.up('ArrowUp'); assert.ok(await page.evaluate(() => __remake.scene.player.y >= 101));
  await place(100, 110); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.player.x > 210); await page.keyboard.up('ArrowRight');
  await place(245, 160, 'u'); await key('z'); await read(4, /spaghetti/);
  await page.screenshot({ path: '.cache/color-tiles.png' }); await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinColorTiles.stage, __remake.scene.snowdinColorTiles.pap ?? null, __remake.scene.snowdinColorTiles.sans ?? null]), [58, 'done', null, null]);
  // Nghe lại rồi đồng ý dùng đúng lời và vẫn chạy máy ngẫu nhiên.
  await open(); await enter(); await page.waitForFunction(() => !!__remake.scene.dialogue); await read(33, /HEY/); await choose(1); await read(19, /OKAY/); assert.deepEqual(await page.evaluate(() => __remake.scene.choiceUi.slice(1).map((e) => e.text)), ['Yes', 'Even less']); await choose(0); await read(7, /GREAT/); await finish(); assert.equal(await page.evaluate(() => __remake.scene.plot), 58);
  // Từ chối hai lần: để lại ghi chú, không tô giả thành lời giải nhánh máy.
  await open(); await enter(); await page.waitForFunction(() => !!__remake.scene.dialogue); await read(33, /HEY/); await choose(1); await read(19, /OKAY/); await choose(1); await read(11, /\.{5}/); assert.equal(await page.evaluate(() => __remake.scene.snowdinColorTiles.stage), 'noteWait'); await finish();
  assert.ok(await page.evaluate(() => __remake.scene.snowdinColorTiles.tiles.every((t) => (t.color & 255) === ((t.color >> 8) & 255)))); await place(255, 103, 'u'); await key('z'); await read(1, /illegible/);
  await place(240, 65, 'u'); await key('z'); await read(1, /machine isn't working/);
  // Tuyến giết: Frisk bước qua khi Papyrus đang nói, rồi đối thoại đổi cả hai người.
  await open({ 26: 4 }); await enter(); await page.waitForFunction(() => !!__remake.scene.dialogue); const start = await page.evaluate(() => __remake.scene.snowdinColorTiles.walkerStart); await read(4, /HEY/);
  await page.waitForFunction(() => __remake.scene.snowdinColorTiles.stage === 'murderTalk'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.visible, __remake.scene.snowdinColorTiles.walker.active]), [start + 93, true, false]);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 20);
  for (let i = 0; i < 20; i++) { if (i === 5) assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_comicsans'); if (i === 6) assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus'); await key('z'); }
  await finish(); await place(245, 160, 'u'); await key('z'); await read(1, /puzzles might be fun/); assert.equal(await page.evaluate(() => __remake.scene.plot), 58);
  await open({ 26: 4, 27: 1 }); await enter(); await page.waitForFunction(() => !!__remake.scene.dialogue); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 33);
  // Đổi phòng giữa lúc đang khóa phải dọn nhạc/actor, không còn callback sửa plot.
  await page.evaluate(async () => { const w = __remake.scene; window.colorPuzzleOld = w.snowdinColorTiles; window.colorPapMusic = colorPuzzleOld.papMusic; await w.openRoom('room_area1'); }); await page.waitForTimeout(150); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinColorTiles, colorPuzzleOld.pap.active, colorPapMusic.pendingRemove]), [null, false, true]);
  await open({}, 91); assert.equal(await page.evaluate(() => __remake.scene.snowdinColorTiles.switch), null);
  await open({}, 58); await place(20, 100); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_xoxopuzz'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinColorTiles]), [780, 100, null]);
  console.log('✓ Ô màu: cửa/48ô/xám/33trang/nghe lại/2lựa chọn, alarm/random7màu/chốtđỏ-hồng/va chạm/lối đi/nhạc/58/SAVE, từchối/note, tuyếnđiqua93px/20trang/hai font/27/dọn');
}
