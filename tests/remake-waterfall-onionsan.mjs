import assert from 'node:assert/strict';
export async function testWaterfallOnionsan(page) {
  const result=await page.evaluate(async()=>{
    const w=__remake.scene;w.flags={};w.plot=110;await w.openRoom('room_water_onionsan');w.scene.pause();const c=w.waterfallOnionsan;
    const visit=x=>{w.player.x=x;c.step();}, advance=()=>{while(w.dialogue&&!w.dialogue.choice)w.advanceDialogue();};
    visit(120);visit(220);visit(430);const intro=[c.stage,w.flags[496],c.tents.length];
    for(let i=0;i<300&&c.stage!=='talking';i++)c.step();const first=w.dialogue.lines[0];advance();
    const lines=[];for(const x of [560,710,860,1010]){visit(x);lines.push(w.dialogue.lines[0]);advance();}
    const final=[w.flags[496],c.head.on,c.stage];w.scene.resume();return {intro,first,lines,final};
  });
  assert.deepEqual(result.intro,['introWait',1,3]);assert.match(result.first,/Noticed/);assert.equal(result.lines.length,4);assert.deepEqual(result.final,[5,4,'walking']);
  await page.waitForFunction(()=>__remake.scene.scene.isActive());
  for(const choice of [0,1]) {
    const branch=await page.evaluate(async choice=>{const w=__remake.scene;w.flags={496:5};await w.openRoom('room_water_onionsan');w.scene.pause();const c=w.waterfallOnionsan;w.player.x=620;c.step();const first=w.dialogue.lines[0];while(!w.dialogue.choice)w.advanceDialogue();w.dialogue.choice.index=choice;w.dialogue.choice.readyAt=0;w.advanceDialogue();if(w.dialogue)while(w.dialogue)w.advanceDialogue();if(choice===1)for(let i=0;i<180;i++)c.step();const state=[w.flags[496],c.stage];w.scene.resume();return {first,state};},choice);
    assert.match(branch.first,/back/);assert.deepEqual(branch.state,[choice===0?6:-1,'walking']);await page.waitForFunction(()=>__remake.scene.scene.isActive());
  }
  for(const [flags,expected,count] of [[{496:6},6,3],[{496:6,7:1},7,4],[{496:7},7,1]]) {
    const state=await page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;await w.openRoom('room_water_onionsan');w.scene.pause();w.player.x=620;w.waterfallOnionsan.step();const state=[w.flags[496],w.dialogue.lines.length];while(w.dialogue)w.advanceDialogue();w.scene.resume();return state;},flags);assert.deepEqual(state,[expected,count]);await page.waitForFunction(()=>__remake.scene.scene.isActive());
  }
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};await w.openRoom('room_water_onionsan');w.player.setPosition(95,190);});
  const readyFrame=await page.evaluate(()=>__remake.game.loop.frame);await page.waitForFunction(frame=>__remake.game.loop.frame>=frame+2,readyFrame);
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>!!__remake.scene.waterfallOnionsan.tent1,null,{timeout:5000}).catch(async e=>{console.log(await page.evaluate(()=>{const w=__remake.scene;return {x:w.player.x,y:w.player.y,key:w.keys.right.isDown,active:w.scene.isActive(),phase:__remake.phase,stage:w.waterfallOnionsan.stage,flag:w.flags[496],dialogue:!!w.dialogue};}));throw e;});await page.keyboard.up('ArrowRight');
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={26:8};await w.openRoom('room_water_onionsan');});assert.equal(await page.evaluate(()=>__remake.scene.flags[496]),-1);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Onionsan: entrada, conversas, retorno e tuyến giết');
}
