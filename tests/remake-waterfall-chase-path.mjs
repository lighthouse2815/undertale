import assert from 'node:assert/strict';
export async function testWaterfallChasePath(page) {
  await page.waitForFunction(() => __remake.game.scene.getScene('World').scene.isActive());
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 108; w.hp = w.maxHp = 20; await w.openRoom('room_water7'); w.player.setPosition(1060, 120); window.beforeChaseMusic = w.waterfallMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water8');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.beforeChaseMusic]), [10, 190, true]);
  await page.evaluate(() => __remake.scene.scene.pause()); await page.waitForFunction(() => __remake.scene.scene.isPaused());
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneChase; w.player.setPosition(284, 180); c.checkTrigger(); for (let i = 0; i < 300 && c.stage !== 'chase'; i++) c.step(); c.generator.next = c.generator.frame + 10000; w.player.setPosition(2060, 200); window.activeChaseMusic = c.music; w.scene.resume(); });
  await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition', null, {timeout: 5000}).catch(async e => { console.log(await page.evaluate(() => ({phase: __remake.phase, x: __remake.scene.player.x, key: __remake.scene.keys.right.isDown, stage: __remake.scene.waterfallUndyneChase.stage, locked: __remake.scene.waterfallUndyneChase.locked, active: __remake.scene.scene.isActive()}))); throw e; }); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water9');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallUndyneSecond.stage, __remake.scene.chaseMusic === window.activeChaseMusic]), [30, 120, 'chase', true]);
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 110; await w.openRoom('room_water9', 'obj_markerA'); w.player.setPosition(10, 120); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water8');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallUndyneChase.stage]), [2060, 200, 'done']);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Cửa Waterfall 7→8→9, đi lại và nhạc liên tục');
}
