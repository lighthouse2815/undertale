import assert from 'node:assert/strict';
export async function testWaterfallStatue(page){
  const open=flags=>page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;w.plot=111;await w.openRoom('room_water_statue');},flags);
  const talk=()=>page.evaluate(()=>{const w=__remake.scene,e=w.waterfallMusicStatue.statue,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!w.waterfallMusicStatue.interact())throw Error('Không tương tác tượng');});
  await open({});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/statue/);await page.evaluate(()=>__remake.scene.advanceDialogue());
  await open({85:1});await talk();await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.index=1;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.equal(await page.evaluate(()=>__remake.scene.flags[85]),1);
  await talk();await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[85],__remake.scene.flags[86],__remake.scene.waterfallMusicStatue.statue.image.texture.key]),[0,1,'spr_statue:1']);
  await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();const s=w.waterfallMusicStatue;for(let i=0;i<500;i++)s.step();});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallMusicStatue.clue.image.visible,__remake.scene.waterfallMusicStatue.clue.image.alpha>0,__remake.scene.waterfallMusicStatue.music.key]),[true,true,'mus_musicbox']);
  await open({86:1});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/continues/);
  await open({7:1,85:1});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/No point/);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Tượng âm nhạc: ô, mưa, nhạc và gợi ý piano');
}
