import assert from 'node:assert/strict';
import { SnowdinEncounter } from '../remake/src/snowdin-encounter.mjs';

export async function testSnowdinJerryEncounter(page) {
  const random = Math.random;
  try {
    Math.random = () => 0; const world = { flags: { 70: 4 }, plot: 51, dataSource: { name: 'room_tundra_snowpuzz', room: { GameObjects: [{ ObjectName: 'obj_encounterer_jerry' }] } } };
    let e = new SnowdinEncounter(world); assert.equal(e.steps, 120); assert.equal(e.jerry, true); assert.equal(e.select(), 'snowdinGroup35');
    Math.random = () => 8.499 / 15; assert.equal(e.select(), 'snowdinGroup35'); Math.random = () => 8.5 / 15; assert.equal(e.select(), 'snowdinGroup36');
    for (const seen of [0, 1, 2]) { world.flags[70] = seen; assert.equal(e.select(), 'lesserDog'); assert.equal(world.flags[70], 4); }
    Math.random = () => 0; world.flags[64] = -1; assert.equal(new SnowdinEncounter(world).steps, 220);
    world.flags[203] = 8; assert.equal(new SnowdinEncounter(world).steps, 440); Math.random = () => .99999; assert.equal(new SnowdinEncounter(world).steps, 500);
    e = new SnowdinEncounter(world); assert.equal(e.threshold(840, 680), 3040); world.flags[203] = 15; assert.equal(e.threshold(840, 680), 12160);
    world.flags[203] = 16; assert.equal(e.threshold(840, 680), 20); assert.equal(e.empty, 1); assert.equal(e.select(), 'nobody'); e.empty = 2; assert.equal(e.threshold(840, 680), 5900);
    world.flags = {}; world.plot = 110; e = new SnowdinEncounter(world); e.step(); assert.equal(e.disabled, true); assert.equal(e.count, 0);
  } finally { Math.random = random; }
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 51) => page.evaluate(async ({ flags, plot }) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = plot; w.gold = 100; w.kills = w.xp = 0; w.lv = 1; w.hp = w.maxHp = 20; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = [16]; await w.openRoom('room_tundra_snowpuzz'); w.player.setPosition(90, 140); }, { flags, plot });
  const flee = async () => { await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z'); while (await page.evaluate(() => __remake.phase === 'battle')) await key('z'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const trigger = async (roll, expected) => {
    await page.evaluate((roll) => { const w = __remake.scene; window.jerryRandom = Math.random; Math.random = () => roll; w.snowdinEncounter.count = w.snowdinEncounter.steps - 2; }, roll);
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'encounter'); await page.keyboard.up('ArrowRight');
    await page.evaluate(() => { Math.random = jerryRandom; });
    const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'encounter');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
    assert.equal(await page.evaluate(() => __remake.game.registry.get('battleConfig')), expected);
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[200]), 203);
  };
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 70: 4 }; w.plot = 51; await w.openRoom('room_tundra_spaghetti'); w.player.setPosition(280, 120); window.jerrySong = w.snowdinMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_snowpuzz');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinMusic === jerrySong, __remake.scene.snowdinEncounter.jerry]), [20, 120, true, true]);
  await page.evaluate(() => { __remake.scene.player.setPosition(20, 120); }); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra_spaghetti'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [280, 120]);
  for (const [roll, flags, expected] of [[0, { 70: 4 }, 'snowdinGroup35'], [.99999, { 70: 4 }, 'snowdinGroup36'], [.99999, { 70: 4, 57: 2 }, 'snowdinGroup36'], [.99999, { 70: 2 }, 'lesserDog']]) {
    await open(flags); await trigger(roll, expected);
    if (expected === 'snowdinGroup36') assert.equal(await page.evaluate(() => __remake.scene.enemies[2].type), flags[57] ? 'chilldrake' : 'snowdrake');
    await flee(); assert.equal(await page.evaluate(() => __remake.scene.flags[70]), flags[70] < 3 ? 4 : flags[70]);
    const steps = await page.evaluate(() => __remake.scene.snowdinEncounter.steps); assert.equal(steps, roll ? 1520 : 840);
  }
  // Chặn tường/đứng yên/thoại không tăng đếm, và forcedright cộng200ngưỡng/reset đếm.
  await open({ 70: 4 }); const count = await page.evaluate(() => __remake.scene.snowdinEncounter.count); await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), count);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(175, 400); w.showDialogue(['* test']); }); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(150); await page.keyboard.up('ArrowRight'); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.count), count); await key('z');
  await open({ 70: 4 }, 49); await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(350, 405); window.pairThreshold = w.snowdinEncounter.steps; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.dogPairRoom.stage === 'forcedWalk'); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinEncounter.steps - pairThreshold, __remake.scene.snowdinEncounter.count]), [200, 0]);
  await page.evaluate(async () => __remake.scene.openRoom('room_tundra_spaghetti'));
  // Dân số hết: lần đầu chỉ đặt222, lần sau vào Nobody; không thêm quái hoặc thưởng.
  await open({ 70: 4, 203: 16 }); await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; });
  await page.waitForFunction(() => __remake.scene.flags[222] === 1); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await trigger(0, 'nobody'); await key('z'); await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.kills, __remake.scene.flags[203]]), [100, 0, 16]);
  // Giết Ice Cap trong encounter thật rồi trốn vẫn trả17G/17XP và tăng203 một lần.
  await open({ 70: 4 }); await page.evaluate(() => { const w = __remake.scene; w.lv = 20; w.hp = w.maxHp = 99; w.weapon = 14; w.weaponStrength = 5; }); await trigger(0, 'snowdinGroup35');
  await key('z'); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z'); for (let i = 0; i < 4; i++) await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'menu'); await flee();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[203]]), [117, 17, 1, 1]);
  // Snapshot do encounter tạo dùng được sau Game Over, không giữ lại trạng thái trận cũ.
  await open({ 70: 4 }); await trigger(.99999, 'snowdinGroup36'); await key('z'); await key('z'); await key('z'); await key('z');
  await page.waitForFunction(() => __remake.scene.mode === 'speech'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.hp = 1; s.invFrames = 0; s.hurt(999); s.time.timeScale = 30; });
  await page.waitForFunction(() => __remake.scene.mode === 'dead' && __remake.scene.deathReady);
  for (let i = 0; i < 8 && await page.evaluate(() => __remake.phase === 'battle'); i++) await key('z'); await page.waitForFunction(() => __remake.phase === 'running'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.gold, __remake.scene.snowdinEncounter.count, __remake.scene.snowdinMusic.isPlaying]), [51, 100, 0, true]);
  // Rời phòng lúc hiện dấu ! phải dọn timer/ảnh và không mở trận ở phòng cũ.
  await open({ 70: 4 }); await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps + 1; }); await page.waitForFunction(() => __remake.phase === 'encounter');
  await page.evaluate(async () => __remake.scene.openRoom('room_tundra_spaghetti')); await page.waitForTimeout(900); assert.equal(await page.evaluate(() => __remake.room), 'room_tundra_spaghetti'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  console.log('✓ Encounter Jerry/cửa spaghetti↔snowpuzz: round15/biên35-36/LesserDog70, bước thật/khóa/nhạc/120-220/840-1520/dân số/Nobody2mốc, forcedright+200/reset, kill-Flee/203/GameOver/snapshot/dọn timer');
}
