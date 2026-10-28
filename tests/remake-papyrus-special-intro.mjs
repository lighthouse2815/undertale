import assert from 'node:assert/strict';

export async function testPapyrusSpecialIntro(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => { const s = __remake.scene; window.specialModule = await import('/src/papyrus-special-intro.mjs'); specialModule.loadPapyrusSpecialAssets(s); if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; });
  const result = await page.evaluate(() => {
    const s = __remake.scene; let close; const speeches = [];
    const wave = new specialModule.PapyrusSpecialIntro(s, (pages, next) => { speeches.push(pages); close = next; });
    const initial = [s.arena.x, s.arena.width, s.soulMovement, s.soulVSpeed, wave.dog.x, wave.dog.y, wave.dog.texture.key];
    for (let i = 0; i < 79; i++) wave.step(); const before = [wave.stage, speeches.length]; wave.step(); const first = [wave.stage, speeches.length];
    for (let i = 0; i < 8; i++) wave.step(); const waiting = [wave.stage, speeches.length];
    const stages = [];
    for (let i = 0; i < 5; i++) { close(); wave.step(); const done = wave.step(); wave.step(); stages.push([wave.stage, wave.dog.texture.key, wave.dog.x, s.arena.width, done]); }
    const active = wave.dog; wave.destroy(); const cleaned = !active.active; s.finishBattle(); return { initial, before, first, waiting, stages, speeches, cleaned };
  });
  assert.deepEqual(result.initial, [96, 160, 2, -1, 221, 172.5, 'spr_tobydogeat:0']);
  assert.deepEqual(result.before, [-1, 0]); assert.deepEqual(result.first, [0, 1]); assert.deepEqual(result.waiting, [0, 1]);
  assert.deepEqual(result.stages.map((v) => v[0]), [1, 2, 3, 4, 5]); assert.deepEqual(result.stages.slice(0, 3).map((v) => v[1]), ['spr_tobydogsurprise:0', 'spr_tobydogsurprise:1', 'spr_tobydogscoot:0']);
  assert.ok(result.stages[3][2] > result.stages[2][2]); assert.equal(result.stages[3][3], 125); assert.equal(result.stages[4][4], true);
  assert.equal(result.speeches.length, 5); assert.match(result.speeches[0][1], /SPECIAL ATTACK/); assert.match(result.speeches[4][2], /REGULAR ATTACK/); assert.equal(result.cleaned, true);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Đòn đặc biệt Papyrus: chờ 80 frame, chó ăn/ngạc nhiên/bỏ chạy, năm lượt thoại, đổi khung và dọn');
}
