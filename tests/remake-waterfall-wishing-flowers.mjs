import assert from 'node:assert/strict';
export async function testWaterfallWishingFlowers(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 107; await w.openRoom('room_water6'); w.scene.pause(); });
  const texts = await page.evaluate(() => {
    const w = __remake.scene, room = w.waterfallWishingRoom, result = [];
    for (const flower of room.flowers) {
      const s = flower.sprite; w.player.setPosition(flower.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, flower.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u';
      if (!room.interact()) throw Error('Không tương tác hoa'); result.push([flower.item.X, [...w.dialogue.lines]]); while (w.dialogue) w.advanceDialogue();
    }
    const sign = room.signs[0]; w.player.setPosition(sign.item.X, sign.item.Y + 1); w.player.facing = 'u';
    const signed = room.interact() ? [...w.dialogue.lines] : []; while (w.dialogue) w.advanceDialogue();
    w.flags[350] = 1; const quiet = room.flowerText(70); w.flags = { 26: 8 }; const genocide = room.flowerText(420);
    return { result, signed, quiet, genocide, flowers: room.flowers.length, colliders: room.flowers.every(e => w.colliders.some(c => c.objectName === 'obj_echoflower' && c.x === e.item.X)) };
  });
  assert.equal(texts.flowers, 5); assert.equal(texts.colliders, true);
  for (const [x, pattern] of [[70, /long time ago/], [260, /can't be wrong/], [360, /Make a wish/], [420, /real stars/], [640, /horoscope/]]) assert.match(texts.result.find(t => t[0] === x)[1][0], pattern);
  assert.match(texts.quiet[0], /strangely silent/); assert.match(texts.genocide[0], /strangely silent/);
  assert.match(texts.signed[0], /WISHING ROOM/);
  await page.evaluate(async () => { const w = __remake.scene; w.scene.resume(); await w.openRoom('room_water1'); });
  console.log('✓ Wishing Room: năm hoa vọng âm, tuyến im lặng và va chạm');
}
