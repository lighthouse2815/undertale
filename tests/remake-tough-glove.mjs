import assert from 'node:assert/strict';

export async function testToughGlove(page) {
  const equipment = await page.evaluate(async () => {
    const { itemAction } = await import('/src/inventory.mjs');
    const w = __remake.scene; await w.openRoom('room_ruins7');
    w.flags = {}; w.inventory = [14, 13]; w.weapon = 3; w.weaponStrength = 0; w.lv = 1; w.hp = w.maxHp = 20;
    const text = await fetch('/src/inventory.json').then((r) => r.json()); w.cache.json.remove('inventory'); w.cache.json.add('inventory', text);
    // snd_item được tải cùng ITEM, như menu thật.
    if (!w.cache.audio.exists('snd_item')) await new Promise((resolve) => { w.load.audio('snd_item', '/assets/sounds/snd_item/snd_item.wav'); w.load.once('complete', resolve); w.load.start(); });
    const info = itemAction(w, 0, 'info', text), use = itemAction(w, 0, 'use', text);
    w.saveGame(); return { info, use, weapon: w.weapon, strength: w.weaponStrength, items: w.inventory };
  });
  assert.match(equipment.info[0], /Weapon AT 5/); assert.match(equipment.use[0], /equipped Tough Glove/);
  assert.deepEqual([equipment.weapon, equipment.strength, equipment.items], [14, 5, [3, 13]]);
  await page.evaluate(async () => { const w = __remake.scene; w.weapon = 3; w.weaponStrength = 0; await w.restoreGame(); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.weapon, __remake.scene.weaponStrength]), [14, 5]);
  for (const monster of ['froggit', 'toriel']) {
    await page.evaluate((monster) => { __remake.scene.flags = {}; __remake.scene.plot = 24; __remake.startBattle(monster); }, monster);
    await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
    for (const punches of [0, 1, 2, 3, 4]) {
      const result = await page.evaluate((punches) => {
        const s = __remake.scene; s.enemyHp = 440; s.defense = 1; s.startFight();
        const speed = s.attackSpeed; s.attackSpeed = 0; s.attackX = 156;
        s.confirmPressed = true; s.updateFight(0); s.confirmPressed = false;
        const initialHp = s.enemyHp, damage = s.glovePunch.damage;
        for (let i = 0; i < 30 && s.mode === 'fight'; i++) { s.confirmPressed = i < punches; s.updateFight(1000 / 30); }
        s.confirmPressed = false;
        return { initialHp, hp: s.enemyHp, damage, dealt: s.damage ?? 0, punches: s.glovePunch.punches, frames: s.glovePunch.frames,
          prompt: s.glovePunch.prompt.active, mode: s.mode, message: s.message.text, speed, barX: s.bar.x,
          fists: s.children.list.filter((c) => c.texture?.key.startsWith('spr_regfist:') || c.texture?.key.startsWith('spr_hyperfist:')).map((c) => c.texture.key) };
      }, punches);
      assert.equal(result.initialHp, 440, 'Dừng thanh chưa gây sát thương trước các cú đấm.');
      assert.equal(result.punches, punches); assert.equal(result.prompt, false); assert.equal(result.mode, 'pages');
      assert.ok(result.speed >= .198 && result.speed <= .234);
      assert.equal(result.barX, 156);
      assert.equal(result.dealt, Math.ceil(result.damage * punches / 4)); assert.equal(result.hp, 440 - result.dealt);
      assert.equal(result.frames, punches === 4 ? 4 : 30);
      if (!punches) assert.equal(result.message, '* MISS');
      if (punches === 4) assert.ok(result.fists.includes('spr_hyperfist:0'));
    }
    // scr_levelup đặt AT99 ở LV20; kiểm tra sát thương thật và ngưỡng MERCY ở cả hai phía.
    for (const level of [19, 20]) {
      const result = await page.evaluate((level) => {
        const s = __remake.scene, w = s.previousScene; w.lv = level; s.enemyHp = 440; s.defense = 1;
        const random = Math.random; Math.random = () => .5;
        try {
          s.startFight(); s.attackSpeed = 0; s.attackX = 156; s.confirmPressed = true; s.updateFight(0);
          for (let i = 0; i < 4; i++) { s.confirmPressed = true; s.updateFight(1000 / 30); }
          s.confirmPressed = false;
          const hp = s.enemyHp, damage = s.damage;
          s.enemyHp = 100; s.mercyModifier = 20;
          const mercy = s.spareable(); w.lv = 1;
          return { hp, damage, mercy };
        } finally { Math.random = random; }
      }, level);
      const damage = level === 20 ? monster === 'froggit' ? 212 : 218 : monster === 'froggit' ? 101 : 107;
      assert.deepEqual([result.damage, result.hp], [damage, 440 - damage]);
      if (monster === 'froggit') assert.equal(result.mercy, level === 20);
    }
    // Nhấn Z thật: lần dừng thanh không tính là cú đấm, bốn lần sau mới đủ sức.
    await page.evaluate(() => { const s = __remake.scene; s.enemyHp = 440; s.startFight(); s.attackSpeed = 0; s.attackX = 156; });
    await page.keyboard.press('z'); await page.waitForFunction(() => !!__remake.scene.glovePunch);
    assert.equal(await page.evaluate(() => __remake.scene.glovePunch.punches), 0);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('z'); await page.waitForTimeout(65); }
    await page.waitForFunction(() => __remake.scene.mode === 'pages');
    assert.equal(await page.evaluate(() => __remake.scene.glovePunch.punches), 4);
    await page.evaluate(() => __remake.scene.finishBattle());
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  }
  console.log('✓ Tough Glove: INFO/USE/đổi vũ khí/AT5/lưu nạp; thanh nhanh 1.2x, Z dừng + bốn cú trong 30 frame, tỉ lệ sát thương/MISS/đấm mạnh trên Froggit và Toriel; AT99/LV20/sát thương/MERCY');
}
