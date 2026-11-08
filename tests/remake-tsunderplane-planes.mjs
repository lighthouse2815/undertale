import assert from 'node:assert/strict';

export async function testTsunderplanePlanes(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:1};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.planeWaveModule=await import('/src/tsunderplane-planes.mjs');window.planeRulesModule=await import('/src/tsunderplane-rules.mjs');planeWaveModule.loadTsunderplanePlaneAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='waveFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,r=new planeRulesModule.TsunderplaneRules(),w=new planeWaveModule.TsunderplanePlanes(s,r,{green:true});s.wave=w;s.invFrames=99999;
    const old=Math.random;Math.random=()=>.5;for(let i=0;i<4;i++)w.step();const before=w.planes.length;w.step();const plane=w.planes[0];const initial=[plane.x,plane.y,plane.vy,!!plane.green];
    w.next=Infinity;plane.x=280;plane.y=290;plane.vy=0;plane.green.x=262;plane.green.y=282;let found=false;
    for(let dx=-25;dx<65&&!found;dx+=2)for(let dy=-20;dy<60&&!found;dy+=2){s.soul.setPosition((plane.x+dx)/2,(plane.y+dy)/2);found=w.touches('spr_vertplanegreen',plane.green.x,plane.green.y)&&!w.touches('spr_vertplanemask',plane.x,plane.y);}
    w.step();const grazed=[r.graze,plane.green===null,s.hp];w.step();const once=r.graze;
    plane.age=9;plane.y=250;w.step();const exhaust=w.bullets.filter(b=>b.exhaust).map(b=>b.off);
    const p=w.spawnPlane();p.x=280;p.y=290;p.vy=0;let hit=false;
    for(let dx=0;dx<45&&!hit;dx+=2)for(let dy=0;dy<45&&!hit;dy+=2){s.soul.setPosition((p.x+dx)/2,(p.y+dy)/2);hit=w.touches('spr_vertplanemask',p.x,p.y);}
    s.invFrames=0;s.hp=20;w.step();const damage=[s.hp,p.image.active];Math.random=old;
    const imgs=w.bullets.map(b=>b.image);w.destroy();
    const group=new planeWaveModule.TsunderplanePlanes(s,r,{green:true,population:2});group.next=Infinity;s.invFrames=99999;s.soul.setPosition(119,180);
    const g=group.spawnPlane();g.y=250;g.age=9;g.vy=0;group.step();const groupFlames=group.bullets.filter(b=>b.exhaust).length;
    group.frames=159;const done=group.step();group.destroy();s.wave=null;return {before,initial,found,grazed,once,exhaust,hit,damage,groupFlames,done,clean:imgs.every(i=>!i.active)&&!w.clip.active};
  });
  assert.equal(result.before,0);assert.deepEqual(result.initial,[302,50+8/1.3,8/1.3,true]);assert.equal(result.found,true);assert.deepEqual(result.grazed,[1,true,20]);assert.equal(result.once,1);
  assert.deepEqual(result.exhaust,[2]);assert.equal(result.hit,true);assert.deepEqual(result.damage,[14,false]);assert.equal(result.groupFlames,0);assert.equal(result.done,true);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Tsunderplane: máy bay dọc, vùng xanh/mask, khói và sát thương');
}
