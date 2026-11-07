import assert from 'node:assert/strict';

export async function testHotlandVulkin(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(() => structuredClone({ flags: __remake.scene.flags, plot: __remake.scene.plot }));
  const cases = [
    [127,{},false],[191,{7:1},false],[192,{},false],[192,{7:1},true],[192,{8:1},true],
    [192,{7:1,205:1},false],[192,{7:1,206:1},false],[192,{7:1,26:12},false],
  ];
  for (const [plot,flags,expected] of cases) {
    const actual = await page.evaluate(async ({plot,flags}) => {
      const w = __remake.scene; w.plot = plot; w.flags = flags; await w.openRoom('room_fire5');
      return [!!w.hotlandVulkin.entry, w.colliders.some(c => c.objectName === 'obj_vulkinnpc')];
    }, {plot,flags});
    assert.deepEqual(actual,[expected,expected]);
  }
  const dialogue = await page.evaluate(async () => {
    const w = __remake.scene; w.plot = 192; w.flags = {8:1}; await w.openRoom('room_fire5');
    w.player.setPosition(200,765); w.player.facing = 'd';
    const talk = () => { const ok = w.hotlandVulkin.interact(), lines = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); return [ok,lines]; };
    const first = talk(), repeat = talk(); w.flags[7] = 1; const ending = talk();
    return [first,repeat,ending];
  });
  assert.deepEqual(dialogue,[[true,['* Oh...\n* When you hug me, I feel...\n* So spicey.']],[true,['* So spicey.']],[true,['* Oh...\n* Freedoms.','* Feels... so spicey.']]]);
  await page.evaluate(async previous => { const w = __remake.scene; Object.assign(w,previous); await w.openRoom('room_fire3','obj_markerC'); }, previous);
  assert.equal(await page.evaluate(() => __remake.scene.hotlandVulkin),null);
  console.log('✓ Vulkin Hotland: điều kiện xuất hiện, va chạm và hội thoại theo tuyến');
}
