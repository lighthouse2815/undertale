import assert from 'node:assert/strict';

export async function testWaterfallKidPath(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 119; await w.openRoom('room_water19'); w.player.setPosition(290, 120); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water20'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => {
    const w = __remake.scene, bridge = w.waterfallKidBridge, update = bridge.update.bind(bridge);
    bridge.update = () => update(200); w.player.setPosition(385, 100);
    window.kidDialogueTimer = setInterval(() => { const world = __remake.game.scene.getScene('World'); if (world.dialogue) world.advanceDialogue(); }, 10);
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallKidBridge.stage !== 'waiting'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.scene.waterfallKidBridge.stage === 'choice', null, { timeout: 30000 });
  const choice = await page.evaluate(() => { const w = __remake.scene, b = w.waterfallKidBridge, x = w.cameras.main.scrollX; w.player.setPosition(b.kid.x, b.kid.y + 11); w.player.facing = 'u'; const entered = b.interact(); return [w.flags[17], entered, b.escapeDoors, x]; });
  assert.deepEqual(choice.slice(0, 3), [0, true, null]);
  await page.waitForFunction(() => __remake.scene.waterfallKidBridge.stage === 'done', null, { timeout: 30000 });
  await page.evaluate(() => clearInterval(window.kidDialogueTimer));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.flags[98], __remake.scene.flags[17]]), [120, 1, 0]);
  await page.evaluate(() => __remake.scene.player.setPosition(580, 100)); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water21'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallPuzzleHater.locked]), [10, 120, false]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 119; await w.openRoom('room_water20'); const b = w.waterfallKidBridge, update = b.update.bind(b); b.update = () => update(200); w.player.setPosition(385, 100); window.kidDialogueTimer = setInterval(() => { const world = __remake.game.scene.getScene('World'); if (world.dialogue) world.advanceDialogue(); }, 10); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallKidBridge.stage !== 'waiting'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.scene.waterfallKidBridge.stage === 'choice', null, { timeout: 30000 });
  await page.evaluate(() => { const w = __remake.scene, door = w.waterfallKidBridge.escapeDoors.find(e => e.direction === 'A'); w.player.setPosition(door.left - 19, door.top - 10); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_water21'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.scene.plot === 120, null, { timeout: 10000 });
  await page.evaluate(() => clearInterval(window.kidDialogueTimer));
  assert.equal(await page.evaluate(() => __remake.scene.waterfallMusic.key), 'mus_ambientwater');
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 11}; w.plot = 119; await w.openRoom('room_water19'); });
  assert.equal(await page.evaluate(() => __remake.scene.findDoor(290, 120)), undefined);
  console.log('✓ Tuyến thường: phòng 19 → cảnh Monster Kid → phòng 21; chặn nhánh chưa chuyển');
}
