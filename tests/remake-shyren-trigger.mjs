import assert from 'node:assert/strict';
export async function testShyrenTrigger(page) {
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=110;w.hp=w.maxHp=20;await w.openRoom('room_water14');w.player.setPosition(265,170);});
  await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='battle'&&__remake.scene.scene.key==='ShyrenBattle',null,{timeout:5000}).catch(async e=>{console.log(await page.evaluate(()=>{const w=__remake.scene;return {x:w.player?.x,y:w.player?.y,key:w.keys?.left?.isDown,phase:__remake.phase,trigger:!!w.waterfallShyrenHall?.trigger,dialogue:!!w.dialogue};}));throw e;});await page.keyboard.up('ArrowLeft');
  assert.equal(await page.evaluate(()=>__remake.scene.previousScene.plot),111);
  await page.evaluate(()=>__remake.scene.flee());await page.keyboard.press('z');await page.waitForFunction(()=>__remake.phase==='running');await page.waitForFunction(()=>__remake.scene.scene.isActive());
  assert.equal(await page.evaluate(()=>__remake.scene.waterfallShyrenHall.trigger),null);
  await page.evaluate(async()=>{const w=__remake.scene;await w.openRoom('room_water14');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallShyrenHall.trigger),null);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Trigger Shyren: bước vào trận, plot và không lặp');
}
