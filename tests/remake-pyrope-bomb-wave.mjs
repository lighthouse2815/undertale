import assert from 'node:assert/strict';

export async function testPyropeBombWave(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:2};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.pyropeBomb=await import('/src/pyrope-bomb-wave.mjs');pyropeBomb.loadPyropeBombAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='waveFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,w=new pyropeBomb.PyropeBombWave(s);s.wave=w;s.invFrames=99999;w.next=Infinity;const old=Math.random;Math.random=()=>.5;
    const types=[0,1,2,3].map(t=>{const b=w.spawnBomb(t);return [b.x,b.y,b.vx,b.vy,b.image.angle];});
    w.bullets.forEach(b=>b.image.destroy());w.bullets=[];const b=w.spawnBomb(0);b.x=320;b.y=376;b.vx=0;b.vy=4;w.step();const bounce=[b.bounce,b.vy<0];
    for(let i=0;i<13;i++)w.step();const armed=[b.flash,b.explodeAt<Infinity];b.explodeAt=w.frames+1;w.step();const blast=w.bullets.find(b=>b.blast);const ignition=!!blast;
    blast.startX=s.soul.x*2+8;blast.startY=s.soul.y*2+8;s.hp=20;s.invFrames=0;w.step();const hit=[s.hp,blast.image.active];
    s.hp=30;s.invFrames=0;w.step();const overheal=s.hp;s.invFrames=99999;for(let i=0;i<25;i++)w.step();const faded=blast.image.active;
    const imgs=w.bullets.map(b=>b.image);w.frames=179;const done=w.step();w.destroy();s.wave=null;Math.random=old;return {types,bounce,armed,ignition,hit,overheal,faded,done,clean:imgs.every(i=>!i.active)&&!w.clip.active};
  });
  assert.deepEqual(result.types,[[320,165,3.5,0,0],[200,285,0,4,-90],[320,405,3.5,0,-180],[440,285,0,4,90]]);
  assert.deepEqual(result.bounce,[1,true]);assert.deepEqual(result.armed,[14,true]);assert.equal(result.ignition,true);assert.deepEqual(result.hit,[14,true]);assert.equal(result.overheal,22);assert.equal(result.faded,false);assert.equal(result.done,true);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Pyrope: bom bốn hướng, nảy, hẹn nổ, vụ nổ và sát thương');
}
