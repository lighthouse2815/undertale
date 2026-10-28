import assert from 'node:assert/strict';

export async function testWoshuaBattle(page) {
  const start = async () => {
    await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water3'); __remake.startBattle('woshua'); });
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WoshuaBattle');
  };
  const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(70); };
  await start();
  assert.deepEqual(await page.evaluate(() => { const s = __remake.scene; return [s.enemyHp, s.enemies[0].def, s.body.texture.key, s.message.text]; }), [70, 1, 'spr_woshbody:0', '* Woshua shuffles up.']);
  await key('ArrowRight'); await key('z'); await key('z'); await key('ArrowRight'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /ask Woshua to clean/);
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  assert.equal(await page.evaluate(() => __remake.scene.wave.kind), 'woshuaSpiral');
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.hp = 10; s.invFrames = 9999; s.wave.green = 0; s.wave.spawn(); const b = s.wave.bullets.at(-1); b.x = s.soul.x * 2 + 7; b.y = s.soul.y * 2 + 7; b.speed = 3; b.acceleration = 0; s.wave.step(); for (let i = 0; i < 151 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  const cleaned = await page.evaluate(() => [__remake.scene.hp, __remake.scene.actState.clean, __remake.scene.enemies[0].mercy]);
  assert.ok(cleaned[0] >= 11 && cleaned[0] <= 20); assert.deepEqual(cleaned.slice(1), [2, 200]);
  await page.evaluate(() => { const s = __remake.scene; s.menuIndex = 3; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward, __remake.scene.previousScene.flags[145]]), [25, 0, 1]);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  await start(); await page.evaluate(() => { const s = __remake.scene; s.enemies[0].hp = 1; s.enemyHp = 1; s.menuIndex = 0; }); await key('z'); await key('z');
  await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages' && /YOU WON/i.test(__remake.scene.message.text));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward]), [25, 52]);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kills, __remake.scene.flags[204]]), [1, 1]);
  await start(); await page.evaluate(() => __remake.scene.act('joke')); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); await page.evaluate(() => { __remake.scene.command = 70; });
  await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.wave.kind, __remake.scene.actState.monsterAttack]), ['woshuaSoap', 5]);
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 161 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  await page.evaluate(() => __remake.scene.flee()); await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Trận Woshua: Clean/giọt xanh/Spare, Joke/bong bóng/Flee, FIGHT và thưởng');
}
