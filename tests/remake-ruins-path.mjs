import assert from 'node:assert/strict';

export async function testRuinsPath(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(60); };
  await page.evaluate(async () => {
    const world = __remake.scene; world.plot = 9.2; world.flags = {}; world.flags[35] = 0;
    world.kills = 0; world.inventory = []; await world.openRoom('room_ruins7', 'obj_markerA');
    world.player.setPosition(280, 340); world.player.facing = 'r';
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins8');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  await page.evaluate(() => { __remake.scene.player.setPosition(70, 482); });
  await page.waitForFunction(() => __remake.scene.ruinsHoles.cooldown > 0);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), false);
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(() => __remake.scene.player.visible), true);
  assert.equal(await page.evaluate(() => __remake.scene.player.y), 440);
  await page.evaluate(() => { __remake.scene.player.setPosition(280, 110); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_ruins9');
  assert.deepEqual(await page.evaluate(() => ({ x: __remake.scene.player.x, y: __remake.scene.player.y })), { x: 20, y: 100 });
  await page.evaluate(() => { const world = __remake.scene; world.player.setPosition(150, 135); world.player.facing = 'r'; });
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.flags[35]), 1);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.pushed), true);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.entry.image.visible), false);
  assert.equal(await page.evaluate(() => __remake.scene.colliders.find((body) => body.objectName === 'obj_plotwall4').disabled), true);
  assert.equal(await page.evaluate(() => __remake.scene.roomObjects.find(({item}) => item.ObjectName === 'obj_spikes_room').image.texture.key), 'spr_spiketile:1');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_ruins9'); });
  assert.equal(await page.evaluate(() => __remake.scene.flags[35]), 1);
  assert.equal(await page.evaluate(() => __remake.scene.ruinsRock.pushed), true);
  await page.screenshot({ path: 'test-results/remake-ruins-rock.png' });
  console.log('✓ cửa room_ruins7→8→9, hố rơi, đẩy đá, cờ 35, tường và gai mở');
}
