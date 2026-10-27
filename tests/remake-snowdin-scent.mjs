import assert from 'node:assert/strict';

export async function testSnowdinScent(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const place = (x, y, facing) => page.evaluate(([x, y, facing]) => { const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0; }, [x, y, facing]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 43; await w.openRoom('room_tundra8'); window.scentMusic = w.snowdinMusic; w.player.setPosition(720, 80); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra8A');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 120]);
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic === scentMusic), true);
  for (const [x, word] of [[100, 'His'], [200, 'Hers']]) {
    await place(x, 131, 'u'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogueText.text), `* (${word}.)`); await key('z');
    await place(x, 131, 'd'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  }
  await place(148, 130, 'u'); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 4);
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /SMELL DANGER/);
  for (const [word, font] of [['YELLOW', 'yellow'], ['BLUE', 'blue'], ['GREEN', 'red']]) {
    await key('z'); assert.equal(await page.evaluate(() => __remake.scene.snowdinScent.labels[1].text), word);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinScent.labels[1].font), `fnt_maintext:${font}`);
    assert.doesNotMatch(await page.evaluate(() => __remake.scene.dialogueText.text), /\\[A-Z]/);
    // Kiểm tra pixel atlas thật của renderer Canvas; GREEN trong source được tô đỏ bằng mã R.
    assert.deepEqual(await page.evaluate((font) => { const w = __remake.scene, glyph = w.cache.bitmapFont.get('fnt_maintext').data.chars[65];
      const ctx = w.textures.get(`fnt_maintext:${font}`).getSourceImage().getContext('2d'); const pixels = ctx.getImageData(glyph.x, glyph.y, glyph.width, glyph.height).data;
      for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3]) return [...pixels.slice(i, i + 3)];
    }, font), font === 'yellow' ? [255, 255, 0] : font === 'blue' ? [0, 0, 255] : [255, 0, 0]);
  }
  await page.screenshot({ path: '.cache/snowdin-scent.png' }); await key('z');
  assert.equal(await page.evaluate(() => __remake.scene.snowdinScent.labels.length), 0);
  await place(148, 140, 'u'); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(300); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate(() => __remake.scene.player.y + 19 >= __remake.scene.colliders.find((c) => c.objectName === 'obj_sign_room').rectangle.bottom));
  await place(20, 120, 'l'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra8');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.snowdinScent]), [720, 80, null]);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = { 7: 1 }; w.plot = 110; await w.openRoom('room_area1'); await w.openRoom('room_tundra8A'); w.saveGame(); await w.restoreGame(); });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.key), 'mus_reunited');
  await place(148, 130, 'u'); await key('z'); await key('z');
  await page.evaluate(async () => __remake.scene.openRoom('room_tundra8'));
  assert.equal(await page.evaluate(() => __remake.scene.children.list.some((e) => e.font === 'fnt_maintext:yellow')), false);
  console.log('✓ Nhánh8A: cửa trên8↔8A/marker/nhạc, His-Hers/hướng, biển4trang/ba màu atlas thật/collider, lời sau kết thúc/SAVE/dọn giữa thoại');
}
