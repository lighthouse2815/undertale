import assert from 'node:assert/strict';

export async function testMadDummyBattle(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.hp=w.maxHp=20;await w.openRoom('room_water_trashzone2');__remake.startBattle('madDummy');});
  await page.waitForFunction(()=>__remake.room==='battle_madDummy'||__remake.phase==='error');
  assert.equal(await page.evaluate(()=>__remake.phase),'battle');
  for(const key of ['ArrowRight','z','z','ArrowDown','z']){await page.keyboard.press(key);await page.waitForTimeout(80);}
  assert.equal(await page.evaluate(()=>__remake.scene.previousScene.flags[147]),1);
  await page.evaluate(()=>{const s=__remake.scene;while(s.mode==='pages')s.afterPages();if(s.mode==='speech'){s.speechBox.destroy();s.speechText.destroy();s.beginWave();}s.scene.pause();});
  const result=await page.evaluate(async()=>{
    const s=__remake.scene,{MadDummyShot}=await import('/src/mad-dummy-shot.mjs'),w=s.wave;
    const first=[s.mode,w.spawners.length,s.enemy.visible,s.enemyParts.length];
    for(const e of w.spawners)e.image.destroy();w.spawners=[];
    const shot=new MadDummyShot({type:'shot',x:s.enemy.x*2+10,y:s.enemy.y*2+10,vx:1,vy:0});w.shots.push({actor:shot,image:s.add.image(0,0,'spr_dummyshot:0')});
    w.step();for(let i=0;i<30;i++)w.step();const reaction=[s.dummyState.hp,s.dummyState.phase,s.overlay.pages.length];
    while(s.overlay)s.advanceOverlay();const phase=s.dummyState.phase;
    w.destroy();s.wave=null;s.scene.resume();s.finishBattle();return [first,reaction,phase];
  });
  assert.deepEqual(result,[['soul',27,false,4],[299,1,4],2]);
  await page.waitForFunction(()=>__remake.phase==='running');console.log('✓ Trận Mad Dummy: ACT, giao diện, đạn đầu trúng và hội thoại');
}
