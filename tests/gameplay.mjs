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
    const bullet = new Battle(game, 'moss', () => {});
    bullet.bullets = [bullet.makeBullet({ x: -100, y: 100, vx: -10, vy: 0, r: 5, color: '#fff' })];
    for (let i = 0; i < 30; i++) bullet.updateBullets(1 / 60);
    return { stages, reward, remaining, levelMessage, lv: game.player.lv, expiredBullets: bullet.bullets.length };
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
  assert.equal(result.expiredBullets, 0);
  const worldResult = await page.evaluate(async () => {
    const { NPC_TALK } = await import('/src/data.js');
    const game = window.__duoidat;
    game.flags = { intro_seen: true, met_nhim: true, met_moc: true, met_kem: true, met_tuyet: true };
    game.enterRoom('market');
    const world = game.world;
    world.talkToNpc(world.objects.find((o) => o.id === 'nhim'));
    world.dialogue.onDone();
    const shop = [...world.shop.items];
    const bosses = ['sentinel', 'guard'].map((id) => {
      game.enterRoom(id === 'sentinel' ? 'bridge' : 'snow3');
      const boss = world.objects.find((o) => o.type === 'boss');
      world.afterBattle('kill', id, boss);
      const lines = world.dialogue.lines.map((l) => l.text).join('\n');
      game.enterRoom(world.room.id);
      world.player.x = boss.x * 32;
      world.player.y = boss.y * 32 + 20;
      world.updateInteractions();
      return { lines, nearBoss: world.nearObject?.type === 'boss', method: game.flags[`${boss.flag}_method`] };
    });
    const reactions = ['baMoc', 'kem', 'nguoiTuyet'].map((id) => NPC_TALK[id]({ flags: game.flags }).lines.map((l) => l.text).join('\n'));
    return { shop, bosses, reactions };
  });
  assert.deepEqual(worldResult.shop, ['bread', 'candy', 'tea', 'honey']);
  for (const boss of worldResult.bosses) {
    assert.equal(boss.method, 'kill');
    assert.equal(boss.nearBoss, false);
    assert.doesNotMatch(boss.lines, /chịu đứng lại nghe|ngủ ngon/);
  }
  assert.match(worldResult.reactions[0], /không còn nghe tiếng giáo/);
  assert.match(worldResult.reactions[1], /Đường tuần tra im/);
  assert.match(worldResult.reactions[2], /không còn nghe tiếng bước chân/);
  const mapResult = await page.evaluate(async () => {
    const { ROOMS } = await import('/src/data.js');
    const game = window.__duoidat;
    const invalid = [];
    const unreachable = [];
    const blocked = [];
    for (const room of Object.values(ROOMS)) {
      const incoming = Object.values(ROOMS).flatMap((r) => r.exits.filter((e) => e.to === room.id).map((e) => e.spawn));
      for (const spawn of [room.spawn, room.saveSpawn, ...incoming].filter(Boolean)) {
        game.enterRoom(room.id, spawn);
        if (!game.world.canStand(game.world.player.x, game.world.player.y)) invalid.push({ room: room.id, spawn });
      }
      game.enterRoom(room.id);
      const world = game.world;
      const queue = [[world.player.x, world.player.y]];
      const seen = new Set([queue[0].join(',')]);
      for (let i = 0; i < queue.length; i++) {
        const [x, y] = queue[i];
        for (const [dx, dy] of [[8, 0], [-8, 0], [0, 8], [0, -8]]) {
          const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
          if (!seen.has(key) && world.canStand(nx, ny)) { seen.add(key); queue.push([nx, ny]); }
        }
      }
      for (const exit of room.exits) {
        if (!queue.some(([x, y]) => x / 32 >= exit.x && x / 32 < exit.x + exit.w && y / 32 >= exit.y && y / 32 < exit.y + exit.h)) unreachable.push(`${room.id} → ${exit.to}`);
        if (exit.requires) {
          delete game.flags[exit.requires];
          world.player.x = (exit.x + exit.w / 2) * 32;
          world.player.y = (exit.y + exit.h / 2) * 32;
          world.updateMovement(0);
          blocked.push({ room: room.id, safe: world.canStand(world.player.x, world.player.y), stayed: world.room.id === room.id });
        }
      }
      for (const object of world.objects) {
        if (!queue.some(([x, y]) => Math.hypot(x - object.x * 32, y - (object.y * 32 - 10)) < 62)) unreachable.push(`${room.id}: ${object.id}`);
      }
    }
    game.enterRoom('hall');
    const before = { x: game.world.player.x, y: game.world.player.y };
    game.world.save();
    game.loadGame();
    const after = { x: game.world.player.x, y: game.world.player.y };
    return { invalid, unreachable, blocked, before, after };
  });
  assert.deepEqual(mapResult.invalid, []);
  assert.deepEqual(mapResult.unreachable, []);
  assert.ok(mapResult.blocked.length > 0);
  assert.ok(mapResult.blocked.every((gate) => gate.safe && gate.stayed));
  assert.deepEqual(mapResult.after, mapResult.before);
  const saveResult = await page.evaluate(async () => {
    const { Save } = await import('/src/core.js');
    const game = window.__duoidat;
    game.world.save();
    const valid = Save.read();
    const invalid = ['{', 'null', '[]', '{}', JSON.stringify({ ...valid, roomId: 'missing' }),
      JSON.stringify({ ...valid, player: { ...valid.player, hp: -1 } }),
      JSON.stringify({ ...valid, player: { ...valid.player, items: { missing: 1 } } }),
      JSON.stringify({ ...valid, spawn: { x: 100, y: 2 } })];
    const rejected = invalid.map((raw) => {
      localStorage.setItem('duoidat.save.v1', raw);
      return !Save.exists() && Save.read() === null && !game.loadGame();
    });
    Save.write(valid);
    const accepted = Save.exists() && game.loadGame();
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
    game.enterRoom('wake');
    game.world.interact(game.world.objects.find((o) => o.type === 'lamp'));
    const failure = game.world.dialogue.lines.map((l) => l.text).join('\n');
    Storage.prototype.setItem = original;
    return { rejected, accepted, failure };
  });
  assert.ok(saveResult.rejected.every(Boolean));
  assert.equal(saveResult.accepted, true);
  assert.match(saveResult.failure, /Không lưu được hành trình/);
  assert.doesNotMatch(saveResult.failure, /Hành trình đã được ghi lại/);
  const roomReset = await page.evaluate(() => {
    const game = window.__duoidat;
    game.flags = {};
    game.enterRoom('wake');
    const queuedIntro = Boolean(game.world.pendingIntro);
    game.world.blockedCooldown = 4;
    game.world.nearObject = game.world.objects[0];
    game.flags = { intro_seen: true, met_dom: true };
    game.enterRoom('hall');
    const world = game.world;
    world.update(0.3);
    return { queuedIntro, staleIntro: Boolean(world.pendingIntro || world.dialogue),
      nearObject: world.nearObject?.id ?? null, cooldown: world.blockedCooldown,
      companionDistance: Math.hypot(world.companion.x - world.player.x, world.companion.y - world.player.y) };
  });
  assert.equal(roomReset.queuedIntro, true);
  assert.equal(roomReset.staleIntro, false);
  assert.equal(roomReset.cooldown, 0);
  assert.ok(roomReset.companionDistance < 50);
  const inventory = await page.evaluate(async () => {
    const { Input, R } = await import('/src/core.js');
    const game = window.__duoidat;
    const world = game.world;
    game.player.items = { bread: 1, candy: 1, tea: 1, honey: 1, kem: 2 };
    game.player.hp = game.player.maxHp - 1;
    world.pauseIndex = 4;
    Input.just.add('confirm'); world.updatePause();
    const indexAfterUse = world.pauseIndex;
    const texts = [];
    const original = R.text;
    R.text = (text, x, y) => { texts.push({ text, y }); };
    world.drawPause(); R.text = original;
    game.player.hp = game.player.maxHp - 1;
    Input.just.add('confirm'); world.updatePause();
    return { indexAfterUse, finalIndex: world.pauseIndex, kem: game.player.items.kem ?? 0, texts };
  });
  assert.equal(inventory.indexAfterUse, 4);
  assert.equal(inventory.finalIndex, 3);
  assert.equal(inventory.kem, 0);
  assert.equal(inventory.texts.filter((entry) => / ×\d/.test(entry.text)).length, 3);
  assert.ok(inventory.texts.some((entry) => entry.text === 'Kem tuyết ×1' && entry.y < 330));
  const battles = await page.evaluate(async () => {
    const { Battle } = await import('/src/battle.js');
    const { ENEMIES } = await import('/src/data.js');
    const game = window.__duoidat;
    const drain = (battle) => {
      let limit = 100;
      while (battle.phase === 'message' && limit-- > 0) { battle.typer.skip(); battle.advanceMessage(); }
      if (limit <= 0) throw new Error('Hội thoại không kết thúc');
    };
    return Object.keys(ENEMIES).map((id) => {
      let outcome;
      const battle = new Battle(game, id, (result) => { outcome = result; });
      drain(battle);
      const patterns = [];
      for (const pattern of battle.enemy.patterns) {
        battle.beginEnemyTurn();
        battle.patternRing = [pattern]; battle.patternIndex = 0; battle.currentPattern = pattern;
        battle.patternSegment = battle.attackDuration;
        battle.setBoxForPattern(pattern);
        battle.invuln = 999;
        let count = 0;
        for (let i = 0; i < 600 && battle.phase === 'enemyTurn'; i++) {
          battle.updateEnemyTurn(1 / 60);
          count = Math.max(count, battle.bullets.length);
          if (battle.bullets.some((b) => !Number.isFinite(b.x + b.y))) throw new Error(`Đạn lỗi: ${id}/${pattern}`);
        }
        patterns.push({ pattern, count, ended: battle.phase === 'menu' });
      }
      let turns = 0;
      while (battle.warmth < battle.enemy.mercyAt && turns < 20) {
        const acts = battle.availableActs();
        battle.doAct(acts[turns++ % acts.length]); drain(battle);
        battle.endEnemyTurn();
      }
      battle.doMercy(0); drain(battle);
      return { id, outcome, patterns };
    });
  });
  for (const battle of battles) {
    assert.equal(battle.outcome, 'spare', battle.id);
    assert.ok(battle.patterns.every((p) => p.count > 0 && p.ended), battle.id);
  }
  for (const [type, result, kills] of [['true', 'spare', 0], ['neutral', 'spare', 1], ['dark', 'kill', 0]]) {
    const ending = await page.evaluate(({ result, kills }) => {
      const game = window.__duoidat;
      game.startNewGame(); game.flags.intro_seen = true;
      game.player.kills = kills; game.enterRoom('throne');
      const boss = game.world.objects.find((o) => o.final);
      game.startBattle('king', (outcome) => game.world.afterBattle(outcome, 'king', boss));
      const battle = game.battle;
      battle.victory(result);
      while (battle.phase === 'message') { battle.typer.skip(); battle.advanceMessage(); }
      return { scene: game.scene, type: game.endingType };
    }, { result, kills });
    assert.equal(ending.scene, 'ending'); assert.equal(ending.type, type);
    for (let i = 0; i < 10; i++) {
      if (await page.evaluate(() => window.__duoidat.scene === 'title')) break;
      await page.keyboard.press('z'); await page.waitForTimeout(40);
    }
    assert.equal(await page.evaluate(() => window.__duoidat.scene), 'title');
    assert.equal(await page.evaluate(() => localStorage.getItem('duoidat.save.v1')), null);
  }
  await page.evaluate(() => {
    const game = window.__duoidat;
    game.startNewGame(); game.flags.intro_seen = true; game.enterRoom('hall');
    game.world.save();
    game.startBattle('moss', (result) => game.world.afterBattle(result, 'moss'));
    game.player.hp = 1; game.battle.hurtPlayer(); game.battle.update(2.2);
  });
  assert.equal(await page.evaluate(() => window.__duoidat.scene), 'gameover');
  await page.keyboard.press('z');
  await page.waitForFunction(() => window.__duoidat.scene === 'world');
  assert.equal(await page.evaluate(() => window.__duoidat.player.hp), 20);
  await page.evaluate(() => { localStorage.clear(); window.__duoidat.endingTimer = 100; window.__duoidat.onDeath(); });
  assert.ok(await page.evaluate(() => window.__duoidat.endingTimer < 1));
  await page.keyboard.press('z'); await page.waitForTimeout(40);
  assert.equal(await page.evaluate(() => window.__duoidat.scene), 'gameover');
  assert.match(await page.evaluate(() => window.__duoidat.toastText), /Chưa có hành trình/);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(40);
  await page.keyboard.press('z');
  await page.waitForFunction(() => window.__duoidat.scene === 'intro');
  assert.equal(await page.evaluate(() => window.__duoidat.player.kills), 0);
  const interactions = await page.evaluate(async () => {
    const { Input } = await import('/src/core.js');
    const game = window.__duoidat;
    game.startNewGame(); game.flags.intro_seen = true; game.enterRoom('wake');
    const world = game.world;
    const chest = world.objects.find((o) => o.type === 'chest');
    world.interact(chest); world.interact(chest);
    const candy = game.player.items.candy;
    world.openShop(['bread']); game.player.gold = 8;
    Input.just.add('confirm'); world.updateShop();
    const bought = { bread: game.player.items.bread, gold: game.player.gold };
    Input.just.add('confirm'); world.updateShop();
    const refused = { bread: game.player.items.bread, gold: game.player.gold };
    game.player.hp = game.player.maxHp;
    const fullHpUse = game.useItem('bread');
    const remainingBread = game.player.items.bread;
    game.enterRoom('forest');
    const spring = world.objects.find((o) => o.type === 'spring');
    game.player.hp = 1; world.interact(spring);
    const springFirst = game.player.hp;
    game.player.hp = 1; world.interact(spring);
    return { candy, bought, refused, fullHpUse, remainingBread, springFirst, springSecond: game.player.hp };
  });
  assert.equal(interactions.candy, 1);
  assert.deepEqual(interactions.bought, { bread: 2, gold: 0 });
  assert.deepEqual(interactions.refused, interactions.bought);
  assert.equal(interactions.fullHpUse, 0); assert.equal(interactions.remainingBread, 2);
  assert.equal(interactions.springFirst, 20); assert.equal(interactions.springSecond, 1);
  await page.evaluate(() => {
    const game = window.__duoidat;
    game.startNewGame(); game.flags.intro_seen = true; game.enterRoom('hall');
    game.startBattle('moss', () => {});
    const battle = game.battle;
    while (battle.phase === 'message') { battle.typer.skip(); battle.advanceMessage(); }
    battle.beginEnemyTurn();
    window.dispatchEvent(new Event('blur'));
  });
  const frozen = await page.evaluate(() => {
    const game = window.__duoidat;
    return { hp: game.player.hp, playtime: game.playtime, turn: game.battle.turn, time: game.time };
  });
  await page.waitForTimeout(200);
  assert.deepEqual(await page.evaluate(() => {
    const game = window.__duoidat;
    return { hp: game.player.hp, playtime: game.playtime, turn: game.battle.turn, time: game.time };
  }), frozen);
  assert.equal(await page.evaluate(() => window.__duoidat.suspended), true);
  await page.keyboard.press('z');
  await page.waitForFunction(() => !window.__duoidat.suspended);
  assert.equal(await page.evaluate(() => window.__duoidat.battle.phase), 'enemyTurn');
  await page.evaluate(() => {
    const game = window.__duoidat;
    game.enterRoom('hall');
    window.dispatchEvent(new Event('blur'));
  });
  assert.equal(await page.evaluate(() => window.__duoidat.suspended), true);
  await page.keyboard.press('x');
  await page.waitForFunction(() => !window.__duoidat.suspended);
  assert.equal(await page.evaluate(() => window.__duoidat.world.paused), false);
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const phone = await mobile.newPage();
  phone.on('pageerror', (error) => errors.push(error.message));
  await phone.goto(`http://127.0.0.1:${port}/#play`);
  await phone.waitForFunction(() => window.__duoidat?.scene === 'title');
  await phone.locator('[data-input="confirm"]').tap();
  await phone.waitForFunction(() => window.__duoidat.scene === 'intro');
  for (let i = 0; i < 3; i++) { await phone.locator('[data-input="confirm"]').tap(); await phone.waitForTimeout(40); }
  await phone.waitForFunction(() => window.__duoidat.scene === 'world');
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log('✓ tạm dừng khi mất tiêu điểm, đóng băng trận đấu và tiếp tục không lọt phím');
  console.log('✓ chuyển giai đoạn của ba trùm, phần thưởng tha, phần trăm hơi ấm và tăng nhiều cấp');
  console.log('✓ mở lại cửa hàng, hậu quả hạ trùm và phản ứng của NPC');
  console.log('✓ vị trí vào phòng, điểm lưu và tọa độ sau khi tải lại');
  console.log('✓ dữ liệu lưu hợp lệ, tám trường hợp lưu hỏng và bộ nhớ bị chặn');
  console.log('✓ cuộn túi đồ, giữ lựa chọn khi còn vật phẩm và cập nhật khi dùng hết');
  console.log('✓ toàn bộ kẻ địch, các mẫu đạn, tuyến tha và cả ba kết thúc');
  console.log('✓ thua trận, tải điểm lưu, từ chối tiếp tục khi chưa lưu và chơi lại');
  console.log('✓ rương mở một lần, mua hàng, thiếu tiền, hồi máu, suối và nút cảm ứng');
} finally {
  await browser?.close();
  server.kill();
}
