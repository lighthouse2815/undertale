import assert from 'node:assert/strict';

export async function testHotlandPrelab(page) {
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, plot: w.plot, hp: w.hp, maxHp: w.maxHp });
    w.hotlandMusic?.destroy(); w.hotlandMusic = null; w.waterfallMusic?.destroy(); w.waterfallMusic = null;
    w.flags = {}; w.plot = 122; w.hp = 1; w.maxHp = 20; await w.openRoom('room_fire2', 'obj_markerA');
    w.player.setPosition(280, 100); window.preLabMusic = w.hotlandMusic; return snapshot;
  });
  await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_fire_prelab'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const save = await page.evaluate(() => {
    const w = __remake.scene; w.player.setPosition(190, 140); w.tryInteract();
    const result = [w.hotlandMusic === window.preLabMusic, w.hotlandMusic.key, Math.round(w.hotlandMusic.volume * 10) / 10, w.hotlandMusic.rate, w.dialogue.lines, w.hp];
    w.dialogue.onClose = undefined; while (w.dialogue) w.advanceDialogue(); return result;
  });
  assert.deepEqual(save, [true, 'mus_oogloop', .7, .9, ['* (Seeing such a strange\n  laboratory in a place like\n  this...)', "* (You're filled with\n  determination.)"], 20]);
  const genocide = await page.evaluate(() => {
    const w = __remake.scene; w.flags = { 26: 12, 205: 37 }; w.tryInteract();
    const red = [w.dialogue.lines, w.dialogueText.font]; w.dialogue.onClose = undefined; w.advanceDialogue();
    w.flags[205] = 40; w.tryInteract(); const empty = w.dialogue.lines; w.dialogue.onClose = undefined; w.advanceDialogue();
    return [red, empty];
  });
  assert.deepEqual(genocide, [[['* 3 left.'], 'fnt_maintext:red'], ['* Determination.']]);
  const stored = await page.evaluate(() => {
    const w = __remake.scene; w.flags = {}; w.tryInteract();
    while (w.dialogue) w.advanceDialogue();
    return localStorage.getItem('undertale-remake-save-v1');
  });
  await page.waitForFunction(() => __remake.phase === 'saving');
  await page.keyboard.press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.saved, __remake.scene.roomLabel.text]), [true, 'Hotland - Laboratory Entrance']);
  await page.keyboard.press('z'); await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  await page.evaluate(stored => { if (stored === null) localStorage.removeItem('undertale-remake-save-v1'); else localStorage.setItem('undertale-remake-save-v1', stored); }, stored);
  await page.evaluate(() => { const w = __remake.scene; w.flags = {}; w.player.setPosition(10, 95); });
  await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_fire2'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.equal(await page.evaluate(() => __remake.scene.hotlandMusic === window.preLabMusic), true);
  for (const [flags, expected] of [[{ 224: 1 }, ['mus_toomuch', 1]], [{ 26: 12 }, ['mus_oogloop', .5]], [{ 7: 1, 224: 1 }, ['mus_reunited', 1]]]) {
    const actual = await page.evaluate(async flags => {
      const w = __remake.scene; w.hotlandMusic?.destroy(); w.hotlandMusic = null; w.flags = flags;
      await w.openRoom('room_fire_prelab', 'obj_markerA'); return [w.hotlandMusic.key, w.hotlandMusic.rate];
    }, flags);
    assert.deepEqual(actual, expected);
  }
  await page.evaluate(previous => { const w = __remake.scene; w.hotlandMusic?.destroy(); w.hotlandMusic = null; Object.assign(w, previous); delete window.preLabMusic; }, previous);
  console.log('✓ Lối vào phòng thí nghiệm: cửa hai chiều, nhạc và điểm lưu');
}
