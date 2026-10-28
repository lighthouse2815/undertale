import assert from 'node:assert/strict';

export async function testWaterfallLedge(page){
  const open=(flags={},plot=111,spawn='obj_markerA')=>page.evaluate(async({flags,plot,spawn})=>{const w=__remake.scene;w.flags=flags;w.plot=plot;await w.openRoom('room_water_waterfall4',spawn);w.scene.pause();},{flags,plot,spawn});
  const position=()=>page.evaluate(()=>{const w=__remake.scene,c=w.waterfallLedge;w.player.setPosition(c.kid.x-24,c.kid.y);w.player.facing='r';if(!c.interact())throw Error('Kid não tương tác');return w.dialogue?.lines;});
  const close=()=>page.evaluate(()=>{const w=__remake.scene;while(w.dialogue)w.advanceDialogue();});
  await open({85:1});
  assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallLedge.wall.rectangle.x,__remake.scene.waterfallLedge.stage]),[340,'following']);
  await page.evaluate(()=>{const w=__remake.scene,c=w.waterfallLedge;w.player.x=130;for(let i=0;i<100&&c.stage!=='waiting';i++)c.step();});
  assert.match((await position())[0],/ledge/);await close();await page.evaluate(()=>{const c=__remake.scene.waterfallLedge;for(let i=0;i<120;i++)c.step();});
  assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[1]),/umbrella/);await close();assert.equal(await page.evaluate(()=>__remake.scene.plot),112);
  assert.match((await position())[0],/umbrella/);await close();await page.evaluate(()=>{__remake.scene.flags[85]=0;});await position();
  await page.evaluate(()=>{const c=__remake.scene.waterfallLedge;for(let i=0;i<100&&c.stage!=='talking';i++)c.step();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),/ahead/);assert.equal(await page.evaluate(()=>__remake.scene.waterfallLedge.wall.rectangle.x),320);await close();
  await page.evaluate(()=>{const c=__remake.scene.waterfallLedge;for(let i=0;i<100&&c.stage!=='leaving';i++)c.step();});assert.deepEqual(await page.evaluate(()=>[__remake.scene.plot,__remake.scene.flags[91],__remake.scene.waterfallLedge.stage]),[113,10,'leaving']);
  await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await open({},112);assert.equal(await page.evaluate(()=>__remake.scene.waterfallLedge.stage),'ready');await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());
  for(const [flags,expected] of [[{26:9},/Owww/],[{26:9,27:1},/ahead/]]){await open(flags,112);await position();await page.evaluate(()=>{const c=__remake.scene.waterfallLedge;for(let i=0;i<100&&c.stage!=='talking';i++)c.step();});assert.match(await page.evaluate(()=>__remake.scene.dialogue.lines[0]),expected);await close();await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());}
  await open({},113,'obj_markerB');assert.deepEqual(await page.evaluate(()=>[__remake.scene.waterfallLedge.kid,__remake.scene.waterfallLedge.wall.rectangle.x]),[undefined,320]);await page.evaluate(()=>__remake.scene.scene.resume());await page.waitForFunction(()=>__remake.scene.scene.isActive());
  await page.evaluate(async()=>{const w=__remake.scene;w.flags={};w.plot=111;await w.openRoom('room_water_waterfall4','obj_markerA');});
  await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>__remake.scene.player.x>=270&&__remake.scene.waterfallLedge.stage==='waiting',null,{timeout:15000});await page.keyboard.up('ArrowRight');
  await page.keyboard.down('ArrowUp');await page.waitForFunction(()=>__remake.scene.player.y<110);await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowRight');await page.waitForTimeout(100);await page.keyboard.up('ArrowRight');await page.keyboard.press('z');await page.waitForFunction(()=>!!__remake.scene.dialogue);
  const closeWithKeys=async()=>{const n=await page.evaluate(()=>__remake.scene.dialogue.lines.length);for(let i=0;i<n;i++){await page.keyboard.press('z');await page.waitForTimeout(70);}};
  await closeWithKeys();await page.waitForFunction(()=>__remake.scene.dialogue?.lines[0]?.includes('wanna see'),null,{timeout:10000});await closeWithKeys();await page.waitForFunction(()=>__remake.scene.plot===112);await page.keyboard.press('z');await page.waitForFunction(()=>__remake.scene.dialogue?.lines[0]?.includes('ahead'),null,{timeout:10000});await closeWithKeys();await page.waitForFunction(()=>__remake.scene.plot===113,null,{timeout:10000});
  await page.evaluate(async()=>{await __remake.scene.openRoom('room_water1');});console.log('✓ Kid giúp trèo mỏm đá: ô, plot, tường, rời đi và hành trình bằng phím');
}
