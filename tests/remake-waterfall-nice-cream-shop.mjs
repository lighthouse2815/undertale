import assert from 'node:assert/strict';
export async function testWaterfallNiceCreamShop(page) {
  const open = (flags={},inventory=[],gold=100,plot=110) => page.evaluate(async ({flags,inventory,gold,plot})=>{const w=__remake.scene;w.flags=flags;w.inventory=inventory;w.gold=gold;w.plot=plot;await w.openRoom('room_water_nicecream');},{flags,inventory,gold,plot});
  const interact = () => page.evaluate(()=>{const w=__remake.scene,c=w.niceCream,e=c.entry;w.player.setPosition(e.item.X,e.item.Y+e.sprite.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Không tương tác quầy');});
  const choose = value => page.evaluate(value=>{const w=__remake.scene;while(w.dialogue && !w.dialogue.choice)w.advanceDialogue();w.dialogue.choice.index=value;w.dialogue.choice.readyAt=0;w.advanceDialogue();},value);
  const finish = () => page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});
  await open(); await interact(); assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/relocated/);
  await page.evaluate(()=>{const w=__remake.scene;w.advanceDialogue();w.niceCream.frames=31;w.niceCream.update(34);}); assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[1]),/Punch cards/);
  await choose(0); assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[79],__remake.scene.flags[80],__remake.scene.gold,__remake.scene.inventory]),[8,1,75,[17]]); await finish();
  await open({79:8,60:25,85:1},[],20); await interact(); await choose(0); assert.deepEqual(await page.evaluate(()=>[__remake.scene.gold,__remake.scene.flags[80],__remake.scene.inventory]),[5,1,[17]]); await finish();
  await open({79:8,60:25},[26,26,26,1,1,1,1,1],0);await interact();await choose(0);assert.deepEqual(await page.evaluate(()=>[__remake.scene.gold,__remake.scene.inventory]),[0,[1,1,1,1,1,17]]);await finish();
  await open({79:8,60:25},Array(8).fill(1),100);await interact();await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/too much/);assert.equal(await page.evaluate(()=>__remake.scene.gold),100);await finish();
  await open({79:8,60:25},[],0);await interact();await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/No money/);await finish();
  await open({79:8,60:25},[],100);await interact();await choose(1);assert.equal(await page.evaluate(()=>__remake.scene.gold),100);await finish();
  for(const [flags,plot] of [[{},121],[{26:3},110],[{203:16},110]]) {await open(flags,[],100,plot);assert.equal(await page.evaluate(()=>__remake.scene.niceCream.entry),null);}
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Nice Cream Waterfall: mua, giảm giá, đổi thẻ và điều kiện');
}
