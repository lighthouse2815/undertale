import assert from 'node:assert/strict';

// Kiểm tra các generator thật trong scene chiến đấu Phaser, chưa phải trận hai mục tiêu.
export async function testDogPairWaves(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 49; w.hp = w.maxHp = 20; w.inventory = []; await w.openRoom('room_tundra_spaghetti'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_froggit');
  await page.evaluate(async () => {
    const s = __remake.scene; window.dogWaveModule = await import('/src/dog-pair-waves.mjs'); dogWaveModule.loadDogPairWaveAssets(s);
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); });
    s.mode = 'waveFixture';
  });
  const make = (command, survivor = null) => page.evaluate(({ command, survivor }) => {
    const s = __remake.scene; s.wave?.destroy(); s.hp = 20; s.invFrames = 0; s.previousScene.lv = 1; s.previousScene.armorDefense = 0;
    s.wave = new dogWaveModule.DogPairWave(s, command, survivor);
  }, { command, survivor });
  const step = (n) => page.evaluate((n) => { const s = __remake.scene; let done; for (let i = 0; i < n; i++) { s.invFrames--; done = s.wave.step(); } return done; }, n);
  for (const [command, survivor, kind, duration, border] of [[50, null, 'axes', 172, [202, 432, 290]], [51, null, 'hearts', 200, [132, 492, 250]], [0, 'dogamy', 'hearts', 200, [132, 492, 250]], [99, 'dogaressa', 'axes', 200, [202, 432, 290]]]) {
    await make(command, survivor); assert.deepEqual(await page.evaluate(() => { const w = __remake.scene.wave; return [w.kind, w.duration, [w.border.left, w.border.right, w.border.top]]; }), [kind, duration, border]);
    if (kind === 'axes') {
      assert.deepEqual(await page.evaluate(() => __remake.scene.wave.bullets.map((p) => [p.x, p.y, p.frame, p.damage, p.image.visible])), [[99, 309, 0, survivor ? 7 : 6, false], [350, 309, 1, survivor ? 7 : 6, false]]);
      await step(10); assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.every((p) => p.visible && p.vx === 0 && p.launchAt >= 20 && p.launchAt <= 33)));
      await step(24); assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.every((p) => p.vx !== 0 && p.vy < 0)));
      const bounce = await page.evaluate(() => { const s = __remake.scene, p = s.wave.bullets[0]; p.y = 310; p.vx = 1.8; p.vy = 2; p.gravity = .2; const oldX = p.x; s.wave.step(); return [p.x === oldX, p.y, p.vx, p.vy, p.gravity, p.launchAt - p.age]; });
      assert.deepEqual(bounce, [true, 310, 0, 0, 0, survivor ? 4 : 15]);
    } else if (!survivor) {
      await step(3); assert.equal(await page.evaluate(() => __remake.scene.wave.dogs[0].visible), false); await step(1); assert.equal(await page.evaluate(() => __remake.scene.wave.dogs[0].visible), true);
      await step(12); assert.equal(await page.evaluate(() => __remake.scene.wave.bullets.length), 8);
      assert.deepEqual(await page.evaluate(() => [__remake.scene.wave.bullets.filter((p) => p.blue).length, __remake.scene.wave.bullets.filter((p) => !p.blue).length]), [4, 4]);
      await step(30); assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.every((p) => p.radius === 55 && p.radchange === 1 && p.nxadd >= p.drift)));
      await step(50); assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.some((p) => p.age < 10)), 'Vòng tim mới sinh sau75frame.');
    } else {
      await step(4); assert.equal(await page.evaluate(() => __remake.scene.wave.duration), 173); await step(59); assert.equal(await page.evaluate(() => __remake.scene.wave.bullets.length), 0); await step(1);
      assert.equal(await page.evaluate(() => __remake.scene.wave.bullets.length), 1); await step(100);
      assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.every((p) => p.gravity === 0 && p.vx === 0 && p.vy === 0)));
    }
    await page.evaluate(() => { const s = __remake.scene; s.invFrames = 9999; s.wave.frames = s.wave.duration - 2; });
    assert.equal(await step(1), false); assert.equal(await step(1), true);
  }
  // Tim xanh đứng yên an toàn, dịch tim mới trúng; sát thương vòng trừ thêm1, inv và hủy đạn.
  await make(51); await step(16);
  const hits = await page.evaluate(() => { const s = __remake.scene, w = s.wave; const p = w.bullets.find((p) => p.blue);
    w.bullets.filter((b) => b !== p).forEach((b) => b.image.destroy()); w.bullets = [p]; p.x = s.soul.x * 2 + 8; p.y = s.soul.y * 2 + 8; p.type = 'sad'; p.vx = p.vy = p.gravity = p.friction = 0;
    s.invFrames = 0; w.step(); const still = s.hp; s.soul.x += .5; w.step(); return [still, s.hp, s.invFrames, w.bullets.length]; });
  assert.deepEqual(hits, [20, 17, 30, 0]);
  // Cả hai mask rìu và mask tim thật, tránh góc đen; rìu inv45 và không biến mất.
  for (const frame of [0, 1]) {
    await make(0); const collision = await page.evaluate((frame) => { const s = __remake.scene, w = s.wave, p = w.bullets[frame], d = s.cache.json.get('spr_whiteax2');
      const samples = []; let safe; for (let y = 5; y < 75; y++) for (let x = 65; x < 126; x++) { s.soul.setPosition((p.x + x) / 2, (p.y + y) / 2); if (w.touchesHeart(p)) samples.push([x, y]); else safe ??= [x, y]; }
      s.soul.setPosition((p.x + safe[0]) / 2, (p.y + safe[1]) / 2); const blackSafe = !w.touchesHeart(p);
      s.soul.setPosition((p.x + samples[0][0]) / 2, (p.y + samples[0][1]) / 2); s.invFrames = 0; w.step(); return [samples.length, s.hp, s.invFrames, w.bullets.length, d.CollisionKind, blackSafe];
    }, frame);
    assert.ok(collision[0] > 0); assert.deepEqual(collision.slice(1), [16, 45, 2, 'Precise', true]);
  }
  const safe = await page.evaluate(() => { const s = __remake.scene, w = s.wave, p = w.bullets[0]; s.soul.setPosition(p.x / 2, p.y / 2); return w.touchesHeart(p); }); assert.equal(safe, false);
  await make(51); const images = await page.evaluate(() => { const w = __remake.scene.wave; window.waveImages = [...w.dogs]; w.destroy(); return waveImages.every((e) => !e.active); }); assert.equal(images, true);
  await page.evaluate(() => { const s = __remake.scene; s.music.destroy(); s.scene.stop(); s.previousScene.scene.resume(); __remake.phase = 'running'; __remake.scene = s.previousScene; __remake.room = s.previousScene.dataSource.name; });
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Đạn hai chó: 2rìu/2mask/launch/gravity/đập-sàn/inv45, vòng8tim/4xanh4trắng/radius/drift/75frame, đứng yên-di chuyển/sát thương, nhánh còn1chó/duration/dọn; chưa kiểm trận hai mục tiêu');
}
