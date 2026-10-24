import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright-core';

// Dùng Chrome đã cài trên máy; không tải thêm trình duyệt vào project.
const executablePath = process.env.CHROME_PATH;
if (!executablePath) throw new Error('Hãy đặt CHROME_PATH tới tệp thực thi Chrome/Chromium.');
const port = process.env.TEST_PORT ?? '5187';
const server = spawn(process.execPath, ['server.mjs'], {
  env: { ...process.env, PORT: port, LOCAL_MUSIC_DIR: '/nonexistent', LOCAL_SPRITE_DIR: '/nonexistent' },
  stdio: ['ignore', 'pipe', 'inherit'],
});
let browser;
try {
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(([code]) => { throw new Error(`Server dừng: ${code}`); }),
  ]);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${port}/#play`);
  await page.waitForFunction(() => window.__duoidat?.scene === 'title');
  const result = await page.evaluate(async () => {
    const { Battle } = await import('/src/battle.js');
    const game = window.__duoidat;
    const stages = ['sentinel', 'guard', 'king'].map((id) => {
      const battle = new Battle(game, id, () => {});
      battle.enemyHp = battle.enemy.phase2At;
      battle.afterPlayerAction();
      const phase = battle.phase;
      const warning = battle.currentLine.text;
      while (battle.phase === 'message') { battle.typer.skip(); battle.advanceMessage(); }
      return { id, phase, warning, turn: battle.turn, stage: battle.stage, finalPhase: battle.phase };
    });
    game.player.hp = game.player.maxHp - 1;
    const mercy = new Battle(game, 'moss', () => {});
    mercy.victory('spare');
    const reward = mercy.textQueue.at(-1).text;
    const king = new Battle(game, 'king', () => {});
    king.warmth = 55;
    king.doMercy(0);
    const remaining = king.textQueue[0].text;
    const level = new Battle(game, 'moss', () => {});
    game.player.exp = 70;
    const levelMessage = level.applyLevelUp().text;
    return { stages, reward, remaining, levelMessage, lv: game.player.lv };
  });
  for (const stage of result.stages) {
    assert.equal(stage.phase, 'message');
    assert.equal(stage.stage, 2);
    assert.equal(stage.finalPhase, 'enemyTurn');
    assert.equal(stage.turn, 1);
    if (stage.id === 'guard') assert.match(stage.warning, /Chó Tuyết/);
  }
  assert.match(result.reward, /Hồi 1 HP/);
  assert.match(result.remaining, /50%/);
  assert.equal(result.lv, 4);
  assert.match(result.levelMessage, /HP tối đa \+12, Công \+3/);
  assert.deepEqual(errors, []);
  console.log('✓ chuyển giai đoạn của ba trùm, phần thưởng tha, phần trăm hơi ấm và tăng nhiều cấp');
} finally {
  await browser?.close();
  server.kill();
}
