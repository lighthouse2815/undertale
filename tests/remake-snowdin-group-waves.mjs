import assert from 'node:assert/strict';

export async function testSnowdinGroupWaves(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 51; w.hp = w.maxHp = 20; w.inventory = []; await w.openRoom('room_tundra_spaghetti'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_froggit');
  await page.evaluate(async () => {
    const s = __remake.scene; window.groupWaveModule = await import('/src/snowdin-group-waves.mjs'); groupWaveModule.loadSnowdinGroupWaveAssets(s);
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture';
  });
  const make = (types, commands = []) => page.evaluate(({ types, commands }) => {
    const s = __remake.scene; s.wave?.destroy(); s.hp = 20; s.invFrames = 99999;
    s.wave = new groupWaveModule.SnowdinGroupWave(s, types.map((type, i) => ({ type, alive: true, command: commands[i] ?? 0 })));
    return { duration: s.wave.duration, border: s.wave.border, parts: s.wave.parts.map((p) => ({ kind: p.kind, duration: p.duration, rate: p.rate, distance: p.distance, count: p.teeth?.length })) };
  }, { types, commands });
  const step = (n) => page.evaluate((n) => { const w = __remake.scene.wave; let done; for (let i = 0; i < n; i++) done = w.step(); return { done, duration: w.duration, parts: w.parts.map((p) => p.frames), bullets: w.bullets.length }; }, n);
  for (const [types, commands, duration, extended, rates] of [
    [['icecap', 'jerry'], [0], 100, 160, [33]], [['icecap', 'jerry'], [50], 150, 210, [33]],
    [['icecap', 'jerry', 'snowdrake'], [0, 0, 0], 130, 190, [45, 32]],
    [['icecap', 'jerry', 'chilldrake'], [50, 0, 99], 130, 190, [45, 36]],
    [['icecap', 'snowdrake'], [50, 0], 130, 130, [45, 32]], [['jerry'], [], 0, 0, []],
    [['ice'], [0], 5, 5, [15]], [['ice', 'jerry'], [0], 1, 1, [25]],
  ]) {
    const result = await make(types, commands); assert.equal(result.duration, duration); assert.deepEqual(result.parts.map((p) => p.rate), rates);
    if (types.includes('snowdrake') || types.includes('chilldrake')) assert.equal(result.border.top, 200); else assert.equal(result.border.top, 250);
    if (result.parts[0]?.kind === 'teeth' && types[0] === 'icecap') {
      assert.equal(result.parts[0].distance, types.length === 3 ? 315 : 265); assert.equal(result.parts[0].count, types.length === 3 ? 36 : 32);
    }
    if (duration > 10) { const after = await step(10); assert.equal(after.duration, extended); assert.equal(after.done, false); assert.ok(after.parts.every((n) => n === 10)); }
    await page.evaluate(() => { const w = __remake.scene.wave; w.frames = Math.max(0, w.duration - 1); }); assert.equal((await step(1)).done, true);
  }
  await make(['icecap', 'jerry', 'snowdrake'], [50, 0, 99]);
  await step(80);
  assert.ok(await page.evaluate(() => __remake.scene.wave.parts.every((p) => p.bullets.length > 0)), 'Mũ và móng vuốt cùng tồn tại trong cùng arena.');
  assert.ok(await page.evaluate(() => __remake.scene.wave.bullets.some((p) => p.sprite === 'spr_iciclebullet')));
  const p = await step(60); assert.equal(p.done, false); assert.deepEqual(p.parts, [140, 140]); assert.equal(p.duration, 190);
  // Đạn/mask/HP của từng generator vẫn chạy khi dùng chung, không tạo các lượt né nối tiếp.
  assert.equal(await page.evaluate(() => { const s = __remake.scene, part = s.wave.parts[0], b = part.icicle(s.soul.x * 2 - 4, s.soul.y * 2 - 14); b.vy = 0; s.invFrames = 0; part.step(); return s.hp < 20; }), true);
  await page.screenshot({ path: '.cache/snowdin-group-waves.png' });
  const cleanup = await page.evaluate(() => { const w = __remake.scene.wave, children = w.parts.flatMap((p) => p.bullets.map((b) => b.image)); w.destroy(); return children.every((e) => !e.active); }); assert.equal(cleanup, true);
  await page.evaluate(() => { const s = __remake.scene; s.finishBattle(); }); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Đạn nhóm35/36: mũ-răng/móng vuốt cùng arena, dân số/tần suất/khoảng răng/36cột, timer chung/Jerry+60sau10frame/tiếp tục generator, Ice-Jerry/đứngmộtmình/mask-HP/dọn');
}
