import assert from 'node:assert/strict';
import { waterfallFishDialogue, waterfallEchoDialogue, waterfallKidDialogue } from '../remake/src/waterfall-sentry-dialogue.mjs';

export async function testWaterfallSentryDialogue() {
  assert.match(waterfallFishDialogue(0,false)[0], /Echo Flower/);
  assert.match(waterfallFishDialogue(1,false)[0], /Neat/);
  assert.match(waterfallFishDialogue(0,true)[0], /Never trust/);
  const first = waterfallEchoDialogue(true,0,false); assert.equal(first.heard,true); assert.equal(first.pages.length,2); assert.match(first.pages[0], /validation/);
  assert.match(waterfallEchoDialogue(true,1,false).pages[0], /Echo Flower/);
  assert.match(waterfallEchoDialogue(true,2,false).pages[0], /Neat/);
  assert.match(waterfallEchoDialogue(true,1,true).pages[0], /Never trust/);
  assert.match(waterfallEchoDialogue(false,0,false).pages[0], /silent/);
  assert.equal(waterfallKidDialogue(0,0).length,4);
  assert.match(waterfallKidDialogue(1,0)[0], /ready/);
  assert.match(waterfallKidDialogue(1,1)[0], /going/);
  assert.match(waterfallKidDialogue(1,2)[0], /Where/);
  console.log('✓ Lời phòng trạm Waterfall: cá/hoa vọng âm và bốn nhánh Monster Kid');
}
