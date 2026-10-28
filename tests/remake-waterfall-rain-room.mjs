import assert from 'node:assert/strict';
export async function testWaterfallRainRoom(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={85:1};w.plot=111;await w.openRoom('room_water_prewaterfall');window.rainDeep=w.waterfallRain;await w.openRoom('room_water_waterfall');w.scene.pause();});
  const result=await page.evaluate(()=>{const w=__remake.scene,r=w.waterfallRainRoom,old=Math.random;Math.random=()=>.5;try{r.frames=0;for(let i=0;i<50;i++)r.step();r.draw();const result=[r.falls.length,r.drops.length,r.splashes.length,w.waterfallRain===window.rainDeep,Math.round(w.waterfallRainMix.deep*100),Math.round(w.waterfallRainMix.normal*100),r.reflection.texture.key,r.kidReflection.visible];w.scene.resume();return result;}finally{Math.random=old;}});
  assert.equal(result[0],11);assert.ok(result[1]>0);assert.ok(result[2]>0);assert.deepEqual(result.slice(3,6),[true,2,50]);assert.match(result[6],/umbrellafall/);assert.equal(result[7],true);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.evaluate(async()=>{await __remake.scene.openRoom('room_water_prewaterfall');__remake.scene.scene.pause();for(let i=0;i<30;i++)__remake.scene.waterfallUmbrellaRoom.update(34);__remake.scene.scene.resume();});
  assert.deepEqual(await page.evaluate(()=>[Math.round(__remake.scene.waterfallRainMix.deep*100),Math.round(__remake.scene.waterfallRainMix.normal*100)]),[50,8]);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallRain,__remake.scene.waterfallRainLight]),[null,null]);
  console.log('✓ Hành lang mưa: giọt, phản chiếu, thác và hai lớp âm');
}
