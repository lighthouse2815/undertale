import assert from 'node:assert/strict';
import { VulkinRules } from '../remake/src/vulkin-rules.mjs';
import dialogue from '../remake/src/vulkin-dialogue.json' with { type: 'json' };

export function testVulkinRules() {
  const rules = new VulkinRules();
  assert.deepEqual(rules.act('check',7),{text:'check',defense:7});
  assert.equal(rules.speech({hp:20,maxHp:20,command:49}),'speechFull0');
  assert.deepEqual(rules.attack({hp:20,maxHp:20}),{kind:'cloud',rate:9,duration:160});
  assert.deepEqual(rules.attack({hp:19,maxHp:20}),{kind:'lava',rate:7,duration:160});
  assert.deepEqual(rules.act('encourage',7),{text:'encourage',defense:7});
  assert.equal(rules.mercyModifier,100); assert.equal(rules.bonus(20,20),40); assert.equal(rules.bonus(19,20),0);
  assert.equal(rules.speech({hp:20,maxHp:20,command:0}),'speechEncourage');
  assert.deepEqual(rules.attack({hp:20,maxHp:20}),{kind:'lava',rate:5,duration:160});
  assert.deepEqual(rules.attack({hp:20,maxHp:20,population:2}),{kind:'cloud',rate:8.5,duration:160});
  assert.deepEqual(rules.act('criticize',7),{text:'criticize',defense:7});
  assert.equal(rules.mercyModifier,-200); assert.equal(rules.speech({hp:20,maxHp:20,command:10}),'speechCriticize');
  assert.deepEqual(rules.attack({hp:20,maxHp:20}),{kind:'none',rate:9,duration:0});
  assert.deepEqual(rules.act('criticize',7),{text:'criticizeAgain',defense:7});
  assert.equal(rules.speech({hp:20,maxHp:20,command:0}),'speechCriticizeAgain');
  assert.deepEqual(rules.attack({hp:20,maxHp:20,population:2}),{kind:'none',rate:15.299999999999999,duration:160});
  assert.deepEqual(rules.act('hug',7),{text:'hugDefense',defense:2});
  assert.deepEqual(rules.act('hug',2),{text:'hug',defense:2});
  assert.equal(rules.speech({hp:20,maxHp:20,command:0}),'speechHugAgain');
  rules.act('hug',2); assert.equal(rules.speech({hp:20,maxHp:20,command:0}),'speechHugThird');
  assert.deepEqual([rules.criticized,rules.encouraged,rules.hugged,rules.mercyModifier],[0,0,3,100]);
  rules.attack({hp:20,maxHp:20}); assert.equal(rules.speech({hp:20,maxHp:20,command:50}),'speechHugged1');
  assert.throws(()=>rules.act('invalid',0),/không hợp lệ/);
  for (const key of ['check','encourage','criticize','criticizeAgain','hug','hugDefense','speechHurt0','speechFull1','speechHugThird']) assert.ok(dialogue[key]);
  console.log('✓ Vulkin: ACT, phòng thủ, chọn đạn, hội thoại và thưởng');
}
