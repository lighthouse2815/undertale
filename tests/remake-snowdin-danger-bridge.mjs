import assert from 'node:assert/strict';
import { SnowdinEncounter } from '../remake/src/snowdin-encounter.mjs';

export async function testSnowdinDangerBridge(page) {
  for (const plot of [65, 66, 67, 101]) { const w = { plot, flags: { 70: 4 }, dataSource: { name: 'room_tundra_dangerbridge', room: { GameObjects: [{ ObjectName: 'obj_encounterer_jerry' }] } } }; assert.equal(new SnowdinEncounter(w).disabled, plot < 67 || plot > 100); }
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 65, marker = 'obj_mainchara') => page.evaluate(async ({ flags, plot, marker }) => { const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); Object.assign(w, { flags: { 70: 4, ...flags }, plot, hp: 20, maxHp: 20, kills: 0, gold: 100, xp: 0, lv: 1, inventory: [16] }); await w.openRoom('room_tundra_dangerbridge', marker); }, { flags, plot, marker });
  const read = async (name, pattern, count) => {
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    for (let i = 0; i < count; i++) {
      const p = await page.evaluate(({ name, i }) => { const w = __remake.scene, p = w.dataSource.dangerBridgeDialogue[name][i]; return [w.dialoguePortrait?.texture.key ?? null, w.dialogueText.font, p.portrait ? `${p.portrait}:0` : null, p.font]; }, { name, i }); assert.equal(p[0], p[2]); assert.equal(p[1], p[3]); await key('z');
    }
  };
  const waitTalk = () => page.waitForFunction(() => !!__remake.scene.dialogue);
  const nearSans = async () => { await page.evaluate(() => { const w = __remake.scene, e = w.snowdinDangerBridge.sansEntry; w.player.setPosition(e.item.X, e.item.Y + e.sprite.MarginBottom - 18); w.player.facing = 'u'; w.interactionCooldown = 0; }); await key('z'); };
  const run = async (murder = false) => {
    await open(murder ? { 26: 5 } : {}); assert.equal(await page.evaluate(() => __remake.scene.snowdinEncounter.disabled), true);
    await page.evaluate(() => { __remake.scene.player.setPosition(560, 108); }); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.scene.snowdinDangerBridge.locked); await page.keyboard.up('ArrowRight');
    const at = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await key('c'); await key('ArrowUp'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), at);
    await waitTalk(); assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, c = w.snowdinDangerBridge; return [c.stage, w.cameras.main.scrollX - c.camera, c.papMusic.key, Math.round(c.papMusic.volume * 1e6) / 1e6, c.icon, w.plot]; }), ['talking', 120, 'mus_papyrus', .6, null, 65]); await read('intro', /HUMAN|FINAL/, 3);
    await page.waitForFunction(() => __remake.scene.snowdinDangerBridge.stage === 'deployed');
    const positions = await page.evaluate(() => __remake.scene.snowdinDangerBridge.traps.map((t) => [t.key, t.image.x, Math.round(t.image.y), t.vy, t.image.scaleY]));
    assert.deepEqual(positions, [['spr_dtrapcannon', 770, 198, 0, 1], ['spr_dtrapspear', 700, 256, 0, -1], ['spr_dtrapspear', 700, -6, 0, 1], ['spr_dtrapmace', 620, -28, 0, 1], ['spr_dtrapdog', 770, -18, 0, 1], ['spr_dtrapfire', 620, 156, 0, 1]]);
    await waitTalk(); await page.screenshot({ path: `.cache/danger-bridge-${murder ? 'murder' : 'normal'}.png` }); await read('rules', /ACTIVATE|ACTIVATED/, 10);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinDangerBridge.stage), 'firstPause'); await waitTalk(); await read('pause', /Well|WELL|what|what\?/i, 3);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinDangerBridge.stage), 'secondPause'); await waitTalk(); await read(murder ? 'cancelMurder' : 'cancel', /activated/i, murder ? 22 : 11);
    assert.equal(await page.evaluate(() => __remake.scene.snowdinDangerBridge.stage), 'retract'); await waitTalk(); assert.equal(await page.evaluate(() => __remake.scene.snowdinDangerBridge.traps.filter((t) => t.key !== 'spr_dtrapfire').length), 0); await read('bye', /PHEW/i, 1);
    await waitTalk(); await read(murder ? 'lastMurder' : 'last', murder ? /VALUABLE/ : /LOOKING/, murder ? 2 : 6);
    await page.waitForFunction(() => __remake.scene.snowdinDangerBridge.stage === 'done'); assert.deepEqual(await page.evaluate(() => { const w = __remake.scene, c = w.snowdinDangerBridge; return [w.plot, c.locked, c.pap.active, c.sans.active, c.traps.length, w.cameras.main.scrollX - Math.max(0, Math.min(720, Math.round(w.player.x - 150))), w.snowdinMusic.key, w.snowdinMusic.rate, c.flowey.x, c.flowey.y, w.snowdinEncounter.disabled, !!c.sansEntry]; }), [67, false, false, true, 0, 0, 'mus_snowy', .95, 80, 120, true, true]);
    await nearSans(); await read(murder ? 'sansMurder' : 'sans', murder ? /hmmm/ : /brother/, murder ? 9 : 2);
    if (!murder) { await page.evaluate(() => { localStorage.setItem('undertale-remake-papyrus-kills', '1'); }); await nearSans(); await read('sansMemory', /advice/, 2); await page.evaluate(() => { localStorage.removeItem('undertale-remake-papyrus-kills'); }); }
    // Flowey chỉ chìm khi camera thực sự nhìn thấy; cờ9 tăng đúng một lần.
    const flag = await page.evaluate(() => __remake.scene.flags[9] ?? 0); await page.evaluate(() => { const w = __remake.scene; w.player.x = 120; w.updateCamera(); }); await page.waitForFunction(() => !__remake.scene.snowdinDangerBridge.flowey.active); assert.equal(await page.evaluate(() => __remake.scene.flags[9]), flag + 1);
    await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(850, 130); w.saveGame(); }); await page.evaluate(async () => { await __remake.scene.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.plot, __remake.scene.snowdinDangerBridge.stage, __remake.scene.snowdinDangerBridge.pap ?? null, __remake.scene.snowdinEncounter.disabled]), [67, 'done', null, false]);
  };
  await run(); await run(true);
  // Hai cửa với poffzone và marker; nhạc giữ cùng instance.
  await open({}, 67, 'obj_markerA'); await page.keyboard.down('ArrowLeft'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft'); await page.waitForFunction(() => __remake.room === 'room_tundra_poffzone' && __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [518, 134]);
  await page.evaluate(() => { const w = __remake.scene; w.testBridgeMusic = w.snowdinMusic; w.player.setPosition(520, 134); }); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.room === 'room_tundra_dangerbridge' && __remake.phase === 'running'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.testBridgeMusic === __remake.scene.snowdinMusic]), [20, 140, true]);
  await page.evaluate(() => { const w = __remake.scene; w.player.setPosition(160, 108); w.player.facing = 'd'; w.interactionCooldown = 0; }); await key('z'); assert.ok(await page.evaluate(() => !!__remake.scene.dialogue)); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /camera/); await key('z');
  // Gặp quái nhóm Jerry thật sau khi quay lại, không tăng bước khi cảnh đang khóa.
  await page.evaluate(() => { const e = __remake.scene.snowdinEncounter; e.count = e.steps - 2; }); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'encounter'); await page.keyboard.up('ArrowRight'); await page.waitForFunction(() => __remake.phase === 'battle'); assert.ok(['battle_snowdinGroup35', 'battle_snowdinGroup36'].includes(await page.evaluate(() => __remake.room)));
  await page.evaluate(() => { __remake.scene.menuIndex = 3; }); await key('z'); await key('ArrowDown'); await key('z'); while (await page.evaluate(() => __remake.phase === 'battle' && __remake.scene.mode === 'pages')) await key('z'); await page.waitForFunction(() => __remake.phase === 'running');
  for (const flags of [{ 413: 1 }, { 67: 1 }]) { await open(flags); await page.evaluate(() => __remake.scene.snowdinDangerBridge.finish()); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinDangerBridge.sans.active, __remake.scene.colliders.filter((c) => c.objectName === 'obj_sans_room').length]), [false, 0]); }
  await open({ 26: 5, 27: 1 }, 66); assert.equal(await page.evaluate(() => __remake.scene.snowdinDangerBridge.murder), false); await page.evaluate(async () => { const w = __remake.scene; const c = w.snowdinDangerBridge; c.deploy(); const actors = [c.pap, c.sans, ...c.traps.map((t) => t.image)]; await w.openRoom('room_area1'); w.bridgeActorsRemoved = actors.every((a) => !a.active); }); assert.equal(await page.evaluate(() => __remake.scene.bridgeActorsRemoved), true);
  console.log('✓ Cầu bẫy: cửa/marker/nhạc, Papyrus7/camera120/khóa, sáu bẫy/42-60-30frame/đảo hướng/thu hồi, thoại thường-tuyến5/Sans-ký ức/Flowey9/SAVE/encounterJerry/dọn');
}
