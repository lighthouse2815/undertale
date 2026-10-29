import assert from 'node:assert/strict';

export async function testWaterfallUndyneEncounter(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, kills: w.kills, hp: w.hp, maxHp: w.maxHp });
    w.flags = {}; w.plot = 120; w.kills = 0; w.hp = w.maxHp = 100; await w.openRoom('room_water21'); w.player.setPosition(290, 120); return snapshot;
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const intro = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal; w.player.setPosition(150, 599); w.updateCamera();
    const started = c.checkTrigger(); for (let i = 0; i < 2000 && c.locked; i++) { while (w.dialogue) w.advanceDialogue(); c.step(); }
    return [started, w.plot, c.stage, !!c.save];
  });
  assert.deepEqual(intro, [true, 121, 'ready', true]);
  const encounter = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal; w.player.setPosition(150, 500); const started = c.checkTrigger();
    while (w.dialogue) w.advanceDialogue(); c.step(); for (let i = 0; i < 30; i++) c.step();
    return [started, c.stage, !!c.save];
  });
  assert.deepEqual(encounter, [true, 'battle', false]);
  await page.waitForFunction(() => __remake.phase === 'battle' || __remake.phase === 'error');
  assert.equal(await page.evaluate(() => __remake.scene.scene.key), 'UndyneBattle');
  await page.evaluate(() => { const s = __remake.scene; s.previousScene.player.setPosition(150, 580); s.green = false; s.choose('mercy', ['Spare','Flee']); s.subIndex = 1; s.confirmPressed = true; s.updateSubmenu(); });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.waitForFunction(() => __remake.scene.waterfallUndyneFinal?.stage === 'chase', { timeout: 5000 });
  const chase = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal, glass = w.roomObjects.find(e => e.item.ObjectName === 'obj_magicglass');
    c.chaser.setPosition(glass.item.X, glass.item.Y - 30); c.updateGlass(); const lit = glass.image.alpha > 0;
    c.chaser.setPosition(160, 620); w.player.setPosition(160, 650); c.chaseDelay = 0; c.stepChase();
    return [w.flags[352], w.flags[17], lit, c.stage];
  });
  assert.deepEqual(chase, [1, 1, true, 'chaseBattle']);
  await page.waitForFunction(() => __remake.phase === 'battle');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.scene.key, __remake.scene.previousScene.flags[99]]), ['UndyneBattle', 2]);
  await page.evaluate(() => { const s = __remake.scene; s.previousScene.flags[350] = 1; s.finishBattle(); });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.waitForFunction(() => __remake.scene.waterfallUndyneFinal?.stage === 'done');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[17], __remake.scene.waterfallUndyneFinal.chaser, __remake.scene.waterfallMusic]), [122, 0, null, null]);
  await page.evaluate(() => __remake.scene.player.setPosition(20, 640));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water21'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Đường Undyne: cửa Waterfall, cảnh, vào trận, truy đuổi và đấu lại');
}
