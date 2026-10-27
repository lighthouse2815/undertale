import { createCollider } from './movement.mjs';
import { touchesObject } from './npc.mjs';
import { murderLevel } from './route.mjs';
import { startSnowdinMusic } from './snowdin-start.mjs';

// obj_xoxo/obj_xoxocontroller1: dùng chung ô, nút và tường cho các phòng X/O.
export class SnowdinXoxoPuzzle {
  constructor(world, targetPlot) {
    this.world = world; this.targetPlot = targetPlot; this.elapsed = 0; this.frames = 0; this.total = 0; this.locked = false;
    startSnowdinMusic(world);
    if (murderLevel(world.flags) >= 4 && !world.flags[27] && world.plot < 57) world.plot = 57;
    this.tiles = world.roomObjects.filter((e) => e.item.ObjectName === 'obj_xoxo').map((e) => ({ ...e, frame: 0, touched: false }));
    this.button = world.roomObjects.find((e) => e.item.ObjectName === 'obj_xoxocontroller1'); this.button.image.setDepth(-100000); this.buttonAlarm = 0;
    this.sign = world.roomObjects.find((e) => e.item.ObjectName === 'obj_sign_room'); world.colliders.push(createCollider(world.dataSource, this.sign.item)); this.sign.image.setDepth(this.sign.item.Y + this.sign.sprite.Height);
    this.wall = world.colliders.find((e) => e.objectName === 'obj_plotwall_room');
    Object.assign(this.wall, createCollider(world.dataSource, { ...world.dataSource.room.GameObjects.find((e) => e.ObjectName === 'obj_plotwall_room'), ScaleY: 400 }));
    this.tiles.forEach((e) => e.image.setDepth(-100000)); this.victory = false; this.sync();
  }
  sync() {
    this.wall.disabled = this.world.plot >= this.targetPlot;
    for (const e of this.world.roomObjects.filter((e) => e.item.ObjectName === 'obj_spikes_room')) e.image.setTexture(`${e.object.Sprite}:${this.wall.disabled ? 1 : 0}`);
    this.tiles.forEach((e) => e.image.setTexture(`spr_xoxo:${e.frame}`));
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    return this.locked;
  }
  press() {
    const w = this.world;
    if (w.plot < this.targetPlot) {
      if (this.victory) { w.plot = this.targetPlot; this.tiles.forEach((tile) => { tile.frame = 3; }); }
      else { this.tiles.forEach((tile) => { tile.frame = 0; }); this.victory = false; }
    }
  }
  stepPuzzle() {
    const w = this.world, p = w.player; this.frames++; this.total++;
    if (this.buttonAlarm && --this.buttonAlarm === 0) this.button.image.setTexture('spr_groundswitch1:0');
    for (const tile of this.tiles) {
      const x = tile.item.X + 10, top = tile.item.Y + 3, bottom = tile.item.Y + 12;
      const contact = p.x <= x && p.x + 19 >= x && p.y + 19 <= bottom && p.y + 29 >= top;
      if (contact && !tile.touched) {
        tile.touched = true;
        if (tile.frame < 2) { tile.frame++; w.sound.play('snd_instanoise'); if (tile.frame === 2) this.victory = false; }
      }
      if (!contact) tile.touched = false;
    }
    if (this.tiles.every((tile) => tile.frame === 1)) this.victory = true;
    if (touchesObject(w, p, this.button.item)) {
      this.press();
      if (!this.buttonAlarm) w.sound.play('snd_switchpull_n');
      this.button.image.setTexture('spr_groundswitch1:1'); this.buttonAlarm = 3;
    }
    this.sync();
  }
}
