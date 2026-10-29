import assert from 'node:assert/strict';

export async function testWaterfallUndyneFinal(page) {
  const previous = await page.evaluate(() => { const w = __remake.scene; return structuredClone({ flags: w.flags, plot: w.plot, kills: w.kills, hp: w.hp, maxHp: w.maxHp }); });
  for (const papyrusKilled of [false, true]) {
    await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
    await page.evaluate(async killed => { const w = __remake.scene; w.flags = { 67: Number(killed) }; w.kills = Number(killed); w.plot = 120; await w.openRoom('room_water_undynefinal'); w.player.setPosition(150, 599); w.updateCamera(); w.scene.pause(); }, papyrusKilled);
    await page.waitForFunction(() => !__remake.scene.scene.isActive());
    const result = await page.evaluate(() => {
      const w = __remake.scene, c = w.waterfallUndyneFinal, stages = [], pages = [];
      const initiallyHidden = w.roomObjects.filter(e => e.item.ObjectName === 'obj_magicglass').every(e => e.image.alpha === 0);
      const triggered = c.checkTrigger();
      for (let i = 0; i < 2000 && c.locked; i++) {
        if (!stages.includes(c.stage)) stages.push(c.stage);
        if (w.dialogue) { pages.push(w.dialogue.lines.length); while (w.dialogue) w.advanceDialogue(); }
        c.step();
      }
      return { triggered, initiallyHidden, stages, pages, plot: w.plot, locked: c.locked, visible: w.player.visible,
        save: [c.save?.item.X, c.save?.item.Y, c.save?.interactable], music: w.waterfallMusic?.key };
    });
    assert.equal(result.triggered, true); assert.equal(result.initiallyHidden, true);
    assert.deepEqual([result.plot, result.locked, result.visible, result.save, result.music], [121, false, true, [220,660,true], 'mus_undynetruetheme']);
    assert.equal(result.pages[0], 9); assert.equal(result.pages.at(-1), 20);
    if (papyrusKilled) assert.ok(!result.stages.includes('flashIn')); else assert.ok(result.stages.includes('flashIn') && result.stages.includes('eye'));
    await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water_undynefinal', 'obj_markerA'); });
    await page.waitForFunction(() => __remake.scene.scene.isActive());
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, !!__remake.scene.waterfallUndyneFinal.save, __remake.scene.waterfallUndyneFinal.locked]), [121, true, false]);
  }
  const save = await page.evaluate(async () => {
    const w = __remake.scene, { undyneFinalSaveLine } = await import('/src/waterfall-undyne-final-dialogue.mjs');
    w.player.setPosition(220, 650); w.player.facing = 'd'; w.interactionCooldown = 0; w.tryInteract();
    return [w.dialogue?.lines[0] === undyneFinalSaveLine(w.flags), w.hp === w.maxHp];
  });
  assert.deepEqual(save, [true, true]);
  await page.evaluate(() => { while (__remake.scene.dialogue) __remake.scene.advanceDialogue(); });
  await page.waitForFunction(() => __remake.phase === 'saving');
  await page.evaluate(() => __remake.scene.close());
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Đấu trường Undyne: cảnh trước trận, hai nhánh và điểm lưu');
}
