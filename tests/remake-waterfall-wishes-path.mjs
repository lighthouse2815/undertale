import assert from 'node:assert/strict';
export async function testWaterfallWishesPath(page) {
  for (const ending of [false,true]) {
    await page.evaluate(async ending => { const w=__remake.scene; w.flags=ending?{7:1}:{}; w.plot=110; if(ending) await w.openRoom('room_tundra_town'); await w.openRoom('room_water11'); w.player.setPosition(460,290); window.wishesPathMusic=w.townMusic; },ending);
    await page.waitForFunction(() => __remake.scene.scene.isActive()); await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowDown'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water12');
    assert.deepEqual(await page.evaluate(ending => { const w=__remake.scene; w.waterfallEncounter.disabled=true; return [w.player.x,w.player.y,ending ? w.townMusic===window.wishesPathMusic : w.waterfallMusic.key]; },ending),[380,20,ending?true:'mus_waterfall']);
    await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water11');
    assert.deepEqual(await page.evaluate(ending => { const w=__remake.scene; return [w.player.x,w.player.y,ending ? w.townMusic===window.wishesPathMusic : w.waterfallMusic.key]; },ending),[460,290,ending?true:'mus_waterquiet']);
  }
  await page.evaluate(async () => { const w=__remake.scene; w.flags={}; await w.openRoom('room_water12'); w.waterfallEncounter.disabled=true; w.player.setPosition(1240,520); window.wishesBirdMusic = w.waterfallMusic; });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water_bird');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic === window.wishesBirdMusic]),[20,100,true]);
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase==='transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.phase==='running' && __remake.room==='room_water11');
  assert.equal(await page.evaluate(() => __remake.scene.waterfallMusic === window.wishesBirdMusic), true);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Cửa phòng sao ↔ Waterfall 12 và lối sang chim');
}
