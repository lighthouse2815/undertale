import { inInteractionRange } from './npc.mjs';
import signText from './waterfall-darkness-sign.json' with { type: 'json' };

export class WaterfallDarknessPuzzle {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.frames = 0; this.glow = 0;
    this.lanterns = world.roomObjects.filter(e => e.item.ObjectName === 'obj_darknesslantern').map(entry => ({ entry, timer: 0 }));
    this.signs = world.roomObjects.filter(e => e.item.ObjectName === 'obj_readable_room1');
    this.stones = world.roomObjects.filter(e => e.item.ObjectName === 'obj_glowstone');
    this.halo = world.add.image(0, 0, 'spr_darkhalo_big:0').setOrigin(311 / 662, 231 / 502).setDepth(-100).setAlpha(0);
    this.circles = world.add.graphics().setDepth(-99);
    for (const stone of this.stones) stone.image.setDepth(-98).setAlpha(0);
    this.draw();
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
    this.draw();
  }
  step() {
    this.frames++;
    for (const lantern of this.lanterns) {
      if (lantern.timer > 0 && --lantern.timer > 0 && this.glow > 0) this.glow -= .07;
    }
    if (this.glow < .98) this.glow += this.world.plot > 117 ? .001 : .003;
  }
  draw() {
    const p = this.world.player, alpha = Math.max(0, Math.min(1, this.glow));
    this.halo.setPosition(p.x - 10, p.y - 5).setAlpha(alpha);
    this.circles.clear();
    for (const stone of this.stones) {
      stone.image.setAlpha(alpha);
      if (this.glow > .1) {
        const glow = this.glow + Math.sin(this.frames / 10) / 6;
        this.circles.fillStyle(0xff00ff, Math.max(0, Math.min(1, glow / 3)));
        for (const radius of [15, 20, 25, 30]) this.circles.fillCircle(stone.item.X + 10, stone.item.Y + 10, Math.max(0, glow * radius));
      }
    }
  }
  interact() {
    const w = this.world, lantern = this.lanterns.find(e => inInteractionRange(w, e.entry));
    if (lantern) {
      if (lantern.timer <= 0) {
        lantern.timer = 30;
        if (!w.sound.getAllPlaying().some(s => s.key === 'snd_spearappear')) w.sound.play('snd_spearappear');
      }
      return true;
    }
    if (this.signs.some(e => inInteractionRange(w, e))) { w.showDialogue(signText); return true; }
    return false;
  }
  destroy() { this.halo.destroy(); this.circles.destroy(); }
}
