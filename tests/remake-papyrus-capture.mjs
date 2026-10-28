import assert from 'node:assert/strict';

export async function testPapyrusCapture(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => { const s = __remake.scene; window.captureModule = await import('/src/papyrus-capture.mjs'); if (!s.cache.audio.exists('snd_txtasg')) s.load.audio('snd_txtasg', '/assets/sounds/snd_txtasg/snd_txtasg.wav'); if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; });
  const result = await page.evaluate(() => {
    const s = __remake.scene, captures = [];
    for (const flag of [-1, -2, -3]) {
      s.previousScene.flags[67] = flag; s.hp = 1; let pages, close, returned = 0;
      const wave = new captureModule.PapyrusCapture(s, (texts, next) => { pages = texts; close = next; }, () => { returned++; });
      for (let i = 0; i < 39; i++) wave.step(); const before = pages === undefined; for (let i = 0; i < 2; i++) wave.step(); const shown = [pages.length, pages[0], pages.at(-1)];
      for (let i = 0; i < 10; i++) wave.step(); const waiting = [s.hp, returned]; close(); let done = false; for (let i = 0; i < 48; i++) done = wave.step() || done; const beforeReturn = [s.hp, returned, done]; for (let i = 0; i < 3; i++) done = wave.step() || done;
      captures.push([before, shown, waiting, beforeReturn, s.hp, returned, done]); wave.destroy();
    }
    s.finishBattle(); return captures;
  });
  assert.deepEqual(result.map((v) => v[1][0]), [6, 5, 9]); assert.match(result[0][1][1], /TOO WEAK/); assert.match(result[1][1][1], /ESCAPED/); assert.match(result[2][1][1], /PERSISTENT/);
  for (const capture of result) { assert.equal(capture[0], true); assert.match(capture[1][2], /NYEH/); assert.deepEqual(capture[2], [1, 0]); assert.deepEqual(capture[3], [1, 0, false]); assert.deepEqual(capture.slice(4), [20, 1, true]); }
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Papyrus bắt: ba nhóm lời, chờ thoại, fade/50 frame, hồi HP và chuyển cảnh');
}
