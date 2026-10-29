import assert from 'node:assert/strict';
import { UndyneGreenShield } from '../remake/src/undyne-green-shield.mjs';

export function testUndyneGreenShield() {
  const shield = new UndyneGreenShield();
  assert.equal(shield.step({ up: true }), 300);
  for (let i = 0; i < 5; i++) shield.step({});
  assert.equal(shield.direction, 270);
  assert.equal(shield.block(3), true); assert.equal(shield.flash, 5);
  assert.equal(shield.block(2), false);
  shield.step({ left: true }); assert.equal(shield.ideal, 0);
  assert.equal(shield.block(0), true); assert.equal(shield.direction, 0);
  shield.step({ right: true, down: true, up: true, left: true }); assert.equal(shield.ideal, 180);
  assert.equal(shield.block(1), true); shield.step({}); assert.equal(shield.flash, 4);
  console.log('✓ Khiên SOUL xanh: bốn hướng, xoay và chặn giáo');
}
