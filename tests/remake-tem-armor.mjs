import assert from 'node:assert/strict';
import { itemAction } from '../remake/src/inventory.mjs';
import inventory from '../remake/src/inventory.json' with { type: 'json' };

export async function testTemArmor(page) {
  const world = { inventory: [64, 45, 12], armor: 4, armorDefense: 0, weapon: 13, weaponStrength: 3, flags: {}, sound: { play() {} } };
  itemAction(world, 0, 'use', inventory); assert.deepEqual([world.armor, world.armorDefense, world.weaponStrength, world.inventory], [64, 20, 13, [4, 45, 12]]);
  itemAction(world, 1, 'use', inventory); assert.deepEqual([world.weapon, world.weaponStrength], [45, 12]);
  itemAction(world, 2, 'use', inventory); assert.deepEqual([world.armor, world.armorDefense, world.weaponStrength], [12, 3, 2]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.inventory = [64]; w.armor = 4; w.armorDefense = 0; w.weapon = 3; w.weaponStrength = 0; w.hp = 10; w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  const result = await page.evaluate(async () => {
    const s = __remake.scene, w = s.previousScene, { itemAction } = await import('/src/inventory.mjs'); s.scene.pause();
    itemAction(w, 0, 'use', s.cache.json.get('inventory'), { scene: s, health: s }); s.invFrames = 0; s.hurt(7); const hit = [s.hp, s.invFrames];
    s.turn = 1; s.mode = 'menu'; s.update(0, 1); const first = s.hp; s.update(0, 1); const repeat = s.hp;
    s.turn = 2; s.update(0, 1); const even = s.hp; s.turn = 3; s.update(0, 1); const odd = s.hp;
    s.scene.resume(); s.finishBattle(); return { hit, first, repeat, even, odd, armor: w.armor, attack: w.weaponStrength };
  });
  assert.deepEqual(result, { hit: [9, 45], first: 10, repeat: 10, even: 10, odd: 11, armor: 64, attack: 10 });
  await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Temmie Armor: trang bị, AT/DF, bất tử và hồi HP mỗi hai lượt');
}
