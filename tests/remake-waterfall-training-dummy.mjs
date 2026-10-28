import assert from 'node:assert/strict';
export async function testWaterfallTrainingDummy(page){
  const open=(lv,plot=115)=>page.evaluate(async({lv,plot})=>{const w=__remake.scene;w.flags={};w.lv=lv;w.plot=plot;await w.openRoom('room_water_trashzone2');},{lv,plot});
  const interact=()=>page.evaluate(()=>{const w=__remake.scene,c=w.waterfallTrashObjects,e=c.objects.find(e=>e.item.ObjectName==='obj_damndummy'),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Hình nộm không phản hồi');return [...w.dialogue.lines];});
  for(const [lv,pattern] of [[1,/tap/],[2,/lightly/],[5,/sock/],[8,/full force/]]){
    await open(lv);assert.match((await interact())[0],/regular/);await page.evaluate(()=>__remake.scene.advanceDialogue());await page.evaluate(()=>{const d=__remake.scene.dialogue;d.choice.index=0;d.choice.readyAt=0;__remake.scene.advanceDialogue();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),pattern);assert.equal(await page.evaluate(()=>__remake.scene.flags[355]),1);await page.evaluate(()=>{while(__remake.scene.dialogue)__remake.scene.advanceDialogue();});assert.match((await interact())[0],/enough/);
  }
  await open(1);await interact();await page.evaluate(()=>__remake.scene.advanceDialogue());await page.evaluate(()=>{const d=__remake.scene.dialogue;d.choice.index=1;d.choice.readyAt=0;__remake.scene.advanceDialogue();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/stare/);assert.equal(await page.evaluate(()=>__remake.scene.flags[355]),2);
  await open(1,116);assert.equal(await page.evaluate(()=>__remake.scene.waterfallTrashObjects.objects.some(e=>e.item.ObjectName==='obj_damndummy')),false);
  await page.evaluate(async()=>{const w=__remake.scene;w.lv=1;await w.openRoom('room_water1');});console.log('✓ Hình nộm khu rác: Yes/No, bốn mức LV và cờ 355');
}
