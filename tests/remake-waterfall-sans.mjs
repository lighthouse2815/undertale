import assert from 'node:assert/strict';

export async function testWaterfallSans(page) {
  const open=(flags={},plot=101)=>page.evaluate(async({flags,plot})=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=plot;await w.openRoom('room_water2');w.scene.pause();},{flags,plot});
  const interact=()=>page.evaluate(()=>{const w=__remake.scene,e=w.waterfallSans.entry,s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';w.tryInteract();});
  const close=()=>page.evaluate(()=>{const w=__remake.scene;while(w.dialogue&&!w.dialogue.choice)w.advanceDialogue();});
  const choose=(index)=>page.evaluate(index=>{const w=__remake.scene;w.dialogue.choice.index=index;w.dialogue.choice.readyAt=0;w.advanceDialogue();},index);
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_water1');w.player.setPosition(600,120);});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water2');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[20,120]);
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water1');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[600,120]);
  await open();await interact();await close();assert.ok(await page.evaluate(()=>!!__remake.scene.dialogue.choice));await choose(1);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/have fun/);await close();assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallSans.stage,__remake.scene.flags[89]??0]),['waiting',0]);
  await interact();await close();await choose(0);await close();
  const walk=await page.evaluate(()=>{const w=__remake.scene,e=w.waterfallSans;for(let i=0;i<100&&e.stage!=='talking';i++)e.step();return [e.locked,e.stage,e.entry.image.x,e.entry.image.y,w.dialogue.lines[0]];});
  assert.deepEqual(walk,[true,'talking',251,134,'* over here.\n* i know a shortcut.']);await close();
  await page.evaluate(()=>{const w=__remake.scene,e=w.waterfallSans;w.scene.resume();for(let i=0;i<30;i++)e.step();});await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_tundra_grillby');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[89],__remake.scene.grillbyDate.locked,__remake.scene.grillbyDate.stage]),[1,true,'arrivalWait']);
  const meal=await page.evaluate(()=>{const w=__remake.scene,c=w.grillbyDate;w.scene.pause();for(let i=0;i<4000&&c.locked;i++){if(w.dialogue){if(w.dialogue.choice){w.dialogue.choice.index=0;w.dialogue.choice.readyAt=0;}w.advanceDialogue();}else c.step();}const result=[c.locked,w.flags[89],w.flags[391],w.grillbyNpcs.sansmode];w.scene.resume();return result;});assert.deepEqual(meal,[false,2,1,true]);
  await open({89:2});await interact();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/hang out again/);await close();await page.evaluate(()=>__remake.scene.scene.resume());
  await open({26:7});await interact();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/respect/);await close();await page.evaluate(()=>__remake.scene.scene.resume());
  for(const [flags,plot] of [[{67:1},101],[{413:1},101],[{},200]]) {await open(flags,plot);assert.equal(await page.evaluate(()=>__remake.scene.waterfallSans.entry),null);await page.evaluate(()=>__remake.scene.scene.resume());}
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});
  console.log('✓ Sans trạm Waterfall: cửa hai chiều, lời mời/nhánh, bước đi tắt và tới bữa ăn');
}
