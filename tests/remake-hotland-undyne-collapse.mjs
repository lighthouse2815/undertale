import assert from 'node:assert/strict';

export async function testHotlandUndyneCollapse(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = { 67: 1 }; w.plot = 121; await w.openRoom('room_fire1', 'obj_markerA');
    w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(200, 80); w.player.setPosition(480, 120);
    window.collapseMusic = w.waterfallMusic; return snapshot;
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire2'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hotlandUndyneCollapse.stage, __remake.scene.waterfallMusic === window.collapseMusic]), ['waiting', true]);
  const initial = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandUndyneCollapse; w.player.setPosition(120, 90); const started = c.checkTrigger();
    for (let i = 0; i < 180; i++) c.step();
    return [started, c.stage, c.actor.x, !!w.dialogue, w.plot];
  });
  assert.deepEqual(initial, [true, 'dialogue', 20, true, 121]);
  const fallen = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandUndyneCollapse; while (w.dialogue) w.advanceDialogue();
    for (let i = 0; i < 100; i++) c.step();
    return [c.stage, c.locked, c.fallen.item.X, w.plot, w.flags[350], w.flags[17], !!w.waterfallMusic, w.colliders.includes(c.collider)];
  });
  assert.deepEqual(fallen, ['done', false, 40, 122, 2, 0, false, true]);
  const water = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandUndyneCollapse;
    w.player.setPosition(200, 60); w.player.facing = 'u'; const started = c.interact();
    w.dialogue.choice.readyAt = 0; w.advanceDialogue(); w.advanceDialogue();
    return [started, w.flags[366], w.flags[440], c.water.visible];
  });
  assert.deepEqual(water, [true, 1, 1, true]);
  const spill = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandUndyneCollapse; c.interact(); w.dialogue.choice.readyAt = 0; w.advanceDialogue(); w.advanceDialogue();
    const spilled = [w.flags[366], w.flags[353], w.flags[441], !!c.puddle];
    c.interact(); w.dialogue.choice.readyAt = 0; w.advanceDialogue(); w.advanceDialogue();
    return [...spilled, w.flags[366], w.flags[440]];
  });
  assert.deepEqual(spill, [0, 1, 1, true, 1, 2]);
  const rescue = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandUndyneCollapse;
    w.player.setPosition(80, 80); w.player.facing = 'l'; const started = c.interact();
    w.dialogue.choice.readyAt = 0; w.advanceDialogue();
    const pouring = [c.stage, c.locked, w.player.visible];
    for (let i = 0; i < 740; i++) c.step();
    return [started, pouring, c.stage, c.locked, w.player.visible, w.flags[366], w.flags[350], w.plot, c.fallen, w.colliders.includes(c.collider)];
  });
  assert.deepEqual(rescue, [true, ['pour', true, false], 'done', false, true, 0, 0, 122, null, false]);
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_fire1', 'obj_markerB'); w.plot = 122; await w.openRoom('room_fire2', 'obj_markerA'); });
  assert.equal(await page.evaluate(() => __remake.scene.hotlandUndyneCollapse.stage), 'done');
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.collapseMusic; }, previous);
  console.log('✓ Hotland: cửa phòng nước, cảnh Undyne kiệt sức và cờ tiến trình');
}
