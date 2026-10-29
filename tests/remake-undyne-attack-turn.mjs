import assert from 'node:assert/strict';

export async function testUndyneAttackTurn(page) {
  await page.evaluate(async () => { const w = __remake.scene; window.undyneDefenseSnapshot = { lv: w.lv, armor: w.armor, armorDefense: w.armorDefense }; w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.armor = 4; w.armorDefense = 0; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.undyneAttack = await import('/src/undyne-attack-turn.mjs'); undyneAttack.loadUndyneAttackTurnAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'fixture'; });
  await page.keyboard.down('ArrowRight');
  const green = await page.evaluate(() => { const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'green', lesson: 6, duration: 8, onComplete: result => { window.turnResult = result; } }); const x = s.soul.x; turn.update(34); const first = [s.soul.x === x, turn.wave.soul.shield.ideal, s.soul.texture.key]; for (let i = 0; i < 8; i++) turn.update(34); const switching = [turn.phase, turn.finished]; for (let i = 0; i < 75; i++) turn.update(34); return [first, switching, window.turnResult, turn.finished, s.bullets.length]; });
  await page.keyboard.up('ArrowRight'); assert.deepEqual(green, [[true, 180, 'spr_heartgreen:0'], ['switch', false], { kind: 'green', hits: 0, shieldHits: 0, refuse: true, transition: null }, true, 0]);
  await page.keyboard.down('ArrowLeft');
  const red = await page.evaluate(() => { const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'follow', order: 9, duration: 5, onComplete: result => { window.turnResult = result; } }); const x = s.soul.x; turn.update(34); const first = [s.soul.x < x, s.soul.texture.key]; for (let i = 0; i < 6; i++) turn.update(34); const switching = [turn.phase, turn.finished]; for (let i = 0; i < 25; i++) turn.update(34); return [first, switching, s.soul.texture.key, window.turnResult, turn.finished, s.bullets.length]; });
  await page.keyboard.up('ArrowLeft'); assert.deepEqual(red, [[true, 'spr_heart:0'], ['returnGreen', false], 'spr_heartgreen:0', { kind: 'follow', hits: 0, shieldHits: 0, refuse: false, transition: { lesson: 8, delay: 30 } }, true, 0]);
  const shieldHits = await page.evaluate(() => {
    const s = __remake.scene; s.hp = 100; s.invFrames = 0; s.keys.left.isDown = true;
    const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'green', lesson: 1, duration: 120 });
    for (let i = 0; i < 120; i++) turn.step();
    s.keys.left.isDown = false; return [turn.hits, turn.shieldHits, s.hp < 100];
  });
  assert.ok(shieldHits[0] > 0); assert.equal(shieldHits[0], shieldHits[1]); assert.equal(shieldHits[2], true);
  const backToGreen = await page.evaluate(() => {
    const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'rising', order: 15, duration: 5 });
    for (let i = 0; i < 12; i++) turn.step();
    s.keys.right.isDown = true; const x = s.soul.x; turn.step(); s.keys.right.isDown = false;
    const result = [turn.phase, s.soul.texture.key, s.soul.x === x, turn.wave.transition.lesson];
    turn.destroy(); return result;
  });
  assert.deepEqual(backToGreen, ['green', 'spr_heartgreen:0', true, 13]);
  const transition = await page.evaluate(() => {
    const s = __remake.scene; s.arena.setPosition(0, 0).setSize(320, 240); s.hp = 20; s.invFrames = 0;
    const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'green', lesson: 6, duration: 1 });
    for (let i = 0; i < 11; i++) turn.step();
    const start = [turn.phase, turn.spear.speed, s.soul.texture.key];
    for (let i = 0; i < 60; i++) turn.step();
    return [start, turn.finished, turn.hits, turn.shieldHits, s.hp, turn.spear.image.active];
  });
  assert.deepEqual(transition, [['red', 11, 'spr_heart:0'], true, 1, 0, 16, false]);
  const speeds = await page.evaluate(() => [11, 20].map(lesson => {
    const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'green', lesson, duration: 1 });
    for (let i = 0; i < 11; i++) turn.step();
    const speed = turn.spear.speed; turn.destroy(); return [speed, turn.spear.image.active];
  }));
  assert.deepEqual(speeds, [[13, false], [14, false]]);
  const sequence = await page.evaluate(async () => {
    const s = __remake.scene, { UndyneBattleRules } = await import('/src/undyne-battle-rules.mjs');
    const rules = new UndyneBattleRules(); rules.order = rules.lesson = 6; s.hp = 100; s.invFrames = 0;
    let green = true; const states = [];
    for (let i = 0; i < 3; i++) {
      const options = rules.prepareAttack({ green, command: 0 });
      const turn = new undyneAttack.UndyneAttackTurn(s, { ...options, duration: options.kind === 'green' ? 1 : 5, onComplete: result => { green = rules.finishAttack(result); } });
      for (let j = 0; j < 100 && !turn.finished; j++) turn.step();
      states.push([options.kind, options.order, green, rules.lesson, turn.finished]);
    }
    return states;
  });
  assert.deepEqual(sequence, [['green', 7, false, 7, true], ['follow', 8, false, 7, true], ['follow', 9, true, 8, true]]);
  await page.evaluate(() => { const s = __remake.scene; s.finishBattle(); }); await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(() => { Object.assign(__remake.scene, window.undyneDefenseSnapshot); delete window.undyneDefenseSnapshot; });
  console.log('✓ Lượt Undyne: phím SOUL xanh/đỏ, trạng thái chuyển pha và dọn');
}
