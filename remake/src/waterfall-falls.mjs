// obj_fakefalls, obj_fakefalls_bg và obj_waterripple trong room_water3.
export class WaterfallFalls {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0;
    this.falls = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_fakefalls').map((e) => ({ ...e, col: 0 }));
    this.background = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_fakefalls_bg');
    this.ripple = world.roomObjects.find((e) => e.item.ObjectName === 'obj_waterripple');
    for (const e of this.background) e.image.setDepth(-e.object.Depth);
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } }
  step() {
    const w = this.world, p = w.player; this.frames++;
    for (const e of this.background) e.image.setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .5) % e.sprite.TextureCount}`);
    for (const e of this.falls) {
      const hit = p.x + 19 >= e.item.X && p.x <= e.item.X + 19 && p.y + 29 >= e.item.Y && p.y + 19 <= e.item.Y + e.sprite.MarginBottom;
      e.col = Math.max(0, e.col - 1); if (hit) e.col = Math.min(4, e.col + 2);
      const offset = e.col === 0 ? 0 : e.col === 1 ? 16 : e.col === 2 ? 25 : 30;
      e.image.setPosition(e.item.X, e.item.Y - offset).setTexture(`${e.object.Sprite}:${Math.floor(this.frames * .5) % e.sprite.TextureCount}`)
        .setDepth(e.col < 3 && e.item.Y + e.sprite.MarginBottom < p.y + 19 ? e.item.Y + e.sprite.Height : 9999);
    }
    const r = this.ripple, left = Math.max(0, 221 - p.x), top = Math.max(0, 61 - p.y), right = Math.min(20, 381 - p.x), bottom = Math.min(30, 181 - p.y);
    r.image.setPosition(p.x, p.y).setDepth(p.depth + 100).setTexture(`${r.object.Sprite}:${Math.floor(this.frames * .2) % r.sprite.TextureCount}`);
    if (right > left && bottom > top) r.image.setVisible(true).setCrop(Math.round(left), Math.round(top), Math.round(right - left), Math.round(bottom - top));
    else r.image.setVisible(false);
    const inside = p.x > 215 && p.x + 19 < 385 && p.y + 19 > 55 && p.y + 29 < 185, frame = Math.floor(p.frameIndex ?? 0);
    if (inside && (frame === 1 || frame === 3) && this.lastSplash !== frame) w.sound.play('snd_splash');
    this.lastSplash = frame;
  }
}
