import assert from 'node:assert/strict';

export async function testWaterfallGrass(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=106;await w.openRoom('room_water4');w.scene.pause();});
  const result=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallGrass,e=c.grass[0],s=e.sprite;w.player.setPosition(e.item.X+s.MarginLeft,e.item.Y+s.MarginTop-20);c.step();const touch=[e.image.texture.key,e.contact];w.player.setPosition(20,20);c.step();c.step();const releasing=e.image.texture.key;c.step();const idle=e.image.texture.key;w.scene.resume();return [c.grass.length,touch,releasing,idle];});
  assert.deepEqual(result,[16,['spr_tallgrass:1',2],'spr_tallgrass:1','spr_tallgrass:0']);
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});assert.equal(await page.evaluate(()=>__remake.scene.waterfallGrass),null);
  console.log('✓ Cỏ Waterfall: 16 bụi, va chạm/khung, thời gian hồi và dọn');
}
