import assert from 'node:assert/strict';

export async function testHotlandFirstEncounter(page) {
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});
    w.flags={369:5};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;
    await w.openRoom('room_fire5','obj_markerA');w.player.setPosition(150,1530);return snapshot;
  });
  const initial=await page.evaluate(()=>{const e=__remake.scene.hotlandFirstEncounter;return [e.disabled,e.steps,__remake.scene.flags[200]];});
  assert.equal(initial[0],false);assert.ok(initial[1]>=80&&initial[1]<=110);assert.equal(initial[2],205);
  await page.evaluate(()=>{const e=__remake.scene.hotlandFirstEncounter;e.count=Math.ceil(e.steps);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='encounter');await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[408],w.hotlandFirstEncounter.icon.texture.key];}),[1,'spr_exc:0']);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_vulkin');
  await page.evaluate(()=>{__remake.scene.menuIndex=3;});await page.keyboard.press('z');await page.waitForTimeout(60);await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);await page.keyboard.press('z');
  while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages')){await page.keyboard.press('z');await page.waitForTimeout(60);}
  await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[408],w.flags[11],w.hotlandFirstEncounter.disabled];}),[1,1,true]);
  for(const flags of [{7:1},{8:1},{408:1},{205:40}]){
    const disabled=await page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;await w.openRoom('room_fire5','obj_markerA');return w.hotlandFirstEncounter.disabled;},flags);
    assert.equal(disabled,true);
  }
  await page.evaluate(async previous=>{const w=__remake.scene;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Encounter đầu Hotland: bước đi, dấu báo, Vulkin, Flee và điều kiện tuyến');
}
