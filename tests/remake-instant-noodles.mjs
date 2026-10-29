import assert from 'node:assert/strict';

export async function testInstantNoodles(page) {
  const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(60); };
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ inventory: w.inventory, hp: w.hp, maxHp: w.maxHp, flags: w.flags, plot: w.plot, menuSelection: w.menuSelection });
    w.inventory = [36]; w.hp = 10; w.maxHp = 100; w.flags = {}; w.plot = 127; w.menuSelection = 0;
    await w.openRoom('room_fire_lab1', 'obj_markerC'); return snapshot;
  });
  await press('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await press('z'); await press('z'); await press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.inventory.length, __remake.scene.dialogue.lines[0].includes('15 HP')]), [25, 0, true]);
  await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); w.inventory = [36]; w.hp = 10; __remake.startBattle('mettatonQuiz'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'MettatonQuizBattle');
  await press('ArrowRight'); await press('ArrowRight'); await press('z'); await press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.mode, __remake.scene.hp, __remake.scene.previousScene.inventory, __remake.scene.previousScene.flags[21]]), ['noodles', 10, [], 1]);
  await press('z');
  assert.equal(await page.evaluate(() => __remake.scene.noodles.page), 0, 'Không bỏ qua trang đang gõ bằng Z.');
  const cooking = await page.evaluate(() => {
    const s = __remake.scene, n = s.noodles;
    while (n.page < 3) { for (let i = 0; i < 500 && !n.ready; i++) n.step(); n.advance(); }
    const paused = s.music.isPaused; for (let i = 0; i < 100 && n.delay <= 1; i++) n.step(); const delay = n.delay;
    for (let page = 3; page < 15; page++) { for (let i = 0; i < 1000 && !n.ready; i++) n.step(); n.advance(); }
    return [paused, delay > 1, s.hp, s.music.isPlaying, s.previousScene.flags[21], s.previousScene.flags[260], s.mode, s.message.text.includes('4 HP')];
  });
  assert.deepEqual(cooking, [true, true, 14, true, 0, 1, 'pages', true]);
  await page.evaluate(() => __remake.scene.finishBattle());
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(() => { const w = __remake.scene; w.inventory = [36]; w.hp = 1; __remake.startBattle('toriel'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'TorielBattle');
  assert.deepEqual(await page.evaluate(() => { const s = __remake.scene; s.subIndex = 0; s.useInventory(); return [s.hp, s.mode, s.message.text.includes("better dry"), s.previousScene.inventory]; }), [91, 'pages', true, []]);
  await page.evaluate(() => __remake.scene.finishBattle());
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Instant Noodles: ngoài trận 15HP, nấu/gõ chữ/dừng nhạc 4HP, trận đặc biệt 90HP');
}
