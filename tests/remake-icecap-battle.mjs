import assert from 'node:assert/strict';

export async function testIceCapBattle(page) {
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const open = async (monster = 'icecap') => {
    await page.evaluate(async (monster) => {
      const w = __remake.game.scene.getScene('World'); w.flags = { 202: 20, 203: 2 }; w.hp = w.maxHp = 20; w.lv = 1;
      w.inventory = [1]; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.xp = w.gold = w.kills = 0; w.plot = 37;
      await w.openRoom('room_tundra3'); w.saveGame(true); __remake.startBattle(monster);
    }, monster);
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  };
  const pages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const select = async (index) => {
    await page.waitForFunction(() => __remake.scene.mode === 'menu'); await page.evaluate((index) => { __remake.scene.menuIndex = index; }, index); await key('z');
  };
  const act = async (index) => {
    await select(1); await key('z');
    assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), await page.evaluate(() => __remake.scene.monster === 'ice' ? ['Check', 'Compliment'] : ['Check', 'Ignore', 'Compliment', 'Steal']));
    for (let i = 0; i < index; i++) await key('ArrowDown'); await key('z');
  };
  const wave = async (command) => {
    await page.waitForFunction(() => __remake.scene.mode === 'speech'); await page.evaluate((command) => { __remake.scene.command = command; }, command); await key('z');
    await page.waitForFunction(() => ['soul', 'menu'].includes(__remake.scene.mode));
  };
  const finishWave = () => page.evaluate(() => {
    const s = __remake.scene; s.invFrames = 1000;
    for (let i = 0; i < 160 && s.mode === 'soul'; i++) if (s.wave.step()) s.finishSoul(); s.invFrames = 0;
  });
  const flee = async () => { await select(3); await key('ArrowDown'); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running'); };
  await open(); assert.deepEqual(await page.evaluate(() => [__remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.config.xp]), [48, 0, 17]);
  await act(0); assert.match(await page.evaluate(() => __remake.scene.message.text), /ICE CAP - ATK 11 DEF 4/); await pages(); await wave(10);
  assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'teeth');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.wave.duration, __remake.scene.wave.teeth.length]), [100, 32]);
  const teeth = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave; s.hp = 20; s.invFrames = 0;
    w.speed = 0; w.y = s.soul.y * 2 + 20; w.distance = 265;
    w.teeth.forEach((t) => { t.phase = 0; t.x = s.soul.x * 2 + 8; });
    w.step(); const hp = s.hp, inv = s.invFrames; w.step(); return [hp, inv, s.hp];
  });
  assert.deepEqual(teeth, [16, 60, 16]); await key('z'); await key('x'); assert.equal(await page.evaluate(() => __remake.scene.mode), 'soul'); await finishWave();
  await act(2); assert.match(await page.evaluate(() => __remake.scene.message.text), /great hat/); await pages(); await wave(90);
  assert.equal(await page.evaluate(() => __remake.scene.waveKind), 'hats');
  const hats = await page.evaluate(() => {
    const s = __remake.scene, w = s.wave; w.next = 999;
    for (const b of w.bullets) b.image.destroy(); w.bullets = [];
    s.hp = 20; s.invFrames = 1000;
    const hat = w.hat(s.soul.x * 2 - 19); const startY = hat.y;
    for (let i = 0; i < 20; i++) w.step(); const stopped = [hat.y, hat.vy];
    for (let i = 0; i < 20; i++) w.step(); const shards = w.bullets.filter((b) => !b.hat).length;
    for (let i = 0; i < 20; i++) w.step(); const falling = hat.vy;
    const shard = w.bullets.find((b) => !b.hat); s.invFrames = 0;
    shard.x = s.soul.x * 2 - 17; shard.y = s.soul.y * 2 - 10; shard.vy = 0; shard.image.setTexture('spr_iciclebullet:0');
    const touching = w.touchesHeart(shard); w.step(); const hp = s.hp;
    const probe = w.icicle(0, 0);
    let downOnly = false, upOnly = false;
    for (let dx = -20; dx <= 0 && !(downOnly && upOnly); dx += 2) for (let dy = -40; dy <= 15; dy++) {
      probe.x = s.soul.x * 2 + dx; probe.y = s.soul.y * 2 + dy;
      probe.image.setTexture('spr_iciclebullet:0'); const down = w.touchesHeart(probe);
      probe.image.setTexture('spr_iciclebullet:1'); const up = w.touchesHeart(probe);
      downOnly ||= down && !up; upOnly ||= up && !down;
    }
    return { startY, stopped, shards, falling, touching, hp, duration: w.duration, rate: w.rate, downOnly, upOnly };
  });
  assert.equal(hats.duration, 150); assert.equal(hats.rate, 33); assert.equal(hats.stopped[1], 0); assert.ok(hats.stopped[0] < hats.startY);
  assert.equal(hats.shards, 3); assert.equal(hats.falling, 4); assert.equal(hats.touching, true); assert.equal(hats.hp, 17); await finishWave();
  assert.equal(hats.downOnly, true); assert.equal(hats.upOnly, true, 'Hai mask đầu lên/xuống phải tạo vùng trúng khác nhau trên PNG thật.');
  await act(3); assert.match(await page.evaluate(() => __remake.scene.pages[1]), /not weakened/); await pages(); await wave(10); await finishWave();
  await act(1); assert.match(await page.evaluate(() => __remake.scene.pages[0]), /tear your/); await pages();
  assert.equal(await page.evaluate(() => __remake.scene.ignored), 1); assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), 10); await wave(10); await finishWave();
  await act(1); assert.match(await page.evaluate(() => __remake.scene.pages[0]), /continue not/); await pages();
  assert.equal(await page.evaluate(() => __remake.scene.ignored), 2); assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), 300); await wave(10); await finishWave();
  await select(3); assert.equal(await page.evaluate(() => __remake.scene.menu.font), 'fnt_maintext:yellow'); await key('z'); await pages();
  await page.waitForFunction(() => __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills]), [13, 0, 0]);
  // Lấy mũ sau hai Ignore: tiền thưởng 13G của Ice Cap đã cộng trước khi chuyển thành Ice.
  await open();
  for (let i = 0; i < 2; i++) { await act(1); await pages(); await wave(10); await finishWave(); }
  await act(3); assert.match(await page.evaluate(() => __remake.scene.pages[1]), /succeeded/);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.monster, __remake.scene.config.name, __remake.scene.enemyHp, __remake.scene.config.def, __remake.scene.config.xp, __remake.scene.transformedGold]), ['ice', 'Ice', 48, -100, 25, 13]);
  await pages(); await wave(10); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(0); assert.match(await page.evaluate(() => __remake.scene.message.text), /ICE - ATK 1 DEF 0/); await pages(); await wave(10); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(1); assert.match(await page.evaluate(() => __remake.scene.message.text), /still looks fine/); await pages();
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[137]), 1); await wave(90); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await select(3); await key('z'); await pages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.xp, __remake.scene.kills]), [35, 0, 0]);
  // Lấy khi HP dưới 20 cũng thành Ice đầy HP, không nhận bonus Ignore.
  await open(); await page.evaluate(() => { __remake.scene.enemyHp = 19; }); await act(3);
  assert.equal(await page.evaluate(() => __remake.scene.enemyHp), 48); assert.equal(await page.evaluate(() => __remake.scene.transformedGold), 0);
  await pages(); await wave(10); await page.waitForFunction(() => __remake.scene.mode === 'menu'); await flee();
  // Giết trước/sau chuyển dạng dùng EXP/GOLD/dân số khác nhau.
  for (const monster of ['icecap', 'ice']) {
    await open(monster); await page.evaluate(() => { __remake.scene.enemyHp = 1; }); await select(0); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'fight'); await page.evaluate(() => { __remake.scene.attackX = 156; }); await key('z'); await pages();
    await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.xp, __remake.scene.gold, __remake.scene.kills, __remake.scene.flags[203], __remake.scene.flags[202]]), [monster === 'ice' ? 25 : 17, monster === 'ice' ? 40 : 17, 1, 3, 20]);
  }
  await open(); await select(2); await key('z'); await pages(); await wave(10); await finishWave(); await flee();
  assert.equal(await page.evaluate(() => __remake.scene.inventory.length), 0);
  await open(); await act(0); await pages(); await wave(10);
  await page.evaluate(() => {
    const s = __remake.scene, w = s.wave; s.hp = 1; s.invFrames = 0; s.previousScene.inventory = []; s.previousScene.gold = 999;
    w.speed = 0; w.y = s.soul.y * 2 + 20; w.distance = 265;
    w.teeth.forEach((t) => { t.phase = 0; t.x = s.soul.x * 2 + 8; });
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead'); await page.waitForFunction(() => __remake.scene.deathReady);
  const deathPages = await page.evaluate(() => __remake.scene.deathLines.length); for (let i = 0; i < deathPages; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[203], __remake.room]), [20, 0, [1], 2, 'room_tundra3']);
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying);
  console.log('✓ Ice Cap/Ice: Check/Ignore/Compliment/Steal/chuyển HP/DEF/menu, răng băng/mũ/alarm/tinh thể/mask/HP/bất tử, thưởng 13/35G/EXP/dân số và ITEM/FIGHT/Spare/Flee');
}
