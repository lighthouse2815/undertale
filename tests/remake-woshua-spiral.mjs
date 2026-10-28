import assert from 'node:assert/strict';

export async function testWoshuaSpiral(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 65; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.woshuaSpiralModule = await import('/src/woshua-spiral.mjs'); woshuaSpiralModule.loadWoshuaSpiralAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, original = Math.random; Math.random = () => 0;
    const state = { clean: 1, dirtyJoke: 0, monsterAttack: 7, mercyModifier: 5 };
    const wave = new woshuaSpiralModule.WoshuaSpiral(s, state, 80);
    s.soul.setPosition(0, 0);
    for (let i = 0; i < 6; i++) wave.step(); const first = [wave.bullets.length, wave.bullets[0].green, wave.next, state.clean];
    for (let i = 6; i < 36; i++) wave.step();
    const green = wave.bullets.find(b => b.green); const born = !!green;
    s.soul.setPosition(154.5, 142.5); s.hp = 10; s.invFrames = 20;
    green.x = s.soul.x * 2 + 7; green.y = s.soul.y * 2 + 7; green.speed = 3; green.acceleration = 0;
    wave.step(); const heal = [s.hp, state.clean, state.mercyModifier, green.dead];
    const images = wave.bullets.map(b => b.image); wave.destroy();
    const multiState = { clean: 0, dirtyJoke: 0, monsterAttack: 7, mercyModifier: 5 };
    const multi = new woshuaSpiralModule.WoshuaSpiral(s, multiState, 0, 2);
    for (let i = 0; i < 6; i++) multi.step();
    const blue = multi.bullets[0]; blue.x = s.soul.x * 2 + 7; blue.y = s.soul.y * 2 + 7; blue.speed = 3; blue.acceleration = 0; s.invFrames = 0;
    const before = s.hp; multi.step(); const still = s.hp; s.soul.x += 1; multi.step(); const moving = s.hp;
    const done = [multi.duration, blue.blue, blue.dead ?? false]; multi.destroy(); Math.random = original; s.scene.resume();
    return { first, born, heal, clean: images.every(i => !i.active), before, still, moving, done };
  });
  assert.deepEqual(result.first, [1, false, 9, 0]); assert.equal(result.born, true);
  assert.deepEqual(result.heal, [11, 2, 200, true]); assert.equal(result.clean, true);
  assert.equal(result.still, result.before); assert.ok(result.moving < result.still); assert.deepEqual(result.done, [180, true, false]);
  await page.evaluate(() => __remake.scene.finishBattle());
  console.log('✓ Xoắn Woshua: nhịp sinh, giọt xanh hồi HP, đạn xanh và dọn');
}
