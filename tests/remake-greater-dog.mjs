import assert from 'node:assert/strict';

export async function testGreaterDog(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const start = async (glove = false) => {
    await page.evaluate(async (glove) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); Object.assign(w, { flags: {}, plot: 63, gold: 100, xp: 0, lv: 1, kills: 0, hp: 20, maxHp: 20, inventory: [3, 16], armor: 4, armorDefense: 0, weapon: glove ? 14 : 3, weaponStrength: glove ? 5 : 0 }); await w.openRoom('room_tundra_iceentrance'); w.saveGame(true); __remake.startBattle('greaterDog'); }, glove);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_greaterDog' && !!__remake.scene.music);
  };
  const read = async (pattern, count) => { assert.match(await page.evaluate(() => __remake.scene.message.text), pattern); if (count) assert.equal(await page.evaluate(() => __remake.scene.pages.length), count); while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const act = async (i) => { await page.evaluate(() => { const s = __remake.scene; s.hp = 20; s.menuIndex = 1; }); await key('z'); await key('z'); for (let n = 0; n < i % 3; n++) await key('ArrowDown'); if (i >= 3) await key('ArrowRight'); assert.equal(await page.evaluate(() => __remake.scene.subIndex), i); await key('z'); };
  const turn = async () => { await page.waitForFunction(() => ['speech', 'soul'].includes(__remake.scene.mode)); if (await page.evaluate(() => __remake.scene.mode === 'speech')) await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); await page.evaluate(() => { const s = __remake.scene; s.hp = 20; s.invFrames = 99999; s.wave.frames = s.wave.duration - 1; }); await page.waitForFunction(() => __remake.scene.mode === 'menu'); };
  const spare = async () => { await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Spare']); await key('z'); await read(/YOU WON/); await page.waitForFunction(() => __remake.phase === 'running'); };
  await start(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.enemies[0].def, __remake.scene.enemies[0].mercy, __remake.scene.spareable(), __remake.scene.music.key, __remake.scene.music.rate]), [105, 4, -25, false, 'mus_dogsong', .95]);
  await act(0); await read(/GREATER DOG/); await turn(); await act(3); await read(/too far/, 1); await turn(); await act(4); await read(/not excited/, 1); await turn();
  await act(1); await read(/You call/, 2); await turn(); assert.equal(await page.evaluate(() => __remake.scene.close), true); await act(1); await read(/ears/, 1); await turn();
  await act(3); await read(/curls up/, 5); await turn(); assert.deepEqual(await page.evaluate(() => [__remake.scene.pet, __remake.scene.enemies[0].def]), [1, 4]);
  await act(3); await read(/power field/, 1); await turn(); assert.equal(await page.evaluate(() => __remake.scene.enemies[0].def), -20);
  await act(4); await read(/snowball/, 4); await turn(); assert.equal(await page.evaluate(() => __remake.scene.pet), 2); await act(4); await read(/too tired/, 1); await turn();
  await act(3); await read(/entire weight/, 3); assert.deepEqual(await page.evaluate(() => [__remake.scene.pet, __remake.scene.soulSpeed]), [3, 3]);
  await page.waitForFunction(() => __remake.scene.mode === 'soul'); const speed = await page.evaluate(() => { const s = __remake.scene; s.invFrames = 99999; s.soul.setPosition(150, 160); s.soulElapsed = 0; s.keys.right.isDown = true; s.updateSoul(1000 / 30); s.keys.right.isDown = false; return s.soul.x; }); assert.equal(speed, 151.5);
  await page.evaluate(() => { const s = __remake.scene; s.wave.frames = s.wave.duration - 1; }); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(3); await read(/decisively/, 2); await turn(); assert.deepEqual(await page.evaluate(() => [__remake.scene.pet, __remake.scene.soulSpeed, __remake.scene.enemies[0].mercy, __remake.scene.previousScene.flags[142], __remake.scene.spareable()]), [4, 4, 9999, 1, true]);
  await act(3); await read(/Tummy/, 1); await turn(); await spare(); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.plot, __remake.scene.flags[54] ?? 0, __remake.scene.flags[27], __remake.scene.flags[203] ?? 0]), [140, 0, 0, 60, 0, 1, 0]);
  await start();
  for (let i = 1; i <= 4; i++) { await act(2); await read(i === 4 ? /too boring/ : /inches closer/); if (i < 4) { await turn(); const scale = await page.evaluate(() => __remake.scene.body.scaleX); assert.equal(scale, 1 + i * .5); } }
  await page.waitForFunction(() => __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[54], __remake.scene.flags[27], __remake.scene.plot, __remake.scene.gold]), [3, 1, 60, 140]);
  await start(); await page.evaluate(() => { __remake.scene.menuIndex = 2; }); await key('z'); await key('z'); await read(/threw the stick/); await turn(); assert.equal(await page.evaluate(() => __remake.scene.enemies[0].mercy), 250); await spare(); assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[54], __remake.scene.gold, __remake.scene.inventory]), [2, 140, [3, 16]]);
  // ITEM hồi máu và FIGHT đủ105HP bằng găngtay; thưởng80XP60G nhưng không tăng dân số ngẫu nhiên.
  await start(true); await page.evaluate(() => { const s = __remake.scene; s.hp = 8; s.menuIndex = 2; }); await key('z'); await key('ArrowDown'); await key('z'); await read(/Snowman|Snow/); assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await turn(); let hits = 0;
  while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.enemies[0].alive)) {
    await page.evaluate(() => { __remake.scene.menuIndex = 0; }); await key('z'); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); for (let i = 0; i < 4; i++) await key('z'); hits++; await read(/\d/);
    if (await page.evaluate(() => __remake.phase === 'running')) break;
    if (await page.evaluate(() => __remake.scene.mode === 'speech' || __remake.scene.mode === 'soul')) await turn(); assert.ok(hits < 10);
  }
  await page.waitForFunction(() => __remake.phase === 'running'); assert.ok(hits > 1); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[54], __remake.scene.flags[203] ?? 0, __remake.scene.plot]), [160, 80, 1, 1, 0, 60]);
  await start(); await act(2); await read(/inches/); await turn(); await page.screenshot({ path: '.cache/greater-dog-battle.png' });
  await page.evaluate(() => { const s = __remake.scene; s.beginWave(); s.hp = 1; s.invFrames = 0; s.hurt(999); s.die(); s.time.timeScale = 30; }); await page.waitForFunction(() => __remake.scene.deathReady); while (await page.evaluate(() => __remake.phase === 'battle')) await key('z'); await page.waitForFunction(() => __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.kills]), [63, 100, 0]);
  console.log('✓ GreaterDog: ACT5ô/105HP/Beckon/Pet4giaiđoạn/Play/tốcđộ3-4/DEF/142, Ignore4/zoom/cờ54, Stick/ITEM/FIGHTgăngtay/80XP60G/pop0/plot60/GameOver');
}
