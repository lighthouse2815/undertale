import assert from 'node:assert/strict';

export async function testHotlandEmpty(page){
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot});
    w.flags={205:40,408:3,369:5,26:12};w.plot=127;w.hp=w.maxHp=20;w.lv=1;w.inventory=[];w.armor=4;w.armorDefense=0;w.xp=w.gold=w.kills=0;
    w.hotlandMusic?.destroy();w.hotlandMusic=null;await w.openRoom('room_fire5','obj_markerA');w.player.setPosition(150,1530);return snapshot;
  });
  assert.deepEqual(await page.evaluate(()=>{const e=__remake.scene.hotlandEncounter;return [e.disabled,e.empty,e.steps];}),[false,1,20]);
  await page.evaluate(()=>{__remake.scene.hotlandEncounter.count=20;});await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.scene.flags[224]===1);await page.keyboard.up('ArrowUp');
  const empty=await page.evaluate(()=>{const w=__remake.scene,e=w.hotlandEncounter;return [__remake.phase,w.flags[408],e.empty,e.steps,e.count];});
  assert.deepEqual(empty.slice(0,4),['running',4,2,20]);assert.ok(empty[4]<=5);
  await page.evaluate(()=>{__remake.scene.hotlandEncounter.count=20;});await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='encounter');await page.keyboard.up('ArrowUp');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[408],w.hotlandEncounter.steps,w.hotlandEncounter.icon.texture.key];}),[5,6900,'spr_exc_f:0']);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_nobody'&&__remake.scene.mode==='pages');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.message.text,__remake.scene.previousScene.hotlandMusic.isPaused]),['* But nobody came.',true]);
  await page.keyboard.press('z');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.hotlandMusic?.isPlaying);
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.xp,w.gold,w.kills,w.flags[224],w.hotlandEncounter.empty];}),[0,0,0,1,2]);
  const depleted=await page.evaluate(async()=>{const w=__remake.scene;w.flags={205:39,408:3};await w.openRoom('room_fire5','obj_markerA');const e=w.hotlandEncounter,before=e.disabled;w.flags[205]=40;e.step();return [before,e.disabled,e.empty,e.steps,e.count];});
  assert.deepEqual(depleted,[false,false,1,20,1]);
  for(const flag of [7,8])assert.equal(await page.evaluate(async flag=>{const w=__remake.scene;w.flags={205:40,[flag]:1};await w.openRoom('room_fire5','obj_markerA');return w.hotlandEncounter.disabled;},flag),true);
  await page.evaluate(async previous=>{const w=__remake.scene;w.hotlandMusic?.destroy();w.hotlandMusic=null;Object.assign(w,previous);await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Hotland cạn quái: cờ, Nobody, ngưỡng tiếp theo và nhạc');
}
