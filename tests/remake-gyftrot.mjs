import assert from 'node:assert/strict';

export async function testGyftrot(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const start = async (gold = 100, flags = {}, glove = false) => {
    await page.evaluate(async ({ gold, flags, glove }) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); Object.assign(w, { flags, plot: 63, gold, xp: 0, lv: 1, kills: 0, hp: 20, maxHp: 20, inventory: [16], armor: 4, armorDefense: 0, weapon: glove ? 14 : 3, weaponStrength: glove ? 5 : 0 }); await w.openRoom('room_tundra_iceentrance'); w.saveGame(true); __remake.startBattle('gyftrot'); }, { gold, flags, glove });
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_gyftrot' && !!__remake.scene.music);
    assert.equal(await page.evaluate(() => __remake.scene.ended), false);
    assert.ok(await page.evaluate(() => __remake.scene.mouthFrame >= 0));
  };
  const read = async (pattern) => { assert.match(await page.evaluate(() => __remake.scene.message.text), pattern); while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const act = async (i) => {
    await page.evaluate(() => { __remake.scene.hp = 20; __remake.scene.menuIndex = 1; }); await key('z'); await key('z');
    for (const code of [i >= 2 ? 'ArrowRight' : null, i % 2 ? 'ArrowDown' : null].filter(Boolean)) await key(code);
    assert.equal(await page.evaluate(() => __remake.scene.subIndex), i); await key('z');
  };
  const turn = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); const speech = await page.evaluate(() => __remake.scene.speechText.text); await key('z');
    await page.waitForFunction(() => ['soul', 'menu'].includes(__remake.scene.mode));
    if (await page.evaluate(() => __remake.scene.mode === 'soul')) { await page.evaluate(() => { const s = __remake.scene; s.hp = 20; s.invFrames = 99999; s.wave.frames = s.wave.duration - 1; }); }
    await page.waitForFunction(() => __remake.scene.mode === 'menu'); return speech;
  };
  const spare = async () => { await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('z'); await read(/YOU WON/); await page.waitForFunction(() => __remake.phase === 'running'); };
  const flee = async () => { await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z'); await read(/Escaped|outta here|better to do|slow me down/); await page.waitForFunction(() => __remake.phase === 'running'); };
  await start(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.enemies[0].def, __remake.scene.enemies[0].mercy, __remake.scene.spareable(), __remake.scene.giftTypes.length]), [114, 3, -5, false, 3]);
  await act(0); await read(/GYFTROT/); await turn();
  // Gift bị từ chối khi chưa tháo đồ, không trừGOLD.
  await act(3); await read(/reap|refus|refus|Gift|Gyftrot/i); assert.equal(await page.evaluate(() => __remake.scene.previousScene.gold), 100); assert.match(await turn(), /How do/);
  for (let i = 0; i < 3; i++) { await act(1); await read(/You remove/); await turn(); assert.equal(await page.evaluate(() => __remake.scene.itemgone), i + 1); }
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].mercy, __remake.scene.enemies[0].def, __remake.scene.spareable(), __remake.scene.previousScene.flags[138]]), [200, -100, true, 1]);
  await act(1); await read(/try to undecorate/i); assert.match(await turn(), /Er/); await spare(); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203] ?? 0]), [120, 0, 0, 0]);
  // Trang trí/đôi mắt lại, tháo chúng trước đồ gốc và cờ74/ung/betray.
  await start(); await act(2); await read(/googly/i); assert.match(await turn(), /GOSHDARN/); assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[74]), 1);
  await act(2); await read(/perfection/i); await turn(); await act(1); await read(/googly/i); await turn(); assert.deepEqual(await page.evaluate(() => [__remake.scene.googly, __remake.scene.itemgone, __remake.scene.enemies[0].mercy]), [false, 0, -20]); await flee();
  // Gift sau khi tháo một đồ:>=35/trả hết/khôngG nhận75G; không tặng lại hai lần.
  for (const [gold, remaining, given, reward] of [[100, 65, 1, 0], [10, 0, 1, 0], [0, 0, 2, 75]]) {
    await start(gold); await act(1); await read(/You remove/); await turn(); await act(3); await read(gold ? /G|money/ : /Gyftrot|gift/i); assert.equal(await page.evaluate(() => __remake.scene.previousScene.gold), remaining); await turn();
    assert.deepEqual(await page.evaluate(() => [__remake.scene.giftgiven, __remake.scene.enemies[0].mercy, __remake.scene.enemies[0].def]), [given, 140, -100]);
    await act(3); await read(/Hey now/); await turn(); await spare(); assert.equal(await page.evaluate(() => __remake.scene.gold), remaining + reward);
  }
  await start(); await act(1); await read(/You remove/); await turn(); await act(2); await read(/googly/); await turn(); assert.equal(await page.evaluate(() => __remake.scene.betray), true); await act(1); await read(/googly/); await turn(); await act(3); await read(/refus|reap|Gyftrot/i); await turn(); assert.equal(await page.evaluate(() => __remake.scene.giftgiven), 0); await flee();
  // ITEM/FIGHT đủHP và găng tay thật, thưởng35XP30G/kill/dân số; không ép HP còn1.
  await start(100, {}, true); await page.evaluate(() => { const s = __remake.scene; s.hp = 8; s.menuIndex = 2; }); await key('z'); await key('z'); await read(/Snowman|Snow|piece/); assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await turn();
  let hits = 0;
  while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.enemies[0].alive)) {
    await page.evaluate(() => { const s = __remake.scene; s.menuIndex = 0; }); await key('z'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
    await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z');
    for (let i = 0; i < 4; i++) await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages'); hits++; await read(/\d/);
    if (await page.evaluate(() => __remake.scene.mode === 'pages')) await read(/YOU WON/);
    if (await page.evaluate(() => __remake.phase === 'running')) break;
    if (await page.evaluate(() => __remake.scene.mode === 'speech')) await turn();
    assert.ok(hits < 12);
  }
  await page.waitForFunction(() => __remake.phase === 'running'); assert.ok(hits > 1); assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[203], __remake.scene.flags[12]]), [35, 130, 1, 1, 1]);
  for (const [gold, expected] of [[0, 155], [100, 95]]) {
    await start(gold, {}, true); await act(1); await read(/You remove/); await turn(); await act(3); await read(gold ? /35 G/ : /Friendship/); await turn();
    await page.evaluate(() => { __remake.scene.menuIndex = 0; }); await key('z'); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); for (let i = 0; i < 4; i++) await key('z'); await read(/\d/); await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203]]), [expected, 35, 1, 1]);
  }
  await start(); await page.screenshot({ path: '.cache/gyftrot-battle.png' }); await page.evaluate(() => { const s = __remake.scene; s.beginWave(); s.hp = 1; s.invFrames = 0; s.hurt(999); s.die(); }); await page.waitForFunction(() => __remake.scene.deathReady);
  while (await page.evaluate(() => __remake.phase === 'battle')) await key('z'); await page.waitForFunction(() => __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.kills]), [63, 100, 0]);
  console.log('✓ Gyftrot: ACT2×2/đồ riêng/ba lần tháo/đôi mắt/betray/74-138/Gift35-hếtG-nhận75/DEF/mercy, ITEM/FIGHTđủ114HP/găngtay/thưởng35XP30G/dân số/Flee/GameOver');
}
