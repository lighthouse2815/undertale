import assert from 'node:assert/strict';
export async function testWaterfallTrashStart(page){
  const open=(flags,plot)=>page.evaluate(async({flags,plot})=>{const w=__remake.scene;w.flags=flags;w.plot=plot;await w.openRoom('room_water_trashzone1');w.scene.pause();},{flags,plot});
  await open({17:1},113);assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.flags[17],w.player.angle,w.player.x,w.player.y,w.waterfallTrashStart.stage,w.waterfallMusic.key];}),[0,-90,141,109,'lying','mus_ambientwater']);
  await page.evaluate(()=>{const c=__remake.scene.waterfallTrashStart;for(let i=0;i<75;i++)c.step();});assert.deepEqual(await page.evaluate(()=>{const w=__remake.scene;return [w.plot,w.player.angle,w.player.x,w.player.y,w.waterfallTrashStart.stage];}),[115,0,101,89,'done']);
  const talk=()=>page.evaluate(()=>{const w=__remake.scene,c=w.waterfallTrashStart,e=c.piles[0],s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Đống rác không phản hồi');const line=w.dialogue.lines[0];w.advanceDialogue();return line;});
  assert.match(await talk(),/brands/);assert.match(await talk(),/Just garbage/);assert.match(await talk(),/Garbage/);
  await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());await open({22:1},115);assert.equal(await page.evaluate(()=>__remake.scene.waterfallTrashStart.stage),'done');await talk();assert.match(await talk(),/yellow names/);
  await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Khu rác: tỉnh dậy, plot, âm nước và đọc rác');
}
