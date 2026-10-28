import assert from 'node:assert/strict';
export async function testWaterfallLedgePath(page){
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1,85:1}:{85:1};w.plot=114;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_waterfall3');w.player.setPosition(1365,165);window.ledgeMusic=ending?w.townMusic:w.waterfallRain;},ending);
    await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.room==='room_water_waterfall4');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running');
    assert.deepEqual(await page.evaluate(ending=>{const w=__remake.scene;return [w.player.x,w.player.y,(ending?w.townMusic:w.waterfallRain)===window.ledgeMusic,w.waterfallRainRoom.ledge];},ending),[20,110,true,true]);
    await page.waitForFunction(()=>__remake.scene.waterfallRainRoom.drops.length>1);assert.equal(await page.evaluate(()=>__remake.scene.waterfallRainRoom.drops.every(d=>d.x>=0&&d.x<520)),true);
    await page.evaluate(()=>{const w=__remake.scene,e=w.waterfallUmbrellaRoom.box,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!w.waterfallUmbrellaRoom.interact())throw Error('Hộp ô không phản hồi');w.dialogue.choice.index=0;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.equal(await page.evaluate(()=>__remake.scene.flags[85]),0);await page.evaluate(()=>__remake.scene.advanceDialogue());
    await page.evaluate(()=>__remake.scene.player.setPosition(20,110));await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.room==='room_water_waterfall3');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(ending=>[__remake.scene.player.x,__remake.scene.player.y,(ending?__remake.scene.townMusic:__remake.scene.waterfallRain)===window.ledgeMusic],ending),[1358,165,true]);
  }
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};await w.openRoom('room_water_waterfall4');});assert.equal(await page.evaluate(()=>!!__remake.scene.waterfallRain),true);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Mỏm đá: cửa lâu đài, hộp ô và hai lớp mưa');
}
