import assert from 'node:assert/strict';

export async function testHotlandEncounter(page) {
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});
    w.flags={369:5};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.weapon=3;w.weaponStrength=0;w.armor=4;w.armorDefense=0;
    await w.openRoom('room_fire5','obj_markerA');w.player.setPosition(150,1530);return snapshot;
  });
  const initial=await page.evaluate(()=>{const e=__remake.scene.hotlandEncounter;return [e.disabled,e.steps,__remake.scene.flags[200]];});
  assert.equal(initial[0],false);assert.ok(initial[1]>=80&&initial[1]<=110);assert.equal(initial[2],205);
  await page.evaluate(()=>{const e=__remake.scene.hotlandEncounter;e.count=Math.ceil(e.steps);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='encounter');await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[408],w.hotlandEncounter.icon.texture.key];}),[1,'spr_exc:0']);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_vulkin'&&__remake.scene.mode==='menu'&&!!__remake.scene.music);
  await page.evaluate(()=>{__remake.scene.menuIndex=3;});await page.keyboard.press('z');await page.waitForTimeout(60);await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);await page.keyboard.press('z');
  await page.waitForFunction(()=>__remake.scene.mode==='pages');
  while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages')){await page.keyboard.press('z');await page.waitForTimeout(60);}
  await page.waitForFunction(()=>__remake.phase==='running');
  const after=await page.evaluate(()=>{const w=__remake.scene,e=w.hotlandEncounter;return [w.flags[408],w.flags[11],e.disabled,e.steps];});
  assert.deepEqual(after.slice(0,3),[1,1,false]);assert.ok(after[3]>=1040&&after[3]<=1720);
  await page.evaluate(()=>{const e=__remake.scene.hotlandEncounter;e.count=Math.ceil(e.steps);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='encounter');await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(()=>__remake.scene.flags[408]),2);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_tsunderplane'&&__remake.scene.mode==='menu'&&!!__remake.scene.music);
  await page.evaluate(()=>{__remake.scene.menuIndex=3;});await page.keyboard.press('z');await page.waitForTimeout(60);await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);await page.keyboard.press('z');
  await page.waitForFunction(()=>__remake.scene.mode==='pages');
  while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages')){await page.keyboard.press('z');await page.waitForTimeout(60);}
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());assert.equal(await page.evaluate(()=>__remake.scene.hotlandEncounter.disabled),false);
  await page.evaluate(()=>{const e=__remake.scene.hotlandEncounter;e.count=Math.ceil(e.steps);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='encounter');await page.keyboard.up('ArrowUp');
  assert.equal(await page.evaluate(()=>__remake.scene.flags[408]),3);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_pyrope'&&__remake.scene.mode==='menu'&&!!__remake.scene.music);
  await page.evaluate(()=>{__remake.scene.menuIndex=3;});await page.keyboard.press('z');await page.waitForTimeout(60);await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);await page.keyboard.press('z');
  await page.waitForFunction(()=>__remake.scene.mode==='pages');while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages')){await page.keyboard.press('z');await page.waitForTimeout(60);}
  await page.waitForFunction(()=>__remake.phase==='running');assert.equal(await page.evaluate(()=>__remake.scene.hotlandEncounter.disabled),true);
  const revisit=await page.evaluate(async()=>{const w=__remake.scene;w.flags={408:1};await w.openRoom('room_fire5','obj_markerA');return [w.hotlandEncounter.disabled,w.hotlandEncounter.steps];});
  assert.equal(revisit[0],false);assert.ok(revisit[1]>=220&&revisit[1]<=250);
  for(const flags of [{7:1},{8:1},{408:3},{205:40}]){
    const disabled=await page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;await w.openRoom('room_fire5','obj_markerA');return w.hotlandEncounter.disabled;},flags);
    assert.equal(disabled,true);
  }
  await page.evaluate(async previous=>{const w=__remake.scene;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Encounter Hotland: thứ tự Vulkin/Tsunderplane/Pyrope, Flee và điều kiện tuyến');
}
