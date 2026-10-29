import assert from 'node:assert/strict';

export async function testHotlandAlphysPhone(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(() => {
    const w = __remake.scene; return structuredClone({ flags: w.flags, plot: w.plot, phone: w.phone });
  });
  for (const [x, y, direction] of [[554, 140, 'ArrowRight'], [970, 100, 'ArrowLeft']]) {
    await page.evaluate(async ([x,y]) => {
      const w = __remake.scene; w.flags = {}; w.plot = 126; w.phone = [206]; await w.openRoom('room_fire_lab1', 'obj_markerC');
      w.player.setPosition(x,y); w.updateCamera();
    }, [x,y]);
    await page.keyboard.down(direction); await page.waitForFunction(() => __remake.scene.hotlandAlphysPhone.locked); await page.keyboard.up(direction);
    assert.deepEqual(await page.evaluate(() => [__remake.scene.dialogue.lines[0], __remake.scene.plot]), ['* Wait, wait!', 126]);
    const fixing = await page.evaluate(() => {
      const w = __remake.scene, c = w.hotlandAlphysPhone;
      const pages = [];
      for (let i = 0; i < 500 && c.stage !== 'fixing'; i++) { if (w.dialogue) { pages.push(...w.dialogue.lines); while (w.dialogue) w.advanceDialogue(); } else c.step(); }
      return [c.stage, c.timer, w.labMusic.isPaused, c.fixSound.isPlaying, pages.some(t=>t.includes('ANCIENT')), w.phone, w.plot];
    });
    assert.deepEqual(fixing, ['fixing', 100, true, true, true, [206], 126]);
    const upgraded = await page.evaluate(() => {
      const w = __remake.scene, c = w.hotlandAlphysPhone;
      for (let i = 0; i < 700 && !(w.dialogue?.lines[0].includes('upgraded')); i++) c.step();
      const result = [w.labMusic.isPlaying, c.fixSound, w.phone, w.plot, c.locked, w.dialogue.lines.length];
      // Đóng đến trang cuối để kiểm cánh cửa mở ngay khi Alphys nói đi vệ sinh.
      while (w.dialogue && w.dialogue.index < 11) w.advanceDialogue();
      result.push(w.hotlandAlphysIntro.slideDirection); return result;
    });
    assert.deepEqual(upgraded, [true, null, [206,220,221], 126, true, 12, 1]);
    const done = await page.evaluate(() => {
      const w = __remake.scene, c = w.hotlandAlphysPhone; while (w.dialogue) w.advanceDialogue();
      for (let i = 0; i < 300 && c.stage !== 'done'; i++) { w.hotlandAlphysIntro.step(); c.step(); }
      const intro = w.hotlandAlphysIntro;
      return [w.plot, c.locked, intro.actor.x, intro.actor.y, intro.npc.item.X, intro.npc.item.Y, w.colliders.includes(intro.npcCollider), c.checkTrigger()];
    });
    assert.deepEqual(done, [127, false, 890, 65, 890, 65, true, false]);
    assert.deepEqual(await page.evaluate(async () => {
      const w = __remake.scene; await w.openRoom('room_fire_lab1', 'obj_markerC');
      return [w.hotlandAlphysPhone.stage, w.hotlandAlphysIntro.actor.x, w.hotlandAlphysIntro.actor.y, w.phone];
    }), ['done', 890, 65, [206,220,221]]);
  }
  const restored = await page.evaluate(async () => {
    const w = __remake.scene, old = localStorage.getItem('undertale-remake-temp-v1');
    try {
      w.saveGame(true); w.phone = []; w.plot = 0; w.flags = {}; await w.restoreGame(true);
      return [w.plot, w.phone, w.hotlandAlphysPhone.stage, w.hotlandAlphysIntro.npc.item.Y];
    } finally { if (old === null) localStorage.removeItem('undertale-remake-temp-v1'); else localStorage.setItem('undertale-remake-temp-v1', old); }
  });
  assert.deepEqual(restored, [127, [206,220,221], 'done', 65]);
  // Rời phòng trong khi âm sửa máy phát phải dọn âm và không giữ nhạc bị pause.
  const cleanup = await page.evaluate(async () => {
    const w = __remake.scene; w.flags = {}; w.plot = 126; await w.openRoom('room_fire_lab1', 'obj_markerC');
    w.player.setPosition(580,120); w.updateCamera(); const c = w.hotlandAlphysPhone; c.checkTrigger();
    for (let i = 0; i < 500 && c.stage !== 'fixing'; i++) { if (w.dialogue) { while (w.dialogue) w.advanceDialogue(); } else c.step(); }
    const sound = c.fixSound; await w.openRoom('room_fire_prelab', 'obj_markerD'); return [sound.isPlaying, !!w.hotlandAlphysPhone, !!w.labMusic];
  });
  assert.deepEqual(cleanup, [false, false, false]);
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Nâng cấp điện thoại: hai hướng, sửa máy/nhạc, hộp A/B, phòng tắm và dọn khi đổi phòng');
}
