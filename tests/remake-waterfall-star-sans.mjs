import assert from 'node:assert/strict';
export async function testWaterfallStarSans(page) {
  const open = (flags, plot = 110) => page.evaluate(async ({flags, plot}) => { const w = __remake.scene; w.flags = flags; w.plot = plot; await w.openRoom('room_water11'); }, {flags, plot});
  const interact = () => page.evaluate(() => { const w = __remake.scene, r = w.waterfallStarRoom, e = r.sans, s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; return r.interact(); });
  await open({}); await page.waitForFunction(() => __remake.scene.waterfallMusic?.isPlaying && Math.abs(__remake.scene.waterfallMusic.volume - .8) < .0001); assert.equal(await interact(), true);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /telescope business/);
  await page.evaluate(() => { const w = __remake.scene; while (!w.dialogue.choice) w.advanceDialogue(); w.dialogue.choice.index = 1; w.dialogue.choice.readyAt = 0; w.advanceDialogue(); });
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /come back/);
  await page.evaluate(() => __remake.scene.advanceDialogue()); await interact();
  await page.evaluate(() => { const w = __remake.scene; while (!w.dialogue.choice) w.advanceDialogue(); w.dialogue.choice.readyAt = 0; w.advanceDialogue(); });
  await page.waitForFunction(() => __remake.scene.waterfallStarRoom.viewer.view?.frames >= 2);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.pranked, __remake.scene.waterfallStarRoom.viewer.view.lens.texture.key]), [true, 'spr_starcheckeredit2:0']);
  const before = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.waterfallStarRoom.viewer.view.x, __remake.scene.waterfallMusic.volume]);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(250); await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(() => __remake.scene.player.x), before[0]);
  assert.ok(await page.evaluate(() => __remake.scene.waterfallStarRoom.viewer.view.x) > before[1]);
  await page.keyboard.press('x'); await page.waitForFunction(() => !__remake.scene.waterfallStarRoom.viewer.view);
  const restored = await page.evaluate(() => __remake.scene.waterfallMusic.volume); assert.ok(Math.abs(restored - before[2] * 2) < .0001, JSON.stringify({before, restored}));
  await interact(); assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /satisfied/);
  await page.evaluate(() => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); w.player.facing = 'd'; });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.scene.player.texture.key.startsWith('spr_maincharad_pranked:')); await page.keyboard.up('ArrowDown');
  await open({85: 1}); assert.equal(await page.evaluate(() => !!__remake.scene.player.pranked), false); await interact(); assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /parasol/);
  for (const [flags, plot] of [[{67:1},110], [{413:1},110], [{},201]]) { await open(flags, plot); assert.equal(await page.evaluate(() => __remake.scene.waterfallStarRoom.sans), null); }
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water1'); }); console.log('✓ Sans phòng sao: điều kiện, lựa chọn, kính và trò đùa');
}
