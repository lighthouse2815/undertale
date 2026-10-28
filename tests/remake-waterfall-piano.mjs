import assert from 'node:assert/strict';
export async function testWaterfallPiano(page) {
  const open=flags=>page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;w.plot=111;await w.openRoom('room_water_piano');},flags);
  const interact=()=>page.evaluate(()=>{const w=__remake.scene,r=w.waterfallPianoRoom,e=r.piano,s=e.sprite;w.player.setPosition(Math.round(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10),e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';if(!r.interact())throw Error('Không tương tác piano');});
  const choose=async value=>{await page.evaluate(value=>{const w=__remake.scene;w.dialogue.choice.index=value;w.dialogue.choice.readyAt=0;w.advanceDialogue();},value);};
  await open({});await interact();await choose(1);assert.equal(await page.evaluate(()=>__remake.scene.waterfallPianoRoom.stage),'idle');
  await interact();await choose(0);await page.waitForFunction(()=>__remake.scene.waterfallPianoRoom.buffer===0);
  const before=await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]);
  let count=0;for(const direction of [null,'ArrowUp','ArrowRight',null,'ArrowDown',null,'ArrowDown','ArrowRight']){if(direction)await page.keyboard.down(direction);await page.keyboard.press('z');count++;await page.waitForFunction(n=>__remake.scene.waterfallPianoRoom.notes.length>=n,count);if(direction)await page.keyboard.up(direction);await page.waitForTimeout(80);}
  await page.waitForFunction(()=>__remake.scene.waterfallPianoRoom.stage==='idle'&&__remake.scene.flags[356]===1,null,{timeout:5000}).catch(async e=>{console.log('Piano:',await page.evaluate(()=>{const r=__remake.scene.waterfallPianoRoom;return [r.notes,r.stage,r.buffer];}));throw e;});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),before);
  assert.equal(await page.evaluate(()=>__remake.scene.waterfallPianoRoom.doorOpen),true);
  await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.scene.player.y>=145);await page.keyboard.up('ArrowDown');
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.player.x>=140);await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_dogroom',null,{timeout:8000});await page.keyboard.up('ArrowUp');
  await open({356:1});assert.equal(await page.evaluate(()=>__remake.scene.waterfallPianoRoom.doorOpen),true);
  await interact();await choose(0);await page.waitForFunction(()=>__remake.scene.waterfallPianoRoom.buffer===0);await page.keyboard.press('x');await page.waitForFunction(()=>__remake.scene.waterfallPianoRoom.stage==='idle');
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Piano Waterfall: lựa chọn, tám nốt, cửa và vào lại');
}
