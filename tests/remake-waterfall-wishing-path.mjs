import assert from 'node:assert/strict';
export async function testWaterfallWishingPath(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = { 357: 3 }; w.plot = 107; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water4'); await w.openRoom('room_water5'); w.waterfallEncounter.disabled = true; w.player.setPosition(110, 95); w.updateCamera(); window.wishingMusic = w.waterfallMusic; });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water6'); await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.wishingMusic, __remake.scene.waterfallWishingRoom.doorOpen ?? false]), [110, 340, true, false]);
  assert.ok(await page.evaluate(() => __remake.scene.waterfallEncounter.steps >= 110 && __remake.scene.waterfallEncounter.steps <= 140));
  await page.evaluate(() => { __remake.scene.waterfallEncounter.disabled = true; });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water5'); await page.keyboard.up('ArrowDown');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic === window.wishingMusic]), [110, 90, true]);
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water6', 'obj_markerC'); const e = w.waterfallEncounter; e.count = e.steps + 1; const old = Math.random; Math.random = () => 0; e.update(); Math.random = old; });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WaterfallGroupBattle');
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[357]), 4);
  await page.evaluate(() => __remake.scene.flee()); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Wishing Room: cửa 5↔6, marker/nhạc và encounter nhóm');
}
