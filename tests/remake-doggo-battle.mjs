import assert from 'node:assert/strict';

export async function testDoggoBattle(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = async () => {
    await page.evaluate(async () => {
      const w = __remake.game.scene.getScene('World'); w.flags = { 202: 20, 203: 3 }; w.plot = 40; w.hp = w.maxHp = 20;
      w.lv = 1; w.xp = w.gold = w.kills = 0; w.inventory = [3, 1]; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0;
      await w.openRoom('room_tundra4'); w.saveGame(true); __remake.startBattle('doggo');
    });
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music && !!__remake.scene.head);
  };
  const pages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const select = async (index) => { await page.waitForFunction(() => __remake.scene.mode === 'menu'); await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z'); };
  const act = async (pet = false) => {
    await select(1); await key('z'); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Check', 'Pet']);
    if (pet) await key('ArrowRight');
    await key('ArrowDown'); assert.equal(await page.evaluate(() => __remake.scene.subIndex), pet ? 1 : 0); await key('z');
  };
  const wave = async (command = 0) => { await page.waitForFunction(() => __remake.scene.mode === 'speech'); await page.evaluate((command) => { __remake.scene.command = command; }, command); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); };
  const finish = () => page.evaluate(() => {
    const s = __remake.scene; for (let i = 0; i < 130 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul();
  });
  const spare = async () => {
    await select(3); assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Spare']); await key('ArrowDown');
    assert.equal(await page.evaluate(() => __remake.scene.subIndex), 0); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  };
  await open(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.mercyModifier, __remake.scene.excited]), [70, 1, -15, -1]);
  await act(true); assert.match(await page.evaluate(() => __remake.scene.message.text), /too suspicious/); await pages();
  assert.match(await page.evaluate(() => __remake.scene.speechText.text), /Don't/); await wave();
  const tracking = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave, sword = w.sword; const speed = Math.abs(sword.vx), y = sword.y;
    s.soul.y += 20;
    for (let i = 0; i < 15; i++) w.step(); return [Math.abs(sword.vx) > speed, sword.y > y, s.hp];
  }); assert.deepEqual(tracking, [true, true, 20]);
  await finish(); assert.equal(await page.evaluate(() => __remake.scene.excited), 0);
  // Năm lần Pet: tăng tới4, DEF-90, câu cuối đủ rồi đưa DEF về0; không được trốn trận kịch bản.
  for (let i = 0; i < 5; i++) {
    await act(true); assert.equal(await page.evaluate(() => __remake.scene.pages.length), 2); await pages();
    assert.equal(await page.evaluate(() => __remake.scene.pets), Math.min(4, i + 1));
    assert.equal(await page.evaluate(() => __remake.scene.config.def), i === 4 ? 0 : -90);
    const speech = await page.evaluate(() => __remake.scene.speechText.text);
    assert.match(speech, [/BEEN/, /COMING/, /END/, /THOROUGH/, /enough/][i]); await wave();
    if (i === 0) {
      const tiny = await page.evaluate(() => { const s = __remake.scene; for (let i = 0; i < 5; i++) s.update(0, 1000 / 30); return s.tinyText.text; });
      assert.match(tiny, /P[EAO]T/);
    }
    await finish();
  }
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[139]), 1); await spare();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.plot, __remake.scene.flags[52] ?? 0, __remake.scene.flags[27], __remake.scene.flags[203], __remake.scene.flags[202]]), [30, 0, 0, 41, 0, 1, 3, 20]);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  // Di chuyển khi kiếm xanh chạm: mấtHP, excited1/mercy-50; đứng yên cả wave sau mới Pet được.
  await open(); await act(); assert.match(await page.evaluate(() => __remake.scene.message.text), /squirrels/); await pages(); await wave();
  await page.evaluate(() => { const s = __remake.scene, sword = s.wave.sword; sword.x = s.soul.x * 2 + 2; sword.y = s.soul.y * 2; sword.vx = 0; sword.friction = 0; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.hp < 20); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.excited, __remake.scene.mercyModifier, __remake.scene.wave.hurted]), [16, 1, -50, true]);
  await finish(); await act(true); assert.match(await page.evaluate(() => __remake.scene.message.text), /suspicious/); await pages(); await wave(); await finish();
  assert.equal(await page.evaluate(() => __remake.scene.excited), 0); await act(true); await pages(); await wave(); await finish(); await spare();
  // Stick không mất, flag52=2 cho hậu cảnh chơi fetch; thưởng vẫn30G ở đầyHP.
  await open(); await select(2); await key('z'); assert.match(await page.evaluate(() => __remake.scene.message.text), /played fetch/); await pages();
  assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), 101); await wave(); await finish(); await spare();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[52], __remake.scene.inventory, __remake.scene.gold]), [2, [3, 1], 30]);
  // command100 là nhánh móng vuốt trắng hiếm, dùng lại generator bốn phía đã chuyển.
  await open(); await act(); await pages(); await wave(100);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waveKind, __remake.scene.wave.duration, __remake.scene.wave.rate, __remake.scene.arena.width, __remake.scene.arena.height]), ['claws', 120, 25, 90, 67.5]);
  const copies = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave; s.invFrames = 1000;
    for (let i = 0; i < 30; i++) w.step(); return w.bullets.filter((b) => !b.parent).length;
  }); assert.ok(copies > 0); await finish(); assert.equal(await page.evaluate(() => __remake.scene.excited), -1);
  await select(2); await key('z'); await pages(); await wave(); await finish(); await spare();
  await open(); await select(2); await key('ArrowDown'); await key('z'); await pages(); await wave(); await finish();
  assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), [3]);
  await page.evaluate(() => { __remake.scene.enemyHp = 1; }); await select(0); await key('z'); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[52], __remake.scene.flags[203], __remake.scene.flags[202], __remake.scene.flags[0] ?? 0, __remake.scene.plot]), [30, 30, 1, 1, 3, 20, 0, 41]);
  // Game Over bằng va chạm xanh thật và snapshot/nhạc, không tính chiến thắng/plot41.
  await open(); await act(); await pages(); await wave();
  await page.evaluate(() => { const s = __remake.scene, sword = s.wave.sword; s.hp = 1; sword.x = s.soul.x * 2 + 2; sword.y = s.soul.y * 2; sword.vx = sword.friction = 0; s.previousScene.inventory = []; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.mode === 'dead'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.scene.deathReady); const deathPages = await page.evaluate(() => __remake.scene.deathLines.length);
  for (let i = 0; i < deathPages; i++) await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.plot, __remake.scene.flags[52] ?? 0, __remake.scene.inventory]), [20, 40, 0, [3, 1]]);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  console.log('✓ Doggo: Check/Pet sau đứng yên/5Pet/DEF/cờ, kiếm xanh/tăng tốc/bám/chỉ trúng khi di chuyển, Stick/ITEM, không Flee, thưởng30G/EXP/không đổi dân số và Game Over/nhạc');
}
