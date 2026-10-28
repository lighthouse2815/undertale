import assert from 'node:assert/strict';
export async function testShyrenWave(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=110;w.hp=w.maxHp=20;await w.openRoom('room_water12');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle');
  await page.evaluate(async()=>{const s=__remake.scene;window.shyrenWaveModule=await import('/src/shyren-waves.mjs');shyrenWaveModule.loadShyrenWaveAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.scene.pause();});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,old=Math.random;Math.random=()=>.5;
    try {const quiet=new shyrenWaveModule.ShyrenWave(s);for(let i=0;i<49;i++)quiet.step();const before=quiet.bullets.length;quiet.step();const b=quiet.bullets[0],first=[before,quiet.rate,quiet.duration,b.detune,b.dspeed,b.gravityAt];
      const vy=b.vy;b.gravityAt=b.age+1;quiet.step();const gravity=b.vy-vy;
      b.x=s.soul.x*2;b.y=s.soul.y*2;b.vx=b.vy=b.detune=0;b.gravityAt=999;s.hp=20;s.invFrames=0;quiet.step();const hp=s.hp;quiet.destroy();
      const singing=new shyrenWaveModule.ShyrenWave(s,{encourage:5,emotion:1});for(let i=0;i<singing.rate;i++)singing.step();const sung=[singing.rate,singing.duration,singing.encourage,singing.bullets[0].detune,singing.bullets[0].dspeed];const images=singing.bullets.map(b=>b.image);singing.destroy();s.scene.resume();return {first,hp,sung,gravity,clean:images.every(i=>!i.active)};
    } finally {Math.random=old;}
  });
  assert.deepEqual(result.first,[0,50,124,3,1,50]);assert.ok(result.hp<20);assert.ok(Math.abs(result.gravity+.1)<1e-9);assert.deepEqual(result.sung,[4,310,6,2,12]);assert.equal(result.clean,true);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.evaluate(()=>__remake.scene.finishBattle());console.log('✓ Đạn nhạc Shyren: nhịp, nốt, trọng lực, va chạm và dọn');
}
