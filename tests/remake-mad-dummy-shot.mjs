import assert from 'node:assert/strict';
import {MadDummyShot} from '../remake/src/mad-dummy-shot.mjs';
export function testMadDummyShot(){
  const heart={x:100,y:100},shot=new MadDummyShot({type:'shot',x:0,y:0,vx:1,vy:0,damage:7});shot.step({heart});assert.ok(shot.speed>1&&shot.x>1);assert.deepEqual(shot.step({heart,touchesDummy:()=>true}),{type:'dummyHit',damage:1});assert.equal(shot.dead,true);
  const missile=new MadDummyShot({type:'missile',x:0,y:0,vx:1,vy:0,damage:5});for(let i=0;i<5;i++)assert.equal(missile.step({heart,touchesDummy:()=>true}),null);assert.ok(missile.direction>0);assert.deepEqual(missile.step({heart,touchesDummy:()=>true}),{type:'dummyHit',damage:1});for(let i=0;i<7;i++)missile.step({heart});assert.equal(missile.dead,true);
  const player=new MadDummyShot({type:'shot',x:0,y:0,vx:1,vy:0,damage:9});assert.deepEqual(player.step({heart,touchesHeart:()=>true}),{type:'heartHit',damage:9});
  const timed=new MadDummyShot({type:'missile',x:0,y:0,vx:1,vy:0});let event;for(let i=0;i<151;i++)event=timed.step({heart})??event;assert.equal(event.type,'explode');assert.equal(timed.frame,3);
  console.log('✓ Đạn Mad Dummy: bay, đuổi tim, trúng chủ/tim và nổ');
}
