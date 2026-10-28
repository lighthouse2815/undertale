import assert from 'node:assert/strict';

export async function testWaterfallTutuRoom(page) {
  const open=(flags={},items=[])=>page.evaluate(async({flags,items})=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=101;w.inventory=items;await w.openRoom('room_water3A');},{flags,items});
  const talk=(name,index=0)=>page.evaluate(({name,index})=>{const w=__remake.scene,c=w.waterfallTutuRoom,e=name==='tutu'?c.tutu:c.shrooms[index],s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Không tương tác '+name);},{name,index});
  const choose=async (value)=>{await page.evaluate(()=>__remake.scene.advanceDialogue());await page.evaluate(value=>{const w=__remake.scene;w.dialogue.choice.index=value;w.dialogue.choice.readyAt=0;w.advanceDialogue();},value);};
  await open();await talk('shroom');assert.equal(await page.evaluate(()=>__remake.scene.waterfallTutuRoom.shrooms[0].image.texture.key),'spr_glowshroom:1');await talk('shroom');assert.equal(await page.evaluate(()=>__remake.scene.waterfallTutuRoom.shrooms[0].image.texture.key),'spr_glowshroom:0');
  await talk('tutu');await choose(1);assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[105]??0,__remake.scene.inventory.length,!!__remake.scene.waterfallTutuRoom.tutu]),[0,0,true]);
  await open({},Array(8).fill(1));await talk('tutu');await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/carrying too much/);await page.evaluate(()=>__remake.scene.advanceDialogue());assert.equal(await page.evaluate(()=>__remake.scene.flags[105]??0),0);
  await open();await talk('tutu');await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/got the Old Tutu/);await page.evaluate(()=>__remake.scene.advanceDialogue());assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[105],__remake.scene.inventory,!!__remake.scene.waterfallTutuRoom.tutu]),[1,[24],false]);
  await open({105:1});assert.equal(await page.evaluate(()=>__remake.scene.waterfallTutuRoom.tutu),null);await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});
  console.log('✓ Phòng Tutu: nấm bật/tắt, nhận/từ chối/túi đầy và cờ 105');
}
