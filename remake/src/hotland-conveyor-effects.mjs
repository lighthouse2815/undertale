import { touchesObject } from './npc.mjs';

// obj_piper_bluejet và obj_magicglass_personal trong phòng băng chuyền.
export class HotlandConveyorEffects {
  constructor(world) {
    this.world = world; this.elapsed = 0; this.timer = 0; this.level = 0; this.emitting = false;
    this.jets = world.roomObjects.filter(e => e.item.ObjectName === 'obj_piper_bluejet').map(e => {
      const { X:x, Y:y } = e.item; e.image.setDepth(-8000);
      return { item: e.item, top: world.add.image(x,y,'spr_steamer_top:0').setOrigin(0).setDepth(-7999),
        jet: world.add.image(x+7,y+8,'spr_bluejet:0').setOrigin(4/9,1).setDepth(-7998).setVisible(false) };
    });
    this.glass = world.roomObjects.filter(e => e.item.ObjectName === 'obj_magicglass_personal').map(e => {
      e.image.setAlpha(0).setDepth(-700000); return { ...e, remaining: 0 };
    });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) {
      this.elapsed -= 1000 / 30; this.timer++;
      if (this.timer === 30) { this.level = 0; this.emitting = true; }
      if (this.timer > 30 && this.timer < 50) { this.level += .2; if (this.level >= 1) this.timer = 50; }
      if (this.timer >= 50 && this.timer < 70) this.level = 1 - Math.sin(this.timer * 1.5) * .1;
      if (this.timer >= 70) {
        this.level -= .2;
        if (this.level <= 0) { this.level = 0; this.emitting = false; this.timer = 0; }
      }
      for (const {item,top,jet} of this.jets) {
        top.y = item.Y + this.level * 3;
        jet.setPosition(item.X+7,item.Y+8+this.level*3).setScale(.5+this.level/2,this.level).setAlpha(this.level).setVisible(this.emitting);
      }
      for (const glass of this.glass) {
        glass.remaining--;
        if (glass.image.alpha > 0 && glass.remaining < 0) glass.image.setAlpha(Math.max(0,glass.image.alpha - .1));
        if (window.__remake.phase === 'running' && !this.world.dialogue && touchesObject(this.world,this.world.player,glass.item)) {
          glass.remaining = 3; glass.image.setAlpha(Math.min(1,glass.image.alpha + .2));
        }
      }
    }
  }
  destroy() { for (const {top,jet} of this.jets) { top.destroy(); jet.destroy(); } }
}
