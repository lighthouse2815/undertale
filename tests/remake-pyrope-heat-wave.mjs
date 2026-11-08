import assert from 'node:assert/strict';

export async function testPyropeHeatWave(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:2};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('pyrope');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_pyrope'&&!!__remake.scene.heatEffect);
  const result=await page.evaluate(()=>{
    const s=__remake.scene,e=s.heatEffect,ctx=s.game.canvas.getContext('2d'),a=s.arena,x=Math.floor(a.x),y=Math.floor(a.y),width=Math.floor(a.width),height=Math.floor(a.height);
    const paint=()=>{ctx.fillStyle='#000';ctx.fillRect(x-10,y,width+20,height);ctx.fillStyle='#fff';for(let i=0;i<width;i+=6)ctx.fillRect(x+i,y,3,height);};
    const pixels=()=>Array.from(ctx.getImageData(x,y,width,height).data);const differs=(a,b)=>a.some((v,i)=>v!==b[i]);
    paint();const before=pixels();s.rules.heatWave=5;e.render();const distorted=differs(before,pixels());
    paint();const clean=pixels();s.rules.heatWave=0;e.render();const unchanged=!differs(clean,pixels());
    s.rules.heatWave=3;const phase=e.phase;e.step();const advanced=e.phase>phase;
    const count=s.cameras.main.listenerCount('postrender');e.destroy();const removed=s.cameras.main.listenerCount('postrender')===count-1;s.rules.heatWave=0;
    return {distorted,unchanged,advanced,removed};
  });
  assert.deepEqual(result,{distorted:true,unchanged:true,advanced:true,removed:true});
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Pyrope: méo vùng chiến đấu theo nhiệt và dọn sự kiện vẽ');
}
