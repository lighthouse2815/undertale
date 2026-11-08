import assert from 'node:assert/strict';

export async function testTsunderplaneBombs(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:1};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.tsunderBombs=await import('/src/tsunderplane-bombs.mjs');tsunderBombs.loadTsunderplaneBombAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='waveFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,w=new tsunderBombs.TsunderplaneBombs(s);s.wave=w;s.invFrames=99999;const old=Math.random;
    Math.random=()=>0;w.step();const before=w.bullets.length;w.step();const left=w.bullets[0];const first=[left.x,left.vx,left.image.texture.key];
    Math.random=()=>.99;const right=w.spawnPlane();const reverse=[right.x,right.vx,right.image.texture.key];
    w.bullets.forEach(b=>b.image.destroy());w.bullets=[];w.next=Infinity;Math.random=()=>.5;
    const bomb=w.spawnBomb(320,365);bomb.vx=0;w.step();const ignition=w.bullets.filter(b=>b.flame).length;for(let i=0;i<11;i++)w.step();
    const column=w.bullets.filter(b=>b.flame).map(b=>b.number);
    w.bullets.forEach(b=>b.image.destroy());w.bullets=[];const flame=w.spawnFlame(s.soul.x*2,s.soul.y*2,0,12);s.hp=20;s.invFrames=0;w.step();const active=[s.hp,flame.image.active];
    s.hp=30;s.invFrames=0;w.step();const overheal=s.hp;
    s.hp=20;s.invFrames=0;flame.alpha=.8;w.step();const faded=s.hp;const images=w.bullets.map(b=>b.image);w.frames=159;const done=w.step();w.destroy();s.wave=null;Math.random=old;
    return {before,first,reverse,ignition,column,active,overheal,faded,done,clean:images.every(i=>!i.active)&&!w.clip.active};
  });
  assert.equal(result.before,0);assert.deepEqual(result.first,[431,-6,'spr_sideplanebullet:1']);assert.ok(result.reverse[1]>0);assert.equal(result.reverse[2],'spr_sideplanebullet:0');
  assert.equal(result.ignition,1);assert.deepEqual(result.column,Array.from({length:12},(_,i)=>i+1));assert.deepEqual(result.active,[14,true]);assert.equal(result.overheal,22);assert.equal(result.faded,20);assert.equal(result.done,true);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Tsunderplane: máy bay ngang, bom, cột lửa, sát thương và dọn');
}
