import assert from 'node:assert/strict';

export async function testBlueSoul(page) {
  await page.evaluate(async () => {
    const w = __remake.game.scene.getScene('World');
    w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.inventory = [];
    await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit');
  });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  const result = await page.evaluate(() => {
    const s = __remake.scene;
    s.mode = 'soul'; s.wave = { bullets: [], step: () => false, destroy() {} };
    s.soulMovement = 2; s.soulJumpStage = 1; s.soulVSpeed = 0;
    s.arena.setPosition(118.5, 125).setSize(80, 67.5); s.soul.setPosition(150, 184.5);
    const tick = () => { s.soulElapsed = 0; s.updateSoul(1000 / 30); };
    const state = () => [s.soul.x, s.soul.y, s.soulVSpeed, s.soulJumpStage, s.soul.texture.key];
    s.keys.up.isDown = true; tick(); const start = state(); tick(); const held = state();
    s.keys.up.isDown = false; tick(); const released = state();
    s.soul.setPosition(150, 127.1); s.soulVSpeed = -6; s.soulJumpStage = 2; s.keys.up.isDown = true; tick(); const ceiling = state();
    s.keys.up.isDown = false; s.soul.setPosition(150, 184); s.soulVSpeed = 7.9; tick(); const ground = state();
    s.keys.down.isDown = true; s.keys.right.isDown = true; s.keys.shift.isDown = true; tick(); const sideways = state();
    s.keys.down.isDown = false; s.keys.right.isDown = false; s.keys.shift.isDown = false;
    s.soulMovement = 1; s.keys.up.isDown = true; tick(); const red = state(); s.keys.up.isDown = false;
    s.finishBattle();
    return { start, held, released, ceiling, ground, sideways, red };
  });
  const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
  assert.deepEqual(result.start, [150, 181.5, -6, 2, 'spr_heartblue:0']);
  close(result.held[1], 178.6); close(result.held[2], -5.8);
  close(result.released[1], 178.35); close(result.released[2], -.5);
  assert.deepEqual(result.ceiling.slice(1, 4), [127, 0, 2]);
  assert.deepEqual(result.ground.slice(1, 4), [184.5, 0, 1]);
  assert.deepEqual(result.sideways.slice(0, 4), [151, 184.5, 0, 1]);
  assert.deepEqual([result.red[1], result.red[4]], [182.5, 'spr_heart:0']);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Tim xanh: nhảy giữ/nhả, trọng lực, trần/sàn, trái-phải/Shift, không đi xuống và trở lại tim đỏ');
}
