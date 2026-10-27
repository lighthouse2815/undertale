import assert from 'node:assert/strict';

export async function testWalkFrames(page) {
  const results = await page.evaluate(async () => {
    const { movePlayer } = await import('/src/movement.mjs');
    const w = __remake.scene; await w.openRoom('room_area1');
    return ['left', 'right', 'up', 'down'].map((direction) => {
      w.player.setPosition(300, 130); w.player.frameIndex = 0;
      const frames = [];
      for (let i = 0; i < 60; i++) {
        movePlayer(w, w.player, [], (key) => key === direction);
        frames.push(w.player.texture.key);
      }
      return { frames, x: w.player.x, y: w.player.y };
    });
  });
  for (const [index, facing] of ['l', 'r', 'u', 'd'].entries()) {
    assert.ok(results[index].frames.every((key) => new RegExp(`^spr_mainchara${facing}:[0-${index < 2 ? 1 : 3}]$`).test(key)));
    assert.equal(new Set(results[index].frames).size, index < 2 ? 2 : 4);
  }
  assert.deepEqual(results.map(({ x, y }) => [x, y]), [[120, 130], [480, 130], [300, -50], [300, 310]]);
  console.log('✓ Di chuyển 60 frame mỗi hướng: sprite ngang 2 khung/dọc 4 khung, không mất ảnh, giữ tốc độ 3 pixel mỗi bước');
}
