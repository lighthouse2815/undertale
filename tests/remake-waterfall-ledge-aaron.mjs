import assert from 'node:assert/strict';
export async function testWaterfallLedgeAaron(page){
  const open=(flags,plot)=>page.evaluate(async({flags,plot})=>{const w=__remake.scene;w.flags=flags;w.plot=plot;await w.openRoom('room_water_waterfall4');},{flags,plot});
  const talk=()=>page.evaluate(()=>{const w=__remake.scene,c=w.waterfallLedge,e=c.aaron,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!c.interact())throw Error('Aaron không phản hồi');const lines=[...w.dialogue.lines];while(w.dialogue)w.advanceDialogue();return lines;});
  for(const [flags,plot] of [[{},121],[{204:1},122]]){await open(flags,plot);assert.equal(await page.evaluate(()=>__remake.scene.waterfallLedge.aaron),null);}
  await open({},122);assert.match((await talk())[0],/Since you flexed/);assert.match((await talk())[0],/And flexing/);assert.equal(await page.evaluate(()=>__remake.scene.colliders.some(c=>c.objectName==='obj_aaronnpc')),true);
  await open({7:1},122);assert.match((await talk())[0],/all this way/);
  await open({95:1},122);assert.match((await talk())[0],/sc-scared/);
  await open({95:1,7:1},122);assert.match((await talk())[0],/anime/);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Aaron ở mỏm đá: điều kiện xuất hiện và các nhánh thoại');
}
