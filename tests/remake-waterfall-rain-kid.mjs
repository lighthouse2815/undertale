import assert from 'node:assert/strict';
export async function testWaterfallRainKid(page){
  for(const [flag,umbrella,pattern,next] of [[0,0,/can't hold/,1],[0,1,/umbrella/,2],[1,1,/best/,2],[2,0,/Where/,3],[3,0,/Yo/,3]]){
    const result=await page.evaluate(async({flag,umbrella})=>{const w=__remake.scene;w.flags={90:flag,85:umbrella};w.plot=111;await w.openRoom('room_water_waterfall');w.scene.pause();const r=w.waterfallRainKid;w.player.setPosition(585,110);const triggered=r.checkTrigger({x:582,y:110});const lines=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();for(let i=0;i<500&&r.stage!=='talking';i++)r.step();const second=w.dialogue.lines[0];while(w.dialogue)w.advanceDialogue();const state=[w.flags[90],r.stage];w.scene.resume();return {triggered,lines,second,state};},{flag,umbrella});
    assert.equal(result.triggered,true);assert.match(result.lines.join(' '),pattern);assert.match(result.second,/Let's go/);assert.deepEqual(result.state,[next,'following']);await page.waitForFunction(()=>__remake.scene.scene.isActive());
  }
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={90:2};w.plot=111;await w.openRoom('room_water_waterfall','obj_markerB');w.scene.pause();const r=w.waterfallRainKid;w.player.setPosition(1450,110);r.checkTrigger({x:1447,y:110});});
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/Undyne/);await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();w.scene.resume();});await page.waitForFunction(()=>__remake.scene.scene.isActive());assert.equal(await page.evaluate(()=>__remake.scene.flags[91]),1);
  await page.evaluate(()=>{const w=__remake.scene,r=w.waterfallRainKid;w.scene.pause();w.player.x=70;r.checkTrigger({x:73,y:w.player.y});while(w.dialogue)w.advanceDialogue();for(let i=0;i<30;i++)r.step();w.scene.resume();});await page.waitForFunction(()=>__remake.scene.scene.isActive());assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallRainKid.stage,__remake.scene.waterfallRainKid.numero]),['waiting',2]);
  await page.evaluate(async()=>{const w=__remake.scene;w.plot=114;await w.openRoom('room_water_waterfall');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallRainKid.kid),undefined);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Monster Kid dưới mưa: ô, đi cùng, Undyne và điều kiện');
}
