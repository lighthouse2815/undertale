import assert from 'node:assert/strict';
export async function testMoldsmalWaves(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 65; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.moldsmalWaveModule = await import('/src/moldsmal-waves.mjs'); moldsmalWaveModule.loadMoldsmalWaveAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, original = Math.random; Math.random = () => .5;
    const wave = new moldsmalWaveModule.MoldsmalWave(s, [0, 100]); s.soul.setPosition(0, 0);
    wave.step(); const first = [wave.bullets.length, ...wave.generators.map(g => g.rate), wave.bullets.map(b => b.kind)];
    const pollen = wave.bullets[0]; for (let i = 1; i < 10; i++) wave.step(); const turn = pollen.vx;
    for (let i = 10; i < 30; i++) wave.step();
    const fragments = wave.bullets.filter(b => b.kind === 'fragment'); const burst = [fragments.length, fragments.map(b => Math.round(Math.hypot(b.vx, b.vy) * 10))];
    const target = fragments[0]; s.soul.setPosition(154.5, 154.5); target.x = s.soul.x * 2; target.y = s.soul.y * 2; const collision = wave.touchesHeart(target);
    const images = wave.bullets.map(b => b.image); wave.destroy(); Math.random = original; s.scene.resume();
    return { first, turn, burst, collision, clean: images.every(i => !i.active) };
  });
  assert.deepEqual(result.first, [2, 22, 45, ['pollen', 'splinter']]); assert.equal(result.turn, -1.5);
  assert.deepEqual(result.burst, [9, Array(9).fill(15)]); assert.equal(result.collision, true); assert.equal(result.clean, true);
  await page.evaluate(() => __remake.scene.finishBattle()); console.log('✓ Đạn Moldsmal: hai generator, đảo hướng, chín mảnh và dọn');
}
