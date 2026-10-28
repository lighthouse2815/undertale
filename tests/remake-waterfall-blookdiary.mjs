import assert from 'node:assert/strict';
export async function testWaterfallBlookDiary(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={433:0};w.plot=117;await w.openRoom('room_water_blookyard');});
  assert.equal(await page.evaluate(()=>__remake.scene.doors.some(d=>d.destination==='room_water_hapstablook')),false);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags[433]=1;await w.openRoom('room_water_blookyard');w.player.setPosition(170,134);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.room==='room_water_hapstablook');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running');
  const result=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBlookDiary,out=[];w.scene.pause();for(const e of c.books){const s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Diário não responde');out.push([w.dialogue.lines.length,w.dialogue.lines[0]]);while(w.dialogue)w.advanceDialogue();}w.scene.resume();return out;});
  assert.deepEqual(result.map(e=>e[0]),[6,2,7,7,2,6]);assert.match(result[0][1],/Shyren/);assert.match(result[5][1],/surpised/);
  await page.evaluate(()=>__remake.scene.player.setPosition(140,195));await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.room==='room_water_blookyard');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[170,134]);
  await page.evaluate(async()=>__remake.scene.openRoom('room_water1'));console.log('✓ Nhà nhật ký: cửa có khóa, sáu quyển và đường trở về');
}
