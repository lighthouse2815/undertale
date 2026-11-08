import assert from 'node:assert/strict';
import { TsunderplaneRules } from '../remake/src/tsunderplane-rules.mjs';
import dialogue from '../remake/src/tsunderplane-dialogue.json' with {type:'json'};

export function testTsunderplaneRules(){
  const r=new TsunderplaneRules();assert.deepEqual([r.graze,r.mercyModifier,r.defense],[0,5,6]);
  assert.equal(r.act('check'),'check');assert.equal(r.speech(20),'speechCheck');
  assert.deepEqual(r.attack(51),{kind:'bombs',green:false,rate:30,duration:160});
  assert.equal(r.act('flirt',.99),'flirt4');assert.equal(r.speech(0),'speechFlirt');
  assert.deepEqual(r.attack(50,2),{kind:'planes',green:false,rate:34,duration:160});
  assert.equal(r.act('approach'),'approach');assert.equal(r.speech(100),'speechApproach');
  assert.deepEqual(r.attack(100),{kind:'planes',green:true,rate:20,duration:160});
  for(let i=0;i<3;i++){assert.equal(r.approach(),'bell');assert.equal(r.mercyModifier,5);}
  assert.equal(r.approach(),'victory');assert.deepEqual([r.graze,r.mercyModifier,r.defense],[4,100,-99]);
  assert.equal(r.bonus(80,80),60);assert.equal(r.bonus(79,80),0);assert.equal(r.status(0,80),'idleShy');assert.equal(r.status(100,29),'idleHurt');
  r.approach();r.act('approach');assert.equal(r.speech(0),'speechApproachClose');r.act('flirt',0);assert.equal(r.speech(0),'speechFlirtClose');r.act('check');assert.equal(r.speech(0),'speechCheckClose');
  const group=new TsunderplaneRules();assert.equal(group.approach(2),'bell');assert.equal(group.approach(3),'bell');assert.equal(group.approach(2),'victory');assert.equal(group.graze,4.5);
  const mixed=new TsunderplaneRules();mixed.approach();mixed.approach();assert.equal(mixed.approach(2),'bell');assert.deepEqual([mixed.graze,mixed.mercyModifier,mixed.defense],[3.5,30,6]);
  assert.deepEqual(group.attack(51,3),{kind:'bombs',green:false,rate:66,duration:160});assert.throws(()=>group.act('invalid'),/không hợp lệ/);
  for(const key of ['check','approach','flirt0','flirt4','speechApproachClose','idleHurt'])assert.ok(dialogue[key]);
  console.log('✓ Tsunderplane: ACT, tiếp cận, DEF/MERCY, thoại và chọn đạn');
}
