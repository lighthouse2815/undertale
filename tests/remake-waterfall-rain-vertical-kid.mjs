import assert from 'node:assert/strict';

export async function testWaterfallRainVerticalKid(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={85:1,91:1};w.plot=111;await w.openRoom('room_water_waterfall2','obj_markerA');w.player.setPosition(140,510);w.waterfallRainKid.kid.setPosition(140,509);});
  await page.keyboard.down('ArrowDown');await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='talking'&&!!__remake.scene.dialogue,{},{timeout:10000});await page.keyboard.up('ArrowDown');
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/one time/);
  assert.equal(await page.evaluate(()=>__remake.scene.flags[91]),3);
  await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();w.player.setPosition(190,890);});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='talking'&&!!__remake.scene.dialogue,{},{timeout:10000});await page.keyboard.up('ArrowRight');
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/teachers/);assert.equal(await page.evaluate(()=>__remake.scene.flags[91]),4);
  await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});assert.equal(await page.evaluate(()=>__remake.scene.waterfallRainKid.stage),'following');
  await page.evaluate(async()=>{const w=__remake.scene;w.plot=113;await w.openRoom('room_water_waterfall2','obj_markerA');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallRainKid.kid),undefined);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Kid ở hành lang dọc: chuyện hoa, Undyne và điều kiện xuất hiện');
}
