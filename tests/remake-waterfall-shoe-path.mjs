import assert from 'node:assert/strict';
export async function testWaterfallShoePath(page) {
  for (const ending of [false,true]) {
    await page.evaluate(async ending => { const w=__remake.scene; w.flags=ending?{7:1}:{}; w.plot=110; if(ending) await w.openRoom('room_tundra_town'); await w.openRoom('room_water12'); w.waterfallEncounter.disabled=true; w.player.setPosition(20,440); window.shoePathMusic=ending?w.townMusic:w.waterfallMusic; },ending);
    await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water_shoe');
    assert.deepEqual(await page.evaluate(ending => {const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.shoePathMusic];},ending),[290,110,true]);
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water12');
    assert.deepEqual(await page.evaluate(ending => {const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallMusic)===window.shoePathMusic];},ending),[20,440,true]);
  }
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Cửa Waterfall 12 ↔ phòng Ballet Shoes và nhạc');
}
