import assert from 'node:assert/strict';
export async function testWoshuaMoldbyggBattle(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water3'); __remake.startBattle('moldbyggGroup55'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WoshuaMoldbyggBattle');
  const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(70); };
  const wave = async () => { await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 9999; for (let i = 0; i < 181 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); }); await page.waitForFunction(() => __remake.scene.mode === 'menu'); };
  assert.deepEqual(await page.evaluate(() => __remake.scene.enemies.map(e => [e.name, e.hp, e.mercy])), [['Woshua', 70, 5], ['Moldbygg', 70, -40]]);
  await page.evaluate(() => { const s = __remake.scene; s.menuIndex = 1; }); await key('z'); await key('ArrowDown'); await key('z'); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Check', 'Hug', 'Lie Down', 'Unhug']); await key('ArrowDown'); await key('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.soulSpeed, __remake.scene.enemies[0].state.slime]), [3, 1]); await key('z'); await wave();
  await page.evaluate(() => { const s = __remake.scene; s.act(s.enemies[0], 'Touch'); }); assert.match(await page.evaluate(() => __remake.scene.message.text), /runs away/); await key('z'); await wave();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemies[0].alive, __remake.scene.goldReward, __remake.scene.previousScene.flags[145]]), [false, 25, 1]);
  await page.evaluate(() => { const s = __remake.scene; s.act(s.enemies[1], 'Unhug'); }); await key('z'); await wave(); await page.evaluate(() => { const s = __remake.scene; s.removeEnemy(s.enemies[1], false); s.end(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.goldReward, __remake.scene.xpReward, __remake.scene.previousScene.flags[144]]), [45, 0, 1]); await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Woshua/Moldbygg: Hug, né đạn chung, Touch và tha');
}
