import assert from 'node:assert/strict';

export async function testHotlandVents(page){
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});w.flags={408:5};w.plot=127;
    await w.openRoom('room_fire6','obj_markerA');w.hotlandEncounter.steps=100000;w.player.setPosition(330,285);return snapshot;
  });
  assert.deepEqual(await page.evaluate(()=>__remake.scene.hotlandVents.vents.map(e=>e.direction)),['right','left','left','left','down','right','up']);
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.hotlandVents.active?.stage==='align');await page.keyboard.up('ArrowRight');
  const initial=await page.evaluate(()=>[__remake.scene.hotlandVents.active.vent.item.X,__remake.scene.hotlandEncounter.count]);
  assert.equal(initial[0],360);await page.waitForFunction(()=>__remake.scene.hotlandVents.active?.stage==='flight');
  await page.keyboard.press('x');await page.waitForFunction(()=>!__remake.scene.hotlandVents.active);
  const landed=await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.hotlandEncounter.count,__remake.phase,w.hotlandVents.particles.length];});
  assert.deepEqual(landed.slice(0,4),[480,285,initial[1],'running']);assert.ok(landed[4]>0);
  await page.waitForFunction(()=>__remake.scene.hotlandVents.chain===0);
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.scene.hotlandVents.active?.vent.item.X===460);await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(()=>!__remake.scene.hotlandVents.active);assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[340,285]);
  const vertical=await page.evaluate(()=>{const w=__remake.scene,v=w.hotlandVents;w.player.setPosition(560,225);v.chain=0;v.checkTrigger();for(let i=0;i<40&&v.active;i++)v.step();return [w.player.x,w.player.y,!!v.active];});
  assert.deepEqual(vertical,[560,104,false]);
  const chained=await page.evaluate(()=>{const w=__remake.scene,v=w.hotlandVents;w.player.setPosition(260,45);v.chain=3;v.checkTrigger();const stage=v.active.stage;for(let i=0;i<22&&v.active;i++)v.step();return [stage,w.player.x,w.player.y,!!v.active];});
  assert.deepEqual(chained,['launch',260,164,false]);
  const cleanup=await page.evaluate(async()=>{const w=__remake.scene,images=w.hotlandVents.particles.map(p=>p.image);await w.openRoom('room_fire5','obj_markerB');return [w.hotlandVents,images.every(p=>!p.active)];});
  assert.deepEqual(cleanup,[null,true]);
  await page.evaluate(async previous=>{const w=__remake.scene;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Vòi hơi Hotland: kích hoạt, khóa điều khiển, bay hai chiều/dọc và dọn hiệu ứng');
}
