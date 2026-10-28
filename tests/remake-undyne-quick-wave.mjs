import assert from 'node:assert/strict';
export async function testUndyneQuickWave(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 108; w.hp = w.maxHp = 20; await w.openRoom('room_water3'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.quickWaveModule = await import('/src/undyne-quick-wave.mjs'); quickWaveModule.loadUndyneQuickWaveAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, old = Math.random; Math.random = () => .5; const wave = new quickWaveModule.UndyneQuickWave(s); wave.step();
    const first = [wave.bullets.length, wave.bullets[0].x, wave.bullets[0].y, wave.duration]; for (let i = 1; i < 10; i++) wave.step();
    const count = wave.bullets.length, hit = wave.bullets[0]; hit.x = s.soul.x * 2; hit.y = s.soul.y * 2 - 10; hit.speed = 0; s.hp = 20; s.invFrames = 0; wave.step(); const damage = [s.hp, s.invFrames];
    const images = wave.bullets.map(b => b.image); wave.destroy(); Math.random = old; s.scene.resume(); return { first, count, damage, clean: images.every(i => !i.active) };
  });
  assert.equal(result.first[0], 1); assert.equal(result.first[3], 38); assert.equal(result.count, 4); assert.deepEqual(result.damage, [16, 60]); assert.equal(result.clean, true);
  await page.evaluate(() => __remake.scene.finishBattle()); console.log('✓ Trận nhanh Undyne: nhịp giáo, sát thương và bất tử');
}
