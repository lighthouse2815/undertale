import assert from 'node:assert/strict';

export async function testHotlandConveyorPath(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {369:4}; w.plot = 127; await w.openRoom('room_fire3','obj_markerB'); w.player.setPosition(410,30); return snapshot;
  });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_fire5' && __remake.phase === 'running'); await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hotlandMusic.key,__remake.scene.hotlandConveyors.belts.length]),['mus_anothermedium',56]);
  const notice = await page.evaluate(() => {
    const w = __remake.scene; w.player.setPosition(150,895); const triggered = w.hotlandStatus.checkTrigger();
    return [triggered,w.flags[369],w.dialogue?.lines[0]];
  });
  assert.deepEqual(notice,[true,5,'\n* gonna call them in a\n  minute!!! =^0.^0=']);
  await page.evaluate(() => { const w=__remake.scene; while(w.dialogue) w.advanceDialogue(); w.player.setPosition(150,1570); });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.room === 'room_fire3' && __remake.phase === 'running'); await page.keyboard.up('ArrowDown');
  assert.equal(await page.evaluate(() => __remake.scene.hotlandMusic.key),'mus_oogloop');
  const muted = await page.evaluate(async () => {
    const w=__remake.scene; w.flags={368:1,369:4}; await w.openRoom('room_fire5','obj_markerA'); w.player.setPosition(150,895);
    return [w.hotlandStatus.checkTrigger(),w.flags[369],!!w.dialogue];
  });
  assert.deepEqual(muted,[false,5,false]);
  for (const [flags,key,rate] of [[{224:1},'mus_toomuch',1],[{26:12},'mus_anothermedium',.5],[{7:1},'mus_reunited',1]]) {
    const actual = await page.evaluate(async flags => {
      const w=__remake.scene; w.hotlandMusic?.destroy(); w.hotlandMusic=null; w.flags=flags; await w.openRoom('room_fire5','obj_markerA');
      return [w.hotlandMusic.key,w.hotlandMusic.rate];
    },flags);
    assert.deepEqual(actual,[key,rate]);
  }
  await page.evaluate(async () => { const w=__remake.scene; w.hotlandMusic?.destroy(); w.hotlandMusic=null; w.flags={7:1,369:4}; await w.openRoom('room_fire3','obj_markerB'); w.player.setPosition(410,30); w.savedHotlandMusic=w.hotlandMusic; });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_fire5' && __remake.phase === 'running'); await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(() => __remake.scene.hotlandMusic === __remake.scene.savedHotlandMusic),true);
  await page.evaluate(async previous => { const w=__remake.scene; w.hotlandMusic?.destroy(); w.hotlandMusic=null; delete w.savedHotlandMusic; Object.assign(w,previous); await w.openRoom('room_fire3','obj_markerC'); },previous);
  console.log('✓ Đường Hotland: cửa hai chiều, đổi nhạc và trạng thái Alphys');
}
