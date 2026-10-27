import assert from 'node:assert/strict';

export async function testLesserDogBattle(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = async () => {
    await page.evaluate(async () => {
      const w = __remake.game.scene.getScene('World'); w.flags = { 202: 20, 203: 2 }; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.gold = w.kills = 0;
      w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = [3, 1]; w.plot = 42;
      await w.openRoom('room_tundra3'); w.saveGame(true); __remake.startBattle('lesserDog');
    });
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music && !!__remake.scene.head);
  };
  const pages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const select = async (index) => { await page.waitForFunction(() => __remake.scene.mode === 'menu'); await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z'); };
  const act = async (index = 0) => {
    await select(1); await key('z');
    assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Check', 'Pet', 'Pet', 'Pet', 'Pet', 'Pet']);
    if (index >= 3) await key('ArrowRight');
    for (let i = 0; i < index % 3; i++) await key('ArrowDown'); await key('z');
  };
  const wave = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z');
    await page.waitForFunction(() => ['soul', 'menu'].includes(__remake.scene.mode));
  };
  const finishWave = () => page.evaluate(() => {
    const s = __remake.scene; s.invFrames = 1000;
    for (let i = 0; i < 120 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul(); s.invFrames = 0;
  });
  const flee = async () => { await select(3); await key('ArrowDown'); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running'); };
  await open(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.config.xp]), [60, 0, 18]);
  await select(1); await key('z'); await key('ArrowRight'); await key('ArrowDown'); await key('ArrowDown');
  assert.equal(await page.evaluate(() => __remake.scene.subIndex), 5); await key('ArrowDown'); assert.equal(await page.evaluate(() => __remake.scene.subIndex), 5);
  await key('ArrowLeft'); assert.equal(await page.evaluate(() => __remake.scene.subIndex), 2); await key('ArrowUp'); await key('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.scene.subIndex), 0); assert.equal(await page.evaluate(() => __remake.scene.petLabels.length), 6);
  await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /pomer-granite/); assert.equal(await page.evaluate(() => __remake.scene.petLabels.length), 0);
  await pages(); assert.equal(await page.evaluate(() => __remake.scene.command), 10); await wave();
  assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'dog'); assert.equal(await page.evaluate(() => __remake.scene.wave.duration), 110);
  const bark = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave; s.invFrames = 1000;
    for (let i = w.frames; i < 10; i++) w.step(); const first = w.dog.barked;
    for (let i = w.frames; i < 18; i++) w.step(); const second = w.dog.barked;
    s.soul.x = w.dog.x / 2 - 10; s.soul.y = w.dog.y / 2 - 10;
    for (let i = w.frames; i < 40; i++) w.step(); return [first, second, w.dog.gravity, w.dog.vx, w.dog.sprite];
  });
  assert.deepEqual(bark.slice(0, 2), [1, 2]); assert.ok(bark[2] > 0 && bark[3] < 0); assert.equal(bark[4], 'spr_tinypomjump');
  await finishWave(); await act(1); assert.match(await page.evaluate(() => __remake.scene.message.text), /barely lifted/); await pages();
  assert.equal(await page.evaluate(() => __remake.scene.command), 90); assert.equal(await page.evaluate(() => __remake.scene.config.def), -100);
  await wave(); assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'spears');
  const collision = await page.evaluate(async () => {
    const { LesserDogWave } = await import('/src/lesser-dog-waves.mjs'); const s = __remake.scene;
    const w = new LesserDogWave(s, 90, 0); w.blue.vx = 0; w.blue.whiteAt = 999;
    w.blue.x = s.soul.x * 2; w.blue.y = s.soul.y * 2; s.hp = 20; s.invFrames = 0;
    w.step(); const still = s.hp; s.soul.x += 1; w.step(); const moving = s.hp;
    s.invFrames = 0; w.blue.x = 0; w.blue.y = 0; const white = w.white(); white.vx = 0; white.gx = 0; white.x = s.soul.x * 2 - 4; white.y = s.soul.y * 2;
    w.step(); const whiteHit = s.hp; w.destroy(); s.hp = s.maxHp;
    return [still, moving, whiteHit];
  });
  assert.deepEqual(collision, [20, 16, 12]); await finishWave(); await select(3); await key('z'); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[27]]), [0, 0, 0, 1]);
  // Stick không tiêu hao, biến mercy<60 thành102 rồi103 lúc nói, giữ cổ đã dài.
  await open(); await select(2); await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /played fetch/); await pages();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.mercyModifier, __remake.scene.previousScene.inventory]), [103, [3, 1]]); await wave(); await finishWave();
  await select(3); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running'); assert.equal(await page.evaluate(() => __remake.scene.gold), 7);
  // Đi qua toàn bộ 55 lần Pet, không mô phỏng bằng gán một cờ đã hoàn thành.
  await open(); const petMessages = new Set();
  for (let i = 0; i < 55; i++) {
    await act(1 + i % 5); petMessages.add(await page.evaluate(() => __remake.scene.message.text));
    assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), (i + 1) * 50);
    await pages(); await wave(); if (await page.evaluate(() => __remake.scene.mode === 'soul')) await finishWave();
    if (i === 10) assert.equal(await page.evaluate(() => __remake.scene.secondHead.visible), true);
    if (i === 5) assert.equal(await page.evaluate(() => __remake.scene.wave.duration), 0);
  }
  assert.equal(petMessages.size, 20); assert.ok([...petMessages].some((s) => /Really/.test(s)));
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[141]), 1);
  assert.ok(await page.evaluate(() => __remake.scene.head.y < 0 && __remake.scene.secondHead.y > 240));
  await select(3); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.flags[55], __remake.scene.flags[27], __remake.scene.kills]), [60, 2, 1, 0]);
  // Giết/Flee có cờ tuyến riêng, dân số vẫn tăng ở Snowdin.
  await open(); await page.evaluate(() => { __remake.scene.enemyHp = 1; }); await select(0); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.flags[55], __remake.scene.flags[203], __remake.scene.flags[202], __remake.scene.flags[27] ?? 0]), [18, 15, 1, 3, 20, 0]);
  await open(); await flee(); assert.equal(await page.evaluate(() => __remake.scene.flags[27]), 1);
  await open(); await select(2); await key('ArrowDown'); await key('z'); await pages(); await wave(); await finishWave();
  assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), [3]); await flee();
  await open(); await act(0); await pages(); await wave();
  await page.evaluate(() => {
    const s = __remake.scene, dog = s.wave.dog; s.hp = 1; s.invFrames = 0;
    dog.x = s.soul.x * 2 - 20; dog.y = s.soul.y * 2 - 10; dog.vx = dog.vy = dog.gravity = 0;
    s.previousScene.inventory = []; s.previousScene.gold = 999;
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead'); await page.waitForFunction(() => __remake.scene.deathReady);
  const count = await page.evaluate(() => __remake.scene.deathLines.length); for (let i = 0; i < count; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[203], __remake.scene.flags[27] ?? 0]), [20, 0, [3, 1], 2, 0]);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  console.log('✓ Lesser Dog: ACT 2×3/55 Pet/cổ vòng/20 lời/cờ/thưởng, Stick, hai wave/chó sủa-nhảy/giáo xanh đứng yên an toàn/giáo trắng, FIGHT/Spare/Flee/dân số');
}
