import assert from 'node:assert/strict';

export async function testPapyrusBones(page) {
  await page.evaluate(async () => {
    const w = __remake.game.scene.getScene('World'); w.flags = {}; w.hp = w.maxHp = 20; w.lv = 1; w.armorDefense = 0; w.armor = 4; w.weapon = 3; w.inventory = [];
    await w.openRoom('room_tundra_iceentrance'); __remake.startBattle('froggit');
  });
  await page.waitForFunction(() => __remake.phase === 'battle' && !!__remake.scene.music);
  await page.evaluate(async () => {
    const s = __remake.scene; window.papyrusBones = await import('/src/papyrus-bones.mjs'); papyrusBones.loadPapyrusBoneAssets(s);
    if (s.load.list.size) await new Promise((resolve) => { s.load.once('complete', resolve); s.load.start(); }); s.mode = 'waveFixture';
  });
  const result = await page.evaluate(() => {
    const s = __remake.scene; s.soul.setPosition(150, 150); s.invFrames = 0;
    const random = Math.random; Math.random = () => .5;
    let wave = new papyrusBones.PapyrusBones(s, { firstWave: true }); Math.random = random;
    const first = [s.arena.x, s.arena.y, s.arena.width, s.arena.height, ...wave.bullets.map((v) => [v.x, v.y, v.vx])];
    wave.step(); const after = wave.bullets.map((v) => v.x); for (let i = 1; i < 139; i++) wave.step(); const beforeEnd = wave.frames; const done = wave.step();
    wave.destroy();
    const turns = [-1, 0, 1, 2].map((turn) => {
      s.soulMovement = 1; s.soulVSpeed = 0; s.soulJumpStage = 0; s.invFrames = 9999;
      const w = new papyrusBones.PapyrusBones(s, { turn });
      const layout = [w.duration, s.soulMovement, s.soulVSpeed, s.soulJumpStage, w.bullets.map((b) => [b.x, b.y, b.vx, b.top, b.blue])];
      let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy();
      return [layout, early, done];
    });
    const nextTurns = [3, 4, 5].map((turn) => {
      const w = new papyrusBones.PapyrusBones(s, { turn }); const initial = [w.duration, w.bullets.map((b) => [b.x, b.y, b.vx, b.top, b.blue])]; s.invFrames = 9999; let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy(); return [initial, early, done];
    });
    const laterTurns = [6, 7, 8].map((turn) => {
      const w = new papyrusBones.PapyrusBones(s, { turn }); const initial = [w.duration, w.bullets.map((b) => [b.x, b.y, b.vx, b.top])]; s.invFrames = 9999; let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy(); return [initial, early, done];
    });
    const oscillatingTurns = [9, 10].map((turn) => {
      const w = new papyrusBones.PapyrusBones(s, { turn }); const initial = [w.duration, w.bullets.map((b) => [b.x, b.y, b.vx, b.top, b.osc, b.oscmin, b.oscmax])]; s.invFrames = 9999; let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy(); return [initial, early, done];
    });
    const oscillating = new papyrusBones.PapyrusBones(s); s.invFrames = 9999; const bouncing = oscillating.add(300, 330, { osc: -3, oscmin: -1, oscmax: 60 }); for (let i = 0; i < 20; i++) oscillating.step(); const low = [bouncing.y, bouncing.osc]; oscillating.step(); const reverse = [bouncing.y, bouncing.osc]; oscillating.destroy();
    const fastTurns = [1, 2, 7].map((turn) => { const w = new papyrusBones.PapyrusBones(s, { turn, xfight: 1 }); const values = w.bullets.map((b) => b.vx); w.destroy(); return values; });
    const fasterWave = new papyrusBones.PapyrusBones(s, { turn: 3, xfight: 1 }); const faster = fasterWave.bullets.map((b) => b.vx); fasterWave.destroy();
    wave = new papyrusBones.PapyrusBones(s, { fighto: 14 }); s.hp = 20; s.invFrames = 0; s.soul.setPosition(150, 176);
    s.soul.setPosition(150, 175); const cornerBone = wave.add(292, 362); wave.step(); const corner = [s.hp, cornerBone.tip.active];
    s.hp = 20; s.invFrames = 0; s.soul.setPosition(150, 176);
    let white = wave.add(300, 350, { vx: 0 }); wave.step(); const hit = [s.hp, s.invFrames, wave.bullets.length, white.tip.active];
    const immuneBone = wave.add(300, 350); wave.step(); const immune = [s.hp, immuneBone.tip.active]; wave.remove(immuneBone);
    s.invFrames = 0; let blue = wave.add(300, 350, { blue: true }); wave.step(); const still = [s.hp, blue.tip.active];
    s.soul.x += .5; wave.step(); const moved = [s.hp, blue.tip.active];
    s.hp = 20; s.invFrames = 0; s.soul.setPosition(150, 130); const upper = wave.add(300, 290, { top: true }); wave.step(); const topHit = [s.hp, upper.tip.active];
    s.soul.setPosition(150, 176); s.hp = 2; s.invFrames = 0; wave.add(300, 350); wave.add(400, 340); wave.step(); const captured = [s.hp, s.invFrames, wave.captured, wave.bullets.length, s.soulVSpeed];
    const clip = wave.clip; wave.destroy(); const cleaned = !clip.active;
    s.finishBattle(); return { first, after, beforeEnd, done, turns, nextTurns, laterTurns, oscillatingTurns, low, reverse, fastTurns, faster, corner, hit, immune, still, moved, topHit, captured, cleaned };
  });
  assert.deepEqual(result.first, [96, 125, 125, 67.5, [452, 355, -3], [532, 355, -3], [612, 355, -3]]);
  assert.deepEqual(result.after, [449, 529, 609]); assert.equal(result.beforeEnd, 139); assert.equal(result.done, true);
  assert.deepEqual(result.turns, [
    [[200, 2, -1, 2, [[472, 365, -3, false, false], [642, 365, -3, false, false], [812, 345, -3, false, false]]], false, true],
    [[300, 2, -1, 2, [[462, 365, -4, false, false], [592, 345, -4, false, false], [722, 345, -4, false, false], [852, 345, -4, false, false], [832, 325, -3, false, false], [952, 325, -3, false, false], [1072, 325, -3, false, false]]], false, true],
    [[220, 2, -1, 2, [[182, 325, 3, false, false], [112, 345, 3, true, false], [-38, 365, 4, false, false], [-118, 365, 4, false, false], [-198, 365, 4, false, false], [-298, 335, 4, false, false], [-388, 345, 4, true, false]]], false, true],
    [[240, 2, -1, 2, [[162, 325, 3.5, false, false], [32, 325, 3.5, false, false], [-98, 325, 3.5, false, false], [-198, 305, 3.5, false, true], [1562, 355, -6, false, false]]], false, true]
  ]);
  assert.deepEqual(result.nextTurns[0], [[150, [[152,335,4,false,false],[152,295,4,true,false],[582,345,-4,true,false],[-68,365,4,false,false],[-88,355,4,false,false],[-108,345,4,false,false],[-128,335,4,false,false],[-148,335,4,false,false],[-168,345,4,false,false],[-188,355,4,false,false],[-208,365,4,false,false]]], false, true]);
  assert.deepEqual(result.nextTurns[1], [[240, [[152,355,4,false,false],[152,305,4,true,false],[132,355,4,false,false],[132,305,4,true,false],[22,325,4,false,false],[22,275,4,true,false],[2,325,4,false,false],[2,275,4,true,false],[-128,295,4,false,true],[922,325,-4,false,false],[1142,355,-4,false,false],[1142,305,-4,true,false],[-508,355,4,false,false],[-508,305,4,true,false]]], false, true]);
  assert.deepEqual(result.nextTurns[2], [[330, [[482,355,-3,false,false],[512,340,-3,false,false],[542,325,-3,false,false],[572,340,-3,false,false],[602,355,-3,false,false],[632,370,-3,false,false],[742,370,-3,false,false],[772,355,-3,false,false],[802,340,-3,false,false],[832,325,-3,false,false],[1142,355,-4,false,false],[1172,340,-4,false,false],[1202,325,-4,false,false],[1232,340,-4,false,false],[1262,355,-4,false,false],[1292,370,-4,false,false],[1412,370,-4,false,false],[1442,355,-4,false,false],[1472,340,-4,false,false],[1502,325,-4,false,false]]], false, true]);
  assert.deepEqual(result.laterTurns, [
    [[200, [[182,350,2,false],[82,350,2,false],[-18,350,2,false],[452,350,-2,false],[552,350,-2,false],[652,350,-2,false]]], false, true],
    [[150, [[182,365,4,false],[82,365,4,false],[-18,365,4,false],[-118,365,4,false],[452,365,-4,false],[552,365,-4,false],[652,365,-4,false],[752,365,-4,false]]], false, true],
    [[230, [[482,365,-4.4,false],[612,365,-4.4,false],[612,315,-4.4,true],[752,355,-4.4,false],[752,305,-4.4,true],[902,345,-4.4,false],[902,295,-4.4,true],[1052,335,-4.4,false],[1052,285,-4.4,true],[1202,325,-4.4,false],[1202,275,-4.4,true]]], false, true]
  ]);
  const [nine, ten] = result.oscillatingTurns;
  assert.deepEqual([nine[0][0], nine[0][1].length, nine[1], nine[2]], [355, 15, false, true]);
  assert.deepEqual(nine[0][1].slice(-4), [[1432,355,-4.2,false,-1,-1,30],[1432,315,-4.2,true,-1,-1,30],[1572,335,-4.2,false,-2,-20,30],[1572,295,-4.2,true,-2,-20,30]]);
  assert.deepEqual([ten[0][0], ten[0][1].length, ten[1], ten[2]], [230, 16, false, true]);
  assert.deepEqual(ten[0][1].slice(-3), [[1042,355,-4.2,false,-3,-1,60],[1062,355,-4.2,false,-3,-1,60],[1082,355,-4.2,false,-3,-1,60]]);
  assert.deepEqual(result.low, [270, -3]); assert.deepEqual(result.reverse, [273, 3]);
  assert.deepEqual(result.fastTurns, [[4.5,4.5,4.5,4.5,4.5,4.5,4.5], [4,4,4,4,-4], [4.4,4.4,4.4,4.4,-4.4,-4.4,-4.4,-4.4]]);
  assert.deepEqual(result.faster, [4.5, 4.5, -4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]);
  assert.deepEqual(result.corner, [16, false]);
  assert.deepEqual(result.hit, [16, 90, 0, false]); assert.deepEqual(result.immune, [16, true]); assert.deepEqual(result.still, [16, true]); assert.deepEqual(result.moved, [12, false]);
  assert.deepEqual(result.topHit, [16, false]);
  assert.deepEqual(result.captured, [1, 50, true, 0, 0]); assert.equal(result.cleaned, true);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Xương Papyrus: ba xương đầu/140frame, mười hai lượt tim xanh/timer/đội hình/xfight, biên/hộp bao, trắng-xanh/đứng-di chuyển, sát thương/bất tử, bắt ở 1HP và dọn');
}
