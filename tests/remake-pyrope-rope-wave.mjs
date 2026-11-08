import assert from 'node:assert/strict';

export async function testPyropeRopeWave(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:2};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.pyropeRope=await import('/src/pyrope-rope-wave.mjs');window.tsunderCollision=(await import('/src/tsunderplane-planes.mjs')).touchesTsunderplane;pyropeRope.loadPyropeRopeAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='waveFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,w=new pyropeRope.PyropeRopeWave(s);s.wave=w;s.invFrames=9999;const old=Math.random;Math.random=()=>.5;
    for(let i=0;i<9;i++)w.step();const before=w.bullets.length;w.step();const root=w.bullets[0];const initial=[root.x,root.y,root.age];w.step();
    const pieces=[w.bullets.filter(b=>b.rope).length,w.bullets.filter(b=>b.fire===true).length];w.next=Infinity;root.x=300;root.y=160;root.vx=root.vy=0;root.partner.x=300;root.partner.y=330;root.partner.vx=root.partner.vy=0;
    const f=root.fire[0];f.phase=0;let found=false;
    const touchesTsunderplaneForTest=(n)=>window.tsunderCollision(s,'spr_orangefire',root.x+Math.sin(n/3)*2,root.y+f.offset+Math.cos(n/3)*2);
    for(let dx=-12;dx<=18&&!found;dx++)for(let dy=-12;dy<=18&&!found;dy++){
      s.soul.setPosition((300+dx)/2,(280+dy)/2);
      found=touchesTsunderplaneForTest(1)&&touchesTsunderplaneForTest(2)&&!window.tsunderCollision(s,'spr_ropebul',root.x,root.y);
    }
    s.invFrames=0;s.hp=20;w.oldHeart={x:s.soul.x*2-3,y:s.soul.y*2};w.step();const moving=s.hp;w.step();const still=s.hp;
    root.dead=true;w.step();const detached=w.bullets.filter(b=>b.fire===true).length;
    const images=w.bullets.map(b=>b.image);w.frames=179;const done=w.step();w.destroy();s.wave=null;Math.random=old;return {before,initial,pieces,found,moving,still,detached,done,clean:images.every(i=>!i.active)&&!w.clip.active};
  });
  assert.equal(result.before,0);assert.deepEqual(result.initial,[403,150,1]);assert.deepEqual(result.pieces,[2,3]);assert.equal(result.found,true);
  assert.equal(result.moving,20);assert.equal(result.still,14);assert.equal(result.detached,0);assert.equal(result.done,true);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Pyrope: hai dây, lửa cam khi đứng yên, nhịp và dọn');
}
