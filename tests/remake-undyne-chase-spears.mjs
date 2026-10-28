import assert from 'node:assert/strict';
import { UndyneChaseSpears } from '../remake/src/undyne-chase-spears.mjs';
export async function testUndyneChaseSpears() {
  const generator = new UndyneChaseSpears(() => .5), player = { x: 300, y: 180 }, flags = {};
  const step = (overrides = {}) => generator.step({ x: 100, y: 60, player, flags, ...overrides });
  for (let i = 0; i < 9; i++) assert.equal(step().volley, false);
  assert.equal(step().volley, true); assert.equal(generator.spears.length, 3); assert.equal(generator.amount, .3); assert.equal(generator.next, 57);
  const first = generator.spears[0]; assert.equal(first.state, 'windup');
  for (let i = 0; i < 31; i++) step({ interacting: true });
  assert.equal(first.state, 'flying'); assert.ok(first.speed >= 5); assert.equal(generator.next, 88);
  generator.amount = 35; generator.next = generator.frame + 1; assert.equal(step().sound, true); assert.equal(flags[284], 1);
  const target = generator.spears.find(s => s.state === 'flying'); target.y = 150; target.speed = 0;
  assert.equal(step({ touching: s => s === target }).hit, false); assert.equal(step({ touching: s => s === target }).hit, true); assert.equal(generator.spears.length, 0);
  assert.deepEqual([flags[15], flags[16], flags[370]], [1, 1, 1]);
  const water9 = new UndyneChaseSpears(() => 0); water9.next = 1;
  water9.step({ x: 100, y: 60, player, room: 'room_water9' }); assert.equal(water9.spears.length, 3); assert.ok(water9.spears[0].x < -100);
  console.log('✓ Giáo truy đuổi Undyne: nhịp, ba giáo, khóa, ngắm và va chạm hai frame');
}
