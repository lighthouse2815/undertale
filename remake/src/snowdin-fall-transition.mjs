// obj_falltransition: cùng một lần rơi khi tới icehole hoặc iceexit_new với cờ388.
export class SnowdinFallTransition {
  constructor(world) {
    this.world = world; this.frames = 0; this.locked = world.flags[388] === 1;
    if (this.locked) { world.flags[388] = 0; this.finalY = world.player.y; world.player.y = -20; world.player.setAlpha(.5); }
  }
  step() {
    if (!this.locked) return;
    const p = this.world.player; this.frames++; p.y += 6;
    if (this.frames >= 4 && (this.frames - 4) % 5 === 0) p.facing = ({ d: 'r', r: 'u', u: 'l', l: 'd' })[p.facing];
    p.setTexture(`spr_mainchara${p.facing}:0`).setDepth(p.y + 30);
    if (p.y >= this.finalY - 3) { p.y = this.finalY; p.setAlpha(1); this.locked = false; this.world.release(); }
  }
}
