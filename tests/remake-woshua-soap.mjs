import assert from 'node:assert/strict';

export async function testWoshuaSoap(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 65; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.woshuaSoapModule = await import('/src/woshua-soap.mjs'); woshuaSoapModule.loadWoshuaSoapAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, original = Math.random; Math.random = () => 0;
    const state = { clean: 0, dirtyJoke: 2, monsterAttack: 7 };
    const wave = new woshuaSoapModule.WoshuaSoap(s, state, 50, 2); s.soul.setPosition(0, 0);
    const initial = [wave.soap.x, wave.soap.y, Math.round(Math.hypot(wave.soap.vx, wave.soap.vy)), wave.duration];
    for (let i = 0; i < 4; i++) wave.step();
    const glitter = wave.bullets.find(b => b.sparkle), spawn = [wave.bullets.length, glitter.damage, wave.soap.shineAt, Math.round(Math.hypot(wave.soap.vx, wave.soap.vy))];
    wave.soap.x = wave.border.right - 23.1; wave.soap.vx = 4; wave.soap.vy = 0; wave.step(); const bounced = wave.soap.vx < 0;
    s.soul.setPosition(154.5, 142.5); s.hp = 20; s.invFrames = 0;
    glitter.x = s.soul.x * 2 + 7; glitter.y = s.soul.y * 2 + 7; wave.step(); const hurt = s.hp < 20;
    s.soul.setPosition(0, 0); for (let i = 0; i < 50; i++) wave.step(); const expired = !glitter.image.active;
    const images = wave.bullets.map(b => b.image); wave.destroy(); Math.random = original; s.scene.resume();
    return { initial, spawn, bounced, hurt, expired, clean: images.every(i => !i.active) };
  });
  assert.deepEqual(result.initial, [317, 232.5, 3, 160]); assert.deepEqual(result.spawn, [2, 5, 14, 5]);
  assert.equal(result.bounced, true); assert.equal(result.hurt, true); assert.equal(result.expired, true); assert.equal(result.clean, true);
  await page.evaluate(() => __remake.scene.finishBattle()); console.log('✓ Bong bóng Woshua: nảy, nhịp tia sáng, va chạm và dọn');
}
