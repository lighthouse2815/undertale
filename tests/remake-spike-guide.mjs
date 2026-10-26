import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testSpikeGuide(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(50); };
  const position = () => page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y }));
  const closeWorld = async (count) => {
    for (let i = 0; i < count; i++) {
      await page.waitForFunction((index) => __remake.phase === 'running' && __remake.scene.dialogue?.index === index, i);
      await key('z');
    }
  };
  const closeBattle = async () => {
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages');
    await key('z');
  };
  const reset = async (plot = 7, met = false) => page.evaluate(async ({ plot, met }) => {
    const world = __remake.scene;
    __remake.game.registry.set('charname', 'CHARA');
    world.plot = plot; world.flags = { 30: met ? 1 : 0 }; world.lv = 1; world.xp = 0; world.gold = 0; world.kills = 0; world.maxHp = 20; world.hp = 20;
    await world.openRoom('room_ruins5', 'obj_markerA');
  }, { plot, met });
  const act = async (index) => {
    await key('ArrowRight'); await key('z');
    await page.waitForFunction(() => __remake.scene.kind === 'actTarget' && __remake.scene.mode === 'submenu');
    await key('z');
    await page.waitForFunction(() => __remake.scene.kind === 'act');
    for (let i = 0; i < index; i++) await key('ArrowDown');
    await key('z'); await closeBattle();
  };
  const triggerBattle = async () => {
    await page.evaluate(() => __remake.scene.player.setPosition(520, 110));
    await page.waitForFunction(() => __remake.phase === 'battle');
    assert.deepEqual(await page.evaluate(() => ({ hp: __remake.scene.enemyHp, room: __remake.room, flag: __remake.scene.previousScene.flags[30] })),
      { hp: 20, room: 'battle_tutorial_froggit', flag: 1 });
  };

  await reset();
  await page.waitForFunction(() => __remake.scene.spikeGuide.stage === 'explaining');
  await closeWorld(2);
  await page.evaluate(() => __remake.scene.player.setPosition(200, 100));
  await page.waitForTimeout(1800);
  const waiting = await page.evaluate(() => __remake.scene.spikeGuide.entry.image.x);
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => __remake.scene.spikeGuide.entry.image.x), waiting, 'Toriel phải dừng khi Frisk không đi theo.');
  await page.evaluate(() => __remake.scene.player.setPosition(755, 90));
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(600); await page.keyboard.up('ArrowRight');
  assert.equal((await position()).x, 758, 'Tường plot 7 phải chặn trước bãi gai.');
  await triggerBattle();
  const npcPaused = await page.evaluate(() => ({ x: __remake.scene.previousScene.spikeGuide.entry.image.x, y: __remake.scene.previousScene.spikeGuide.entry.image.y }));
  await act(1);
  await page.waitForFunction(() => __remake.scene.mode === 'intervention');
  assert.equal(await page.evaluate(() => __remake.scene.bullets.length), 0);
  await page.waitForTimeout(500);
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.previousScene.spikeGuide.entry.image.x, y: __remake.scene.previousScene.spikeGuide.entry.image.y })), npcPaused);
  await page.screenshot({ path: join(root, 'test-results/remake-froggit-intervention.png') });
  await page.waitForFunction(() => __remake.scene.mode === 'pages');
  assert.equal(await page.evaluate(() => __remake.scene.pendingOutcome), 'scared');
  assert.ok(await page.evaluate(() => !/\\+\[\d\]/.test(__remake.scene.message.text)), 'Thông báo thưởng không để lộ biến định dạng.');
  await closeBattle(); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => ({ xp: __remake.scene.xp, gold: __remake.scene.gold, hp: __remake.scene.hp })), { xp: 0, gold: 2, hp: 20 });
  await page.evaluate(() => {
    window.followTimer = setInterval(() => {
      if (__remake.phase === 'running' && __remake.scene.spikeGuide.stage === 'following') {
        const npc = __remake.scene.spikeGuide.entry.image;
        __remake.scene.player.setPosition(npc.x, npc.y);
      }
    }, 40);
  });
  try { await page.waitForFunction(() => __remake.scene.spikeGuide.stage === 'waiting'); }
  finally { await page.evaluate(() => clearInterval(window.followTimer)); }
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.spikeGuide.entry.image.x, y: __remake.scene.spikeGuide.entry.image.y })), { x: 780, y: 110 });
  await page.evaluate(() => { __remake.scene.player.setPosition(750, 130); __remake.scene.player.facing = 'r'; });
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  await closeWorld(2);
  await page.waitForFunction(() => __remake.scene.spikeGuide.stage === 'escort');
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 7.5);
  const escortStart = await position();
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(500); await page.keyboard.up('ArrowLeft');
  const escorted = await position();
  assert.ok(escorted.x > escortStart.x && escorted.x - escortStart.x < 25, 'Nắm tay đi theo path gốc 1 pixel mỗi frame, không theo phím.');
  await page.screenshot({ path: join(root, 'test-results/remake-spike-escort.png') });
  await page.waitForFunction(() => __remake.scene.spikeGuide.stage === 'arrival' && !!__remake.scene.dialogue);
  assert.deepEqual(await position(), { x: 1114, y: 98 });
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  await closeWorld(1);
  assert.equal(await page.evaluate(() => __remake.scene.plot), 8);
  await page.evaluate(async () => { __remake.scene.saveGame(); __remake.scene.flags = {}; __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => ({ plot: __remake.scene.plot, met: __remake.scene.flags[30], gold: __remake.scene.gold })), { plot: 8, met: 1, gold: 2 });
  assert.equal(await page.evaluate(() => __remake.scene.spikeGuide.stage), 'complete');
  await page.evaluate(() => __remake.scene.player.setPosition(520, 110)); await page.waitForTimeout(150);
  assert.equal(await page.evaluate(() => __remake.phase), 'running', 'Nạp lại phải giữ cờ đã gặp Froggit.');
  await page.evaluate(() => __remake.scene.player.setPosition(840, 120));
  await page.waitForFunction(() => __remake.scene.roomObjects.find(({ item }) => item.ObjectName === 'obj_spiketile1' && item.X === 840 && item.Y === 140).image.texture.key === 'spr_spiketile:1');
  await page.evaluate(() => __remake.scene.player.setPosition(800, 100));
  await page.waitForFunction(() => __remake.scene.roomObjects.find(({ item }) => item.ObjectName === 'obj_spiketile1' && item.X === 840 && item.Y === 140).image.texture.key === 'spr_spiketile:0');

  for (const action of ['check', 'threat', 'spare', 'flee', 'kill']) {
    await reset(8); await triggerBattle();
    if (action === 'check' || action === 'threat') await act(action === 'check' ? 0 : 2);
    else if (action === 'spare' || action === 'flee') {
      for (let i = 0; i < 3; i++) await key('ArrowRight');
      await key('z'); if (action === 'flee') await key('ArrowDown'); await key('z');
    } else {
      await key('z'); await key('z');
      await page.waitForFunction(() => __remake.scene.mode === 'fight');
      await page.waitForFunction(() => __remake.scene.attackX > 151 && __remake.scene.attackX < 161);
      await key('z'); await closeBattle();
    }
    if (action !== 'flee') {
      await page.waitForFunction(() => __remake.scene.mode === 'pages');
      assert.equal(await page.evaluate(() => __remake.scene.pendingOutcome), action === 'kill' ? 'kill' : 'scared');
      await closeBattle();
    } else await closeBattle();
    await page.waitForFunction(() => __remake.phase === 'running');
    assert.deepEqual(await page.evaluate(() => ({ xp: __remake.scene.xp, gold: __remake.scene.gold, lv: __remake.scene.lv, max: __remake.scene.maxHp, kills: __remake.scene.kills })),
      action === 'kill' ? { xp: 10, gold: 20, lv: 2, max: 24, kills: 1 } : { xp: 0, gold: action === 'threat' ? 2 : 0, lv: 1, max: 20, kills: 0 });
    assert.equal(await page.evaluate(() => __remake.scene.flags[30]), 1);
  }
  await page.evaluate(async () => { __remake.scene.saveGame(); __remake.scene.xp = 0; __remake.scene.gold = 0; __remake.scene.kills = 0; await __remake.scene.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => ({ xp: __remake.scene.xp, gold: __remake.scene.gold, kills: __remake.scene.kills })), { xp: 10, gold: 20, kills: 1 });
  await page.evaluate(() => __remake.scene.player.setPosition(1160, 100));
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.room === 'room_ruins6' && __remake.phase === 'running');
  assert.deepEqual(await position(), { x: 30, y: 102 });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.room === 'room_ruins5' && __remake.phase === 'running');
  assert.deepEqual(await position(), { x: 1160, y: 100 });
  console.log('✓ Froggit theo kịch bản, Toriel can thiệp, sáu hành động, thưởng XP/GOLD, nắm tay qua gai và lưu/nạp cờ 30');
}
