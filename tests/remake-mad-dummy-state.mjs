import assert from 'node:assert/strict';
import {MadDummyState} from '../remake/src/mad-dummy-state.mjs';
export function testMadDummyState(){
  const s=new MadDummyState();assert.deepEqual(s.beginWave(),{phase:0,hp:300,type2:0});s.hit();s.startFirstHitDialogue();s.finishFirstHitDialogue();assert.equal(s.phase,2);assert.deepEqual(s.beginWave(),{phase:2,hp:294,type2:0});
  s.hp=275;s.hit();assert.equal(s.phase,3);s.hp=259;assert.deepEqual(s.beginWave(),{phase:3,hp:254,type2:0});assert.equal(s.phase,5);s.hp=196;s.hit();assert.equal(s.phase,6);
  s.phase=5;s.hp=250;for(let i=0;i<4;i++)assert.equal(s.beginWave().type2,i);assert.equal(s.type2,0);
  s.phase=14;s.hit();assert.equal(s.phase,15);s.phase=14;assert.equal(s.beginWave().phase,14);assert.equal(s.phase,15);s.beginWave();assert.equal(s.phase,16);s.beginWave();assert.equal(s.phase,17.5);s.beginWave();assert.equal(s.phase,17);
  s.phase=28;s.hit();assert.equal(s.phase,29);console.log('✓ Mad Dummy: HP nội bộ và các mốc lượt');
}
