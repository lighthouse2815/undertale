import assert from 'node:assert/strict';

export async function testUndyneGreenWave(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.greenWaveModule = await import('/src/undyne-green-wave.mjs'); window.greenWaveYellow = (await import('/src/undyne-green-spear.mjs')).UndyneGreenYellowSpear; greenWaveModule.loadUndyneGreenWaveAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, wave = new greenWaveModule.UndyneGreenWave(s, 0); s.invFrames = 999;
    for (let i = 0; i < 4; i++) wave.step({ up: true }); const before = wave.bullets.length;
    wave.step({ left: true }); const first = [wave.index, wave.bullets.length, wave.next, wave.soul.shield.ideal];
    for (let i = 0; i < 51; i++) wave.step({ left: true }); const pair = [wave.index, wave.bullets.some(b => b instanceof window.greenWaveYellow), wave.bullets.length];
    const graphics = wave.soul.graphics, all = [...wave.bullets]; while (!wave.done && wave.frames < 210) wave.step({ left: true });
    const final = [wave.done, wave.frames <= 200, graphics.active, all.every(b => !b.image.active)];
    const second = new greenWaveModule.UndyneGreenWave(s, 1, { duration: 200 }); s.invFrames = 999; for (let i = 0; i < 5; i++) second.step({ up: true }); const slow = [second.bullets[0].vy, second.sequence.length]; second.destroy();
    const order = new greenWaveModule.UndyneGreenWave(s, 1); s.invFrames = 999; for (let i = 0; i < 15; i++) order.step({ up: true });
    const firstTwo = order.bullets.map(b => [b.frame, b.countdown]); order.bullets[0].x = order.bullets[0].centerX; order.bullets[0].y = order.bullets[0].centerY - 30; order.bullets[0].vy = 0; order.step({ up: true }); order.step({ up: true }); const promoted = order.bullets[0]?.frame; order.destroy();
    const lengths = [0, 1, 2, 3].map(lesson => { const wave = new greenWaveModule.UndyneGreenWave(s, lesson); const n = wave.sequence.length; wave.destroy(); wave.destroy(); return n; });
    const original = Math.random; Math.random = () => .75;
    const later = [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].map(lesson => { const wave = new greenWaveModule.UndyneGreenWave(s, lesson, { rating: 12 }); const values = [wave.sequence.length, wave.refuse, wave.sequence.every(e => e.site >= 0 && e.site < 4), wave.sequence[0].speed, wave.sequence[2].time]; wave.destroy(); return values; }); Math.random = original;
    const rated = new greenWaveModule.UndyneGreenWave(s, 10, { rating: 11 }); const ratedTime = rated.sequence[2].time; rated.destroy();
    const originalRandom = Math.random; Math.random = () => .5; const undying = [-5,-6,-7,-8,-9,-10,-11,-12,-13,-14].map(lesson => { const wave = new greenWaveModule.UndyneGreenWave(s, lesson); const data = [wave.sequence.length, wave.refuse, wave.duration, wave.sequence.every(e => e.site >= 0 && e.site < 4)]; wave.destroy(); return data; }); Math.random = originalRandom;
    s.scene.resume(); s.finishBattle(); return { before, first, pair, final, slow, firstTwo, promoted, lengths, later, ratedTime, undying };
  });
  assert.equal(result.before, 0); assert.deepEqual(result.first, [1, 1, 15, 0]); assert.ok(result.pair[0] >= 6); assert.equal(result.pair[1], true); assert.deepEqual(result.final, [true, true, false, true]); assert.deepEqual(result.slow, [4, 3]); assert.deepEqual(result.firstTwo, [[1,1],[0,2]]); assert.equal(result.promoted, 1); assert.deepEqual(result.lengths, [9, 3, 6, 8]);
  assert.deepEqual(result.later.map(v => v[0]), [12,9,10,8,8,7,10,12,5,5,8,8,9,8,10,9,12,8,8]);
  assert.deepEqual(result.later.filter(v => v[1]).length, 3); assert.ok(result.later.every(v => v[2]));
  assert.equal(result.later[5][3], 3 / 11); assert.equal(result.later[6][4], 2); assert.equal(result.ratedTime, 2.5);
  assert.deepEqual(result.undying.map(v => v[0]), [13,14,18,9,21,14,12,16,14,24]); assert.equal(result.undying.filter(v => v[1]).length, 3); assert.ok(result.undying.every(v => v[2] === 300 && v[3]));
  await page.waitForFunction(() => __remake.phase === 'running'); console.log('✓ Lượt SOUL xanh: nhịp phát, giáo đôi, phím, hết lượt và dọn');
}
