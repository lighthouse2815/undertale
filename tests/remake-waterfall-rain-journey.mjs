import assert from 'node:assert/strict';
export async function testWaterfallRainJourney(page){
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={85:1};w.plot=111;await w.openRoom('room_water_prewaterfall');w.player.setPosition(310,120);});
  await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.phase==='transition');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running'&&__remake.room==='room_water_waterfall');
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='talking',null,{timeout:15000});await page.keyboard.up('ArrowRight');
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/umbrella/);
  const close=async()=>{const n=await page.evaluate(()=>__remake.scene.dialogue.lines.length);for(let i=0;i<n;i++){await page.keyboard.press('z');await page.waitForTimeout(70);}};
  await close();await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='talking'&&!!__remake.scene.dialogue,null,{timeout:10000});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/Let's go/);await close();
  await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='following');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.waterfallRainKid.stage==='talking'&&!!__remake.scene.dialogue,null,{timeout:15000});await page.keyboard.up('ArrowRight');
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/Undyne/);await close();assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[90],__remake.scene.flags[91],__remake.scene.waterfallRainKid.stage]),[2,1,'following']);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Hành trình dưới mưa: gặp Kid và cùng đi tới cuối phòng');
}
