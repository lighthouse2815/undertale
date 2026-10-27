import assert from 'node:assert/strict';

export async function testSnowdinXoxoBig(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const open = (flags = {}, plot = 54) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 100; w.inventory = [16]; await w.openRoom('room_tundra_xoxopuzz'); }, { flags, plot });
  const read = async (count, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); for (let i = 0; i < count; i++) await key('z'); };
  const pap = async () => { const x = await page.evaluate(() => __remake.scene.snowdinXoxoBig.pap.x); await place(x, 80, 'u'); await key('z'); };
  const choose = async (choice) => { await page.waitForTimeout(120); if (choice) await key('ArrowRight'); await key('z'); };
  const button = () => page.evaluate(() => { const w = __remake.scene, s = w.snowdinXoxoBig; w.player.setPosition(s.button.item.X, s.button.item.Y - 15); s.step(); });
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 53; w.gold = 100; w.inventory = [16]; w.flags = { 62: 1 }; await w.openRoom('room_tundra_xoxosmall'); w.player.setPosition(460, 100); window.bigXoxoSong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_xoxopuzz');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === bigXoxoSong, __remake.scene.snowdinEncounter]), [20, 100, true, null]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.tiles.length), 15);
  await pap(); await read(5, /SOCK COLLECTION/);
  await place(285, 110); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinXoxoBig.stage === 'walking'); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 54); const before = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), before);
  await page.waitForFunction(() => !!__remake.scene.dialogue); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.pap.x), 259); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 14);
  for (let i = 0; i < 14; i++) { if (i === 9) { await page.waitForTimeout(50); assert.match(await page.evaluate(() => __remake.scene.snowdinXoxoBig.pap.texture.key), /^spr_papyrus_cape:/); } if (i === 12) assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.pap.texture.key), 'spr_papyrus_dt:0'); await key('z'); }
  assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinXoxoBig.stage, __remake.scene.snowdinXoxoBig.locked]), ['explore', false]);
  await pap(); await read(6, /WANT\nA HINT/); await pap(); await read(2, /MAYBE SOLVING/);
  await pap(); await read(4, /EUREKA/); await choose(0); await read(4, /THE!/);
  await pap(); await read(2, /FIGURED OUT/); await choose(1); await read(3, /WOW/);
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinXoxoBig.stage, __remake.scene.snowdinXoxoBig.pap.x, __remake.scene.snowdinXoxoBig.talked]), [54, 'explore', 300, 0]);
  const camera = await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(447, 105); w.updateCamera(); const before = w.cameras.main.scrollX; w.player.x = 500; w.updateCamera(); const frozen = w.cameras.main.scrollX; w.player.x = 400; w.updateCamera(); return [before, frozen, w.cameras.main.scrollX]; }); assert.deepEqual(camera, [297, 297, 250]);
  // Những ô kề dọc cần chạm đúng một hàng chân; không gán trực tiếp frame thắng.
  const activate = (i) => page.evaluate((i) => { const w = __remake.scene, s = w.snowdinXoxoBig, t = s.tiles[i]; w.player.setPosition(370, 180); s.step(); w.player.setPosition(t.item.X + 1, t.item.Y - 16); s.step(); }, i);
  await activate(0); await button(); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[63], __remake.scene.plot, __remake.scene.snowdinXoxoBig.tiles.map((t) => t.frame)]), [1, 54, Array(15).fill(0)]);
  // Đi thật qua một ô; ô chỉ đổi một lần khi còn đứng trong vùng.
  await place(398, 65); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinXoxoBig.tiles[0].touched); await page.keyboard.up('ArrowRight'); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.tiles[0].frame), 1);
  await activate(0); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.tiles[0].frame), 2); await button();
  for (let i = 0; i < 15; i++) await activate(i);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinXoxoBig.tiles.map((t) => t.frame), __remake.scene.snowdinXoxoBig.victory]), [Array(15).fill(1), true]);
  await place(570, 110); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight'); assert.ok(await page.evaluate(() => __remake.scene.player.x + 20 <= 600));
  await button(); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinXoxoBig.tiles.map((t) => t.frame), __remake.scene.snowdinXoxoBig.wall.disabled]), [56, Array(15).fill(3), true]);
  await page.waitForFunction(() => !!__remake.scene.dialogue); await read(7, /WOW/); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.locked), true); await page.waitForFunction(() => !__remake.scene.snowdinXoxoBig.locked);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory]), [100, [16]]); assert.ok(await page.evaluate(() => !!__remake.scene.snowdinXoxoBig.sans));
  await place(570, 110); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.player.x > 610); await page.keyboard.up('ArrowRight');
  // Sans sau giải: số lần sai và ký ức gặp lại dùng đúng dữ liệu hiện có.
  await page.evaluate(() => { __remake.scene.flags[63] = 6; }); await place(620, 100, 'u'); await key('z'); await read(2, /ask for help/);
  await page.evaluate(() => { __remake.scene.flags[63] = 0; localStorage.setItem('undertale-remake-sans-meetings', '2'); }); await place(620, 100, 'u'); await key('z'); await read(3, /good at puzzles/);
  await page.evaluate(() => { localStorage.setItem('undertale-remake-sans-meetings', '0'); }); await place(620, 100, 'u'); await key('z'); await read(3, /good job/);
  // Quay về bên trái làm Flowey chìm và tăng cờ9 đúng một lần.
  await place(20, 100); await page.waitForFunction(() => !__remake.scene.snowdinXoxoBig.flowey.active); assert.equal(await page.evaluate(() => __remake.scene.flags[9]), 1);
  await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinXoxoBig.pap ?? null, __remake.scene.snowdinXoxoBig.sans ?? null, __remake.scene.snowdinXoxoBig.wall.disabled]), [56, null, null, true]);
  // Công tắc cây chỉ đặt fvic; vẫn phải nhấn nút kiểm tra để hoàn thành.
  await open(); await place(200, 65, 'u'); await key('z'); await read(1, /switch/); await choose(1); assert.equal(await page.evaluate(() => __remake.scene.snowdinXoxoBig.victory), false);
  await place(200, 65, 'u'); await key('z'); await read(1, /switch/); await choose(0); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinXoxoBig.victory, __remake.scene.plot]), [true, 54]);
  await pap(); await read(6, /WANT\nA HINT/); await button(); await page.waitForFunction(() => !!__remake.scene.dialogue); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /MY ADVICE HELPED/); for (let i = 1; i < 7; i++) await key('z'); await page.waitForFunction(() => !__remake.scene.snowdinXoxoBig.locked);
  // Ngưỡng plot, tuyến tự mở và cờ27 không bỏ qua cảnh.
  for (const [flags, plot, expected, present] of [[{ 26: 4 }, 53, 57, false], [{ 26: 4, 27: 1 }, 53, 53, true], [{ 26: 3 }, 53, 53, true], [{}, 55, 55, false], [{}, 56, 56, false]]) {
    await open(flags, plot); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, !!__remake.scene.snowdinXoxoBig.pap, __remake.scene.snowdinXoxoBig.wall.disabled]), [expected, present, expected >= 56]);
  }
  for (const [flags, plot, count] of [[{}, 101, 2], [{ 7: 1 }, 101, 2], [{ 203: 1 }, 101, 0], [{}, 100, 0]]) {
    await open(flags, plot); assert.equal(await page.evaluate(() => !!__remake.scene.snowdinXoxoBig.chill), !!count); if (count) { await place(262, 65, 'u'); await key('z'); await read(count, flags[7] ? /surface/ : /self-sufficiently/); }
  }
  await open({}, 56); await place(500, 105); await page.evaluate(() => __remake.scene.updateCamera()); await page.screenshot({ path: '.cache/xoxo-big.png' }); await place(20, 100); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_xoxosmall');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinXoxoBig]), [460, 100, null]);
  console.log('✓ X/O lớn: cửa/15ô/nút/sai63/56/tường/SAVE, Papyrus5/54/đi/14trang/áo choàng/gợi ý/Yes-No/cây, Sans/kýức/sai, Flowey9, Chilldrake/tuyến/dọn');
}
