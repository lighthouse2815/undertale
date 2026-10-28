// obj_tallgrass và obj_grasssounder trong room_water4.
export class WaterfallGrass {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.soundTimer = 0;
    this.grass = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_tallgrass').map((e) => {
      e.image.setDepth(e.item.Y + e.sprite.Height); return { ...e, contact: 0 };
    });
  }
  update(delta) { this.elapsed = Math.min(200, this.elapsed + delta); while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); } }
  step() {
    const w = this.world, p = w.player; let sound = false;
    for (const e of this.grass) {
      if (e.contact === 0) e.image.setTexture(`${e.object.Sprite}:0`); else e.contact--;
      const s = e.sprite, left = e.item.X + s.MarginLeft - s.OriginX, right = e.item.X + s.MarginRight - s.OriginX;
      const top = e.item.Y + s.MarginTop - s.OriginY, bottom = e.item.Y + s.MarginBottom - s.OriginY;
      if (p.x + 19 >= left && p.x <= right && p.y + 29 >= top && p.y + 19 <= bottom) {
        if (this.soundTimer < 0 && e.contact === 0) sound = true;
        e.image.setTexture(`${e.object.Sprite}:1`); e.contact = 2;
      }
    }
    if (sound && this.soundTimer < 0) { w.sound.play('snd_splash'); this.soundTimer = 3; }
    this.soundTimer--;
  }
}
