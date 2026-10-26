import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function testInventory(page, root) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  const close = async () => {
    await page.waitForFunction(() => !!__remake.scene.dialogue);
    const count = await page.evaluate(() => __remake.scene.dialogue.lines.length);
    for (let i = 0; i < count; i++) await key('z');
    await page.waitForFunction(() => !__remake.scene.dialogue);
  };
  const inventory = () => page.evaluate(() => __remake.scene.inventory);
  const action = async (index, actionIndex) => {
    await page.evaluate(() => { __remake.scene.menuSelection = 0; }); await key('c');
    await page.waitForFunction(() => __remake.phase === 'menu'); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'items');
    for (let i = 0; i < index; i++) await key('ArrowDown');
    await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'action');
    for (let i = 0; i < actionIndex; i++) await key('ArrowRight');
    await key('z'); await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  };
  const candy = async (yes = true) => {
    await page.evaluate(() => { __remake.scene.player.setPosition(150, 113); __remake.scene.player.facing = 'u'; __remake.scene.interactionCooldown = 0; });
    await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue?.choice); await page.waitForTimeout(120);
    if (!yes) await key('ArrowRight');
    await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue && !__remake.scene.dialogue.choice);
  };
  await page.evaluate(async () => {
    const world = __remake.scene;
    world.flags = {}; world.plot = 9; world.kills = 0; world.inventory = []; world.phone = [201, 203, 204, 205];
    world.weapon = 3; world.armor = 4; world.weaponStrength = 0; world.armorDefense = 0;
    await world.openRoom('room_ruins6', 'obj_markerB');
    world.player.setPosition(2456, 100);
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins7');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 7); await close();
  assert.equal(await page.evaluate(() => __remake.scene.plot), 9.2);
  await page.evaluate(() => { __remake.scene.player.setPosition(75, 75); __remake.scene.player.facing = 'r'; __remake.scene.interactionCooldown = 0; });
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 6); await close();
  await page.evaluate(() => __remake.scene.player.setPosition(150, 80));
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins7A');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 150, y: 190 });
  await candy(false); assert.deepEqual(await inventory(), []); assert.equal(await page.evaluate(() => __remake.scene.flags[34] ?? 0), 0); await close();
  await page.evaluate(() => { __remake.scene.inventory = Array(8).fill(1); }); await candy();
  assert.equal((await inventory()).length, 8); assert.equal(await page.evaluate(() => __remake.scene.flags[34] ?? 0), 0);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines[0] === __remake.game.cache.json.get('inventory').candy.full[0]), true); await close();
  await page.evaluate(() => { __remake.scene.inventory = []; });
  for (let count = 1; count <= 4; count++) { await candy(); assert.equal((await inventory()).length, count); assert.equal(await page.evaluate(() => __remake.scene.flags[34]), count); await close(); }
  assert.equal(await page.evaluate(() => __remake.scene.candyDish.entry.image.texture.key), 'spr_candydish2:0');
  await page.screenshot({ path: join(root, 'test-results/remake-candy-spilled.png') });
  await page.evaluate(() => { __remake.scene.interactionCooldown = 0; }); await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  assert.equal(await page.evaluate(() => !!__remake.scene.dialogue.choice), false); await close();
  await action(0, 1); assert.deepEqual(await inventory(), [1, 1, 1, 1]); await close();
  await page.evaluate(() => { __remake.scene.hp = 5; __remake.scene.maxHp = 20; }); await action(0, 0);
  assert.equal(await page.evaluate(() => __remake.scene.hp), 15); assert.equal(await page.evaluate(() => __remake.scene.flags[260]), 1);
  assert.deepEqual(await inventory(), [1, 1, 1]); await close();
  await action(0, 0); assert.equal(await page.evaluate(() => __remake.scene.hp), 20);
  assert.ok(await page.evaluate(() => __remake.scene.dialogue.lines[0].includes(__remake.game.cache.json.get('inventory').maxed))); await close();
  await action(0, 2); assert.deepEqual(await inventory(), [1]); await close();
  await page.evaluate(() => { __remake.scene.inventory = [3, 4, 12, 13]; });
  await action(0, 0); assert.deepEqual(await inventory(), [3, 4, 12, 13]); await close();
  await action(2, 0); assert.deepEqual(await inventory(), [3, 4, 4, 13]); assert.equal(await page.evaluate(() => __remake.scene.armor), 12); await close();
  await action(3, 0); assert.deepEqual(await inventory(), [3, 4, 4, 3]); assert.equal(await page.evaluate(() => __remake.scene.weapon), 13); await close();
  await page.evaluate(() => { __remake.scene.menuSelection = 1; }); await key('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await key('z');
  const labels = await page.evaluate(() => __remake.scene.children.list.map((child) => child.text).filter(Boolean));
  assert.ok(labels.includes('WEAPON: Toy Knife') && labels.includes('ARMOR: Faded Ribbon'));
  assert.ok(labels.some((label) => /^AT .*\(3\)$/.test(label)) && labels.some((label) => /^DF .*\(3\)$/.test(label)));
  await page.screenshot({ path: join(root, 'test-results/remake-inventory-equipped.png') }); await key('x'); await key('x');
  await page.evaluate(async () => { __remake.scene.saveGame(); __remake.scene.inventory = []; __remake.scene.weapon = 3; __remake.scene.armor = 4; await __remake.scene.restoreGame(); });
  assert.deepEqual(await inventory(), [3, 4, 4, 3]);
  assert.deepEqual(await page.evaluate(() => ({ weapon: __remake.scene.weapon, armor: __remake.scene.armor, at: __remake.scene.weaponStrength, df: __remake.scene.armorDefense })), { weapon: 13, armor: 12, at: 3, df: 3 });
  assert.equal(await page.evaluate(() => __remake.scene.candyDish.entry.image.texture.key), 'spr_candydish2:0');
  for (const [id, healed] of [[2, 15], [4, 10], [5, 1], [6, 8], [7, 12], [8, 5], [9, 16], [10, 24], [11, 29]]) {
    await page.evaluate((id) => { __remake.scene.inventory = [id]; __remake.scene.hp = 1; __remake.scene.maxHp = 30; }, id);
    await action(0, 0); assert.equal(await page.evaluate(() => __remake.scene.hp), 1 + healed); assert.deepEqual(await inventory(), []); await close();
  }
  await page.evaluate(() => { __remake.scene.inventory = [5]; }); await action(0, 1);
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 2); await close();
  await page.evaluate(() => { __remake.scene.flags[34] = 0; __remake.scene.player.setPosition(150, 113); __remake.scene.player.facing = 'u'; __remake.scene.interactionCooldown = 0; });
  await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue?.choice);
  await page.route('**/rooms/room_ruins8.json', async (route) => { await new Promise((resolve) => setTimeout(resolve, 250)); await route.continue(); });
  await page.evaluate(() => { window.inventoryRoomChange = __remake.scene.openRoom('room_ruins8'); });
  await key('ArrowRight'); await key('z');
  await page.evaluate(() => window.inventoryRoomChange);
  await page.unroute('**/rooms/room_ruins8.json');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue), null, 'Đổi phòng hủy lựa chọn cũ ngay trong lúc đang tải.');
  assert.equal(await page.evaluate(() => __remake.scene.flags[34]), 0);
  await page.evaluate(async () => { const world = __remake.scene; world.inventory = []; world.flags = { 6: 1 }; await world.openRoom('room_ruins7A'); });
  for (let count = 1; count <= 3; count++) { await candy(); await close(); }
  assert.deepEqual(await inventory(), [1, 1, 1]); assert.equal(await page.evaluate(() => __remake.scene.flags[34]), 4);
  // Cờ cuộc gọi thay đổi lời dặn, sau cùng mở lại được điện thoại.
  await page.evaluate(async () => { const world = __remake.scene; world.flags = { 37: 1 }; world.plot = 9; world.kills = 1; await world.openRoom('room_ruins7', 'obj_markerA'); });
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.some(({ item }) => item.ObjectName === 'obj_smallfrog')), false);
  assert.equal(await page.evaluate(() => !__remake.scene.colliders.some((body) => body.objectName === 'obj_smallfrog' && !body.disabled)), true);
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 11); assert.equal(await page.evaluate(() => __remake.scene.flags[37]), 2); await close();
  await page.evaluate(() => { const world = __remake.scene; world.player.setPosition(210, 140); world.hp = 1; world.interactionCooldown = 0; });
  await key('z'); await close(); await page.waitForFunction(() => __remake.phase === 'saving'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Ruins - Leaf Pile'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.hp), 30);
  for (const battle of ['dummy', 'tutorialFroggit']) {
    await page.evaluate(async (battle) => {
      const world = __remake.scene;
      world.inventory = [1]; world.flags = {}; world.hp = 5; world.maxHp = 20; world.plot = 9; world.armor = 4; world.weapon = 3; world.weaponStrength = 0;
      await world.openRoom(battle === 'dummy' ? 'room_ruins4' : 'room_ruins5'); __remake.startBattle(battle);
    }, battle);
    await page.waitForFunction(() => __remake.phase === 'battle');
    await key('ArrowRight'); await key('ArrowRight'); await key('z');
    await page.waitForFunction(() => __remake.scene.kind === 'item' && __remake.scene.mode === 'submenu'); await key('z');
    await page.waitForFunction(() => __remake.scene.mode === 'pages');
    assert.equal(await page.evaluate(() => __remake.scene.hp), 15); assert.deepEqual(await page.evaluate(() => __remake.scene.previousScene.inventory), []);
    await key('z');
    if (battle === 'dummy') {
      await page.waitForFunction(() => __remake.scene.mode === 'dummyTurn'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'menu');
      await key('z'); assert.equal(await page.evaluate(() => __remake.scene.mode), 'menu', 'ITEM trống không tạo kẹo miễn phí.');
      await key('ArrowRight'); await key('z'); await key('ArrowDown'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'pages'); await key('z');
    } else {
      await page.waitForFunction(() => __remake.scene.mode === 'intervention'); await page.waitForFunction(() => __remake.scene.mode === 'pages'); await key('z');
    }
    await page.waitForFunction(() => __remake.phase === 'running'); assert.equal(await page.evaluate(() => __remake.scene.hp), 15);
  }
  console.log('✓ Túi 8 ô, bát kẹo/Yes-No/đổ kẹo, USE/INFO/DROP, 13 vật phẩm đầu, đổi trang bị, lưu/nạp và ITEM trong hai trận hướng dẫn; cuộc gọi/frog/SAVE phòng lá');
}
