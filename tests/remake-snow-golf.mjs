import assert from 'node:assert/strict';

export async function testSnowGolf(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}) => page.evaluate(async (flags) => {
    const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = flags; w.plot = 43; w.gold = 0;
    await w.openRoom('room_tundra8'); w.player.setPosition(430, 375); w.updateCamera();
  }, flags);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const readFlag = async () => {
    await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(440, 442); w.player.facing = 'u'; w.interactionCooldown = 0; w.updateCamera(); });
    await key('z'); await page.waitForFunction(() => !!__remake.scene.dialogue);
  };
  await open(); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowGolf.ball.x, __remake.scene.snowGolf.ball.y, __remake.scene.snowGolf.ball.size]), [340, 120, 2]);
  await page.waitForTimeout(150); assert.equal(await page.evaluate(() => __remake.scene.snowGolf.ball.size), 2, 'Bóng chưa chạm không tự co.');
  // Va chạm thật bằng phím, bóng lăn vào lỗ do chính vật lý chứ không gán trạng thái thắng.
  await page.evaluate(() => { const g = __remake.scene.snowGolf; g.ball.x = 440; g.ball.y = 420; g.draw(); });
  await page.keyboard.down('ArrowDown'); await page.waitForFunction(() => __remake.scene.snowGolf.ball.timeRunning); await page.keyboard.up('ArrowDown');
  const kick = await page.evaluate(() => { const b = __remake.scene.snowGolf.ball; return [b.vy, b.cooldown, b.touched]; });
  assert.ok(kick[0] > 0); assert.ok(kick[1] > 0); assert.equal(kick[2], true);
  await page.waitForFunction(() => __remake.scene.snowGolf.flags.length > 0);
  assert.equal(await page.evaluate(() => __remake.scene.snowGolf.flags[0].type), 0);
  const flagRise = await page.evaluate(() => { const g = __remake.scene.snowGolf, f = g.flags[0], before = f.image.y; g.step(); return [before, f.image.y, f.image.mask === g.flagMask]; });
  assert.equal(flagRise[1], flagRise[0] - 1); assert.equal(flagRise[2], true);
  await readFlag(); assert.equal(await page.evaluate(() => __remake.scene.gold), 50); assert.equal(await page.evaluate(() => __remake.scene.flags[387]), 1); await drain();
  await readFlag(); assert.equal(await page.evaluate(() => __remake.scene.gold), 50); await drain();
  await page.evaluate(() => { const g = __remake.scene.snowGolf; for (let i = 0; i < 120 && (!g.ball || g.ball.falling === 5); i++) g.step(); });
  assert.ok(await page.evaluate(() => !!__remake.scene.snowGolf.ball));
  // Mốc co nhỏ: chờ30frame đứng yên sau va chạm; đang lăn chỉ giảm vận tốc, không co.
  await open(); const shrinking = await page.evaluate(() => {
    const g = __remake.scene.snowGolf, b = g.ball; b.touched = true;
    for (let i = 0; i < 30; i++) g.step(); const at30 = b.size; g.step(); const at31 = b.size;
    b.vx = 2; const size = b.size; for (let i = 0; i < 5; i++) g.step(); return [at30, at31, b.size, size, b.vx, b.angle];
  }); assert.equal(shrinking[0], 2); assert.ok(Math.abs(shrinking[1] - 1.99) < .00001); assert.equal(shrinking[2], shrinking[3]);
  assert.ok(shrinking[4] > 1 && shrinking[4] < 2); assert.ok(shrinking[5] > 0);
  await open(); const bounce = await page.evaluate(() => {
    const g = __remake.scene.snowGolf, e = g.edges[0], b = g.ball;
    b.x = e.left - 6.5; b.y = e.top + 3; b.vx = 2; b.vy = 0;
    const old = b.x; g.step(); return [old, b.x, b.vx];
  }); assert.ok(bounce[1] < bounce[0]); assert.ok(bounce[2] < 0);
  // Tất cả biên màu, thời gian và phần thưởng; bước mô phỏng vẫn phải va chạm lỗ.
  for (const [time, size, type, gold] of [[180, 2, 0, 50], [181, 2, 1, 5], [240, 2, 1, 5], [241, 2, 2, 3], [330, 2, 2, 3], [331, 2, 3, 2], [450, 2, 3, 2], [451, 2, 4, 1], [600, 2, 4, 1], [601, 2, 5, 2], [700, .59, 6, 4]]) {
    await open(); await page.evaluate(({ time, size }) => { const g = __remake.scene.snowGolf, b = g.ball; b.x = 450; b.y = 448; b.size = size; b.rolltime = time; g.step(); }, { time, size });
    assert.equal(await page.evaluate(() => __remake.scene.snowGolf.flags[0].type), type); await readFlag();
    assert.equal(await page.evaluate(() => __remake.scene.gold), gold); await drain(); await readFlag(); assert.equal(await page.evaluate(() => __remake.scene.gold), gold); await drain();
  }
  await open({ 387: 1 }); await page.evaluate(() => { const g = __remake.scene.snowGolf; g.ball.x = 450; g.ball.y = 448; g.step(); });
  await readFlag(); assert.equal(await page.evaluate(() => __remake.scene.gold), 10); await drain();
  // Cờ rời camera mất đi; dân số16 ngừng sinh bóng và có lời lỗ trống riêng.
  await page.evaluate(() => { const w = __remake.scene; w.cameras.main.setScroll(0, 0); w.snowGolf.step(); }); assert.equal(await page.evaluate(() => __remake.scene.snowGolf.flags.length), 0);
  await open({ 203: 16 }); assert.equal(await page.evaluate(() => __remake.scene.snowGolf.ball ?? null), null); await readFlag();
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /hole/); await drain();
  await open({ 202: 20, 45: 4, 52: 1 }); assert.ok(await page.evaluate(() => !!__remake.scene.snowGolf.ball));
  // Hết kích thước -> chờ10frame -> bóng từ mép trên camera rơi về generator.
  const respawn = await page.evaluate(() => { const w = __remake.scene, g = w.snowGolf; g.ball.size = .19; g.step(); w.cameras.main.setScroll(0, 0); for (let i = 0; i < 9; i++) g.step(); const before = g.ball ?? null; g.step(); const start = [g.ball.y, g.ball.falling]; for (let i = 0; i < 100 && g.ball.falling; i++) g.step(); return [before, start, g.ball.y, g.ball.falling]; });
  assert.deepEqual(respawn, [null, [-10, 1], 120, 0]);
  await page.evaluate(async () => { await __remake.scene.openRoom('room_tundra6A'); }); assert.equal(await page.evaluate(() => __remake.scene.snowGolf), null);
  console.log('✓ Golf tuyết: đẩy bằng phím/lăn/ma sát/quay/co30frame/bật mép, vào lỗ/cờ trồi/7màu/biên thời gian/GOLD/387/không thưởng lặp, dân số16/co hết/sinh lại/rơi/dọn');
}
