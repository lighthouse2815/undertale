import assert from 'node:assert/strict';
export async function testWaterfallFriendlyNap(page) {
  for (const befriended of [false, true]) {
    await page.evaluate(async befriended => { const w = __remake.scene; w.flags = {17:2,389:4,36:befriended ? 1 : 0}; w.plot = 116; await w.openRoom('room_water_friendlyhub'); w.player.setPosition(290,195); }, befriended);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.flags[17], __remake.scene.flags[389]]), [0,5]);
    await page.waitForFunction(() => __remake.scene.scene.isActive());
    await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.scene.waterfallFriendlyHub.stage === 'turn'); await page.keyboard.up('ArrowUp');
    const result = await page.evaluate(() => { const w = __remake.scene, hub = w.waterfallFriendlyHub; w.scene.pause(); for (let i=0;i<40 && hub.stage!=='talking';i++) hub.step(); const lines = [...w.dialogue.lines]; while (w.dialogue) w.advanceDialogue(); for (let i=0;i<30;i++) hub.step(); const state = [hub.stage,w.plot,hub.nap.y]; w.scene.resume(); return {lines,state}; });
    assert.match(result.lines[0], befriended ? /house/ : /followed/); assert.deepEqual(result.state, ['done',117,-30]);
  }
  await page.waitForFunction(() => __remake.scene.scene.isActive());
  await page.evaluate(async () => { const w = __remake.scene; w.plot = 117; await w.openRoom('room_water_friendlyhub'); }); assert.equal(await page.evaluate(() => __remake.scene.waterfallFriendlyHub.nap), undefined);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Cảnh Napstablook Quiet Area: kích hoạt, hai nhánh và plot');
}
