import assert from 'node:assert/strict';

export async function testSnowdinGroup(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = async (three = false, chill = false, glove = false) => {
    await page.evaluate(async ({ three, chill, glove }) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = { 200: 203, 201: 0, ...(chill ? { 57: 2 } : {}) }; w.plot = 51; w.gold = 100; w.xp = w.kills = 0; w.lv = 1; w.hp = w.maxHp = 20; w.weapon = glove ? 14 : 3; w.weaponStrength = glove ? 5 : 0; w.armor = 4; w.armorDefense = 0; w.inventory = [16]; await w.openRoom('room_tundra_spaghetti'); w.saveGame(true); __remake.startBattle(three ? 'snowdinGroup36' : 'snowdinGroup35'); }, { three, chill, glove });
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.enemies?.length >= 2 && __remake.scene.mode === 'menu'); await page.evaluate(() => { __remake.scene.invFrames = 99999; });
  };
  const read = async (pattern) => { if (pattern) assert.match(await page.evaluate(() => __remake.scene.message.text), pattern); const count = await page.evaluate(() => __remake.scene.pages.length - __remake.scene.pageIndex); for (let i = 0; i < count; i++) await key('z'); };
  const menu = async (index) => { await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z'); };
  const turn = async (commands) => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech');
    if (commands) await page.evaluate((commands) => __remake.scene.enemies.forEach((e, i) => { e.command = commands[i] ?? 0; }), commands);
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul' || __remake.scene.mode === 'menu');
    if (await page.evaluate(() => __remake.scene.mode === 'soul')) { await page.evaluate(() => { const s = __remake.scene; s.wave.frames = Math.max(0, s.wave.duration - 1); }); await page.waitForFunction(() => __remake.scene.mode === 'menu'); }
  };
  const act = async (target, choice, pattern) => {
    await menu(1); for (let i = 0; i < target; i++) await key('ArrowDown'); await key('z');
    const rows = await page.evaluate(() => Math.ceil(__remake.scene.submenu.length / 2));
    if (choice >= rows) await key('ArrowRight'); for (let i = 0; i < choice % rows; i++) await key('ArrowDown');
    await key('z'); await read(pattern);
  };
  const flee = async () => { await menu(3); await key('ArrowDown'); await key('z'); assert.ok(await page.evaluate(() => __remake.scene.dialogue.escaped.includes(__remake.scene.message.text))); await read(); await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const win = async (gold, xp, kills) => { await read(/YOU WON/); await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203] ?? 0, __remake.scene.plot]), [100 + gold, xp, kills, kills, 51]); };
  const fight = async (target) => {
    await menu(0); for (let i = 0; i < target; i++) await key('ArrowDown'); await key('z');
    await page.evaluate(() => { const s = __remake.scene; window.groupRandom = Math.random; Math.random = () => .5; s.attackX = 156; s.attackSpeed = 0; }); await key('z');
    if (await page.evaluate(() => __remake.scene.previousScene.weapon === 14)) for (let i = 0; i < 4; i++) await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages'); const damage = await page.evaluate(() => __remake.scene.damage); await page.evaluate(() => { Math.random = groupRandom; }); await read(); return damage;
  };
  await open(); assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map((e) => [e.name, e.hp, e.def, e.mercy])), [['Ice Cap', 48, 0, 10], ['Jerry', 80, 8, 65]]);
  await act(1, 0, /JERRY/); await turn([0, 0]);
  await menu(2); await key('z'); await read(/Snowman Piece/); await turn(); assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), []);
  await act(1, 1, /ditch Jerry/); assert.equal(await page.evaluate(() => __remake.scene.enemies[1].away), true); await turn();
  await menu(1); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Ice Cap']); await key('x');
  await act(0, 1, /tear/); await turn(); assert.equal(await page.evaluate(() => __remake.scene.enemies[1].away), true);
  await act(0, 1, /continue/); assert.equal(await page.evaluate(() => __remake.scene.enemies[1].away), false); await turn();
  await act(0, 3, /steal/); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].type, __remake.scene.enemies[0].hp]), ['ice', 48]); await turn();
  await menu(3); await key('z'); await turn(); assert.deepEqual(await page.evaluate(() => __remake.scene.live().map((e) => e.name)), ['Jerry']);
  const t = await page.evaluate(() => __remake.scene.turn); await act(0, 0, /JERRY/); await turn(); assert.equal(await page.evaluate(() => __remake.scene.turn), t + 1);
  await act(0, 1, /ditch/); await win(35, 0, 0); // Không thưởng thêm55G hay cờ tha khi chỉ bỏ Jerry.
  for (const chill of [false, true]) {
    await open(true, chill); assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map((e) => e.name)), ['Ice Cap', 'Jerry', chill ? 'Chilldrake' : 'Snowdrake']);
    await act(2, 3, chill ? /make fun/ : /bad ice pun/);
    assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map((e) => [e.mercy, e.heard])), [[200, 20], [200, 20], [-25, 19]]);
    assert.equal(await page.evaluate(() => __remake.scene.speechTexts.length), 3);
    await page.screenshot({ path: `.cache/group-joke-${chill}.png` }); await turn([50, 0, 99]);
    await menu(1); assert.deepEqual(await page.evaluate(() => __remake.scene.labels.map((e) => e.font)), ['fnt_maintext:yellow', 'fnt_maintext:yellow', 'fnt_maintext']); await key('x');
    await menu(3); await key('z'); await turn(); assert.deepEqual(await page.evaluate(() => __remake.scene.live().map((e) => e.type)), [chill ? 'chilldrake' : 'snowdrake']);
    assert.equal(await page.evaluate(() => __remake.scene.live()[0].mercy), 0);
    await act(0, 0, chill ? /CHILLDRAKE/ : /SNOWDRAKE/); await turn(); await act(0, 2, /agree|laugh/i); await turn(); await menu(3); await key('z'); await win(chill ? 23 : 25, 0, 0);
  }
  // Jerry giảm sát thương ceil(/5), HP riêng; giết/tha/trốn giữ phần thưởng đã kiếm.
  await open(false, false, true); const damage = await fight(1); assert.equal(damage, 4); assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map((e) => e.hp)), [48, 76]); await turn();
  await flee(); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.kills]), [100, 0]);
  await open(false, false, true); let attacks = 0;
  while (await page.evaluate(() => __remake.scene.enemies[0].alive)) { assert.ok(attacks++ < 5); await fight(0); if (await page.evaluate(() => __remake.scene.mode === 'speech')) await turn(); }
  assert.deepEqual(await page.evaluate(() => __remake.scene.live().map((e) => e.type)), ['jerry']);
  await flee(); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203]]), [117, 17, 1, 1]);
  await open(false, false, true); await page.evaluate(() => { __remake.scene.previousScene.lv = 20; });
  attacks = 0; while (await page.evaluate(() => __remake.scene.enemies[1].alive)) { assert.ok(attacks++ < 5); await fight(1); if (await page.evaluate(() => __remake.scene.mode === 'speech')) await turn(); }
  assert.deepEqual(await page.evaluate(() => __remake.scene.live().map((e) => e.type)), ['icecap']);
  await act(0, 1, /tear/); await turn(); await act(0, 1, /continue/); await turn(); await menu(3); await key('z'); await win(68, 1, 1);
  await open(true, false, true); await page.evaluate(() => { __remake.scene.previousScene.lv = 20; }); await fight(2); await turn(); await flee();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[57], __remake.scene.kills, __remake.scene.xp, __remake.scene.flags[203]]), [2, 1, 22, 1]);
  await open(true); await act(2, 0, /SNOWDRAKE/); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.hp = 1; s.invFrames = 0; s.hurt(999); s.time.timeScale = 30; });
  await page.waitForFunction(() => __remake.scene.mode === 'dead' && __remake.scene.deathReady);
  for (let i = 0; i < 8 && await page.evaluate(() => __remake.phase === 'battle'); i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[203] ?? 0, __remake.scene.snowdinMusic.isPlaying]), [51, 100, 0, 0, true]);
  console.log('✓ Nhóm35/36: 2-3HP/mục tiêu/ACT, Jerry80/DEF8/ceilDamage5/Ditch2lượt/trở lại/ởmộtmình/khôngthưởnggiả, Joke liênquái/200/-25, Icecap→Ice, tha/giết/trốn/thưởng/dânsố/chill/GameOver/nhạc');
}
