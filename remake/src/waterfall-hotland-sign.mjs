// obj_hotlandsign: chữ chạy và ba viền nhấp nháy trước Hotland.
export class WaterfallHotlandSign {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.offset = 20; this.brightness = 0;
    this.inactive = world.flags[350] === 1;
    const item = world.dataSource.room.GameObjects.find(entry => entry.ObjectName === 'obj_hotlandsign');
    this.x = item.X; this.y = item.Y;
    this.background = world.add.rectangle(this.x - 12, this.y - 12, 505, 64, 0x000000).setOrigin(0).setDepth(-900000);
    this.clip = world.add.graphics().fillStyle(0xffffff).fillRect(this.x, this.y, 480, 40).setVisible(false);
    this.mask = this.clip.createGeometryMask();
    this.letters = world.add.image(this.x + this.offset * 8, this.y, 'spr_hotlandsign:0').setOrigin(0).setScale(8).setTint(0xff0000).setAlpha(this.inactive ? .5 : 1).setDepth(-899999).setMask(this.mask);
    this.cover = world.add.tileSprite(this.x, this.y, 480, 40, 'spr_hotlandcover:0').setOrigin(0).setDepth(-899998);
    this.border = world.add.graphics().setDepth(-899997); this.drawBorder();
  }
  drawBorder() {
    this.border.clear();
    for (let i = 1; i <= 3; i++) {
      this.border.lineStyle(1, this.brightness === 2 * i - 1 ? 0x00ff00 : 0x008000);
      this.border.strokeRoundedRect(this.x - 9 - i, this.y - 9 - i, 498 + 2 * i, 58 + 2 * i, 5);
    }
  }
  update(delta) {
    if (this.inactive) return;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.frame++;
      if (this.frame >= 5 && (this.frame - 5) % 4 === 0) { if (--this.offset < -80) this.offset = 60; this.letters.x = this.x + this.offset * 8; }
      if (this.frame % 15 === 0) { this.brightness = (this.brightness + 1) % 6; this.drawBorder(); }
    }
  }
  destroy() { this.letters.clearMask(); this.mask.destroy(); this.clip.destroy(); this.background.destroy(); this.letters.destroy(); this.cover.destroy(); this.border.destroy(); }
}
