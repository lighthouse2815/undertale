import assert from 'node:assert/strict';
import { PyropeRules } from '../remake/src/pyrope-rules.mjs';
import dialogue from '../remake/src/pyrope-dialogue.json' with {type:'json'};

export function testPyropeRules(){
  const r=new PyropeRules();assert.deepEqual([r.heat,r.attackPower,r.mercyModifier],[0,8,20]);
  assert.equal(r.act('check'),'check');assert.equal(r.speech(100),'speechError');assert.deepEqual(r.attack(49),{kind:'rope',rate:9,duration:180,damage:8});
  assert.equal(r.act('heat'),'heat');assert.deepEqual([r.heat,r.heatWave,r.mercyModifier],[1,1,50]);assert.equal(r.speech(0),'speechHeat');assert.equal(r.status(100),'idleWarm');
  assert.equal(r.act('heat'),'heatAgain');assert.deepEqual([r.heat,r.heatWave,r.mercyModifier],[2,3,900]);assert.equal(r.status(0),'idleHot');assert.equal(r.bonus(110,110),45);assert.equal(r.bonus(109,110),0);
  assert.equal(r.act('heat'),'heatMore');assert.equal(r.heatWave,5);
  assert.equal(r.act('cool'),'cool');assert.deepEqual([r.heat,r.heatWave,r.attackPower,r.mercyModifier],[0,0,6,-200]);
  r.act('cool');r.act('cool');r.act('cool');assert.equal(r.attackPower,2);assert.equal(r.speech(0),'speechCool');
  assert.equal(r.act('heat'),'heat');assert.equal(r.mercyModifier,-170);assert.equal(r.act('heat'),'heatAgain');assert.equal(r.mercyModifier,900);
  r.act('invite');assert.equal(r.speech(0),'speechInvite');assert.deepEqual(r.attack(50,2),{kind:'bombs',rate:44,duration:180,damage:2});
  assert.deepEqual(r.attack(0,3),{kind:'bombs',rate:104,duration:180,damage:2});assert.equal(r.status(0),'idleHot');
  assert.throws(()=>r.act('invalid'),/không hợp lệ/);for(const key of ['check','heat','heatAgain','heatMore','cool','invite','speechError'])assert.ok(dialogue[key]);
  console.log('✓ Pyrope: nhiệt, hạ ATK, mercy, thoại và chọn đạn');
}
