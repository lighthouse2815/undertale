import assert from 'node:assert/strict';
export async function testWaterfallUndyneChase(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 108; w.hp = w.maxHp = 20; w.armor = 4; await w.openRoom('room_water8'); w.scene.pause(); w.player.setPosition(284, 180); });
  const intro = await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneChase; const triggered = c.checkTrigger(); for (let i = 0; i < 300 && c.stage !== 'chase'; i++) c.step(); return [triggered, c.stage, c.locked, w.flags[17], w.flags[77], c.undyne.y, c.music.key, w.colliders.some(e => e.objectName === 'obj_solidsmall' && e.x === 40 && e.y === 180)]; });
  assert.deepEqual(intro, [true, 'chase', false, 1, 4, 38, 'mus_undynefast', true]);
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneChase; c.generator.next = c.generator.frame + 1; c.step(); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallUndyneChase.generator.spears.length), 3);
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneChase, s = c.generator.spears[0]; c.generator.spears = [s]; s.x = w.player.x + 8; s.y = w.player.y + 24; s.state = 'flying'; s.speed = 0; s.direction = 270; s.rotation = 270; s.contact = 1; w.scene.resume(); });
  await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.evaluate(() => __remake.scene.waterfallUndyneChase.step());
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'UndyneQuickBattle');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.previousScene.flags[15], __remake.scene.previousScene.flags[16], __remake.scene.previousScene.flags[370]]), [1, 1, 1]);
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 999; for (let i = 0; i < 40 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  await page.waitForFunction(() => __remake.phase === 'running'); assert.equal(await page.evaluate(() => __remake.scene.waterfallUndyneChase.stage), 'chase');
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 108; await w.openRoom('room_water8'); w.player.setPosition(265, 180); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallUndyneChase.stage === 'spear'); await page.keyboard.up('ArrowRight');
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 110; await w.openRoom('room_water8'); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallUndyneChase.stage), 'done');
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water1'); });
  console.log('✓ Truy đuổi Undyne: xuất hiện, giáo va chạm và trận nhanh');
}
