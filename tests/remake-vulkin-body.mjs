import assert from 'node:assert/strict';

export async function testVulkinBody(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.vulkinBodyModule=await import('/src/vulkin-body.mjs');vulkinBodyModule.loadVulkinBodyAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='bodyFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,b=new vulkinBodyModule.VulkinBody(s);const old=Math.random;Math.random=()=>.5;
    for(let i=0;i<9;i++)b.step();const before=b.smoke.length;b.step();const first=[b.smoke.length,b.smoke[0].image.x,b.smoke[0].image.y];
    for(let i=0;i<15;i++)b.step();const second=b.smoke.length;
    b.face='spr_vulkinface3';b.step();const face=b.head.texture.key;b.pause=1;b.step();const paused=[b.siner,b.face,b.head.texture.key];
    for(let i=0;i<60;i++)b.step();const cleared=b.smoke.length;Math.random=old;
    const parts=[b.back,b.body,b.lava,b.head,b.front];b.destroy();return {before,first,second,face,paused,cleared,destroyed:parts.every(i=>!i.active)};
  });
  assert.equal(result.before,0);assert.equal(result.first[0],1);assert.ok(result.first[1]>70&&result.first[1]<85&&result.first[2]>60&&result.first[2]<65);
  assert.equal(result.second,2);assert.match(result.face,/spr_vulkinface3:/);assert.deepEqual(result.paused,[0,'spr_vulkinface5','spr_vulkinface5:0']);assert.equal(result.cleared,0);assert.equal(result.destroyed,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Hình thể Vulkin: chân, miệng núi lửa, biểu cảm, khói và dọn');
}
