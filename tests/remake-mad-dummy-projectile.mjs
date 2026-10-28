import assert from 'node:assert/strict';
import {MadDummyProjectile} from '../remake/src/mad-dummy-projectile.mjs';
export function testMadDummyProjectile(){
  const border={left:100,right:300,top:100,bottom:300},heart={x:200,y:200};
  for(const [side,x,y] of [[0,96,150],[1,282,150],[2,150,96],[3,150,282]]){
    const d=new MadDummyProjectile({x,y,side,damage:7});for(let i=0;i<3&&d.phase==='enter';i++)d.step({border,heart});assert.equal(d.phase,'aim');for(let i=0;i<20;i++)d.step({border,heart});assert.equal(d.phase,'retreat');let shot;for(let i=0;i<30;i++)shot=d.step({border,heart})??shot;assert.equal(shot.type,'shot');assert.equal(shot.damage,7);assert.ok(Math.abs(Math.hypot(shot.vx,shot.vy)-1)<1e-9);
  }
  const explosive=new MadDummyProjectile({x:104,y:150,side:0,type:1});explosive.step({border,heart});for(let i=0;i<22;i++)explosive.step({border,heart});assert.equal(explosive.phase,'escape');assert.equal(explosive.flash,5);
  const missile=new MadDummyProjectile({x:104,y:150,side:0,type:4});let result;for(let i=0;i<55;i++)result=missile.step({border,heart})??result;assert.equal(result.type,'missile');
  console.log('✓ Đạn Mad Dummy: vào khung, nhắm, rút lui, bắn và loại nhấp nháy');
}
