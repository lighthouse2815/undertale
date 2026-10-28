import assert from 'node:assert/strict';

export async function testGrillbyBigdog(page) {
  const open=(flags={})=>page.evaluate(async flags=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=101;await w.openRoom('room_tundra_grillby');},flags);
  await open();
  const result=await page.evaluate(()=>{const w=__remake.scene,c=w.snowdinTownDogs,e=c.dogs[0],s=e.sprite;w.scene.pause();w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18);w.player.facing='u';const started=c.interact();for(let i=0;i<15;i++)c.step();const bark=[c.locked,c.stage,e.image.texture.key];for(let i=0;i<35;i++)c.step();const done=[c.locked,c.stage,e.image.texture.key];w.scene.resume();return [e.object.Sprite,started,bark,done];});
  assert.deepEqual(result,['spr_npc_bigdog',true,[true,'barking','spr_npc_bigdog:2'],[false,'waiting','spr_npc_bigdog:0']]);
  await open({52:1,53:1});assert.equal(await page.evaluate(()=>__remake.scene.snowdinTownDogs.dogs[0].object.Sprite),'spr_npc_saddog');
  for(const flags of [{54:1},{7:1}]) {await open(flags);assert.equal(await page.evaluate(()=>__remake.scene.snowdinTownDogs.dogs.length),0);}
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});
  console.log('✓ Greater Dog trong Grillby: tiếng sủa/khóa, sprite buồn và điều kiện ẩn');
}
