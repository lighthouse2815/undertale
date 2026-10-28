import assert from 'node:assert/strict';

export async function testBlookHouseObjects(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=117;await w.openRoom('room_water_blookhouse');window.blookObjects=w.waterfallBlookHouse.objects;blookObjects.onSandwich=()=>window.gotSandwich=true;});
  const interact=async(name,index=0)=>page.evaluate(({name,index})=>{const w=__remake.scene,e=blookObjects.objects.filter(e=>e.item.ObjectName===name)[index],s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!blookObjects.interact())throw Error(`Không tương tác ${name}`);return w.dialogue.lines[0];},{name,index});
  const close=()=>page.evaluate(()=>{const w=__remake.scene;while(w.dialogue&&!w.dialogue.choice)w.advanceDialogue();});
  const choose=choice=>page.evaluate(choice=>{const w=__remake.scene;w.dialogue.choice.index=choice;w.dialogue.choice.readyAt=0;w.advanceDialogue();},choice);
  assert.match(await interact('obj_papcomputer'),/music-sharing/);await close();assert.match(await interact('obj_readable_room3'),/my tv/);await close();
  for(const [i,name] of ['Spooktunes','Spookwave','Ghouliday Music'].entries()){assert.match(await interact('obj_napstablook_cd',i),new RegExp(name));await close();await choose(0);assert.equal(await page.evaluate(()=>__remake.scene.flags[94]),i+1);await close();}
  await interact('obj_napstablook_cd',2);await close();await choose(0);assert.equal(await page.evaluate(()=>__remake.scene.flags[94]),0);await close();
  await page.evaluate(()=>{const w=__remake.scene,e=blookObjects.objects.find(e=>e.item.ObjectName==='obj_napstafridge'),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!blookObjects.interact())throw Error("Không tương tác tủ lạnh");});assert.equal(await page.evaluate(()=>window.gotSandwich),true);
  await page.evaluate(()=>{__remake.scene.flags[93]=3;});await interact('obj_napstafridge');await choose(0);assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/empty/);await close();
  await page.evaluate(()=>{blookObjects.cdBuffer=240;});assert.match(await interact('obj_napstablook_cd'),/recover/);await close();
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Nhà Napstablook: TV, máy tính, ba đĩa nhạc và tủ lạnh');
}
