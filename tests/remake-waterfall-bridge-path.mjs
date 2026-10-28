import assert from 'node:assert/strict';
export async function testWaterfallBridgePath(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; await w.openRoom('room_water4'); w.player.setPosition(530, 280); w.updateCamera(); window.testBridgeMusic = w.waterfallMusic; });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  const walkTo = async (key, room) => { await page.keyboard.down(key); await page.waitForFunction(room => __remake.phase === 'running' && __remake.room === room, room, { timeout: 5000 }).catch(async error => { console.log('Cửa bị chặn:', await page.evaluate(() => ({ room: __remake.room, phase: __remake.phase, x: __remake.scene.player.x, y: __remake.scene.player.y, doors: __remake.scene.doors }))); throw error; }); await page.keyboard.up(key); };
  await walkTo('ArrowRight', 'room_water5');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallEncounter.firstEntrance, __remake.scene.waterfallMusic === window.testBridgeMusic]), [20, 340, true, true]);
  await page.evaluate(() => { const w = __remake.scene, bridge = w.waterfallBridgeRoom; w.waterfallEncounter.disabled = true; for (const [i, board] of bridge.boards.entries()) { board.x = 420 + i * 20; board.y = 400; board.using = 3; } bridge.step(); for (let i = 0; i < 31; i++) bridge.step(); w.player.setPosition(440, 381); w.updateCamera(); });
  await walkTo('ArrowRight', 'room_water5A');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.testBridgeMusic]), [20, 165, true]);
  await walkTo('ArrowLeft', 'room_water5');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallEncounter.firstEntrance, __remake.scene.waterfallMusic === window.testBridgeMusic]), [460, 390, false, true]);
  await page.evaluate(() => { const w = __remake.scene; w.waterfallEncounter.disabled = true; w.player.setPosition(12, 340); w.updateCamera(); });
  await walkTo('ArrowLeft', 'room_water4');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.testBridgeMusic]), [520, 275, true]);
  console.log('✓ Cửa phòng cầu: Waterfall 4/5/5A hai chiều và nhạc liên tục');
}
