import assert from 'node:assert/strict';

export async function testHotlandConveyorEffects(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w=__remake.scene, snapshot=structuredClone({flags:w.flags,plot:w.plot}); w.flags={}; w.plot=127;
    await w.openRoom('room_fire5','obj_markerA'); return snapshot;
  });
  const result = await page.evaluate(() => {
    const w=__remake.scene, e=w.hotlandConveyorEffects, jet=e.jets[0], glass=e.glass[0], tick=n=>{for(let i=0;i<n;i++)e.update(1000/30);};
    e.timer=0; e.level=0; e.emitting=false; e.elapsed=0; w.player.setPosition(150,1500);
    tick(29); const before=jet.jet.visible; tick(1); const start=[e.emitting,e.level,jet.jet.visible]; tick(5); const full=[e.timer,e.level,jet.jet.alpha,jet.top.y];
    tick(30); const ended=[e.emitting,e.level,jet.jet.visible];
    w.player.setPosition(glass.item.X,glass.item.Y-20); tick(5); const lit=glass.image.alpha;
    w.dialogue={}; tick(15); const faded=glass.image.alpha; w.dialogue=null;
    return {counts:[e.jets.length,e.glass.length],before,start,full,ended,lit,faded};
  });
  assert.deepEqual(result.counts,[10,19]); assert.equal(result.before,false); assert.deepEqual(result.start,[true,0,true]);
  assert.equal(result.full[0],50); assert.ok(result.full[1]>.9 && result.full[1]<=1.1 && result.full[2]>.9); assert.ok(result.full[3]>1500);
  assert.deepEqual(result.ended,[false,0,false]); assert.ok(result.lit>.9); assert.equal(result.faded,0);
  await page.evaluate(async previous => {const w=__remake.scene; Object.assign(w,previous); await w.openRoom('room_fire3','obj_markerC');},previous);
  assert.equal(await page.evaluate(()=>__remake.scene.hotlandConveyorEffects),null);
  console.log('✓ Hiệu ứng Hotland: hơi nước theo chu kỳ và kính sáng khi chạm');
}
