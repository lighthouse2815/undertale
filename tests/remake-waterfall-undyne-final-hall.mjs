import assert from 'node:assert/strict';

export async function testWaterfallUndyneFinalHall(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, hp: w.hp, maxHp: w.maxHp });
    w.flags = { 99: 1, 354: 1 }; w.plot = 121; w.hp = w.maxHp = 100;
    await w.openRoom('room_water_undynefinal2', 'obj_markerA');
    w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(140, 400); w.player.setPosition(140, 50);
    window.finalHallMusic = w.waterfallMusic; return snapshot;
  });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal3'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const entered = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal;
    return [w.waterfallMusic === window.finalHallMusic, c.stage, w.flags[17], c.chaser.x - w.player.x, w.waterfallPapyrusPhone.done];
  });
  assert.deepEqual([entered[0], entered[1], entered[2], entered[4]], [true, 'chase', 1, false]); assert.ok(Math.abs(entered[3] + 100) <= 20);
  const call = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal;
    c.chaseDelay = 0; c.chaser.setPosition(280, 100); w.player.setPosition(380, 100);
    const started = w.waterfallPapyrusPhone.checkTrigger();
    for (let i = 0; i < 100; i++) c.stepChase();
    const x = c.chaser.x; for (let i = 0; i < 10; i++) c.stepChase();
    return [started, w.flags[354], !!w.dialogue, c.phoneApproach, x === c.chaser.x];
  });
  assert.deepEqual(call, [true, 2, true, true, true]);
  await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); w.waterfallUndyneFinal.stepChase(); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallUndyneFinal.phoneApproach), false);
  await page.evaluate(() => { const w = __remake.scene; w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(500, 100); w.player.setPosition(40, 120); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal2'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(async () => { const w = __remake.scene; w.flags[67] = 1; w.flags[354] = 1; await w.openRoom('room_water_undynefinal3', 'obj_markerA'); w.player.setPosition(380, 100); });
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.waterfallPapyrusPhone.checkTrigger(), w.flags[354], !!w.dialogue, w.waterfallUndyneFinal.phoneApproach]; }), [false, 2, false, true]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 99: 1, 354: 2 }; w.plot = 121; await w.openRoom('room_water_undynefinal3', 'obj_markerA'); w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(300, 100); w.player.setPosition(680, 120); window.hotlandChaseMusic = w.waterfallMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire1'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneFinal; return [w.waterfallMusic === window.hotlandChaseMusic, c.stage, w.flags[17], c.chaser.y, c.sansSeen]; }), [true, 'chase', 1, 80, false]);
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneFinal; c.chaseDelay = 0; c.chaser.setPosition(138, 80); w.player.setPosition(300, 120); c.stepChase(); const pause = c.sansPause; for (let i = 0; i < 75; i++) c.stepChase(); return [pause, c.sansSeen, c.chaser.x, c.sansPause]; }), [75, true, 141, 0]);
  await page.evaluate(() => { const w = __remake.scene; w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(400, 80); w.player.setPosition(40, 120); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal3'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.equal(await page.evaluate(() => __remake.scene.waterfallMusic === window.hotlandChaseMusic), true);
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.finalHallMusic; delete window.hotlandChaseMusic; }, previous);
  console.log('✓ Hành lang Undyne: cửa, truy đuổi, cuộc gọi và nhánh Papyrus vắng mặt');
}
