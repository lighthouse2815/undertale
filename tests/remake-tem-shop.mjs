import assert from 'node:assert/strict';

export async function testTemShop(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; w.inventory = []; w.gold = 3; localStorage.setItem('undertale-remake-deaths', '0'); await w.openRoom('room_water_temvillage'); w.player.setPosition(330, 152); });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_shop5'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'shop');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.scene.key, __remake.scene.price(3), __remake.scene.world.gold]), ['TemShop', 1000, 3]);
  const buy = await page.evaluate(() => { const s = __remake.scene; s.key('KeyZ'); s.key('KeyZ'); s.key('KeyZ'); const first = [s.world.gold, [...s.world.inventory], s.side]; s.key('KeyZ'); s.key('KeyZ'); const poor = [s.world.gold, s.side]; return [first, poor]; });
  assert.deepEqual(buy, [[0, [22], 1], [0, 3]]);
  const full = await page.evaluate(() => { const s = __remake.scene; s.world.inventory = Array(8).fill(22); s.world.gold = 3000; s.key('KeyZ'); s.key('KeyZ'); const full = [s.world.gold, s.side, s.world.inventory.length]; for (let i = 0; i < 3; i++) s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); return [full, s.mode, s.world.gold]; });
  assert.deepEqual(full, [[3000, 4, 8], 'pages', 2000]);
  await page.evaluate(() => { const s = __remake.scene; s.time.timeScale = 100; s.key('KeyZ'); s.key('KeyZ'); s.key('KeyZ'); });
  await page.waitForFunction(() => __remake.scene.world.flags[276] === 1 && __remake.scene.mode === 'pages', null, { timeout: 10000 });
  await page.evaluate(() => { const s = __remake.scene; s.key('KeyZ'); s.key('KeyZ'); s.world.inventory = []; s.world.gold = 10000; s.key('KeyZ'); for (let i = 0; i < 3; i++) s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); });
  assert.deepEqual(await page.evaluate(() => [__remake.scene.world.inventory, __remake.scene.world.gold, __remake.scene.side]), [[64], 1, 1]);
  const sold = await page.evaluate(() => {
    const s = __remake.scene; s.key('KeyX'); s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ');
    const pages = s.pages.length; for (let i = 0; i < pages; i++) s.key('KeyZ'); const first = s.offer;
    s.key('ArrowRight'); s.key('KeyZ'); s.key('KeyZ'); s.key('KeyZ'); const second = s.offer; s.key('KeyZ');
    return [pages, first, second, [...s.world.inventory], s.world.gold, s.world.flags[265], s.mode];
  });
  assert.deepEqual(sold, [4, 501, 628, [], 629, 8, 'main']);
  await page.evaluate(() => { const s = __remake.scene; for (let i = 0; i < 3; i++) s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); });
  await page.waitForFunction(() => __remake.room === 'room_water_temvillage' && __remake.phase === 'running');
  assert.deepEqual(await page.evaluate(() => [__remake.scene.player.x, __remake.scene.player.y, __remake.scene.flags[276], __remake.scene.waterfallMusic.key]), [330, 152, 1, 'mus_temvillage']);
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {26: 10}; w.plot = 117; w.inventory = [56]; w.gold = 1000; await w.openRoom('room_water_temvillage'); w.player.setPosition(330, 152); });
  await page.keyboard.down('ArrowUp'); await page.waitForFunction(() => __remake.room === 'room_shop5'); await page.keyboard.up('ArrowUp'); await page.waitForFunction(() => __remake.phase === 'shop');
  const violent = await page.evaluate(() => { const s = __remake.scene; s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); const blocked = [s.mode, s.world.gold, [...s.world.inventory]]; s.key('KeyX'); s.key('KeyZ'); for (let i = 0; i < 3; i++) s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); return [blocked, s.violent, s.world.flags[276] ?? 0, [...s.world.inventory], s.world.gold]; });
  assert.deepEqual(violent, [['sell', 1000, [56]], true, 0, [56, 22], 0]);
  const refused = await page.evaluate(() => { const s = __remake.scene; s.key('KeyX'); s.key('ArrowDown'); s.key('KeyZ'); s.key('ArrowRight'); s.key('KeyZ'); for (let i = 0; i < 4; i++) s.key('KeyZ'); const first = s.offer; s.key('ArrowRight'); s.key('KeyZ'); s.key('KeyZ'); s.key('KeyZ'); const second = s.offer; s.key('ArrowRight'); s.key('KeyZ'); s.key('KeyZ'); return [first, second, s.mode, s.world.flags[266], s.world.gold, [...s.world.inventory]]; });
  assert.deepEqual(refused, [3, 5, 'sell', 1, 0, [56, 22]]);
  await page.evaluate(() => { const s = __remake.scene; s.key('KeyX'); for (let i = 0; i < 3; i++) s.key('ArrowDown'); s.key('KeyZ'); s.key('KeyZ'); });
  await page.waitForFunction(() => __remake.room === 'room_water_temvillage' && __remake.phase === 'running');
  console.log('✓ Tem Shop: mua/thiếu tiền/túi đầy, đại học, giáp, thương lượng và trở về');
}
