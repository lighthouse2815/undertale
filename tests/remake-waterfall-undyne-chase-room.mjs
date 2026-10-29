import assert from 'node:assert/strict';

export async function testWaterfallUndyneChaseRoom(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, kills: w.kills, hp: w.hp, maxHp: w.maxHp });
    w.flags = { 99: 1, 351: 1300 }; w.plot = 121; w.hp = w.maxHp = 100; await w.openRoom('room_water_undynefinal', 'obj_markerB');
    w.waterfallMusic?.destroy(); w.waterfallMusic = w.sound.add('mus_undynefast', { loop: true }); w.waterfallMusic.play(); window.undyneChaseMusic = w.waterfallMusic;
    w.player.setPosition(150, 540); return snapshot;
  });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal2'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const start = await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneFinal; return [w.waterfallMusic === window.undyneChaseMusic, c.stage, w.flags[17], c.chaser.y - w.player.y, !!c.ice]; });
  assert.deepEqual([start[0], start[1], start[2], start[4]], [true, 'chase', 1, true]); assert.ok(Math.abs(start[3] - 100) <= 20);
  const movement = await page.evaluate(() => {
    const w = __remake.scene, c = w.waterfallUndyneFinal; c.chaseDelay = 0; c.chaser.setPosition(140, 350); w.player.setPosition(140, 300);
    c.ice.image.x = 339; const y = c.chaser.y; c.step(); return [c.chaser.y < y, c.chaser.texture.key.startsWith('spr_undyne_helmet_u:'), c.ice.image.x];
  });
  assert.deepEqual(movement, [true, true, -50]);
  await page.evaluate(() => { const w = __remake.scene, c = w.waterfallUndyneFinal; c.chaser.setPosition(140, 330); w.player.setPosition(140, 360); c.stepChase(); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.scene.key, __remake.scene.enemyHp, __remake.scene.previousScene.flags[99]]), ['UndyneBattle', 1300, 2]);
  await page.evaluate(() => { const s = __remake.scene; s.green = false; s.choose('mercy', ['Spare','Flee']); s.subIndex = 1; s.confirmPressed = true; s.updateSubmenu(); });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.waitForFunction(() => __remake.scene.waterfallUndyneFinal?.stage === 'chase');
  assert.equal(await page.evaluate(() => __remake.scene.flags[17]), 1);
  await page.evaluate(() => { const w = __remake.scene; w.waterfallUndyneFinal.chaseDelay = 9999; w.waterfallUndyneFinal.chaser.setPosition(140, 0); w.player.setPosition(140, 440); });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.room === 'room_water_undynefinal'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallMusic === window.undyneChaseMusic, __remake.scene.waterfallUndyneFinal.encounterEnabled, __remake.scene.flags[17]]), [true, false, 0]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags[7] = 1; w.plot = 122; await w.openRoom('room_water_undynefinal2', 'obj_markerA'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallUndyneFinal.chaser ?? null, __remake.scene.waterfallUndyneFinal.ice, __remake.scene.flags[17]]), [null, null, 0]);
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.undyneChaseMusic; }, previous);
  console.log('✓ Undyne phòng truy đuổi: cửa, nhạc, băng, bắt/đấu lại và nhánh kết thúc');
}
