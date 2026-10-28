import assert from 'node:assert/strict';
export async function testMoldsmalGroup(page) {
  const start = async () => {
    await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water3'); __remake.startBattle('moldsmalGroup53'); });
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'MoldsmalGroupBattle');
  };
  const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(70); };
  const finishWave = async () => page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 121 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  await start(); assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map(e => [e.hp, e.mercy, e.x])), [[50, 99, 107], [50, 99, 209]]);
  await key('ArrowRight'); await key('z'); await key('z'); await key('ArrowDown'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /lie immobile/); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  assert.equal(await page.evaluate(() => __remake.scene.wave.generators.length), 2); await finishWave();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].mercy, __remake.scene.enemies[1].mercy, __remake.scene.previousScene.flags[132]]), [101, 99, 1]);
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward]), [1, 0]);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  await start(); await page.evaluate(() => { const s = __remake.scene; s.enemies[0].hp = 1; s.enemyHp = 1; s.menuIndex = 0; });
  await key('z'); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  assert.equal(await page.evaluate(() => __remake.scene.wave.generators.length), 1); await finishWave();
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward]), [3, 3]);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kills, __remake.scene.flags[204]]), [1, 1]);
  console.log('✓ Hai Moldsmal: chọn mục tiêu, ACT, đạn, tha/giết và thưởng');
}
