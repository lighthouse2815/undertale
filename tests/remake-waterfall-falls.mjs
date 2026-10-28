import assert from 'node:assert/strict';

export async function testWaterfallFalls(page) {
  await page.evaluate(async()=>{const w=__remake.game.scene.getScene('World');w.flags={};w.plot=101;await w.openRoom('room_water3');w.scene.pause();});
  const result=await page.evaluate(()=>{const w=__remake.scene,f=w.waterfallFalls,t=w.waterfallRoomTiles,e=f.falls[0];w.player.setPosition(280,30);f.step();const first=[e.col,e.image.y,e.image.depth];f.step();const second=[e.col,e.image.y,e.image.depth];w.player.setPosition(210,50);f.step();const crop=[f.ripple.image.visible,f.ripple.image._crop.x,f.ripple.image._crop.y,f.ripple.image._crop.width,f.ripple.image._crop.height];w.player.setPosition(20,100);f.step();const hidden=f.ripple.image.visible;for(let i=0;i<5;i++)t.step();const tile=[t.tiles.length,t.tiles[0].image.texture.key];const old=t.tiles[0].image;w.scene.resume();return {first,second,crop,hidden,tile};});
  assert.deepEqual(result.first,[2,-5,9999]);assert.deepEqual(result.second,[3,-10,9999]);assert.deepEqual(result.crop,[true,11,11,9,19]);assert.equal(result.hidden,false);assert.deepEqual(result.tile,[98,'spr_waterfall_topleft:1']);
  const cleanup=await page.evaluate(async()=>{const w=__remake.scene,t=w.waterfallRoomTiles.tiles[0].image;await w.openRoom('room_water1');return [w.waterfallRoomTiles,w.waterfallFalls,t.active];});assert.deepEqual(cleanup,[null,null,false]);
  console.log('✓ Thác Waterfall 3: bốn dải ô, màn nước/collision, crop gợn và dọn');
}
