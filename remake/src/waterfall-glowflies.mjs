import { inInteractionRange } from './npc.mjs';

// obj_glowfly1: vận tốc, ma sát và hướng trọng lực thay đổi theo alarm.
export class WaterfallGlowflies {
  constructor(world) {
    this.world = world; this.elapsed = 0;
    this.flies = world.roomObjects.filter(e => e.item.ObjectName === 'obj_glowfly1').map(entry => {
      const angle = Math.random() * Math.PI * 2;
      const image = entry.image.setDepth(-entry.object.Depth);
      const glow = world.add.image(image.x - .5, image.y - .5, 'spr_glowfly:0')
        .setOrigin(image.originX, image.originY).setScale(1.5).setAlpha(.25).setDepth(-entry.object.Depth);
      return { entry, image, glow, vx: Math.cos(angle), vy: -Math.sin(angle), gx: 0, gy: 0,
        friction: .05, alarm: 20, frame: 0, talkCounter: 0, pending: false };
    });
  }
  update(delta) {
    this.elapsed = Math.min(200, this.elapsed + delta);
    while (this.elapsed >= 1000 / 30) { this.elapsed -= 1000 / 30; this.step(); }
  }
  step() {
    for (const fly of this.flies) {
      let speed = Math.hypot(fly.vx, fly.vy);
      if (--fly.alarm <= 0) {
        if (speed < .5) {
          speed += .1; fly.friction = -.04;
          const angle = Math.atan2(fly.entry.item.Y - 20 + Math.random() * 40 - fly.image.y, fly.entry.item.X - 20 + Math.random() * 40 - fly.image.x);
          fly.vx = Math.cos(angle) * speed; fly.vy = Math.sin(angle) * speed;
        }
        if (speed > .5) fly.friction = .04;
        const gravityAngle = Math.random() * Math.PI * 2;
        fly.gx = Math.cos(gravityAngle) * .03; fly.gy = Math.sin(gravityAngle) * .03;
        fly.alarm = 30 + Math.random() * 20;
      }
      speed = Math.hypot(fly.vx, fly.vy);
      if (speed) { const next = Math.max(0, speed - fly.friction) / speed; fly.vx *= next; fly.vy *= next; }
      fly.vx += fly.gx; fly.vy += fly.gy;
      fly.image.x += fly.vx; fly.image.y += fly.vy;
      fly.frame = (fly.frame + .5) % fly.entry.sprite.TextureCount;
      const texture = `spr_glowfly:${Math.floor(fly.frame)}`;
      fly.image.setTexture(texture); fly.glow.setTexture(texture).setPosition(fly.image.x - .5, fly.image.y - .5);
      fly.talkCounter--;
      if (fly.pending && fly.talkCounter < 0) {
        this.world.sound.play(Math.random() < .5 ? 'snd_oddtalk1' : 'snd_oddtalk2');
        fly.talkCounter = 30; fly.pending = false;
      }
    }
  }
  interact() {
    const fly = this.flies.find(f => inInteractionRange(this.world, { ...f.entry,
      item: { ...f.entry.item, X: f.image.x - f.entry.sprite.OriginX, Y: f.image.y - f.entry.sprite.OriginY } }));
    if (!fly) return false;
    fly.pending = true; return true;
  }
  destroy() { for (const fly of this.flies) fly.glow.destroy(); }
}
