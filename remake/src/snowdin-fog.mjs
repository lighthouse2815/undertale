import { murderLevel } from './route.mjs';

// obj_fogmaker, obj_waterdivot_test và obj_icecube_room trong room_fogroom.
export class SnowdinFog {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.offset = 0; this.alpha = 0; this.frozen = false;
    const texture = world.textures.get('spr_tundrafog:0');
    for (let i = 0; i < 80; i++) if (!texture.has(`fog:${i}`)) texture.add(`fog:${i}`, 0, i, 0, 80, 80);
    this.tiles = Array.from({ length: 39 }, (_, i) => world.add.image((i % 13) * 80, Math.floor(i / 13) * 80, 'spr_tundrafog:0', 'fog:0').setOrigin(0).setDepth(-999));
    this.water = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_waterdivot_test').map((e) => ({ ...e, speed: .15 + Math.random() * .05, sine: Math.random() * 20, frame: 0 }));
    for (const e of this.water) e.image.setDepth(-e.object.Depth);
    this.ice = world.roomObjects.find((e) => e.item.ObjectName === 'obj_icecube_room');
    if (this.ice && (world.flags[7] === 1 || murderLevel(world.flags) >= 7)) { this.ice.image.destroy(); world.roomObjects = world.roomObjects.filter((e) => e !== this.ice); this.ice = null; }
    else this.ice?.image.setDepth(-999989);
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
  }
  step() {
    const w = this.world; this.frames++;
    if (this.frames % 4 === 0) this.offset = (this.offset + 1) % 80;
    if (!this.frozen) { this.alpha = w.player.x / 440; if (this.alpha > 1 && w.plot > 99) this.alpha = 2 - this.alpha; }
    for (const tile of this.tiles) tile.setFrame(`fog:${this.offset}`).setAlpha(Math.max(0, Math.min(1, this.alpha)));
    for (const e of this.water) {
      e.image.x += 1.5 + Math.sin(e.sine++ / 6) * .2; if (e.image.x > w.dataSource.room.Width) e.image.x = -10;
      e.frame = (e.frame + e.speed) % e.sprite.TextureCount; e.image.setTexture(`${e.object.Sprite}:${Math.floor(e.frame)}`);
    }
    if (this.ice) { const e = this.ice; e.image.x += 1.5; if (e.image.x > w.dataSource.room.Width) e.image.x = e.item.X - 60; e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .1) % e.sprite.TextureCount}`); }
  }
  destroy() { this.tiles.forEach((tile) => tile.destroy()); }
}
