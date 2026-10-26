import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testFieldMenu(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(50); };
  const position = () => page.evaluate(() => { const world = __remake.game.scene.getScene('World'); return { x: world.player.x, y: world.player.y }; });
  const open = async (code = 'c') => { await key(code); await page.waitForFunction(() => __remake.phase === 'menu'); };
  const closePages = async (count) => {
    for (let index = 0; index < count; index++) {
      await page.waitForFunction((index) => __remake.scene.dialogue?.index === index, index);
      await key('z');
    }
    await page.waitForFunction(() => __remake.phase === 'running' && !__remake.scene.dialogue);
  };
  const dial = async (id, pages) => {
    await page.evaluate(() => { __remake.scene.menuSelection = 2; });
    await open(); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'phone');
    const index = await page.evaluate((id) => __remake.scene.world.phone.indexOf(id), id);
    assert.ok(index >= 0, `Mục ${id} phải có trong danh sách.`);
    for (let i = 0; i < index; i++) await key('ArrowDown');
    if (id === 201) await page.screenshot({ path: join(root, 'test-results/remake-field-phone.png') });
    await key('Enter');
    await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), pages);
  };
  await page.evaluate(async () => {
    const world = __remake.scene;
    world.plot = 9; world.flags = {}; world.phone = []; world.menuSelection = 0;
    world.hp = 17; world.maxHp = 20; world.lv = 1; world.xp = 0; world.gold = 12; world.kills = 0;
    __remake.game.registry.set('charname', 'CHARA');
    await world.openRoom('room_area1', 'obj_mainchara');
  });
  await open('ControlLeft');
  assert.equal(await page.evaluate(() => __remake.scene.children.list.filter((child) => child.text === 'CELL').length), 0);
  const stopped = await position();
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await position(), stopped);
  await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'main', 'ITEM rỗng không mở được.');
  await key('ArrowUp'); assert.equal(await page.evaluate(() => __remake.scene.selection), 0);
  await key('ArrowDown'); await key('ArrowDown'); assert.equal(await page.evaluate(() => __remake.scene.selection), 1);
  await key('Enter');
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'stat');
  assert.deepEqual(await page.evaluate(() => __remake.scene.statValues), { at: 0, df: 0, xp: 0, next: 10, hp: 17, maxHp: 20, gold: 12 });
  const stats = await page.evaluate(() => __remake.scene.children.list.filter((child) => typeof child.text === 'string').map((child) => child.text));
  assert.ok(stats.includes('WEAPON: Stick') && stats.includes('ARMOR: Bandage') && stats.includes('"CHARA"'));
  assert.ok(!stats.some((text) => /\\\[/.test(text)), 'Nhãn STAT thay hết biến định dạng.');
  await page.screenshot({ path: join(root, 'test-results/remake-field-stat.png') });
  await key('ShiftLeft'); assert.equal(await page.evaluate(() => __remake.scene.mode), 'main');
  await key('c'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await position(), stopped);
  await page.evaluate(() => { __remake.scene.flags[17] = 1; }); await key('c');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await page.evaluate(async () => { __remake.scene.flags = {}; __remake.scene.plot = 8; await __remake.scene.openRoom('room_ruins6', 'obj_markerA'); });
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'running', 'Không mở menu giữa hội thoại.');
  await closePages(5);
  await page.evaluate(() => { __remake.scene.menuSelection = 1; }); await open();
  const runnerX = await page.evaluate(() => __remake.scene.world.corridorLesson.runner.image.x);
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate((x) => __remake.scene.world.corridorLesson.runner.image.x > x, runnerX), 'NPC vẫn chạy khi người chơi đang xem menu.');
  await key('x');
  await page.evaluate(async () => {
    const world = __remake.scene;
    world.plot = 9; world.flags = {}; world.phone = [201, 203, 204, 205];
    await world.openRoom('room_ruins6', 'obj_markerA');
    world.corridorLesson.dogFrames = 500;
    window.fieldSounds = []; const play = world.sound.play.bind(world.sound);
    world.sound.play = (key, ...args) => { window.fieldSounds.push(key); return play(key, ...args); };
  });
  await open();
  const frozenTimer = await page.evaluate(() => __remake.scene.world.corridorLesson.dogFrames);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => __remake.scene.world.corridorLesson.dogFrames), frozenTimer);
  await key('x');
  for (const [index, pages] of [6, 6, 9, 6, 6].entries()) {
    await dial(201, pages);
    assert.equal(await page.evaluate(() => __remake.scene.flags[40]), index + 1);
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.index), 0);
    await key('z');
    assert.ok(await page.evaluate(() => __remake.scene.dialoguePortrait?.texture.key.startsWith('spr_face_toriel')));
    assert.ok(await page.evaluate(() => __remake.scene.dialogueText.text.trim().length > 0), 'Trang chuyển chân dung tự động không trở thành hộp thoại trống.');
    await page.screenshot({ path: join(root, `test-results/remake-phone-hello-${index + 1}.png`) });
    for (let i = 1; i < pages; i++) await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
    assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 203, 204, 205]);
  }
  await dial(203, 6); await closePages(6);
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 204, 205]);
  await dial(205, 6); await closePages(6);
  assert.equal(await page.evaluate(() => __remake.scene.flags[41]), 1);
  assert.ok(await page.evaluate(() => __remake.scene.phone.includes(205)));
  await dial(204, 8); await closePages(8);
  assert.equal(await page.evaluate(() => __remake.scene.flags[42]), 1);
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 205]);
  await page.evaluate(async () => { __remake.scene.saveGame(); __remake.scene.phone = []; __remake.scene.flags = {}; await __remake.scene.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => ({ phone: __remake.scene.phone, hello: __remake.scene.flags[40], flirt: __remake.scene.flags[41], mom: __remake.scene.flags[42] })),
    { phone: [201, 205], hello: 5, flirt: 1, mom: 1 });
  await dial(205, 5);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[3] === __remake.game.cache.json.get('phone-dialogue').flirtMom[3].text), true);
  await closePages(5);
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201]);
  await page.evaluate(() => { __remake.scene.phone = [201, 203, 204, 205]; __remake.scene.flags[37] = 1; window.fieldSounds = []; });
  for (const id of [201, 203, 204, 205]) { await dial(id, 3); await closePages(3); }
  assert.deepEqual(await page.evaluate(() => __remake.scene.phone), [201, 203, 204, 205]);
  assert.equal(await page.evaluate(() => window.fieldSounds.filter((key) => key === 'snd_phone').length), 0, 'Không phát tiếng chuông khi chó đang giữ điện thoại.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[40]), 5, 'Cuộc gọi bận không tăng bộ đếm chào.');
  await page.evaluate(() => { __remake.scene.flags[37] = 2; __remake.scene.flags[41] = 0; __remake.scene.flags[42] = 0; });
  await dial(205, 6); await closePages(6); await dial(205, 4); await closePages(4);
  await page.evaluate(() => { __remake.scene.phone.push(202); }); await dial(202, 6); await closePages(6);
  assert.equal(await page.evaluate(() => __remake.scene.phone.includes(202)), false);
  await page.evaluate(() => { __remake.scene.plot = 19.9; }); await dial(203, 3); await closePages(3);
  assert.equal(await page.evaluate(() => __remake.scene.phone.includes(203)), true, 'Không có trả lời không xóa mục hỏi.');
  await page.evaluate(() => { __remake.scene.flags[45] = 4; }); await dial(201, 3); await closePages(3);
  await page.evaluate(() => { const world = __remake.scene; world.lv = 2; world.xp = 10; world.maxHp = 24; world.menuSelection = 1; world.player.y = 150; });
  await open(); await key('z');
  assert.deepEqual(await page.evaluate(() => __remake.scene.statValues), { at: 2, df: 0, xp: 10, next: 20, hp: 17, maxHp: 24, gold: 12 });
  await page.screenshot({ path: join(root, 'test-results/remake-field-stat-bottom.png') });
  await key('x'); await key('x');
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 7; world.flags = { 30: 1 };
    await world.openRoom('room_ruins5', 'obj_markerA');
  });
  await page.waitForFunction(() => !!__remake.scene.dialogue); await closePages(2);
  await page.evaluate(() => { __remake.scene.player.setPosition(200, 100); });
  await page.waitForTimeout(200); await open();
  await page.waitForTimeout(1800);
  const waitingX = await page.evaluate(() => __remake.scene.world.spikeGuide.entry.image.x);
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => __remake.scene.world.spikeGuide.entry.image.x), waitingX, 'Toriel vẫn nhận biết khoảng cách và dừng chờ khi đang mở menu.');
  await key('x');
  console.log('✓ Menu C/Ctrl, STAT, khóa di chuyển, ITEM rỗng, cuộc gọi Toriel, thay chân dung, cờ 37/40–42 và lưu/nạp danh sách');
}
