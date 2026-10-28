import assert from 'node:assert/strict';
export async function testWaterfallUndyneSecond(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = { 17: 1 }; w.plot = 108; w.hp = w.maxHp = 20; await w.openRoom('room_water9'); w.scene.pause(); });
  const initial = await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneSecond; for (let i = 0; i < 10; i++) c.step(); return [c.stage, c.generator.spears.length, c.barriers.length, w.waterfallGrass.grass.length]; });
  assert.deepEqual(initial, ['chase', 3, 2, 55]);
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneSecond, s = c.generator.spears[0]; c.generator.spears = [s]; s.x = w.player.x + 8; s.y = w.player.y + 24; s.state = 'flying'; s.speed = 0; s.direction = 270; s.rotation = 270; s.contact = 1; w.scene.resume(); });
  await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.evaluate(() => __remake.scene.waterfallUndyneSecond.step());
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'UndyneQuickBattle');
  await page.evaluate(() => { const s = __remake.scene; s.scene.pause(); s.invFrames = 999; for (let i = 0; i < 40 && s.mode === 'soul'; i++) s.updateSoul(1000 / 30); s.scene.resume(); });
  await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => __remake.scene.scene.pause());
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneSecond; w.player.x = 470; c.generator.next = c.generator.frame + 5; for (let i = 0; i < 10; i++) c.step(); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallUndyneSecond.generator.next - __remake.scene.waterfallUndyneSecond.generator.frame), 5);
  const end = await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneSecond; w.player.x = 511; c.step(); const begin = [c.stage, c.cutscene.locked, c.images.size];
    for (let i = 0; i < 1500 && c.cutscene.stage !== 'waitPlayer'; i++) c.step(); w.player.setPosition(210, 120);
    for (let i = 0; i < 300 && c.cutscene.stage !== 'talk'; i++) c.step(); const lines = w.dialogue.lines.length; while (w.dialogue) w.advanceDialogue();
    for (let i = 0; i < 300 && c.stage !== 'done'; i++) c.step(); return { begin, lines, result: [c.stage, w.plot, w.flags[17], w.flags[15], w.flags[16], c.barriers.some(b => w.colliders.includes(b))] }; });
  assert.deepEqual(end.begin, ['cutscene', true, 0]); assert.equal(end.lines, 7); assert.deepEqual(end.result, ['done', 110, 0, 0, 0, false]);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Phòng Waterfall 9: giáo, giảm nhịp, cảnh Kid và plot 110');
}
