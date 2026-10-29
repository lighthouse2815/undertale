import assert from 'node:assert/strict';

export async function testHotlandLabGuards(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 122; await w.openRoom('room_fire_prelab', 'obj_markerA'); return snapshot;
  });
  const talk = await page.evaluate(() => {
    const w = __remake.scene, g = w.hotlandLabGuards; w.player.setPosition(180, 55); w.player.facing = 'u';
    const pages = [];
    for (let i = 0; i < 3; i++) { g.interact(); pages.push(w.dialogue.lines); while (w.dialogue) w.advanceDialogue(); }
    window.labDragon = g.dragon; return [!!g.rabbit, !!g.dragon, g.talks, pages.map(p => p.length), pages[0][0], pages[2][0]];
  });
  assert.deepEqual(talk, [true, true, 3, [3, 4, 2], '* Sorry... UNDYNE, like, told\n  us there was totally a\n  human in the area.', '* Hey!\n* No loitering!']);
  const field = await page.evaluate(async () => {
    const w = __remake.scene; w.flags = { 26: 12 }; w.plot = 122; await w.openRoom('room_fire_prelab', 'obj_markerA');
    const g = w.hotlandLabGuards; w.player.setPosition(190, 60); w.player.facing = 'u'; g.update(34); const shown = g.interact();
    const result = [window.labDragon.active, g.rabbit, g.fieldImages.length, w.colliders.includes(g.fieldCollider), shown, w.dialogue.lines[0]];
    while (w.dialogue) w.advanceDialogue(); return result;
  });
  assert.deepEqual(field, [false, null, 3, true, true, "* (It's a forcefield.)"]);
  for (const [plot, flags] of [[136, {}], [122, { 402: 1 }], [185, { 26: 12 }]]) {
    assert.deepEqual(await page.evaluate(async ([plot, flags]) => { const w = __remake.scene; w.plot = plot; w.flags = flags; await w.openRoom('room_fire_prelab', 'obj_markerA'); return [!!w.hotlandLabGuards.rabbit, !!w.hotlandLabGuards.field]; }, [plot, flags]), [false, false]);
  }
  await page.evaluate(previous => { Object.assign(__remake.scene, previous); delete window.labDragon; }, previous);
  console.log('✓ Lính gác lab: ba lượt thoại, va chạm, hàng rào và điều kiện biến mất');
}
