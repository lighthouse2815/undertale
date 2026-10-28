import assert from 'node:assert/strict';

export async function testWaterfallDummyEncounter(page){
  async function enter(violent){
    await page.evaluate(async violent=>{const w=__remake.scene;w.flags=violent?{26:9,355:1}:{14:2,355:2,36:0};w.plot=115;w.hp=w.maxHp=20;await w.openRoom('room_water_trashzone2');w.player.setPosition(180,160);w.updateCamera();},violent);
    await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.scene.waterfallDummyEncounter?.stage==='wait');await page.keyboard.up('ArrowUp');
    return page.evaluate(()=>{const w=__remake.scene,c=w.waterfallDummyEncounter;w.scene.pause();for(let i=0;i<400&&!w.dialogue;i++)c.step();return [c.stage,w.dialogue?.lines[0],w.player.facing,w.cameras.main.zoom];});
  }
  const normal=await enter(false);assert.deepEqual(normal,['intro','* Hahaha...\n* Too intimidated to fight\n  me, huh!?','u',1]);
  await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallDummyEncounter;while(w.dialogue)w.advanceDialogue();for(let i=0;i<30;i++)c.step();});await page.waitForFunction(()=>__remake.room==='battle_madDummy');
  await page.evaluate(()=>{const s=__remake.scene;s.scene.pause();s.dummyState.phase=17.5;s.beginWave();for(const e of s.wave.spawners)e.image.destroy();s.wave.spawners=[];s.wave.frames=s.wave.duration-30;s.wave.step();while(s.overlay)s.advanceOverlay();const e=s.ending;for(let i=0;i<40;i++)e.step();while(s.overlay)s.advanceOverlay();for(let i=0;i<120;i++)e.step();while(s.overlay&&s.overlay.index<9)s.advanceOverlay();e.tears[0].x=s.enemy.x*2+10;e.tears[0].y=s.enemy.y*2;e.step();for(let i=0;i<60;i++)e.step();while(s.overlay)s.advanceOverlay();for(let i=0;i<206;i++)e.step();while(s.overlay)s.advanceOverlay();for(let i=0;i<60;i++)e.step();});
  await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.waterfallDummyEncounter?.stage==='afterText');
  const after=await page.evaluate(()=>{const w=__remake.scene;return [w.plot,w.dialogue.lines.length,w.waterfallDummyEncounter.dummy.image.texture.key];});assert.deepEqual(after,[116,4,'spr_napstablook_d:0']);
  await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});await page.waitForFunction(()=>__remake.scene.waterfallDummyEncounter?.stage==='done');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.plot,w.waterfallTrashObjects.objects.some(e=>e.item.ObjectName==='obj_damndummy'),w.colliders.some(e=>e.objectName==='obj_damndummy'),w.findDoor(180,0)?.destination];}),[116,false,false,'room_water_friendlyhub']);
  const violent=await enter(true);assert.deepEqual(violent,['intro',"* FOOL!\n* You think you can hurt\n  ME???",'u',1]);
  await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallDummyEncounter;while(w.dialogue)w.advanceDialogue();for(let i=0;i<45;i++)c.step();while(w.dialogue)w.advanceDialogue();});await page.waitForFunction(()=>__remake.room==='battle_gladDummy');
  await page.evaluate(()=>{const s=__remake.scene;s.choose('mercy',['Spare']);s.confirmPressed=true;s.updateSubmenu();s.afterPages();});await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.waterfallDummyEncounter?.stage==='done');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.plot,__remake.scene.flags[27],__remake.scene.waterfallTrashObjects.objects.some(e=>e.item.ObjectName==='obj_damndummy')]),[117,1,false]);
  await enter(true);await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallDummyEncounter;while(w.dialogue)w.advanceDialogue();for(let i=0;i<45;i++)c.step();while(w.dialogue)w.advanceDialogue();});await page.waitForFunction(()=>__remake.room==='battle_gladDummy');
  await page.evaluate(()=>{const s=__remake.scene;s.startFight();s.attackX=152;s.confirmPressed=true;s.updateFight(0);s.afterPages();s.afterPages();});await page.waitForFunction(()=>__remake.phase==='running'&&__remake.scene.waterfallDummyEncounter?.stage==='done');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.plot,__remake.scene.flags[252],__remake.scene.flags[27]??0]),[117,1,0]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Cảnh khu rác: hai nhánh, trận, Napstablook, plot và cửa');
}
