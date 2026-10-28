import assert from 'node:assert/strict';
export async function testWaterfallStatue(page){
  const open=flags=>page.evaluate(async flags=>{const w=__remake.scene;w.flags=flags;w.plot=111;await w.openRoom('room_water_statue');},flags);
  const talk=()=>page.evaluate(()=>{const w=__remake.scene,e=w.waterfallMusicStatue.statue,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';if(!w.waterfallMusicStatue.interact())throw Error('Không tương tác tượng');});
  await open({});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/statue/);await page.evaluate(()=>__remake.scene.advanceDialogue());
  await open({85:1});await talk();await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.index=1;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.equal(await page.evaluate(()=>__remake.scene.flags[85]),1);
  await talk();await page.evaluate(()=>{const w=__remake.scene;w.dialogue.choice.readyAt=0;w.advanceDialogue();});assert.deepEqual(await page.evaluate(()=>[__remake.scene.flags[85],__remake.scene.flags[86],__remake.scene.waterfallMusicStatue.statue.image.texture.key]),[0,1,'spr_statue:1']);
  await page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();const s=w.waterfallMusicStatue;for(let i=0;i<500;i++)s.step();});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallMusicStatue.clue.image.visible,__remake.scene.waterfallMusicStatue.clue.image.alpha>0,__remake.scene.waterfallMusicStatue.music.key]),[true,true,'mus_musicbox']);
  for(const covered of [false,true]){
    await open(covered?{86:1}:{});
    const splash=await page.evaluate(covered=>{const w=__remake.scene,s=w.waterfallMusicStatue,mask=covered?'spr_plinkmask:mask1':'spr_plinkmask:mask';w.scene.pause();let point=null;for(let y=1;y<79&&!point;y++)for(let x=1;x<39;x++)if(w.textures.getPixel(x,y,mask)?.red>0){point=[x,y];break;}if(!point)throw Error('Mask tượng rỗng');const x=s.statue.item.X+point[0],y=s.statue.item.Y+point[1];s.drops.push({x,y,vy:0,image:w.add.image(x,y,'spr_statuedrop:0')});s.stepRain();const result=[s.drops.length,s.splashes.length];w.scene.resume();return result;},covered);assert.deepEqual(splash,[0,2]);await page.waitForFunction(()=>__remake.scene.scene.isActive());
  }
  await open({86:1});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/continues/);
  await open({7:1,85:1});await talk();assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/No point/);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Tượng âm nhạc: ô, mưa, nhạc và gợi ý piano');
}
