import assert from 'node:assert/strict';
export async function testWaterfallUmbrella(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=111;await w.openRoom('room_water_prewaterfall');});
  const interact=()=>page.evaluate(()=>{const w=__remake.scene,r=w.waterfallUmbrellaRoom,e=r.box,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!r.interact())throw Error('Không tương tác hộp ô');});
  const choose=v=>page.evaluate(v=>{const w=__remake.scene;w.dialogue.choice.index=v;w.dialogue.choice.readyAt=0;w.advanceDialogue();},v);
  await interact();await choose(1);assert.equal(await page.evaluate(()=>__remake.scene.flags[85]??0),0);
  await interact();await choose(0);assert.equal(await page.evaluate(()=>__remake.scene.flags[85]),1);await page.evaluate(()=>__remake.scene.advanceDialogue());
  await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.scene.player.texture.key.startsWith('spr_maincharal_umbrella:'));await page.keyboard.up('ArrowLeft');
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.originX,__remake.scene.player.originY]),[10/37,11/41]);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water_statue');});assert.equal(await page.evaluate(()=>__remake.scene.player.texture.key.startsWith('spr_mainchara')&&__remake.scene.player.texture.key.includes('_umbrella')),true);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water_prewaterfall');});await interact();await choose(0);assert.equal(await page.evaluate(()=>__remake.scene.flags[85]),0);await page.evaluate(()=>__remake.scene.advanceDialogue());
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.player.texture.key.startsWith('spr_maincharar:'));await page.keyboard.up('ArrowRight');assert.equal(await page.evaluate(()=>__remake.scene.player.originX),0);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Ô Waterfall: lấy/trả, sprite và giữ trạng thái qua phòng');
}
