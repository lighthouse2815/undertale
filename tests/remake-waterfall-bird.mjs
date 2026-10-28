import assert from 'node:assert/strict';
export async function testWaterfallBird(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 116; await w.openRoom('room_water11'); w.player.setPosition(620, 120); window.birdMusic = w.waterfallMusic; });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_water_bird');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.waterfallBird.entry.image.x, __remake.scene.waterfallMusic === window.birdMusic]), [20, 100, true]);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(85, 120); w.player.facing = 'r'; if (!w.waterfallBird.interact()) throw Error('Không tương tác chim'); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /carry you across/);
  await page.evaluate(() => { const w = __remake.scene; w.advanceDialogue(); w.dialogue.choice.index = 1; w.dialogue.choice.readyAt = 0; w.advanceDialogue(); });
  assert.equal(await page.evaluate(() => __remake.scene.waterfallBird.stage), 'idle');
  await page.evaluate(() => { const w = __remake.scene; w.waterfallBird.interact(); w.advanceDialogue(); w.dialogue.choice.readyAt = 0; w.advanceDialogue(); w.scene.pause(); });
  const result = await page.evaluate(() => { const w = __remake.scene, b = w.waterfallBird, stages = new Set(); for (let i = 0; i < 1500 && b.stage !== 'idle'; i++) { stages.add(b.stage); b.step(); } const result = [b.stage, b.right, w.player.x, b.entry.image.x, [...stages]]; w.scene.resume(); return result; });
  assert.equal(result[0], 'idle'); assert.equal(result[1], false); assert.ok(result[2] >= 240 && result[3] < result[2]); assert.ok(result[4].includes('across'));
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  const back = await page.evaluate(() => { const w = __remake.scene, b = w.waterfallBird; w.player.setPosition(b.entry.image.x + 10, b.entry.image.y); w.player.facing = 'l'; b.interact(); w.advanceDialogue(); w.dialogue.choice.readyAt = 0; w.advanceDialogue(); w.scene.pause(); for (let i = 0; i < 1500 && b.stage !== 'idle'; i++) b.step(); const result = [b.stage, b.right, w.player.x]; w.scene.resume(); return result; });
  assert.equal(back[0], 'idle'); assert.equal(back[1], true); assert.ok(back[2] <= 100);
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {85: 1}; await w.openRoom('room_water_bird'); w.player.setPosition(225,120); w.player.facing = 'r'; w.waterfallBird.interact(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /Umbrellas/);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26:10}; await w.openRoom('room_water_bird'); }); assert.equal(await page.evaluate(() => __remake.scene.waterfallBird.entry), null);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Chim chở qua vực: cửa, lựa chọn, chuyến bay và điều kiện');
}
