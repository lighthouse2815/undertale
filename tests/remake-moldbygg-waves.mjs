import assert from 'node:assert/strict';

export async function testMoldbyggWaves(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 65; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.moldbyggWaves = await import('/src/moldbygg-waves.mjs'); moldbyggWaves.loadMoldbyggWaveAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, random = () => .5; s.invFrames = 9999;
    const ring = new moldbyggWaves.MoldbyggWave(s, 0, { population: 2, random }); ring.step(); ring.step();
    const first = [ring.bullets.length, ring.rate, ring.bullets.every(b => b.sprite === 'spr_bulletmd' && b.damage === 8), ring.rings.length];
    const expires = ring.rings[0].expires; while (ring.frames < expires) ring.step();
    const middle = [ring.bullets.filter(b => b.ring === 1).length, ring.bullets.some(b => b.kind === 'drop' && b.damage === 0)];
    const ringImages = ring.bullets.map(b => b.image); ring.destroy();
    const stalk = new moldbyggWaves.MoldbyggWave(s, 80, { population: 1, random }); stalk.step(); stalk.step();
    const stem = [stalk.rate, stalk.stalks[0].pieces.length, stalk.stalks[0].pieces[0].vy < 0];
    for (let i = 0; i < 46; i++) stalk.step();
    const loop = stalk.bullets.find(b => b.kind === 'loop'), launch = [!!loop, loop?.damage, Math.round(Math.hypot(loop?.vx, loop?.vy) * 10)];
    const sprite = stalk.stalks[0].pieces[0]; s.soul.setPosition(sprite.x / 2, sprite.y / 2); const collision = stalk.overlaps(sprite);
    const stalkImages = stalk.bullets.map(b => b.image); stalk.destroy(); s.scene.resume();
    return { first, middle, stem, launch, collision, clean: [...ringImages, ...stalkImages].every(image => !image.active) };
  });
  assert.deepEqual(result.first, [8, 44, true, 1]); assert.deepEqual(result.middle, [0, true]); assert.deepEqual(result.stem, [35, 4, true]); assert.deepEqual(result.launch, [true, 8, 30]); assert.equal(result.collision, true); assert.equal(result.clean, true);
  await page.evaluate(() => __remake.scene.finishBattle()); console.log('✓ Đạn Moldbygg: tám mảnh, thân bốn đốt, vòng đuổi SOUL và dọn');
}
