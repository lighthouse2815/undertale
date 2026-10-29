import assert from 'node:assert/strict';

export async function testWaterfallUndyneCutscene(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water18'); w.scene.pause(); });
  const result = await page.evaluate(() => {
    const w = __remake.scene, h = w.waterfallUndyneHall, flower = h.flower, s = flower.sprite;
    w.player.setPosition(flower.item.X, flower.item.Y + s.MarginBottom - 18); w.player.facing = 'u'; w.updateCamera(); w.tryInteract();
    const c = h.cutscene, stages = [], lines = [], errors = [];
    if (!c) throw Error('Không bắt đầu cảnh hoa');
    for (let i = 0; i < 5000 && c.locked; i++) {
      if (stages.at(-1) !== c.stage) stages.push(c.stage);
      if (w.dialogue) { lines.push(w.dialogue.lines.length); while (w.dialogue) w.advanceDialogue(); }
      try { c.step(); } catch (error) { errors.push(error.message); break; }
    }
    return { stages, lines, errors, locked: c.locked, plot: w.plot, blocked: h.blocker.disabled, visible: h.layers.every(e => e.visible), halo: h.halo?.active ?? false };
  });
  assert.deepEqual(result.errors, []); assert.equal(result.locked, false); assert.equal(result.plot, 118); assert.equal(result.blocked, true); assert.equal(result.visible, true); assert.equal(result.halo, false);
  for (const stage of ['pan', 'walk1', 'walk2', 'rushfade', 'rushghost', 'rushwalk', 'rushfast', 'flash', 'kidfall', 'kidlook', 'kidlook2', 'grab', 'hold', 'exit', 'panback']) assert.ok(result.stages.includes(stage), stage);
  assert.deepEqual(result.lines, [1, 14, 1, 3, 2, 2]);
  await page.waitForFunction(() => !__remake.scene.scene.isActive()); await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water18'); });
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.waterfallUndyneHall.blocker.disabled]), [118, true]);
  console.log('✓ Hoa Echo: cảnh Undyne, chuyển trận giả, Monster Kid và mở lối');
}
