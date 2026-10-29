// obj_autowater loại bỏ cốc khi người chơi đi sang phòng khác.
export class HotlandAutoWater {
  constructor(world) {
    this.world = world; this.remaining = world.flags[366] === 1 ? 3 : -1; this.elapsed = 0;
  }
  update(delta) {
    if (this.remaining < 0) return;
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30 && this.remaining > 0) { this.elapsed -= 1000 / 30; this.remaining--; }
    const w = this.world;
    if (this.remaining !== 0 || w.dialogue || w.hotlandUndyneCollapse?.locked || w.waterfallUndyneFinal?.locked) return;
    this.remaining = -1; w.release();
    const lines = w.dataSource.name === 'room_fire1' ? ['* (The cup of water returned\n  to the water cooler.)']
      : w.dataSource.name === 'room_fire2' ? ['* (The cup of water was erased\n  by a mysterious force.)']
        : ['* (The water evaporated from\n  the heat.)', '* (The cup evaporated, too.)'];
    w.showDialogue(lines, { onClose: () => { w.flags[366] = 0; w.release(); } });
  }
}
