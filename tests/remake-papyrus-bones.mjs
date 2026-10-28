import assert from 'node:assert/strict';

export async function testPapyrusBones(page) {
  await page.evaluate(async () => {
    const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.armorDefense = 0; w.armor = 4; w.weapon = 3; w.inventory = [];
    await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit');
  });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => {
    const s = __remake.scene; window.papyrusBones = await import('/src/papyrus-bones.mjs'); papyrusBones.loadPapyrusBoneAssets(s);
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture';
  });
  const result = await page.evaluate(() => {
    const s = __remake.scene; s.soul.setPosition(150, 150); s.invFrames = 0;
    const random = Math.random; Math.random = () => .5;
    let wave = new papyrusBones.PapyrusBones(s, { firstWave: true }); Math.random = random;
    const first = [s.arena.x, s.arena.y, s.arena.width, s.arena.height, ...wave.bullets.map((v) => [v.x, v.y, v.vx])];
    wave.step(); const after = wave.bullets.map((v) => v.x); for (let i = 1; i < 139; i++) wave.step(); const beforeEnd = wave.frames; const done = wave.step();
    wave.destroy();
    wave = new papyrusBones.PapyrusBones(s, { fighto: 14 }); s.hp = 20; s.invFrames = 0; s.soul.setPosition(150, 176);
    let white = wave.add(300, 350, { vx: 0 }); wave.step(); const hit = [s.hp, s.invFrames, wave.bullets.length, white.tip.active];
    const immuneBone = wave.add(300, 350); wave.step(); const immune = [s.hp, immuneBone.tip.active]; wave.remove(immuneBone);
    s.invFrames = 0; let blue = wave.add(300, 350, { blue: true }); wave.step(); const still = [s.hp, blue.tip.active];
    s.soul.x += .5; wave.step(); const moved = [s.hp, blue.tip.active];
    s.hp = 20; s.invFrames = 0; s.soul.setPosition(150, 130); const upper = wave.add(300, 290, { top: true }); wave.step(); const topHit = [s.hp, upper.tip.active];
    s.soul.setPosition(150, 176); s.hp = 2; s.invFrames = 0; wave.add(300, 350); wave.add(400, 340); wave.step(); const captured = [s.hp, s.invFrames, wave.captured, wave.bullets.length, s.soulVSpeed];
    const clip = wave.clip; wave.destroy(); const cleaned = !clip.active;
    s.finishBattle(); return { first, after, beforeEnd, done, hit, immune, still, moved, topHit, captured, cleaned };
  });
  assert.deepEqual(result.first, [96, 125, 125, 67.5, [452, 355, -3], [532, 355, -3], [612, 355, -3]]);
  assert.deepEqual(result.after, [449, 529, 609]); assert.equal(result.beforeEnd, 139); assert.equal(result.done, true);
  assert.deepEqual(result.hit, [16, 90, 0, false]); assert.deepEqual(result.immune, [16, true]); assert.deepEqual(result.still, [16, true]); assert.deepEqual(result.moved, [12, false]);
  assert.deepEqual(result.topHit, [16, false]);
  assert.deepEqual(result.captured, [1, 50, true, 0, 0]); assert.equal(result.cleaned, true);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Xương Papyrus: ba xương đầu/140frame, biên, trắng-xanh/đứng-di chuyển, sát thương/bất tử, bắt ở 1HP và dọn');
}
