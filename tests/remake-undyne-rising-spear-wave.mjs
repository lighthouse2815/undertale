import assert from 'node:assert/strict';

export async function testUndyneRisingSpearWave(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.riseModule = await import('/src/undyne-rising-spear-wave.mjs'); riseModule.loadUndyneRisingSpearAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, random = Math.random; Math.random = () => 0; s.invFrames = 999;
    try {
      const wave = new riseModule.UndyneRisingSpearWave(s, { firingRate: 22, order: 15 }); for (let i = 0; i < 10; i++) wave.step(); const first = wave.bullets[0], initial = [first.lane, first.part, first.image.visible];
      wave.step(); const appeared = [first.image.visible, first.velocity]; for (let i = 0; i < 19; i++) wave.step(); const warning = [first.part, first.velocity, first.y];
      for (let i = 0; i < 12; i++) wave.step(); const launch = [first.part, first.velocity, wave.bullets[1].lane]; for (let i = 0; i < 8; i++) wave.step(); const fading = [first.part, first.alpha < 1];
      const images = wave.bullets.map(b => b.image); while (!wave.done) wave.step(); const final = [wave.transition.lesson, wave.bullets.length, images.every(i => !i.active), wave.clip.active];
      const inverted = new riseModule.UndyneRisingSpearWave(s, { undying: true, type: 1 }); for (let i = 0; i < 11; i++) inverted.step(); const b = inverted.bullets[0], flipped = [b.type, b.velocity, b.image.scaleY, b.damage];
      b.part = 1; b.x = s.soul.x * 2; b.y = s.soul.y * 2 + 50; b.velocity = 0; b.age = 21; s.invFrames = 0; const hp = s.hp; inverted.step(); const hurt = s.hp < hp; inverted.destroy();
      s.scene.resume(); s.finishBattle(); return { initial, appeared, warning, launch, fading, final, flipped, hurt };
    } finally { Math.random = random; }
  });
  assert.deepEqual(result.initial, [0,0,false]); assert.deepEqual(result.appeared, [true,-1]); assert.equal(result.warning[0], 1); assert.equal(result.warning[1], 0);
  assert.deepEqual(result.launch, [2,-10,1]); assert.deepEqual(result.fading, [4,true]); assert.deepEqual(result.final, [13,0,true,false]); assert.deepEqual(result.flipped, [1,1,-.5,11]); assert.equal(result.hurt, true);
  await page.waitForFunction(() => __remake.phase === 'running'); console.log('✓ Giáo mọc SOUL đỏ: ba cột, báo trước, lao, sát thương và dọn');
}
