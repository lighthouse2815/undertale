import assert from 'node:assert/strict';

export async function testMadDummyEnding(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={36:0};w.hp=w.maxHp=20;await w.openRoom('room_water_trashzone2');__remake.startBattle('madDummy');});
  await page.waitForFunction(()=>__remake.room==='battle_madDummy');
  const result=await page.evaluate(()=>{
    const s=__remake.scene;s.scene.pause();s.dummyState.phase=17.5;s.beginWave();const w=s.wave;
    for(const e of w.spawners)e.image.destroy();w.spawners=[];w.frames=w.duration-30;w.step();const activated=[s.dummyState.phase,s.ending.stage];
    while(s.overlay)s.advanceOverlay();const ending=s.ending;for(let i=0;i<40;i++)ending.step();const knife=[ending.stage,!!ending.knife];
    while(s.overlay)s.advanceOverlay();for(let i=0;i<120;i++)ending.step();const beforeRain=[ending.stage,s.dummyState.phase];
    while(s.overlay&&s.overlay.index<9)s.advanceOverlay();const rain=[ending.stage,ending.tears.length,s.dummyState.phase];
    ending.tears[0].x=s.enemy.x*2+10;ending.tears[0].y=s.enemy.y*2;ending.step();const hit=[ending.stage,s.dummyState.phase,s.overlay===null];
    for(let i=0;i<60;i++)ending.step();while(s.overlay)s.advanceOverlay();for(let i=0;i<120+54+30+2;i++)ending.step();const ghost=[ending.stage,ending.ghost?.visible,s.overlay?.pages.length,s.overlay?.pages[3]];
    while(s.overlay)s.advanceOverlay();for(let i=0;i<60;i++)ending.step();return [activated,knife,beforeRain,rain,hit,ghost,ending.stage,s.dummyState.phase];
  });
  assert.deepEqual(result,[ [18,'first'],['knifeSpeech',true],['emptySpeech',27],['rain',23,28],['hitWait',29,true],['ghostSpeech',true,6,"oh wait... didn't you\nattack me before..."],'done',40 ]);
  await page.waitForFunction(()=>__remake.phase==='running');
  await page.evaluate(()=>{__remake.scene.flags[36]=1;__remake.startBattle('madDummy');});await page.waitForFunction(()=>__remake.room==='battle_madDummy');
  const repeat=await page.evaluate(()=>{const s=__remake.scene;s.scene.pause();const reset=[s.ending,s.helpers,s.dummyState.phase];s.dummyState.phase=17.5;s.beginWave();s.wave.frames=s.wave.duration-30;s.wave.step();const e=s.ending;e.ghost=s.add.image(125,7,'spr_napstabattle_leg:0');e.stage='ghostWait';e.timer=1;e.step();const lines=s.overlay.pages;s.scene.resume();s.finishBattle();return [reset,lines.length,lines[3]];});
  assert.deepEqual(repeat,[[null,null,0],5,'oh no...\ni just wanted to\nsay hi...']);
  await page.waitForFunction(()=>__remake.phase==='running');console.log('✓ Trận Mad Dummy: dao, nước mắt, Napstablook và trở lại phòng');
}
