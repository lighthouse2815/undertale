import { inInteractionRange } from './npc.mjs';

export class WaterfallMystery {
  constructor(world) {
    this.world = world;
    this.door = world.roomObjects.find(e => e.item.ObjectName === 'obj_greydoor');
    this.man = world.roomObjects.find(e => e.item.ObjectName === 'obj_mysteryman');
    if (this.door && Math.floor(Math.random() * 10) !== 4) { this.door.image.destroy(); this.door = null; }
    this.fading = false;
  }
  interact() {
    const w = this.world;
    if (this.door && inInteractionRange(w, this.door)) {
      this.door.image.setTexture('spr_greydoor:1');
      w.sound.stopAll(); w.townMusic?.destroy(); w.townMusic = null; w.waterfallMusic?.destroy(); w.waterfallMusic = null;
      w.sound.play('mus_dooropen'); w.transitionRoom('room_mysteryman', 'obj_markers', 14 * 1000 / 30); return true;
    }
    if (this.man && !this.fading && inInteractionRange(w, this.man)) {
      this.fading = true; this.man.image.setTexture('spr_mysteryman:1'); w.sound.play('snd_mysterygo'); return true;
    }
    return false;
  }
  update(delta) {
    if (!this.fading || !this.man) return;
    this.man.image.alpha -= .03 * delta / (1000 / 30);
    if (this.man.image.alpha <= .03) { this.man.image.destroy(); this.man = null; }
  }
}
