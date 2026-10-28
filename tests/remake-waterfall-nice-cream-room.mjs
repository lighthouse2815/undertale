import assert from 'node:assert/strict';
export async function testWaterfallNiceCreamRoom(page) {
  const open = (count, items=[]) => page.evaluate(async ({count,items}) => {const w=__remake.scene;w.flags={80:count};w.plot=110;w.inventory=items;await w.openRoom('room_water_nicecream');},{count,items});
  const touch = key => page.evaluate(key=>{const w=__remake.scene,r=w.waterfallNiceCreamRoom,e=key==='box'?r.box:key==='sign'?r.signs[0]:r.shrooms[0],s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';if(!r.interact())throw Error('Không tương tác '+key);return w.dialogue?.lines[0]??null;},key);
  const close = () => page.evaluate(()=>{while(__remake.scene.dialogue) __remake.scene.advanceDialogue();});
  await open(0); assert.match(await touch('box'),/empty/); await close(); assert.match(await touch('sign'),/21 different flavors/); await close();
  await touch('shroom'); assert.equal(await page.evaluate(()=>__remake.scene.waterfallNiceCreamRoom.shrooms[0].image.texture.key),'spr_glowshroom:1');
  for(const [count,pattern] of [[1,/contains/],[3,/bugs/],[5,/smiley/],[7,/house/],[13,/overstuffed/]]) {await open(count);assert.match(await touch('box'),pattern);await page.evaluate(()=>{const w=__remake.scene;w.advanceDialogue();w.dialogue.choice.index=1;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.equal(await page.evaluate(()=>__remake.scene.flags[80]),count);}
  await open(3,Array(8).fill(1));await touch('box');await page.evaluate(()=>{const w=__remake.scene;w.advanceDialogue();w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/too much/);assert.equal(await page.evaluate(()=>__remake.scene.flags[80]),3);
  await open(3);await touch('box');await page.evaluate(()=>{const w=__remake.scene;w.advanceDialogue();w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[80],__remake.scene.inventory]),[2,[26]]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Hộp Punch Card, biển và nấm Waterfall');
}
