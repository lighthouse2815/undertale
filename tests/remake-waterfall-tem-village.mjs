import assert from 'node:assert/strict';

export async function testWaterfallTemVillage(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water16'); w.waterfallEncounter.disabled = true; w.player.setPosition(520, 600); });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.room === 'room_water_temvillage'); await page.keyboard.up('ArrowDown'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.player.x, w.player.y, w.waterfallMusic.key, w.flags[270], w.waterfallTemVillage.tems.length]; }), [50, 10, 'mus_temvillage', 1, 6]);
  for (const [x, count] of [[145, 2], [213, 2], [246, 2], [393, 3], [450, 3]]) {
    const n = await page.evaluate(x => { const w = __remake.scene, v = w.waterfallTemVillage, e = v.tems.find(e => e.item.X === x); w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; v.interact(); const n = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue(); return n; }, x);
    assert.equal(n, count);
  }
  await page.evaluate(() => { const w = __remake.scene, e = w.waterfallTemVillage.box; w.inventory = [1]; w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; w.tryInteract(); w.dialogue.choice.index = 0; w.dialogue.choice.readyAt = 0; w.advanceDialogue(); });
  await page.waitForFunction(() => __remake.phase === 'itemBox');
  await page.evaluate(() => { const box = __remake.scene; box.column = 0; box.row = 0; box.transfer(); box.close(); }); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.inventory, __remake.scene.flags[301]]), [[], 1]);
  await page.evaluate(() => __remake.scene.scene.pause()); await page.waitForFunction(() => !__remake.scene.scene.isActive());
  const scenes = await page.evaluate(() => {
    const w = __remake.scene, v = w.waterfallTemVillage, e = v.hive; w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; v.interact();
    const hivePages = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue(); for (let i = 0; i < 200; i++) v.step(); const hive = [hivePages, w.flags[269], v.locked, v.hive.image.texture.key];
    const j = v.judge; w.player.setPosition(j.item.X, j.item.Y + j.sprite.MarginBottom - 18); w.player.facing = 'u'; v.interact();
    for (let i = 0; i < 16; i++) v.step(); const dance = [v.stage, w.dialogue?.lines.length, !!v.danceSound]; while (w.dialogue) w.advanceDialogue(); for (let i = 0; i < 81; i++) v.step(); const summary = w.dialogue?.lines.length; while (w.dialogue) w.advanceDialogue();
    return { hive, dance, summary, finish: [v.locked, v.judgeTalked, v.judge.image.texture.key] };
  });
  assert.deepEqual(scenes.hive, [3, 1, false, 'spr_temmie_hivetalk:0']); assert.deepEqual(scenes.dance, ['dance', 1, true]); assert.equal(scenes.summary, 2); assert.deepEqual(scenes.finish, [false, 1, 'spr_mushroomdance_prep:0']);
  await page.evaluate(() => { const w = __remake.scene; w.scene.resume(); w.player.setPosition(50, 10); }); await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_water16'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallMusic.key, __remake.scene.waterfallTemVillage]), [520, 600, 'mus_waterfall', null]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 10}; w.plot = 117; await w.openRoom('room_water_temvillage'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.waterfallTemVillage.tems.length, __remake.scene.waterfallTemVillage.hive, __remake.scene.waterfallTemVillage.judge]), [0, null, null]);
  console.log('✓ Làng Temmie: cửa, nhạc, dân làng, tổ, múa nấm và tuyến');
}
