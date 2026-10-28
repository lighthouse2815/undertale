import assert from 'node:assert/strict';

export async function testWaterfallStarPath(page) {
  for (const ending of [false, true]) {
    await page.evaluate(async ending => {
      const w = __remake.game.scene.getScene('World'); w.flags = ending ? { 7: 1 } : {}; w.plot = 110;
      if (ending) await w.openRoom('room_tundra_town');
      await w.openRoom('room_water_savepoint1'); w.player.setPosition(280, 120);
      window.starPathMusic = ending ? w.townMusic : w.waterfallMusic;
    }, ending);
    await page.waitForFunction(() => __remake.scene.scene.isActive());
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water11');
    assert.deepEqual(await page.evaluate(ending => [__remake.scene.player.x, __remake.scene.player.y, (ending ? __remake.scene.townMusic : __remake.scene.waterfallMusic) === window.starPathMusic], ending), [15, 120, true]);
    await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_savepoint1');
    assert.deepEqual(await page.evaluate(ending => [__remake.scene.player.x, __remake.scene.player.y, (ending ? __remake.scene.townMusic : __remake.scene.waterfallMusic) === window.starPathMusic], ending), [280, 120, true]);
  }
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); });
  console.log('✓ Cửa Crystal ↔ phòng sao, marker và nhạc liên tục');
}
