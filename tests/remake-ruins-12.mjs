import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testRuins12(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(70); };
  const closePages = async () => {
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
    assert.deepEqual(await page.evaluate(() => __remake.scene.submenu), ['Check', 'Threat', 'Cheer', 'Flirt']);
    for (let i = 0; i < index; i++) await key('ArrowDown');
    await key('z');
  };
  const wave = async (command, kind) => {
    await page.waitForFunction(() => __remake.scene.mode === 'napSpeech');
    await page.evaluate((command) => { __remake.scene.command = command; }, command);
    await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'soul');
    assert.equal(await page.evaluate(() => __remake.scene.waveKind), kind);
  };
  const sleep = async (yes) => {
    await page.evaluate(() => {
      const world = __remake.scene;
      world.player.setPosition(110, 120); world.player.facing = 'r'; world.interactionCooldown = 0;
    });
    await key('z');
    await page.waitForFunction(() => !!__remake.scene.dialogue);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 3);
    for (let i = 0; i < 3; i++) await key('z');
    await page.waitForFunction(() => !!__remake.scene.dialogue?.choice);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[0]), '* Move it with force?');
    await page.waitForTimeout(120);
    if (!yes) await key('ArrowRight');
    await key('z');
    if (yes) await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.music?.isPlaying);
  };
  const flee = async () => {
    await menu(3); await key('ArrowDown'); await key('z'); await closePages();
    await page.waitForFunction(() => __remake.phase === 'running');
  };
  const reset = async () => {
    await page.evaluate(async () => {
      const world = __remake.scene;
      world.plot = 9.2; world.flags = { 33: 1 }; world.inventory = [];
      world.hp = 20; world.maxHp = 20; world.lv = 1; world.xp = 0; world.gold = 0; world.kills = 0;
      world.armor = 4; world.armorDefense = 0; world.weapon = 3; world.weaponStrength = 0;
      await world.openRoom('room_ruins12', 'obj_markerB');
    });
  };

  await reset();
  await page.evaluate(async () => { await __remake.scene.openRoom('room_ruins11', 'obj_markerB'); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition');
  await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins12');
  await sleep(false);
  assert.deepEqual(await page.evaluate(() => ({ plot: __remake.scene.plot, stage: __remake.scene.ruins12.stage, flag: __remake.scene.flags[36] ?? 0 })),
    { plot: 9.2, stage: 'sleeping', flag: 0 }, 'No không được bỏ qua trận hoặc tăng plot.');
  await sleep(true);
  assert.deepEqual(await page.evaluate(() => ({ hp: __remake.scene.enemyHp, mood: __remake.scene.mercyModifier, music: __remake.scene.music.key, texture: __remake.scene.enemy.texture.key.split(':')[0] })),
    { hp: 88, mood: -400, music: 'mus_ghostbattle', texture: 'spr_napstabattle' });
  await key('x'); assert.equal(await page.evaluate(() => __remake.phase), 'battle');
  await flee();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 9.2);
  assert.equal(await page.evaluate(() => __remake.scene.flags[24]), 1);
  await sleep(true);
  // Spare khi chưa được an ủi vẫn phải né đạn, không bỏ qua boss.
  await menu(3); await key('z'); await wave(10, 'tears');
  await page.waitForFunction(() => __remake.scene.wave.bullets.some((bullet) => bullet.y > 260 && bullet.y < 360));
  await page.evaluate(() => {
    const scene = __remake.scene, bullet = scene.wave.bullets.find((bullet) => bullet.y > 260 && bullet.y < 360);
    bullet.x = scene.soul.x * 2; bullet.y = scene.soul.y * 2; bullet.vx = 0; bullet.vy = 0;
    bullet.rotation = 0; bullet.gravity = 0; bullet.friction = 0; bullet.scale = 1; scene.invFrames = 0;
  });
  await page.waitForFunction(() => __remake.scene.hp < 20);
  const hp = await page.evaluate(() => __remake.scene.hp);
  await page.evaluate(() => __remake.scene.hurt(5));
  assert.equal(await page.evaluate(() => __remake.scene.hp), hp, 'Bất tử chặn trừ HP liên tiếp.');
  await key('z'); await key('x');
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'soul');
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(2); assert.match(await page.evaluate(() => __remake.scene.message.text), /patient smile/);
  await closePages(); await wave(10, 'sad');
  assert.equal(await page.evaluate(() => __remake.scene.arena.width), 125);
  assert.equal(await page.evaluate(() => __remake.scene.wave.bullets[0].sprite), 'spr_bulletNapstaSad');
  const beforeSad = await page.evaluate(() => __remake.scene.hp);
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  assert.equal(await page.evaluate(() => __remake.scene.hp), beforeSad, 'Dòng chữ buồn chỉ rung, không gây sát thương.');
  await act(2); assert.match(await page.evaluate(() => __remake.scene.message.text), /little joke/);
  await closePages(); await wave(90, 'stream');
  await page.waitForFunction(() => __remake.scene.wave.bullets.some((bullet) => bullet.climbing));
  await page.waitForFunction(() => __remake.scene.wave.bullets.some((bullet) => bullet.dropdown));
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(2); await closePages(); await wave(10, 'hat');
  await page.waitForFunction(() => __remake.scene.speechText?.active && __remake.scene.speechText.text.includes('dapper'));
  if (root) await page.screenshot({ path: join(root, 'test-results/remake-napstablook-hat.png') });
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), -50);
  assert.match(await page.evaluate(() => __remake.scene.message.text), /eagerly awaits/);
  await act(2);
  await key('z');
  await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 10.4);
  assert.equal(await page.evaluate(() => __remake.scene.flags[36]), 1);
  for (let i = 0; i < 5; i++) await key('z');
  await page.waitForFunction(() => __remake.scene.plot === 11);
  assert.deepEqual(await page.evaluate(() => ({ xp: __remake.scene.xp, gold: __remake.scene.gold, kills: __remake.scene.kills, stage: __remake.scene.ruins12.stage })),
    { xp: 0, gold: 0, kills: 0, stage: 'gone' });
  await page.evaluate(async () => { const world = __remake.scene; world.saveGame(); await world.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.ruins12.nap.image.active), false);

  // Dùng ITEM sau màn mũ làm mercymod -1200; hồi HP/tiêu hao đồ qua hệ thống dùng chung.
  await reset();
  await page.evaluate(() => { __remake.scene.inventory = [1]; });
  await sleep(true);
  await page.evaluate(() => { const scene = __remake.scene; scene.mercyModifier = -50; scene.hat.setVisible(true); scene.hp = 5; });
  await menu(2); await key('z'); await closePages();
  assert.equal(await page.evaluate(() => __remake.scene.mercyModifier), -1200);
  assert.equal(await page.evaluate(() => __remake.scene.hat.visible), false);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 15);
  assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), []);
  await wave(10, 'tears'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(1); assert.match(await page.evaluate(() => __remake.scene.message.text), /cruel look/);
  await closePages(); await wave(10, 'sad'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await act(3);
  assert.match(await page.evaluate(() => __remake.scene.speechText.text), /weigh/);
  await page.evaluate(() => { __remake.scene.hp = 20; });
  await wave(90, 'stream'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await page.evaluate(() => { __remake.scene.mercyModifier = -50; });
  await act(3); await key('z');
  await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  for (let i = 0; i < 5; i++) await key('z');
  await page.waitForFunction(() => __remake.scene.plot === 11);

  // Cạn HP không hạ ma, không nhận EXP/GOLD, không tính kill hay giảm dân số Ruins.
  await reset(); await sleep(true);
  await page.evaluate(() => { const scene = __remake.scene; scene.previousScene.xp = 7; scene.previousScene.gold = 13; scene.enemyHp = 1; });
  await menu(0); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.waitForFunction(() => __remake.scene.attackX > 150 && __remake.scene.attackX < 163); await key('z');
  await closePages();
  assert.match(await page.evaluate(() => __remake.scene.message.text), /cant\nkill ghosts/);
  await closePages();
  await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /lost 1 experience point/);
  await closePages(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ plot: __remake.scene.plot, xp: __remake.scene.xp, gold: __remake.scene.gold, kills: __remake.scene.kills, pop: __remake.scene.flags[202] ?? 0, nice: __remake.scene.flags[36] ?? 0 })),
    { plot: 11, xp: 7, gold: 13, kills: 0, pop: 0, nice: 0 });

  // Check có biến thể Hard Mode; Game Over của boss dùng snapshot chung.
  await reset();
  await page.evaluate(() => { const world = __remake.scene; world.flags[6] = 1; world.saveGame(true); });
  await sleep(true);
  assert.match(await page.evaluate(() => __remake.scene.message.text), /Same as usual/);
  await act(0); assert.match(await page.evaluate(() => __remake.scene.message.text), /same difficulty as normal/);
  await closePages(); await wave(10, 'tears');
  await page.waitForFunction(() => __remake.scene.wave.bullets.length > 0);
  await page.evaluate(() => {
    const scene = __remake.scene, bullet = scene.wave.bullets[0];
    scene.hp = 1; scene.invFrames = 0;
    bullet.x = scene.soul.x * 2; bullet.y = scene.soul.y * 2; bullet.vx = 0; bullet.vy = 0;
    bullet.rotation = 0; bullet.gravity = 0; bullet.friction = 0; bullet.scale = 1;
  });
  await page.waitForFunction(() => __remake.scene.mode === 'dead');
  await page.waitForFunction(() => __remake.scene.deathReady);
  const deathPages = await page.evaluate(() => __remake.scene.deathLines.length);
  for (let i = 0; i < deathPages; i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ room: __remake.room, hp: __remake.scene.hp, plot: __remake.scene.plot, stage: __remake.scene.ruins12.stage })),
    { room: 'room_ruins12', hp: 20, plot: 9.2, stage: 'sleeping' });

  await reset();
  await page.evaluate(async () => { const world = __remake.scene; world.flags[202] = 20; await world.openRoom('room_ruins12'); });
  await page.waitForFunction(() => __remake.scene.ruins12.stage === 'gone');
  assert.equal(await page.evaluate(() => __remake.scene.flags[36] ?? 0), 0);
  await page.evaluate(async () => {
    const world = __remake.scene; await world.openRoom('room_ruins12A', 'obj_markerA');
    world.player.setPosition(150, 150); world.player.facing = 'r'; world.interactionCooldown = 0;
  });
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /cheese/);
  while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z');
  console.log('✓ Napstablook: No/đấu lại/Flee, Cheer và mũ, bốn đợt đạn, HP/bất tử/ITEM, kết thúc ma không chết, plot/cờ/lưu nạp và cheese');
}
