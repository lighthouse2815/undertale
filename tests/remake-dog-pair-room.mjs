import assert from 'node:assert/strict';

export async function testDogPairRoom(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (plot = 49) => page.evaluate(async (plot) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.plot = plot; w.flags = {}; w.gold = 100; w.xp = w.kills = 0; w.lv = 20; w.hp = w.maxHp = 99; w.weapon = 14; w.weaponStrength = 5; w.armor = 4; w.armorDefense = 0; w.inventory = [3]; await w.openRoom('room_tundra_snowpuzz'); w.player.setPosition(350, 405); }, plot);
  const advance = (stage) => page.evaluate((stage) => { const c = __remake.scene.dogPairRoom; for (let i = 0; i < 500 && c.stage !== stage; i++) c.step(); if (c.stage !== stage) throw new Error(`${c.stage} != ${stage}`); return { player: [c.world.player.x, c.world.player.facing], ys: c.actors.map((a) => a.y) }; }, stage);
  const pages = async (n, pattern) => { assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), n); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern); if (pattern.source === 'smell') await page.screenshot({ path: '.cache/dog-pair-room-sniff.png' }); for (let i = 0; i < n; i++) await key('z'); };
  const enterBattle = async () => {
    await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.dogPairRoom.stage === 'forcedWalk'); await page.keyboard.up('ArrowRight');
    const initial = await page.evaluate(() => { const w = __remake.scene, c = w.dogPairRoom; return w.player.x - c.frames * 3; });
    await key('c'); assert.equal(await page.evaluate(() => __remake.phase), 'running'); const approached = await advance('approach');
    assert.deepEqual(approached, { player: [initial + 90, 'd'], ys: [540, 540] });
    assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.isPaused), true);
    await advance('sniffWait'); assert.deepEqual(await page.evaluate(() => __remake.scene.dogPairRoom.actors.map((a) => a.y)), [398, 398]);
    await advance('talking'); await pages(2, /smell/);
    assert.equal(await page.evaluate(() => __remake.scene.dogPairRoom.meanderMusic.rate), 1.4);
    const before = await page.evaluate(() => __remake.scene.dogPairRoom.actors.map((a) => [a.x, a.y])); await page.waitForTimeout(300);
    assert.notDeepEqual(await page.evaluate(() => __remake.scene.dogPairRoom.actors.map((a) => [a.x, a.y])), before);
    await page.waitForFunction(() => __remake.scene.dogPairRoom.stage === 'afterMeander');
    assert.deepEqual(await page.evaluate(() => __remake.scene.dogPairRoom.actors.map((a) => a.y)), [398, 398]);
    await advance('talking'); await pages(3, /weird smell/);
    await page.waitForFunction(() => __remake.phase === 'battle' && __remake.room === 'battle_dogi');
    assert.equal(await page.evaluate(() => __remake.scene.previousScene.flags[200]), 0);
    await page.evaluate(() => { __remake.scene.invFrames = 9999; });
  };
  const battleMenu = async (n) => { await page.evaluate((n) => { __remake.scene.menuIndex = n; }, n); await key('z'); };
  const battleRead = async () => { const count = await page.evaluate(() => __remake.scene.pages.length); for (let i = 0; i < count; i++) await key('z'); };
  const turn = async () => { await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul'); await page.evaluate(() => { const s = __remake.scene; s.wave.frames = s.wave.duration - 1; }); await page.waitForFunction(() => __remake.scene.mode === 'menu'); };
  const act = async (target, action) => { await battleMenu(1); if (target) await key('ArrowDown'); await key('z'); if (action >= 2) await key('ArrowRight'); if (action % 2) await key('ArrowDown'); await key('z'); await battleRead(); await turn(); };
  for (const route of ['pet', 'fetch', 'kill']) {
    await open(); await enterBattle();
    if (route === 'pet') { await act(0, 3); await act(0, 1); await act(0, 2); await act(1, 2); }
    else if (route === 'fetch') { await battleMenu(2); await key('z'); await battleRead(); await turn(); }
    else {
      for (let i = 0; i < 2; i++) {
        await battleMenu(0); await key('z'); await page.evaluate(() => { const s = __remake.scene; s.attackX = 156; s.attackSpeed = 0; }); await key('z');
        for (let p = 0; p < 4; p++) await key('z'); await battleRead();
        if (!i) await turn();
      }
    }
    if (route !== 'kill') { await battleMenu(3); await key('z'); }
    assert.match(await page.evaluate(() => __remake.scene.message.text), /YOU WON/); await key('z');
    await page.waitForFunction(() => __remake.phase === 'running');
    if (route === 'kill') { await page.waitForFunction(() => __remake.scene.plot === 51); assert.equal(await page.evaluate(() => __remake.scene.dogPairRoom.actors.every((a) => !a.active)), true); }
    else {
      await page.waitForFunction(() => __remake.scene.dogPairRoom.stage === 'afterBattle'); await advance('talking'); await pages(2, route === 'fetch' ? /Weird smells/ : /Dogs can pet/);
      const exit = await advance('done');
      assert.deepEqual(exit.ys, [558, 558]);
      assert.equal(await page.evaluate(() => __remake.scene.plot), 51); await page.waitForFunction(() => __remake.scene.dogPairRoom.actors.every((a) => !a.active));
    }
    assert.equal(await page.evaluate(() => __remake.scene.dogPairRoom.locked), false);
    await page.waitForFunction(() => __remake.scene.snowdinMusic.volume > .99);
    await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); });
    assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.dogPairRoom.stage, __remake.scene.dogPairRoom.actors.length]), [51, 'done', 0]);
  }
  // Game Over sau bước ép phải trở lại điểm chạm và dựng lại cảnh, không xuất hiện sau trigger.
  await open(); await enterBattle(); await battleMenu(3); await key('z'); await key('z'); await page.waitForFunction(() => __remake.scene.mode === 'soul');
  await page.evaluate(() => { const s = __remake.scene; s.hp = 1; s.invFrames = 0; s.hurt(999); s.time.timeScale = 30; });
  await page.waitForFunction(() => __remake.scene.mode === 'dead' && __remake.scene.deathReady);
  for (let i = 0; i < 8 && await page.evaluate(() => __remake.phase === 'battle'); i++) await key('z');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.dogPairRoom.stage === 'forcedWalk');
  assert.equal(await page.evaluate(() => __remake.scene.plot), 49);
  await page.evaluate(async () => __remake.scene.openRoom('room_tundra_spaghetti')); assert.equal(await page.evaluate(() => __remake.scene.dogPairRoom), null);
  await open(); await enterBattle();
  await page.evaluate(() => { const s = __remake.scene; s.finishBattle(); }); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  await page.evaluate(async () => __remake.scene.openRoom('room_tundra_spaghetti'));
  await page.waitForFunction(() => __remake.scene.snowdinMusic.isPlaying && __remake.scene.snowdinMusic.volume > .99, undefined, { timeout: 2000 });
  assert.equal(await page.evaluate(() => __remake.scene.snowdinMusic.isPlaying && __remake.scene.snowdinMusic.volume > .99), true);
  await open(); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.dogPairRoom.stage === 'forcedWalk'); await page.keyboard.up('ArrowRight');
  await advance('talking'); await pages(2, /smell/); await page.waitForTimeout(100);
  await page.evaluate(async () => { window.oldPairActors = [...__remake.scene.dogPairRoom.actors]; await __remake.scene.openRoom('room_tundra_spaghetti'); });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => oldPairActors.every((a) => !a.active) && !__remake.scene.sound.isPlaying('mus_dogmeander') && !__remake.scene.dialogue), true);
  await open(50); assert.equal(await page.evaluate(() => __remake.scene.dogPairRoom.stage), 'done'); assert.equal(await page.evaluate(() => __remake.scene.plot), 50);
  console.log('✓ Cảnh hai chó: trigger thật/ép30frame/90px/khóa/fade, tiến142frame/chờ20/path thật/rate1.4/chờ30, trận/Pet-Fetch-Kill/11frame/rút40/51/SAVE, GameOver dựng lại cảnh/dọn');
}
