import assert from 'node:assert/strict';
import { WaterfallEncounter } from '../remake/src/waterfall-encounter.mjs';

export async function testWaterfallEncounter(page) {
  const random = Math.random; Math.random = () => 0;
  try {
    const world = { flags: {}, plot: 106, dataSource: { name: 'room_water5' } };
    const encounter = new WaterfallEncounter(world, 'obj_markerA');
    assert.equal(encounter.steps, 20); assert.equal(world.flags[200], 204); assert.equal(encounter.firstEntrance, true);
    assert.deepEqual([encounter.select(), encounter.select(), encounter.select(), encounter.select()], ['aaron', 'woshua', 'moldsmalGroup53', 'waterfallGroup54']);
    world.flags[357] = 10; for (const [roll, expected] of [[.3, 'aaron'], [.5, 'moldsmalGroup53'], [.9, 'woshua']]) { Math.random = () => roll; assert.equal(encounter.select(), expected); }
    world.flags[204] = 17; Math.random = () => 0; assert.equal(encounter.threshold(340, 380), 2720);
    world.flags[204] = 18; assert.equal(encounter.threshold(340, 380), 20); assert.equal(encounter.select(), 'nobody'); encounter.empty = 2; assert.equal(encounter.threshold(340, 380), 2650);
    world.flags[204] = 0; world.plot = 122; assert.equal(new WaterfallEncounter(world).disabled, true);
  } finally { Math.random = random; }
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 106; w.hp = w.maxHp = 20; w.lv = 1; w.xp = w.kills = w.gold = 0; w.weapon = 3; w.weaponStrength = 0; w.armor = 4; w.armorDefense = 0; w.inventory = []; await w.openRoom('room_water5', 'obj_markerA'); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallEncounter.firstEntrance), true);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'AaronBattle');
  await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.previousScene.flags[357], __remake.scene.previousScene.waterfallEncounter.disabled]), [1, true]);
  await page.evaluate(() => __remake.scene.flee()); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water5', 'obj_markerA'); const e = w.waterfallEncounter; e.count = e.steps + 1; e.update(); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'WoshuaBattle');
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[357]), 2);
  await page.evaluate(() => __remake.scene.flee()); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running');
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water5', 'obj_markerA'); const e = w.waterfallEncounter; e.count = e.steps + 1; e.update(); });
  await page.waitForFunction(() => __remake.phase === 'battle' && __remake.scene.scene.key === 'MoldsmalGroupBattle');
  assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[357]), 3);
  await page.evaluate(() => __remake.scene.flee()); await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Encounter Waterfall: bước/dân số, ba trận đầu, nhóm ngẫu nhiên và hết quái');
}
