import assert from 'node:assert/strict';

export async function testTorielGate(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const place = (x, y) => page.evaluate(([x, y]) => { const world = __remake.scene; world.player.setPosition(x, y); world.interactionCooldown = 0; }, [x, y]);
  const drain = async () => { while (await page.evaluate(() => __remake.phase === 'running' && !!__remake.scene.dialogue)) await key('z'); };
  const battlePages = async () => { while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); };
  const challenge = async () => {
    await place(150, 140); await page.keyboard.down('ArrowUp');
    await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowUp');
  };
  await page.evaluate(async () => {
    localStorage.removeItem('undertale-remake-toriel-kills');
    const world = __remake.scene; world.plot = 24; world.flags = {}; world.hp = 20; world.maxHp = 20; world.lv = 1; world.armor = 4;
    await world.openRoom('room_basement3', 'obj_markerA');
  });
  await place(150, 40); await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.room === 'room_basement4' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 180]);
  await challenge(); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 6);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /so badly/);
  const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
  await page.keyboard.down('ArrowUp'); await key('c'); await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.flags[45]), 3);
  await page.waitForFunction(() => __remake.scene.torielGate.flames === 2);
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.flame.alpha), .5);
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.monster === 'toriel' && !!__remake.scene.music);
  assert.equal(await page.evaluate(() => __remake.game.scene.getScene('World').basementMusic.isPlaying), false);
  // Bỏ chạy bằng MERCY thật để controller nhận kết quả, rồi đấu lại.
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z'); await battlePages();
  await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /That is right/); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.locked), false);
  await challenge(); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2); await drain();
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.monster === 'toriel' && !!__remake.scene.music);
  for (let i = 0; i < 25; i++) {
    await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('z');
    if (i === 24) break;
    await page.evaluate(() => {
      const scene = __remake.scene; scene.speechBox?.destroy(); scene.speechText?.destroy(); scene.beginWave(); scene.invFrames = 1000;
      for (let f = 0; f < 220; f++) if (scene.wave.step()) { scene.finishSoul(); break; }
      scene.invFrames = 0;
    });
  }
  await battlePages(); await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.torielGate.stage === 'farewell');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 5);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.torielGate.music.key, __remake.scene.torielGate.music.rate]), ['mus_toriel', .75]);
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.stage), 'hug');
  await page.waitForFunction(() => __remake.scene.torielGate.stage === 'unhug');
  await page.waitForFunction(() => __remake.scene.torielGate.stage === 'goodbye');
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /Goodbye/); await drain();
  await page.waitForFunction(() => __remake.scene.torielGate.stage === 'complete');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 25);
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.npc.active), false);
  await page.evaluate(() => __remake.scene.saveGame());
  await page.evaluate(async () => { __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.stage), 'complete');
  await place(150, 75); await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.scene.torielGate.music.volume < .3);
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_basement5');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 1570]);
  await place(150, 1570); await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_basement4');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 75]);
  // Nhánh ký ức sau giết và số quái lớn không bị thay bằng lời thường.
  for (const [memory, flags, length] of [[true, {}, 11], [true, { 202: 12, 203: 12 }, 7]]) {
    await page.evaluate(async ([memory, flags]) => {
      localStorage.setItem('undertale-remake-toriel-kills', String(Number(memory)));
      const world = __remake.scene; world.plot = 24; world.flags = flags; await world.openRoom('room_basement4', 'obj_markerA');
    }, [memory, flags]);
    await challenge(); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), length);
    await page.evaluate(async () => { __remake.scene.plot = 25; await __remake.scene.openRoom('room_basement3', 'obj_markerB'); });
  }
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 24; world.flags = {}; await world.openRoom('room_basement4', 'obj_markerA');
  });
  await page.waitForFunction(() => !!__remake.scene.torielGate.npc);
  await page.evaluate(() => {
    const world = __remake.scene; world.flags[45] = 4; world.torielGate.stage = 'battle';
    world.torielGate.flame = world.add.rectangle(0, 0, 1, 1); world.torielGate.locked = true;
  });
  await page.waitForFunction(() => __remake.scene.plot === 25);
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.npc.active), false);
  assert.equal(await page.evaluate(() => __remake.scene.torielGate.locked), false);
  console.log('✓ cửa Toriel: challenge/cảm xúc/lửa/khóa, Flee/đấu lại, 25 MERCY/ôm/chào/path/plot25, ký ức/tuyến/cửa5 và lưu nạp');
}
