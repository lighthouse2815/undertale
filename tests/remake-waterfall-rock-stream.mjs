import assert from 'node:assert/strict';

export async function testWaterfallRockStream(page) {
  const open=(flags={})=>page.evaluate(async flags=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=101;await w.openRoom('room_water3');w.scene.pause();},flags);
  await open();
  const result=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallRockStream;for(let i=0;i<14;i++)c.step();const before=c.rocks.length;c.step();const spawned=c.rocks.map(r=>[r.x,r.y]);const r=c.rocks[0];r.x=235;r.y=80;w.player.setPosition(235,84);c.step();const push=[w.player.y,r.y];const y=r.y,rate=c.rateTime;c.step(true);const pause=[r.y===y,c.rateTime===rate];w.player.setPosition(230,160);const triggered=c.checkTrigger(),alpha=w.player.alpha;let steps=0;while(c.falling&&steps++<30)c.step();const fall=[triggered,alpha,steps,w.player.y,w.player.alpha,c.falling];w.player.setPosition(50,100);r.y=181;c.step();const trail=r.trail;for(let i=0;i<30;i++)c.step();const removed=!r.image.active;w.scene.resume();return {before,spawned,push,pause,fall,trail,removed};});
  assert.equal(result.before,0);assert.deepEqual(result.spawned,[[235,-12],[325,-12],[255,-252],[345,-252],[235,-432],[255,-452],[325,-472],[345,-492]]);
  assert.equal(result.trail,true);assert.equal(result.removed,true);assert.deepEqual(result.push,[88,84]);assert.deepEqual(result.pause,[true,true]);assert.deepEqual(result.fall,[true,.5,21,286,1,false]);
  await open({26:8});assert.equal(await page.evaluate(()=>{const c=__remake.scene.waterfallRockStream;for(let i=0;i<300;i++)c.step();return c.rocks.length;}),0);await page.evaluate(()=>__remake.scene.scene.resume());
  await open({26:8,27:1});assert.equal(await page.evaluate(()=>{const c=__remake.scene.waterfallRockStream;for(let i=0;i<15;i++)c.step();return c.rocks.length;}),8);
  const cleaned=await page.evaluate(async()=>{const w=__remake.scene,c=w.waterfallRockStream,i=c.rocks[0].image;w.scene.resume();await w.openRoom('room_water1');return [w.waterfallRockStream,i.active];});assert.deepEqual(cleaned,[null,false]);
  console.log('✓ Dòng đá Waterfall: tám đá/chu kỳ, đẩy/rơi, tạm dừng, tuyến giết và dọn');
}
