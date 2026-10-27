import assert from 'node:assert/strict';

export async function testRoomCleanup(page) {
  for (const room of ['room_ruins12A', 'room_tundra3', 'room_tundra_town', 'room_tundra_iceexit_new']) {
    const result = await page.evaluate(async (room) => {
      const w = __remake.game.scene.getScene('World'); await w.openRoom('room_area1'); w.flags = { 70: 4 }; w.plot = 101; await w.openRoom(room);
      // Giữ reference và listener như hệ thống âm thanh/hiệu ứng: rời phòng phải phát destroy.
      const old = w.children.getAll(); let destroyed = 0;
      for (const a of old) a.once('destroy', () => { destroyed++; });
      const texture = w.player.texture; const cache = w.game.registry.get('sourceCache'); const size = cache.size;
      await w.openRoom('room_ruins1');
      return { count: old.length, destroyed, alive: old.filter((a) => a.active).length, attached: old.filter((a) => !!a.scene).length,
        inDisplay: old.filter((a) => w.children.exists(a)).length, texture: w.textures.exists(texture.key), cache: cache.size >= size, newPlayer: w.player.active };
    }, room);
    assert.ok(result.count > 20); assert.equal(result.destroyed, result.count, room); assert.deepEqual([result.alive, result.attached, result.inDisplay, result.texture, result.cache, result.newPlayer], [0, 0, 0, true, true, true]);
  }
  console.log('✓ Đổi phòng hủy ảnh/nhân vật/đồ vật cũ và phát destroy, bỏ scene/displaylist, giữ texture/cache và nhân vật mới');
}
