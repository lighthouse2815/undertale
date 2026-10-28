import assert from 'node:assert/strict';
export async function testWaterfallGlowParticles(page) {
  const result=await page.evaluate(async()=>{
    const w=__remake.scene;w.flags={};w.plot=110;await w.openRoom('room_water_bird');w.scene.pause();
    const p=w.waterfallGlowParticles, original=Math.random; Math.random=()=>.5;
    try {
      p.generators.forEach(g=>g.timer=999);p.generators[0].timer=1;p.step();
      const first=p.particles[0], start=[p.generators.length,p.particles.length,first.image.texture.key,first.image.alpha,first.image.y];
      p.generators[0].timer=999;for(let i=0;i<100;i++)p.step(); const after=p.particles.length;
      p.generators[0].x=-1000;p.generators[0].timer=1;p.step();const offscreen=p.particles.length;
      w.scene.resume();return {start,after,offscreen};
    } finally {Math.random=original;}
  });
  assert.deepEqual(result.start.slice(0,3),[10,1,'spr_glowparticle_1:0']);assert.ok(result.start[3]>0);assert.ok(result.start[4]<165);assert.equal(result.after,0);assert.equal(result.offscreen,0);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallGlowParticles),null);
  console.log('✓ Partículas sáng Waterfall: sinh gần camera, chuyển động và dọn');
}
