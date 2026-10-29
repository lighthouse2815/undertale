import assert from 'node:assert/strict';

export async function testMettatonQuiz(page) {
  const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(50); };
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(() => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, hp: w.hp, maxHp: w.maxHp, xp: w.xp, gold: w.gold, kills: w.kills, inventory: w.inventory, weapon: w.weapon });
    w.flags = {}; w.hp = w.maxHp = 20; w.inventory = [1]; w.weapon = 3; w.release(); __remake.startBattle('mettatonQuiz'); return snapshot;
  });
  await page.waitForFunction(() => __remake.room === 'battle_mettatonQuiz');
  await press('ArrowRight'); await press('z'); await press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.kind, __remake.scene.submenu]), ['act', ['Check', 'Cry']]);
  await press('z');
  assert.match(await page.evaluate(() => __remake.scene.message.text), /ATK 30 DEF 255/);
  await press('z'); await press('z');
  await page.waitForFunction(() => __remake.scene.phase === 'answer');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.q, __remake.scene.questionCorrect, __remake.scene.answers.length]), [1, 3, 4]);
  // Chạm đáp án D bằng phím thật; không cần nhấn xác nhận trong màn hỏi.
  await page.keyboard.down('ArrowDown'); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.scene.mode === 'quizResult'); await page.keyboard.up('ArrowDown'); await page.keyboard.up('ArrowRight');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.answer, __remake.scene.wrong, __remake.scene.hp]), [3, false, 20]);
  await page.waitForFunction(() => __remake.scene.mode === 'menu');
  assert.deepEqual(await page.evaluate(() => {
    const b = __remake.scene; b.startFight(); b.attackX = 156; b.confirmPressed = true; b.updateFight(0); b.confirmPressed = false;
    const result = [b.damage, b.enemyHp, b.message.text]; b.toMenu('* Mettaton.'); b.hp = 5; b.menuIndex = 2; return result;
  }), [0, 9999, '0']);
  await press('z'); await press('z');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.hp, __remake.scene.previousScene.inventory.length]), [15, 0]);
  const wrong = await page.evaluate(() => {
    const b = __remake.scene; b.hp = 20; b.beginQuestion(2); for (let i = 0; i < 61; i++) b.stepQuiz(); b.answerQuestion(0);
    for (let i = 0; i < 44; i++) b.stepQuiz(); const hurt = b.hp; for (let i = 44; i < 70; i++) b.stepQuiz();
    return [hurt, b.q, b.mode];
  });
  assert.deepEqual(wrong, [10, 2, 'menu']);
  const timeout = await page.evaluate(() => {
    const b = __remake.scene; b.hp = 3; b.beginQuestion(4); for (let i = 0; i < 500; i++) b.stepQuiz();
    return [b.hp, b.q, b.mode];
  });
  assert.deepEqual(timeout, [1, 8, 'menu']);
  const ghost = await page.evaluate(() => {
    const b = __remake.scene; b.beginQuestion(7); for (let i = 0; i < 100; i++) b.stepQuiz();
    const timer = b.quizTimer; b.answerQuestion(1); for (let i = 0; i < 70; i++) b.stepQuiz(); return [timer > 300, b.wrong, b.hp];
  });
  assert.deepEqual(ghost, [true, false, 1]);
  const letters = await page.evaluate(() => {
    const b = __remake.scene; b.beginQuestion(8); for (let i = 0; i < 80; i++) b.stepQuiz();
    return [b.extraLetters > 0, b.answers.map(a => a.label.text), b.extraLetters];
  });
  assert.deepEqual(letters, [true, [11, 6, 8, 10].map(n => String(n + letters[2])), letters[2]]);
  const anime = await page.evaluate(() => {
    const b = __remake.scene; b.beginQuestion(9); for (let i = 0; i < 61; i++) b.stepQuiz();
    const speech = b.pages[0]; while (b.mode === 'pages') b.afterPages(); return [speech, b.q, b.mode];
  });
  assert.match(anime[0], /SNAIL ICE/); assert.deepEqual(anime.slice(1), [10, 'quiz']);
  // Bốn lựa chọn cuối đều kết thúc bằng lời riêng, không gây sát thương.
  for (let choice = 0; choice < 4; choice++) {
    const last = await page.evaluate(choice => {
      const b = __remake.scene; b.beginQuestion(10); for (let i = 0; i < 71; i++) b.stepQuiz(); b.answerQuestion(choice);
      for (let i = 0; i < 30; i++) b.stepQuiz(); const first = b.pages[0];
      while (b.mode === 'pages') b.afterPages();
      if (choice === 3) { for (let i = 0; i < 150; i++) b.stepQuiz(); while (b.mode === 'pages') b.afterPages(); }
      return [first, b.hp, b.mode, b.exitStage];
    }, choice);
    assert.equal(last[0], ['SEE, ALPHYS?\nI TOLD YOU IT\nWAS OBVIOUS.', 'WHY WOULD SOMEONE\nOUTFIT AN\nAMUSEMENT ROBOT...', '... SERIOUSLY?', 'CORRECT.'][choice]);
    assert.deepEqual(last.slice(1), [1, 'quizExit', 'arms']);
  }
  await page.evaluate(() => { const b = __remake.scene; for (let i = 0; i < 91; i++) b.stepQuiz(); });
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.hp, w.flags[20], w.xp, w.gold, w.kills]; }), [1, 0, previous.xp, previous.gold, previous.kills]);
  await page.evaluate(previous => Object.assign(__remake.scene, previous), previous);
  console.log('✓ Mettaton: ACT, đáp án bằng phím, trả lời sai/hết giờ, HP 1, câu đặc biệt và bốn kết thúc');
}
