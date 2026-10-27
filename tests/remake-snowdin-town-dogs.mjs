import assert from 'node:assert/strict';

export async function testSnowdinTownDogs(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}) => page.evaluate(async (flags) => { const w = __remake.scene; await w.openRoom('room_area1'); w.flags = flags; w.plot = 130; w.hp = w.maxHp = 20; await w.openRoom('room_tundra_town'); }, flags);
  const near = async (name) => { await page.evaluate((name) => { const w = __remake.scene, e = w.snowdinTownDogs.dogs.find((e) => e.name === name), s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = 'u'; w.interactionCooldown = 0; w.updateCamera(); }, name); await key('z'); };
  for (const [flags, dogs] of [[{}, []], [{ 7: 1 }, ['big', 'amalgam', 'womandog', 'mandog', 'doggo']], [{ 7: 1, 54: 1 }, ['womandog', 'mandog', 'doggo']], [{ 7: 1, 52: 1, 53: 1 }, ['big', 'amalgam']], [{ 7: 1, 52: 1, 53: 1, 54: 1 }, []]]) {
    await open(flags); assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinTownDogs.dogs.map((e) => e.name)), dogs);
    assert.equal(await page.evaluate(() => __remake.scene.colliders.filter((c) => ['obj_bigdog', 'obj_grillbynpc_mandog', 'obj_grillbynpc_womandog', 'obj_grillbynpc_doggo'].includes(c.objectName)).length), dogs.length);
  }
  await open({ 7: 1 }); assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinTownDogs.dogs.filter((e) => ['big', 'amalgam'].includes(e.name)).map((e) => [e.item.X, e.item.Y, e.object.Sprite, e.image.texture.key])), [[1958, 68, 'spr_bigdog_side', 'spr_bigdog_side:0'], [1903, 72, 'spr_amalgam_dognpc', 'spr_amalgam_dognpc:0']]);
  for (const [name, n, pattern] of [['doggo', 2, /amorphous/], ['mandog', 4, /parents/], ['womandog', 2, /parents/]]) {
    for (let repeat = 0; repeat < 2; repeat++) { await near(name); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), n); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); for (let i = 0; i < n; i++) await key('z'); }
  }
  const collision = await page.evaluate(async () => { const { blocked } = await import('./src/movement.mjs'); const w = __remake.scene; return w.colliders.filter((c) => c.objectName === 'obj_bigdog').map((c) => [c.sprite.Width, c.x, c.y, blocked(w, [c], c.rectangle.centerX - 10, c.rectangle.bottom - 25)]); }); assert.deepEqual(collision, [[34, 1958, 68, true], [50, 1903, 72, true]]);
  for (const name of ['big', 'amalgam']) {
    // Tương tác từ phía trước bằng phím; chốt mốc15/35 trong cùng callback để không phụ thuộc độ trễ RPC.
    await near(name); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownDogs.locked), true);
    const bark = await page.evaluate(() => {
      const w = __remake.scene, c = w.snowdinTownDogs, e = c.barking; c.frames = 0; c.stage = 'beforeBark'; const at = [w.player.x, w.player.y];
      for (let i = 0; i < 14; i++) c.step(); const before = [c.stage, c.locked, e.image.texture.key, c.music.isPaused]; c.step(); const start = [c.stage, c.frames, e.image.texture.key, w.sound.sounds.some((s) => s.key === 'snd_bluh' && s.isPlaying)];
      for (let i = 0; i < 34; i++) c.step(); w.keys.right.isDown = true; w.menuPressed = true; w.update(0, 0); const locked = [c.locked, w.player.x, w.player.y, window.__remake.phase]; w.keys.right.isDown = false; w.menuPressed = false; c.step();
      return { before, start, locked, after: [c.locked, c.stage, e.image.texture.key, c.music.isPlaying], at };
    });
    const sprite = name === 'big' ? 'spr_bigdog_side' : 'spr_amalgam_dognpc'; assert.deepEqual(bark.before, ['beforeBark', true, `${sprite}:1`, true]); assert.deepEqual(bark.start, ['barking', 0, `${sprite}:0`, true]); assert.deepEqual(bark.locked, [true, ...bark.at, 'running']); assert.deepEqual(bark.after, [false, 'waiting', `${sprite}:0`, true]);
  }
  await page.screenshot({ path: '.cache/snowdin-town-dogs.png' });
  // Bỏ đi khi tiếng sủa chưa xong vẫn dọn ảnh/khóa/nhạc cũ và không hồi sinh chó ở lần vào thường.
  await near('big'); await page.evaluate(async () => { const w = __remake.scene, images = w.snowdinTownDogs.dogs.map((e) => e.image); await w.openRoom('room_area1'); w.townDogsCleaned = images.every((a) => !a.active); w.flags = {}; await w.openRoom('room_tundra_town'); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.townDogsCleaned, __remake.scene.snowdinTownDogs.locked, __remake.scene.snowdinTownDogs.dogs.length, __remake.scene.snowdinTown.music.isPlaying]), [true, false, 0, true]);
  console.log('✓ Chó town: chỉ sau kết thúc/52-53-54, ba lời NPC/lặp, GreaterDog+Amalgam/vị trí/mask riêng, tiếng sủa15-35frame/khóa/pause-resume/đổi phòng/dọn');
}
