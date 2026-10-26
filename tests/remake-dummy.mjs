import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function testDummy(page, root) {
  const data = JSON.parse(await readFile(join(root, 'remake/src/dummy-lesson.json'), 'utf8'));
  assert.ok(Object.values(data).flat().every((line) => !/SCR_TEXT_|ds_map_add/.test(line)));
  const position = () => page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  const closeWorldDialogue = async (length) => {
    for (let i = 0; i < length; i++) {
      await page.waitForFunction((index) => __remake.phase === 'running' && __remake.scene.dialogue?.index === index, i);
      await page.keyboard.press('z');
      await page.waitForTimeout(50);
    }
    await page.waitForFunction(() => !__remake.scene.dialogue);
  };
  const closeBattlePages = async (length) => {
    for (let i = 0; i < length; i++) {
      await page.waitForFunction((index) => __remake.phase === 'battle' && __remake.scene.mode === 'pages' && __remake.scene.pageIndex === index, i);
      await page.keyboard.press('z');
      await page.waitForTimeout(50);
    }
  };
  const button = async (direction) => { await page.keyboard.press(direction); await page.waitForTimeout(60); };
  const start = async (name = 'CHARA') => {
    await page.evaluate(async (name) => {
      __remake.game.registry.set('charname', name); __remake.scene.plot = 5.5; __remake.scene.flags = {};
      await __remake.scene.openRoom('room_ruins4', 'obj_markerA');
      __remake.scene.player.setPosition(200, 110); __remake.scene.player.facing = 'u';
    }, name);
    await page.keyboard.press('z');
    await page.waitForFunction(() => __remake.phase === 'battle');
    assert.equal(await page.evaluate(() => __remake.scene.enemyHp), 15);
    assert.equal(await page.evaluate(() => __remake.scene.enemy.texture.key), 'spr_dummybattle:0');
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.plot), 6);
  };
  const feedback = async (outcome, count) => {
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.dummyLesson.stage === 'feedback');
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count);
    const flag = { talk: 10, flee: 11, kill: 12, bored: 13 }[outcome];
    assert.equal(await page.evaluate((flag) => __remake.scene.flags[flag], flag), 1);
    await closeWorldDialogue(count);
    await page.waitForFunction(() => __remake.scene.plot === 7);
    assert.equal(await page.evaluate(() => __remake.scene.dummyLesson.dummy?.image.active ?? false), outcome !== 'kill');
    await page.evaluate(async () => {
      __remake.scene.saveGame(); __remake.scene.plot = 0; __remake.scene.flags = {};
      await __remake.scene.restoreGame();
    });
    assert.equal(await page.evaluate((flag) => __remake.scene.flags[flag], flag), 1);
    assert.equal(await page.evaluate(() => __remake.scene.plot), 7);
    assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_dummy1')), outcome !== 'kill');
    assert.ok(await page.evaluate(() => !__remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_torinteractable4')));
  };

  await page.evaluate(async () => {
    __remake.game.registry.set('charname', 'CHARA'); __remake.scene.plot = 5; __remake.scene.flags = {};
    await __remake.scene.openRoom('room_ruins4', 'obj_markerA');
  });
  await page.waitForFunction(() => __remake.scene.dummyLesson.stage === 'lesson');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 7);
  const held = await position();
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(100); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await position(), held);
  await closeWorldDialogue(7);
  await page.waitForFunction(() => __remake.scene.dummyLesson.stage === 'practice');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.dummyLesson.toriel.image.x, y: __remake.scene.dummyLesson.toriel.image.y })), { x: 144, y: 40 });
  await page.evaluate(() => { __remake.scene.player.setPosition(149, 83); __remake.scene.player.facing = 'u'; });
  await page.waitForTimeout(260); await page.keyboard.press('z');
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 9);
  await closeWorldDialogue(9);
  await page.waitForTimeout(260); await page.keyboard.press('z');
  await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2);
  await closeWorldDialogue(2);

  await start();
  await page.keyboard.press('x'); await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => __remake.phase), 'battle', 'X không thoát hẳn trận Dummy.');
  await button('ArrowRight'); await button('ArrowRight');
  const emptyItemHp = await page.evaluate(() => __remake.scene.hp);
  await page.keyboard.press('z'); await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => __remake.scene.mode), 'menu', 'Không có inventory thì ITEM phải rỗng.');
  assert.equal(await page.evaluate(() => __remake.scene.hp), emptyItemHp);
  await button('ArrowLeft');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'actTarget');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'act');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.equal(await page.evaluate(() => __remake.scene.message.text), data.check[0]);
  await closeBattlePages(1); await page.waitForFunction(() => __remake.scene.mode === 'dummyTurn');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await page.keyboard.press('z');
  await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'actTarget');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'act');
  await button('ArrowDown'); await page.keyboard.press('z');
  await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.equal(await page.evaluate(() => __remake.scene.pages.length), 3);
  await page.waitForTimeout(100);
  await page.screenshot({ path: join(root, 'test-results/remake-dummy-talk.png') });
  await closeBattlePages(3); await closeBattlePages(1);
  await feedback('talk', 1);

  await start();
  for (let i = 0; i < 3; i++) await button('ArrowRight');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'mercy');
  await button('ArrowDown'); await page.keyboard.press('z');
  await closeBattlePages(1); await feedback('flee', 7);

  await start('FRISK');
  for (let i = 0; i < 3; i++) await button('ArrowRight');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'mercy');
  await button('ArrowDown'); await page.keyboard.press('z');
  await page.waitForFunction(() => __remake.scene.mode === 'dummyTurn');
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[11]), 0, 'Hard Mode không được bỏ chạy ở lượt đầu.');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await button('ArrowLeft'); await button('ArrowLeft');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'actTarget');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'act');
  await button('ArrowDown'); await page.keyboard.press('z');
  await closeBattlePages(3); await closeBattlePages(1); await feedback('talk', 1);

  await start();
  for (let i = 0; i < 3; i++) await button('ArrowRight');
  for (let turn = 0; turn < 8; turn++) {
    await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'mercy');
    await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'dummyTurn');
    assert.equal(await page.evaluate(() => __remake.scene.bullets.length), 0, 'Dummy không được sinh đạn.');
    const hp = await page.evaluate(() => __remake.scene.hp);
    await page.keyboard.press('z');
    if (turn < 7) await page.waitForFunction(() => __remake.scene.mode === 'menu');
    else await page.waitForFunction(() => __remake.scene.mode === 'pages');
    assert.equal(await page.evaluate(() => __remake.scene.hp), hp);
  }
  await closeBattlePages(1);
  await page.waitForFunction(() => __remake.scene.mode === 'pages');
  await closeBattlePages(1); await feedback('bored', 3);

  await start();
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'fightTarget');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.equal(await page.evaluate(() => __remake.scene.enemyHp), 15, 'Thanh đi hết mà không bấm phải MISS.');
  await closeBattlePages(1); await page.waitForFunction(() => __remake.scene.mode === 'dummyTurn');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'submenu' && __remake.scene.kind === 'fightTarget');
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'fight');
  await page.waitForFunction(() => __remake.scene.attackX > 151 && __remake.scene.attackX < 161);
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.ok(await page.evaluate(() => __remake.scene.damage >= 30));
  assert.equal(await page.evaluate(() => __remake.scene.enemyHp), 0);
  await closeBattlePages(1); await closeBattlePages(1); await feedback('kill', 2);

  await page.evaluate(() => { __remake.scene.player.setPosition(149, 80); __remake.scene.player.facing = 'u'; });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins5');
  assert.deepEqual(await position(), { x: 150, y: 190 });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins4');
  assert.deepEqual(await position(), { x: 150, y: 75 });
  assert.ok(await page.evaluate(() => !__remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_dummy1')));
  console.log('✓ hướng dẫn Dummy, Talk/Flee/FIGHT/chờ bỏ đi, không sinh đạn, phản hồi Toriel và lưu/nạp bốn kết quả');
}
