import assert from 'node:assert/strict';

export async function testUndyneGreenSpear(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.greenSoulModule = await import('/src/undyne-green-soul.mjs'); window.greenSpearModule = await import('/src/undyne-green-spear.mjs'); greenSoulModule.loadUndyneGreenSoulAssets(s); greenSpearModule.loadUndyneGreenSpearAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.scene.pause(); });
  const result = await page.evaluate(() => {
    const s = __remake.scene, soul = new greenSoulModule.UndyneGreenSoul(s), outputs = [];
    for (let side = 0; side < 4; side++) {
      soul.shield.ideal = [0, 180, 90, 270][side]; const spear = new greenSpearModule.UndyneGreenSpear(s, soul, side); const hp = s.hp;
      for (let i = 0; i < 60 && !spear.done; i++) spear.step(); outputs.push([spear.done, s.hp === hp, soul.shield.flash, spear.image.active]);
    }
    soul.shield.ideal = 270; s.invFrames = 0; const before = s.hp, missed = new greenSpearModule.UndyneGreenSpear(s, soul, 0);
    for (let i = 0; i < 60 && !missed.done; i++) missed.step(); const damage = before - s.hp;
    soul.destroy(); s.scene.resume(); s.finishBattle(); return { outputs, damage, missed: missed.done };
  });
  assert.deepEqual(result.outputs, Array(4).fill([true, true, 5, false])); assert.ok(result.damage > 0); assert.equal(result.missed, true);
  await page.waitForFunction(() => __remake.phase === 'running'); console.log('✓ Giáo SOUL xanh: bốn hướng đỡ, mask, lọt gây sát thương và dọn');
}
