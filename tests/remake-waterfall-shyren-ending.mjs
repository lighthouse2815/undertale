import assert from 'node:assert/strict';
export async function testWaterfallShyrenEnding(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=111;await w.openRoom('room_water14');});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallShyrenHall.shyren,__remake.scene.waterfallShyrenHall.sister]),[null,null]);
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={7:1};w.plot=111;await w.openRoom('room_water14');});
  const info=await page.evaluate(()=>{const w=__remake.scene,r=w.waterfallShyrenHall;return [r.shyren.image.texture.key,r.hole.texture.key,!!w.colliders.find(c=>c.objectName==='obj_shyrensisternpc')];});assert.deepEqual(info,['spr_shyren_overworld:0','spr_centeredhole:0',true]);
  for(const expected of [/good to be/,/brother/,/most other parts/]) {
    await page.evaluate(()=>{const w=__remake.scene,r=w.waterfallShyrenHall,e=r.sister,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';r.sisterBuffer=0;if(!r.interact())throw Error('Không tương tác');});
    await page.waitForFunction(()=>__remake.scene.waterfallShyrenHall.sisterText?.done,null,{timeout:10000});
    assert.match(await page.evaluate(()=>__remake.scene.waterfallShyrenHall.sisterText.phrase),expected);
    assert.equal(await page.evaluate(()=>__remake.scene.waterfallShyrenHall.sisterText.copies.length),6);
    await page.keyboard.press('z');await page.waitForFunction(()=>!__remake.scene.waterfallShyrenHall.sisterText);
  }
  assert.equal(await page.evaluate(()=>__remake.scene.waterfallShyrenHall.sisterTalked),0);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Tuyến kết thúc: Shyren, chị và ba câu nói');
}
