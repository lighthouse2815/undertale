import assert from 'node:assert/strict';
export async function testWaterfallRaft(page) {
  const open = (plot = 108) => page.evaluate(async plot => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = plot; await w.openRoom('room_water7'); w.scene.pause(); }, plot);
  await open();
  const result = await page.evaluate(() => {
    const w = __remake.scene, raft = w.waterfallRaft; w.player.setPosition(536, 121); const first = raft.tryBoard(); const start = [raft.stage, raft.x, w.player.x, w.waterfallMusic.key];
    for (let i = 0; i < 160; i++) raft.step(); const end = [raft.stage, raft.x, w.player.x, raft.wait];
    for (let i = 0; i < 8; i++) raft.step(); const released = [raft.stage, raft.x]; raft.step(); const returning = raft.x;
    w.scene.resume(); return { first, start, end, released, returning };
  });
  assert.equal(result.first, true); assert.deepEqual(result.start, ['ride', 520, 536, 'mus_ambientwater']);
  assert.deepEqual(result.end, ['pause', 1000, 1016, 8]); assert.deepEqual(result.released, ['return', 1000]); assert.equal(result.returning, 997);
  await open(); await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(510, 121); w.scene.resume(); });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallRaft.stage === 'ride', null, { timeout: 5000 }).catch(async error => { console.log('Bè:', await page.evaluate(() => { const w = __remake.scene; return { x: w.player.x, y: w.player.y, key: w.keys.right.isDown, stage: w.waterfallRaft.stage, dialogue: !!w.dialogue, active: w.scene.isActive() }; })); throw error; }); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.waterfallMusic.key), 'mus_ambientwater');
  await open(109); assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallRaft.stage, __remake.scene.waterfallRaft.board.image, __remake.scene.colliders.some(c => c.objectName === 'obj_solidsmall' && c.x === 520 && c.y === 140)]), ['gone', null, true]);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Bè Waterfall: lên bè, đi 480px, chờ, trả điều khiển và thay vật cản sau plot 108');
}
