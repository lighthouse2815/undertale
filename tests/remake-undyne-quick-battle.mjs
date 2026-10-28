import assert from 'node:assert/strict';
export async function testUndyneQuickBattle(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = { 370: 1 }; w.plot = 108; w.hp = w.maxHp = 20; await w.openRoom('room_water3'); __remake.startBattle('undyneQuick'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'UndyneQuickBattle' && __remake.scene.mode === 'soul');
  const start = await page.evaluate(() => [__remake.scene.wave.kind, __remake.scene.buttons.every(b => !b.visible), __remake.scene.music.isPlaying]);
  assert.deepEqual(start, ['undyneQuick', true, false]);
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.hp = 13; s.invFrames = 999; for (let i = 0; i < 40 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  await page.waitForFunction(() => __remake.phase === 'running'); assert.equal(await page.evaluate(() => __remake.scene.hp), 13);
  await page.evaluate(() => { __remake.scene.hp = 1; __remake.startBattle('undyneQuick'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'UndyneQuickBattle' && __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.hp = 0; s.updateSoul(1000 / 30); s.scene.resume(); });
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'dead');
  await page.evaluate(() => __remake.scene.finishBattle()); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Trận nhanh Undyne: vào thẳng đợt né, kết thúc, giữ HP và Game Over');
}
