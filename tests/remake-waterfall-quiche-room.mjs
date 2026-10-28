import assert from 'node:assert/strict';
export async function testWaterfallQuicheRoom(page) {
  const open=(flags={},inventory=[])=>page.evaluate(async({flags,inventory})=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.inventory=inventory;w.plot=107;await w.openRoom('room_water5A');},{flags,inventory});
  const interact=(name)=>page.evaluate(name=>{const w=__remake.scene,c=w.waterfallQuicheRoom,e=c[name],s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Không tương tác '+name);},name);
  const choose=async choice=>{await page.evaluate(()=>__remake.scene.advanceDialogue());await page.evaluate(choice=>{const w=__remake.scene;w.dialogue.choice.readyAt=0;w.dialogue.choice.index=choice;w.advanceDialogue();},choice);};
  const close=()=>page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});
  await open();await interact('flower');assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/responsibility/);await close();
  await interact('bench');await choose(1);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/left all/);await close();assert.equal(await page.evaluate(()=>__remake.scene.flags[104]??0),0);
  await open({},Array(8).fill(1));await interact('bench');await choose(0);assert.equal(await page.evaluate(()=>__remake.scene.dialogue.lines.length),2);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/carrying too much/);await close();
  await open();await interact('bench');await choose(0);assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[104],__remake.scene.inventory]),[1,[23]]);await close();await interact('bench');assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/just a bench/);await close();
  await open({104:1});await interact('bench');assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/just a bench/);await close();
  const result=await page.evaluate(async()=>{const w=__remake.scene,c=w.waterfallQuicheRoom;for(let i=0;i<5;i++)c.update(1000/30);const frame=c.docks[0].image.texture.key, count=w.colliders.filter(e=>['obj_npc_room','obj_echoflower'].includes(e.objectName)).length;await w.openRoom('room_water1');return [frame,count,w.waterfallQuicheRoom];});assert.deepEqual(result,['spr_dockanim:1',2,null]);
  console.log('✓ Ghế đá Waterfall: quiche/hoa, từ chối/túi đầy, cờ 104 và cầu tàu');
}
