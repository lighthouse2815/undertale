import assert from 'node:assert/strict';

export async function testTorielBattle(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(55); };
  const start = async (flags = {}, hp = 20) => {
    await page.evaluate(async ([flags, hp]) => {
      const world = __remake.game.scene.getScene('World');
      world.flags = flags; world.hp = hp; world.maxHp = 20; world.lv = 1; world.weaponStrength = 0; world.armorDefense = 0;
      world.inventory = [11]; world.xp = 0; world.gold = 0; world.kills = 0;
      await world.openRoom('room_basement3', 'obj_markerA'); world.plot = 24;
      world.saveGame(true); __remake.startBattle('toriel');
    }, [flags, hp]);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.monster === 'toriel' && !!__remake.scene.music);
  };
  const action = async (menu, sub = 0, act) => {
    await page.evaluate((menu) => { __remake.scene.menuIndex = menu; }, menu); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'submenu');
    if (sub) await key('ArrowDown'); await key('z');
    if (act !== undefined) { await page.waitForFunction(() => __remake.scene.kind === 'act'); for (let i = 0; i < act; i++) await key('ArrowDown'); await key('z'); }
  };
  const pages = async () => { while (await page.evaluate(() => __remake.scene.mode === 'pages')) await key('z'); };
  const finishWave = async () => {
    await page.evaluate(() => {
      const scene = __remake.scene;
      scene.speechBox?.destroy(); scene.speechText?.destroy(); if (scene.mode === 'speech') scene.beginWave();
      // Test toàn bộ generator ở 30 Hz, giữ bất tử để test hành động không bị chết do đứng yên.
      scene.invFrames = 1000;
      for (let i = 0; i < 220 && scene.mode === 'soul'; i++) {
        if (scene.wave.step()) scene.finishSoul();
      }
      scene.invFrames = 0;
    });
    assert.equal(await page.evaluate(() => __remake.scene.mode), 'menu');
  };
  await page.evaluate(() => localStorage.removeItem('undertale-remake-toriel-kills'));
  await start();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.enemy.x, __remake.scene.enemy.y, __remake.scene.enemy.scaleX, __remake.scene.music.key]), [440, 125, 21, 1, 'mus_boss1']);
  assert.ok(await page.evaluate(() => __remake.scene.cache.bitmapFont.exists('fnt_plain:black')));
  await action(1, 0, 0); assert.match(await page.evaluate(() => __remake.scene.pages[0]), /ATK 80 DEF 80/); await pages(); await finishWave();
  for (const expression of [/couldn't think/, /tried to think/, /Ironically/]) {
    await action(1, 0, 1); assert.match(await page.evaluate(() => __remake.scene.pages[0]), expression); await pages(); await finishWave();
    assert.equal(await page.evaluate(() => __remake.scene.conversation), 0);
  }
  await page.evaluate(() => { __remake.scene.previousScene.inventory = [11]; __remake.scene.hp = 3; });
  await action(2); assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await pages(); await finishWave();
  for (let i = 1; i <= 25; i++) {
    await action(3);
    assert.equal(await page.evaluate(() => __remake.scene.conversation), i);
    if (i === 25) break;
    if (i === 14) {
      assert.equal(await page.evaluate(() => __remake.scene.music.isPlaying), false);
      assert.equal(await page.evaluate(() => __remake.scene.speechBox.texture.key), 'spr_blconwdshrt:0');
      assert.equal(await page.evaluate(() => __remake.scene.speechText.font), 'fnt_plain:black');
    }
    await finishWave();
  }
  assert.equal(await page.evaluate(() => __remake.scene.pages.length), 6); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[45], __remake.scene.flags[27], __remake.scene.xp, __remake.scene.gold, __remake.scene.kills]), [5, 1, 0, 0, 0]);
  // Các dạng đợt, tốc độ Hard Mode, thời lượng, khung lớn/nhỏ và nhánh tránh tim khi HP thấp.
  await start();
  for (const [command, kind, duration, rate] of [[0, 'helix', 140, 5], [30, 'mini', 140, 2], [50, 'float', 140, 6], [70, 'hands', 200, 2], [90, 'hand', 200, 2]]) {
    const result = await page.evaluate(async ([command]) => {
      const { TorielWave } = await import('/src/toriel-waves.mjs'); const scene = __remake.scene;
      scene.scene.pause(); scene.hp = 20; scene.invFrames = 999; const wave = new TorielWave(scene, command);
      for (let i = 0; i < 40; i++) wave.step();
      const result = { kind: wave.kind, duration: wave.duration, rate: wave.rate, bullets: wave.bullets.length, top: wave.border.top,
        moved: wave.hands.length ? wave.hands[0].distance > 0 : wave.bullets.some((bullet) => bullet.y !== wave.border.top - 5), clipped: wave.bullets.every((bullet) => !!bullet.image.mask) };
      wave.destroy(); scene.scene.resume(); return result;
    }, [command]);
    assert.equal(result.kind, kind); assert.equal(result.duration, duration); assert.equal(result.rate, rate);
    assert.ok(result.bullets > 0 && result.moved && result.clipped);
    assert.equal(result.top, command < 40 ? 200 : 250);
  }
  assert.deepEqual(await page.evaluate(async () => {
    const { TorielWave } = await import('/src/toriel-waves.mjs'); const scene = __remake.scene; const results = [];
    for (const command of [0, 30, 50]) { const wave = new TorielWave(scene, command, { hard: true }); results.push([wave.duration, wave.rate]); wave.destroy(); }
    scene.hp = 2; const avoid = new TorielWave(scene, 90); results.push([avoid.kind, avoid.border.top]); avoid.destroy();
    scene.hp = 20; const mercy = new TorielWave(scene, 90, { conversation: 14 }); results.push([mercy.duration, mercy.step()]); mercy.destroy(); return results;
  }), [[160, 4], [160, 1], [160, 5], ['avoid', 200], [1, true]]);
  // Va chạm dùng mask tim/đạn thật; sát thương và bất tử không bị vô hiệu hóa.
  const hpAfter = await page.evaluate(async () => {
    const { TorielWave } = await import('/src/toriel-waves.mjs'); const scene = __remake.scene; scene.scene.pause();
    const wave = new TorielWave(scene, 50); wave.next = 999; scene.hp = 20; scene.invFrames = 0;
    wave.fire('float', scene.soul.x * 2, scene.soul.y * 2, { vx: 0, vy: 0 }); wave.step(); const hp = scene.hp;
    wave.fire('float', scene.soul.x * 2, scene.soul.y * 2, { vx: 0, vy: 0 }); wave.step(); const again = scene.hp;
    wave.destroy(); scene.scene.resume(); return [hp, again, scene.invFrames];
  });
  assert.ok(hpAfter[0] < 20); assert.equal(hpAfter[0], hpAfter[1]); assert.equal(hpAfter[2], 30);
  // Hạ HP quái bằng FIGHT thật, phòng thủ đổi ở ngưỡng 150 và nhận đúng 150 EXP.
  await page.evaluate(() => { const scene = __remake.scene; scene.enemyHp = 160; scene.defense = 1; scene.hp = 20; scene.conversation = 3; scene.toMenu(scene.text.intro[0]); });
  await action(0); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z');
  assert.ok(await page.evaluate(() => __remake.scene.enemyHp > 0 && __remake.scene.enemyHp <= 150));
  assert.equal(await page.evaluate(() => __remake.scene.conversation), 0, 'Đánh trúng ở ba lượt đầu xóa tiến trình thuyết phục.');
  await pages(); assert.equal(await page.evaluate(() => __remake.scene.defense), -140); await finishWave();
  await action(0); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.enemyHp), 0); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.pages.length), 12); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[45], __remake.scene.xp, __remake.scene.kills, __remake.scene.gold]), [4, 150, 1, 0]);
  assert.equal(await page.evaluate(() => localStorage.getItem('undertale-remake-toriel-kills')), '1');
  await start(); await action(1, 0, 1); assert.equal(await page.evaluate(() => __remake.scene.pages.length), 3); await pages(); await finishWave();
  await action(1, 0, 1); assert.match(await page.evaluate(() => __remake.scene.pages[0]), /without running/); await pages(); await finishWave();
  await action(3, 1); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.scene.flags[45]), undefined, 'Flee không đặt cờ tha/giết.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[11]), 1);
  await start({ 202: 20 });
  assert.equal(await page.evaluate(() => __remake.scene.defense), -9999);
  await action(1, 0, 1); assert.match(await page.evaluate(() => __remake.scene.pages[0]), /Not worth/); await pages(); await finishWave();
  await action(0); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.pages.length), 5);
  assert.match(await page.evaluate(() => __remake.scene.pages[0]), /hate me/); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  await start();
  await page.evaluate(() => { __remake.scene.conversation = 14; __remake.scene.defense = -2000; });
  await action(0); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.pages[1]), /vulnerable/); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  await start({}, 1); await action(1, 0, 0); await pages();
  await page.evaluate(() => {
    const scene = __remake.scene; scene.speechBox?.destroy(); scene.speechText?.destroy(); scene.beginWave();
    scene.invFrames = 0; scene.wave.next = 999;
    scene.wave.fire('float', scene.soul.x * 2, scene.soul.y * 2, { damage: 20, vx: 0, vy: 0 });
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead' && __remake.scene.deathReady);
  for (let i = 0; i < 6 && await page.evaluate(() => __remake.phase === 'battle'); i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.room), 'room_basement3');
  assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  console.log('✓ trận Toriel: Check/Talk/ITEM/Flee, 25 MERCY/thoại/cờ, năm đợt/Hard Mode/khung/mask/sát thương/bất tử, FIGHT/EXP/ký ức/betrayal/tuyến giết/Game Over');
}
