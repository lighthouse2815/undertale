import assert from 'node:assert/strict';

export async function testTemmieBattle(page) {
  const start = async (items = []) => {
    await page.evaluate(async items => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = items; await w.openRoom('room_water3'); __remake.startBattle('temmie'); }, items);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'TemmieBattle');
  };
  const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(70); };
  const wave = async command => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech');
    await page.evaluate(command => { __remake.scene.command = command; }, command); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'soul');
    const kind = await page.evaluate(() => __remake.scene.wave.kind);
    await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 201 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
    await page.waitForFunction(() => __remake.scene.mode === 'menu'); return kind;
  };
  const finish = async () => { await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text)); await key('z'); await page.waitForFunction(() => __remake.phase === 'running'); };
  await start(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.enemies[0].mercy, __remake.scene.spareable()]), [5, -40, false]);
  await page.evaluate(() => __remake.scene.act('check')); assert.match(await page.evaluate(() => __remake.scene.message.text), /RATED TEM/); await key('z'); assert.equal(await wave(0), 'temmieHand');
  await page.evaluate(() => __remake.scene.act('talk')); await key('z'); assert.equal(await wave(50), 'temmieLong'); assert.deepEqual(await page.evaluate(() => [__remake.scene.previousScene.flags[146], __remake.scene.spareable()]), [1, true]);
  await page.evaluate(() => __remake.scene.end('spare')); await finish();
  await start([22]); await page.evaluate(() => __remake.scene.act('feed')); assert.equal(await page.evaluate(() => __remake.scene.kind), 'feedConfirm'); await key('z'); assert.deepEqual(await page.evaluate(() => [__remake.scene.previousScene.inventory.length, __remake.scene.enemies[0].mercy]), [0, 300]); assert.equal(await wave(50), 'temmieLong');
  await page.evaluate(() => __remake.scene.end('spare')); await page.waitForFunction(() => __remake.scene.mode === 'pages'); assert.equal(await page.evaluate(() => __remake.scene.goldReward), 30); await finish();
  await start([22]); await page.evaluate(() => __remake.scene.act('feed')); await key('ArrowDown'); await key('z'); assert.deepEqual(await page.evaluate(() => [__remake.scene.mode, __remake.scene.previousScene.inventory.length, __remake.scene.music.isPaused]), ['temmieWait', 1, true]); await page.waitForFunction(() => __remake.scene.mode === 'speech', null, { timeout: 9000 }); assert.equal(await wave(0), 'temmieHand'); await page.evaluate(() => __remake.scene.end('spare')); await finish();
  await start(); await page.evaluate(() => __remake.scene.act('flex')); for (let i = 0; i < 4; i++) await key('z'); await page.waitForFunction(() => __remake.scene.aaronPresent && __remake.scene.mode === 'speech');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].name, __remake.scene.actState.flex, __remake.scene.attackBonus, __remake.scene.temGold]), ['Aaron', 2, 7, 30]); await wave(50);
  await page.evaluate(() => __remake.scene.act('flex')); await key('z'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text)); assert.deepEqual(await page.evaluate(() => [__remake.scene.previousScene.flags[143], __remake.scene.goldReward]), [1, 60]); await finish();
  await start(); await page.evaluate(() => { const s = __remake.scene; s.menuIndex = 0; }); await key('z'); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text)); assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward]), [50, 40]); await finish();
  console.log('✓ Trận Temmie: ACT, hai đợt, cho ăn, Aaron, tha và giết');
}
