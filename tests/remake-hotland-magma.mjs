import assert from 'node:assert/strict';

export async function testHotlandMagma(page){
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const previous=await page.evaluate(async()=>{
    const w=__remake.scene,snapshot=structuredClone({flags:w.flags,plot:w.plot,hp:w.hp,maxHp:w.maxHp});
    w.hotlandMusic?.destroy();w.hotlandMusic=null;w.waterfallMusic?.destroy();w.waterfallMusic=null;
    w.flags={408:1,369:5};w.plot=127;w.hp=1;w.maxHp=20;w.lv=1;w.armor=4;w.armorDefense=0;w.inventory=[];
    await w.openRoom('room_fire5','obj_markerB');w.player.setPosition(160,30);window.magmaMusic=w.hotlandMusic;return snapshot;
  });
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.room==='room_fire6'&&__remake.phase==='running');await page.keyboard.up('ArrowUp');
  const entered=await page.evaluate(()=>{const w=__remake.scene;return [w.player.x,w.player.y,w.hotlandMusic===window.magmaMusic,w.hotlandMusic.key,w.hotlandEncounter.steps];});
  assert.equal(entered[0],100);assert.ok(entered[1]>=370&&entered[1]<=380);assert.deepEqual(entered.slice(2,4),[true,'mus_anothermedium']);assert.ok(entered[4]>=120&&entered[4]<=150);
  const save=await page.evaluate(()=>{const w=__remake.scene;w.player.setPosition(100,300);w.tryInteract();const result=[w.dialogue.lines,w.hp];w.dialogue.onClose=undefined;while(w.dialogue)w.advanceDialogue();return result;});
  assert.deepEqual(save,[['* (The wooshing sound of steam\n  and cogs... it fills you\n  with determination.)'],20]);
  const red=await page.evaluate(()=>{const w=__remake.scene;w.flags={26:12,205:37};w.tryInteract();const r=[w.dialogue.lines,w.dialogueText.font];w.dialogue.onClose=undefined;w.advanceDialogue();return r;});
  assert.deepEqual(red,[['* 3 left.'],'fnt_maintext:red']);
  const stored=await page.evaluate(()=>{const w=__remake.scene;w.flags={408:1};w.tryInteract();while(w.dialogue)w.advanceDialogue();return localStorage.getItem('undertale-remake-save-v1');});
  await page.waitForFunction(()=>__remake.phase==='saving');await page.keyboard.press('z');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.saved,__remake.scene.roomLabel.text]),[true,'Hotland - Magma Chamber']);
  await page.keyboard.press('z');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  await page.evaluate(stored=>{if(stored===null)localStorage.removeItem('undertale-remake-save-v1');else localStorage.setItem('undertale-remake-save-v1',stored);},stored);
  await page.evaluate(()=>{const w=__remake.scene;w.player.setPosition(150,300);w.hotlandEncounter.count=w.hotlandEncounter.steps+1;w.hotlandEncounter.update();});
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_tsunderplane'&&__remake.scene.mode==='menu'&&!!__remake.scene.music);
  assert.equal(await page.evaluate(()=>__remake.scene.previousScene.flags[408]),2);
  await page.evaluate(()=>{__remake.scene.menuIndex=3;});await page.keyboard.press('z');await page.waitForTimeout(60);await page.keyboard.press('ArrowDown');await page.waitForTimeout(60);await page.keyboard.press('z');
  await page.waitForFunction(()=>__remake.scene.mode==='pages');while(await page.evaluate(()=>__remake.phase==='battle'&&__remake.scene.mode==='pages')){await page.keyboard.press('z');await page.waitForTimeout(60);}
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  const steps=await page.evaluate(()=>__remake.scene.hotlandEncounter.steps);assert.ok(steps>=340&&steps<=720);
  const revisit=await page.evaluate(async()=>{const w=__remake.scene;w.flags={408:2};await w.openRoom('room_fire6','obj_markerA');return w.hotlandEncounter.steps;});assert.ok(revisit>=220&&revisit<=250);
  const depleted=await page.evaluate(()=>{const w=__remake.scene,e=w.hotlandEncounter;w.flags[205]=40;e.step();e.count=21;e.update();e.count=21;e.update();return [e.empty,e.steps,w.flags[224],__remake.phase];});
  assert.deepEqual(depleted,[2,2650,1,'encounter']);
  await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.room==='battle_nobody'&&__remake.scene.mode==='pages');await page.keyboard.press('z');
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.scene.isActive());
  await page.evaluate(()=>__remake.scene.player.setPosition(100,395));await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.room==='room_fire5'&&__remake.phase==='running');await page.keyboard.up('ArrowDown');
  assert.equal(await page.evaluate(()=>__remake.scene.hotlandMusic===window.magmaMusic),true);
  await page.evaluate(async previous=>{const w=__remake.scene;w.hotlandMusic?.destroy();w.hotlandMusic=null;Object.assign(w,previous);delete window.magmaMusic;await w.openRoom('room_fire3','obj_markerC');},previous);
  console.log('✓ Hotland magma: cửa hai chiều, nhạc, điểm lưu và encounter');
}
