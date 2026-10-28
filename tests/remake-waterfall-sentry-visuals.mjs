import assert from 'node:assert/strict';

export async function testWaterfallSentryVisuals(page) {
  await page.evaluate(async () => {const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_water2');w.scene.pause();});
  const details=await page.evaluate(() => {const w=__remake.scene,v=w.waterfallSentryVisuals;for(let i=0;i<5;i++)v.step();return [v.tiles.length,v.tiles.slice(0,4).map(t=>[t.key,t.image.x,t.image.y,t.image.texture.key]),v.tiles.at(-1).image.x,v.tiles.at(-1).image.y,v.star.image.texture.key];});
  assert.deepEqual(details,[20,[['spr_waterfall_topleft',120,180,'spr_waterfall_topleft:1'],['spr_waterfall_midtop',140,180,'spr_waterfall_midtop:1'],['spr_waterfall_midtop',160,180,'spr_waterfall_midtop:1'],['spr_waterfall_topright',160,180,'spr_waterfall_topright:1']],160,240,'spr_savepoint:1']);
  const cleanup=await page.evaluate(async () => {const w=__remake.scene,v=w.waterfallSentryVisuals,i=v.tiles[0].image;w.scene.resume();await w.openRoom('room_water1');return [w.waterfallSentryVisuals,i.active];});assert.deepEqual(cleanup,[null,false]);
  console.log('✓ Trạm Waterfall: ô thác/khung, điểm lưu động và dọn');
}
