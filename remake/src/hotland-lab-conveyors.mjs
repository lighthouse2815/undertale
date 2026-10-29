import { touchesObject } from './npc.mjs';

// obj_alphysconveyor và obj_sideconveyorl: chở qua hai tầng, thả sau bốn frame rời băng.
export class HotlandLabConveyors {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frame = 0; this.active = null; this.col = -1;
    this.vertical = world.roomObjects.filter(e => e.item.ObjectName === 'obj_alphysconveyor');
    this.horizontal = world.roomObjects.filter(e => e.item.ObjectName === 'obj_sideconveyorl');
    for (const e of this.vertical) e.image.setTexture('spr_conveyorbelt_d_blue:0').setScale(1, 4.8).setDepth(-900000);
    for (const e of this.horizontal) e.image.setTexture('spr_conveyorbelt_r_blue:0').setScale(29, 1).setDepth(-900000);
  }
  checkTrigger() {
    const w = this.world;
    if (w.dialogue || w.hotlandAlphysIntro?.locked || w.hotlandAlphysPhone?.locked) return false;
    const entry = this.vertical.find(e => touchesObject(w, w.player, e.item, 1, 4.8));
    if (!entry) return false;
    this.active = entry; this.col = 4; w.release(); return true;
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30 && window.__remake.phase === 'running') { this.elapsed -= 1000 / 30; this.step(); }
    return !!this.active;
  }
  step() {
    const w = this.world; this.frame++;
    for (const e of this.vertical) e.image.setTexture(`spr_conveyorbelt_d_blue:${e.item.X < w.dataSource.room.Width / 2 ? this.frame % 5 : (5 - this.frame % 5) % 5}`);
    for (const e of this.horizontal) e.image.setTexture(`spr_conveyorbelt_r_blue:${(5 - this.frame % 5) % 5}`);
    if (w.dialogue || w.hotlandAlphysIntro?.locked || w.hotlandAlphysPhone?.locked) return;
    if (this.active) {
      const item = this.active.item;
      if (touchesObject(w, w.player, item, 1, 4.8)) this.col = 4;
      if (--this.col > 0) {
        w.player.x = item.X; w.player.y += item.X < w.dataSource.room.Width / 2 ? 4 : -4;
        w.player.setDepth(w.player.y + 30);
        const door = w.findDoor(w.player.x, w.player.y);
        if (door) { w.transitionRoom(door.destination, door.marker, door.duration, door.musicFade); return; }
      } else { this.active = null; w.release(); }
    } else if (this.horizontal.some(e => touchesObject(w, w.player, e.item, 29, 1))) {
      w.player.x -= 3;
    }
  }
}
