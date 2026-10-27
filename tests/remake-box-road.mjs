import assert from 'node:assert/strict';
import { murderLevel } from '../remake/src/route.mjs';

export async function testBoxRoad(page) {
  assert.equal(murderLevel({ 202: 20, 45: 4, 52: 1, 53: 1, 54: 1 }), 5);
  assert.equal(murderLevel({ 202: 20, 45: 4, 26: 1 }), 1);
  assert.equal(murderLevel({ 202: 20, 45: 4, 52: 1, 53: 1, 54: 1, 57: 2, 203: 16, 67: 1, 81: 1, 252: 1, 204: 18, 251: 1, 350: 1, 402: 1, 397: 1, 205: 40, 425: 1 }), 16);
  const key = async (code) => {
    await page.keyboard.press(code); await page.waitForTimeout(65);
    await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
  };
  const place = (x, y, facing = 'u') => page.evaluate(([x, y, facing]) => {
    const w = __remake.scene; w.player.setPosition(x, y); w.player.facing = facing; w.interactionCooldown = 0;
  }, [x, y, facing]);
  const near = (name, facing = 'u') => page.evaluate(([name, facing]) => {
    const w = __remake.scene, e = w.roomObjects.find((e) => e.item.ObjectName === name);
    w.player.setPosition(e.item.X + Math.round((e.sprite.MarginLeft + e.sprite.MarginRight) / 2) - 10, e.item.Y + e.sprite.MarginBottom - 8);
    w.player.facing = facing; w.interactionCooldown = 0;
  }, [name, facing]);
  const drain = async () => { while (await page.evaluate(() => !!__remake.scene.dialogue && !__remake.scene.dialogue.choice)) await key('z'); };
  const yes = async () => { await page.waitForTimeout(120); await key('z'); };
  const storage = () => page.evaluate(() => {
    const w = __remake.scene.world ?? __remake.scene; return [w.inventory, Array.from({ length: 10 }, (_, i) => w.flags[300 + i] ?? 0)];
  });
  const box = async () => {
    await near('obj_sansbox'); await key('z'); await yes();
    await page.waitForFunction(() => __remake.phase === 'itemBox' && __remake.scene.time.now >= __remake.scene.readyAt);
  };
  await page.evaluate(async () => {
    const w = __remake.scene; await w.openRoom('room_area1'); w.flags = {}; w.plot = 37; w.inventory = []; w.weapon = 3; w.weaponStrength = 0;
    await w.openRoom('room_tundra2', 'obj_markerB');
  });
  await place(2680, 160, 'r'); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowRight');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra3');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [20, 160]);
  assert.equal((await storage())[1][0], 14);
  assert.deepEqual(await page.evaluate(() => __remake.scene.colliders.filter((c) => ['obj_sansbox', 'obj_sign_room'].includes(c.objectName)).map((c) => c.objectName).sort()), ['obj_sansbox', 'obj_sign_room']);
  await near('obj_sansbox');
  const boxFloor = await page.evaluate(() => { const c = __remake.scene.colliders.find((c) => c.objectName === 'obj_sansbox'); return c.rectangle.bottom; });
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(400); await page.keyboard.up('ArrowUp');
  assert.ok(await page.evaluate((floor) => __remake.scene.player.y + 19 >= floor, boxFloor), 'BOX chặn chân thật khi đi lên.');
  await near('obj_sign_room', 'd'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  await near('obj_sign_room'); await key('z'); assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), 4); await drain();
  await near('obj_sansbox'); await key('z'); await page.waitForTimeout(120); await key('ArrowRight'); await key('z');
  assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await box(); const position = await page.evaluate(() => [__remake.scene.world.player.x, __remake.scene.world.player.y]);
  await key('ArrowRight'); await key('z'); assert.deepEqual(await storage(), [[14], Array(10).fill(0)]);
  await key('ArrowLeft'); await key('z'); assert.deepEqual(await storage(), [[], [14, ...Array(9).fill(0)]]);
  assert.deepEqual(await page.evaluate(() => [__remake.scene.world.player.x, __remake.scene.world.player.y]), position);
  // Rút khi túi đầy, gửi khi BOX đầy và chọn ô rỗng đều giữ dữ liệu.
  await page.evaluate(() => { __remake.scene.world.inventory = Array(8).fill(1); }); await key('ArrowRight'); await key('z');
  assert.deepEqual(await storage(), [Array(8).fill(1), [14, ...Array(9).fill(0)]]);
  await page.evaluate(() => { const w = __remake.scene.world; for (let i = 0; i < 10; i++) w.flags[300 + i] = 12; });
  await key('ArrowLeft'); await key('z'); assert.deepEqual(await storage(), [Array(8).fill(1), Array(10).fill(12)]);
  await page.evaluate(() => { const w = __remake.scene.world; w.inventory = [1, 13]; for (let i = 0; i < 10; i++) w.flags[300 + i] = [14, 12, 7][i] ?? 0; });
  await key('z'); assert.deepEqual(await storage(), [[13], [14, 12, 7, 1, ...Array(6).fill(0)]]);
  await key('ArrowRight'); await key('ArrowDown'); await key('z');
  assert.deepEqual(await storage(), [[13, 12], [14, 7, 1, ...Array(7).fill(0)]]);
  for (let i = 0; i < 12; i++) await key('ArrowDown'); assert.equal(await page.evaluate(() => __remake.scene.row), 9);
  await key('z'); assert.deepEqual(await storage(), [[13, 12], [14, 7, 1, ...Array(7).fill(0)]]);
  await key('ArrowLeft'); assert.equal(await page.evaluate(() => __remake.scene.row), 7); await key('z');
  await key('x'); assert.equal(await page.evaluate(() => __remake.phase), 'running');
  await page.waitForTimeout(300); assert.equal(await page.evaluate(() => __remake.scene.dialogue), null);
  const beforeSave = await storage(); await page.evaluate(async () => {
    const w = __remake.scene; w.saveGame(); w.inventory = []; w.flags = {}; await w.restoreGame();
  }); assert.deepEqual(await storage(), beforeSave);
  await page.evaluate(async () => { const w = __remake.scene; w.inventory = []; for (let i = 0; i < 10; i++) w.flags[300 + i] = 0; w.saveGame(); await w.restoreGame(); });
  assert.deepEqual(await storage(), [[], Array(10).fill(0)], 'Hộp đã rút hết không sinh lại Tough Glove.');
  await near('obj_sansbox'); await key('z'); await yes();
  assert.equal(await page.evaluate(() => __remake.phase), 'running'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /little (time|effort|feeling)/); await drain();
  await page.evaluate(async () => { const w = __remake.scene, save = w.saveGame(); delete save.flags[300]; localStorage.setItem('undertale-remake-save-v1', JSON.stringify(save)); await w.restoreGame(); });
  assert.equal((await storage())[1][0], 14, 'SAVE cũ chưa có flag BOX được khởi tạo theo GAMESTART.');
  await box(); await key('ArrowRight'); await key('z'); await key('x');
  await page.evaluate(() => { __remake.scene.menuSelection = 0; }); await key('c');
  await page.waitForFunction(() => __remake.phase === 'menu'); await key('z'); await key('z'); await key('z');
  assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /equipped Tough Glove/); await drain();
  assert.deepEqual(await page.evaluate(() => [__remake.scene.weapon, __remake.scene.weaponStrength, __remake.scene.inventory]), [14, 5, [3]]);
  // SAVE thường và các lời theo tiến trình diệt chủng, không thay đổi plot.
  for (const [flags, pattern, red] of [
    [{}, /convenience/, false], [{ 202: 20, 45: 4, 203: 3 }, /13 left/, true],
    [{ 202: 20, 45: 4, 52: 1, 53: 1, 54: 1 }, /That comedian/, true],
    [{ 202: 20, 45: 4, 203: 16 }, /comedian got away/, false],
    [{ 202: 20, 45: 4, 203: 16, 57: 2 }, /Determination/, false],
    [{ 202: 20, 45: 4, 27: 1 }, /convenience/, false],
    [{ 26: 16 }, /Determination/, false],
  ]) {
    await page.evaluate((flags) => { const w = __remake.scene; w.flags = flags; w.hp = 3; w.maxHp = 20; }, flags);
    await near('obj_savepoint'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), pattern);
    assert.equal(await page.evaluate(() => __remake.scene.dialogueText.font), red ? 'fnt_maintext:red' : 'fnt_maintext');
    assert.equal(await page.evaluate(() => __remake.scene.hp), 20); await drain();
    await page.waitForFunction(() => __remake.phase === 'saving'); await key('z');
    assert.equal(await page.evaluate(() => __remake.scene.roomLabel.text), 'Snowdin - Box Road');
    await key('z'); await page.evaluate(() => new Promise((resolve) => __remake.game.events.once('poststep', resolve)));
    assert.equal(await page.evaluate(() => __remake.scene.plot), 37);
  }
  await place(200, 20); await page.keyboard.down('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowUp');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra3A');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [140, 180]);
  const waterX = await page.evaluate(() => __remake.scene.boxRoad.water[0].image.x); await page.waitForTimeout(500);
  assert.ok(await page.evaluate((x) => __remake.scene.boxRoad.water[0].image.x > x + 15, waterX));
  for (const ending of [false, true]) {
    await page.evaluate((ending) => { __remake.scene.flags[7] = ending ? 1 : 0; }, ending);
    await near('obj_ladiesfishingrod'); await key('z'); await drain();
    await page.waitForTimeout(120); await key('ArrowRight'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /leave it alone/); await drain();
    await near('obj_ladiesfishingrod'); await key('z'); await drain(); await yes();
    assert.equal(await page.evaluate(() => __remake.scene.dialogue.lines.length), ending ? 2 : 3);
    assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), ending ? /note/ : /photo/);
    assert.equal(await page.evaluate(() => __remake.scene.boxRoad.rod.image.texture.key), 'spr_fishingrod:1'); await drain();
    await near('obj_ladiesfishingrod'); await key('z'); assert.match(await page.evaluate(() => __remake.scene.dialogueText.text), /send the line back out/); await drain();
    assert.equal(await page.evaluate(() => __remake.scene.boxRoad.rod.image.texture.key), 'spr_fishingrod:0');
  }
  await place(140, 195, 'd'); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowDown');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra3');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [200, 20]);
  await place(20, 160, 'l'); await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'transition'); await page.keyboard.up('ArrowLeft');
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.room === 'room_tundra2');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y]), [2670, 160]);
  console.log('✓ Box Road/3A: cửa hai chiều, biển, BOX 8/10 ô/gửi-rút/đầy/rỗng/Glove/lưu nạp, SAVE thường/tuyến/màu/HP/tên file và cần câu hai nhánh/nước động');
}
