import assert from 'node:assert/strict';

export async function testSnowdinForest(page) {
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => {
    const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0;
  }, [x, y, facing]);
  const advanceTo = async (stage, limit = 700) => {
    const result = await page.evaluate(({ stage, limit }) => {
      const s = __remake.scene.snowdinForest;
      for (let i = 0; i < limit && s.stage !== stage; i++) s.step();
      return s.stage;
    }, { stage, limit });
    assert.equal(result, stage);
  };
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count);
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const open = (flags, meetings = 0) => page.evaluate(async ({ flags, meetings }) => {
    const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = 30;
    localStorage.setItem('undertale-remake-sans-meetings', String(meetings)); await w.openRoom('room_tundra2', 'obj_markerA');
  }, { flags, meetings });
  await page.evaluate(async () => {
    const w = __remake.scene; await w.openRoom('room_area1'); w.flags = {}; w.plot = 30;
    localStorage.setItem('undertale-remake-sans-meetings', '0'); await w.openRoom('room_tundra1', 'obj_markerA');
    window.firstSnowdinSong = w.snowdinMusic;
  });
  await place(400, 160); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [40, 160]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === firstSnowdinSong), true);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.trees.length), 9);
  await place(535, 155); await key('z'); await read(1, /tough-looking branch/);
  await place(590, 160); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.snowdinForest.broken); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[47], __remake.scene.flags[275], __remake.scene.snowdinForest.stick.image.texture.key]), [2, 1, 'spr_stick:1']);
  await place(535, 155); await key('z'); await read(1, /smashed/);
  await place(1275, 160); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => !!__remake.scene.snowdinForest.fake); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[47], __remake.scene.flags[275]]), [3, 2]);
  const fakeSpeed = await page.evaluate(() => {
    const s = __remake.scene.snowdinForest; s.oldX = __remake.scene.player.x; const x = s.fake.x;
    __remake.scene.player.x -= 3; s.step(); return s.fake.x - x;
  });
  assert.equal(fakeSpeed, 8);
  await page.evaluate(() => { const w = __remake.scene; w.player.x = 1700; for (let i = 0; i < 10; i++) w.snowdinForest.step(); });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.played), 3);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.tone.rate), 2.12);
  // Ba tuyến thật: lần đầu, ký ức lần trước và diệt chủng.
  for (const [flags, meetings, murder] of [[{}, 0, false], [{}, 1, false], [{ 202: 20, 45: 4 }, 0, true]]) {
    await open(flags, meetings);
    await place(2145, 160); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => __remake.scene.snowdinForest.stage === 'approach'); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.scene.flags[47]), -1);
    const position = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
    await key('c'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(150); await page.keyboard.up('ArrowUp');
    assert.equal(await page.evaluate(() => __remake.phase), 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), position);
    await advanceTo('talking'); await read(meetings ? 1 : 3, /Human/);
    assert.equal(await page.evaluate(() => Number(localStorage.getItem('undertale-remake-sans-meetings'))), meetings + 1);
    assert.equal(await page.evaluate(() => __remake.scene.player.facing), 'd');
    await advanceTo('hand'); assert.equal(await page.evaluate(() => __remake.scene.player.facing), 'l');
    await advanceTo('shake'); assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
    await advanceTo('whoopee'); assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.sans.texture.key), 'spr_sans_r_darkhand:2');
    await advanceTo('talking');
    assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_muscle');
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_comicsans');
    await read(murder ? 17 : 13, /whoopee/);
    await advanceTo('talking'); await read(1, /conveniently-shaped/);
    await advanceTo('talking');
    if (murder) {
      assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
      await read(2, /\.\.\./); await advanceTo('talking');
      await read(4, /FOUND A\nHUMAN/); await advanceTo('talking'); await read(1, /worked out/);
    } else {
      assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
      assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [2520, 185]);
      assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_papyrus');
      await read(7, /sup, bro/); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), 'fnt_papyrus');
      await read(5, /NO!!/); await read(6, /GREAT PAPYRUS/); await read(2, /hmm/); await read(5, /LAZYBONES/);
      await advanceTo('zoomHold'); assert.ok(await page.evaluate(() => __remake.scene.cameras.main.zoom >= 1.9));
      await advanceTo('talking'); assert.equal(await page.evaluate(() => __remake.scene.cameras.main.zoom), 1); await read(8, /SANS!!!/);
      await advanceTo('zoomHold'); await advanceTo('talking'); await read(6, /UGH!!!/);
      await advanceTo('talking'); await read(1, /HEH/); await advanceTo('talking'); await read(1, /come out/);
      await advanceTo('idle'); assert.equal(await page.evaluate(() => __remake.scene.player.x), 2488);
    }
    assert.equal(await page.evaluate(() => __remake.scene.plot), 36);
    assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
    assert.ok(await page.evaluate(() => __remake.scene.snowdinForest.lampCollider && __remake.scene.snowdinForest.sansCollider));
    assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.flowey.x), 80);
    await page.evaluate(() => {
      const w = __remake.scene, s = w.snowdinForest; w.player.setPosition(s.sans.x + 22, s.sans.y); w.player.facing = 'l'; w.interactionCooldown = 0;
    });
    await key('z'); await read(murder ? 1 : 2, murder ? /stare at me/ : /oughta get going/);
    if (!murder) {
      await page.evaluate(() => { __remake.scene.interactionCooldown = 0; }); await key('z'); await read(2, /holdup/);
      await page.evaluate(() => { __remake.scene.interactionCooldown = 0; }); await key('z'); await read(1, /well/);
    }
    await place(2655, 160); await page.keyboard.down('ArrowRight');
    await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
    await read(murder ? 4 : 6, murder ? /straight-/ : /favor/); await advanceTo('done');
    assert.equal(await page.evaluate(() => __remake.scene.plot), 37);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinMusic.key, __remake.scene.snowdinMusic.rate]), ['mus_snowy', murder ? .6 : .95]);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); w.plot = 0; await w.restoreGame(); });
    assert.equal(await page.evaluate(() => __remake.scene.plot), 37);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinForest.stick.image.active), false);
  }
  // Quay lại phòng 1 theo markerB.
  await place(2585, 125, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y + 19 >= 130), 'Trạm gác có va chạm chân theo mask gốc.');
  await place(2585, 113, 'u'); await key('z'); await read(2, /checkpoint/);
  await place(20, 160, 'l'); await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra1');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [390, 160]);
  console.log('✓ Rừng Snowdin: cửa/nhạc xuyên phòng, cây/cành gãy/bóng Sans, bắt tay/ký ức, Papyrus hai tuyến/zoom/đèn, thoại/va chạm/Flowey/bye/plot36–37 và lưu nạp');
}
