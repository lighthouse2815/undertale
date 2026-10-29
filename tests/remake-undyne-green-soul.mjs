import assert from 'node:assert/strict';

export async function testUndyneGreenSoul(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.greenSoulModule = await import('/src/undyne-green-soul.mjs'); greenSoulModule.loadUndyneGreenSoulAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, green = new greenSoulModule.UndyneGreenSoul(s), initial = [s.soul.texture.key, s.soul.x, s.soul.y, s.soul.visible];
    green.step({ left: true }); const blocked = green.block(0), missed = green.block(1), graphics = green.graphics; green.destroy(); s.scene.resume(); s.finishBattle();
    return [initial, blocked, missed, graphics.active];
  });
  assert.deepEqual(result, [['spr_heartgreen:0', 156, 116, true], true, false, false]);
  await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ SOUL xanh: sprite, khiên, chặn và dọn trong scene trận');
}
