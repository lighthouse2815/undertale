import assert from 'node:assert/strict';

export async function testWaterfallBridgeRoom(page) {
  const open=(flags={},plot=106,spawn='obj_mainchara')=>page.evaluate(async({flags,plot,spawn})=>{const w=__remake.game.scene.getScene('World');w.flags=flags;w.plot=plot;await w.openRoom('room_water5',spawn);w.scene.pause();},{flags,plot,spawn});
  await open();
  const initial=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBridgeRoom,b=c.boards[0];w.player.setPosition(b.x-10,b.y);w.player.facing='r';return [c.boards.length,c.fixed.length,c.interact(),b.using,c.carried===b];});
  assert.deepEqual(initial,[4,0,true,1,true]);
  const movement=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBridgeRoom,b=c.boards[0];w.player.setPosition(190,320);w.player.facing='r';const placed=c.interact();const start=[b.x,b.y,b.using];for(let i=0;i<200&&b.using===2;i++)c.step();return [placed,start,b.using,b.x,b.y,c.carried===null];});
  assert.deepEqual(movement,[true,[220,340,2],3,260,340,true]);
  const bridge=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBridgeRoom;c.carried=null;for(const [i,b] of c.boards.entries()){b.x=220;b.y=180+i*20;b.using=3;}c.step();const won=c.won;for(let i=0;i<31;i++)c.step();return [won,c.boards.map(b=>b.using),c.boards.map(b=>b.image.texture.key)];});
  assert.deepEqual(bridge,[true,[99,99,99,99],Array(4).fill('spr_bridgeseed:6')]);
  const reset=await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallBridgeRoom,e=c.bell,s=e.sprite;w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18);w.player.facing='u';const interacted=c.interact();for(let i=0;i<30;i++)c.step();return [interacted,c.locked,c.won,c.boards.map(b=>[b.x,b.y,b.using,b.image.alpha])];});
  assert.deepEqual(reset,[true,false,false,[[340,200,0,1],[380,200,0,1],[380,240,0,1],[340,240,0,1]]]);
  await page.evaluate(()=>__remake.scene.scene.resume());await open({26:8});assert.deepEqual(await page.evaluate(()=>[__remake.scene.plot,__remake.scene.flags[386],__remake.scene.waterfallBridgeRoom.fixed.length]),[107,1,4]);await page.evaluate(()=>__remake.scene.scene.resume());
  await open({},107,'obj_markerB');assert.equal(await page.evaluate(()=>__remake.scene.waterfallBridgeRoom.fixed.length),8);
  const cleanup=await page.evaluate(async()=>{const w=__remake.scene,i=w.waterfallBridgeRoom.fixed[0].image;w.scene.resume();await w.openRoom('room_water1');return [w.waterfallBridgeRoom,i.active];});assert.deepEqual(cleanup,[null,false]);
  console.log('✓ Phòng cầu Waterfall: nhặt hạt, ghép cầu, chuông đặt lại, cờ tuyến và dọn');
}
