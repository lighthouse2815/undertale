import assert from 'node:assert/strict';

export async function testDoggoRoom(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing = 'r') => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  const near = (name) => page.evaluate((name) => {
    const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y + e.sprite.MarginBottom - 8);
    w.player.facing = 'u'; w.interactionCooldown = 0;
  }, name);
  const open = (flags = {}, plot = 40) => page.evaluate(async ({ flags, plot }) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot;
    w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.gold = w.kills = 0; w.inventory = [3, 1]; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0;
    await w.openRoom('room_tundra5', 'obj_markerA');
  }, { flags, plot });
  const advance = async (stage) => assert.equal(await page.evaluate((stage) => { const s = __remake.scene.doggoRoom; for (let i = 0; i < 300 && s.stage !== stage; i++) s.step(); return s.stage; }, stage), stage);
  const read = async (count, pattern) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) await key('z');
  };
  const pages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const menu = async (index) => { await page.waitForFunction(() => __remake.scene.mode === 'menu'); await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z'); };
  const wave = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); await page.evaluate(() => { __remake.scene.command = 0; }); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'soul');
    await page.evaluate(() => { const s = __remake.scene; for (let i = 0; i < 130 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul(); });
  };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 40; await w.openRoom('room_tundra4'); window.checkpointSong = w.snowdinMusic; });
  await place(530, 160); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra5');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 160]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === checkpointSong), true); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter), null);
  for (const [outcome, flags] of [['pet', {}], ['fetch', { 202: 20, 45: 4, 203: 2 }], ['kill', { 202: 20, 45: 4, 203: 2 }]]) {
    await open(flags); await near('obj_sign_room'); await key('z'); await read(1, /NO MOVING/);
    await place(180, 160); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.doggoRoom.stage === 'emerging'); await page.keyboard.up('ArrowRight');
    const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); assert.ok(pos[0] >= 199 && pos[0] < 218);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.isPaused), true);
    const rise = await page.evaluate(() => { const s = __remake.scene.doggoRoom, y = s.dog.y; for (let i = 0; i < 10; i++) s.step(); return [y, s.dog.y, s.dog.mask === s.mask]; });
    assert.equal(rise[1], rise[0] - 5); assert.equal(rise[2], true);
    await key('c'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos); assert.equal(await page.evaluate(() => __remake.phase), 'running');
    await advance('introWait'); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.dog.y), 120);
    await advance('talking');
    assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[2]), outcome === 'pet' ? /WAS moving/ : /shivering/);
    await read(4, /Did something move/); await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
    assert.equal(await page.evaluate(() => __remake.game.registry.get('battleConfig')), 'doggo');
    const temp = await page.evaluate(() => JSON.parse(localStorage.getItem('undertale-remake-temp-v1')));
    assert.equal(temp.room, 'room_tundra5'); assert.equal(temp.flags[200], 0); assert.equal(temp.flags.plot, 40);
    if (outcome === 'kill') {
      // Tính sát thương/4 lượt FIGHT thật từ đủ70HP, không đặt HP quái thành1 để bỏ trận.
      for (let i = 0; i < 5 && await page.evaluate(() => __remake.phase === 'battle'); i++) {
        await menu(0); await key('z'); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages();
        if (await page.evaluate(() => __remake.phase === 'battle')) await wave();
      }
    } else {
      if (outcome === 'fetch') { await menu(2); await key('z'); await pages(); await wave(); }
      else {
        await menu(1); await key('z'); await key('z'); await pages(); await wave();
        await menu(1); await key('z'); await key('ArrowRight'); await key('z'); await pages(); await wave();
      }
      await menu(3); await key('z'); await pages();
    }
    await page.waitForFunction(() => __remake.phase === 'running');
    await page.waitForFunction(() => __remake.scene.doggoRoom.stage === 'afterBattle');
    assert.equal(await page.evaluate(() => __remake.scene.plot), 41);
    await advance(outcome === 'kill' ? 'done' : 'talking');
    if (outcome !== 'kill') {
      await read(outcome === 'fetch' ? 4 : 2, outcome === 'fetch' ? /stick appeared/ : /Something pet/);
      await advance('done');
    }
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.doggoRoom.locked, __remake.scene.doggoRoom.dog.visible, __remake.scene.gold, __remake.scene.flags[203] ?? 0]), [42, false, false, 30, flags[203] ?? 0]);
    await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
    assert.equal(await page.evaluate(() => __remake.scene.flags[52] ?? 0), outcome === 'pet' ? 0 : outcome === 'fetch' ? 2 : 1);
    if (outcome === 'kill') assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.bell), null);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.stage), 'done');
  }
  // Game Over dùng snapshot do cảnh tự lưu; không trao thưởng hoặc mởplot42 khi chưa thắng.
  await open({ 203: 2 }); await place(180, 160); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.doggoRoom.stage === 'emerging'); await page.keyboard.up('ArrowRight');
  await advance('talking'); await read(4, /Did something move/); await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await menu(1); await key('z'); await key('z'); await pages();
  await page.evaluate(() => { __remake.scene.command = 0; }); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => {
    const s = __remake.scene, sword = s.wave.sword; s.hp = 1; sword.x = s.soul.x * 2 + 2; sword.y = s.soul.y * 2; sword.vx = sword.friction = 0;
    s.previousScene.gold = 999; s.previousScene.inventory = [];
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.mode === 'dead'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.scene.deathReady); const deathPages = await page.evaluate(() => __remake.scene.deathLines.length);
  for (let i = 0; i < deathPages; i++) await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.room, __remake.scene.hp, __remake.scene.plot, __remake.scene.flags[52] ?? 0, __remake.scene.flags[203], __remake.scene.gold, __remake.scene.inventory]), ['room_tundra5', 20, 40, 0, 2, 0, [3, 1]]);
  // Chuông: hai tiếng cách12frame, trồi60frame/chờ20 rồi sáu lời/cap, lặn20frame.
  await open({}, 42);
  await page.evaluate(() => {
    const w = __remake.scene; window.doggoBellPlay = w.sound.play; w.bellCalls = 0;
    w.sound.play = function (key, ...args) { if (key === 'snd_bell') w.bellCalls++; return window.doggoBellPlay.call(this, key, ...args); };
  });
  for (let i = 0; i < 7; i++) {
    await near('obj_dogringbell'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.stage), 'bellEmerging');
    const echo = await page.evaluate(() => { const s = __remake.scene.doggoRoom; return s.echoAt - s.total; }); assert.ok(echo > 0 && echo <= 12);
    await advance('talking'); await read(1, [/Hello/, /playing a trick/, /Big guy/, /tall/, /knock it/, /\.\.\./, /\.\.\./][i]); await advance('done');
    assert.equal(await page.evaluate(() => __remake.scene.bellCalls), (i + 1) * 2);
    assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.dog.visible), false); assert.equal(await page.evaluate(() => __remake.scene.plot), 42);
  }
  await page.evaluate(() => { __remake.scene.sound.play = window.doggoBellPlay; delete window.doggoBellPlay; });
  await near('obj_dogtreat'); await key('z'); await read(1, /smoking/);
  await page.evaluate(() => { const w = __remake.scene, e = w.doggoRoom.treat; w.player.setPosition(e.item.X + 5, e.item.Y + e.sprite.MarginBottom - 8); w.player.facing = 'u'; });
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(250); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y + 19 >= 171));
  await open({ 7: 1 }, 110); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.treat), null);
  assert.ok(await page.evaluate(() => !!__remake.scene.doggoRoom.note)); await near('obj_spagnot'); await key('z'); await read(2, /written/);
  await open({ 52: 1 }, 64); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.bell), null); assert.ok(await page.evaluate(() => !!__remake.scene.doggoRoom.note));
  await open({ 52: 1 }, 42); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.bell), null); assert.equal(await page.evaluate(() => __remake.scene.doggoRoom.note), null);
  // Bell chưa hoạt động trước42, và đổi phòng giữa cảnh phải dọn hình/mask/khóa/nhạc.
  await open(); await near('obj_dogringbell'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_tundra4', 'obj_markerB'); });
  assert.equal(await page.evaluate(() => __remake.scene.doggoRoom), null); await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  await open({}, 42); await place(20, 160, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra4'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [520, 160]);
  console.log('✓ Doggo phòng5: cửa/nhạc/va chạm, trigger thật/trồi/clip/khóa/hai lời tuyến, trận đủ70HP/Pet/Stick/kill/snapshot, hậu cảnh/41→42/lưu nạp, 7lần chuông, treats/note/kết thúc/dọn');
}
