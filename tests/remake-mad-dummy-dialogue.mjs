import assert from 'node:assert/strict';
import {madDummyIntro,madDummyAfter} from '../remake/src/mad-dummy-dialogue.mjs';
export function testMadDummyDialogue(){
  for(const [result,match] of [[0,/ran away/],[1,/DESTROYED/],[2,/talked to them/],[3,/boring/]])assert.ok(madDummyIntro({14:result}).some(line=>match.test(line)));
  for(const [result,match] of [[0,/run away/],[1,/FOOL/],[2,/intimidated/]])assert.match(madDummyIntro({355:result})[0],match);
  assert.ok(madDummyIntro({26:9,14:1}).some(line=>/neighbors/.test(line)));assert.ok(madDummyIntro({26:9,27:1,14:1}).some(line=>/DESTROYED/.test(line)));
  assert.equal(madDummyAfter({36:0}).length,4);assert.equal(madDummyAfter({36:1}).length,7);console.log('✓ Mad Dummy: lời mở đầu theo hình nộm, tuyến giết và lời sau trận');
}
