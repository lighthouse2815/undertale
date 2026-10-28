import assert from 'node:assert/strict';
import {madDummyAct} from '../remake/src/mad-dummy-act.mjs';
export function testMadDummyAct(){
  const flags={};assert.match(madDummyAct(flags,'check')[0],/ATK 30 DEF YES/);assert.equal(flags[147],undefined);
  const lines=madDummyAct(flags,'talk');assert.equal(lines.length,3);assert.match(lines[2],/No one is happy/);assert.equal(flags[147],1);assert.throws(()=>madDummyAct(flags,'hug'));
  console.log('✓ ACT Mad Dummy: Check, Talk và cờ 147');
}
