import assert from 'node:assert/strict';
import { UndyneTileSpears } from '../remake/src/undyne-tile-spears.mjs';
export function testUndyneTileSpears(){
  const g=new UndyneTileSpears({random:()=>.5}),state={player:{x:101,y:101}};
  assert.equal(g.step(state).volley,false);assert.equal(g.step(state).volley,true);assert.equal(g.spears.length,8);assert.equal(g.spears[7].duty,true);assert.deepEqual([g.spears[7].x,g.spears[7].y],[100,100]);
  let rise=false;for(let i=0;i<30;i++)rise=g.step(state).rise||rise;assert.equal(rise,true);for(let i=0;i<15;i++)g.step(state);assert.equal(g.spears.length,0);
  const hit=new UndyneTileSpears({random:()=>.5});hit.step(state);hit.step(state);let result;for(let i=0;i<30;i++){result=hit.step({...state,touching:()=>true});if(result.hit)break;}assert.equal(result.hit,true);assert.equal(hit.spears.length,0);assert.ok(hit.timer>=70);
  const moved=new UndyneTileSpears({random:()=>.5});moved.step({...state,direction:{right:true}});moved.step({...state,direction:{right:true},blocked:(x)=>x>140});assert.ok(moved.spears.every(s=>s.x<=140));
  const end=new UndyneTileSpears({end:true});for(let i=0;i<29;i++)assert.equal(end.step(state).volley,false);assert.equal(end.step(state).volley,true);
  const accelerated=new UndyneTileSpears({random:()=>.5});let intense=false;for(let i=0;i<4000&&!intense;i++)intense=accelerated.step(state).intense;assert.equal(intense,true);assert.ok(accelerated.interval<=15);
  console.log('✓ Giáo sàn Undyne: nhịp sinh, hướng, vùng cấm, va chạm và dọn');
}
