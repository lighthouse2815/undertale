import assert from 'node:assert/strict';

export async function testWaterfallDarknessPuzzle(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water16'); w.waterfallEncounter.disabled = true; w.player.setPosition(580, 230); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water17'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  const result = await page.evaluate(() => {
    const w = __remake.scene, p = w.waterfallDarknessPuzzle; w.scene.pause(); w.waterfallEncounter.disabled = true;
    p.glow = 0; for (let i = 0; i < 100; i++) p.step(); p.draw();
    const initial = [w.player.x, w.player.y, p.lanterns.length, p.stones.length, Math.round(p.glow * 1000), p.halo.alpha, p.halo.x, p.halo.y];
    const lantern = p.lanterns[0].entry; w.player.setPosition(lantern.item.X, lantern.item.Y + 1); w.player.facing = 'u'; w.tryInteract(); const timer = p.lanterns[0].timer;
    for (let i = 0; i < 4; i++) p.step(); const after = p.glow;
    w.player.setPosition(100, 81); w.tryInteract(); const lines = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue();
    return { initial, timer, after, lines };
  });
  assert.deepEqual(result.initial.slice(0, 5), [20, 90, 5, 8, 300]);
  assert.ok(Math.abs(result.initial[5] - .3) < .0001); assert.deepEqual(result.initial.slice(6), [10, 85]);
  assert.equal(result.timer, 30); assert.ok(result.after < .1); assert.equal(result.lines, 1);
  await page.waitForFunction(() => !__remake.scene.scene.isActive());
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(20, 90); w.scene.resume(); }); await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water16'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallDarknessPuzzle]), [580, 230, null]);
  console.log('✓ Waterfall 17: bóng tối, đèn, đá phát sáng, bia và cửa');
}
