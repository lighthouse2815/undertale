import assert from 'node:assert/strict';
export async function testWaterfallPreUndyne(page){
  for(const ending of [false,true]){
    await page.evaluate(async ending=>{const w=__remake.scene;w.flags=ending?{7:1}:{};w.plot=114;if(ending)await w.openRoom('room_tundra_town');await w.openRoom('room_water_waterfall4','obj_markerB');w.player.setPosition(490,60);window.bridgeMusic=ending?w.townMusic:w.waterfallRain;},ending);
    await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.room==='room_water_preundyne');await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>__remake.phase==='running');
    assert.deepEqual(await page.evaluate(ending=>[__remake.scene.player.x,__remake.scene.player.y,(ending?__remake.scene.townMusic:__remake.scene.waterfallRain)===window.bridgeMusic],ending),[20,60,true]);
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>__remake.room==='room_water_waterfall4');await page.keyboard.up('ArrowLeft');await page.waitForFunction(()=>__remake.phase==='running');assert.deepEqual(await page.evaluate(()=>[__remake.scene.player.x,__remake.scene.player.y]),[480,60]);
  }
  const open=flags=>page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;w.plot=114;w.hp=1;w.maxHp=20;await w.openRoom('room_water_preundyne');},flags);
  await open({});
  assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallPreUndyne;w.scene.pause();w.cameras.main.scrollX=100;c.update(1000/30);const result=[c.dockTiles.length,c.dockTiles[0].image.x-c.dockTiles[0].x,c.shade.alpha];w.scene.resume();return result;}),[72,20,0]);await page.waitForFunction(()=>__remake.scene.scene.isActive());
  const signs=await page.evaluate(()=>{const w=__remake.scene;return [1,2].map(n=>{const e=w.waterfallPreUndyne.signs.find(e=>e.item.ObjectName===`obj_readable_room${n}`),s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!w.waterfallPreUndyne.interact())throw Error('Bia không phản hồi');const lines=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();return lines;});});assert.match(signs[0][0],/declared war/);assert.match(signs[1][2],/dust/);
  for(const [flags,pattern] of [[{},/muffled rain/],[{86:1},/music box/],[{26:8,204:5},/13 left/]]){
    await open(flags);await page.evaluate(()=>{const w=__remake.scene,e=w.roomObjects.find(e=>e.item.ObjectName==='obj_savepoint');w.player.setPosition(e.item.X,e.item.Y+1);w.player.facing='u';w.tryInteract();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),pattern);assert.equal(await page.evaluate(()=>__remake.scene.hp),20);
    await page.evaluate(()=>{while(__remake.scene.dialogue)__remake.scene.advanceDialogue();});await page.waitForFunction(()=>__remake.phase==='saving');await page.keyboard.press('z');await page.waitForFunction(()=>__remake.scene.saved);assert.equal(await page.evaluate(()=>__remake.scene.roomLabel.text),'Waterfall - Bridge');await page.keyboard.press('x');await page.waitForFunction(()=>__remake.phase==='running');
  }
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Trước Undyne: cửa, bia, SAVE và âm mưa');
}
