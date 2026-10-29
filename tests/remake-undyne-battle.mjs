import assert from 'node:assert/strict';

export async function testUndyneBattle(page) {
  const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(100); };
  await page.evaluate(async () => {
    const w = __remake.scene; window.undyneTestSnapshot = structuredClone({ flags: w.flags, hp: w.hp, maxHp: w.maxHp, weapon: w.weapon, weaponStrength: w.weaponStrength, inventory: w.inventory, plot: w.plot, kills: w.kills, xp: w.xp, lv: w.lv });
    w.flags = {}; w.hp = w.maxHp = 100; w.weapon = 3; w.weaponStrength = 0; w.inventory = [1];
    await w.openRoom('room_water1'); __remake.startBattle('undyne');
  });
  await page.waitForFunction(() => __remake.phase === 'battle' || __remake.phase === 'error');
  assert.equal(await page.evaluate(() => __remake.phase), 'battle');
  assert.deepEqual(await page.evaluate(() => { const s = __remake.scene; return [s.scene.key, s.green, s.enemyHp, s.rules.order, s.body.parts.length]; }), ['UndyneBattle', true, 1500, 1, 7]);
  for (const key of ['ArrowRight','z','z','ArrowDown','z']) await press(key);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.mode, __remake.scene.rules.rating]), ['pages', 12]);
  await press('z');
  for (let i = 0; i < 3; i++) await press('z');
  await page.waitForFunction(() => __remake.scene.mode === 'soul');
  const turn = await page.evaluate(() => {
    const s = __remake.scene; for (let i = 0; i < 250 && s.mode === 'soul'; i++) s.wave.step();
    return [s.mode, s.green, s.rules.order, s.rules.lesson];
  });
  assert.deepEqual(turn, ['menu', true, 2, 2]);
  await page.evaluate(() => { const s = __remake.scene; s.hp = 75; s.menuIndex = 2; });
  await press('z'); await press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.mode, __remake.scene.hp, __remake.scene.previousScene.inventory.length]), ['pages', 85, 0]);
  await page.evaluate(() => { const s = __remake.scene; s.afterPages(); s.afterPages(); for (let i = 0; i < 250 && s.mode === 'soul'; i++) s.wave.step(); });
  const fight = await page.evaluate(() => {
    const s = __remake.scene; const hp = s.enemyHp; s.startFight(); s.attackX = 156; s.confirmPressed = true; s.updateFight(0); s.confirmPressed = false;
    const damaged = s.enemyHp < hp && s.previousScene.flags[351] === s.enemyHp; s.afterPages(); s.afterPages();
    for (let i = 0; i < 250 && s.mode === 'soul'; i++) s.wave.step(); return [damaged, s.mode];
  });
  assert.deepEqual(fight, [true, 'menu']);
  const changes = await page.evaluate(() => {
    const s = __remake.scene; s.rules.order = s.rules.lesson = 6; s.command = 0; s.beginWave();
    for (let i = 0; i < 300 && s.mode === 'soul'; i++) s.wave.step();
    const red = [s.mode, s.green, s.rules.order, s.rules.lesson];
    s.rules.order = 8; s.command = 0; s.beginWave();
    for (let i = 0; i < 250 && s.mode === 'soul'; i++) s.wave.step();
    return [red, [s.mode, s.green, s.rules.order, s.rules.lesson]];
  });
  assert.deepEqual(changes, [['menu', false, 7, 7], ['menu', true, 9, 8]]);
  const fatal = await page.evaluate(() => {
    const s = __remake.scene; s.enemies[0].hp = s.enemyHp = 1; s.startFight(); s.attackX = 156; s.confirmPressed = true; s.updateFight(0); s.confirmPressed = false;
    s.afterPages(); s.time.timeScale = 100; return [s.rules.died, s.rules.order, s.green, s.mode];
  });
  assert.deepEqual(fatal, [true, -40, false, 'pages']);
  await page.evaluate(() => __remake.scene.afterPages());
  await page.waitForFunction(() => __remake.scene.mode === 'pages', { timeout: 5000 });
  await page.evaluate(() => __remake.scene.afterPages());
  await page.waitForFunction(() => __remake.scene.mode === 'pages', { timeout: 5000 });
  await page.evaluate(() => __remake.scene.afterPages());
  await page.waitForFunction(() => __remake.scene.mode === 'pages', { timeout: 5000 });
  await page.evaluate(() => __remake.scene.afterPages());
  await page.waitForFunction(() => __remake.scene.mode === 'menu', { timeout: 5000 });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.rules.order, __remake.scene.green, __remake.scene.melter.texture.key]), [-40, false, 'spr_undyneb_melt:1']);
  const before = await page.evaluate(() => { const s = __remake.scene; s.rules.order = -35; s.dummyTurn(); s.afterPages(); return [s.previousScene.kills, s.previousScene.xp]; });
  for (let i = 0; i < 4; i++) {
    await page.waitForFunction(() => __remake.scene.mode === 'pages', { timeout: 5000 });
    await page.evaluate(() => __remake.scene.afterPages());
    if (i < 3) await page.waitForFunction(() => __remake.scene.mode === 'pages', { timeout: 5000 });
  }
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive(), { timeout: 5000 });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kills, __remake.scene.xp, __remake.scene.flags[350], __remake.scene.plot]), [before[0] + 1, before[1] + 500, 1, 122]);
  await page.evaluate(() => { const w = __remake.scene; w.flags[99] = 3; w.flags[351] = 850; __remake.startBattle('undyne'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.green, __remake.scene.enemyHp, __remake.scene.rules.order]), [false, 850, 22]);
  await page.evaluate(() => { const s = __remake.scene; s.menuIndex = 3; });
  await press('z'); await press('ArrowDown'); await press('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.scene.flags[11]), 1);
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.evaluate(() => { const w = __remake.scene; w.flags[99] = 0; w.hp = 20; __remake.startBattle('undyne'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  const death = await page.evaluate(() => { const s = __remake.scene; s.command = 0; s.beginWave(); s.hp = 0; s.wave.step(); return [s.mode, s.body === null]; });
  assert.deepEqual(death, ['dead', true]);
  await page.evaluate(() => __remake.scene.finishBattle());
  await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => { Object.assign(__remake.scene, window.undyneTestSnapshot); delete window.undyneTestSnapshot; });
  console.log('✓ Trận Undyne: ACT, lượt xanh, cạn HP/kết thúc, gặp lại và chạy thoát');
}
