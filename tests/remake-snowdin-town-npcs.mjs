import assert from 'node:assert/strict';

export async function testSnowdinTownNpcs(page) {
  const key = async (code) => { await page.keyboard.press(code); await page.waitForTimeout(65); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve))); };
  const open = (flags = {}, plot = 67) => page.evaluate(async ({ flags, plot }) => { const w = __remake.scene; await w.openRoom('room_area1'); Object.assign(w, { flags, plot, gold: 100, kills: 0, hp: 20, maxHp: 20 }); await w.openRoom('room_tundra_town'); }, { flags, plot });
  const near = async (name, facing = 'u') => { await page.evaluate(({ name, facing }) => { const w = __remake.scene, e = w.snowdinTownNpcs.npcs.find((e) => e.name === name), s = e.sprite; w.player.setPosition(e.item.X - s.OriginX + (s.MarginLeft + s.MarginRight) / 2 - 10, e.item.Y - s.OriginY + s.MarginBottom - 18); w.player.facing = facing; w.interactionCooldown = 0; w.updateCamera(); }, { name, facing }); await key('z'); };
  const read = async (count, pattern, last) => {
    assert.ok(await page.evaluate(() => !!__remake.scene.dialogue)); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), count); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    if (last) assert.match(await page.evaluate(() => __remake.scene.dialogue.lines.at(-1)), last);
    const at = await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]); await page.keyboard.down('ArrowRight'); await key('c'); await page.keyboard.up('ArrowRight'); assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.phase]), [...at, 'running']);
    for (let i = 0; i < count; i++) await key('z');
  };
  const normals = [['bunlady', 2, /Cinnamon/, /Bun-bun/], ['bunboy', 2, /lady/, /figured/], ['bear1', 3, /mayor/, /Politics/], ['beartree', 3, /teens/, /Guess/], ['reddemon', 3, /underground/, /Smile/], ['unfunny', 3, /Everyone/, /puns/], ['monsterkid1', 2, /Yo/, /skeleton/]];
  await open(); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.length), 7); assert.equal(await page.evaluate(() => __remake.scene.colliders.filter((c) => c.objectName.startsWith('obj_townnpc_')).length), 7);
  for (const [name, count, pattern, repeat] of normals) { await near(name); await read(count, pattern); await near(name); await read(1, repeat); }
  assert.deepEqual(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.map((e) => e.talked)), [2, 2, 2, 2, 2, 2, 2]);
  const bottom = await page.evaluate(() => { const w = __remake.scene, c = w.colliders.find((c) => c.objectName === 'obj_townnpc_bunlady'); w.player.setPosition(c.rectangle.centerX - 10, c.rectangle.bottom - 16); return c.rectangle.bottom; }); await page.keyboard.down('ArrowUp'); await page.waitForTimeout(240); await page.keyboard.up('ArrowUp'); assert.ok(await page.evaluate((bottom) => __remake.scene.player.y + 19 >= bottom, bottom));
  await open({}, 122); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.length), 6);
  for (const [name, n, p] of [['bunlady', 2, /walk/], ['bunboy', 3, /walk/], ['bear1', 3, /ran for mayor/], ['beartree', 2, /Adjusting/], ['reddemon', 2, /frowning/], ['unfunny', 3, /joke/]]) { await near(name); await read(n, p); await near(name); await read(n, p); }
  await open({ 7: 1 }, 130);
  for (const [name, n, p, repeatN, repeat] of [['bunlady', 4, /kid/, 4, /kid/], ['bunboy', 2, /Uhhh/, 1, /\.\.\./], ['bear1', 5, /Alphys/, 1, /politics/], ['beartree', 2, /tradition/, 2, /tradition/], ['reddemon', 2, /free/, 2, /free/], ['unfunny', 3, /jokes/, 3, /jokes/], ['monsterkid1', 4, /There you are/, 1, /\.\.\./]]) { await near(name); await read(n, p); await near(name); await read(repeatN, repeat); }
  await open({ 52: 1, 53: 1, 54: 1, 7: 1 }, 130);
  for (const [name, n, p, last] of [['bunlady', 2, /peaceful/, /dogs/], ['bunboy', 2, /happy/], ['beartree', 6, /cute/], ['unfunny', 1, /worse/], ['bear1', 5, /Alphys/], ['reddemon', 2, /free/]]) { await near(name); await read(n, p, last); }
  // Chỉ thiếu một chó thì scr_deaddog không bật, các nhánh kết thúc vẫn ưu tiên plot122.
  await open({ 52: 1, 53: 1 }, 122); await near('bunlady'); await read(2, /walk/);
  await open({ 52: 1, 53: 1, 54: 1, 67: 1, 7: 1 }, 130);
  for (const [name, n, p, last] of [['bunlady', 2, /peaceful/, /skeletons/], ['bunboy', 2, /happy/], ['bear1', 2, /Undyne/], ['beartree', 2, /Papyrus/], ['reddemon', 2, /smile/], ['unfunny', 1, /worse/]]) { await near(name); await read(n, p, last); }
  for (const [flag, n, first, repeat] of [[0, 4, /There you are/, /\.\.\./], [1, 6, /What's up/, /Nyeh/], [2, 2, /Uh/, /\.\.\./]]) { await open({ 7: 1, 98: flag }, 130); await near('monsterkid1'); await read(n, first); await near('monsterkid1'); await read(1, repeat); }
  for (const flags of [{ 26: 7 }, { 26: 7, 27: 1 }, { 26: 7, 7: 1, 98: 1 }]) { await open(flags); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinTownNpcs.npcs.map((e) => e.name), __remake.scene.colliders.filter((c) => c.objectName.startsWith('obj_townnpc_')).length]), [['monsterkid1'], 1]); await near('monsterkid1'); await read(3, /ran away/); }
  await open({ 26: 6 }); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.length), 7); await open({}, 100); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.length), 7); await open({}, 101); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.length), 6);
  await open({ 7: 1 }, 112); await near('monsterkid1'); assert.deepEqual(await page.evaluate(() => [!!__remake.scene.dialogue, __remake.scene.snowdinTownNpcs.npcs.find((e) => e.kid).talked]), [false, 1]);
  await open(); await near('monsterkid1'); await page.waitForTimeout(180); assert.ok(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.find((e) => e.kid).image.texture.key.startsWith('spr_mkid_dt:'))); await read(2, /Yo/); assert.equal(await page.evaluate(() => __remake.scene.snowdinTownNpcs.npcs.find((e) => e.kid).image.texture.key), 'spr_mkid_d:0');
  await near('bunlady'); await read(2, /Cinnamon/); await page.evaluate(async () => { const w = __remake.scene; w.saveGame(); await w.restoreGame(); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.gold, __remake.scene.plot, __remake.scene.snowdinTownNpcs.npcs.map((e) => e.talked)]), [100, 67, [0, 0, 0, 0, 0, 0, 0]]);
  await page.screenshot({ path: '.cache/snowdin-town-npcs.png' });
  await page.evaluate(async () => { const w = __remake.scene, actors = w.snowdinTownNpcs.npcs.map((e) => e.image); await w.openRoom('room_area1'); w.townNpcsRemoved = actors.every((a) => !a.active); }); assert.deepEqual(await page.evaluate(() => [__remake.scene.snowdinTownNpcs, __remake.scene.townNpcsRemoved]), [null, true]);
  console.log('✓ NPC town: bảy nhân vật/thoại đầu-lặp/plot122/kết thúc/3chó-cờ67/thứ tự ưu tiên, MonsterKid98ba nhánh/112/tuyến7/ẩn101/mặt nói, collider/khóa/SAVE/dọn');
}
