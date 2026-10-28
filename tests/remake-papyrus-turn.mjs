import assert from 'node:assert/strict';
import { preparePapyrusTurn, papyrusTurnStatus } from '../remake/src/papyrus-turn.mjs';

export async function testPapyrusTurn() {
  const make = (values = {}) => ({ previousScene: { flags: {} }, conversation: 0, talked: 0, heard: -1, murder: false, enemyHp: 680, prevHp: 680, truefight: false, fighto: -1, xfight: 0, hearthp: 20, hearthp2: 20, xxtalk: 0, insult: 0, ...values });
  let b = make(); let turn = preparePapyrusTurn(b, 55); assert.equal(turn.command, -1); assert.equal(turn.blueAttack, true); assert.match(turn.speech[0], /WON'T/); assert.equal(b.conversation, 1);
  b = make({ enemyHp: 670 }); assert.match(preparePapyrusTurn(b, 4).speech[0], /SERIOUS/);
  b = make({ conversation: 1, truefight: true }); assert.match(preparePapyrusTurn(b, 0).speech[0], /BEHOLD/);
  b.status = "* You're blue now."; assert.equal(papyrusTurnStatus(b, -1), b.status);
  b.previousScene.flags[66] = 1; assert.match(preparePapyrusTurn(b, 0).speech[0], /WEAR/);
  b = make({ conversation: 1, truefight: true, fighto: 0, hearthp2: 19 }); assert.match(preparePapyrusTurn(b, 0).speech[0], /HOLDING/); assert.deepEqual([b.fighto, b.xxtalk], [-1, 1]);
  b = make({ conversation: 1, truefight: true, fighto: 1, hearthp2: 19, xxtalk: 1 }); assert.match(preparePapyrusTurn(b, 0).speech[0], /LONGER/); assert.deepEqual([b.fighto, b.xxtalk], [0, 2]);
  for (const [fighto, pattern] of [[2,/POPULARITY/],[9,/SINCERELY/],[13,/GIVE UP/],[14,/SPECIAL/],[15,/NORMAL/]]) { b = make({ conversation: 1, truefight: true, fighto }); assert.match(preparePapyrusTurn(b, 1).speech[0], pattern); }
  b = make({ conversation: 1, truefight: true, enemyHp: 140 }); assert.match(preparePapyrusTurn(b, 1).speech[0], /BEHOLD/); assert.deepEqual([b.fighto,b.xfight],[14,4]);
  b = make({ conversation: 1, truefight: true, enemyHp: 80 }); assert.match(preparePapyrusTurn(b, 1).speech[0], /NORMAL/); assert.deepEqual([b.fighto,b.xfight],[15,0]);
  for (const [heard,insult,pattern] of [[0,0,/NYEH/],[1,1,/HOSPITALITY/],[1,2,/CACTUS/],[1,3,/WASTE/],[3,0,/DATE/]]) { b = make({ conversation: 1, heard, insult }); assert.match(preparePapyrusTurn(b, 0).speech[0], pattern); }
  b = make({ murder: true }); assert.equal(preparePapyrusTurn(b, 3).speech[0], '  ...'); assert.equal(b.conversation, 0);
  b = make({ conversation: 1, flirt2: 0, mercy: 0 });
  for (const [command, fragment] of [[0,'bone'],[15,'bone'],[16,'non-bone'],[20,'cackling'],[30,'whispers'],[40,'rattling'],[60,'cool'],[80,'options'],[90,'Smells'],[97,'joke']]) assert.match(papyrusTurnStatus(b, command), new RegExp(fragment));
  b.status = "* You're blue now."; assert.equal(papyrusTurnStatus(b, -1), b.status);
  b.previousScene.flags[66] = 1; assert.match(papyrusTurnStatus(b, 0), /wear/); assert.equal(b.flirt2, 1);
  b.flirt2 = 9; assert.match(papyrusTurnStatus(b, 0), /ears/); assert.equal(b.flirt2, 10);
  b.enemyHp = 99; assert.match(papyrusTurnStatus(b, 0), /defeat/); b.mercy = 8000; assert.match(papyrusTurnStatus(b, 0), /sparing/);
  b.mercy = 0; b.murder = true; assert.match(papyrusTurnStatus(b, 0), /sparing/);
  console.log('✓ Lời lượt Papyrus: bắt đầu/đổi xanh, hướng dẫn nhảy, flirt/insult, mốc HP, đòn đặc biệt và tuyến diệt chủng');
}
