import assert from 'node:assert/strict';

export async function testPapyrusRegularAttack(page) {
  await page.evaluate(async () => { const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.armorDefense = 0; w.armor = 4; w.weapon = 3; w.inventory = []; await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit'); });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => { const s = __remake.scene; window.bonesModule = await import('/src/papyrus-bones.mjs'); window.regularModule = await import('/src/papyrus-regular-attack.mjs'); bonesModule.loadPapyrusBoneAssets(s); regularModule.loadPapyrusRegularAssets(s); if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture'; });
  const result = await page.evaluate(() => {
    const s = __remake.scene; s.soul.setPosition(150, 150); s.invFrames = 9999;
    let wave = new regularModule.PapyrusRegularAttack(s);
    const initial = [wave.duration, wave.bullets.length, wave.actors.length, wave.bullets.slice(0, 6).map((v) => [v.x, v.y, v.vx]), wave.actors.map((v) => [v.kind, v.sprite, v.x, v.y, v.vx])];
    const dog = wave.actors[0]; for (let i = 0; i < 5; i++) wave.step(); const movingDog = [dog.x, dog.image.texture.key];
    const bus = wave.actors.find((a) => a.kind === 'bus'), big = wave.actors.find((a) => a.kind === 'super');
    bus.x = 400; big.x = 500; s.soul.setPosition(150, 130); s.soulVSpeed = -.5; s.keys.up.isDown = true; wave.oldHeart.y = 262; wave.step(); const raised = [wave.border.top, s.arena.y, s.soulVSpeed];
    big.x = 211; wave.step(); const restored = [wave.border.top, s.arena.y]; s.keys.up.isDown = false;
    const all = [...wave.bullets.map((v) => v.tip), ...wave.actors.map((v) => v.image)]; wave.destroy(); const cleaned = all.every((v) => !v.active);
    wave = new regularModule.PapyrusRegularAttack(s); for (const bone of [...wave.bullets]) wave.remove(bone); for (const actor of [...wave.actors]) wave.removeActor(actor);
    s.soul.setPosition(150, 160); s.hp = 20; s.invFrames = 0; const hitDog = wave.addActor('dog', 'spr_cbone', 300, 310, 0); wave.step(); const hit = [s.hp, s.invFrames, hitDog.image.active];
    s.hp = 1; s.invFrames = 0; wave.addActor('dog', 'spr_cbone', 300, 310, 0); wave.addActor('bus', 'spr_coolbus', 400, 325, -3); wave.step(); const captured = [s.hp, s.invFrames, wave.captured, wave.actors.length]; wave.destroy();
    wave = new regularModule.PapyrusRegularAttack(s); s.invFrames = 9999; for (let i = 0; i < 1299; i++) wave.step(); const before = wave.step(); wave.destroy(); s.finishBattle();
    return { initial, movingDog, raised, restored, cleaned, hit, captured, before };
  });
  assert.deepEqual(result.initial.slice(0, 4), [1300, 21, 16, [[182,365,4],[132,365,4],[602,365,-4],[652,365,-4],[-168,325,4],[802,325,-4]]]);
  assert.deepEqual(result.initial[4].slice(0, 6), [['dog','spr_tobydogscoot',2442,345,-5],['dog','spr_cbone',2682,325,-5],['dog','spr_oolbone',2722,325,-5],['dog','spr_dbone',2942,325,-5],['dog','spr_udebone',2982,325,-5],['dog','spr_skatebone',2662,325,-4]]);
  assert.deepEqual(result.initial[4].at(-1), ['super','spr_superbone',2892,145,-3]); assert.deepEqual(result.movingDog, [2417,'spr_tobydogscoot:1']);
  assert.deepEqual(result.raised, [240, 120, -2]); assert.deepEqual(result.restored, [250, 125]); assert.equal(result.cleaned, true);
  assert.deepEqual(result.hit, [17, 90, false]); assert.deepEqual(result.captured, [1, 50, true, 0]); assert.equal(result.before, true);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Đòn thường cuối Papyrus: xương/chó/xe buýt/xương lớn, chuyển khung, va chạm/bắt, 1300 frame và dọn');
}
