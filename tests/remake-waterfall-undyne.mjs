import assert from 'node:assert/strict';

export async function testWaterfallUndyne(page) {
  for (const killed of [false,true]) {
    const result=await page.evaluate(async killed=>{
      const w=__remake.game.scene.getScene('World');w.flags=killed?{67:1}:{};w.plot=101;await w.openRoom('room_water4');w.scene.pause();w.player.setPosition(260,275);w.cameras.main.scrollY=160;
      const e=w.waterfallUndyne, trigger=e.checkTrigger(), dialogues=[], stages=new Set();
      for(let i=0;i<1500&&e.stage!=='watch';i++){stages.add(e.stage);if(w.dialogue){dialogues.push(w.dialogue.lines[w.dialogue.index]);w.advanceDialogue();}else e.step();}
      const watch=[e.stage,e.locked,w.flags[20],w.cameras.main.scrollY];
      for(let i=0;i<6;i++){const p={x:w.player.x,y:w.player.y};w.player.x++;e.checkWalk(p);}
      for(let i=0;i<1500&&e.stage!=='escape';i++){stages.add(e.stage);if(w.dialogue){dialogues.push(w.dialogue.lines[w.dialogue.index]);w.advanceDialogue();}else e.step();}
      const escape=[e.stage,e.locked,w.cameras.main.scrollY,!!w.waterfallGrass.starker];w.player.setPosition(65,280);e.checkWalk({x:66,y:280});
      for(let i=0;i<1000&&e.stage!=='done';i++){stages.add(e.stage);if(w.dialogue){dialogues.push(w.dialogue.lines[w.dialogue.index]);w.advanceDialogue();}else e.step();}
      const end=[e.stage,e.locked,w.plot,w.waterfallMusic?.key];w.scene.resume();return {trigger,watch,escape,end,dialogues,stages:[...stages]};
    },killed);
    assert.equal(result.trigger,true);assert.deepEqual(result.watch,['watch',false,killed?1:3,160]);assert.deepEqual(result.escape,['escape',false,160,false]);assert.deepEqual(result.end,['done',false,106,'mus_waterfall']);
    assert.equal(result.dialogues.some(t=>/DAILY REPORT/.test(t)),!killed);assert.ok(result.dialogues.some(t=>/AWESOME/.test(t)));assert.ok(result.stages.includes('throw'));assert.ok(result.stages.includes('kidTrip'));
  }
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=101;await w.openRoom('room_water4');w.player.setPosition(235,275);w.updateCamera();});
  await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.waterfallUndyne.locked, null, {timeout:5000}).catch(async error => { console.log('Trạng thái cảnh Undyne:', await page.evaluate(() => { const w=__remake.scene; return {phase:__remake.phase,room:__remake.room,active:w.scene.isActive(),x:w.player.x,y:w.player.y,key:w.keys.right.isDown,stage:w.waterfallUndyne?.stage,locked:w.waterfallUndyne?.locked,dialogue:!!w.dialogue}; })); throw error; });await page.keyboard.up('ArrowRight');assert.equal(await page.evaluate(()=>__remake.scene.waterfallUndyne.stage),'start');
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=106;await w.openRoom('room_water4');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallUndyne.stage),'done');
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Gặp Undyne: hai nhánh Papyrus, camera, phát hiện, ngắm giáo, Monster Kid và plot');
}
