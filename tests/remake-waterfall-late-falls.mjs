import assert from 'node:assert/strict';

export async function testWaterfallLateFalls(page) {
  await page.evaluate(async () => { const w = __remake.scene; w.flags = {}; w.plot = 117; await w.openRoom('room_water15'); w.scene.pause(); });
  const details = await page.evaluate(() => {
    const w = __remake.scene, v = w.waterfallRoomTiles;
    for (let i = 0; i < 5; i++) v.step();
    return [v.tiles.length, ...[0, 41, 42, 90, 91, 181].map(i => {
      const t = v.tiles[i]; return [t.key, t.image.x, t.image.y, t.image.texture.key];
    })];
  });
  assert.deepEqual(details, [182,
    ['spr_waterfall_topleft', 440, 160, 'spr_waterfall_topleft:1'],
    ['spr_waterfall_bottomright', 540, 240, 'spr_waterfall_bottomright:1'],
    ['spr_waterfall_topleft', 440, 0, 'spr_waterfall_topleft:1'],
    ['spr_waterfall_bottomright', 540, 100, 'spr_waterfall_bottomright:1'],
    ['spr_waterfall_topleft', 720, 160, 'spr_waterfall_topleft:1'],
    ['spr_waterfall_bottomright', 820, 100, 'spr_waterfall_bottomright:1']]);
  const cleanup = await page.evaluate(async () => { const w = __remake.scene, tile = w.waterfallRoomTiles.tiles[0].image; w.scene.resume(); await w.openRoom('room_water_shop'); return [w.waterfallRoomTiles, tile.active]; });
  assert.deepEqual(cleanup, [null, false]);
  console.log('✓ Waterfall 15: bốn thác, hoạt ảnh và dọn tài nguyên');
}
