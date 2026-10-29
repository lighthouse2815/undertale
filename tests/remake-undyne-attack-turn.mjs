import assert from 'node:assert/strict';

export async function testUndyneAttackTurn(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.hp = w.maxHp = 20; await w.openRoom('room_water1'); __remake.startBattle('froggit'); }); await page.waitForFunction(() => __remake.phase === 'battle');
  await page.evaluate(async () => { const s = __remake.scene; window.undyneAttack = await import('/src/undyne-attack-turn.mjs'); undyneAttack.loadUndyneAttackTurnAssets(s); if (s.load.list.size) await new Promise(resolve => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'fixture'; });
  await page.keyboard.down('ArrowRight');
  const green = await page.evaluate(() => { const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'green', lesson: 6, duration: 8, onComplete: result => { window.turnResult = result; } }); const x = s.soul.x; turn.update(34); const first = [s.soul.x === x, turn.wave.soul.shield.ideal, s.soul.texture.key]; for (let i = 0; i < 8; i++) turn.update(34); return [first, window.turnResult, turn.finished, s.bullets.length]; });
  await page.keyboard.up('ArrowRight'); assert.deepEqual(green, [[true, 180, 'spr_heartgreen:0'], { kind: 'green', hits: 0, refuse: true, transition: null }, true, 0]);
  await page.keyboard.down('ArrowLeft');
  const red = await page.evaluate(() => { const s = __remake.scene; const turn = new undyneAttack.UndyneAttackTurn(s, { kind: 'follow', order: 9, duration: 5, onComplete: result => { window.turnResult = result; } }); const x = s.soul.x; turn.update(34); const first = [s.soul.x < x, s.soul.texture.key]; for (let i = 0; i < 6; i++) turn.update(34); return [first, window.turnResult, turn.finished, s.bullets.length]; });
  await page.keyboard.up('ArrowLeft'); assert.deepEqual(red, [[true, 'spr_heart:0'], { kind: 'follow', hits: 0, refuse: false, transition: { lesson: 8, delay: 30 } }, true, 0]);
  await page.evaluate(() => { const s = __remake.scene; s.finishBattle(); }); await page.waitForFunction(() => __remake.phase === 'running');
  console.log('✓ Lượt Undyne: phím SOUL xanh/đỏ, trạng thái chuyển pha và dọn');
}
