import assert from 'node:assert/strict';
export async function testWaterfallWishesRoom(page) {
  const open = flags => page.evaluate(async flags => { const w = __remake.scene; w.flags = flags; w.plot = 110; await w.openRoom('room_water12'); }, flags);
  const flower = index => page.evaluate(index => { const w=__remake.scene, r=w.waterfallWishesRoom, e=r.flowers[index], s=e.sprite; w.player.setPosition(e.item.X-s.OriginX+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y-s.OriginY+s.MarginBottom-18); w.player.facing='u'; if (!r.interact()) throw Error('Không tương tác hoa'); const lines=[...w.dialogue.lines]; while(w.dialogue) w.advanceDialogue(); return lines; }, index);
  await open({357:3}); assert.match((await flower(0))[1], /wishes/); assert.match((await flower(1))[1], /laugh/); assert.match((await flower(3))[1], /just one/);
  const tiles = await page.evaluate(() => { const r=__remake.scene.waterfallWishesRoom; r.elapsed=0; r.frames=0; r.update(170); const first=r.waterfalls[0]; return [r.waterfalls.length,first.image.x,first.image.y,first.image.texture.key,r.waterfalls.some(t => t.key==='spr_waterfall_bright_bl' && t.image.x===480 && t.image.y===800)]; });
  assert.deepEqual(tiles,[81,480,740,'spr_waterfall_bright_lt:1',true]);
  const base = await page.evaluate(() => { const w = __remake.scene; return [w.waterfallMusic.key,w.waterfallEncounter.steps,w.waterfallWishesRoom.signs.length]; }); assert.equal(base[0], 'mus_waterfall'); assert.ok(base[1] >= 360 && base[1] <= 390); assert.equal(base[2], 2);
  await page.evaluate(() => { const w=__remake.scene,e=w.waterfallWishesRoom.signs[0],s=e.sprite; w.player.setPosition(e.item.X+(s.MarginLeft+s.MarginRight)/2-10,e.item.Y+s.MarginBottom-18); w.player.facing='u'; w.waterfallWishesRoom.interact(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /SOULs/); await page.evaluate(() => { while (__remake.scene.dialogue) __remake.scene.advanceDialogue(); });
  await open({350:1}); assert.match((await flower(0))[0], /silent/); await open({26:8}); assert.match((await flower(1))[0], /silent/);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Waterfall 12: hoa vọng âm, bia, nhạc và encounter');
}
