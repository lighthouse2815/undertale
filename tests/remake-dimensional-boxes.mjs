import assert from 'node:assert/strict';

export async function testDimensionalBoxes(page) {
  const press = async key => { await page.keyboard.press(key); await page.waitForTimeout(50); };
  await page.waitForFunction(() => __remake.phase === 'running' && __remake.scene.scene.isActive());
  const previous = await page.evaluate(async () => {
    const w = __remake.scene, snapshot = structuredClone({ flags: w.flags, phone: w.phone, inventory: w.inventory, plot: w.plot, menuSelection: w.menuSelection });
    w.flags = { 300: 1, 312: 13 }; w.phone = [206, 220, 221]; w.inventory = [12]; w.plot = 127;
    await w.openRoom('room_fire_lab1', 'obj_markerC'); return snapshot;
  });
  const open = async id => {
    await page.evaluate(() => { __remake.scene.menuSelection = 2; });
    await press('c'); await page.waitForFunction(() => __remake.phase === 'menu'); await press('z');
    const index = await page.evaluate(id => __remake.scene.world.phone.indexOf(id), id);
    for (let i = 0; i < index; i++) await press('ArrowDown');
    await press('z');
  };
  await open(221); await page.waitForFunction(() => __remake.phase === 'itemBox' && __remake.scene.time.now >= __remake.scene.readyAt);
  assert.equal(await page.evaluate(() => __remake.scene.boxBase), 312);
  await press('z');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene.world; return [w.inventory, w.flags[300], w.flags[312], w.flags[313], w.phone[0]]; }), [[], 1, 13, 12, 221]);
  await press('ArrowRight'); await press('z'); await press('x');
  await page.waitForFunction(() => __remake.phase === 'running');
  await open(220); await page.waitForFunction(() => __remake.phase === 'itemBox' && __remake.scene.time.now >= __remake.scene.readyAt);
  assert.equal(await page.evaluate(() => __remake.scene.boxBase), 300);
  await press('z'); await press('x');
  assert.deepEqual(await page.evaluate(() => { const w = __remake.scene; return [w.inventory, w.flags[300], w.flags[301], w.flags[312], w.phone[0]]; }), [[], 1, 13, 12, 220]);
  // Truy cập hộp thường sau ngăn B vẫn dùng đúng ngăn A mặc định.
  await page.evaluate(() => { __remake.scene.scene.launch('ItemBox'); __remake.phase = 'loadingBox'; });
  await page.waitForFunction(() => __remake.phase === 'itemBox' && __remake.scene.time.now >= __remake.scene.visibleAt); assert.equal(await page.evaluate(() => __remake.scene.boxBase), 300); await press('x');
  await page.evaluate(async () => { await __remake.scene.openRoom('room_water_dogroom'); });
  await open(221); await page.waitForFunction(() => __remake.phase === 'running' && !!__remake.scene.dialogue);
  assert.match(await page.evaluate(() => __remake.scene.dialogue.lines[0]), /hair of a dog/);
  await page.evaluate(previous => { const w = __remake.scene; while (w.dialogue) w.advanceDialogue(); Object.assign(w, previous); }, previous);
  console.log('✓ Hộp điện thoại A/B độc lập, đổi thứ tự CELL, hộp thường và phòng chó');
}
