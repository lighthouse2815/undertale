import assert from 'node:assert/strict';

export async function testWaterfallBlookyard(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=117;await w.openRoom('room_water_friendlyhub');w.player.setPosition(300,20);});
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.room==='room_water_blookyard');await page.keyboard.up('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running');
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBlookYard;return [w.player.x,w.player.y,!!c.ghost,!!c.locked,w.waterfallMusic?.key];}),[140,180,false,true,'mus_waterquiet']);
  const locked=await page.evaluate(()=>{const w=__remake.scene;w.player.setPosition(172,120);w.player.facing='u';return [w.waterfallBlookYard.interact(),w.dialogue?.lines[0]];});assert.deepEqual(locked,[true,"* (It's locked.)"]);await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();w.player.setPosition(140,180);});
  await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.room==='room_water_friendlyhub');await page.keyboard.up('ArrowDown');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[300,20]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={7:1,36:1,433:1};await w.openRoom('room_water_blookyard');});
  const after=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBlookYard,e=c.ghost;w.player.setPosition(e.item.X,e.item.Y+15);w.player.facing='u';c.interact();const first=[w.dialogue.lines.length,w.flags[199],!!c.locked];while(w.dialogue)w.advanceDialogue();c.interact();const second=[w.dialogue.lines.length,w.flags[199]];while(w.dialogue)w.advanceDialogue();const m=c.mettaton;w.player.setPosition(m.item.X,m.item.Y+15);w.player.facing='u';c.interact();const third=[w.dialogue.lines.length,w.flags[198]];while(w.dialogue)w.advanceDialogue();return [first,second,third];});assert.deepEqual(after,[[16,1,false],[4,2],[13,1]]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={7:1,26:10};await w.openRoom('room_water_blookyard');});assert.equal(await page.evaluate(()=>!!__remake.scene.waterfallBlookYard.ghost),false);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Blook Acres: cửa hai chiều, nhà khóa và hai nhân vật sau kết thúc');
}
