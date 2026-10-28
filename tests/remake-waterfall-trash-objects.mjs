import assert from 'node:assert/strict';
export async function testWaterfallTrashObjects(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=116;w.inventory=[];await w.openRoom('room_water_trashsavepoint');w.player.setPosition(290,100);window.trashPathMusic=w.waterfallMusic;});await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.room==='room_water_trashzone2');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y,__remake.scene.waterfallMusic===window.trashPathMusic]),[20,780,true]);
  const interact=y=>page.evaluate(y=>{const w=__remake.scene,c=w.waterfallTrashObjects,e=c.objects.find(e=>e.item.Y===y),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Objeto não responde');return [...w.dialogue.lines];},y);
  const close=()=>page.evaluate(()=>{while(__remake.scene.dialogue&&!__remake.scene.dialogue.choice)__remake.scene.advanceDialogue();});
  assert.match((await interact(600))[0],/rusted bike/);await close();assert.match((await interact(460))[0],/computer/);await close();assert.match((await interact(320))[0],/DVD/);await close();
  assert.match((await interact(360))[0],/cooler/);await close();assert.equal(await page.evaluate(()=>__remake.scene.flags[108]),1);
  const choose=choice=>page.evaluate(choice=>{const w=__remake.scene;w.dialogue.choice.index=choice;w.dialogue.choice.readyAt=0;w.advanceDialogue();},choice);
  await choose(0);assert.deepEqual(await page.evaluate(()=>[__remake.scene.inventory,__remake.scene.flags[108]]),[[35],2]);await close();await interact(360);await choose(0);await close();await interact(360);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/empty/);await close();
  await page.evaluate(()=>{const w=__remake.scene;w.flags[108]=1;w.inventory=Array(8).fill(1);});await interact(360);await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/too much/);assert.equal(await page.evaluate(()=>__remake.scene.flags[108]),1);await close();
  await page.evaluate(()=>__remake.scene.player.setPosition(20,780));await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.room==='room_water_trashsavepoint');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[280,100]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Đường rác: xe, máy tính, DVD, tủ thức ăn và cửa');
}
