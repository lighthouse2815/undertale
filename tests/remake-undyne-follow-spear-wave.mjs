import assert from 'node:assert/strict';

export async function testUndyneFollowSpearWave(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.followModule = await import('/src/undyne-follow-spear-wave.mjs'); followModule.loadUndyneFollowSpearAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, random = Math.random; Math.random = () => .75; s.soul.setPosition(156, 116); s.invFrames = 999;
    try {
      const wave = new followModule.UndyneFollowSpearWave(s, { firingRate: 18, order: 9 }); wave.step(); const first = wave.bullets[0];
      const spawn = [wave.bullets.length, first.rotation, first.damage, first.image.texture.key];
      for (let i = 0; i < 31; i++) wave.step(); const launch = [first.rotation, first.launched, first.speed, wave.bullets.length];
      const images = wave.bullets.map(b => b.image); while (!wave.done) wave.step(); const end = [wave.transition.lesson, wave.transition.delay, wave.bullets.length, images.every(i => !i.active), wave.lines.active];
      const undying = new followModule.UndyneFollowSpearWave(s, { undying: true, order: 6 }); undying.step(); const lethal = undying.bullets[0].damage; undying.destroy();
      const hit = new followModule.UndyneFollowSpearWave(s); hit.step(); const b = hit.bullets[0]; b.x = s.soul.x * 2 + 8; b.y = s.soul.y * 2 + 8; b.rotation = 0; b.launched = true; b.speed = 0; b.friction = 0; s.invFrames = 0; const hp = s.hp; hit.step(); const damaged = s.hp < hp; hit.destroy();
      s.scene.resume(); s.finishBattle(); return { spawn, launch, end, lethal, damaged };
    } finally { Math.random = random; }
  });
  assert.deepEqual(result.spawn, [1,31,7,'spr_whitespearbullet:0']); assert.deepEqual(result.launch.slice(0,2), [0,true]); assert.ok(result.launch[2] >= 3); assert.equal(result.launch[3], 2);
  assert.deepEqual(result.end, [8,30,0,true,false]); assert.equal(result.lethal, 11); assert.equal(result.damaged, true);
  await page.waitForFunction(() => __remake.phase === 'running'); console.log('✓ Giáo đuổi SOUL đỏ: sinh, xoay, nhắm, sát thương, chuyển lượt và dọn');
}
