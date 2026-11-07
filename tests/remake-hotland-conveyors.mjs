import assert from 'node:assert/strict';

export async function testHotlandConveyors(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 127; await w.openRoom('room_fire5'); return snapshot;
  });
  const result = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandConveyors;
    const positions = [[110,1200],[190,1200],[70,635],[50,675],[110,500],[245,750]];
    const movement = positions.map(([x,y]) => { w.player.setPosition(x,y); c.step(); return [w.player.x - x,w.player.y - y]; });
    w.player.setPosition(110,1200); w.dialogue = {}; c.step(); const paused = [w.player.x,w.player.y]; w.dialogue = null;
    const first = c.belts[0], second = c.belts[1]; c.frame = 0; c.elapsed = 0; c.update(1000 / 30);
    return { count: c.belts.length, scales: [first.scale,second.scale], movement, paused, frames: [first.image.texture.key,second.image.texture.key] };
  });
  assert.equal(result.count,56);
  assert.deepEqual(result.scales,[[2,21],[2,21]]);
  assert.deepEqual(result.movement,[[0,-3],[0,3],[-3,-3],[3,0],[0,-3],[0,3]]);
  assert.deepEqual(result.paused,[110,1200]);
  assert.deepEqual(result.frames,['spr_conveyorbelt_d:4','spr_conveyorbelt_d:1']);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(110,1200); w.updateCamera(); });
  await page.waitForFunction(() => __remake.scene.player.y <= 1188);
  await page.evaluate(async previous => { const w = __remake.scene; Object.assign(w,previous); await w.openRoom('room_fire3','obj_markerC'); }, previous);
  assert.equal(await page.evaluate(() => __remake.scene.hotlandConveyors),null);
  console.log('✓ Băng chuyền Hotland: kích thước, bốn hướng, giao nhau, khóa thoại và chuyển động thật');
}
