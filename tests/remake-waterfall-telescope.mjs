import assert from 'node:assert/strict';
export async function testWaterfallTelescope(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.plot = 107; await w.openRoom('room_water4'); await w.openRoom('room_water6'); w.waterfallMusic = w.sound.add('mus_waterfall', { loop: true, volume: .8 }); w.waterfallMusic.play(); const e = w.waterfallWishingRoom.telescope, s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; w.waterfallWishingRoom.interact(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /Look through the telescope/);
  await page.waitForTimeout(130); await page.keyboard.press('z');
  await page.waitForFunction(() => __remake.scene.waterfallWishingRoom.view?.frames >= 2);
  const before = await page.evaluate(() => { const w = __remake.scene; return [w.player.x, w.player.y, w.waterfallMusic.volume, w.waterfallWishingRoom.view.x, w.waterfallWishingRoom.view.y]; });
  assert.ok(Math.abs(before[2] - .4) < .0001); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight');
  const moving = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.waterfallWishingRoom.view.x]);
  assert.deepEqual(moving.slice(0, 2), before.slice(0, 2)); assert.ok(moving[2] > 0);
  await page.keyboard.press('x'); await page.waitForFunction(() => !__remake.scene.waterfallWishingRoom.view);
  assert.ok(Math.abs(await page.evaluate(() => __remake.scene.waterfallMusic.volume) - .8) < .0001);
  await page.evaluate(() => __remake.scene.waterfallWishingRoom.interact()); await page.waitForTimeout(130); await page.keyboard.press('ArrowRight'); await page.keyboard.press('z');
  await page.waitForFunction(() => !__remake.scene.dialogue); assert.equal(await page.evaluate(() => !!__remake.scene.waterfallWishingRoom.view), false);
  await page.evaluate(async () => { const w = __remake.scene; await w.openRoom('room_water1'); });
  console.log('✓ Kính thiên văn: Yes/No, di chuyển ống kính, khóa nhân vật, thoát và âm lượng');
}
