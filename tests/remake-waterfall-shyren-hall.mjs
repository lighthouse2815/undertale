import assert from 'node:assert/strict';
export async function testWaterfallShyrenHall(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=110;await w.openRoom('room_water14');});
  for(const [name,pattern,count] of [['obj_readable_room1',/treasure/,1],['obj_readable_room2',/no counter/,3],['obj_readable_room3',/exception/,6]]) {
    const lines=await page.evaluate(name=>{const w=__remake.scene,r=w.waterfallShyrenHall,e=r.signs.find(e=>e.item.ObjectName===name),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!r.interact())throw Error('Không đọc bia');const lines=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();return lines;},name);assert.equal(lines.length,count);assert.match(lines[0],pattern);
  }
  const falls=await page.evaluate(()=>{const w=__remake.scene,r=w.waterfallShyrenHall;r.elapsed=0;r.anim=0;w.cameras.main.scrollX=100;r.update(34);return [r.falls.length,r.falls[0].tiles.length,r.falls[0].tiles[0].x,r.falls[0].tiles[0].y,w.waterfallMusic.key];});
  assert.deepEqual(falls,[2,20,90,-207,'mus_ambientwater']);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallShyrenHall),null);console.log('✓ Hành lang Shyren: bia, màn thác và nhạc');
}
