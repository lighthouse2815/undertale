import assert from 'node:assert/strict';

export async function testHardModeEnd(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(50); };
  for (const killed of [false, true]) {
    await page.evaluate(async () => {
      const world = __remake.game.scene.getScene('World');
      if (__remake.phase === 'hardEnd') { __remake.scene.scene.stop(); world.scene.resume(); }
      world.flags = { 6: 1, 45: 3 }; world.plot = 24; world.hp = 20; world.maxHp = 20; world.lv = 1;
      world.inventory = []; world.kills = 0; world.xp = 0; world.gold = 0;
      await world.openRoom('room_basement3', 'obj_markerA'); __remake.startBattle('toriel');
    });
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
    await page.evaluate((killed) => {
      const scene = __remake.scene;
      if (killed) { scene.enemyHp = 0; scene.end('kill'); }
      else { scene.conversation = 24; scene.lastAction = 'spare'; scene.dummyTurn(); }
    }, killed);
    while (await page.evaluate(() => __remake.scene.mode === 'pages')) await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'hardEnding');
    assert.equal(await page.evaluate(() => __remake.scene.hardEnding.toriel.texture.key), killed ? 'spr_torielboss_kneel:0' : 'spr_torielboss_side:0');
    assert.equal(await page.evaluate(() => __remake.scene.hardEnding.music.key), 'mus_dogsong');
    const speakers = new Set(); let titleCount = 0, flowey = false, guards = 0;
    while (await page.evaluate(() => __remake.phase !== 'hardEnd')) {
      assert.ok(++guards < 120, 'Đoạn kết phải đi tới màn đen, không lặp hội thoại vô hạn.');
      const observed = await page.evaluate(() => {
        const end = __remake.scene.hardEnding;
        // Chạy alarm gốc theo 30 Hz; không chờ hàng phút thực để kiểm tra từng mốc.
        for (let i = 0; i < 1000 && !['speech', 'complete'].includes(end.stage); i++) end.step();
        return { stage: end.stage, speaker: end.speaker, text: end.writer?.text,
          title: __remake.scene.children.list.filter((entry) => entry.type === 'BitmapText' && entry.depth === 40002).length,
          flower: !!end.flower?.active, dogX: end.dog.x };
      });
      if (observed.stage === 'speech') { speakers.add(observed.speaker); assert.ok(observed.text.length > 0); await key('z'); }
      titleCount = Math.max(titleCount, observed.title); flowey ||= observed.flower;
    }
    assert.deepEqual([...speakers].sort(), ['dog', 'flowey', 'toriel']);
    assert.equal(titleCount, 4); assert.equal(flowey, true);
    assert.equal(await page.evaluate(() => __remake.room), 'room_emptyblack');
    assert.equal(await page.evaluate(() => __remake.scene.children.list.length), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('undertale-remake-hard-complete')), '1');
    assert.deepEqual(await page.evaluate(() => { const world = __remake.game.scene.getScene('World'); return [world.xp, world.kills, world.gold]; }), [0, 0, 0]);
    if (!killed) assert.equal(await page.evaluate(() => __remake.game.scene.getScene('World').flags[27]), 1);
  }
  // Trả fixture về World để các ca tiếp theo độc lập với màn kết thúc.
  await page.evaluate(async () => {
    const world = __remake.game.scene.getScene('World'); __remake.scene.scene.stop(); world.scene.resume();
    world.flags = {}; world.plot = 25; await world.openRoom('room_basement3', 'obj_markerA');
  });
  console.log('✓ kết thúc Hard Mode sau tha/đánh bại: chó/Toriel/Flowey, lời gốc, alarm, bốn dòng tiêu đề/nhạc và màn đen; không thưởng EXP/kill giả');
}
