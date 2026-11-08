import assert from 'node:assert/strict';

export async function testTsunderplaneBody(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:1};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.tsunderBody=await import('/src/tsunderplane-body.mjs');tsunderBody.loadTsunderplaneBodyAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='bodyFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,r={graze:0},b=new tsunderBody.TsunderplaneBody(s,r),old=Math.random;Math.random=()=>.5;
    for(let i=0;i<9;i++)b.step();const before=b.smoke.length;b.step();const first=[b.smoke.length,b.smoke[0].image.x,b.smoke[0].image.y];
    r.graze=1;b.step();const firstBlush=[b.blush.visible,b.blush.texture.key,b.flash];r.graze=4;b.step();const fourth=b.blush.texture.key;
    b.hurt=true;const frozen=b.siner;for(let i=0;i<4;i++)b.step();const paused=b.siner;const items=[b.plane,b.hat,b.blush,...b.smoke.map(p=>p.image)];b.destroy();Math.random=old;
    return {before,first,firstBlush,fourth,frozen,paused,clean:items.every(i=>!i.active)};
  });
  assert.equal(result.before,0);assert.equal(result.first[0],1);assert.ok(result.first[1]>40&&result.first[1]<50&&result.first[2]>40&&result.first[2]<50);
  assert.deepEqual(result.firstBlush,[true,'spr_tsunderplane_blush:0',7]);assert.equal(result.fourth,'spr_tsunderplane_blush:3');assert.equal(result.frozen,result.paused);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Hình thể Tsunderplane: bay, má đỏ, khói và dừng khi bị đánh');
}
