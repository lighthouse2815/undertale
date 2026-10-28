import assert from 'node:assert/strict';

export async function testPapyrusBlueAttack(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => {
    const s = __remake.scene; window.boneModule = await import('/src/papyrus-bones.mjs'); window.blueModule = await import('/src/papyrus-blue-attack.mjs'); boneModule.loadPapyrusBoneAssets(s);
    if (!s.cache.audio.exists('snd_bell')) s.load.audio('snd_bell', '/assets/sounds/snd_bell/snd_bell.wav');
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture';
  });
  const result = await page.evaluate(() => {
    const s = __remake.scene; s.soul.setPosition(155, 150); s.soulMovement = 1; s.invFrames = 9999;
    let closeSpeech; const w = new blueModule.PapyrusBlueAttack(s, (close) => { closeSpeech = close; });
    const oldRandom = Math.random; Math.random = () => .5;
    for (let i = 0; i < 19; i++) w.step(); const before = [w.frames, w.bullets.length, w.timer]; w.step();
    const rain = [w.bullets.length, w.bullets[0].x, w.bullets[0].y, w.bullets[0].vx, w.bullets[0].top, w.bullets[0].blue, w.bullets[0].damage];
    w.timer = 600; w.alarms[0] = 1; w.step(); const pause = [w.alarms[1], w.timer];
    while (w.phase !== 'fall' && w.frames < 300) w.step(); const blue = [w.frames, s.soulMovement, s.soulJumpStage, s.soulVSpeed, w.volume];
    s.soul.setPosition(170, 170); for (let i = 0; i < 2; i++) w.step(); const finalBone = [w.phase, w.bullets.at(-1).x, w.bullets.at(-1).vx];
    for (const bone of [...w.bullets]) w.remove(bone); s.invFrames = 0;
    for (let i = 0; i < 2; i++) w.step(); const speech = [w.phase, typeof closeSpeech]; closeSpeech();
    let done = false; for (let i = 0; i < 2; i++) if (w.step()) done = true; const completed = [w.phase, done];
    Math.random = oldRandom; w.destroy();
    const leftWave = new blueModule.PapyrusBlueAttack(s, () => {}); leftWave.alarms.fill(0); leftWave.alarms[4] = 1; s.soul.setPosition(120, 170); s.invFrames = 0; leftWave.step(); const leftBone = [leftWave.bullets[0].x, leftWave.bullets[0].vx];
    for (const bone of [...leftWave.bullets]) leftWave.remove(bone); s.invFrames = 1; leftWave.step(); const immuneWait = leftWave.phase; s.invFrames = 0; leftWave.step(); leftWave.step(); const afterImmune = leftWave.phase; leftWave.destroy();
    s.finishBattle(); return { before, rain, pause, blue, finalBone, speech, completed, leftBone, immuneWait, afterImmune };
  });
  assert.deepEqual(result.before, [19, 0, 281]);
  assert.deepEqual(result.rain, [1, 457.5, 325, -4.5, true, true, 1]);
  assert.deepEqual(result.pause, [19, 636]);
  assert.deepEqual(result.blue.slice(1, 4), [2, 2, -2]); assert.ok(result.blue[4] < .06);
  assert.deepEqual(result.finalBone, ['lastBone', 440, -6]); assert.deepEqual(result.speech, ['speech', 'function']); assert.deepEqual(result.completed, ['complete', true]);
  assert.deepEqual(result.leftBone, [188, 6]); assert.equal(result.immuneWait, 'lastBone'); assert.equal(result.afterImmune, 'speech');
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Papyrus chuyển tim xanh: đợt xương xanh, tăng timer, fade nhạc, chuông/rơi, xương cuối, chờ hết đạn/bất tử và lời thoại');
}
