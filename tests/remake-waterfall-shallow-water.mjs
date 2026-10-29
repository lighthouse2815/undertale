import assert from 'node:assert/strict';

export async function testWaterfallShallowWater(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water15'); w.scene.pause(); });
  const result = await page.evaluate(() => {
    const w = __remake.scene, water = w.waterfallShallowWater, p = w.player, sounds = [];
    const play = w.sound.play; w.sound.play = key => { sounds.push(key); };
    try {
      const at = (x, frame = 0) => { p.setPosition(x, 130); p.frameIndex = frame; water.step(); return [water.inWater, water.ripple.visible]; };
      const start = at(400), enter = at(445, 1), wetVisual = [p._crop.height, p.originY, water.ripple.x, water.ripple.y];
      at(480, 1); const repeated = sounds.filter(s => s === 'snd_splash').length;
      at(500, 3); const leave = at(565), dryVisual = [p.isCropped, p.originY];
      const enterBack = at(535), leaveBack = at(420);
      const secondPool = [at(725), at(845)];
      return { start, enter, wetVisual, repeated, splashes: sounds.filter(s => s === 'snd_splash').length, leave, dryVisual, enterBack, leaveBack, secondPool };
    } finally { w.sound.play = play; }
  });
  assert.deepEqual(result, { start: [false, false], enter: [true, true], wetVisual: [25, -1 / 6, 445, 130], repeated: 1, splashes: 2,
    leave: [false, false], dryVisual: [false, 0], enterBack: [true, true], leaveBack: [false, false], secondPool: [[true, true], [false, false]] });
  await page.evaluate(() => { const w = __remake.scene; w.waterfallEncounter.disabled = true; w.player.setPosition(400, 120); w.waterfallShallowWater.step(); w.scene.resume(); });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.waterfallShallowWater.inWater); await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => !__remake.scene.waterfallShallowWater.inWater); await page.keyboard.up('ArrowLeft');
  const cleanup = await page.evaluate(async () => { const w = __remake.scene, ripple = w.waterfallShallowWater.ripple; w.scene.resume(); await w.openRoom('room_water_shop'); return [w.waterfallShallowWater, ripple.active, w.player.isCropped]; });
  assert.deepEqual(cleanup, [null, false, false]);
  console.log('✓ Nước nông Waterfall 15: vào/ra hai chiều, gợn nước, âm thanh và dọn');
}
