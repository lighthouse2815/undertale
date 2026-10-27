import assert from 'node:assert/strict';

export async function testFloweyExit(page) {
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(55);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const place = (x, y) => page.evaluate(([x, y]) => {
    const world = __remake.scene; world.player.setPosition(x, y); world.interactionCooldown = 0;
  }, [x, y]);
  const open = ({ flags = { 45: 4 }, kills = 1, tk = 1, ts = 0, memory = {}, plot = 25 } = {}) => page.evaluate(async (fixture) => {
    const world = __remake.scene;
    localStorage.setItem('undertale-remake-toriel-kills', String(fixture.tk));
    localStorage.setItem('undertale-remake-toriel-spares', String(fixture.ts));
    localStorage.setItem('undertale-remake-flowey-memory', JSON.stringify(fixture.memory));
    world.plot = fixture.plot; world.flags = fixture.flags; world.kills = fixture.kills;
    world.game.registry.set('charname', 'CHARA'); await world.openRoom('room_ruinsexit', 'obj_markerA');
  }, { flags, kills, tk, ts, memory, plot });
  const trigger = async () => {
    await place(150, 320); await page.keyboard.down('ArrowUp');
    await page.waitForFunction(() => !!__remake.scene.dialogue); await page.keyboard.up('ArrowUp');
  };
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue)) await key('z'); };
  const advance = (frames) => page.evaluate((frames) => {
    const world = __remake.scene;
    for (let i = 0; i < frames; i++) world.floweyExit.step();
    const value = { plot: world.plot, locked: world.floweyExit.locked, stage: world.floweyExit.stage,
      active: world.floweyExit.flower.active, visible: world.floweyExit.flower.visible, texture: world.floweyExit.flower.texture?.key };
    return value;
  }, frames);
  // Cửa nối từ hành lang dài, marker đúng và một chiều sau khi vào phòng Flowey.
  await page.evaluate(async () => {
    const world = __remake.scene; world.flags = { 45: 4 }; world.plot = 25; world.kills = 1;
    localStorage.setItem('undertale-remake-flowey-memory', '{}'); await world.openRoom('room_basement5', 'obj_markerB');
  });
  await place(150, 100); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.room === 'room_ruinsexit' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 365]);
  await page.keyboard.down('ArrowDown'); await page.waitForTimeout(500); await page.keyboard.up('ArrowDown');
  assert.equal(await page.evaluate(() => __remake.room), 'room_ruinsexit');
  assert.ok(await page.evaluate(() => __remake.scene.player.y <= 370), 'Hai vật cản cửa dưới chặn quay về Ruins.');
  const cases = [
    [{}, 10, 'laugh', /Hee hee/], [{ tk: 2 }, 7, 'laugh', /Heheheheh/], [{ tk: 3 }, 2, 'laugh', /can't get enough/],
    [{ ts: 1 }, 18, 'grow', /repulsive/], [{ ts: 1, memory: { explained: 1 } }, 6, 'laugh', /repulsive/],
    [{ flags: { 45: 5 }, kills: 1, tk: 0, ts: 1 }, 13, 'laugh', /Clever/],
    [{ flags: { 45: 5 }, kills: 0, tk: 0, ts: 1 }, 18, 'grow', /Clever/],
    [{ flags: { 45: 5 }, kills: 0, tk: 1, ts: 1 }, 23, 'grow', /Clever/],
    [{ flags: { 45: 4, 202: 20 }, kills: 20 }, 10, 'idea', /Hahaha/],
    [{ flags: { 45: 4, 202: 20, 26: 1 } }, 10, 'laugh', /Hee hee/],
  ];
  for (const [fixture, count, after, expression] of cases) {
    await open(fixture); await trigger();
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count);
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), expression);
    assert.ok(await page.evaluate(() => !__remake.scene.dialogue.lines.some((line) => /\\[ETRWXY]|\^\d/.test(line))));
    assert.ok(await page.evaluate(() => __remake.scene.dialoguePortrait.texture.key.startsWith('spr_flowey')));
    if (after === 'idea') {
      assert.ok(await page.evaluate(() => __remake.scene.dialogue.lines.some((line) => line.includes('CHARA'))));
      assert.deepEqual(await page.evaluate(() => { const m = JSON.parse(localStorage.getItem('undertale-remake-flowey-memory')); return [m.truename, m.alter2]; }), [1, 1]);
    }
    if (fixture.ts && (fixture.tk ?? 1) > 0 && !fixture.memory?.explained) assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('undertale-remake-flowey-memory')).explained), 1);
    const pos = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]);
    await page.keyboard.down('ArrowUp'); await key('c'); await page.keyboard.up('ArrowUp');
    assert.equal(await page.evaluate(() => __remake.phase), 'running');
    assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), pos);
    await drain(); assert.equal(await page.evaluate(() => __remake.scene.floweyExit.stage), after);
    // Kiểm tra alarm chốt plot và các sprite giữa đường bằng frame của game gốc.
    if (after === 'grow') {
      const growing = await advance(12); assert.equal(growing.stage, 'grow'); assert.match(growing.texture, /spr_floweygrow:/);
      const laughing = await advance(65); assert.match(laughing.texture, /spr_floweylaughoverworld:/);
      const done = await advance(170); assert.equal(done.plot, 28); assert.equal(done.locked, false); assert.equal(done.active, false);
    } else {
      const before = await advance(after === 'idea' ? 65 : 135); assert.equal(before.locked, true); assert.equal(before.plot, 25);
      const done = await advance(30); assert.equal(done.plot, 28); assert.equal(done.locked, false); assert.equal(done.active, false);
    }
    assert.equal(await page.evaluate(() => __remake.scene.saveGame().room), 'room_ruinsexit');
    await page.evaluate(async () => { __remake.scene.plot = 0; await __remake.scene.restoreGame(); });
    assert.equal(await page.evaluate(() => __remake.scene.floweyExit.flower.active), false);
  }
  for (const memory of [{ alter: 1 }, { killed: 1 }, { specialKill: 1 }, { alter2: 1 }]) {
    await open({ memory }); assert.equal(await page.evaluate(() => __remake.scene.floweyExit.flower.active), false);
  }
  await open({ memory: { alter: 1 }, flags: { 45: 4, 202: 20 } });
  assert.equal(await page.evaluate(() => __remake.scene.floweyExit.flower.active), true, 'Tuyến giết ghi đè ký ức cũ trước alter2.');
  await open({ memory: { alter2: 1 }, flags: { 45: 4, 202: 20 } });
  assert.equal(await page.evaluate(() => __remake.scene.floweyExit.flower.active), false);
  // Sau kết thúc, cửa dưới mở và trở lại đúng markerB hành lang.
  await open({ plot: 28, flags: { 7: 1, 45: 5 }, tk: 0, kills: 0 });
  await place(150, 365); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.room === 'room_basement5' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [150, 100]);
  console.log('✓ Flowey sau Toriel: cửa/marker/chặn quay về, 9 nhánh TK/TS/kills/ký ức/tuyến, chân dung/tên/cờ/khóa, animation/alarm/plot28 và lưu nạp không lặp');
}
