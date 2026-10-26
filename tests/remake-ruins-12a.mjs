import assert from 'node:assert/strict';

export async function testRuins12A(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const place = async (x, y, facing) => page.evaluate(({ x, y, facing }) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.player.facing = facing; world.interactionCooldown = 0;
  }, { x, y, facing });
  const readSavepoint = async () => {
    await place(100, 140, 'd'); await key('z');
    await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  const closeDialogue = async () => {
    const count = await page.evaluate(() => __remake.scene.dialogue.lines.length);
    for (let i = 0; i < count; i++) await key('z');
  };
  await page.evaluate(async () => {
    const world = __remake.scene; world.flags = {}; world.plot = 11; world.hp = 20; world.maxHp = 20; world.lv = 1;
    await world.openRoom('room_ruins1'); world.saveGame();
    await world.openRoom('room_ruins12A', 'obj_markerA'); world.hp = 5;
    world.mouseSoundCalls = [];
    const play = world.sound.play;
    world.restoreMouseSound = () => { world.sound.play = play; };
    world.sound.play = function (key, ...args) { world.mouseSoundCalls.push(key); return play.call(this, key, ...args); };
  });
  const originalSave = await page.evaluate(() => localStorage.getItem('undertale-remake-save-v1'));
  await place(100, 100, 'r'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.mouseSoundCalls.includes('snd_movemenu')), false);
  await place(100, 100, 'u'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.mouseSoundCalls.filter((key) => key === 'snd_movemenu').length), 1);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null, 'Chuột chỉ phát âm thanh, không khóa bằng hộp thoại.');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 11);
  const guarded = await page.evaluate(() => {
    const world = __remake.scene; world.sound.stopByKey('snd_movemenu'); world.mouseSoundCalls = [];
    world.ruins12.interact(); world.ruins12.interact();
    return world.mouseSoundCalls.filter((key) => key === 'snd_movemenu').length;
  });
  assert.equal(guarded, 1, 'Không phát chồng tiếng khi âm thanh còn chạy.');

  await readSavepoint();
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), [
    '* (Knowing the mouse might one\n  day leave its hole and\n  get the cheese...)', '* (It fills you with\n  determination.)',
  ]);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  await closeDialogue(); await page.waitForFunction(() => __remake.phase === 'saving');
  assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Ruins - Entrance', 'Trước khi ghi mới, menu hiển thị file cũ.');
  await key('ArrowRight'); await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => localStorage.getItem('undertale-remake-save-v1')), originalSave);

  await readSavepoint(); await closeDialogue(); await page.waitForFunction(() => __remake.phase === 'saving');
  await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.saved), true);
  assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Ruins - Mouse Hole');
  await page.screenshot({ path: 'test-results/remake-mouse-save.png' });
  await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(async () => { const world = __remake.scene; world.hp = 1; await world.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => ({ room: __remake.room, hp: __remake.scene.hp, plot: __remake.scene.plot })),
    { room: 'room_ruins12A', hp: 20, plot: 11 });
  await place(160, 150, 'r');
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(350); await page.keyboard.up('ArrowRight');
  assert.ok(await page.evaluate(() => __remake.scene.player.x < 180), 'Bàn phô mai phải có va chạm.');
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ['* This cheese has been here\n  quite a long time.', "* It's stuck to the table..."]);
  await closeDialogue();
  await page.evaluate(() => { __remake.scene.flags[7] = 1; __remake.scene.interactionCooldown = 0; });
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ['* (Looks like cheese has a\n  nibble taken out of it.)']);
  await closeDialogue();
  await page.evaluate(() => { __remake.scene.flags[202] = 20; __remake.scene.hp = 4; });
  await readSavepoint();
  assert.deepEqual(await page.evaluate(() => __remake.scene.dialogue.lines), ['* Determination.']);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  await closeDialogue(); await page.waitForFunction(() => __remake.phase === 'saving');
  await key('x'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(() => { __remake.scene.restoreMouseSound(); delete __remake.scene.restoreMouseSound; });
  console.log('✓ Ruins 12A: chuột đúng hướng/không chồng tiếng, thoại SAVE thường/hết quái, tên file cũ/mới, Return/Save/nạp, hồi HP và va chạm/thoại bàn phô mai');
}
