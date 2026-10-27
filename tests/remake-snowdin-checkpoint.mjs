import assert from 'node:assert/strict';

export async function testSnowdinCheckpoint(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const advance = async (stage) => assert.equal(await page.evaluate((stage) => {
    const s = __remake.scene.snowdinCheckpoint; for (let i = 0; i < 1000 && s.stage !== stage; i++) s.step(); return s.stage;
  }, stage), stage);
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count);
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const open = async (flags = {}, meetings = 0, plot = 37) => page.evaluate(async ({ flags, meetings, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot;
    localStorage.setItem('undertale-remake-papyrus-meetings', String(meetings)); await w.openRoom('room_tundra4', 'obj_markerC');
  }, { flags, meetings, plot });
  const near = (name) => page.evaluate((name) => {
    const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X - e.sprite.OriginX + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y - e.sprite.OriginY + e.sprite.MarginBottom - 8);
    w.player.facing = 'u'; w.interactionCooldown = 0;
  }, name);
  // Đi qua cửa thật từ Box Road, giữ nguyên instance nhạc và markerC.
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 37; w.flags = {}; await w.openRoom('room_tundra3'); window.boxSong = w.snowdinMusic; });
  await place(375, 140); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra4');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 140]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === boxSong), true);
  assert.ok(await page.evaluate(() => !!__remake.scene.snowdinEncounter));
  for (const [flags, meetings, murder, finalMurder] of [[{}, 0, false, false], [{}, 1, false, false], [{ 202: 20, 45: 4 }, 0, true, true], [{ 202: 20, 45: 4, 27: 1 }, 0, false, true]]) {
    await open(flags, meetings); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => !!__remake.scene.snowdinCheckpoint.child), false);
    const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
    assert.ok(pos[0] >= 61 && pos[0] < 80); assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.locked), true);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus');
    await read(murder ? 7 : 1, murder ? /SO SANS/ : /UNDYNE/);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_papyrus');
    assert.ok(Math.abs(await page.evaluate(() => __remake.scene.snowdinMusic.volume) - .6) < .000001);
    await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.phase), 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
    await advance('turning');
    const turns = await page.evaluate(() => {
      const s = __remake.scene.snowdinCheckpoint;
      while (s.look < 23) s.step(); let alternating = 0; while (s.look === 23) { s.step(); alternating++; }
      let spinning = 0; while (s.look === 24) { s.step(); spinning++; }
      return [alternating, spinning, s.spin];
    });
    assert.deepEqual(turns, [12, 39, 38]); await advance('talking');
    assert.equal(await page.evaluate(() => Number(localStorage.getItem('undertale-remake-papyrus-meetings'))), meetings + 1);
    await read(murder ? 3 : meetings ? 3 : 2, /SANS/);
    await advance('panLeft');
    const pan = await page.evaluate(() => { const w = __remake.scene, s = w.snowdinCheckpoint, before = w.cameras.main.scrollX; for (let i = 0; i < 20; i++) s.step(); return [before, w.cameras.main.scrollX]; });
    assert.equal(pan[1], Math.max(-40, pan[0] - 20)); assert.ok(pan[1] < 0 && pan[1] > -40);
    await advance('rockWait'); assert.equal(await page.evaluate(() => __remake.scene.cameras.main.scrollX), -40);
    await advance('talking'); await read(murder ? 1 : 2, murder ? /OH MY GOD/ : /uhhhh/);
    await advance('talking'); assert.equal(await page.evaluate(() => __remake.scene.cameras.main.scrollX), 0);
    await read(1, murder ? /ROCK/ : /OH/); assert.equal(await page.evaluate(() => __remake.scene.cameras.main.useBounds), true);
    await read(1, /front of the rock/); await advance('talking'); await read(1, /OH MY GOD/);
    await read(1, murder ? /NO IDEA/ : /HUMAN/); await read(1, murder ? /not a rock/ : /yes/);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus');
    await read(murder ? 9 : 15, murder ? /NOT A ROCK/ : /OH MY GOD/);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.papSpeed), 5);
    await read(1, /NYEH HEH/); assert.ok(await page.evaluate(() => __remake.scene.snowdinCheckpoint.pap.x > 240));
    await read(finalMurder ? 1 : 3, finalMurder ? /bat an eye/ : /went well/);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.sansSpeed), 3); await advance('done');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinCheckpoint.locked, __remake.scene.snowdinMusic.key, __remake.scene.snowdinMusic.rate]), [40, false, 'mus_snowy', murder ? .4 : .95]);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('undertale-remake-temp-v1')).flags.plot), 40);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinCheckpoint.stage, __remake.scene.snowdinCheckpoint.sans ?? null]), ['done', null]);
  }
  // Trạm gác có collider thật; lời ghi chú đổi font và nhánh sau kết thúc.
  await open({}, 0, 40); await place(410, 105, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(450); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_papcheckpoint'); return w.player.y + 19 >= c.rectangle.bottom; }));
  await page.evaluate(() => { const w = __remake.scene, e = w.snowdinCheckpoint.checkpoint; w.player.setPosition(e.item.X + 10, e.item.Y + e.sprite.MarginBottom - 8); w.player.facing = 'u'; w.interactionCooldown = 0; });
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 5);
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /SENTRY STATION/); for (let i = 0; i < 4; i++) await key('z');

  await page.evaluate(() => { __remake.scene.flags[7] = 1; __remake.scene.interactionCooldown = 0; }); await key('z'); await read(6, /narration/);
  await place(405, 45, 'u'); await key('z'); await read(1, /camera behind/);
  // Fun40–45: cả Yes/No và giới hạn ngoài khoảng, ghi277 chỉ sau Click.
  for (const [fun, no] of [[40, false], [45, true]]) {
    await open({ 5: fun }, 0, 40); await place(285, 120); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => __remake.scene.snowdinCheckpoint.stage === 'phoneWait'); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.scene.flags[277] ?? 0), 0); await advance('talking');
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.isPaused), true); await read(1, /Ring/); await read(1, /hey/);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.choice.index), 0);
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /refrigerator/);
    await page.waitForTimeout(120); if (no) await key('ArrowRight'); await key('z');
    await read(no ? 3 : 1, no ? /fix it/ : /brewskis/); assert.equal(await page.evaluate(() => __remake.scene.flags[277] ?? 0), 0);
    await read(1, /Click/); assert.equal(await page.evaluate(() => __remake.scene.flags[277]), 1);
    await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.phoneType), 0);
  }
  for (const fun of [46, 50]) {
    await open({ 5: fun }, 0, 40); await place(285, 120); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => __remake.scene.snowdinCheckpoint.stage === 'phoneWait'); await page.keyboard.up('ArrowRight');
    await advance('talking'); await read(1, /Ring/); await read(7, /U-uhhh/); await read(1, /Click/);
    assert.equal(await page.evaluate(() => __remake.scene.flags[277]), 1);
  }
  for (const [flags, plot] of [[{ 5: 39 }, 40], [{ 5: 51 }, 40], [{ 5: 40, 7: 1 }, 40], [{ 5: 40, 277: 1 }, 40], [{ 5: 40 }, 120]]) {
    await open(flags, 0, plot); assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.phoneType), 0);
  }
  // scr_enemynpc1: Snowdrake chỉ ở đây sau plot100 nếu dân số203 chưa bị giết.
  await open({}, 0, 110); await near('obj_snowdrakenpc'); await key('z'); await read(3, /ran away/);
  await near('obj_snowdrakenpc'); await key('z'); await read(1, /don't care/);
  assert.equal(await page.evaluate(() => __remake.scene.colliders.some((c) => c.objectName === 'obj_snowdrakenpc')), true);
  await place(185, 130, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y + 19 >= 142), 'Snowdrake chặn chân thật.');
  await open({ 203: 1 }, 0, 110); assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.child), null);
  await open({ 7: 1 }, 0, 110);
  assert.deepEqual(await page.evaluate(() => __remake.scene.colliders.filter((c) => ['obj_snowdrakenpc', 'obj_npc_room', 'obj_snowdrakedad'].includes(c.objectName)).map((c) => c.objectName).sort()), ['obj_npc_room', 'obj_snowdrakedad', 'obj_snowdrakenpc']);
  assert.deepEqual(await page.evaluate(() => { const e = __remake.scene.roomObjects.find((e) => e.item.ObjectName === 'obj_npc_room'); const b = e.image.getBounds(); return [b.x, b.y]; }), [208, 90]);
  await near('obj_snowdrakenpc'); await key('z'); await read(4, /Mom might/);
  await near('obj_npc_room'); await key('z'); await read(1, /Sn/);
  await near('obj_snowdrakedad'); await key('z'); await read(4, /doctah/);
  await page.evaluate(() => { __remake.scene.flags[425] = 1; }); await near('obj_snowdrakedad'); await key('z'); await read(4, /boss stopped/);
  await page.evaluate(() => { __remake.scene.flags[57] = 2; }); await near('obj_snowdrakedad'); await key('z'); await read(4, /My son/);
  await open({ 7: 1, 26: 12 }, 0, 110); assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some((e) => e.item.ObjectName === 'obj_snowdrakedad')), false);
  await open({}, 0, 39); assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint.stage), 'done');
  // Cửa D trả về markerD của Box Road và giữ nhạc. Camera bỏ giới hạn phải dọn khi đổi phòng giữa cảnh.
  await place(20, 140, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra3');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [360, 140]);
  await open(); await place(65, 140); await page.keyboard.press('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  await read(1, /UNDYNE/); await advance('talking'); await read(2, /SANS/); await advance('panLeft');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra3'); });
  assert.equal(await page.evaluate(() => __remake.scene.cameras.main.useBounds), true); assert.equal(await page.evaluate(() => __remake.scene.snowdinCheckpoint), null);
  console.log('✓ Papyrus phòng4: cửa/nhạc, bốn nhánh/ký ức/cờ27, quay/camera đá/khóa/font/plot40/lưu tạm, trạm/camera/collider, cuộc gọi fun40–50/Yes-No/277 và gia đình Snowdrake sau kết thúc');
}
