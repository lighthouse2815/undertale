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
    const loopTurns = [0, 19, 20, 39].map((command) => {
      const w = new papyrusBones.PapyrusBones(s, { turn: 14, xfight: 1, command }); const initial = [w.duration, w.bullets.map((b) => [b.x, b.y, b.vx, b.blue])]; s.invFrames = 9999; let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy(); return [initial, early, done];
    });
    const savedRandom = Math.random; Math.random = () => 0; const rolled = new papyrusBones.PapyrusBones(s, { turn: 14, xfight: 0, command: 40 }); Math.random = savedRandom;
    const randomTurn = [rolled.rolledTurn, rolled.duration, rolled.bullets.map((b) => b.vx)]; rolled.destroy();
    let specialRejected = false; try { new papyrusBones.PapyrusBones(s, { turn: 14, xfight: 4 }); } catch (error) { specialRejected = error instanceof RangeError; }
    const finalTurns = [11, 12, 13].map((turn) => {
      const w = new papyrusBones.PapyrusBones(s, { turn }); const initial = [w.duration, w.bullets.map((b) => [b.x, b.y, b.vx, b.top, b.blue, b.osc, b.oscmin, b.oscmax])]; s.invFrames = 9999; let early; for (let i = 1; i < w.duration; i++) early = w.step(); const done = w.step(); w.destroy(); return [initial, early, done];
    });
    const exiting = new papyrusBones.PapyrusBones(s); s.invFrames = 9999;
    const edgeBone = exiting.add(183, 355, { vx: -2 }); exiting.step(); const beyondArena = [edgeBone.x, edgeBone.tip.active];
    edgeBone.x = -8; exiting.step(); const atRoomEdge = [edgeBone.x, edgeBone.tip.active]; exiting.step(); const beyondRoom = edgeBone.tip.active;
    const approaching = exiting.add(700, 355, { vx: -4 }); exiting.step(); const spawnedOutside = [approaching.tip.active, approaching.outsideRoom]; approaching.x = 630; exiting.step(); const entered = approaching.outsideRoom; approaching.x = -9; exiting.step(); const exited = approaching.tip.active; exiting.destroy();
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
    s.finishBattle(); return { first, after, beforeEnd, done, turns, nextTurns, laterTurns, oscillatingTurns, loopTurns, randomTurn, specialRejected, finalTurns, beyondArena, atRoomEdge, beyondRoom, spawnedOutside, entered, exited, low, reverse, fastTurns, faster, corner, hit, immune, still, moved, topHit, captured, cleaned };
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
  assert.deepEqual(result.loopTurns[0], result.loopTurns[1]); assert.deepEqual(result.loopTurns[2], result.loopTurns[3]);
  assert.deepEqual(result.loopTurns[0], [[210, [[132,355,4,false],[102,345,4,false],[72,335,4,false],[42,325,4,false],[12,335,4,false],[-18,345,4,false],[-48,355,4,false],[1122,355,-6.4,false],[1162,345,-6.4,false],[1202,335,-6.4,false],[1242,325,-6.4,false],[1282,335,-6.4,false],[1322,345,-6.4,false],[1362,355,-6.4,false]]], false, true]);
  assert.deepEqual(result.loopTurns[2], [[200, [[452,305,-5,true],[532,365,-5,false],[612,305,-5,true],[692,365,-5,false],[772,305,-5,true],[852,365,-5,false],[932,305,-5,true],[1012,365,-5,false],[1592,305,-8,true],[1672,365,-8,false]]], false, true]);
  assert.deepEqual(result.randomTurn, [2, 240, [4,4,4,4,-4]]); assert.equal(result.specialRejected, true);
  const [eleven, twelve, thirteen] = result.finalTurns;
  assert.deepEqual([eleven[0][0], eleven[0][1].length, eleven[1], eleven[2]], [250, 10, false, true]);
  assert.deepEqual(eleven[0][1].map((b) => b.slice(0, 5)), [[502,305,-4.5,false,true],[582,365,-4.5,false,false],[662,305,-4.5,false,true],[742,365,-4.5,false,false],[822,305,-4.5,false,true],[902,365,-4.5,false,false],[982,305,-4.5,false,true],[1062,365,-4.5,false,false],[1692,305,-7,false,true],[1772,365,-7,false,false]]);
  assert.deepEqual([twelve[0][0], twelve[0][1].length, twelve[1], twelve[2]], [200, 14, false, true]);
  assert.deepEqual(twelve[0][1].map((b) => b.slice(0, 3)), [[132,355,4],[105,345,4],[78,335,4],[51,325,4],[24,335,4],[-3,345,4],[-30,355,4],[1042,355,-6.4],[1082,345,-6.4],[1122,335,-6.4],[1162,325,-6.4],[1202,335,-6.4],[1242,345,-6.4],[1282,355,-6.4]]);
  assert.deepEqual([thirteen[0][0], thirteen[0][1].length, thirteen[1], thirteen[2]], [220, 10, false, true]);
  assert.deepEqual(thirteen[0][1], [[462,355,-4,false,false,-3,-1,60],[502,355,-4,false,false,-3,-1,60],[542,355,-4,false,false,-3,-1,60],[682,375,-4,true,false,-3,-1,60],[712,375,-4,true,false,-3,-1,60],[742,375,-4,true,false,-3,-1,60],[902,355,-4,false,false,0,20,20],[902,345,-4,true,false,-3,-1,40],[1022,335,-4,false,false,0,20,20],[1022,325,-4,true,false,-3,-1,40]]);
  assert.deepEqual(result.beyondArena, [181, true]); assert.deepEqual(result.atRoomEdge, [-10, true]); assert.equal(result.beyondRoom, false);
  assert.deepEqual(result.spawnedOutside, [true, true]); assert.equal(result.entered, false); assert.equal(result.exited, false);
  assert.deepEqual(result.low, [270, -3]); assert.deepEqual(result.reverse, [273, 3]);
  assert.deepEqual(result.fastTurns, [[4.5,4.5,4.5,4.5,4.5,4.5,4.5], [4,4,4,4,-4], [4.4,4.4,4.4,4.4,-4.4,-4.4,-4.4,-4.4]]);
  assert.deepEqual(result.faster, [4.5, 4.5, -4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]);
  assert.deepEqual(result.corner, [16, false]);
  assert.deepEqual(result.hit, [16, 90, 0, false]); assert.deepEqual(result.immune, [16, true]); assert.deepEqual(result.still, [16, true]); assert.deepEqual(result.moved, [12, false]);
  assert.deepEqual(result.topHit, [16, false]);
  assert.deepEqual(result.captured, [1, 50, true, 0, 0]); assert.equal(result.cleaned, true);
  await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  console.log('✓ Xương Papyrus: ba xương đầu/140frame, lượt tim xanh/nhánh lặp/timer/đội hình/xfight, biên/phòng/hộp bao, trắng-xanh/đứng-di chuyển, sát thương/bất tử, bắt ở 1HP và dọn');
}
