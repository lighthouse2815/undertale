import assert from 'node:assert/strict';

export async function testDrakeBattle(page) {
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const open = async (monster = 'snowdrake', flags = {}) => {
    await page.evaluate(async ({ monster, flags }) => {
      const w = __remake.game.scene.getScene('World');
      w.flags = flags; w.hp = w.maxHp = 20; w.lv = 1; w.xp = 0; w.gold = 0; w.kills = 0;
      w.inventory = [1]; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.plot = 37;
      await w.openRoom('room_tundra3'); w.saveGame(true); __remake.startBattle(monster);
    }, { monster, flags });
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  };
  const pages = async () => {
    while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z');
  };
  const select = async (index) => {
    await page.waitForFunction(() => __remake.scene.mode === 'menu');
    await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z');
  };
  const act = async (index) => {
    await select(1); await key('z');
    for (let i = 0; i < index; i++) await key('ArrowDown'); await key('z');
  };
  const wave = async (command) => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech');
    await page.evaluate((command) => { __remake.scene.command = command; }, command);
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  };
  const finishWave = () => page.evaluate(() => {
    const s = __remake.scene; s.invFrames = 1000;
    for (let i = 0; i < 150 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul();
    s.invFrames = 0;
  });
  const flee = async () => { await select(3); await key('ArrowDown'); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running'); };
  for (const monster of ['snowdrake', 'chilldrake']) {
    await open(monster, monster === 'chilldrake' ? { 57: 2 } : {});
    assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.config.xp, __remake.scene.enemyParts.length]), [74, 2, 22, monster === 'chilldrake' ? 4 : 3]);
    assert.match(await page.evaluate(() => __remake.scene.message.text), monster === 'chilldrake' ? /saunters/ : /flutters/);
    assert.equal(await page.evaluate(() => __remake.scene.fieldMusic.isPaused), true);
    await act(2); assert.match(await page.evaluate(() => __remake.scene.message.text), /before/);
    assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), -4); await pages();
    assert.match(await page.evaluate(() => __remake.scene.speechText.text), monster === 'chilldrake' ? /cause/ : /laughin/);
    assert.equal(await page.evaluate(() => __remake.scene.jokeTold), false);
    await wave(20); assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'straightClaws');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.arena.x, __remake.scene.arena.y, __remake.scene.arena.width, __remake.scene.arena.height, __remake.scene.wave.duration, __remake.scene.wave.rate]), [113.5, 100, 90, 92.5, monster === 'chilldrake' ? 130 : 120, monster === 'chilldrake' ? 17 : 16]);
    await finishWave();
    await act(0); assert.match(await page.evaluate(() => __remake.scene.message.text), /ATK 12 DEF 7/); await pages();
    assert.equal(await page.evaluate(() => __remake.scene.jokeTold), true);
    assert.equal(await page.evaluate(() => __remake.scene.speechText.font), 'fnt_plain:black');
    await wave(90); assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'rotatingClaws');
    await key('z'); await key('x'); assert.equal(await page.evaluate(() => __remake.scene.mode), 'soul');
    // Hai đợt đạn, alarm sinh bản sao và va chạm theo origin/xoay/khung.
    const results = await page.evaluate(async (chill) => {
      const { DrakeWave } = await import('/src/drake-waves.mjs'); const s = __remake.scene, result = [];
      for (const command of [0, 100]) {
        const wave = new DrakeWave(s, command, chill); wave.next = 999; s.invFrames = 1000;
        const parent = wave.claw(250, 186, { direction: 270, speed: 2.5, rotation: command ? 1.5 : 0, parent: true, limit: command ? 4 : 2 });
        wave.step(); const waitingY = parent.y; wave.step(); const movedY = parent.y;
        for (let i = 0; i < (command ? 8 : 28); i++) wave.step();
        const copied = wave.bullets.some((b) => !b.parent), rotated = parent.angle, sped = parent.speed;
        for (const bullet of wave.bullets) bullet.image.destroy();
        wave.bullets = []; s.hp = 20; s.invFrames = 0;
        const data = s.cache.json.get(command ? 'spr_rotclawbullet' : 'spr_clawbullet');
        const hit = wave.claw(s.soul.x * 2 + data.OriginX, s.soul.y * 2 + data.OriginY, { direction: 0, speed: 0 });
        hit.angle = 0; const touching = wave.touchesHeart(hit);
        wave.step(); const hp = s.hp;
        const again = wave.claw(s.soul.x * 2 + data.OriginX, s.soul.y * 2 + data.OriginY, { direction: 0, speed: 0 });
        wave.step(); const invulnerableHp = s.hp;
        again.x = 0; again.y = 0; const empty = wave.touchesHeart(again);
        result.push({ waitingY, movedY, copied, rotated, sped, touching, hp, invulnerableHp, empty }); wave.destroy();
      }
      s.hp = s.maxHp; s.refreshHp(); return result;
    }, monster === 'chilldrake');
    for (const [index, result] of results.entries()) {
      assert.equal(result.waitingY, 186); assert.ok(result.movedY > 186); assert.equal(result.copied, true);
      assert.equal(result.touching, true); assert.equal(result.hp, 16); assert.equal(result.invulnerableHp, 16); assert.equal(result.empty, false);
      if (index) { assert.ok(result.rotated > 270); assert.ok(result.sped > 2.5); }
    }
    await finishWave();
    await act(2); assert.match(await page.evaluate(() => __remake.scene.message.text), monster === 'chilldrake' ? /uncomfortable/ : /pun/);
    assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), 80); await pages();
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[57]), monster === 'chilldrake' ? 2 : 1);
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[136] ?? 0), monster === 'chilldrake' ? 0 : 1);
    await wave(10); await finishWave(); await select(3);
    assert.equal(await page.evaluate(() => __remake.scene.menu.font), 'fnt_maintext:yellow');
    await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203] ?? 0]), [monster === 'chilldrake' ? 10 : 12, 0, 0, 0]);
    // Joke/Clash(Heckle) không làm như Laugh; riêng Snowdrake có nhánh 1/6 tự rời.
    await open(monster, monster === 'chilldrake' ? { 57: 2 } : {});
    await act(3); assert.match(await page.evaluate(() => __remake.scene.message.text), monster === 'chilldrake' ? /make fun/ : /bad ice pun/); await pages();
    await wave(10); await finishWave();
    await select(1); await key('z'); await key('ArrowDown');
    await page.evaluate(() => { window.drakeRandom = Math.random; Math.random = () => .99; }); await key('z');
    await page.evaluate(() => { Math.random = window.drakeRandom; });
    if (monster === 'snowdrake') {
      assert.equal(await page.evaluate(() => __remake.scene.pages.length), 2); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
      assert.equal(await page.evaluate(() => __remake.scene.gold), 12);
    } else {
      assert.equal(await page.evaluate(() => __remake.scene.pages.length), 1); assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), -10);
      await pages(); assert.equal(await page.evaluate(() => __remake.scene.jokeTold), false); await wave(90); await finishWave(); await flee();
    }
    // FIGHT và thưởng giữ cờ Ruins, cộng dân số Snowdin, Snowdrake chết mở Chilldrake.
    await open(monster, { 202: 20, 203: 3, 57: monster === 'chilldrake' ? 2 : 0 });
    await page.evaluate(() => { __remake.scene.enemyHp = 1; }); await select(0); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'fight');
    await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages();
    await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[202], __remake.scene.flags[203], __remake.scene.flags[57]]), [22, 18, 1, 20, 4, 2]);
  }
  for (const [roll, expression] of [[.1, /boo the Snowdrake/], [.6, /aren't funny/]]) {
    await open();
    await page.evaluate((roll) => {
      const s = __remake.scene, random = Math.random; s.kind = 'act'; s.subIndex = 1; s.confirmPressed = true;
      try { Math.random = () => roll; s.updateSubmenu(); } finally { Math.random = random; s.confirmPressed = false; }
    }, roll);
    assert.match(await page.evaluate(() => __remake.scene.message.text), expression);
    await pages(); assert.equal(await page.evaluate(() => __remake.scene.jokeTold), false); await wave(10); await finishWave(); await flee();
  }
  // ITEM/Flee không làm mất cờ, quái bị thương có thưởng tỉ lệ HP khi tha.
  await open(); await select(2); await key('z'); await pages(); await wave(10); await finishWave();
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.inventory.length), 0); await flee();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[24]]), [0, 0, 0, 1]);
  await open(); await page.evaluate(() => { __remake.scene.enemyHp = 5; }); await select(3); await key('z'); await pages();
  await page.waitForFunction(() => __remake.phase === 'running'); assert.equal(await page.evaluate(() => __remake.scene.gold), 16);
  // HP 0 do đạn thật: Game Over và nạp snapshot Snowdin, giữ túi/cờ/tài sản trước trận.
  await open('chilldrake', { 57: 2, 203: 3 }); await act(0); await pages(); await wave(10);
  await page.evaluate(() => {
    const s = __remake.scene; s.hp = 1; s.invFrames = 0; s.previousScene.inventory = []; s.previousScene.gold = 999;
    for (const bullet of s.wave.bullets) bullet.image.destroy(); s.wave.bullets = []; s.wave.next = 999;
    s.wave.claw(s.soul.x * 2, s.soul.y * 2, { speed: 0, direction: 0 });
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead');
  await page.waitForFunction(() => __remake.scene.deathReady);
  const deathPages = await page.evaluate(() => __remake.scene.deathLines.length);
  for (let i = 0; i < deathPages; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[203], __remake.scene.flags[57], __remake.room]), [20, 0, [1], 3, 2, 'room_tundra3']);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  console.log('✓ Snowdrake/Chilldrake: ACT trước/sau lời nói, Heckle/Clash/Joke/nhánh tự rời, hai generator/alarm/va chạm/HP/bất tử, ITEM/FIGHT/Spare/Flee và EXP/GOLD/dân số Snowdin');
}
