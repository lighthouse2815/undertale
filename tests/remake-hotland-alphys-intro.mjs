import assert from 'node:assert/strict';

export async function testHotlandAlphysIntro(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, hp: w.hp, maxHp: w.maxHp });
    w.flags = {}; w.plot = 122; w.hp = w.maxHp = 20; await w.openRoom('room_fire_prelab', 'obj_markerD');
    return snapshot;
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire_lab1'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.hotlandAlphysIntro.stage, w.hotlandAlphysIntro.darkness.alpha, w.labMusic.key]; }), ['waiting', .5, 'mus_drone']);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(658, 140); w.updateCamera(); });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.hotlandAlphysIntro.locked); await page.keyboard.up('ArrowRight');
  const intro = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandAlphysIntro, pages = [];
    for (let i = 0; i < 4000 && c.stage !== 'startBattle'; i++) {
      if (w.dialogue) { pages.push(...w.dialogue.lines); while (w.dialogue) w.advanceDialogue(); }
      else c.step();
    }
    return [c.stage, c.locked, w.plot, !!c.darkness, c.hole.image.visible, pages[0], pages.at(-1), pages.includes("* I'm Dr. Alphys.\n* I'm ASGORE's royal\n  scientist!")];
  });
  assert.deepEqual(intro, ['startBattle', true, 122, false, true, '* Oh.\n* My god.', '* OR YOU DIE!!!', true]);
  await page.waitForFunction(() => __remake.room === 'battle_mettatonQuiz');
  await page.evaluate(() => {
    const b = __remake.scene; b.beginQuestion(10); for (let i = 0; i < 71; i++) b.stepQuiz(); b.answerQuestion(0);
    for (let i = 0; i < 30; i++) b.stepQuiz(); while (b.mode === 'pages') b.afterPages();
    for (let i = 0; i < 90; i++) b.stepQuiz();
  });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const after = await page.evaluate(() => {
    const w = __remake.scene, c = w.hotlandAlphysIntro;
    for (let i = 0; i < 200 && c.stage !== 'done'; i++) { if (w.dialogue) { while (w.dialogue) w.advanceDialogue(); } else c.step(); }
    return [w.plot, c.locked, w.flags[462], !!c.npc, w.labMusic.key];
  });
  assert.deepEqual(after, [126, false, 0, true, 'mus_lab']);
  // Về phòng trước bằng cửa thật; quay lại không lặp cảnh gặp.
  await page.evaluate(() => __remake.scene.player.setPosition(15, 140));
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_fire_prelab'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running');
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire_lab1'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => { const c = __remake.scene.hotlandAlphysIntro; return [c.stage, c.locked, !!c.darkness]; }), ['done', false, false]);
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Cửa lab và chuỗi gặp Alphys → Mettaton → quiz → hậu cảnh/plot 126');
}
