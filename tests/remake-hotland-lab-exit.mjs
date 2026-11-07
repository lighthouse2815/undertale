import assert from 'node:assert/strict';

export async function testHotlandLabExit(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot });
    w.flags = {}; w.plot = 127; await w.openRoom('room_fire_lab1', 'obj_markerD'); return snapshot;
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire3'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.hotlandLabEntrance.side, w.hotlandMusic.key, !!w.labMusic, w.hotlandLabOutside.edges.length, w.hotlandLabOutside.pipes.length]; }), [true,'mus_oogloop',false,12,12]);
  for (const [x,y,direction,flag,message] of [[177,225,'ArrowRight',2,"* just realized i didn't watch\n  undyne fight the human v.v"],[357,225,'ArrowRight',3,"* well i know she's unbeatable\n  i'll ask her abt it later ^0.^0 "],[410,135,'ArrowUp',4,'* for now i gotta call up the\n  human and guide them =^0.^0=']]) {
    await page.evaluate(([x,y]) => { const w=__remake.scene; w.player.setPosition(x,y); w.updateCamera(); },[x,y]);
    await page.keyboard.down(direction); await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up(direction);
    const status = await page.evaluate(() => { const w=__remake.scene; return [w.flags[369],w.dialogue.lines[0],w.hotlandStatus.title.text,w.hotlandStatus.title.tintTopLeft]; });
    assert.equal(status[0],flag); assert.equal(status[1],`\n${message}`); assert.deepEqual(status.slice(2),['ALPHYS updated status.',0xffff00]);
    await page.evaluate(() => { const w=__remake.scene; while(w.dialogue)w.advanceDialogue(); });
  }
  await page.evaluate(() => __remake.scene.player.setPosition(55,225));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_fire_lab1'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.equal(await page.evaluate(() => __remake.scene.player.x),1056);
  await page.evaluate(async () => { const w=__remake.scene; await w.openRoom('room_fire3','obj_markerC'); w.player.setPosition(200,225); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hotlandStatus.checkTrigger(),!!__remake.scene.dialogue,__remake.scene.flags[369]]),[false,false,4]);
  const muted = await page.evaluate(async () => {
    const w=__remake.scene; w.flags={368:1}; await w.openRoom('room_fire3','obj_markerC'); w.player.setPosition(200,225);
    return [w.hotlandStatus.checkTrigger(),w.flags[369],!!w.dialogue];
  });
  assert.deepEqual(muted,[false,2,false]);
  const closed = await page.evaluate(async () => { const w=__remake.scene; w.flags={492:1}; await w.openRoom('room_fire3','obj_markerC'); return [w.hotlandLabEntrance.locked,w.doors.some(d=>d.destination==='room_fire_lab1')]; });
  assert.deepEqual(closed,[true,false]);
  await page.evaluate(previous => Object.assign(__remake.scene,previous),previous);
  console.log('✓ Lối ra lab: cửa hai chiều/khóa, nhạc, hiệu ứng và ba trạng thái Alphys/tắt tin');
}
