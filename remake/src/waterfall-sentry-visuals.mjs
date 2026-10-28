// obj_waterfall_waterfall và hoạt ảnh SAVE trong room_water2.
export class WaterfallSentryVisuals {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.tiles = [];
    this.star = world.roomObjects.find((e) => e.item.ObjectName === 'obj_savepoint');
    const fall = world.roomObjects.find((e) => e.item.ObjectName === 'obj_waterfall_waterfall');
    fall.image.destroy();
    const { X: x, Y: y, ScaleX: width, ScaleY: height } = fall.item;
    const add = (part, dx, dy) => {
      const key = `spr_waterfall_${part}`, sprite = world.dataSource.sprites.get(key);
      const image = world.add.image(x + dx, y + dy, `${key}:0`).setOrigin(sprite.OriginX / sprite.Width, sprite.OriginY / sprite.Height).setDepth(-fall.object.Depth);
      this.tiles.push({ key, sprite, image });
    };
    add('topleft', 0, 0);
    for (let i = 1; i <= width; i++) add(i < width ? 'midtop' : 'topright', (i < width ? i : i - 1) * 20, 0);
    for (let j = 1; j <= height; j++) {
      const bottom = j === height, dy = (bottom ? j - 1 : j) * 20;
      add(bottom ? 'bottomleft' : 'midleft', 0, dy);
      for (let i = 1; i <= width; i++) add(bottom ? (i === width ? 'bottomright' : 'bottommid') : (i === width ? 'midright' : 'midmid'), (i === width ? i - 1 : i) * 20, dy);
    }
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } }
  step() {
    this.frames++;
    for (const tile of this.tiles) tile.image.setTexture(`${tile.key}:${Math.floor(this.frames / 5) % tile.sprite.TextureCount}`);
    this.star.image.setTexture(`${this.star.object.Sprite}:${Math.floor(this.frames * .2) % this.star.sprite.TextureCount}`);
  }
  destroy() { this.tiles.forEach((tile) => tile.image.destroy()); }
}
