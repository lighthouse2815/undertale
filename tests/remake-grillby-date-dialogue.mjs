import assert from 'node:assert/strict';
import { grillbyDateDialogue as d, grillbyMealChoice, grillbyBrotherChoice, grillbyKetchupChoice, grillbyFlowerChoice } from '../remake/src/grillby-date-dialogue.mjs';

export async function testGrillbyDateDialogue() {
  assert.match(d.arrival[0],/shortcut/); assert.match(d.brunch[0],/breakfast/); assert.match(d.brunch[2],/brunch/);
  assert.deepEqual([grillbyMealChoice(0).foodFlag,grillbyMealChoice(1).foodFlag],[1,2]);
  assert.match(grillbyMealChoice(0).pages[1],/fries/); assert.match(grillbyMealChoice(1).pages[1],/burg/);
  assert.deepEqual([grillbyBrotherChoice(0).length,grillbyBrotherChoice(1).length],[5,7]);
  assert.match(grillbyBrotherChoice(1)[0],/pal/); assert.deepEqual([grillbyKetchupChoice(0).drink,grillbyKetchupChoice(1).drink],[false,true]);
  assert.match(grillbyFlowerChoice(0)[0],/know/); assert.match(grillbyFlowerChoice(1)[0],/tell/);
  assert.equal(grillbyFlowerChoice(0).length,14); assert.match(grillbyFlowerChoice(1).at(-1),/thanks/);
  assert.equal(d.papyrus.length,8); assert.match(d.bill[1],/foot the/); assert.match(d.farewell[1],/forgot/);
  console.log('✓ Lời bữa ăn Grillby: gọi món, Papyrus, ketchup, hoa và lời kết');
}
