import assert from 'node:assert/strict';

export async function testVulkinCloudWave(page) {
  await page.evaluate(async () => {const w=__remake.game.scene.getScene('World');w.flags={};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.vulkinCloudModule=await import('/src/vulkin-cloud-wave.mjs');vulkinCloudModule.loadVulkinCloudAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='waveFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene;s.soulSpeed=4;s.invFrames=9999;const w=new vulkinCloudModule.VulkinCloudWave(s);s.wave=w;s.soul.setPosition(120,175);
    const old=Math.random;Math.random=()=>0;for(let i=0;i<18;i++)w.step();const before=[w.shots,w.bullets.length];w.step();
    const first=[w.shots,w.bullets.filter(b=>!b.cloud).length];for(let i=0;i<9;i++)w.step();const second=w.shots;Math.random=old;
    for(const b of w.bullets.filter(b=>!b.cloud))b.image.destroy();w.bullets=[w.cloud];w.nextBurst=w.nextCycle=Infinity;
    w.cloud.x=240;w.cloud.y=250;w.cloud.vx=w.cloud.vy=0;s.soul.setPosition(160,170);s.hp=30;s.invFrames=100;
    const bolt=()=>{const b=w.add('spr_vulkinlightning',s.soul.x*2+8,s.soul.y*2+8,{angle:0,speed:0,damage:7,cloud:false});b.image.setOrigin(.5).setMask(w.mask);return b;};
    const a=bolt();w.step();const firstHit=[s.soulSpeed,s.hp,a.image.active];const b=bolt();w.step();const secondHit=[s.soulSpeed,s.hp,b.image.active];
    s.invFrames=0;const c=bolt();w.step();const damage=[s.hp,c.image.active];const all=w.bullets.map(e=>e.image);w.destroy();s.wave=null;
    return {before,first,second,firstHit,secondHit,damage,speed:s.soulSpeed,clean:all.every(i=>!i.active)&&!w.clip.active};
  });
  assert.deepEqual(result.before,[0,1]);assert.deepEqual(result.first,[1,7]);assert.equal(result.second,2);
  assert.deepEqual(result.firstHit,[6,30,false]);assert.deepEqual(result.secondHit,[8,30,false]);assert.deepEqual(result.damage,[23,false]);
  assert.equal(result.speed,4);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Mây sét Vulkin: chu kỳ, bảy tia, tăng tốc SOUL, sát thương và khôi phục');
}
