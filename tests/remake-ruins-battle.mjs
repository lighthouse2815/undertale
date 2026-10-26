import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testRuinsBattle(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const open = async (monster) => {
    await page.evaluate(async (monster) => {
      const world = __remake.scene;
      world.plot = 9.2; world.flags = {}; world.hp = 20; world.maxHp = 20; world.lv = 1; world.xp = 0; world.gold = 0; world.kills = 0;
      world.inventory = []; world.armor = 4; world.armorDefense = 0; world.weapon = 3; world.weaponStrength = 0;
      await world.openRoom('room_area1'); __remake.startBattle(monster);
    }, monster);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.music?.isPlaying);
  };
  const close = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'pages');
    const count = await page.evaluate(() => __remake.scene.pages.length);
    for (let i = 0; i < count; i++) await key('z');
  };
  const selectMenu = async (index) => {
    const current = await page.evaluate(() => __remake.scene.menuIndex);
    for (let i = current; i < index; i++) await key('ArrowRight');
    for (let i = current; i > index; i--) await key('ArrowLeft');
    await key('z');
  };
  const act = async (index) => {
    await selectMenu(1); await page.waitForFunction(() => __remake.scene.kind === 'actTarget'); await key('z');
    await page.waitForFunction(() => __remake.scene.kind === 'act');
    for (let i = 0; i < index; i++) await key('ArrowDown'); await key('z'); await close();
  };
  const wave = async (command) => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech');
    await page.evaluate((command) => { __remake.scene.command = command; }, command);
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  };
  const flee = async () => {
    await selectMenu(3); await key('ArrowDown'); await key('z'); await close();
    await page.waitForFunction(() => __remake.phase === 'running');
  };
  await open('whimsun');
  assert.deepEqual(await page.evaluate(() => ({ hp: __remake.scene.enemyMaxHp, def: __remake.scene.config.def, name: __remake.scene.config.name })), { hp: 10, def: 0, name: 'Whimsun' });
  await key('x'); assert.equal(await page.evaluate(() => __remake.phase), 'battle', 'X ở menu không được thoát khỏi trận.');
  await selectMenu(3); assert.equal(await page.evaluate(() => __remake.scene.menu.font), 'fnt_maintext:yellow');
  await key('z'); await close(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ gold: __remake.scene.gold, xp: __remake.scene.xp, kills: __remake.scene.kills, spare: __remake.scene.flags[23] })), { gold: 0, xp: 0, kills: 0, spare: 1 });
  await open('whimsun'); await act(1); await close(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.scene.flags[131]), 1);
  await open('froggit');
  assert.equal(await page.evaluate(() => __remake.scene.config.def), 4);
  await act(1); await wave(90);
  assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'flies');
  assert.ok(await page.evaluate(() => !/[\\/^]$/.test(__remake.scene.text.check[0])));
  const start = await page.evaluate(() => ({ x: __remake.scene.soul.x, y: __remake.scene.soul.y }));
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(180); await page.keyboard.up('ArrowLeft');
  assert.ok(await page.evaluate((x) => __remake.scene.soul.x < x, start.x));
  await key('z'); await key('x');
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'soul', 'Z/X không rút ngắn đợt tấn công.');
  await page.screenshot({ path: join(root, 'test-results/remake-froggit-flies.png') });
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  assert.equal(await page.evaluate(() => __remake.scene.turn), 1);
  await selectMenu(3); assert.equal(await page.evaluate(() => __remake.scene.menu.font), 'fnt_maintext:yellow'); await key('z'); await close();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ gold: __remake.scene.gold, xp: __remake.scene.xp, flag: __remake.scene.flags[130] })), { gold: 2, xp: 0, flag: 1 });
  for (const [monster, command, kind] of [['froggit', 10, 'leap'], ['whimsun', 10, 'circle'], ['whimsun', 80, 'columns']]) {
    await open(monster); await act(0); await wave(command);
    assert.equal(await page.evaluate(() => __remake.scene.waveKind), kind);
    if (kind === 'circle') assert.equal(await page.evaluate(() => __remake.scene.wave.bullets.length), 10);
    if (kind === 'leap') {
      assert.equal(await page.evaluate(() => __remake.scene.wave.bullets[0].vx), 0);
      await page.waitForFunction(() => __remake.scene.mode === 'soul' && __remake.scene.wave.bullets[0]?.vx !== 0);
      assert.ok(await page.evaluate(() => __remake.scene.wave.bullets[0].vy < 0));
    }
    await page.screenshot({ path: join(root, `test-results/remake-wave-${kind}.png`) });
    if (kind === 'columns') {
      await page.waitForFunction(() => __remake.scene.wave.bullets.length > 0);
      await page.evaluate(() => {
        const scene = __remake.scene, bullet = scene.wave.bullets[0];
        scene.hp = 20; scene.invFrames = 0;
        bullet.x = scene.soul.x * 2 - 4; bullet.y = scene.soul.y * 2 - 4; bullet.vx = 0; bullet.vy = 0;
      });
      await page.waitForFunction(() => __remake.scene.hp < 20);
      assert.equal(await page.evaluate(() => __remake.scene.hp), 18);
      const hp = await page.evaluate(() => __remake.scene.hp);
      await page.evaluate(() => { __remake.scene.hurt(4); });
      assert.equal(await page.evaluate(() => __remake.scene.hp), hp, 'Thời gian bất tử chặn trừ HP liên tiếp.');
    }
    await page.waitForFunction(() => __remake.scene.mode === 'menu'); await flee();
    assert.equal(await page.evaluate(() => __remake.scene.flags[24]), 1);
  }
  await open('whimsun'); await act(2); await wave(80); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await selectMenu(3); await key('z'); await close(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.scene.gold), 2, 'Terrorize rồi tha Whimsun có thưởng riêng.');
  await open('whimsun');
  await page.evaluate(() => { __remake.scene.previousScene.xp = 8; });
  await selectMenu(0); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.waitForFunction(() => __remake.scene.attackX > 151 && __remake.scene.attackX < 161); await key('z'); await close(); await close();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ xp: __remake.scene.xp, lv: __remake.scene.lv, max: __remake.scene.maxHp, gold: __remake.scene.gold, kills: __remake.scene.kills, population: __remake.scene.flags[202] })),
    { xp: 10, lv: 2, max: 24, gold: 2, kills: 1, population: 1 });
  // Bộ đếm tăng một lần mỗi frame có di chuyển, không tính lúc đứng yên/đọc/menu.
  await page.evaluate(async () => { const world = __remake.scene; world.plot = 9.2; world.flags = {}; world.kills = 0; await world.openRoom('room_ruins7', 'obj_markerA'); world.player.setPosition(150, 180); });
  assert.ok(await page.evaluate(() => __remake.scene.ruinsEncounter.steps >= 80 && __remake.scene.ruinsEncounter.steps <= 120));
  await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.ruinsEncounter.count), 0);
  await page.evaluate(() => { __remake.scene.ruinsEncounter.steps = 3; });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'encounter'); await page.keyboard.up('ArrowDown');
  const frozen = await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(100); await page.keyboard.up('ArrowLeft');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), frozen);
  await page.waitForFunction(() => __remake.phase === 'battle'); await flee();
  assert.ok(await page.evaluate(() => __remake.scene.ruinsEncounter.steps >= 190 && __remake.scene.ruinsEncounter.steps <= 270));
  // HP 0 chạy cảnh trái tim vỡ và nạp snapshot, không trả về phòng với HP 0.
  await page.evaluate(async () => {
    const world = __remake.scene; world.flags = {}; world.hp = 19; world.maxHp = 20; world.lv = 1; world.xp = 0; world.gold = 7; world.kills = 0; world.inventory = [1];
    await world.openRoom('room_ruins7', 'obj_markerA'); world.player.setPosition(150, 180); world.saveGame(true);
    __remake.startBattle('whimsun');
  });
  await page.waitForFunction(() => __remake.phase === 'battle'); await act(0); await wave(10);
  await page.evaluate(() => {
    const scene = __remake.scene; scene.hp = 1; scene.invFrames = 0;
    const bullet = scene.wave.bullets[0]; bullet.x = scene.soul.x * 2 - 4; bullet.y = scene.soul.y * 2 - 4;
    scene.previousScene.inventory = []; scene.previousScene.gold = 999;
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead');
  await page.waitForFunction(() => __remake.scene.deathReady);
  await page.screenshot({ path: join(root, 'test-results/remake-gameover.png') });
  const pages = await page.evaluate(() => __remake.scene.deathLines.length);
  for (let i = 0; i < pages; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ hp: __remake.scene.hp, gold: __remake.scene.gold, inventory: __remake.scene.inventory, room: __remake.room })),
    { hp: 20, gold: 7, inventory: [1], room: 'room_ruins7' });
  await page.evaluate(async () => { const world = __remake.scene; world.flags[202] = 20; await world.openRoom('room_ruins7'); world.player.setPosition(150, 180); world.ruinsEncounter.count = 21; });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.monster === 'nobody');
  await close(); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Froggit/Whimsun thường, bốn đợt gốc, mask/HP/bất tử, ACT/Spare/Flee/ITEM, XP/GOLD/LV, bước gặp quái, hết quái và Game Over nạp snapshot');
}
