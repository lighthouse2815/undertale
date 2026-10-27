import assert from 'node:assert/strict';

export async function testDogPairBattle(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = async (glove = false) => {
    await page.evaluate(async (glove) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = {}; w.plot = 49; w.gold = 100; w.xp = w.kills = 0; w.lv = 1; w.hp = w.maxHp = 20; w.weapon = glove ? 14 : 3; w.weaponStrength = glove ? 5 : 0; w.armor = 4; w.armorDefense = 0; w.inventory = [3, 16]; await w.openRoom('room_tundra_spaghetti'); w.saveGame(true); __remake.startBattle('dogi'); }, glove);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_dogi' && __remake.scene.mode === 'menu');
    await page.evaluate(() => { __remake.scene.invFrames = 99999; });
  };
  const pages = async (n, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.pages.length), n); if (pattern) assert.match(await page.evaluate(() => __remake.scene.message.text), pattern); for (let i = 0; i < n; i++) await key('z'); };
  const next = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
    await page.evaluate(() => { const s = __remake.scene; s.wave.frames = s.wave.duration - 1; }); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  };
  const menu = async (n) => { await page.evaluate((n) => { __remake.scene.menuIndex = n; }, n); await key('z'); };
  const act = async (target, action, count, pattern) => {
    await menu(1); if (target) await key('ArrowDown'); await key('z');
    if (action >= 2) await key('ArrowRight'); if (action % 2) await key('ArrowDown');
    await key('z'); await pages(count, pattern); await next();
  };
  const stick = async () => { await menu(2); await key('z'); await pages(1, /stick/); await next(); };
  const win = async (gold, xp, kills) => {
    await page.waitForFunction(() => __remake.scene.mode === 'pages'); assert.match(await page.evaluate(() => __remake.scene.message.text), /YOU WON/); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.plot]), [100 + gold, xp, kills, 50]);
  };
  const fight = async (index, glove) => {
    await menu(0); if (index) await key('ArrowDown'); await key('z');
    await page.evaluate(() => { const s = __remake.scene; window.dogRandom = Math.random; Math.random = () => .5; s.attackX = 156; s.attackSpeed = 0; }); await key('z');
    if (glove) for (let i = 0; i < 4; i++) await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages'); assert.match(await page.evaluate(() => __remake.scene.message.text), /^\d+$/);
    await page.evaluate(() => { Math.random = dogRandom; }); await key('z');
  };
  await open(); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => [d.name, d.hp, d.def, d.mercy])), [['Dogamy', 108, 4, -999], ['Dogaressa', 108, 4, -999]]);
  await menu(1); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Dogamy', 'Dogaressa']); await key('x');
  await page.evaluate(() => { __remake.scene.hp = 1; }); await menu(2); await key('ArrowDown'); await key('z'); await pages(1, /Snowman Piece/); await next();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.previousScene.inventory, __remake.scene.previousScene.flags[56] ?? 0]), [20, [3], 0]);
  await act(0, 0, 1, /DOGAMY/); await act(1, 0, 1, /DOGARESSA/);
  await act(0, 1, 2, /sniff/); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => d.smell)), [0, 0]);
  await act(0, 2, 1, /suspicious/);
  await act(1, 3, 2, /roll/); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => d.smell)), [1, 1]);
  await act(1, 1, 2, /sniff/); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => d.smell)), [2, 2]);
  await act(0, 2, 1, /pet/); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => [d.smell, d.mercy])), [[3, -999], [2, -999]]);
  await act(1, 2, 1, /pet/); assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[140]), 1);
  await menu(1); assert.deepEqual(await page.evaluate(() => __remake.scene.labels.map((e) => e.font)), ['fnt_maintext:yellow', 'fnt_maintext:yellow']); await key('x');
  await page.screenshot({ path: '.cache/dog-pair-pet.png' }); await menu(3); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Spare']); await key('z'); await win(40, 0, 0);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[27], __remake.scene.flags[23], __remake.scene.flags[53] ?? 0, __remake.scene.flags[203] ?? 0]), [1, 2, 0, 0]);
  await open(); await stick(); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => [d.mercy, __remake.scene.spareable(d)])), [[102, false], [102, false]], 'Giữ công thức mercy<0 của gốc ở LV1/Stick/108HP.');
  await menu(3); await key('z'); await next();
  await page.evaluate(() => { const s = __remake.scene; s.finishBattle(); }); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  await open(true); await stick(); assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), [3, 16]); await menu(3); await key('z'); await win(40, 0, 0); assert.equal(await page.evaluate(() => __remake.scene.flags[53]), 2);
  // FIGHT bằng găng tay: đủ108HP, đúng mục tiêu; con sống có DEF/đạn riêng và vẫn khóa trong trận.
  for (const first of [0, 1]) {
    await open(true);
    for (const target of [first, 1 - first]) {
      const aliveIndex = await page.evaluate((target) => __remake.scene.live().findIndex((d) => d.index === target), target);
      let attacks = 0;
      while (await page.evaluate((target) => __remake.scene.dogs[target].alive, target)) {
        assert.ok(attacks++ < 10); await fight(aliveIndex, true);
        if (await page.evaluate(() => __remake.scene.mode === 'speech')) {
          if ((await page.evaluate(() => __remake.scene.live().length)) === 1) {
            assert.equal(await page.evaluate(() => __remake.scene.live()[0].def), first === 0 ? -8 : -30);
            assert.equal(await page.evaluate(() => __remake.phase), 'battle');
          }
          await next();
        }
      }
    }
    await win(50, 60, 2); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[53], __remake.scene.flags[27] ?? 0, __remake.scene.flags[203] ?? 0]), [1, 0, 0]);
  }
  // Tha một mục tiêu bị thương rồi đánh bại con còn lại: thưởng/cờ tính cho từng con.
  await open(); await fight(0, false); await next(); assert.deepEqual(await page.evaluate(() => __remake.scene.dogs.map((d) => d.hp)), [93, 108]);
  await stick(); await menu(1); assert.deepEqual(await page.evaluate(() => __remake.scene.labels.map((e) => e.font)), ['fnt_maintext:yellow', 'fnt_maintext']); await key('x');
  await menu(3); await key('z'); await next(); assert.equal(await page.evaluate(() => __remake.scene.live()[0].index), 1);
  await stick(); assert.equal(await page.evaluate(() => __remake.scene.live()[0].mercy), -1000);
  await act(0, 1, 1, /snout/); await act(0, 2, 1, /growl/);
  let attacks = 0; while (await page.evaluate(() => __remake.scene.dogs[1].alive)) { assert.ok(attacks++ < 10); await fight(0, false); if (await page.evaluate(() => __remake.scene.mode === 'speech')) await next(); }
  await win(28, 30, 1); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[53], __remake.scene.flags[27], __remake.scene.flags[23]]), [2, 1, 1]);
  await open(true);
  let deathHits = 0; while (await page.evaluate(() => __remake.scene.dogs[0].alive)) { assert.ok(deathHits++ < 10); await fight(0, true); if (await page.evaluate(() => __remake.scene.dogs[0].alive)) await next(); }
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene, p = s.wave.bullets[0]; s.hp = 1; s.invFrames = 0; p.x = s.soul.x * 2 - 65; p.y = s.soul.y * 2 - 5; s.wave.step(); s.time.timeScale = 30; });
  await page.waitForFunction(() => __remake.scene.mode === 'dead' && __remake.scene.deathReady);
  for (let i = 0; i < 8 && await page.evaluate(() => __remake.phase === 'battle'); i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[53] ?? 0]), [49, 100, 0, 0, 0]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.isPlaying), true);
  console.log('✓ Trận hai chó: 2HP108/2mục tiêu/ACT2×2/ngửi-lăn-pet/cờ140, Stick/công thức mercy/tha riêng/40G, FIGHTđủHP/hai thứ tự/DEF/đạn còn1con/60XP50G, kết quả trộn/cờ53-27/không đổi dân số/GameOver/snapshot/nhạc');
}
