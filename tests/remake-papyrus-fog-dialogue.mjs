import assert from 'node:assert/strict';
import { papyrusFogIntro, papyrusFogOffer, papyrusFogAfter, papyrusFogMurderSpeech } from '../remake/src/papyrus-fog-dialogue.mjs';

export async function testPapyrusFogDialogue() {
  for (const [flags, memory, count, fragment, offer] of [[{},0,25,/HUMAN/,false],[{},1,14,/HUMAN/,false],[{67:-1},0,7,/GONE/,false],[{67:-1},1,10,/PROVES/,false],[{67:-2},0,8,/BACK AGAIN/,false],[{67:-3},0,6,/BACK AGAIN/,true]]) {
    const result=papyrusFogIntro(flags,memory,false); assert.equal(result.pages.length,count); assert.match(result.pages[0].text,fragment); assert.equal(result.offer,offer); assert.equal(result.pages[0].font,'fnt_papyrus');
  }
  assert.match(papyrusFogIntro({67:-3},0,true).pages[0].text,/HALT/);
  assert.deepEqual(papyrusFogMurderSpeech.map((pages)=>pages.length),[13,7,4]);
  assert.deepEqual([papyrusFogOffer(0).fight,papyrusFogOffer(1).fight],[true,false]);
  assert.match(papyrusFogOffer(1).pages.at(-1).text,/FAILURE/);
  assert.match(papyrusFogAfter({},false).king[2].text,/CASTLE/); assert.match(papyrusFogAfter({},true).king[2].text,/KING/);
  assert.match(papyrusFogAfter({66:1},false).friends.at(-2).text,/DATE/); assert.match(papyrusFogAfter({},false).friends.at(-2).text,/HANG OUT/);
  console.log('✓ Lời Papyrus phòng sương: ký ức, ba lần bắt/lựa chọn, tuyến giết và lời sau trận/date');
}
