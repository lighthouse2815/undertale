import assert from 'node:assert/strict';

export async function testWaterfallGlowflies(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water15'); w.scene.pause(); });
  const result = await page.evaluate(() => {
    const w = __remake.scene, controller = w.waterfallGlowflies, fly = controller.flies[0], sounds = [];
    const originalPlay = w.sound.play; w.sound.play = key => { sounds.push(key); };
    try {
      fly.image.setPosition(240, 120); fly.vx = 1; fly.vy = 0; fly.gx = fly.gy = 0; fly.alarm = 10; fly.frame = 0;
      controller.step();
      const movement = [fly.image.x, fly.glow.x, fly.image.texture.key, fly.glow.texture.key, fly.glow.alpha, fly.glow.scaleX];
      w.player.setPosition(fly.image.x - 10, fly.image.y - 15); w.player.facing = 'u';
      const interacted = controller.interact(); controller.step();
      controller.interact(); for (let i = 0; i < 30; i++) controller.step();
      const before = sounds.length; controller.step();
      return [controller.flies.length, movement, interacted, before, sounds.length, sounds.every(s => ['snd_oddtalk1', 'snd_oddtalk2'].includes(s))];
    } finally { w.sound.play = originalPlay; }
  });
  assert.deepEqual(result, [11, [240.95, 240.45, 'spr_glowfly:0', 'spr_glowfly:0', .25, 1.5], true, 1, 2, true]);
  const cleanup = await page.evaluate(async () => { const w = __remake.scene, glow = w.waterfallGlowflies.flies[0].glow; w.scene.resume(); await w.openRoom('room_water_shop'); return [w.waterfallGlowflies, glow.active]; });
  assert.deepEqual(cleanup, [null, false]);
  console.log('✓ Đom đóm Waterfall 15: chuyển động, lớp sáng, âm thanh và dọn');
}
