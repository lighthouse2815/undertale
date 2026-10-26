import assert from 'node:assert/strict';

export async function testRuins13(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(70); };
  const drain = async () => {
    for (let i = 0; i < 16 && await page.evaluate(() => !!__remake.scene.dialogue); i++) {
      assert.equal(await page.evaluate(() => !!__remake.scene.dialogue.choice), false, 'Hội thoại thường không được tự chọn câu trả lời.');
      await key('z');
    }
    assert.equal(await page.evaluate(() => !!__remake.scene.dialogue), false);
  };
  const talk = async (x, y = 140) => {
    await page.evaluate(([x, y]) => {
      const world = __remake.scene;
      world.player.setPosition(x - 30, y - 8); world.player.facing = 'r'; world.interactionCooldown = 0;
    }, [x, y]);
    await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  const choose = async (index) => {
    await page.waitForFunction(() => !!__remake.scene.dialogue?.choice);
    await page.waitForTimeout(120);
    if (index === 1) await key('ArrowRight');
    await key('z');
  };
  const untilChoice = async () => {
    for (let i = 0; i < 8 && !await page.evaluate(() => !!__remake.scene.dialogue?.choice); i++) await key('z');
    await page.waitForFunction(() => !!__remake.scene.dialogue?.choice);
  };
  const door = async (x, y, direction, room, expected) => {
    await page.evaluate(([x, y]) => __remake.scene.player.setPosition(x, y), [x, y]);
    await page.keyboard.down(direction);
    await page.waitForFunction(() => __remake.phase === 'transition', null, { timeout: 5000 });
    await page.keyboard.up(direction);
    await page.waitForFunction((room) => __remake.phase === 'running' && __remake.room === room, room);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), expected);
  };
  await page.evaluate(async () => {
    const world = __remake.scene;
    world.plot = 11; world.flags = {}; world.kills = 0; world.inventory = []; world.gold = 25;
    await world.openRoom('room_ruins12', 'obj_markerB');
  });
  await door(280, 130, 'ArrowRight', 'room_ruins12A', [20, 120]);
  await door(280, 130, 'ArrowRight', 'room_ruins12B', [22, 122]);
  await talk(120, 90); await choose(0); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[59]]), [18, [7], 7]);
  await talk(172, 72); await choose(0); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory, __remake.scene.flags[59]]), [0, [7, 10], 25]);
  await talk(120, 90); await choose(0);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[0].includes('gold')), true);
  await drain();
  await page.evaluate(() => { __remake.scene.gold = 40; __remake.scene.inventory = Array(8).fill(1); });
  await talk(172, 72); await choose(0); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory.length, __remake.scene.flags[59]]), [40, 8, 25]);
  await talk(120, 90); await choose(1); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.inventory.length]), [40, 8]);
  await door(20, 122, 'ArrowLeft', 'room_ruins12A', [280, 120]);
  await door(20, 120, 'ArrowLeft', 'room_ruins12', [280, 120]);
  await door(210, 80, 'ArrowUp', 'room_ruins13', [150, 240]);
  await page.evaluate(() => { const world = __remake.scene; world.player.setPosition(190, 132); });
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 210), 'Froggit phải chặn đường đi theo mask.');
  await talk(220);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 5);
  await key('z'); await key('z'); await key('x');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[4]), '* (Oh, not you too!)');
  await drain();
  await talk(340);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[0].includes('F4')), true);
  await drain();
  await talk(280, 100);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[0].includes('ant-sized')), true);
  await drain();
  await talk(160);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
  await drain();
  await talk(460); await untilChoice(); await choose(1); await untilChoice(); await choose(0); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[22] ?? 0), 0);
  await talk(460); await untilChoice(); await choose(1); await untilChoice(); await choose(1); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[22]), 1);
  await talk(460); await untilChoice(); await choose(1); await drain();
  assert.equal(await page.evaluate(() => __remake.scene.flags[22]), 2);
  await page.evaluate(() => __remake.scene.player.setPosition(530, 170));
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 9);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 11, 'Plot chỉ tăng khi kết thúc cuộc gọi.');
  await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key), 'spr_face_torielhappytalk:0');
  await drain(); assert.equal(await page.evaluate(() => __remake.scene.plot), 12);
  await page.evaluate(() => { const world = __remake.scene; world.player.setPosition(150, 230); world.updateCamera(); });
  await page.waitForFunction(() => __remake.scene.flags[9] === 1);
  await door(150, 250, 'ArrowDown', 'room_ruins12', [210, 74]);
  await door(210, 80, 'ArrowUp', 'room_ruins13', [150, 240]);
  await page.evaluate(() => __remake.scene.player.setPosition(540, 160));
  await page.waitForTimeout(150); assert.equal(await page.evaluate(() => !!__remake.scene.dialogue), false);
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 11; world.flags[6] = 1;
    await world.openRoom('room_ruins13', 'obj_markerX'); world.player.setPosition(530, 170);
  });
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 8);
  await drain();
  await page.evaluate(async () => {
    const world = __remake.scene; world.flags[7] = 1;
    await world.openRoom('room_ruins13', 'obj_markerX');
  });
  await talk(340); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 1); await drain();
  await talk(460); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2); await drain();
  await page.evaluate(async () => {
    const world = __remake.scene; world.flags[7] = 0; world.flags[25] = 6; world.kills = 17;
    await world.openRoom('room_ruins13', 'obj_markerX');
  });
  assert.equal(await page.evaluate(() => __remake.scene.ruins13.entries.some(({ item }) => item.ObjectName.startsWith('obj_smallfrog'))), false);
  await page.evaluate(() => { __remake.scene.kills = 0; __remake.scene.flags[25] = 0; });
  // Cờ lựa chọn phải được trận thật đọc lại, kể cả sau lưu/nạp.
  await page.evaluate(async () => { const world = __remake.scene; world.saveGame(); world.flags[22] = 0; await world.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.flags[22]), 2);
  for (const [preference, font] of [[0, 'fnt_maintext:yellow'], [1, 'fnt_maintext'], [2, 'fnt_maintext:pink']]) {
    await page.evaluate((preference) => {
      const world = __remake.scene; world.flags[22] = preference; world.hp = 20; world.inventory = [];
      __remake.startBattle('whimsun');
    }, preference);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.mode === 'menu');
    await key('ArrowRight'); await key('ArrowRight'); await key('ArrowRight'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.menu.font), font);
    await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages');
    const count = await page.evaluate(() => __remake.scene.pages.length);
    for (let i = 0; i < count; i++) await key('z');
    await page.waitForFunction(() => __remake.phase === 'running');
  }
  console.log('✓ cửa Ruins 12/12A/12B/13, mua đồ/túi đầy/GOLD, hội thoại Froggit, màu tên quái, SAVE và cuộc gọi Toriel một lần');
}
