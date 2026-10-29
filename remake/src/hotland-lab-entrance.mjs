import { createCollider } from './movement.mjs';

// obj_alabdoor_l ở ngoài lab: cánh cửa tự động và lối C tạo khi vào phòng.
export class HotlandLabEntrance {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.offset = 0; this.open = false;
    const entry = world.roomObjects.find(e => e.item.ObjectName === 'obj_alabdoor_l');
    this.x = entry.item.X; this.y = entry.item.Y; entry.image.setTexture('spr_labdoor_hang:0').setDepth(-100000);
    this.pieces = [0, 1].map(() => world.add.image(this.x, this.y, 'spr_alabdoor_piece:0').setOrigin(0).setDepth(-99999));
    this.locked = world.flags[492] === 1;
    if (this.locked) world.colliders.push(createCollider(world.dataSource, { ObjectName: 'obj_solidsmall', X: this.x, Y: this.y + 52, ScaleX: 1, ScaleY: 1 }));
    else {
      const item = { ObjectName: 'obj_doorCmusicfade', X: this.x, Y: this.y + 50, ScaleX: 1, ScaleY: 1 };
      const sprite = world.dataSource.sprites.get(world.dataSource.objects.get(item.ObjectName).Sprite);
      world.doors.push({ destination: 'room_fire_lab1', marker: 'obj_markerC', direction: 'C', musicFade: true, duration: 13 * 1000 / 30,
        left: item.X + sprite.MarginLeft, right: item.X + sprite.MarginRight, top: item.Y + sprite.MarginTop, bottom: item.Y + sprite.MarginBottom });
    }
    this.draw();
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30;
      const p = this.world.player, dx = Math.max(this.x - p.x - 19, p.x - this.x - 12, 0), dy = Math.max(this.y - p.y - 29, p.y + 19 - this.y - 72, 0), distance = Math.hypot(dx, dy);
      if (!this.locked && distance < 40 && !this.open) { this.open = true; this.world.sound.play('snd_elecdoor_open'); }
      if (!this.locked && distance > 50 && this.open) { this.open = false; this.world.sound.play('snd_elecdoor_close'); }
      this.offset = Math.max(0, Math.min(8, this.offset + (this.open ? 1 : -1))); this.draw();
    }
  }
  draw() {
    const n = this.offset;
    this.pieces[0].setPosition(this.x, this.y + 4).setCrop(0, 0, Math.max(1, 8 - n), 61).setVisible(n < 7);
    this.pieces[1].setPosition(this.x + 6 + n, this.y + 10).setCrop(n, 0, Math.max(1, 8 - n), 61).setVisible(n < 7);
  }
  destroy() { for (const image of this.pieces) image.destroy(); }
}
