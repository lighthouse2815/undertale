import assert from 'node:assert/strict';

export async function testGyftrotWaves(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 63; w.hp = w.maxHp = 20; w.lv = 1; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_froggit');
  await page.evaluate(async () => {
    const s = __remake.scene; window.gyftWaveModule = await import('/src/gyftrot-waves.mjs'); gyftWaveModule.loadGyftrotWaveAssets(s);
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture';
  });
  const make = (command, options = {}) => page.evaluate(({ command, options }) => { const s = __remake.scene; s.wave?.destroy(); s.hp = 20; s.invFrames = 99999; s.wave = new gyftWaveModule.GyftrotWave(s, command, options); return [s.wave.kind, s.wave.rate, s.wave.duration, s.arena.x, s.arena.y, s.arena.width, s.arena.height, s.soul.x, s.soul.y]; }, { command, options });
  const step = (n) => page.evaluate((n) => { let done; for (let i = 0; i < n; i++) done = __remake.scene.wave.step(); return done; }, n);
  for (const [command, hardmode, population, expected, kind] of [[0, false, 1, 5, 'gravity'], [60, false, 2, 8, 'gravity'], [61, false, 3, 12, 'gifts'], [100, true, 1, 3, 'gifts'], [30, true, 2, 5, 'gravity'], [30, true, 3, 7, 'gravity']]) {
    assert.deepEqual(await make(command, { hardmode, population }), [kind, expected, 120, 113.5, 100, 90, 92.5, 154.5, 142.5]);
  }
  await make(0); const gravity = await page.evaluate(() => { const s = __remake.scene, w = s.wave, oldRandom = Math.random; Math.random = () => 0; w.step(); const a = w.bullets[0], initial = [a.x, a.y, a.vx, a.vy]; for (let i = 0; i < 5; i++) w.step(); Math.random = oldRandom; return [initial, w.bullets.length, a.y, a.vy, a.image.mask === w.mask]; });
  assert.deepEqual(gravity, [[242.5, 171.75, .5, -.25], 2, 174.25, 1, true]);
  const slots = await page.evaluate(() => { const s = __remake.scene, r = Math.random, results = []; for (let i = 0; i < 6; i++) { s.wave.destroy(); s.wave = new gyftWaveModule.GyftrotWave(s, 0); Math.random = () => (i + .01) / 6; s.wave.step(); results.push(s.wave.bullets[0].x); } Math.random = r; return results; }); assert.deepEqual(slots, [242.5, 257.5, 287.5, 317, 346.5, 376.5]);
  // 3hộp: cảnh báo25frame, đổi chỗ xoay sine, ba nhịp phóng 21/41/61; xanh an toàn khi đứng yên.
  for (const roll of [0, 1, 2]) {
    await make(61); const result = await page.evaluate((roll) => {
      const s = __remake.scene, w = s.wave; const initial = w.bullets.map((b) => [b.x, b.y]); for (let i = 0; i < 29; i++) w.step();
      const r = Math.random; Math.random = () => (roll + .01) / 3; w.step(); Math.random = r; const at30 = [w.launchAt, w.shuffle, w.bullets.map((b) => b.phase)];
      for (let i = 0; i < w.launchAt - 30; i++) w.step(); const launch = [w.bullets.filter((b) => b.blue).length, w.bullets[0].vy, w.slowLaunch]; return [initial, at30, launch];
    }, roll);
    assert.deepEqual(result[0], [[226.5, 325], [294, 325], [361.5, 325]]); assert.deepEqual(result[1], [30 + [41, 61, 21][roll], true, [-45, 5, 55]]); assert.deepEqual(result[2], [1, roll === 2 ? -1.1 : -2.3, roll === 2]);
  }
  await make(100); const blue = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave, b = w.bullets[w.blueIndex]; w.warningAt = Infinity; w.shuffle = false; b.blue = true; b.frame = 1; b.x = s.soul.x * 2 - 5; b.y = s.soul.y * 2 - 20; w.bullets.filter((e) => e !== b).forEach((e) => { e.x = -1000; }); s.invFrames = 0; w.step(); const still = s.hp; s.soul.x += 1; w.step(); const moving = s.hp; const inv = s.invFrames; w.step(); return [still, moving, s.hp, inv > 0, b.image.active];
  }); assert.deepEqual(blue, [20, 15, 15, true, true]);
  await make(100); const white = await page.evaluate(() => { const s = __remake.scene, w = s.wave, b = w.bullets[0]; w.warningAt = Infinity; b.x = s.soul.x * 2 - 5; b.y = s.soul.y * 2 - 20; s.invFrames = 0; w.step(); return [s.hp, b.image.active]; }); assert.deepEqual(white, [15, true]);
  await make(0); const hit = await page.evaluate(() => { const s = __remake.scene, w = s.wave; w.next = Infinity; const b = w.add('spr_circlebullet_noc', s.soul.x * 2, s.soul.y * 2, { damage: 7 }); s.invFrames = 0; w.step(); return [s.hp, b.image.active, w.bullets.length]; }); assert.deepEqual(hit, [15, true, 1]);
  await make(0); const bonus = await page.evaluate(() => { const s = __remake.scene, w = s.wave; w.next = Infinity; w.add('spr_circlebullet_noc', s.soul.x * 2, s.soul.y * 2, { damage: 7 }); s.hp = 30; s.invFrames = 0; w.step(); return s.hp; }); assert.equal(bonus, 23);
  await make(100); const fixedDamage = await page.evaluate(() => { const s = __remake.scene, w = s.wave, b = w.bullets[0]; w.warningAt = Infinity; b.x = s.soul.x * 2 - 5; b.y = s.soul.y * 2 - 20; s.hp = 30; s.invFrames = 0; w.step(); return s.hp; }); assert.equal(fixedDamage, 25);
  await make(100, { hardmode: true }); const fast = await page.evaluate(() => { const w = __remake.scene.wave; const r = Math.random; Math.random = () => 0; for (let i = 0; i < 71; i++) w.step(); Math.random = r; return w.bullets[0].vy; }); assert.equal(fast, -2.5);
  await make(0, { mercy: 100 }); assert.equal(await step(1), true);
  await make(0); assert.equal(await step(119), false); assert.equal(await step(1), true);
  await make(100); await step(49); await page.screenshot({ path: '.cache/gyftrot-waves.png' });
  const destroyed = await page.evaluate(() => { const w = __remake.scene.wave, all = w.bullets.map((b) => b.image); w.destroy(); return all.every((b) => !b.active) && !w.clip.active; }); assert.equal(destroyed, true);
  await page.evaluate(() => __remake.scene.finishBattle()); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Đạn Gyftrot: biên7/120frame/mercy,6cột/trọng lực/tần suất/HardMode-dân số,3hộp/cảnh báo/sine/3nhịp/xanh-trắng/HP/bất tử/dọn');
}
