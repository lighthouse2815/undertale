import assert from 'node:assert/strict';

export async function testGrillbyNpcs(page) {
  const open = (flags={},plot=101) => page.evaluate(async ({flags,plot}) => {const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=plot;await w.openRoom('room_tundra_grillby');}, {flags,plot});
  const talk = (name) => page.evaluate((name) => {const w=__remake.scene,e=w.grillbyNpcs.npcs.find(e=>e.name===name),s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';if(!w.grillbyNpcs.interact())throw Error('Không tương tác '+name);const pages=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();return pages;},name);
  await open();
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene;return [w.grillbyNpcs.npcs.length,w.colliders.filter(c=>c.objectName.startsWith('obj_grillbynpc_')||['obj_townnpc_weirdfish','obj_townnpc_hatescity'].includes(c.objectName)).length];}),[10,10]);
  const first=await talk('grillbynpc_foodmonster'),repeat=await talk('grillbynpc_foodmonster');assert.notDeepEqual(first,repeat);
  await page.evaluate(()=>{__remake.scene.grillbyNpcs.sansmode=true;});assert.notDeepEqual(await talk('grillbynpc_foodmonster'),repeat);
  await open({52:1,53:1,55:1});assert.equal(await page.evaluate(()=>__remake.scene.grillbyNpcs.npcs.length),6);
  await open({7:1});assert.equal(await page.evaluate(()=>__remake.scene.grillbyNpcs.npcs.length),7);
  await open({26:7});assert.deepEqual(await page.evaluate(()=>__remake.scene.grillbyNpcs.npcs.map(e=>e.name)),['grillbynpc_lesserdog','grillbynpc_womandog','grillbynpc_mandog','grillbynpc_doggo']);
  const cleanup=await page.evaluate(async()=>{const w=__remake.scene,i=w.grillbyNpcs.npcs[0].image;await w.openRoom('room_water1');return [w.grillbyNpcs,i.active];});assert.deepEqual(cleanup,[null,false]);
  console.log('✓ Khách Grillby: mười NPC/va chạm, lời lặp/Sans, ẩn theo cờ/tuyến và dọn');
}
