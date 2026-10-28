import assert from 'node:assert/strict';
import {MadDummyHelpersSequence} from '../remake/src/mad-dummy-helpers-sequence.mjs';
export function testMadDummyHelpersSequence(){
  const state={phase:6},events=[],wave={summonHelpers(){events.push('summon');},setHelpersMood(m){events.push(m);}};let pages,callbacks,arrived=false;
  const sequence=new MadDummyHelpersSequence({state,wave,returnToStart:()=>arrived,show:(p,c)=>{pages=p;callbacks=c;}});
  sequence.step();assert.equal(state.phase,6);arrived=true;sequence.step();assert.deepEqual([state.phase,pages], [7,['HEY GUYS!']]);callbacks.onClose();assert.deepEqual([state.phase,events], [8,['summon']]);
  for(let i=0;i<29;i++)sequence.step();assert.equal(state.phase,8);sequence.step();assert.equal(state.phase,10);assert.equal(pages.length,4);callbacks.onPage(3);assert.equal(events.at(-1),'shock');callbacks.onClose();assert.deepEqual([state.phase,events.at(-1)],[11,'sad']);
  for(let i=0;i<39;i++)sequence.step();assert.equal(state.phase,11);sequence.step();assert.equal(state.phase,13);assert.equal(pages.length,3);callbacks.onClose();assert.deepEqual([state.phase,sequence.stage],[14,'done']);
  console.log('✓ Mad Dummy: gọi, sa thải trợ thủ và giới thiệu robot');
}
