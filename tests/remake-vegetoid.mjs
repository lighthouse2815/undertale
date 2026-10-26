import assert from 'node:assert/strict';

export async function testVegetoid(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const open = async () => {
    await page.evaluate(async () => {
      const world = __remake.scene;
      world.flags = {}; world.hp = 20; world.maxHp = 20; world.lv = 1; world.xp = 0; world.gold = 0; world.kills = 0;
      world.armor = 4; world.armorDefense = 0; world.weapon = 3; world.weaponStrength = 0; world.inventory = [];
      await world.openRoom('room_area1'); __remake.startBattle('vegetoid');
    });
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.music?.isPlaying);
  };
  const close = async () => {
    await page.waitForFunction(() => __remake.scene.mode === 'pages');
    const count = await page.evaluate(() => __remake.scene.pages.length - __remake.scene.pageIndex);
    for (let i = 0; i < count; i++) await key('z');
  };
  const menu = async (index) => {
    await page.waitForFunction(() => __remake.scene.mode === 'menu');
    const current = await page.evaluate(() => __remake.scene.menuIndex);
    for (let i = current; i !== index; i += Math.sign(index - current)) await key(index > current ? 'ArrowRight' : 'ArrowLeft');
    await key('z');
  };
  const act = async (index) => {
    await menu(1); await key('z');
    assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Check', 'Devour', 'Talk', 'Dinner']);
    for (let i = 0; i < index; i++) await key('ArrowDown'); await key('z');
  };
  const wave = async (command, kind) => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech');
    await page.evaluate((command) => { __remake.scene.command = command; }, command);
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
    assert.equal(await page.evaluate(() => __remake.scene.waveKind), kind);
  };
  const flee = async () => {
    await menu(3); await key('ArrowDown'); await key('z'); await close(); await page.waitForFunction(() => __remake.phase === 'running');
  };
  await open();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.config.xp]), [72, 0, 6]);
  await act(0); assert.match(await page.evaluate(() => __remake.scene.message.text), /Not monitored by the USDA/); await close(); await wave(10, 'carrots');
  await page.waitForFunction(() => __remake.scene.wave.bullets.length > 0);
  await page.evaluate(() => {
    const scene = __remake.scene, bullet = scene.wave.bullets[0];
    scene.hp = 20; scene.invFrames = 0;
    bullet.x = scene.soul.x * 2 - 4; bullet.y = scene.soul.y * 2 - 8; bullet.vy = 0;
  });
  await page.waitForFunction(() => __remake.scene.hp < 20);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 17);
  await key('z'); await key('x'); assert.equal(await page.evaluate(() => __remake.scene.mode), 'soul');
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(1); assert.match(await page.evaluate(() => __remake.scene.message.text), /wasn't weakened/); await close(); await wave(90, 'vegetables');
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(2); assert.match(await page.evaluate(() => __remake.scene.speechText.text), /Plants/); await wave(90, 'vegetables');
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await flee();

  for (const [command, kind] of [[10, 'carrots'], [90, 'vegetables']]) {
    await open(); await act(3); assert.match(await page.evaluate(() => __remake.scene.message.text), /healthy/);
    assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), 7, 'Dinner phải chờ chạm rau xanh mới cho tha.');
    await close(); await wave(command, kind);
    await page.waitForFunction(() => __remake.scene.wave.bullets.some((bullet) => bullet.green));
    await page.evaluate(() => {
      const scene = __remake.scene, bullet = scene.wave.bullets.find((bullet) => bullet.green);
      scene.hp = 10; scene.invFrames = 30;
      bullet.x = scene.soul.x * 2 - 4; bullet.y = scene.soul.y * 2 - 8; bullet.vx = 0; bullet.vy = 0;
    });
    await page.waitForFunction(() => __remake.scene.ate === true);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.mercyModifier]), [11, 90]);
    await page.waitForFunction(() => __remake.scene.mode === 'menu');
    await menu(3); await key('z'); await close(); await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills, __remake.scene.flags[134]]), [4, 0, 0, 1]);
  }
  await open();
  await page.evaluate(() => { __remake.scene.enemyHp = 24; __remake.scene.hp = 10; });
  await act(1); assert.match(await page.evaluate(() => __remake.scene.message.text), /recovered 5 HP/);
  await close(); await close(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.xp, __remake.scene.gold, __remake.scene.kills]), [15, 0, 0, 0]);
  await open(); await page.evaluate(() => { __remake.scene.enemyHp = 1; });
  await menu(0); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.waitForFunction(() => __remake.scene.attackX > 150 && __remake.scene.attackX < 164); await key('z'); await close(); await close();
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[202]]), [6, 1, 1, 1]);
  console.log('✓ Vegetoid đơn: Check/Talk/Devour/Dinner, hai generator, sát thương/rau xanh khi bất tử, Spare/Flee, hồi HP và thưởng XP/GOLD/population');
}
