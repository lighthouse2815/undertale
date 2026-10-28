import assert from 'node:assert/strict';

export async function testWaterfallSentryNpcs(page) {
  const open = (flags={},plot=101) => page.evaluate(async ({flags,plot}) => {const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=plot;await w.openRoom('room_water2');}, {flags,plot});
  const talk = (name) => page.evaluate((name) => {const w=__remake.scene,e=w.waterfallSentryNpcs.npcs.find(e=>e.item.ObjectName===name),s=e.sprite;w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';w.tryInteract();const pages=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();return pages;},name);
  await open();
  assert.deepEqual(await page.evaluate(() => {const w=__remake.scene,c=w.waterfallSentryNpcs;return [c.npcs.length,c.npcs.find(e=>e.item.ObjectName==='obj_npc_room').image.texture.key,w.colliders.filter(e=>['obj_npc_room','obj_echoflower','obj_townnpc_monsterkid1'].includes(e.objectName)).length];}),[3,'spr_fishnpc_echo:0',3]);
  assert.match((await talk('obj_echoflower'))[0],/validation/);
  assert.match((await talk('obj_npc_room'))[0],/Never trust/);
  assert.match((await talk('obj_echoflower'))[0],/Never trust/);
  assert.equal((await talk('obj_townnpc_monsterkid1')).length,4);
  assert.match((await talk('obj_townnpc_monsterkid1'))[0],/ready/);
  await open(); assert.match((await talk('obj_npc_room'))[0],/Echo Flower/); assert.match((await talk('obj_echoflower'))[0],/Echo Flower/); assert.match((await talk('obj_npc_room'))[0],/Neat/); assert.match((await talk('obj_echoflower'))[0],/Neat/);
  await open({26:8}); assert.deepEqual(await page.evaluate(() => __remake.scene.waterfallSentryNpcs.npcs.map(e=>e.item.ObjectName)),['obj_echoflower','obj_townnpc_monsterkid1']); assert.match((await talk('obj_echoflower'))[0],/silent/);
  await open({},104); assert.equal(await page.evaluate(() => __remake.scene.waterfallSentryNpcs.npcs.some(e=>e.item.ObjectName==='obj_townnpc_monsterkid1')),false);
  const cleaned=await page.evaluate(async () => {const w=__remake.scene,n=w.waterfallSentryNpcs.npcs[0].image;await w.openRoom('room_water1');return [w.waterfallSentryNpcs,n.active];}); assert.deepEqual(cleaned,[null,false]);
  console.log('✓ NPC trạm Waterfall: lời cá/hoa/Kid, thứ tự tương tác, collider, biến mất và dọn');
}
