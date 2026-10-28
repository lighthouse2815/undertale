import assert from 'node:assert/strict';

// Điều khiển đạn trúng mục tiêu, không sửa trực tiếp HP hay pha của trận.
export async function testMadDummyFullBattle(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.hp=w.maxHp=20;await w.openRoom('room_water_trashzone2');__remake.startBattle('madDummy');});
  await page.waitForFunction(()=>__remake.room==='battle_madDummy');
  const result=await page.evaluate(async()=>{
    const s=__remake.scene,{MadDummyShot}=await import('/src/mad-dummy-shot.mjs');s.scene.pause();const phases=new Set();let first=false,iterations=0,turns=0;
    while(window.__remake.phase==='battle'&&iterations++<7000){
      if(s.mode==='menu'){s.dummyTurn();s.speechBox.destroy();s.speechText.destroy();s.beginWave();turns++;}
      if(s.mode==='soul'){
        const phase=s.dummyState.phase;phases.add(phase);if(s.overlay)s.advanceOverlay();
        if(((phase===0&&!first)||(phase>=2&&phase<6&&iterations%5===0))&&s.wave){first=true;const shot=new MadDummyShot({type:'shot',x:s.enemy.x*2+10,y:s.enemy.y*2+10,vx:1,vy:0});s.wave.shots.push({actor:shot,image:s.add.image(0,0,'spr_dummyshot:0')});}
        s.invFrames=1000;s.update(0,1000/30);
      }else if(s.mode==='pages')s.afterPages();else if(s.mode==='dead')break;
    }
    return {finished:window.__remake.phase==='running',state:s.dummyState.phase,ending:s.ending?.stage,turns,phases:[...phases]};
  });
  assert.equal(result.finished,true);assert.equal(result.state,40);assert.equal(result.ending,'done');assert.ok(result.turns>=6);
  for(const phase of [0,1,2,3,5,6,7,8,10,11,13,14,15,16,17.5,17,18,20,22,23,25,27,28,29,31,32,34,35,37,38])assert.ok(result.phases.includes(phase),`Thiếu pha ${phase}`);
  await page.waitForFunction(()=>__remake.phase==='running');console.log('✓ Trận Mad Dummy liên tục: đạn trúng, chuyển pha và kết thúc');
}
