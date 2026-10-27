import assert from 'node:assert/strict';
import { SnowdinEncounter } from '../remake/src/snowdin-encounter.mjs';

export async function testSnowdinEncounter(page) {
  // scr_steps và selector dùng nguồn thật, cố định random để kiểm tra các biên.
  const random = Math.random;
  try {
    Math.random = () => 0;
    const world = { flags: {}, plot: 37 }, e = new SnowdinEncounter(world);
    assert.equal(e.steps, 120); assert.equal(world.flags[200], 203);
    Math.random = () => .99999; assert.equal(e.threshold(120, 30), 150);
    world.flags[203] = 8; assert.equal(e.threshold(120, 30), 300);
    world.flags[203] = 15; assert.equal(e.threshold(120, 30), 1200);
    world.flags[203] = 16; assert.equal(e.threshold(140, 280), 20); assert.equal(e.empty, 1);
    e.empty = 2; assert.equal(e.threshold(140, 280), 1400);
    world.flags = {}; e.empty = 0;
    assert.equal(e.select(), 'snowdrake'); assert.equal(world.flags[70], 1);
    Math.random = () => 0; assert.equal(e.select(), 'icecap'); assert.equal(world.flags[70], 2);
    assert.equal(e.select(), 'snowdrake'); assert.equal(world.flags[70], 2);
    Math.random = () => .99999; assert.equal(e.select(), 'icecap'); assert.equal(world.flags[70], 2);
    world.plot = 42; assert.equal(e.select(), 'lesserDog'); assert.equal(world.flags[70], 4);
    Math.random = () => 7.99 / 15; assert.equal(e.select(), 'snowdrake');
    Math.random = () => 8 / 15; assert.equal(e.select(), 'icecap');
    world.flags = { 70: 2, 202: 20, 45: 4 }; world.plot = 37;
    assert.equal(e.select(), 'lesserDog'); assert.equal(world.flags[70], 4);
    world.flags = { 70: 2, 202: 20, 45: 4, 26: 1 };
    assert.equal(e.select(), 'icecap'); assert.equal(world.flags[70], 2);
    world.flags = { 57: 2 }; assert.equal(e.select(), 'chilldrake');
    e.empty = 2; assert.equal(e.select(), 'nobody');
    world.flags = {}; world.plot = 101; const end = new SnowdinEncounter(world); end.step();
    assert.equal(end.disabled, true); assert.equal(end.count, 0);
    world.flags[203] = 1; assert.equal(new SnowdinEncounter(world).disabled, false);
  } finally { Math.random = random; }

  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const open = async (flags = {}, plot = 37) => {
    await page.evaluate(async ({ flags, plot }) => {
      const w = __remake.game.scene.getScene('World'); w.flags = flags; w.plot = plot;
      w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.gold = w.kills = 0;
      w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = [3, 1];
      await w.openRoom('room_tundra3'); w.player.setPosition(100, 160); w.interactionCooldown = 0;
    }, { flags, plot });
  };
  const pages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const flee = async () => {
    await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z'); await pages();
    await page.waitForFunction(() => __remake.phase === 'running');
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const trigger = async (config) => {
    await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; });
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
    assert.equal(await page.evaluate(() => __remake.game.registry.get('battleConfig')), config);
  };
  await open();
  assert.ok(await page.evaluate(() => __remake.scene.snowdinEncounter.steps >= 120 && __remake.scene.snowdinEncounter.steps <= 150));
  await page.waitForTimeout(120); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), 0);
  // Chờ đủ bước đi thật, giữ menu/thoại và va chạm không làm tăng bộ đếm.
  await key('c'); await page.waitForFunction(() => __remake.phase === 'menu');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.world.snowdinEncounter.count), 0); await key('x');
  await page.evaluate(() => { __remake.scene.showDialogue(['* test']); });
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), 0); await key('z');
  await page.evaluate(() => { const w = __remake.scene; const c = w.colliders.find((c) => c.objectName === 'obj_sansbox'); w.player.setPosition((c.rectangle.left + c.rectangle.right) / 2 - 10, c.rectangle.bottom - 11); });
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(150); await page.keyboard.up('ArrowUp');
  const blocked = await page.evaluate(() => __remake.scene.snowdinEncounter.count);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(150); await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), blocked);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(80, 130); w.snowdinEncounter.count = 0; w.saveGame(); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinEncounter.count >= 60); await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.scene.snowdinEncounter.count >= 100); await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'encounter'); await page.keyboard.up('ArrowRight');
  const encounterPosition = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  assert.ok(encounterPosition[0] >= 70 && encounterPosition[0] <= 300); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.icon.texture.key), 'spr_exc:0');
  await page.keyboard.down('ArrowLeft'); await key('c'); await key('z'); await page.keyboard.up('ArrowLeft');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), encounterPosition);
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  assert.equal(await page.evaluate(() => __remake.scene.monster), 'snowdrake');
  const snapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('undertale-remake-temp-v1')));
  assert.equal(snapshot.room, 'room_tundra3'); assert.deepEqual([snapshot.x, snapshot.y], encounterPosition); assert.equal(snapshot.flags[70], 1);
  assert.deepEqual([10, 11, 12, 13].map((f) => snapshot.flags[f]), [0, 0, 0, 0]);
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.snowdinMusic.isPaused), true);
  await flee(); await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  // Cùng controller qua nhiều trận: lần hai Ice Cap, lần ba ở plot<42 vẫn quay Drake/Cap.
  await trigger('icecap'); await flee(); assert.equal(await page.evaluate(() => __remake.scene.flags[70]), 2);
  assert.ok(await page.evaluate(() => __remake.scene.snowdinEncounter.steps >= 140 && __remake.scene.snowdinEncounter.steps <= 420));
  await page.evaluate(() => { __remake.scene.plot = 42; }); await trigger('lesserDog'); await flee();
  assert.equal(await page.evaluate(() => __remake.scene.flags[70]), 4);
  await open({ 57: 2 }); await trigger('chilldrake'); await flee();
  // Retry phải chọn snapshot do encounter vừa ghi, kể cả khi SAVE chính thuộc mốc cũ.
  await open({ 70: 1, 203: 3 }, 40); await trigger('icecap');
  await page.evaluate(() => { __remake.scene.menuIndex = 1; }); await key('z'); await key('z'); await key('z'); await pages();
  await page.evaluate(() => { __remake.scene.command = 10; }); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => {
    const s = __remake.scene, wave = s.wave; s.hp = 1; s.invFrames = 0; s.previousScene.inventory = []; s.previousScene.gold = 999;
    wave.speed = 0; wave.y = s.soul.y * 2 + 20; wave.distance = 265;
    wave.teeth.forEach((tooth) => { tooth.phase = 0; tooth.x = s.soul.x * 2 + 8; });
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead'); await page.waitForFunction(() => __remake.scene.deathReady);
  const deathPages = await page.evaluate(() => __remake.scene.deathLines.length); for (let i = 0; i < deathPages; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.room, __remake.scene.hp, __remake.scene.plot, __remake.scene.flags[70], __remake.scene.flags[203], __remake.scene.inventory, __remake.scene.gold]), ['room_tundra3', 20, 40, 2, 3, [3, 1], 0]);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  // FIGHT qua encounter thật cập nhật dân số và lời SAVE, không đổi population Ruins.
  await open({ 202: 20, 45: 4, 203: 0 }); await trigger('snowdrake');
  await page.evaluate(() => { const s = __remake.scene; s.enemyHp = 1; s.menuIndex = 0; }); await key('z'); await key('z');
  await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[203], __remake.scene.flags[202], __remake.scene.flags[57]]), [1, 20, 2]);
  await page.evaluate(() => { const w = __remake.scene; w.boxRoad.save(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /15 left/);
  await key('z'); await page.waitForFunction(() => __remake.phase === 'saving'); await key('x');
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  // Hết quái: 21 bước đầu chỉ đặt222; 21 bước sau mới vào Nobody, rồi ngưỡng1400.
  await open({ 203: 16, 202: 20, 45: 4, 57: 2 });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.steps), 20);
  await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = 21; e.update(); });
  assert.deepEqual(await page.evaluate(() => [__remake.phase, __remake.scene.flags[222], __remake.scene.snowdinEncounter.empty, __remake.scene.snowdinEncounter.steps, __remake.scene.snowdinEncounter.timer ?? null]), ['running', 1, 2, 20, null]);
  await trigger('nobody'); assert.equal(await page.evaluate(() => __remake.scene.previousScene.snowdinEncounter.steps), 1400);
  assert.match(await page.evaluate(() => __remake.scene.message.text), /But nobody came/); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203]]), [0, 0, 0, 16]);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  // Cảnh báo skull khi murder>=8 và chưa bỏ tuyến; timer/icon dọn nếu đổi phòng.
  await open({ 26: 8, 70: 2 });
  await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; e.update(); });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.icon.texture.key), 'spr_exc_f:0');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra3A'); }); await page.waitForTimeout(750);
  assert.deepEqual(await page.evaluate(() => [__remake.phase, __remake.room, __remake.scene.snowdinEncounter]), ['running', 'room_tundra3A', null]);
  await open({ 26: 8, 27: 1, 70: 2 });
  await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; e.update(); });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.icon.texture.key), 'spr_exc:0');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra3A'); });
  // Sau kết thúc không có quái thì controller tắt; tuyến đã giết còn encounter như gốc.
  await open({}, 101); await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = 9999; e.update(); });
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  console.log('✓ Encounter Snowdin: bước thật/khóa/va chạm, cờ70/plot/tuyến/Chilldrake, ba nhóm thật, dân số/SAVE, Nobody hai mốc, skull/dọn timer và Game Over nạp snapshot tự động');
}
