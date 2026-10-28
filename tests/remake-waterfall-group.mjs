import assert from 'node:assert/strict';
export async function testWaterfallGroup(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water3'); __remake.startBattle('waterfallGroup54'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WaterfallGroupBattle');
  const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(70); };
  const finishWave = async () => page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 181 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map(e => [e.name, e.hp, e.mercy])), [['Woshua', 70, 5], ['Aaron', 98, 5]]);
  await page.evaluate(() => __remake.scene.act(__remake.scene.enemies[0], 'joke')); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].state.monsterAttack, __remake.scene.enemies[1].mercy, __remake.scene.enemies[1].state.heard]), [5, 450, 12]);
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 40; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.length > 1)); await finishWave();
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map(e => e.alive)), [true, false]);
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); await finishWave();
  await page.evaluate(() => { const s = __remake.scene; s.enemies[0].hp = 1; s.enemyHp = 1; s.menuIndex = 0; }); await key('z'); await key('z');
  await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward]), [55, 52]);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kills, __remake.scene.flags[204]]), [1, 1]);
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.kills = w.gold = w.xp = 0; w.lv = 1; await w.openRoom('room_water3'); __remake.startBattle('waterfallGroup54'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WaterfallGroupBattle');
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => __remake.scene.act(__remake.scene.enemies[1], 'flex')); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); await finishWave();
  }
  assert.deepEqual(await page.evaluate(() => [__remake.scene.attackBonus, __remake.scene.enemies[1].state.monsterAttack]), [30, 9]);
  await page.evaluate(() => __remake.scene.act(__remake.scene.enemies[1], 'flex')); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[1].alive, __remake.scene.previousScene.flags[143], __remake.scene.goldReward]), [false, 1, 30]);
  await page.evaluate(() => __remake.scene.flee()); await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Woshua/Aaron: Joke/Flex, đạn đồng thời, tha từng quái, Flee và thưởng');
}
