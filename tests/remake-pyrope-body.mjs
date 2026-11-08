import assert from 'node:assert/strict';

export async function testPyropeBody(page){
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={408:2};w.hp=w.maxHp=20;w.lv=1;w.armorDefense=0;w.inventory=[];await w.openRoom('room_fire5','obj_markerA');__remake.startBattle('froggit');});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_froggit');
  await page.evaluate(async()=>{const s=__remake.scene;window.pyropeBody=await import('/src/pyrope-body.mjs');pyropeBody.loadPyropeBodyAssets(s);if(s.load.list.size)await new Promise(resolve=>{s.load.once('complete',resolve);s.load.start();});s.mode='bodyFixture';});
  const result=await page.evaluate(()=>{
    const s=__remake.scene,b=new pyropeBody.PyropeBody(s);b.step();const normal=[b.siner,b.segments.length,b.segments.map(p=>p.texture.key),b.head.texture.key,b.left.y,b.right.y];
    b.hurt=true;b.step();const hurt=[b.siner,b.head.texture.key,b.rotto];const all=[b.left,b.right,...b.segments,b.head];b.destroy();return {normal,hurt,clean:all.every(p=>!p.active)};
  });
  assert.equal(result.normal[0],1);assert.equal(result.normal[1],6);assert.deepEqual(result.normal[2],Array.from({length:6},(_,i)=>`spr_pyropebody:${i}`));assert.equal(result.normal[3],'spr_pyropehead:0');assert.equal(result.normal[4],result.normal[5]);
  assert.deepEqual(result.hurt,[28,'spr_pyropehead2:0',1]);assert.equal(result.clean,true);
  await page.evaluate(()=>__remake.scene.finishBattle());await page.waitForFunction(()=>__remake.phase==='running');
  console.log('✓ Hình thể Pyrope: sáu đốt, chân, đầu và phản ứng trúng đòn');
}
